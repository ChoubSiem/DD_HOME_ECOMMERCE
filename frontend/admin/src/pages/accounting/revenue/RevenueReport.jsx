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
  Divider,
  Statistic,
  Progress,
  Badge,
  Dropdown,
  Menu,
  Tabs,
  List
} from "antd";
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  DollarOutlined,
  LineChartOutlined,
  BarChartOutlined,
  PieChartOutlined,
  DownloadOutlined,
  FilterOutlined,
  MoreOutlined,
  FilePdfOutlined,
  FileExcelOutlined,
  FileTextOutlined,
  RiseOutlined,
  FallOutlined
} from "@ant-design/icons";
import { useTheme } from "antd-style";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;
const { TabPane } = Tabs;

const ProfitLossReport = () => {
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState([]);
  const [timeFrame, setTimeFrame] = useState("monthly");
  const [activeTab, setActiveTab] = useState("summary");
  const theme = useTheme();

  // Sample P&L data
  const plData = {
    summary: {
      revenue: 125000,
      cogs: 65000,
      grossProfit: 60000,
      expenses: 35000,
      operatingProfit: 25000,
      netProfit: 21000,
      profitMargin: 16.8,
      previousPeriod: {
        revenue: 110000,
        netProfit: 18000
      }
    },
    monthly: [
      { month: "Jan", revenue: 10000, cogs: 5200, expenses: 3000, profit: 1800 },
      { month: "Feb", revenue: 12000, cogs: 6240, expenses: 3200, profit: 2560 },
      { month: "Mar", revenue: 15000, cogs: 7800, expenses: 3500, profit: 3700 },
      { month: "Apr", revenue: 11000, cogs: 5720, expenses: 3100, profit: 2180 },
      { month: "May", revenue: 13000, cogs: 6760, expenses: 3300, profit: 2940 },
      { month: "Jun", revenue: 14000, cogs: 7280, expenses: 3400, profit: 3320 }
    ],
    categories: [
      { name: "Product Sales", revenue: 85000, cost: 45000, profit: 40000 },
      { name: "Services", revenue: 30000, cost: 15000, profit: 15000 },
      { name: "Subscriptions", revenue: 10000, cost: 5000, profit: 5000 }
    ],
    expenses: [
      { category: "Salaries", amount: 15000, percent: 42.8 },
      { category: "Marketing", amount: 8000, percent: 22.8 },
      { category: "Rent", amount: 5000, percent: 14.3 },
      { category: "Utilities", amount: 3000, percent: 8.6 },
      { category: "Other", amount: 4000, percent: 11.5 }
    ]
  };

  // Calculate changes
  const revenueChange = ((plData.summary.revenue - plData.summary.previousPeriod.revenue) / 
                       plData.summary.previousPeriod.revenue) * 100;
  const profitChange = ((plData.summary.netProfit - plData.summary.previousPeriod.netProfit) / 
                      plData.summary.previousPeriod.netProfit) * 100;

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

  // Columns for monthly table
  const monthlyColumns = [
    {
      title: "Period",
      dataIndex: "month",
      key: "month"
    },
    {
      title: "Revenue",
      dataIndex: "revenue",
      key: "revenue",
      render: (text) => `$${text.toLocaleString()}`,
      sorter: (a, b) => a.revenue - b.revenue
    },
    {
      title: "COGS",
      dataIndex: "cogs",
      key: "cogs",
      render: (text) => `$${text.toLocaleString()}`,
      sorter: (a, b) => a.cogs - b.cogs
    },
    {
      title: "Expenses",
      dataIndex: "expenses",
      key: "expenses",
      render: (text) => `$${text.toLocaleString()}`,
      sorter: (a, b) => a.expenses - b.expenses
    },
    {
      title: "Profit",
      dataIndex: "profit",
      key: "profit",
      render: (text) => (
        <Text strong style={{ color: text >= 0 ? theme.colorSuccess : theme.colorError }}>
          ${text.toLocaleString()}
        </Text>
      ),
      sorter: (a, b) => a.profit - b.profit
    },
    {
      title: "Margin",
      key: "margin",
      render: (_, record) => (
        <Text type={record.profit >= 0 ? "success" : "danger"}>
          {((record.profit / record.revenue) * 100).toFixed(1)}%
        </Text>
      )
    }
  ];

  return (
    <div style={{ padding: "24px", maxWidth: "1600px", margin: "0 auto" }}>
      <Title level={2} style={{ marginBottom: 24 }}>
        <DollarOutlined style={{ marginRight: 12, color: theme.colorPrimary }} />
        Profit & Loss Statement
      </Title>

      {/* Filters */}
      <Card
        bordered={false}
        style={{ marginBottom: 24, boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)" }}
      >
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={8}>
            <RangePicker
              style={{ width: "100%" }}
              onChange={setDateRange}
              placeholder={["Start Date", "End Date"]}
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Select
              style={{ width: "100%" }}
              defaultValue="monthly"
              onChange={setTimeFrame}
            >
              <Option value="daily">Daily</Option>
              <Option value="weekly">Weekly</Option>
              <Option value="monthly">Monthly</Option>
              <Option value="quarterly">Quarterly</Option>
              <Option value="yearly">Yearly</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Dropdown overlay={exportMenu} trigger={["click"]}>
              <Button type="primary" icon={<DownloadOutlined />} style={{ width: "100%" }}>
                Export Report
              </Button>
            </Dropdown>
          </Col>
        </Row>
      </Card>

      {/* Summary Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={8}>
          <Card bordered={false}>
            <Statistic
              title="Total Revenue"
              value={plData.summary.revenue}
              precision={0}
              prefix="$"
              valueStyle={{ color: theme.colorSuccess }}
            />
            <Space>
              <Text type={revenueChange >= 0 ? "success" : "danger"}>
                {revenueChange >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                {Math.abs(revenueChange).toFixed(1)}%
              </Text>
              <Text type="secondary">vs previous period</Text>
            </Space>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card bordered={false}>
            <Statistic
              title="Net Profit"
              value={plData.summary.netProfit}
              precision={0}
              prefix="$"
              valueStyle={{ color: theme.colorSuccess }}
            />
            <Space>
              <Text type={profitChange >= 0 ? "success" : "danger"}>
                {profitChange >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                {Math.abs(profitChange).toFixed(1)}%
              </Text>
              <Text type="secondary">vs previous period</Text>
            </Space>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card bordered={false}>
            <Statistic
              title="Profit Margin"
              value={plData.summary.profitMargin}
              precision={1}
              suffix="%"
              valueStyle={{ color: plData.summary.profitMargin >= 10 ? theme.colorSuccess : theme.colorWarning }}
            />
            <Progress
              percent={plData.summary.profitMargin}
              showInfo={false}
              strokeColor={
                plData.summary.profitMargin >= 15 ? theme.colorSuccess :
                plData.summary.profitMargin >= 10 ? theme.colorWarning :
                theme.colorError
              }
            />
          </Card>
        </Col>
      </Row>

      {/* Main Content Tabs */}
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        style={{ marginBottom: 24 }}
        items={[
          {
            key: "summary",
            label: (
              <span>
                <LineChartOutlined />
                Summary
              </span>
            )
          },
          {
            key: "details",
            label: (
              <span>
                <BarChartOutlined />
                Details
              </span>
            )
          },
          {
            key: "categories",
            label: (
              <span>
                <PieChartOutlined />
                Categories
              </span>
            )
          }
        ]}
      />

      {/* Summary Tab */}
      {activeTab === "summary" && (
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Card
              title="Income Statement"
              bordered={false}
              style={{ marginBottom: 24 }}
            >
              <div style={{ height: 400 }}>
                {/* This would be a line chart in a real implementation */}
                <div style={{ 
                  height: "100%", 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "center",
                  backgroundColor: theme.colorBgContainer,
                  borderRadius: 8
                }}>
                  <Text type="secondary">Line Chart: Revenue vs Expenses</Text>
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card
              title="Key Metrics"
              bordered={false}
              style={{ marginBottom: 24 }}
            >
              <List
                dataSource={[
                  { label: "Gross Profit", value: `$${plData.summary.grossProfit.toLocaleString()}` },
                  { label: "Operating Profit", value: `$${plData.summary.operatingProfit.toLocaleString()}` },
                  { label: "COGS", value: `$${plData.summary.cogs.toLocaleString()} (${((plData.summary.cogs / plData.summary.revenue) * 100).toFixed(1)}%)` },
                  { label: "Operating Expenses", value: `$${plData.summary.expenses.toLocaleString()} (${((plData.summary.expenses / plData.summary.revenue) * 100).toFixed(1)}%)` }
                ]}
                renderItem={(item) => (
                  <List.Item>
                    <Row style={{ width: "100%" }}>
                      <Col span={12}><Text strong>{item.label}</Text></Col>
                      <Col span={12} style={{ textAlign: "right" }}>{item.value}</Col>
                    </Row>
                  </List.Item>
                )}
              />
            </Card>
          </Col>
        </Row>
      )}

      {/* Details Tab */}
      {activeTab === "details" && (
        <Card
          title={`${timeFrame.charAt(0).toUpperCase() + timeFrame.slice(1)} Performance`}
          bordered={false}
          extra={
            <Dropdown overlay={exportMenu}>
              <Button icon={<DownloadOutlined />}>Export</Button>
            </Dropdown>
          }
        >
          <Table
            columns={monthlyColumns}
            dataSource={plData.monthly}
            loading={loading}
            pagination={false}
            summary={() => (
              <Table.Summary.Row style={{ background: theme.colorBgContainer }}>
                <Table.Summary.Cell index={0}><Text strong>Total</Text></Table.Summary.Cell>
                <Table.Summary.Cell index={1}>
                  <Text strong>${plData.monthly.reduce((sum, item) => sum + item.revenue, 0).toLocaleString()}</Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={2}>
                  <Text strong>${plData.monthly.reduce((sum, item) => sum + item.cogs, 0).toLocaleString()}</Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={3}>
                  <Text strong>${plData.monthly.reduce((sum, item) => sum + item.expenses, 0).toLocaleString()}</Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={4}>
                  <Text strong style={{ color: theme.colorSuccess }}>
                    ${plData.monthly.reduce((sum, item) => sum + item.profit, 0).toLocaleString()}
                  </Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={5}>
                  <Text strong>
                    {(
                      (plData.monthly.reduce((sum, item) => sum + item.profit, 0) / 
                      plData.monthly.reduce((sum, item) => sum + item.revenue, 0) * 100
                    ).toFixed(1))}%
                  </Text>
                </Table.Summary.Cell>
              </Table.Summary.Row>
            )}
          />
        </Card>
      )}

      {/* Categories Tab */}
      {activeTab === "categories" && (
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Card
              title="Revenue by Category"
              bordered={false}
            >
              <List
                dataSource={plData.categories}
                renderItem={(item) => (
                  <List.Item>
                    <Card bordered={false} style={{ width: "100%" }}>
                      <Row align="middle">
                        <Col span={16}>
                          <Text strong>{item.name}</Text>
                          <Progress
                            percent={Math.round((item.revenue / plData.summary.revenue) * 100)}
                            showInfo={false}
                            strokeColor={theme.colorPrimary}
                          />
                        </Col>
                        <Col span={8} style={{ textAlign: "right" }}>
                          <Text strong>${item.revenue.toLocaleString()}</Text>
                          <br />
                          <Text type="secondary">{((item.revenue / plData.summary.revenue) * 100).toFixed(1)}%</Text>
                        </Col>
                      </Row>
                    </Card>
                  </List.Item>
                )}
              />
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card
              title="Expense Breakdown"
              bordered={false}
            >
              <List
                dataSource={plData.expenses}
                renderItem={(item) => (
                  <List.Item>
                    <Card bordered={false} style={{ width: "100%" }}>
                      <Row align="middle">
                        <Col span={16}>
                          <Text strong>{item.category}</Text>
                          <Progress
                            percent={item.percent}
                            showInfo={false}
                            strokeColor={theme.colorError}
                          />
                        </Col>
                        <Col span={8} style={{ textAlign: "right" }}>
                          <Text strong>${item.amount.toLocaleString()}</Text>
                          <br />
                          <Text type="secondary">{item.percent.toFixed(1)}%</Text>
                        </Col>
                      </Row>
                    </Card>
                  </List.Item>
                )}
              />
            </Card>
          </Col>
        </Row>
      )}
    </div>
  );
};

export default ProfitLossReport;