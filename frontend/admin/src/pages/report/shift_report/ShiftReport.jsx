import React, { useEffect, useState } from 'react';
import {
  Table,
  Card,
  Input,
  Button,
  Tag,
  Select,
  Space,
  DatePicker,
  Modal,
  Form,
  Row,
  Col,
  Statistic,
  Divider,
  Badge,
  Progress,
  Spin,
  Typography,
  Descriptions
} from 'antd';
import {
  SearchOutlined,
  FilterOutlined,
  DownloadOutlined,
  EyeOutlined,
  PrinterOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  CloseCircleOutlined,
  DollarOutlined,
  ShoppingOutlined,
  CalendarOutlined,
  UserOutlined,
  ShoppingCartOutlined,
  ClockCircleOutlined,
  MoneyCollectOutlined
} from '@ant-design/icons';
import './Shift.css';
import DataTable from 'react-data-table-component';
import { useReport } from '../../../hooks/UseReport';
import Cookies from "js-cookie";
import moment from 'moment';

const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { Text } = Statistic;
const { Title, Text: TypographyText } = Typography;

const ShiftReports = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [selectedShift, setSelectedShift] = useState(null);
  const [loading, setLoading] = useState(false);
  const { getShiftReportData } = useReport();
  const [shifts, setShifts] = useState([]);
  const token = Cookies.get('token');
  const userData = JSON.parse(Cookies.get('user'));

  const handleShifts = async () => {
    setLoading(true);
    let result = await getShiftReportData(userData.warehouse_id, token);    
    console.log(result);
    
    if (result.success) {
      setShifts(result.shifts);
      setLoading(false);
    }
  };

  useEffect(() => {
    handleShifts();
  }, []);

  const filteredShifts = shifts?.filter(shift => {
    const idStr = shift.id?.toString() || '';
    const userStr = shift.user?.name?.toString() || '';

    const matchesSearch = idStr.toLowerCase().includes(searchTerm.toLowerCase()) ||
      userStr.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || shift.status === statusFilter;

    let matchesDate = true;
    if (dateRange && dateRange[0] && dateRange[1]) {
      const startDate = new Date(dateRange[0]);
      const endDate = new Date(dateRange[1]);
      const shiftDate = new Date(shift.start_time);

      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);

      matchesDate = shiftDate >= startDate && shiftDate <= endDate;
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  const viewShiftDetails = (shift) => {
    setSelectedShift(shift);
    setIsDetailModalVisible(true);
  };

  const getStatusColor = (status) => {
    if (!status) return '#d9d9d9';    
    switch (status.toLowerCase()) {
      case 'processing': return '#1890ff';
      case 'completed': return '#52c41a';
      case 'processing': return '#faad14';
      default: return '#d9d9d9';
    }
  };

  const getStatusIcon = (status) => {
    if (!status) return null;

    switch (status.toLowerCase()) {
      case 'open': return <ClockCircleOutlined />;
      case 'closed': return <CheckCircleOutlined />;
      case 'pending': return <SyncOutlined spin />;
      default: return null;
    }
  };

  const handleDownloadPDF = () => {
    console.log("Downloading PDF...");
  };

  const columns = [
    {
      name: 'No',
      selector: (row, index) => index + 1,
      sortable: false,
      width: '5%',
      cell: (row, index) => <strong style={{ color: 'black' }}>{index + 1}</strong>
    },
    {
      name: 'Start Time',
      selector: row => row.start_time,
      sortable: true,
      width: '15%',
      cell: row => <span>{moment(row.start_time).format('YYYY-MM-DD HH:mm')}</span>
    },
    {
      name: 'End Time',
      selector: row => row.end_time,
      sortable: true,
      width: '15%',
      cell: row => <span>{row.end_time ? moment(row.end_time).format('YYYY-MM-DD HH:mm') : 'N/A'}</span>
    },
    {
      name: 'Open Shift',
      selector: row => row.cashier_name,
      sortable: true,
      width: '10%',
      cell: row => <span style={{ fontWeight: 500 }}>{row.cashier_name || 'N/A'}</span>
    },
    {
      name: 'Close Shift',
      selector: row => row.cashier_name,
      sortable: true,
      width: '10%',
      cell: row => <span style={{ fontWeight: 500 }}>{row.cashier_name || 'N/A'}</span>
    },
    {
      name: 'Starting Cash',
      selector: row => row.start_usd,
      sortable: true,
      width: '10%',
      cell: row => (
        <span style={{ fontWeight: 600 }}>
          ${row.open_total_usd?.toLocaleString() || '0'} / ៛{row.open_total_kh?.toLocaleString() || '0'}
        </span>
      )
    },
    {
      name: 'Final Cash',
      selector: row => row.final_usd,
      sortable: true,
      width: '10%',
      cell: row => (
        <span style={{ fontWeight: 600 }}>
          ${row.close_total_usd?.toLocaleString() || '0'} / ៛{row.close_total_kh?.toLocaleString() || '0'}
        </span>
      )
    },
    {
      name: 'Total Sale',
      selector: row => row.sales_total,
      sortable: true,
      width: '10%',
      cell: row => (
        <span style={{ fontWeight: 600 }}>
          ${row.sales_total}
        </span>
      )
    },

    {
      name: 'Status',
      selector: row => row.status,
      sortable: true,
      width: '9%',
      cell: row => (
        <Tag
          color={getStatusColor(row.status)}
          icon={getStatusIcon(row.status)}
          style={{ borderRadius: '12px', padding: '0 8px' }}
        >
          {row.status ? row.status.charAt(0).toUpperCase() + row.status.slice(1) : ''}
        </Tag>
      ),
    },
    {
      name: 'Actions',
      width: '6%',
      cell: row => (
        <Button
          type="primary"
          shape="circle"
          icon={<EyeOutlined />}
          onClick={() => viewShiftDetails(row)}
          size="small"
          style={{ backgroundColor: '#1890ff', borderColor: '#1890ff' }}
        />
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
    },
  ];

  const totalShifts = filteredShifts?.length;
  const openShifts = filteredShifts?.filter(s => s.status === 'processing').length;
  const closedShifts = filteredShifts?.filter(s => s.status === 'completed').length;
  const totalSales = filteredShifts?.reduce((sum, s) => sum + (s.total_sales || 0), 0);

  return (
    <Spin spinning={loading}>
      <div className="shift-reports" style={{ padding: '24px' }}>
        {/* Header Card */}
        <Card
          className="report-header"
          style={{
            color: '#1890ff',
            marginBottom: '24px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h1 style={{ color: '#52c41a', marginBottom: '8px' }}>Shift Reports</h1>
              <p style={{ color: '#52c41a', marginBottom: 0 }}>
                Track and analyze your cashier shifts and transactions
              </p>
            </div>
            <ClockCircleOutlined style={{ fontSize: '48px', opacity: 0.2 }} />
          </div>
        </Card>

        {/* Filters */}
        <Card
          className="report-filters"
          style={{
            marginBottom: '24px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
          }}
        >
          <Row gutter={16} align="middle">
            <Col span={8}>
              <Search
                placeholder="Search shift or cashier"
                prefix={<SearchOutlined style={{ color: '#1890ff' }} />}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                allowClear
                enterButton={<FilterOutlined />}
                size="large"
              />
            </Col>
            <Col span={8}>
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
                <Option value="processing">Processing</Option>
                <Option value="completed">Completed</Option>
              </Select>
            </Col>
            <Col span={8}>
              <RangePicker
                style={{ width: '100%' }}
                placeholder={['Start Date', 'End Date']}
                value={dateRange}
                onChange={setDateRange}
                showTime
                size="large"
              />
            </Col>
          </Row>
        </Card>

        {/* Summary Cards */}
        <div style={{ width: '100%', marginBottom: '24px' }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={8}>
              <Card
                style={{
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                  height: '100%',
                }}
              >
                <Statistic
                  title="Total Shifts"
                  value={totalShifts}
                  prefix={<ClockCircleOutlined style={{ color: '#1890ff' }} />}
                  valueStyle={{ color: '#1890ff' }}
                />
                <Progress
                  percent={100}
                  showInfo={false}
                  strokeColor="#d9f7be"
                  trailColor="#f6ffed"
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Card
                style={{
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                  height: '100%',
                }}
              >
                <Statistic
                  title="Open Shifts"
                  value={openShifts}
                  prefix={<SyncOutlined spin style={{ color: '#faad14' }} />}
                  valueStyle={{ color: '#faad14' }}
                />
                <Progress
                  percent={totalShifts > 0 ? Math.round((openShifts / totalShifts) * 100) : 0}
                  showInfo={false}
                  strokeColor="#faad14"
                  trailColor="#fffbe6"
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Card
                style={{
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                  height: '100%',
                }}
              >
                <Statistic
                  title="Total Sales"
                  value={totalSales}
                  prefix={<DollarOutlined style={{ color: '#52c41a' }} />}
                  valueStyle={{ color: '#52c41a' }}
                />
                <Progress
                  percent={100}
                  showInfo={false}
                  strokeColor="#b7eb8f"
                  trailColor="#f6ffed"
                />
              </Card>
            </Col>
          </Row>
        </div>

        {/* Shifts Table */}
        <Card
          title={<span style={{ fontSize: '18px', fontWeight: '500' }}>Shift Transactions</span>}
          extra={
            <Space>
              <Button
                icon={<DownloadOutlined />}
                style={{ backgroundColor: '#1890ff', borderColor: '#1890ff', color: 'white' }}
              >
                Export
              </Button>
              <Button
                icon={<PrinterOutlined />}
                style={{ backgroundColor: '#52c41a', borderColor: '#52c41a', color: 'white' }}
              >
                Print
              </Button>
            </Space>
          }
          style={{
            borderRadius: '0px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
          }}
        >
          <DataTable
            columns={columns}
            data={filteredShifts}
            pagination
            responsive
            fixedHeader
            highlightOnHover
            striped
            persistTableHead
            customStyles={{
              headCells: {
                style: {
                  fontWeight: '600',
                  backgroundColor: '#fafafa',
                  color: '#333',
                },
              },
              rows: {
                style: {
                  '&:hover': {
                    backgroundColor: '#e6f7ff !important',
                  },
                },
              },
            }}
          />
        </Card>

        {/* Shift Detail Modal */}
        <Modal
          open={isDetailModalVisible}
          onCancel={() => setIsDetailModalVisible(false)}
          footer={null}
          width={800}
          style={{ body: { backgroundColor: '#f9f9f9', padding: 0 }}}
        >
          {selectedShift && (
            <div
              className="shift-detail"
              style={{
                backgroundColor: '#ffffff',
                padding: '32px',
                fontFamily: 'Segoe UI, sans-serif',
                fontSize: '14px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '24px',
                  borderBottom: '1px solid #ddd',
                  paddingBottom: '16px',
                }}
              >
                <img
                  src=""
                  alt="Company Logo"
                  style={{ height: '50px', marginRight: '16px' }}
                />
                <h2 style={{ margin: 0, color: '#333', fontSize: '22px' }}>Shift Report</h2>
              </div>

              <Descriptions bordered column={1}>
                <Descriptions.Item label="Open Shift">{selectedShift.cashier_name	 || 'N/A'}</Descriptions.Item>
                <Descriptions.Item label="Close Shift">{selectedShift.cashier_name	 || 'N/A'}</Descriptions.Item>
                <Descriptions.Item label="Status">
                  <Tag
                    color={getStatusColor(selectedShift.status)}
                    icon={getStatusIcon(selectedShift.status)}
                  >
                    {selectedShift.status?.charAt(0).toUpperCase() + selectedShift.status?.slice(1)}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Start Time">
                  {moment(selectedShift.start_time).format('YYYY-MM-DD HH:mm')}
                </Descriptions.Item>
                <Descriptions.Item label="End Time">
                  {selectedShift.end_time ? moment(selectedShift.end_time).format('YYYY-MM-DD HH:mm') : 'N/A'}
                </Descriptions.Item>
                <Descriptions.Item label="Starting Cash">
                  <TypographyText strong>
                    ${selectedShift.open_total_usd || 0} USD / ៛{selectedShift.open_total_kh || 0} KHR
                  </TypographyText>
                </Descriptions.Item>

                <Descriptions.Item label="Final Cash">
                  <TypographyText strong>
                    ${selectedShift.close_total_usd || 0} USD / ៛{selectedShift.close_total_kh || 0} KHR
                  </TypographyText>
                </Descriptions.Item>

                {selectedShift.note && (
                  <Descriptions.Item label="Notes">
                    {selectedShift.note}
                  </Descriptions.Item>
                )}
              </Descriptions>

              {/* Shift Sales Summary */}
              {selectedShift.sales && selectedShift.sales.length > 0 && (
                <>
                  <Divider orientation="left" style={{ marginTop: '24px' }}>
                    <Title level={5}>Sales Summary</Title>
                  </Divider>
                  <Table
                    columns={[
                      {
                        title: 'Invoice',
                        dataIndex: 'reference',
                        key: 'reference',
                        render: text => <TypographyText strong>{text}</TypographyText>
                      },
                      {
                        title: 'Time',
                        dataIndex: 'created_at',
                        key: 'time',
                        render: text => moment(text).format('HH:mm')
                      },
                      {
                        title: 'Amount',
                        dataIndex: 'total',
                        key: 'total',
                        render: text => <TypographyText strong>${text}</TypographyText>
                      }
                    ]}
                    dataSource={selectedShift.sales}
                    rowKey="id"
                    pagination={false}
                    size="small"
                    style={{ marginBottom: '24px' }}
                  />
                </>
              )}

              {/* Footer Buttons */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '12px',
                  marginTop: '24px',
                }}
              >
                <Button onClick={() => window.print()} type="primary">
                  Print
                </Button>
                <Button onClick={() => setIsDetailModalVisible(false)}>
                  Close
                </Button>
                <Button onClick={handleDownloadPDF}>Download PDF</Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </Spin>
  );
};

export default ShiftReports;