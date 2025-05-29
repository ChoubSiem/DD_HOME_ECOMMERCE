<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\User;
use App\Models\SalePayment;
use App\Models\PosSaleItem;
use PhpParser\Node\Expr\FuncCall;

class PosSale extends Model
{
    use HasFactory;

    protected $fillable = ['tax', 'discount', 'total', 'customer_id', 'saleman_id', 'date','warehouse_id','shift_id','status','next_payment_date','next_payment_amount','paid','reference'];

    public function items()
    {
        return $this->hasMany(PosSaleItem::class ,'pos_sale_id');
    }

    public function posPayments()
    {
        return $this->hasMany(SalePayment::class, 'sale_id', 'id')
                    ->where('type', 'pos');
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

    public static function getSaleById($sale_id) {
        return self::where('id', $sale_id)->with('items', 'customer', 'saleman', 'payments')->first();

    }


}
