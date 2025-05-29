
import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, Button, message } from 'antd';
import { motion } from 'framer-motion';
import { useUser } from '../../hooks/UserUser';
import Cookies from 'js-cookie';
// import './SupplierModal.css';

const { Option } = Select;

const SupplierModal = ({ visible, onCancel, onSave, initialData, isEditing }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { handleSupplierUpdate } = useUser();
  const token = Cookies.get('token');

  useEffect(() => {
    if (initialData) {
      form.setFieldsValue({
        username: initialData.username,
        company: initialData.company,
        phone: initialData.phone,
        email: initialData.email,
        address: initialData.address,
        role: initialData.role_name,
      });
    } else {
      form.resetFields();
    }
  }, [initialData, form]);

  const handleSubmit = async (values) => {
    try {
      const supplierData = { ...values };
      let result;
      if (isEditing && initialData?.id) {
        result = await handleSupplierUpdate(initialData.id, supplierData, token);
      }
      if (result?.success) {
        onSave();
        if (!isEditing) {
          form.resetFields();
        }
        onCancel();
        location.reload();
        message.success(isEditing ? 'Supplier updated successfully' : 'Supplier created successfully');
      } else {
        message.error(isEditing ? 'Failed to update supplier.' : 'Failed to create supplier.');
      }
    } catch (error) {
      console.error(`Error ${isEditing ? 'updating' : 'creating'} supplier:`, error);
      message.error(isEditing ? 'Failed to update supplier.' : 'Failed to create supplier.');
    }
  };

  return (
    <Modal
      open={visible}
      onCancel={onCancel}
      footer={null}
      centered
      className="supplier-modal"
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
            label="Supplier Name"
            rules={[{ required: true, message: 'Please enter supplier name' }]}
          >
            <Input placeholder="Enter supplier name" style={{ fontSize: '16px', height: '48px' }} />
          </Form.Item>
          <Form.Item
            name="company"
            label="Company"
            rules={[{ required: true, message: 'Please enter company name' }]}
          >
            <Input placeholder="Enter company name" style={{ fontSize: '16px', height: '48px' }} />
          </Form.Item>
          <Form.Item
            name="phone"
            label="Contact Number"

            rules={[{ required: true, message: 'Please enter contact number' }]}
          >
            <Input placeholder="Enter contact number" style={{ fontSize: '16px', height: '48px' }}/>
          </Form.Item>
          <Form.Item
            name="address"
            label="Address"
            rules={[{ required: true, message: 'Please enter address' }]}
          >
            <Input.TextArea placeholder="Enter address" rows={4} />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              style={{ width: '100%', background: '#52c41a', borderColor: '#52c41a',height:"48px" }}
            >
              {isEditing ? 'Update Supplier' : 'Add Supplier'}
            </Button>
          </Form.Item>
        </Form>
      </motion.div>
    </Modal>
  );
};

export default SupplierModal;