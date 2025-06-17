import React, { useEffect, useState, useCallback } from 'react';
import {
  Card,
  Input,
  Button,
  Select,
  Space,
  DatePicker,
  Row,
  Col,
  Statistic,
  Progress,
  Spin,
  message
} from 'antd';
import {
  SearchOutlined,
  FilterOutlined,
  DownloadOutlined,
  PrinterOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  ShoppingCartOutlined,
  ClearOutlined
} from '@ant-design/icons';
import DataTable from 'react-data-table-component';
import { useReport } from '../../../hooks/UseReport';
import Cookies from 'js-cookie';
import * as XLSX from 'xlsx';

const { Search } = Input;
const { Option } = Select;

function SalesReports() {
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [customerFilter, setCustomerFilter] = useState('all');
  const [reportType, setReportType] = useState('all');
  const [saleTypeFilter, setSaleTypeFilter] = useState('all');

  // Data states
  const [sales, setSales] = useState([]);
  const [filteredSales, setFilteredSales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);

  // Hooks and user data
  const { getSaleReportsData } = useReport();
  const token = localStorage.getItem('token');
  const userData = JSON.parse(Cookies.get('user') || '{}');

  // Fetch sales data on component mount
  useEffect(() => {
    fetchSalesData();
  }, []);

  const fetchSalesData = async () => {
    setLoading(true);
    try {
      const result = await getSaleReportsData(userData.warehouse_id, token);
      if (result.success) {
        setSales(result.sales);
        setFilteredSales(result.sales);
      } else {
        message.error('Failed to fetch sales data');
      }
    } catch (error) {
      message.error('Error fetching sales data');
    } finally {
      setLoading(false);
    }
  };

  // Get unique customers for filter dropdown
  const customers = [...new Set(sales.map(sale => sale.customer?.username || '').filter(Boolean))];

  // Apply filters when search is clicked
  const handleSearch = () => {
    setLoading(true);
    
    const filtered = sales.filter(sale => {
      // Search term matching
      const matchesSearch = searchTerm === '' || 
        (sale.id && sale.id.toString().toLowerCase().includes(searchTerm.toLowerCase())) ||
        (sale.customer?.username && sale.customer.username.toLowerCase().includes(searchTerm.toLowerCase()));
      
      // Status filter
      const matchesStatus = statusFilter === 'all' || sale.status === statusFilter;
      
      // Customer filter
      const matchesCustomer = customerFilter === 'all' || sale.customer?.username === customerFilter;
      
      // Sale type filter
      const matchesSaleType = saleTypeFilter === 'all' || 
        (sale.type && sale.type.toLowerCase() === saleTypeFilter.toLowerCase());
      
      // Date filtering
      let matchesDate = true;
      if (startDate && endDate) {
        try {
          const saleDate = new Date(sale.date);
          const start = new Date(startDate);
          start.setHours(0, 0, 0, 0);
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          matchesDate = saleDate >= start && saleDate <= end;
        } catch (error) {
          console.error('Error parsing dates:', error);
          matchesDate = false;
        }
      }

      // Report type filtering
      let matchesReportType = true;
      if (reportType !== 'all') {
        const saleDate = new Date(sale.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (reportType === 'daily') {
          matchesReportType = saleDate.toDateString() === today.toDateString();
        } else if (reportType === 'monthly') {
          matchesReportType = saleDate.getMonth() === today.getMonth() && 
                            saleDate.getFullYear() === today.getFullYear();
        }
      }

      return matchesSearch && matchesStatus && matchesCustomer && 
             matchesSaleType && matchesDate && matchesReportType;
    });

    setFilteredSales(filtered);
    setLoading(false);
  };

  // Clear all filters
  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setStartDate(null);
    setEndDate(null);
    setCustomerFilter('all');
    setReportType('all');
    setSaleTypeFilter('all');
    setFilteredSales(sales);
  };

  // Export to Excel
  const handleExportExcel = () => {
    if (selectedRows.length === 0) {
      message.error("Please select items to export");
      return;
    }

    const selectedSales = sales.filter(sale => selectedRows.includes(sale.id));
    const exportData = selectedSales.map(sale => ({
      'Product Name': sale.product_name,
      'First Sale Date': new Date(sale.first_sale_date).toLocaleDateString(),
      'Customers': sale.total_customers,
      'Quantity Sold': sale.total_quantity,
      'Subtotal': sale.total_subtotal,
      'Invoice Discount': sale.total_invoice_discount,
      'Item Discount': sale.total_item_discount,
      'Total Sale': sale.total_sale,
      'Total Cost': sale.total_cost,
      'Profit': sale.profit
    }));

    try {
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Sales Report');
      XLSX.writeFile(workbook, 'Sales_Report.xlsx');
    } catch (error) {
      console.error('Export error:', error);
      message.error('Failed to export data');
    }
  };

  // Handle row selection
  const handleRowSelected = useCallback((state) => {
    setSelectedRows(state.selectedRows.map(row => row.id));
  }, []);

  // Calculate totals for footer
  const calculateTotals = () => {
    return {
      totalCustomers: filteredSales.reduce((sum, row) => sum + (row.total_customers || 0), 0),
      totalQuantity: filteredSales.reduce((sum, row) => sum + (row.total_quantity || 0), 0),
      totalSubtotal: filteredSales.reduce((sum, row) => sum + (row.total_subtotal || 0), 0),
      totalInvoiceDiscount: filteredSales.reduce((sum, row) => sum + (row.total_invoice_discount || 0), 0),
      totalItemDiscount: filteredSales.reduce((sum, row) => sum + (row.total_item_discount || 0), 0),
      totalSale: filteredSales.reduce((sum, row) => sum + (row.total_sale || 0), 0),
      totalCost: filteredSales.reduce((sum, row) => sum + (row.total_cost || 0), 0),
      totalProfit: filteredSales.reduce((sum, row) => sum + (row.profit || 0), 0)
    };
  };

  const totals = calculateTotals();

  // Custom footer component with proper column alignment
  const CustomFooter = () => {
    return (
      <div style={{ 
        display: 'grid',
        gridTemplateColumns: '20% 10% 8% 8% 13% 8% 8% 8% 8% 8%',
        width: '100%',
        padding: '10px 0',
        background: '#fafafa',
        borderTop: '1px solid #f0f0f0',
        marginTop: '-1px',
        fontSize: '14px'
      }}>
        <div style={{ padding: '0 0px', textAlign: 'left'}}>
          <strong>Total</strong>
        </div>
        <div style={{ padding: '0 8px', textAlign: 'center' }}></div>
        <div style={{ padding: '0 8px', textAlign: 'right'  }}>
          <strong>{totals.totalCustomers}</strong>
        </div>
        <div style={{ padding: '0 8px', textAlign: 'right' }}>
          <strong>{totals.totalQuantity}</strong>
        </div>
        <div style={{ padding: '0 8px', textAlign: 'right' }}>
          <strong>${totals.totalSubtotal.toFixed(2)}</strong>
        </div>
        <div style={{ padding: '0 8px', textAlign: 'right' }}>
          <strong>${totals.totalInvoiceDiscount.toFixed(2)}</strong>
        </div>
        <div style={{ padding: '0 8px', textAlign: 'right' }}>
          <strong>${totals.totalItemDiscount.toFixed(2)}</strong>
        </div>
        <div style={{ padding: '0 8px', textAlign: 'right' }}>
          <strong>${totals.totalSale.toFixed(2)}</strong>
        </div>
        <div style={{ padding: '0 8px', textAlign: 'right' }}>
          <strong>${totals.totalCost.toFixed(2)}</strong>
        </div>
        <div style={{ padding: '0 8px', textAlign: 'right' }}>
          <strong style={{ 
            color: totals.totalProfit >= 0 ? '#52c41a' : '#f5222d'
          }}>
            ${totals.totalProfit.toFixed(2)}
          </strong>
        </div>
      </div>
    );
  };

  // Table columns
  const columns = [
    {
      name: 'Product',
      selector: row => row.product_name,
      sortable: true,
      cell: row => (
        <strong style={{ fontFamily: "'Noto Sans Khmer', 'Khmer OS', Arial, sans-serif" }}>
          {row.product_name}
        </strong>
      ),
      width: '20%'
    },
    {
      name: 'Date',
      selector: row => row.first_sale_date,
      sortable: true,
      cell: row => new Date(row.first_sale_date).toLocaleDateString(),
      width: '10%'
    },
    {
      name: 'Customers',
      selector: row => row.total_customers,
      sortable: true,
      width: '8%',
      center: true
    },
    {
      name: 'Sold QTY',
      selector: row => row.total_quantity,
      sortable: true,
      cell: row => <span>{row.total_quantity}</span>,
      width: '8%',
      center: true
    },
    {
      name: 'Sub Amount',
      selector: row => row.total_subtotal,
      sortable: true,
      cell: row => <span>${row.total_subtotal?.toFixed(2) || '0.00'}</span>,
      width: '10%',
      right: true
    },
    {
      name: 'Invoice Dis',
      selector: row => row.total_invoice_discount,
      sortable: true,
      cell: row => <span>${row.total_invoice_discount?.toFixed(2) || '0.00'}</span>,
      width: '8%',
      right: true
    },
    {
      name: 'Item Dis',
      selector: row => row.total_item_discount,
      sortable: true,
      cell: row => <span>${row.total_item_discount?.toFixed(2) || '0.00'}</span>,
      width: '8%',
      right: true
    },
    {
      name: 'Total Sale',
      selector: row => row.total_sale,
      sortable: true,
      cell: row => <span>${row.total_sale?.toFixed(2) || '0.00'}</span>,
      width: '8%',
      right: true
    },
    {
      name: 'Total Cost',
      selector: row => row.total_cost,
      sortable: true,
      cell: row => <span>${row.total_cost?.toFixed(2) || '0.00'}</span>,
      width: '8%',
      right: true
    },
    {
      name: 'Profit',
      selector: row => row.profit,
      sortable: true,
      cell: row => (
        <span style={{ 
          color: (row.profit || 0) >= 0 ? '#52c41a' : '#f5222d'
        }}>
          ${row.profit?.toFixed(2) || '0.00'}
        </span>
      ),
      width: '8%',
      right: true
    }
  ];

  // Calculate summary statistics
  const totalSales = filteredSales.length;
  const totalRevenue = filteredSales.reduce((sum, sale) => sum + (sale.total_sale || 0), 0);
  const totalProfit = filteredSales.reduce((sum, sale) => sum + (sale.profit || 0), 0);
  const completedSales = filteredSales.filter(sale => sale.status === 'completed').length;
  const pendingSales = filteredSales.filter(sale => sale.status === 'pending').length;
  const completionRate = totalSales > 0 ? Math.round((completedSales / totalSales) * 100) : 0;

  return (
    <Spin spinning={loading}>
      <div style={{ padding: '24px' }}>
        {/* Header Card */}
        <Card style={{ marginBottom: 24, background: '#f6ffed' }}>
          <Row align="middle" justify="space-between">
            <Col>
              <h1 style={{ margin: 0, color: '#389e0d' }}>Sales Reports</h1>
              <p style={{ margin: 0, color: '#8c8c8c' }}>
                Analyze product sales performance
              </p>
            </Col>
            <Col>
              <ShoppingCartOutlined style={{ fontSize: 48, color: '#b7eb8f', opacity: 0.8 }} />
            </Col>
          </Row>
        </Card>

        {/* Filter Card */}
        <Card
          className="report-filters"
          style={{
            marginBottom: '24px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
          }}
        >
          <Row gutter={[16, 16]}>
            {/* <Col span={6}>
              <Search
                placeholder="Search invoice or customer"
                prefix={<SearchOutlined style={{ color: '#52c41a' }} />}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                allowClear
                size="large"
              />
            </Col> */}

            <Col span={6}>
              <Select
                style={{ width: '100%' }}
                placeholder="Filter by status"
                value={statusFilter}
                onChange={setStatusFilter}
                allowClear
                suffixIcon={<FilterOutlined style={{ color: '#52c41a' }} />}
                size="large"
              >
                <Option value="all">All Statuses</Option>
                <Option value="completed">Completed</Option>
                <Option value="pending">Pending</Option>
                <Option value="cancelled">Cancelled</Option>
              </Select>
            </Col>

            <Col span={6}>
              <Select
                style={{ width: '100%' }}
                placeholder="Filter by sale type"
                value={saleTypeFilter}
                onChange={setSaleTypeFilter}
                allowClear
                suffixIcon={<FilterOutlined style={{ color: '#52c41a' }} />}
                size="large"
              >
                <Option value="all">All Sale Types</Option>
                <Option value="pos">POS</Option>
                <Option value="inventory">Inventory</Option>
              </Select>
            </Col>

            <Col span={6}>
              <DatePicker
                style={{ width: '100%' }}
                placeholder="Start Date"
                value={startDate}
                onChange={setStartDate}
                size="large"
                disabled={reportType !== 'all'}
                showTime={{ format: 'HH:mm' }}
                format="YYYY-MM-DD HH:mm"
              />
            </Col>

            <Col span={6}>
              <DatePicker
                style={{ width: '100%' }}
                placeholder="End Date"
                value={endDate}
                onChange={setEndDate}
                size="large"
                disabled={reportType !== 'all'}
                showTime={{ format: 'HH:mm' }}
                format="YYYY-MM-DD HH:mm"
              />
            </Col>

            <Col span={3}>
              <Button
                type="primary"
                icon={<SearchOutlined />}
                onClick={handleSearch}
                size="large"
                style={{
                  width: '100%',
                  backgroundColor: '#52c41a',
                  borderColor: '#52c41a',
                  fontWeight: 600
                }}
              >
                Search
              </Button>
            </Col>

            <Col span={3}>
              <Button
                type="default"
                icon={<ClearOutlined />}
                onClick={handleClearFilters}
                size="large"
                style={{
                  width: '100%',
                  fontWeight: 600
                }}
              >
                Clear
              </Button>
            </Col>
          </Row>
        </Card>

        {/* Data Table Card */}
        <Card
          title="Sales Report Details"
          extra={
            <Space>
              <Button
                icon={<DownloadOutlined />}
                onClick={handleExportExcel}
                disabled={selectedRows.length === 0}
              >
                Export
              </Button>
              <Button icon={<PrinterOutlined />} onClick={() => window.print()}>
                Print
              </Button>
            </Space>
          }
          style={{
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
            overflow: 'hidden'
          }}
        >
          <div style={{ position: 'relative' }}>
<DataTable
  columns={columns}
  data={filteredSales}
  pagination
  paginationPerPage={10}
  paginationRowsPerPageOptions={[10, 25, 50, 100]}
  highlightOnHover
  selectableRows
  onSelectedRowsChange={handleRowSelected}
  customStyles={{
    head: {
      style: {
        fontSize: '14px',
        fontWeight: 600,
        paddingLeft: '0',
        paddingRight: '0',
      },
    },
    headRow: {
      style: {
        backgroundColor: '#f8f8f8',
        borderBottomWidth: '1px',
        borderBottomColor: '#e7e7e7',
        borderBottomStyle: 'solid',
      },
    },
    headCells: {
      style: {
        paddingLeft: '12px',
        paddingRight: '12px',
        color: '#333',
      },
    },
    cells: {
      style: {
        paddingLeft: '12px',
        paddingRight: '12px',
        fontSize: '13px',
      },
    },
    rows: {
      style: {
        '&:not(:last-of-type)': {
          borderBottomWidth: '1px',
          borderBottomColor: '#f0f0f0',
          borderBottomStyle: 'solid',
        },
        '&:hover': {
          backgroundColor: '#f8f8f8 !important',
        },
      },
    },
    pagination: {
      style: {
        fontSize: '13px',
        borderTopWidth: '1px',
        borderTopColor: '#e7e7e7',
        borderTopStyle: 'solid',
      },
    },
  }}
  fixedHeader
  fixedHeaderScrollHeight="500px"
/>
            <CustomFooter />
          </div>
        </Card>
      </div>
    </Spin>
  );
}

export default SalesReports;