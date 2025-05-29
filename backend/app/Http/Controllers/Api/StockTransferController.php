<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Stock;
use App\Models\StockMove;
use App\Models\StockTransfer;
use App\Models\StockTransferItem;
use App\Models\Unit;
use App\Models\WarehouseProduct;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Socket;

class StockTransferController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $stockTransfers = StockTransfer::with(['items.product', 'tranferUser','fromWarehouse','toWarehouse'])->get();
        return response()->json([
            'success' => true,
            'list' => $stockTransfers
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
             'reference_no' => 'nullable|string',
             'transfer_user' => 'required|integer|exists:users,id',
             'to_warehouse_id' => 'nullable|integer|exists:warehouses,id',
             'from_warehouse_id' => 'nullable|integer|exists:warehouses,id',
             'items' => 'required|array|min:1',
             'items.*.product_id' => 'required|integer',
             'items.*.unit' => 'required|string',
             'items.*.quantity' => 'required|integer',
         ]);
         
         if (empty($validated['from_warehouse_id']) && empty($validated['to_warehouse_id'])) {
             return response()->json([
                 'message' => 'At least one of source or destination warehouse must be specified.'
             ], 422);
         }
         if (empty($validated['reference_no'])) {
            $latest = StockTransfer::latest('id')->first();
            $nextId = $latest ? $latest->id + 1 : 1;
            $validated['reference_no'] = 'ST-' . str_pad($nextId, 8, '0', STR_PAD_LEFT);
        }
     
         if (!empty($validated['items'])) {
             foreach ($validated['items'] as $item) {
                 if (!empty($validated['to_warehouse_id'])) {
                     $checkTo = WarehouseProduct::checkProductById($item['product_id'], $validated['to_warehouse_id']);
                     if (!$checkTo) {
                         return response()->json([
                             'message' => "Product ID {$item['product_id']} does not exist in destination warehouse ID {$validated['to_warehouse_id']}."
                         ], 422);
                     }
                 }
     
                 if (!empty($validated['from_warehouse_id'])) {
                     $checkFrom = WarehouseProduct::checkProductById($item['product_id'], $validated['from_warehouse_id']);
                     if (!$checkFrom) {
                         return response()->json([
                             'message' => "Product ID {$item['product_id']} does not exist in source warehouse ID {$validated['from_warehouse_id']}."
                         ], 422);
                     }
                 }
             }
         }
     
         $canSubtractStock = true;
     
         DB::beginTransaction();
     
         try {
             $stockTransfer = StockTransfer::create([
                 'date' => $validated['date'],
                 'transfer_user' => $validated['transfer_user'],
                 'from_warehouse_id' => $validated['from_warehouse_id'],
                 'to_warehouse_id' => $validated['to_warehouse_id'],
                 'reference_no' => $validated['reference_no'],
                 'note' => $request->note,
             ]);
     
             foreach ($validated['items'] as $item) {
                 $productId = $item['product_id'];
                 $qty = $item['quantity'];
                 $unit = $item['unit'];
     
                 if ($validated['from_warehouse_id'] && $validated['to_warehouse_id']) {
                     $sourceStock = Stock::where([
                         'product_id' => $productId,
                         'warehouse_id' => $validated['from_warehouse_id'],
                     ])->lockForUpdate()->firstOrFail();
     
                     if ($sourceStock->quantity < $qty) {
                         throw new \Exception("Insufficient stock for product ID $productId in source warehouse.");
                     }
     
                     $sourceStock->decrement('quantity', $qty);
     
                     if ($canSubtractStock) {
                         Stock::updateOrCreate(
                             [
                                 'product_id' => $productId,
                                 'warehouse_id' => $validated['to_warehouse_id'],
                             ],
                             [
                                 'quantity' => DB::raw('COALESCE(quantity, 0) + ' . (float)$qty),
                             ]
                         );
                     }
     
                     StockMove::create([
                         'product_id' => $productId,
                         'warehouse_id' => $validated['from_warehouse_id'],
                         'quantity' => -$qty,
                         'stock_id' => $stockTransfer->id,
                         'date' => $validated['date'],
                         'base_unit' => $unit,
                     ]);
     
                     if ($canSubtractStock) {
                         StockMove::create([
                             'product_id' => $productId,
                             'warehouse_id' => $validated['to_warehouse_id'],
                             'quantity' => $qty,
                             'reference_type' => 'stock_transfer',
                             'stock_id' => $stockTransfer->id,
                             'date' => $validated['date'],
                             'base_unit' => $unit,
                         ]);
                     }
     
                 } elseif (!$validated['from_warehouse_id'] && $validated['to_warehouse_id']) {
                        $companyStock = Stock::where('product_id', $productId)
                            ->whereNull('warehouse_id')
                            ->lockForUpdate()
                            ->firstOrFail();
                     if ($companyStock->quantity < $qty) {
                         throw new \Exception("Insufficient stock for product ID $productId in company inventory.");
                     }
                     $companyStock->decrement('quantity', $qty);
     
                     if ($canSubtractStock) {
                         Stock::updateOrCreate(
                             [
                                 'product_id' => $productId,
                                 'warehouse_id' => $validated['to_warehouse_id'],
                             ],
                             [
                                 'quantity' => DB::raw('COALESCE(quantity, 0) + ' . (float)$qty),
                             ]
                         );
     
                         StockMove::create([
                             'product_id' => $productId,
                             'warehouse_id' => $validated['to_warehouse_id'],
                             'quantity' => $qty,
                             'reference_type' => 'stock_transfer',
                             'stock_id' => $stockTransfer->id,
                             'date' => $validated['date'],
                             'base_unit' => $unit,
                         ]);
     
                         // Log company stock movement
                         StockMove::create([
                             'product_id' => $productId,
                             'warehouse_id' => null, // Indicates company
                             'quantity' => -$qty,
                             'reference_type' => 'stock_transfer',
                             'stock_id' => $stockTransfer->id,
                             'date' => $validated['date'],
                             'base_unit' => $unit,
                         ]);
                     }
     
                 // Case 3: From warehouse to company
                 } elseif ($validated['from_warehouse_id'] && !$validated['to_warehouse_id']) {
                     $sourceStock = Stock::where([
                         'product_id' => $productId,
                         'warehouse_id' => $validated['from_warehouse_id'],
                     ])->lockForUpdate()->firstOrFail();
     
                     if ($sourceStock->quantity < $qty) {
                         throw new \Exception("Insufficient stock for product ID $productId in source warehouse.");
                     }
     
                     $sourceStock->decrement('quantity', $qty);
     
                     StockMove::create([
                         'product_id' => $productId,
                         'warehouse_id' => $validated['from_warehouse_id'],
                         'quantity' => -$qty,
                         'stock_id' => $stockTransfer->id,
                         'date' => $validated['date'],
                         'base_unit' => $unit,
                     ]);
     
                     // Add to company stock
                     Stock::updateOrCreate(
                         [
                             'product_id' => $productId,
                             'warehouse_id' => null,
                         ],
                         [
                             'quantity' => DB::raw('COALESCE(quantity, 0) + ' . (float)$qty),
                         ]
                     );
     
                     // Log company stock movement
                     StockMove::create([
                         'product_id' => $productId,
                         'warehouse_id' => null, // Indicates company
                         'quantity' => $qty,
                         'reference_type' => 'stock_transfer',
                         'stock_id' => $stockTransfer->id,
                         'date' => $validated['date'],
                         'base_unit' => $unit,
                     ]);
                 }
     
                 // Create transfer item
                 StockTransferItem::create([
                     'stock_transfer_id' => $stockTransfer->id,
                     'product_id' => $productId,
                     'quantity' => $qty,
                 ]);
             }
     
             DB::commit();
     
             return response()->json([
                 'message' => 'UOM transfer created successfully',
                 'data' => $stockTransfer->load('items'),
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
                     'trace' => $e->getTraceAsString(),
                 ] : null,
             ], 500);
         }
     }
    
    

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $validated = $request->validate([
            'date' => 'sometimes|date',
            'reference_no' => 'nullable|string',
            'transfer_user' => 'sometimes|integer|exists:users,id',
            'to_warehouse_id' => 'nullable|integer|exists:warehouses,id',
            'from_warehouse_id' => 'nullable|integer|exists:warehouses,id',
            'items' => 'sometimes|array|min:1',
            'items.*.product_id' => [
                'required_with:items',
                'integer',
                'exists:products,id',
                function ($attribute, $value, $fail) use ($request) {
                    $index = explode('.', $attribute)[1];
                    $quantity = $request->items[$index]['quantity'] ?? 0;
                    $warehouse = $request->from_warehouse_id;
    
                    $stock = Stock::where('product_id', $value)
                        ->where('warehouse_id', $warehouse)
                        ->first();
    
                    if (!$stock) {
                        $fail("Product ID $value is not available in warehouse ID $warehouse.");
                    } elseif ($stock->quantity < $quantity) {
                        $fail("Insufficient stock for product ID $value in warehouse ID $warehouse (Available: {$stock->quantity}, Requested: $quantity)");
                    }
                },
            ],
            'items.*.unit' => 'required_with:items|string',
            'items.*.quantity' => 'required_with:items|integer',
            'items.*.id' => 'sometimes|exists:stock_transfer_items,id', // For existing items
        ]);
    
        DB::beginTransaction();
    
        try {
            $stockTransfer = StockTransfer::with('items')->findOrFail($id);
    
            // First reverse all previous stock impacts
            foreach ($stockTransfer->items as $item) {
                // Restore source warehouse stock
                Stock::where([
                    'product_id' => $item->product_id,
                    'warehouse_id' => $stockTransfer->from_warehouse_id,
                ])->increment('quantity', $item->quantity);
    
                // Deduct from destination warehouse stock
                Stock::where([
                    'product_id' => $item->product_id,
                    'warehouse_id' => $stockTransfer->to_warehouse_id,
                ])->decrement('quantity', $item->quantity);
    
                // Delete stock moves
                StockMove::where('stock_id', $stockTransfer->id)
                    ->where('product_id', $item->product_id)
                    ->delete();
            }
    
            // Update transfer details
            $stockTransfer->update([
                'date' => $validated['date'] ?? $stockTransfer->date,
                'transfer_user' => $validated['transfer_user'] ?? $stockTransfer->transfer_user,
                'from_warehouse_id' => $validated['from_warehouse_id'] ?? $stockTransfer->from_warehouse_id,
                'to_warehouse_id' => $validated['to_warehouse_id'] ?? $stockTransfer->to_warehouse_id,
                'reference_no' => $validated['reference_no'] ?? $stockTransfer->reference_no,
                'note' => $request->note ?? $stockTransfer->note,
            ]);
    
            // Process items if provided
            if ($request->has('items')) {
                $existingItems = $stockTransfer->items->keyBy('id');
                $processedItemIds = [];
    
                foreach ($validated['items'] as $item) {
                    if (isset($item['id']) && $existingItems->has($item['id'])) {
                        // Update existing item
                        $existingItem = $existingItems[$item['id']];
                        $existingItem->update([
                            'product_id' => $item['product_id'],
                            'quantity' => $item['quantity'],
                        ]);
    
                        $processedItemIds[] = $item['id'];
                    } else {
                        // Create new item
                        $transferItem = StockTransferItem::create([
                            'stock_transfer_id' => $stockTransfer->id,
                            'product_id' => $item['product_id'],
                            'quantity' => $item['quantity'],
                        ]);
    
                        $processedItemIds[] = $transferItem->id;
                    }
    
                    // Lock source stock row for update
                    $sourceStock = Stock::where([
                        'product_id' => $item['product_id'],
                        'warehouse_id' => $stockTransfer->from_warehouse_id,
                    ])->lockForUpdate()->firstOrFail();
    
                    if ($sourceStock->quantity < $item['quantity']) {
                        throw new \Exception("Insufficient stock for product ID {$item['product_id']} after locking.");
                    }
    
                    // Deduct from source warehouse
                    $sourceStock->decrement('quantity', $item['quantity']);
    
                    // Add to destination warehouse
                    Stock::updateOrCreate(
                        [
                            'product_id' => $item['product_id'],
                            'warehouse_id' => $stockTransfer->to_warehouse_id,
                        ],
                        [
                            'quantity' => DB::raw('COALESCE(quantity, 0) + ' . (float)$item['quantity']),
                        ]
                    );
    
                    // Create stock move: source
                    StockMove::create([
                        'product_id' => $item['product_id'],
                        'warehouse_id' => $stockTransfer->from_warehouse_id,
                        'quantity' => -$item['quantity'],
                        'reference_type' => 'stock_transfer',
                        'stock_id' => $stockTransfer->id,
                        'date' => $stockTransfer->date,
                        'base_unit' => $item['unit'],
                    ]);
    
                    // Create stock move: destination
                    StockMove::create([
                        'product_id' => $item['product_id'],
                        'warehouse_id' => $stockTransfer->to_warehouse_id,
                        'quantity' => $item['quantity'],
                        'reference_type' => 'stock_transfer',
                        'stock_id' => $stockTransfer->id,
                        'date' => $stockTransfer->date,
                        'base_unit' => $item['unit'],
                    ]);
                }
    
                // Delete items not included in the request
                $itemsToDelete = $stockTransfer->items()
                    ->whereNotIn('id', $processedItemIds)
                    ->get();
    
                foreach ($itemsToDelete as $item) {
                    $item->delete();
                }
            }
    
            DB::commit();
    
            return response()->json([
                'message' => 'Stock transfer updated successfully',
                'data' => $stockTransfer->fresh()->load('items'),
            ], 200);
    
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Stock Transfer Update Error: ' . $e->getMessage());
    
            return response()->json([
                'error' => 'Transfer update failed',
                'message' => $e->getMessage(),
                'debug' => config('app.debug') ? [
                    'file' => $e->getFile(),
                    'line' => $e->getLine(),
                    'trace' => $e->getTraceAsString(),
                ] : null,
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
