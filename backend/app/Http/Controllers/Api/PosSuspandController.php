<?php

namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\PosSuspand;
use App\Models\PosSuspandItem;
use App\Models\User;
use App\Models\Warehouse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Termwind\Components\Dd;

class PosSuspandController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $suspendedOrders = PosSuspand::with(['customer', 'warehouse', 'user'])
            ->where('status', 'suspended')
            ->orderBy('suspended_at', 'desc')
            ->paginate(15);

        // return view('pos.suspended.index', compact('suspendedOrders'));
    }

public function getSuspendByWarehouseIdAndShiftId()
{
    $warehouseId = request('warehouse_id');
    $shiftId = request('shift_id');

    $suspendedOrders = PosSuspand::with(['customer', 'warehouse', 'user','items.product'])
        ->where('warehouse_id', $warehouseId)
        ->where('open_shift_id', $shiftId)
        ->where('status', 'suspended')
        ->orderBy('suspended_at', 'desc')
        ->get(); 
    // dd($suspendedOrders);
    return response()->json([
        'suspands' => $suspendedOrders
    ]);
}


    /**
     * Show the form for creating a new suspended order
     */
    public function create()
    {
    //    $suspand = 
    }

    
    public function store(Request $request)
    {
        $validated = $request->validate([
            'customer_id' => 'nullable|exists:users,id',
            'warehouse_id' => 'required|exists:warehouses,id',
            'items' => 'required|array',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|numeric',
            'items.*.discount' => 'required|numeric',
            'items.*.price' => 'required|numeric',
            'subtotal' => 'required|numeric|min:0',
            'tax' => 'required|numeric|min:0',
            'discount' => 'required|numeric|min:0',
            'total' => 'required|numeric|min:0',
            'note' => 'nullable|string|max:500',
            'open_shift_id' => 'nullable|string|max:500',
            'expires_at' => 'nullable|date|after:now'
        ]);
    
        $year = date('Y');
        $prefix = 'SUSP-' . $year . '-';
    
        $lastReference = DB::table('pos_suspends')
            ->where('reference', 'like', $prefix . '%')
            ->orderBy('reference', 'desc')
            ->value('reference');
    
        if ($lastReference) {
            $lastNumber = (int) substr($lastReference, -4); 
            $nextNumber = str_pad($lastNumber + 1, 4, '0', STR_PAD_LEFT);
        } else {
            $nextNumber = '0001';
        }
    
        $reference = $prefix . $nextNumber;
    
        $suspended = PosSuspand::create([
            'customer_id' => $validated['customer_id'],
            'warehouse_id' => $validated['warehouse_id'],
            'user_id' => Auth::id(),
            'reference' => $reference,
            'open_shift_id' => $validated['open_shift_id'],
            'subtotal' => $validated['subtotal'],
            'tax' => $validated['tax'],
            'discount' => $validated['discount'],
            'total' => $validated['total'],
            'note' => $validated['note']??null,
            'expires_at' => $validated['expires_at'] ?? now()->addDays(3),
            'status' => 'suspended',
            'payment_status' => 'pending'
        ]);
    
        foreach ($validated['items'] as $item) {
            PosSuspandItem::create([
                'suspend_id' => $suspended->id,   
                'product_id' => $item['product_id'],
                'quantity' => $item['quantity'],
                'price' => $item['price'],
                'discount' => $item['discount'],
                'total' => $item['quantity'] * $item['price'] * (1 - $item['discount'] / 100),
            ]);
        }
    
        return response()->json([
            'message' => 'Suspend created successfully',
            'suspend' => $suspended
        ]);
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
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $suspend = PosSuspand::find($id);

        if (!$suspend) {
            return response()->json(['message' => 'Suspend not found'], 404);
        }
        PosSuspandItem::where('suspend_id', $id)->delete();
        $suspend->delete();

        return response()->json([
            'message' => 'Suspend deleted successfully',
        ]);
    }



}
