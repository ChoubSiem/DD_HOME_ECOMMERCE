
import React, { useEffect, useState } from 'react';
import {
  Table,
  Card,
  Input,
  Button,
  Tag,
  Select,
  Space,
  DatePicker,
  Modal,
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
  EyeOutlined,
  PrinterOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  CloseCircleOutlined,
  DollarOutlined,
  ShoppingCartOutlined
} from '@ant-design/icons';
import './Sales.css';
import DataTable from 'react-data-table-component';
import { useReport } from '../../../hooks/UseReport';
import Cookies from 'js-cookie';
import * as XLSX from 'xlsx';

const { Search } = Input;
const { Option } = Select;

function SalesReports() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [customerFilter, setCustomerFilter] = useState('all');
  const [reportType, setReportType] = useState('all');
  const [saleTypeFilter, setSaleTypeFilter] = useState('all');
  const [selectedSale, setSelectedSale] = useState(null);
  const [loading, setLoading] = useState(false);
  const { getSaleReportsData } = useReport();
  const [sales, setSales] = useState([]);
  const token = Cookies.get('token');
  const userData = JSON.parse(Cookies.get('user') || '{}');
  const [selectedRows, setSelectedRows] = useState([]);

  const isAllSelected = sales.length > 0 && selectedRows.length === sales.length;

  function handleSales() {
    setLoading(true);
    getSaleReportsData(userData.warehouse_id, token).then(function(result) {
      if (result.success) {
        setSales(result.sales);
        setLoading(false);
      } else {
        message.error('Failed to fetch sales data');
        setLoading(false);
      }
    });
  }
  console.log(sales);
  
  useEffect(function() {
    handleSales();
  }, []);

  const customers = [...new Set(sales.map(function(s) { return s.customer?.username || ''; }))];

  function filterSalesByReportType(sale, reportType) {
    if (reportType === 'all') return true;

    const saleDate = new Date(sale.date);
    const today = new Date('2025-05-20'); // Fixed date based on provided context
    today.setHours(0, 0, 0, 0);

    if (reportType === 'daily') {
      return saleDate.toDateString() === today.toDateString();
    } else if (reportType === 'monthly') {
      return saleDate.getMonth() === today.getMonth() &&
             saleDate.getFullYear() === today.getFullYear();
    }
    return true;
  }

  function handleSearch() {
    // Trigger filtering explicitly, preserving selectedRows
    setLoading(true);
    setTimeout(function() {
      setLoading(false);
    }, 100);
  }

  const filteredSales = sales.filter(function(sale) {
    const idStr = sale.id ? sale.id.toString() : '';
    const customerStr = sale.customer?.username ? sale.customer.username.toString() : '';

    const matchesSearch = idStr.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customerStr.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || sale.status === statusFilter;
    const matchesCustomer = customerFilter === 'all' || sale.customer?.username === customerFilter;
    const matchesReportType = filterSalesByReportType(sale, reportType);
    const matchesSaleType = saleTypeFilter === 'all' || sale.type?.toLowerCase() === saleTypeFilter.toLowerCase();

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

    return matchesSearch && matchesStatus && matchesCustomer && matchesDate && matchesReportType && matchesSaleType;
  });

  function getStatusColor(status) {
    if (!status) return '#d9d9d9';
    switch (status.toLowerCase()) {
      case 'paid': return '#52c41a';
      case 'partial': return '#faad14';
      case 'unpaid': return '#f5222d';
      default: return '#d9d9d9';
    }
  }

  function getStatusIcon(status) {
    if (!status) return null;
    switch (status.toLowerCase()) {
      case 'completed': return <CheckCircleOutlined />;
      case 'pending': return <SyncOutlined spin />;
      case 'cancelled': return <CloseCircleOutlined />;
      default: return null;
    }
  }

  function getPaymentStatusColor(status) {
    if (!status) return '#d9d9d9';
    switch (status.toLowerCase()) {
      case 'paid': return '#52c41a';
      case 'partial': return '#faad14';
      case 'pending': return '#f5222d';
      default: return '#d9d9d9';
    }
  }

  function getPaymentStatusIcon(status) {
    if (!status) return null;
    switch (status.toLowerCase()) {
      case 'paid':
      case 'partial':
      case 'pending':
        return <DollarOutlined />;
      default:
        return null;
    }
  }

  function handleDownloadPDF() {
    console.log("Downloading PDF...");
  }

  function handleExportExcel() {
    const selectedSales = sales.filter(function(sale) {
      return selectedRows.includes(sale.id);
    });

    if (selectedSales.length === 0) {
      message.error("Please select item first");
      return;
    }

    const exportData = selectedSales.map(function(sale) {
      return {
        Invoice: sale.reference,
        Date: new Date(sale.date).toLocaleDateString(),
        Customer: sale.customer?.username || 'N/A',
        Total: sale?.total,
        Paid: sale.payments_sum_amount || '0',
        Balance: (sale.total - (sale.payments_sum_amount || 0)),
        Status: sale.status ? sale.status.charAt(0).toUpperCase() + sale.status.slice(1) : '',
        Type: sale.type
      };
    });

    try {
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Sales');
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'Sales_Report.xlsx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting Excel:', error);
      message.error('Failed to export Excel file');
    }
  }

  function handlePrint() {
    try {
      setTimeout(function() {
        window.print();
      }, 100);
    } catch (error) {
      console.error('Error triggering print:', error);
      message.error('Failed to open print dialog. Please check your browser settings.');
    }
  }

  function handleSelectAll(e) {
    if (e.target.checked) {
      const allIds = filteredSales.map(function(row) { return row.id; });
      setSelectedRows(allIds);
    } else {
      setSelectedRows([]);
    }
  }

  function handleCheckboxChange(e, row) {
    if (e.target.checked) {
      setSelectedRows(function(prev) { return [...prev, row.id]; });
    } else {
      setSelectedRows(function(prev) { return prev.filter(function(id) { return id !== row.id; }); });
    }
  }

  const columns = [
    {
      name: (
        <input
          type="checkbox"
          checked={isAllSelected}
          onChange={handleSelectAll}
        />
      ),
      selector: function(row) { return row.id; },
      sortable: false,
      width: '3%',
      cell: function(row) {
        return (
          <input
            type="checkbox"
            checked={selectedRows.includes(row.id)}
            onChange={function(e) { handleCheckboxChange(e, row); }}
          />
        );
      },
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
    },
   {
    name: 'Product',
    selector: row => row.product_name,
    sortable: true,
    width: '20%',
    cell: row => (
      <strong style={{ 
        color: 'black', 
        fontFamily: "'Noto Sans Khmer', 'Khmer OS', Arial, sans-serif" 
      }}>
        {row.product_name}
      </strong>
    )
  },  

    {
      name: 'Date',
      selector: function(row) { return row.first_sale_date; },
      sortable: true,
      width: '10%',
      cell: function(row) { return <span>{new Date(row.first_sale_date).toLocaleDateString()}</span>; }
    },
    {
      name:  'Customers',
      selector: function(row) { return row.total_customers; },
      sortable: true,
      width: '8%',
      cell: function(row) { return <span>{row.total_customers}</span>; }
    },
    {
      name: 'Sold QTY',
      selector: function(row) { return row.total_quantity; },
      sortable: true,
      width: '8%',
      cell: function(row) { return <span style={{ fontWeight: 600 }}>{row.total_quantity}</span>; }
    },
    {
      name: 'Sub Amount',
      selector: function(row) { return row.total_subtotal; },
      sortable: true,
      width: '10%',
      cell: function(row) { return <span style={{ fontWeight: 600 }}>${row.total_subtotal || '0'}</span>; }
    },
    {
      name: 'Invoice Dis',
      selector: function(row) { return row.total_invoice_discount; },
      sortable: true,
      width: '8%',
      cell: function(row) { return <span style={{ fontWeight: 600 }}>${row.total_invoice_discount || '0'}</span>; }
    },
    {
      name: 'Item Dis',
      selector: function(row) { return row.total_item_discount; },
      sortable: true,
      width: '8%',
      cell: function(row) { return <span style={{ fontWeight: 600 }}>${row.total_item_discount || '0'}</span>; }
    },
    {
    name: 'Total Sale',
    selector: row => row.total_sale,
    sortable: true,
    width: '8%',
    cell: row => <span style={{ fontWeight: 600 }}>${row.total_sale || '0'}</span>
  },
  {
    name: 'Total Cost',
    selector: row => row.total_cost,
    sortable: true,
    width: '8%',
    cell: row => <span style={{ fontWeight: 600 }}>${row.total_cost || '0'}</span>
  },
  {
    name: 'Profits',
    selector: row => row.profit,
    sortable: true,
    width: '8%',
    cell: row => <span style={{ fontWeight: 600 }}>${row.profit || '0'}</span>
  }
  
    
  ];

  const totalSales = filteredSales.length;
  const totalAmount = filteredSales.reduce(function(sum, s) { return sum + s.total; }, 0);
  const completedSales = filteredSales.filter(function(s) { return s.status === 'paid'; }).length;
  const pendingSales = filteredSales.filter(function(s) { return s.status === 'pending'; }).length;
  const completionRate = totalSales > 0 ? Math.round((completedSales / totalSales) * 100) : 0;

  return (
    <Spin spinning={loading}>
      <style>
        {`
          @media print {
            body * {
              visibility: hidden;
            }
            .sale-detail, .sale-detail * {
              visibility: visible;
            }
            .sale-detail {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              padding: 20px;
              box-sizing: border-box;
            }
            .sale-detail .ant-btn {
              display: none;
            }
            .sale-detail img {
              max-width: 100px;
            }
            .sale-detail .ant-table {
              font-size: 12px;
            }
            .sale-detail h2 {
              font-size: 16px;
            }
          }
        `}
      </style>
      <div className="sales-reports" style={{ padding: '24px' }}>
        <Card
          className="report-header"
          style={{
            color: '#52c41a',
            marginBottom: '24px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h1 style={{ color: '#52c41a', marginBottom: '8px' }}>Sales Reports</h1>
              <p style={{ color: '#52c41a', marginBottom: 0 }}>
                Track and analyze your sales transactions in real-time
              </p>
            </div>
            <ShoppingCartOutlined style={{ fontSize: '48px', opacity: 0.2 }} />
          </div>
        </Card>

        <Card
          className="report-filters"
          style={{
            marginBottom: '24px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
          }}
        >
   <Row gutter={[16, 16]}>
    {/* Search */}
    <Col span={6}>
      <Search
        placeholder="Search invoice or customer"
        prefix={<SearchOutlined style={{ color: '#52c41a' }} />}
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        allowClear
        size="large"
      />
    </Col>

    {/* Status Filter */}
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

    {/* Customer Filter */}
    <Col span={6}>
      <Select
        style={{ width: '100%' }}
        placeholder="Filter by customer"
        value={customerFilter}
        onChange={setCustomerFilter}
        allowClear
        suffixIcon={<FilterOutlined style={{ color: '#52c41a' }} />}
        size="large"
      >
        <Option value="all">All Customers</Option>
        {customers.map(customer => (
          <Option key={customer} value={customer}>{customer}</Option>
        ))}
      </Select>
    </Col>

    {/* Sale Type Filter */}
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

    {/* Report Type */}
    <Col span={6}>
      <Select
        style={{ width: '100%' }}
        placeholder="Report Type"
        value={reportType}
        onChange={setReportType}
        allowClear
        suffixIcon={<FilterOutlined style={{ color: '#52c41a' }} />}
        size="large"
      >
        <Option value="all">All Reports</Option>
        <Option value="daily">Daily</Option>
        <Option value="monthly">Monthly</Option>
      </Select>
    </Col>

    {/* Start Date */}
    <Col span={6}>
      <DatePicker
        style={{ width: '100%' }}
        placeholder="Start Date"
        value={startDate}
        onChange={setStartDate}
        size="large"
        disabled={reportType !== 'all'}
      />
    </Col>

    {/* End Date */}
    <Col span={6}>
      <DatePicker
        style={{ width: '100%' }}
        placeholder="End Date"
        value={endDate}
        onChange={setEndDate}
        size="large"
        disabled={reportType !== 'all'}
      />
    </Col>

    {/* Search Button */}
    <Col span={6}>
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
  </Row>
        </Card>

        <div style={{ width: '100%', marginBottom: '24px' }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={6}>
              <Card
                style={{
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                  height: '100%',
                }}
              >
                <Statistic
                  title="Total Sales"
                  value={totalSales}
                  prefix={<ShoppingCartOutlined style={{ color: '#52c41a' }} />}
                  valueStyle={{ color: '#1890ff' }}
                />
                <Progress
                  percent={100}
                  showInfo={false}
                  strokeColor="#d9f7be"
                  trailColor="#f6ffed"
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card
                style={{
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                  height: '100%',
                }}
              >
                <Statistic
                  title="Total Revenue"
                  value={totalAmount}
                  prefix="$"
                  valueStyle={{ color: '#52c41a' }}
                />
                <Progress
                  percent={100}
                  showInfo={false}
                  strokeColor="#b7eb8f"
                  trailColor="#f6ffed"
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card
                style={{
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                  height: '100%',
                }}
              >
                <Statistic
                  title="Paid"
                  value={completedSales}
                  prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                  valueStyle={{ color: '#52c41a' }}
                />
                <Progress
                  percent={completionRate}
                  showInfo={false}
                  strokeColor="#52c41a"
                  trailColor="#f6ffed"
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card
                style={{
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                  height: '100%',
                }}
              >
                <Statistic
                  title="Pending"
                  value={pendingSales}
                  prefix={<SyncOutlined spin style={{ color: '#faad14' }} />}
                  valueStyle={{ color: '#faad14' }}
                />
                <Progress
                  percent={totalSales > 0 ? Math.round((pendingSales / totalSales) * 100) : 0}
                  showInfo={false}
                  strokeColor="#faad14"
                  trailColor="#fffbe6"
                />
              </Card>
            </Col>
          </Row>
        </div>

        <Card
          title={<span style={{ fontSize: '18px', fontWeight: '500' }}>Sales Transactions</span>}
          extra={
            <Space>
              <Button
                icon={<DownloadOutlined />}
                style={{ backgroundColor: '#52c41a', borderColor: '#52c41a', color: 'white' }}
                onClick={handleExportExcel}
              >
                Export
              </Button>
              <Button
                icon={<PrinterOutlined />}
                style={{ backgroundColor: '#1890ff', borderColor: '#1890ff', color: 'white' }}
                onClick={handlePrint}
              >
                Print
              </Button>
            </Space>
          }
          style={{
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
          }}
        >
          <DataTable
            columns={columns}
            data={filteredSales}
            pagination
            responsive
            fixedHeader
            highlightOnHover
            striped
            persistTableHead
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
          />
        </Card>
      </div>
    </Spin>
  );
}

export default SalesReports;
