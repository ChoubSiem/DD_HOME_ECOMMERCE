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
  PlusOutlined,
  RollbackOutlined
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
  tableWrapper: {
    style: {
      maxHeight: '500px',
    }
  },
  headRow: {
    style: {
      backgroundColor: '#f9fafb',
      fontWeight: 'bold'
    }
  }
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
  averageSale,
  handleAddSaleReturn
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
      width: '180px',
      cell: (row) => <Text>{row.saleDate}</Text>,
    },
  // {
  //     name: 'Type',
  //     selector: row => row.type,
  //     sortable: true,
  //     cell: (row) => (
  //       <div>
  //         {row.type === 'warehouse' ? 'Warehouse' : 'Customer'}
  //       </div>
  //     ),
  //   },
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
      width: '100px',
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
      width: '80px',
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
      width: '100px',
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
      width: '100px',
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
       {
        key: 'add-sale-return',
        icon: <RollbackOutlined />, 
        label: 'Add Sale Return',
        onClick: () => handleAddSaleReturn(row.id,'inventory'),
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
  
  return (
    <div style={{ 
      overflow: 'hidden',
      boxShadow: '0 1px 4px rgba(0, 0, 0, 0.05)'
    }}>
      
      {data && data.length > 0 ? (
        <DataTable
          columns={columns}
          data={data}
          fixedHeader
          fixedHeaderScrollHeight="500px"
          progressPending={loading}
          progressComponent={
            <div style={{ padding: '24px' }}>
              <Text>Loading sales data...</Text>
            </div>
          }
          customStyles={customStyles}
          highlightOnHover
          pointerOnHover
          onRowClicked={(row, event) => {
            if (!event.target.closest('button, .ant-dropdown')) {
              showModal(row);
            }
          }}
        />
      ) : !loading && (
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <Text type="secondary">No sales records found</Text>
        </div>
      )}



      
      {/* <SummaryRow /> */}

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