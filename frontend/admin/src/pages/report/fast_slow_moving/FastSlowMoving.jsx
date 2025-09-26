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
  ShoppingCartOutlined,
  ClearOutlined,
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
    status: 'all',
    dateRange: null,
    customer: 'all',
    reportType: 'all',
    saleType: 'all',
    groupBy: ['product'],
    salesPerson: 'all'
  });

  const [pendingFilters, setPendingFilters] = useState({
    searchTerm: '',
    status: 'all',
    dateRange: null,
    customer: 'all',
    reportType: 'all',
    saleType: 'all',
    groupBy: ['product'],
    salesPerson: 'all'
  });

  const [selectedRows, setSelectedRows] = useState([]);
  const [exportLoading, setExportLoading] = useState(false);
  const [sales, setSales] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const tableRef = useRef();
  const { getSaleReportsData } = useReport();
  const userData = useMemo(() => JSON.parse(Cookies.get('user') || '{}'), []);
  const token = localStorage.getItem('token');
  const { handleEmployee } = useUser();
  const [employees, setEmployees] = useState();
  const fetchSalesReportData = async () => {
    try {
      setIsLoading(true);

      const filters = {
        warehouse_id: userData.warehouse_id,
        sale_type: appliedFilters.saleType,
        group_by: appliedFilters.groupBy,
        start_date: appliedFilters.dateRange?.[0]?.format('YYYY-MM-DD HH:mm:ss'),
        end_date: appliedFilters.dateRange?.[1]?.format('YYYY-MM-DD HH:mm:ss'),
        status: appliedFilters.status !== 'all' ? appliedFilters.status : undefined,
        customer: appliedFilters.customer !== 'all' ? appliedFilters.customer : undefined,
        search_term: appliedFilters.searchTerm || undefined,
        report_type: appliedFilters.reportType !== 'all' ? appliedFilters.reportType : undefined,
        sales_person: appliedFilters.salesPerson !== 'all' ? appliedFilters.salesPerson : undefined
      };

      const cleanedFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== undefined)
      );

      const response = await getSaleReportsData(cleanedFilters, token);

      if (response.success) {
        setSales(response.sales || []);
        setError(null);
      }
    } catch (err) {
      console.error('Error fetching sales data:', err);
      message.error('Failed to load sales data');
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };
  const fectchEmployees = async () => {
    let result = await handleEmployee(token);
    if (result.success) {
      setEmployees(result.employees);
    }
  }

  useEffect(() => {
    fetchSalesReportData();
    fectchEmployees();
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
    const hasDateGroup = appliedFilters.groupBy?.includes('date');
    const hasCustomerGroup = appliedFilters.groupBy?.includes('customer');
    const hasInvoiceGroup = appliedFilters.groupBy?.includes('invoice');
    const hasSalesPersonGroup = appliedFilters.groupBy?.includes('sales_person');
    const hasCustomerGroupGroup = appliedFilters.groupBy?.includes('customer_group');
    const hasCategoryGroup = appliedFilters.groupBy?.includes('category');
    const baseColumns = [];
    if (hasProductGroup) {
      baseColumns.push({
        field: 'code',
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

    if (hasDateGroup) {
      baseColumns.push({
        field: 'date',
        header: 'Date',
        sortable: true,
        style: { minWidth: '120px' },
        body: (rowData) => (
          <Text>{rowData.date ? dayjs(rowData.date).format('YYYY-MM-DD') : 'N/A'}</Text>
        ),
      });
    }

    if (hasCustomerGroup) {
      baseColumns.push({
        field: 'customer_name',
        header: 'Customer',
        sortable: true,
        style: { minWidth: '180px' },
        body: (rowData) => <Text>{rowData.customer_name || 'Walk-in'}</Text>,
      });
    }

    if (hasInvoiceGroup) {
      baseColumns.push({
        field: 'invoice_no',
        header: 'Invoice',
        sortable: true,
        style: { minWidth: '150px' },
        body: (rowData) => <Text>{rowData.invoice_no || 'N/A'}</Text>,
      });
    }

    if (hasSalesPersonGroup) {
      baseColumns.push({
        field: 'sales_person',
        header: 'Sales Person',
        sortable: true,
        style: { minWidth: '150px' },
        body: (rowData) => <Text>{rowData.sales_person || ''}</Text>,
      });
    }

    if (hasCustomerGroupGroup) {
      baseColumns.push({
        field: 'customer_group_name',
        header: 'Customer Group',
        sortable: true,
        style: { minWidth: '150px' },
        body: (rowData) => <Text>{rowData.customer_group_name || 'Walk-In Customer'}</Text>,
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

    // Add metrics columns
    if (!hasCustomerGroup) {
      baseColumns.push({
        field: 'customer_count',
        header: 'Customers',
        sortable: true,
        style: { minWidth: '100px', textAlign: 'center' },
        body: (rowData) => <Text>{rowData.customer_count || 0}</Text>,
      });
    }

    baseColumns.push(
      {
        field: 'quantity',
        header: 'Qty',
        sortable: true,
        style: { minWidth: '80px', textAlign: 'right' },
        body: (rowData) => <Text>{Number(rowData.quantity || 0).toLocaleString()}</Text>,
      },
      {
        field: 'subtotal',
        header: 'Subtotal',
        sortable: true,
        style: { minWidth: '120px', textAlign: 'right' },
        body: (rowData) => <Text>${Number(rowData.subtotal || 0).toFixed(2)}</Text>,
      },
      {
        field: 'inv_discount',
        header: 'Inv Disc',
        sortable: true,
        style: { minWidth: '100px', textAlign: 'right' },
        body: (rowData) => <Text>${Number(rowData.inv_discount || 0).toFixed(2)}</Text>,
      },
      {
        field: 'item_discount',
        header: 'Item Disc',
        sortable: true,
        style: { minWidth: '100px', textAlign: 'right' },
        body: (rowData) => <Text>${Number(rowData.item_discount || 0).toFixed(2)}</Text>,
      },
      {
        field: 'total_sale',
        header: 'Total Sale',
        sortable: true,
        style: { minWidth: '120px', textAlign: 'right' },
        body: (rowData) => <Text>${Number(rowData.total_sale || 0).toFixed(2)}</Text>,
      },
      {
        field: 'total_cost',
        header: 'Cost',
        sortable: true,
        style: { minWidth: '120px', textAlign: 'right' },
        body: (rowData) => <Text>${Number(rowData.total_cost || 0).toFixed(2)}</Text>,
      },
      {
        field: 'profit',
        header: 'Profit',
        sortable: true,
        style: { minWidth: '120px', textAlign: 'right' },
        body: (rowData) => (
          <Text style={{ color: (rowData.profit || 0) >= 0 ? '#52c41a' : '#f5222d' }}>
            ${Number(rowData.profit || 0).toFixed(2)}
          </Text>
        ),
      }
    );

    return baseColumns;
  }, [appliedFilters.groupBy, sales]);

  // Calculate totals for footer
  const calculateTotals = useCallback(() => {
    return sales.reduce(
      (acc, sale) => {
        acc.totalQuantity += Number(sale.quantity) || 0;
        acc.totalSubtotal += Number(sale.subtotal) || 0;
        acc.totalInvoiceDiscount += Number(sale.inv_discount) || 0;
        acc.totalItemDiscount += Number(sale.item_discount) || 0;
        acc.totalSale += Number(sale.total_sale) || 0;
        acc.totalCost += Number(sale.total_cost) || 0;
        acc.totalProfit += Number(sale.profit) || 0;
        return acc;
      },
      {
        totalQuantity: 0,
        totalSubtotal: 0,
        totalInvoiceDiscount: 0,
        totalItemDiscount: 0,
        totalSale: 0,
        totalCost: 0,
        totalProfit: 0,
      }
    );
  }, [sales]);

  // const CustomFooter = useMemo(() => {
  //   const totals = calculateTotals();
  //   const hasGrouping = appliedFilters.groupBy?.length > 0;

  //   return (
  //     <div style={{ 
  //       display: 'flex',
  //       width: '100%',
  //       background: '#f8f9fa',
  //       padding: '8px',
  //       borderTop: '1px solid #dee2e6'
  //     }}>
  //       {/* Left-aligned "Total" label */}
  //       <div style={{ 
  //         flex: hasGrouping ? '0 0 200px' : '0 0 150px',
  //         fontWeight: 'bold',
  //         paddingLeft: '8px'
  //       }}>
  //         Total:
  //       </div>

  //       {/* Dynamic columns */}
  //       <div style={{ 
  //         display: 'flex',
  //         flex: 1,
  //         justifyContent: 'flex-end'
  //       }}>
  //         {/* Quantity */}
  //         <div style={{ 
  //           flex: '0 0 80px',
  //           textAlign: 'right',
  //           fontWeight: 'bold',
  //           paddingRight: '8px'
  //         }}>
  //           {totals.totalQuantity.toLocaleString()}
  //         </div>

  //         {/* Subtotal */}
  //         <div style={{ 
  //           flex: '0 0 120px',
  //           textAlign: 'right',
  //           fontWeight: 'bold',
  //           paddingRight: '8px'
  //         }}>
  //           ${totals.totalSubtotal.toFixed(2)}
  //         </div>

  //         {/* Invoice Discount */}
  //         <div style={{ 
  //           flex: '0 0 100px',
  //           textAlign: 'right',
  //           fontWeight: 'bold',
  //           paddingRight: '8px'
  //         }}>
  //           ${totals.totalInvoiceDiscount.toFixed(2)}
  //         </div>

  //         {/* Item Discount */}
  //         <div style={{ 
  //           flex: '0 0 100px',
  //           textAlign: 'right',
  //           fontWeight: 'bold',
  //           paddingRight: '8px'
  //         }}>
  //           ${totals.totalItemDiscount.toFixed(2)}
  //         </div>

  //         {/* Total Sale */}
  //         <div style={{ 
  //           flex: '0 0 120px',
  //           textAlign: 'right',
  //           fontWeight: 'bold',
  //           paddingRight: '8px'
  //         }}>
  //           ${totals.totalSale.toFixed(2)}
  //         </div>

  //         {/* Cost */}
  //         <div style={{ 
  //           flex: '0 0 120px',
  //           textAlign: 'right',
  //           fontWeight: 'bold',
  //           paddingRight: '8px'
  //         }}>
  //           ${totals.totalCost.toFixed(2)}
  //         </div>

  //         {/* Profit */}
  //         <div style={{ 
  //           flex: '0 0 120px',
  //           textAlign: 'right',
  //           fontWeight: 'bold',
  //           paddingRight: '8px',
  //           color: totals.totalProfit >= 0 ? '#52c41a' : '#f5222d'
  //         }}>
  //           ${totals.totalProfit.toFixed(2)}
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }, [sales, appliedFilters.groupBy]);
  const handleExportExcel = useCallback(async () => {
    setExportLoading(true);
    try {
      if (!sales.length) {
        message.warning('No data available to export');
        return;
      }

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Sales Report');
      worksheet.addRow(['DD Home Sales Report']).font = { size: 16, bold: true };
      worksheet.addRow([
        `Date Range: ${appliedFilters.dateRange?.[0]
          ? dayjs(appliedFilters.dateRange[0]).format('YYYY-MM-DD')
          : 'All Dates'
        } to ${appliedFilters.dateRange?.[1]
          ? dayjs(appliedFilters.dateRange[1]).format('YYYY-MM-DD')
          : 'All Dates'
        }`
      ]);
      worksheet.addRow([`Grouped By: ${appliedFilters.groupBy.join(', ') || 'None'}`]);
      worksheet.addRow([`Warehouse: ${userData.warehouse_name || 'All'}`]);
      worksheet.addRow([]);

      const hasProductGroup = appliedFilters.groupBy.includes('product');
      const hasDateGroup = appliedFilters.groupBy.includes('date');
      const hasCustomerGroup = appliedFilters.groupBy.includes('customer');
      const hasInvoiceGroup = appliedFilters.groupBy.includes('invoice');
      const hasSalesPersonGroup = appliedFilters.groupBy.includes('sales_person');
      const hasCustomerGroupGroup = appliedFilters.groupBy.includes('customer_group');
      const hasCategoryGroup = appliedFilters.groupBy.includes('category');
      const headers = [];

      if (hasProductGroup) {
        headers.push('Product Code');
        headers.push('Product');
      }
      if (hasDateGroup) headers.push('Date');
      if (hasCustomerGroup) headers.push('Customer');
      if (hasInvoiceGroup) headers.push('Invoice No');
      if (hasSalesPersonGroup) headers.push('Sales Person');
      if (hasCustomerGroupGroup) headers.push('Customer Group');
      if (hasCategoryGroup) headers.push('Category');
      if (!hasCustomerGroup) headers.push('Customer Count');

      headers.push(
        'Quantity',
        'Unit Price',
        'Subtotal',
        'Invoice Discount',
        'Item Discount',
        'Total Sale',
        'Unit Cost',
        'Total Cost',
        'Profit'
      );

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

      sales.forEach((sale) => {
        const rowData = [];

        if (hasProductGroup) {
          rowData.push(sale.product_code || 'N/A');
          rowData.push(sale.product_name || 'N/A');
        }
        if (hasDateGroup) rowData.push(sale.date ? dayjs(sale.date).format('YYYY-MM-DD') : 'N/A');
        if (hasCustomerGroup) rowData.push(sale.customer_name || 'Walk-in');
        if (hasInvoiceGroup) rowData.push(sale.invoice_no || 'N/A');
        if (hasSalesPersonGroup) rowData.push(sale.sales_person || '');
        if (hasCustomerGroupGroup) rowData.push(sale.customer_group_name || 'Walk-In Customer');
        if (hasCategoryGroup) rowData.push(sale.product_category || 'N/A');
        if (!hasCustomerGroup) rowData.push(sale.customer_count || 0);

        const unitPrice = sale.quantity ? (sale.subtotal / sale.quantity) : 0;
        const unitCost = sale.quantity ? (sale.total_cost / sale.quantity) : 0;

        rowData.push(
          Number(sale.quantity || 0),
          Number(unitPrice.toFixed(2)),
          Number(sale.subtotal || 0),
          Number(sale.inv_discount || 0),
          Number(sale.item_discount || 0),
          Number(sale.total_sale || 0),
          Number(unitCost.toFixed(2)),
          Number(sale.total_cost || 0),
          Number(sale.profit || 0)
        );

        const row = worksheet.addRow(rowData);

        row.eachCell((cell, colNumber) => {
          const firstMetricCol = headers.length - 9 + 1;

          if (colNumber >= firstMetricCol) {
            cell.numFmt = colNumber === firstMetricCol ? '0' : '#,##0.00';
            cell.alignment = { horizontal: 'right' };

            if (colNumber === headers.length) {
              cell.font = {
                color: { argb: cell.value >= 0 ? 'FF52C41A' : 'FFF5222D' }
              };
            }
          }
        });
      });

      const totals = sales.reduce((acc, sale) => {
        acc.totalQuantity += Number(sale.quantity) || 0;
        acc.totalSubtotal += Number(sale.subtotal) || 0;
        acc.totalInvDiscount += Number(sale.inv_discount) || 0;
        acc.totalItemDiscount += Number(sale.item_discount) || 0;
        acc.totalSale += Number(sale.total_sale) || 0;
        acc.totalCost += Number(sale.total_cost) || 0;
        acc.totalProfit += Number(sale.profit) || 0;
        return acc;
      }, {
        totalQuantity: 0,
        totalSubtotal: 0,
        totalInvDiscount: 0,
        totalItemDiscount: 0,
        totalSale: 0,
        totalCost: 0,
        totalProfit: 0
      });

      const totalRowData = [];

      if (hasProductGroup) {
        totalRowData.push('');
        totalRowData.push('TOTAL');
      }
      if (hasDateGroup) totalRowData.push('');
      if (hasCustomerGroup) totalRowData.push('');
      if (hasInvoiceGroup) totalRowData.push('');
      if (hasSalesPersonGroup) totalRowData.push('');
      if (hasCustomerGroupGroup) totalRowData.push('');
      if (hasCategoryGroup) totalRowData.push('');
      if (!hasCustomerGroup) totalRowData.push('');

      const avgUnitPrice = totals.totalQuantity ? (totals.totalSubtotal / totals.totalQuantity) : 0;
      const avgUnitCost = totals.totalQuantity ? (totals.totalCost / totals.totalQuantity) : 0;

      totalRowData.push(
        totals.totalQuantity,
        Number(avgUnitPrice.toFixed(2)),
        totals.totalSubtotal,
        totals.totalInvDiscount,
        totals.totalItemDiscount,
        totals.totalSale,
        Number(avgUnitCost.toFixed(2)),
        totals.totalCost,
        totals.totalProfit
      );

      const totalRow = worksheet.addRow(totalRowData);
      totalRow.eachCell((cell, colNumber) => {
        const firstMetricCol = headers.length - 9 + 1;

        if (colNumber >= firstMetricCol) {
          cell.font = { bold: true };
          cell.numFmt = colNumber === firstMetricCol ? '0' : '#,##0.00';
          cell.alignment = { horizontal: 'right' };
          cell.border = { top: { style: 'thin' } };

          if (colNumber === headers.length) {
            cell.font = {
              bold: true,
              color: { argb: cell.value >= 0 ? 'FF52C41A' : 'FFF5222D' }
            };
          }
        }
      });

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

      worksheet.views = [
        { state: 'frozen', ySplit: 1 }
      ];

      const buffer = await workbook.xlsx.writeBuffer();
      saveAs(
        new Blob([buffer]),
        `sales-report-${dayjs().format('YYYY-MM-DD-HHmm')}.xlsx`
      );
      message.success('Excel file exported successfully');
    } catch (error) {
      console.error('Export error:', error);
      message.error('Failed to export Excel file');
    } finally {
      setExportLoading(false);
    }
  }, [sales, appliedFilters, userData.warehouse_name]);

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
    <Spin spinning={isLoading || exportLoading} tip={exportLoading ? 'Exporting...' : 'Loading sales data...'} size="large">
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
                placeholder="Search invoice or customer"
                prefix={<SearchOutlined style={{ color: '#52c41a' }} />}
                onChange={(e) => debouncedSetPendingSearch(e.target.value)}
                value={pendingFilters.searchTerm}
                allowClear
                size="large"
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Select
                style={{ width: '100%' }}
                placeholder="Filter by sale type"
                value={pendingFilters.saleType}
                onChange={(value) => setPendingFilters(prev => ({ ...prev, saleType: value }))}
                allowClear
                size="large"
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
                <Option value="product">Product</Option>
                <Option value="date">Date</Option>
                <Option value="customer">Customer</Option>
                <Option value="invoice">Invoice</Option>
                <Option value="sales_person">Sales Person</Option>
                <Option value="customer_group">Customer Group</Option>
                <Option value="category">Category</Option>
              </Select>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Select
                style={{ width: '100%' }}
                placeholder="Filter by sales person"
                value={pendingFilters.salesPerson}
                onChange={(value) => setPendingFilters(prev => ({ ...prev, salesPerson: value }))}
                allowClear
                size="large"
              >
                <Option value="all">All Sales Persons</Option>
                {(employees || []).map(emp => (
                  <Option key={emp.id} value={emp.id}>
                    {emp.username}
                  </Option>
                ))}
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
            title={<Text strong style={{ fontSize: 18 }}>Sales Report Details</Text>}
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