
import React, { useRef } from 'react';
import { Card, Button, Space, Typography } from 'antd';
import DataTable from 'react-data-table-component';
import { FilePdfOutlined, FileImageOutlined, PrinterOutlined } from '@ant-design/icons';
import generatePDF from 'react-to-pdf';
import html2canvas from 'html2canvas';
import dayjs from 'dayjs';

const { Text, Title } = Typography;

const PurchaseReportsDataTable = ({
  filteredPurchases,
  loading,
  userData,
  dateRange,
}) => {
  const tableRef = useRef();

  // Export to Image
  const handleExportImage = async () => {
    if (tableRef.current) {
      const canvas = await html2canvas(tableRef.current, { scale: 2 });
      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = image;
      link.download = `purchase-report-${dayjs().format('YYYYMMDD')}.png`;
      link.click();
    }
  };

  // Flatten purchase items for DataTable
  const flattenedData = filteredPurchases.flatMap(purchase =>
    purchase.purchase_items?.map(item => ({
      product_code: item.product?.product_code || item.product_code || 'N/A',
      barcode: item.product?.barcode || item.barcode || 'N/A',
      description: item.product?.name || item.description || 'N/A',
      qty: item.qty || 0,
      uom: item.uom || 'N/A',
      cost: item.price || item.cost || 0,
      total_cost: item.total_price || (item.qty * item.price) || 0,
      received_by: purchase.supplier?.username || item.received_by || 'N/A',
    })) || []
  );

  // Calculate totals
  const totalQty = flattenedData.reduce((sum, item) => sum + item.qty, 0);
  const totalCost = flattenedData.reduce((sum, item) => sum + item.total_cost, 0);

  // DataTable columns
  const columns = [
    {
      name: 'Product Code',
      selector: row => row.product_code,
      sortable: true,
      width: '12%',
      cell: row => <Text strong>{row.product_code}</Text>,
    },
    {
      name: 'Barcode',
      selector: row => row.barcode,
      sortable: true,
      width: '12%',
      cell: row => <Text>{row.barcode}</Text>,
    },
    {
      name: 'Description',
      selector: row => row.description,
      sortable: true,
      width: '25%',
      cell: row => <Text>{row.description}</Text>,
      wrap: true,
    },
    {
      name: 'QTY',
      selector: row => row.qty,
      sortable: true,
      width: '8%',
      cell: row => <Text>{row.qty.toFixed(2)}</Text>,
      right: true,
    },
    {
      name: 'UOM',
      selector: row => row.uom,
      sortable: true,
      width: '8%',
      cell: row => <Text>{row.uom}</Text>,
    },
    {
      name: 'Cost',
      selector: row => row.cost,
      sortable: true,
      width: '10%',
      cell: row => <Text>{`$${row.cost.toFixed(2)}`}</Text>,
      right: true,
    },
    {
      name: 'Total Cost',
      selector: row => row.total_cost,
      sortable: true,
      width: '10%',
      cell: row => <Text strong>{`$${row.total_cost.toFixed(2)}`}</Text>,
      right: true,
    },
    {
      name: 'Received By',
      selector: row => row.received_by,
      sortable: true,
      width: '15%',
      cell: row => <Text>{row.received_by}</Text>,
    },
  ];

  return (
    <div ref={tableRef}>
      {/* Report Header */}
      <div style={{ marginBottom: '24px', textAlign: 'left' }}>
        <Title level={4}>DD Home</Title>
        <Text>Address: Nº25, St.5, Dangkor, Phnom Penh, Cambodia</Text><br />
        <Text>Phone: 081 90 50 50</Text><br />
        <Text>View By Outlet: {userData.warehouse_name || 'Chamroeun Phal'}</Text><br />
        <Text>View By Location: All</Text><br />
        <Text>View As: Detail</Text><br />
        <Text>Group By: None</Text><br />
        <Text>
          From {dateRange && dateRange[0] ? dayjs(dateRange[0]).format('DD/MM/YYYY h:mm A') : 'N/A'} To{' '}
          {dateRange && dateRange[1] ? dayjs(dateRange[1]).format('DD/MM/YYYY h:mm A') : 'N/A'}
        </Text>
      </div>

      {/* DataTable */}
      <Card
        title={<Text strong style={{ fontSize: '18px' }}>Received Report</Text>}
        extra={
          <Space>
            <Button
              icon={<FilePdfOutlined />}
              onClick={() => generatePDF(tableRef, { filename: `purchase-report-${dayjs().format('YYYYMMDD')}.pdf` })}
              style={{ backgroundColor: '#f5222d', borderColor: '#f5222d', color: 'white' }}
            >
              Export PDF
            </Button>
            <Button
              icon={<FileImageOutlined />}
              onClick={handleExportImage}
              style={{ backgroundColor: '#1890ff', borderColor: '#1890ff', color: 'white' }}
            >
              Export Image
            </Button>
            <Button
              icon={<PrinterOutlined />}
              onClick={() => window.print()}
              style={{ backgroundColor: '#52c41a', borderColor: '#52c41a', color: 'white' }}
            >
              Print
            </Button>
          </Space>
        }
        style={{
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
        }}
      >
        <DataTable
          columns={columns}
          data={flattenedData}
          pagination
          responsive
          fixedHeader
          highlightOnHover
          striped
          persistTableHead
          progressPending={loading}
          progressComponent={<Spin size="large" />}
          customStyles={{
            headCells: {
              style: {
                fontWeight: '600',
                backgroundColor: '#fafafa',
                color: '#333',
              },
            },
            rows: {
              style: {
                '&:hover': {
                  backgroundColor: '#f6ffed !important',
                },
              },
            },
          }}
          subHeader
          subHeaderComponent={
            <div style={{ width: '100%', textAlign: 'right', padding: '8px 0' }}>
              <Text strong>Total QTY: {totalQty.toFixed(2)}</Text><br />
              <Text strong>Total Cost: ${totalCost.toFixed(2)}</Text>
            </div>
          }
        />
      </Card>
    </div>
  );
};

export default PurchaseReportsDataTable;