<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\PurchaseItem;

class PurchaseItemController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return response()->json([
            "list" => PurchaseItem::all()
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    // public function create()
    // {
    //     //
    // }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // dd($request);
        $validation = $request->validate([
            'purchase_id' => 'required|integer',    
            'product_id' => 'required|exists:users,id',
            'qty' => 'required|integer|min:1',       
            'total_price' => 'required|numeric|min:0', 
            'unit_code' => 'nullable|string|max:10',
            'price' => 'nullable|numeric',

        ]);
        // dd($validation);
            $PurchaseItem = PurchaseItem::create($validation); 
            return response()->json([
                "data" => $PurchaseItem,
                "message" => "Insert success"
            ]);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        return response()->json([
            "purchase" => PurchaseItem::find($id)
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    // public function edit(string $id)
    // {
    //     //
    // }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $validation = $request->validate([
            'purchase_id' => 'required|integer',    
            'product_id' => 'required|exists:users,id',
            'qty' => 'required|integer|min:1',       
            'total_price' => 'required|numeric|min:0', 
            'unit_code' => 'nullable|string|max:10',
            'price' => 'nullable|numeric',
        ]);
            $purchaseItem = PurchaseItem::find($id);
            if(!$purchaseItem){
                return response()->json([
                    "error" => [
                        "delete"=>"Data not found!"
                    ]
                    ]);
            }else{
                $purchaseItem->update($validation);
                return response()->json([
                    "message" => "Update success"
                    ]);
            }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $data = PurchaseItem::find($id);
        if(!$data){
            return response()->json([
                "error" => [
                    "delete"=>"Data not found!"
                ]
                ]);
        }else{
            $data->delete();
            return response()->json([
                "message" => "Delete success"
                ]);
        }
    }
}
