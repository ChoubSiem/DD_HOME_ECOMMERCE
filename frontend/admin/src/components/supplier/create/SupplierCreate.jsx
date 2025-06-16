
import React, { useState, useEffect } from 'react';
import { Modal, message } from 'antd';
import { motion } from 'framer-motion';
import SupplierForm from './SupplierForm';
import { useUser } from '../../../hooks/UserUser';
import Cookies from 'js-cookie';
import './SupplierCreate.css';

const CreateSupplier = ({ visible, onCancel, onSave }) => {
  const [roles, setRoles] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const { handleSuppliers, handleSupplierCreate } = useUser();
  const token = localStorage.getItem('token');

  const getSupplierDatas = async () => {
    setLoading(true);
    try {
      const result = await handleSuppliers(token);
      if (result?.success) {
        setSuppliers(result.suppliers || []);
      } else {
        message.error('Failed to fetch suppliers.');
      }
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      message.error('Failed to fetch suppliers.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    try {
      const supplierData = { ...values };
      console.log(values);

      // return ;
      
      const result = await handleSupplierCreate(supplierData, token);
      console.log(result);
      
      if (result?.success) {
        onSave();
      } else {
        message.error('Failed to create supplier.');
      }
    } catch (error) {
      console.error('Error creating supplier:', error);
      message.error('Failed to create supplier.');
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
    style={{ maxWidth: '100vw', background: 'black' }}
  >
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <SupplierForm
        roles={roles}
        employees={suppliers}
        onSubmit={handleSubmit}
        loading={loading}
      />
    </motion.div>
  </Modal>

  );
};

export default CreateSupplier;