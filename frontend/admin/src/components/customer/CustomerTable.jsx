import React, { useState, useEffect } from 'react';
import DataTable from 'react-data-table-component';
import { Button, Space, Modal, message, Spin } from 'antd';
import { EditOutlined, DeleteOutlined, ExclamationCircleFilled } from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import CustomerModal from './EditCustomerModal';
import "./CustomerTable.css";

const { confirm } = Modal;

const CustomerTable = ({ customers: allCustomers, onEdit, onDelete ,customerGroups,onSave  }) => {
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [currentData, setCurrentData] = useState([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const loadPage = (pageNumber, rowsPerPage) => {
    setLoading(true);
    
    requestAnimationFrame(() => {
      const startIndex = (pageNumber - 1) * rowsPerPage;
      const endIndex = startIndex + rowsPerPage;
      setCurrentData(allCustomers.slice(startIndex, endIndex));
      
      setTimeout(() => {
        setLoading(false);
      }, 150);
    });
  };

  useEffect(() => {
    loadPage(page, perPage);
  }, [allCustomers, page, perPage]);
  
  const handlePageChange = (newPage) => {
    setPage(newPage);
    loadPage(newPage, perPage);
  };

  const handlePerRowsChange = (newPerPage, newPage) => {
    setPerPage(newPerPage);
    setPage(newPage);
    loadPage(newPage, newPerPage);
  };

  const handleEdit = (customer) => {
    setSelectedCustomer(customer);
    setIsEditModalOpen(true);
  };

  const handleModalSave = async (values) => {
    try {
      if (selectedCustomer && onSave) {
        await onSave(values, true, selectedCustomer.id);
        setIsEditModalOpen(false);
        setSelectedCustomer(null);
      }
    } catch (error) {
      console.error('Error saving customer:', error);
    }
  };

  const getRoleTag = (role) => (
    <motion.span 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      style={{ color: '#52c41a', fontWeight: 'bold' }}
    >
      {role || 'Customer'}
    </motion.span>
  );

  const showDeleteConfirm = (id) => {
    confirm({
      title: 'Are you sure you want to delete this customer?',
      icon: <ExclamationCircleFilled />,
      content: 'This action cannot be undone.',
      okText: 'Yes, delete it',
      okType: 'danger',
      cancelText: 'No, cancel',
      onOk() {
        if (onDelete) {
          onDelete(id);
        }
      },
      onCancel() {
        console.log('Deletion cancelled');
      },
    });
  };

  // const handleEdit = (customer) => {
  //   setSelectedCustomer(customer);
  //   setIsEditModalOpen(true);
  //   if (onEdit) onEdit(customer);
  // };

  const handleEditModalClose = () => {
    setIsEditModalOpen(false);
    setSelectedCustomer(null);
  };

  const handleEditSave = () => {
    setIsEditModalOpen(false);
    setSelectedCustomer(null);
  };

  const columns = [
    {
      name: 'No',
      selector: (row, index) => (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: index * 0.05, duration: 0.3 }}
        >
          {(page - 1) * perPage + index + 1}
        </motion.span>
      ),
      width: '5%',
    },
    {
      name: 'Name',
      selector: (row) => row.username,
      sortable: true,
      cell: row => (
        <motion.span 
          className="khmer-text"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          {row.username}
        </motion.span>
      ),
      width: '20%',
    },
    {
      name: 'Phone',
      selector: (row) => row.phone,
      sortable: true,
      cell: row => (
        <motion.span
          className="khmer-text"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {row.phone}
        </motion.span>
      ),
      width: '15%',
    },
    {
      name: 'Group',
      selector: (row) => row.group_name,
      sortable: true,
      width: '10%',
      cell: (row) => getRoleTag(row.group_name),
    },
    {
      name: 'Address',
      selector: (row) => row.address,
      sortable: true,
      cell: row => (
        <motion.span
        className="khmer-text"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {row.address}
        </motion.span>
      ),
      width: '40%',
    },
    {
      name: 'Actions',
      cell: (row) => (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Button
            size="small"
            icon={<EditOutlined style={{ color: '#52c41a' }} />}
            onClick={() => handleEdit(row)}
            style={{ marginRight: '8px', border: 'none' }}
          />
          <Button
            size="small"
            icon={<DeleteOutlined style={{ color: '#ff4d4f' }} />}
            onClick={() => showDeleteConfirm(row.id)}
            style={{ border: 'none' }}
          />
        </motion.div>
      ),
      ignoreRowClick: true,
      width: '10%',
    },
  ];

  const customStyles = {
    headCells: {
      style: {
        backgroundColor: '#52c41a',
        color: 'white',
        fontWeight: 'bold',
        fontSize: '14px',
      },
    },
    rows: {
      style: {
        borderBottom: 'none',
        cursor: 'pointer',
        fontSize: '14px',
      },
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="customer-table-container"
    >
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <AnimatePresence>
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ 
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '300px',
                width: '100%'
              }}
            >
              <Spin size="large" />
            </motion.div>
          ) : (
            <motion.div
              key="table"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              style={{ width: '100%' }}
            >
              <DataTable
                columns={columns}
                data={currentData}
                progressPending={loading}
                progressComponent={
                  <div style={{ padding: '24px', textAlign: 'center', width: '100%' }}>
                    <Spin size="large" />
                  </div>
                }
                // noDataComponent={
                //   <motion.div
                //     initial={{ opacity: 0 }}
                //     animate={{ opacity: 1 }}
                //     style={{ padding: '40px', textAlign: 'center' }}
                //   >
                //     No customers found
                //   </motion.div>
                // }
                pagination
                paginationServer
                paginationTotalRows={allCustomers.length}
                paginationPerPage={perPage}
                paginationRowsPerPageOptions={[10, 25, 50, allCustomers.length]}
                onChangePage={handlePageChange}
                onChangeRowsPerPage={handlePerRowsChange}
                highlightOnHover
                pointerOnHover
                responsive
                striped
                customStyles={customStyles}
                style={{ tableLayout: 'fixed' }}
                fixedHeader
                fixedHeaderScrollHeight="500px"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </Space>

      {selectedCustomer && (
        <CustomerModal
          visible={isEditModalOpen}
          onCancel={handleEditModalClose}
          onSave={handleModalSave}
          initialData={selectedCustomer}
          isEditing={true}
          customerGroups={customerGroups}
        />
      )}
    </motion.div>
  );
};

export default CustomerTable;