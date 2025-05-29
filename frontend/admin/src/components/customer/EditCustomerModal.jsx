import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, Button, message } from 'antd';
import { motion } from 'framer-motion';
import { useUser } from '../../hooks/UserUser';
import Cookies from 'js-cookie';

const { Option } = Select;

const CustomerModal = ({ visible, onCancel, onSave, initialData, isEditing, customerGroups }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { handleUpdateCustomer } = useUser(); // You may rename this later to `handleCustomerUpdate`
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (initialData) {
      form.setFieldsValue({
        username: initialData.username,
        phone: initialData.phone,
        address: initialData.address,
        customer_group_id: initialData.customer_group_id,
      });
    } else {
      form.resetFields();
    }
  }, [initialData, form]);

  const handleSubmit = async (values) => {
    onSave(values);
  };

  return (
    <Modal
      open={visible}
      onCancel={onCancel}
      footer={null}
      centered
      className="customer-modal"
      width="60%"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
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
            rules={[{ required: true, message: 'Please enter contact number' }]}
          >
            <Input placeholder="Enter contact number" style={{ fontSize: '16px', height: '48px' }} />
          </Form.Item>

          <Form.Item
            name="address"
            label="Address"
            rules={[{ required: true, message: 'Please enter address' }]}
          >
            <Input.TextArea placeholder="Enter address" rows={4} />
          </Form.Item>

          <Form.Item
            name="customer_group_id"
            label="Customer Group"
            rules={[{ required: true, message: 'Please select customer group' }]}
          >
            <Select placeholder="Select customer group" style={{ fontSize: '16px', height: '48px' }}>
              {(customerGroups||[]).map(group => (
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
