<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CloseShift extends Model
{
    use HasFactory;
    protected $table = 'close_shift';
    protected $fillable = ['user_id','open_shift_id','end_time','total_usd','total_kh','total_sales','note','warehouse_id'];
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function openShift()
    {
        return $this->belongsTo(OpenShift::class);
    }

    public function warehouse()
    {
        return $this->belongsTo(Warehouse::class);
    }


}
