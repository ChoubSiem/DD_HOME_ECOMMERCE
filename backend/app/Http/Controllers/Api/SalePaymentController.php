<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PosSale;
use App\Models\Sale;
use App\Models\SalePayment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class SalePaymentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        try {
            $payments = SalePayment::with('posSale', 'warehouse')->get();
            return response()->json([
                'success' => true,
                'data' => $payments
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve payments: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
 public function store(Request $request)
{
    $validator = Validator::make($request->all(), [
        'sale_id' => 'required|exists:sales,id',
        'reference_no' => 'required|string|max:255|unique:sale_payments',
        'date' => 'required|date',
        'paid' => 'required|numeric|min:0',
        'warehouse_id' => 'required|exists:warehouses,id',
        'payment_method' => 'required',
        'note' => 'nullable|string',
        'currency' => 'nullable',
        'type' => 'inventory'
    ]);

    $data = [
        'sale_id' => $request->sale_id,
        'reference_no' => $request->reference_no,
        'date' => $request->date,
        'paid' => $request->paid,
        'warehouse_id' => $request->warehouse_id,
        'payment_method' => $request->payment_method,
        'note' => $request->note,
        'currency' => $request->currency,
        'type' => 'inventory'

    ];

    if ($validator->fails()) {
        return response()->json([
            'success' => false,
            'errors' => $validator->errors()
        ], 422);
    }

    try {
        DB::beginTransaction();

        $sale = Sale::findOrFail($request->sale_id);
        $existingPayments = SalePayment::where('sale_id', $request->sale_id)
            ->where('type', 'inventory')
            ->sum('paid');

        $totalPaid = $existingPayments + $request->paid;
        // dd($$existingPayments);
        
        $grandTotal = floatval($sale->total); 
// dd('totalPaid: ' . $totalPaid, 'grandTotal: ' . $grandTotal);
        $payment = SalePayment::create($data);
        if (number_format($totalPaid, 2) == number_format($grandTotal, 2)) {
            $sale->payment_status = 'paid';
        } 
        elseif ($totalPaid > 0 && $totalPaid < $grandTotal) {
            $sale->payment_status = 'partial';
        }
        elseif ($totalPaid > $grandTotal) {
            $sale->payment_status = 'due';
        }
        
        else {
            $sale->payment_status = 'pending';
        }

        $sale->paid = $totalPaid;
        $sale->save();

        // dd($sale);
        DB::commit();

        return response()->json([
            'success' => true,
            'data' => $payment,
            'message' => 'Payment created successfully',
            'sale_status' => $sale->status 
        ], 201);

    } catch (\Exception $e) {
        DB::rollBack();
        return response()->json([
            'success' => false,
            'message' => 'Failed to create payment: ' . $e->getMessage()
        ], 500);
    }
}

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        try {
            $payment = SalePayment::with('posSale', 'warehouse')->find($id);
            
            if (!$payment) {
                return response()->json([
                    'success' => false,
                    'message' => 'Payment not found'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $payment
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve payment: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $validator = Validator::make($request->all(), [
            'sale_id' => 'sometimes|required|exists:pos_sales,id',
            'reference_no' => 'sometimes|required|string|max:255|unique:sale_payments,reference_no,' . $id,
            'date' => 'sometimes|required|date',
            'paid' => 'sometimes|required|numeric|min:0',
            'warehouse_id' => 'sometimes|required|exists:warehouses,id',
            'payment_types' => 'sometimes|required|string|in:cash,credit,card,mobile,bank',
            'note' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $payment = SalePayment::find($id);
            
            if (!$payment) {
                return response()->json([
                    'success' => false,
                    'message' => 'Payment not found'
                ], 404);
            }

            $payment->update($request->all());
            
            return response()->json([
                'success' => true,
                'data' => $payment,
                'message' => 'Payment updated successfully'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update payment: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        try {
            $payment = SalePayment::find($id);
            
            if (!$payment) {
                return response()->json([
                    'success' => false,
                    'message' => 'Payment not found'
                ], 404);
            }

            $payment->delete();
            
            return response()->json([
                'success' => true,
                'message' => 'Payment deleted successfully'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete payment: ' . $e->getMessage()
            ], 500);
        }
    }

public function getPaymentBySaleId($sale_id)
{
    try {
        $sale_payments = SalePayment::getPaymentBySaleId($sale_id);
        // dd($sale_id);
        return response()->json([
            'success' => true,
            'data' => $sale_payments,
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Failed to get sale payments',
            'error' => config('app.debug') ? $e->getMessage() : 'Internal Server Error',
        ], 500);
    }
}

}