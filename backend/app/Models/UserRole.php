<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserRole extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 
        'role_id',
    ];


    // public static function getRoleByUserId(string $user_id){
    //     if(!$user_id){
    //         return false;
    //     }

    //     $sql = UserRole::query();
    //     $sql->
    // }

    public static function getRoleByUserId($user_id)
    {
        return UserRole::where('user_id', $user_id)
            ->first(); 
    }
}
