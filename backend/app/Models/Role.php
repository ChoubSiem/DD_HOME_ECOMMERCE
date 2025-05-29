<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class Role extends Model
{
    use HasFactory; 

    protected $fillable = ['name'];
    

    public function users()
    {
        return $this->belongsToMany(User::class, 'user_roles', 'role_id', 'user_id');
    }

    public function parentRoles()
    {
        return $this->belongsToMany(Role::class, 'role_hierarchies', 'child_id', 'parent_id');
    }

    public function childRoles()
    {
        return $this->belongsToMany(Role::class, 'role_hierarchies', 'parent_id', 'child_id');
    }
    

    public function permissions()
    {
        return $this->belongsToMany(Permission::class, 'role_permissions');
    }

 public static function getRoles()
{
    try {
        $roles = Role::withCount('users') 
        ->get();
    

        return $roles;
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Failed to fetch roles',
            'error' => $e->getMessage()
        ], 500);
    }
}

public static function countUserByRoleId($role_id){

}
public static function getRoleIdByName($name)
{
    $role = Role::where('name', $name)->first();
    return $role ? $role->id : null;
}




    
    
}
