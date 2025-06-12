<?php

use App\Http\Controllers\Api\AdjustmentController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BrandController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\CompanyController;
use App\Http\Controllers\Api\ProductGroupController;
use App\Http\Controllers\Api\SalePaymentController;
use App\Http\Controllers\Api\ShiftController;
use App\Http\Controllers\Api\UomTransferController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\CustomerGroupController;
use App\Http\Controllers\Api\LanguageController;
use App\Http\Controllers\Api\PermissionController;
use App\Http\Controllers\Api\PriceGroupController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\PromotionController;
use App\Http\Controllers\Api\PurchaseController;
use App\Http\Controllers\Api\PurchaseItemController;
use App\Http\Controllers\Api\RegionalController;
use App\Http\Controllers\Api\RoleController;
use App\Http\Controllers\Api\RolePermissionController;
use App\Http\Controllers\Api\SettingController;
use App\Http\Controllers\Api\UnitController;
use App\Http\Controllers\Api\WarehouseController;
use App\Http\Controllers\Api\SaleController;
use App\Http\Controllers\Api\StockTransferController;
use App\Http\Controllers\Api\UomConversionController;
use App\Http\Controllers\Api\WarehouseProductController;
use App\Http\Controllers\Api\PosSuspandController;
use App\Http\Controllers\Api\ReportController;
use App\Models\UomConversion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;

// Route::middleware('auth:api')->get('/me', function (Request $request) {
    //     return $request->user(); // Returns authenticated user
    // });
    
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/company/create', [CompanyController::class, 'store']);
    
    Route::middleware(['auth:api'])->group(function () {
        Route::get('/me', [AuthController::class, 'getProfile']);
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/profile/{id}', [AuthController::class, 'getProfile']);
        Route::post('/profile/update/{id}', [AuthController::class, 'updateProfile']);
        Route::delete('/profile/delete/{id}', [AuthController::class, 'deleteProfile']);
        Route::put('/info/update/{id}', [AuthController::class, 'updateInfo']);
        
        Route::get('/company/list', [CompanyController::class, 'index']);
        Route::get('/company/edit/{id}', [CompanyController::class, 'edit']);
        Route::get('/company/show/{id}', [CompanyController::class, 'show']);
        Route::put('/company/update/{id}', [CompanyController::class, 'update']);
        Route::delete('/company/delete/{id}', [CompanyController::class, 'destroy']);
        
        Route::get('/regional/list', [RegionalController::class, 'index']);
        Route::post('/regional/create', [RegionalController::class, 'store']);
        Route::get('/regional/show/{id}', [RegionalController::class, 'show']);
        Route::put('/regional/update/{id}', [RegionalController::class, 'update']);
        Route::delete('/regional/delete/{id}', [RegionalController::class, 'destroy']);
        
        Route::get('/warehouse/list', [WarehouseController::class, 'index']);
        Route::get('/warehouse/show/{id}', [WarehouseController::class, 'show']);
        Route::post('/warehouse/create', [WarehouseController::class, 'store']);
        Route::get('/warehouse/edit/{id}', [WarehouseController::class, 'edit']);
        Route::put('/warehouse/update/{id}', [WarehouseController::class, 'update']);
        Route::delete('/warehouse/delete/{id}', [WarehouseController::class, 'destroy']);
        Route::get('/warehouse/{id}', [WarehouseController::class, 'getWarehouseIdByUserId']);
        
        Route::get('/setting/list', [SettingController::class, 'index']);
        Route::put('/setting/update', [SettingController::class, 'update']);
        
        
        
        Route::get('/permission/list', [PermissionController::class, 'index']);
        // Route::post('/permission/create', [PermissionController::class, 'store']);
        Route::get('/permission/edit/{id}', [PermissionController::class, 'edit']);
        Route::put('/permission/update/{id}', [PermissionController::class, 'update']);
        Route::delete('/permission/delete/{id}', [PermissionController::class, 'destroy']);
        
        Route::post('/user/create', [UserController::class, 'store']);
        Route::get('/user/edit/{id}', [UserController::class, 'edit']);
        Route::put('/user/update/{id}', [UserController::class, 'update']);
        Route::delete('/user/delete/{id}', [UserController::class, 'destroy']);
        Route::post('/employee/create', [UserController::class, 'addEmployee']);


        Route::post('/supplier/create', [UserController::class, 'addSupplier']);
        Route::put('/supplier/update/{id}', [UserController::class, 'updateSupplier']);
        Route::delete('/supplier/delete/{id}', [UserController::class, 'deleteSupplier']);



        Route::post('/customer/quick-create', [UserController::class, 'quickAddCustomer']);
        Route::post('/customer/create', [UserController::class, 'addCustomer']);
        Route::get('/customer/list', [UserController::class, 'getCustomerList']);
        Route::put('/customer/update/{id}', [UserController::class, 'updateCustomer']);
        Route::delete('/customer/delete/{id}', [UserController::class, 'deleteCustomer']);
        Route::post('/customer/import', [UserController::class, 'importCustomer']);
        
        Route::get('/policy/delete/{id}', [RolePermissionController::class, 'get_role_permissions']);
        Route::put('/policy/update/{id}', [RolePermissionController::class, 'update']);
        
        Route::get('/brand/list', [BrandController::class, 'index']);
        Route::post('/brand/create', [BrandController::class, 'store']);
        Route::get('/brand/edit/{id}', [BrandController::class, 'show']);
        Route::put('/brand/update/{id}', [BrandController::class, 'update']);
        Route::delete('/brand/delete/{id}', [BrandController::class, 'destroy']);
        
        
        Route::get('/category/list', [CategoryController::class, 'index']);
        Route::post('/category/create', [CategoryController::class, 'store']);
        Route::get('/category/edit/{id}', [CategoryController::class, 'show']);
        Route::put('/category/update/{id}', [CategoryController::class, 'update']);
        Route::delete('/category/delete/{id}', [CategoryController::class, 'destroy']);
        
        
        Route::get('/product/list', [ProductController::class, 'index']);
        Route::get('/product/edit/{id}', [ProductController::class, 'show']);
        Route::delete('/product/delete/{id}', [ProductController::class, 'destroy']);
        Route::post('/product/create', [ProductController::class, 'store']);
        
        
        Route::get('/promotion/list', [PromotionController::class, 'index']);
        Route::post('/promotion/create', [PromotionController::class, 'store']);
        Route::get('/promotion/edit/{id}', [PromotionController::class, 'show']);
        Route::put('/promotion/update/{id}', [PromotionController::class, 'update']);
        Route::delete('/promotion/delete/{id}', [PromotionController::class, 'destroy']);
        
        
        Route::get('/unit/list', [UnitController::class, 'index']);
        Route::post('/unit/create', [UnitController::class, 'store']);
        Route::get('/unit/edit/{id}', [UnitController::class, 'show']);
        Route::put('/unit/update/{id}', [UnitController::class, 'update']);
        Route::delete('/unit/delete/{id}', [UnitController::class, 'destroy']);
        
        
        Route::get('/price-group/list', [PriceGroupController::class, 'index']);
        Route::post('/price-group/create', [PriceGroupController::class, 'store']);
        Route::get('/price-group/edit/{id}', [PriceGroupController::class, 'show']);
        Route::put('/price-group/update/{id}', [PriceGroupController::class, 'update']);
        Route::delete('/price-group/delete/{id}', [PriceGroupController::class, 'destroy']);
        
        
        Route::get('/customer-group/list', [CustomerGroupController::class, 'index']);
        Route::post('/customer-group/create', [CustomerGroupController::class, 'store']);
        Route::get('/customer-group/edit/{id}', [CustomerGroupController::class, 'show']);
        Route::put('/customer-group/update/{id}', [CustomerGroupController::class, 'update']);
        Route::delete('/customer-group/delete/{id}', [CustomerGroupController::class, 'destroy']);
        
        
        // Route::get('/customer-group/list', [CustomerGroupController::class, 'index']);
        // Route::post('/customer-group/create', [CustomerGroupController::class, 'store']);
        // Route::get('/customer-group/edit/{id}', [CustomerGroupController::class, 'show']);
        // Route::put('/customer-group/update/{id}', [CustomerGroupController::class, 'update']);
        // Route::delete('/customer-group/delete/{id}', [CustomerGroupController::class, 'destroy']);
        
        Route::get('/role/list', [RoleController::class, 'index']);
        Route::post('/role/create', [RoleController::class, 'store']);
        Route::get('/role/edit/{id}', [RoleController::class, 'edit']);
        Route::put('/role/permission/update/{id}', [RolePermissionController::class, 'updatePermissions']);
        Route::delete('/role/delete/{id}', [RoleController::class, 'destroy']);
        
        // ProductGroup Routes
        Route::get('/product-group/list', [ProductGroupController::class, 'index']);
        Route::post('/product-group/create', [ProductGroupController::class, 'store']);
        Route::get('/product-group/edit/{id}', [ProductGroupController::class, 'show']);
        Route::put('/product-group/update/{id}', [ProductGroupController::class, 'update']);
        Route::delete('/product-group/delete/{id}', [ProductGroupController::class, 'destroy']);
        
        Route::get('/role/show/{id}', [RoleController::class, 'show']);
        Route::get('/role/permission', [RoleController::class, 'getRolePermissions']);
        
        
        Route::get('/adjustment/list', [AdjustmentController::class, 'index']);
        Route::post('/adjustment/create', [AdjustmentController::class, 'store']);
        Route::put('/adjustment/update/{id}', [AdjustmentController::class, 'update']);
        Route::post('/product/import', [ProductController::class, 'importProduct']);
        Route::put('/product/update-price', [ProductController::class, 'updateProductPrice']);
        Route::put('/product/update/{id}', [ProductController::class, 'update']);
        Route::delete('/adjustment/delete/{id}', [AdjustmentController::class, 'destroy']);
        Route::get('/product/detail', [ProductController::class, 'getProductDetailIdAndWarehouse']);
        
        Route::post('warehouse/product', [WarehouseProductController::class, 'store']);
        Route::get('/adjustment/show/{id}', [AdjustmentController::class, 'show']);
        
        Route::post('/uom-conversion/create', [UomConversionController::class, 'store']);
        Route::get('/uom-conversion/edit/{id}', [UomConversionController::class, 'show']);
        Route::put('/uom-conversion/update/{id}', [UomConversionController::class, 'update']);
        Route::delete('/uom-conversion/delete/{id}', [UomConversionController::class, 'destroy']);

        Route::get('/uom-conversion/list', [UomConversionController::class, 'index']);
        
        Route::post('/uom-transfer/create', [UomTransferController::class, 'store']);
        Route::get('/uom-transfer/list', [UomTransferController::class, 'index']);
        Route::get('/uom-transfer/edit/{id}', [UomTransferController::class, 'edit']);
        Route::put('/uom-transfer/update/{id}', [UomTransferController::class, 'update']);
        Route::delete('/uom-transfer/delete/{id}', [UomTransferController::class, 'destroy']);
        
        Route::get('/stock-transfer/list', [StockTransferController::class, 'index']);

        Route::get('close-shift', [ShiftController::class, 'closeShiftList']);
        Route::post('close-shift/create', [ShiftController::class, 'AddCloseShift']);
        Route::get('close-shift/{id}', [ShiftController::class, 'showCloseShift']);
        Route::put('close-shift/{id}', [ShiftController::class, 'updateCloseShift']);
        Route::delete('close-shift/{id}', [ShiftController::class, 'destroyCloseShift']);

        Route::get('open-shift', [ShiftController::class, 'openShiftList']);
        Route::post('open-shift', [ShiftController::class, 'createOpenShift']);
        Route::delete('open-shift/{id}', [ShiftController::class, 'destroyOpenShift']);
        Route::post('open-shift/create', [ShiftController::class, 'CreateOpenShift']);
        Route::put('open-shift/update/{id}', [ShiftController::class, 'UpdateOpenShift']);


        Route::get('pos-sale/list', [SaleController::class, 'getPosSales']);
        Route::post('/stock-transfer/create', [StockTransferController::class, 'store']);
        // Route::get('open-shift/show/{id}', [ShiftController::class, 'OpenshiftListWithProducts']);
        Route::post('pos-sale/create', [SaleController::class, 'store']);
        Route::get('/sale/list', [SaleController::class, 'getSalesInventory']);
        Route::get('sale/edit/{id}', [SaleController::class, 'showSaleInventory']);
        Route::delete('sale/delete/{id}', [SaleController::class, 'destroy']);
        Route::delete('pos-sale/delete/{id}', [SaleController::class, 'PosDestroy']);


        Route::post('suspand/create', [PosSuspandController::class, 'store']);
        Route::get('suspand/get', [PosSuspandController::class, 'getSuspendByWarehouseIdAndShiftId']);
        Route::delete('suspand/delete/{id}', [PosSuspandController::class, 'destroy']);


        Route::get('/purchase/list', [PurchaseController::class, 'index']);
        Route::get('/purchases/edit/{id}', [PurchaseController::class, 'show']);
        Route::put('/purchases/update/{id}', [PurchaseController::class, 'update']);
        Route::delete('/purchase/delete/{id}', [PurchaseController::class, 'destroy']);


        // ======================= report ======================


        Route::get('/report/purchases', [ReportController::class, 'getPurchaseReports']);
        Route::get('/report/shifts', [ReportController::class, 'getShiftReport']);
        
        // ========================== customer group ========================
        Route::get('/customer-group/list', [CustomerGroupController::class, 'index']);
        Route::put('/customer-group/update/{id}', [CustomerGroupController::class, 'update']);
        Route::delete('/customer-group/delete/{id}', [CustomerGroupController::class, 'destroy']);
        
        
        
        
        
    });
    Route::get('/report/sales', [ReportController::class, 'getSaleReports']);
    Route::post('/customer-group/create', [CustomerGroupController::class, 'addCustomerGroup']);
    Route::get('/sale-payment/show/{id}', [SalePaymentController::class, 'getPaymentBySaleId']);
    Route::post('/purchase/create', [PurchaseController::class, 'store']);

    Route::get('open-shift/show/{id}', [ShiftController::class, 'OpenshiftListWithProducts']);
    Route::get('open-shift/processing-shift', [ShiftController::class, 'show']);
    Route::get('warehouse/product/list/{id}', [WarehouseProductController::class, 'index']);

    Route::get('/role-permission/{role_id}', [PermissionController::class, 'get_role_permissions']);

    Route::get('/user/list/{type}', [UserController::class, 'index']);
        Route::post('sale-payment/create', [SalePaymentController::class, 'store']);

        Route::put('sale/update/{id}', [SaleController::class, 'update']);



Route::post('/language', [LanguageController::class, 'change'])->name('change.language');
        Route::get('/customer/show/{id}', [UserController::class, 'show']);


//========= Route Purchase_Item api ================
// Route::apiResource('purchase_Items', PurchaseItemController::class);
Route::get('/purchase_items/list', [PurchaseItemController::class, 'index']);
Route::post('/purchase_items/create', [PurchaseItemController::class, 'store']);
Route::get('/purchase_items/edit/{id}', [PurchaseItemController::class, 'show']);
Route::put('/purchase_items/update/{id}', [PurchaseItemController::class, 'update']);
Route::delete('/purchase_items/delete/{id}', [PurchaseItemController::class, 'destroy']);

Route::get('/images/{filename}', function ($filename) {
    $path = storage_path('app/public/logo/' . $filename);

    if (!file_exists($path)) {
        return response()->json(['error' => 'File not found'], 404);
    }

    return response()->file($path)->header('Access-Control-Allow-Origin', '*');
});