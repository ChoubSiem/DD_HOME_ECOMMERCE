<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class StockTransfer extends Model
{
    use HasFactory;

    protected $fillable = ['from_warehouse_id','to_warehouse_id','date','reference_no','note','transfer_user'];

    public function items(): HasMany
    {
        return $this->hasMany(StockTransferItem::class);
    }

    public function user(){
        return $this->belongsTo(User::class);
    }
    public function tranferUser()
    {
        return $this->belongsTo(User::class, 'transfer_user', 'id');
    }
    public function toWarehouse()
    {
        return $this->belongsTo(Warehouse::class, 'to_warehouse_id', 'id');
    }
    public function fromWarehouse()
    {
        return $this->belongsTo(Warehouse::class, 'from_warehouse_id', 'id');
    }
}
