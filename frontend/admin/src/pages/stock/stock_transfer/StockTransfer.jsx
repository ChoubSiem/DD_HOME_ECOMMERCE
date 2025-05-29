import React, { useState ,useEffect, use} from "react";
import {
  Card,
  Input,
  Button,
  Select,
  Modal,
  Form,
  InputNumber,
  Spin,
  Menu ,
  message
} from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  FilterOutlined
} from "@ant-design/icons";
import StockTransferTable from "../../../components/stock_transfer/StockTransfersTable";
import { useNavigate } from "react-router-dom";
import "./StockTransfer.css";
import { useStock } from "../../../hooks/UseStock";
import Cookies from "js-cookie"
const { Search } = Input;
const { Option } = Select;

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
  const token = localStorage.getItem("token");
  const user = JSON.parse(Cookies.get("user"));
  const handleSearchChange = (value) => {
    setSearchTerm(value);
  };

  const handleFilter = () => {
    setShowFilter(!showFilter);
  };

  useEffect(() => {
    if (token && user) {
      handleUomTransferData();
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
      navigate("/transfer/stock/add");
      setLoading(false);
    }, 500);
  };

  const handleEdit = (product) => {
    setLoading(true);    
    setTimeout(() => {
      navigate(`/transfer/stock/edit/${product.id}`);
      setLoading(false);
    }, 500);
  };

  const handleDelete = async (productId) => {
    try {

      const response = await handleGetUomTransferDelete(token, productId);
      if (response.success) {

        message.success(`Product ${productId} deleted successfully`);
        await handleUomTransferData();
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

  return (
    <div className="product-management">
      {loading && <Spin size="large" />}
      
      <Card className="header-card">
        <div className="header-content">
          <div>
            <h1 style={{ color: '#52c41a' }}>Stock Transfer</h1>
            <p>Manage your transfer between location</p>
          </div>
          <Button 
            onClick={handleAdd} 
            type="primary" 
            icon={<PlusOutlined />} 
            style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
          >
            Add Transfer
          </Button>
        </div>
      </Card>

      {/* Filters */}
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
      </Card>

      {/* Table */}
        <StockTransferTable
          data={transfers}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onDetail={handleDetail}
        />

      {/* Edit Modal */}
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
    </div>
  );
};

export default StockTransferPage;