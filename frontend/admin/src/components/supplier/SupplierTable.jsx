
import React, { useState } from 'react';
import DataTable from 'react-data-table-component';
import { Button, Avatar, Space } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import SupplierModal from './EditSupplierModal';

const SupplierTable = ({ suppliers, onEdit, onDelete, onCreate, loading, permissions }) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);

  const hasSupplierEditPermission = permissions.some(
    (p) => p.name === "Supplier.edit"
  );
  const hasSupplierDeletePermission = permissions.some(
    (p) => p.name === "Supplier.delete"
  );

  const getRoleTag = (role) => {
    return (
      <span style={{ color: '#52c41a', fontWeight: 'bold' }}>
        {role || 'Supplier'}
      </span>
    );
  };

  const columns = [
    {
      name: 'No',
      selector: (row, index) => index + 1,
      width: '5%',
    },

    {
      name: 'Name',
      selector: (row) => row.username,
      sortable: true,
      width: '20%',
    },
    {
      name: 'Company',
      selector: (row) => row.company,
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
      name: 'Address',
      selector: (row) => row.address,
      sortable: true,
      width: '20%',
    },
    {
      name: 'Role',
      selector: (row) => row.role_name,
      sortable: true,
      width: '10%',
      cell: (row) => getRoleTag(row.role_name),
    },
    {
      name: 'Actions',
      cell: (row) => (
        <div>
          { hasSupplierEditPermission && (
          <Button
            size="small"
            icon={<EditOutlined style={{ color: '#52c41a' }} />}
            onClick={() => handleEdit(row)}
            style={{ marginRight: '8px', border: 'none' }}
          />
          )}
          { hasSupplierDeletePermission && (
          <Button
            size="small"
            icon={<DeleteOutlined style={{ color: '#ff4d4f' }} />}
            onClick={() => onDelete(row.id)}
            style={{ border: 'none' }}
          />
          )}
        </div>
      ),
      ignoreRowClick: true,
      width: '10%',
    },
  ];

  const handleCreate = () => {
    setIsCreateModalOpen(true);
  };

  const handleEdit = (supplier) => {
    setSelectedSupplier(supplier);
    setIsEditModalOpen(true);
    onEdit(supplier); // Trigger parent callback
  };

  const handleCreateModalClose = () => {
    setIsCreateModalOpen(false);
  };

  const handleEditModalClose = () => {
    setIsEditModalOpen(false);
    setSelectedSupplier(null);
  };

  const handleCreateSave = () => {
    setIsCreateModalOpen(false);
    onCreate(); // Trigger parent to refresh suppliers
  };

  const handleEditSave = () => {
    setIsEditModalOpen(false);
    setSelectedSupplier(null);
    onCreate(); 
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
      },
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="supplier-table-container"
    >
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <DataTable
          columns={columns}
          data={suppliers}
          progressPending={loading}
          pagination
          highlightOnHover
          pointerOnHover
          responsive
          striped
          customStyles={customStyles}
          onRowClicked={handleEdit}
        />
      </Space>

      <SupplierModal
        visible={isEditModalOpen}
        onCancel={handleEditModalClose}
        onSave={handleEditSave}
        initialData={selectedSupplier}
        isEditing={true}
          width="60%" 
        style={{ maxWidth: '100vw', background: 'black' }}
      />
    </motion.div>
  );
};

export default SupplierTable;