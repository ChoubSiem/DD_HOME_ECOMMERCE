<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Warehouse extends Model
{
    use HasFactory; use SoftDeletes ;

    protected $fillable = [
        'name',
        'address',
        'phone',
        'manager_id',
        'region_id',
        'created_at'
    ];


    public function regionals() {
        return $this->belongsTo(Regional::class);
    }
    public function managers() {
        return $this->belongsTo(User::class);
    }

    public static function getWarehouses($warehouse_id = null)
    {
        $query = self::select(
                'warehouses.id',
                'warehouses.name as warehouse_name',
                'regionals.name as regional_name',
                'users.username as manager_name',
                'warehouses.phone as phone',
                'warehouses.address as address',
                'warehouses.updated_at'
            )
            ->join('regionals', 'warehouses.region_id', '=', 'regionals.id')
            ->join('users', 'warehouses.manager_id', '=', 'users.id');
        
        if ($warehouse_id) {
            $query->where('warehouses.id', $warehouse_id);
        }
        
        return $query->orderBy('warehouses.name')->get();
    }
    public function openShifts()
    {
        return $this->hasMany(OpenShift::class);
    }

    public function getWarehouseById($id)
    {
        return self::find($id);
    }


    
}
