<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\CustomerGroup;
use Illuminate\Support\Facades\Validator;

class CustomerGroupController extends Controller
{
    /**
     * Display a listing of customer groups
     */
    public function index()
    {
        $customerGroups = CustomerGroup::select('id', 'name', 'code', 'description')->get();
        
        return response()->json([
            'success' => true,
            'groups' => $customerGroups,
            'message' => 'Customer groups retrieved successfully'
        ]);
    }


    /**
     * Store a newly created customer group
     */
    public function addCustomerGroup(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:100|unique:customer_groups',
            'code' => 'nullable|string|max:50|unique:customer_groups',
            'description' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
                'message' => 'Validation failed'
            ], 422);
        }

        $customerGroup = CustomerGroup::create([
            'name' => $request->name,
            'code' => $request->code,
            'description' => $request->description,
        ]);

        return response()->json([
            'success' => true,
            'data' => $customerGroup,
            'message' => 'Customer group created successfully'
        ], 201);
    }

    /**
     * Display the specified customer group
     */
    public function show($id)
    {
        try {
            $customerGroup = CustomerGroup::with('warehouse')
                ->select('id', 'name', 'active', 'warehouse_id', 'code', 'description')
                ->findOrFail($id);
                
            return response()->json([
                'success' => true,
                'data' => $customerGroup,
                'message' => 'Customer group retrieved successfully'
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Customer group not found'
            ], 404);
        }
    }

    /**
     * Update the specified customer group
     */
    public function update(Request $request, $id)
    {
        try {
            $customerGroup = CustomerGroup::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'name' => 'sometimes|string|max:100|unique:customer_groups,name,'.$customerGroup->id,
                'code' => 'sometimes|string|max:50|unique:customer_groups,code,'.$customerGroup->id,
                'description' => 'nullable|string',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'errors' => $validator->errors(),
                    'message' => 'Validation failed'
                ], 422);
            }

            $customerGroup->update($request->all());

            return response()->json([
                'success' => true,
                'data' => $customerGroup,
                'message' => 'Customer group updated successfully'
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Customer group not found'
            ], 404);
        }
    }

    /**
     * Remove the specified customer group
     */
    public function destroy($id)
    {
        try {
            $customerGroup = CustomerGroup::findOrFail($id);
            $customerGroup->delete();

            return response()->json([
                'success' => true,
                'message' => 'Customer group deleted successfully'
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Customer group not found'
            ], 404);
        }
    }

    /**
     * Activate/deactivate customer group
     */
    public function toggleStatus($id)
    {
        try {
            $customerGroup = CustomerGroup::findOrFail($id);
            $customerGroup->update(['active' => !$customerGroup->active]);

            return response()->json([
                'success' => true,
                'data' => [
                    'active' => $customerGroup->active
                ],
                'message' => 'Customer group status updated'
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Customer group not found'
            ], 404);
        }
    }

    /**
     * Alternative store method (kept for backward compatibility)
     */
    // public function addCustomerGroup(Request $request)
    // {
    //     return $this->store($request);
    // }
}