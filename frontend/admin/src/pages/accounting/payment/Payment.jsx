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
} from 'antd';
import {
  SearchOutlined,
  FilterOutlined,
  FileExcelOutlined,
  FilePdfOutlined,
  FileImageOutlined,
  DollarOutlined,
  ClearOutlined,
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
import { useReport } from '../../../hooks/UseReport';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

dayjs.extend(isBetween);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { Text, Title } = Typography;

const PaymentReports = () => {
  const [appliedFilters, setAppliedFilters] = useState({
    searchTerm: '',
    paymentMethod: 'all',
    dateRange: null,
    customer: 'all',
    paymentStatus: 'all',
    groupBy: ['date']
  });
  
  const [pendingFilters, setPendingFilters] = useState({
    searchTerm: '',
    paymentMethod: 'all',
    dateRange: null,
    customer: 'all',
    paymentStatus: 'all',
    groupBy: ['date']
  });

  const [selectedRows, setSelectedRows] = useState([]);
  const [exportLoading, setExportLoading] = useState(false);
  const [payments, setPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const tableRef = useRef();
  const { getPaymentReportsData } = useReport();
  const userData = useMemo(() => JSON.parse(Cookies.get('user') || '{}'), []);
  const token = localStorage.getItem('token');
  
  const [summaryStats, setSummaryStats] = useState({
    totalPayments: 0,
    totalAmount: 0,
    cashAmount: 0,
    cardAmount: 0,
    bankTransferAmount: 0,
    otherAmount: 0
  });

  const fetchPaymentReportData = async () => {
    try {
      setIsLoading(true);
      
      const filters = {
        warehouse_id: userData.warehouse_id,
        payment_method: appliedFilters.paymentMethod !== 'all' ? appliedFilters.paymentMethod : undefined,
        group_by: appliedFilters.groupBy,
        start_date: appliedFilters.dateRange?.[0]?.format('YYYY-MM-DD HH:mm:ss'),
        end_date: appliedFilters.dateRange?.[1]?.format('YYYY-MM-DD HH:mm:ss'),
        payment_status: appliedFilters.paymentStatus !== 'all' ? appliedFilters.paymentStatus : undefined,
        customer: appliedFilters.customer !== 'all' ? appliedFilters.customer : undefined,
        search_term: appliedFilters.searchTerm || undefined
      };

      const cleanedFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== undefined)
      );

      const response = await getPaymentReportsData(cleanedFilters, token);      
      if (response.success) {
        setPayments(response.payments || []);
        
        const stats = {
          totalPayments: response.payments?.length || 0,
          totalAmount: 0,
          cashAmount: 0,
          cardAmount: 0,
          bankTransferAmount: 0,
          otherAmount: 0
        };

        response.payments?.forEach(payment => {
          stats.totalAmount += Number(payment.paid) || 0;
          
          switch(payment.payment_method) {
            case 'cash':
              stats.cashAmount += Number(payment.paid) || 0;
              break;
            case 'card':
              stats.cardAmount += Number(payment.paid) || 0;
              break;
            case 'bank_transfer':
              stats.bankTransferAmount += Number(payment.paid) || 0;
              break;
            default:
              stats.otherAmount += Number(payment.paid) || 0;
          }
        });

        setSummaryStats(stats);
        setError(null);
      }
    } catch (err) {
      console.error('Error fetching payment data:', err);
      message.error('Failed to load payment data');
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentReportData();
  }, [appliedFilters]);

  const debouncedSetPendingSearch = useMemo(
    () => debounce((value) => setPendingFilters(prev => ({ ...prev, searchTerm: value })), 500),
    []
  );

  useEffect(() => {
    return () => debouncedSetPendingSearch.cancel();
  }, [debouncedSetPendingSearch]);

  const columns = useMemo(() => {
    return [
      {
        field: 'date',
        header: 'Date',
        sortable: true,
        style: { minWidth: '150px' },
        body: (rowData) => (
          <Text>{rowData.date ? dayjs(rowData.date).format('YYYY-MM-DD HH:mm') : 'N/A'}</Text>
        ),
      },
      {
        field: 'customer_name',
        header: 'Customer',
        sortable: true,
        style: { minWidth: '180px' },
        body: (rowData) => <Text>{rowData.customer_name || 'N/A'}</Text>,
      },
      // {
      //   field: 'payment_status',
      //   header: 'Status',
      //   sortable: true,
      //   style: { minWidth: '120px' },
      //   body: (rowData) => (
      //     <Text style={{ 
      //       color: rowData.payment_status === 'completed' ? '#52c41a' : 
      //             rowData.payment_status === 'pending' ? '#faad14' : '#f5222d'
      //     }}>
      //       {rowData.payment_status?.toUpperCase() || 'N/A'}
      //     </Text>
      //   ),
      // },
      {
        field: 'sale_reference',
        header: 'Sale Reference',
        sortable: true,
        style: { minWidth: '150px' },
        body: (rowData) => <Text>{rowData.sale_reference || 'N/A'}</Text>,
      },
      // {
      //   field: 'reference_no',
      //   header: 'Reference',
      //   sortable: true,
      //   style: { minWidth: '150px' },
      //   body: (rowData) => <Text>{rowData.reference_no || 'N/A'}</Text>,
      // },
      {
        field: 'payment_method',
        header: 'Method',
        sortable: true,
        style: { minWidth: '120px' },
        body: (rowData) => (
          <Text>
            {rowData.payment_method === 'cash' ? 'Cash' : 
             rowData.payment_method === 'card' ? 'Card' :
             rowData.payment_method === 'bank_transfer' ? 'Bank Transfer' : 
             rowData.payment_method || 'Other'}
          </Text>
        ),
      },
      {
        field: 'paid',
        header: 'Amount',
        sortable: true,
        style: { minWidth: '120px', textAlign: 'right' },
        body: (rowData) => <Text>${Number(rowData.paid || 0).toFixed(2)}</Text>,
      },
    ];
  }, []);
  const handleExportExcel = useCallback(async () => {
    setExportLoading(true);
    try {
      if (!payments.length) {
        message.warning('No data available to export');
        return;
      }

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Payment Report');
      
      worksheet.addRow(['DD Home Payment Report']).font = { size: 16, bold: true };
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
      worksheet.addRow([`Warehouse: ${payments[0]?.warehouse_name || 'All'}`]);
      worksheet.addRow([]);

      // Add summary statistics
      worksheet.addRow(['SUMMARY STATISTICS']).font = { bold: true };
      worksheet.addRow(['Total Payments', summaryStats.totalPayments]);
      worksheet.addRow(['Total Amount', `$${summaryStats.totalAmount.toFixed(2)}`]);
      worksheet.addRow(['Cash Payments', `$${summaryStats.cashAmount.toFixed(2)}`]);
      worksheet.addRow(['Card Payments', `$${summaryStats.cardAmount.toFixed(2)}`]);
      worksheet.addRow(['Bank Transfers', `$${summaryStats.bankTransferAmount.toFixed(2)}`]);
      worksheet.addRow(['Other Payments', `$${summaryStats.otherAmount.toFixed(2)}`]);
      worksheet.addRow([]);

      // Define custom headers without status and reference
      const headers = [
        'Date',
        'Customer',
        'Amount',
        'Payment Method'
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

      // Add payment data with only the selected columns
      payments.forEach((payment) => {
        const rowData = [
          payment.date ? dayjs(payment.date).format('YYYY-MM-DD HH:mm') : 'N/A',
          payment.customer_name || 'N/A',
          Number(payment.paid || 0),
          payment.payment_method === 'cash' ? 'Cash' : 
            payment.payment_method === 'card' ? 'Card' :
            payment.payment_method === 'bank_transfer' ? 'Bank Transfer' : 
            payment.payment_method || 'Other'
        ];

        const row = worksheet.addRow(rowData);
        
        // Format numeric columns
        row.eachCell((cell, colNumber) => {
          if (colNumber === 3) { 
            cell.numFmt = '#,##0.00';
            cell.alignment = { horizontal: 'right' };
          }
        });
      });

      // Add totals row
      const totalRow = worksheet.addRow([
        ...Array(headers.length - 2).fill(''),
        'TOTAL:',
        summaryStats.totalAmount
      ]);
      
      totalRow.eachCell((cell, colNumber) => {
        if (colNumber === 3) {
          cell.font = { bold: true };
          cell.numFmt = '#,##0.00';
          cell.alignment = { horizontal: 'right' };
          cell.border = { top: { style: 'thin' } };
        } else if (colNumber === 2) {
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
      worksheet.views = [
        { state: 'frozen', ySplit: 1 }
      ];

      // Save the file
      const buffer = await workbook.xlsx.writeBuffer();
      saveAs(
        new Blob([buffer]),
        `payment-report-${dayjs().format('YYYY-MM-DD-HHmm')}.xlsx`
      );
      message.success('Excel file exported successfully');
    } catch (error) {
      console.error('Export error:', error);
      message.error('Failed to export Excel file');
    } finally {
      setExportLoading(false);
    }
  }, [payments, appliedFilters, summaryStats]);

  const handleApplyFilters = useCallback(() => {
    setAppliedFilters(pendingFilters);
  }, [pendingFilters]);

  const handleClearFilters = useCallback(() => {
    const clearedFilters = {
      searchTerm: '',
      paymentMethod: 'all',
      dateRange: null,
      customer: 'all',
      paymentStatus: 'all',
      groupBy: ['date']
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
          <Text type="danger">Error: {error.message || 'Failed to load payment data'}</Text>
          <Button
            type="primary"
            onClick={fetchPaymentReportData}
            style={{ marginLeft: 16 }}
          >
            Retry
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <Spin spinning={isLoading || exportLoading} tip={exportLoading ? 'Exporting...' : 'Loading payment data...'} size="large">
      <div>
        {/* Header Section */}
        <Card style={{ marginBottom: 24, background: '#f0f5ff' }} hoverable>
          <Row align="middle" justify="space-between">
            <Col>
              <Title level={3} style={{ margin: 0, color: 'green' }}>
                Payment Reports
              </Title>
              <Text type="secondary">Track and analyze payment transactions</Text>
              <div style={{ marginTop: 8 }}>
                <Text strong>Warehouse: </Text>
                <Text>{payments[0]?.warehouse_name || 'N/A'}</Text>
              </div>
            </Col>
            <Col>
              <DollarOutlined style={{ fontSize: 48, color: '#adc6ff', opacity: 0.8 }} />
            </Col>
          </Row>
        </Card>

        {/* Summary Statistics */}
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={6}>
            <Card hoverable>
              <Statistic
                title="Total Payments"
                value={summaryStats.totalPayments}
                precision={0}
                valueStyle={{ color: 'green' }}
                prefix={<DollarOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card hoverable>
              <Statistic
                title="Total Amount"
                value={summaryStats.totalAmount}
                precision={2}
                prefix="$"
                valueStyle={{ color: '#389e0d' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card hoverable>
              <Statistic
                title="Cash Payments"
                value={summaryStats.cashAmount}
                precision={2}
                prefix="$"
                valueStyle={{ color: '#08979c' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card hoverable>
              <Statistic
                title="Card Payments"
                value={summaryStats.cardAmount}
                precision={2}
                prefix="$"
                valueStyle={{ color: '#d46b08' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Filter Section */}
        <Card style={{ marginBottom: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }} hoverable>
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} sm={12} md={6}>
              <Search
                placeholder="Search reference or customer"
                prefix={<SearchOutlined style={{ color: '#1d39c4' }} />}
                onChange={(e) => debouncedSetPendingSearch(e.target.value)}
                value={pendingFilters.searchTerm}
                allowClear
                size="large"
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Select
                style={{ width: '100%' }}
                placeholder="Payment Method"
                value={pendingFilters.paymentMethod}
                onChange={(value) => setPendingFilters(prev => ({ ...prev, paymentMethod: value }))}
                allowClear
                size="large"
              >
                <Option value="all">All Methods</Option>
                <Option value="cash">Cash</Option>
                <Option value="card">Credit Card</Option>
                <Option value="bank_transfer">Bank Transfer</Option>
                <Option value="other">Other</Option>
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
                mode="multiple"
                style={{ width: '100%' }}
                placeholder="Group by"
                value={pendingFilters.groupBy}
                onChange={(value) => setPendingFilters(prev => ({ ...prev, groupBy: value }))}
                allowClear
                maxTagCount="responsive"
                size="large"
              >
                <Option value="date">Date</Option>
                <Option value="customer">Customer</Option>
                <Option value="invoice">Invoice</Option>
                <Option value="payment_method">Payment Method</Option>
                <Option value="payment_status">Payment Status</Option>
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
                style={{ width: '100%', backgroundColor: 'green', borderColor: 'green' }}
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

        {/* DataTable Section */}
        <div ref={tableRef}>
          <Card
            title={<Text strong style={{ fontSize: 18 }}>Payment Details</Text>}
            extra={
              <Space>
                <Button
                  icon={<FileExcelOutlined />}
                  onClick={handleExportExcel}
                  loading={exportLoading}
                  style={{ backgroundColor: 'green', borderColor: 'green', color: 'white' }}
                >
                  Export Excel
                </Button>
              </Space>
            }
            style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
          >
            <DataTable
              value={payments}
              dataKey="id"
              scrollable
              scrollHeight="600px"
              sortMode="multiple"
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

export default PaymentReports;