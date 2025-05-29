<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StockMove extends Model
{
    use HasFactory;

    protected $fillable = ['product_id','warehouse_id','quantity','type','date','base_unit','adjust_id','uom_id','stock_id','reference_id','movement_type'];
}
