<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'description', 'is_active','warehouse_id','code'];

    public function products()
    {
        return $this->hasMany(Product::class);
    }

    public function categoryImage()
    {
        return $this->hasOne(CategoryImage::class, 'category_id');
    }
    

    public static function createCategory(array $data)
    {
        return self::create([
            'name' => $data['name'],
            'description' => $data['description'] ?? null,
            'is_active' => $data['is_active'] ?? true,

        ]);
    }

    // Update category
    public static function updateCategory($categoryId, array $data)
    {
        $category = self::find($categoryId);

        if (!$category) {
            return false; 
        }

        return $category->update($data);
    }

    public static function checkCategory($name = false)
    {
        if (!$name) {
            return false;
        }

        $category = Category::where('name', $name)->first();

        return $category ? $category : false;
    }
}
