import React, { useState } from 'react';
import { Modal } from 'antd';
import { motion } from 'framer-motion';
import CustomerForm from './CustomerGroupForm';

const CreateCustomerGroup = ({ visible, onCancel, onSave }) => {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      await onSave(values); 
    } finally {
      setLoading(false);
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
      style={{ maxWidth: '100vw' }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <CustomerForm
          onSubmit={handleSubmit}
          loading={loading}
        />
      </motion.div>
    </Modal>
  );
};

export default CreateCustomerGroup;
