import React, { useState } from 'react';
import { DualAxes } from '@ant-design/plots';
import { Card, Select, Space, Row, Col, Statistic } from 'antd';

const SalesChart = () => {
  const [chartType, setChartType] = useState('dual'); // 'dual' or 'simple'
  
  // Modified data to match the example structure
  const uvBillData = [
    { time: 'Jan', value: 350, type: 'Revenue' },
    { time: 'Feb', value: 900, type: 'Revenue' },
    { time: 'Mar', value: 300, type: 'Revenue' },
    { time: 'Apr', value: 450, type: 'Revenue' },
    { time: 'May', value: 470, type: 'Revenue' },
    { time: 'Jun', value: 300, type: 'Revenue' },
    { time: 'Jul', value: 450, type: 'Revenue' },
    { time: 'Aug', value: 470, type: 'Revenue' },
    { time: 'Sep', value: 300, type: 'Revenue' },
    { time: 'Oct', value: 450, type: 'Revenue' },
    { time: 'Nov', value: 470, type: 'Revenue' },
    { time: 'Dec', value: 470, type: 'Revenue' },
    { time: 'Jan', value: 220, type: 'Expenses' },
    { time: 'Feb', value: 300, type: 'Expenses' },
    { time: 'Mar', value: 250, type: 'Expenses' },
    { time: 'Apr', value: 220, type: 'Expenses' },
    { time: 'May', value: 362, type: 'Expenses' },
    { time: 'Jun', value: 220, type: 'Expenses' },
    { time: 'Jul', value: 300, type: 'Expenses' },
    { time: 'Aug', value: 250, type: 'Expenses' },
    { time: 'Sep', value: 220, type: 'Expenses' },
    { time: 'Oct', value: 362, type: 'Expenses' },
    { time: 'Nov', value: 362, type: 'Expenses' },
    { time: 'Dec', value: 362, type: 'Expenses' },
    { time: 'Jan', value: 220, type: 'Cost' },
    { time: 'Feb', value: 300, type: 'Cost' },
    { time: 'Mar', value: 250, type: 'Cost' },
    { time: 'Apr', value: 220, type: 'Cost' },
    { time: 'May', value: 362, type: 'Cost' },
    { time: 'Jun', value: 220, type: 'Cost' },
    { time: 'Jul', value: 300, type: 'Cost' },
    { time: 'Aug', value: 250, type: 'Cost' },
    { time: 'Sep', value: 220, type: 'Cost' },
    { time: 'Oct', value: 362, type: 'Cost' },
    { time: 'Nov', value: 362, type: 'Cost' },
    { time: 'Dec', value: 362, type: 'Cost' },
    { time: 'Jan', value: 220, type: 'Price' },
    { time: 'Feb', value: 300, type: 'Price' },
    { time: 'Mar', value: 250, type: 'Price' },
    { time: 'Apr', value: 220, type: 'Price' },
    { time: 'May', value: 362, type: 'Price' },
    { time: 'Jun', value: 220, type: 'Price' },
    { time: 'Jul', value: 300, type: 'Price' },
    { time: 'Aug', value: 250, type: 'Price' },
    { time: 'Sep', value: 220, type: 'Price' },
    { time: 'Oct', value: 362, type: 'Price' },
    { time: 'Nov', value: 362, type: 'Price' },
    { time: 'Dec', value: 362, type: 'Price' },
  ];

  const transformData = [
    { time: 'Jan', count: 800 },
    { time: 'Feb', count: 600 },
    { time: 'Mar', count: 400 },
    { time: 'Apr', count: 380 },
    { time: 'May', count: 220 },
    { time: 'Jun', count: 800 },
    { time: 'Jul', count: 600 },
    { time: 'Aug', count: 400 },
    { time: 'Sep', count: 380 },
    { time: 'Oct', count: 220 },
    { time: 'Nov', count: 220 },
    { time: 'Dec', count: 220 },
  ];

  const config = {
    height: 400,
    xField: 'time',
    legend: {
      color: {
        position: 'bottom',
        layout: { justifyContent: 'center' },
      },
    },
    scale: { color: { range: ['green', '#5D7092', '#5AD8A6','black', 'red'] } },
    children: [
      {
        data: uvBillData,
        type: 'interval',
        yField: 'value',
        colorField: 'type',
        group: true,
        style: { maxWidth: 50 },
        label: { position: 'inside' },
        interaction: { elementHighlight: { background: true } },
        meta: {
          value: {
            alias: 'Amount ($)',
            formatter: (v) => `$${v.toLocaleString()}`,
          },
        },
      },
      {
        data: transformData,
        type: 'line',
        yField: 'count',
        style: { lineWidth: 2 },
        axis: { y: { position: 'right' } },
        interaction: {
          tooltip: {
            crosshairs: false,
            marker: false,
          },
        },
        meta: {
          count: {
            alias: 'Quantity',
            formatter: (v) => `${v} units`,
          },
        },
      },
    ],
  };

  // Calculate summary statistics
  const totalRevenue = uvBillData
    .filter(item => item.type === 'Revenue')
    .reduce((sum, item) => sum + item.value, 0);
  
  const totalExpenses = uvBillData
    .filter(item => item.type === 'Expenses')
    .reduce((sum, item) => sum + item.value, 0);
    
  const profit = totalRevenue - totalExpenses;
  const profitMargin = (profit / totalRevenue) * 100;

  return (
    <div style={{ padding: '24px' }}>
      
        <div style={{ height: 500 }}>
          <DualAxes {...config} />
        </div>
    </div>
  );
};

export default SalesChart;