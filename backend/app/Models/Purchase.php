<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Purchase extends Model
{
    protected $fillable = [
        'date', 'reference', 'supplier_id', 'warehouse_id', 'purchaser', 'total', 'approval' , 'note','next_payment_date','payment_status'
    ];

    public function purchaseItems()
    {
        return $this->hasMany(PurchaseItem::class);
    }

    public function payments()
    {
        return $this->hasMany(PurchasePayment::class);
    }

    public function supplier()
    {
        return $this->belongsTo(User::class);
    }

    public function warehouse()
    {
        return $this->belongsTo(Warehouse::class);
    }

    public function purchaser()
    {
        return $this->belongsTo(User::class, 'purchaser');
    }
}