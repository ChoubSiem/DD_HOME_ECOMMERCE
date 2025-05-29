import { 
    Card, 
    Table, 
    Tag, 
    Row, 
    Col, 
    Select, 
    DatePicker, 
    Space, 
    Statistic,
    Tabs,
    Progress 
  } from 'antd';
  import { 
    ArrowUpOutlined, 
    ArrowDownOutlined, 
    FilterOutlined,
    FireOutlined,
    WarningOutlined 
  } from '@ant-design/icons';
  import { Bar, Line } from 'react-chartjs-2';
  import { motion } from 'framer-motion';
  import React, { useState } from "react";
  import Chart from 'chart.js/auto'; // Required for react-chartjs-2
  
  const { Option } = Select;
  const { RangePicker } = DatePicker;
  
  const ProductPerformanceDashboard = () => {
    // State for filters
    const [timeRange, setTimeRange] = useState('week');
    const [dateFilter, setDateFilter] = useState(null);
  
    // Sample data - replace with API calls
    const productData = {
      bestSellers: [
        { id: 1, name: 'Noise-Canceling Headphones', sales: 2540, growth: 18.2, margin: 42 },
        { id: 2, name: 'Smart Fitness Watch', sales: 1870, growth: 12.7, margin: 38 },
        { id: 3, name: 'Wireless Charger', sales: 1420, growth: 9.3, margin: 35 }
      ],
      lowestSellers: [
        { id: 4, name: 'Phone Stand', sales: 85, growth: -15.2, margin: 12 },
        { id: 5, name: 'Cable Organizer', sales: 62, growth: -21.8, margin: 8 },
        { id: 6, name: 'Screen Cleaner Kit', sales: 47, growth: -29.4, margin: 5 }
      ],
      trends: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
        best: [1200, 1900, 1700, 2100, 2540],
        worst: [320, 180, 120, 90, 47]
      }
    };
  
    // Chart configurations
    const barChartData = {
      labels: productData.bestSellers.map(item => item.name),
      datasets: [{
        label: 'Sales Volume',
        data: productData.bestSellers.map(item => item.sales),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1
      }]
    };
  
    const lineChartData = {
      labels: productData.trends.labels,
      datasets: [
        {
          label: 'Top Products',
          data: productData.trends.best,
          borderColor: '#52c41a',
          tension: 0.4,
          fill: true
        },
        {
          label: 'Low Performers',
          data: productData.trends.worst,
          borderColor: '#ff4d4f',
          tension: 0.4,
          fill: true
        }
      ]
    };
  
    // Tabs items for Ant Design v5+
    const tabItems = [
      {
        key: '1',
        label: (
          <span>
            <FireOutlined />
            Top Performers
          </span>
        ),
        children: <ProductTable data={productData.bestSellers} color="#52c41a" />,
      },
      {
        key: '2',
        label: (
          <span>
            <WarningOutlined />
            Needs Improvement
          </span>
        ),
        children: <ProductTable data={productData.lowestSellers} color="#ff4d4f" />,
      },
    ];
  
    return (
      <div style={{ padding: '24px', background: '#f5f7fa' }}>
        {/* Filter Section */}
        <Card 
          title={
            <Space>
              <FilterOutlined />
              <span>Product Analytics</span>
            </Space>
          }
          style={{ marginBottom: 24 }}
        >
          <Row gutter={16}>
            <Col xs={24} sm={8}>
              <Select
                style={{ width: '100%' }}
                defaultValue="week"
                onChange={setTimeRange}
                suffixIcon={<FireOutlined />}
              >
                <Option value="day">Today</Option>
                <Option value="week">This Week</Option>
                <Option value="month">This Month</Option>
                <Option value="quarter">Quarter</Option>
              </Select>
            </Col>
            <Col xs={24} sm={8}>
              <RangePicker 
                style={{ width: '100%' }} 
                onChange={setDateFilter}
              />
            </Col>
            <Col xs={24} sm={8}>
              <Select
                style={{ width: '100%' }}
                defaultValue="all"
              >
                <Option value="all">All Categories</Option>
                <Option value="electronics">Electronics</Option>
                <Option value="accessories">Accessories</Option>
                <Option value="home">Home Goods</Option>
              </Select>
            </Col>
          </Row>
        </Card>
  
        {/* Metrics Overview */}
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} md={8}>
            <motion.div whileHover={{ scale: 1.02 }}>
              <Card bordered={false}>
                <Statistic
                  title="Total Top Products"
                  value={productData.bestSellers.length}
                  prefix={<FireOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </motion.div>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <motion.div whileHover={{ scale: 1.02 }}>
              <Card bordered={false}>
                <Statistic
                  title="Avg. Growth Rate"
                  value="12.7%"
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </motion.div>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <motion.div whileHover={{ scale: 1.02 }}>
              <Card bordered={false}>
                <Statistic
                  title="Products Needing Attention"
                  value={productData.lowestSellers.length}
                  prefix={<WarningOutlined />}
                  valueStyle={{ color: '#ff4d4f' }}
                />
              </Card>
            </motion.div>
          </Col>
        </Row>
  
        {/* Main Content */}
        <Row gutter={[16, 16]}>
          {/* Best Sellers */}
          <Col xs={24} lg={12}>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Card
                title={
                  <Space>
                    <FireOutlined style={{ color: '#52c41a' }} />
                    <span>Revenue Champions</span>
                  </Space>
                }
                extra={<Tag color="green">+18.2% Growth</Tag>}
                style={{ height: '100%' }}
              >
                <div style={{ height: 300 }}>
                  <Bar 
                    data={barChartData}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: {
                          position: 'top',
                        },
                        tooltip: {
                          callbacks: {
                            label: (context) => {
                              const product = productData.bestSellers[context.dataIndex];
                              return `Profit Margin: ${product.margin}%`;
                            }
                          }
                        }
                      }
                    }}
                  />
                </div>
              </Card>
            </motion.div>
          </Col>
  
          {/* Low Performers */}
          <Col xs={24} lg={12}>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card
                title={
                  <Space>
                    <WarningOutlined style={{ color: '#ff4d4f' }} />
                    <span>Opportunity Zone</span>
                  </Space>
                }
                extra={<Tag color="red">-21.8% Decline</Tag>}
                style={{ height: '100%' }}
              >
                <div style={{ height: 300 }}>
                  <Line
                    data={lineChartData}
                    options={{
                      responsive: true,
                      interaction: {
                        intersect: false,
                        mode: 'index',
                      },
                      scales: {
                        y: {
                          beginAtZero: false
                        }
                      }
                    }}
                  />
                </div>
              </Card>
            </motion.div>
          </Col>
  
          {/* Detailed Tables */}
          <Col span={24}>
            <Tabs 
              defaultActiveKey="1"
              items={tabItems}
            />
          </Col>
        </Row>
      </div>
    );
  };
  
  // Reusable product table component
  const ProductTable = ({ data, color }) => (
    <Table
      columns={[
        {
          title: 'Product',
          dataIndex: 'name',
          key: 'name',
          render: (text) => <a>{text}</a>
        },
        {
          title: 'Sales',
          dataIndex: 'sales',
          key: 'sales',
          render: (val) => val.toLocaleString()
        },
        {
          title: 'Trend',
          dataIndex: 'growth',
          key: 'growth',
          render: (val) => (
            <Tag 
              color={val >= 0 ? 'green' : 'red'} 
              icon={val >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
            >
              {Math.abs(val)}%
            </Tag>
          )
        },
        {
          title: 'Margin',
          dataIndex: 'margin',
          key: 'margin',
          render: (val) => (
            <Progress 
              percent={val} 
              strokeColor={color}
              size="small" 
              showInfo={false}
            />
          )
        }
      ]}
      dataSource={data}
      pagination={false}
      rowKey="id"
    />
  );
  
  export default ProductPerformanceDashboard;