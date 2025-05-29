<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\PriceGroup;

class PriceGroupController extends Controller
{
    /**
     * Display a listing of price groups
     */
    public function index()
    {
        $priceGroups = PriceGroup::with('warehouse')
            ->select('id', 'name', 'new_price', 'warehouse_id')
            ->get();
            
        return response()->json($priceGroups);
    }

    /**
     * Store a newly created price group
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100|unique:price_groups',
            'new_price' => 'required|numeric|min:0',
            'warehouse_id' => 'required|exists:warehouses,id'
        ]);

        $priceGroup = PriceGroup::create($validated);

        return response()->json([
            'message' => 'Price group created successfully',
            'price_group' => $priceGroup
        ], 201);
    }

    /**
     * Display the specified price group
     */
    public function show($id)
    {
        $priceGroup = PriceGroup::with('warehouse')
            ->select('id', 'name', 'new_price', 'warehouse_id')
            ->findOrFail($id);
            
        return response()->json($priceGroup);
    }

    /**
     * Update the specified price group
     */
    public function update(Request $request, $id)
    {
        $priceGroup = PriceGroup::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:100|unique:price_groups,name,'.$priceGroup->id,
            'new_price' => 'sometimes|numeric|min:0',
            'warehouse_id' => 'sometimes|exists:warehouses,id'
        ]);

        $priceGroup->update($validated);

        return response()->json([
            'message' => 'Price group updated successfully',
            'price_group' => $priceGroup
        ]);
    }

    /**
     * Remove the specified price group
     */
    public function destroy($id)
    {
        $priceGroup = PriceGroup::findOrFail($id);
        $priceGroup->delete();

        return response()->json([
            'message' => 'Price group deleted successfully'
        ]);
    }
}