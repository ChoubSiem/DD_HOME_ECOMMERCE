<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WarehouseSetting extends Model
{
    use HasFactory; use SoftDeletes ;

    protected $guarded = [ 'id' ];

    protected $fillable = [ 'warehouse_id', 'setting_id'];

    protected $dates = ['deleted_at'];

     /**
     * Get all of the comments for the WarehouseSetting
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */

    public function warehouses() : HasMany{
        return $this->hasMany(Warehouse::class);
    }

    public function settings() : HasMany {
        return $this->belongToMany(Setting::class);
    }

}
