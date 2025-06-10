import React, { useState } from "react";
import {
  Card,
  Table,
  Tag,
  Space,
  Button,
  Typography,
  Row,
  Col,
  DatePicker,
  Select,
  Input,
  Divider,
  Statistic,
  Progress,
  Badge,
  Dropdown,
  Menu
} from "antd";
import {
  DownloadOutlined,
  FilterOutlined,
  MoreOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  DollarOutlined,
  CreditCardOutlined,
  BankOutlined,
  WalletOutlined
} from "@ant-design/icons";
import { useTheme } from "antd-style";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;
const { Search } = Input;

const PaymentReport = () => {
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("all");
  const theme = useTheme();

  // Sample payment data
  const paymentData = [
    {
      key: "1",
      transactionId: "TXN-2023-001",
      customer: "John Smith",
      date: "2023-06-15",
      amount: 1250.00,
      status: "completed",
      paymentMethod: "credit_card",
      invoice: "INV-001"
    },
    {
      key: "2",
      transactionId: "TXN-2023-002",
      customer: "Sarah Johnson",
      date: "2023-06-16",
      amount: 850.50,
      status: "pending",
      paymentMethod: "bank_transfer",
      invoice: "INV-002"
    },
    {
      key: "3",
      transactionId: "TXN-2023-003",
      customer: "Michael Brown",
      date: "2023-06-17",
      amount: 420.75,
      status: "failed",
      paymentMethod: "paypal",
      invoice: "INV-003"
    },
    {
      key: "4",
      transactionId: "TXN-2023-004",
      customer: "Emily Davis",
      date: "2023-06-18",
      amount: 1560.00,
      status: "completed",
      paymentMethod: "credit_card",
      invoice: "INV-004"
    },
    {
      key: "5",
      transactionId: "TXN-2023-005",
      customer: "Robert Wilson",
      date: "2023-06-19",
      amount: 320.25,
      status: "refunded",
      paymentMethod: "credit_card",
      invoice: "INV-005"
    },
  ];

  // Summary statistics
  const summaryData = {
    totalRevenue: 4401.50,
    completedPayments: 2810.00,
    pendingPayments: 850.50,
    failedPayments: 420.75,
    refundedPayments: 320.25,
    paymentMethods: {
      credit_card: 3130.25,
      bank_transfer: 850.50,
      paypal: 420.75
    }
  };

  // Status tag colors
  const statusColors = {
    completed: "green",
    pending: "orange",
    failed: "red",
    refunded: "blue"
  };

  // Payment method icons
  const paymentMethodIcons = {
    credit_card: <CreditCardOutlined />,
    bank_transfer: <BankOutlined />,
    paypal: <WalletOutlined />
  };

  // Filter data based on selected filters
  const filteredData = paymentData.filter(item => {
    const dateInRange = dateRange.length === 0 || 
      (new Date(item.date) >= new Date(dateRange[0]) && 
       new Date(item.date) <= new Date(dateRange[1]));
    const statusMatch = statusFilter === "all" || item.status === statusFilter;
    const methodMatch = paymentMethodFilter === "all" || item.paymentMethod === paymentMethodFilter;
    return dateInRange && statusMatch && methodMatch;
  });

  // Handle export
  const handleExport = (type) => {
    setLoading(true);
    setTimeout(() => {
      message.success(`Exported as ${type.toUpperCase()}`);
      setLoading(false);
    }, 1000);
  };

  // Export menu
  const exportMenu = (
    <Menu onClick={({ key }) => handleExport(key)}>
      <Menu.Item key="csv">CSV</Menu.Item>
      <Menu.Item key="pdf">PDF</Menu.Item>
      <Menu.Item key="excel">Excel</Menu.Item>
    </Menu>
  );

  // Columns for the table
  const columns = [
    {
      title: "Transaction ID",
      dataIndex: "transactionId",
      key: "transactionId",
      render: (text) => <Text strong>{text}</Text>
    },
    {
      title: "Customer",
      dataIndex: "customer",
      key: "customer"
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date"
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (amount) => (
        <Text strong style={{ color: theme.colorSuccess }}>
          ${amount.toFixed(2)}
        </Text>
      ),
      sorter: (a, b) => a.amount - b.amount
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={statusColors[status]}>
          {status.toUpperCase()}
        </Tag>
      ),
      filters: [
        { text: "Completed", value: "completed" },
        { text: "Pending", value: "pending" },
        { text: "Failed", value: "failed" },
        { text: "Refunded", value: "refunded" }
      ],
      onFilter: (value, record) => record.status === value
    },
    {
      title: "Payment Method",
      dataIndex: "paymentMethod",
      key: "paymentMethod",
      render: (method) => (
        <Space>
          {paymentMethodIcons[method]}
          {method.replace("_", " ").toUpperCase()}
        </Space>
      )
    },
    {
      title: "Invoice",
      dataIndex: "invoice",
      key: "invoice",
      render: (text) => <Text type="secondary">{text}</Text>
    },
    {
      title: "Actions",
      key: "actions",
      render: () => (
        <Dropdown overlay={exportMenu} trigger={["click"]}>
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      )
    }
  ];

  return (
    <div style={{ padding: "24px", maxWidth: "1600px", margin: "0 auto" }}>
      <Title level={2} style={{ marginBottom: 24 }}>
        <DollarOutlined style={{ marginRight: 12, color: theme.colorPrimary }} />
        Payment Report
      </Title>

      {/* Filters Section */}
      <Card
        bordered={false}
        style={{ marginBottom: 24, boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)" }}
      >
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={6}>
            <RangePicker
              style={{ width: "100%" }}
              onChange={setDateRange}
              placeholder={["Start Date", "End Date"]}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              style={{ width: "100%" }}
              placeholder="Payment Status"
              onChange={setStatusFilter}
              allowClear
            >
              <Option value="all">All Statuses</Option>
              <Option value="completed">Completed</Option>
              <Option value="pending">Pending</Option>
              <Option value="failed">Failed</Option>
              <Option value="refunded">Refunded</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              style={{ width: "100%" }}
              placeholder="Payment Method"
              onChange={setPaymentMethodFilter}
              allowClear
            >
              <Option value="all">All Methods</Option>
              <Option value="credit_card">Credit Card</Option>
              <Option value="bank_transfer">Bank Transfer</Option>
              <Option value="paypal">PayPal</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Search
              placeholder="Search transactions..."
              allowClear
              enterButton={<FilterOutlined />}
            />
          </Col>
        </Row>
      </Card>

      {/* Summary Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic
              title="Total Revenue"
              value={summaryData.totalRevenue}
              precision={2}
              prefix="$"
              valueStyle={{ color: theme.colorSuccess }}
            />
            <Progress
              percent={100}
              showInfo={false}
              strokeColor={theme.colorSuccess}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic
              title="Completed Payments"
              value={summaryData.completedPayments}
              precision={2}
              prefix="$"
              valueStyle={{ color: theme.colorSuccess }}
            />
            <Progress
              percent={(summaryData.completedPayments / summaryData.totalRevenue) * 100}
              showInfo={false}
              strokeColor={theme.colorSuccess}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic
              title="Pending Payments"
              value={summaryData.pendingPayments}
              precision={2}
              prefix="$"
              valueStyle={{ color: theme.colorWarning }}
            />
            <Progress
              percent={(summaryData.pendingPayments / summaryData.totalRevenue) * 100}
              showInfo={false}
              strokeColor={theme.colorWarning}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic
              title="Failed Payments"
              value={summaryData.failedPayments}
              precision={2}
              prefix="$"
              valueStyle={{ color: theme.colorError }}
            />
            <Progress
              percent={(summaryData.failedPayments / summaryData.totalRevenue) * 100}
              showInfo={false}
              strokeColor={theme.colorError}
            />
          </Card>
        </Col>
      </Row>

      {/* Payment Methods Breakdown */}
      <Card
        title="Payment Methods Breakdown"
        bordered={false}
        style={{ marginBottom: 24 }}
        extra={
          <Button type="primary" icon={<DownloadOutlined />} onClick={() => handleExport("pdf")}>
            Export Report
          </Button>
        }
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <div style={{ height: 300 }}>
              {/* This would be a chart in a real implementation */}
              <div style={{ 
                height: "100%", 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center",
                backgroundColor: theme.colorBgContainer,
                borderRadius: 8
              }}>
                <Text type="secondary">Pie Chart: Payment Methods Distribution</Text>
              </div>
            </div>
          </Col>
          <Col xs={24} md={12}>
            <Space direction="vertical" style={{ width: "100%" }}>
              {Object.entries(summaryData.paymentMethods).map(([method, amount]) => (
                <Card key={method} bordered={false} bodyStyle={{ padding: "12px 16px" }}>
                  <Row align="middle" gutter={16}>
                    <Col flex="none">
                      <Badge 
                        count={paymentMethodIcons[method]} 
                        style={{ backgroundColor: theme.colorPrimary }}
                      />
                    </Col>
                    <Col flex="auto">
                      <Text strong>{method.replace("_", " ").toUpperCase()}</Text>
                      <Progress
                        percent={(amount / summaryData.totalRevenue) * 100}
                        showInfo={false}
                        strokeColor={theme.colorPrimary}
                      />
                    </Col>
                    <Col flex="none">
                      <Text strong>${amount.toFixed(2)}</Text>
                    </Col>
                  </Row>
                </Card>
              ))}
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Transactions Table */}
      <Card
        title="Payment Transactions"
        bordered={false}
        extra={
          <Dropdown overlay={exportMenu} trigger={["click"]}>
            <Button icon={<DownloadOutlined />}>Export</Button>
          </Dropdown>
        }
      >
        <Table
          columns={columns}
          dataSource={filteredData}
          loading={loading}
          scroll={{ x: true }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} payments`
          }}
          summary={() => (
            <Table.Summary fixed>
              <Table.Summary.Row>
                <Table.Summary.Cell index={0} colSpan={3}>
                  <Text strong>Total</Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={1}>
                  <Text strong style={{ color: theme.colorSuccess }}>
                    ${filteredData.reduce((sum, item) => sum + item.amount, 0).toFixed(2)}
                  </Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={2} colSpan={4} />
              </Table.Summary.Row>
            </Table.Summary>
          )}
        />
      </Card>
    </div>
  );
};

export default PaymentReport;