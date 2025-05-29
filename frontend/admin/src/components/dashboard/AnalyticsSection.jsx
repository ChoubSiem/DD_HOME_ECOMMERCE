import React from 'react';
import { motion } from "framer-motion";
import { Card, Space, Select, Tabs, Col, Row,Button } from "antd";
import { BarChartOutlined, TableOutlined, CalendarOutlined } from "@ant-design/icons";
import SalesChart from "../sell_chart/SellChart";
import DataTable from "../data_table/DataTable";

const { TabPane } = Tabs;
const { Option } = Select;

const AnalyticsSection = ({
  activeFilter,
  setActiveFilter,
  activeView,
  setActiveView,
  filteredData,
  selectedMonth,
  handleMonthChange,
  dateRange,
  chartData
}) => {
  return (
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
                  onClick={() => setActiveFilter(filter)}
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

      {activeView === 'chart' ? (
        <SalesChart 
          data={filteredData} 
          title={selectedMonth 
            ? `Sales for ${selectedMonth}` 
            : dateRange 
              ? `Sales from ${dateRange[0]} to ${dateRange[1]}` 
              : `${activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1)}ly Sales`}
        />
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
    </Card>
  );
};

export default AnalyticsSection;