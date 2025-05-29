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
  Spin
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
  CalendarOutlined ,
  UserOutlined 
} from '@ant-design/icons';
import './Purchase.css';
import DataTable from 'react-data-table-component';
import {useReport} from '../../../hooks/UseReport';
import Cookies from "js-cookie";
const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { Text } = Statistic;

const PurchaseReports = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState(null);
  const [supplierFilter, setSupplierFilter] = useState('all');
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const {getPurchaseReportData} = useReport();
  const [loading, setLoading] = useState(false);
  const [purchases, setPurchases] = useState([]);
  const token = Cookies.get('token');
  const userData = JSON.parse(Cookies.get('user'));
  const handlePurchase = async() =>{
    setLoading(true);
    let result = await getPurchaseReportData(userData.warehouse_id, token);
    if (result.success) {
      setPurchases(result.purchases);
      setLoading(false);
    }
  }

  useEffect(()=>{
    handlePurchase();
  },[]);
   
const suppliers = [...new Set(purchases.map(p => p.supplier || ''))];

const filteredPurchases = purchases.filter(purchase => {
  const idStr = purchase.id?.toString() || '';
  const supplierStr = typeof purchase.supplier === 'string' ? purchase.supplier : '';

  const matchesSearch = idStr.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        supplierStr.toLowerCase().includes(searchTerm.toLowerCase());

  const matchesStatus = statusFilter === 'all' || purchase.status === statusFilter;
  const matchesSupplier = supplierFilter === 'all' || purchase.supplier === supplierFilter;

  let matchesDate = true;
  if (dateRange && dateRange[0] && dateRange[1]) {
    const startDate = new Date(dateRange[0]);
    const endDate = new Date(dateRange[1]);
    const purchaseDate = new Date(purchase.date);

    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    matchesDate = purchaseDate >= startDate && purchaseDate <= endDate;
  }

  return matchesSearch && matchesStatus && matchesSupplier && matchesDate;
});

  const viewPurchaseDetails = (purchase) => {
    console.log(purchase);
    setSelectedPurchase(purchase);
    setIsDetailModalVisible(true);
  };

const getStatusColor = (status) => {
  if (!status) return '#d9d9d9';

  switch(status.toLowerCase()) {
    case 'approved': return '#52c41a';
    case 'pending': return '#faad14';
    case 'rejected': return '#f5222d';
    default: return '#d9d9d9';
  }
};


const getStatusIcon = (status) => {
  if (!status) return null;

  switch(status.toLowerCase()) {
    case 'approved': return <CheckCircleOutlined />;
    case 'pending': return <SyncOutlined spin />;
    case 'rejected': return <CloseCircleOutlined />;
    default: return null;
  }
};


const getPaymentStatusColor = (status) => {
  if (!status) return '#d9d9d9';

  switch(status.toLowerCase()) {
    case 'paid': return '#52c41a';      
    case 'partial': return '#faad14';   
    case 'unpaid': return '#f5222d';    
    default: return '#d9d9d9';        
  }
};

const getPaymentStatusIcon = (status) => {
  if (!status) return null;

  switch(status.toLowerCase()) {
    case 'paid':
    case 'partial':
    case 'unpaid':
      return <DollarOutlined />;
    default:
      return null;
  }
};

const handleDownloadPDF = () => {
  // const element = document.querySelector('.purchase-detail');
  // import('html2pdf.js').then(html2pdf => {
  //   html2pdf.default().from(element).save(`purchase-${selectedPurchase.id}.pdf`);
  // });

  console.log(1);
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
      name: 'Reference',
      selector: row => row.reference,
      sortable: true,
      width: '10%',
      cell: row => <strong style={{ color: '#52c41a' }}>{row.reference}</strong>
    },
    {
      name: 'Date',
      selector: row => row.date,
      sortable: true,
      width: '10%',
    },
    {
      name: 'Supplier',
      selector: row => row.supplier.username,
      sortable: true,
      width: '10%',
      cell: row => <span style={{ fontWeight: 500 }}>{row.supplier.username}</span>
    },
    {
      name: 'Items',
      selector: row => row.purchase_items_count,
      sortable: true,
      width: '10%',
      cell: row => (
        <Badge 
          count={row.purchase_items_count} 
          style={{ backgroundColor: '#52c41a' }} 
          showZero 
        />
      )
    },
    {
      name: 'Total',
      selector: row => row.total,
      sortable: true,
      format: row => `$${row.total.toLocaleString()}`,
      width: '10%',
      cell: row => <span style={{ fontWeight: 600 }}>${row.total}</span>
    },
    {
      name: 'Paid',
      selector: row => row.payments_sum_paid,
      sortable: true,
      format: row => `$${row.payments_sum_paid}`,
      width: '10%',
      cell: row => <span style={{ fontWeight: 600 }}>${row.payments_sum_paid.toLocaleString()}</span>
    },
    {
      name: 'Balance',
      selector: row =>row.total -  row.payments_sum_paid,
      sortable: true,
      format: row => `$${row.total -  row.payments_sum_paid}`,
      width: '10%',
      cell: row => <span style={{ fontWeight: 600 }}>${row.total -  row.payments_sum_paid}</span>
    },
    {
      name: 'Status',
      selector: row => row.status,
      sortable: true,
      width: '10%',
      cell: row => (
        <Tag 
          color={getStatusColor(row.approval)}
          icon={getStatusIcon(row.approval)}
          style={{ borderRadius: '12px', padding: '0 8px' }}
        >
          {row.approval
            ? row.approval.charAt(0) + row.approval.slice(1)
            : ''}
        </Tag>
      ),
    },
    {
      name: 'Payment',
      selector: row => row.paymentStatus,
      sortable: true,
      width: '10%',
      cell: row => (
        <Tag 
          color={getPaymentStatusColor(row.payment_status)}
          icon={getPaymentStatusIcon(row.payment_status)}
          style={{ borderRadius: '12px', padding: '0 8px' }}
        >
        {row.payment_status
          ? row.payment_status.charAt(0) + row.payment_status.slice(1)
          : ''}
                </Tag>
              ),
            },
            {
              name: 'Actions',
              width: '5%',
              cell: row => (
                <Button
                  type="primary"
                  shape="circle"
                  icon={<EyeOutlined />}
                  onClick={() => viewPurchaseDetails(row)}
                  size="small"
                  style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                />
              ),
              ignoreRowClick: true,
              allowOverflow: true,
              button: true,
            },
          ];

  const totalPurchases = filteredPurchases.length;
  const totalAmount = filteredPurchases.reduce((sum, p) => sum + p.total, 0);
  const approvedPurchases = filteredPurchases.filter(p => p.approval === 'approved').length;
  const pendingPurchases = filteredPurchases.filter(p => p.status === 'pending').length;
  const completionRate = totalPurchases > 0 ? Math.round((approvedPurchases / totalPurchases) * 100) : 0;

  return (

    <Spin spinning = {loading}>
      <div className="purchase-reports" style={{ padding: '24px' }}>
        <Card 
          className="report-header" 
          style={{ 
            // background: 'linear-gradient(135deg, #52c41a 0%, #1890ff 100%)',
            color: 'white',
            borderRadius: '8px',
            marginBottom: '24px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h1 style={{ color: '#52c41a', marginBottom: '8px' }}>Purchase Reports</h1>
              <p style={{ color: '#52c41a', marginBottom: 0 }}>
                Track and analyze your purchase orders in real-time
              </p>
            </div>
            <ShoppingOutlined style={{ fontSize: '48px', opacity: 0.2 }} />
          </div>
        </Card>

        {/* Filters */}
        <Card 
          className="report-filters" 
          style={{ 
            borderRadius: '8px',
            marginBottom: '24px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
          }}
        >
          <Row gutter={16} align="middle">
            <Col span={6}>
              <Search
                placeholder="Search PO or supplier"
                prefix={<SearchOutlined style={{ color: '#52c41a' }} />}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                allowClear
                enterButton={<FilterOutlined />}
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
                suffixIcon={<FilterOutlined style={{ color: '#52c41a' }} />}
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
                suffixIcon={<FilterOutlined style={{ color: '#52c41a' }} />}
                size="large"
              >
                <Option value="all">All Suppliers</Option>
                {suppliers.map(supplier => (
                  <Option key={supplier} value={supplier}>{supplier}</Option>
                ))}
              </Select>
            </Col>
            <Col span={6}>
              <RangePicker
                style={{ width: '100%' }}
                placeholder={['Start Date', 'End Date']}
                value={dateRange}
                onChange={setDateRange}
                size="large"
              />
            </Col>
          </Row>
        </Card>

        <div style={{ width: '100%', marginBottom: '24px' }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Card
              style={{
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                height: '100%',
              }}
            >
              <Statistic
                title="Total Purchases"
                value={totalPurchases}
                prefix={<ShoppingOutlined style={{ color: '#52c41a' }} />}
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
          <Col xs={24} sm={12} md={6}>
            <Card
              style={{
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                height: '100%',
              }}
            >
              <Statistic
                title="Total Amount"
                value={totalAmount}
                prefix="$"
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
          <Col xs={24} sm={12} md={6}>
            <Card
              style={{
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                height: '100%',
              }}
            >
              <Statistic
                title="Approved"
                value={approvedPurchases}
                prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                valueStyle={{ color: '#52c41a' }}
              />
              <Progress
                percent={completionRate}
                showInfo={false}
                strokeColor="#52c41a"
                trailColor="#f6ffed"
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card
              style={{
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                height: '100%',
              }}
            >
              <Statistic
                title="Pending"
                value={pendingPurchases}
                prefix={<SyncOutlined spin style={{ color: '#faad14' }} />}
                valueStyle={{ color: '#faad14' }}
              />
              <Progress
                percent={
                  totalPurchases > 0
                    ? Math.round((pendingPurchases / totalPurchases) * 100)
                    : 0
                }
                showInfo={false}
                strokeColor="#faad14"
                trailColor="#fffbe6"
              />
            </Card>
          </Col>
        </Row>
      </div>

        {/* Report Table */}
        <div 
          className="report-table"
          title={<span style={{ fontSize: '18px', fontWeight: '500',borderRadius:0 }}>Purchase Orders</span>}
          extra={
            <Space>
              <Button 
                icon={<DownloadOutlined />} 
                style={{ backgroundColor: '#52c41a', borderColor: '#52c41a', color: 'white' }}
              >
                Export
              </Button>
              <Button 
                icon={<PrinterOutlined />} 
                style={{ backgroundColor: '#1890ff', borderColor: '#1890ff', color: 'white' }}
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
            data={filteredPurchases}
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
                    backgroundColor: '#f6ffed !important',
                  },
                },
              },
            }}
          />
        </div>

      <Modal
        open={isDetailModalVisible}
        onCancel={() => setIsDetailModalVisible(false)}
        footer={null}
        width={800}
        bodyStyle={{ backgroundColor: '#f9f9f9', padding: 0 }}
      >
        {selectedPurchase && (
          <div
            className="purchase-detail"
            style={{
              backgroundColor: '#ffffff',
              padding: '32px',
              borderRadius: '12px',
              // boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
              fontFamily: 'Segoe UI, sans-serif',
              fontSize: '14px',
            }}
          >
            {/* Header */}
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
              <h2 style={{ margin: 0, color: '#333', fontSize: '22px' }}>Purchase Invoice</h2>
            </div>

            {/* Purchase Info */}
            <Row gutter={16} style={{ marginBottom: '20px' }}>
              <Col span={12}>
                <div style={{ marginBottom: '8px' }}>
                  <strong>Date:</strong>{' '}
                  {new Date(selectedPurchase.date).toLocaleDateString()}
                </div>
                <div style={{ marginBottom: '8px' }}>
                  <strong>Supplier:</strong> {selectedPurchase.supplier.username}
                </div>
              </Col>
              <Col span={12}>
                <div style={{ marginBottom: '8px' }}>
                  <strong>Reference:</strong>{' '}
                  <Tag color="blue" style={{ fontSize: '13px' }}>
                    {selectedPurchase.reference}
                  </Tag>
                </div>
              </Col>
            </Row>

            {/* Items Table */}
            <Table
              columns={[
                {
                  title: 'Item',
                  dataIndex: 'name',
                  key: 'name',
                  render: (_, row) => <strong>{row.product.name}</strong>,
                },
                {
                  title: 'Qty',
                  dataIndex: 'quantity',
                  key: 'quantity',
                  render: (_, row) => <Tag color="geekblue">{row.qty}</Tag>,
                },
                {
                  title: 'Unit Price',
                  dataIndex: 'price',
                  key: 'price',
                  render: (v) => `$${v}`,
                },
                {
                  title: 'Total',
                  dataIndex: 'total',
                  key: 'total',
                  render: (_, row) => <strong>${row.total_price}</strong>,
                },
              ]}
              dataSource={selectedPurchase.purchase_items}
              rowKey={(record) => `${record.product.name}-${record.id}`}
              pagination={false}
              bordered
              style={{ marginBottom: '24px' }}
            />

            {/* Totals */}
            <Row justify="end" style={{ marginBottom: '16px' }}>
              <Col>
                <div
                  style={{
                    backgroundColor: '#fafafa',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    border: '1px solid #e8e8e8',
                    textAlign: 'right',
                  }}
                >
                  <div style={{ fontSize: '16px' }}>
                    <strong>Total Paid: </strong>
                    <span style={{ color: '#52c41a' }}>${selectedPurchase.total}</span>
                  </div>
                </div>
              </Col>
            </Row>

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
              <Button onClick={() => setSelectedPurchase(null)} danger>
                Cancel
              </Button>
              <Button onClick={handleDownloadPDF}>Download Excel</Button>
            </div>
          </div>
        )}
      </Modal>

      </div>
    </Spin>
  );
};

export default PurchaseReports;