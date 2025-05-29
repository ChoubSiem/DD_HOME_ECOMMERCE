<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PosSale;
use App\Models\Purchase;
use App\Models\Sale;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
public function getPurchaseReports($warehouse_id = false)
{
    $query = Purchase::with(['purchaseItems', 'supplier', 'payments','purchaseItems.product'])
                ->withCount('purchaseItems')
                ->withSum('payments', 'paid')
                ->orderBy('date', 'desc');


    if ($warehouse_id) {
        $query->where('warehouse_id', $warehouse_id);
    }

    $purchases = $query->get();

    return response()->json([
        'list' => $purchases,
        'message' => 'Purchase reports retrieved successfully',
    ]);
}

public function getSaleReports($warehouse_id = false)
{
    $posSalesQuery = PosSale::with(['items.product', 'customer', 'posPayments'])
        ->withCount('items')
        ->withSum('posPayments', 'paid')
        ->orderBy('date', 'desc');

    $inventorySalesQuery = Sale::with(['items.product', 'customer', 'payments'])
        ->withCount('items')
        ->withSum('payments', 'paid')
        ->orderBy('date', 'desc');

    if ($warehouse_id) {
        $posSalesQuery->where('warehouse_id', $warehouse_id);
        $inventorySalesQuery->where('warehouse_id', $warehouse_id);
    }

    // Collect all items from POS sales with mapped fields
    $posItems = $posSalesQuery->get()->flatMap(function ($sale) {
        return $sale->items->map(function ($item) use ($sale) {
            return [
                'product_id' => $item->product_id,
                'product_name' => $item->product?->name,
                'quantity' => $item->qty,
                'cost' => $item->cost * $item->qty, // total cost for qty
                'price' => $item->price,
                'subtotal' => $item->subtotal,
                'invoice_discount' => $sale->discount ?? 0,
                'item_discount' => $item->discount ?? 0,
                'date' => $sale->date,
                'customer_id' => $sale->customer_id,
            ];
        });
    });

    // Collect all items from inventory sales with mapped fields
    $inventoryItems = $inventorySalesQuery->get()->flatMap(function ($sale) {
        return $sale->items->map(function ($item) use ($sale) {
            return [
                'product_id' => $item->product_id,
                'product_name' => $item->product?->name,
                'quantity' => $item->qty,
                'cost' => $item->cost * $item->qty,
                'price' => $item->price,
                'subtotal' => $item->subtotal,
                'invoice_discount' => $sale->discount ?? 0,
                'item_discount' => $item->discount ?? 0,
                'date' => $sale->date,
                'customer_id' => $sale->customer_id,
            ];
        });
    });

    // Merge all items from both sales
    $allItems = $posItems->merge($inventoryItems);

    // Group by product_name and calculate summary data
    $grouped = $allItems->groupBy('product_name')->map(function ($items, $productName) {
        $totalQuantity = $items->sum('quantity');
        $totalSubtotal = $items->sum('subtotal'); // sum of all subtotals before discount
        $totalInvoiceDiscount = $items->sum('invoice_discount');
        $totalItemDiscount = $items->sum('item_discount');
        $totalCost = $items->sum('cost'); // sum of total cost (cost * qty)

        // total_sale = subtotal - all discounts
        $totalSale = $totalSubtotal - $totalInvoiceDiscount - $totalItemDiscount;

        // profit = total_sale - total_cost
        $profit = $totalSale - $totalCost;

        // average_cost per unit = total_cost / total_quantity (avoid division by zero)
        $averageCost = $totalQuantity > 0 ? round($totalCost / $totalQuantity, 2) : 0;

        return [
            'product_name' => $productName,
            'total_quantity' => $totalQuantity,
            'total_subtotal' => round($totalSubtotal, 2),
            'total_invoice_discount' => round($totalInvoiceDiscount, 2),
            'total_item_discount' => round($totalItemDiscount, 2),
            'total_sale' => round($totalSale, 2),
            'average_cost' => $averageCost,
            'total_customers' => $items->pluck('customer_id')->unique()->count(),
            'first_sale_date' => $items->min('date'),
            'last_sale_date' => $items->max('date'),
            'total_cost' => round($totalCost, 2),
            'profit' => round($profit, 2),
        ];
    })->values();

    return response()->json([
        'sales' => $grouped,
        'message' => 'Sale items grouped by product with detailed info retrieved successfully',
    ]);
}





public function getShiftReport($warehouse_id = false)
{
    $shiftsQuery = DB::table('open_shifts')
        ->leftJoin('users', 'open_shifts.user_id', '=', 'users.id')
        ->leftJoin('warehouses', 'open_shifts.warehouse_id', '=', 'warehouses.id')
        ->leftJoin('close_shift', 'close_shift.open_shift_id', '=', 'open_shifts.id') 
        ->select(
            'open_shifts.id',
            'open_shifts.start_time',
            'open_shifts.warehouse_id',
            'open_shifts.user_id',
            'open_shifts.status',
            'open_shifts.total_usd as open_total_usd',
            'open_shifts.total_kh as open_total_kh',
            'close_shift.total_usd as close_total_usd',
            'close_shift.total_kh as close_total_kh',
            DB::raw('(SELECT MAX(end_time) FROM close_shift WHERE close_shift.open_shift_id = open_shifts.id) as end_time'),
            // DB::raw('(SELECT IFNULL(SUM(money_number), 0) FROM open_shift_cashes WHERE open_shift_cashes.open_shift_id = open_shifts.id AND currency = "USD") as total_usd'),
            // DB::raw('(SELECT IFNULL(SUM(money_number), 0) FROM open_shift_cashes WHERE open_shift_cashes.open_shift_id = open_shifts.id AND currency = "KHR") as total_khr'),
            // DB::raw('(SELECT note FROM open_shift_cashes WHERE open_shift_cashes.open_shift_id = open_shifts.id ORDER BY created_at DESC LIMIT 1) as note'),
            'users.username as cashier_name',
            'warehouses.name as warehouse_name',
            DB::raw('(SELECT COUNT(*) FROM pos_sales WHERE pos_sales.shift_id = open_shifts.id) as sales_count'),
            DB::raw('(SELECT SUM(total) FROM pos_sales WHERE pos_sales.shift_id = open_shifts.id) as sales_total'),
            // DB::raw('CASE WHEN EXISTS (SELECT 1 FROM open_shift_cashes WHERE open_shift_cashes.open_shift_id = open_shifts.id) THEN "closed" ELSE "open" END as status')
        )
        ->orderBy('open_shifts.start_time', 'desc');

    if ($warehouse_id) {
        $shiftsQuery->where('open_shifts.warehouse_id', $warehouse_id);
    }

    $shifts = $shiftsQuery->get();

    $shifts = $shifts->map(function ($shift) {
        $shift->sales = DB::table('pos_sales')
            ->where('shift_id', $shift->id)
            ->leftJoin('users', 'pos_sales.customer_id', '=', 'users.id')
            ->select(
                'pos_sales.*',
                'users.username as customer_name'
            )
            ->get()
            ->map(function ($sale) {
                $sale->items = DB::table('pos_sale_items')
                    ->where('pos_sale_id', $sale->id)
                    ->join('products', 'pos_sale_items.product_id', '=', 'products.id')
                    ->select(
                        'pos_sale_items.*',
                        'products.name as product_name',
                        'products.code as product_code'
                    )
                    ->get();

                $sale->payments = DB::table('sale_payments')
                    ->where('sale_id', $sale->id)
                    ->get();

                $sale->payments_sum_amount = $sale->payments->sum('amount');

                return $sale;
            });

        return $shift;
    });

    return response()->json([
        'success' => true,
        'shifts' => $shifts,
        'message' => 'Shift reports retrieved successfully',
    ]);
}









}
