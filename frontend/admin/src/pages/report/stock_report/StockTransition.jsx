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
  Table,
  Tag,
  Alert,
  Modal,
  Form,
  Divider
} from 'antd';
import {
  SearchOutlined,
  SyncOutlined,
  ClearOutlined,
  PlusOutlined,
  FileExcelOutlined,
  FilePdfOutlined,
  FileImageOutlined,
  ArrowRightOutlined,
  ExportOutlined,
  ImportOutlined,
  SwapOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import dayjs from 'dayjs';
import debounce from 'lodash.debounce';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import generatePDF from 'react-to-pdf';
import html2canvas from 'html2canvas';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './StockTransition.css';
import { useCompany } from '../../../hooks/UseCompnay';
import { useReport } from '../../../hooks/UseReport';
import Cookies from 'js-cookie';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';

const { Title, Text } = Typography;
const { Search } = Input;
const { RangePicker } = DatePicker;
const { Option } = Select;
const { TextArea } = Input;

const StockTransition = () => {
  const [transitions, setTransitions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const {handleWarehouse} = useCompany();
  const {getStockTransitionReportData} = useReport();
  const token = localStorage.getItem("token");
  const [filters, setFilters] = useState({
    search_term: '',
    type: 'all',
    status: 'all',
    date_range: [dayjs().subtract(1, 'month'), dayjs()],
    from_warehouse: 'all',
    to_warehouse: 'all'
  });
  const [warehouses, setWarehouses] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [selectedRows, setSelectedRows] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentTransition, setCurrentTransition] = useState(null);
  const [form] = Form.useForm();
  const tableRef = useRef(null);
  const navigate = useNavigate();
  const userData = useMemo(() => JSON.parse(Cookies.get('user') || '{}'), []);
  const [sortField, setSortField] = useState('date');
  const [sortOrder, setSortOrder] = useState(-1);

  const fetchWarehouses = useCallback(async () => {
    try {
      const response = await handleWarehouse(token)
      if (response.success) {
        setWarehouses(response.warehouses);
      } else {
        throw new Error(data.message || 'Failed to fetch warehouses');
      }
    } catch (err) {
      console.error('Warehouse fetch error:', err);
      toast.error('Failed to load warehouse data');
    }
  }, [token]);

  const fetchTransitions = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const queryParams = new URLSearchParams({
        page: pagination.current,
        limit: pagination.pageSize,
        search_term: filters.search_term || '',
        type: filters.type !== 'all' ? filters.type : '',
        status: filters.status !== 'all' ? filters.status : '',
        // from_warehouse_id: filters.from_warehouse !== 'all' ? filters.from_warehouse : '',
        warehouse_id: filters.to_warehouse !== 'all' ? filters.to_warehouse : '',
        start_date: filters.date_range?.[0]?.format('YYYY-MM-DD') || '',
        end_date: filters.date_range?.[1]?.format('YYYY-MM-DD') || '',
        ...params
      });

      const response = await getStockTransitionReportData(queryParams,token);

      if (response.success) {
        setTransitions(response.transitions);
        setPagination({
          ...pagination,
          total: response.total
        });
      } else {
        throw new Error(response.message || 'Failed to fetch transitions');
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err.message);
      toast.error('error');
    } finally {
      setLoading(false);
    }
  }, [filters, pagination, token]);

  const debouncedFetch = useMemo(
    () => debounce(fetchTransitions, 500),
    [fetchTransitions]
  );

  useEffect(() => {
    fetchWarehouses();
    fetchTransitions();
    return () => debouncedFetch.cancel();
  }, []);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    if (key !== 'date_range') {
      debouncedFetch({ page: 1 });
      setPagination(prev => ({ ...prev, current: 1 }));
    }
  };

  // Handle date range change
  const handleDateChange = (dates) => {
    setFilters(prev => ({ ...prev, date_range: dates }));
    debouncedFetch({ page: 1 });
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  // Handle table pagination
  const handleTableChange = (e) => {
    const newPagination = {
      ...pagination,
      current: Math.floor(e.first / e.rows) + 1
    };
    setPagination(newPagination);
    fetchTransitions({ page: newPagination.current });
  };

  // Clear all filters
  const handleClearFilters = () => {
    setFilters({
      search_term: '',
      type: 'all',
      status: 'all',
      date_range: [dayjs().subtract(1, 'month'), dayjs()],
      from_warehouse: 'all',
      to_warehouse: 'all'
    });
    setPagination(prev => ({ ...prev, current: 1 }));
    fetchTransitions({ page: 1 });
    toast.info('Filters cleared');
  };

  // View transition details
  const handleViewDetails = (record) => {
    setCurrentTransition(record);
    setIsModalVisible(true);
    form.setFieldsValue({
      notes: record.notes || 'No additional notes'
    });
  };

  // Export to Excel
const handleExportExcel = async () => {
  try {
    setLoading(true);
    
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Stock Transitions');

    // Add report title and metadata
    worksheet.addRow(['Stock Transition Report']);
    worksheet.addRow([`Generated: ${dayjs().format('YYYY-MM-DD HH:mm:ss')}`]);
    worksheet.addRow([`User: ${userData.name || 'N/A'}`]);
    worksheet.addRow([]);

    // Add filter information
    worksheet.addRow(['Filters:']);
    worksheet.addRow([
      'Date Range:', 
      filters.date_range?.[0]?.format('YYYY-MM-DD') + ' to ' + filters.date_range?.[1]?.format('YYYY-MM-DD')
    ]);
    worksheet.addRow(['Type:', filters.type === 'all' ? 'All' : filters.type]);
    worksheet.addRow(['Status:', filters.status === 'all' ? 'All' : filters.status]);
    worksheet.addRow(['From Warehouse:', filters.from_warehouse === 'all' ? 'All' : 
      warehouses.find(w => w.id === filters.from_warehouse)?.warehouse_name || 'N/A']);
    worksheet.addRow(['To Warehouse:', filters.to_warehouse === 'all' ? 'All' : 
      warehouses.find(w => w.id === filters.to_warehouse)?.warehouse_name || 'N/A']);
    worksheet.addRow([]);

    // Define headers based on your DataTable columns
    const headers = [
      'Date', 
      'Name', 
      'Code', 
      'Quantity', 
      'Type', 
      'Warehouse', 
      'Movement Type'
    ];
    
    worksheet.addRow(headers);

    // Style the header row
    const headerRow = worksheet.getRow(worksheet.rowCount);
    headerRow.eachCell(cell => {
      cell.font = { bold: true };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFD3D3D3' }
      };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });

    // Add data rows
    transitions.forEach(transition => {
      worksheet.addRow([
        dayjs(transition.date).format('YYYY-MM-DD'),
        transition.name || 'N/A',
        transition.code || 'N/A',
        transition.quantity || 0,
        transition.type?.toUpperCase() || 'N/A',
        transition.warehouse_name || 'N/A',
        transition.movement_type?.toUpperCase() || 'N/A'
      ]);
    });

    // Set column widths
    worksheet.columns = [
      { width: 15 }, // Date
      { width: 20 }, // Name
      { width: 15 }, // Code
      { width: 12 }, // Quantity
      { width: 15 }, // Type
      { width: 20 }, // Warehouse
      { width: 15 }  // Movement Type
    ];

    // Freeze header row
    worksheet.views = [
      { state: 'frozen', xSplit: 0, ySplit: 1 }
    ];

    // Generate Excel file
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `stock-transitions-${dayjs().format('YYYY-MM-DD')}.xlsx`);
    toast.success('Excel export completed successfully');
  } catch (err) {
    console.error('Export error:', err);
    toast.error('Failed to generate Excel file');
  } finally {
    setLoading(false);
  }
};

  // Export to PDF
  const handleExportPDF = async () => {
    try {
      setLoading(true);
      await generatePDF(tableRef, {
        filename: `stock-transitions-${dayjs().format('YYYY-MM-DD')}.pdf`,
        page: { 
          format: 'A4', 
          margin: { top: 20, bottom: 20, left: 20, right: 20 },
          orientation: 'landscape'
        },
        canvas: { scale: 2 }
      });
      toast.success('PDF exported successfully');
    } catch (err) {
      console.error('PDF export error:', err);
      toast.error('Failed to generate PDF');
    } finally {
      setLoading(false);
    }
  };

  // Export to Image
  const handleExportImage = async () => {
    try {
      setLoading(true);
      if (tableRef.current) {
        const canvas = await html2canvas(tableRef.current, { scale: 2 });
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = `stock-transitions-${dayjs().format('YYYY-MM-DD')}.png`;
        link.click();
        toast.success('Image exported successfully');
      }
    } catch (err) {
      console.error('Image export error:', err);
      toast.error('Failed to generate image');
    } finally {
      setLoading(false);
    }
  };

  const statusBodyTemplate = (rowData) => {
    let color;
    switch (rowData.movement_type) {
      case 'sale':
        color = 'success';
        break;
      case 'purchase':
        color = 'warning';
        break;
      default:
        color = null;
    }
    return <Tag color={color}>{rowData.movement_type?.toUpperCase()}</Tag>;
  };

  const typeBodyTemplate = (rowData) => {
    let color, icon;
    switch (rowData.type) {
      case 'transfer':
        color = 'blue';
        icon = <SwapOutlined />;
        break;
      case 'receipt':
        color = 'green';
        icon = <ImportOutlined />;
        break;
      case 'issue':
        color = 'orange';
        icon = <ExportOutlined />;
        break;
      default:
        color = 'gray';
        icon = null;
    }
    return (
      <Tag color={color} icon={icon}>
        {rowData.type?.toUpperCase()}
      </Tag>
    );
  };

  const actionBodyTemplate = (rowData) => {
    return (
      <Button
        type="link"
        icon={<SearchOutlined />}
        onClick={() => handleViewDetails(rowData)}
      />
    );
  };

  const itemColumns = [
    {
      title: 'Product',
      dataIndex: ['product', 'name'],
      key: 'product',
      width: 200
    },
    {
      title: 'Code',
      dataIndex: ['product', 'code'],
      key: 'code',
      width: 120
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 100,
      align: 'center'
    },
    {
      title: 'Unit',
      dataIndex: ['product', 'unit'],
      key: 'unit',
      width: 80
    },
    {
      title: 'Batch',
      dataIndex: 'batch_number',
      key: 'batch_number',
      width: 120
    },
    {
      title: 'Expiry',
      dataIndex: 'expiry_date',
      key: 'expiry_date',
      width: 120,
      render: (date) => date ? dayjs(date).format('DD/MM/YYYY') : 'N/A'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="stock-transition-container"
    >
      <ToastContainer position="top-right" autoClose={2000} />
      
      <Card className="header-card">
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={3} className="report-title">
              Stock Transition Report
            </Title>
            <Text type="secondary">Track inventory movements between locations</Text>
          </Col>
        </Row>
      </Card>

      <Card className="filter-card">
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Search
              placeholder="Search reference..."
              allowClear
              enterButton={<SearchOutlined />}
              value={filters.search_term}
              onChange={(e) => handleFilterChange('search_term', e.target.value)}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              style={{ width: '100%' }}
              placeholder="Transition Type"
              value={filters.type}
              onChange={(value) => handleFilterChange('type', value)}
            >
              <Option value="all">All Types</Option>
              <Option value="transfer">Transfer</Option>
              <Option value="receipt">Receipt</Option>
              <Option value="issue">Issue</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              style={{ width: '100%' }}
              placeholder="Status"
              value={filters.status}
              onChange={(value) => handleFilterChange('status', value)}
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
              value={filters.date_range}
              onChange={handleDateChange}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              style={{ width: '100%' }}
              placeholder="From Warehouse"
              value={filters.from_warehouse}
              onChange={(value) => handleFilterChange('from_warehouse', value)}
              showSearch
              optionFilterProp="children"
            >
              <Option value="all">All Warehouses</Option>
              {warehouses.map(wh => (
                <Option key={wh.id} value={wh.id}>{wh.warehouse_name}</Option>
              ))}
            </Select>
          </Col>
        </Row>

        <Divider />

        <Row justify="space-between">
          <Col>
            <Space>
              <Button
                type="primary"
                icon={<SearchOutlined />}
                onClick={() => fetchTransitions({ page: 1 })}
                loading={loading}
              >
                Apply Filters
              </Button>
              <Button
                icon={<ClearOutlined />}
                onClick={handleClearFilters}
                disabled={loading}
              >
                Clear Filters
              </Button>
              <Button
                icon={<SyncOutlined />}
                onClick={() => fetchTransitions()}
                loading={loading}
              >
                Refresh
              </Button>
            </Space>
          </Col>
          <Col>
            <Space>
              <Button
                icon={<FileExcelOutlined />}
                onClick={handleExportExcel}
                loading={loading}
              >
                Excel
              </Button>
              <Button
                icon={<FilePdfOutlined />}
                onClick={handleExportPDF}
                loading={loading}
              >
                PDF
              </Button>
              <Button
                icon={<FileImageOutlined />}
                onClick={handleExportImage}
                loading={loading}
              >
                Image
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      <div ref={tableRef}>
          <DataTable
          value={transitions}
          loading={loading}
          scrollable
          scrollHeight="700px"
          responsiveLayout="scroll"
          stripedRows
          showGridlines
          rows={pagination.pageSize}
          first={(pagination.current - 1) * pagination.pageSize}
          totalRecords={pagination.total}
          onPage={handleTableChange}
          sortField={sortField}
          sortOrder={sortOrder}
          onSort={(e) => {
            setSortField(e.sortField);
            setSortOrder(e.sortOrder);
            fetchTransitions({ 
              sortField: e.sortField, 
              sortOrder: e.sortOrder === 1 ? 'asc' : 'desc' 
            });
          }}
          emptyMessage="No transitions found"
          currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          rowsPerPageOptions={[10, 25, 50]}
          style={{ width: '100%' }}
          resizableColumns
          columnResizeMode="expand"
        >
          <Column 
            field="date" 
            header="Date" 
            body={(rowData) => dayjs(rowData.date).format('DD/MM/YYYY')} 
            sortable 
            style={{ minWidth: '120px' }}
          />
          <Column 
            field="name" 
            header="Name" 
            body={(rowData) => rowData.name} 
            sortable 
            style={{ minWidth: '120px' }}
          />
          <Column 
            field="code" 
            header="Code" 
            body={(rowData) => rowData.code} 
            sortable 
            style={{ minWidth: '120px' }}
          />
            <Column 
              field="qty" 
              header="QTY" 
              body={(rowData) => rowData.quantity} 
              sortable 
              style={{ minWidth: '150px' }}
            />
          <Column 
            field="type" 
            header="Type" 
            body={typeBodyTemplate} 
            sortable 
            style={{ minWidth: '120px' }}
          />
          <Column 
            field="warehouse_name" 
            header="Warehouse" 
            body={(rowData) => rowData.warehouse_name || ''} 
            style={{ minWidth: '180px' }}
          />
          {/* <Column 
            field="to_warehouse.name" 
            header="To Warehouse" 
            body={(rowData) => rowData.to_warehouse?.name || 'N/A'} 
            style={{ minWidth: '180px' }}
          /> */}
          {/* <Column 
            field="items_count" 
            header="Items" 
            align="center" 
            style={{ minWidth: '100px', textAlign: 'center' }}
          /> */}
          <Column 
            field="movement_type" 
            header="Movement Type" 
            body={statusBodyTemplate} 
            sortable 
            style={{ minWidth: '120px' }}
          />
          {/* <Column 
            field="created_by.name" 
            header="Created By" 
            body={(rowData) => rowData.created_by?.name || 'System'} 
            style={{ minWidth: '150px' }}
          /> */}

        </DataTable>
      </div>

      <Modal
        title={`Transition Details - ${currentTransition?.reference_number || ''}`}
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={800}
      >
        {currentTransition && (
          <>
            <Divider orientation="left">Basic Information</Divider>
            <Row gutter={16}>
              <Col span={8}>
                <Text strong>Type:</Text> <Tag color="blue">{currentTransition.type.toUpperCase()}</Tag>
              </Col>
              <Col span={8}>
                <Text strong>Status:</Text> <Tag color={
                  currentTransition.status === 'completed' ? 'success' : 
                  currentTransition.status === 'pending' ? 'processing' : 'error'
                }>
                  {currentTransition.status.toUpperCase()}
                </Tag>
              </Col>
              <Col span={8}>
                <Text strong>Date:</Text> {dayjs(currentTransition.date).format('DD/MM/YYYY')}
              </Col>
            </Row>
            <Row gutter={16} style={{ marginTop: 8 }}>
              <Col span={12}>
                <Text strong>From:</Text> {currentTransition.from_warehouse?.name || 'N/A'}
              </Col>
              <Col span={12}>
                <Text strong>To:</Text> {currentTransition.to_warehouse?.name || 'N/A'}
              </Col>
            </Row>

            <Divider orientation="left">Items</Divider>
            <Table
              columns={itemColumns}
              dataSource={currentTransition.items || []}
              rowKey="id"
              pagination={false}
              size="small"
              bordered
            />

            <Divider orientation="left">Additional Information</Divider>
            <Form form={form} layout="vertical">
              <Form.Item name="notes" label="Notes">
                <TextArea rows={3} readOnly />
              </Form.Item>
            </Form>
          </>
        )}
      </Modal>
    </motion.div>
  );
};

export default StockTransition;