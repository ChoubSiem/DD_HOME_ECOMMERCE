<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Brand; // Make sure to create this model

class BrandController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $brands = Brand::select('id', 'name', 'description')->get();
        return response()->json([
            'message' => "Brand get successfully",
            'brands' => $brands
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100|unique:brands',
            'description' => 'nullable|string|max:255'
        ]);

        $brand = Brand::create($validated);

        return response()->json([
            'message' => 'Brand created successfully',
            'brand' => $brand
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $brand = Brand::select('id', 'name', 'description')->findOrFail($id);
        return response()->json($brand);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $brand = Brand::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:100|unique:brands,name,'.$brand->id,
            'description' => 'nullable|string|max:255'
        ]);

        $brand->update($validated);

        return response()->json([
            'message' => 'Brand updated successfully',
            'brand' => $brand
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $brand = Brand::findOrFail($id);
        $brand->delete();

        return response()->json([
            'message' => 'Brand deleted successfully'
        ]);
    }
}