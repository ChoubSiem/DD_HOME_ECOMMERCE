import React, { useState } from "react";
import {
  Table,
  AutoComplete,
  Button,
  Space,
  Popconfirm,
  message,
  InputNumber,
} from "antd";
import { SearchOutlined, PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import "./AddSaleReturn.css";

const AddSaleReturn = () => {
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");
  const [originalSaleId, setOriginalSaleId] = useState("");

  // Sample product data with units
  const products = [
    { id: "1", name: "Laptop Pro X", price: 1200, unit: "pcs" },
    { id: "2", name: "Smartphone Z10", price: 800, unit: "pcs" },
    { id: "3", name: "Mouse Wireless", price: 50, unit: "pcs" },
    { id: "4", name: "Headphones", price: 50, unit: "pcs" },
    { id: "5", name: "Keyboard Mechanical", price: 100, unit: "pcs" },
  ];

  // Sample customers data
  const customers = [
    { id: "1", name: "John Doe" },
    { id: "2", name: "Jane Smith" },
    { id: "3", name: "Acme Corp" },
  ];

  // Handle search input change
  const handleSearchChange = (value) => {
    setSearchTerm(value);
  };

  // Handle customer search input change
  const handleCustomerSearch = (value) => {
    setCustomerSearch(value);
  };

  // Handle product selection from the dropdown
  const handleProductSelect = (value) => {
    const selectedProduct = products.find((product) => product.name === value);

    if (!selectedProduct) {
      message.error("Product not found.");
      return;
    }

    // Check if the product is already in the selected list
    const isAlreadyAdded = selectedProducts.some(
      (p) => p.productId === selectedProduct.id
    );

    if (isAlreadyAdded) {
      message.warning(`${selectedProduct.name} is already added.`);
      return;
    }

    const newProduct = {
      key: Date.now(),
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      quantity: 1,
      price: selectedProduct.price,
      unit: selectedProduct.unit,
      total: selectedProduct.price * 1,
      reason: "Defective", // Default reason for return
    };

    setSelectedProducts([...selectedProducts, newProduct]);
    message.success(`${selectedProduct.name} has been added to the return list.`);
    setSearchTerm(""); // Clear the search input
  };

  // Handle quantity change
  const handleQuantityChange = (key, value) => {
    const updatedProducts = selectedProducts.map((product) =>
      product.key === key ? { ...product, quantity: value, total: value * product.price } : product
    );
    setSelectedProducts(updatedProducts);
  };

  // Handle reason change
  const handleReasonChange = (key, value) => {
    const updatedProducts = selectedProducts.map((product) =>
      product.key === key ? { ...product, reason: value } : product
    );
    setSelectedProducts(updatedProducts);
  };

  // Remove a product
  const handleRemoveProduct = (key) => {
    const updatedProducts = selectedProducts.filter((p) => p.key !== key);
    setSelectedProducts(updatedProducts);
  };

  // Calculate total refund amount
  const totalRefund = selectedProducts.reduce(
    (sum, product) => sum + product.quantity * product.price,
    0
  );

  // Handle form submission
  const handleSave = () => {
    if (!customerSearch) {
      message.error("Please select a customer");
      return;
    }
    
    if (selectedProducts.length === 0) {
      message.error("Please add at least one product to return");
      return;
    }

    console.log("Sale Return Details:", {
      customer: customerSearch,
      originalSaleId,
      products: selectedProducts,
      totalRefund,
      date: new Date().toISOString(),
    });
    
    message.success("Sale return processed successfully");
    setSelectedProducts([]);
    setCustomerSearch("");
    setOriginalSaleId("");
  };

  // Table columns
  const columns = [
    {
      title: "Product Name",
      dataIndex: "productName",
      key: "productName",
      render: (text) => <span>{text}</span>,
    },
    {
      title: "Unit",
      dataIndex: "unit",
      key: "unit",
      render: (unit) => <span>{unit}</span>,
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
      render: (_, record) => (
        <InputNumber
          min={1}
          value={record.quantity}
          onChange={(value) => handleQuantityChange(record.key, value)}
          style={{ width: "100%" }}
        />
      ),
    },
    {
      title: "Price ($)",
      dataIndex: "price",
      key: "price",
      render: (price) => <strong>${price.toFixed(2)}</strong>,
    },
    {
      title: "Reason",
      key: "reason",
      render: (_, record) => (
        <select
          value={record.reason}
          onChange={(e) => handleReasonChange(record.key, e.target.value)}
          style={{ width: "100%", padding: "5px" }}
        >
          <option value="Defective">Defective</option>
          <option value="Wrong Item">Wrong Item</option>
          <option value="Customer Changed Mind">Customer Changed Mind</option>
          <option value="Late Delivery">Late Delivery</option>
        </select>
      ),
    },
    {
      title: "Refund Amount ($)",
      dataIndex: "total",
      key: "total",
      render: (_, record) => <strong>${(record.quantity * record.price).toFixed(2)}</strong>,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Popconfirm
            title="Are you sure to remove this product from return?"
            onConfirm={() => handleRemoveProduct(record.key)}
          >
            <Button type="link" danger style={{ padding: 0 }}>
              Remove
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="add-purchase-container">
      {/* Header */}
      <div className="header">
        <h1 style={{ color: "#52c41a" }}>Add Sale Return</h1>
        <p>Select products being returned and process the refund</p>
      </div>

      {/* Customer and Original Sale Information */}
      <div className="search-bar" style={{ marginBottom: "20px" }}>
        <div style={{ marginBottom: "10px" }}>
          <AutoComplete
            options={customers
              .filter((customer) =>
                customer.name.toLowerCase().includes(customerSearch.toLowerCase())
              )
              .map((customer) => ({ value: customer.name }))}
            placeholder="Search for customer..."
            value={customerSearch}
            onChange={handleCustomerSearch}
            style={{ width: "300px", marginRight: "10px" }}
          />
          
          <InputNumber
            placeholder="Original Sale ID"
            value={originalSaleId}
            onChange={(value) => setOriginalSaleId(value)}
            style={{ width: "200px" }}
          />
        </div>
      </div>

      {/* Search and Add Product */}
      <div className="search-bar search">
        <AutoComplete 
            className="input"
          options={products
            .filter((product) =>
              product.name.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .map((product) => ({ value: product.name }))}
          placeholder="Search for products to return..."
          value={searchTerm}
          onChange={handleSearchChange}
          onSelect={handleProductSelect}
          style={{ width: "100%",height:'50px' }}
        />
      </div>

      {/* Selected Products Table */}
      <Table
        bordered
        dataSource={selectedProducts}
        columns={columns}
        pagination={false}
        rowClassName="editable-row"
      />

      {/* Total Refund Amount */}
      <div className="total-amount">
        <strong>Total Refund Amount: ${totalRefund.toFixed(2)}</strong>
      </div>

      {/* Actions */}
      <div className="actions">
        <Button
          type="primary"
          onClick={handleSave}
          style={{ backgroundColor: "#52c41a", borderColor: "#52c41a" }}
        >
          Add Return
        </Button>
        <Button style={{backgroundColor:'#ff4d4f',color:"white"}} onClick={() => setSelectedProducts([])}>Reset</Button>
      </div>
    </div>
  );
};

export default AddSaleReturn;