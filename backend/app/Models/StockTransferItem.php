<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StockTransferItem extends Model
{
    use HasFactory;

    protected $fillable = [
       'product_id','quantity','stock_transfer_id'
    ];

    public function product()
    {
        return $this->belongsTo(Product::class, 'product_id');
    }

    


}
