<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Sale extends Model
{
    use HasFactory;
    
    protected $fillable = ['tax', 'discount', 'total', 'customer_id', 'sale_person', 'date','warehouse_id','payment_status','next_payment_date','next_payment_amount','paid','note','reference','is_warehouse','discount_type','subtotal'];


    public function items()
    {
        return $this->hasMany(SaleItem::class);
    }

    public function payments()
    {
        return $this->hasMany(SalePayment::class);
    }
    public function customer()
    {
        return $this->belongsTo(User::class,'customer_id');
    }
    public function saleman()
    {
        return $this->belongsTo(User::class,'saleman');
    }
    public function posSales()
    {
        return $this->hasMany(PosSale::class, 'shift_id'); 
    }
    public function warehouse(){
        return $this->belongsTo(Warehouse::class ,'warehouse_id');
    }

    public static function getSaleById($sale_id) {
        return self::where('id', $sale_id)->with('items', 'customer', 'saleman', 'payments')->first();

    }
public static function getSaleInventoryById($saleId) {
    

}

}
