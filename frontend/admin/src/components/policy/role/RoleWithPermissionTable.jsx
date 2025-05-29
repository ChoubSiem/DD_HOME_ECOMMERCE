import React from 'react';
import DataTable from 'react-data-table-component';
import { Button, Popconfirm, Space } from 'antd';
import { FiEdit2, FiTrash2, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import { EditOutlined,LockOutlined } from "@ant-design/icons";

const RoleWithPermission = ({ 
  data, 
  loading, 
  editRolePermission, 
}) => {
  const columns = [
   
    {
      name: 'Name',
      selector: row => row.name,
      sortable: true,
      cell: row => (
        <div style={{ padding: '12px 8px' }}>
          <strong>{row.name}</strong>
        </div>
      ),
      width: '200px',
    },
    {
      name: 'Permissions',
      selector: row => row.permissions,
      cell: row => (
        <div style={{ 
          padding: '12px 8px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '8px'
        }}>
          {row.permissions?.length > 0 ? (
            row.permissions.map((perm, index) => (
              <span 
                key={index}
                style={{ 
                  background: perm.isDangerous 
                    ? 'rgba(245, 34, 45, 0.08)' 
                    : 'rgba(82, 196, 26, 0.08)',
               
                  padding: '4px 8px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: 500,
                  display: 'inline-flex',
                  alignItems: 'center',
                  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
                  transition: 'all 0.15s ease',
                }}
              >
                {perm.name}
              </span>
            ))
          ) : (
            <span style={{ color: '#bfbfbf' }}>No permissions</span>
          )}
        </div>
      ),
      grow: 1,
    },
    {
      name: 'Actions',
      cell: row => (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '12px 8px',
          width: '100%'
        }}>
          <Space size="middle">
            <Button 
              size="small"
              icon={<EditOutlined />} 
              onClick={() => editRolePermission(row.id)}
            />
          </Space>
        </div>
      ),
      ignoreRowClick: true,
      width: '180px',
    },
  ];

  const customStyles = {
    headCells: {
      style: {
        backgroundColor: '#52c41a',
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
        display: 'flex',
        justifyContent: 'center', 
        alignItems: 'center', 
        padding: '12px 8px',
      },
    },
    cells: {
      style: {
        padding: '10px', 
        textAlign: 'center',
      },
    },
    rows: {
      style: {
        '&:not(:last-of-type)': {
          borderBottom: '1px solid #f0f0f0',
        },
        '&:hover': {
          backgroundColor: '#fafafa',
        },
      },
    },
  };

  return (
    <div style={{ 
      border: '1px solid #f0f0f0',
      overflow: 'hidden',
    }}>
      <DataTable
        columns={columns}
        data={data.map((item, index) => ({ ...item, index }))}
        progressPending={loading}
        pagination
        paginationPerPage={5}
        paginationRowsPerPageOptions={[5, 10, 1000]}
        highlightOnHover
        customStyles={customStyles}
        noDataComponent={
          <div style={{ 
            padding: '40px',
            textAlign: 'center',
            color: '#bfbfbf'
          }}>
            No roles found
          </div>
        }
      />
    </div>
  );
};

export default RoleWithPermission;