<?php

namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;

use App\Http\Resources\PermissionResource;
use App\Models\Permission;
use Exception;
use Illuminate\Http\Request;

class PermissionController extends Controller
{
    /**
     * Display a listing of the resource.
     */

    public function index()
    {
        try{
            $permission = Permission::all();
            return response()->json([
                'message' => 'List permission get successfully!',
                'permissions' => $permission
            ],200);
        }catch(Exception $e){
            return response()->json([
                'message' => 'Something went wrong!',
                'error' => $e->getMessage()
            ],500);
        }

    }

    public static function get_role_permissions ($role_id)
    {
        if (!$role_id) {
            return response()->json(['error' => 'role_id is required'], 400);
        }
        try {
            $role_permissions = Permission::getPermissionsWithRolesByUserId($role_id);
            return $role_permissions;
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
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
    // public function store(Request $request)
    // {
    //     try{
    //         $request->validate([
    //             'name'=>'required|string',
    //         ]);
    
    //         $permission = Permission::create([
    //             'name'=> $request->name
    //         ]);
    
    //         $permission_collection = PermissionResource::collection($permission);
    //         return response()->json([
    //             'message' => 'Permission created successfully!',
    //             'permission' => $permission_collection
    //         ],200);
    //     }catch(Exception $e){
    //         return response()->json([
    //             'message' => 'Something went wrong!',
    //             'error' => $e->getMessage()
    //         ],500);
    //     }
    // }

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
        try{

            $permission = Permission::findOrfail($id);
            return response()->json([
                'message' => 'Permission get successfully!',
                'permission' => $permission
            ],200);

        }catch(Exception $e){
            return response()->json([
                'message' => 'Something went wrong!',
                'error' => $e->getMessage()
            ],500);
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
            ]);
    
            $permission = Permission::findOrFail($id);
            $permission->update([
                'name' => $request->name,
            ]);
    
            return response()->json([
                'message' => 'Permission updated successfully',
                'permission' => $permission
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
    public function destroy(string $id)
    {
        try {
            $permission = Permission::findOrFail($id);
            $permission->delete();
    
            return response()->json([
                'message' => 'Permission deleted successfully',
            ], 200);
    
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Something went wrong',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
