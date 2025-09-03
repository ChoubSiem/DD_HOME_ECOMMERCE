import React, { useState, useEffect,useCallback } from 'react';
import { Modal, Form, Input, Select, Button, message,Row,Col  } from 'antd';
import { motion } from 'framer-motion';
import { useUser } from '../../hooks/UserUser';

const { Option } = Select;

const CustomerModal = ({ visible, onCancel, onSave, initialData, isEditing, customerGroups }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { handleUpdateCustomer } = useUser(); 
  const [customerCode, setCustomerCode] = useState(''); 
  useEffect(() => {
    if (visible) {
      if (initialData) {
        form.setFieldsValue({
          username: initialData.username,
          phone: initialData.phone,
          address: initialData.address,
          customer_group_id: initialData.customer_group_id,
          customer_code: customerCode
        });
      } else {
        form.resetFields();
      }
    }
  }, [visible, initialData, form]);  
  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      await onSave(values); 
      // message.success(isEditing ? 'Customer updated successfully' : 'Customer added successfully');
      onCancel(); 
    } catch (error) {
      console.error(error);
      message.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };  
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
    <Modal
      open={visible}
      onCancel={onCancel}
      footer={null}
      centered
      className="customer-modal"
      width="60%"
      destroyOnClose // ensures clean form state
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
        {initialData?.customer_code == null && (
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
                  value={customerCode} // Controlled input
                  onChange={handleCodeChange}
                />
              </Col>
              <Col>
                <Button
                  type="default"
                  onClick={generateRandomCode}
                  size="large"
                  style={{ height: '48px' }}
                  disabled={loading}
                >
                  Generate Code
                </Button>
              </Col>
            </Row>
          </Form.Item>
        )}

          <Form.Item
            name="username"
            label="Customer Name"
            rules={[{ required: true, message: 'Please enter customer name' }]}
          >
            <Input placeholder="Enter customer name" style={{ fontSize: '16px', height: '48px' }} />
          </Form.Item>

          <Form.Item
            name="phone"
            label="Contact Number"
            // rules={[{ required: true, message: 'Please enter contact number' }]}
          >
            <Input placeholder="Enter contact number" style={{ fontSize: '16px', height: '48px' }} />
          </Form.Item>

          <Form.Item
            name="address"
            label="Address"
            // rules={[{ required: true, message: 'Please enter address' }]}
          >
            <Input.TextArea placeholder="Enter address" rows={4} />
          </Form.Item>

          <Form.Item
            name="customer_group_id"
            label="Customer Group"
            rules={[{ required: true, message: 'Please select customer group' }]}
          >
            <Select placeholder="Select customer group" style={{ fontSize: '16px', height: '48px' }}>
              {(customerGroups || []).map(group => (
                <Option key={group.id} value={group.id}>
                  {group.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              style={{ width: '100%', background: '#52c41a', borderColor: '#52c41a', height: '48px' }}
            >
              {isEditing ? 'Update Customer' : 'Add Customer'}
            </Button>
          </Form.Item>
        </Form>
      </motion.div>
    </Modal>
  );
};

export default CustomerModal;
