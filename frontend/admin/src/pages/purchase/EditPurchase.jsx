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
import "./EditPurchase.css";

const AddPurchase = () => {
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const products = [
    { id: "1", name: "Laptop Pro X", price: 1200, unit: "pcs" },
    { id: "2", name: "Smartphone Z10", price: 800, unit: "pcs" },
    { id: "3", name: "Mouse Wireless", price: 50, unit: "pcs" },
    { id: "4", name: "Headphones", price: 50, unit: "pcs" },
    { id: "5", name: "Keyboard Mechanical", price: 100, unit: "pcs" },
  ];

  const handleSearchChange = (value) => {
    setSearchTerm(value);
  };

  const handleProductSelect = (value) => {
    const selectedProduct = products.find((product) => product.name === value);

    if (!selectedProduct) {
      message.error("Product not found.");
      return;
    }
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
    };

    setSelectedProducts([...selectedProducts, newProduct]);
    message.success(`${selectedProduct.name} has been added to the purchase list.`);
    setSearchTerm(""); 
  };
  const handleQuantityChange = (key, value) => {
    const updatedProducts = selectedProducts.map((product) =>
      product.key === key ? { ...product, quantity: value, total: value * product.price } : product
    );
    setSelectedProducts(updatedProducts);
  };
  const handleRemoveProduct = (key) => {
    const updatedProducts = selectedProducts.filter((p) => p.key !== key);
    setSelectedProducts(updatedProducts);
  };
  const totalAmount = selectedProducts.reduce(
    (sum, product) => sum + product.quantity * product.price,
    0
  );
  const handleSave = () => {
    setSelectedProducts([]);
  };
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
      title: "Total ($)",
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
            title="Are you sure to delete this product?"
            onConfirm={() => handleRemoveProduct(record.key)}
          >
            <Button type="link" danger style={{ padding: 0 }}>
              Delete
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
        <h1 style={{ color: "#52c41a" }}>Edit Purchase</h1>
        <p>Select products and add them to the purchase list</p>
      </div>

      {/* Search and Add Product */}
      <div className="search-bar">
        
        <AutoComplete
          options={products
            .filter((product) =>
              product.name.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .map((product) => ({ value: product.name }))}
          placeholder="Search for supllier..."
          value={searchTerm}
          onChange={handleSearchChange}
          onSelect={handleProductSelect}
          style={{ width: "300px" }}
        />
        <AutoComplete
        className="product"
          options={products
            .filter((product) =>
              product.name.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .map((product) => ({ value: product.name }))}
          placeholder="Search for products..."
          value={searchTerm}
          onChange={handleSearchChange}
          onSelect={handleProductSelect}
          style={{ width: "100%" ,height:'40px'}}
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

      {/* Total Amount */}
      <div className="total-amount">
        <strong>Total Amount: ${totalAmount.toFixed(2)}</strong>
      </div>

      {/* Actions */}
      <div className="actions">
        <Button
          type="primary"
          onClick={handleSave}
          style={{ backgroundColor: "#52c41a", borderColor: "#52c41a" }}
        >
          Save Purchase
        </Button>
        <Button onClick={() => setSelectedProducts([])}>Reset</Button>
      </div>
    </div>
  );
};

export default AddPurchase;