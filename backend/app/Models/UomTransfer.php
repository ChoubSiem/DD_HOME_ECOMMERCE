<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UomTransfer extends Model
{
    use HasFactory;
    protected $fillable = ['id','date', 'transfer_user','warehouse_id'];
    
    public function items()
    {
        return $this->hasMany(UomTransferItem::class);
    }

    public function transfer_user()
    {
        return $this->belongsTo(User::class, 'transfer_user');
    }
    public function warehouse()
    {
        return $this->belongsTo(Warehouse::class);
    }

}
