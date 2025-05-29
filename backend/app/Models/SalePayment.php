<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SalePayment extends Model
{
    use HasFactory;

    protected $fillable = ['sale_id','reference_no','date','paid','warehouse_id','payment_method','note','currency','exchange_rate','type'];


public static function getPaymentBySaleId($sale_id)
{
    return self::where('sale_id', $sale_id)
        ->where('type', 'inventory')
        ->select(
            'id',
            'sale_id',
            'reference_no',
            'date',
            'paid',
            'warehouse_id',
            'payment_method',
            'currency',
            'exchange_rate',
            'note',
            'type'
        )
        ->get();
}

}
