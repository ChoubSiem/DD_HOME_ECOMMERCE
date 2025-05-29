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
  Menu,
  Avatar,
  List
} from "antd";
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
ChartJS.register(ArcElement, Tooltip, Legend);

import {
  DownloadOutlined,
  FilterOutlined,
  MoreOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  DollarOutlined,
  ShoppingOutlined,
  CarOutlined,
  HomeOutlined,
  FilePdfOutlined,
  FileExcelOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { useTheme } from "antd-style";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;
const { Search } = Input;

const ExpenseReport = () => {
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const theme = useTheme();

  // Sample expense data
  const expenseData = [
    {
      key: "1",
      expenseId: "EXP-2023-001",
      description: "Office Supplies",
      date: "2023-06-15",
      amount: 250.00,
      category: "office",
      status: "approved",
      submittedBy: "John Smith",
      receipt: true
    },
    {
      key: "2",
      expenseId: "EXP-2023-002",
      description: "Client Dinner",
      date: "2023-06-16",
      amount: 120.50,
      category: "meals",
      status: "pending",
      submittedBy: "Sarah Johnson",
      receipt: true
    },
    {
      key: "3",
      expenseId: "EXP-2023-003",
      description: "Business Travel",
      date: "2023-06-17",
      amount: 750.25,
      category: "travel",
      status: "rejected",
      submittedBy: "Michael Brown",
      receipt: false
    },
    {
      key: "4",
      expenseId: "EXP-2023-004",
      description: "Software Subscription",
      date: "2023-06-18",
      amount: 99.00,
      category: "software",
      status: "approved",
      submittedBy: "Emily Davis",
      receipt: true
    },
    {
      key: "5",
      expenseId: "EXP-2023-005",
      description: "Team Lunch",
      date: "2023-06-19",
      amount: 85.75,
      category: "meals",
      status: "approved",
      submittedBy: "Robert Wilson",
      receipt: true
    },
  ];

  // Summary statistics
  const summaryData = {
    totalExpenses: 1305.50,
    approvedExpenses: 434.75,
    pendingExpenses: 120.50,
    rejectedExpenses: 750.25,
    categories: {
      office: 250.00,
      meals: 206.25,
      travel: 750.25,
      software: 99.00
    }
  };

  // Status tag colors
  const statusColors = {
    approved: "green",
    pending: "orange",
    rejected: "red"
  };

  // Category icons
  const categoryIcons = {
    office: <ShoppingOutlined />,
    meals: <CarOutlined />,
    travel: <CarOutlined />,
    software: <HomeOutlined />
  };

  // Filter data based on selected filters
  const filteredData = expenseData.filter(item => {
    const dateInRange = dateRange.length === 0 || 
      (new Date(item.date) >= new Date(dateRange[0]) && 
      (new Date(item.date) <= new Date(dateRange[1])));
    const categoryMatch = categoryFilter === "all" || item.category === categoryFilter;
    const statusMatch = statusFilter === "all" || item.status === statusFilter;
    return dateInRange && categoryMatch && statusMatch;
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
      <Menu.Item key="csv" icon={<FileTextOutlined />}>CSV</Menu.Item>
      <Menu.Item key="pdf" icon={<FilePdfOutlined />}>PDF</Menu.Item>
      <Menu.Item key="excel" icon={<FileExcelOutlined />}>Excel</Menu.Item>
    </Menu>
  );

  // Columns for the table
  const columns = [
    {
      title: "Expense ID",
      dataIndex: "expenseId",
      key: "expenseId",
      render: (text) => <Text strong>{text}</Text>
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description"
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
        <Text strong style={{ color: theme.colorError }}>
          ${amount.toFixed(2)}
        </Text>
      ),
      sorter: (a, b) => a.amount - b.amount
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      render: (category) => (
        <Space>
          {categoryIcons[category]}
          {category.toUpperCase()}
        </Space>
      ),
      filters: [
        { text: "Office", value: "office" },
        { text: "Meals", value: "meals" },
        { text: "Travel", value: "travel" },
        { text: "Software", value: "software" }
      ],
      onFilter: (value, record) => record.category === value
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
        { text: "Approved", value: "approved" },
        { text: "Pending", value: "pending" },
        { text: "Rejected", value: "rejected" }
      ],
      onFilter: (value, record) => record.status === value
    },
    {
      title: "Submitted By",
      dataIndex: "submittedBy",
      key: "submittedBy"
    },
    {
      title: "Receipt",
      dataIndex: "receipt",
      key: "receipt",
      render: (receipt) => (
        <Tag color={receipt ? "green" : "red"}>
          {receipt ? "Attached" : "Missing"}
        </Tag>
      )
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
        <DollarOutlined style={{ marginRight: 12, color: theme.colorError }} />
        Expense Report
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
              placeholder="Category"
              onChange={setCategoryFilter}
              allowClear
            >
              <Option value="all">All Categories</Option>
              <Option value="office">Office</Option>
              <Option value="meals">Meals</Option>
              <Option value="travel">Travel</Option>
              <Option value="software">Software</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              style={{ width: "100%" }}
              placeholder="Status"
              onChange={setStatusFilter}
              allowClear
            >
              <Option value="all">All Statuses</Option>
              <Option value="approved">Approved</Option>
              <Option value="pending">Pending</Option>
              <Option value="rejected">Rejected</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Search
              placeholder="Search expenses..."
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
              title="Total Expenses"
              value={summaryData.totalExpenses}
              precision={2}
              prefix="$"
              valueStyle={{ color: theme.colorError }}
            />
            <Progress
              percent={100}
              showInfo={false}
              strokeColor={theme.colorError}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic
              title="Approved Expenses"
              value={summaryData.approvedExpenses}
              precision={2}
              prefix="$"
              valueStyle={{ color: theme.colorSuccess }}
            />
            <Progress
              percent={(summaryData.approvedExpenses / summaryData.totalExpenses) * 100}
              showInfo={false}
              strokeColor={theme.colorSuccess}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic
              title="Pending Approval"
              value={summaryData.pendingExpenses}
              precision={2}
              prefix="$"
              valueStyle={{ color: theme.colorWarning }}
            />
            <Progress
              percent={(summaryData.pendingExpenses / summaryData.totalExpenses) * 100}
              showInfo={false}
              strokeColor={theme.colorWarning}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic
              title="Rejected Expenses"
              value={summaryData.rejectedExpenses}
              precision={2}
              prefix="$"
              valueStyle={{ color: theme.colorError }}
            />
            <Progress
              percent={(summaryData.rejectedExpenses / summaryData.totalExpenses) * 100}
              showInfo={false}
              strokeColor={theme.colorError}
            />
          </Card>
        </Col>
      </Row>

      {/* Categories Breakdown */}
      <Card
        title="Expense Categories"
        bordered={false}
        style={{ marginBottom: 24 }}
        extra={
          <Dropdown overlay={exportMenu} trigger={["click"]}>
            <Button type="primary" icon={<DownloadOutlined />}>
              Export Report
            </Button>
          </Dropdown>
        }
      >
        <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <div style={{ height: 300, padding: '16px' }}>
            <Pie
              data={{
                labels: Object.keys(summaryData.categories).map(cat => cat.toUpperCase()),
                datasets: [
                  {
                    data: Object.values(summaryData.categories),
                    backgroundColor: [
                      theme.colorPrimary,
                      theme.colorSuccess,
                      theme.colorWarning,
                      theme.colorError,
                      theme.colorInfo,
                    ],
                    borderWidth: 1,
                  }
                ]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'right',
                  },
                  tooltip: {
                    callbacks: {
                      label: (context) => {
                        const label = context.label || '';
                        const value = context.raw || 0;
                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                        const percentage = Math.round((value / total) * 100);
                        return `${label}: $${value.toFixed(2)} (${percentage}%)`;
                      }
                    }
                  }
                }
              }}
            />
          </div>
        </Col>
          <Col xs={24} md={12}>
            <List
              dataSource={Object.entries(summaryData.categories)}
              renderItem={([category, amount]) => (
                <List.Item style={{ padding: 0 }}>
                <Card 
                  bordered={false} 
                  style={{ width: '100%', backgroundColor: 'transparent' }}
                  bodyStyle={{ padding: "12px 16px" }}
                >
                  <Row align="middle" gutter={16} style={{ width: '100%' }}>
                    <Col flex="none">
                      <Badge 
                        count={categoryIcons[category]} 
                        style={{ backgroundColor: theme.colorPrimary }}
                      />
                    </Col>
                    <Col flex="auto">
                      <Text strong>{category.toUpperCase()}</Text>
                      <Progress
                        percent={(amount / summaryData.totalExpenses) * 100}
                        showInfo={false}
                        strokeColor={theme.colorPrimary}
                      />
                    </Col>
                    <Col flex="none">
                      <Text strong>${amount.toFixed(2)}</Text>
                    </Col>
                  </Row>
                </Card>
              </List.Item>
              )}
            />
          </Col>
        </Row>
      </Card>

      {/* Expenses Table */}
      <Card
        title="Expense Transactions"
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
            showTotal: (total) => `Total ${total} expenses`
          }}
          summary={() => (
            <Table.Summary fixed>
              <Table.Summary.Row>
                <Table.Summary.Cell index={0} colSpan={3}>
                  <Text strong>Total</Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={1}>
                  <Text strong style={{ color: theme.colorError }}>
                    ${filteredData.reduce((sum, item) => sum + item.amount, 0).toFixed(2)}
                  </Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={2} colSpan={6} />
              </Table.Summary.Row>
            </Table.Summary>
          )}
        />
      </Card>
    </div>
  );
};

export default ExpenseReport;