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
import './Purchase.css';
import { useUser } from '../../../hooks/UserUser';

dayjs.extend(isBetween);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { Text, Title } = Typography;

const PurchaseReports = () => {
  // Consolidated filter state
  const [filters, setFilters] = useState({
    searchTerm: '',
    status: 'all',
    dateRange: null,
    supplier: 'all',
    reportType: 'all',
    purchaseType: 'all',
  });
  const [selectedRows, setSelectedRows] = useState([]);
  const [exportLoading, setExportLoading] = useState(false);
  const [purchases, setPurchases] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ first: 0, rows: 10 });
  const tableRef = useRef();
  const { getPurchaseReportData } = useReport();
  const [suppliers, setSuppliers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const {handleSuppliers , handleEmployee} = useUser();
  // User data and auth
  const userData = useMemo(() => JSON.parse(Cookies.get('user') || '{}'), []);
  const token = localStorage.getItem('token');
  const handleSuppliersData = async() =>{
    let results = await handleSuppliers(token);    
    if (results.success) {
      setSuppliers(results.suppliers);
    }
  }
  const handleRecieversData = async() =>{
    let results = await handleEmployee(token);        
    if (results.success) {
      setEmployees(results.employees);
    }
  }

  // Fetch data
  const fetchPurchaseData = async () => {
    try {
      setIsLoading(true);
      const response = await getPurchaseReportData(userData.warehouse_id, token);
      if (response.success) {
        setPurchases(response.purchases || []);
        setError(null);
        setIsLoading(false);
      }
    } catch (err) {
      setError(err);
      setIsLoading(false);
      message.error('Failed to load purchase data');
    }
  };

  useEffect(() => {
    fetchPurchaseData();
    handleSuppliersData();
    handleRecieversData();
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

  // // Memoized suppliers
  // const suppliers = useMemo(
  //   () => Array.from(new Set(purchases.map((purchase) => purchase.supplier?.name || '').filter(Boolean))),
  //   [purchases]
  // );

  // Optimized filtered purchases
  const filteredPurchases = useMemo(() => {
    if (!purchases.length) return [];

    const { searchTerm, status, supplier, purchaseType, dateRange, reportType } = filters;
    const lowerSearch = searchTerm.toLowerCase();
    const today = dayjs().startOf('day');

    return purchases.filter((purchase) => {
      const idStr = purchase.id?.toString() || '';
      const supplierStr = purchase.supplier?.name || '';
      const productStr = purchase.product_name || '';
      const purchaseDate = dayjs(purchase.date);

      return (
        (!searchTerm || 
         idStr.includes(lowerSearch) || 
         supplierStr.toLowerCase().includes(lowerSearch) ||
         productStr.toLowerCase().includes(lowerSearch)) &&
        (status === 'all' || purchase.status === status) &&
        (supplier === 'all' || purchase.supplier?.name === supplier) &&
        (purchaseType === 'all' || (purchase.type && purchase.type.toLowerCase() === purchaseType.toLowerCase())) &&
        (!dateRange?.[0] || !dateRange?.[1] || purchaseDate.isBetween(dayjs(dateRange[0]).startOf('day'), dayjs(dateRange[1]).endOf('day'), null, '[]')) &&
        (reportType === 'all' ||
          (reportType === 'daily' && purchaseDate.isSame(today, 'day')) ||
          (reportType === 'monthly' && purchaseDate.isSame(today, 'month') && purchaseDate.isSame(today, 'year')))
      );
    });
  }, [purchases, filters]);

  // Combined totals and stats
  const { totals, stats } = useMemo(() => {
    const totals = {
      totalQuantity: 0,
      totalCost: 0,
      totalTax: 0,
      totalShipping: 0,
      grandTotal: 0,
    };

    let totalPurchases = 0;
    let completedPurchases = 0;
    let pendingPurchases = 0;
    let cancelledPurchases = 0;

    filteredPurchases.forEach((purchase) => {
      totals.totalQuantity += purchase.qty || 0;
      totals.totalCost += Number(purchase.total_cost) || 0;
      totals.totalTax += purchase.tax_amount || 0;
      totals.totalShipping += purchase.shipping_cost || 0;
      totals.grandTotal += purchase.grand_total || 0;

      totalPurchases++;
      if (purchase.status === 'completed') completedPurchases++;
      if (purchase.status === 'pending') pendingPurchases++;
      if (purchase.status === 'cancelled') cancelledPurchases++;
    });

    const completionRate = totalPurchases > 0 ? Math.round((completedPurchases / totalPurchases) * 100) : 0;

    return {
      totals,
      stats: { 
        totalPurchases, 
        completedPurchases, 
        pendingPurchases, 
        cancelledPurchases, 
        completionRate 
      },
    };
  }, [filteredPurchases]);
  
  // Row selection handler
  const handleRowSelected = useCallback((e) => {
    setSelectedRows(e.value.map((row) => row.id));
  }, []);

const handleExportExcel = useCallback(async () => {
  setExportLoading(true);
  try {
    if (!filteredPurchases.length) {
      message.warning('No data available to export');
      return;
    }

    // Format helper functions
    const formatNumber = (num) => (num || 0).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });

    const formatDate = (date) => date ? dayjs(date).format('DD/MM/YYYY h:mm A') : 'N/A';

    // Calculate totals
    const totalQty = filteredPurchases.reduce((sum, item) => sum + (item.quantity || 0), 0);
    const totalCost = filteredPurchases.reduce((sum, item) => sum + (item.total_cost || 0), 0);

    // Create workbook
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet([]);

    // Define border style for totals separator
    const borderStyle = {
      border: {
        top: { style: 'medium', color: { rgb: '000000' } } // Black medium line
      }
    };

    // Prepare data with exact layout
    const exportData = [
      // First row - Company name left, Report title right
      [
        { v: 'DD Home', s: { font: { bold: true, sz: 16 }, alignment: { horizontal: 'left' } } },
        '', '', '', '', '', '',
        { v: 'Received Report', s: { font: { bold: true, sz: 16 }, alignment: { horizontal: 'right' } } }
      ],
      
      // Second row - Address left, Outlet info right
      [
        { v: 'Address : Nº25, St.5, Dangkor, Phnom Penh, Cambodia', s: { font: { sz: 11 } } },
        '', '', '', '', '', '',
        { v: `View By Outlet : ${userData.warehouse_name || 'Chamroeun Phal'}`, s: { font: { sz: 11 }, alignment: { horizontal: 'right' } } }
      ],
      
      // Third row - Phone left, Location info right
      [
        { v: 'Phone : 081 90 50 50', s: { font: { sz: 11 } } },
        '', '', '', '', '', '',
        { v: 'View By Location : All', s: { font: { sz: 11 }, alignment: { horizontal: 'right' } } }
      ],
      
      // Fourth row - Empty left, View As right
      [
        '', '', '', '', '', '', '',
        { v: 'View As : Detail', s: { font: { sz: 11 }, alignment: { horizontal: 'right' } } }
      ],
      
      // Fifth row - Empty left, Group By right
      [
        '', '', '', '', '', '', '',
        { v: 'Group By : None', s: { font: { sz: 11 }, alignment: { horizontal: 'right' } } }
      ],
      
      // Sixth row - Empty left, Date range right
      [
        '', '', '', '', '', '', '',
        { v: `From ${filters.dateRange?.[0] ? formatDate(filters.dateRange[0]) : 'N/A'} To ${filters.dateRange?.[1] ? formatDate(filters.dateRange[1]) : 'N/A'}`, 
          s: { font: { sz: 11 }, alignment: { horizontal: 'right' } } }
      ],
      
      [], // Empty row for spacing
      
      // Column headers
      [
        { v: 'Product Code', s: { font: { bold: true }, fill: { fgColor: { rgb: "black" } } }},
        { v: 'Barcode', s: { font: { bold: true }, fill: { fgColor: { rgb: "D3D3D3" } } }},
        { v: 'Description', s: { font: { bold: true }, fill: { fgColor: { rgb: "D3D3D3" } }} },
        { v: 'QTY', s: { font: { bold: true }, fill: { fgColor: { rgb: "D3D3D3" } } }},
        { v: 'UOM', s: { font: { bold: true }, fill: { fgColor: { rgb: "D3D3D3" } } }},
        { v: 'Cost', s: { font: { bold: true }, fill: { fgColor: { rgb: "D3D3D3" } } }},
        { v: 'Total Cost', s: { font: { bold: true }, fill: { fgColor: { rgb: "D3D3D3" }} } },
        { v: 'Received By', s: { font: { bold: true }, fill: { fgColor: { rgb: "D3D3D3" }} } }
      ],
      
      // Data rows
      ...filteredPurchases.map(purchase => [
        purchase.product_code || 'N/A',
        purchase.barcode || 'N/A',
        purchase.product_name || 'N/A',
        purchase.quantity || 0,
        purchase.uom || 'N/A',
        formatNumber(purchase.unit_cost),
        formatNumber(purchase.total_cost),
        purchase.receivedBy || 'N/A'
      ]),
      
      // Totals row with black top border
      [
        { v: '', s: borderStyle },
        { v: '', s: borderStyle },
        { v: '', s: borderStyle },
        { 
          v: totalQty, 
          s: { 
            font: { bold: true },
            ...borderStyle
          } 
        },
        { v: '', s: borderStyle },
        { v: '', s: borderStyle },
        { 
          v: formatNumber(totalCost), 
          s: { 
            font: { bold: true },
            ...borderStyle
          } 
        },
        { v: '', s: borderStyle }
      ]
    ];

    // Convert data to worksheet
    XLSX.utils.sheet_add_aoa(worksheet, exportData);

    // Set column widths
    worksheet['!cols'] = [
      { wch: 12 }, // Product Code
      { wch: 12 }, // Barcode
      { wch: 30 }, // Description
      { wch: 8 },  // QTY
      { wch: 8 },  // UOM
      { wch: 10 }, // Cost
      { wch: 12 }, // Total Cost
      { wch: 20 }  // Received By
    ];

    // Merge header cells
    worksheet['!merges'] = [
      // Merge company name cells
      { s: { r: 0, c: 0 }, e: { r: 0, c: 6 } },
      // Merge report title cell
      { s: { r: 0, c: 7 }, e: { r: 0, c: 7 } },
      // Merge address cells
      { s: { r: 1, c: 0 }, e: { r: 1, c: 6 } },
      // Merge phone cells
      { s: { r: 2, c: 0 }, e: { r: 2, c: 6 } }
    ];

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Received Report");

    // Generate and download the file
    const fileName = `Received_Report_${dayjs().format('YYYY-MM-DD')}.xlsx`;
    XLSX.writeFile(workbook, fileName);
    message.success('Excel file exported successfully');
  } catch (error) {
    console.error('Export error:', error);
    message.error('Failed to export Excel file');
  } finally {
    setExportLoading(false);
  }
}, [filteredPurchases, userData.warehouse_name, filters.dateRange]);

  const handleExportPDF = useCallback(async () => {
    setExportLoading(true);
    try {
      await generatePDF(tableRef, {
        filename: `purchase-report-${dayjs().format('YYYYMMDD')}.pdf`,
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
        link.download = `purchase-report-${dayjs().format('YYYYMMDD')}.png`;
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
      supplier: 'all',
      reportType: 'all',
      purchaseType: 'all',
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
        field: 'product_code',
        header: 'Product Code',
        sortable: true,
        style: { width: '12%', minWidth: '120px' },
        headerStyle: { textAlign: 'left' },
        bodyStyle: { 
          textAlign: 'left',
          paddingLeft: '0',  
          marginLeft: '0'     
        },
        body: (rowData) => (
          <Text strong>
            {rowData.product_code || 'N/A'}
          </Text>
        ),
      },
      {
        field: 'product_name',
        header: 'Product Name',
        sortable: true,
        style: { width: '20%', minWidth: '180px' },
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
      {
        field: 'supplier.name',
        header: 'Supplier',
        sortable: true,
        style: { width: '15%', minWidth: '150px' },
        body: (rowData) => <Text>{rowData.supplier || 'N/A'}</Text>,
      },
      {
        field: 'quantity',
        header: 'QTY',
        sortable: true,
        style: { width: '8%', textAlign: 'center', minWidth: '80px' },
        body: (rowData) => <Text>{rowData.qty || 0}</Text>,
      },
      {
        field: 'unit_cost',
        header: 'Unit Cost',
        sortable: true,
        style: { width: '10%', textAlign: 'right', minWidth: '100px' },
        body: (rowData) => (
          <Text>
            ${Number(rowData?.cost || 0).toFixed(2)}
          </Text>
        ),      
      },
      {
        field: 'uom',
        header: 'UOM',
        sortable: true,
        style: { width: '10%', textAlign: 'right', minWidth: '100px' },
        body: (rowData) => (
          <Text>
            {(rowData?.uom)}
          </Text>
        ),      
      },
      {
        field: 'total_cost',
        header: 'Total Cost',
        sortable: true,
        style: { width: '10%', textAlign: 'right', minWidth: '100px' },
        body: (rowData) => <Text>${(rowData?.total_cost || 0)}</Text>,
      },
      {
        field: 'purchaser',
        header: 'Recieved by',
        sortable: true,
        style: { width: '10%', textAlign: 'right', minWidth: '110px' },
        body: (rowData) => <Text>{(rowData?.purchaser || 'N/A')}</Text>,
      },
      // {
      //   field: 'status',
      //   header: 'Status',
      //   sortable: true,
      //   style: { width: '8%', textAlign: 'center', minWidth: '100px' },
      //   body: (rowData) => (
      //     <Text 
      //       style={{ 
      //         color: rowData.status === 'completed' ? '#52c41a' : 
      //               rowData.status === 'pending' ? '#faad14' : 
      //               rowData.status === 'cancelled' ? '#f5222d' : '#8c8c8c'
      //       }}
      //     >
      //       {rowData.status || 'N/A'}
      //     </Text>
      //   ),
      // },
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
            gridTemplateColumns: '17% 40% 5% 8% 10% 10% 8% 8% 10% 8%',
            minWidth: '1000px', 
            borderTop: '1px solid #f0f0f0',
            fontSize: '14px',
          }}
        >
          <div style={{ padding: '0 8px', textAlign: 'center' }}><Text strong>Total</Text></div>
          <div />
          <div />
          <div style={{ textAlign: 'center' }}><Text strong>{totals.totalQuantity}</Text></div>
          <div />
          <div />
          <div />
          <div style={{ textAlign: 'right' }}><Text strong>${totals?.totalCost.toFixed(2)}</Text></div>
          {/* <div style={{ textAlign: 'right' }}><Text strong>${totals.totalShipping.toFixed(2)}</Text></div> */}
          {/* <div style={{ textAlign: 'right' }}><Text strong>${totals.grandTotal.toFixed(2)}</Text></div> */}
          <div/>
          <div/>
          <div />
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
    fetchPurchaseData();
  }, [retryCount]);

  if (error) {
    return (
      <div style={{ padding: '24px', maxWidth: 800, margin: '0 auto' }}>
        <Card>
          <Text type="danger">Error: {error.message || 'Failed to load purchase data'}</Text>
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
    <Spin spinning={isLoading || exportLoading} tip={exportLoading ? 'Exporting...' : 'Loading purchase data...'} size="large">
      <div>
        {/* Header Section */}
        <Card
          style={{
            marginBottom: 24,
            background: '#f0f5ff',
            borderRadius: 0,
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            transition: 'all 0.3s',
          }}
          hoverable
        >
          <Row align="middle" justify="space-between">
            <Col>
              <Title level={3} style={{ margin: 0, color: '#1d39c4' }}>
                Purchase Reports
              </Title>
              <Text type="secondary">Analyze product purchase performance</Text>
              <div style={{ marginTop: 8 }}>
                <Text strong>Warehouse: </Text>
                <Text>{userData.warehouse_name || 'N/A'}</Text>
              </div>
            </Col>
            <Col>
              <ShoppingCartOutlined style={{ fontSize: 48, color: '#adc6ff', opacity: 0.8, transition: 'opacity 0.3s' }} />
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
                placeholder="Search product or supplier"
                prefix={<SearchOutlined style={{ color: '#1890ff' }} />}
                onChange={(e) => debouncedSetSearch(e.target.value)}
                allowClear
                size="large"
                aria-label="Search products or suppliers"
              />
            </Col>
            {/* <Col xs={24} sm={12} md={6}>
              <Select
                style={{ width: '100%' }}
                placeholder="Filter by status"
                value={filters.status}
                onChange={(value) => setFilters((prev) => ({ ...prev, status: value }))}
                allowClear
                suffixIcon={<FilterOutlined style={{ color: '#1890ff' }} />}
                size="large"
                aria-label="Filter by status"
              >
                <Option value="all">All Statuses</Option>
                <Option value="completed">Completed</Option>
                <Option value="pending">Pending</Option>
                <Option value="cancelled">Cancelled</Option>
              </Select>
            </Col> */}
            <Col xs={24} sm={12} md={6}>
              <Select
                style={{ width: '100%' }}
                placeholder="Filter by supplier"
                value={filters.supplier}
                onChange={(value) => setFilters((prev) => ({ ...prev, supplier: value }))}
                allowClear
                showSearch
                mode="multiple"
                filterOption={(input, option) =>
                  option.children.toLowerCase().includes(input.toLowerCase())
                }
                suffixIcon={<FilterOutlined style={{ color: '#1890ff' }} />}
                size="large"
                aria-label="Filter by supplier"
              >
                <Option value="all">All Suppliers</Option>
                {suppliers.map((supplier) => (
                  <Option key={supplier.id} value={supplier.id}>
                    {supplier.username}
                  </Option>
                ))}
              </Select>
            </Col>

            <Col xs={24} sm={12} md={6}>
              <Select
                style={{ width: '100%' }}
                placeholder="Filter by receiver"
                value={filters.receiver}
                onChange={(value) => setFilters((prev) => ({ ...prev, receiver: value }))}
                allowClear
                showSearch
                mode="multiple"
                filterOption={(input, option) =>
                  option.children.toLowerCase().includes(input.toLowerCase())
                }
                suffixIcon={<FilterOutlined style={{ color: '#1890ff' }} />}
                size="large"
                aria-label="Filter by receiver"
              >
                <Option value="all">All Receivers</Option>
                {employees.map((receiver) => (
                  <Option key={receiver.id} value={receiver.id}>
                    {receiver.username}
                  </Option>
                ))}
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
                style={{ width: '100%', backgroundColor: '#1890ff', borderColor: '#1890ff', fontWeight: 600 }}
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
          <Card
            title={<Text strong style={{ fontSize: 18 }}>Purchase Report Details</Text>}
            extra={
              <Space>
                <Button
                  icon={<FileExcelOutlined />}
                  onClick={handleExportExcel}
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
              value={filteredPurchases}
              selection={filteredPurchases.filter((row) => selectedRows.includes(row.id))}
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

export default PurchaseReports;