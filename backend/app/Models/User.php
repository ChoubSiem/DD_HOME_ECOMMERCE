<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\DB;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Support\Facades\Storage;
use Tymon\JWTAuth\Contracts\JWTSubject;

class User extends Authenticatable implements JWTSubject
{
    use HasApiTokens, HasFactory, Notifiable;

    public function getJWTIdentifier(){
        return $this->getKey();

    }
    public function getJWTCustomClaims(){
        return [];
    }
    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    
    protected $fillable = [
        'username',
        'password',
        'email',
        'phone',
        'warehouse_id',
        'recovery_number',
        'province',
        'profile',
        'role_id',
        'user_group_id',
        'customer_group_id',
        'warehouse_id',
        'type',
        'address',
        'company',
        'pass',
        'contact_name',
        'customer_code'        
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
    ];

    protected $dates = ['deleted_at'];


    public function UserRole()
    {
        return $this->hasMany(UserRole::class);
    }
    public function regional()
    {
        return $this->belongsTo(Regional::class);
    }
    public function warehouse()
    {
        return $this->belongsTo(Warehouse::class);
    }
    public function customerGroup()
    {
        return $this->belongsTo(CustomerGroup::class, 'customer_group_id');
    }

public static function getUsers($type = false)
{
    $query = User::query();

    if ($type) {
        $query->where('users.type', $type);
    }

    $query->leftJoin('customer_groups', 'users.customer_group_id', '=', 'customer_groups.id')
          ->select('users.*', 'customer_groups.name as group_name');

    if (!$type || $type !== 'customer') {
        $query->join('user_roles', 'users.id', '=', 'user_roles.user_id')
              ->join('roles', 'user_roles.role_id', '=', 'roles.id')
              ->addSelect('roles.name as role_name');
    }

    return $query->get();
}



    public static function getRoleByUserId($user_id = null)
    {
        if (!$user_id && auth()->check()) {
            $user_id = auth()->id();
        }
    
        if (!$user_id) {
            return null;
        }
    
        $role = DB::table('users')
            ->join('user_roles', 'users.id', '=', 'user_roles.user_id')
            ->join('roles', 'user_roles.role_id', '=', 'roles.id')
            ->select('roles.id as role_id', 'roles.name as role_name')
            ->where('users.id', $user_id)
            ->first(); 
    
        return $role;
    }


    public static function addProfileImage($image)
    {
        if (!$image) {
            return null;
        }
    
        try {
            $filename = time() . '_' . uniqid() . '.' . $image->getClientOriginalExtension();
            $image->storeAs('employee_images', $filename, 'public');
            return $filename;
            
        } catch (\Exception $e) {
            return null;
        }
    }

    public static function getUserById($id)
    {
        return User::select('id', 'username')->find($id);
    }

    
    
    
}
