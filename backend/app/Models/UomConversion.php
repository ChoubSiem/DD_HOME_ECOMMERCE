<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UomConversion extends Model
{
    use HasFactory;
    protected $fillable = ['id' , 'from_unit','to_unit' , 'conversion_rate' , 'description'];

    public function fromUnit()
    {
        return $this->belongsTo(Unit::class, 'from_unit')->select('id', 'name');
    }
    
    public function toUnit()
    {
        return $this->belongsTo(Unit::class, 'to_unit')->select('id', 'name');
    }
}
