<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;
    
    protected $fillable = [
        'name',
        'barcode',
        'code',
        'category_id',
        'cost',
        'price',
        'description',
        'alert_qty',
        'documents',
        'units',
        'product_group_id',
        'brand_id',
        'status',
        'retail_price',
        'vip_price',
        'depot_price',
        'dealer_price',
        'is_draft'
    ];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }
    public function warehouseProducts()
    {
        return $this->hasMany(WarehouseProduct::class);
    }
    public function productUnit()
    {
        return $this->hasMany(ProductUnit::class);
    }
        public function stocks()
    {
        return $this->hasMany(Stock::class);
    }
    public function units()
    {
        return $this->belongsToMany(Unit::class, 'product_units', 'product_id', 'unit_id');
    }

    public static function create_product(array $data)
    {
        return self::create([
            'name' => $data['name'],
            'code' => $data['code'],
            'barcode' => $data['barcode']??null,
            'category_id' => $data['category_id']??null,
            'cost' => $data['cost']??null,
            'price' => $data['price']??null,
            'description' => $data['description'] ?? null,
            'alert_qty' => $data['alert_qty'] ?? 0,
            'status' => $data['status']??1,
            'product_group_id' => $data['product_group_id']??null,
            'is_draft' => $data['is_draft'],
            'brand_id' => $data['brand_id']??null,
            'retail_price' =>$data["retail_price"],
            'vip_price' =>$data["vip_price"],
            'depot_price' =>$data["depot_price"],
            'dealer_price' =>$data["dealer_price"]
        ]);
    }
    public static function import_product(array $data)
    {
        return self::create([
            'name' => $data['name'],
            'code' => $data['code'],
            'barcode' => $data['barcode']??null,
            'category_id' => $data['category_id']??null,
            'cost' => $data['cost']??null,
            'price' => $data['price']??null,
            'description' => $data['description'] ?? null,
            'alert_qty' => $data['alert_qty'] ?? 0,
            'status' => $data['status']??1,
            'product_group_id' => $data['product_group_id']??null,
            'is_draft' => $data['is_draft'],
            'brand_id' => $data['brand_id']??null,
            'retail_price' =>$data["retail_price"]??null,
            'vip_price' =>$data["vip_price"]??null,
            'depot_price' =>$data["depot_price"]??null,
            'dealer_price' =>$data["dealer_price"]??null
        ]);
    }

    public static function getProductById($productId){
        return self::find($productId);
    }


    public static function importToUpdateProductPriceByCode(array $data)
    {
        $product = self::where('code', $data['code'])->first();

        if (!$product) {
            return false; 
        }

        $product->retail_price = $data['retail_price'] ?? $product->retail_price;
        $product->price = $data['price'] ?? $product->price;
        $product->vip_price = $data['vip_price'] ?? $product->vip_price;
        $product->depot_price = $data['depot_price'] ?? $product->depot_price;
        $product->dealer_price = $data['dealer_price'] ?? $product->dealer_price;

        $product->save();

        return $product;
    }





    

    
}
