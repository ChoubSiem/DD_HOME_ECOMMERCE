<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

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


    public function get_product_detail_by_id($warehouse_id = false, $product_id = false)
    {
        try {
            if (!$product_id) {
                return response()->json([
                    'message' => 'Product ID is required',
                ], 400);
            }

            $query = Product::select([
                'products.id',
                'products.name',
                'products.code',
                'products.description',
                'products.alert_qty',
                'products.status',
                'products.is_draft',
                DB::raw(
                    is_null($warehouse_id)
                        ? "(SELECT IFNULL(SUM(stocks.quantity), 0) FROM stocks WHERE stocks.product_id = products.id AND stocks.warehouse_id IS NULL) as total_stock"
                        : "(SELECT IFNULL(SUM(stocks.quantity), 0) FROM stocks WHERE stocks.product_id = products.id AND stocks.warehouse_id = {$warehouse_id}) as total_stock"
                ),
                $warehouse_id ? 'warehouse_products.price as price' : 'products.price as price',
                $warehouse_id ? 'warehouse_products.cost as cost' : 'products.cost as cost',
                $warehouse_id ? 'warehouse_products.retail_price as retail_price' : 'products.retail_price as retail_price',
                $warehouse_id ? 'warehouse_products.dealer_price as dealer_price' : 'products.dealer_price as dealer_price',
                $warehouse_id ? 'warehouse_products.vip_price as vip_price' : 'products.vip_price as vip_price',
                $warehouse_id ? 'warehouse_products.depot_price as depot_price' : 'products.depot_price as depot_price',

                DB::raw('(SELECT code FROM units WHERE id = (SELECT unit_id FROM product_units WHERE product_id = products.id LIMIT 1)) as unit_code'),
                DB::raw('(SELECT name FROM categories WHERE id = products.category_id) as category_name'),
                DB::raw('(SELECT name FROM product_groups WHERE id = products.product_group_id) as product_group_name'),
                DB::raw('(SELECT name FROM brands WHERE id = products.brand_id) as brand_name'),
                DB::raw('(SELECT GROUP_CONCAT(name) FROM product_images WHERE product_id = products.id) as images')
            ])
            ->where('products.id', $product_id);

            if ($warehouse_id) {
                $query->join('warehouse_products', function ($join) use ($warehouse_id) {
                    $join->on('warehouse_products.product_id', '=', 'products.id')
                        ->where('warehouse_products.warehouse_id', $warehouse_id)
                        ->whereNull('warehouse_products.deleted_at');
                });
            }

            $product = $query->first();

            if (!$product) {
                return response()->json([
                    'message' => 'Product not found',
                ], 404);
            }

            $product->images = $product->images ? explode(',', $product->images) : [];
            $product->stock = $product->total_stock;
            unset($product->total_stock);

            return response()->json([
                'message' => 'Product fetched successfully',
                'product' => $product,
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to fetch product',
                'error' => $e->getMessage(),
            ], 500);
        }
    }






    

    
}
