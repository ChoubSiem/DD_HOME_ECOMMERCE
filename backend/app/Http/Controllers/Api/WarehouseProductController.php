<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\WarehouseProduct;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class WarehouseProductController extends Controller
{
    /**
     * Display a listing of warehouse products
     */
    public function index($warehouse_id = null)
    {
        try {
            $query = WarehouseProduct::with(['warehouse', 'product'])
                        ->where('is_active', true);
            
            if ($warehouse_id) {
                $query->where('warehouse_id', $warehouse_id);
            }
            
            $products = $query->get();
            
            return response()->json([
                "success" => true,
                "message" => "Products retrieved successfully",
                "products" => $products
            ], 200);
            
        } catch (\Exception $e) {
            return response()->json([
                "success" => false,
                "message" => "Failed to retrieve products",
                "error" => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created warehouse product
     */
    public function store(Request $request)
    {
        DB::beginTransaction();
        try {
            $validated = $request->validate([
                'warehouse_id' => 'required|exists:warehouses,id',
                'product_ids' => 'required|array',
                'product_ids.*' => 'exists:products,id'
            ]);
            // dd($validated);
            WarehouseProduct::where('warehouse_id', $validated['warehouse_id'])
                ->delete();
            
            $createdProducts = [];
            
            foreach ($validated['product_ids'] as $productId) {
                $product_data = Product::getProductById($productId);
                $product = WarehouseProduct::create([
                    'warehouse_id' => $validated['warehouse_id'],
                    'product_id' => $productId,
                    'cost' => $product_data['price'],
                    'price' => $product_data['retail_price'],
                    'dealer_price' => $product_data['dealer_price'],
                    'vip_price' => $product_data['vip_price'],
                    'depot_price' => $product_data['depot_price'],
                    'is_active' => 1
                ]);
                $createdProducts[] = $product;
            }
    
            DB::commit();
    
            return response()->json([
                "success" => true,
                "message" => "Warehouse products updated successfully",
                "products" => $createdProducts,
                "count" => count($createdProducts)
            ], 201);
    
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                "success" => false,
                "message" => "Failed to update warehouse products",
                "error" => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified warehouse product
     */
    public function show($id)
    {
        try {
            $product = WarehouseProduct::with(['warehouse', 'product'])
                        ->findOrFail($id);
            
            return response()->json([
                "success" => true,
                "message" => "Product retrieved successfully",
                "data" => $product
            ], 200);
            
        } catch (\Exception $e) {
            return response()->json([
                "success" => false,
                "message" => "Product not found",
                "error" => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Update the specified warehouse product
     */
    public function update(Request $request, $id)
    {
        try {
            
            $product = WarehouseProduct::findOrFail($id);
            
            $validated = $request->validate([
                'cost' => 'sometimes|numeric|min:0',
                'price' => 'sometimes|numeric|min:0|gte:cost',
                'qty' => 'sometimes|integer|min:0',
                'min_stock' => 'nullable|integer|min:0',
                'max_stock' => 'nullable|integer|gt:min_stock',
                'is_active' => 'sometimes|boolean'
            ]);

            $product->update($validated);

            return response()->json([
                "success" => true,
                "message" => "Product updated successfully",
                "data" => $product
            ], 200);
            
        } catch (\Exception $e) {
            return response()->json([
                "success" => false,
                "message" => "Failed to update product",
                "error" => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified warehouse product (soft delete)
     */
    public function destroy($id)
    {
        try {
            $product = WarehouseProduct::findOrFail($id);
            $product->delete();
            
            return response()->json([
                "success" => true,
                "message" => "Product removed from warehouse successfully",
                "data" => null
            ], 200);
            
        } catch (\Exception $e) {
            return response()->json([
                "success" => false,
                "message" => "Failed to remove product from warehouse",
                "error" => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update stock quantity
     */
    public function updateStock(Request $request, $id)
    {
        try {
            $validated = $request->validate([
                'qty' => 'required|integer',
                'action' => 'required|in:add,subtract,set'
            ]);

            $product = WarehouseProduct::findOrFail($id);
            
            switch ($validated['action']) {
                case 'add':
                    $product->increment('qty', $validated['qty']);
                    break;
                case 'subtract':
                    // Prevent negative stock
                    if ($product->qty - $validated['qty'] < 0) {
                        return response()->json([
                            "success" => false,
                            "message" => "Insufficient stock quantity"
                        ], 400);
                    }
                    $product->decrement('qty', $validated['qty']);
                    break;
                case 'set':
                    if ($validated['qty'] < 0) {
                        return response()->json([
                            "success" => false,
                            "message" => "Stock quantity cannot be negative"
                        ], 400);
                    }
                    $product->update(['qty' => $validated['qty']]);
                    break;
            }

            return response()->json([
                "success" => true,
                "message" => "Stock updated successfully",
                "data" => $product->fresh()
            ], 200);
            
        } catch (\Exception $e) {
            return response()->json([
                "success" => false,
                "message" => "Failed to update stock",
                "error" => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Restore soft deleted warehouse product
     */
    public function restore($id)
    {
        try {
            $product = WarehouseProduct::withTrashed()->findOrFail($id);
            $product->restore();
            
            return response()->json([
                "success" => true,
                "message" => "Product restored successfully",
                "data" => $product
            ], 200);
            
        } catch (\Exception $e) {
            return response()->json([
                "success" => false,
                "message" => "Failed to restore product",
                "error" => $e->getMessage()
            ], 500);
        }
    }
}