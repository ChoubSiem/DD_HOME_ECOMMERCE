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
  Form,
  Row,
  Col,
  Statistic,
  Divider,
  Typography,
  Descriptions
} from 'antd';
import {
  SearchOutlined,
  FilterOutlined,
  DownloadOutlined,
  PrinterOutlined,
  EyeOutlined,
  PlusOutlined
} from '@ant-design/icons';
import './Adjustment.css';

const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { Text } = Typography;

const AdjustmentReport = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [dateRange, setDateRange] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [selectedAdjustment, setSelectedAdjustment] = useState(null);
  const [isNewAdjustmentModalVisible, setIsNewAdjustmentModalVisible] = useState(false);
  const [form] = Form.useForm();

  // Sample adjustment data
  const [adjustments, setAdjustments] = useState([
    {
      id: 'ADJ-2023-001',
      date: '2023-05-15',
      type: 'increase',
      reason: 'Stock reconciliation',
      status: 'approved',
      items: [
        { sku: 'LP-1001', name: 'Laptop', currentQty: 50, adjustedQty: 55, difference: 5 },
        { sku: 'MS-2001', name: 'Mouse', currentQty: 100, adjustedQty: 105, difference: 5 }
      ],
      totalItems: 2,
      initiatedBy: 'John Doe',
      approvedBy: 'Jane Smith'
    },
    {
      id: 'ADJ-2023-002',
      date: '2023-05-16',
      type: 'decrease',
      reason: 'Damaged goods',
      status: 'pending',
      items: [
        { sku: 'TS-3001', name: 'T-Shirt', currentQty: 200, adjustedQty: 195, difference: -5 },
        { sku: 'JN-4001', name: 'Jeans', currentQty: 150, adjustedQty: 148, difference: -2 }
      ],
      totalItems: 2,
      initiatedBy: 'Mike Johnson',
      approvedBy: null
    },
    {
      id: 'ADJ-2023-003',
      date: '2023-05-17',
      type: 'increase',
      reason: 'Vendor over-delivery',
      status: 'approved',
      items: [
        { sku: 'NB-5001', name: 'Notebook', currentQty: 500, adjustedQty: 520, difference: 20 }
      ],
      totalItems: 1,
      initiatedBy: 'Sarah Williams',
      approvedBy: 'Jane Smith'
    },
    {
      id: 'ADJ-2023-004',
      date: '2023-05-18',
      type: 'decrease',
      reason: 'Theft',
      status: 'rejected',
      items: [
        { sku: 'PH-6001', name: 'Phone', currentQty: 75, adjustedQty: 73, difference: -2 },
        { sku: 'HD-7001', name: 'Headphones', currentQty: 120, adjustedQty: 118, difference: -2 }
      ],
      totalItems: 2,
      initiatedBy: 'David Brown',
      approvedBy: 'Jane Smith'
    }
  ]);

  const filteredAdjustments = adjustments.filter(adjustment => {
    const matchesSearch = adjustment.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         adjustment.reason.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || adjustment.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || adjustment.status === statusFilter;
    
    let matchesDate = true;
    if (dateRange) {
      const startDate = new Date(dateRange[0]);
      const endDate = new Date(dateRange[1]);
      const adjustmentDate = new Date(adjustment.date);
      matchesDate = adjustmentDate >= startDate && adjustmentDate <= endDate;
    }

    return matchesSearch && matchesType && matchesStatus && matchesDate;
  });

  const viewAdjustmentDetails = (adjustment) => {
    setSelectedAdjustment(adjustment);
    setIsDetailModalVisible(true);
  };

  const handleNewAdjustment = () => {
    setIsNewAdjustmentModalVisible(true);
  };

  const handleSubmitNewAdjustment = (values) => {
    const newAdjustment = {
      id: `ADJ-${new Date().getFullYear()}-${(adjustments.length + 1).toString().padStart(3, '0')}`,
      date: new Date().toISOString().split('T')[0],
      status: 'pending',
      totalItems: values.items.length,
      initiatedBy: 'Current User', // Replace with actual user
      approvedBy: null,
      ...values
    };
    
    setAdjustments([newAdjustment, ...adjustments]);
    setIsNewAdjustmentModalVisible(false);
    form.resetFields();
    message.success('Adjustment created successfully!');
  };

  const getTypeColor = (type) => {
    return type === 'increase' ? 'green' : 'red';
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'approved': return 'green';
      case 'pending': return 'orange';
      case 'rejected': return 'red';
      default: return 'gray';
    }
  };

  const columns = [
    {
      title: 'Adjustment ID',
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
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: type => (
        <Tag color={getTypeColor(type)}>
          {type.charAt(0).toUpperCase() + type.slice(1)}
        </Tag>
      ),
      filters: [
        { text: 'Increase', value: 'increase' },
        { text: 'Decrease', value: 'decrease' },
      ],
      onFilter: (value, record) => record.type === value,
    },
    {
      title: 'Reason',
      dataIndex: 'reason',
      key: 'reason',
      width: 200,
    },
    {
      title: 'Items',
      dataIndex: 'totalItems',
      key: 'totalItems',
      width: 100,
      sorter: (a, b) => a.totalItems - b.totalItems,
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
        { text: 'Approved', value: 'approved' },
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
          onClick={() => viewAdjustmentDetails(record)}
        />
      ),
    },
  ];

  // Calculate summary statistics
  const totalAdjustments = filteredAdjustments.length;
  const increases = filteredAdjustments.filter(a => a.type === 'increase').length;
  const decreases = filteredAdjustments.filter(a => a.type === 'decrease').length;
  const pendingApprovals = filteredAdjustments.filter(a => a.status === 'pending').length;

  return (
    <div className="adjustment-report">
      {/* Header */}
      <Card className="report-header">
        <div className="header-content">
          <div>
            <h1>Inventory Adjustment Report</h1>
            <p>Track and manage inventory adjustments</p>
          </div>
        </div>
      </Card>

      {/* Filters */}
      <Card className="report-filters">
        <Row gutter={16}>
          <Col span={6}>
            <Search
              placeholder="Search by ID or reason"
              prefix={<SearchOutlined />}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              allowClear
            />
          </Col>
          <Col span={6}>
            <Select
              style={{ width: '100%' }}
              placeholder="Filter by type"
              value={typeFilter}
              onChange={setTypeFilter}
              allowClear
            >
              <Option value="all">All Types</Option>
              <Option value="increase">Increase</Option>
              <Option value="decrease">Decrease</Option>
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
              <Option value="approved">Approved</Option>
              <Option value="pending">Pending</Option>
              <Option value="rejected">Rejected</Option>
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
          <Statistic title="Total Adjustments" value={totalAdjustments} />
        </Card>
        <Card>
          <Statistic 
            title="Stock Increases" 
            value={increases} 
            valueStyle={{ color: '#3f8600' }} 
          />
        </Card>
        <Card>
          <Statistic 
            title="Stock Decreases" 
            value={decreases} 
            valueStyle={{ color: '#cf1322' }} 
          />
        </Card>
        <Card>
          <Statistic 
            title="Pending Approvals" 
            value={pendingApprovals} 
            valueStyle={{ color: '#fa8c16' }} 
          />
        </Card>
      </div>

      {/* Report Table */}
      <Card 
        className="report-table"
        title="Adjustment History"
        extra={
          <Space>
            <Button icon={<DownloadOutlined />}>Export</Button>
            <Button icon={<PrinterOutlined />}>Print</Button>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={filteredAdjustments}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
          }}
          scroll={{ x: 1000 }}
          bordered
        />
      </Card>

      {/* Adjustment Detail Modal */}
      <Modal
        title={`Adjustment: ${selectedAdjustment?.id}`}
        open={isDetailModalVisible}
        onCancel={() => setIsDetailModalVisible(false)}
        footer={null}
        width={800}
      >
        {selectedAdjustment && (
          <div className="adjustment-detail">
            <Descriptions bordered column={2}>
              <Descriptions.Item label="Date">
                {new Date(selectedAdjustment.date).toLocaleDateString()}
              </Descriptions.Item>
              <Descriptions.Item label="Type">
                <Tag color={getTypeColor(selectedAdjustment.type)}>
                  {selectedAdjustment.type.toUpperCase()}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Reason" span={2}>
                {selectedAdjustment.reason}
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag color={getStatusColor(selectedAdjustment.status)}>
                  {selectedAdjustment.status.toUpperCase()}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Total Items">
                {selectedAdjustment.totalItems}
              </Descriptions.Item>
              <Descriptions.Item label="Initiated By">
                {selectedAdjustment.initiatedBy}
              </Descriptions.Item>
              <Descriptions.Item label="Approved By">
                {selectedAdjustment.approvedBy || 'N/A'}
              </Descriptions.Item>
            </Descriptions>

            <Divider orientation="left">Items Adjusted</Divider>
            
            <Table
              columns={[
                { title: 'SKU', dataIndex: 'sku', key: 'sku' },
                { title: 'Product Name', dataIndex: 'name', key: 'name' },
                { title: 'Current Qty', dataIndex: 'currentQty', key: 'currentQty' },
                { title: 'Adjusted Qty', dataIndex: 'adjustedQty', key: 'adjustedQty' },
                { 
                  title: 'Difference', 
                  dataIndex: 'difference', 
                  key: 'difference',
                  render: diff => (
                    <Tag color={diff > 0 ? 'green' : 'red'}>
                      {diff > 0 ? `+${diff}` : diff}
                    </Tag>
                  )
                },
              ]}
              dataSource={selectedAdjustment.items}
              rowKey="sku"
              pagination={false}
              bordered
            />
          </div>
        )}
      </Modal>

      {/* New Adjustment Modal */}
      <Modal
        title="Create New Adjustment"
        open={isNewAdjustmentModalVisible}
        onCancel={() => {
          setIsNewAdjustmentModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmitNewAdjustment}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="type"
                label="Adjustment Type"
                rules={[{ required: true, message: 'Please select type!' }]}
              >
                <Select placeholder="Select type">
                  <Option value="increase">Stock Increase</Option>
                  <Option value="decrease">Stock Decrease</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="reason"
                label="Reason for Adjustment"
                rules={[{ required: true, message: 'Please input reason!' }]}
              >
                <Input placeholder="Enter reason" />
              </Form.Item>
            </Col>
          </Row>

          <Form.List name="items">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                    <Form.Item
                      {...restField}
                      name={[name, 'sku']}
                      label="SKU"
                      rules={[{ required: true, message: 'Missing SKU' }]}
                    >
                      <Input placeholder="Product SKU" />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, 'name']}
                      label="Product"
                      rules={[{ required: true, message: 'Missing product name' }]}
                    >
                      <Input placeholder="Product name" />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, 'currentQty']}
                      label="Current Qty"
                      rules={[{ required: true, message: 'Missing current quantity' }]}
                    >
                      <InputNumber min={0} placeholder="Current" />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, 'adjustedQty']}
                      label="New Qty"
                      rules={[{ required: true, message: 'Missing adjusted quantity' }]}
                    >
                      <InputNumber min={0} placeholder="Adjusted" />
                    </Form.Item>
                    <Button type="text" danger onClick={() => remove(name)}>
                      Remove
                    </Button>
                  </Space>
                ))}
                <Form.Item>
                  <Button type="dashed" onClick={() => add()} block>
                    Add Item
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>

          <Divider />

          <Row justify="end">
            <Space>
              <Button onClick={() => setIsNewAdjustmentModalVisible(false)}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit">
                Submit Adjustment
              </Button>
            </Space>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};

export default AdjustmentReport;