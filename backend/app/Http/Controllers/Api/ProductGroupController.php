<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\ProductGroup;

class ProductGroupController extends Controller
{
    public function index()
    {
        $groups = ProductGroup::all();
        return response()->json(
            [
                'groups' => $groups, 'message' => 'Product Groups retrieved successfully'
            ]
        );
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $group = ProductGroup::create([
            'name' => $request->name,
            'description' => $request->description,
        ]);

        return response()->json([
            'group' => $group, 'message' => 'Product Group created successfully'
        ]);
    }

    public function show(string $id)
    {
        $group = ProductGroup::find($id);

        if (!$group) {
            return response()->json(['message' => 'Product Group not found'], 404);
        }

        return response()->json([
            'group' => $group, 'message' => 'Product Group retrieved successfully'
        ]);
    }

    public function update(Request $request, string $id)
    {
        $group = ProductGroup::find($id);

        if (!$group) {
            return response()->json(['message' => 'Product Group not found'], 404);
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $group->update([
            'name' => $request->name,
            'description' => $request->description,
        ]);

        return response()->json(
            [
                "message" => "Product group get successfully",
                "group" => $group
            ],200
        );
    }

    public function destroy(string $id)
    {
        $group = ProductGroup::find($id);

        if (!$group) {
            return response()->json(['message' => 'Product Group not found'], 404);
        }

        $group->delete();

        return response()->json(['message' => 'Product Group deleted']);
    }
}
