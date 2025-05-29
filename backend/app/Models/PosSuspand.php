<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Warehouse;
use App\Models\User;
use App\Models\PosSuspandItem;

class PosSuspand extends Model
{
    use HasFactory;
    protected $table = 'pos_suspends';

    protected $fillable = [
        'customer_id',
        'warehouse_id',
        'user_id',
        'reference',
        'open_shift_id',
        'subtotal',
        'tax',
        'discount',
        'total',
        'paid',
        'balance',
        'payment_status',
        'payment_method',
        'note',
        'suspended_at',
        'resumed_at',
        'status',
        'created_at',
        'updated_at',
    ];

    public function customer (){
        return $this->belongsTo(User::class,'customer_id');
    }
    public function warehouse (){
        return $this->belongsTo(Warehouse::class,'warehouse_id');
    }
    public function user (){
        return $this->belongsTo(User::class,'user_id');
    }
    public function items()
    {
        return $this->hasMany(PosSuspandItem::class, 'suspend_id', 'id');
    }


}
