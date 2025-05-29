<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Adjustment extends Model
{
    protected $fillable = [
        'id','date', 'reference', 'adjuster', 'note','warehouse_id','status','adjust_id','uom_id','stock_id'
    ];

    public function items(): HasMany
    {
        return $this->hasMany(AdjustmentItem::class);
    }
    public function user(){
        return $this->belongsTo(User::class);
    }
    public function adjuster()
    {
        return $this->belongsTo(User::class, 'adjuster', 'id');
    }
}