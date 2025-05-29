<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Adjustment;
use App\Models\AdjustmentItem;
use App\Models\Stock;
use App\Models\StockMove;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class AdjustmentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $adjustments = Adjustment::with(['items.product','items.stock', 'adjuster'])->get();
        return response()->json([
            'success' => true,
            'adjustments' => $adjustments
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
public function store(Request $request)
{
    $validator = Validator::make($request->all(), [
        'date' => 'required|date',
        'reference' => 'nullable|string|max:255',
        'adjuster' => 'required|integer|exists:users,id',
        'warehouse_id' => 'nullable|exists:warehouses,id',
        'note' => 'nullable|string',
        'items' => 'required|array',
        'items.*.product_id' => 'required|exists:products,id',
        'items.*.quantity' => 'required|numeric',
        'items.*.adjustment_type' => 'required|in:add,subtract',
        'items.*.unit' => 'nullable|string|max:50' 
    ]);

    if ($validator->fails()) {
        return response()->json(['errors' => $validator->errors()], 422);
    }

    DB::beginTransaction();
    try {
        $status = 'complete';
        if ($request->warehouse_id) {
            $status = 'pending';
        }
        $adjustment = Adjustment::create([
            'date' => $request->date,
            'reference' => $request->reference,
            'warehouse_id' => $request->warehouse_id,
            'adjuster' => $request->adjuster,
            'note' => $request->note,
            'status' => $status,
        ]);

        foreach ($request->items as $item) {
            $adjustmentItem = AdjustmentItem::create([
                'adjustment_id' => $adjustment->id,
                'product_id' => $item['product_id'],
                'qty' => $item['quantity'],
                'operation' => $item['adjustment_type'],
                'unit' => $item['unit'] ?? null 
            ]);

            if ($adjustmentItem) {
                // Lock the stock record to prevent race conditions
                $stock = Stock::lockForUpdate()->firstOrNew([
                    'product_id' => $item['product_id'],
                    'warehouse_id' => $request->warehouse_id,
                ]);

                $stock->adjust_id = $adjustment->id;
                $stock->quantity = $item['adjustment_type'] === 'add'
                    ? ($stock->quantity ?? 0) + $item['quantity']
                    : max(($stock->quantity ?? 0) - $item['quantity'], 0);

                $stock->save();

                StockMove::create([
                    'product_id' => $item['product_id'],
                    'warehouse_id' => $request->warehouse_id ?? null,
                    'quantity' => $item['adjustment_type'] === 'add' 
                        ? $item['quantity'] 
                        : -$item['quantity'],
                    'date' => $request->date,
                    'base_unit' => $item['unit'] ?? null,
                    'adjust_id' => $adjustment->id
                ]);
            }
        }

        DB::commit();
        return response()->json([
            'success' => true,
            'adjustment' => $adjustment->load('items')
        ], 201);

    } catch (\Exception $e) {
        DB::rollBack();
        return response()->json([
            'success' => false,
            'message' => 'Adjustment failed',
            'error' => $e->getMessage()
        ], 500);
    }
}
    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $adjustment = Adjustment::with([
            'items.product.productUnit' => function($query) {
                $query->select('id', 'name', 'qty', 'unit_id', 'code as unit_code');
            },
            'items.stock' => function($query) {
                $query->select('id', 'product_id', 'quantity as current_stock');
            },
            'adjuster' => function($query) {
                $query->select('id', 'username');
            }
        ])->find($id);

        $adjuster = User::getUserById($adjustment->adjuster);
        $adjustment->adjuster = $adjuster;
        if (!$adjustment) {
            return response()->json([
                'success' => false,
                'message' => 'Adjustment not found'
            ], 404);
        }
    
        $adjustment->items->transform(function ($item) {
            return [
                'id' => $item->id,
                'product_id' => $item->product_id,
                'product_name' => $item->product->name ?? null,
                'product_qty' => $item->qty ?? null,
                'product_unit' => $item->product->productUnit->unit_code ?? null,
                'adjustment_quantity' => $item->qty,
                'adjustment_type' => $item->operation,
                'current_stock' => $item->stock->current_stock ?? 0, 
                'date' => $item->created_at->format('Y-m-d H:i:s')
            ];
        });
    
        return response()->json([
            'success' => true,
            'adjustment' => [
                'id' => $adjustment->id,
                'reference' => $adjustment->reference,
                'date' => $adjustment->date,
                'note' => $adjustment->note,
                'items' => $adjustment->items,
                'adjuster' => $adjustment->adjuster
            ]
        ]);
    }
    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $validator = Validator::make($request->all(), [
            // ... keep your existing validation rules ...
        ]);
    
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
    
        $adjustment = Adjustment::with('items')->findOrFail($id);
    
        DB::beginTransaction();
        try {
            // Update adjustment details
            $adjustment->update([
                'date' => $request->date ?? $adjustment->date,
                'reference' => $request->reference ?? $adjustment->reference,
                'warehouse_id' => $request->warehouse_id ?? $adjustment->warehouse_id,
                'adjuster' => $request->adjuster ?? $adjustment->adjuster,
                'note' => $request->note ?? $adjustment->note,
            ]);
    
            // Process items if provided
            if ($request->has('items')) {
                $existingItems = $adjustment->items->keyBy('id');
                $processedItemIds = [];
    
                foreach ($request->items as $item) {
                    // Check if this is an existing item (has ID and exists in DB)
                    if (!empty($item['id']) && $existingItem = $existingItems->get($item['id'])) {
                        // Track processed items
                        $processedItemIds[] = $item['id'];
    
                        // Calculate stock difference
                        $oldQty = $existingItem->qty;
                        $oldType = $existingItem->operation;
                        $newQty = $item['quantity'];
                        $newType = $item['adjustment_type'];
    
                        // Reverse old stock impact
                        $this->adjustStock(
                            $existingItem->product_id,
                            $adjustment->warehouse_id,
                            $oldType === 'add' ? -$oldQty : $oldQty
                        );
    
                        // Update the item
                        $existingItem->update([
                            'product_id' => $item['product_id'],
                            'qty' => $newQty,
                            'operation' => $newType,
                            'unit' => $item['unit'] ?? null
                        ]);
    
                        // Apply new stock impact
                        $this->adjustStock(
                            $item['product_id'],
                            $adjustment->warehouse_id,
                            $newType === 'add' ? $newQty : -$newQty
                        );
    
                        // Update stock move
                        StockMove::updateOrCreate(
                            [
                                'adjust_id' => $adjustment->id,
                                'product_id' => $item['product_id']
                            ],
                            [
                                'quantity' => $newType === 'add' ? $newQty : -$newQty,
                                'date' => $adjustment->date,
                                'base_unit' => $item['unit'] ?? null
                            ]
                        );
                    } else {
                        // Create new item
                        $adjustmentItem = $adjustment->items()->create([
                            'product_id' => $item['product_id'],
                            'qty' => $item['quantity'],
                            'operation' => $item['adjustment_type'],
                            'unit' => $item['unit'] ?? null
                        ]);
    
                        // Adjust stock
                        $this->adjustStock(
                            $item['product_id'],
                            $adjustment->warehouse_id,
                            $item['adjustment_type'] === 'add' ? $item['quantity'] : -$item['quantity']
                        );
    
                        // Create stock move
                        StockMove::create([
                            'product_id' => $item['product_id'],
                            'warehouse_id' => $adjustment->warehouse_id,
                            'quantity' => $item['adjustment_type'] === 'add' ? $item['quantity'] : -$item['quantity'],
                            'adjust_id' => $adjustment->id,
                            'date' => $adjustment->date,
                            'base_unit' => $item['unit'] ?? null
                        ]);
                    }
                }
    
                // Delete items that weren't in the request
                $itemsToDelete = $adjustment->items()
                    ->whereNotIn('id', $processedItemIds)
                    ->get();
    
                foreach ($itemsToDelete as $item) {
                    // Reverse stock impact
                    $this->adjustStock(
                        $item->product_id,
                        $adjustment->warehouse_id,
                        $item->operation === 'add' ? -$item->qty : $item->qty
                    );
    
                    // Delete stock move
                    StockMove::where('adjust_id', $adjustment->id)
                        ->where('product_id', $item->product_id)
                        ->delete();
    
                    $item->delete();
                }
            }
    
            DB::commit();
            return response()->json([
                'success' => true,
                'adjustment' => $adjustment->fresh()->load('items')
            ], 200);
    
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Adjustment update failed',
                'error' => $e->getMessage(),
                'trace' => config('app.debug') ? $e->getTraceAsString() : null
            ], 500);
        }
    }
    
    protected function adjustStock($productId, $warehouseId, $quantity)
    {
        Stock::updateOrCreate(
            [
                'product_id' => $productId,
                'warehouse_id' => $warehouseId
            ],
            ['quantity' => DB::raw("COALESCE(quantity, 0) + $quantity")]
        );
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $adjustment = Adjustment::with('items')->find($id);
    
        if (!$adjustment) {
            return response()->json([
                'success' => false,
                'message' => 'Adjustment not found'
            ], 404);
        }
    
        try {
            DB::beginTransaction();
    
            foreach ($adjustment->items as $item) {
                $stock = Stock::where([
                    'product_id' => $item->product_id,
                    'warehouse_id' => $adjustment->warehouse_id
                ])->first();
    
                if ($stock) {
                    if ($item->operation === 'add') {
                        $stock->quantity = max($stock->quantity - $item->qty, 0);
                    } else {
                        $stock->quantity += $item->qty;
                    }
                    $stock->save();
                }
    
                StockMove::where([
                    'adjust_id' => $adjustment->id,
                    'product_id' => $item->product_id
                ])->delete();
            }
            $adjustment->items()->delete();
            $adjustment->delete();
            DB::commit();
            return response()->json([
                'success' => true,
                'message' => 'Adjustment deleted successfully',
                'adjustment' => $adjustment
            ]);
    
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete adjustment',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}