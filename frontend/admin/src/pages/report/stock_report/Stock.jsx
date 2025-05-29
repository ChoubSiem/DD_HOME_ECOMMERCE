import React, { useState } from "react";
import { 
  Table, Card, Input, Button, Tag, Select, Space, Avatar, 
  Badge, Divider, DatePicker, Statistic, Row, Col 
} from "antd";
import { 
  SearchOutlined, FilterOutlined, StockOutlined,
  ExportOutlined, PrinterOutlined, WarningOutlined,
  CheckCircleOutlined, CloseCircleOutlined 
} from "@ant-design/icons";
import "./Stock.css";

const { Search } = Input;
const { Option } = Select;

const StockReport = () => {
  const [showFilter, setShowFilter] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockLevelFilter, setStockLevelFilter] = useState("all");
  const [dateRange, setDateRange] = useState([]);

  const [products, setProducts] = useState([
    {
      key: "1",
      name: "Wireless Headphones",
      code: "WH-001",
      category: "Electronics",
      cost: 50.00,
      price: 99.99,
      alertQty: 20,
      units: "pcs",
      status: "active",
      stock: 5, // Low stock for demo
      lastUpdated: "2023-05-15",
      lastPurchase: "2023-04-20",
      lastSale: "2023-05-10"
    },
    {
      key: "2",
      name: "Smartphone X",
      code: "SPX-2023",
      category: "Electronics",
      cost: 450.00,
      price: 699.99,
      alertQty: 15,
      units: "pcs",
      status: "active",
      stock: 25,
      lastUpdated: "2023-05-14",
      lastPurchase: "2023-05-01",
      lastSale: "2023-05-12"
    },
  ]);

  // Calculate summary statistics
  const totalItems = products.length;
  const totalValue = products.reduce((sum, p) => sum + (p.cost * p.stock), 0);
  const lowStockItems = products.filter(p => p.stock <= p.alertQty).length;
  const outOfStockItems = products.filter(p => p.stock === 0).length;

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         product.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || product.status === statusFilter;
    const matchesCategory = categoryFilter === "all" || product.category === categoryFilter;
    
    // Stock level filters
    let matchesStockLevel = true;
    if (stockLevelFilter === "low") {
      matchesStockLevel = product.stock <= product.alertQty;
    } else if (stockLevelFilter === "out") {
      matchesStockLevel = product.stock === 0;
    } else if (stockLevelFilter === "normal") {
      matchesStockLevel = product.stock > product.alertQty;
    }
    
    return matchesSearch && matchesStatus && matchesCategory && matchesStockLevel;
  });

  const columns = [
    {
      title: "Product",
      dataIndex: "name",
      key: "product",
      width: 200,
      render: (text, record) => (
        <div className="product-cell">
          <div className="product-info">
            <strong>{text}</strong>
            <div style={{ color: '#888' }}>{record.code}</div>
          </div>
        </div>
      ),
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      width: 120,
      render: (category) => <Tag color="blue">{category}</Tag>,
    },
    {
      title: "Stock Level",
      key: "stockLevel",
      width: 150,
      sorter: (a, b) => a.stock - b.stock,
      render: (_, record) => {
        const percent = (record.stock / record.alertQty) * 100;
        let status = "normal";
        if (record.stock === 0) status = "out";
        else if (record.stock <= record.alertQty) status = "low";
        
        return (
          <div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {status === "out" && <CloseCircleOutlined style={{ color: '#ff4d4f', marginRight: 8 }} />}
              {status === "low" && <WarningOutlined style={{ color: '#faad14', marginRight: 8 }} />}
              {status === "normal" && <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />}
              <span>
                {record.stock} {record.units}
              </span>
            </div>
            <div style={{ fontSize: 12 }}>
              Alert: {record.alertQty} {record.units}
            </div>
          </div>
        );
      },
    },
    {
      title: "Inventory Value",
      key: "value",
      width: 150,
      render: (_, record) => (
        <div>
          <div>Cost: ${(record.cost * record.stock).toFixed(2)}</div>
          <div>Retail: ${(record.price * record.stock).toFixed(2)}</div>
        </div>
      ),
      sorter: (a, b) => (a.cost * a.stock) - (b.cost * b.stock),
    },
    {
      title: "Last Activity",
      key: "activity",
      width: 180,
      render: (_, record) => (
        <div>
          <div>Purchased: {record.lastPurchase}</div>
          <div>Sold: {record.lastSale}</div>
        </div>
      ),
      sorter: (a, b) => new Date(a.lastUpdated) - new Date(b.lastUpdated),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (status) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
  ];

  return (
    <div className="stock-report">
      <Card className="header-card">
        <div className="header-content">
          <div>
            <h1 style={{ color: '#1890ff' }}>
              <StockOutlined /> Stock Report
            </h1>
            <p>Current inventory status and valuation</p>
          </div>
          <div className="header-actions">
            <Button
              type="primary"
              icon={<ExportOutlined />}
              style={{ marginRight: 8 }}
            >
              Export
            </Button>
            <Button
              type="primary"
              icon={<PrinterOutlined />}
            >
              Print
            </Button>
          </div>
        </div>
      </Card>

      {/* Inventory Summary Cards */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Products"
              value={totalItems}
              prefix={<StockOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Inventory Value"
              value={totalValue.toFixed(2)}
              prefix="$"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Low Stock Items"
              value={lowStockItems}
              valueStyle={{ color: '#faad14' }}
              prefix={<WarningOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Out of Stock"
              value={outOfStockItems}
              valueStyle={{ color: '#ff4d4f' }}
              prefix={<CloseCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Filter Bar */}
      <Card className="filter-card">
        <div className="filter-content">
          <Search
            placeholder="Search products..."
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
              <Option value="all">All Status</Option>
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
            </Select>

            <Select
              value={stockLevelFilter}
              onChange={setStockLevelFilter}
              style={{ width: 150 }}
              placeholder="Stock Level"
            >
              <Option value="all">All Levels</Option>
              <Option value="normal">Normal</Option>
              <Option value="low">Low Stock</Option>
              <Option value="out">Out of Stock</Option>
            </Select>

            <DatePicker.RangePicker 
              style={{ width: 220 }}
              onChange={setDateRange}
              placeholder={["Start Date", "End Date"]}
            />

            <Button 
              type={showFilter ? 'primary' : 'default'} 
              icon={<FilterOutlined />}
              onClick={() => setShowFilter(!showFilter)}
              style={{ marginLeft: 8 }}
            >
              Advanced
            </Button>
          </div>
        </div>
      </Card>

      {/* Advanced Filter */}
      {showFilter && (
        <Card className="advanced-filter" style={{ marginBottom: 16 }}>
          <div className="filter-section">
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item label="Minimum Stock">
                  <InputNumber style={{ width: '100%' }} placeholder="Min stock" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="Maximum Stock">
                  <InputNumber style={{ width: '100%' }} placeholder="Max stock" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="Inventory Value Range">
                  <Select placeholder="Value range" style={{ width: '100%' }}>
                    <Option value="0-100">$0 - $100</Option>
                    <Option value="100-500">$100 - $500</Option>
                    <Option value="500+">$500+</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            <div className="filter-actions">
              <Button>Reset</Button>
              <Button type="primary">Apply</Button>
            </div>
          </div>
        </Card>
      )}

      {/* Stock Report Table */}
      <Card className="table-card">
        <Table
          columns={columns}
          dataSource={filteredProducts}
          pagination={{
            position: ["bottomRight"],
            showSizeChanger: true,
            pageSizeOptions: ["10", "20", "50", "100"],
            defaultPageSize: 10,
            showTotal: (total) => `Total ${total} inventory items`,
          }}
          scroll={{ x: 1000 }}
          rowClassName={(record) => {
            if (record.stock === 0) return 'out-of-stock-row';
            if (record.stock <= record.alertQty) return 'low-stock-row';
            return '';
          }}
        />
      </Card>
    </div>
  );
};

export default StockReport;