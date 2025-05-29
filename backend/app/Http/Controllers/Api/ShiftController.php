<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CloseShift;
use App\Models\CloseShiftCash;
use App\Models\OpenShift;
use App\Models\PosSale;
use App\Models\WarehouseProduct;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
class ShiftController extends Controller
{
    /**
     * Display a listing of the resource.
     */
public function OpenshiftListWithProducts(Request $request, $id)
{
    try {
        $validated = $request->validate([
            'warehouse_id' => 'sometimes|integer|exists:warehouses,id',
        ]);

        $query = OpenShift::with([
            'warehouse',
            'salesperson',
            'cashDetails',
            'posSales' => function ($query) {
                $query->with(['customer', 'items.product'])
                    ->orderBy('created_at', 'desc');
            }
        ])
        ->where('id', $id)
        ->where('status', 'processing');

        if ($request->filled('warehouse_id')) {
            $query->where('warehouse_id', $validated['warehouse_id']);
        }

        $openShifts = $query->get();

        if ($openShifts->isEmpty()) {
            return response()->json([
                'success' => true,
                'data' => [],
                'message' => 'No open shifts found matching the criteria'
            ]);
        }

        $warehouseIds = $openShifts->pluck('warehouse_id')->unique()->toArray();
        $warehouseProducts = WarehouseProduct::whereIn('warehouse_id', $warehouseIds)
            ->with('product')
            ->get()
            ->groupBy('warehouse_id');

        $result = $openShifts->map(function ($shift) use ($warehouseProducts) {
            $products = $warehouseProducts->get($shift->warehouse_id, collect())
                ->map(function ($wp) {
                    return [
                        'product_id' => $wp->product_id,
                        'name' => $wp->product->name ?? 'Unknown',
                        'code' => $wp->product->code ?? '',
                        'quantity' => $wp->quantity,
                        'price' => $wp->price,
                        'cost' => $wp->cost,
                        'unit' => $wp->product->unit ?? 'pcs',
                        'barcode' => $wp->product->barcode ?? null,
                        'stock_value' => $wp->quantity * $wp->cost
                    ];
                })
                ->sortBy('name')
                ->values();

            $salesData = $shift->posSales->map(function ($sale) {
                return [
                    'sale_id' => $sale->id,
                    'reference' => $sale->reference,
                    'customer' => $sale->customer ? [
                        'id' => $sale->customer->id,
                        'name' => $sale->customer->username,
                        'phone' => $sale->customer->phone
                    ] : null,
                    'items' => $sale->items->map(function ($item) {
                        return [
                            'product_id' => $item->product_id,
                            'name' => $item->product->name ?? 'Unknown',
                            'quantity' => $item->qty,
                            'price' => $item->price,
                            'total' => $item->total,
                            'discount' => $item->discount
                        ];
                    }),
                    'subtotal' => $sale->subtotal,
                    'discount' => $sale->discount,
                    'tax' => $sale->tax,
                    'total' => $sale->total,
                    'payment_method' => $sale->payments,
                    'status' => $sale->status,
                    'created_at' => $sale->created_at->format('Y-m-d H:i:s')
                ];
            });

            return [
                'shift_id' => $shift->id,
                'warehouse_id' => $shift->warehouse_id,
                'warehouse' => optional($shift->warehouse)->name ?? 'Unknown Warehouse',
                'warehouse_code' => optional($shift->warehouse)->code ?? null,
                'salesperson_id' => $shift->salesperson_id,
                'salesperson' => optional($shift->salesperson)->username ?? 'Unassigned',
                'salesperson_code' => optional($shift->salesperson)->employee_code ?? null,
                'opened_at' => $shift->start_time,
                'opened_at_formatted' => $shift->opened_at ? $shift->opened_at->format('Y-m-d H:i:s') : null,
                'starting_amount' => $shift->starting_amount,
                'current_balance' => $shift->current_balance,
                'status' => $shift->status,
                'products_count' => $products->count(),
                'total_stock_value' => $products->sum('stock_value'),
                'sales_count' => $salesData->count(),
                'total_sales_amount' => $salesData->sum('total'),
                'initial_cash' => [
                    'usd' => $shift->first()->total_usd ?? 0,
                    'kh' => $shift->first()->total_kh ?? 0,
                ],
                'posSales' => $salesData,
                'summary' => [
                    'total_items_sold' => $salesData->sum(function ($sale) {
                        return $sale['items']->sum('quantity');
                    }),
                    'average_sale_amount' => $salesData->avg('total'),
                    'payment_methods' => $salesData->groupBy('payment_method')->map->count()
                ]
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $result->first(),
            'meta' => [
                'total_shifts' => $result->count(),
                'total_sales' => $result->sum('sales_count'),
                'total_products' => $result->sum('products_count'),
                'filtered_warehouse_id' => $validated['warehouse_id'] ?? 'all',
                'filtered_shift_id' => $id,
                'initial_cash' => [
                    'usd' => $openShifts->first()->total_usd ?? 0,
                    'kh' => $openShifts->first()->total_kh ?? 0,
                ],

                'timestamp' => now()->toDateTimeString(),
            ]
        ]);
    } catch (\Exception $e) {
        Log::error('OpenShift Products Error: ' . $e->getMessage() . ' in ' . $e->getFile() . ':' . $e->getLine());
        return response()->json([
            'success' => false,
            'message' => 'Failed to retrieve shift data',
            'error' => env('APP_DEBUG') ? [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ] : null
        ], 500);
    }
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
public function CreateOpenShift(Request $request)
{
    $validated = $request->validate([
        'user_id'       => 'required|integer|exists:users,id',
        'warehouse_id'  => 'required|integer|exists:warehouses,id',
        'start_time'    => 'required|date',
        'cash_detail'   => 'required|array',
        'cash_detail.*.money_type'   => 'required',
        'cash_detail.*.money_number' => 'required',
        'cash_detail.*.currency'     => 'required',
        'total_kh'      => 'nullable|numeric',
        'total_usd'     => 'nullable|numeric',
    ]);
    $start_time = Carbon::createFromFormat('m/d/Y, h:i:s A', $request->start_time)->format('Y-m-d H:i:s');

    $openShift = OpenShift::create([
        'user_id'      => $validated['user_id'],
        'warehouse_id' => $validated['warehouse_id'],
        'start_time'   => $start_time,
        'total_kh'     => $validated['total_kh'] ?? null,
        'total_usd'    => $validated['total_usd'] ?? null,
    ]);

    // Save cash_detail items
    foreach ($validated['cash_detail'] as $detail) {
        $openShift->cashDetails()->create([
            'money_type'   => $detail['money_type'],
            'open_shift_id'   => $openShift->id,
            'money_number' => $detail['money_number'],
            'currency'     => $detail['currency'],
        ]);
    }

    return response()->json([
        'message' => 'Shift Opened successfully!',
        'shift'   => $openShift->load('cashDetails') // Optional: load relationship
    ], 201);
}

    
    /**
     * Display the specified resource.
     */
public function show()
{
    $warehouseId = request()->query('warehouse_id');

    $openShift = OpenShift::where('warehouse_id', $warehouseId)
                          ->where('status', 'processing')
                          ->first();

    // if (!$openShift) {
    //     return response()->json(['message' => 'Open shift not found or not processing'], 404);
    // }

    return response()->json([
        'message' => 'Shift Open successfully!',
        'shift' => $openShift
    ], 200);
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
    public function UpdateOpenShift(Request $request, string $id)
    {
        $validated = $request->validate([
            'user_id'       => 'required|integer|exists:users,id',
            'warehouse_id'  => 'required|integer|exists:warehouses,id',
            'start_time'    => 'required|date',
            'initial_cash'  => 'required|numeric',
            'note'          => 'nullable|string',
            
        ]);
    
        $openShift = OpenShift::find($id);
    
        if (!$openShift) {
            return response()->json(['message' => 'Open shift not found'], 404);
        }
    
        $openShift->update($validated);
    
        return response()->json([
            'success' => true,
            'message' => 'Shift updated successfully!',
            'shift'   => $openShift
        ], 200);
    }
    

    /**
     * Remove the specified resource from storage.
     */
    public function destroyOpenShift($id)
    {
        $openShift = OpenShift::find($id);

        if (!$openShift) {
            return response()->json(['message' => 'Open shift not found'], 404);
        }

        $openShift->delete();

        return response()->json(['message' => 'Open shift deleted successfully']);
    }

    public function closeShiftList(){
        return CloseShift::with(['user', 'openShift', 'warehouse'])->get();
    }
    public function AddCloseShift(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'open_shift_id' => 'required|exists:open_shifts,id',
            'end_time' => 'required',
            'total_usd' => 'nullable|numeric',
            'note' => 'nullable|string',
            'warehouse_id' => 'required|exists:warehouses,id',
            'cash_detail'   => 'required|array',
            'cash_detail.*.money_type'   => 'required',
            'cash_detail.*.money_number' => 'required',
            'cash_detail.*.currency'     => 'required',
        ]);
        $end_time = Carbon::createFromFormat('m/d/Y, h:i:s A', $request->end_time)->format('Y-m-d H:i:s');

        try {
            $closeShift = CloseShift::create([
                'user_id' => $validated['user_id'],
                'open_shift_id' => $validated['open_shift_id'],
                'end_time' => $end_time,
                'total_usd' => $validated['total_usd'] ?? null,
                'note' => $validated['note'] ?? null,
                'warehouse_id' => $validated['warehouse_id'],
            ]);

            foreach ($validated['cash_detail'] as $cash) {
                CloseShiftCash::create([
                    'close_shift_id' => $closeShift->id,
                    'money_type'     => $cash['money_type'],
                    'money_number'   => $cash['money_number'],
                    'currency'       => $cash['currency'],
                ]);
            }

            $openShift = OpenShift::find($validated['open_shift_id']);
            if ($openShift) {
                $openShift->status = 'completed';
                $openShift->save();
            }

            return response()->json([
                'success' => true,
                'message' => 'Shift closed successfully!',
                'data' => [
                    'close_shift' => $closeShift,
                    'open_shift' => $openShift,
                ],
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while closing the shift.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }


    public function showCloseShift($id)
    {
        $closeShift = CloseShift::with(['user', 'openShift', 'warehouse'])->find($id);

        if (!$closeShift) {
            return response()->json(['message' => 'Close shift not found'], 404);
        }
        return response()->json(
            ['message'=> 'Shift Close succssfully!',
            'shift'=>$closeShift
        ], 
201);
    }

    public function updateCloseShift(Request $request, $id)
    {
        $closeShift = CloseShift::find($id);

        if (!$closeShift) {
            return response()->json(['message' => 'Close shift not found'], 404);
        }

        $validated = $request->validate([
            'user_id'       => 'sometimes|exists:users,id',
            'shift_id' => 'sometimes|exists:open_shifts,id',
            'end_time'      => 'sometimes|date',
            'final_cash'    => 'sometimes|numeric',
            'total_sale'    => 'sometimes|numeric',
            'note'          => 'nullable|string',
            'warehouse_id'  => 'sometimes|exists:warehouses,id',
        ]);

        $closeShift->update($validated);

        return response()->json(
            ['message'=> 'Shift Close succssfully!',
            'shift'=>$closeShift
        ], 
201);    }

        public function destroyCloseShift($id)
        {
            $closeShift = CloseShift::find($id);

            if (!$closeShift) {
                return response()->json(['message' => 'Close shift not found'], 404);
            }

            $closeShift->delete();

            return response()->json(['message' => 'Close shift deleted successfully']);
        }
}
