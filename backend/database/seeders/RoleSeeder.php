<?php

namespace Database\Seeders;

use App\Models\Permission;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Role;
use App\Models\RolePermission;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {

        //  permission seeder 


        Permission::create(['name' => 'Dashboard.view', 'group' => 'Dashboard', 'web_route_key' => '']);
        // product
        // product
        Permission::create(['name' => 'Product.list', 'group' => 'Product', 'web_route_key' => 'product']);
        Permission::create(['name' => 'Product.create', 'group' => 'Product', 'web_route_key' => 'product/create']);
        Permission::create(['name' => 'Product.edit', 'group' => 'Product', 'web_route_key' => 'product/edit']);
        Permission::create(['name' => 'Product.delete', 'group' => 'Product', 'web_route_key' => 'product/delete']);
        Permission::create(['name' => 'Product.import', 'group' => 'Product', 'web_route_key' => 'product/import']);
        Permission::create(['name' => 'Product.export', 'group' => 'Product', 'web_route_key' => 'product/export']);
        Permission::create(['name' => 'inventory', 'group' => 'Regional', 'web_route_key' => 'inventory']);

        // category

        Permission::create(['name' => 'Category.list', 'group' => 'Category', 'web_route_key' => 'category']);
        Permission::create(['name' => 'Category.create', 'group' => 'Category', 'web_route_key' => 'category/create']);
        Permission::create(['name' => 'Category.edit', 'group' => 'Category', 'web_route_key' => 'category/edit']);
        Permission::create(['name' => 'Category.delete', 'group' => 'Category', 'web_route_key' => 'category/delete']);


        // transition 

        Permission::create(['name' => 'POS.access', 'group' => 'POS', 'web_route_key' => 'pos']);
        Permission::create(['name' => 'POS.create', 'group' => 'POS', 'web_route_key' => 'pos/create']);
        Permission::create(['name' => 'POS.void', 'group' => 'POS', 'web_route_key' => 'pos/void']);
        Permission::create(['name' => 'POS.refund', 'group' => 'POS', 'web_route_key' => 'pos/refund']);
        Permission::create(['name' => 'POS.discount', 'group' => 'POS', 'web_route_key' => 'pos/discount']);

        // reports

        Permission::create(['name' => 'Report.sales', 'group' => 'Report', 'web_route_key' => 'report/sales']);
        Permission::create(['name' => 'Report.inventory', 'group' => 'Report', 'web_route_key' => 'report/inventory']);
        Permission::create(['name' => 'Report.profit', 'group' => 'Report', 'web_route_key' => 'report/profit']);
        Permission::create(['name' => 'Report.export', 'group' => 'Report', 'web_route_key' => 'report/export']);

        // user management

        Permission::create(['name' => 'User.list', 'group' => 'User', 'web_route_key' => 'user']);
        Permission::create(['name' => 'User.create', 'group' => 'User', 'web_route_key' => 'user/create']);
        Permission::create(['name' => 'User.edit', 'group' => 'User', 'web_route_key' => 'user/edit']);
        Permission::create(['name' => 'User.delete', 'group' => 'User', 'web_route_key' => 'user/delete']);
        Permission::create(['name' => 'User.roles', 'group' => 'User', 'web_route_key' => 'user/roles']);

        // system setting 

        Permission::create(['name' => 'Setting.pos', 'group' => 'Setting', 'web_route_key' => 'setting/pos']);
        Permission::create(['name' => 'Setting.tax', 'group' => 'Setting', 'web_route_key' => 'setting/tax']);
        Permission::create(['name' => 'Setting.payment', 'group' => 'Setting', 'web_route_key' => 'setting/payment']);
        Permission::create(['name' => 'Setting.company', 'group' => 'Setting', 'web_route_key' => 'setting/company']);

        // brands

        Permission::create(['name' => 'Brand.list', 'group' => 'Brand', 'web_route_key' => 'brand']);
        Permission::create(['name' => 'Brand.create', 'group' => 'Brand', 'web_route_key' => 'brand/create']);
        Permission::create(['name' => 'Brand.edit', 'group' => 'Brand', 'web_route_key' => 'brand/edit']);
        Permission::create(['name' => 'Brand.delete', 'group' => 'Brand', 'web_route_key' => 'brand/delete']);
        Permission::create(['name' => 'Brand.import', 'group' => 'Brand', 'web_route_key' => 'brand/import']);
        Permission::create(['name' => 'Brand.export', 'group' => 'Brand', 'web_route_key' => 'brand/export']);

        // units

        Permission::create(['name' => 'Unit.list', 'group' => 'Unit', 'web_route_key' => 'unit']);
        Permission::create(['name' => 'Unit.create', 'group' => 'Unit', 'web_route_key' => 'unit/create']);
        Permission::create(['name' => 'Unit.edit', 'group' => 'Unit', 'web_route_key' => 'unit/edit']);
        Permission::create(['name' => 'Unit.delete', 'group' => 'Unit', 'web_route_key' => 'unit/delete']);

        // supplier

        Permission::create(['name' => 'Supplier.list', 'group' => 'Supplier', 'web_route_key' => 'supplier']);
        Permission::create(['name' => 'Supplier.create', 'group' => 'Supplier', 'web_route_key' => 'supplier/create']);
        Permission::create(['name' => 'Supplier.edit', 'group' => 'Supplier', 'web_route_key' => 'supplier/edit']);
        Permission::create(['name' => 'Supplier.delete', 'group' => 'Supplier', 'web_route_key' => 'supplier/delete']);
        Permission::create(['name' => 'Supplier.import', 'group' => 'Supplier', 'web_route_key' => 'supplier/import']);
        Permission::create(['name' => 'Supplier.export', 'group' => 'Supplier', 'web_route_key' => 'supplier/export']);

        // promotion

        Permission::create(['name' => 'Promotion.list', 'group' => 'Promotion', 'web_route_key' => 'promotion']);
        Permission::create(['name' => 'Promotion.create', 'group' => 'Promotion', 'web_route_key' => 'promotion/create']);
        Permission::create(['name' => 'Promotion.edit', 'group' => 'Promotion', 'web_route_key' => 'promotion/edit']);
        Permission::create(['name' => 'Promotion.delete', 'group' => 'Promotion', 'web_route_key' => 'promotion/delete']);
        Permission::create(['name' => 'Promotion.activate', 'group' => 'Promotion', 'web_route_key' => 'promotion/activate']);

        // customers

        Permission::create(['name' => 'Customer.list', 'group' => 'Customer', 'web_route_key' => 'customer']);
        Permission::create(['name' => 'Customer.create', 'group' => 'Customer', 'web_route_key' => 'customer/create']);
        Permission::create(['name' => 'Customer.edit', 'group' => 'Customer', 'web_route_key' => 'customer/edit']);
        Permission::create(['name' => 'Customer.delete', 'group' => 'Customer', 'web_route_key' => 'customer/delete']);
        Permission::create(['name' => 'Customer.import', 'group' => 'Customer', 'web_route_key' => 'customer/import']);
        Permission::create(['name' => 'Customer.export', 'group' => 'Customer', 'web_route_key' => 'customer/export']);
        Permission::create(['name' => 'Customer.loyalty', 'group' => 'Customer', 'web_route_key' => 'customer/loyalty']);

        // warehouses

        Permission::create(['name' => 'Warehouse.list', 'group' => 'Warehouse', 'web_route_key' => 'warehouse']);
        Permission::create(['name' => 'Warehouse.create', 'group' => 'Warehouse', 'web_route_key' => 'warehouse/create']);
        Permission::create(['name' => 'Warehouse.edit', 'group' => 'Warehouse', 'web_route_key' => 'warehouse/edit']);
        Permission::create(['name' => 'Warehouse.delete', 'group' => 'Warehouse', 'web_route_key' => 'warehouse/delete']);
        Permission::create(['name' => 'Warehouse.transfer', 'group' => 'Warehouse', 'web_route_key' => 'warehouse/transfer']);
        Permission::create(['name' => 'Warehouse.inventory', 'group' => 'Warehouse', 'web_route_key' => 'warehouse/inventory']);

        // comnpany 

        Permission::create(['name' => 'Company.list', 'group' => 'Company', 'web_route_key' => 'company']);
        Permission::create(['name' => 'Company.create', 'group' => 'Company', 'web_route_key' => 'company/create']);
        Permission::create(['name' => 'Company.edit', 'group' => 'Company', 'web_route_key' => 'company/edit']);
        Permission::create(['name' => 'Company.delete', 'group' => 'Company', 'web_route_key' => 'company/delete']);
        Permission::create(['name' => 'Company.branches', 'group' => 'Company', 'web_route_key' => 'company/branches']);

        // regionals

        Permission::create(['name' => 'Regional.list', 'group' => 'Regional', 'web_route_key' => 'regional']);
        Permission::create(['name' => 'Regional.create', 'group' => 'Regional', 'web_route_key' => 'regional/create']);
        Permission::create(['name' => 'Regional.edit', 'group' => 'Regional', 'web_route_key' => 'regional/edit']);
        Permission::create(['name' => 'Regional.delete', 'group' => 'Regional', 'web_route_key' => 'regional/delete']);
        Permission::create(['name' => 'Regional.areas', 'group' => 'Regional', 'web_route_key' => 'regional/areas']);

        // For system backups
        // Permission::create(['name' => 'System.backup', 'group' => 'System', 'web_route_key' => 'system/backup']);
        // Permission::create(['name' => 'System.restore', 'group' => 'System', 'web_route_key' => 'system/restore']);

        // For barcode operations
        Permission::create(['name' => 'Barcode.generate', 'group' => 'System', 'web_route_key' => 'barcode/generate']);
        Permission::create(['name' => 'Barcode.print', 'group' => 'System', 'web_route_key' => 'barcode/print']);

        // For system backups
        Permission::create(['name' => 'System.backup', 'group' => 'System', 'web_route_key' => 'system/backup']);
        Permission::create(['name' => 'System.restore', 'group' => 'System', 'web_route_key' => 'system/restore']);
        Permission::create(['name' => 'System.view', 'group' => 'Setting', 'web_route_key' => 'setting']);
        
        Permission::create(['name' => 'Policy.view', 'group' => 'Policy', 'web_route_key' => 'policy']);
        Permission::create(['name' => 'Role.view', 'group' => 'Role', 'web_route_key' => 'role']);
        Permission::create(['name' => 'Role.create', 'group' => 'Role', 'web_route_key' => 'role/create']);
        Permission::create(['name' => 'Role.edit', 'group' => 'Role', 'web_route_key' => 'role/edit']);
        Permission::create(['name' => 'Role.delete', 'group' => 'Role', 'web_route_key' => 'role/delete']);
        
        Permission::create(['name' => 'Permission.view', 'group' => 'Permission', 'web_route_key' => 'permission']);
        Permission::create(['name' => 'Permission.create', 'group' => 'Permission', 'web_route_key' => 'permission/create']);
        Permission::create(['name' => 'Permission.edit', 'group' => 'Permission', 'web_route_key' => 'permission/edit']);
        Permission::create(['name' => 'Permission.delete', 'group' => 'Permission', 'web_route_key' => 'permission/delete']);
        
        Permission::create(['name' => 'Employee.view', 'group' => 'Employee', 'web_route_key' => 'employee']);
        Permission::create(['name' => 'Employee.create', 'group' => 'Employee', 'web_route_key' => 'employee/create']);
        Permission::create(['name' => 'Employee.edit', 'group' => 'Employee', 'web_route_key' => 'employee/edit']);
        Permission::create(['name' => 'Employee.delete', 'group' => 'Employee', 'web_route_key' => 'employee/delete']);


        // Permission::create(['name' => 'Perchase.view', 'group' => 'Purchase', 'web_route_key' => 'purchase']);
        // Permission::create(['name' => 'Perchase.create', 'group' => 'Purchase', 'web_route_key' => 'purchase/create']);
        // Permission::create(['name' => 'Perchase.edit', 'group' => 'Purchase', 'web_route_key' => 'purchase/edit']);
        // Permission::create(['name' => 'Perchase.delete', 'group' => 'Purchase', 'web_route_key' => 'purchase/delete']);


        Permission::create(['name' => 'Perchase.view', 'group' => 'Purchase', 'web_route_key' => 'purchase']);
        Permission::create(['name' => 'Perchase.create', 'group' => 'Purchase', 'web_route_key' => 'purchase/create']);
        Permission::create(['name' => 'Perchase.edit', 'group' => 'Purchase', 'web_route_key' => 'purchase/edit']);
        Permission::create(['name' => 'Perchase.delete', 'group' => 'Purchase', 'web_route_key' => 'purchase/delete']);
        Permission::create(['name' => 'Perchase.detail', 'group' => 'Purchase', 'web_route_key' => 'purchase/detail']);


        Permission::create(['name' => 'Stock.view', 'group' => 'Stock', 'web_route_key' => 'stock']);
        Permission::create(['name' => 'Adjustment.view', 'group' => 'Adjustment', 'web_route_key' => 'adjustment']);
        Permission::create(['name' => 'Adjustment.create', 'group' => 'Adjustment', 'web_route_key' => 'adjustment/create']);
        Permission::create(['name' => 'Adjustment.edit', 'group' => 'Adjustment', 'web_route_key' => 'adjustment/edit']);
        Permission::create(['name' => 'Adjustment.delete', 'group' => 'Adjustment', 'web_route_key' => 'adjustment/delete']);
        Permission::create(['name' => 'Adjustment.detail', 'group' => 'Adjustment', 'web_route_key' => 'adjustment/detail']);


        Permission::create(['name' => 'Transfer.view', 'group' => 'Transfer', 'web_route_key' => 'transfer']);
        Permission::create(['name' => 'Transfer.create', 'group' => 'Transfer', 'web_route_key' => 'transfer/create']);
        Permission::create(['name' => 'Transfer.edit', 'group' => 'Transfer', 'web_route_key' => 'transfer/edit']);
        Permission::create(['name' => 'Transfer.delete', 'group' => 'Transfer', 'web_route_key' => 'transfer/delete']);
        Permission::create(['name' => 'Transfer.detail', 'group' => 'Transfer', 'web_route_key' => 'transfer/detail']);


        Permission::create(['name' => 'SaleReturn.view', 'group' => 'SaleReturn', 'web_route_key' => 'sale-return']);
        Permission::create(['name' => 'SaleReturn.create', 'group' => 'SaleReturn', 'web_route_key' => 'sale-return/create']);
        Permission::create(['name' => 'SaleReturn.edit', 'group' => 'SaleReturn', 'web_route_key' => 'sale-return/edit']);
        Permission::create(['name' => 'SaleReturn.delete', 'group' => 'SaleReturn', 'web_route_key' => 'sale-return/delete']);
        Permission::create(['name' => 'SaleReturn.detail', 'group' => 'SaleReturn', 'web_route_key' => 'sale-return/detail']);

        Permission::create(['name' => 'StockAlert.detail', 'group' => 'StockAlert', 'web_route_key' => 'stock-alert']);
        Permission::create(['name' => 'StockAlert.create', 'group' => 'StockAlert', 'web_route_key' => 'stock-alert/create']);
        Permission::create(['name' => 'StockAlert.edit', 'group' => 'StockAlert', 'web_route_key' => 'stock-alert/edit']);
        Permission::create(['name' => 'StockAlert.delete', 'group' => 'StockAlert', 'web_route_key' => 'stock-alert/delete']);
        Permission::create(['name' => 'StockAlert.detail', 'group' => 'StockAlert', 'web_route_key' => 'stock-alert/detail']);

        Permission::create(['name' => 'RequestAlert.view', 'group' => 'RequestAlert', 'web_route_key' => 'request-alert']);
        Permission::create(['name' => 'RequestAlert.create', 'group' => 'RequestAlert', 'web_route_key' => 'request-alert/create']);
        Permission::create(['name' => 'RequestAlert.edit', 'group' => 'RequestAlert', 'web_route_key' => 'request-alert/edit']);
        Permission::create(['name' => 'RequestAlert.delete', 'group' => 'RequestAlert', 'web_route_key' => 'request-alert/delete']);
        Permission::create(['name' => 'RequestAlert.detail', 'group' => 'RequestAlert', 'web_route_key' => 'request-alert/detail']);
        
        Permission::create(['name' => 'Report.view', 'group' => 'Reports', 'web_route_key' => 'reports']);
        Permission::create(['name' => 'Report.product', 'group' => 'Reports', 'web_route_key' => 'reports/product']);
        Permission::create(['name' => 'Report.stock', 'group' => 'Reports', 'web_route_key' => 'reports/stock']);
        Permission::create(['name' => 'Report.fast-slow', 'group' => 'Reports', 'web_route_key' => 'reports/low-best-moving']);
        Permission::create(['name' => 'Report.sale', 'group' => 'Reports', 'web_route_key' => 'reports/sale']);
        Permission::create(['name' => 'Report.purchase', 'group' => 'Reports', 'web_route_key' => 'reports/purchase']);
        Permission::create(['name' => 'Report.adjustment', 'group' => 'Reports', 'web_route_key' => 'reports/adjustment']);
        Permission::create(['name' => 'Report.supplier', 'group' => 'Reports', 'web_route_key' => 'reports/supplier']);
        Permission::create(['name' => 'Report.sale-return', 'group' => 'Reports', 'web_route_key' => 'reports/sale-return"']);


        Permission::create(['name' => 'Accounting.view', 'group' => 'Accounting', 'web_route_key' => 'accounting']);
        Permission::create(['name' => 'Accounting.expense', 'group' => 'Accounting', 'web_route_key' => 'accounting/expense']);
        Permission::create(['name' => 'Accounting.revenue', 'group' => 'Accounting', 'web_route_key' => 'accounting/revenue']);
        Permission::create(['name' => 'Accounting.payment', 'group' => 'Accounting', 'web_route_key' => 'accounting/payment']);
        Permission::create(['name' => 'Accounting.tax', 'group' => 'Accounting', 'web_route_key' => 'accounting/tax']);
        Permission::create(['name' => 'Accounting.income-statement', 'group' => 'Accounting', 'web_route_key' => 'accounting/income-statement']);
        Permission::create(['name' => 'Accounting.balance-sheet', 'group' => 'Accounting', 'web_route_key' => 'accounting/balance-sheet']);
        // has permission
        Permission::create(['name' => 'ProductGroup.view', 'group' => 'ProductGroup', 'web_route_key' => 'product-group']);
        Permission::create(['name' => 'ProductGroup.add', 'group' => 'ProductGroup', 'web_route_key' => 'product-group/add']);
        Permission::create(['name' => 'ProductGroup.edit', 'group' => 'ProductGroup', 'web_route_key' => 'product-group/edit']);
        Permission::create(['name' => 'ProductGroup.delete', 'group' => 'ProductGroup', 'web_route_key' => 'product-group/delete']);


        // Permission::create(['name' => 'Brand.view', 'group' => 'Brand', 'web_route_key' => 'brand']);
        // Permission::create(['name' => 'Brand.add', 'group' => 'Brand', 'web_route_key' => 'brand/add']);
        // Permission::create(['name' => 'Brand.edit', 'group' => 'Brand', 'web_route_key' => 'brand/edit']);
        // Permission::create(['name' => 'Brand.delete', 'group' => 'Brand', 'web_route_key' => 'brand/delete']);


        Permission::create(['name' => 'UomTranser.view', 'group' => 'UomTranser', 'web_route_key' => 'transfer/uom']);
        Permission::create(['name' => 'UomTranser.add', 'group' => 'UomTranser', 'web_route_key' => 'transfer/uom/add']);
        Permission::create(['name' => 'UomTranser.edit', 'group' => 'UomTranser', 'web_route_key' => 'transfer/uom/edit']);
        Permission::create(['name' => 'UomTranser.delete', 'group' => 'UomTranser', 'web_route_key' => 'transfer/uom/delete']);
        
        Permission::create(['name' => 'StockTransfer.view', 'group' => 'StockTransfer', 'web_route_key' => 'transfer/stock']);
        Permission::create(['name' => 'StockTransfer.add', 'group' => 'StockTransfer', 'web_route_key' => 'transfer/stock/add']);
        Permission::create(['name' => 'StockTransfer.edit', 'group' => 'StockTransfer', 'web_route_key' => 'transfer/stock/edit']);
        Permission::create(['name' => 'StockTransfer.delete', 'group' => 'StockTransfer', 'web_route_key' => 'transfer/stock/delete']);
        
        Permission::create(['name' => 'UomConversion.view', 'group' => 'UomConversion', 'web_route_key' => 'uom-conversion']);
        Permission::create(['name' => 'UomConversion.add', 'group' => 'UomConversion', 'web_route_key' => 'uom-conversion/add']);
        Permission::create(['name' => 'UomConversion.edit', 'group' => 'UomConversion', 'web_route_key' => 'uom-conversion/edit']);
        Permission::create(['name' => 'UomConversion.delete', 'group' => 'UomConversion', 'web_route_key' => 'uom-conversion/delete']);


        Permission::create(['name' => 'Sale.access', 'group' => 'Sale', 'web_route_key' => 'sale']);
        Permission::create(['name' => 'Sale.create', 'group' => 'Sale', 'web_route_key' => 'sale/create']);
        Permission::create(['name' => 'Sale.void', 'group' => 'Sale', 'web_route_key' => 'sale/void']);
        Permission::create(['name' => 'Sale.refund', 'group' => 'Sale', 'web_route_key' => 'sale/refund']);
        Permission::create(['name' => 'Sale.discount', 'group' => 'Sale', 'web_route_key' => 'sale/discount']);
        for ($i = 1; $i <= 165; $i++) {
            RolePermission::create(['role_id' => 1, 'permission_id' => $i]);
        }
        for ($i = 1; $i <= 20; $i++) {
            RolePermission::create(['role_id' => 2, 'permission_id' => $i]);
        }
        
    }
}
