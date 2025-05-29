import React from 'react';
import { Form, Input, Button } from 'antd';
import { motion } from 'framer-motion';

const CustomerGroupForm = ({ onSubmit, loading }) => {
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
          name="name"
          label="Group Name"
          rules={[{ required: true, message: 'Please enter customer group name' }]}
          style={{ marginBottom: 24 }}
        >
          <Input
            placeholder="Enter group name"
            size="large"
            style={{ fontSize: '16px', height: '48px' }}
          />
        </Form.Item>

        <Form.Item
          name="code"
          label="Group Code"
          rules={[{ required: true, message: 'Please enter group code' }]}
          style={{ marginBottom: 24 }}
        >
          <Input
            placeholder="Enter group code"
            size="large"
            style={{ fontSize: '16px', height: '48px' }}
          />
        </Form.Item>

        <Form.Item
          name="description"
          label="Description"
          style={{ marginBottom: 24 }}
        >
          <Input.TextArea
            placeholder="Optional description"
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
            Add Group
          </Button>
        </Form.Item>
      </motion.div>
    </Form>
  );
};

export default CustomerGroupForm;
