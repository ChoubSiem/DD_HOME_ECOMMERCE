import React from 'react';
import { Form, Input, InputNumber, Select, Button } from 'antd';
import { SyncOutlined } from '@ant-design/icons';

export const ProductBasicInfo = ({ 
  form, 
  isEdit, 
  categories, 
  productGroups, 
  units, 
  generateRandomCode,
  productData,
  loading 
}) => {
  return (
    <>
      <Form.Item
        label="Product Name"
        name="name"
        rules={[{ required: true, message: "Please enter product name" }]}
      >
        <Input placeholder="Enter product name" style={{ height: "40px", fontSize: "16px" }} />
      </Form.Item>
      
      <Form.Item
        label="Product Code"
        name="code"
        rules={[{ required: true, message: "Please enter product code" }]}
      >
        <Input
          placeholder="Enter product code"
          value={productData?.code}
          suffix={
            !isEdit && (
              <Button
                type="text"
                icon={<SyncOutlined />}
                onClick={() => generateRandomCode(form)}
                style={{ marginRight: -8 }}
              />
            )
          }
          style={{ height: "40px", fontSize: "16px" }}
          disabled={isEdit}
        />
      </Form.Item>
      
      <Form.Item label="Category" name="category_id">
        <Select
          placeholder="Select category"
          style={{ height: "40px", fontSize: "16px" }}
          loading={loading}
        >
          {categories.map((category) => (
            <Select.Option key={category.id} value={category.id}>
              {category.name}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>
    </>
  );
};