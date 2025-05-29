<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Storage;

class ProductImage extends Model
{
    use HasFactory;

    protected $fillable = ['name','product_id'];


// relationship
    public function products(){
        return $this->belongsTo(Product::class,'product_id');
    }


// customize function
public static function createImagesForProduct($productId, $images)
{
    $paths = [];
    
    foreach ($images as $image) {
        $filename = time() . '_' . uniqid() . '.' . $image->getClientOriginalExtension();
        $fullPath = $image->storeAs('product_images', $filename, 'public');
        $productImage = new self();
        $productImage->product_id = $productId;
        $productImage->name = $filename; 
        $productImage->save();
        
        $paths[] = $fullPath; 
    }
    
    return $paths;
}
public static function removeImagesForProduct($productId)
{
    $productImages = self::where('product_id', $productId)->get();

    foreach ($productImages as $productImage) {
        $filePath = "product_images/" . $productImage->name;
        if (Storage::disk('public')->exists($filePath)) {
            Storage::disk('public')->delete($filePath);
        }
        $productImage->delete();
    }

    return true; 
}

public static function getProductImagesByProductId(string $productId) {
    return self::where('product_id', $productId)
               ->get();
}




    public static function updateImagesForProduct($productId, array $images)
    {
        self::where('product_id', $productId)->delete();

        $imagePaths = [];

        foreach ($images as $image) {
            $path = $image->store('images/products', 'public');
            $imagePaths[] = $path;

            self::create([
                'product_id' => $productId,
                'name' => $path,
            ]);
        }

        return $imagePaths;
    }



    
}
