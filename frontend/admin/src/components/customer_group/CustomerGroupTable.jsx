import React, { useState } from 'react';
import DataTable from 'react-data-table-component';
import { Button } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import CustomerModal from './EditCustomerGroupModal';

const CustomerGroupTable = ({ groups, onEdit, onDelete, onCreate, loading }) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const columns = [
    {
      name: 'No',
      selector: (row, index) => index + 1,
      width: '10%',
    },
    {
      name: 'Name',
      selector: (row) => row.name,
      sortable: true,
      width: '25%',
    },
    {
      name: 'Code',
      selector: (row) => row.code,
      sortable: true,
      width: '20%',
    },
    {
      name: 'Description',
      selector: (row) => row.description,
      sortable: true,
      width: '35%',
      cell: (row) => (
        <span style={{ whiteSpace: 'normal', wordBreak: 'break-word' }}>
          {row.description || '-'}
        </span>
      ),
    },
    {
      name: 'Actions',
      cell: (row) => (
        <div>
          <Button
            size="small"
            icon={<EditOutlined style={{ color: '#52c41a' }} />}
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(row);
            }}
            style={{ marginRight: '8px', border: 'none' }}
          />
          <Button
            size="small"
            icon={<DeleteOutlined style={{ color: '#ff4d4f' }} />}
            onClick={(e) => {
              e.stopPropagation();
              onDelete(row.id);
            }}
            style={{ border: 'none' }}
          />
        </div>
      ),
      ignoreRowClick: true,
      width: '10%',
    },
  ];

  const handleEdit = (customer) => {
    setSelectedCustomer(customer);
    setIsEditModalOpen(true);
    onEdit(customer);
  };

  const handleEditModalClose = () => {
    setIsEditModalOpen(false);
    setSelectedCustomer(null);
  };

  const handleEditSave = () => {
    setIsEditModalOpen(false);
    setSelectedCustomer(null);
    onCreate(); // Refresh the data
  };

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
        '&:hover': {
          backgroundColor: '#f5f5f5',
        },
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
      <DataTable
        columns={columns}
        data={groups}
        progressPending={loading}
        pagination
        highlightOnHover
        pointerOnHover
        responsive
        striped
        customStyles={customStyles}
      />
    </motion.div>
  );
};

export default CustomerGroupTable;