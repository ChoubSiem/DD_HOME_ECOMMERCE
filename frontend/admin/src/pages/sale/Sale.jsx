import React, { useState ,useEffect, use} from "react";
import {
  Card,
  Input,
  Button,
  Select,
  Modal,
  Form,
  InputNumber,
  Menu ,
  message,
  DatePicker ,
  Spin
} from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  FilterOutlined
} from "@ant-design/icons";
import SaleTable from "../../components/sale/SaleTable";
import AddPaymentModal from "../../components/pos/payment/AddPayment";
import ViewPaymentModal from "../../components/pos/payment/ViewPayment";
import { useNavigate } from "react-router-dom";
import "./Sale.css";
import { useStock } from "../../hooks/UseStock";
import { useSale } from "../../hooks/UseSale";
import Cookies from "js-cookie"
const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;
const StockTransferPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const {handleGetStockTransfers,handleGetUomTransferDelete} = useStock();
  const [transfers , setTransfers] = useState([]);
  const [sales , setSales] = useState([]);
  const token = localStorage.getItem("token");
  const user = JSON.parse(Cookies.get("user"));
  const {handleSaleInventory ,handleDeleteSaleInventory} = useSale();
  const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);
  const [isViewPaymentModalVisible, setIsViewPaymentModalVisible] = useState(false);
  const [currentSale, setCurrentSale] = useState(null);
  const handleSearchChange = (value) => {
    setSearchTerm(value);
  };
  const [form] = Form.useForm();

  const onFinish = (values) => {
    // console.log('Advanced filter values:', values);
  };

  const handleFilter = () => {
    setShowFilter(!showFilter);
  };

  const handleAddSaleReturn = (saleId, type) => {
    navigate(`/sale-return/add/${type}/${saleId}`);
  };


  const handleSalesInveontoryData = async() =>{
    setLoading(true);
    const result = await handleSaleInventory(user.warehouse_id , token);    
    if (result.success) {
      setSales(result.sales);
      setLoading(false);
    }
  }  
  useEffect(() => {
    if (token && user) {
      handleUomTransferData();
      handleSalesInveontoryData();
    }
  }, [token, user?.warehouse_id]);

  const filteredProducts = selectedProducts.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const handleDetail = (product) => {    
    setCurrentProduct(product.items);
    setIsModalVisible(true);
  };

  const handleUomTransferData = async()=>{
    let result = await handleGetStockTransfers(user.warehouse_id,token);    
    if (result.success) {
      setTransfers(result.stockTransfers);
    }
  }

  const handleAdd = () => {
    setLoading(true);
    setTimeout(() => {
      navigate("/sale/add");
      setLoading(false);
    }, 500);
  };

  const handleEdit = (product) => {
    setLoading(true);    
    setTimeout(() => {
      navigate(`/sale/edit/${product.id}`);
      setLoading(false);
    }, 500);
  };
  
  const handleDelete = async (saleId) => {
    try {

      const response = await handleDeleteSaleInventory( saleId,token);      
      if (response.success) {

        message.success(`Product ${saleId} deleted successfully`);
        await handleSalesInveontoryData();
      }
    } catch (error) {
      setSelectedProducts(selectedProducts);
    }
  };

  const handleSave = (values) => {
    const updatedProducts = selectedProducts.map((p) =>
      p.key === currentProduct.key ? { ...p, ...values } : p
    );
    setSelectedProducts(updatedProducts);
    setIsModalVisible(false);
    message.success("Product updated successfully");
  };
  
  const handleAddPayment = (sale) => {
    setCurrentSale(sale);
    setIsPaymentModalVisible(true);
  };

  const handleViewPayment = (sale) => {
    setCurrentSale(sale);
    setIsViewPaymentModalVisible(true);
  };

  const handlePaymentSubmit = (sale) => {
    setIsPaymentModalVisible(false);
  };

  return (
    <Spin spinning={loading}>
      <div className="product-management">        
        <Card className="header-card">
          <div className="header-content">
            <div>
              <h1 style={{ color: '#52c41a' }}>Sales Inventory</h1>
              <p>Manage your sales and transactions</p>
            </div>
            <Button 
              onClick={handleAdd} 
              type="primary" 
              icon={<PlusOutlined />} 
              style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
            >
              Add Sale
            </Button>
          </div>
        </Card>

        <Card className="filter-card">
        <div className="filter-content">
          <Search
            placeholder="Search products by name, code or barcode..."
            prefix={<SearchOutlined />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: 400 }}
            allowClear
            enterButton
          />

          <div className="filter-controls">
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: 120 }}
              placeholder="Status"
            >
              <Option value="all">All Statuses</Option>
              <Option value="active">Active</Option>
              <Option value="inactive">Inactive</Option>
            </Select>

            <Select
              value={categoryFilter}
              onChange={setCategoryFilter}
              style={{ width: 150 }}
              placeholder="Category"
            >
              <Option value="all">All Categories</Option>
              <Option value="Electronics">Electronics</Option>
              <Option value="Clothing">Clothing</Option>
              <Option value="Home">Home</Option>
            </Select>

            <Button 
              type={showFilter ? 'primary' : 'default'} 
              onClick={handleFilter}
              style={{ marginLeft: 16 }}
            >
              Advanced
            </Button>
          </div>
        </div>

        <div className={`advanced-filter ${showFilter ? 'show' : ''}`}>
          <Form form={form} onFinish={onFinish} layout="vertical">
            <div style={{ display: 'flex', gap: 16 }}>
              <Form.Item name="dateRange" label="Date Range">
                <RangePicker style={{ width: '100%' }} />
              </Form.Item>

              <Form.Item name="priceRange" label="Price Range">
                <Select placeholder="Select price range" style={{ width: 180 }}>
                  <Option value="0-50">$0 - $50</Option>
                  <Option value="50-100">$50 - $100</Option>
                  <Option value="100-500">$100 - $500</Option>
                </Select>
              </Form.Item>

              <Form.Item name="stockLevel" label="Stock Level">
                <Select placeholder="Select stock level" style={{ width: 180 }}>
                  <Option value="low">Low Stock</Option>
                  <Option value="medium">Medium Stock</Option>
                  <Option value="high">High Stock</Option>
                </Select>
              </Form.Item>
            </div>

            <div style={{ marginTop: 16, textAlign: 'right' }}>
              <Button type="default" onClick={() => form.resetFields()} style={{ marginRight: 8 }}>
                Reset
              </Button>
              <Button type="primary" htmlType="submit">
                Apply Filters
              </Button>
            </div>
          </Form>
        </div>
      </Card>

      <SaleTable
        data={sales}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onDetail={handleDetail}
        onViewPayment = {handleViewPayment}
        onAddPayment = {handleAddPayment }
        handleAddSaleReturn = {handleAddSaleReturn }
      />

        <Modal
          title="Edit Product"
          open={isModalVisible}
          onCancel={() => setIsModalVisible(false)}
          footer={null}
          width={800}
        >
          <Form layout="vertical" initialValues={currentProduct} onFinish={handleSave}>
            <div style={{ display: "flex", gap: 16 }}>
              <div style={{ flex: 1 }}>
                <Form.Item label="Product Name" name="name" rules={[{ required: true }]}>
                  <Input placeholder="Product Name" />
                </Form.Item>
                <Form.Item label="Barcode" name="barcode" rules={[{ required: true }]}>
                  <Input placeholder="Barcode" />
                </Form.Item>
              </div>
              <div style={{ flex: 1 }}>
                <Form.Item label="Stock" name="stock" rules={[{ required: true }]}>
                  <InputNumber min={0} style={{ width: "100%" }} />
                </Form.Item>
                <Form.Item label="Quantity" name="quantity" rules={[{ required: true }]}>
                  <InputNumber min={0} style={{ width: "100%" }} />
                </Form.Item>
              </div>
            </div>
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                style={{ backgroundColor: "#52c41a", borderColor: "#52c41a" }}
              >
                Save Changes
              </Button>
            </Form.Item>
          </Form>
        </Modal>
        <AddPaymentModal
          open={isPaymentModalVisible}
          onCancel={() => setIsPaymentModalVisible(false)}
          sale={currentSale}
          onSubmit={handlePaymentSubmit}
        />

        <ViewPaymentModal
          open={isViewPaymentModalVisible}
          onCancel={() => setIsViewPaymentModalVisible(false)}
          sale={currentSale}
        />
      </div>

      </Spin>
  );
};

export default StockTransferPage;