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
  Table,
  Modal,
  Form,
  InputNumber,
  Divider,
} from 'antd';
import {
  SearchOutlined,
  FilterOutlined,
  FileExcelOutlined,
  FilePdfOutlined,
  FileImageOutlined,
  ShoppingCartOutlined,
  ClearOutlined,
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  RollbackOutlined,
} from '@ant-design/icons';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import Cookies from 'js-cookie';
import generatePDF from 'react-to-pdf';
import html2canvas from 'html2canvas';
import debounce from 'lodash.debounce';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import { DataTable } from 'primereact/datatable';
import { useReport } from '../../../hooks/UseReport';
import { Column } from 'primereact/column';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
// import './CreditInvoice.css';

dayjs.extend(isBetween);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { Text, Title } = Typography;
const { TextArea } = Input;

const CreditInvoice = () => {
  const [invoices, setInvoices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exportLoading, setExportLoading] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentInvoice, setCurrentInvoice] = useState(null);
  const [form] = Form.useForm();
  const tableRef = useRef();
  const {getCreditSalesData}  = useReport();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [perPage, setPerPage] = useState(25);
  // Filter states
  const [appliedFilters, setAppliedFilters] = useState({
    searchTerm: '',
    status: 'all',
    dateRange: null,
    customer: 'all',
    invoiceType: 'all',
  });
  
  const [pendingFilters, setPendingFilters] = useState({
    searchTerm: '',
    status: 'all',
    dateRange: null,
    customer: 'all',
    invoiceType: 'all',
  });

  const userData = useMemo(() => JSON.parse(Cookies.get('user') || '{}'), []);
  const token = localStorage.getItem('token');

const fetchCreditInvoices = async () => {
  try {
    setIsLoading(true);
    
    const filters = {
      warehouse_id: userData.warehouse_id,
      status: appliedFilters.status !== 'all' ? appliedFilters.status : undefined,
      customer: appliedFilters.customer !== 'all' ? appliedFilters.customer : undefined,
      search_term: appliedFilters.searchTerm || undefined,
      start_date: appliedFilters.dateRange?.[0]?.format('YYYY-MM-DD HH:mm:ss'),
      end_date: appliedFilters.dateRange?.[1]?.format('YYYY-MM-DD HH:mm:ss'),
      invoice_type: appliedFilters.invoiceType !== 'all' ? appliedFilters.invoiceType : undefined,
      page: appliedFilters.page || currentPage,
      per_page: perPage
    };

    const cleanedFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, value]) => value !== undefined)
    );

    const response = await getCreditSalesData(cleanedFilters, token);          
    if (response.success) {
      setInvoices(response.creditSales.data.data || []);
      setTotalRecords(response.creditSales.data.total || 0);
      setError(null);
    }
  } catch (err) {
    message.error('Failed to load credit invoices');
    setError(err);
  } finally {
    setIsLoading(false);
  }
};

  useEffect(() => {
    fetchCreditInvoices();
  }, [appliedFilters]);

  const debouncedSetPendingSearch = useMemo(
    () => debounce((value) => setPendingFilters(prev => ({ ...prev, searchTerm: value })), 500),
    []
  );

  useEffect(() => {
    return () => debouncedSetPendingSearch.cancel();
  }, [debouncedSetPendingSearch]);

  // Columns configuration for the table
  const columns = useMemo(() => [
    {
      field: 'reference',
      header: 'Invoice No',
      sortable: true,
      style: { minWidth: '150px' },
      body: (rowData) => <Text strong>{rowData.reference}</Text>,
    },
    {
      field: 'date',
      header: 'Date',
      sortable: true,
      style: { minWidth: '120px' },
      body: (rowData) => <Text>{dayjs(rowData.date).format('YYYY-MM-DD HH:mm')}</Text>,
    },
    {
      field: 'customer_name',
      header: 'Customer',
      sortable: true,
      style: { minWidth: '180px' },
      body: (rowData) => <Text>{rowData.customer.username || 'Walk-in'}</Text>,
    },
    // {
    //   field: 'original_invoice',
    //   header: 'Original Invoice',
    //   sortable: true,
    //   style: { minWidth: '150px' },
    //   body: (rowData) => <Text>{rowData.original_invoice || 'N/A'}</Text>,
    // },
    {
      field: 'total_amount',
      header: 'Amount',
      sortable: true,
      style: { minWidth: '120px', textAlign: 'right' },
      body: (rowData) => <Text>${Number(rowData.total || 0).toFixed(2)}</Text>,
    },
    {
      field: 'credit_amount',
      header: 'Credit Amount',
      sortable: true,
      style: { minWidth: '120px', textAlign: 'right' },
      body: (rowData) => <Text>${Number(rowData.credit_amount || 0).toFixed(2)}</Text>,
    },
    {
      field: 'next_payment',
      header: 'Next Payment Date',
      sortable: true,
      style: { minWidth: '120px' },
      body: (rowData) => (
        <Text 
          
        >
          {rowData.next_payment_date}
        </Text>
      ),
    },
  ], []);
const handleExportExcel = useCallback(async () => {
  setExportLoading(true);
  try {
    if (!invoices.length) {
      message.warning('No data available to export');
      return;
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Credit Invoices');
    
    // Add title and metadata
    worksheet.addRow(['DD Home Credit Invoices Report']).font = { size: 16, bold: true };
    worksheet.addRow([
      `Date Range: ${
        appliedFilters.dateRange?.[0]
          ? dayjs(appliedFilters.dateRange[0]).format('YYYY-MM-DD')
          : 'All Dates'
      } to ${
        appliedFilters.dateRange?.[1]
          ? dayjs(appliedFilters.dateRange[1]).format('YYYY-MM-DD')
          : 'All Dates'
      }`
    ]);
    worksheet.addRow([`Warehouse: ${invoices[0]?.warehouse.name || 'All'}`]);
    worksheet.addRow([`Generated At: ${dayjs().format('YYYY-MM-DD HH:mm')}`]);
    worksheet.addRow([]);

    // Define headers
    const headers = [
      'Invoice No',
      'Date',
      'Customer',
      'Total Amount',
      'Credit Amount',
      'Next Payment Date',
    ];

    // Add headers with styling
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

    // Add data rows
    invoices.forEach((invoice) => {
      const rowData = [
        invoice.reference,
        dayjs(invoice.date).format('YYYY-MM-DD HH:mm'),
        invoice.customer?.username || 'Walk-in',
        Number(invoice.total || 0),
        Number(invoice.credit_amount || 0),
        invoice.next_payment_date || 'N/A',
      ];

      const row = worksheet.addRow(rowData);
      
      // Format numeric columns
      row.getCell(4).numFmt = '#,##0.00'; // Total Amount
      row.getCell(5).numFmt = '#,##0.00'; // Credit Amount
      
      // Color status column
      const statusCell = row.getCell(7);

    });

    // Add totals row
    const totalAmount = invoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
    const totalCredit = invoices.reduce((sum, inv) => sum + (inv.credit_amount || 0), 0);
    
    const totalRow = worksheet.addRow([
      '', '', 'TOTAL:', 
      totalAmount, 
      totalCredit,
      '', ''
    ]);
    
    totalRow.eachCell((cell, colNumber) => {
      if (colNumber === 4 || colNumber === 5) { // Total and Credit columns
        cell.font = { bold: true };
        cell.numFmt = '#,##0.00';
      }
      if (colNumber === 3) { // "TOTAL" label
        cell.font = { bold: true };
      }
    });

    // Auto-size columns
    worksheet.columns.forEach((column) => {
      let maxLength = 0;
      column.eachCell({ includeEmpty: true }, (cell) => {
        const columnLength = cell.value ? cell.value.toString().length : 0;
        if (columnLength > maxLength) {
          maxLength = columnLength;
        }
      });
      column.width = Math.min(Math.max(maxLength + 2, 10), 30);
    });

    // Freeze header row
    worksheet.views = [{ state: 'frozen', ySplit: 1 }];

    // Save the file
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(
      new Blob([buffer]),
      `credit-invoices-${dayjs().format('YYYY-MM-DD-HHmm')}.xlsx`
    );
    message.success('Excel file exported successfully');
  } catch (error) {
    console.error('Export error:', error);
    message.error('Failed to export Excel file');
  } finally {
    setExportLoading(false);
  }
}, [invoices, appliedFilters, userData.warehouse_name]);

  const handleApplyFilters = useCallback(() => {
    setAppliedFilters(pendingFilters);
  }, [pendingFilters]);

  const handleClearFilters = useCallback(() => {
    const clearedFilters = {
      searchTerm: '',
      status: 'all',
      dateRange: null,
      customer: 'all',
      invoiceType: 'all',
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
          <Text type="danger">Error: {error.message || 'Failed to load credit invoices'}</Text>
          <Button
            type="primary"
            onClick={fetchCreditInvoices}
            style={{ marginLeft: 16 }}
          >
            Retry
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <Spin spinning={isLoading || exportLoading} tip={exportLoading ? 'Exporting...' : 'Loading credit invoices...'} size="large">
      <div>
        <Card style={{ marginBottom: 24, background: '#fff2f0' }} hoverable>
          <Row align="middle" justify="space-between">
            <Col>
              <Title level={3} style={{ margin: 0, color: '#cf1322' }}>
                Credit Invoices
              </Title>
              <Text type="secondary">Manage returned goods and credit notes</Text>
              <div style={{ marginTop: 8 }}>
                <Text strong>Warehouse: </Text>
                <Text>{invoices[0]?.warehouse.name || 'N/A'}</Text>
              </div>
            </Col>
            <Col>
              <RollbackOutlined style={{ fontSize: 48, color: '#ffa39e', opacity: 0.8 }} />
            </Col>
          </Row>
        </Card>

        <Card style={{ marginBottom: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }} hoverable>
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} sm={12} md={6}>
              <Search
                placeholder="Search invoice or customer"
                prefix={<SearchOutlined style={{ color: '#cf1322' }} />}
                onChange={(e) => debouncedSetPendingSearch(e.target.value)}
                value={pendingFilters.searchTerm}
                allowClear
                size="large"
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Select
                style={{ width: '100%' }}
                placeholder="Filter by status"
                value={pendingFilters.status}
                onChange={(value) => setPendingFilters(prev => ({ ...prev, status: value }))}
                allowClear
                size="large"
              >
                <Option value="all">All Statuses</Option>
                <Option value="pending">Pending</Option>
                <Option value="completed">Completed</Option>
                <Option value="cancelled">Cancelled</Option>
              </Select>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <RangePicker
                style={{ width: '100%' }}
                placeholder={['Start Date', 'End Date']}
                value={pendingFilters.dateRange}
                onChange={(dates) => setPendingFilters(prev => ({ ...prev, dateRange: dates }))}
                size="large"
                showTime={{ format: 'HH:mm' }}
                format="YYYY-MM-DD HH:mm"
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Select
                style={{ width: '100%' }}
                placeholder="Filter by type"
                value={pendingFilters.invoiceType}
                onChange={(value) => setPendingFilters(prev => ({ ...prev, invoiceType: value }))}
                allowClear
                size="large"
              >
                <Option value="all">All Types</Option>
                <Option value="return">Product Return</Option>
                <Option value="discount">Discount</Option>
                <Option value="damage">Damaged Goods</Option>
                <Option value="other">Other</Option>
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
                style={{ width: '100%', backgroundColor: '#cf1322', borderColor: '#cf1322' }}
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
            title={<Text strong style={{ fontSize: 18 }}>Credit Invoices</Text>}
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
                value={invoices}
                dataKey="id"
                scrollable
                scrollHeight="600px"
                sortMode="multiple"
                selectionMode="multiple"
                selection={selectedRows}
                onSelectionChange={(e) => setSelectedRows(e.value)}
                tableStyle={{ width: '100%' }}
                className="p-datatable-striped p-datatable-gridlines"
                loading={isLoading}
                responsiveLayout="scroll"
                lazy
                onVirtualScroll={(e) => {
                    // Load more data when scrolled near bottom
                    const { first, rows } = e;
                    if (!isLoading && invoices.length < totalRecords && first + rows >= invoices.length - 5) {
                        setAppliedFilters(prev => ({
                            ...prev,
                            page: Math.floor(invoices.length / perPage) + 1,
                            per_page: perPage
                        }));
                    }
                }}
                virtualScrollerOptions={{
                    itemSize: 50, // approximate row height in pixels
                    lazy: true,
                    onLazyLoad: (e) => {
                        // Initial load or when filters change
                        setAppliedFilters(prev => ({
                            ...prev,
                            page: 1,
                            per_page: e.rows
                        }));
                        setPerPage(e.rows);
                    },
                    delay: 250 // debounce delay
                }}
            >
                {/* <Column 
                    selectionMode="multiple" 
                    headerStyle={{ width: '3em' }}
                ></Column> */}
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

export default CreditInvoice;