<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Models\Unit;


class ProductUnit extends Model
{
    use HasFactory; use SoftDeletes;

    protected $fillable = ['product_id','unit_id','unit_qty'];

    protected $dates = ['deleted_at'];


    public function products(){
        return $this->belongsTo(Product::class,'id','product_id');
    }

    public function units(){
        return $this->belongsTo(Unit::class,'unit_id','id');
    }


    public static function createUnitsForProduct($productId, array $unit)
    {
        // foreach ($units as $unit) {
            // dd($unit);
            self::create([
                'product_id' => $productId,
                'unit_id' => $unit['unit_id'],
                'unit_qty' => $unit['qty'] ?? 1,
            ]);
        // }
    
        return true;
    }
    

    public static function updateUnitsForProduct($productId,  $unit)
    {
        self::where('product_id', $productId)->delete();

            self::create([
                'product_id' => $productId,
                'unit_id' => $unit,
                'unit_qty' =>  1, 
            ]);
        return true;
    }

    public static function getProductUnitByProductId(string $productId)
    {
        return self::where('product_id', $productId)
            ->with('units')
            ->first();
    }
    public static function getUnitNameByProductId(string $productId): ?string
    {
        $productUnit = self::where('product_id', $productId)
            ->with('units')
            ->first();

        return $productUnit && $productUnit->units
            ? $productUnit->units->name
            : null;
    }





    
}
