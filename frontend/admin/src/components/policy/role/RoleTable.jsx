import React from 'react';
import DataTable from 'react-data-table-component';
import { Button, Popconfirm, Space } from 'antd';
import { FiEdit2, FiTrash2, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import { SearchOutlined, PlusOutlined, FilterOutlined, EditOutlined,} from "@ant-design/icons";

const RoleTable = ({ 
  data, 
  loading, 
  onEdit, 
  onDelete, 
  onStatusChange ,
  isWithPermission = false
}) => {
  const columns = [
    {
      name: 'No',
      selector: (row, index) => index + 1,
      sortable: true,
      width: '15%',
    },
    {
      name: 'Name',
      selector: row => row.name,
      sortable: true,
      cell: row => (
        <div>
          <strong>{row.name}</strong>
        </div>
      ),
      sortable: true,
      width: '30%',
    },
    {
      name: 'Employee Number',
      selector: row => row.users_count,
      sortable: true,
      cell: row => (
        <div>
          <strong>{row.users_count}</strong>
        </div>
      ),
      sortable: true,
      width: '30%',
    },
    {
      name: 'Actions',
      cell: row => (
        <Space size="middle">
          <Button 
            icon={<EditOutlined />} 
            onClick={() => onEdit(row)}
          />
          <Popconfirm
            title="Are you sure to delete this role?"
            onConfirm={() => onDelete(row.id)}
          >
            <Button icon={<FiTrash2 />} danger />
          </Popconfirm>
          <Button
            icon={row.is_active ? <FiXCircle /> : <FiCheckCircle />}
            onClick={() => onStatusChange(row.id, row.is_active)}
            type={row.is_active ? 'default' : 'primary'}
          />
        </Space>
      ),
      ignoreRowClick: true,
      width:"25%"
    },
  ];

  const customStyles = {
    headCells: {
      style: {
        backgroundColor: "#52c41a",
        color: "white",
        fontWeight: "bold",
      },
    },
  };

  return (
    <div style={{ border: '1px solid #`f0f0f0`' }}>
      <DataTable
        columns={columns}
        data={data}
        progressPending={loading}
        pagination
        paginationPerPage={5}
        paginationRowsPerPageOptions={[5, 10, 15]}
        highlightOnHover
        customStyles={customStyles}
        noDataComponent={
          <div style={{ padding: '20px', textAlign: 'center' }}>
            No roles found
          </div>
        }
      />
    </div>
  );
};

export default RoleTable;