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
  Spin,
  Typography,
  Tooltip,
  Statistic,
  Tag,
  Alert,
} from 'antd';
import {
  SearchOutlined,
  FileExcelOutlined,
  FilePdfOutlined,
  FileImageOutlined,
  StockOutlined,
  ClearOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Toast } from 'primereact/toast';
import Cookies from 'js-cookie';
import { motion } from 'framer-motion';
import { v4 as uuidv4 } from 'uuid';
import debounce from 'lodash.debounce';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import dayjs from 'dayjs';
import * as XLSX from 'xlsx';
import generatePDF from 'react-to-pdf';
import html2canvas from 'html2canvas';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import './Stock.css';
import { useReport } from '../../../hooks/UseReport';

const { Title, Text } = Typography;
const { Search } = Input;
const { RangePicker } = DatePicker;
const { Option } = Select;

const StockReport = React.memo(() => {
  const [filters, setFilters] = useState({
    search_term: '',
    status: 'all',
    category: 'all',
    stock_level: 'all',
    date_range: null,
  });
  const [products, setProducts] = useState([]);
  const [meta, setMeta] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);
  const [exportLoading, setExportLoading] = useState(false);
  const [sortField, setSortField] = useState(null);
  const [sortOrder, setSortOrder] = useState(null);
  const tableRef = useRef(null);
  const toast = useRef(null);
  const { getStockReportsData } = useReport();
  const userData = useMemo(() => JSON.parse(Cookies.get('user') || '{}'), []);
  const token = useMemo(() => localStorage.getItem('token'), []);

  // Memoized categories
  const categories = useMemo(() => {
    const uniqueCategories = new Set(products.map((p) => p.category).filter(Boolean));
    return [
      { value: 'all', label: 'All Categories' },
      ...Array.from(uniqueCategories).map((cat) => ({ value: cat, label: cat })),
    ];
  }, [products]);

  // Debounced fetch
  const debouncedFetchStockReportData = useMemo(
    () =>
      debounce(async (params, setProducts, setMeta, setError, setIsLoading) => {
        try {
          setIsLoading(true);
          setError(null);
          const response = await getStockReportsData(params, token);
          if (response.success) {
            const keySet = new Set();
            const productsWithUniqueKeys = (response.stocks || []).map((product) => {
              const originalKey = product.id;
              const uniqueKey = originalKey && !keySet.has(originalKey) ? originalKey : uuidv4();
              keySet.add(uniqueKey);
              return { ...product, key: uniqueKey };
            });

            const keyCounts = (response.stocks || []).reduce((acc, p) => {
              const key = p.id || 'missing';
              acc[key] = (acc[key] || 0) + 1;
              return acc;
            }, {});
            setProducts(productsWithUniqueKeys);
            setMeta(response.meta || null);
            setError(null);
          } else {
            throw new Error(response.message || 'Failed to fetch stock data');
          }
        } catch (err) {
          console.error('Fetch error:', err);
          setError(err.message || 'Failed to load stock data');
          toast.current.show({ severity: 'error', summary: 'Error', detail: err.message || 'Failed to load stock data', life: 3000 });
        } finally {
          setIsLoading(false);
        }
      }, 300),
    [token, getStockReportsData]
  );

  // Fetch data
  const fetchStockReportData = useCallback(
    (bypassDebounce = false) => {
      const params = {
        warehouse_id: userData.warehouse_id,
        search_term: filters.search_term || undefined,
        status: filters.status !== 'all' ? filters.status : undefined,
        category: filters.category !== 'all' ? filters.category : undefined,
        stock_level: filters.stock_level !== 'all' ? filters.stock_level : undefined,
        start_date: filters.date_range?.[0]?.format('YYYY-MM-DD'),
        end_date: filters.date_range?.[1]?.format('YYYY-MM-DD'),
        sortField,
        sortOrder: sortOrder === 1 ? 'asc' : sortOrder === -1 ? 'desc' : undefined,
      };
      if (bypassDebounce) {
        debouncedFetchStockReportData.cancel();
        debouncedFetchStockReportData.flush();
        debouncedFetchStockReportData(params, setProducts, setMeta, setError, setIsLoading);
      } else {
        debouncedFetchStockReportData(params, setProducts, setMeta, setError, setIsLoading);
      }
    },
    [filters, sortField, sortOrder, userData.warehouse_id, debouncedFetchStockReportData]
  );

  // Initial fetch and filter changes
  useEffect(() => {
    fetchStockReportData();
    return () => debouncedFetchStockReportData.cancel();
  }, []);

  // Filter handlers
  const handleClearFilters = useCallback(() => {
    setFilters({
      search_term: '',
      status: 'all',
      category: 'all',
      stock_level: 'all',
      date_range: null,
    });
    setSelectedRows([]);
    toast.current.show({ severity: 'info', summary: 'Filters Cleared', detail: 'All filters have been reset', life: 3000 });
  }, []);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  // Sort handler
  const onSort = useCallback((event) => {
    setSortField(event.sortField);
    setSortOrder(event.sortOrder);
  }, []);

const handleExportExcel = useCallback(async () => {
  setExportLoading(true);
  try {
    if (!products.length) {
      toast.current.show({ 
        severity: 'warn', 
        summary: 'Warning', 
        detail: 'No data to export', 
        life: 3000 
      });
      return;
    }

    // Create workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Stock Report');

    // Header Section
    worksheet.addRow(['DD Home']).font = { size: 16, bold: true };
    worksheet.addRow(['Address: Nº25, St.5, Dangkor, Phnom Penh, Cambodia']);
    worksheet.addRow(['Phone: 081 90 50 50']);
    worksheet.addRow([`View By Outlet: ${userData.warehouse_name || 'All Warehouses'}`]);
    worksheet.addRow(['View By Location: All']);
    worksheet.addRow(['View As: Detail']);
    worksheet.addRow([`Generated: ${dayjs().format('YYYY-MM-DD HH:mm:ss')}`]);
    worksheet.addRow([]); // Spacer

    // Column Headers
    const headers = [
      'No.',
      'Product Code',
      'Barcode',
      'Product Name',
      'Category',
      'UOM',
      'Stock',
    ];

    const headerRow = worksheet.addRow(headers);
    headerRow.eachCell((cell) => {
      cell.font = { bold: true };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFD3D3D3' },
      };
      cell.border = {
        top: { style: 'thin' },
        bottom: { style: 'thin' },
        left: { style: 'thin' },
        right: { style: 'thin' },
      };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
    });

    // Data Rows
    products.forEach((product, index) => {
      const row = worksheet.addRow([
        index + 1,
        product.code || 'N/A',
        product.barcode || 'N/A',
        product.name || 'N/A',
        product.category || 'N/A',
        product.unit || 'N/A',
        product.stock || 0,
      ]);

      // Format numeric cells
      row.eachCell((cell, colNumber) => {
        if (colNumber === 7) { // Stock column (1-based index)
          cell.numFmt = '#,##0';
          cell.alignment = { horizontal: 'right' };
        } else if (colNumber === 1) { // Row number column
          cell.alignment = { horizontal: 'center' };
        } else {
          cell.alignment = { horizontal: 'left' };
        }
        
        // Enable text wrapping for product name
        if (colNumber === 4) {
          cell.alignment = { ...cell.alignment, wrapText: true };
        }
      });
    });

    // Calculate totals
    const totalStock = products.reduce((sum, p) => sum + (p.stock || 0), 0);

    // Add totals row
    const totalRow = worksheet.addRow([
      '', '', '', '', '', '', totalStock
    ]);

    // Style the totals row cells (UOM and Stock columns only)
    const uomCell = totalRow.getCell(6); // UOM column (1-based index)
    const stockCell = totalRow.getCell(7); // Stock column

    // Apply top border to both cells
    const topBorderStyle = { style: 'medium', color: { argb: 'FF000000' } };
    
    uomCell.border = {
      top: topBorderStyle
    };
    
    stockCell.border = {
      top: topBorderStyle
    };
    stockCell.font = { bold: true };
    stockCell.numFmt = '#,##0';
    stockCell.alignment = { horizontal: 'right' };

    // Set column widths
    worksheet.columns = [
      { key: 'no', width: 5 },          // No.
      { key: 'code', width: 12 },       // Product Code
      { key: 'barcode', width: 15 },    // Barcode
      { key: 'name', width: 40 },       // Product Name
      { key: 'category', width: 20 },   // Category
      { key: 'uom', width: 8 },         // UOM
      { key: 'stock', width: 12 },      // Current Stock
    ];

    // Set row heights for data rows
    worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      if (rowNumber > 9) { // Skip header rows
        row.height = 20;
      }
    });

    // Generate and download the file
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `stock-report-${dayjs().format('YYYY-MM-DD-HHmm')}.xlsx`);
    
    toast.current.show({ 
      severity: 'success', 
      summary: 'Success', 
      detail: 'Stock report exported successfully', 
      life: 3000 
    });
  } catch (error) {
    console.error('Export error:', error);
    toast.current.show({ 
      severity: 'error', 
      summary: 'Error', 
      detail: 'Failed to export stock report', 
      life: 3000 
    });
  } finally {
    setExportLoading(false);
  }
}, [products, userData]);

  const handleExportPDF = useCallback(async () => {
    setExportLoading(true);
    try {
      if (!products.length) {
        toast.current.show({ severity: 'warn', summary: 'Warning', detail: 'No data to export', life: 3000 });
        return;
      }
      if (products.length > 1000) {
        toast.current.show({
          severity: 'warn',
          summary: 'Warning',
          detail: 'Large dataset may result in truncated PDF. Consider Excel export.',
          life: 5000,
        });
      }

      const header = document.createElement('div');
      header.style.padding = '10px';
      header.innerHTML = `
        <h2>Stock Report</h2>
        <p>Warehouse: ${userData.warehouse_name || 'N/A'} (ID: ${userData.warehouse_id || 'N/A'})</p>
        <p>Generated: ${dayjs().format('YYYY-MM-DD HH:mm:ss')}</p>
        <p>Filters: Search="${filters.search_term || 'None'}", Status=${filters.status}, Category=${filters.category}, Stock Level=${filters.stock_level}, Date Range=${filters.date_range ? filters.date_range.map(d => d.format('YYYY-MM-DD')).join(' to ') : 'None'}</p>
      `;
      tableRef.current.prepend(header);

      await generatePDF(tableRef, {
        filename: `stock-report-${dayjs().format('YYYYMMDD-HHmmss')}.pdf`,
        page: { format: 'A4', margin: { top: 20, bottom: 20, left: 20, right: 20 } },
        resolution: 2,
      });
      toast.current.show({ severity: 'success', summary: 'Success', detail: 'PDF exported successfully', life: 3000 });
    } catch (error) {
      console.error('Export error:', error);
      toast.current.show({ severity: 'error', summary: 'Error', detail: 'Failed to export PDF', life: 3000 });
    } finally {
      if (tableRef.current.firstChild.tagName === 'DIV') {
        tableRef.current.removeChild(tableRef.current.firstChild);
      }
      setExportLoading(false);
    }
  }, [products, userData, filters]);

  const handleExportImage = useCallback(async () => {
    setExportLoading(true);
    try {
      if (!products.length) {
        toast.current.show({ severity: 'warn', summary: 'Warning', detail: 'No data to export', life: 3000 });
        return;
      }
      if (products.length > 100) {
        toast.current.show({
          severity: 'warn',
          summary: 'Warning',
          detail: 'Exporting visible table portion only due to large dataset.',
          life: 5000,
        });
      }

      if (tableRef.current) {
        const canvas = await html2canvas(tableRef.current, { scale: 3, useCORS: true });
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = `stock-report-${dayjs().format('YYYYMMDD-HHmmss')}.png`;
        link.click();
        toast.current.show({ severity: 'success', summary: 'Success', detail: 'Image exported successfully', life: 3000 });
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.current.show({ severity: 'error', summary: 'Error', detail: 'Failed to export image', life: 3000 });
    } finally {
      setExportLoading(false);
    }
  }, [products]);

  // Column definitions with animations
  const columns = useMemo(
    () => [
        {
        field: 'code',
        header: 'Code',
        sortable: true,
        body: (rowData) => (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
          >
            <Text>{rowData.code}</Text>
          </motion.div>
        ),
        style: { width: '20%' },
      },
      {
      field: 'product_name',
      header: 'Name',
      sortable: true,
      style: { width: '20%', minWidth: '150px' },
      body: (rowData) => (
        <Text strong style={{ 
          fontFamily: "'Noto Sans Khmer', 'Khmer OS', Arial, sans-serif",
          display: 'block',
          textAlign: 'left'
        }}>
          {rowData.name}
        </Text>
      ),
    },
    
      {
        field: 'category',
        header: 'Category',
        sortable: true,
        body: (rowData) => (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            style={{ display: 'flex', justifyContent: 'center' }}
          >
            <Text>{rowData.category}</Text>
          </motion.div>
        ),
        style: { width: '15%' },
      },
      {
        field: 'category',
        header: 'Unit',
        sortable: true,
        body: (rowData) => (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            style={{ display: 'flex', justifyContent: 'center' }}
          >
            <Text>{rowData.unit}</Text>
          </motion.div>
        ),
        style: { width: '15%' },
      },
      {
        field: 'stock',
        header: 'Stock',
        sortable: true,
        body: (rowData) => {
          const status = rowData.stock === 0 ? 'out' : rowData.stock <= (rowData.alert_qty || 0) ? 'low' : 'normal';
          const color = status === 'out' ? '#f5222d' : status === 'low' ? '#faad14' : '#52c41a';
          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
            >
              <div style={{ backgroundColor: `${color}20`, color, padding: '2px 8px', borderRadius: 8, fontWeight: 600, fontSize: 13 }}>
                {`${rowData.stock || 0} ${rowData.units || ''}`}
              </div>
              
            </motion.div>
        )},
        style: { width: '20%' },
      },
      {
        field: 'value',
        header: 'Stock Alert',
        body: (rowData) => (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
          >
            <div style={{ fontSize: 12, color: '#8c8c8c' }}>
                Alert at: <strong style={{ color: '#262626' }}>{rowData.alertQty || 0}</strong>
              </div>
          </motion.div>
        ),
        style: { width: '20%' },
      },
    ],
    []
  );

  // Footer component
  const CustomFooter = useMemo(
    () =>
      meta ? (
        <div className="table-footer d-flex justify-content-between">
          <div>Total Products: {meta.total_products || 0}</div>
          <div>Total Value: ${(meta.total_value || 0).toFixed(2)}</div>
          <div>Total Records: {meta.total_records || 0}</div>
          <div className="d-flex gap-2">
            <Button
              icon={<FileExcelOutlined />}
              onClick={handleExportExcel}
              loading={exportLoading.excel}
              disabled={isLoading || exportLoading.pdf || exportLoading.image}
            >
              Excel
            </Button>
            <Button
              icon={<FilePdfOutlined />}
              onClick={handleExportPDF}
              loading={exportLoading.pdf}
              disabled={isLoading || exportLoading.excel || exportLoading.image}
            >
              PDF
            </Button>
            <Button
              icon={<FileImageOutlined />}
              onClick={handleExportImage}
              loading={exportLoading.image}
              disabled={isLoading || exportLoading.excel || exportLoading.pdf}
            >
              Image
            </Button>
          </div>
        </div>
      ) : null,
    [meta, isLoading, exportLoading, handleExportExcel, handleExportPDF, handleExportImage]
  );

  // Error UI
  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="stock-report-container"
      >
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          action={
            <Button
              type="primary"
              onClick={() => {
                setError(null);
                fetchStockReportData(true);
              }}
            >
              Retry
            </Button>
          }
        />
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="stock-report-container"
    >
      <Toast ref={toast} position="top-center" />
        <Spin spinning={isLoading} tip="Loading stock data...">
        {/* Header Section */}
        <Card className="header-card">
          <Row justify="space-between" align="middle">
            <Col>
              <Title level={3} className="report-title">
                Stock Report
              </Title>
              <Text type="secondary">Current inventory status and valuation</Text>
              <div className="warehouse-info">
                <Text strong>Warehouse:</Text> <Text>{userData.warehouse_name || 'N/A'}</Text>
              </div>
            </Col>
            <Col>
              <StockOutlined className="header-icon" />
            </Col>
          </Row>
        </Card>

        {/* Filter Section */}
        <Card className="filter-card">
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} sm={12} md={6}>
              <Tooltip title="Search by product name or code">
                <Search
                  placeholder="Search products..."
                  prefix={<SearchOutlined />}
                  onChange={(e) => handleFilterChange('search_term', e.target.value)}
                  value={filters.search_term}
                  allowClear
                />
              </Tooltip>
            </Col>
            {/* <Col xs={24} sm={12} md={6}>
              <Tooltip title="Filter by status">
                <Select
                  style={{ width: '100%' }}
                  placeholder="Status"
                  value={filters.status}
                  onChange={(value) => handleFilterChange('status', value)}
                  allowClear
                >
                  <Option value="all">All Statuses</Option>
                  <Option value="active">Active</Option>
                  <Option value="inactive">Inactive</Option>
                </Select>
              </Tooltip>
            </Col> */}
            <Col xs={24} sm={12} md={6}>
              <Tooltip title="Filter by category">
                <Select
                  style={{ width: '100%' }}
                  placeholder="Category"
                  value={filters.category}
                  onChange={(value) => handleFilterChange('category', value)}
                  allowClear
                  showSearch
                  optionFilterProp="children"
                >
                  {categories.map((cat) => (
                    <Option key={cat.value} value={cat.value}>
                      {cat.label}
                    </Option>
                  ))}
                </Select>
              </Tooltip>
            </Col>
        <Col xs={24} sm={12} md={6}>
          <Tooltip title="Filter by stock level">
            <Select
              style={{ width: '100%' }}
              placeholder="Stock Level"
              value={filters.stock_level}
              onChange={(value) => handleFilterChange('stock_level', value)}
              allowClear
            >
              <Option value="all">All Levels</Option>
              <Option value="normal">Normal</Option>
              <Option value="low">Low Stock</Option>
              <Option value="out">Out of Stock</Option>
              <Option value="debt">Stock Owed</Option> {/* or "Stock Debt" */}
            </Select>
          </Tooltip>
        </Col>

          </Row>
          <Row justify="start" gutter={[16, 16]} className="filter-buttons">
            <Col>
              <Button
                type="primary"
                icon={<SearchOutlined />}
                onClick={() => fetchStockReportData(true)}
                loading={isLoading}
              >
                Apply Filters
              </Button>
            </Col>
            <Col>
              <Button
                icon={<ClearOutlined />}
                onClick={handleClearFilters}
                disabled={isLoading}
              >
                Clear Filters
              </Button>
            </Col>
            <Col>
              <Button
                icon={<StockOutlined />}
                onClick={() => fetchStockReportData(true)}
                loading={isLoading}
              >
                Refresh Data
              </Button>
            </Col>
          </Row>
        </Card>

        {/* Data Table */}
        <div ref={tableRef}>
          <Card title="Stock Details"
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
          >
            <DataTable
              value={products}
              dataKey="key"
              scrollable
              scrollHeight="600px"
              virtualScrollerOptions={{ itemSize: 46 }}
              loading={isLoading}
              onSort={onSort}
              sortField={sortField}
              sortOrder={sortOrder}
              className="stock-data-table"
              rowClassName={(rowData) =>
                `stock-row ${rowData.stock === 0 ? 'out-of-stock' : rowData.stock <= (rowData.alert_qty || 0) ? 'low-stock' : ''}`
              }
              emptyMessage="No stock data found. Apply filters or refresh to load data."
              footer={CustomFooter}
            >
              {columns.map((column) => (
                <Column
                  key={column.field}
                  field={column.field}
                  header={column.header}
                  body={column.body}
                  style={column.style}
                  sortable
                />
              ))}
            </DataTable>
          </Card>
        </div>
      </Spin>
    </motion.div>
  );
});

export default StockReport;