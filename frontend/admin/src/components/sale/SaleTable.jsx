import React, { useState } from "react";
import PropTypes from "prop-types";
import DataTable from "react-data-table-component";
import { Button, Dropdown, Space, Tag, Tooltip, Typography } from "antd";
import { 
  EditOutlined, 
  MoreOutlined, 
  DeleteOutlined, 
  EyeOutlined,
  FilePdfOutlined,
  FileExcelOutlined,
  PrinterOutlined,
  PlusOutlined
} from "@ant-design/icons";
import SaleModalDetail from "./SaleModalDetail";
import { formatDate, formatCurrency } from "../../util/helper";
import Cookies from 'js-cookie';
const { Text } = Typography;

const greenTheme = {
  primary: '#389e0d',       
  light: '#f6ffed',         
  dark: '#135200',          
  highlight: '#b7eb8f',    
  muted: '#8c8c8c',      
  border: '#d9d9d9',       
  success: '#52c41a',      
  warning: '#faad14',      
  error: '#ff4d4f',        
  background: '#ffffff'      
};
let user = Cookies.get('user');
if (user) {
  user = JSON.parse(user);
}

const customStyles = {
  table: {
    style: {
      backgroundColor: greenTheme.background,
    },
  },
  headRow: {
    style: {
      borderTopWidth: '1px',
      borderTopColor: greenTheme.border,
      borderTopStyle: 'solid',
    },
  },
  headCells: {
    style: {
      backgroundColor: greenTheme.primary,
      color: 'white',
      fontWeight: 600,
      textTransform: 'uppercase',
      fontSize: '0.75rem',
      paddingLeft: '16px',
      paddingRight: '16px',
    },
  },
  cells: {
    style: {
      paddingLeft: '16px',
      paddingRight: '16px',
      fontSize: '0.875rem',
      '&:hover': {
        color: greenTheme.dark,
      },
    },
  },
  rows: {
    style: {
      color: greenTheme.text,
      borderBottomColor: greenTheme.border,
      '&:hover': {
        backgroundColor: greenTheme.light,
      },
      '&:nth-child(even)': {
        backgroundColor: '#fafafa',
      },
    },
  },
  pagination: {
    style: {
      borderTop: `2px solid ${greenTheme.primary}`,
      backgroundColor: greenTheme.light,
    },
  },
  pageButtons: {
    style: {
      color: greenTheme.primary,
      backgroundColor: greenTheme.background,
      border: `1px solid ${greenTheme.primary}`,
      borderRadius: '4px',
      '&:hover:not(:disabled)': {
        backgroundColor: greenTheme.light,
      },
    },
    activeStyle: {
      backgroundColor: greenTheme.primary,
      color: greenTheme.background,
      '&:hover': {
        backgroundColor: greenTheme.dark,
      },
    },
    disabledStyle: {
      color: greenTheme.muted,
      backgroundColor: greenTheme.background,
    },
  },
  paginationOptions: {
    style: {
      backgroundColor: greenTheme.background,
      border: `1px solid ${greenTheme.primary}`,
      borderRadius: '4px',
      color: greenTheme.text,
      '&:hover': {
        backgroundColor: greenTheme.light,
      },
    },
  },
};

const SalesTable = ({ 
  data, 
  onEdit, 
  onDelete, 
  onViewPayment,
  onAddPayment,
  loading,
  onExportPDF,
  onExportExcel,
  onPrint,
  totalSales,
  averageSale
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);
  
  const showModal = (sale) => {    
    setSelectedSale(sale);
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const statusTag = (status) => {
    const statusMap = {
      paid: { color: greenTheme.success, text: 'PAID' },
      pending: { color: greenTheme.warning, text: 'PENDING' },
      partial: { color: greenTheme.error, text: 'PARTIAL' },
      refunded: { color: 'volcano', text: 'REFUNDED' },
      default: { color: 'blue', text: status.toUpperCase() }
    };
    
    const statusConfig = statusMap[status.toLowerCase()] || statusMap.default;
    
    return (
      <Tag 
        color={statusConfig.color}
        style={{ 
          borderRadius: '12px', 
          fontWeight: 500,
          textTransform: 'uppercase',
          fontSize: '0.75rem'
        }}
      >
        {statusConfig.text}
      </Tag>
    );
  };

  const columns = [
    {
      name: "Reference",
      selector: row => row.reference,
      sortable: true,
      width: '130px',
      cell: (row) => <Text strong style={{ color: greenTheme.dark }}>{row.reference}</Text>,
    },
    {
      name: "DATE",
      selector: row => row.saleDate,
      sortable: true,
      width: '120px',
      cell: (row) => <Text>{formatDate(row.saleDate)}</Text>,
    },
  {
      name: 'Type',
      selector: row => row.type,
      sortable: true,
      cell: (row) => (
        <div>
          {row.type === 'warehouse' ? 'Warehouse' : 'Customer'}
        </div>
      ),
    },
  {
    name: `Customer / Warehouse`,
    selector: row => 
      row.customerName,
    sortable: true,
    cell: (row) => {
      if (row.type === 'warehouse') {
        return (
          <div>
            <Text strong style={{ display: 'block' }}>
              {row.customerName  || 'Unknown Warehouse'}
            </Text>
            {row.warehouse?.location && (
              <Text type="secondary" style={{ fontSize: '0.75rem' }}>
                {row.warehouse.location}
              </Text>
            )}
          </div>
        );
      } else {
        return (
          <div>
            <Text strong style={{ display: 'block' }}>
              {row.customerName || 'Walk-in Customer'}
            </Text>
            {row.customer?.email && (
              <Text type="secondary" style={{ fontSize: '0.75rem' }}>
                {row.customer.email}
              </Text>
            )}
          </div>
        );
      }
    },
  },

    {
      name: "Sub Total",
      selector: row => row.subTotal,
      sortable: true,
      right: true,
      width: '130px',
      cell: (row) => (
        <Text strong style={{ color: greenTheme.dark }}>
          {formatCurrency(row.subTotal)}
        </Text>
      ),
    },

    {
      name: "Discount",
      selector: row => row.discount,
      sortable: true,
      right: true,
      width: '130px',
      cell: (row) => (
        <Text strong style={{ color: greenTheme.dark }}>
          {row.discount_type == 'percent'
            ? `${row.discount}%`
            : formatCurrency(row.discount)}
        </Text>
      ),
    },


    {
      name: "Total Price",
      selector: row => row.totalPrice,
      sortable: true,
      right: true,
      width: '130px',
      cell: (row) => (
        <Text strong style={{ color: greenTheme.dark }}>
          {formatCurrency(row.totalPrice)}
        </Text>
      ),
    },
    {
      name: "Paid",
      selector: row => row.paid,
      sortable: true,
      right: true,
      width: '130px',
      cell: (row) => (
        <Text strong style={{ color: greenTheme.dark }}>
          {formatCurrency(row.paid)}
        </Text>
      ),
    },
    {
      name: "Balance",
      selector: row => row.totalPrice -  row.paid,
      sortable: true,
      right: true,
      width: '130px',
      cell: (row) => (
        <Text strong style={{ color: greenTheme.dark }}>
          {formatCurrency(row.totalPrice -  row.paid)}
        </Text>
      ),
    },
    {
      name: "STATUS",
      selector: row => row.payment_status,
      sortable: true,
      width: '140px',
      center: true,
      cell: (row) => statusTag(row.payment_status),
    },
{
  name: "ACTIONS",
  cell: (row) => {
    const items = [
      {
        key: 'edit',
        label: (
          <Space onClick={() => onEdit(row)}>
            <EditOutlined style={{ color: greenTheme.primary }} /> Edit
          </Space>
        ),
      },
      {
        key: 'view-payment',
        label: (
          <Space onClick={() => onViewPayment(row)}>
            <EyeOutlined style={{ color: '#1890ff' }} />
            View Payment
          </Space>
        ),
      },
      ...(row.payment_status !== 'paid'
        ? [
            {
              key: 'add-payment',
              label: (
                <Space onClick={() => onAddPayment(row)}>
                  <PlusOutlined style={{ color: '#52c41a' }} />
                  Add Payment
                </Space>
              ),
            },
          ]
        : []),
      {
        key: 'delete',
        label: (
          <Space onClick={() => onDelete(row.id)}>
            <DeleteOutlined style={{ color: greenTheme.error }} /> Delete
          </Space>
        ),
      },
    ];

    return (
      <Dropdown
        menu={{ items }}
        trigger={['click']}
        placement="bottomRight"
      >
        <Button
          icon={<MoreOutlined style={{ color: greenTheme.primary }} />}
          type="text"
          size="small"
        />
      </Dropdown>
    );
  },
  width: '90px',
  ignoreRowClick: true,
  allowOverflow: true,
}

  ];

  const SummaryRow = () => (
    <div style={{ 
      display: 'flex',
      justifyContent: 'space-between',
      padding: '16px',
      backgroundColor: greenTheme.light,
      // borderTop: `1px solid ${greenTheme.primary}`
    }}>
      <Text strong>
        Total Sales: <span style={{ color: greenTheme.dark }}>{formatCurrency(totalSales)}</span>
      </Text>
      <Text strong>
        Average Sale: <span style={{ color: greenTheme.dark }}>{formatCurrency(averageSale)}</span>
      </Text>
      <Text strong>
        Total Records: <span style={{ color: greenTheme.dark }}>{data?.length || 0}</span>
      </Text>
    </div>
  );

  return (
    <div style={{ 
      // border: `1px solid ${greenTheme.border}`,
      // borderRadius: '8px',
      overflow: 'hidden',
      boxShadow: '0 1px 4px rgba(0, 0, 0, 0.05)'
    }}>
      <div style={{ 
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px',
        backgroundColor: greenTheme.background,
        // borderBottom: `1px solid ${greenTheme.border}`
      }}>
        <Text strong style={{ 
          fontSize: '16px',
          color: greenTheme.dark
        }}>
        </Text>
        <Space>
          <Tooltip title="Export to PDF">
            <Button 
              icon={<FilePdfOutlined />} 
              onClick={onExportPDF}
              style={{ color: greenTheme.primary }}
            />
          </Tooltip>
          <Tooltip title="Export to Excel">
            <Button 
              icon={<FileExcelOutlined />} 
              onClick={onExportExcel}
              style={{ color: greenTheme.primary }}
            />
          </Tooltip>
        </Space>
      </div>
      
      <DataTable
        columns={columns}
        data={data}
        progressPending={loading}
        progressComponent={
          <div style={{ padding: '24px' }}>
            <Text>Loading sales data...</Text>
          </div>
        }
        pagination
        paginationPerPage={10}
        paginationRowsPerPageOptions={[10, 25, 50, 100]}
        customStyles={customStyles}
        highlightOnHover
        pointerOnHover
        onRowClicked={(row, event) => {
          if (!event.target.closest('button, .ant-dropdown')) {
            showModal(row);
          }
        }}
        noDataComponent={
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <Text type="secondary">No sales records found</Text>
          </div>
        }
      />
      
      <SummaryRow />

      <SaleModalDetail
        open={isModalOpen}
        onCancel={handleCancel}
        sale={selectedSale}
        
      />
    </div>
  );
};

SalesTable.propTypes = {
  data: PropTypes.array.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  onExportPDF: PropTypes.func,
  onExportExcel: PropTypes.func,
  onPrint: PropTypes.func,
  totalSales: PropTypes.number,
  averageSale: PropTypes.number,
};

SalesTable.defaultProps = {
  loading: false,
  totalSales: 0,
  averageSale: 0,
};

export default SalesTable;