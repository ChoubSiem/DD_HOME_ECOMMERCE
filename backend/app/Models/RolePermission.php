<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class RolePermission extends Model
{
    use HasFactory; use SoftDeletes ; 

    protected $guarded = ['id'];
    protected $fillable = ['role_id','permission_id'];
    protected $dates = ['deleted_at'];


    public function roles() {
        return $this->belongsToMany(Role::class,'role_id');
    }
    public function permissions() {
        return $this->belongsToMany(Permission::class,'permission_id');
    }
}
