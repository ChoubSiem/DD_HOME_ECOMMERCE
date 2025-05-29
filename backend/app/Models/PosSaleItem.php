<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Product;
class PosSaleItem extends Model
{
    use HasFactory;

    protected $fillable = ['pos_sale_id','product_id','price','cost','discount','total','qty'];

    public function product()
    {
        return $this->belongsTo(Product::class, 'product_id');
    }
    
}
