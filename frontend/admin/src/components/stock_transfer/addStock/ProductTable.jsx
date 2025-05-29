import { Table, InputNumber, Select, Button, Popconfirm } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import React from "react";

const { Option } = Select;

const ProductsTable = ({ 
  selectedProducts, 
  units,
  handleQuantityChange,
  handleAdjustmentTypeChange,
  handleUnitChange,
  handleRemoveProduct,
  handleNewQohChange
}) => {
  const columns = [
    {
      title: "No",
      key: "no",
      render: (_, __, index) => (
        <span style={{ fontWeight: "bold" }}>{index + 1}</span>
      ),
    },
    {
      title: "Product",
      key: "productName",
      render: (_, record) => (
        <span style={{ fontWeight: "bold" }}>{record.productName}</span>
      ),
    },
    {
      title: "Unit",
      key: "unit",
      width: 150,
      render: (_, record) => (
        <Select
          value={record.unit}
          style={{ width: "100%", borderRadius: 0 }}
          onChange={(value) => handleUnitChange(record.key, value)}
        >
          {units.map((unit) => (
            <Option key={unit} value={unit}>
              {unit}
            </Option>
          ))}
        </Select>
      ),
    },
    {
      title: "QOH",
      key: "qoh",
      render: (_, record) => record.qoh,
    },
      {
        title: "Quantity",
        key: "quantity",
        width: 200,
        render: (_, record) => (
          <InputNumber
            min={0}
            value={record.quantity}
            onChange={(value) => handleQuantityChange(record.key, value)}
            style={{ width: "100%", borderRadius: 0 }}
          />
        ),
      },
    {
      title: "Remove",
      key: "remove",
      width: 80,
      render: (_, record) => (
        <Popconfirm
          title="Are you sure to delete this product?"
          onConfirm={() => handleRemoveProduct(record.key)}
        >
          <Button 
            type="link" 
            danger 
            icon={<DeleteOutlined />} 
            style={{ borderRadius: 0 }}
          />
        </Popconfirm>
      ),
    },
  ];

  return (
    <Table
      bordered
      dataSource={selectedProducts}
      columns={columns}
      pagination={false}
      rowClassName="editable-row"
      style={{ marginTop: "20px" }}
    />
  );
};

export default ProductsTable;