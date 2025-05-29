<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Regional extends Model
{
    use HasFactory;


    protected $fillable = [
        'name',
        'company_id',
        'regional_manager_id',
        'phone',
        'description'
    ];


   /** * Get the user associated with the Regional
    *
    * @return \Illuminate\Database\Eloquent\Relations\HasOne
    */

    public function company() {
        return $this->belongsTo(Company::class);
    }
    
    public function warehouses(): HasMany
    {
        return $this->hasMany(Warehouse::class, 'region_id', 'id');
    }
        
// In Regional.php model
    public function regionalManager()
    {
        return $this->belongsTo(User::class, 'regional_manager_id', 'id');
    }


    //  functions

    public static function getRegionals($company_id = null, $sort_by = 'asc')
    {
        $query = self::select('regionals.id', 'regionals.name', 'companies.name as company_name', 'regionals.created_at')
                  ->join('companies', 'companies.id', '=', 'regionals.company_id');
    
        if ($company_id) {
            $query->where('regionals.company_id', $company_id);
        }
    
        return $query->orderBy('regionals.name', $sort_by)->get();
    }

}
