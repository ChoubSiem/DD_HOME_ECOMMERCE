<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Company extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'location', 'phone', 'email','updated_at','ceo_id'];

    public function regionals(): HasMany
    {
        return $this->hasMany(Regional::class);
    }

    public function ceo()
    {
        return $this->belongsTo(User::class, 'ceo_id'); // Assumes 'ceo_id' is the foreign key
    }

    public static function createCompany(array $data)
    {
        if(!$data){
            return false ; 
        }
        
        return self::create([
            'name' => $data['name'],
            'location' => $data['location'] ?? null,
            'phone' => $data['phone'] ?? null,
            'email' => $data['email'] ?? null,
        ]);
    }

    public static function updateCompany($company_id, array $data)
    {
        $company = self::find($company_id);
        
        if (!$company) {
            return false;
        }

        return $company->update([
            'name' => $data['name'] ?? $company->name,
            'location' => $data['location'] ?? $company->location,
            'phone' => $data['phone'] ?? $company->phone,
            'email' => $data['email'] ?? $company->email,
        ]);
    }

    public static function deleteCompany($company_id)
    {
        $company = self::find($company_id);
        
        if (!$company) {
            return false;
        }

        return $company->delete();
    }


    public static function getCompanys($company_name = false, $sortBy = 'name', $sortOrder = 'asc')
    {
        $query = Company::query();
        
        if ($company_name) {
            $query->where('companies.name', 'LIKE', '%' . $company_name . '%');
        }
    
        $companies = $query->with('ceo')
                           ->orderBy($sortBy, $sortOrder)
                           ->get();
    
        return $companies;
    }
    
    
    

}