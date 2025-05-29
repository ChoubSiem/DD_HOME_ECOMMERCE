import React from 'react';
import { Form, Input, Select, Button } from 'antd';
import { motion } from 'framer-motion';

const { Option } = Select;

const CustomerForm = ({ onSubmit, loading, customerGroups = [] }) => {
  const [form] = Form.useForm();

  const handleFinish = (values) => {
    onSubmit(values);
    form.resetFields();
  };

  console.log(customerGroups);
  

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleFinish}
      style={{ width: '100%' }}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        style={{ width: '100%' }}
      >
        <Form.Item
          name="username"
          label="Customer Name"
          rules={[{ required: true, message: 'Please enter customer name' }]}
          style={{ marginBottom: 24 }}
        >
          <Input
            placeholder="Enter customer name"
            size="large"
            style={{ fontSize: '16px', height: '48px' }}
          />
        </Form.Item>

        <Form.Item
          name="phone"
          label="Contact Number"
          rules={[{ required: true, message: 'Please enter contact number' }]}
          style={{ marginBottom: 24 }}
        >
          <Input
            placeholder="Enter contact number"
            size="large"
            type='number'
            style={{ fontSize: '16px', height: '48px' }}
          />
        </Form.Item>

        <Form.Item
          name="address"
          label="Address"
          rules={[{ required: true, message: 'Please enter address' }]}
          style={{ marginBottom: 24 }}
        >
          <Input.TextArea
            placeholder="Enter address"
            rows={4}
            style={{ fontSize: '16px' }}
          />
        </Form.Item>

        {/* ✅ Customer Group Dropdown */}
        <Form.Item
          name="customer_group_id"
          label="Customer Group"
          rules={[{ required: true, message: 'Please select customer group' }]}
          style={{ marginBottom: 24 }}
        >
          <Select
            placeholder="Select customer group"
            size="large"
            style={{ fontSize: '16px' }}
          >
            {customerGroups.map(group => (
              <Option key={group.id} value={group.id}>
                {group.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item style={{ width: '100%' }}>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            size="large"
            style={{ width: '100%', fontSize: '16px', height: '48px' }}
          >
            Add Customer
          </Button>
        </Form.Item>
      </motion.div>
    </Form>
  );
};

export default CustomerForm;
