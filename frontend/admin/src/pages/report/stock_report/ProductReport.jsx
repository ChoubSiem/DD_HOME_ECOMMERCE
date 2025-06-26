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
  ClearOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ShoppingOutlined,
} from '@ant-design/icons';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Toast } from 'primereact/toast';
import Cookies from 'js-cookie';
import { motion } from 'framer-motion';
import { v4 as uuidv4 } from 'uuid';
import debounce from 'lodash.debounce';
import dayjs from 'dayjs';
import * as XLSX from 'xlsx';
import generatePDF from 'react-to-pdf';
import html2canvas from 'html2canvas';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
// import './ProductReport.css';
import { useReport } from '../../../hooks/UseReport';

const { Title, Text } = Typography;
const { Search } = Input;
const { RangePicker } = DatePicker;
const { Option } = Select;

const ProductReport = React.memo(() => {
  const [filters, setFilters] = useState({
    search_term: '',
    status: 'all',
    category: 'all',
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
  const { getProductReportsData } = useReport();

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
  const debouncedFetchProductReportData = useMemo(
    () =>
      debounce(async (params, setProducts, setMeta, setError, setIsLoading) => {
        try {
          setIsLoading(true);
          setError(null);
          const response = await getProductReportsData(params, token);
          if (response.success) {
            const keySet = new Set();
            const productsWithUniqueKeys = (response.products || []).map((product) => {
              const originalKey = product.id;
              const uniqueKey = originalKey && !keySet.has(originalKey) ? originalKey : uuidv4();
              keySet.add(uniqueKey);
              return { ...product, key: uniqueKey };
            });

            setProducts(productsWithUniqueKeys);
            setMeta(response.meta || null);
            setError(null);
          } else {
            throw new Error(response.message || 'Failed to fetch product data');
          }
        } catch (err) {
          console.error('Fetch error:', err);
          setError(err.message || 'Failed to load product data');
          toast.current.show({ severity: 'error', summary: 'Error', detail: err.message || 'Failed to load product data', life: 3000 });
        } finally {
          setIsLoading(false);
        }
      }, 300),
    [token, getProductReportsData]
  );

  // Fetch data
  const fetchProductReportData = useCallback(
    (bypassDebounce = false) => {
      const params = {
        warehouse_id: userData.warehouse_id,
        search_term: filters.search_term || undefined,
        status: filters.status !== 'all' ? filters.status : undefined,
        category: filters.category !== 'all' ? filters.category : undefined,
        start_date: filters.date_range?.[0]?.format('YYYY-MM-DD'),
        end_date: filters.date_range?.[1]?.format('YYYY-MM-DD'),
        sortField,
        sortOrder: sortOrder === 1 ? 'asc' : sortOrder === -1 ? 'desc' : undefined,
      };
      if (bypassDebounce) {
        debouncedFetchProductReportData.cancel();
        debouncedFetchProductReportData.flush();
        debouncedFetchProductReportData(params, setProducts, setMeta, setError, setIsLoading);
      } else {
        debouncedFetchProductReportData(params, setProducts, setMeta, setError, setIsLoading);
      }
    },
    [filters, sortField, sortOrder, userData.warehouse_id, debouncedFetchProductReportData]
  );

  // Initial fetch and filter changes
  useEffect(() => {
    fetchProductReportData();
    return () => debouncedFetchProductReportData.cancel();
  }, []);

  // Filter handlers
  const handleClearFilters = useCallback(() => {
    setFilters({
      search_term: '',
      status: 'all',
      category: 'all',
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

  // Format currency
  const formatCurrency = useCallback((value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value || 0);
  }, []);

const handleExportExcel = useCallback(async () => {
  setExportLoading((prev) => ({ ...prev, excel: true }));
  try {
    if (!products.length) {
      toast.current.show({ severity: 'warn', summary: 'Warning', detail: 'No data to export', life: 3000 });
      return;
    }

    // Create headers based on your DataTable columns
    const headers = [
      { header: "Code", key: "code", width: 10 },
      { header: "Name", key: "name", width: 20 },
      { header: "Category", key: "category", width: 10 },
      { header: "Unit", key: "unit", width: 10 },
      { header: "Cost", key: "cost", width: 10 },
      { header: "Price", key: "price", width: 10 },
      { header: "Retail Price", key: "retail_price", width: 10 },
      { header: "Dealer Price", key: "dealer_price", width: 10 },
      { header: "Depot Price", key: "depot_price", width: 10 },
    ];

    // Prepare the data in the same order as headers
    const data = products.map(product => ({
      code: product.code || 'N/A',
      name: product.name || 'N/A',
      category: product.category || 'N/A',
      unit: product.unit || 'N/A',
      cost: formatCurrency(product.cost),
      price: formatCurrency(product.price),
      retail_price: formatCurrency(product.retail_price),
      dealer_price: formatCurrency(product.dealer_price),
      depot_price: formatCurrency(product.depot_price),
    }));

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(data);
    
    // Add headers to the worksheet
    XLSX.utils.sheet_add_aoa(worksheet, [headers.map(h => h.header)], { origin: 'A1' });

    // Set column widths
    worksheet['!cols'] = headers.map(h => ({ width: h.width }));

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Product Report');

    // Generate file
    XLSX.writeFile(workbook, `product-report-${dayjs().format('YYYY-MM-DD-HHmmss')}.xlsx`);
    
    toast.current.show({ severity: 'success', summary: 'Success', detail: 'Excel exported successfully', life: 3000 });
  } catch (error) {
    console.error('Export error:', error);
    toast.current.show({ severity: 'error', summary: 'Error', detail: 'Failed to export Excel', life: 3000 });
  } finally {
    setExportLoading(false);
  }
}, [products, formatCurrency]);

  const handleExportPDF = useCallback(async () => {
    setExportLoading((prev) => ({ ...prev, pdf: true }));
    try {
      if (!products.length) {
        toast.current.show({ severity: 'warn', summary: 'Warning', detail: 'No data to export', life: 3000 });
        return;
      }

      const header = document.createElement('div');
      header.style.padding = '10px';
      header.innerHTML = `
        <h2>Product Report</h2>
        <p>Warehouse: ${userData.warehouse_name || 'N/A'} (ID: ${userData.warehouse_id || 'N/A'})</p>
        <p>Generated: ${dayjs().format('YYYY-MM-DD HH:mm:ss')}</p>
        <p>Filters: Search="${filters.search_term || 'None'}", Status=${filters.status}, Category=${filters.category}, Date Range=${filters.date_range ? filters.date_range.map(d => d.format('YYYY-MM-DD')).join(' to ') : 'None'}</p>
      `;
      tableRef.current.prepend(header);

      await generatePDF(tableRef, {
        filename: `product-report-${dayjs().format('YYYYMMDD-HHmmss')}.pdf`,
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
    setExportLoading((prev) => ({ ...prev, image: true }));
    try {
      if (!products.length) {
        toast.current.show({ severity: 'warn', summary: 'Warning', detail: 'No data to export', life: 3000 });
        return;
      }

      if (tableRef.current) {
        const canvas = await html2canvas(tableRef.current, { scale: 3, useCORS: true });
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = `product-report-${dayjs().format('YYYYMMDD-HHmmss')}.png`;
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

  // Column definitions
  const columns = useMemo(
    () => [

      {
        field: 'code',
        header: 'Code',
        sortable: true,
        style: { width: '10%' },
        body: (rowData) => (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Text>{rowData.code}</Text>
          </motion.div>
        ),
      },
            {
        field: 'name',
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
        style: { width: '10%' },
        body: (rowData) => (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Text>{rowData.category || 'N/A'}</Text>
          </motion.div>
        ),
      },
      {
        field: 'unit',
        header: 'Unit',
        sortable: true,
        style: { width: '10%' },
        body: (rowData) => (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Text>{rowData.unit || 'N/A'}</Text>
          </motion.div>
        ),
      },
      {
        field: 'cost',
        header: 'Cost',
        sortable: true,
        style: { width: '10%' },
        body: (rowData) => (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Text type="danger">{formatCurrency(rowData.cost)}</Text>
          </motion.div>
        ),
      },
      {
        field: 'price',
        header: 'Price',
        sortable: true,
        style: { width: '10%' },
        body: (rowData) => (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Text strong>{formatCurrency(rowData.price)}</Text>
          </motion.div>
        ),
      },
      {
        field: 'retail_price',
        header: 'Retail Price',
        sortable: true,
        style: { width: '10%' },
        body: (rowData) => (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Text>{formatCurrency(rowData.retail_price)}</Text>
          </motion.div>
        ),
      },
      {
        field: 'dealer_price',
        header: 'Dealer Price',
        sortable: true,
        style: { width: '10%' },
        body: (rowData) => (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Text type="secondary">{formatCurrency(rowData.dealer_price)}</Text>
          </motion.div>
        ),
      },
      {
        field: 'depot_price',
        header: 'Depot Price',
        sortable: true,
        style: { width: '10%' },
        body: (rowData) => (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Text type="success">{formatCurrency(rowData.depot_price)}</Text>
          </motion.div>
        ),
      },
    //   {
    //     field: 'status',
    //     header: 'Status',
    //     sortable: true,
    //     style: { width: '10%' },
    //     body: (rowData) => (
    //       <motion.div
    //         initial={{ opacity: 0 }}
    //         animate={{ opacity: 1 }}
    //         transition={{ duration: 0.3 }}
    //       >
    //         <Tag color={rowData.status === 'active' ? 'green' : 'red'}>
    //           {rowData.status?.toUpperCase() || 'N/A'}
    //         </Tag>
    //       </motion.div>
    //     ),
    //   },
    ],
    [formatCurrency]
  );

  // Footer component
  const CustomFooter = useMemo(
    () =>
      meta ? (
        <div className="table-footer d-flex justify-content-between">
          <div>Total Products: {meta.total_products || 0}</div>
          <div>Total Value: {formatCurrency(meta.total_value || 0)}</div>
          <div>Total Records: {meta.total_records || 0}</div>
          <div className="d-flex gap-2">
            <Button
            icon={<FileExcelOutlined />}
            onClick={handleExportExcel}
            loading={exportLoading.excel}  // Use excel state
            disabled={isLoading || exportLoading.pdf || exportLoading.image}
            style={{ backgroundColor: '#52c41a', borderColor: '#52c41a', color: 'white' }}
            >
            Export Excel
            </Button>
            <Button
            icon={<FilePdfOutlined />}
            onClick={handleExportPDF}
            loading={exportLoading.pdf}  // Use pdf state
            disabled={isLoading || exportLoading.excel || exportLoading.image}
            style={{ backgroundColor: '#f5222d', borderColor: '#f5222d', color: 'white' }}
            >
            Export PDF
            </Button>
            <Button
            icon={<FileImageOutlined />}
            onClick={handleExportImage}
            loading={exportLoading.image}  // Use image state
            disabled={isLoading || exportLoading.excel || exportLoading.pdf}
            style={{ backgroundColor: '#1890ff', borderColor: '#1890ff', color: 'white' }}
            >
            Export Image
            </Button>
          </div>
        </div>
      ) : null,
    [meta, isLoading, exportLoading, handleExportExcel, handleExportPDF, handleExportImage, formatCurrency]
  );

  // Error UI
  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="product-report-container"
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
                fetchProductReportData(true);
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
      className="product-report-container"
    >
      <Toast ref={toast} position="top-center" />
        <Spin spinning={isLoading} tip="Loading product data...">
        {/* Header Section */}
        <Card className="header-card">
          <Row justify="space-between" align="middle">
            <Col>
              <Title level={3} className="report-title">
                Product Price Report
              </Title>
              <Text type="secondary">Product pricing information</Text>
              <div className="warehouse-info">
                <Text strong>Warehouse:</Text> <Text>{userData.warehouse_name || 'N/A'}</Text>
              </div>
            </Col>
            <Col>
              <ShoppingOutlined className="header-icon" />
            </Col>
          </Row>
        </Card>

        {/* Filter Section */}
        <Card className="filter-card">
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} sm={12} md={8}>
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
            <Col xs={24} sm={12} md={8}>
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
            </Col>
            <Col xs={24} sm={12} md={8}>
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
          </Row>
          <Row justify="start" gutter={[16, 16]} className="filter-buttons">
            <Col>
              <Button
                type="primary"
                icon={<SearchOutlined />}
                onClick={() => fetchProductReportData(true)}
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
                icon={<ShoppingOutlined />}
                onClick={() => fetchProductReportData(true)}
                loading={isLoading}
              >
                Refresh Data
              </Button>
            </Col>
          </Row>
        </Card>

        {/* Data Table */}
        <div ref={tableRef}>
          <Card title="Product Details"
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
              className="product-data-table"
              emptyMessage="No product data found. Apply filters or refresh to load data."
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

export default ProductReport;