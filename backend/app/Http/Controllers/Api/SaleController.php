<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Sale;
use App\Models\PosSale;
use App\Models\PosSaleItem;
use App\Models\ProductUnit;
use App\Models\SaleItem;
use App\Models\SalePayment;
use App\Models\Stock;
use App\Models\StockMove;
use App\Models\Unit;
use App\Models\Warehouse;
use App\Models\WarehouseProduct;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class SaleController extends Controller
{
    public function getPosSales(Request $request)
    {
        $warehouseId = $request->query('warehouse_id');
        // dd($warehouseId);
        try {
            $sales = PosSale::with(['customer', 'items.product','posPayments'])
                ->when($warehouseId, fn($q, $id) => $q->where('warehouse_id', $id))
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($sale) {
                    return [
                        'id' => $sale->id,
                        'customerName' => $sale->customer->username ?? 'Walk-in',
                        'items' => $sale->items->map(function ($item) {
                            return [
                                'productName' => $item->product->name ?? 'Unknown Product',
                                'quantity' => $item->qty,
                                'price' => $item->price,
                                'discount' => $item->discount,
                                'total' => $item->total
                            ];
                        }),
                        'totalPrice' => $sale->total,
                        'discount' => $sale->discount,
                        'subTotal' => $sale->total - $sale->discount,
                        'saleDate' => $sale->created_at->toDateTimeString(),
                        'payment' => $sale->payments,
                        'status' => $sale->status,
                        'reference' => $sale->reference,
                        'paid' => $sale->posPayments->sum('paid'),
                    ];
                });
    
            return response()->json(['success' => true, 'list' => $sales]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

public function getSalesInventory(Request $request)
{
    try {
        $warehouseId = $request->query('warehouse_id');
        $type = $request->query('type');
        $payment_type = 'inventory';

        // Build WHERE condition dynamically depending on warehouse_id presence
        if ($warehouseId) {
            $whereCondition = "s.warehouse_id = ?";
            $params = [$warehouseId, $payment_type];
        } else {
            $whereCondition = "s.is_warehouse IS NOT NULL";
            $params = [$payment_type];
        }

        $rows = DB::select("
            SELECT 
                s.id AS sale_id,
                s.warehouse_id,
                s.customer_id,
                s.is_warehouse,
                s.total,
                s.discount,
                COALESCE(SUM(si.discount), 0) + COALESCE(s.discount, 0) AS total_discount,
                s.payment_status,
                s.reference,
                s.created_at,
                s.discount_type,
                s.subtotal,

                w.name AS warehouse_name,
                c.username AS customer_name,

                sp.paid AS payment_paid,
                si.product_id,
                pr.name AS product_name,
                si.qty,
                si.price,
                si.cost,
                si.discount AS item_discount,
                si.total AS item_total,
                u.name AS unit_name

            FROM sales s
            LEFT JOIN warehouses w ON s.warehouse_id = w.id
            LEFT JOIN users c ON s.customer_id = c.id
            LEFT JOIN sale_payments sp ON sp.sale_id = s.id
            LEFT JOIN sale_items si ON si.sale_id = s.id
            LEFT JOIN products pr ON si.product_id = pr.id
            LEFT JOIN product_units pu ON pu.product_id = pr.id
            LEFT JOIN units u ON u.id = pu.unit_id

            WHERE {$whereCondition} AND sp.type = ?
            GROUP BY 
                    s.id, 
                    s.warehouse_id,
                    s.customer_id,
                    s.is_warehouse,
                    s.total,
                    s.discount,
                    s.payment_status,
                    s.reference,
                    s.created_at,
                    s.discount_type,
                    s.subtotal,
                    w.name,
                    c.username,
                    sp.paid,
                    si.product_id,
                    pr.name,
                    si.qty,
                    si.price,
                    si.cost,
                    si.discount,
                    si.total,
                    u.name

            ORDER BY s.created_at DESC 
        ", $params);

        $sales = [];
        foreach ($rows as $row) {
            $saleId = $row->sale_id;

            if (!isset($sales[$saleId])) {
                $sales[$saleId] = [
                    'id' => $row->sale_id,
                    'type' => $row->is_warehouse ? 'warehouse' : 'customer',
                    'customerName' => $row->is_warehouse
                        ? ($row->warehouse_name ?? 'Warehouse Transfer')
                        : $row->customer_name,
                    'items' => [],
                    'totalPrice' => $row->total,
                    'discount' => $row->total_discount,
                    'subTotal' => $row->subtotal,
                    'saleDate' => $row->created_at,
                    'payment' => $row->payment_paid,
                    'payment_status' => $row->payment_status,
                    'discount_type' => $row->discount_type,
                    'paid' => $row->payment_paid, 
                    'reference' => $row->reference,
                    'warehouse' => [
                        'id' => $row->warehouse_id,
                        'name' => $row->warehouse_name,
                    ],
                ];
            }

            if ($row->product_id) {
                $sales[$saleId]['items'][] = [
                    'productId' => $row->product_id,
                    'productName' => $row->product_name ?? 'Unknown Product',
                    'quantity' => $row->qty,
                    'price' => $row->price,
                    'cost' => $row->cost,
                    'discount' => $row->item_discount,
                    'total' => $row->item_total,
                    'unit' => $row->unit_name,
                ];
            }
        }

        $salesList = array_values($sales);

        return response()->json([
            'success' => true,
            'data' => $salesList,
            'filters' => [
                'warehouse_id' => $warehouseId,
                'type' => $type,
            ],
        ]);
    } catch (\Exception $e) {
        Log::error("Failed to fetch sales inventory (raw): " . $e->getMessage());

        return response()->json([
            'success' => false,
            'message' => 'Failed to fetch sales inventory',
            'error' => config('app.debug') ? $e->getMessage() : 'Internal Server Error',
        ], 500);
    }
}


    

    public function store(Request $request)
    {
        $validated = $request->validate([
            'customer_id' => 'nullable|exists:users,id',
            'warehouse_id' => 'nullable|exists:warehouses,id',
            'date' => 'required|date',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.price' => 'required|numeric|min:0',
            'items.*.cost' => 'required|numeric|min:0',
            'items.*.discount' => 'sometimes|numeric|min:0|max:100',
            'discount' => 'sometimes|numeric|min:0|max:100',
            'payment_method' => 'required',
            'amount_paid' => 'required',
            'notes' => 'sometimes|string|nullable',
            'next_payment_date' => 'nullable|date',
            'next_payment_amount' => 'nullable|integer',
            'shift_id' => 'nullable',
            'currency' => 'nullable',
            'exchange_rate' => 'nullable',
            'to_warehouse_id' => 'nullable',
            'reference' => 'nullable',
            'sale_person' => 'nullable',
            'total' => 'nullable',
            'sale_type' => 'nullable',
            'amount' => 'nullable',
            'credit_amount' => 'nullable',
            'discount_type' => 'nullable'

        ]);

        if (empty($validated['exchnage_rate'])) {
            $validated['exchange_rate'] = 1 ;
        }

        $subtotal = 0;
        $taxRate = 0; 
        $discountTotal = 0;


        
        foreach ($validated['items'] as $item) {
            $itemTotal = $item['price'] * $item['quantity'];
            $itemDiscount = $itemTotal * ($item['discount'] ?? 0 / 100);
            $subtotal += $itemTotal + $itemDiscount;
            $discountTotal += $itemDiscount;
        }
        $subtotal = $validated['amount'];
        $tax = $subtotal * $taxRate;
        $total = $validated['total'];
        $changeDue = $validated['amount_paid'] - $total;
        $status = 'pending';
        $total = $validated['total'];
        // $is_warehouse = false ;
        $reference = $validated['reference']??null;
        $defaultCost= 0;
        if (empty($request->reference)) {
            if ($request->sale_type == 'sale_inventory') {
                $prefix = 'INV-';
                $lastSale = Sale::where('reference', 'like', $prefix . '%')->latest('id')->first();
            } else {
                $prefix = 'POS-';
                $lastSale = PosSale::where('reference', 'like', $prefix . '%')->latest('id')->first();
            }

            if ($lastSale && preg_match('/\d+$/', $lastSale->reference, $matches)) {
                $number = intval($matches[0]) + 1;
            } else {
                $number = 1;
            }

            $reference = $prefix . str_pad($number, 8, '0', STR_PAD_LEFT);
        } else {
            $reference = $request->input('reference');
        }

        if (isset($validated['currency']) && $validated['currency'] == 'KHR') {
            $total = $validated['amount_paid'] * $validated['exchange_rate'];
        }
        if ($validated['amount_paid'] == $total) {
            $status = 'paid';
        }
        if ($validated['amount_paid'] < $total && $validated['amount_paid'] > 0) {
            $status = 'partial';
        }
        if(!empty($validated['credit_amount'])){
            $status = 'partial';
        }

        DB::beginTransaction();
       if ($validated['sale_type'] == 'sale_inventory') {
    $is_warehouse = null;
    if (empty($validated['warehouse_id']) && !empty($validated['to_warehouse_id'])) {
        $is_warehouse = $validated['to_warehouse_id'];
    }

    try {
        // Create Sale Record
        $sale = Sale::create([
            'customer_id' => $validated['customer_id'] ?? $validated['to_warehouse_id'],
            'warehouse_id' => $validated['warehouse_id'],
            'sale_person' => auth()->id() ?? $validated['sale_person'],
            'subtotal' => $subtotal,
            'tax' => $tax,
            'discount' => $validated['discount'],
            'total' => $total,
            'date' => $validated['date'],
            'payment_method' => $validated['payment_method'],
            'paid' => $validated['amount_paid'],
            'change_due' => $changeDue,
            'payment_status' => $status,
            'reference' => $reference,
            'notes' => $validated['notes'] ?? null,
            'next_payment_date' => $validated['next_payment_date'] ?? null,
            'next_payment_amount' => $validated['credit_amount'] ?? null,
            'is_warehouse' => $is_warehouse,
            'discount_type' => $validated['discount_type'],
        ]);

        if (!empty($validated['credit_amount'])) {
            $total = $validated['amount'] - $validated['credit_amount'];
        }

        foreach ($validated['items'] as $item) {
            $productWarehouseId = $validated['warehouse_id'] ?? null;
            $targetWarehouseId = $validated['to_warehouse_id'] ?? null;

            // SaleItem Entry
            SaleItem::create([
                'sale_id' => $sale->id,
                'product_id' => $item['product_id'],
                'qty' => $item['quantity'],
                'price' => $item['price'],
                'cost' => $item['cost'],
                'discount' => $item['discount'] ?? 0,
                'total' => ($item['price'] * $item['quantity']) - ($item['discount']),
                'subtotal' => ($item['price'] * $item['quantity']),
            ]);

            // ↓↓↓ DECREMENT FROM COMPANY (warehouse_id = null) ↓↓↓
            $companyStock = Stock::firstOrCreate(
                ['warehouse_id' => null, 'product_id' => $item['product_id']],
                ['quantity' => 0]
            );

            $companyStock->decrement('quantity', $item['quantity']);

            StockMove::create([
                'product_id' => $item['product_id'],
                'warehouse_id' => null,
                'quantity' => -$item['quantity'],
                'movement_type' => 'sale',
                'date' => $validated['date'],
                'reference_id' => $sale->id,
                'notes' => 'Sale from Company to Warehouse',
            ]);

            // ↑↑↑ INCREASE TO TARGET WAREHOUSE ↑↑↑
            $warehouseStock = Stock::firstOrCreate(
                ['warehouse_id' => $targetWarehouseId, 'product_id' => $item['product_id']],
                ['quantity' => 0]
            );

            $warehouseStock->increment('quantity', $item['quantity']);

            StockMove::create([
                'product_id' => $item['product_id'],
                'warehouse_id' => $targetWarehouseId,
                'quantity' => $item['quantity'],
                'movement_type' => 'purchase',
                'date' => $validated['date'],
                'reference_id' => $sale->id,
                'notes' => 'Stock received from Company',
            ]);
        }

        // Payment entry
        SalePayment::create([
            'sale_id' => $sale->id,
            'paid' => $total,
            'payment_method' => $validated['payment_method'],
            'reference_no' => $validated['payment_method'] === 'card' ? 
                ($request->input('transaction_reference') ?? null) : null,
            'date' => $validated['date'],
            'warehouse_id' => $validated['warehouse_id'] ?? null,
            'payment_types' => "cash",
            'currency' => $validated['currency'] ?? null,
            'exchange_rate' => $validated['exchange_rate'],
            'type' => 'inventory',
        ]);

        DB::commit();

        return response()->json([
            'success' => true,
            'change_due' => $changeDue,
            'message' => 'Sale completed successfully'
        ]);

    } catch (\Exception $e) {
        DB::rollBack();
        return response()->json([
            'success' => false,
            'message' => 'Sale failed: ' . $e->getMessage()
        ], 500);
    }
}
        else{

            try {
                $sale = PosSale::create([
                    'customer_id' => $validated['customer_id'],
                    'warehouse_id' => $validated['warehouse_id'],
                    'saleman_id' => auth()->id(),
                    'subtotal' => $subtotal,
                    'tax' => $tax,
                    'discount' =>$validated['discount'],
                    'total' => $total,
                    'date' => $validated['date'],
                    'payment_method' => $validated['payment_method'],
                    'paid' => $validated['amount_paid'],
                    'change_due' => $changeDue,
                    'status' => $status,
                    'reference' => $reference,
                    'notes' => $validated['notes'] ?? null,
                    'shift_id' => $validated['shift_id'] ?? null,
                    'next_payment_date' => $validated['next_payment_date'] ?? null,
                    'next_payment_amount' => $validated['next_payment_amount'] ?? null,
                ]);
    
    
        
                foreach ($validated['items'] as $item) {
                    $product = WarehouseProduct::getProductWarehouseData($item['product_id'], $validated['warehouse_id']);
                    $defaultCost = $product['cost'];

                    $stock = Stock::where('warehouse_id', $validated['warehouse_id'])
                        ->where('product_id', $item['product_id'])
                        ->first();

                    if (!$stock) {
                        $stock = Stock::create([
                            'warehouse_id' => $validated['warehouse_id'],
                            'product_id' => $item['product_id'],
                            'quantity' => 0,
                        ]);
                    }

                    $orderedQty = (int) $item['quantity'];
                    if ($orderedQty > $stock['quantity']) {
                        $defaultCost = 0 ;
                    }
                    PosSaleItem::create([
                        'pos_sale_id' => $sale->id,
                        'product_id' => $item['product_id'],
                        'qty' => $orderedQty,
                        'price' => $item['price'],
                        'cost' => $defaultCost,
                        'discount' => $item['discount'] ?? 0,
                        'total' => ($item['price'] * $orderedQty) * (1 - ($item['discount'] ?? 0) / 100),
                    ]);

                    $stock->decrement('quantity', $orderedQty);

                    StockMove::create([
                        'product_id' => $item['product_id'],
                        'warehouse_id' => $validated['warehouse_id'],
                        'quantity' => -$orderedQty,
                        'movement_type' => 'sale',
                        'date' => $validated['date'],
                        'reference_id' => $sale->id,
                        'notes' => 'POS Sale',
                    ]);
                }

    
    
        
                SalePayment::create([
                    'sale_id' => $sale->id,
                    'paid' => $validated['amount_paid'],
                    'payment_method' => $validated['payment_method'],
                    'reference_no' => $validated['payment_method'] === 'card' ? 
                                  ($request->input('transaction_reference') ?? null) : null,
                    'date' => $validated['date'],
                    'warehouse_id' => $validated['warehouse_id'],
                    'payment_types' => "cash",
                    'currency' => $validated['currency'],
                    'exchange_rate' => $validated['exchange_rate'],
                ]);
        
                DB::commit();
        
                return response()->json([
                    'success' => true,
                    
                    'change_due' => $changeDue,
                    'message' => 'Sale completed successfully'
                ]);
        
            } 
            catch (\Exception $e) {
                DB::rollBack();
                return response()->json([
                    'success' => false,
                    'message' => 'Sale failed: '.$e->getMessage()
                ], 500);
            }
        }
        
    }

    /**
     * Display the specified resource.
     */
    public function showSaleInventory(string $id)
    {
        $sale = Sale::with([
            'items.product',
            'customer',
            'payments' => function ($query) {
                $query->where('type', 'inventory'); 
            }
        ])
        ->where('id', $id)
        ->first();

        if (!$sale || $sale->payments->isEmpty()) {
            return response()->json([
                'message' => 'Inventory sale or related inventory payments not found',
            ], 404);
        }

        return response()->json([
            'data' => $sale,
        ]);
    }




    /**
     * Update the specified resource in storage.
     */
public function update(Request $request, $id)
{
    $validated = $request->validate([
        'customer_id' => 'nullable|exists:users,id',
        'warehouse_id' => 'nullable|exists:warehouses,id',
        'date' => 'required|date',
        'items' => 'required|array|min:1',
        'items.*.product_id' => 'required|exists:products,id',
        'items.*.quantity' => 'required|integer|min:1',
        'items.*.price' => 'required|numeric|min:0',
        'items.*.cost' => 'required|numeric|min:0',
        'items.*.discount' => 'sometimes|numeric|min:0|max:100',
        'discount' => 'sometimes|numeric|min:0|max:100',
        'payment_method' => 'nullable',
        'amount_paid' => 'required',
        'notes' => 'sometimes|string|nullable',
        'next_payment_date' => 'nullable|date',
        'next_payment_amount' => 'nullable|integer',
        'shift_id' => 'nullable',
        'currency' => 'nullable',
        'exchange_rate' => 'nullable',
        'to_warehouse_id' => 'nullable',
        'reference' => 'nullable',
        'sale_person' => 'nullable',
        'total' => 'nullable',
        'sale_type' => 'nullable',
        'amount' => 'nullable',
        'credit_amount' => 'nullable',
        'discount_type' => 'nullable'
    ]);

    if (empty($validated['exchange_rate'])) {
        $validated['exchange_rate'] = 1;
    }

    $subtotal = $validated['amount'];
    // dd($subtotal);
    $taxRate = 0;
    $tax = $subtotal * $taxRate;
    $total = $validated['total'];
    $changeDue = $validated['amount_paid'] - $total;
    $status = 'pending';

    if (isset($validated['currency']) && $validated['currency'] == 'KHR') {
        $total = $validated['amount_paid'] * $validated['exchange_rate'];
    }
    if ($validated['amount_paid'] == $total) {
        $status = 'paid';
    }
    if ($validated['amount_paid'] < $total && $validated['amount_paid'] > 0) {
        $status = 'partial';
    }
    if (!empty($validated['credit_amount'])) {
        $status = 'partial';
    }

    DB::beginTransaction();

    try {
        if ($validated['sale_type'] == 'sale_inventory') {
            $sale = Sale::findOrFail($id);
            $is_warehouse = null;
            
            if (empty($validated['warehouse_id'])) {
                $is_warehouse = $validated['to_warehouse_id'];
                $validated['warehouse_id'] = $validated['to_warehouse_id'];
            }

            $oldItems = SaleItem::where('sale_id', $sale->id)->get();
            foreach ($oldItems as $oldItem) {
                $stock = Stock::where('warehouse_id', $sale->warehouse_id)
                    ->where('product_id', $oldItem->product_id)
                    ->first();
                
                if ($stock) {
                    $stock->increment('quantity', $oldItem->qty);
                }

                StockMove::where('reference_id', $sale->id)
                    ->where('product_id', $oldItem->product_id)
                    ->where('movement_type', 'sale')
                    ->delete();
            }

            SaleItem::where('sale_id', $sale->id)->delete();

            $sale->update([
                'customer_id' => $validated['customer_id'] ?? $request->to_warehouse,
                'warehouse_id' => $validated['warehouse_id'],
                'sale_person' => auth()->id() ?? $validated['sale_person'],
                'subtotal' => $subtotal,
                'tax' => $tax,
                'discount' => $validated['discount'],
                'total' => $total,
                'date' => $validated['date'],
                'payment_method' => $validated['payment_method'] ?? $sale->payment_method,
                'paid' => $validated['amount_paid'],
                'change_due' => $changeDue,
                'payment_status' => $status,
                'notes' => $validated['notes'] ?? null,
                'next_payment_date' => $validated['next_payment_date'] ?? null,
                'next_payment_amount' => $validated['credit_amount'] ?? null,
                'is_warehouse' => $is_warehouse,
                'discount_type' => $validated['discount_type'],
            ]);

            foreach ($validated['items'] as $item) {
                $product = WarehouseProduct::getProductWarehouseData($item['product_id'], $validated['warehouse_id']);

                if (!$product || !is_array($product)) {
                    DB::rollBack();
                    return response()->json([
                        'success' => false,
                        'message' => "Sale update failed: Product not found in warehouse for product ID {$item['product_id']}."
                    ], 404);
                }

                $defaultCost = $product['cost'];
                $stock = Stock::where('warehouse_id', $validated['warehouse_id'])
                    ->where('product_id', $item['product_id'])
                    ->first();

                if (!$stock) {
                    $stock = Stock::create([
                        'warehouse_id' => $validated['warehouse_id'],
                        'product_id' => $item['product_id'],
                        'quantity' => 0,
                    ]);
                }

                $orderedQty = $item['quantity'];
                $availableQty = $stock->quantity > 0 ? $stock->quantity : 0;

                if ($availableQty >= $orderedQty) {
                    SaleItem::create([
                        'sale_id' => $sale->id,
                        'product_id' => $item['product_id'],
                        'qty' => $orderedQty,
                        'price' => $item['price'],
                        'cost' => $item['cost'],
                        'discount' => $item['discount'] ?? 0,
                        'total' => ($item['price'] * $orderedQty) * (1 - ($item['discount'] ?? 0) / 100),
                    ]);
                    $stock->decrement('quantity', $orderedQty);
                } else {
                    $withCostQty = $availableQty;
                    $zeroCostQty = $orderedQty - $availableQty;

                    if ($withCostQty > 0) {
                        SaleItem::create([
                            'sale_id' => $sale->id,
                            'product_id' => $item['product_id'],
                            'qty' => $withCostQty,
                            'price' => $item['price'],
                            'cost' => $item['cost'],
                            'discount' => $item['discount'] ?? 0,
                            'total' => ($item['price'] * $withCostQty) * (1 - ($item['discount'] ?? 0) / 100),
                        ]);
                        $stock->decrement('quantity', $withCostQty);
                    }

                    if ($zeroCostQty > 0) {
                        SaleItem::create([
                            'sale_id' => $sale->id,
                            'product_id' => $item['product_id'],
                            'qty' => $zeroCostQty,
                            'price' => $item['price'],
                            'cost' => 0,
                            'discount' => $item['discount'] ?? 0,
                            'total' => ($item['price'] * $zeroCostQty) * (1 - ($item['discount'] ?? 0) / 100),
                        ]);
                    }
                }

                StockMove::create([
                    'product_id' => $item['product_id'],
                    'warehouse_id' => $validated['warehouse_id'],
                    'quantity' => -$item['quantity'],
                    'movement_type' => 'sale',
                    'date' => $validated['date'],
                    'reference_id' => $sale->id,
                    'notes' => 'Sale Update',
                ]);
            }

            SalePayment::where('sale_id', $sale->id)
                    ->where('type', 'inventory')
                    ->delete();
            SalePayment::create([
                'sale_id' => $sale->id,
                'paid' => $total,
                'payment_method' => $validated['payment_method'],
                'reference_no' => $validated['payment_method'] === 'card' ? 
                    ($request->input('transaction_reference') ?? null) : null,
                'date' => $validated['date'],
                'warehouse_id' => $validated['warehouse_id'],
                'payment_types' => "cash",
                'currency' => $validated['currency'] ?? null,
                'exchange_rate' => $validated['exchange_rate'],
                'type' => 'inventory',
            ]);

        } else {
            // POS Sale update
            $sale = PosSale::findOrFail($id);

            // Restore stock from old pos sale items
            $oldItems = PosSaleItem::where('pos_sale_id', $sale->id)->get();
            foreach ($oldItems as $oldItem) {
                $stock = Stock::where('warehouse_id', $sale->warehouse_id)
                    ->where('product_id', $oldItem->product_id)
                    ->first();
                
                if ($stock) {
                    $stock->increment('quantity', $oldItem->qty);
                }

                // Remove old stock moves
                StockMove::where('reference_id', $sale->id)
                    ->where('product_id', $oldItem->product_id)
                    ->where('movement_type', 'sale')
                    ->delete();
            }

            // Delete old pos sale items
            PosSaleItem::where('pos_sale_id', $sale->id)->delete();

            // Update pos sale
            $sale->update([
                'customer_id' => $validated['customer_id'],
                'warehouse_id' => $validated['warehouse_id'],
                'saleman_id' => auth()->id(),
                'subtotal' => $subtotal,
                'tax' => $tax,
                'discount' => $validated['discount'],
                'total' => $total,
                'date' => $validated['date'],
                'payment_method' => $validated['payment_method'],
                'paid' => $validated['amount_paid'],
                'change_due' => $changeDue,
                'status' => $status,
                'notes' => $validated['notes'] ?? null,
                'shift_id' => $validated['shift_id'] ?? null,
                'next_payment_date' => $validated['next_payment_date'] ?? null,
                'next_payment_amount' => $validated['next_payment_amount'] ?? null,
            ]);

            // Add new items
            foreach ($validated['items'] as $item) {
                $product = WarehouseProduct::getProductWarehouseData($item['product_id'], $validated['warehouse_id']);
                $defaultCost = $product['cost'];

                $stock = Stock::where('warehouse_id', $validated['warehouse_id'])
                    ->where('product_id', $item['product_id'])
                    ->first();

                if (!$stock) {
                    $stock = Stock::create([
                        'warehouse_id' => $validated['warehouse_id'],
                        'product_id' => $item['product_id'],
                        'quantity' => 0,
                    ]);
                }

                $orderedQty = (int) $item['quantity'];
                if ($orderedQty > $stock['quantity']) {
                    $defaultCost = 0;
                }

                PosSaleItem::create([
                    'pos_sale_id' => $sale->id,
                    'product_id' => $item['product_id'],
                    'qty' => $orderedQty,
                    'price' => $item['price'],
                    'cost' => $defaultCost,
                    'discount' => $item['discount'] ?? 0,
                    'total' => ($item['price'] * $orderedQty) * (1 - ($item['discount'] ?? 0) / 100),
                ]);

                $stock->decrement('quantity', $orderedQty);

                StockMove::create([
                    'product_id' => $item['product_id'],
                    'warehouse_id' => $validated['warehouse_id'],
                    'quantity' => -$orderedQty,
                    'movement_type' => 'sale',
                    'date' => $validated['date'],
                    'reference_id' => $sale->id,
                    'notes' => 'POS Sale Update',
                ]);
            }

            // Update payment
            SalePayment::where('sale_id', $sale->id)->delete();
            SalePayment::create([
                'sale_id' => $sale->id,
                'paid' => $validated['amount_paid'],
                'payment_method' => $validated['payment_method'],
                'reference_no' => $validated['payment_method'] === 'card' ? 
                    ($request->input('transaction_reference') ?? null) : null,
                'date' => $validated['date'],
                'warehouse_id' => $validated['warehouse_id'],
                'payment_types' => "cash",
                'currency' => $validated['currency'],
                'exchange_rate' => $validated['exchange_rate'],
            ]);
        }

        DB::commit();

        return response()->json([
            'success' => true,
            'change_due' => $changeDue,
            'message' => 'Sale updated successfully'
        ]);

    } catch (\Exception $e) {
        DB::rollBack();
        return response()->json([
            'success' => false,
            'message' => 'Sale update failed: '.$e->getMessage()
        ], 500);
    }
}

    /**
     * Remove the specified resource from storage.
     */
    // public function destroy(string $id)
    // {
    //     $data = Sale::find($id);
    //     if(!$data){
    //         return response()->json([
    //             "error" => [
    //                 "delete"=>"Data not found!"
    //             ]
    //             ]);
    //     }else{
    //         $data->delete();
    //         return response()->json([
    //             "message" => "Delete success"
    //             ]);
    //     }
    // }

    public function destroy(string $id)
        {
            DB::beginTransaction();

            try {
                $sale = Sale::with(['items', 'payments'])->find($id);

                if (!$sale) {
                    return response()->json([
                        "success" => false,
                        "error" => "Sale not found!"
                    ], 404);
                }

                foreach ($sale->items as $item) {
                    DB::table('warehouse_products')
                        ->where('product_id', $item->product_id)
                        ->where('warehouse_id', $sale->warehouse_id)
                        ->increment('qty', $item->qty);

                    $stock = Stock::where('warehouse_id', $sale->warehouse_id)
                                ->where('product_id', $item->product_id)
                                ->first();
                    
                    if ($stock) {
                        $stock->increment('quantity', $item->qty);
                    }

                    if ($sale->is_warehouse != null) {
                        $warehouse_stock = Stock::where('warehouse_id', $sale->is_warehouse)
                                ->where('product_id', $item->product_id)
                                ->first();
                        if ($warehouse_stock) {
                            $warehouse_stock->decrement('quantity', $item->qty);
                        }
                    }
                }

                StockMove::where('reference_id', $sale->id)
                        ->where('movement_type', 'sale')
                        ->delete();

                SaleItem::where('sale_id', $sale->id)->delete();

                SalePayment::where('sale_id', $sale->id)
                        ->where('type', 'inventory')
                        ->delete();

                $sale->delete();

                DB::commit();

                return response()->json([
                    "success" => true,
                    "message" => "Inventory sale and all related data deleted successfully"
                ]);

            } catch (\Exception $e) {
                DB::rollBack();
                return response()->json([
                    "success" => false,
                    "error" => "Failed to delete inventory sale: " . $e->getMessage()
                ], 500);
            }
        }
    public function PosDestroy(string $id)
        {
            DB::beginTransaction();

            try {
                $sale = PosSale::with(['items', 'posPayments'])->find($id);

                if (!$sale) {
                    return response()->json([
                        "success" => false,
                        "error" => "Sale not found!"
                    ], 404);
                }

                foreach ($sale->items as $item) {
                    DB::table('warehouse_products')
                        ->where('product_id', $item->product_id)
                        ->where('warehouse_id', $sale->warehouse_id)
                        ->increment('qty', $item->qty);

                    $stock = Stock::where('warehouse_id', $sale->warehouse_id)
                                ->where('product_id', $item->product_id)
                                ->first();
                    
                    if ($stock) {
                        $stock->increment('quantity', $item->qty);
                    }
                }

                StockMove::where('reference_id', $sale->id)
                        ->where('movement_type', 'sale')
                        ->delete();

                PosSaleItem::where('pos_sale_id', $sale->id)->delete();

                SalePayment::where('sale_id', $sale->id)
                        ->where('type', 'pos')
                        ->delete();

                $sale->delete();

                DB::commit();

                return response()->json([
                    "success" => true,
                    "message" => "Inventory sale and all related data deleted successfully"
                ]);

            } catch (\Exception $e) {
                DB::rollBack();
                return response()->json([
                    "success" => false,
                    "error" => "Failed to delete inventory sale: " . $e->getMessage()
                ], 500);
            }
        }
    }
