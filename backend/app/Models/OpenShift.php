<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OpenShift extends Model
{
    use HasFactory;
    protected $fillable = [
        'user_id',
        'warehouse_id',
        'start_time',
        'total_kh',
        'total_usd',
        'note',
        'status'
        
    ];    
    public function salesperson()
    {
        return $this->belongsTo(User::class,'user_id');
    }
    public function user()
    {
        return $this->belongsTo(User::class);
    }
    
    public function warehouse()
    {
        return $this->belongsTo(Warehouse::class);
    }
    public function closeShift() {
        return $this->hasOne(CloseShift::class, 'open_shift_id');
    }
    public function posSales()
    {
        return $this->hasMany(PosSale::class,'shift_id','id');
    }

    public static function getShiftById($shift_id) {
        return self::where('id', $shift_id)->
        first();
    }
    public function cashDetails()
    {
        return $this->hasMany(OpenShiftCash::class, 'open_shift_id');
    }

    
}
