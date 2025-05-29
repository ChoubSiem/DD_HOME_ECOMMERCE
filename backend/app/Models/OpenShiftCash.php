<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OpenShiftCash extends Model
{
    use HasFactory;

    protected $fillable = ['open_shift_id','money_type','money_number','currency'];


    public function open_shift(){
        return $this->belongsTo(OpenShift::class);
    }
}
