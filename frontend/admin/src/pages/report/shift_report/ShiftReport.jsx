import React, { useEffect, useState,useRef } from 'react';
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
  MoneyCollectOutlined,
  CloseOutlined 
} from '@ant-design/icons';
import './Shift.css';
import DataTable from 'react-data-table-component';
import { useReport } from '../../../hooks/UseReport';
import Cookies from "js-cookie";
import moment from 'moment';
import generatePDF from 'react-to-pdf';
import html2canvas from 'html2canvas';
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
  const token = localStorage.getItem('token');
  const userData = JSON.parse(Cookies.get('user'));

  const handleShifts = async () => {
    setLoading(true);
    let result = await getShiftReportData(userData.warehouse_id, token);        
    if (result.success) {
      setShifts(result.shifts);
      setLoading(false);
    }
  };
  const contentRef = useRef();

  const handleDownloadImage = async () => {
    if (contentRef.current) {
      const canvas = await html2canvas(contentRef.current, { scale: 2 });
      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = image;
      link.download = `shift-report-${selectedShift?.id || 'unknown'}.png`;
      link.click();
    }
  };

  let exchange_rate = selectedShift?.close_cashes?.KHR?.[0]?.exchange_rate;
  console.log(selectedShift);
  

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
      footer={
        <div style={{ display: 'flex', width: '100%' }}>
          <Button
            key="image"
            icon={<DownloadOutlined />}
            onClick={handleDownloadImage}
            style={{
              flex: 1,
              backgroundColor: '#52c41a', // green
              color: 'white',
              border: 'none',
              marginRight: 8
            }}
          >
            Download Image
          </Button>
          <Button
            key="close"
            icon={<CloseOutlined />}
            onClick={() => setIsDetailModalVisible(false)}
            style={{
              flex: 1,
              backgroundColor: '#f5222d', // red
              color: 'white',
              border: 'none'
            }}
          >
            Close
          </Button>
        </div>
      }
      width={400}
      // style={{ padding: 0 }}
    >
      <div
        ref={contentRef}
        style={{
          padding: '24px',
          fontFamily: 'Arial, sans-serif',
          fontSize: '14px',
          color: '#333',
          position: 'relative',
          backgroundColor: '#fff',
          minHeight: '100%',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
          <h1 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: 'bold' }}>{selectedShift?.warehouse_name}</h1>
          {/* <h2 style={{ margin: '0 0 16px 0', fontSize: '14px' }}>សាខាមិត្តភាពភ្នំពេញ</h2> */}
          <h3 style={{
            margin: '0 0 24px 0',
            fontSize: '12px',
            fontWeight: 'bold',
            borderBottom: '1px solid #ddd',
            paddingBottom: '8px',
          }}>
            CLOSE SHIFT REPORT
          </h3>
        </div>

        {/* Main Report Section */}
        <div style={{ marginBottom: '24px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody style={{ width: '100%'}}>
              <tr style={{width:'100%'}}>
                <td style={{ width: '50%', padding: '6px 0', fontWeight: '500' }}>Start Date</td>
                <td style={{ width: '5%', padding: '6px 0' }}>:</td>
                <td style={{ padding: '6px 0' }}>{selectedShift ? moment(selectedShift.start_time).format('DD-MM-YYYY HH:mm:ss') : 'N/A'}</td>
              </tr>
              <tr>
                <td style={{ padding: '6px 0', fontWeight: '500' }}>End Date</td>
                <td style={{ padding: '6px 0' }}>:</td>
                <td style={{ padding: '6px 0' }}>{selectedShift && selectedShift.end_time ? moment(selectedShift.end_time).format('DD-MM-YYYY HH:mm:ss') : 'N/A'}</td>
              </tr>
              <tr>
                <td style={{ padding: '6px 0', fontWeight: '500' }}>Start Shift By</td>
                <td style={{ padding: '6px 0' }}>:</td>
                <td style={{ padding: '6px 0' }}>{selectedShift?.cashier_name || 'N/A'}</td>
              </tr>
              <tr>
                <td style={{ padding: '6px 0', fontWeight: '500' }}>End Shift By</td>
                <td style={{ padding: '6px 0' }}>:</td>
                <td style={{ padding: '6pxx 0' }}>{selectedShift?.cashier_name || 'N/A'}</td>
              </tr>
              <tr>
                <td style={{ padding: '6px 0', fontWeight: '500' }}>Start Amount</td>
                <td style={{ padding: '6px 0' }}>:</td>
                <td style={{ padding: '6px 0' }}>{selectedShift ? `$${selectedShift.open_total_usd?.toLocaleString() || '0'} / ៛${selectedShift.open_total_kh?.toLocaleString() || '0'}` : 'N/A'}</td>
              </tr>
              <tr >
                <td style={{ padding: '6px 0', fontWeight: '500' }}>End Amount</td>
                <td style={{ padding: '6px 0' }}>:</td>
                <td style={{ padding: '6px 0' }}>{selectedShift ? `$${selectedShift.close_total_usd?.toLocaleString() || '0'} / ៛${selectedShift.close_total_kh?.toLocaleString() || '0'}` : 'N/A'}</td>
              </tr>
              <tr style={{borderBottom: '1px solid #ddd'}}>
                <td style={{ padding: '6px 0', fontWeight: '500' }}>Station</td>
                <td style={{ padding: '6px 0' }}>:</td>
                <td style={{ padding: '6px 0' }}>{selectedShift?.station || 'N/A'}</td>
              </tr>
              <tr>
                <td style={{ padding: '6px 0', fontWeight: '500' }}>Sub Amount</td>
                <td style={{ padding: '6px 0' }}>:</td>
                <td style={{ padding: '6px 0' }}>{selectedShift?.sub_amount ? `$${selectedShift.sub_amount}` : 'N/A'}</td>
              </tr>
              <tr>
                <td style={{ padding: '6px 0', fontWeight: '500' }}>Discount</td>
                <td style={{ padding: '6px 0' }}>:</td>
                <td style={{ padding: '6px 0' }}>{selectedShift?.discount ? `$${selectedShift.discount}` : '$0.00'}</td>
              </tr>
              <tr>
                <td style={{ padding: '6px 0', fontWeight: '500' }}>Refunds</td>
                <td style={{ padding: '6px 0' }}>:</td>
                <td style={{ padding: '6px 0' }}>{selectedShift?.total_refund_amount ? `$${selectedShift.total_refund_amount}` : '$0.00'}</td>
              </tr>
              <tr>
                <td style={{ padding: '6px 0', fontWeight: '500' }}>Tax Amount</td>
                <td style={{ padding: '6px 0' }}>:</td>
                <td style={{ padding: '6px 0' }}>{selectedShift?.tax_amount ? `$${selectedShift.tax_amount}` : '$0.00'}</td>
              </tr>
              <tr style={{borderBottom: '1px solid #ddd'}}>
                <td style={{ padding: '6px 0', fontWeight: '500' }}>Grand Total</td>
                <td style={{ padding: '6px 0' }}>:</td>
                <td style={{ padding: '6px 0', fontWeight: 'bold' }}>{selectedShift?.sales_total ? `$${selectedShift.sales_total}` : '$0.00'}</td>
              </tr>
              <tr>
                <td style={{ padding: '6px 0', fontWeight: '500' }}>Num of Invoice</td>
                <td style={{ padding: '6px 0' }}>:</td>
                <td style={{ padding: '6px 0' }}>{selectedShift?.number_of_invoice || '0'}</td>
              </tr>
              {/* <tr>
                <td style={{ padding: '6px 0', fontWeight: '500' }}>Avg of Invoice</td>
                <td style={{ padding: '6px 0' }}>:</td>
                <td style={{ padding: '6px 0' }}>{selectedShift?.avg_invoice ? `$${selectedShift.avg_invoice}` : '$0.00'}</td>
              </tr> */}
              <tr>
                <td style={{ padding: '6px 0', fontWeight: '500' }}>Num of Refund</td>
                <td style={{ padding: '6px 0' }}>:</td>
                <td style={{ padding: '6px 0' }}>{selectedShift?.total_return_invoices || '0'}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Payment Type Section */}
        <div style={{ marginBottom: '24px' }}>
  <h4
    style={{
      margin: '0 0 8px 0',
      fontWeight: 'bold',
      textAlign: 'center',
      borderBottom: '1px solid #ddd',
    }}
  >
    PAYMENT TYPE
  </h4>
  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
    <tbody>
      {selectedShift?.payments_by_type && selectedShift.payments_by_type.length > 0 ? (
        selectedShift.payments_by_type.map(({ payment_method, total }) => {
          // Decide currency symbol and formatting based on payment method or your logic
          const isUSD = payment_method.toLowerCase().includes('usd') || payment_method.toLowerCase().includes('cash') || payment_method.toLowerCase().includes('aba') || payment_method.toLowerCase().includes('ac'); 
          // You can improve this detection based on your data

          const amount = parseFloat(total);
          return (
            <tr key={payment_method}>
              <td style={{ padding: '6px 0', fontWeight: '500' }}>{payment_method}</td>
              <td style={{ padding: '6px 0' }}>:</td>
              <td style={{ padding: '6px 0', textDecoration: 'underline' }}>
                {isUSD
                  ? `$${amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
                  : `៛${amount.toLocaleString()}`}
              </td>
            </tr>
          );
        })
      ) : (
        <tr>
          <td colSpan={3} style={{ padding: '6px 0', textAlign: 'center', fontStyle: 'italic' }}>
            No payment data available
          </td>
        </tr>
      )}

      {/* Total Payment (optional) */}
      <tr>
        <td style={{ padding: '6px 0', fontWeight: 'bold' }}>Total Payment</td>
        <td style={{ padding: '6px 0' }}>:</td>
        <td style={{ padding: '6px 0', fontWeight: 'bold' }}>
          {selectedShift?.sales_total
            ? `$${selectedShift.sales_total.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
            : '$0.00'}
        </td>
      </tr>
    </tbody>
  </table>
</div>


        {/* Currency Sections */}
        <div style={{ display: 'flex',flexDirection:'column', gap: '24px', marginBottom: '24px' }}>
          {/* Start Currency */}
          <div style={{ flex: 1 }}>
            <h4 style={{ margin: '0 0 8px 0', fontWeight: 'bold', textAlign: 'center',borderBottom: '1px solid #ddd' }}>START CURRENCY NOTE</h4>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            {/* USD currency notes */}
            {selectedShift?.open_cashes?.USD &&
              selectedShift.open_cashes.USD.map((item, index) => {
                const denomination = item.money_type;
                const count = item.money_number;
                const denomValue = parseFloat(denomination);
                const total = denomValue * count;

                return (
                  <tr key={`usd-${index}`}>
                    <td style={{ padding: '4px 0', fontWeight: '500' }}>${denomination}</td>
                    <td style={{ padding: '4px 0', textAlign: 'center' }}>x</td>
                    <td style={{ padding: '4px 0', textAlign: 'right' }}>{count}</td>
                    <td style={{ padding: '4px 0', textAlign: 'right' }}>{total.toFixed(2)}$</td>
                  </tr>
                );
              })}

            {/* Start Dollar Total */}
            <tr>
              <td style={{ padding: '4px 0', fontWeight: 'bold' }}>Start Dollar</td>
              <td></td>
              <td></td>
              <td style={{ textAlign: 'right', fontWeight: 'bold' }}>
                {selectedShift?.open_total_usd ? `${selectedShift.open_total_usd}$` : '$0.00'}
              </td>
            </tr>

            {/* Riel currency notes */}
            {selectedShift?.open_cashes?.KHR &&
              selectedShift.open_cashes.KHR.map((item, index) => {
                const denomination = item.money_type;
                const count = item.money_number;
                const denomValue = parseFloat(denomination);
                const total = denomValue * count;

                return (
                  <tr key={`kh-${index}`}>
                    <td style={{ padding: '4px 0', fontWeight: '500' }}>៛{denomination}</td>
                    <td style={{ padding: '4px 0', textAlign: 'center' }}>x</td>
                    <td style={{ padding: '4px 0', textAlign: 'right' }}>{count}</td>
                    <td style={{ padding: '4px 0', textAlign: 'right' }}>{Math.round(total)}៛</td>
                  </tr>
                );
              })}

            {/* Start Riel Total */}
            <tr>
              <td style={{ padding: '4px 0', fontWeight: 'bold' }}>Start Riel</td>
              <td></td>
              <td></td>
              <td style={{ textAlign: 'right', fontWeight: 'bold' }}>
                {/* {selectedShift?.start_currency_notes
                  ? Object.entries(selectedShift.start_currency_notes)
                      .filter(([denom]) => denom.includes('៛'))
                      .reduce((acc, [denom, count]) => acc + parseFloat(denom.replace('៛', '')) * count, 0)
                      .toFixed(0) + '៛'
                  : '៛0'} */}
                  {selectedShift?.open_total_kh}៛
              </td>
            </tr>
          </tbody>

            </table>

          </div>

          {/* End Currency */}
          <div style={{ flex: 1 }}>
            <h4
              style={{
                margin: '0 0 8px 0',
                fontWeight: 'bold',
                textAlign: 'center',
                borderBottom: '1px solid #ddd'
              }}
            >
              END CURRENCY NOTE
            </h4>

            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                {/* USD cash list */}
                {selectedShift?.close_cashes?.USD &&
                  selectedShift.close_cashes.USD.map((item, index) => {
                    const denomination = parseFloat(item.money_type);
                    const count = Number(item.money_number);
                    const total = denomination * count;

                    return (
                      <tr key={`usd-${index}`}>
                        <td style={{ padding: '4px 0', fontWeight: '500' }}>${denomination}</td>
                        <td style={{ padding: '4px 0', textAlign: 'center' }}>x</td>
                        <td style={{ padding: '4px 0', textAlign: 'right' }}>{count}</td>
                        <td style={{ padding: '4px 0', textAlign: 'right' }}>{total.toFixed(2)}$</td>
                      </tr>
                    );
                  })}

                {/* Total USD */}
                <tr>
                  <td style={{ padding: '4px 0', fontWeight: 'bold' }}>Total USD</td>
                  <td></td>
                  <td></td>
                  <td style={{ padding: '4px 0', textAlign: 'right', fontWeight: 'bold' }}>
                    {selectedShift?.close_cashes?.USD
                      ? selectedShift.close_cashes.USD
                          .reduce((sum, item) => sum + item.money_type * item.money_number, 0)
                          .toFixed(2) + '$'
                      : '$0.00'}
                  </td>
                </tr>

                {/* Riel cash list */}
                {selectedShift?.close_cashes?.KHR &&
                  selectedShift.close_cashes.KHR.map((item, index) => {
                    const denomination = parseFloat(item.money_type);
                    const count = Number(item.money_number);
                    const total = denomination * count;

                    return (
                      <tr key={`kh-${index}`}>
                        <td style={{ padding: '4px 0', fontWeight: '500',width:'45%' }}>៛{denomination}</td>
                        <td style={{ padding: '4px 0', textAlign: 'center' }}>x</td>
                        <td style={{ padding: '4px 0', textAlign: 'right' }}>{count}</td>
                        <td style={{ padding: '4px 0', textAlign: 'right' }}>
                          {Math.round(total).toLocaleString()}៛
                        </td>
                      </tr>
                    );
                  })}

                {/* Total Riel */}
                <tr>
                  <td style={{ padding: '4px 0', fontWeight: 'bold' }}>Total Riel</td>
                  <td></td>
                  <td></td>
                  <td style={{ padding: '4px 0', textAlign: 'right', fontWeight: 'bold' }}>
                    {selectedShift?.close_cashes?.KHR
                      ? Math.round(
                          selectedShift.close_cashes.KHR.reduce(
                            (sum, item) => sum + item.money_type * item.money_number,
                            0
                          )
                        ).toLocaleString() + '៛'
                      : '៛0'}
                  </td>
                </tr>

                {/* Total USD + (Riel / 4000) */}
                <tr>
                  <td style={{ padding: '4px 0', fontWeight: 'bold' }}>Total (USD + Riel ÷ {exchange_rate})</td>
                  <td></td>
                  <td></td>
                  <td style={{ padding: '4px 0', textAlign: 'right', fontWeight: 'bold', color: 'green' }}>
                    {(() => {
                      const totalUSD = selectedShift?.close_cashes?.USD
                        ? selectedShift.close_cashes.USD.reduce(
                            (sum, item) => sum + item.money_type * item.money_number,
                            0
                          )
                        : 0;
                      let exchange_rate = 1;

                        const khrCash = selectedShift?.close_cashes?.KHR;

                        if (khrCash && khrCash.length > 0) {
                          exchange_rate = khrCash[0].exchange_rate || 4000; // fallback to 4000 if not defined
                        }

                        const totalRiel = khrCash
                          ? khrCash.reduce(
                              (sum, item) => sum + item.money_type * item.money_number,
                              0
                            )
                          : 0;

                        const convertedRielToUSD = totalRiel / exchange_rate;

                      return (totalUSD + convertedRielToUSD).toFixed(2) + '$';
                    })()}
                  </td>
                </tr>
              </tbody>

            </table>
          </div>

        </div>

        {/* Footer */}
        <div style={{ textAlign: 'left', marginTop: '24px', borderTop: '1px solid #ddd', paddingTop: '8px',display:'flex',justifyContent:'space-between' }}>
          <div>Print by: {selectedShift?.cashier_name || 'N/A'}</div>
          <div>{selectedShift?.end_time ? moment(selectedShift.end_time).format('DD/MM/YYYY h:mm A') : 'N/A'}</div>
        </div>
      </div>
    </Modal>
      </div>
    </Spin>
  );
};

export default ShiftReports;