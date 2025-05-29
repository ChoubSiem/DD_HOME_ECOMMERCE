<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Purchase;
use App\Models\PurchaseItem;
use App\Models\Stock;
use App\Models\StockMove;
use App\Models\Payment;
use App\Models\Product;
use App\Models\PurchasePayment;
use App\Models\Unit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class PurchaseController extends Controller
{
 public function index(Request $request)
{
    $query = Purchase::with(['purchaseItems.product','supplier','purchaser','payments','purchaseItems','purchaseItems.unit']);

    if ($request->has('warehouse_id')) {
        $query->where('warehouse_id', $request->warehouse_id);
    }

    if ($request->has('approval')) {
        $query->where('approval', $request->approval);
    }
    $query->orderBy('date', 'desc');

    $purchases = $query->get();

    return response()->json([
        'list' => $purchases
    ]);
}



public function store(Request $request)
{
    $request->validate([
        'date' => 'required|date_format:Y-m-d H:i:s',
        'reference' => 'nullable|string|max:255',
        'supplier_id' => 'required|integer|exists:users,id',
        'purchaser' => 'required|exists:users,id',
        'warehouse_id' => 'nullable|exists:warehouses,id',
        'total' => 'required',
        'payment' => 'nullable|string',
        'items' => 'required|array|min:1',
        'items.*.product_id' => 'required|integer|exists:products,id',
        'items.*.qty' => 'required|numeric|min:1',
        'items.*.price' => 'required|numeric|min:0',
        'items.*.unit_code' => 'required|string|max:50',
        'payment_type' => 'nullable',

    ]);

    $reference = '';
    if ($request->reference) {
        $reference = $request->reference;
    } else {
        $latestPurchase = Purchase::orderBy('id', 'desc')->first();
        $lastNumber = 0;
        if ($latestPurchase && preg_match('/REF-(\d+)/', $latestPurchase->reference, $matches)) {
            $lastNumber = (int) $matches[1];
        }
        $reference = 'REF-' . str_pad($lastNumber + 1, 8, '0', STR_PAD_LEFT);
    }

    $approval = 'approved';
    $paid = $request->total - $request->credit_amount;
    $next_payment_date = $request->next_date;
    $payment_status = 'unpaid';


    if ($request->payment_type == 'COD') {
        $payment_status = 'paid';
    }else if ($paid > $request->total){
        $payment_status = 'due';
    }else if ($paid < $request->total){
        $payment_status = 'partial';
    }


    if ($request->warehouse_id) {
        $approval = 'request';
    }

    if ($request->payment_type == 'DOC') {
        $paid = $request->total;
    }

    DB::beginTransaction();
    try {
        $purchase = Purchase::create([
            'date' => $request->date,
            'reference' => $reference,
            'supplier_id' => $request->supplier_id,
            'warehouse_id' => $request->warehouse_id,
            'purchaser' => $request->purchaser,
            'total' => $request->total,
            'note' => $request->note,
            'approval' => $approval,
            'payment_status' => $payment_status,
        ]);

        foreach ($request->items as $item) {
            $unit_code = Unit::getUnitIdByCode($item['unit_code']);
            $purchaseItem = PurchaseItem::create([
                'purchase_id' => $purchase->id,
                'product_id' => $item['product_id'],
                'qty' => $item['qty'],
                'unit_code' => $unit_code,
                'total_price' => $item['qty'] * $item['price'],
                'price' => $item['price'],
            ]);

            if ($purchaseItem) {
                $stock = Stock::lockForUpdate()->firstOrNew([
                    'product_id' => $item['product_id'],
                    'warehouse_id' => $request->warehouse_id,
                ], [
                    'quantity' => 0,
                    'cost' => $item['price'],
                    'price' => Product::find($item['product_id'])->selling_price ?? 0,
                    'uom_id' => null,
                    'adjust_id' => null,
                    'stock_id' => null,
                ]);

                $currentQuantity = $stock->quantity ?? 0;
                $currentCost = $stock->cost ?? 0;
                $newQuantity = $currentQuantity + $item['qty'];

                if ($newQuantity > 0) {
                    $stock->cost = (($currentQuantity * $currentCost) + ($item['qty'] * $item['price'])) / $newQuantity;
                    // dd($stock->cost);
                }
                
                $stock->quantity = $newQuantity;
                $stock->save();

                StockMove::create([
                    'product_id' => $item['product_id'],
                    'warehouse_id' => $request->warehouse_id,
                    'quantity' => $item['qty'],
                    'type' => 'in',
                    'date' => $request->date,
                    'base_unit' => $unit_code,
                    'adjust_id' => null,
                    'uom_id' => null,
                    'stock_id' => null,
                ]);

                // $product = Product::getProductById($item['product_id']);
                // $stock = Stock::getStock($item['product_id']);
                // $new_cost = $product['cost'];

                // if ($stock['quantity'] > 0 ) {
                //     $new_cost = ($item['qty'] * $new_cost) + ($stock['quantity'] * $stock['cost']) / $stock['quantity'];
                // }
                Product::where('id', $item['product_id'])->update([
                    'cost' => (($currentQuantity * $currentCost) + ($item['qty'] * $item['price'])) / $newQuantity
                ]);
            }
        }

            PurchasePayment::create([
                'purchase_id' => $purchase->id,
                'payment_type' => $request->payment_type,
                'paid' => $paid,
                'date' => $request->date,
                'next_date' => $next_payment_date,
                'reference' => $purchase->reference,
            ]);

        DB::commit();
        return response()->json([
            'success' => true,
            'purchase' => $purchase->load('purchaseItems.product'),
            'message' => 'Purchase created successfully'
        ], 201);
    } catch (\Exception $e) {
        DB::rollBack();
        return response()->json([
            'success' => false,
            'message' => 'Purchase creation failed',
            'error' => $e->getMessage()
        ], 500);
    }
}


    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $purchase = Purchase::with('purchaseItems.product', 'payments')->find($id);
        if (!$purchase) {
            return response()->json([
                'error' => 'Purchase not found'
            ], 404);
        }
        return response()->json([
            'purchase' => $purchase
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $validator = Validator::make($request->all(), [
            'date' => 'required|date_format:Y-m-d H:i:s',
            'reference' => 'required|string|max:255',
            'supplier_id' => 'required|integer|exists:suppliers,id',
            'warehouse_id' => 'required|integer|exists:warehouses,id',
            'purchaser' => 'required|exists:users,id',
            'payment' => 'required|string',
            'approval' => 'required|boolean',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|integer|exists:products,id',
            'items.*.qty' => 'required|numeric|min:1',
            'items.*.price' => 'required|numeric|min:0',
            'items.*.unit_code' => 'required|string|max:50',
            'payment_details' => 'nullable|array',
            'payment_details.payment_type' => 'required_with:payment_details|string',
            'payment_details.paid' => 'required_with:payment_details|numeric|min:0',
            'payment_details.date' => 'required_with:payment_details|date_format:Y-m-d H:i:s',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors()
            ], 422);
        }

        $purchase = Purchase::find($id);
        if (!$purchase) {
            return response()->json([
                'error' => 'Purchase not found'
            ], 404);
        }

        DB::beginTransaction();
        try {
            $purchase->update([
                'date' => $request->date,
                'reference' => $request->reference,
                'supplier_id' => $request->supplier_id,
                'warehouse_id' => $request->warehouse_id,
                'purchaser' => $request->purchaser,
                'payment' => $request->payment,
                'approval' => $request->approval,
            ]);

            foreach ($purchase->purchaseItems as $oldItem) {
                $stock = Stock::lockForUpdate()->where([
                    'product_id' => $oldItem->product_id,
                    'warehouse_id' => $purchase->warehouse_id,
                ])->first();
                if ($stock) {
                    $stock->quantity = max(($stock->quantity ?? 0) - $oldItem->qty, 0);
                    if ($stock->quantity <= 0) {
                        $stock->delete();
                    } else {
                        $stock->save();
                    }
                }
                StockMove::where([
                    'product_id' => $oldItem->product_id,
                    'warehouse_id' => $purchase->warehouse_id,
                    'type' => 'purchase',
                    'date' => $purchase->date,
                ])->delete();
            }

            $purchase->purchaseItems()->delete();

            foreach ($request->items as $item) {
                $total_price = $item['qty'] * $item['price'];
                $purchaseItem = PurchaseItem::create([
                    'purchase_id' => $purchase->id,
                    'product_id' => $item['product_id'],
                    'qty' => $item['qty'],
                    'total_price' => $total_price,
                    'unit_code' => $item['unit_code'],
                    'price' => $item['price'],
                ]);

                if ($purchaseItem) {
                    $stock = Stock::lockForUpdate()->firstOrNew([
                        'product_id' => $item['product_id'],
                        'warehouse_id' => $request->warehouse_id,
                    ], [
                        'quantity' => 0,
                        'cost' => $item['price'],
                        'price' => Product::find($item['product_id'])->selling_price ?? 0,
                        'uom_id' => null,
                        'adjust_id' => null,
                        'stock_id' => null,
                    ]);

                    $stock->quantity = ($stock->quantity ?? 0) + $item['qty'];
                    $stock->cost = $item['price'];
                    $stock->price = Product::find($item['product_id'])->selling_price ?? $stock->price;
                    $stock->save();

                    StockMove::create([
                        'product_id' => $item['product_id'],
                        'warehouse_id' => $request->warehouse_id,
                        'quantity' => $item['qty'],
                        'type' => 'purchase',
                        'date' => $request->date,
                        'base_unit' => $item['unit_code'],
                        'adjust_id' => null,
                        'uom_id' => null,
                        'stock_id' => null,
                    ]);

                    Product::where('id', $item['product_id'])->update([
                        'cost_price' => $item['price']
                    ]);
                }
            }

            if ($request->payment_details) {
                $purchase->payments()->delete();
                Payment::create([
                    'purchase_id' => $purchase->id,
                    'payment_type' => $request->payment_details['payment_type'],
                    'paid' => $request->payment_details['paid'],
                    'date' => $request->payment_details['date'],
                ]);
            }

            DB::commit();
            return response()->json([
                'success' => true,
                'purchase' => $purchase->load('purchaseItems.product'),
                'message' => 'Purchase updated successfully'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Purchase update failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $purchase = Purchase::find($id);
        if (!$purchase) {
            return response()->json([
                'error' => 'Purchase not found'
            ], 404);
        }

        DB::beginTransaction();
        try {
            foreach ($purchase->purchaseItems as $item) {
                $stock = Stock::lockForUpdate()->where([
                    'product_id' => $item->product_id,
                    'warehouse_id' => $purchase->warehouse_id,
                ])->first();
                if ($stock) {
                    $stock->quantity = max(($stock->quantity ?? 0) - $item->qty, 0);
                    if ($stock->quantity <= 0) {
                        $stock->delete();
                    } else {
                        $stock->save();
                    }
                }
                StockMove::where([
                    'product_id' => $item->product_id,
                    'warehouse_id' => $purchase->warehouse_id,
                    'type' => 'purchase',
                    'date' => $purchase->date,
                ])->delete();
            }
            $purchase->payments()->delete();
            $purchase->purchaseItems()->delete();
            $purchase->delete();

            DB::commit();
            return response()->json([
                'success' => true,
                'message' => 'Purchase deleted successfully'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Purchase deletion failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}