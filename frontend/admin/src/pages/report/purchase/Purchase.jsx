import React, { useEffect, useState, useCallback } from 'react';
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
  message
} from 'antd';
import {
  SearchOutlined,
  FilterOutlined,
  DownloadOutlined,
  PrinterOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  ShoppingCartOutlined,
  ClearOutlined
} from '@ant-design/icons';
import DataTable from 'react-data-table-component';
import { useReport } from '../../../hooks/UseReport';
import Cookies from 'js-cookie';
import * as XLSX from 'xlsx';

const { Search } = Input;
const { Option } = Select;

function PurchaseReports() {
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [supplierFilter, setSupplierFilter] = useState('all');
  const [reportType, setReportType] = useState('all');
  const [purchaseTypeFilter, setPurchaseTypeFilter] = useState('all');

  // Data states
  const [purchases, setPurchases] = useState([]);
  const [filteredPurchases, setFilteredPurchases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);

  // Hooks and user data
  const { getPurchaseReportData } = useReport();
  const token = localStorage.getItem('token');
  const userData = JSON.parse(Cookies.get('user') || '{}');

  // Fetch purchase data on component mount
  useEffect(() => {
    fetchPurchaseData();
  }, []);

  const fetchPurchaseData = async () => {
    setLoading(true);
    try {
      const result = await getPurchaseReportData(userData.warehouse_id, token);
      console.log(result);
      
      if (result.success) {
        setPurchases(result.purchases);
        setFilteredPurchases(result.purchases);
      } else {
        message.error('Failed to fetch purchase data');
      }
    } catch (error) {
      message.error('Error fetching purchase data');
    } finally {
      setLoading(false);
    }
  };

  // Get unique suppliers for filter dropdown
  const suppliers = [...new Set(purchases.map(purchase => purchase.supplier?.name || '').filter(Boolean))];

  // Apply filters when search is clicked
  const handleSearch = () => {
    setLoading(true);
    
    const filtered = purchases.filter(purchase => {
      // Search term matching
      const matchesSearch = searchTerm === '' || 
        (purchase.id && purchase.id.toString().toLowerCase().includes(searchTerm.toLowerCase())) ||
        (purchase.supplier?.name && purchase.supplier.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (purchase.product_name && purchase.product_name.toLowerCase().includes(searchTerm.toLowerCase()));
      
      // Status filter
      const matchesStatus = statusFilter === 'all' || purchase.status === statusFilter;
      
      // Supplier filter
      const matchesSupplier = supplierFilter === 'all' || purchase.supplier?.name === supplierFilter;
      
      // Purchase type filter
      const matchesPurchaseType = purchaseTypeFilter === 'all' || 
        (purchase.type && purchase.type.toLowerCase() === purchaseTypeFilter.toLowerCase());
      
      // Date filtering
      let matchesDate = true;
      if (startDate && endDate) {
        try {
          const purchaseDate = new Date(purchase.date);
          const start = new Date(startDate);
          start.setHours(0, 0, 0, 0);
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          matchesDate = purchaseDate >= start && purchaseDate <= end;
        } catch (error) {
          console.error('Error parsing dates:', error);
          matchesDate = false;
        }
      }

      // Report type filtering
      let matchesReportType = true;
      if (reportType !== 'all') {
        const purchaseDate = new Date(purchase.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (reportType === 'daily') {
          matchesReportType = purchaseDate.toDateString() === today.toDateString();
        } else if (reportType === 'monthly') {
          matchesReportType = purchaseDate.getMonth() === today.getMonth() && 
                            purchaseDate.getFullYear() === today.getFullYear();
        }
      }

      return matchesSearch && matchesStatus && matchesSupplier && 
             matchesPurchaseType && matchesDate && matchesReportType;
    });

    setFilteredPurchases(filtered);
    setLoading(false);
  };

  // Clear all filters
  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setStartDate(null);
    setEndDate(null);
    setSupplierFilter('all');
    setReportType('all');
    setPurchaseTypeFilter('all');
    setFilteredPurchases(purchases);
  };

  // Export to Excel
  const handleExportExcel = () => {
    if (selectedRows.length === 0) {
      message.error("Please select items to export");
      return;
    }

    const selectedPurchases = purchases.filter(purchase => selectedRows.includes(purchase.id));
    const exportData = selectedPurchases.map(purchase => ({
      'Product Name': purchase.product_name,
      'Purchase Date': new Date(purchase.date).toLocaleDateString(),
      'Supplier': purchase.supplier?.name || 'N/A',
      'Quantity Purchased': purchase.quantity,
      'Unit Cost': purchase.unit_cost,
      'Total Cost': purchase.total_cost,
      'Tax Amount': purchase.tax_amount,
      'Shipping Cost': purchase.shipping_cost,
      'Grand Total': purchase.grand_total,
      'Status': purchase.status
    }));

    try {
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Purchase Report');
      XLSX.writeFile(workbook, 'Purchase_Report.xlsx');
    } catch (error) {
      console.error('Export error:', error);
      message.error('Failed to export data');
    }
  };

  // Handle row selection
  const handleRowSelected = useCallback((state) => {
    setSelectedRows(state.selectedRows.map(row => row.id));
  }, []);

  // Calculate totals for footer
const calculateTotals = () => {
  return {
    totalQuantity: filteredPurchases.reduce((sum, row) => sum + (row.quantity || 0), 0),
    totalUnitCost: filteredPurchases.reduce((sum, row) => sum + (row.unit_cost || 0), 0),
    totalCost: filteredPurchases.reduce((sum, row) => sum + (row.total_cost || 0), 0)
  };
};

  const totals = calculateTotals();

const CustomFooter = () => {
  return (
    <div style={{ 
      display: 'grid',
      gridTemplateColumns: '12% 12% 20% 8% 8% 10% 12% 18%',
      width: '100%',
      padding: '10px 0',
      background: '#fafafa',
      borderTop: '1px solid #f0f0f0',
      marginTop: '-1px',
      fontSize: '14px'
    }}>
      <div style={{ padding: '0 0px', textAlign: 'left'}}>
        <strong>Total</strong>
      </div>
      <div style={{ padding: '0 8px', textAlign: 'center' }}></div>
      <div style={{ padding: '0 8px', textAlign: 'center' }}></div>
      <div style={{ padding: '0 8px', textAlign: 'right'  }}>
        <strong>{totals?.totalQuantity}</strong>
      </div>
      <div style={{ padding: '0 8px', textAlign: 'center' }}></div>
      <div style={{ padding: '0 8px', textAlign: 'right' }}>
        <strong>${totals?.totalUnitCost}</strong>
      </div>
      <div style={{ padding: '0 8px', textAlign: 'right' }}>
        <strong>${totals?.totalCost}</strong>
      </div>
      <div style={{ padding: '0 8px', textAlign: 'center' }}></div>
    </div>
  );
};

  // Table columns
const columns = [
  {
    name: 'Product Code',
    selector: row => row.product_code || 'N/A',
    sortable: true,
    width: '12%',
    cell: row => (
      <strong>{row.product_code || 'N/A'}</strong>
    )
  },
  {
    name: 'Barcode',
    selector: row => row.barcode || 'N/A',
    sortable: true,
    width: '12%'
  },
  {
    name: 'Description',
    selector: row => row.description || row.product_name || 'N/A',
    sortable: true,
    width: '20%',
    cell: row => (
      <div style={{ fontFamily: "'Noto Sans Khmer', 'Khmer OS', Arial, sans-serif" }}>
        {row.description || row.product_name || 'N/A'}
      </div>
    )
  },
  {
    name: 'QTY',
    selector: row => row.qty,
    sortable: true,
    width: '8%',
    right: true,
    cell: row => <span>{row.qty}</span>
  },
  {
    name: 'UOM',
    selector: row => row.uom || 'EA',
    sortable: true,
    width: '8%',
    center: true,
    cell: row => <span>{row.uom || 'EA'}</span>
  },
  {
    name: 'Cost',
    selector: row => row.cost,
    sortable: true,
    width: '10%',
    right: true,
    cell: row => <span>${row?.cost || '0.00'}</span>
  },
  {
    name: 'Total Cost',
    selector: row => row.total_cost,
    sortable: true,
    width: '12%',
    right: true,
    cell: row => <span>${row?.total_cost || '0.00'}</span>
  },
  {
    name: 'Received By',
    selector: row => row.received_by || 'N/A',
    sortable: true,
    width: '18%',
    cell: row => <span>{row.received_by || 'N/A'}</span>
  }
];

  // Calculate summary statistics
  const totalPurchases = filteredPurchases.length;
  const totalSpent = filteredPurchases.reduce((sum, purchase) => sum + (purchase.grand_total || 0), 0);
  const completedPurchases = filteredPurchases.filter(purchase => purchase.status === 'completed').length;
  const pendingPurchases = filteredPurchases.filter(purchase => purchase.status === 'pending').length;
  const cancelledPurchases = filteredPurchases.filter(purchase => purchase.status === 'cancelled').length;
  const completionRate = totalPurchases > 0 ? Math.round((completedPurchases / totalPurchases) * 100) : 0;

  return (
    <Spin spinning={loading}>
      <div style={{ padding: '24px' }}>
        {/* Header Card */}
        <Card style={{ marginBottom: 24, background: '#f0f5ff' }}>
          <Row align="middle" justify="space-between">
            <Col>
              <h1 style={{ margin: 0, color: '#1d39c4' }}>Purchase Reports</h1>
              <p style={{ margin: 0, color: '#8c8c8c' }}>
                Track and analyze purchase orders
              </p>
            </Col>
            <Col>
              <ShoppingCartOutlined style={{ fontSize: 48, color: '#adc6ff', opacity: 0.8 }} />
            </Col>
          </Row>
        </Card>

        {/* Filter Card */}
        <Card
          className="report-filters"
          style={{
            marginBottom: '24px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
          }}
        >
          <Row gutter={[16, 16]}>
            <Col span={6}>
              <Search
                placeholder="Search product or supplier"
                prefix={<SearchOutlined style={{ color: '#1890ff' }} />}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                allowClear
                size="large"
              />
            </Col>

            <Col span={6}>
              <Select
                style={{ width: '100%' }}
                placeholder="Filter by status"
                value={statusFilter}
                onChange={setStatusFilter}
                allowClear
                suffixIcon={<FilterOutlined style={{ color: '#1890ff' }} />}
                size="large"
              >
                <Option value="all">All Statuses</Option>
                <Option value="completed">Completed</Option>
                <Option value="pending">Pending</Option>
                <Option value="cancelled">Cancelled</Option>
              </Select>
            </Col>

            <Col span={6}>
              <Select
                style={{ width: '100%' }}
                placeholder="Filter by supplier"
                value={supplierFilter}
                onChange={setSupplierFilter}
                allowClear
                suffixIcon={<FilterOutlined style={{ color: '#1890ff' }} />}
                size="large"
              >
                <Option value="all">All Suppliers</Option>
                {suppliers.map(supplier => (
                  <Option key={supplier} value={supplier}>{supplier}</Option>
                ))}
              </Select>
            </Col>

            <Col span={6}>
              <Select
                style={{ width: '100%' }}
                placeholder="Filter by purchase type"
                value={purchaseTypeFilter}
                onChange={setPurchaseTypeFilter}
                allowClear
                suffixIcon={<FilterOutlined style={{ color: '#1890ff' }} />}
                size="large"
              >
                <Option value="all">All Purchase Types</Option>
                <Option value="regular">Regular</Option>
                <Option value="bulk">Bulk</Option>
                <Option value="emergency">Emergency</Option>
              </Select>
            </Col>

            <Col span={6}>
              <DatePicker
                style={{ width: '100%' }}
                placeholder="Start Date"
                value={startDate}
                onChange={setStartDate}
                size="large"
                disabled={reportType !== 'all'}
                showTime={{ format: 'HH:mm' }}
                format="YYYY-MM-DD HH:mm"
              />
            </Col>

            <Col span={6}>
              <DatePicker
                style={{ width: '100%' }}
                placeholder="End Date"
                value={endDate}
                onChange={setEndDate}
                size="large"
                disabled={reportType !== 'all'}
                showTime={{ format: 'HH:mm' }}
                format="YYYY-MM-DD HH:mm"
              />
            </Col>

            <Col span={6}>
              <Select
                style={{ width: '100%' }}
                placeholder="Report Type"
                value={reportType}
                onChange={setReportType}
                allowClear
                size="large"
              >
                <Option value="all">All Time</Option>
                <Option value="daily">Today</Option>
                <Option value="monthly">This Month</Option>
              </Select>
            </Col>

            <Col span={3}>
              <Button
                type="primary"
                icon={<SearchOutlined />}
                onClick={handleSearch}
                size="large"
                style={{
                  width: '100%',
                  backgroundColor: '#1890ff',
                  borderColor: '#1890ff',
                  fontWeight: 600
                }}
              >
                Search
              </Button>
            </Col>

            <Col span={3}>
              <Button
                type="default"
                icon={<ClearOutlined />}
                onClick={handleClearFilters}
                size="large"
                style={{
                  width: '100%',
                  fontWeight: 600
                }}
              >
                Clear
              </Button>
            </Col>
          </Row>
        </Card>


        {/* Data Table Card */}
        <Card
          title="Purchase Report Details"
          extra={
            <Space>
              <Button
                icon={<DownloadOutlined />}
                onClick={handleExportExcel}
                disabled={selectedRows.length === 0}
              >
                Export
              </Button>
              <Button icon={<PrinterOutlined />} onClick={() => window.print()}>
                Print
              </Button>
            </Space>
          }
          style={{
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
            overflow: 'hidden'
          }}
        >
          <div style={{ position: 'relative' }}>
            <DataTable
              columns={columns}
              data={filteredPurchases}
              pagination
              paginationPerPage={10}
              paginationRowsPerPageOptions={[10, 25, 50, 100]}
              highlightOnHover
              selectableRows
              onSelectedRowsChange={handleRowSelected}
              customStyles={{
                head: {
                  style: {
                    fontSize: '14px',
                    fontWeight: 600,
                    paddingLeft: '0',
                    paddingRight: '0',
                  },
                },
                headRow: {
                  style: {
                    backgroundColor: '#f8f8f8',
                    borderBottomWidth: '1px',
                    borderBottomColor: '#e7e7e7',
                    borderBottomStyle: 'solid',
                  },
                },
                headCells: {
                  style: {
                    paddingLeft: '12px',
                    paddingRight: '12px',
                    color: '#333',
                  },
                },
                cells: {
                  style: {
                    paddingLeft: '12px',
                    paddingRight: '12px',
                    fontSize: '13px',
                  },
                },
                rows: {
                  style: {
                    '&:not(:last-of-type)': {
                      borderBottomWidth: '1px',
                      borderBottomColor: '#f0f0f0',
                      borderBottomStyle: 'solid',
                    },
                    '&:hover': {
                      backgroundColor: '#f8f8f8 !important',
                    },
                  },
                },
                pagination: {
                  style: {
                    fontSize: '13px',
                    borderTopWidth: '1px',
                    borderTopColor: '#e7e7e7',
                    borderTopStyle: 'solid',
                  },
                },
              }}
              fixedHeader
              fixedHeaderScrollHeight="500px"
            />
            <CustomFooter />
          </div>
        </Card>
      </div>
    </Spin>
  );
}

export default PurchaseReports;