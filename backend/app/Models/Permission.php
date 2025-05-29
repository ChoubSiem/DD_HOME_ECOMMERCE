<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class Permission extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'group','is_menu_web' , 'web_route_key'];

    protected $dates = ['deleted_at'];

    public function roles()
    {
        return $this->belongsToMany(Role::class, 'role_permissions');
    }


    public static function getPermissionsWithRolesByUserId($role_id = false){
        $sql = "SELECT p.* 
                FROM permissions p 
                INNER JOIN role_permissions rp ON rp.permission_id = p.id
                INNER JOIN roles r ON r.id = rp.role_id
                WHERE r.id = $role_id;
        
        ";
        return DB::select($sql);
    }
}
