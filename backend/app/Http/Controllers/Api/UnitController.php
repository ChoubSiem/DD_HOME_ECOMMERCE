<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Unit; // Assuming you have a Unit model

class UnitController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $units = Unit::select('id','code', 'name')->get();
        return response()->json([
            'message' => 'Unit get successfully!',
            'units' => $units
        ],200);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|string|max:50|unique:units',
            'name' => 'required|string|max:100'
        ]);

        $unit = Unit::create($validated);

        return response()->json([
            'message' => 'Unit created successfully',
            'unit' => $unit
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $unit = Unit::select('code', 'name')->findOrFail($id);
        return response()->json($unit);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $unit = Unit::findOrFail($id);

        $validated = $request->validate([
            'code' => 'sometimes|string|max:50|unique:units,code,'.$unit->id,
            'name' => 'sometimes|string|max:100'
        ]);

        $unit->update($validated);

        return response()->json([
            'message' => 'Unit updated successfully',
            'unit' => $unit
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy( $id)
    {
        $unit = Unit::findOrFail($id);
        $unit->delete();
        return response()->json([
            'message' => 'Unit deleted successfully'
        ]);
    }
}