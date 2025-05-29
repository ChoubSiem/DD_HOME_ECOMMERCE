import React, { useState } from "react";
import DataTable from "react-data-table-component";
import { Button, Dropdown, Space } from "antd";
import { 
  EditOutlined, 
  MoreOutlined, 
  DeleteOutlined, 
  EyeOutlined, 
  StarOutlined 
} from "@ant-design/icons";
import AdjustmentModalDetail from "../../components/adjustment/addAdjustment/AdjustmentModalDetail";

const AdjustmentTable = ({ adjustments, handleEdit, handleDelete, loading }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAdjustment, setSelectedAdjustment] = useState(null);

  const showModal = (adjustment) => {
    setSelectedAdjustment(adjustment);
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const items = (adjustment) => [
    {
      key: 'view',
      icon: <EyeOutlined />,
      label: 'View Details',
      onClick: () => showModal(adjustment)
    },
    {
      key: 'edit',
      icon: <EditOutlined />,
      label: 'Edit',
      onClick: () => handleEdit(adjustment)
    },
    {
      key: 'status',
      icon: <StarOutlined />,
      label: adjustment.status === "active" ? "Deactivate" : "Activate"
    },
    {
      type: 'divider',
    },
    {
      key: 'delete',
      icon: <DeleteOutlined />,
      label: 'Delete',
      danger: true,
      onClick: () => handleDelete(adjustment.id)
    }
  ];

  const columns = [
    {
      name: "No",
      selector: row => row.no,
      sortable: true,
      cell: (row, index) => <strong>{index + 1}</strong>,
    },
    {
      name: "Date",
      selector: row => row.date,
      sortable: true,
      cell: (row) => <span>{new Date(row.date).toLocaleDateString()}</span>,
    },
    {
      name: "Reference",
      selector: row => row.reference,
      sortable: true,
      cell: (row) => <strong>{row.reference}</strong>,
    },
    {
      name: "Adjuster",
      selector: row => row.adjuster,
      sortable: true,
      cell: (row) => <strong>{row.adjuster?.username || 'N/A'}</strong>,
    },
    {
      name: "Warehouse",
      selector: row => row.warehouse,
      sortable: true,
      cell: (row) => <strong>{row.warehouse?.name || 'Head Office'}</strong>,
    },
    {
      name: "Note",
      selector: row => row.note,
      sortable: true,
      cell: (row) => (
        <strong>{row.note}</strong>
      ),
    },
    {
      name: "Actions",
      cell: (row) => (
        <Space size="middle">
          <Button
            type="text"
            icon={<EyeOutlined style={{ color: "#1890ff", cursor: "pointer" }} />}
            onClick={() => showModal(row)}
          />
          <Button
            type="text"
            icon={<EditOutlined style={{ color: "#52c41a", cursor: "pointer" }} />}
            onClick={() => handleEdit(row)}
          />
          <Dropdown 
            menu={{ items: items(row) }} 
            trigger={['click']}
            placement="bottomRight"
          >
            <Button 
              type="text" 
              icon={<MoreOutlined style={{ cursor: "pointer" }} />} 
            />
          </Dropdown>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <DataTable
        columns={columns}
        data={adjustments}
        progressPending={loading}
        pagination
        paginationPerPage={10}
        paginationRowsPerPageOptions={[10, 20, 50, 100]}
        customStyles={{
          headCells: {
            style: {
              backgroundColor: "#52c41a",
              color: "white",
              fontWeight: "bold",
              cursor: "pointer"
            },
          },
          rows: {
            style: {
              cursor: 'pointer',
              '&:hover': {
                backgroundColor: '#f5f5f5',
              }
            }
          }
        }}
        highlightOnHover
        onRowClicked={(row) => showModal(row)}
      />

      <AdjustmentModalDetail
        open={isModalOpen}
        onCancel={handleCancel}
        adjustment={selectedAdjustment}
      />
    </div>
  );
};

export default AdjustmentTable;