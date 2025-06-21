
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
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
  message,
  Typography,
} from 'antd';
import {
  SearchOutlined,
  FilterOutlined,
  FileExcelOutlined,
  FilePdfOutlined,
  FileImageOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  ShoppingCartOutlined,
  ClearOutlined,
} from '@ant-design/icons';
import DataTable from 'react-data-table-component';
import Cookies from 'js-cookie';
import * as XLSX from 'xlsx';
import generatePDF from 'react-to-pdf';
import html2canvas from 'html2canvas';
import debounce from 'lodash.debounce';
import axios from 'axios';
import dayjs from 'dayjs';
import { useReport } from '../../../hooks/UseReport';

const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { Text, Title } = Typography;

const SalesReports = () => {
  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState(null);
  const [customerFilter, setCustomerFilter] = useState('all');
  const [reportType, setReportType] = useState('all');
  const [saleTypeFilter, setSaleTypeFilter] = useState('all');
  const [selectedRows, setSelectedRows] = useState([]);
  const [exportLoading, setExportLoading] = useState(false);
  const [sales, setSales] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const tableRef = useRef();
  const {getSaleReportsData} =  useReport();
  // User data and auth
  const userData = useMemo(() => JSON.parse(Cookies.get('user') || '{}'), []);
  const token = localStorage.getItem('token');

  // Fetch data with useEffect
  useEffect(() => {
    const fetchSalesReportData = async () => {
      if (!userData.warehouse_id || !token) {
        setError(new Error('Missing warehouse ID or token'));
        return;
      }

      // setIsLoading(true);
      try {
        const response = await getSaleReportsData(userData.warehouse_id,token);
        setSales(response.data.sales || []);
        setError(null);
      } catch (err) {
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSalesReportData();
  }, [userData.warehouse_id, token]);

  // Debounced search handler
  const debouncedSetSearchTerm = useMemo(
    () => debounce((value) => setSearchTerm(value), 300),
    []
  );

  // Memoized customers
  const customers = useMemo(
    () => [...new Set(sales.map(sale => sale.customer?.username || '').filter(Boolean))],
    [sales]
  );

  // Filtered sales
  const filteredSales = useMemo(() => {
    return sales.filter(sale => {
      const idStr = sale.id?.toString() || '';
      const customerStr = sale.customer?.username || '';

      const matchesSearch =
        searchTerm === '' ||
        idStr.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customerStr.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || sale.status === statusFilter;
      const matchesCustomer = customerFilter === 'all' || sale.customer?.username === customerFilter;
      const matchesSaleType = saleTypeFilter === 'all' || (sale.type && sale.type.toLowerCase() === saleTypeFilter.toLowerCase());

      let matchesDate = true;
      if (dateRange && dateRange[0] && dateRange[1]) {
        const saleDate = dayjs(sale.date);
        const start = dayjs(dateRange[0]).startOf('day');
        const end = dayjs(dateRange[1]).endOf('day');
        matchesDate = saleDate.isBetween(start, end, null, '[]');
      }

      let matchesReportType = true;
      if (reportType !== 'all') {
        const saleDate = dayjs(sale.date);
        const today = dayjs().startOf('day');
        if (reportType === 'daily') {
          matchesReportType = saleDate.isSame(today, 'day');
        } else if (reportType === 'monthly') {
          matchesReportType = saleDate.isSame(today, 'month') && saleDate.isSame(today, 'year');
        }
      }

      return matchesSearch && matchesStatus && matchesCustomer && matchesSaleType && matchesDate && matchesReportType;
    });
  }, [sales, searchTerm, statusFilter, customerFilter, saleTypeFilter, dateRange, reportType]);

  // Calculate totals
  const totals = useMemo(() => ({
    totalCustomers: filteredSales.reduce((sum, row) => sum + (row.total_customers || 0), 0),
    totalQuantity: filteredSales.reduce((sum, row) => sum + (row.total_quantity || 0), 0),
    totalSubtotal: filteredSales.reduce((sum, row) => sum + (row.total_subtotal || 0), 0),
    totalInvoiceDiscount: filteredSales.reduce((sum, row) => sum + (row.total_invoice_discount || 0), 0),
    totalItemDiscount: filteredSales.reduce((sum, row) => sum + (row.total_item_discount || 0), 0),
    totalSale: filteredSales.reduce((sum, row) => sum + (row.total_sale || 0), 0),
    totalCost: filteredSales.reduce((sum, row) => sum + (row.total_cost || 0), 0),
    totalProfit: filteredSales.reduce((sum, row) => sum + (row.profit || 0), 0),
  }), [filteredSales]);

  // Statistics
  const stats = useMemo(() => {
    const totalSales = filteredSales.length;
    const totalRevenue = filteredSales.reduce((sum, sale) => sum + (sale.total_sale || 0), 0);
    const totalProfit = filteredSales.reduce((sum, sale) => sum + (sale.profit || 0), 0);
    const completedSales = filteredSales.filter(sale => sale.status === 'completed').length;
    const pendingSales = filteredSales.filter(sale => sale.status === 'pending').length;
    const completionRate = totalSales > 0 ? Math.round((completedSales / totalSales) * 100) : 0;

    return { totalSales, totalRevenue, totalProfit, completedSales, pendingSales, completionRate };
  }, [filteredSales]);

  // Handle row selection
  const handleRowSelected = useCallback((state) => {
    setSelectedRows(state.selectedRows.map(row => row.id));
  }, []);

  // Export handlers
  const handleExportExcel = useCallback(() => {
    if (selectedRows.length === 0) {
      message.error('Please select items to export');
      return;
    }

    setExportLoading(true);
    try {
      const selectedSales = sales.filter(sale => selectedRows.includes(sale.id));
      const exportData = [
        ['DD Home'],
        ['Address: Nº25, St.5, Dangkor, Phnom Penh, Cambodia'],
        ['Phone: 081 90 50 50'],
        [`View By Outlet: ${userData.warehouse_name || 'Chamroeun Phal'}`],
        ['View By Location: All'],
        ['View As: Detail'],
        ['Group By: None'],
        [`From ${dateRange && dateRange[0] ? dayjs(dateRange[0]).format('YYYY-MM-DD h:mm A') : 'N/A'} To ${dateRange && dateRange[1] ? dayjs(dateRange[1]).format('YYYY-MM-DD h:mm A') : 'N/A'}`],
        [],
        ['Product Name', 'First Sale Date', 'Customers', 'Quantity Sold', 'Subtotal', 'Invoice Discount', 'Item Discount', 'Total Sale', 'Total Cost', 'Profit'],
        ...selectedSales.map(sale => [
          sale.product_name || 'N/A',
          dayjs(sale.first_sale_date).format('YYYY-MM-DD'),
          sale.total_customers || 0,
          sale.total_quantity || 0,
          sale.total_subtotal?.toFixed(2) || '0.00',
          sale.total_invoice_discount?.toFixed(2) || '0.00',
          sale.total_item_discount?.toFixed(2) || '0.00',
          sale.total_sale?.toFixed(2) || '0.00',
          sale.total_cost?.toFixed(2) || '0.00',
          sale.profit?.toFixed(2) || '0.00',
        ]),
        ['', '', totals.totalCustomers, totals.totalQuantity, totals.totalSubtotal.toFixed(2), totals.totalInvoiceDiscount.toFixed(2), totals.totalItemDiscount.toFixed(2), totals.totalSale.toFixed(2), totals.totalCost.toFixed(2), totals.totalProfit.toFixed(2)],
      ];

      const worksheet = XLSX.utils.aoa_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Sales Report');
      XLSX.writeFile(workbook, `sales-report-${dayjs().format('YYYYMMDD')}.xlsx`);
      message.success('Excel file exported successfully');
    } catch (error) {
      console.error('Export error:', error);
      message.error('Failed to export Excel file');
    } finally {
      setExportLoading(false);
    }
  }, [selectedRows, sales, totals, userData.warehouse_name, dateRange]);

  const handleExportPDF = useCallback(async () => {
    setExportLoading(true);
    try {
      await generatePDF(tableRef, {
        filename: `sales-report-${dayjs().format('YYYYMMDD')}.pdf`,
        page: { format: 'A4', margin: { top: 20, bottom: 20, left: 20, right: 20 } },
      });
      message.success('PDF file exported successfully');
    } catch (error) {
      console.error('Export error:', error);
      message.error('Failed to export PDF file');
    } finally {
      setExportLoading(false);
    }
  }, []);

  const handleExportImage = useCallback(async () => {
    setExportLoading(true);
    try {
      if (tableRef.current) {
        const canvas = await html2canvas(tableRef.current, { scale: 2, useCORS: true });
        const image = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = image;
        link.download = `sales-report-${dayjs().format('YYYYMMDD')}.png`;
        link.click();
        message.success('Image file exported successfully');
      }
    } catch (error) {
      console.error('Export error:', error);
      message.error('Failed to export image file');
    } finally {
      setExportLoading(false);
    }
  }, []);

  // Clear filters
  const handleClearFilters = useCallback(() => {
    setSearchTerm('');
    setStatusFilter('all');
    setDateRange(null);
    setCustomerFilter('all');
    setReportType('all');
    setSaleTypeFilter('all');
  }, []);

  // Table columns
  const columns = useMemo(() => [
    {
      name: 'Product',
      selector: row => row.product_name,
      sortable: true,
      width: '20%',
      cell: row => (
        <Text strong style={{ fontFamily: "'Noto Sans Khmer', 'Khmer OS', Arial, sans-serif" }}>
          {row.product_name || 'N/A'}
        </Text>
      ),
    },
    {
      name: 'Date',
      selector: row => row.first_sale_date,
      sortable: true,
      width: '10%',
      cell: row => <Text>{dayjs(row.first_sale_date).format('YYYY-MM-DD')}</Text>,
    },
    {
      name: 'Customers',
      selector: row => row.total_customers,
      sortable: true,
      width: '8%',
      cell: row => <Text style={{ textAlign: 'center', display: 'block' }}>{row.total_customers || 0}</Text>,
    },
    {
      name: 'Sold QTY',
      selector: row => row.total_quantity,
      sortable: true,
      width: '8%',
      cell: row => <Text style={{ textAlign: 'center', display: 'block' }}>{row.total_quantity || 0}</Text>,
    },
    {
      name: 'Sub Amount',
      selector: row => row.total_subtotal,
      sortable: true,
      width: '10%',
      cell: row => <Text style={{ textAlign: 'right', display: 'block' }}>${row.total_subtotal?.toFixed(2) || '0.00'}</Text>,
    },
    {
      name: 'Invoice Dis',
      selector: row => row.total_invoice_discount,
      sortable: true,
      width: '8%',
      cell: row => <Text style={{ textAlign: 'right', display: 'block' }}>${row.total_invoice_discount?.toFixed(2) || '0.00'}</Text>,
    },
    {
      name: 'Item Dis',
      selector: row => row.total_item_discount,
      sortable: true,
      width: '8%',
      cell: row => <Text style={{ textAlign: 'right', display: 'block' }}>${row.total_item_discount?.toFixed(2) || '0.00'}</Text>,
    },
    {
      name: 'Total Sale',
      selector: row => row.total_sale,
      sortable: true,
      width: '8%',
      cell: row => <Text style={{ textAlign: 'right', display: 'block' }}>${row.total_sale?.toFixed(2) || '0.00'}</Text>,
    },
    {
      name: 'Total Cost',
      selector: row => row.total_cost,
      sortable: true,
      width: '8%',
      cell: row => <Text style={{ textAlign: 'right', display: 'block' }}>${row.total_cost?.toFixed(2) || '0.00'}</Text>,
    },
    {
      name: 'Profit',
      selector: row => row.profit,
      sortable: true,
      width: '8%',
      cell: row => (
        <Text style={{
          textAlign: 'right',
          display: 'block',
          color: (row.profit || 0) >= 0 ? '#52c41a' : '#f5222d',
        }}>
          ${row.profit?.toFixed(2) || '0.00'}
        </Text>
      ),
    },
  ], []);

  // Custom footer component
  const CustomFooter = useMemo(() => () => (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '20% 10% 8% 8% 10% 8% 8% 8% 8% 8%',
      width: '100%',
      padding: '10px 0',
      background: '#fafafa',
      borderTop: '1px solid #f0f0f0',
      marginTop: '-1px',
      fontSize: '14px',
    }}>
      <div style={{ padding: '0 8px', textAlign: 'left' }}><Text strong>Total</Text></div>
      <div style={{ padding: '0 8px', textAlign: 'center' }}></div>
      <div style={{ padding: '0 8px', textAlign: 'center' }}><Text strong>{totals.totalCustomers}</Text></div>
      <div style={{ padding: '0 8px', textAlign: 'center' }}><Text strong>{totals.totalQuantity}</Text></div>
      <div style={{ padding: '0 8px', textAlign: 'right' }}><Text strong>${totals.totalSubtotal.toFixed(2)}</Text></div>
      <div style={{ padding: '0 8px', textAlign: 'right' }}><Text strong>${totals.totalInvoiceDiscount.toFixed(2)}</Text></div>
      <div style={{ padding: '0 8px', textAlign: 'right' }}><Text strong>${totals.totalItemDiscount.toFixed(2)}</Text></div>
      <div style={{ padding: '0 8px', textAlign: 'right' }}><Text strong>${totals.totalSale.toFixed(2)}</Text></div>
      <div style={{ padding: '0 8px', textAlign: 'right' }}><Text strong>${totals.totalCost.toFixed(2)}</Text></div>
      <div style={{ padding: '0 8px', textAlign: 'right' }}>
        <Text strong style={{ color: totals.totalProfit >= 0 ? '#52c41a' : '#f5222d' }}>
          ${totals.totalProfit.toFixed(2)}
        </Text>
      </div>
    </div>
  ), [totals]);

  // Retry handler for errors
  const handleRetry = useCallback(() => {
    setError(null);
    setIsLoading(true);
    axios.get(`/api/sales?warehouse_id=${userData.warehouse_id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(response => {
        setSales(response.data.sales || []);
        setIsLoading(false);
      })
      .catch(err => {
        setError(err);
        setIsLoading(false);
      });
  }, [userData.warehouse_id, token]);

  if (error) {
    return (
      <div style={{ padding: '24px', maxWidth: 800, margin: '0 auto' }}>
        <Card>
          <Text type="danger">Error: {error.message || 'Failed to load sales data'}</Text>
          <Button type="primary" onClick={handleRetry} style={{ marginLeft: 16 }}>
            Retry
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <Spin spinning={isLoading} tip="Loading sales data...">
      <div style={{ padding: '24px' }}>
        {/* Header Section */}
        <Card style={{ marginBottom: 24, background: '#f6ffed', borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
          <Row align="middle" justify="space-between">
            <Col>
              <Title level={3} style={{ margin: 0, color: '#389e0d' }}>Sales Reports</Title>
              <Text type="secondary">Analyze product sales performance</Text>
              <div style={{ marginTop: 8 }}>
                <Text strong>Warehouse: </Text>
                <Text>{userData.warehouse_name || 'N/A'}</Text>
              </div>
            </Col>
            <Col>
              <ShoppingCartOutlined style={{ fontSize: 48, color: '#b7eb8f', opacity: 0.8 }} />
            </Col>
          </Row>
        </Card>

        {/* Filter Section */}
        <Card style={{ marginBottom: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.05)', borderRadius: 8 }}>
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} sm={12} md={6}>
              <Search
                placeholder="Search invoice or customer"
                prefix={<SearchOutlined style={{ color: '#52c41a' }} />}
                onChange={e => debouncedSetSearchTerm(e.target.value)}
                allowClear
                size="large"
                aria-label="Search invoices or customers"
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Select
                style={{ width: '100%' }}
                placeholder="Filter by status"
                value={statusFilter}
                onChange={setStatusFilter}
                allowClear
                suffixIcon={<FilterOutlined style={{ color: '#52c41a' }} />}
                size="large"
                aria-label="Filter by status"
              >
                <Option value="all">All Statuses</Option>
                <Option value="completed">Completed</Option>
                <Option value="pending">Pending</Option>
                <Option value="cancelled">Cancelled</Option>
              </Select>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Select
                style={{ width: '100%' }}
                placeholder="Filter by sale type"
                value={saleTypeFilter}
                onChange={setSaleTypeFilter}
                allowClear
                suffixIcon={<FilterOutlined style={{ color: '#52c41a' }} />}
                size="large"
                aria-label="Filter by sale type"
              >
                <Option value="all">All Sale Types</Option>
                <Option value="pos">POS</Option>
                <Option value="inventory">Inventory</Option>
              </Select>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Select
                style={{ width: '100%' }}
                placeholder="Filter by customer"
                value={customerFilter}
                onChange={setCustomerFilter}
                allowClear
                suffixIcon={<FilterOutlined style={{ color: '#52c41a' }} />}
                size="large"
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) => option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                aria-label="Filter by customer"
              >
                <Option value="all">All Customers</Option>
                {customers.map(customer => (
                  <Option key={customer} value={customer}>{customer || 'Unknown'}</Option>
                ))}
              </Select>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Select
                style={{ width: '100%' }}
                placeholder="Report type"
                value={reportType}
                onChange={setReportType}
                allowClear
                suffixIcon={<FilterOutlined style={{ color: '#52c41a' }} />}
                size="large"
                aria-label="Select report type"
              >
                <Option value="all">All</Option>
                <Option value="daily">Daily</Option>
                <Option value="monthly">Monthly</Option>
              </Select>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <RangePicker
                style={{ width: '100%' }}
                placeholder={['Start Date', 'End Date']}
                value={dateRange}
                onChange={setDateRange}
                size="large"
                disabled={reportType !== 'all'}
                showTime={{ format: 'HH:mm' }}
                format="YYYY-MM-DD HH:mm"
                aria-label="Select date range"
              />
            </Col>
            <Col xs={24} sm={12} md={3}>
              <Button
                type="primary"
                icon={<SearchOutlined />}
                onClick={() => {}} // Handled by debounced search
                size="large"
                style={{ width: '100%', backgroundColor: '#52c41a', borderColor: '#52c41a', fontWeight: 600 }}
                aria-label="Apply filters"
              >
                Search
              </Button>
            </Col>
            <Col xs={24} sm={12} md={3}>
              <Button
                type="default"
                icon={<ClearOutlined />}
                onClick={handleClearFilters}
                size="large"
                style={{ width: '100%', fontWeight: 600 }}
                aria-label="Clear filters"
              >
                Clear
              </Button>
            </Col>
          </Row>
        </Card>

        {/* Statistics Section */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} md={6}>
            <Card hoverable>
              <Statistic
                title="Total Sales"
                value={stats.totalSales}
                prefix={<ShoppingCartOutlined style={{ color: '#52c41a' }} />}
                valueStyle={{ color: '#1890ff' }}
              />
              <Progress percent={100} showInfo={false} strokeColor="#d9f7be" trailColor="#f6ffed" />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card hoverable>
              <Statistic
                title="Total Revenue"
                value={stats.totalRevenue}
                prefix="$"
                valueStyle={{ color: '#52c41a' }}
                formatter={value => value.toFixed(2)}
              />
              <Progress percent={100} showInfo={false} strokeColor="#b7eb8f" trailColor="#f6ffed" />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card hoverable>
              <Statistic
                title="Completed"
                value={stats.completedSales}
                prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                valueStyle={{ color: '#52c41a' }}
              />
              <Progress percent={stats.completionRate} showInfo={false} strokeColor="#52c41a" trailColor="#f6ffed" />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card hoverable>
              <Statistic
                title="Pending"
                value={stats.pendingSales}
                prefix={<SyncOutlined spin style={{ color: '#faad14' }} />}
                valueStyle={{ color: '#faad14' }}
              />
              <Progress
                percent={stats.totalSales > 0 ? Math.round((stats.pendingSales / stats.totalSales) * 100) : 0}
                showInfo={false}
                strokeColor="#faad14"
                trailColor="#fffbe6"
              />
            </Card>
          </Col>
        </Row>

        {/* DataTable Section */}
        <div ref={tableRef}>
          <div style={{ marginBottom: 24, textAlign: 'left' }}>
            <Title level={4}>DD Home</Title>
            <Text>Address: Nº25, St.5, Dangkor, Phnom Penh, Cambodia</Text><br />
            <Text>Phone: 081 90 50 50</Text><br />
            <Text>View By Outlet: {userData.warehouse_name || 'Chamroeun Phal'}</Text><br />
            <Text>View By Location: All</Text><br />
            <Text>View As: Detail</Text><br />
            <Text>Group By: None</Text><br />
            <Text>
              From {dateRange && dateRange[0] ? dayjs(dateRange[0]).format('YYYY-MM-DD h:mm A') : 'N/A'} To{' '}
              {dateRange && dateRange[1] ? dayjs(dateRange[1]).format('YYYY-MM-DD h:mm A') : 'N/A'}
            </Text>
          </div>
          <Card
            title={<Text strong style={{ fontSize: 18 }}>Sales Report Details</Text>}
            extra={
              <Space>
                <Button
                  icon={<FileExcelOutlined />}
                  onClick={handleExportExcel}
                  disabled={selectedRows.length === 0 || exportLoading}
                  loading={exportLoading}
                  style={{ backgroundColor: '#52c41a', borderColor: '#52c41a', color: 'white' }}
                >
                  Export Excel
                </Button>
                <Button
                  icon={<FilePdfOutlined />}
                  onClick={handleExportPDF}
                  disabled={exportLoading}
                  loading={exportLoading}
                  style={{ backgroundColor: '#f5222d', borderColor: '#f5222d', color: 'white' }}
                >
                  Export PDF
                </Button>
                <Button
                  icon={<FileImageOutlined />}
                  onClick={handleExportImage}
                  disabled={exportLoading}
                  loading={exportLoading}
                  style={{ backgroundColor: '#1890ff', borderColor: '#1890ff', color: 'white' }}
                >
                  Export Image
                </Button>
              </Space>
            }
            style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)', borderRadius: 8 }}
          >
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
                head: { style: { fontSize: '14px', fontWeight: 600, paddingLeft: '0', paddingRight: '0' } },
                headRow: { style: { backgroundColor: '#f8f8f8', borderBottom: '1px solid #e7e7e7' } },
                headCells: { style: { padding: '12px', color: '#333' } },
                cells: { style: { padding: '12px', fontSize: '13px' } },
                rows: {
                  style: {
                    '&:not(:last-of-type)': { borderBottom: '1px solid #f0f0f0' },
                    '&:hover': { backgroundColor: '#f8f8f8 !important' },
                  },
                },
                pagination: { style: { fontSize: '13px', borderTop: '1px solid #e7e7e7' } },
              }}
              fixedHeader
              fixedHeaderScrollHeight="500px"
              subHeader
              subHeaderComponent={<CustomFooter />}
            />
          </Card>
        </div>
      </div>
    </Spin>
  );
};

export default SalesReports;