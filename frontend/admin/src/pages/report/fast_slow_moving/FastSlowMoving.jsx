import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Card, Input, Button, Select, Space, DatePicker, Row, Col, Statistic, Progress, Spin, message, Typography,} from 'antd';
import { SearchOutlined, FilterOutlined, FileExcelOutlined, FilePdfOutlined, FileImageOutlined, ShoppingCartOutlined, ClearOutlined,
} from '@ant-design/icons';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import Cookies from 'js-cookie';
import debounce from 'lodash.debounce';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import { useReport } from '../../../hooks/UseReport';
import { useUser } from '../../../hooks/UserUser';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import './FastSlow.css';
import  {useProductTerm}  from '../../../hooks/UserProductTerm';

dayjs.extend(isBetween);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { Text, Title } = Typography;

const SalesReports = () => {
  // Filter states
  const [appliedFilters, setAppliedFilters] = useState({
    searchTerm: '',
    dateRange: null,
    category_id: 'all',
    groupBy: ['product'],
    saleType: 'all',
    limit: 'all',
    sort_by: 'qty_desc'
  });

  const [pendingFilters, setPendingFilters] = useState({
    searchTerm: '',
    dateRange: null,
    category_id: 'all',
    groupBy: ['product'],
    saleType: 'all',
    limit: 'all',
    sort_by: 'qty_desc'
  });

  const [selectedRows, setSelectedRows] = useState([]);
  const [exportLoading, setExportLoading] = useState(false);
  const [sales, setSales] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const tableRef = useRef();

  const { getFastandSlowMoving } = useReport();
  const { handleCategories } = useProductTerm();
  const userData = useMemo(() => JSON.parse(Cookies.get('user') || '{}'), []);
  const token = localStorage.getItem('token');
  const [categories, setCategories] = useState([]);

  const fetchFastSlowReport = async () => {
    try {
      setIsLoading(true);

      const filters = {
        warehouse_id: userData.warehouse_id,
        start_date: appliedFilters.dateRange?.[0]?.format('YYYY-MM-DD HH:mm:ss'),
        end_date: appliedFilters.dateRange?.[1]?.format('YYYY-MM-DD HH:mm:ss'),
        category_id: appliedFilters.category_id !== 'all' ? appliedFilters.category_id : undefined,
        saleType: appliedFilters.saleType !== 'all' ? appliedFilters.saleType : undefined,
        limit: appliedFilters.limit !== 'all' ? appliedFilters.limit : undefined,
        sort_by: appliedFilters.sort_by,
      };

      const cleanedFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== undefined)
      );

      const response = await getFastandSlowMoving(cleanedFilters, token);

      if (response.success) {
        setSales(response.FastSlow || []);
        setError(null);
      }
    } catch (err) {
      console.error('Error fetching fast & slow report:', err);
      message.error('Failed to load fast & slow moving report');
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    let result = await handleCategories(token);
    if (result.success) {
      setCategories(result.categories);
    }
  };

  useEffect(() => {
    fetchFastSlowReport();
    fetchCategories();
  }, [appliedFilters]);

  const debouncedSetPendingSearch = useMemo(
    () => debounce((value) => setPendingFilters(prev => ({ ...prev, searchTerm: value })), 500),
    []
  );

  useEffect(() => {
    return () => debouncedSetPendingSearch.cancel();
  }, [debouncedSetPendingSearch]);

  const columns = useMemo(() => {
    const hasGrouping = appliedFilters.groupBy?.length > 0;
    const hasProductGroup = appliedFilters.groupBy?.includes('product');
    const hasCategoryGroup = appliedFilters.groupBy?.includes('category');
    const baseColumns = [];
    if (hasProductGroup) {
      baseColumns.push({
        field: 'product_code',
        header: 'Code',
        sortable: true,
        style: { minWidth: '100px' },
        body: (rowData) => (
          <Text strong style={{ fontFamily: "'Noto Sans Khmer', 'Khmer OS', Arial, sans-serif" }}>
            {rowData.product_code || 'N/A'}
          </Text>
        ),
      });
      baseColumns.push({
        field: 'product_name',
        header: 'Product',
        sortable: true,
        style: { minWidth: '200px' },
        body: (rowData) => (
          <Text strong style={{ fontFamily: "'Noto Sans Khmer', 'Khmer OS', Arial, sans-serif" }}>
            {rowData.product_name || 'N/A'}
          </Text>
        ),
      });
    }

    if (hasCategoryGroup) {
      baseColumns.push({
        field: 'product_category',
        header: 'Category',
        sortable: true,
        style: { minWidth: '150px' },
        body: (rowData) => <Text>{rowData.product_category || 'N/A'}</Text>,
      });
    }

    baseColumns.push(
      // {
      //   field: 'opening_stock',
      //   header: 'Opening Stock',
      //   sortable: true,
      //   style: { minWidth: '80px', textAlign: 'right' },
      //   body: (rowData) => <Text>{Number(rowData.TotalQty || 0).toLocaleString()}</Text>,
      // },
      // {
      //   field: 'closing_stock',
      //   header: 'Closing Stock',
      //   sortable: true,
      //   style: { minWidth: '80px', textAlign: 'right' },
      //   body: (rowData) => <Text>{Number(rowData.TotalQty || 0).toLocaleString()}</Text>,
      // },
      {
        field: 'TotalQty',
        header: 'Total Sale Qty',
        sortable: true,
        style: { minWidth: '80px', textAlign: 'right' },
        body: (rowData) => <Text>{Number(rowData.TotalQty || 0).toLocaleString()}</Text>,
      },
      {
        field: 'TotalSaleValue',
        header: 'Total Sale Value',
        sortable: true,
        style: { minWidth: '80px', textAlign: 'right' },
        body: (rowData) => <Text>${Number(rowData.TotalSaleValue || 0).toLocaleString()}</Text>,
      },
      // {
      //   field: 'turnover_rate',
      //   header: 'Turnover Rate',
      //   sortable: true,
      //   style: { minWidth: '40px', textAlign: 'right' },
      //   body: (rowData) => <Text>{Number(rowData.TotalQty || 0).toLocaleString()}</Text>,
      // },
      {
        field: 'movement_status',
        header: 'Movement Status',
        sortable: true,
        style: { minWidth: '40px', textAlign: 'right' },
        body: (rowData) => <Text>{(rowData.Speed)}</Text>,
      }
    );

    return baseColumns;
  }, [appliedFilters.groupBy, sales]);

  // Calculate totals for footer
  const calculateTotals = useCallback(() => {
    return sales.reduce(
      (acc, item) => {
        acc.totalQty += Number(item.TotalQty) || 0;
        return acc;
      },
      {
        totalQty: 0,
      }
    );
  }, [sales]);

  const totals = calculateTotals();

  const handleExportExcel = useCallback(async () => {
    setExportLoading(true);
    try {
      if (!sales.length) {
        message.warning('No data available to export');
        return;
      }

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Fast & Slow Moving');
      worksheet.addRow(['Fast & Slow Moving Product Report']).font = { size: 16, bold: true };
      worksheet.addRow([
        `Date Range: ${appliedFilters.dateRange?.[0]
          ? dayjs(appliedFilters.dateRange[0]).format('YYYY-MM-DD')
          : 'All Dates'
        } to ${appliedFilters.dateRange?.[1]
          ? dayjs(appliedFilters.dateRange[1]).format('YYYY-MM-DD')
          : 'All Dates'
        }`
      ]);
      worksheet.addRow([`Warehouse: ${userData.warehouse_name || 'All'}`]);
      worksheet.addRow([`Category: ${appliedFilters.category_id === 'all' ? 'All Categories' : categories.find(c => c.id === appliedFilters.category_id)?.name || ''}`]);
      worksheet.addRow([`Speed: ${appliedFilters.saleType === 'all' ? 'All' : appliedFilters.saleType}`]);
      worksheet.addRow([`Top: ${appliedFilters.limit === 'all' ? 'All' : appliedFilters.limit}`]);
      worksheet.addRow([]);

      const headers = [
      'Product Code',
      'Product Name',
      'Category',
      'Quantity Sold',
      'Total Sale',
      'Speed'
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
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      });

      // 🟡 Table Rows
      sales.forEach((item, index) => {
        const row = worksheet.addRow([
          item.product_code || 'N/A',
          item.product_name || 'N/A',
          item.product_category || 'N/A',
          Number(item.TotalQty || 0),
          Number(item.TotalSaleValue || 0),
          item.Speed || ''
        ]);

        row.getCell(5).numFmt = '#,##0.00';
        row.getCell(6).numFmt = '#,##0.00';
        row.getCell(5).alignment = { horizontal: 'right' };
        row.getCell(6).alignment = { horizontal: 'right' };
      });

      // 🟡 Totals Row
      const totalQty = sales.reduce((acc, cur) => acc + Number(cur.TotalQty || 0), 0);
      const totalValue = sales.reduce((acc, cur) => acc + Number(cur.TotalSaleValue || 0), 0);

      const totalRow = worksheet.addRow([
        '',
        'TOTAL',
        '',
        totalQty,
        totalValue,
        ''
      ]);
      totalRow.eachCell((cell, colNumber) => {
        cell.font = { bold: true };
        if (colNumber === 5) { // 5 = Total Sale
          cell.numFmt = '"$"#,##0.00'; // Formats as $ currency
          cell.alignment = { horizontal: 'right' };
        }
        if (colNumber === 6) cell.numFmt = '#,##0.00';
      });

      // 🟡 Auto column width
      worksheet.columns.forEach((column) => {
        let maxLength = 0;
        column.eachCell({ includeEmpty: true }, (cell) => {
          const length = cell.value ? cell.value.toString().length : 0;
          if (length > maxLength) {
            maxLength = length;
          }
        });
        column.width = Math.min(Math.max(maxLength + 2, 10), 30);
      });

      worksheet.views = [{ state: 'frozen', ySplit: 8 }];

      // 🟡 Download File
      const buffer = await workbook.xlsx.writeBuffer();
      saveAs(new Blob([buffer]), `fast-slow-moving-${dayjs().format('YYYY-MM-DD-HHmm')}.xlsx`);
      message.success('Excel file exported successfully');
    } catch (error) {
      console.error('Export error:', error);
      message.error('Failed to export Excel file');
    } finally {
      setExportLoading(false);
    }
  }, [sales, appliedFilters, userData.warehouse_name, categories]);

  const handleApplyFilters = useCallback(() => {
    setAppliedFilters(pendingFilters);
  }, [pendingFilters]);

  const handleClearFilters = useCallback(() => {
    const clearedFilters = {
      searchTerm: '',
      status: 'all',
      dateRange: null,
      customer: 'all',
      reportType: 'all',
      saleType: 'all',
      groupBy: ['product']
    };
    setPendingFilters(clearedFilters);
    setAppliedFilters(clearedFilters);
    setSelectedRows([]);
    message.info('Filters cleared');
  }, []);

  if (error) {
    return (
      <div style={{ padding: '24px', maxWidth: 800, margin: '0 auto' }}>
        <Card>
          <Text type="danger">Error: {error.message || 'Failed to load sales data'}</Text>
          <Button
            type="primary"
            onClick={fetchSalesReportData}
            style={{ marginLeft: 16 }}
          >
            Retry
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <Spin spinning={isLoading || exportLoading} tip={exportLoading ? 'Exporting...' : 'Loading data...'} size="large">
      <div>
        {/* Header Section */}
        <Card style={{ marginBottom: 24, background: '#f6ffed' }} hoverable>
          <Row align="middle" justify="space-between">
            <Col>
              <Title level={3} style={{ margin: 0, color: '#389e0d' }}>
                Fast and Slow Moving Product Reports
              </Title>
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

        <Card style={{ marginBottom: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }} hoverable>
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} sm={12} md={6}>
              <Search
                placeholder="Search Product by name or code"
                prefix={<SearchOutlined style={{ color: '#52c41a' }} />}
                onChange={(e) => debouncedSetPendingSearch(e.target.value)}
                value={pendingFilters.searchTerm}
                allowClear
                size="large"
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <RangePicker
                style={{ width: '100%' }}
                placeholder={['Start Date', 'End Date']}
                value={pendingFilters.dateRange}
                onChange={(dates) => setPendingFilters(prev => ({ ...prev, dateRange: dates }))}
                size="large"
                showTime={{
                  format: 'HH:mm',
                  defaultValue: [
                    dayjs('00:00:00', 'HH:mm:ss'), // ⏰ Start time defaults to 00:00
                    dayjs('23:59:59', 'HH:mm:ss')  // ⏰ End time defaults to 23:59
                  ]
                }}
                format="YYYY-MM-DD HH:mm"
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Select
                mode="multiple"
                style={{ width: '100%' }}
                placeholder="Group by"
                value={pendingFilters.groupBy}
                onChange={(value) => setPendingFilters(prev => ({ ...prev, groupBy: value }))}
                allowClear
                maxTagCount="responsive"
                size="large"
              >
                <Option value="product">Product</Option>
                <Option value="category">Category</Option>
              </Select>
            </Col>

            <Col xs={24} sm={12} md={6}>
              <Select
                style={{ width: '100%' }}
                placeholder="Filter by Category"
                value={pendingFilters.category_id}
                onChange={(value) => setPendingFilters(prev => ({ ...prev, category_id: value }))}
                allowClear
                size="large"
              >
                <Option value="all">All Categories</Option>
                {(categories || []).map((cat) => (
                  <Option key={cat.id} value={cat.id}>
                    {cat.name}
                  </Option>
                ))}
              </Select>
            </Col>

            <Col xs={24} sm={12} md={6}>
              <Select
                style={{ width: '100%' }}
                placeholder="Filter by Movement Status"
                value={pendingFilters.saleType}
                onChange={(value) => setPendingFilters(prev => ({ ...prev, saleType: value }))}
                allowClear
                size="large"
              >
                <Option value="all">All Speed</Option>
                <Option value="Fast">Fast</Option>
                <Option value="Normal">Normal</Option>
                <Option value="Slow">Slow</Option>
              </Select>
            </Col>

            <Col xs={24} sm={12} md={6}>
              <Select
                style={{ width: '100%' }}
                placeholder="Sort by"
                value={pendingFilters.sort_by}
                onChange={(value) => setPendingFilters(prev => ({ ...prev, sort_by: value }))}
                allowClear
                size="large"
              >
                <Option value="qty_desc">Most Sold (Quantity)</Option>
                <Option value="qty_asc">Least Sold (Quantity)</Option>
                <Option value="value_desc">Most Sale Value</Option>
                <Option value="value_asc">Least Sale Value</Option>
              </Select>
            </Col>
            
            <Col xs={24} sm={12} md={6}>
              <Select
                style={{ width: '100%' }}
                placeholder="Filter by Top Sale Type"
                value={pendingFilters.limit}
                onChange={(value) => setPendingFilters(prev => ({ ...prev, limit: value }))}
                allowClear
                size="large"
              >
                <Option value="all">All Product</Option>
                <Option value="20">Top 20 Product</Option>
                <Option value="30">Top 30 Product</Option>
                <Option value="50">Top 50 Product</Option>
              </Select>
            </Col>
            
        </Row>

          <Row style={{ marginTop: '20px', gap: '10px' }}>
            <Col xs={24} sm={12} md={3}>
              <Button
                type="primary"
                icon={<SearchOutlined />}
                onClick={handleApplyFilters}
                size="large"
                style={{ width: '100%', backgroundColor: '#52c41a', borderColor: '#52c41a' }}
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
                style={{ width: '100%' }}
              >
                Clear
              </Button>
            </Col>
          </Row>
        </Card>

        <div ref={tableRef}>
          <Card
            title={<Text strong style={{ fontSize: 18 }}>Product Report Details</Text>}
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
              </Space>
            }
            style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
          >
            <DataTable
              value={sales}
              dataKey="id"
              scrollable
              scrollHeight="600px"
              sortMode="multiple"
              // footer={CustomFooter}
              tableStyle={{ width: '100%' }}
              className="p-datatable-striped p-datatable-gridlines"
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

export default SalesReports;