import React, { useState, useEffect } from 'react';
import DataTable from 'react-data-table-component';
import { Button, Space, Modal, message } from 'antd';
import { EditOutlined, DeleteOutlined, ExclamationCircleFilled } from '@ant-design/icons';
import { motion } from 'framer-motion';
import CustomerModal from './EditCustomerModal';

const { confirm } = Modal;

const CustomerTable = ({ customers: allCustomers, onEdit, onDelete }) => {
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [currentData, setCurrentData] = useState([]);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const loadPage = (pageNumber, rowsPerPage) => {
    setLoading(true);

    setTimeout(() => {
      const startIndex = (pageNumber - 1) * rowsPerPage;
      const endIndex = startIndex + rowsPerPage;
      setCurrentData(allCustomers.slice(startIndex, endIndex));
      setLoading(false);
    }, 500); 
  };

  useEffect(() => {
    loadPage(page, perPage);
  }, [allCustomers]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
    loadPage(newPage, perPage);
  };

  const handlePerRowsChange = (newPerPage, newPage) => {
    setPerPage(newPerPage);
    setPage(newPage);
    loadPage(newPage, newPerPage);
  };

  const getRoleTag = (role) => (
    <span style={{ color: '#52c41a', fontWeight: 'bold' }}>
      {role || 'Customer'}
    </span>
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

  const handleEdit = (customer) => {
    setSelectedCustomer(customer);
    setIsEditModalOpen(true);
    if (onEdit) onEdit(customer);
  };

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
      selector: (row, index) => (page - 1) * perPage + index + 1,
      width: '5%',
    },
    {
      name: 'Name',
      selector: (row) => row.username,
      sortable: true,
      width: '20%',
    },
    {
      name: 'Phone',
      selector: (row) => row.phone,
      sortable: true,
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
      width: '40%',
    },
    {
      name: 'Actions',
      cell: (row) => (
        <div>
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
        </div>
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
        <DataTable
          columns={columns}
          data={currentData}
          progressPending={loading}
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
      </Space>

      {selectedCustomer && (
        <CustomerModal
          visible={isEditModalOpen}
          onCancel={handleEditModalClose}
          onSave={handleEditSave}
          initialData={selectedCustomer}
          isEditing={true}
        />
      )}
    </motion.div>
  );
};

export default CustomerTable;
