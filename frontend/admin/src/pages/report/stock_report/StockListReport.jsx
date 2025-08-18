import React from 'react';
import { Card, Row, Col, Tag } from 'antd';
import { useNavigate } from 'react-router-dom';
import {
  DatabaseOutlined,
  AlertOutlined,
  StockOutlined,
  SwapOutlined,
  HistoryOutlined,
  BarcodeOutlined,
  RiseOutlined,
  FallOutlined,
  BoxPlotOutlined,
  PlusOutlined,
  MinusOutlined,
  EditOutlined,
  ExceptionOutlined
} from '@ant-design/icons';

const { Meta } = Card;

const StockReports = () => {
  const navigate = useNavigate();

  // Color definitions
  const colors = {
    green: '#52c41a',  // Ant Design green
    red: '#f5222d',    // Ant Design red
    black: '#262626',
    white: '#ffffff',
    text: '#262626',
    description: '#595959'
  };

  const reports = [
    // Green Reports (Positive/Additions)
    {
      title: 'Stock Report',
      icon: <PlusOutlined />,
      path: '/reports/stock',
      color: colors.green,
      type: 'increase'
    },
    {
      title: 'Product Report',
      icon: <RiseOutlined />,
      path: '/reports/product',
      color: colors.green,
      type: 'trend'
    },
    {
      title: 'Current Stock',
      icon: <DatabaseOutlined />,
      path: '/reports/stock/levels',
      color: colors.green,
      type: 'status'
    },

    // Red Reports (Negative/Deductions)
    {
      title: 'Stock Deductions',
      icon: <MinusOutlined />,
      path: '/reports/stock/deductions',
      color: colors.red,
      type: 'decrease'
    },
    {
      title: 'Slow Moving Items',
      icon: <FallOutlined />,
      path: '/reports/stock/slow-moving',
      color: colors.red,
      type: 'trend'
    },
    {
      title: 'Low Stock Alerts',
      icon: <AlertOutlined />,
      path: '/reports/stock/low-stock',
      color: colors.red,
      type: 'alert'
    },

    // Neutral Reports (Black/White)
    {
      title: 'Stock Transfers',
      icon: <SwapOutlined />,
      path: '/reports/stock/transfers',
      color: colors.black,
      type: 'movement'
    },
    {
      title: 'Stock History',
      icon: <HistoryOutlined />,
      path: '/reports/stock/transition',
      color: colors.black,
      type: 'record'
    },
    {
      title: 'Purchase Report',
      icon: <ExceptionOutlined />,
      path: '/reports/purchase',
      color: colors.black,
      type: 'purchase'
    },
    {
      title: 'Shelf Report',
      icon: <ExceptionOutlined />,
      path: '/reports/purchase',
      color: colors.black,
      type: 'shelf'
    },
    {
      title: 'Fast And Slow Moving Product',
      icon: <ExceptionOutlined />,
      path: '/reports/fast-slow-moving',
      color: colors.black,
      type: 'fast-slow-moving'
    }
  ];

  const handleCardClick = (path) => {
    navigate(path);
  };

  return (
    <div style={{ padding: '20px', background: colors.white }}>
      <h2 style={{ marginBottom: '24px', color: colors.black }}>Stock Reports</h2>
      <Row gutter={[16, 16]}>
        {reports.map((report, index) => (
          <Col xs={24} sm={12} md={8} lg={6} key={index}>
            <Card
              hoverable
              style={{ 
                borderRadius: '8px',
                borderTop: `3px solid ${report.color}`,
                backgroundColor: colors.white,
                border: `1px solid ${colors.black}20` // 20% opacity black
              }}
              actions={[
                <span 
                  key="view" 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCardClick(report.path);
                  }}
                  style={{ 
                    color: report.color,
                    fontWeight: 500
                  }}
                >
                  View Report
                </span>
              ]}
              onClick={() => handleCardClick(report.path)}
            >
              <Meta
                avatar={React.cloneElement(report.icon, { 
                  style: { 
                    fontSize: '24px', 
                    color: report.color,
                    backgroundColor: `${report.color}10`,
                    padding: '8px',
                    borderRadius: '50%'
                  } 
                })}
                title={<span style={{ color: colors.text }}>{report.title}</span>}
                description={
                  <div>
                    <span style={{ color: colors.description }}>
                      {report.type === 'increase' && 'Stock increase records'}
                      {report.type === 'decrease' && 'Stock reduction records'}
                      {report.type === 'trend' && 'Sales trend analysis'}
                      {report.type === 'status' && 'Current inventory status'}
                      {report.type === 'alert' && 'Items needing attention'}
                      {report.type === 'movement' && 'Inventory transfers'}
                      {report.type === 'record' && 'Historical stock data'}
                      {report.type === 'purchase' && 'Purchase reports'}
                      {report.type === 'shelf' && 'Shelf inventory details'}
                      {report.type === 'fast-slow-moving' && 'Fast and slow moving products'}
                    </span>
                    <div style={{ marginTop: 8 }}>
                      <Tag 
                        color={report.color === colors.black ? 'default' : report.color}
                        style={{ 
                          border: report.color === colors.black ? `1px solid ${colors.black}30` : 'none',
                          color: report.color === colors.black ? colors.black : colors.white
                        }}
                      >
                        {report.type.toUpperCase()}
                      </Tag>
                    </div>
                  </div>
                }
              />
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default StockReports;