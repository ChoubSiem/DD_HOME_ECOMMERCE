import { BrowserRouter, Routes, Route, Navigate  } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import MainLayout from "./components/layouts/MainLayout";
import Profile from "./pages/profile/UserProfile";
import Role from "./pages/policy/role/Role";
import RolePermissionEdit from "./components/policy/role/EditRoleHasPermission";
import Permission from "./pages/policy/permission/Permission";
import Employee from "./pages/policy/employee/Employee";
import Product from "./pages/inventory/product/Product";
import AddProduct from "./pages/inventory/product/AddProduct";
import EditProduct from "./pages/inventory/product/EditProduct";
import Category from "./pages/inventory/category/Category";
import Unit from "./pages/inventory/unit/Unit";
import Supplier from "./pages/inventory/supplier/Supplier";
import SupplierGroup from "./pages/inventory/supplier/GroupSupplier";
import Warehouse from "./pages/inventory/warehouse/Warehouse";
import CreateWarehouse from "./components/warehouse/Create";
import EditWarehouse from "./components/warehouse/Edit";
import Company from "./pages/inventory/company/Company";
import CreateCompany from "./components/company/Create";
import EditCompany from "./components/company/Edit";
import Regional from "./pages/inventory/regional/Regional";
import CreateRegional from "./components/regional/Create";
import EditRegional from "./components/regional/Edit";
import Grade from "./pages/inventory/grade/Grade";
import POS from "./pages/pos/PosSale";
import AddPos from "./pages/pos/AddPos";
import Sale from "./pages/sale/Sale";
import AddSale from "./pages/sale/AddSale";
import EditSale from "./pages/sale/EditSale";
import Purchase from "./pages/purchase/Purchase";
import AddPurchase from "./pages/purchase/AddPurchase";
import EditPurchase from "./pages/purchase/EditPurchase";
import Adjustment from "./pages/stock/adjustment/Adjustment";
import AddAdjustment from "./pages/stock/adjustment/AddAdjustment";
import EditAdjustment from "./pages/stock/adjustment/EditAdjustment";
import Transfer from "./pages/stock/uom_transfer/StockTransfer";
import AddTransfer from "./pages/stock/uom_transfer/AddStockTransfer";
import EditTransfer from "./pages/stock/uom_transfer/EditStockTransfer";
import StockTransfer from "./pages/stock/stock_transfer/StockTransfer";
import AddStockTransfer from "./pages/stock/stock_transfer/AddStockTransfer";
import EditStockTransfer from "./pages/stock/stock_transfer/EditStockTransfer";
import Customer from "./pages/customer/Customer";
import CustomerGroup from "./pages/customer/CustomerGroup";
import SaleReturn from "./pages/sale_return/SaleReturn";
import AddSaleReturn from "./pages/sale_return/AddSaleReturn";
import EditSaleReturn from "./pages/sale_return/EditSaleReturn";
import StockAlert from "./pages/notification/StockAlert";
import RequestAlert from "./pages/notification/RequestAlert";
import ProductReport from "./pages/report/stock_report/ProductReport";
import Stock from "./pages/report/stock_report/Stock";
import StockListReport from "./pages/report/stock_report/StockListReport";
import LowBestSellerReport from "./pages/report/low_best_product/LowestBestReport";
import SaleReportList from "./pages/report/sale_report/SaleListReport";
import PurchaseReport from "./pages/report/purchase/Purchase";
import PurchaseListReport from "./pages/report/purchase/PurchaseListReport";
// import AdjustmentReport from "./pages/report/adjustment/Adjustment";
import AdjustmentListReport from "./pages/report/adjustment/AdjustmentListReport";
import SupplierListReport from "./pages/report/supplier/SupplierListReport";
// import SupplierReport from "./pages/report/supplier/Supplier";
import SaleReturnReport from "./pages/report/sale_return/SaleReturn";
import ShiftReport from "./pages/report/shift_report/ShiftReport";
import ShiftListReport from "./pages/report/shift_report/ShiftListReport";
import PaymentReport from "./pages/accounting/payment/Payment";
import PaymentListReport from "./pages/accounting/payment/PaymentListReport";
import AccountingExpense from "./pages/accounting/expense/Expense";
import AccountingRevenue from "./pages/accounting/revenue/RevenueReport";
import ProductForWarehouse from "./components/warehouse/ProductForWarehouse";
import Login from "./pages/auth/Login";
import NotFoundPage from "./pages/not_found/NotFound";
import DDLogo from "./assets/logo/DD_Home_Logo 2.jpg";
import Setting from "./pages/setting/Setting";
import PaymentPos from "./pages/pos/PaymentPos";
import { useProfileStore } from './stores/ProfileStore';

import React , { useEffect } from "react";
import ProtectedRoute from './components/route/ProtectedRoute';
import ProductGroup from "./pages/product_group/ProductGroup";
import EmployeeCreate from "./components/policy/employee/create/EmployeeCreate";
import EmployeeEdit from "./components/policy/employee/edit/EmployeeForm/EmployeeForm";
import UomConversion from "./pages/inventory/UomConversion/UomConversion";
import BrandManagement from "./pages/brand/Brand";
// import AddSaleReturn from "./pages/sale_return/AddSaleReturn";
// import { useNavigate } from 'react-router-dom';

// sale report 
import DailySaleReport from "./pages/report/sale_report/SaleReport";

const App = () => {
  const { initialize, login, logout, isAuthenticated, user, loading } = useProfileStore();
  useEffect(() => {        
    if (!isAuthenticated) {
      initialize();
    }
  }, [isAuthenticated, loading]);

  if (loading) {
    return (
      <div style={{ textAlign: "center", paddingTop: "100px" }}>
        <img src={DDLogo} alt="Loading..." width="100" />
      </div>
    );
  }
  
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <Login />} />
        <Route element={<MainLayout />}>
          <Route index element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/role" element={<Role />} />
          <Route path="/role/permission/edit/:id" element={<RolePermissionEdit />} />
          <Route path="/permission" element={<Permission />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/warehouse/product/:id" element={<ProductForWarehouse />} />
          <Route path="/employee" element={<Employee />} />
          <Route path="/employee/create" element={<EmployeeCreate />} />
          <Route path="/employee/edit/:id" element={<EmployeeEdit />} />
          <Route path="/product" element={<Product />} />
          <Route path="/product/add" element={<AddProduct />} />
          <Route path="/product/edit/:id" element={<EditProduct />} />
          <Route path="/category" element={<Category />} />
          <Route path="/unit" element={<Unit />} />
          <Route path="/supplier" element={<Supplier />} />
          <Route path="/supplier-group" element={<SupplierGroup />} />
          <Route path="/warehouse" element={<Warehouse />} />
          <Route path="/warehouse/add" element={<CreateWarehouse />} />
          <Route path="/warehouse/edit/:id" element={<EditWarehouse />} />
          <Route path="/company" element={<Company />} />
          <Route path="/company/add" element={<CreateCompany />} />
          <Route path="/company/edit/:id" element={<EditCompany />} />
          <Route path="/regional" element={<Regional />} />
          <Route path="/regional/add" element={<CreateRegional />} />
          <Route path="/regional/edit/:id" element={<EditRegional />} />
          <Route path="/product-group" element={<ProductGroup />} />
          <Route path="/brand" element={<BrandManagement />} />
          <Route path="/grade" element={<Grade />} />
          <Route path="/pos" element={<POS />} />
          <Route path="/purchase" element={<Purchase />} />
          <Route path="/purchase/add" element={<AddPurchase />} />
          <Route path="/purchase/edit" element={<EditPurchase />} />
          <Route path="/adjustment" element={<Adjustment />} />
          <Route path="/adjustment/add" element={<AddAdjustment />} />
          <Route path="/adjustment/edit/:id" element={<EditAdjustment />} />
          <Route path="/transfer/uom" element={<Transfer />} />
          <Route path="/transfer/uom/add" element={<AddTransfer />} />
          <Route path="/transfer/uom/edit/:id" element={<EditTransfer />} />
          <Route path="/transfer/stock" element={<StockTransfer />} />
          <Route path="/transfer/stock/add" element={<AddStockTransfer />} />
          <Route path="/transfer/stock/edit/:id" element={<EditStockTransfer />} />
          <Route path="/customer" element={<Customer />} />
          <Route path="/customer-group" element={<CustomerGroup />} />
          <Route path="/sale-return" element={<SaleReturn />} />
          <Route path="/sale-return/add/:id" element={<AddSaleReturn />} />
          <Route path="/sale-return/show/:saleReturnId" element={<SaleReturn />} />
          <Route path="/sale-return/update/:saleReturnId" element={<SaleReturn />} />
          <Route path="/sale-return/delete/:saleReturnId" element={<SaleReturn />} />

          {/* <Route path="/sale-return/add" element={<AddSaleReturn />} /> */}
          {/* <Route path="/sale-return/edit" element={<EditSaleReturn />} /> */}
          <Route path="/stock-alert" element={<StockAlert />} />
          <Route path="/request-alert" element={<RequestAlert />} />
          {/* ============== sale report =============== */}

          <Route path="/reports/daily-sale" element={<DailySaleReport/>} />
          <Route path="/reports/product" element={<ProductReport />} />
          <Route path="/reports/stock" element={<Stock />} />
          <Route path="/stock" element={<StockListReport />} />
          <Route path="/reports/low-best-reports" element={<LowBestSellerReport />} />
          <Route path="/reports/sale" element={<SaleReportList />} />
          <Route path="/reports/purchase/list" element={<PurchaseListReport />} />
          <Route path="/reports/purchase" element={<PurchaseReport />} />
          <Route path="/reports/adjustment" element={<AdjustmentListReport />} />
          <Route path="/reports/supplier" element={<SupplierListReport />} />
          <Route path="/reports/sale-return" element={<SaleReturnReport />} />
          <Route path="/reports/shift/list" element={<ShiftListReport />} />
          <Route path="/reports/shift" element={<ShiftReport />} />
          <Route path="/setting" element={<Setting />} />
          <Route path="/pos/payment" element={<PaymentPos />} />
          <Route path="/accounting/payment" element={<PaymentListReport />} />
          <Route path="/reports/payments" element={<PaymentReport />} />
          <Route path="/accounting/expense" element={<AccountingExpense />} />
          <Route path="/accounting/revenue" element={<AccountingRevenue />} />
          <Route path="/uom-conversion" element={<UomConversion />} />
          <Route path="/sale" element={<Sale />} />
          <Route path="/sale/add" element={<AddSale />} />
          <Route path="/sale/edit/:id" element={<EditSale />} />
        </Route>
          <Route path="/pos/add" element={<AddPos/>} />
        
        {/* Catch-all route */}
        <Route path="*" element={isAuthenticated ? <NotFoundPage /> : <Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
