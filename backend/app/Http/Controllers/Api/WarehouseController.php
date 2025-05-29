<?php

namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;

use App\Http\Resources\WarehouseResource;
use App\Models\User;
use App\Models\Warehouse;
use Exception;
use Illuminate\Http\Request;

class WarehouseController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        try {
            $warehouses = Warehouse::getWarehouses();
            
            return response()->json([
                "success" => true,
                "message" => "All warehouses retrieved",
                "warehouses" => $warehouses
            ]);
    
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => "Failed to retrieve warehouses",
                'error' => $e->getMessage()
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
    public function store(Request $request)
    {
        try{

            $request->validate([
                'name'=>'required|max:255',
                'regional_id' => 'required|exists:regionals,id',
                'manager_id' => 'required|exists:users,id'
            ]);
            $warehouse = Warehouse::create([
                'name' => $request->name,
                'region_id' => $request->regional_id ,
                'phone' => $request->phone ,
                'address' => $request->address ,
                'manager_id' => $request->manager_id ,
            ]);
    
            return response()->json([
                'message'=> 'Warehouse created successfully',
                'warehouse' => $warehouse,
            ],200);
        }catch(\Exception $e){
            return response()->json([
                'message' => 'Something went wrong!',
                'error' => $e->getMessage()
            ],500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        try {
            $warehouse = Warehouse::findOrFail($id);
    
            return response()->json([
                'message' => 'Warehouse retrieved successfully',
                'warehouse' => $warehouse
            ], 200);
    
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Something went wrong',
                'error' => $e->getMessage()
            ], 500);
        }        
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        try {
            $warehouse = Warehouse::findOrFail($id);
    
            return response()->json([
                'message' => 'Warehouse retrieved successfully',
                'warehouse' => $warehouse
            ], 200);
    
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Something went wrong',
                'error' => $e->getMessage()
            ], 500);
        }        
    }
    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        try {
            $request->validate([
                'name' => 'string|max:255',
                'region_id' => 'required|exists:regionals,id',
            ]);
    
            $warehouse = Warehouse::findOrFail($id);
            $warehouse->update([
                'name' => $request->name,
                'region_id' => $request->region_id ,
                'phone' => $request->phone ,
                'address' => $request->address ,
                'manager_id' => $request->manager_id ,
            ]);
    
            return response()->json([
                'message' => 'Warehouse updated successfully',
                'warehouse' => $warehouse
            ], 200);
    
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Something went wrong',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        try {
            $warehouse = Warehouse::findOrFail($id);
            $warehouse->delete();
    
            return response()->json([
                'message' => 'Warehouse deleted successfully',
            ], 200);
    
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Something went wrong',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getWarehouseIdByUserId($userId)
    {
        try {
            $user = User::select('warehouse_id')->where('id' , $userId);
            
            if (!$user) {
                throw new \Exception("User not found");
            }
            
            return $user;
            
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Something went wrong!',
                'error' => $e->getMessage()
            ]);
        }
    }
}
