<?php

namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;

use App\Http\Resources\RolePermissionResource;
use App\Models\Permission;
use App\Models\Role;
use App\Models\RolePermission;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class RolePermissionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
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
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(string $role_id)
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
    public function updatePermissions(Request $request, $id)
    {
        $request->validate([
            'permission_ids' => 'required|array',
            'permission_ids.*' => 'exists:permissions,id',
        ]);
    
        // Use DB facade to avoid triggering model events
        DB::transaction(function () use ($id, $request) {
            // Delete existing permissions
            DB::table('role_permissions')->where('role_id', $id)->delete();
            
            // Insert new permissions
            $permissionsData = array_map(function ($permissionId) use ($id) {
                return [
                    'role_id' => $id,
                    'permission_id' => $permissionId,
                    'created_at' => now(),
                    'updated_at' => now()
                ];
            }, $request->permission_ids);
            
            DB::table('role_permissions')->insert($permissionsData);
        });
    
        return response()->json([
            'message' => 'Permissions updated successfully',
            'permissions' => DB::table('role_permissions')
                             ->where('role_id', $id)
                             ->pluck('permission_id')
        ]);
    }
    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }

    public function get_role_permissions(string $role_id){
        
        try{
            $role_permissions =  RolePermission::where('role_id' , $role_id)
                                            ->with('permission')
                                            ->get();

            $role_permission_collections = RolePermissionResource::collection($role_permissions);
            return response()->json([
                'message'=> 'Role permission get successfully!',
                'role_permissions' => $role_permission_collections
            ],200);

        }catch(Exception $e){
            return response()->json([
                'message'=> 'Something went wrong!',
                'error' => $e->getMessage()
            ],500);
        }
                                            
    }

    public function getRolePermissionByUser()
    {
        try {
            $user_id = Auth::id();
            
            if (!$user_id) {
                return response()->json(['error' => 'Unauthorized'], 401);
            }
    
            $role_permissions = Permission::getPermissionsWithRolesByUserId($user_id);
            
            return $role_permissions; // Make sure to return the result
    
        } catch(Exception $e) {
            // Handle the exception properly
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
