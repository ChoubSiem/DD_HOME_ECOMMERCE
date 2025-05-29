<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CloseShiftCash extends Model
{
    use HasFactory;

    protected $fillable = ['close_shift_id' ,'money_type' , 'money_number','currency'];
}
