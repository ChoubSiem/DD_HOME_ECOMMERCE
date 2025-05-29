<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UomTransferItem extends Model
{
    use HasFactory;
    protected $fillable = ['uom_transfer_id','source_qty','source_unit_id','destination_product_id','destination_qty','source_product_id','source_after','destination_unit_id'];


    public function transfer()
    {
        return $this->belongsTo(UomTransfer::class, 'uom_transfer_id');
    }
    public function sourceProduct()
    {
        return $this->belongsTo(Product::class, 'source_product_id')->select('id', 'name');
    }
    
    public function destinationProduct()
    {
        return $this->belongsTo(Product::class, 'destination_product_id')->select('id', 'name');
    }
    public function sourceUnit()
    {
        return $this->belongsTo(Unit::class, 'source_unit_id')->select('id', 'name');
    }

    public function destinationUnit()
    {
        return $this->belongsTo(Unit::class, 'destination_unit_id')->select('id', 'name');
    }
    

}
