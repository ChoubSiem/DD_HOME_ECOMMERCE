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
  AppstoreOutlined 
} from '@ant-design/icons';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
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
  // Filter states
  const [appliedFilters, setAppliedFilters] = useState({
    searchTerm: '',
    status: 'all',
    dateRange: null,
    customer: 'all',
    reportType: 'all',
    saleType: 'all',
    groupBy: ['product'] // Default grouping by product
  });
  
  const [pendingFilters, setPendingFilters] = useState({
    searchTerm: '',
    status: 'all',
    dateRange: null,
    customer: 'all',
    reportType: 'all',
    saleType: 'all',
    groupBy: ['product']
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

  // Fetch data with proper filters
  const fetchSalesReportData = async () => {
    try {
      setIsLoading(true);
      
      // Prepare filters based on appliedFilters state
      const filters = {
        warehouse_id: userData.warehouse_id,
        sale_type: appliedFilters.saleType,
        group_by: appliedFilters.groupBy,
        start_date: appliedFilters.dateRange?.[0]?.format('YYYY-MM-DD'),
        end_date: appliedFilters.dateRange?.[1]?.format('YYYY-MM-DD'),
        status: appliedFilters.status !== 'all' ? appliedFilters.status : undefined,
        customer: appliedFilters.customer !== 'all' ? appliedFilters.customer : undefined,
        search_term: appliedFilters.searchTerm || undefined,
        report_type: appliedFilters.reportType !== 'all' ? appliedFilters.reportType : undefined
      };

      // Remove undefined values to avoid sending empty filters
      const cleanedFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== undefined)
      );

      const response = await getSaleReportsData(cleanedFilters, token);
      console.log(response);
      
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

  // Fetch data when filters change
  useEffect(() => {
    fetchSalesReportData();
  }, [appliedFilters]);

  // Debounced search for pending filters
  const debouncedSetPendingSearch = useMemo(
    () => debounce((value) => setPendingFilters(prev => ({ ...prev, searchTerm: value })), 500),
    []
  );

  useEffect(() => {
    return () => {
      debouncedSetPendingSearch.cancel();
    };
  }, [debouncedSetPendingSearch]);

  // Memoized customers list
  const customers = useMemo(() => {
    const uniqueCustomers = new Set();
    sales.forEach(sale => {
      if (sale.customer_name) {
        uniqueCustomers.add({
          id: sale.customer_id,
          name: sale.customer_name
        });
      }
    });
    return Array.from(uniqueCustomers);
  }, [sales]);

  // Calculate totals and stats
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

    sales.forEach((sale) => {
      totals.totalCustomers += sale.customer_count || 0;
      totals.totalQuantity += Number(sale.quantity) || 0;
      totals.totalSubtotal += Number(sale.unit_price * sale.quantity) || 0;
      totals.totalInvoiceDiscount += Number(sale.inv_discount) || 0;
      totals.totalItemDiscount += Number(sale.item_discount) || 0;
      totals.totalSale += Number(sale.total_sale) || 0;
      totals.totalCost += Number(sale.total_cost) || 0;
      totals.totalProfit += Number(sale.profit) || 0;

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
  }, [sales]);  

  // Row selection handler
  const handleRowSelected = useCallback((e) => {
    setSelectedRows(e.value.map((row) => row.id));
  }, []);

  // Export handlers
const handleExportExcel = useCallback(async () => {
  setExportLoading(true);
  try {
    if (!sales.length) {
      message.warning('No data available to export');
      return;
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sales Report');

    // Header
    worksheet.addRow(['DD Home']).font = { size: 16, bold: true };
    worksheet.addRow(['Address: Nº25, St.5, Dangkor, Phnom Penh, Cambodia']);
    worksheet.addRow(['Phone: 081 90 50 50']);
    worksheet.addRow([`View By Outlet: ${userData.warehouse_name || 'Chamroeun Phal'}`]);
    worksheet.addRow(['View By Location: All']);
    worksheet.addRow(['View As: Detail']);
    worksheet.addRow([`Group By: ${appliedFilters.groupBy.join(', ') || 'None'}`]);
    worksheet.addRow([
      `From ${appliedFilters.dateRange?.[0] ? dayjs(appliedFilters.dateRange[0]).format('YYYY-MM-DD h:mm A') : 'N/A'}`,
      `To ${appliedFilters.dateRange?.[1] ? dayjs(appliedFilters.dateRange[1]).format('YYYY-MM-DD h:mm A') : 'N/A'}`,
    ]);
    worksheet.addRow([]); // spacer 

    // Determine dynamic columns based on groupBy
    const hasDateGroup = appliedFilters.groupBy.includes('date');
    const hasCustomerGroup = appliedFilters.groupBy.includes('customer');
    const onlyCustomerGroup = appliedFilters.groupBy.length === 1 && hasCustomerGroup;
    const showCustomerCount = !hasCustomerGroup;

    // Table headers
    const headers = [];
    
    if (!onlyCustomerGroup) {
      headers.push('Product Name');
    }
    if (hasDateGroup) {
      headers.push('Date');
    }
    if (hasCustomerGroup) {
      headers.push('Customer Name');
    }
    
    headers.push(
      ...(showCustomerCount ? ['Customers'] : []),
      'Quantity Sold',
      'Sub Amount',
      'Invoice Discount',
      'Item Discount',
      'Total Sale',
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
        bottom: { style: 'thin' },
        left: { style: 'thin' },
        right: { style: 'thin' },
      };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
    });

    // Sales data - preserve original number formatting
    sales.forEach((sale) => {
      const rowData = [];      
      if (!onlyCustomerGroup) {
        rowData.push(sale.product_name || 'N/A');
      }
      if (hasDateGroup) {
        rowData.push(sale.date ? dayjs(sale.date).format('YYYY-MM-DD') : 'N/A');
      }
      if (hasCustomerGroup) {
        rowData.push(sale.customer_name || 'N/A');
      }
      
      // Push numeric values without fixed decimal formatting
      rowData.push(
        ...(showCustomerCount ? [sale.customer_count || 0] : []),
        Number(sale.quantity) || 0,
        Number(sale.unit_price * sale.quantity) || 0,
        Number(sale.inv_discount) || 0,
        Number(sale.item_discount) || 0,
        Number(sale.total_sale) || 0,
        Number(sale.total_cost) || 0,
        Number(sale.profit) || 0
      );

      const row = worksheet.addRow(rowData);
      row.eachCell((cell) => {
        if (typeof cell.value === 'number') {
          // Use general number format to preserve original decimal places
          cell.numFmt = 'General';
        }
        cell.alignment = { horizontal: 'start' };
      });
    });

    // Calculate totals
    const calculatedTotals = sales.reduce((acc, sale) => {
      acc.totalQuantity += Number(sale.quantity) || 0;
      acc.totalSubtotal += Number(sale.unit_price * sale.quantity) || 0;
      acc.totalInvoiceDiscount += Number(sale.inv_discount) || 0;
      acc.totalItemDiscount += Number(sale.item_discount) || 0;
      acc.totalSale += Number(sale.total_sale) || 0;
      acc.totalCost += Number(sale.total_cost) || 0;
      acc.totalProfit += Number(sale.profit) || 0;
      return acc;
    }, {
      totalQuantity: 0,
      totalSubtotal: 0,
      totalInvoiceDiscount: 0,
      totalItemDiscount: 0,
      totalSale: 0,
      totalCost: 0,
      totalProfit: 0
    });

    // Totals row - format with 2 decimal places
    const totalRowData = [];
    
    // Add empty cells for any groupBy columns
    if (!onlyCustomerGroup) totalRowData.push('');
    if (hasDateGroup) totalRowData.push('');
    if (hasCustomerGroup) totalRowData.push('');
    
    totalRowData.push(
      ...(showCustomerCount ? [''] : []),
      calculatedTotals.totalQuantity,
      calculatedTotals.totalSubtotal,
      calculatedTotals.totalInvoiceDiscount,
      calculatedTotals.totalItemDiscount,
      calculatedTotals.totalSale,
      calculatedTotals.totalCost,
      calculatedTotals.totalProfit
    );

    const totalRow = worksheet.addRow(totalRowData);
    totalRow.eachCell((cell, colNumber) => {
      const firstDataCol = 1 + 
        (!onlyCustomerGroup ? 1 : 0) + 
        (hasDateGroup ? 1 : 0) + 
        (hasCustomerGroup ? 1 : 0) + 
        (showCustomerCount ? 1 : 0);
      
      if (colNumber >= firstDataCol) {
        cell.font = { bold: true };
        // Format totals with 2 decimal places
        cell.numFmt = '#,##0.00';
        cell.alignment = { horizontal: 'right' };
        cell.border = {
          top: { style: 'thin' },
        };
      }
    });

    // Auto column width
    worksheet.columns.forEach((col) => {
      let max = 10;
      col.eachCell?.((cell) => {
        const val = cell.value ? cell.value.toString() : '';
        max = Math.max(max, val.length);
      });
      col.width = max + 2;
    });

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `sales-report-${dayjs().format('YYYY-MM-DD-HHmm')}.xlsx`);
    message.success('Excel file exported successfully');
  } catch (error) {
    console.error('Export error:', error);
    message.error('Failed to export Excel file');
  } finally {
    setExportLoading(false);
  }
}, [sales, userData.warehouse_name, appliedFilters]);

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

  // Filter handlers
  const handleApplyFilters = useCallback(() => {
    setAppliedFilters(pendingFilters);
    // message.info('Filters applied');
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
    setPagination({ first: 0, rows: 10 });
    message.info('Filters cleared');
  }, []);
const columns = useMemo(() => {
  const hasProductName = sales?.some(row => !!row.product_name);
  const hasDate = sales?.some(row => !!row["DATE(date)"]);

  const baseColumns = [
    hasProductName && {
      field: 'product_name',
      header: 'Product',
      sortable: true,
      style: { width: '20%', minWidth: '150px' },
      body: (rowData) => (
        <Text strong style={{ 
          fontFamily: "'Noto Sans Khmer', 'Khmer OS', Arial, sans-serif",
          display: 'block',
          textAlign: 'left'
        }}>
          {rowData.product_name}
        </Text>
      ),
    },
    hasDate && {
      field: 'date',
      header: 'Date',
      sortable: true,
      style: { width: '12%', minWidth: '100px', textAlign: 'center' },
      body: (rowData) => (
        <Text>
          {/* Access the date using string key */}
          {rowData["DATE(date)"] ? new Date(rowData["DATE(date)"]).toLocaleDateString() : ''}
        </Text>
      ),
    },
    {
      field: 'total_customers',
      header: 'Customers',
      sortable: true,
      style: { width: '8%', textAlign: 'start', minWidth: '80px' },
      body: (rowData) => <Text>{rowData.customer_name || rowData.customer_count || 0}</Text>,
    },
    {
      field: 'quantity',
      header: 'Sold QTY',
      sortable: true,
      style: { width: '8%', textAlign: 'center', minWidth: '80px' },
      body: (rowData) => <Text>{rowData.quantity || 0}</Text>,
    },
    {
      field: 'unit_price',
      header: 'Sub Amount',
      sortable: true,
      style: { width: '10%', textAlign: 'right', minWidth: '100px' },
      body: (rowData) => <Text>${Number(rowData?.unit_price * rowData.quantity || rowData.subtotal || 0).toFixed(2)}</Text>,
    },
    {
      field: 'inv_discount',
      header: 'Inv Dis',
      sortable: true,
      style: { width: '8%', textAlign: 'right', minWidth: '80px' },
      body: (rowData) => <Text>${parseFloat(rowData.inv_discount || 0).toFixed(2)}</Text>,
    },
    {
      field: 'item_discount',
      header: 'Item Dis',
      sortable: true,
      style: { width: '8%', textAlign: 'right', minWidth: '80px' },
      body: (rowData) => <Text>${parseFloat(rowData.item_discount || 0).toFixed(2)}</Text>,
    },
    {
      field: 'total_sale',
      header: 'Total Sale',
      sortable: true,
      style: { width: '8%', textAlign: 'right', minWidth: '80px' },
      body: (rowData) => <Text>${parseFloat(rowData.total_sale || 0).toFixed(2)}</Text>,
    },
    {
      field: 'total_cost',
      header: 'Cost',
      sortable: true,
      style: { width: '8%', textAlign: 'right', minWidth: '80px' },
      body: (rowData) => <Text>${parseFloat(rowData.total_cost || 0).toFixed(2)}</Text>
    },
    {
      field: 'total_cost',
      header: 'Total Cost',
      sortable: true,
      style: { width: '8%', textAlign: 'right', minWidth: '80px' },
      body: (rowData) => <Text>${parseFloat(rowData.total_cost * rowData.quantity).toFixed(2)}</Text>
    },
    {
      field: 'profit',
      header: 'Profit',
      sortable: true,
      style: { width: '8%', textAlign: 'right', minWidth: '80px' },
      body: (rowData) => (
        <Text style={{ color: (rowData.profit || 0) >= 0 ? '#52c41a' : '#f5222d' }}>
          ${parseFloat(rowData.total_sale - (rowData.total_cost * rowData.quantity)).toFixed(2)}
        </Text>
      ),
    },
  ];

  return baseColumns.filter(Boolean);
}, [sales]);


const CustomFooter = useMemo(() => {
  // Calculate totals
  const calculateTotals = () => {
    const totals = {
      totalQuantity: 0,
      totalSubtotal: 0,
      totalInvoiceDiscount: 0,
      totalItemDiscount: 0,
      totalSale: 0,
      totalCost: 0,
      totalProfit: 0,
      totalItems: 0
    };

    const isGroupedByCustomer = appliedFilters.groupBy.includes('customer');
    const isGroupedByDate = appliedFilters.groupBy.includes('date');
    const isGroupedByProduct = appliedFilters.groupBy.includes('product');
    const isCustomerOnly = isGroupedByCustomer && appliedFilters.groupBy.length === 1;

    sales.forEach((sale) => {
      totals.totalQuantity += Number(sale.quantity) || 0;
      totals.totalSubtotal += Number(sale.unit_price * sale.quantity) || 0;
      totals.totalInvoiceDiscount += Number(sale.inv_discount) || 0;
      totals.totalItemDiscount += Number(sale.item_discount) || 0;
      totals.totalSale += Number(sale.total_sale) || 0;
      totals.totalCost += Number(sale.total_cost * sale.quantity) || 0;
      totals.totalProfit += Number(sale.profit) || (sale.total_sale - (sale.total_cost * sale.quantity)) || 0;
      totals.totalItems += 1;
    });

    return totals;
  };

  const footerTotals = calculateTotals();
  const isGroupedByCustomer = appliedFilters.groupBy.includes('customer');
  const isGroupedByDate = appliedFilters.groupBy.includes('date');
  const isGroupedByProduct = appliedFilters.groupBy.includes('product');
  const isCustomerOnly = isGroupedByCustomer && appliedFilters.groupBy.length === 1;
  const isProductOnly = isGroupedByProduct && appliedFilters.groupBy.length === 1;
  const allThreeGroupings = isGroupedByProduct && isGroupedByDate && isGroupedByCustomer;

  // Determine column visibility
  const showCustomerColumn = isGroupedByCustomer;
  const showCustomerCount = !isGroupedByCustomer;
  const showProductColumn = isGroupedByProduct && !isProductOnly;
  const showDateColumn = isGroupedByDate && !isCustomerOnly;

  // Calculate dynamic widths
  const productColWidth = allThreeGroupings ? '200px' : '270px';
  const dateColWidth = allThreeGroupings ? '100px' : '120px';
  const customerColWidth = isCustomerOnly ? '270px' : '100px';
  const quantityWidth = allThreeGroupings ? '160px' : '80px';
  const subAmountWidth = allThreeGroupings ? '100px' : '120px';
  const discountWidth = allThreeGroupings ? '100px' : '120px';
  const totalSaleWidth = allThreeGroupings ? '80px' : '120px';
  const costWidth = '100px';
  const profitWidth = allThreeGroupings ? '120px' : '100px';

  // Determine column template based on grouping
  const getGridTemplateColumns = () => {
    if (isCustomerOnly) {
      return [
        '270px', // Customer name
        '80px',  // Quantity
        '120px', // Sub Amount
        '120px', // Invoice Discount
        '120px', // Item Discount
        '120px', // Total Sale
        '100px', // Cost
        '100px', // Total Cost
        '100px'  // Profit
      ].join(' ');
    }
    
    return [
      isProductOnly ? '270px' : (showProductColumn && productColWidth),
      showDateColumn && dateColWidth,
      showCustomerCount && customerColWidth,
      quantityWidth,
      subAmountWidth,
      discountWidth,
      discountWidth,
      totalSaleWidth,
      costWidth,
      costWidth,
      profitWidth
    ].filter(Boolean).join(' ');
  };

  // Determine column positions
  const getColumnPosition = (basePosition) => {
    if (isCustomerOnly) {
      return basePosition > 1 ? basePosition + 0 : basePosition;
    }
    return basePosition;
  };

  return (
    <div style={{
      width: '100%',
      background: '#f8f9fa',
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: getGridTemplateColumns(),
        minWidth: '100%',
        width: 'fit-content'
      }}>
        {/* Total label */}
        <div style={{
          padding: '0.5rem',
          fontWeight: 'bold',
          position: 'sticky',
          left: 0,
          background: '#f8f9fa',
          gridColumn: '1'
        }}>
          Total
        </div>

        {/* Customer column - only shown when grouped by customer */}
        {showCustomerColumn && isCustomerOnly && (
          <div style={{
            padding: '0.5rem',
            gridColumn: '2'
          }}></div>
        )}

        {/* Quantity */}
        <div style={{
          padding: '0.5rem',
          textAlign: 'center',
          gridColumn: getColumnPosition(isCustomerOnly ? 3 : (
            showCustomerCount ? 
              (showDateColumn ? (showProductColumn ? '5' : '4') : 
              (showProductColumn ? '4' : '3')) : 
              (showDateColumn ? (showProductColumn ? '4' : '3') : 
              (showProductColumn ? '3' : '2'))
          ))
        }}>
          {footerTotals.totalQuantity}
        </div>

        {/* Sub Amount */}
        <div style={{
          padding: '0.5rem',
          textAlign: 'right',
          gridColumn: getColumnPosition(isCustomerOnly ? 4 : (
            showCustomerCount ? 
              (showDateColumn ? (showProductColumn ? '6' : '5') : 
              (showProductColumn ? '5' : '4')) : 
              (showDateColumn ? (showProductColumn ? '5' : '4') : 
              (showProductColumn ? '4' : '3'))
          ))
        }}>
          ${footerTotals.totalSubtotal.toFixed(2)}
        </div>

        {/* Invoice Discount */}
        <div style={{
          padding: '0.5rem',
          textAlign: 'right',
          gridColumn: getColumnPosition(isCustomerOnly ? 5 : (
            showCustomerCount ? 
              (showDateColumn ? (showProductColumn ? '7' : '6') : 
              (showProductColumn ? '6' : '5')) : 
              (showDateColumn ? (showProductColumn ? '6' : '5') : 
              (showProductColumn ? '5' : '4'))
          ))
        }}>
          ${footerTotals.totalInvoiceDiscount.toFixed(2)}
        </div>

        {/* Item Discount */}
        <div style={{
          padding: '0.5rem',
          textAlign: 'right',
          gridColumn: getColumnPosition(isCustomerOnly ? 6 : (
            showCustomerCount ? 
              (showDateColumn ? (showProductColumn ? '8' : '7') : 
              (showProductColumn ? '7' : '6')) : 
              (showDateColumn ? (showProductColumn ? '7' : '6') : 
              (showProductColumn ? '6' : '5'))
          ))
        }}>
          ${footerTotals.totalItemDiscount.toFixed(2)}
        </div>

        {/* Total Sale */}
        <div style={{
          padding: '0.5rem',
          textAlign: 'right',
          gridColumn: getColumnPosition(isCustomerOnly ? 7 : (
            showCustomerCount ? 
              (showDateColumn ? (showProductColumn ? '9' : '8') : 
              (showProductColumn ? '8' : '7')) : 
              (showDateColumn ? (showProductColumn ? '8' : '7') : 
              (showProductColumn ? '7' : '6'))
          ))
        }}>
          ${footerTotals.totalSale.toFixed(2)}
        </div>

        {/* Empty Cost cell */}
        <div style={{
          padding: '0.5rem',
          textAlign: 'right',
          gridColumn: getColumnPosition(isCustomerOnly ? 8 : (
            showCustomerCount ? 
              (showDateColumn ? (showProductColumn ? '10' : '9') : 
              (showProductColumn ? '9' : '8')) : 
              (showDateColumn ? (showProductColumn ? '9' : '8') : 
              (showProductColumn ? '8' : '7'))
          ))
        }}></div>

        {/* Total Cost */}
        <div style={{
          padding: '0.5rem',
          textAlign: 'right',
          gridColumn: getColumnPosition(isCustomerOnly ? 9 : (
            showCustomerCount ? 
              (showDateColumn ? (showProductColumn ? '11' : '10') : 
              (showProductColumn ? '10' : '9')) : 
              (showDateColumn ? (showProductColumn ? '10' : '9') : 
              (showProductColumn ? '9' : '8'))
          ))
        }}>
          ${footerTotals.totalCost.toFixed(2)}
        </div>

        {/* Profit */}
        <div style={{
          padding: '0.5rem',
          textAlign: 'right',
          color: footerTotals.totalProfit >= 0 ? '#52c41a' : '#f5222d',
          gridColumn: getColumnPosition(isCustomerOnly ? 10 : (
            showCustomerCount ? 
              (showDateColumn ? (showProductColumn ? '12' : '11') : 
              (showProductColumn ? '11' : '10')) : 
              (showDateColumn ? (showProductColumn ? '11' : '10') : 
              (showProductColumn ? '10' : '9'))
          ))
        }}>
          ${footerTotals.totalProfit.toFixed(2)}
        </div>
      </div>
    </div>
  );
}, [sales, appliedFilters.groupBy]);

  // Error handling
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
                Sales Reports
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

        {/* Filter Section */}
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
              {/* <Option value="invoice">Invoice</Option> */}
              {/* <Option value="sales_person">Sales Person</Option> */}
              {/* <Option value="warehouse">Warehouse</Option> */}
              {/* <Option value="customer_type">Customer Type</Option> */}
              {/* <Option value="category">Category</Option> */}
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

        {/* DataTable Section */}
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
            style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
          >
            <DataTable
              value={sales}
              selection={sales.filter((row) => selectedRows.includes(row.id))}
              onSelectionChange={handleRowSelected}
              dataKey="id"
              scrollable
              scrollHeight="600px"
              sortMode="multiple"
              footer={CustomFooter}
              tableStyle={{ minWidth: '100%', }}
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