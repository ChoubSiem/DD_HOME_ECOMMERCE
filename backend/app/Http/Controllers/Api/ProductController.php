<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductDocument;
use App\Models\ProductImage;
use App\Models\ProductUnit;
use App\Models\Stock;
use App\Models\Unit;
use App\Models\WarehouseProduct;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ProductController extends Controller
{
public function index(Request $request)
{
    try {
        $warehouse_id = $request->query('warehouse_id');

        $query = Product::select([
            'products.id',
            'products.name',
            'products.code',
            'products.description',
            'products.alert_qty',
            'products.status',
            'products.is_draft',
            DB::raw(
                is_null($warehouse_id)
                    ? "(SELECT IFNULL(SUM(stocks.quantity), 0) FROM stocks WHERE stocks.product_id = products.id AND stocks.warehouse_id IS NULL) as total_stock"
                    : "(SELECT IFNULL(SUM(stocks.quantity), 0) FROM stocks WHERE stocks.product_id = products.id AND stocks.warehouse_id = {$warehouse_id}) as total_stock"
            ),
            $warehouse_id 
                ? 'warehouse_products.price as price'
                : 'products.price as price',
            $warehouse_id 
                ? 'warehouse_products.cost as cost'
                : 'products.cost as cost',
            $warehouse_id 
                ? 'warehouse_products.price as retail_price'
                : 'products.retail_price as retail_price',
            $warehouse_id 
                ? 'warehouse_products.dealer_price as dealer_price'
                : 'products.dealer_price as dealer_price',
            $warehouse_id 
                ? 'warehouse_products.vip_price as vip_price'
                : 'products.vip_price as vip_price',
            $warehouse_id 
                ? 'warehouse_products.depot_price as depot_price'
                : 'products.depot_price as depot_price',
            
            DB::raw('(SELECT code FROM units WHERE id = (SELECT unit_id FROM product_units WHERE product_id = products.id LIMIT 1) LIMIT 1) as unit_code'),
            DB::raw('(SELECT name FROM categories WHERE id = products.category_id ) as category_name'),
            DB::raw('(SELECT name FROM product_groups WHERE id = products.product_group_id) as product_group_name'),
            DB::raw('(SELECT name FROM brands WHERE id = products.brand_id ) as brand_name'),
            DB::raw('(SELECT GROUP_CONCAT(name) FROM product_images WHERE product_id = products.id ) as images')
        ]);

        if ($warehouse_id) {
            $query->join('warehouse_products', function ($join) use ($warehouse_id) {
                $join->on('warehouse_products.product_id', '=', 'products.id')
                    ->where('warehouse_products.warehouse_id', $warehouse_id)
                    ->whereNull('warehouse_products.deleted_at');
            });

            $query->addSelect([
                DB::raw('warehouse_products.cost as cost'),
                DB::raw('warehouse_products.dealer_price as dealer_price'),
                // Comment these out if they don't exist:
                // DB::raw('warehouse_products.price as price'),
                // DB::raw('warehouse_products.vip_price as vip_price'),
                // DB::raw('warehouse_products.depot_price as depot_price'),
            ]);
        }


        $products = $query->get();

        $products->transform(function ($product) {
            $product->images = $product->images ? explode(',', $product->images) : [];
            $product->stock = $product->total_stock;
            unset($product->total_stock);
            return $product;
        });

        return response()->json([
            'message' => 'Products fetched successfully',
            'products' => $products,
        ], 200);

    } catch (Exception $e) {
        return response()->json([
            'message' => 'Product fetch failed',
            'error' => $e->getMessage(),
        ], 500);
    }
}
    
    
    

    
    // Store
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'code' => 'required|string|unique:products',
                'barcode' => 'nullable|string|unique:products',
                'category_id' => 'nullable|exists:categories,id',
                'product_group_id' => 'nullable|exists:product_groups,id', 
                'brand' => 'nullable|exists:brands,id',
                'cost' => 'nullable|numeric',
                'price' => 'nullable|numeric',
                'description' => 'nullable|string',
                'alert_qty' => 'nullable|integer|min:0',
                'unit' => 'nullable',
                'status' => 'nullable|in:active,inactive',
                'documents' => 'nullable|array',
                'is_draft' => 'sometimes|boolean' ,
                'retail_price' =>'nullable',
                'vip_price' => 'nullable',
                'depot_price' =>'nullable',
                'dealer_price' =>'nullable'
            ]);
            
            $priceMissing = empty($validated['price'] ?? null);
            $costMissing = empty($validated['cost'] ?? null);
            
            if (($priceMissing && $costMissing) == true) {
                $validated['is_draft'] = 1;
            } else {
                $validated['is_draft'] = $validated['is_draft'] ?? 0;
            }
            
            $product = Product::create_product($validated);
    
            if (!empty($validated['unit'])) {
                ProductUnit::create([
                    'product_id' => $product->id,
                    'unit_id' => $validated['unit'],
                    'unit_qty' => $validated['qty'] ?? 1, 
                ]);
            }
            
            $imagePaths = [];
            if ($request->hasFile('images')) {
                $imagePaths = ProductImage::createImagesForProduct($product->id, $request->file('images'));
            }
            $documentPaths = [];
            if ($request->hasFile('documents')) {
                $documentPaths = ProductDocument::createDocumentsForProduct($product->id, $request->file('documents'));
            }
            
            return response()->json([
                'message' => $validated['is_draft'] ? 'Draft product created successfully!' : 'Product created successfully!',
                'product' => $product,
                'is_draft' => $validated['is_draft'],
                'images' => $request->hasFile('images'),
                'documents' => $documentPaths,
            ], 201);
    
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'error' => 'Validation failed',
                'messages' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to create product',
                'message' => $e->getMessage(), 
            ], 500);
        }
    }

    public function show(string $id)
    {
        $product = Product::find($id);
        $product_images = ProductImage::getProductImagesByProductId($id);
        $product_units = ProductUnit::getProductUnitByProductId($id);
        $product['product_images'] = $product_images;
        $product['product_units'] = $product_units;

        if (!$product) {
            return response()->json([
                'message' => 'Product not found',
            ], 404);
        }
    
        return response()->json([
            'message' => 'Product fetched successfully',
            'product' => $product,  
        ]);
    }
    

    public function update(Request $request, string $id)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric',
            'code' => 'nullable|string',
            'cost' => 'nullable|numeric',
            'type' => 'nullable|string',
            'alert_qty' => 'required|integer',
            'status' => 'nullable|string',
            'unit' => 'nullable|integer',
            'brand_id' => 'nullable|integer',
            'category_id' => 'nullable|integer',
            'product_group_id' => 'nullable|integer',
            'discount' => 'nullable|numeric',
            'images' => 'nullable|array',
            'images.*' => 'image|mimes:jpeg,png,jpg,gif,svg|max:2048',
            'retail_price' =>'nullable',
            'vip_price' => 'nullable',
            'depot_price' =>'nullable',
            'dealer_price' =>'nullable'
        ]);
        
        $product = Product::findOrFail($id);
        try {
            $product->update([
                'name' => $validated['name'],
                'description' => $validated['description']??null,
                'price' => $validated['price'],
                'code' => $validated['code'],
                'cost' => $validated['cost'],
                'alert_qty' => $validated['alert_qty'],
                'status' => $validated['status']??1,
                'unit' => $validated['unit']??null,
                'brand_id' => $validated['brand_id']??null,
                'category_id' => $validated['category_id']??null,
                'product_group_id' => $validated['product_group_id']??null,
                'discount' => $validated['discount']??null,
                'retail_price' =>$validated["retail_price"],
                'vip_price' =>$validated["vip_price"],
                'depot_price' =>$validated["depot_price"],
                'dealer_price' =>$validated["dealer_price"]
            ]);
    
            if ($request->has('unit')) {
                ProductUnit::updateUnitsForProduct($product->id, $validated['unit']);
            }
    
            $imagePaths = [];
            if ($request->hasFile('images')) {
                $imagePaths = ProductImage::updateImagesForProduct($product->id, $request->file('images'));
            }
    
            $documentPaths = [];
            if ($request->hasFile('documents')) {
                $documentPaths = ProductDocument::updateDocumentsForProduct($product->id, $request->file('documents'));
            }
    
            return response()->json([
                'message' => 'Product updated successfully!',
                'product' => $product,
                'images' => $imagePaths,
                'documents' => $documentPaths,
            ], 200);
    
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to update product',
                'message' => $e->getMessage(),
            ], 500);
        }
    }
    
    

    public function destroy($id)
    {
        $product = Product::findOrFail($id);
        
        if (!ProductImage::removeImagesForProduct($product->id)) {
            return response()->json(['error' => 'Failed to delete some images'], 500);
        }
        
        $product->delete();
        
        return response()->json(['message' => 'Product deleted successfully']);
    }
    
    
    


    public function importProduct(Request $request)
    {
        try {
            $validated = $request->validate([
                'products.*.name' => 'required|string|max:255',
                'products.*.code' => 'required',
                'products.*.category_name' => 'nullable|string|max:255',
                'products.*.cost' => 'required|numeric|min:0',
                'products.*.stock' => 'nullable|numeric|min:0',
                'products.*.price' => 'required|numeric|min:0',
                'products.*.retail_price' => 'required|numeric|min:0',
                'products.*.dealer_price' => 'required|numeric|min:0',
                'products.*.depot_price' => 'required|numeric',
                'products.*.vip_price' => 'required|numeric|min:0',
                'products.*.alert_qty' => 'nullable|integer|min:0',
                'products.*.unit_name' => 'nullable',
            ]);

            $importedProducts = [];
            $errors = [];

            foreach ($validated['products'] as $index => $productData) {
                try {
                    $priceMissing = empty($productData['price']);
                    $costMissing = empty($productData['cost']);
                    $categoryName = $productData['category_name'] ?? null;
                    $productData['is_draft'] = ($priceMissing && $costMissing) ? 1 : ($productData['is_draft'] ?? 0);
                    $category = Category::checkCategory($categoryName);

                    if (!$category) {
                        $lastCategory = Category::orderBy('code', 'desc')->first();
                        if ($lastCategory && preg_match('/^\d+$/', $lastCategory->code)) {
                            $lastCode = (int) $lastCategory->code;
                            $newCode = str_pad($lastCode + 1, 4, '0', STR_PAD_LEFT);
                        } else {
                            $newCode = '0001';
                        }

                        $category = Category::create([
                            'name' => $categoryName,
                            'code' => $newCode,
                        ]);
                    }

                    $productData['category_id'] = $category['id'];

                    $existingProduct = Product::where('code', $productData['code'])->first();
                    
                    if ($existingProduct) {
                        $existingProduct->update($productData);
                        $stockToAdd = $productData['stock'] ?? 0;
                        if ($stockToAdd) {
                            $result = Stock::add_stock_product($existingProduct->id, null, $stockToAdd);

                        }

                        $product = $existingProduct;
                    } else {
                        $product = Product::import_product($productData);

                        if ($product) {
                            $initialStock = $productData['stock'] ?? 0;
                            Stock::add_stock_product($product->id, null, $initialStock);
                        }
                    }

                    if ($product) {
                        if (!empty($productData['unit_name'])) {
                            $unitId = Unit::getUnitIdByName($productData['unit_name']) ??
                                Unit::add_unit(['name' => $productData['unit_name']], 'import');
                             $qty = isset($productData['qty']) && is_numeric($productData['qty']) && $productData['qty'] > 0
                                    ? $productData['qty']
                                    : 1;
                                $unit = [
                                'product_id' => $product->id,
                                'unit_id' => $unitId,
                                'unit_qty' => $qty,
                                'unit_price' => $product->price ?? null,
                                'is' => $product->price ?? null,
                            ];

                            ProductUnit::createUnitsForProduct($product->id, $unit);
                        }

                        $importedProducts[] = $product;
                    } else {
                        $errors[] = [
                            'index' => $index,
                            'code' => $productData['code'],
                            'message' => 'Failed to import product - import_product() returned null.'
                        ];
                    }
                } catch (\Throwable $e) {
                    $errors[] = [
                        'index' => $index,
                        'code' => $productData['code'] ?? 'N/A',
                        'message' => $e->getMessage()
                    ];
                }
            }

            return response()->json([
                'message' => count($importedProducts) . ' product(s) imported successfully!',
                'imported' => $importedProducts,
                'errors' => $errors
            ], count($importedProducts) > 0 ? 201 : 422);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to validate request',
                'message' => $e->getMessage(),
            ], 422);
        }
    }


    public function updateProductPrice(Request $request)
        {
            $validated = $request->validate([
                'products' => 'required|array',
                'products.*.code' => 'required|string|exists:products,code',
                'products.*.price' => 'nullable|numeric',
                'products.*.retail_price' => 'nullable|numeric',
                'products.*.dealer_price' => 'nullable|numeric',
                'products.*.depot_price' => 'nullable|numeric',
                'products.*.vip_price' => 'nullable|numeric',
            ]);

            $results = [];

            foreach ($validated['products'] as $productData) {
                $result = Product::importToUpdateProductPriceByCode($productData);
                if ($result) {
                    WarehouseProduct::updateProductPriceByWarehouse($productData , $result['id']);
                    $results[] = $result;
                }
            }

            return response()->json([
                'message' => 'Products updated successfully',
                'updated' => count($results),
                'products' => $results,
            ]);
        }

    public function getProductDetailIdAndWarehouse(Request $request)
    {
        $warehouse_id = $request->query('warehouse_id');
        $product_id = $request->query('product_id');

        if (!$product_id) {
            return response()->json([
                'message' => 'product_id is required',
            ], 400);
        }

        try {
            $product = Product::get_product_detail_by_id($warehouse_id, $product_id);

            if (!$product) {
                return response()->json([
                    'message' => 'Product not found',
                ], 404);
            }

            return response()->json([
                'message' => 'Product fetched successfully',
                'product' => $product,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to fetch product',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

}
