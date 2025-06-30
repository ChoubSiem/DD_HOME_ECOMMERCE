import React, { useState, useEffect } from "react";
import {
  Card,
  Input,
  Button,
  Select,
  Modal,
  Form,
  InputNumber,
  Spin,
  message
} from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  FilterOutlined
} from "@ant-design/icons";
import SalesReturnTable from "../../components/sale_return/SalesReturnsTable";
import { useNavigate } from "react-router-dom";
import "./SaleReturn.css";
import { useSale } from "../../hooks/UseSale";
import Cookies from "js-cookie";
const { Search } = Input;
const { Option } = Select;

const SalesReturnPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [selectedReturns, setSelectedReturns] = useState([]);
  const [currentReturn, setCurrentReturn] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const { handleGetSalesReturns, handleDeleteSalesReturn } = useSale();
  const [returns, setReturns] = useState([]);
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
      handleSalesReturnData();
    }
  }, [token, user?.warehouse_id]);

  const filteredReturns = selectedReturns.filter((returnItem) =>
    returnItem.reference.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDetail = (returnItem) => {    
    setCurrentReturn(returnItem.items);
    setIsModalVisible(true);
  };

  const handleSalesReturnData = async () => {
    let result = await handleGetSalesReturns(user.warehouse_id, token);    
    if (result.success) {
      setReturns(result.salesReturns);
    }
  }

  const handleAdd = () => {
    setLoading(true);
    setTimeout(() => {
      navigate("/sales/returns/add");
      setLoading(false);
    }, 500);
  };

  const handleEdit = (returnItem) => {
    setLoading(true);    
    setTimeout(() => {
      navigate(`/sales/returns/edit/${returnItem.id}`);
      setLoading(false);
    }, 500);
  };

  const handleDelete = async (returnId) => {
    try {
      const response = await handleDeleteSalesReturn(token, returnId);
      if (response.success) {
        message.success(`Return ${returnId} deleted successfully`);
        await handleSalesReturnData();
      }
    } catch (error) {
      setSelectedReturns(selectedReturns);
    }
  };

  const handleSave = (values) => {
    const updatedReturns = selectedReturns.map((r) =>
      r.key === currentReturn.key ? { ...r, ...values } : r
    );
    setSelectedReturns(updatedReturns);
    setIsModalVisible(false);
    message.success("Return updated successfully");
  };

  return (
    <div className="sales-return-management">
      {loading && <Spin size="large" />}
      
      <Card className="header-card">
        <div className="header-content">
          <div>
            <h1 style={{ color: '#52c41a' }}>Sales Returns</h1>
            <p>Manage your sales returns and refunds</p>
          </div>
          <Button 
            onClick={handleAdd} 
            type="primary" 
            icon={<PlusOutlined />} 
            style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
          >
            Create Return
          </Button>
        </div>
      </Card>

      {/* Filters */}
      <Card className="filter-card">
        <div className="filter-content">
          <Search
            placeholder="Search returns by reference or customer..."
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
              <Option value="pending">Pending</Option>
              <Option value="completed">Completed</Option>
              <Option value="cancelled">Cancelled</Option>
            </Select>

            <Select
              value={categoryFilter}
              onChange={setCategoryFilter}
              style={{ width: 150 }}
              placeholder="Customer"
            >
              <Option value="all">All Customers</Option>
              {/* You would populate these options from your customer data */}
              <Option value="Retail">Retail</Option>
              <Option value="Wholesale">Wholesale</Option>
            </Select>

            <Button 
              type={showFilter ? 'primary' : 'default'} 
              onClick={handleFilter}
              style={{ marginLeft: 16 }}
              icon={<FilterOutlined />}
            >
              Advanced
            </Button>
          </div>
        </div>
      </Card>

      {/* Table */}
      <SalesReturnTable
        data={returns}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onDetail={handleDetail}
      />

      {/* Edit Modal */}
      <Modal
        title="Return Details"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={800}
      >
        <Form layout="vertical" initialValues={currentReturn} onFinish={handleSave}>
          <div style={{ display: "flex", gap: 16 }}>
            <div style={{ flex: 1 }}>
              <Form.Item label="Reference" name="reference" rules={[{ required: true }]}>
                <Input placeholder="Return reference" />
              </Form.Item>
              <Form.Item label="Customer" name="customer" rules={[{ required: true }]}>
                <Input placeholder="Customer name" />
              </Form.Item>
            </div>
            <div style={{ flex: 1 }}>
              <Form.Item label="Total Amount" name="total_amount" rules={[{ required: true }]}>
                <InputNumber min={0} style={{ width: "100%" }} disabled />
              </Form.Item>
              <Form.Item label="Status" name="status" rules={[{ required: true }]}>
                <Select style={{ width: "100%" }}>
                  <Option value="pending">Pending</Option>
                  <Option value="completed">Completed</Option>
                  <Option value="cancelled">Cancelled</Option>
                </Select>
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

export default SalesReturnPage;