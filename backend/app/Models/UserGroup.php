<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserGroup extends Model
{
    use HasFactory; use SoftDeletes ; 

    protected $guarded = ['id'];
    protected $fillable = ['name'];
    protected $dates = ['deleted_at'];


    public function users(){
        return $this->hasMany(User::class);
    }
}
