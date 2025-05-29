import React from 'react';
import { Form, Input, Select, Button } from 'antd';
import { motion } from 'framer-motion';

const { Option } = Select;

const SupplierForm = ({ roles, employees, onSubmit, loading }) => {
  const [form] = Form.useForm();

  const handleFinish = (values) => {
    onSubmit(values);
    form.resetFields();
  };

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
          label="User Name"
          rules={[{ required: true, message: 'Please enter supplier name' }]}
          style={{ marginBottom: 24 }}
        >
          <Input
            placeholder="Enter supplier name"
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
          name="company"
          label="Company"
          rules={[
            { type: 'company', message: 'Please enter a valid company' },
          ]}
          style={{ marginBottom: 24 }}
        >
          <Input
            placeholder="Enter company"
            size="large"
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

        <Form.Item style={{ width: '100%' }}>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            size="large"
            style={{ width: '100%', fontSize: '16px', height: '48px' }}
          >
            Add Supplier
          </Button>
        </Form.Item>
      </motion.div>
    </Form>
  );
};

export default SupplierForm;
