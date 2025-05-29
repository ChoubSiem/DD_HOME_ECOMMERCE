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
  Progress,
  Tabs
} from 'antd';
import {
  SearchOutlined,
  FilterOutlined,
  DownloadOutlined,
  PrinterOutlined,
  EyeOutlined,
  DollarOutlined,
  ShoppingOutlined,
  StarOutlined
} from '@ant-design/icons';
import './Supplier.css';
import DataTable from 'react-data-table-component';


const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { Text, Title } = Typography;
const { TabPane } = Tabs;

const SupplierManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedSupplier, setSelectedSupplier] = useState('all');
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [activeTab, setActiveTab] = useState('summary');

  // Sample data
  const suppliers = [
    { id: 'SUP-001', name: 'TechCorp Solutions', rating: 4.5, category: 'Electronics' },
    { id: 'SUP-002', name: 'FashionHub Inc.', rating: 3.8, category: 'Apparel' },
    { id: 'SUP-003', name: 'Office Essentials', rating: 4.2, category: 'Office Supplies' },
    { id: 'SUP-004', name: 'Home & Living', rating: 4.0, category: 'Home Goods' },
  ];

  const purchases = [
    {
      id: 'PO-2023-001',
      date: '2023-05-15',
      supplierId: 'SUP-001',
      items: [
        { sku: 'LP-1001', name: 'Laptop', quantity: 10, unitPrice: 1000, total: 10000 },
        { sku: 'MS-2001', name: 'Mouse', quantity: 50, unitPrice: 50, total: 2500 }
      ],
      totalAmount: 12500,
      status: 'completed',
      paymentStatus: 'paid',
      deliveryStatus: 'delivered'
    },
    {
      id: 'PO-2023-002',
      date: '2023-05-16',
      supplierId: 'SUP-002',
      items: [
        { sku: 'TS-3001', name: 'T-Shirt', quantity: 100, unitPrice: 20, total: 2000 },
        { sku: 'JN-4001', name: 'Jeans', quantity: 50, unitPrice: 50, total: 2500 }
      ],
      totalAmount: 4500,
      status: 'pending',
      paymentStatus: 'partial',
      deliveryStatus: 'processing'
    },
    {
      id: 'PO-2023-003',
      date: '2023-05-17',
      supplierId: 'SUP-001',
      items: [
        { sku: 'KB-5001', name: 'Keyboard', quantity: 30, unitPrice: 100, total: 3000 }
      ],
      totalAmount: 3000,
      status: 'completed',
      paymentStatus: 'paid',
      deliveryStatus: 'delivered'
    },
    {
      id: 'PO-2023-004',
      date: '2023-05-18',
      supplierId: 'SUP-003',
      items: [
        { sku: 'NB-6001', name: 'Notebook', quantity: 200, unitPrice: 5, total: 1000 },
        { sku: 'PN-7001', name: 'Pen', quantity: 500, unitPrice: 2, total: 1000 }
      ],
      totalAmount: 2000,
      status: 'completed',
      paymentStatus: 'paid',
      deliveryStatus: 'delivered'
    },
    {
      id: 'PO-2023-005',
      date: '2023-05-19',
      supplierId: 'SUP-004',
      items: [
        { sku: 'PL-8001', name: 'Pillow', quantity: 50, unitPrice: 30, total: 1500 }
      ],
      totalAmount: 1500,
      status: 'cancelled',
      paymentStatus: 'unpaid',
      deliveryStatus: 'cancelled'
    }
  ];

  // Filter purchases based on selected filters
  const filteredPurchases = purchases.filter(purchase => {
    const matchesSearch = purchase.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSupplier = selectedSupplier === 'all' || purchase.supplierId === selectedSupplier;
    const matchesStatus = statusFilter === 'all' || purchase.status === statusFilter;
    
    let matchesDate = true;
    if (dateRange) {
      const startDate = new Date(dateRange[0]);
      const endDate = new Date(dateRange[1]);
      const purchaseDate = new Date(purchase.date);
      matchesDate = purchaseDate >= startDate && purchaseDate <= endDate;
    }

    return matchesSearch && matchesSupplier && matchesStatus && matchesDate;
  });

  // Get supplier name by ID
  const getSupplierName = (supplierId) => {
    const supplier = suppliers.find(s => s.id === supplierId);
    return supplier ? supplier.name : 'Unknown Supplier';
  };

  // Calculate supplier statistics
  const calculateSupplierStats = () => {
    return suppliers.map(supplier => {
      const supplierPurchases = purchases.filter(p => p.supplierId === supplier.id);
      const totalSpend = supplierPurchases.reduce((sum, p) => sum + p.totalAmount, 0);
      const completedOrders = supplierPurchases.filter(p => p.status === 'completed').length;
      const pendingOrders = supplierPurchases.filter(p => p.status === 'pending').length;
      
      return {
        ...supplier,
        totalSpend,
        orderCount: supplierPurchases.length,
        completedOrders,
        pendingOrders,
        fulfillmentRate: supplierPurchases.length > 0 
          ? Math.round((completedOrders / supplierPurchases.length) * 100) 
          : 0
      };
    });
  };

  const supplierStats = calculateSupplierStats();

  // View purchase details
  const viewPurchaseDetails = (purchase) => {
    setSelectedPurchase(purchase);
    setIsDetailModalVisible(true);
  };

  // Get status color
  const getStatusColor = (status) => {
    switch(status) {
      case 'completed': return 'green';
      case 'pending': return 'orange';
      case 'cancelled': return 'red';
      default: return 'gray';
    }
  };

  // Get payment status color
  const getPaymentStatusColor = (status) => {
    switch(status) {
      case 'paid': return 'green';
      case 'partial': return 'orange';
      case 'unpaid': return 'red';
      default: return 'gray';
    }
  };

  // Get delivery status color
  const getDeliveryStatusColor = (status) => {
    switch(status) {
      case 'delivered': return 'green';
      case 'processing': return 'orange';
      case 'cancelled': return 'red';
      default: return 'gray';
    }
  };

  // Columns for purchase table
  const columns = [
    {
      title: 'PO Number',
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
      title: 'Supplier',
      dataIndex: 'supplierId',
      key: 'supplier',
      width: 200,
      render: supplierId => getSupplierName(supplierId),
      sorter: (a, b) => getSupplierName(a.supplierId).localeCompare(getSupplierName(b.supplierId)),
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
        { text: 'Completed', value: 'completed' },
        { text: 'Pending', value: 'pending' },
        { text: 'Cancelled', value: 'cancelled' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Payment',
      dataIndex: 'paymentStatus',
      key: 'payment',
      width: 120,
      render: status => (
        <Tag color={getPaymentStatusColor(status)}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Delivery',
      dataIndex: 'deliveryStatus',
      key: 'delivery',
      width: 120,
      render: status => (
        <Tag color={getDeliveryStatusColor(status)}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      render: (_, record) => (
        <Button
          type="text"
          icon={<EyeOutlined />}
          onClick={() => viewPurchaseDetails(record)}
        />
      ),
    },
  ];

  // Calculate summary statistics
  const totalPurchases = filteredPurchases.length;
  const totalSpend = filteredPurchases.reduce((sum, p) => sum + p.totalAmount, 0);
  const completedPurchases = filteredPurchases.filter(p => p.status === 'completed').length;
  const pendingPurchases = filteredPurchases.filter(p => p.status === 'pending').length;

  return (
    <div className="supplier-purchase-report">
      {/* Header */}
      <Card className="report-header">
        <Title level={3}>Supplier Purchase Report</Title>
        <Text type="secondary">Track and analyze all purchases from suppliers</Text>
      </Card>

      {/* Tabs */}
      <Tabs 
        activeKey={activeTab} 
        onChange={setActiveTab}
        className="report-tabs"
      >
        <TabPane tab="Summary" key="summary" icon={<ShoppingOutlined />} />
        <TabPane tab="Supplier Analysis" key="analysis" icon={<StarOutlined />} />
        <TabPane tab="Detailed Purchases" key="purchases" icon={<DollarOutlined />} />
      </Tabs>

      {/* Filters */}
      <Card className="report-filters">
        <Row gutter={16}>
          <Col span={6}>
            <Search
              placeholder="Search PO number"
              prefix={<SearchOutlined />}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              allowClear
            />
          </Col>
          <Col span={6}>
            <Select
              style={{ width: '100%' }}
              placeholder="Filter by supplier"
              value={selectedSupplier}
              onChange={setSelectedSupplier}
              allowClear
            >
              <Option value="all">All Suppliers</Option>
              {suppliers.map(supplier => (
                <Option key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </Option>
              ))}
            </Select>
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
              <Option value="completed">Completed</Option>
              <Option value="pending">Pending</Option>
              <Option value="cancelled">Cancelled</Option>
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

      {/* Content based on active tab */}
      {activeTab === 'summary' && (
        <>
          {/* Summary Cards */}
          <div className="summary-cards">
            <Card>
              <Statistic title="Total Purchases" value={totalPurchases} />
            </Card>
            <Card>
              <Statistic 
                title="Total Spend" 
                value={totalSpend} 
                prefix="$" 
                valueStyle={{ color: '#3f8600' }} 
              />
            </Card>
            <Card>
              <Statistic title="Completed" value={completedPurchases} />
            </Card>
            <Card>
              <Statistic title="Pending" value={pendingPurchases} />
            </Card>
          </div>

          {/* Recent Purchases */}
          <Card 
            title="Recent Purchases"
            className="recent-purchases"
            extra={
              <Button type="link" onClick={() => setActiveTab('purchases')}>
                View All
              </Button>
            }
          >
            <Table
              columns={columns}
              dataSource={filteredPurchases.slice(0, 5)}
              rowKey="id"
              pagination={false}
              scroll={{ x: 1000 }}
            />
          </Card>
        </>
      )}

      {activeTab === 'analysis' && (
        <Card className="supplier-analysis">
          <Table
            columns={[
              {
                title: 'Supplier',
                dataIndex: 'name',
                key: 'name',
                width: 200,
              },
              {
                title: 'Category',
                dataIndex: 'category',
                key: 'category',
                width: 150,
              },
              {
                title: 'Rating',
                dataIndex: 'rating',
                key: 'rating',
                width: 150,
                render: rating => (
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <StarOutlined style={{ color: '#faad14', marginRight: 4 }} />
                    {rating}/5
                  </div>
                ),
                sorter: (a, b) => a.rating - b.rating,
              },
              {
                title: 'Total Spend',
                dataIndex: 'totalSpend',
                key: 'totalSpend',
                width: 150,
                render: amount => `$${amount.toLocaleString()}`,
                sorter: (a, b) => a.totalSpend - b.totalSpend,
              },
              {
                title: 'Orders',
                dataIndex: 'orderCount',
                key: 'orders',
                width: 120,
                sorter: (a, b) => a.orderCount - b.orderCount,
              },
              {
                title: 'Fulfillment Rate',
                dataIndex: 'fulfillmentRate',
                key: 'fulfillment',
                width: 200,
                render: rate => (
                  <div>
                    <Progress 
                      percent={rate} 
                      strokeColor={rate > 90 ? '#52c41a' : rate > 70 ? '#faad14' : '#ff4d4f'} 
                      showInfo={false} 
                    />
                    <span>{rate}%</span>
                  </div>
                ),
                sorter: (a, b) => a.fulfillmentRate - b.fulfillmentRate,
              },
            ]}
            dataSource={supplierStats}
            rowKey="id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
            }}
            scroll={{ x: 1000 }}
          />
        </Card>
      )}

      {activeTab === 'purchases' && (
        <Card className="detailed-purchases">
          <Table
            columns={columns}
            dataSource={filteredPurchases}
            rowKey="id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
            }}
            scroll={{ x: 1000 }}
          />
        </Card>
      )}

      {/* Purchase Detail Modal */}
      <Modal
        title={`Purchase Order: ${selectedPurchase?.id}`}
        open={isDetailModalVisible}
        onCancel={() => setIsDetailModalVisible(false)}
        footer={null}
        width={800}
      >
        {selectedPurchase && (
          <div className="purchase-detail">
            <Descriptions bordered column={2}>
              <Descriptions.Item label="Date">
                {new Date(selectedPurchase.date).toLocaleDateString()}
              </Descriptions.Item>
              <Descriptions.Item label="Supplier">
                {getSupplierName(selectedPurchase.supplierId)}
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag color={getStatusColor(selectedPurchase.status)}>
                  {selectedPurchase.status.toUpperCase()}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Payment Status">
                <Tag color={getPaymentStatusColor(selectedPurchase.paymentStatus)}>
                  {selectedPurchase.paymentStatus.toUpperCase()}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Delivery Status">
                <Tag color={getDeliveryStatusColor(selectedPurchase.deliveryStatus)}>
                  {selectedPurchase.deliveryStatus.toUpperCase()}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Total Amount">
                ${selectedPurchase.totalAmount.toLocaleString()}
              </Descriptions.Item>
            </Descriptions>

            <Divider orientation="left">Items Purchased</Divider>
            
            <Table
              columns={[
                { title: 'SKU', dataIndex: 'sku', key: 'sku' },
                { title: 'Product Name', dataIndex: 'name', key: 'name' },
                { title: 'Quantity', dataIndex: 'quantity', key: 'quantity' },
                { title: 'Unit Price', dataIndex: 'unitPrice', key: 'unitPrice', render: v => `$${v}` },
                { title: 'Total', dataIndex: 'total', key: 'total', render: v => `$${v}` },
              ]}
              dataSource={selectedPurchase.items}
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

export default SupplierManagement;