<?php 

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\CategoryImage;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class CategoryController extends Controller
{
    /**
     * Store a newly created category in storage.
     */
    public function index()
    {
        try {
            $categories = Category::withCount('products')
                        ->with('categoryImage')
                        ->get()
                        ->map(function ($category) {
                            if ($category->products_count === null) {
                                $category->products_count = 0;
                            }

                            if ($category->categoryImage === null) {
                                $category->categoryImage = null;
                            }

                            return $category;
                        });

    
            return response()->json([
                'categories' => $categories,  
                'message' => 'Categories fetched successfully',
            ], 200);
    
        } catch (Exception $e) {
            return response()->json([
                'message' => 'An error occurred while fetching categories',
                'error' => $e->getMessage(), 
            ], 500);
        }
    }
    
    
    
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:categories,name',
            'description' => 'nullable|string',
            'images' => 'nullable|array', 
            'images.*' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048', 
        ]);

        try {
            $category = Category::createCategory($validated);

            if ($request->hasFile('images')) {
                foreach ($request->file('images') as $image) {
                    $path = $image->store('images/categories', 'public'); 
                    CategoryImage::create([
                        'category_id' => $category->id,
                        'image' => $path,
                    ]);
                }
            }

            return response()->json([
                'message' => 'Category created successfully!',
                'category' => $category,
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to create category',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update the specified category in storage.
     */
    public function update(Request $request, string $id)
    {
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255|unique:categories,name,' . $id,
            'description' => 'nullable|string',
            'images' => 'nullable|array', 
            'images.*' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048', 
        ]);
    
        try {
            $category = Category::find($id);
    
            if (!$category) {
                return response()->json([
                    'error' => 'Category not found',
                ], 404);
            }
    
            $category->update([
                'name' => $validated['name'] ?? $category->name,
                'description' => $validated['description'] ?? $category->description,
            ]);
    
            if ($request->hasFile('images')) {
                foreach ($category->images as $existingImage) {
                    Storage::disk('public')->delete($existingImage->image);
                }
    
                $category->images()->delete();
    
                foreach ($request->file('images') as $image) {
                    $path = $image->store('images/categories', 'public'); 
                    CategoryImage::create([
                        'category_id' => $category->id,
                        'image' => $path,
                    ]);
                }
            }
    
            return response()->json([
                'message' => 'Category updated successfully!',
                'category' => $category,
            ], 200);
    
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to update category',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Remove the specified category from storage.
     */
    public function destroy(string $id)
    {
        try {
            $category = Category::find($id);
    
            if (!$category) {
                return response()->json([
                    'error' => 'Category not found',
                ], 404);
            }
    
            // foreach ($category->images as $image) {
            //     Storage::disk('public')->delete($image->image); 
            // }
    
            // $category->images()->delete();
            $category->delete();
    
            return response()->json([
                'message' => 'Category deleted successfully!',
            ], 200);
    
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to delete category',
                'message' => $e->getMessage(),
            ], 500);
        }
    }
}