<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SaleItem extends Model
{
    use HasFactory;

    protected $fillable = ['sale_id','product_id','price','cost','discount','total','qty','subtotal'];

    public function product()
    {
        return $this->belongsTo(Product::class, 'product_id');
    }
}
