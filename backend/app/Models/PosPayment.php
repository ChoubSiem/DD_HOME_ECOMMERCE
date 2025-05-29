<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PosPayment extends Model
{
    use HasFactory;
    protected $fillable = ['pos_sale_id','reference','date','amount','warehouse_id','note','currency','exchange_rate'];


    
}
