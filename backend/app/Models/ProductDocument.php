<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductDocument extends Model
{
    use HasFactory;


    protected $fillable = [
        'product_id', 'name',
    ];

    public static function createDocumentsForProduct($productId, array $documents)
    {
        $documentPaths = [];

        foreach ($documents as $document) {
            $path = $document->store('documents/products', 'public'); 
            $documentPaths[] = $path;

            self::create([
                'product_id' => $productId,
                'name' => $path,
            ]);
        }

        return $documentPaths; 
    }

    

    public static function updateDocumentsForProduct($productId, array $documents)
    {
        self::where('product_id', $productId)->delete();

        $documentPaths = [];

        foreach ($documents as $document) {
            $path = $document->store('documents/products', 'public'); 
            $documentPaths[] = $path;

            self::create([
                'product_id' => $productId,
                'name' => $path,
            ]);
        }

        return $documentPaths;
    }
}
