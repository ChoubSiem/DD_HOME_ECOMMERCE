import React, { useState, useEffect } from 'react';
import { Modal, message } from 'antd';
import { motion } from 'framer-motion';
import CustomerForm from './CustomerForm';
import { useUser } from '../../hooks/UserUser';
import Cookies from 'js-cookie';
// import './CustomerCreate.css';

const CreateCustomer = ({ visible, onCancel, onSave }) => {
  const [roles, setRoles] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [customerGroups, setCustomerGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const { handleCustomers ,handleGetCustomerGroup } = useUser();
  const token = localStorage.getItem('token');

  const handleGetCustomerGroupData = async () => {
    setLoading(true);
    try {
      const result = await handleGetCustomerGroup(token);      
      if (result?.success) {
        setCustomerGroups(result.groups || []);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
      message.error('Failed to fetch customers.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(()=>{
    handleGetCustomerGroupData();
  },[])

  const handleSubmit = async (values) => {
    try {
      onSave(values);
    } catch (error) {
      console.error('Error creating customer:', error);
      message.error('Failed to create customer.');
    }
  };

  return (
    <Modal
      open={visible}
      onCancel={onCancel}
      footer={null}
      centered
      className="customer-modal"
      width="60%" 
      style={{ maxWidth: '100vw', background: 'black' }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <CustomerForm
          customerGroups={customerGroups}
          onSubmit={handleSubmit}
          loading={loading}
        />
      </motion.div>
    </Modal>
  );
};

export default CreateCustomer;