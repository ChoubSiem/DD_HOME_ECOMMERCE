<?php

namespace App\Models;

use App\Models\ProductUnit;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;

class Unit extends Model
{
    use HasFactory ;

    protected $fillable = ['code','name'];



    public function productUnits()
    {
        return $this->hasMany(ProductUnit::class);
    }

    public function products()
    {
        return $this->belongsToMany(Product::class, 'product_units', 'unit_id', 'product_id');
    }
    public static function getUnitIdByCode($code = false)
    {
        if (!$code) {
            return false; 
        }
        
        $unit = self::where('code', $code)->first();
        return $unit ? $unit->id : null;
    }
    public function fromConversions()
    {
        return $this->hasMany(UomConversion::class, 'from_unit_id');
    }

    public function toConversions()
    {
        return $this->hasMany(UomConversion::class, 'to_unit_id');
    }


    public static function add_unit($data = [], $type = 'add')
    {
        if (empty($data['code'])) {
            $lastUnit = self::orderBy('id', 'desc')->first();
            $lastCode = $lastUnit ? intval(preg_replace('/\D/', '', $lastUnit->code)) : 0;
            $newCode = str_pad($lastCode + 1, 4, '0', STR_PAD_LEFT);
            $data['code'] = $newCode;
        }

        $unit = self::firstOrCreate(
            ['code' => $data['code']],
            ['name' => $data['name'] ?? $data['code']]
        );

        return $type === 'import' ? $unit->id : $unit;
    }

public static function getUnitByProductId($product_id ){
    $query = Unit::select(
        'products.id', 
        DB::raw('MAX(units.name) as name'), 
        DB::raw('MAX(products.price) as price'), 
        DB::raw('MAX(products.code) as code'), 
        DB::raw('IFNULL(SUM(stocks.quantity), 0) as total_stock'),
        DB::raw('MAX(units.code) as unit_code'), 
    )
    ->leftJoin('products', 'products.id', '=', 'stocks.product_id')
    ->leftJoin('product_units', 'products.id', '=', 'product_units.product_id')
    ->leftJoin('units', 'product_units.unit_id', '=', 'units.id')
    ->groupBy('products.id');
}
public static function getUnitIdByName($unitName)
{
    if (!$unitName) return null;

    $unit = self::where('name', $unitName)->first();
    return $unit ? $unit->id : null;
}
public static function getUnitNameById($id)
{
    if (!$id) return null;

    $unit = self::where('id', $id)->first();
    return $unit ? $unit->name : null;
}


    
}
