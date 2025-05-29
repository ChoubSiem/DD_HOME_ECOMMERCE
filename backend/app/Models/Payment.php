<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Payment extends Model
{
    use HasFactory; use SoftDeletes;

    protected $fillable = ['pos_sale','sale_id','total'];

    protected $dates = ['deleted_at'];
}
