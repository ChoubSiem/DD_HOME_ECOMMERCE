<?php

namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;

use App\Http\Resources\RoleResource;
use App\Models\Role;
use Illuminate\Http\Request;

class RoleController extends Controller
{
    /**
     * Display a listing of the resource.
     */

     public function __construct(){
        // $this->middleware('permission:Role.view')->only(['index']);
     }
    public function index()
    {
        try {
            $roles = Role::withCount('users')->get();
    
            return response()->json([
                'success' => true,
                'message' => 'Roles retrieved successfully.',
                'roles' => $roles
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch roles',
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
                'name'=>'required|max:255'
            ]);
            $role = Role::create([
                'name' => $request->name
            ]);
    
            return response()->json([
                'message'=> 'Role created successfully',
                'role' => $role,
            ],200);
        }catch(\Exception $e){
            return response()->json([
                'message' => 'Something went wrong!',
            ],500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $rolePermission = Role::with("permissions")->findOrFail($id);
        return response()->json([
            'message' => "Role Permission get successfully!",
            "rolePermission" => $rolePermission
        ],200);
    }
    public function getRolePermissions()
    {
        $rolePermissions = Role::with("permissions")->get();
        return response()->json([
            'message' => "Role Permission get successfully!",
            "rolePermissions" => $rolePermissions
        ],200);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        try {
            $role = Role::findOrFail($id);
    
            return response()->json([
                'message' => 'Role retrieved successfully',
                'role' => $role
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
                'name' => 'string|max:255'
            ]);
    
            $role = Role::findOrFail($id);
            $role->update([
                'name' => $request->name,
            ]);
    
            return response()->json([
                'message' => 'Role updated successfully',
                'role' => $role
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
            $role= Role::findOrFail($id);
            $role->delete();
    
            return response()->json([
                'message' => 'Role deleted successfully',
                'role' =>$role
            ], 200);
    
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Something went wrong',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
