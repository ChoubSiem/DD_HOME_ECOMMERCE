// components/Dashboard.js
import React, { useState, useEffect } from 'react';
import './Dashboard.css';
import {TableOutlined ,DollarCircleOutlined ,RiseOutlined ,UserOutlined ,ShoppingCartOutlined ,BarChartOutlined ,CalendarOutlined ,} from "@ant-design/icons";
import { motion, AnimatePresence } from "framer-motion";
import {Button,Card ,Space ,Select ,Tabs, Row ,Col,Checkbox  } from "antd";
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,} from "recharts";
import { usePolicy } from '../hooks/usePolicy';
import DashboardCard from "../components/cards/DashboardCard";
const { TabPane } = Tabs;
import SalesChart  from "../components/sell_chart/SellChart";
import SellerItem   from "../components/saller_item/SellerItem";
import DataTable    from "../components/data_table/DataTable";
// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.3,
    },
  },
};

const slideUp = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
    },
  },
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.5,
    },
  },
};
const Dashboard = () => {
  const [activeFilter, setActiveFilter] = useState('month');
  const [activeView, setActiveView] = useState('chart');
  const [selectedCards, setSelectedCards] = useState(['sales', 'expenses', 'customers', 'orders']);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [dateRange, setDateRange] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(null);



  const allCards = [
    {
      id: 'sales',
      icon: <DollarCircleOutlined />,
      title: 'Total Sales',
      amount: '0',
      trend: '0% from last month',
      trendPositive: true,
      iconClassName: 'card-icon-blue'
    },
    {
      id: 'expenses',
      icon: <RiseOutlined />,
      title: 'Expenses',
      amount: '0',
      trend: '0% from last month',
      trendPositive: false,
      iconClassName: 'card-icon-red'
    },
    {
      id: 'customers',
      icon: <UserOutlined />,
      title: 'New Customers',
      amount: '0',
      trend: '0% from last month',
      trendPositive: true,
      iconClassName: 'card-icon-green'
    },
    {
      id: 'orders',
      icon: <ShoppingCartOutlined />,
      title: 'Total Orders',
      amount: '0',
      trend: '0% from last month',
      trendPositive: true,
      iconClassName: 'card-icon-purple'
    }
  ];

  const fastMovingProducts = [
    { name: 'Premium Headphones', value: '$5,200', percentage: '22%', progress: 75, color: '#6366f1' },
    { name: 'Smart Watch Pro', value: '$4,800', percentage: '20%', progress: 70, color: '#8b5cf6' },
    { name: 'Wireless Earbuds', value: '$3,500', percentage: '15%', progress: 60, color: '#ec4899' },
  ];

  const slowMovingProducts = [
    { name: 'Old Model Phone', value: '$800', percentage: '3%', progress: 25, color: '#f97316' },
    { name: 'Basic Tablet', value: '$600', percentage: '2.5%', progress: 15, color: '#ef4444' },
    { name: 'Wired Headphones', value: '$300', percentage: '1.2%', progress: 5, color: '#64748b' },
  ];

    // Sample data
    const chartData = [
      { month: 'Jan',category:'Sales',sales: 1200,expenses: 800,customers: 150,orders: 90,trends: {sales: 5.2,expenses: -2.1,profit: 7.3,customers: 3.5,orders: 4.8,efficiency: 1.2}},
      { month: 'Feb',category:'Sales',sales: 1200,expenses: 800,customers: 150,orders: 90,trends: {sales: 5.2,expenses: -2.1,profit: 7.3,customers: 3.5,orders: 4.8,efficiency: 1.2}},
      { month: 'Mat',category:'Sales',sales: 1200,expenses: 800,customers: 150,orders: 90,trends: {sales: 5.2,expenses: -2.1,profit: 7.3,customers: 3.5,orders: 4.8,efficiency: 1.2}},
      { month: 'Apr',category:'Sales',sales: 1200,expenses: 800,customers: 150,orders: 90,trends: {sales: 5.2,expenses: -2.1,profit: 7.3,customers: 3.5,orders: 4.8,efficiency: 1.2}},
      { month: 'May',category:'Sales',sales: 1200,expenses: 800,customers: 150,orders: 90,trends: {sales: 5.2,expenses: -2.1,profit: 7.3,customers: 3.5,orders: 4.8,efficiency: 1.2}},
      { month: 'Jun',category:'Sales',sales: 1200,expenses: 800,customers: 150,orders: 90,trends: {sales: 5.2,expenses: -2.1,profit: 7.3,customers: 3.5,orders: 4.8,efficiency: 1.2}},
      { month: 'Jul',category:'Sales',sales: 1200,expenses: 800,customers: 150,orders: 90,trends: {sales: 5.2,expenses: -2.1,profit: 7.3,customers: 3.5,orders: 4.8,efficiency: 1.2}},
      { month: 'Aug',category:'Sales',sales: 1200,expenses: 800,customers: 150,orders: 90,trends: {sales: 5.2,expenses: -2.1,profit: 7.3,customers: 3.5,orders: 4.8,efficiency: 1.2}},
      { month: 'Sep',category:'Sales',sales: 1200,expenses: 800,customers: 150,orders: 90,trends: {sales: 5.2,expenses: -2.1,profit: 7.3,customers: 3.5,orders: 4.8,efficiency: 1.2}},
      { month: 'Oct',category:'Sales',sales: 1200,expenses: 800,customers: 150,orders: 90,trends: {sales: 5.2,expenses: -2.1,profit: 7.3,customers: 3.5,orders: 4.8,efficiency: 1.2}},
      { month: 'Nov',category:'Sales',sales: 1200,expenses: 800,customers: 150,orders: 90,trends: {sales: 5.2,expenses: -2.1,profit: 7.3,customers: 3.5,orders: 4.8,efficiency: 1.2}},
      
      {month: 'Dec',category:'Sales',sales: 3500,expenses: 1500,customers: 330,orders: 180,trends: {sales: 8.1,expenses: -1.5,profit: 9.6,customers: 5.2,orders: 6.3,efficiency: 2.1}}
    ];

  const [filteredData, setFilteredData] = useState(chartData);
  useEffect(() => {
    let data = [...chartData];
    
    if (selectedMonth) {
      data = data.filter(item => item.month === selectedMonth);
    } else if (dateRange && dateRange.length === 2) {
      const months = chartData.map(d => d.month);
      const startIndex = months.indexOf(dateRange[0]);
      const endIndex = months.indexOf(dateRange[1]);
      data = data.slice(startIndex, endIndex + 1);
    } else {
      switch (activeFilter) {
        case 'day': data = [data[data.length - 1]]; break;
        case 'week': data = data.slice(-2); break;
        case 'year': data = data.slice(0, 12); break;
        default: break; 
      }
    }
    
    setFilteredData(data.map(item => ({
      month: item.month,
      sales: item.sales,
      expenses: item.expenses,
      customers: item.customers,
      orders: item.orders,
      trends: item.trends || {}
    })));
  }, [activeFilter, dateRange, selectedMonth]);

  const handleMonthChange = (value) => {
    setSelectedMonth(value);
    setDateRange(null);
  };

  const handleRangeChange = (dates) => {
    setDateRange(dates);
    setSelectedMonth(null);
  };

  const handleCardToggle = (cardId) => {
    setSelectedCards(prev => 
      prev.includes(cardId) 
        ? prev.filter(id => id !== cardId) 
        : [...prev, cardId]
    );
  };

  const displayedCards = allCards.filter(card => selectedCards.includes(card.id));

  return (
    <motion.div 
      className="dashboard-container"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Header Section */}
      <motion.div className="dashboard-header" variants={slideUp}>
        <div className="header-controls">
          <Button 
            type={isCustomizing ? 'primary' : 'default'} 
            onClick={() => setIsCustomizing(!isCustomizing)}
            icon={<BarChartOutlined />}
          >
            {isCustomizing ? 'Done Customizing' : 'Customize View'}
          </Button>
        </div>
      </motion.div>

      {/* Customization Panel */}
      <AnimatePresence>
        {isCustomizing && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="customization-panel">
              <Row gutter={[16, 16]}>
                {allCards.map(card => (
                  <Col xs={24} sm={12} md={8} lg={6} key={card.id}>
                    <motion.div whileHover={{ scale: 1.02 }}>
                      <Checkbox
                        checked={selectedCards.includes(card.id)}
                        onChange={() => handleCardToggle(card.id)}
                      >
                        {card.title}
                      </Checkbox>
                    </motion.div>
                  </Col>
                ))}
              </Row>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
      

      <motion.div className="metrics-grid" variants={containerVariants}>
        {displayedCards.length > 0 ? (
          displayedCards.map(card => (
            <motion.div 
              key={card.id} 
              variants={cardVariants}
              whileHover={{ y: -5 }}
            >
              <DashboardCard {...card} />
            </motion.div>
          ))
        ) : (
          <motion.div variants={fadeIn}>
            <Card className="no-cards-selected">
              <Empty 
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <span>
                    No metrics selected. <a onClick={() => setIsCustomizing(true)}>Customize your dashboard</a>.
                  </span>
                }
              />
            </Card>
          </motion.div>
        )}
      </motion.div>

      <motion.div className="main-content" variants={slideUp}>
      <Card className="analytics-section">
        <div className="section-header">
          <div>
            <h2>Sales Analytics</h2>
            <p className="section-subtitle">Performance overview for selected period</p>
          </div>
          <Space>
            <Space.Compact>
              {['day', 'week', 'month', 'year'].map(filter => (
                <motion.div key={filter} whileTap={{ scale: 0.95 }}>
                  <Button
                    type={activeFilter === filter ? 'primary' : 'default'}
                    onClick={() => {
                      setActiveFilter(filter);
                      setSelectedMonth(null);
                      setDateRange(null);
                    }}
                    style={{ textTransform: 'capitalize' }}
                  >
                    {filter}
                  </Button>
                </motion.div>
              ))}
            </Space.Compact>
            
            <Select
              placeholder="Select month"
              style={{ width: 120 }}
              onChange={handleMonthChange}
              value={selectedMonth}
              suffixIcon={<CalendarOutlined />}
              allowClear
            >
              {chartData.map(({ month }) => (
                <Option key={month} value={month}>{month}</Option>
              ))}
            </Select>
            
            <Tabs 
              activeKey={activeView} 
              onChange={setActiveView}
              className="view-tabs"
            >
              <TabPane 
                tab={
                  <motion.span whileHover={{ scale: 1.05 }}>
                    <BarChartOutlined /> Chart
                  </motion.span>
                } 
                key="chart" 
              />
              <TabPane 
                tab={
                  <motion.span whileHover={{ scale: 1.05 }}>
                    <TableOutlined /> Table
                  </motion.span>
                } 
                key="table" 
              />
            </Tabs>
          </Space>
        </div>
  
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView + (selectedMonth || dateRange?.join('') || activeFilter)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="data-view-container"
            >
              {activeView === 'chart' ? (
                <>
                  <SalesChart 
                    data={filteredData} 
                    title={selectedMonth 
                      ? `Sales for ${selectedMonth}` 
                      : dateRange 
                        ? `Sales from ${dateRange[0]} to ${dateRange[1]}` 
                        : `${activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1)}ly Sales`}
                  />
                  
                </>
              ) : (
                <DataTable 
                  data={filteredData} 
                  expandedRowRender={record => (
                    <div className="month-details">
                      
                      <h4>Detailed Financials for {record.month}</h4>
                      <Row gutter={16}>
                        <Col span={8}>
                          <p><strong>Gross Sales:</strong> ${record.sales.toLocaleString()}</p>
                          <p><strong>Cost of Goods:</strong> ${record.expenses.toLocaleString()}</p>
                        </Col>
                        <Col span={8}>
                          <p><strong>Gross Profit:</strong> ${(record.sales - record.expenses).toLocaleString()}</p>
                          <p><strong>Operating Costs:</strong> ${Math.round(record.expenses * 0.3).toLocaleString()}</p>
                        </Col>
                        <Col span={8}>
                          <p><strong>Net Profit:</strong> ${(record.sales - record.expenses * 1.3).toLocaleString()}</p>
                          <p><strong>Cash Flow:</strong> ${(record.sales - record.expenses * 0.8).toLocaleString()}</p>
                        </Col>
                      </Row>
                    </div>
                  )}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </Card>
        <div className="products-section">
          <motion.div 
            className="product-list-wrapper"
            variants={cardVariants}
            whileHover={{ y: -5 }}
            transition={{ duration: 0.2 }}
          >
        <div className="right-section">
          <div className="seller-section">
            <div className="seller-header">
              <h3 className="seller-title">Fast Moving Products</h3>
              <span className="view-all">View All</span>
            </div>
            <SellerItem 
              name="Product A" 
              value="$5,000" 
              percentage="25%" 
              progress={75}
              color="#6366f1"
            />
            <SellerItem 
              name="Product B" 
              value="$3,200" 
              percentage="16%" 
              progress={60}
              color="#8b5cf6"
            />
            <SellerItem 
              name="Product C" 
              value="$2,800" 
              percentage="14%" 
              progress={50}
              color="#ec4899"
            />
          </div>

          <div className="seller-section">
            <div className="seller-header">
              <h3 className="seller-title">SLow Moving Products</h3>
              <span className="view-all">View All</span>
            </div>
            <SellerItem 
              name="Product X" 
              value="$500" 
              percentage="2.5%" 
              progress={25}
              color="#f97316"
            />
            <SellerItem 
              name="Product Y" 
              value="$300" 
              percentage="1.5%" 
              progress={15}
              color="#ef4444"
            />
            <SellerItem 
              name="Product Z" 
              value="$100" 
              percentage="0.5%" 
              progress={5}
              color="#64748b"
            />
          </div>
        </div>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;
