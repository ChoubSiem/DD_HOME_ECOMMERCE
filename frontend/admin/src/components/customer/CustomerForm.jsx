
import React, { useCallback, useState } from 'react';
import { Form, Input, Select, Button, Row, Col, Result } from 'antd';

const { Option } = Select;

const CustomerForm = ({ onSubmit, loading, customerGroups = [] }) => {
  const [form] = Form.useForm();
  const [customerCode, setCustomerCode] = useState(''); 

  const handleFinish = useCallback((values) => {
    onSubmit(values);
    form.resetFields();
    setCustomerCode(''); 
  }, [form, onSubmit]);

  const generateRandomCode = useCallback(() => {
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const timestamp = Date.now().toString().slice(-4);
    const code = `CUST-${year}${month}-${randomNum}`;
    try {
      form.setFieldsValue({ customer_code: code });
      setCustomerCode(code); 
    } catch (error) {
      console.error('Error setting customer_code:', error);
    }
  }, [form]);

  const handleCodeChange = (e) => {
    const value = e.target.value;
    setCustomerCode(value);
    form.setFieldsValue({ customer_code: value }); 
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleFinish}
      style={{ width: '100%' }}
    >
      {/* Customer Code */}
      <Form.Item
        label="Customer Code"
        name="customer_code"
        rules={[{ required: true, message: 'Please enter customer code' }]}
        style={{ marginBottom: 24 }}
      >
        <Row gutter={8}>
          <Col flex="auto">
            <Input
              placeholder="Enter or generate customer code"
              size="large"
              style={{ fontSize: '16px', height: '48px' }}
              allowClear
              value={customerCode} // Force controlled input
              onChange={handleCodeChange}
            />
          </Col>
          <Col>
            <Button
              type="default"
              onClick={() => {
                generateRandomCode();
              }}
              size="large"
              style={{ height: '48px' }}
              disabled={loading}
            >
              Generate Code
            </Button>
          </Col>
        </Row>
      </Form.Item>

      {/* Name */}
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

      {/* Phone */}
      <Form.Item
        name="phone"
        label="Contact Number"
        rules={[
          { required: true, message: 'Please enter contact number' },
          { pattern: /^[0-9]+$/, message: 'Please enter valid phone number' },
        ]}
        style={{ marginBottom: 24 }}
      >
        <Input
          placeholder="Enter contact number"
          size="large"
          style={{ fontSize: '16px', height: '48px' }}
        />
      </Form.Item>

      {/* Address */}
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

      {/* Customer Group */}
      <Form.Item
        name="customer_group_id"
        label="Customer Group"
        rules={[{ required: true, message: 'Please select customer group' }]}
        style={{ marginBottom: 24 }}
      >
        <Select
          placeholder="Select customer group"
          size="large"
          style={{ fontSize: '16px', height: '48px' }}
        >
          {customerGroups.map(group => (
            <Option key={group.id} value={group.id}>
              {group.name}
            </Option>
          ))}
        </Select>
      </Form.Item>

      {/* Submit Button */}
      <Form.Item style={{ width: '100%' }}>
        <Button
          type="primary"
          htmlType="submit"
          loading={loading}
          size="large"
          style={{
            width: '100%',
            fontSize: '16px',
            height: '48px',
            backgroundColor: '#1890ff',
            borderColor: '#1890ff',
          }}
        >
          {loading ? 'Processing...' : 'Add Customer'}
        </Button>
      </Form.Item>
    </Form>
  );
};

export default CustomerForm;