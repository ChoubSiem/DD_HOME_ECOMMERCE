<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Stock;
use App\Models\StockMove;
use App\Models\Unit;
use App\Models\UomTransfer;
use App\Models\UomTransferItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class UomTransferController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $warehouse_id = $request->query('warehouse_id');
        
        if ($warehouse_id != null) {
            $transfers = UomTransfer::with(["transfer_user",'transfer_user','items.sourceProduct','items.destinationProduct', 'items.sourceUnit','items.destinationUnit'])->get();
        }else{
            $transfers = UomTransfer::with("transfer_user")->where('warehouse_id', $warehouse_id)->get();

        }
        
        return response()->json([
            'message' => "Data get successfully!",
            'data' => $transfers
        ]);
    }
    
    
    

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'date' => 'required|date',
            'transfer_user' => 'required|integer|exists:users,id',
            'warehouse_id' => 'nullable|integer|exists:warehouses,id',
            'items' => 'required|array|min:1',
            'items.*.source_product_id' => [
                'required',
                'integer',
                'exists:products,id',
                function ($attribute, $value, $fail) use ($request) {
                    $index = explode('.', $attribute)[1];
                    $qty = $request->items[$index]['source_qty'];
                    $warehouse = $request->warehouse_id;
                    
                    $stock = Stock::where('product_id', $value)
                        ->where('warehouse_id', $warehouse)
                        ->first();
                        
                    if (!$stock) {
                        $fail("Product $value not available in selected warehouse");
                    } elseif ($stock->quantity < $qty) {
                        $fail("Insufficient stock for product $value (Available: {$stock->quantity}, Requested: $qty)");
                    }
                }
            ],
            'items.*.destination_product_id' => 'required|integer|exists:products,id',
            'items.*.source_qty' => 'required|numeric|min:0.01',
            'items.*.destination_qty' => 'required|numeric|min:0.01',
            'items.*.source_unit' => 'required|string',
            'items.*.destination_unit' => 'required|string'
        ]);
    
        DB::beginTransaction();
    
        try {
            $uomTransfer = UomTransfer::create([
                'date' => $validated['date'],
                'transfer_user' => $validated['transfer_user'],
                'warehouse_id' => $validated['warehouse_id'] ?? null,
            ]);
    
            foreach ($validated['items'] as $item) {
                // Lock stock records for update to prevent race conditions
                $sourceStock = Stock::where([
                        'product_id' => $item['source_product_id'],
                        'warehouse_id' => $validated['warehouse_id']
                    ])
                    ->lockForUpdate()
                    ->firstOrFail();
    
                // Verify stock again after lock
                if ($sourceStock->quantity < $item['source_qty']) {
                    throw new \Exception("Insufficient stock for product {$item['source_product_id']} after lock");
                }
    
                // Create transfer item
                $transferItem = UomTransferItem::create([
                    'uom_transfer_id' => $uomTransfer->id,
                    'source_product_id' => $item['source_product_id'],
                    'destination_product_id' => $item['destination_product_id'],
                    'source_qty' => $item['source_qty'],
                    'destination_qty' => $item['destination_qty'],
                    'source_unit_id' => Unit::getUnitIdByName($item['source_unit']),
                    'destination_unit_id' => Unit::getUnitIdByName($item['destination_unit']),
                    'source_after' => $item['source_qty'] * $item['destination_qty'],
                ]);
    
                // Update source stock (deduct)
                $sourceStock->decrement('quantity', $item['source_qty']);
    
                // Update destination stock (add)
                Stock::updateOrCreate(
                    [
                        'product_id' => $item['destination_product_id'],
                        'warehouse_id' => $validated['warehouse_id']
                    ],
                    [
                        'quantity' => DB::raw('COALESCE(quantity, 0) + ' . (float)$item['destination_qty']),
                        'uom_id' => $transferItem->id
                    ]
                );
    
                // Record stock moves
                StockMove::create([
                    'product_id' => $item['source_product_id'],
                    'warehouse_id' => $validated['warehouse_id'],
                    'quantity' => -$item['source_qty'],
                    'reference_type' => 'uom_transfer',
                    'reference_id' => $uomTransfer->id,
                    'date' => $validated['date'],
                    'base_unit' => $item['source_unit']
                ]);
    
                StockMove::create([
                    'product_id' => $item['destination_product_id'],
                    'warehouse_id' => $validated['warehouse_id'],
                    'quantity' => $item['destination_qty'],
                    'reference_type' => 'uom_transfer',
                    'reference_id' => $uomTransfer->id,
                    'date' => $validated['date'],
                    'base_unit' => $item['destination_unit']
                ]);
            }
    
            DB::commit();
    
            return response()->json([
                'message' => 'UOM transfer created successfully',
                'data' => $uomTransfer->load('items'),
            ], 201);
    
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('UOM Transfer Error: ' . $e->getMessage());
            
            return response()->json([
                'error' => 'Transfer failed',
                'message' => $e->getMessage(),
                'debug' => config('app.debug') ? [
                    'file' => $e->getFile(),
                    'line' => $e->getLine(),
                    'trace' => $e->getTraceAsString()
                ] : null
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function edit($id)
    {
        $uomTransfer = UomTransfer::with([
            'items.sourceProduct:id,name',
            'items.destinationProduct:id,name',
            'items.sourceUnit:id,name',
            'items.destinationUnit:id,name',
            'warehouse:id,name',
            'transfer_user:id,username'
        ])->findOrFail($id);
    
        if (!$uomTransfer) {
            return response()->json(['error' => 'UOM Transfer not found'], 404);
        }
    
        return response()->json([
            'message' => 'UOM transfer retrieved successfully',
            'data' => $uomTransfer
        ], 200);
    }
    

    /**
     * Show the form for editing the specified resource.
     */

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $request->validate([
            'date' => 'required|date',
            'transfer_user_id' => 'required|integer|exists:users,id',
            'warehouse_id' => 'nullable|integer|exists:warehouses,id',
            'items' => 'required|array|min:1',
            'items.*.source_product_id' => 'required|integer|exists:products,id',
            'items.*.destination_product_id' => 'required|integer|exists:products,id',
            'items.*.source_qty' => 'required|numeric|min:0.01',
            'items.*.destination_qty' => 'required|numeric|min:0.01',
            'items.*.source_unit_id' => 'required|integer|exists:units,id',
            'items.*.destination_unit_id' => 'required|integer|exists:units,id',
        ]);
    
        DB::beginTransaction();
    
        try {
            $uomTransfer = UomTransfer::with('items')->findOrFail($id);
            $warehouseId = $request->warehouse_id ?? $uomTransfer->warehouse_id;
    
            // 1. Revert original stock changes
            foreach ($uomTransfer->items as $item) {
                // Revert source product stock
                Stock::where('product_id', $item->source_product_id)
                    ->where('warehouse_id', $warehouseId)
                    ->increment('quantity', $item->source_qty);
    
                // Revert destination product stock
                Stock::where('product_id', $item->destination_product_id)
                    ->where('warehouse_id', $warehouseId)
                    ->decrement('quantity', $item->destination_qty);
            }
    
            // 2. Delete old items and stock moves
            $uomTransfer->items()->delete();
            StockMove::where('uom_id', $uomTransfer->id)
                ->delete();
    
            // 3. Update main transfer record
            $uomTransfer->update([
                'date' => $request->date,
                'transfer_user' => $request->transfer_user_id,
                'warehouse_id' => $warehouseId,
            ]);
    
            // 4. Process new items
            foreach ($request->items as $item) {
                // Create transfer item
                $transferItem = UomTransferItem::create([
                    'uom_transfer_id' => $uomTransfer->id,
                    'source_product_id' => $item['source_product_id'],
                    'destination_product_id' => $item['destination_product_id'],
                    'source_qty' => $item['source_qty'],
                    'destination_qty' => $item['destination_qty'],
                    'source_unit_id' => $item['source_unit_id'],
                    'destination_unit_id' => $item['destination_unit_id'],
                    'source_unit' => $item['source_unit'],
                    'destination_unit' => $item['destination_unit'],
                    'source_after' => $item['source_qty'] * $item['destination_qty'],
                ]);
    
                // Update source product stock
                $sourceStock = Stock::firstOrCreate(
                    [
                        'product_id' => $item['source_product_id'],
                        'warehouse_id' => $warehouseId
                    ],
                    ['quantity' => 0]
                );
                $sourceStock->decrement('quantity', $item['source_qty']);
    
                // Update destination product stock
                $destinationStock = Stock::firstOrCreate(
                    [
                        'product_id' => $item['destination_product_id'],
                        'warehouse_id' => $warehouseId
                    ],
                    ['quantity' => 0]
                );
                $destinationStock->increment('quantity', $item['destination_qty']);
    
                // Record stock moves
                StockMove::create([
                    'product_id' => $item['source_product_id'],
                    'warehouse_id' => $warehouseId,
                    'quantity' => -$item['source_qty'],
                    'reference_type' => 'uom_transfer',
                    'date' => $request->date,
                    'reference_id' => $uomTransfer->id,
                    'base_unit' => $item['source_unit_id'],
                    'uom_transfer_item_id' => $transferItem->id,
                    'created_at' => now(),
                    'updated_at' => now()

                ]);
    
                StockMove::create([
                    'product_id' => $item['destination_product_id'],
                    'warehouse_id' => $warehouseId,
                    'quantity' => $item['destination_qty'],
                    'reference_type' => 'uom_transfer',
                    'date' => $request->date,
                    'reference_id' => $uomTransfer->id,
                    'base_unit' => $item['destination_unit_id'],
                    'uom_transfer_item_id' => $transferItem->id,
                    'created_at' => now(),
                    'updated_at' => now()
                ]);
            }
    
            DB::commit();
    
            return response()->json([
                'success' => true,
                'message' => 'UOM transfer updated successfully',
                'data' => $uomTransfer->load(['items', 'transfer_user', 'warehouse']),
            ]);
    
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('UOM Transfer Update Error: ' . $e->getMessage() . "\n" . $e->getTraceAsString());
            return response()->json([
                'success' => false,
                'message' => 'Failed to update UOM transfer',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        DB::beginTransaction();
    
        try {
            $uomTransfer = UomTransfer::with('items')->findOrFail($id);
            $warehouseId = $uomTransfer->warehouse_id;
    
            foreach ($uomTransfer->items as $item) {
                Stock::where('product_id', $item->source_product_id)
                    ->where('warehouse_id', $warehouseId)
                    ->increment('quantity', $item->source_qty);
    
                Stock::where('product_id', $item->destination_product_id)
                    ->where('warehouse_id', $warehouseId)
                    ->decrement('quantity', $item->destination_qty);
            }
    
            StockMove::where('reference_type', 'uom_transfer')
                ->where('reference_id', $uomTransfer->id)
                ->delete();
    
            $uomTransfer->items()->delete();
            $uomTransfer->delete();
    
            DB::commit();
    
            return response()->json([
                'success' => true,
                'message' => 'UOM transfer deleted successfully'
            ]);
    
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('UOM Transfer Deletion Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete UOM transfer',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
