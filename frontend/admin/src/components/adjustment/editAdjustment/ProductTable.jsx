import { Table, InputNumber, Select, Button, Popconfirm, Input } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import React from "react";

const { Option } = Select;

const EditProductTable = ({ 
  selectedProducts = [], 
  units = [],
  handleQuantityChange,
  handleAdjustmentTypeChange,
  handleUnitChange,
  handleRemoveProduct,
  handleNewQohChange
}) => {
  const safeProducts = Array.isArray(selectedProducts) ? selectedProducts : [];
  const safeUnits = Array.isArray(units) ? units : [];

  const columns = [
    {
      title: "No",
      key: "no",
      render: (_, __, index) => (
        <span style={{ fontWeight: "bold" }}>{index + 1}</span>
      ),
      width: 60,
      align: 'center'
    },
    {
      title: "Product",
      dataIndex: "productName",
      key: "productName",
      render: (text) => (
        <span style={{ fontWeight: "bold" }}>{text || 'Unknown Product'}</span>
      ),
      ellipsis: true
    },
    {
      title: "QOH",
      dataIndex: "qoh",
      key: "qoh",
      render: (qoh) => Number(qoh) || 0,
      width: 100,
      align: 'center'
    },
    {
      title: "Type",
      key: "adjustment",
      width: 150,
      render: (_, record) => (
        <Select
          value={record.adjustmentType || 'subtract'}
          style={{ width: "100%", borderRadius: 0 }}
          onChange={(value) => handleAdjustmentTypeChange(record.key, value)}
        >
          <Option value="subtract">Subtraction</Option>
          <Option value="add">Addition</Option>
        </Select>
      ),
    },
    {
      title: "Quantity",
      key: "quantity",
      width: 150,
      render: (_, record) => (
        <InputNumber
          min={0}
          value={Number(record.quantity) || 0}
          onChange={(value) => handleQuantityChange(record.key, value)}
          style={{ width: "100%", borderRadius: 0 }}
        />
      ),
    },
    {
      title: "Unit",
      key: "unit",
      width: 150,
      render: (_, record) => (
        <Input
          value={record.unit || 'N/A'}
          disabled
          style={{ 
            width: "100%",
            borderRadius: 0,
            backgroundColor: '#fafafa',
            color: 'rgba(0, 0, 0, 0.85)',
            cursor: 'default'
          }}
        />
      ),
    },
    {
      title: "New QOH",
      key: "newQoh",
      width: 150,
      render: (_, record) => {
        const currentQoh = Number(record.qoh) || 0;
        const quantity = Number(record.quantity) || 0;
        
        let calculatedQoh = currentQoh;
        if (record.adjustmentType === "add") {
          calculatedQoh = currentQoh + quantity;
        } else {
          calculatedQoh = Math.max(currentQoh - quantity, 0);
        }
        
        const displayValue = typeof record.newQoh === 'number' 
          ? record.newQoh 
          : calculatedQoh;

        return (
          <InputNumber
            min={0}
            value={displayValue}
            onChange={(value) => handleNewQohChange(
              record.key, 
              value, 
              record.qoh, 
              record.adjustmentType
            )}
            style={{ width: "100%", borderRadius: 0 }}
          />
        );
      },
    },
    {
      title: "Action",
      key: "action",
      width: 80,
      render: (_, record) => (
        <Popconfirm
          title="Are you sure to delete this product?"
          onConfirm={() => handleRemoveProduct(record.key)}
          okText="Yes"
          cancelText="No"
        >
          <Button 
            type="text" 
            danger 
            icon={<DeleteOutlined />} 
            style={{ borderRadius: 0 }}
          />
        </Popconfirm>
      ),
      align: 'center'
    },
  ];

  return (
    <Table
      bordered
      dataSource={safeProducts}
      columns={columns}
      pagination={false}
      rowKey="key"
      rowClassName="editable-row"
      style={{ marginTop: "20px" }}
      scroll={{ x: true }}
      locale={{
        emptyText: 'No products added yet'
      }}
    />
  );
};

export default React.memo(EditProductTable);