<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Product;
use App\Models\PosSuspand;
class PosSuspandItem extends Model
{
    use HasFactory;
    protected $table = 'suspend_items';

    protected $fillable = [
        'suspend_id',
        'product_id',
        'price',
        'quantity',
        'discount',
        'tax_rate',
        'updated_at'
    ];

    public function product(){
        return $this->belongsTo(Product::class);
    }
    public function suspand(){
        return $this->belongsTo(PosSuspand::class);
    }
}
