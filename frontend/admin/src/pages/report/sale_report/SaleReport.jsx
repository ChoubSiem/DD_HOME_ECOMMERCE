// ```jsx
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
import Cookies from 'js-cookie';
import * as XLSX from 'xlsx';
import generatePDF from 'react-to-pdf';
import html2canvas from 'html2canvas';
import debounce from 'lodash.debounce';
import axios from 'axios';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import { useReport } from '../../../hooks/UseReport';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import './Sales.css';

dayjs.extend(isBetween);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { Text, Title } = Typography;

const SalesReports = () => {
  // Consolidated filter state
  const [filters, setFilters] = useState({
    searchTerm: '',
    status: 'all',
    dateRange: null,
    customer: 'all',
    reportType: 'all',
    saleType: 'all',
  });
  const [selectedRows, setSelectedRows] = useState([]);
  const [exportLoading, setExportLoading] = useState(false);
  const [sales, setSales] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ first: 0, rows: 10 });
  const tableRef = useRef();
  const { getSaleReportsData } = useReport();

  // User data and auth
  const userData = useMemo(() => JSON.parse(Cookies.get('user') || '{}'), []);
  const token = localStorage.getItem('token');

  // Fetch data
  const fetchSalesReportData = async () => {
    try {
      setIsLoading(true);
      const response = await getSaleReportsData(userData.warehouse_id, token);
      if (response.success) {
        setSales(response.sales || []);
        setError(null);
        setIsLoading(false);
      }
    } catch (err) {
 
        message.error('Failed to load sales data');
    } 
  };
  useEffect(() => {
    fetchSalesReportData();
  }, []);

  // Debounced search
  const debouncedSetSearch = useMemo(
    () => debounce((value) => setFilters((prev) => ({ ...prev, searchTerm: value })), 200),
    []
  );

  useEffect(() => {
    return () => {
      debouncedSetSearch.cancel();
    };
  }, [debouncedSetSearch]);

  // Memoized customers
  const customers = useMemo(
    () => Array.from(new Set(sales.map((sale) => sale.customer?.username || '').filter(Boolean))),
    [sales]
  );

  // Optimized filtered sales
  const filteredSales = useMemo(() => {
    if (!sales.length) return [];

    const { searchTerm, status, customer, saleType, dateRange, reportType } = filters;
    const lowerSearch = searchTerm.toLowerCase();
    const today = dayjs().startOf('day');

    return sales.filter((sale) => {
      const idStr = sale.id?.toString() || '';
      const customerStr = sale.customer?.username || '';
      const saleDate = dayjs(sale.first_sale_date);
      
      return (
        (!searchTerm || idStr.includes(lowerSearch) || customerStr.toLowerCase().includes(lowerSearch)) &&
        (status === 'all' || sale.status === status) &&
        (customer === 'all' || sale.customer?.username === customer) &&
        (saleType === 'all' || (sale.type && sale.type.toLowerCase() === saleType.toLowerCase())) &&
        (!dateRange?.[0] || !dateRange?.[1] || saleDate.isBetween(dayjs(dateRange[0]).startOf('day'), dayjs(dateRange[1]).endOf('day'), null, '[]')) &&
        (reportType === 'all' ||
          (reportType === 'daily' && saleDate.isSame(today, 'day')) ||
          (reportType === 'monthly' && saleDate.isSame(today, 'month') && saleDate.isSame(today, 'year')))
      );
    });
  }, [sales, filters]);

  // Combined totals and stats
  const { totals, stats } = useMemo(() => {
    const totals = {
      totalCustomers: 0,
      totalQuantity: 0,
      totalSubtotal: 0,
      totalInvoiceDiscount: 0,
      totalItemDiscount: 0,
      totalSale: 0,
      totalCost: 0,
      totalProfit: 0,
    };
    let totalSales = 0;
    let totalRevenue = 0;
    let totalProfit = 0;
    let completedSales = 0;
    let pendingSales = 0;

    filteredSales.forEach((sale) => {
      totals.totalCustomers += sale.total_customers || 0;
      totals.totalQuantity += sale.total_quantity || 0;
      totals.totalSubtotal += sale.total_subtotal || 0;
      totals.totalInvoiceDiscount += sale.total_invoice_discount || 0;
      totals.totalItemDiscount += sale.total_item_discount || 0;
      totals.totalSale += sale.total_sale || 0;
      totals.totalCost += sale.total_cost || 0;
      totals.totalProfit += sale.profit || 0;

      totalSales++;
      totalRevenue += sale.total_sale || 0;
      totalProfit += sale.profit || 0;
      if (sale.status === 'completed') completedSales++;
      if (sale.status === 'pending') pendingSales++;
    });

    const completionRate = totalSales > 0 ? Math.round((completedSales / totalSales) * 100) : 0;

    return {
      totals,
      stats: { totalSales, totalRevenue, totalProfit, completedSales, pendingSales, completionRate },
    };
  }, [filteredSales]);

  // Row selection handler
  const handleRowSelected = useCallback((e) => {
    setSelectedRows(e.value.map((row) => row.id));
  }, []);

const handleExportExcel = useCallback(async () => {
  setExportLoading(true);
  try {
    if (!filteredSales.length) {
      message.warning('No data available to export');
      return;
    }

    // Format helper functions
    const formatNumber = (num) => (num || 0).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });

    const formatDate = (date) => date ? dayjs(date).format('YYYY-MM-DD') : 'N/A';

    const exportData = [
      // Header section
      [{ v: 'DD Home', s: { font: { bold: true, sz: 16 }, alignment: { horizontal: 'center' } }}],
      ['Address: Nº25, St.5, Dangkor, Phnom Penh, Cambodia'],
      ['Phone: 081 90 50 50'],
      [`View By Outlet: ${userData.warehouse_name || 'Chamroeun Phal'}`],
      ['View By Location: All'],
      ['View As: Detail'],
      ['Group By: None'],
      [
        `From ${filters.dateRange?.[0] ? dayjs(filters.dateRange[0]).format('YYYY-MM-DD h:mm A') : 'N/A'}`,
        `To ${filters.dateRange?.[1] ? dayjs(filters.dateRange[1]).format('YYYY-MM-DD h:mm A') : 'N/A'}`
      ],
      [], // Spacer row

      // Column headers with styling
      [
        { v: 'Product Name', s: { font: { bold: true }, fill: { fgColor: { rgb: "D3D3D3" } } }},
        { v: 'First Sale Date', s: { font: { bold: true }, fill: { fgColor: { rgb: "D3D3D3" } } }},
        { v: 'Customers', s: { font: { bold: true }, fill: { fgColor: { rgb: "D3D3D3" } } }},
        { v: 'Quantity Sold', s: { font: { bold: true }, fill: { fgColor: { rgb: "D3D3D3" } } }},
        { v: 'Subtotal', s: { font: { bold: true }, fill: { fgColor: { rgb: "D3D3D3" } } }},
        { v: 'Invoice Discount', s: { font: { bold: true }, fill: { fgColor: { rgb: "D3D3D3" } }} },
        { v: 'Item Discount', s: { font: { bold: true }, fill: { fgColor: { rgb: "D3D3D3" } } }},
        { v: 'Total Sale', s: { font: { bold: true }, fill: { fgColor: { rgb: "D3D3D3" } } }},
        { v: 'Total Cost', s: { font: { bold: true }, fill: { fgColor: { rgb: "D3D3D3" } } }},
        { v: 'Profit', s: { font: { bold: true }, fill: { fgColor: { rgb: "D3D3D3" } } }}
      ],

      // Data rows
      ...filteredSales.map((sale) => [
        sale.product_name || 'N/A',
        formatDate(sale.first_sale_date),
        sale.total_customers || 0,
        sale.total_quantity || 0,
        formatNumber(sale.total_subtotal),
        formatNumber(sale.total_invoice_discount),
        formatNumber(sale.total_item_discount),
        formatNumber(sale.total_sale),
        formatNumber(sale.total_cost),
        formatNumber(sale.profit)
      ]),

      // Totals row with styling
      [
        '',
        '',
        totals.totalCustomers,
        totals.totalQuantity,
        { v: formatNumber(totals.totalSubtotal), s: { font: { bold: true } } },
        { v: formatNumber(totals.totalInvoiceDiscount), s: { font: { bold: true } } },
        { v: formatNumber(totals.totalItemDiscount), s: { font: { bold: true } } },
        { v: formatNumber(totals.totalSale), s: { font: { bold: true } } },
        { v: formatNumber(totals.totalCost), s: { font: { bold: true } } },
        { v: formatNumber(totals.totalProfit), s: { font: { bold: true } } }
      ]
    ];

    // Create Excel sheet
    const worksheet = XLSX.utils.aoa_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sales Report');

    // Set column widths and styles
    worksheet['!cols'] = [
      { wch: 30 }, // Product Name
      { wch: 15 }, // First Sale Date
      { wch: 12 }, // Customers
      { wch: 14 }, // Quantity Sold
      { wch: 14 }, // Subtotal
      { wch: 16 }, // Invoice Discount
      { wch: 14 }, // Item Discount
      { wch: 14 }, // Total Sale
      { wch: 14 }, // Total Cost
      { wch: 14 }  // Profit
    ];

    // Add number formatting for currency columns
    const currencyColumns = [4, 5, 6, 7, 8, 9]; // Zero-based indices
    currencyColumns.forEach(col => {
      XLSX.utils.sheet_add_aoa(worksheet, [[{ t: 'n', z: '#,##0.00' }]], {
        origin: XLSX.utils.encode_cell({ r: 9, c: col }) // Start from data rows
      });
    });

    // Generate and download the file
    const fileName = `sales-report-${dayjs().format('YYYY-MM-DD-HHmm')}.xlsx`;
    XLSX.writeFile(workbook, fileName);
    message.success('Excel file exported successfully');
  } catch (error) {
    console.error('Export error:', error);
    message.error('Failed to export Excel file');
  } finally {
    setExportLoading(false);
  }
}, [filteredSales, totals, userData.warehouse_name, filters.dateRange]);

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
        const canvas = await html2canvas(tableRef.current, { scale: 2, useCORS: true, logging: false });
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
    setFilters({
      searchTerm: '',
      status: 'all',
      dateRange: null,
      customer: 'all',
      reportType: 'all',
      saleType: 'all',
    });
    setSelectedRows([]);
    setPagination({ first: 0, rows: 10 });
  }, []);

  // Apply filters
  const handleApplyFilters = useCallback(() => {
    setIsLoading(true);
    setTimeout(() => {
      
      setIsLoading(false);
      message.info('Filters applied');
    }, 300);
  }, []);

  // Column definitions
  const columns = useMemo(
    () => [
    {
      field: 'product_name',
      header: 'Product',
      sortable: true,
      style: { width: '20%', minWidth: '150px' },
      headerStyle: { textAlign: 'left' },
      bodyStyle: { 
        textAlign: 'left',
        paddingLeft: '0',  
        marginLeft: '0'     
      },
      body: (rowData) => (
        <Text strong style={{ 
          fontFamily: "'Noto Sans Khmer', 'Khmer OS', Arial, sans-serif",
          display: 'block',
          textAlign: 'left',  
          paddingLeft: '5px',   
          marginLeft: '0'     
        }}>
          {rowData.product_name || 'N/A'}
        </Text>
      ),
    },
      // {
      //   field: 'first_sale_date',
      //   header: 'Date',
      //   sortable: true,
      //   style: { width: '10%', minWidth: '100px' },
      //   body: (rowData) => <Text>{dayjs(rowData.first_sale_date).format('YYYY-MM-DD')}</Text>,
      // },
      {
        field: 'total_customers',
        header: 'Customers',
        sortable: true,
        style: { width: '8%', textAlign: 'center', minWidth: '80px' },
        body: (rowData) => <Text>{rowData.total_customers || 0}</Text>,
      },
      {
        field: 'total_quantity',
        header: 'Sold QTY',
        sortable: true,
        style: { width: '8%', textAlign: 'center', minWidth: '80px' },
        body: (rowData) => <Text>{rowData.total_quantity || 0}</Text>,
      },
      {
        field: 'unit_price',
        header: 'Sub Amount',
        sortable: true,
        style: { width: '10%', textAlign: 'right', minWidth: '100px' },
      body: (rowData) => (
        <Text>
          ${Number(rowData?.unit_price || 0).toFixed(2)}
        </Text>
      ),      
      },
      {
        field: 'total_invoice_discount',
        header: 'Invoice Dis',
        sortable: true,
        style: { width: '8%', textAlign: 'right', minWidth: '80px' },
        body: (rowData) => <Text>${(rowData.total_invoice_discount || 0).toFixed(2)}</Text>,
      },
      {
        field: 'total_item_discount',
        header: 'Item Dis',
        sortable: true,
        style: { width: '8%', textAlign: 'right', minWidth: '80px' },
        body: (rowData) => <Text>${(rowData.total_item_discount || 0).toFixed(2)}</Text>,
      },
      {
        field: 'total_sale',
        header: 'Total Sale',
        sortable: true,
        style: { width: '8%', textAlign: 'right', minWidth: '80px' },
        body: (rowData) => <Text>${(rowData.total_sale || 0).toFixed(2)}</Text>,
      },
      {
        field: 'total_cost',
        header: 'Total Cost',
        sortable: true,
        style: { width: '8%', textAlign: 'right', minWidth: '80px' },
        body: (rowData) => <Text>${(rowData.total_cost || 0).toFixed(2)}</Text>,
      },
      {
        field: 'profit',
        header: 'Profit',
        sortable: true,
        style: { width: '8%', textAlign: 'right', minWidth: '80px' },
        body: (rowData) => (
          <Text style={{ color: (rowData.profit || 0) >= 0 ? '#52c41a' : '#f5222d' }}>
            ${(rowData.profit || 0).toFixed(2)}
          </Text>
        ),
      },
    ],
    []
  );

  // Footer component
const CustomFooter = useMemo(
  () => (
    <div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '13% 10% 10% 8% 10% 10% 10% 10% 10% 10%', 
          minWidth: '1200px', 
          borderTop: '1px solid #f0f0f0',
          fontSize: '14px',
        }}
      >
        <div style={{ padding: '0 8px', textAlign: 'left' }}><Text strong>Total</Text></div>
        <div />
        <div style={{ textAlign: 'center' }}><Text strong>{totals.totalCustomers}</Text></div>
        <div style={{ textAlign: 'center' }}><Text strong>{totals.totalQuantity}</Text></div>
        <div style={{ textAlign: 'right' }}><Text strong>${totals.totalSubtotal.toFixed(2)}</Text></div>
        <div style={{ textAlign: 'right' }}><Text strong>${totals.totalInvoiceDiscount.toFixed(2)}</Text></div>
        <div style={{ textAlign: 'right' }}><Text strong>${totals.totalItemDiscount.toFixed(2)}</Text></div>
        <div style={{ textAlign: 'right' }}><Text strong>${totals.totalSale.toFixed(2)}</Text></div>
        <div style={{ textAlign: 'right' }}><Text strong>${totals.totalCost.toFixed(2)}</Text></div>
        <div style={{ textAlign: 'right' }}>
          <Text strong style={{ color: totals.totalProfit >= 0 ? '#52c41a' : '#f5222d' }}>
            ${totals.totalProfit.toFixed(2)}
          </Text>
        </div>
      </div>
    </div>
  ),
  [totals]
);

  // Retry handler with limit
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;
  const handleRetry = useCallback(() => {
    if (retryCount >= maxRetries) {
      message.error('Max retry attempts reached. Please check your connection.');
      return;
    }
    setError(null);
    setIsLoading(true);
    setRetryCount((prev) => prev + 1);
    axios
      .get(`/api/sales?warehouse_id=${userData.warehouse_id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setSales(response.data.sales || []);
        setIsLoading(false);
        setRetryCount(0);
      })
      .catch((err) => {
        setError(err);
        setIsLoading(false);
      });
  }, [userData.warehouse_id, token, retryCount]);

  if (error) {
    return (
      <div style={{ padding: '24px', maxWidth: 800, margin: '0 auto' }}>
        <Card>
          <Text type="danger">Error: {error.message || 'Failed to load sales data'}</Text>
          <Button
            type="primary"
            onClick={handleRetry}
            style={{ marginLeft: 16 }}
            disabled={retryCount >= maxRetries}
          >
            Retry ({maxRetries - retryCount} attempts left)
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <Spin spinning={isLoading || exportLoading} tip={exportLoading ? 'Exporting...' : 'Loading sales data...'} size="large">
      <div>
        {/* Header Section */}
        <Card
          style={{
            marginBottom: 24,
            background: '#f6ffed',
            borderRadius: 0,
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            transition: 'all 0.3s',
          }}
          hoverable
        >
          <Row align="middle" justify="space-between">
            <Col>
              <Title level={3} style={{ margin: 0, color: '#389e0d' }}>
                Sales Reports
              </Title>
              <Text type="secondary">Analyze product sales performance</Text>
              <div style={{ marginTop: 8 }}>
                <Text strong>Warehouse: </Text>
                <Text>{userData.warehouse_name || 'N/A'}</Text>
              </div>
            </Col>
            <Col>
              <ShoppingCartOutlined style={{ fontSize: 48, color: '#b7eb8f', opacity: 0.8, transition: 'opacity 0.3s' }} />
            </Col>
          </Row>
        </Card>

        {/* Filter Section */}
        <Card
          style={{
            marginBottom: 24,
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            borderRadius: 8,
            transition: 'all 0.3s',
          }}
          hoverable
        >
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} sm={12} md={6}>
              <Search
                placeholder="Search invoice or customer"
                prefix={<SearchOutlined style={{ color: '#52c41a' }} />}
                onChange={(e) => debouncedSetSearch(e.target.value)}
                allowClear
                size="large"
                aria-label="Search invoices or customers"
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Select
                style={{ width: '100%' }}
                placeholder="Filter by sale type"
                value={filters.saleType}
                onChange={(value) => setFilters((prev) => ({ ...prev, saleType: value }))}
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
              <RangePicker
                style={{ width: '100%' }}
                placeholder={['Start Date', 'End Date']}
                value={filters.dateRange}
                onChange={(dates) => setFilters((prev) => ({ ...prev, dateRange: dates }))}
                size="large"
                disabled={filters.reportType !== 'all'}
                showTime={{ format: 'HH:mm' }}
                format="YYYY-MM-DD HH:mm"
                aria-label="Select date range"
              />
            </Col>
         

          </Row>
          <Row style={{marginTop:'20px' , gap:'10px'}}>
               <Col xs={24} sm={12} md={3}>
              <Button
                type="primary"
                icon={<SearchOutlined />}
                onClick={handleApplyFilters}
                size="large"
                style={{ width: '100%', backgroundColor: '#52c41a', borderColor: '#52c41a', fontWeight: 600 }}
                aria-label="Apply filters"
              >
                Apply Filters
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

        {/* DataTable Section */}
        <div ref={tableRef}>
          <div style={{ marginBottom: 24, textAlign: 'left',display:'none' }}>
            <Title level={4}>DD Home</Title>
            <Text>Address: Nº25, St.5, Dangkor, Phnom Penh, Cambodia</Text>
            <br />
            <Text>Phone: 081 90 50 50</Text>
            <br />
            <Text>View By Outlet: {userData.warehouse_name || 'Chamroeun Phal'}</Text>
            <br />
            <Text>View By Location: All</Text>
            <br />
            <Text>View As: Detail</Text>
            <br />
            <Text>Group By: None</Text>
            <br />
            <Text>
              From {filters.dateRange?.[0] ? dayjs(filters.dateRange[0]).format('YYYY-MM-DD h:mm A') : 'N/A'} To{' '}
              {filters.dateRange?.[1] ? dayjs(filters.dateRange[1]).format('YYYY-MM-DD h:mm A') : 'N/A'}
            </Text>
          </div>
          <Card
            title={<Text strong style={{ fontSize: 18 }}>Sales Report Details</Text>}
            extra={
              <Space>
                <Button
                  icon={<FileExcelOutlined />}
                  onClick={handleExportExcel}
                  // disabled={selectedRows.length === 0 || exportLoading}
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
            style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)', borderRadius: 0,padding:0 }}
          >
          <DataTable
              value={filteredSales}
              selection={filteredSales.filter((row) => selectedRows.includes(row.id))}
              onSelectionChange={handleRowSelected}
              dataKey="id"
              scrollable
              scrollHeight="600px"
              sortMode="multiple"
              footer={CustomFooter}
              tableStyle={{ minWidth: '100%' }}
              rowClassName={() => 'p-row-transition'}
              className="p-datatable-striped p-datatable-gridlines"
              virtualScrollerOptions={{
                itemSize: 50,
                delay: 100,
                lazy: true,
              }}
              loading={isLoading}
              responsiveLayout="scroll"
            >
            {/* <Column selectionMode="multiple" headerStyle={{ width: '10px' }} bodyStyle={{ textAlign: 'center' }} /> */}
            {columns.map((col, index) => (
              <Column
                key={`${col.field}-${index}`}
                field={col.field}
                header={col.header}
                sortable={col.sortable}
                body={col.body}
                style={col.style}
              />
            ))}
          </DataTable>

          </Card>
        </div>
      </div>
    </Spin>
  );
};

export default SalesReports;