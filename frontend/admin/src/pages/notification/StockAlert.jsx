import React, { useState } from "react";
import {
  Table,
  Card,
  Button,
  Tag,
  Space,
  Popconfirm,
  message,
  Badge,
  notification,
  Input,
  Select
} from "antd";
import {
  ExclamationCircleOutlined,
  PlusOutlined,
  EditOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SearchOutlined,
  FilterOutlined,
} from "@ant-design/icons";


const {Search} = Input ;
const { Option } = Select;
const StockAlertNotification = () => {
          const [searchTerm, setSearchTerm] = useState("");
            const [statusFilter, setStatusFilter] = useState("all");
              const [categoryFilter, setCategoryFilter] = useState("all");
              const [typeFilter, setTypeFilter] = useState("all");
              const [currentProduct, setCurrentProduct] = useState(null);
              const [isModalVisible, setIsModalVisible] = useState(false);
  const [products, setProducts] = useState([
    {
      key: "1",
      name: "Wireless Headphones",
      category: "Electronics",
      currentStock: 5,
      alertQty: 20,
      status: "active",
    },
    {
      key: "2",
      name: "Smartphone X",
      category: "Electronics",
      currentStock: 2,
      alertQty: 15,
      status: "active",
    },
    {
      key: "3",
      name: "Laptop Pro",
      category: "Electronics",
      currentStock: 0,
      alertQty: 10,
      status: "inactive",
    },
  ]);

  // Open notification for stock alerts
  const openNotification = () => {
    const lowStockProducts = products.filter((p) => p.currentStock < p.alertQty);
    if (lowStockProducts.length > 0) {
      notification.open({
        message: `Stock Alert (${lowStockProducts.length})`,
        description: "Some products have stock levels below the alert threshold.",
        icon: <ExclamationCircleOutlined style={{ color: "#f5222d" }} />,
        duration: 0,
        onClick: () => console.log("Notification Clicked"),
      });
    }
  };

  // Trigger restock action
  const handleRestock = (productId) => {
    const updatedProducts = products.map((p) =>
      p.key === productId ? { ...p, currentStock: p.alertQty } : p
    );
    setProducts(updatedProducts);
    message.success(`Product ${productId} restocked successfully`);
  };

  // Trigger ignore action
  const handleIgnore = (productId) => {
    const updatedProducts = products.map((p) =>
      p.key === productId ? { ...p, status: "ignored" } : p
    );
    setProducts(updatedProducts);
    message.info(`Alert for product ${productId} ignored`);
  };

  // Table columns
  const columns = [
    {
      title: "No",
      dataIndex: "key",
      key: "key",
      width: 50,
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: "Product",
      dataIndex: "name",
      key: "name",
      width: 200,
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      width: 150,
      render: (category) => <Tag color="green">{category}</Tag>,
    },
    {
      title: "Current Stock",
      dataIndex: "currentStock",
      key: "currentStock",
      width: 120,
      render: (stock, record) => (
        <Badge
          count={stock}
          style={{
            backgroundColor: stock > record.alertQty ? "#52c41a" : stock > 0 ? "#faad14" : "#f5222d",
          }}
        />
      ),
    },
    {
      title: "Alert Quantity",
      dataIndex: "alertQty",
      key: "alertQty",
      width: 120,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 100,
      filters: [
        { text: "Active", value: "active" },
        { text: "Inactive", value: "inactive" },
        { text: "Ignored", value: "ignored" },
      ],
      onFilter: (value, record) => record.status === value,
      render: (status) => (
        <Tag color={status === "active" ? "green" : status === "ignored" ? "orange" : "red"}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 150,
      fixed: "right",
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="primary"
            icon={<CheckCircleOutlined />}
            onClick={() => handleRestock(record.key)}
            style={{ backgroundColor: "#52c41a", borderColor: "#52c41a" }}
          >
            Restock
          </Button>
          <Popconfirm
            title="Are you sure to ignore this alert?"
            onConfirm={() => handleIgnore(record.key)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="text" icon={<CloseCircleOutlined />} danger>
              Ignore
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="stock-alert-notification">
      {/* Header */}
      <Card className="header-card">
        <div className="header-content">
          <div>
            <h1 style={{ color: "#f5222d" }}>Stock Alerts</h1>
            <p>Monitor and manage low stock notifications</p>
          </div>
          <Button
            type="primary"
            icon={<ExclamationCircleOutlined />}
            onClick={openNotification}
            style={{ backgroundColor: "#f5222d", borderColor: "#f5222d" }}
          >
            View Alerts ({products.filter((p) => p.currentStock < p.alertQty).length})
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
                  style={{ width: 300 }}
                  allowClear
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
      
                  <Select
                    value={typeFilter}
                    onChange={setTypeFilter}
                    style={{ width: 120 }}
                    placeholder="Type"
                  >
                    <Option value="all">All Types</Option>
                    <Option value="low">Low</Option>
                    <Option value="medium">Medium</Option>
                    <Option value="high">High</Option>
                  </Select>
      
                  <Button onClick={() => message.info("Advanced filters coming soon!")} icon={<FilterOutlined />} style={{ color: '#52c41a', borderColor: '#52c41a' }}>
                    Advanced Filters
                  </Button>
                </div>
              </div>
            </Card>

      {/* Stock Alert Table */}
      <Card className="table-card">
        <Table
          columns={columns}
          dataSource={products}
          pagination={{
            position: ["bottomRight"],
            showSizeChanger: true,
            pageSizeOptions: ["10", "20", "50"],
            defaultPageSize: 10,
            showTotal: (total) => `Total ${total} products`,
          }}
          scroll={{ x: 1000 }}
          bordered
          size="middle"
          rowClassName={(record) =>
            record.currentStock < record.alertQty ? "low-stock-row" : ""
          }
        />
      </Card>
    </div>
  );
};

export default StockAlertNotification;