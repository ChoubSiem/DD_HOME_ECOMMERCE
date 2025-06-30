import React, { useState } from "react";
import DataTable from "react-data-table-component";
import { Button, Dropdown, Space, Tag, Badge, Tooltip } from "antd";
import { 
  EditOutlined, 
  MoreOutlined, 
  DeleteOutlined, 
  EyeOutlined,
  FilePdfOutlined,
  FileExcelOutlined,
  PrinterOutlined
} from "@ant-design/icons";
// import SalesReturnModalDetail from "./SalesReturnModalDetails";
import dayjs from "dayjs";

const SalesReturnsTable = ({ data, onEdit, onDelete, onDetail, loading }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);
  const [toggleCleared, setToggleCleared] = useState(false);
  
  const showModal = (returnItem) => {    
    setSelectedReturn(returnItem);
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const handleRowSelected = (state) => {
    setSelectedRows(state.selectedRows);
  };

  const contextActions = (
    <div style={{ display: 'flex', gap: '8px' }}>
      <Button 
        icon={<FilePdfOutlined />} 
        onClick={() => handleBulkExport('pdf')}
        size="small"
      >
        Export PDF
      </Button>
      <Button 
        icon={<FileExcelOutlined />} 
        onClick={() => handleBulkExport('excel')}
        size="small"
      >
        Export Excel
      </Button>
      <Button 
        danger
        icon={<DeleteOutlined />} 
        // onClick={handleBulkDelete}
        size="small"
      >
        Delete
      </Button>
    </div>
  );

  const handleBulkExport = (format) => {
    // Implement bulk export logic
    message.success(`Preparing ${selectedRows.length} returns for ${format.toUpperCase()} export`);
    setToggleCleared(!toggleCleared);
  };

  const handleBulkDelete = () => {
    Modal.confirm({
      title: 'Confirm Delete',
      content: `Are you sure you want to delete ${selectedRows.length} selected returns?`,
      onOk: () => {
        selectedRows.forEach(row => onDelete(row.id));
        setToggleCleared(!toggleCleared);
        message.success(`${selectedRows.length} returns deleted successfully`);
      }
    });
  };

  const statusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'orange', text: 'Pending' },
      completed: { color: 'green', text: 'Completed' },
      cancelled: { color: 'red', text: 'Cancelled' },
      refunded: { color: 'blue', text: 'Refunded' }
    };
    
    return (
      <Badge 
        color={statusConfig[status]?.color || 'gray'} 
        text={statusConfig[status]?.text || status} 
      />
    );
  };

  const columns = [
    {
      name: "Reference",
      selector: row => row.reference,
      sortable: true,
      cell: row => (
        <Tooltip title="Click to view details">
          <span className="reference-cell" onClick={() => showModal(row)}>
            <strong>{row.reference}</strong>
          </span>
        </Tooltip>
      ),
      width: '150px'
    },
    {
      name: "Date",
      selector: row => row.date,
      sortable: true,
      cell: row => (
        <span>{dayjs(row.date).format('DD/MM/YYYY HH:mm')}</span>
      ),
      width: '140px'
    },
    {
      name: "Original Sale",
      selector: row => row.original_sale,
      sortable: true,
      cell: row => (
        <span color="blue">{row.original_sale || 'N/A'}</span>
      ),
      width: '150px'
    },
    {
      name: "Customer",
      selector: row => row.customer_name,
      sortable: true,
      cell: row => (
        <span>{row.customer_name || 'Walk-in Customer'}</span>
      )
    },
    {
      name: "Total Amount",
      selector: row => row.total_amount,
      sortable: true,
      cell: row => (
        <strong>${parseFloat(row.refund_amount).toFixed(2)}</strong>
      ),
      right: true,
      width: '120px'
    },
    {
      name: "Actions",
      cell: (row) => (
        <Dropdown
          menu={{
            items: [
              {
                key: 'view',
                label: (
                  <Space onClick={() => showModal(row)}>
                    <EyeOutlined /> View Details
                  </Space>
                ),
              },
              {
                key: 'print',
                label: (
                  <Space onClick={() => window.print()}>
                    <PrinterOutlined /> Print
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
          placement="bottomRight"
        >
          <Button 
            icon={<MoreOutlined />} 
            style={{ border: 'none', boxShadow: 'none' }} 
          />
        </Dropdown>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
      width: '80px'
    },
  ];

  return (
    <div className="sales-returns-table">
      <DataTable
        title="Sales Returns"
        columns={columns}
        data={data}
        pagination
        paginationPerPage={10}
        paginationRowsPerPageOptions={[10, 20, 50, 100]}
        selectableRows
        selectableRowsHighlight
        onSelectedRowsChange={handleRowSelected}
        clearSelectedRows={toggleCleared}
        contextActions={contextActions}
        progressPending={loading}
        customStyles={{
          headCells: {
            style: {
              backgroundColor: "#52c41a",
              color: "white",
              fontWeight: "bold",
              fontSize: '14px'
            },
          },
          cells: {
            style: {
              fontSize: '14px',
              padding: '12px 8px'
            }
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
        pointerOnHover
        onRowClicked={(row) => showModal(row)}
      />

      {/* <SalesReturnModalDetail
        open={isModalOpen}
        onCancel={handleCancel}
        returnData={selectedReturn}  
      /> */}
    </div>
  );
};

export default SalesReturnsTable;