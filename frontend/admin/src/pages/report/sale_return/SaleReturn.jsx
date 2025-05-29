import React, { useState } from 'react';
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
  Row,
  Col,
  Statistic,
  Divider,
  Typography,
  Descriptions,
  Tabs,
  Badge,
  Progress
} from 'antd';
import {
  SearchOutlined,
  FilterOutlined,
  DownloadOutlined,
  PrinterOutlined,
  EyeOutlined,
  UndoOutlined,
  ExclamationCircleOutlined,
  DollarOutlined,
  BarChartOutlined
} from '@ant-design/icons';
import './SaleReturn.css';

const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { Text, Title } = Typography;
const { TabPane } = Tabs;

const SalesReturnReport = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [reasonFilter, setReasonFilter] = useState('all');
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [activeTab, setActiveTab] = useState('returns');

  // Sample return data
  const returns = [
    {
      id: 'RET-2023-001',
      date: '2023-05-15',
      originalOrder: 'ORD-2023-001',
      customer: 'John Smith',
      items: [
        { sku: 'LP-1001', name: 'Laptop', quantity: 1, price: 1000, reason: 'defective' },
        { sku: 'MS-2001', name: 'Mouse', quantity: 2, price: 50, reason: 'wrong-item' }
      ],
      totalAmount: 1100,
      status: 'processed',
      refundStatus: 'refunded',
      resolution: 'replacement-sent'
    },
    {
      id: 'RET-2023-002',
      date: '2023-05-16',
      originalOrder: 'ORD-2023-002',
      customer: 'Sarah Johnson',
      items: [
        { sku: 'TS-3001', name: 'T-Shirt', quantity: 1, price: 20, reason: 'size-issue' }
      ],
      totalAmount: 20,
      status: 'pending',
      refundStatus: 'pending',
      resolution: 'awaiting-approval'
    },
    {
      id: 'RET-2023-003',
      date: '2023-05-17',
      originalOrder: 'ORD-2023-003',
      customer: 'Mike Brown',
      items: [
        { sku: 'NB-4001', name: 'Notebook', quantity: 5, price: 5, reason: 'damaged' },
        { sku: 'PN-5001', name: 'Pen', quantity: 10, price: 2, reason: 'damaged' }
      ],
      totalAmount: 45,
      status: 'processed',
      refundStatus: 'partial-refund',
      resolution: 'restocked'
    },
    {
      id: 'RET-2023-004',
      date: '2023-05-18',
      originalOrder: 'ORD-2023-004',
      customer: 'Emily Davis',
      items: [
        { sku: 'PL-6001', name: 'Pillow', quantity: 2, price: 30, reason: 'color-issue' }
      ],
      totalAmount: 60,
      status: 'rejected',
      refundStatus: 'none',
      resolution: 'customer-kept'
    },
    {
      id: 'RET-2023-005',
      date: '2023-05-19',
      originalOrder: 'ORD-2023-005',
      customer: 'David Wilson',
      items: [
        { sku: 'KB-7001', name: 'Keyboard', quantity: 1, price: 100, reason: 'defective' }
      ],
      totalAmount: 100,
      status: 'processing',
      refundStatus: 'pending',
      resolution: 'in-inspection'
    }
  ];

  // Filter returns based on selected filters
  const filteredReturns = returns.filter(returnItem => {
    const matchesSearch = returnItem.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         returnItem.customer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || returnItem.status === statusFilter;
    const matchesReason = reasonFilter === 'all' || 
                         returnItem.items.some(item => item.reason === reasonFilter);
    
    let matchesDate = true;
    if (dateRange) {
      const startDate = new Date(dateRange[0]);
      const endDate = new Date(dateRange[1]);
      const returnDate = new Date(returnItem.date);
      matchesDate = returnDate >= startDate && returnDate <= endDate;
    }

    return matchesSearch && matchesStatus && matchesReason && matchesDate;
  });

  // Calculate return reasons statistics
  const calculateReasonStats = () => {
    const reasons = [
      'defective',
      'wrong-item',
      'size-issue',
      'damaged',
      'color-issue',
      'other'
    ];
    
    return reasons.map(reason => {
      const count = returns.reduce((sum, returnItem) => {
        return sum + returnItem.items.filter(item => item.reason === reason).length;
      }, 0);
      
      const percentage = returns.length > 0 
        ? Math.round((count / returns.reduce((sum, r) => sum + r.items.length, 0)) * 100)
        : 0;
      
      return {
        reason,
        count,
        percentage
      };
    });
  };

  const reasonStats = calculateReasonStats();

  // View return details
  const viewReturnDetails = (returnItem) => {
    setSelectedReturn(returnItem);
    setIsDetailModalVisible(true);
  };

  // Get status color
  const getStatusColor = (status) => {
    switch(status) {
      case 'processed': return 'green';
      case 'processing': return 'blue';
      case 'pending': return 'orange';
      case 'rejected': return 'red';
      default: return 'gray';
    }
  };

  // Get refund status color
  const getRefundStatusColor = (status) => {
    switch(status) {
      case 'refunded': return 'green';
      case 'partial-refund': return 'orange';
      case 'pending': return 'gold';
      case 'none': return 'red';
      default: return 'gray';
    }
  };

  // Get resolution color
  const getResolutionColor = (resolution) => {
    switch(resolution) {
      case 'replacement-sent': return 'green';
      case 'restocked': return 'blue';
      case 'customer-kept': return 'purple';
      case 'awaiting-approval': return 'orange';
      case 'in-inspection': return 'gold';
      default: return 'gray';
    }
  };

  // Get reason color
  const getReasonColor = (reason) => {
    switch(reason) {
      case 'defective': return 'red';
      case 'wrong-item': return 'orange';
      case 'size-issue': return 'blue';
      case 'damaged': return 'volcano';
      case 'color-issue': return 'purple';
      default: return 'gray';
    }
  };

  // Format reason for display
  const formatReason = (reason) => {
    return reason.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  // Columns for returns table
  const returnColumns = [
    {
      title: 'Return ID',
      dataIndex: 'id',
      key: 'id',
      width: 150,
      sorter: (a, b) => a.id.localeCompare(b.id),
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      width: 120,
      render: date => new Date(date).toLocaleDateString(),
      sorter: (a, b) => new Date(a.date) - new Date(b.date),
    },
    {
      title: 'Customer',
      dataIndex: 'customer',
      key: 'customer',
      width: 180,
      sorter: (a, b) => a.customer.localeCompare(b.customer),
    },
    {
      title: 'Order #',
      dataIndex: 'originalOrder',
      key: 'order',
      width: 150,
      sorter: (a, b) => a.originalOrder.localeCompare(b.originalOrder),
    },
    {
      title: 'Items',
      dataIndex: 'items',
      key: 'items',
      width: 100,
      render: items => items.length,
      sorter: (a, b) => a.items.length - b.items.length,
    },
    {
      title: 'Amount',
      dataIndex: 'totalAmount',
      key: 'amount',
      width: 150,
      render: amount => `$${amount.toLocaleString()}`,
      sorter: (a, b) => a.totalAmount - b.totalAmount,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: status => (
        <Tag color={getStatusColor(status)}>
          {status.toUpperCase()}
        </Tag>
      ),
      filters: [
        { text: 'Processed', value: 'processed' },
        { text: 'Processing', value: 'processing' },
        { text: 'Pending', value: 'pending' },
        { text: 'Rejected', value: 'rejected' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      render: (_, record) => (
        <Button
          type="text"
          icon={<EyeOutlined />}
          onClick={() => viewReturnDetails(record)}
        />
      ),
    },
  ];

  // Columns for items table
  const itemColumns = [
    {
      title: 'Return ID',
      dataIndex: 'returnId',
      key: 'returnId',
      width: 150,
    },
    {
      title: 'SKU',
      dataIndex: 'sku',
      key: 'sku',
      width: 120,
    },
    {
      title: 'Product',
      dataIndex: 'name',
      key: 'name',
      width: 200,
    },
    {
      title: 'Qty',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 80,
    },
    {
      title: 'Reason',
      dataIndex: 'reason',
      key: 'reason',
      width: 150,
      render: reason => (
        <Tag color={getReasonColor(reason)}>
          {formatReason(reason)}
        </Tag>
      ),
    },
    {
      title: 'Amount',
      dataIndex: 'price',
      key: 'price',
      width: 120,
      render: (price, record) => `$${(price * record.quantity).toLocaleString()}`,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: status => (
        <Tag color={getStatusColor(status)}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
  ];

  // Flatten items for detailed view
  const allReturnItems = returns.flatMap(returnItem => 
    returnItem.items.map(item => ({
      returnId: returnItem.id,
      date: returnItem.date,
      customer: returnItem.customer,
      originalOrder: returnItem.originalOrder,
      status: returnItem.status,
      ...item
    }))
  );

  // Calculate summary statistics
  const totalReturns = filteredReturns.length;
  const totalItemsReturned = filteredReturns.reduce((sum, r) => sum + r.items.length, 0);
  const totalRefundAmount = filteredReturns.reduce((sum, r) => sum + r.totalAmount, 0);
  const processedReturns = filteredReturns.filter(r => r.status === 'processed').length;

  return (
    <div className="sales-return-report">
      {/* Header */}
      <Card className="report-header">
        <Title level={3}>Sales Return Report</Title>
        <Text type="secondary">Track and analyze product returns</Text>
      </Card>

      {/* Tabs */}
      <Tabs 
        activeKey={activeTab} 
        onChange={setActiveTab}
        className="report-tabs"
      >
        <TabPane tab="Returns" key="returns" icon={<UndoOutlined />} />
        <TabPane tab="Returned Items" key="items" icon={<ExclamationCircleOutlined />} />
        <TabPane tab="Analytics" key="analytics" icon={<BarChartOutlined />} />
      </Tabs>

      {/* Filters */}
      <Card className="report-filters">
        <Row gutter={16}>
          <Col span={6}>
            <Search
              placeholder="Search return or customer"
              prefix={<SearchOutlined />}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              allowClear
            />
          </Col>
          <Col span={6}>
            <Select
              style={{ width: '100%' }}
              placeholder="Filter by status"
              value={statusFilter}
              onChange={setStatusFilter}
              allowClear
            >
              <Option value="all">All Statuses</Option>
              <Option value="processed">Processed</Option>
              <Option value="processing">Processing</Option>
              <Option value="pending">Pending</Option>
              <Option value="rejected">Rejected</Option>
            </Select>
          </Col>
          <Col span={6}>
            <Select
              style={{ width: '100%' }}
              placeholder="Filter by reason"
              value={reasonFilter}
              onChange={setReasonFilter}
              allowClear
            >
              <Option value="all">All Reasons</Option>
              <Option value="defective">Defective</Option>
              <Option value="wrong-item">Wrong Item</Option>
              <Option value="size-issue">Size Issue</Option>
              <Option value="damaged">Damaged</Option>
              <Option value="color-issue">Color Issue</Option>
            </Select>
          </Col>
          <Col span={6}>
            <RangePicker
              style={{ width: '100%' }}
              placeholder={['Start Date', 'End Date']}
              value={dateRange}
              onChange={setDateRange}
            />
          </Col>
        </Row>
      </Card>

      {/* Summary Cards */}
      <div className="summary-cards">
        <Card>
          <Statistic title="Total Returns" value={totalReturns} />
        </Card>
        <Card>
          <Statistic 
            title="Items Returned" 
            value={totalItemsReturned} 
          />
        </Card>
        <Card>
          <Statistic 
            title="Refund Amount" 
            value={totalRefundAmount} 
            prefix="$" 
            valueStyle={{ color: '#cf1322' }} 
          />
        </Card>
        <Card>
          <Statistic 
            title="Processed" 
            value={processedReturns} 
            suffix={`/ ${totalReturns}`}
          />
        </Card>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'returns' && (
        <Card 
          className="returns-table"
          title="Product Returns"
          extra={
            <Space>
              <Button icon={<DownloadOutlined />}>Export</Button>
              <Button icon={<PrinterOutlined />}>Print</Button>
            </Space>
          }
        >
          <Table
            columns={returnColumns}
            dataSource={filteredReturns}
            rowKey="id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
            }}
            scroll={{ x: 1200 }}
          />
        </Card>
      )}

      {activeTab === 'items' && (
        <Card 
          className="items-table"
          title="Returned Items"
          extra={
            <Space>
              <Button icon={<DownloadOutlined />}>Export</Button>
              <Button icon={<PrinterOutlined />}>Print</Button>
            </Space>
          }
        >
          <Table
            columns={itemColumns}
            dataSource={allReturnItems.filter(item => 
              filteredReturns.some(r => r.id === item.returnId)
            )}
            rowKey={(record) => `${record.returnId}-${record.sku}`}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
            }}
            scroll={{ x: 1200 }}
          />
        </Card>
      )}

      {activeTab === 'analytics' && (
        <Card className="analytics">
          <Row gutter={16}>
            <Col span={12}>
              <Card title="Return Reasons" className="reason-chart">
                {reasonStats.map(({ reason, count, percentage }) => (
                  <div key={reason} style={{ marginBottom: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Text strong>{formatReason(reason)}</Text>
                      <Text>{count} items ({percentage}%)</Text>
                    </div>
                    <Progress 
                      percent={percentage} 
                      strokeColor={getReasonColor(reason)} 
                      showInfo={false} 
                    />
                  </div>
                ))}
              </Card>
            </Col>
            <Col span={12}>
              <Card title="Return Status Distribution" className="status-chart">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {['processed', 'processing', 'pending', 'rejected'].map(status => {
                    const count = filteredReturns.filter(r => r.status === status).length;
                    const percentage = filteredReturns.length > 0 
                      ? Math.round((count / filteredReturns.length) * 100)
                      : 0;
                    
                    return (
                      <div key={status}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Tag color={getStatusColor(status)}>{status.toUpperCase()}</Tag>
                          <Text>{count} returns ({percentage}%)</Text>
                        </div>
                        <Progress 
                          percent={percentage} 
                          strokeColor={getStatusColor(status)} 
                          showInfo={false} 
                        />
                      </div>
                    );
                  })}
                </div>
              </Card>
            </Col>
          </Row>
        </Card>
      )}

      {/* Return Detail Modal */}
      <Modal
        title={`Return #${selectedReturn?.id}`}
        open={isDetailModalVisible}
        onCancel={() => setIsDetailModalVisible(false)}
        footer={null}
        width={800}
      >
        {selectedReturn && (
          <div className="return-detail">
            <Descriptions bordered column={2}>
              <Descriptions.Item label="Date">
                {new Date(selectedReturn.date).toLocaleDateString()}
              </Descriptions.Item>
              <Descriptions.Item label="Customer">
                {selectedReturn.customer}
              </Descriptions.Item>
              <Descriptions.Item label="Original Order">
                {selectedReturn.originalOrder}
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag color={getStatusColor(selectedReturn.status)}>
                  {selectedReturn.status.toUpperCase()}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Refund Status">
                <Tag color={getRefundStatusColor(selectedReturn.refundStatus)}>
                  {selectedReturn.refundStatus.toUpperCase()}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Resolution">
                <Tag color={getResolutionColor(selectedReturn.resolution)}>
                  {selectedReturn.resolution.split('-').map(word => 
                    word.charAt(0).toUpperCase() + word.slice(1)
                  ).join(' ')}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Total Amount">
                <Text strong>${selectedReturn.totalAmount.toLocaleString()}</Text>
              </Descriptions.Item>
            </Descriptions>

            <Divider orientation="left">Returned Items</Divider>
            
            <Table
              columns={[
                { title: 'SKU', dataIndex: 'sku', key: 'sku' },
                { title: 'Product', dataIndex: 'name', key: 'name' },
                { title: 'Qty', dataIndex: 'quantity', key: 'quantity' },
                { 
                  title: 'Reason', 
                  dataIndex: 'reason', 
                  key: 'reason',
                  render: reason => (
                    <Tag color={getReasonColor(reason)}>
                      {formatReason(reason)}
                    </Tag>
                  )
                },
                { 
                  title: 'Amount', 
                  dataIndex: 'price', 
                  key: 'price',
                  render: (price, record) => `$${(price * record.quantity).toLocaleString()}`,
                },
              ]}
              dataSource={selectedReturn.items}
              rowKey="sku"
              pagination={false}
              bordered
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default SalesReturnReport;