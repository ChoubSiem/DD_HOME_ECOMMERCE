<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AdjustmentItem extends Model
{
    protected $fillable = [
        'id','adjustment_id', 'product_id', 'qty', 'unit','operation'
    ];

    public function adjustment(): BelongsTo
    {
        return $this->belongsTo(Adjustment::class);
    }
    public function product()
    {
        return $this->belongsTo(Product::class);
    }
    public function stock()
    {
        return $this->hasOne(Stock::class, 'product_id', 'product_id');
    }
    public function productUnit()
    {
        return $this->belongsTo(ProductUnit::class);
    }
    

}