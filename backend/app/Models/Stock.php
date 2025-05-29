<?php

namespace App\Models;

use Illuminate\Database\Console\Migrations\StatusCommand;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Stock extends Model
{
    use HasFactory;
    protected $table = 'stocks';
    protected $fillable = [
        'product_id',
        'warehouse_id',
        'quantity',
        'cost',
        'price',
        'adjust_id',
        'uom_id',
        'stock_id'
    ];

    public $timestamps = true;

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function warehouse()
    {
        return $this->belongsTo(Warehouse::class);
    }


    public static function add_stock_product($product_id, $warehouse_id = false, $quantity )
    {
        if ($quantity < 0) {
            return response()->json([
                'message' => 'Quantity must be a positive number.',
            ], 400);
        }

        $stock = Stock::where('product_id', $product_id)
            ->where('warehouse_id', $warehouse_id)
            ->first();

        if ($stock) {
            $stock->quantity += $quantity; 
            $stock->save();

            return response()->json([
                'message' => 'Stock quantity updated successfully.',
                'stock' => $stock,
            ], 200);
        } else {
            $newStock = Stock::create([
                'product_id' => $product_id,
                'warehouse_id' => $warehouse_id,
                'quantity' => $quantity,
            ]);

            return response()->json([
                'message' => 'Stock added successfully.',
                'stock' => $newStock,
            ], 201);
        }
    }

    public static function adjustStock($productId, $warehouseId, $quantityChange)
        {
            $stock = Stock::firstOrNew([
                'product_id' => $productId,
                'warehouse_id' => $warehouseId
            ]);
            
            $stock->quantity = max($stock->quantity + $quantityChange, 0);
            $stock->save();
        }


    public static function getStock($product_id, $warehouse_id = false)
        {
            $stock = Stock::where('product_id', $product_id)
                        ->where('warehouse_id',$warehouse_id);
            return $stock ; 

        }

}
