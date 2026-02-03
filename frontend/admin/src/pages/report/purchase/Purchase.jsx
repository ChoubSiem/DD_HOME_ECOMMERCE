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
import './Purchase.css';
import { useUser } from '../../../hooks/UserUser';
import { useCompany } from "../../../hooks/UseCompnay";
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
    receiver: 'all',
    warehouse: 'all',
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
  const [warehouses, setWarehouses] = useState([]);
  const { handleSuppliers, handleEmployee, } = useUser();
  const {handleWarehouse} = useCompany();
  // User data and auth
  const userData = useMemo(() => JSON.parse(Cookies.get('user') || '{}'), []);
  const token = localStorage.getItem('token');

  const handleSuppliersData = async () => {
    let results = await handleSuppliers(token);    
    if (results.success) {
      setSuppliers(results.suppliers);
    }
  };

  const handleRecieversData = async () => {
    let results = await handleEmployee(token);        
    if (results.success) {
      setEmployees(results.employees);
    }
  };

  const handleWarehousesData = async () => {
    let results = await handleWarehouse(token);
    if (results.success) {
      setWarehouses(results.warehouses);
    }
  };

  // Fetch data with filters
const fetchPurchaseData = async () => {
  try {
    setIsLoading(true);
    
    // Prepare all parameters in a single object
    const params = {
      warehouse_id: filters.warehouse === 'company' ? 'company' : 
                  (filters.warehouse !== 'all' ? filters.warehouse : 'all'),
      supplier_search: filters.supplier !== 'all' ? [filters.supplier] : [],
      receiver_search: filters.receiver !== 'all' ? [filters.receiver] : [],
      product_search: filters.searchTerm || '',
      start_date: filters.dateRange?.[0]?.format('YYYY-MM-DD'),
      end_date: filters.dateRange?.[1]?.format('YYYY-MM-DD')
    };

    // Make the API call with token and all parameters in one object
    const response = await getPurchaseReportData(
      params ,// All parameters sent as single object
      token,

    );

    if (response.success) {
      setPurchases(response.purchases || []);
      setError(null);
    }
  } catch (err) {
    setError(err);
    message.error('Failed to load purchase data');
    console.error('Purchase data fetch error:', err);
  } finally {
    setIsLoading(false);
  }
};

  useEffect(() => {
    fetchPurchaseData();
    handleSuppliersData();
    handleRecieversData();
    handleWarehousesData();
  }, []);

  // Debounced search
  const debouncedSetSearch = useMemo(
    () => debounce((value) => {
      setFilters(prev => ({ ...prev, searchTerm: value }));
      fetchPurchaseData();
    }, 500),
    []
  );

  useEffect(() => {
    return () => {
      debouncedSetSearch.cancel();
    };
  }, [debouncedSetSearch]);

  // Filter purchases locally (for quick UI updates)
  const filteredPurchases = useMemo(() => {
    if (!purchases.length) return [];

    const { searchTerm } = filters;
    const lowerSearch = searchTerm.toLowerCase();

    return purchases.filter((purchase) => {
      const productCode = purchase.product_code?.toString().toLowerCase() || '';
      const productName = purchase.product_name?.toLowerCase() || '';
      const supplierName = purchase.supplier?.toLowerCase() || '';
      const receiverName = purchase.receivedBy?.toLowerCase() || '';

      return (
        !searchTerm ||
        productCode.includes(lowerSearch) ||
        productName.includes(lowerSearch) ||
        supplierName.includes(lowerSearch) ||
        receiverName.includes(lowerSearch)
      );
    });
  }, [purchases, filters.searchTerm]);

  // Combined totals and stats
  const { totals } = useMemo(() => {
    const totals = {
      totalQuantity: 0,
      totalCost: 0,
    };

    filteredPurchases.forEach((purchase) => {
      totals.totalQuantity += purchase.qty || 0;
      totals.totalCost += Number(purchase.total_cost) || 0;
    });

    return { totals };
  }, [filteredPurchases]);

// Export to Excel
const handleExportExcel = useCallback(async () => {
  setExportLoading(true);
  try {
    if (!filteredPurchases.length) {
      message.warning('No data available to export');
      return;
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Purchases Report');

    // Header
    worksheet.mergeCells('A1:L1');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = 'Purchase Report';
    titleCell.font = { size: 16, bold: true };
    titleCell.alignment = { horizontal: 'center' };

    worksheet.mergeCells('A2:L2');
    const nameCell = worksheet.getCell('A2');
    nameCell.value = 'DD Home';
    nameCell.font = { size: 14, bold: true };
    nameCell.alignment = { horizontal: 'center' };

    worksheet.mergeCells('A3:G3');
    const addrCell = worksheet.getCell('A3');
    addrCell.value = 'Address: Nº114, St.20MC, Chamroeun Phal, Phnom Penh, Cambodia';
    addrCell.alignment = { horizontal: 'left' };

    worksheet.mergeCells('H3:L3');
    const phoneCell = worksheet.getCell('H3');
    phoneCell.value = 'Phone: 081 90 50 50';
    phoneCell.alignment = { horizontal: 'right' };

    worksheet.addRow([`View By Outlet: ${filters.warehouse !== 'all' ? 
      warehouses.find(w => w.id === filters.warehouse)?.name || 'Company' : 
      'All Warehouses'}`]);
    worksheet.mergeCells('A5:D5');

    worksheet.getCell('A5').value = 'View As: Detail';

    worksheet.mergeCells('E5:G5');
    worksheet.getCell('E5').value =
      `From ${filters.dateRange?.[0] ? filters.dateRange[0].format('YYYY-MM-DD') : 'N/A'}`;

    worksheet.mergeCells('H5 :L5');
    worksheet.getCell('H5').value =
      `To ${filters.dateRange?.[1] ? filters.dateRange[1].format('YYYY-MM-DD') : 'N/A'}`;

    // Table headers
    const headers = [
      'No.',
      'Date',
      'Warehouse',
      'Supplier',
      'Code',
      'Barcode',
      'Description',
      'UOM',
      'QTY',
      'Unit Cost',
      'Total Cost',
      'Received By'
    ];

    const headerRow = worksheet.addRow(headers);
    headerRow.eachCell((cell) => {
      cell.font = { bold: true };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD3D3D3' } };
      cell.border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
    });

    // Data rows
    let totalQty = 0;
    let totalCost = 0;

    console.log('Warehouse filter value:', filters.warehouse);
    console.log('Sample purchase:', filteredPurchases[0]);

    filteredPurchases.forEach((purchase, index) => {

      const rowQty = purchase.qty || 0;
      const rowCost = purchase.total_cost || 0;
      
      totalQty += rowQty;
      totalCost += rowCost;

      const row = worksheet.addRow([
        index + 1,
        purchase.date ? dayjs(purchase.date).format('YYYY-MM-DD') : 'N/A',
        purchase.warehouse_name || 'N/A',
        purchase.supplier || 'N/A',
        purchase.product_code || 'N/A',
        purchase.barcode || 'N/A',
        purchase.product_name || 'N/A',
        purchase.uom || 'N/A',
        rowQty,
        purchase.cost || 0,
        rowCost,
        purchase.receivedBy || 'N/A',
      ]);

      // Format numeric cells
      row.eachCell((cell, colNumber) => {
        // QTY
        if (colNumber === 9) {
          cell.numFmt = '#,##0';
          cell.alignment = { horizontal: 'center' };
        }

        // Unit Cost & Total Cost
        else if (colNumber === 10 || colNumber === 11) {
          cell.numFmt = '#,##0.00';
          cell.alignment = { horizontal: 'center' };
        }

        // Row number & Date
        else if (colNumber === 1 || colNumber === 2) {
          cell.alignment = { horizontal: 'center' };
        }

        else if (colNumber === 5 || colNumber === 6) {
          cell.alignment = { horizontal: 'center'};
        }

        // Description
        else if (colNumber === 7) {
          cell.alignment = { horizontal: 'left'};
        }

        else if (colNumber === 8) {
          cell.alignment = { horizontal: 'center'};
        }

        // Everything else
        else {
          cell.alignment = { horizontal: 'left' };
        }
      });
    });

    // Add total row
    const totalRow = worksheet.addRow([
      '', '', '', '', '', '', 'TOTAL:',
      '',
      totalQty,
      '', 
      totalCost,
      ''
    ]);

    // Format total row
    totalRow.eachCell((cell, colNumber) => {
      if (colNumber === 7) { // "TOTAL" label
        cell.font = { bold: true };
      }
      if ([9, 11].includes(colNumber)) { // QTY and Total Cost columns
        cell.font = { bold: true };
        cell.numFmt = colNumber === 9 ? '#,##0' : '#,##0.00'; // QTY without decimals
        cell.alignment = { horizontal: 'center' };
      }
    });

    // Set column widths
    worksheet.columns = [
      { width: 5 }, { width: 12 }, { width: 20 }, { width: 18 }, 
      { width: 9 }, { width: 9 }, { width: 48 }, { width: 10 },
      { width: 10 }, { width: 10 }, { width: 12 }, { width: 18 }
    ];

    // Generate and download
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `purchases-report-${dayjs().format('YYYY-MM-DD-HHmm')}.xlsx`);
    message.success('Purchase report exported successfully');
  } catch (error) {
    console.error('Export error:', error);
    message.error('Failed to export purchase report');
  } finally {
    setExportLoading(false);
  }
}, [filteredPurchases, filters, warehouses]);

  // Clear filters
  const handleClearFilters = useCallback(() => {
    setFilters({
      searchTerm: '',
      status: 'all',
      dateRange: null,
      supplier: 'all',
      receiver: 'all',
      warehouse: 'all',
      reportType: 'all',
      purchaseType: 'all',
    });
    setSelectedRows([]);
    fetchPurchaseData();
  }, []);

  // Apply filters
  const handleApplyFilters = useCallback(() => {
    fetchPurchaseData();
  }, [filters]);

  // Column definitions
  const columns = useMemo(() => [
    {
      field: 'product_code',
      header: 'Code',
      sortable: true,
      style: { width: '10%' },
      body: (rowData) => <Text strong>{rowData.product_code || 'N/A'}</Text>,
    },
    {
      field: 'product_name',
      header: 'Product Name',
      sortable: true,
      style: { width: '20%' },
      body: (rowData) => (
        <Text strong style={{ fontFamily: "'Noto Sans Khmer', 'Khmer OS', Arial, sans-serif" }}>
          {rowData.product_name || 'N/A'}
        </Text>
      ),
    },
    {
      field: 'supplier',
      header: 'Supplier',
      sortable: true,
      style: { width: '15%' },
    },
    {
      field: 'qty',
      header: 'QTY',
      sortable: true,
      style: { width: '8%', textAlign: 'center' },
    },
    {
      field: 'cost',
      header: 'Unit Cost',
      sortable: true,
      style: { width: '10%', textAlign: 'right' },
      body: (rowData) => <Text>${Number(rowData.cost || 0).toFixed(2)}</Text>,
    },
    {
      field: 'uom',
      header: 'UOM',
      sortable: true,
      style: { width: '8%', textAlign: 'center' },
    },
    {
      field: 'total_cost',
      header: 'Total Cost',
      sortable: true,
      style: { width: '10%', textAlign: 'right' },
      body: (rowData) => <Text>${Number(rowData.total_cost || 0).toFixed(2)}</Text>,
    },
    {
      field: 'receivedBy',
      header: 'Received By',
      sortable: true,
      style: { width: '12%' },
    },
    {
      field: 'warehouse_name',
      header: 'Warehouse',
      sortable: true,
      style: { width: '12%' },
    },
  ], []);

  // Footer component
 const CustomFooter = useMemo(
    () => (
      <div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '17% 32% 5% 8% 7% 10% 8% 8% 10% 8%',
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

  return (
    <Spin spinning={isLoading || exportLoading} tip={exportLoading ? 'Exporting...' : 'Loading...'}>
      <div>
        {/* Header Section */}
        <Card style={{ marginBottom: 24, background: '#f0f5ff' }}>
          <Row align="middle" justify="space-between">
            <Col>
              <Title level={3} style={{ margin: 0, color: '#1d39c4' }}>Purchase Reports</Title>
              <Text type="secondary">Analyze product purchase performance</Text>
            </Col>
            <Col>
              <ShoppingCartOutlined style={{ fontSize: 48, color: '#adc6ff' }} />
            </Col>
          </Row>
        </Card>

        {/* Filter Section */}
        <Card style={{ marginBottom: 24 }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={6}>
              <Search
                placeholder="Search purchases"
                onChange={(e) => debouncedSetSearch(e.target.value)}
                allowClear
                size="large"
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Select
                style={{ width: '100%' }}
                placeholder="Select Warehouse"
                value={filters.warehouse}
                onChange={(value) => setFilters(prev => ({ ...prev, warehouse: value }))}
                size="large"
              >
                <Option value="all">All Warehouses</Option>
                <Option value="company">Company</Option>
                {warehouses.map(warehouse => (
                  <Option key={warehouse.id} value={warehouse.id}>
                    {warehouse.warehouse_name}
                  </Option>
                ))}
              </Select>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Select
                style={{ width: '100%' }}
                placeholder="Select Supplier"
                value={filters.supplier}
                onChange={(value) => setFilters(prev => ({ ...prev, supplier: value }))}
                size="large"
                showSearch
                optionFilterProp="children"
              >
                <Option value="all">All Suppliers</Option>
                {suppliers.map(supplier => (
                  <Option key={supplier.id} value={supplier.id}>
                    {supplier.username}
                  </Option>
                ))}
              </Select>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Select
                style={{ width: '100%' }}
                placeholder="Select Receiver"
                value={filters.receiver}
                onChange={(value) => setFilters(prev => ({ ...prev, receiver: value }))}
                size="large"
                showSearch
                optionFilterProp="children"
              >
                <Option value="all">All Receivers</Option>
                {employees.map(employee => (
                  <Option key={employee.id} value={employee.id}>
                    {employee.username}
                  </Option>
                ))}
              </Select>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <RangePicker
                style={{ width: '100%' }}
                value={filters.dateRange}
                onChange={(dates) => setFilters(prev => ({ ...prev, dateRange: dates }))}
                size="large"
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Button
                type="primary"
                icon={<SearchOutlined />}
                onClick={handleApplyFilters}
                size="large"
                style={{ width: '100%' }}
              >
                Apply Filters
              </Button>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Button
                icon={<ClearOutlined />}
                onClick={handleClearFilters}
                size="large"
                style={{ width: '100%' }}
              >
                Clear Filters
              </Button>
            </Col>
          </Row>
        </Card>

        {/* DataTable Section */}
        <Card
          title="Purchase Details"
          extra={
            <Space>
              <Button
                icon={<FileExcelOutlined />}
                onClick={handleExportExcel}
                loading={exportLoading}
                style={{ backgroundColor: '#52c41a', color: 'white' }}
              >
                Export Excel
              </Button>
            </Space>
          }
        >
          <DataTable
            value={filteredPurchases}
            scrollable
            scrollHeight="600px"
            footer={CustomFooter}
            loading={isLoading}
          >
            {columns.map((col, index) => (
              <Column
                key={index}
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
    </Spin>
  );
};

export default PurchaseReports;