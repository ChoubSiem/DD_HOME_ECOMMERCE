<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Arr;

class WarehouseProduct extends Model
{
    use HasFactory; use SoftDeletes ;
    protected $fillable = ['product_id','warehouse_id','qty','cost','price','is_active','unit','vip_price','depot_price','dealer_price','deleted_at'];

    public function warehouse()
    {
        return $this->belongsTo(Warehouse::class);
    }
    
    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public static function checkProductById( $product_id,  $warehouse_id): bool
    {
        return WarehouseProduct::where('product_id', $product_id)
                               ->where('warehouse_id', $warehouse_id)
                               ->exists();
    }

    public static function getProductWarehouseData($product_id, $warehouse_id)
    {
        $product = WarehouseProduct::where('product_id', $product_id)
                                ->where('warehouse_id', $warehouse_id)
                                ->whereNull('deleted_at')
                                ->first();

        if ($product) {
            return [
                'exists' => true,
                'product_id' => $product->product_id,
                'warehouse_id' => $product->warehouse_id,
                'quantity' => $product->quantity,
                'cost' => $product->cost,
                'price' => $product->price,
            ];
        }

        return false ;
    }

    public static function updateProductPriceByWarehouse(array $data , $id){
        $product = self::find($id);

        if (!$product) {
            return false; 
        }

        $product->retail_price = $data['price'] ?? $product->retail_price;
        $product->price = $data['price'] ?? $product->retail_price;
        $product->vip_price = $data['vip_price'] ?? $product->vip_price;
        $product->depot_price = $data['depot_price'] ?? $product->depot_price;
        $product->dealer_price = $data['dealer_price'] ?? $product->dealer_price;

        $product->save();

        return $product;

    }

    
}
