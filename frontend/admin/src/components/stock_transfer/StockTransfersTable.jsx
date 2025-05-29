import React, { useState } from "react";
import DataTable from "react-data-table-component";
import { Button, Dropdown, Space } from "antd";
import { 
  EditOutlined, 
  MoreOutlined, 
  DeleteOutlined, 
  EyeOutlined 
} from "@ant-design/icons";
import StockModalDetail from "./StockModalDetails"; 

const StockTable = ({ data, onEdit, onDelete, loading }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStock, setSelectedStock] = useState(null);
  
  const showModal = (stock) => {    
    setSelectedStock(stock);
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

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
      name: "Transfer User",
      selector: row => row.tranfer_user,
      sortable: true,
      cell: (row) => <strong>{row.tranfer_user?.username || 'N/A'}</strong>,
    },
    {
      name: "From ..",
      selector: row => row.from_warehouse,
      sortable: true,
      cell: (row) => <strong>{row.from_warehouse?.name || 'Comapny'}</strong>,
    },
    {
      name: "To ..",
      selector: row => row.to_warehouse,
      sortable: true,
      cell: (row) => <strong>{row.to_warehouse?.name || 'N/A'}</strong>,
    },
    {
      name: "Actions",
      cell: (row) => (
        <Dropdown style={{border:"none"}}
          menu={{
            items: [
              {
                key: 'view',
                label: (
                  <Space onClick={() => showModal(row)}>
                    <EyeOutlined /> View
                  </Space>
                ),
              },
              {
                key: 'edit',
                label: (
                  <Space onClick={() => onEdit(row)}>
                    <EditOutlined /> Edit
                  </Space>
                ),
              },
              {
                key: 'delete',
                label: (
                  <Space onClick={() => onDelete(row.id)}>
                    <DeleteOutlined /> Delete
                  </Space>
                ),
                danger: true,
              },
            ],
          }}
          trigger={['click']}
        >
      <Button icon={<MoreOutlined />} style={{ border: 'none', boxShadow: 'none',color:"green" }} />
      </Dropdown>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
    },
  ];
  

  return (
    <div>
      <DataTable
        columns={columns}
        data={data}  
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

      <StockModalDetail
        open={isModalOpen}
        onCancel={handleCancel}
        stock={selectedStock}  
      />
    </div>
  );
};

export default StockTable;
