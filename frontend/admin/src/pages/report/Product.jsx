import React, { useState } from "react";
import {Table,Card,Input,Button,Tag,Select,Space,Avatar,Popconfirm,message,Badge,Rate,Dropdown,Menu,Modal,Form,Upload,InputNumber,Divider,DatePicker,Switch,
} from "antd";
import {SearchOutlined,PlusOutlined,FilterOutlined,EditOutlined,DeleteOutlined,MoreOutlined,EyeOutlined,StarOutlined,ShoppingCartOutlined,UploadOutlined,FileOutlined,BarcodeOutlined,CloseOutlined,SaveOutlined,LoadingOutlined ,ImportOutlined ,ExportOutlined ,
} from "@ant-design/icons";
import "./Product.css";
// import "../../../components/filter/Filter.css";
import {useNavigate} from 'react-router-dom';
import Spinner from '../../components/spinner/Spinner';
import {FiFilter} from 'react-icons/fi';
// import "antd/dist/reset.css";
const { Search } = Input;
const { Option } = Select;
const ProductTable = () => {
  const [showFilter, setShowFilter] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [currentProduct, setCurrentProduct] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const [products, setProducts] = useState([
    {
      key: "1",
      name: "Wireless Headphones",
      barcode: "123456789012",
      code: "WH-001",
      category: "Electronics",
      cost: 50.00,
      price: 99.99,
      description: "Premium wireless headphones with noise cancellation",
      type: "high",
      alertQty: 20,
      images: ["https://via.placeholder.com/150"],
      documents: ["specs.pdf", "warranty.pdf"],
      units: "pcs",
      discount: 10,
      priceGroup: "Retail",
      status: "active",
      stock: 45,
      rating: 4.5,
      sales: 1245,
      lastUpdated: "2023-05-15",
    },
    {
      key: "2",
      name: "Smartphone X",
      barcode: "987654321098",
      code: "SPX-2023",
      category: "Electronics",
      cost: 450.00,
      price: 699.99,
      description: "Latest smartphone with advanced camera features",
      type: "high",
      alertQty: 15,
      images: ["https://via.placeholder.com/150"],
      documents: ["manual.pdf"],
      units: "pcs",
      discount: 5,
      priceGroup: "Wholesale",
      status: "active",
      stock: 10,
      rating: 4.7,
      sales: 890,
      lastUpdated: "2023-05-14",
    },
  ]);

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.barcode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || product.status === statusFilter;
    const matchesCategory = categoryFilter === "all" || product.category === categoryFilter;
    const matchesType = typeFilter === "all" || product.type === typeFilter;
    return matchesSearch && matchesStatus && matchesCategory && matchesType;
  });
  const handleAddProduct = () => {
    setLoading(true);
    setTimeout(() => {
      navigate("/product/add");
      setLoading(false);
    }, 500); 
  };

  const handleEdit = () => {
    setLoading(true);
    setTimeout(() => {
      navigate("/product/edit");
      setLoading(false);
    }, 500); 

  };

  const handleDelete = (productId) => {
    setProducts(products.filter((p) => p.key !== productId));
    message.success(`Product deleted successfully`);
  };

  const handleStatusChange = (productId, newStatus) => {
    setProducts(products.map(p => 
      p.key === productId ? { ...p, status: newStatus } : p
    ));
    message.success(`Product status updated to ${newStatus}`);
  };

  const handleSubmit = () => {
    
  };

  const menu = (product) => (
    <Menu>
      <Menu.Item key="view" icon={<EyeOutlined />}>
        View Details
      </Menu.Item>
      <Menu.Item key="edit" icon={<EditOutlined />} onClick={() => handleEdit}>
        Edit
      </Menu.Item>
      <Menu.Item 
        key="status" 
        icon={product.status === "active" ? <CloseOutlined /> : <CheckCircleOutlined />}
        onClick={() => handleStatusChange(product.key, product.status === "active" ? "inactive" : "active")}
      >
        {product.status === "active" ? "Deactivate" : "Activate"}
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="delete" icon={<DeleteOutlined />} danger>
        <Popconfirm
          title="Are you sure to delete this product?"
          onConfirm={() => handleDelete(product.key)}
          okText="Yes"
          cancelText="No"
        >
          Delete
        </Popconfirm>
      </Menu.Item>
    </Menu>
  );

  const columns = [
    {
      title: "No",
      dataIndex: "key",
      key: "key",
      width: 50,
    },
    {
      title: "Product Info",
      dataIndex: "name",
      key: "product",
      width: 250,
      render: (text, record) => (
        <div className="product-cell">
          <Avatar 
            src={record.images?.[0]} 
            shape="square" 
            size={64} 
            icon={<ShoppingCartOutlined />} 
            style={{ backgroundColor: '#52c41a' }}
          />
          <div className="product-info">
            <strong>{text}</strong>
            <div>
              <span style={{ marginRight: 8 }}>Code: {record.code}</span>
            </div>
           
          </div>
        </div>
      ),
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      width: 120,
      filters: [
        { text: "Electronics", value: "Electronics" },
        { text: "Clothing", value: "Clothing" },
        { text: "Home", value: "Home" },
      ],
      onFilter: (value, record) => record.category === value,
      render: (category) => <Tag color="green">{category}</Tag>,
    },
    {
      title: "Cost/Price",
      key: "costPrice",
      width: 150,
      render: (_, record) => (
        <div>
          <div>Cost: ${record.cost.toFixed(2)}</div>
          <div>Price: ${record.price.toFixed(2)}</div>
          {record.discount > 0 && (
            <div style={{ color: '#f5222d' }}>
              Discount: {record.discount}%
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Stock",
      dataIndex: "stock",
      key: "stock",
      width: 150,
      sorter: (a, b) => a.stock - b.stock,
      render: (stock, record) => (
        <div>
          <Badge
            count={`${stock} ${record.units}`}
            style={{
              backgroundColor: stock > record.alertQty ? '#52c41a' : stock > 0 ? '#faad14' : '#f5222d',
            }}
          />
          <div style={{ fontSize: 12 }}>Alert: {record.alertQty}</div>
        </div>
      ),
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      width: 100,
      filters: [
        { text: "Low", value: "low" },
        { text: "Medium", value: "medium" },
        { text: "High", value: "high" },
      ],
      onFilter: (value, record) => record.type === value,
      render: (type) => (
        <Tag color={type === 'high' ? 'green' : type === 'medium' ? 'orange' : 'red'}>
          {type.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Sales",
      dataIndex: "sales",
      key: "sales",
      width: 100,
      sorter: (a, b) => a.sales - b.sales,
      render: (sales) => (
        <Tag color="blue">{sales}</Tag>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 100,
      filters: [
        { text: "Active", value: "active" },
        { text: "Inactive", value: "inactive" },
      ],
      onFilter: (value, record) => record.status === value,
      render: (status) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
  ];

  const normFile = (e) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
  };

  return (
    <div className="product-management">
      {loading && <Spinner />}
      <Card className="header-card">
        <div className="header-content">
          <div>
            <h1 style={{ color: '#52c41a' }}>Product Report</h1>
            <p>Manage your product inventory and listings</p>
          </div>
        
        <div style={{width:'30%',display:'flex',justifyContent: "end"}}>
          <Button
            type="primary"
            icon={<ImportOutlined />}
            style={{
              backgroundColor: "#ff4d4f", 
              borderColor: "#ff4d4f",
              color: "#fff",
            }}
          >
            Print Product
          </Button>
          </div>
        </div>
      </Card>

      {/* Filter Bar */}
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

            {/* <Select
              value={categoryFilter}
              onChange={setCategoryFilter}
              style={{ width: 150 }}
              placeholder="Category"
            >
              <Option value="all">All Categories</Option>
              <Option value="Electronics">Electronics</Option>
              <Option value="Clothing">Clothing</Option>
              <Option value="Home">Home</Option>
            </Select> */}

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
          <Button 
            type={showFilter ? 'primary' : 'default'} 
            icon={<FiFilter />}
            onClick={() => setShowFilter(!showFilter)}
            style={{ marginLeft: 16 }}
          >
            Advanced
          </Button>
          </div>
        </div>
      </Card>

          {/* Advanced Filter */}
      <div className={`filter-container ${showFilter ? 'show' : 'hide'}`}>
        <Card className="advanced-filter-container" style={{ marginBottom: 15 }}>
          <div className="advanced-filter">
            <div className="filter-section">
              <Form layout="vertical">
                <div className="form-row">
                  <Form.Item label="Create Date" style={{ width: '48%' }}>
                    <DatePicker style={{ width: '100%' }} />
                  </Form.Item>
                  <Form.Item label="Product Name" style={{ width: '48%' }}>
                    <Input placeholder="Enter product name" />
                  </Form.Item>
                </div>
                <div className="form-row">
                  <Form.Item label="Code" style={{ width: '48%' }}>
                    <Input placeholder="Enter product code" />
                  </Form.Item>
                  <Form.Item label="Category" style={{ width: '48%' }}>
                    <Select placeholder="-- Select Category --">
                      {/* <Option value="electronics">Electronics</Option>
                      <Option value="clothing">Clothing</Option>
                      <Option value="home">Home & Kitchen</Option>
                      <Option value="books">Books</Option> */}
                    </Select>
                  </Form.Item>
                </div>
                <div className="form-row">
                  <Form.Item label="Status" style={{ width: '48%' }}>
                    <Select placeholder="-- Select Status --">
                      <Option value="active">Active</Option>
                      <Option value="inactive">Inactive</Option>
                      <Option value="pending">Pending</Option>
                    </Select>
                  </Form.Item>
                  <Form.Item label="Status" style={{ width: '48%' }}>
                    <Select placeholder="-- Select Status --">
                      <Option value="active">Active</Option>
                      <Option value="inactive">Inactive</Option>
                      <Option value="pending">Pending</Option>
                    </Select>
                  </Form.Item>
                </div>
              </Form>
            </div>
            <div className="filter-actions">
              <Button>Reset Filters</Button>
              <Button type="primary">Apply Filters</Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Product Table */}
      <Card className="table-card">
        <Table
          columns={columns}
          dataSource={filteredProducts}
          pagination={{
            position: ["bottomRight"],
            showSizeChanger: true,
            showQuickJumper: true,
            pageSizeOptions: ["10", "20", "50", "100"],
            defaultPageSize: 10,
            showTotal: (total) => `Total ${total} products`,
          }}
          scroll={{ x: 1800 }}
          bordered
          size="middle"
          rowClassName={(record) => `product-row ${record.status}`}
        />
      </Card>

      {/* Product view detail */}
      <Modal
        title={currentProduct ? `Edit Product: ${currentProduct.name}` : "Add New Product"}
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={800}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <div style={{ display: 'flex', gap: 16 }}>
            <div style={{ flex: 1 }}>
              <Form.Item 
                label="Product Name" 
                name="name" 
                rules={[{ required: true, message: 'Please enter product name' }]}
              >
                <Input placeholder="Enter product name" />
              </Form.Item>
              
              <Form.Item label="Barcode" name="barcode">
                <Input placeholder="Enter barcode" prefix={<BarcodeOutlined />} />
              </Form.Item>
              
              <Form.Item 
                label="Product Code" 
                name="code" 
                rules={[{ required: true, message: 'Please enter product code' }]}
              >
                <Input placeholder="Enter product code" />
              </Form.Item>
              
              <Form.Item 
                label="Category" 
                name="category" 
                rules={[{ required: true, message: 'Please select category' }]}
              >
                <Select placeholder="Select category">
                  {/* <Option value="Electronics">Electronics</Option>
                  <Option value="Clothing">Clothing</Option>
                  <Option value="Home">Home</Option>
                  <Option value="Other">Other</Option> */}
                </Select>
              </Form.Item>
              
              <Form.Item label="Description" name="description">
                <Input.TextArea rows={3} placeholder="Enter product description" />
              </Form.Item>
            </div>
            
            <div style={{ flex: 1 }}>
              <Form.Item 
                label="Product Type" 
                name="type" 
                rules={[{ required: true, message: 'Please select product type' }]}
              >
                <Select placeholder="Select product type">
                  <Option value="low">Low</Option>
                  <Option value="medium">Medium</Option>
                  <Option value="high">High</Option>
                </Select>
              </Form.Item>
              
              <Form.Item 
                label="Cost Price" 
                name="cost" 
                rules={[{ required: true, message: 'Please enter cost price' }]}
              >
                <InputNumber 
                  min={0} 
                  style={{ width: '100%' }} 
                  formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                />
              </Form.Item>
              
              <Form.Item 
                label="Selling Price" 
                name="price" 
                rules={[{ required: true, message: 'Please enter selling price' }]}
              >
                <InputNumber 
                  min={0} 
                  style={{ width: '100%' }} 
                  formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                />
              </Form.Item>
              
              <Form.Item 
                label="Units" 
                name="units" 
                rules={[{ required: true, message: 'Please select units' }]}
              >
                <Select placeholder="Select units">
                  <Option value="pcs">Pieces</Option>
                  <Option value="kg">Kilograms</Option>
                  <Option value="l">Liters</Option>
                  <Option value="m">Meters</Option>
                  <Option value="box">Box</Option>
                </Select>
              </Form.Item>
              
              <Form.Item 
                label="Alert Quantity" 
                name="alertQty" 
                rules={[{ required: true, message: 'Please enter alert quantity' }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </div>
          </div>
          
          <Divider />
          
          <div style={{ display: 'flex', gap: 16 }}>
            <div style={{ flex: 1 }}>
              <Form.Item label="Discount (%)" name="discount">
                <InputNumber min={0} max={100} style={{ width: '100%' }} />
              </Form.Item>
              
              <Form.Item label="Price Group" name="priceGroup">
                <Select placeholder="Select price group">
                  <Option value="Retail">Retail</Option>
                  <Option value="Wholesale">Wholesale</Option>
                  <Option value="VIP">VIP</Option>
                  <Option value="Bulk">Bulk</Option>
                </Select>
              </Form.Item>
              
              <Form.Item 
                label="Current Stock" 
                name="stock" 
                rules={[{ required: true, message: 'Please enter current stock' }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </div>
            
            <div style={{ flex: 1 }}>
              <Form.Item 
                label="Status" 
                name="status" 
                rules={[{ required: true, message: 'Please select status' }]}
              >
                <Select placeholder="Select status">
                  <Option value="active">Active</Option>
                  <Option value="inactive">Inactive</Option>
                </Select>
              </Form.Item>
              
              <Form.Item
                label="Product Images"
                name="images"
                valuePropName="fileList"
                getValueFromEvent={normFile}
              >
                <Upload
                  listType="picture-card"
                  multiple
                  accept="image/*"
                  beforeUpload={() => false}
                >
                  <div>
                    <UploadOutlined />
                    <div style={{ marginTop: 8 }}>Upload</div>
                  </div>
                </Upload>
              </Form.Item>
              
              <Form.Item
                label="Documents"
                name="documents"
                valuePropName="fileList"
                getValueFromEvent={normFile}
              >
                <Upload
                  multiple
                  beforeUpload={() => false}
                  accept=".pdf,.doc,.docx"
                >
                  <Button icon={<FileOutlined />}>Upload Documents</Button>
                </Upload>
              </Form.Item>
            </div>
          </div>
          
          <Divider />
          
          <Form.Item>
            <Space>
              <Button 
                type="primary" 
                htmlType="submit" 
                icon={<SaveOutlined />}
                style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
              >
                {currentProduct ? 'Update Product' : 'Add Product'}
              </Button>
              <Button onClick={() => setIsModalVisible(false)} icon={<CloseOutlined />}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ProductTable;