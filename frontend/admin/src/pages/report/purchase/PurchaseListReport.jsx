import React from 'react';
import { Card, Row, Col, Tag } from 'antd';
import { useNavigate } from 'react-router-dom';
import {
  ShoppingCartOutlined,
  FileSearchOutlined,
  HourglassOutlined,
  DollarOutlined,
  ReconciliationOutlined,
  TruckOutlined,
  AuditOutlined,
  BarChartOutlined,
  OrderedListOutlined,
  AccountBookOutlined
} from '@ant-design/icons';

const { Meta } = Card;

const PurchaseReports = () => {
  const navigate = useNavigate();

  // Color definitions
  const colors = {
    green: '#52c41a',  // Success/positive
    red: '#f5222d',    // Danger/negative
    black: '#262626',  // Text/neutral
    white: '#ffffff',  // Background
    border: '#d9d9d9', // Light border
    hoverGreen: '#e6f7ff', // Light green hover
    hoverRed: '#fff1f0',   // Light red hover
    hoverBlack: '#fafafa'  // Light gray hover
  };

  const reports = [
    // Green Reports (Positive/Completed)
    {
      title: 'Completed Purchases',
      icon: <ShoppingCartOutlined />,
      path: '/reports/purchase/completed',
      color: colors.green,
      type: 'completed',
      hoverColor: colors.hoverGreen
    },
    {
      title: 'Vendor Performance',
      icon: <AuditOutlined />,
      path: '/reports/purchase/vendor-performance',
      color: colors.green,
      type: 'performance',
      hoverColor: colors.hoverGreen
    },
    {
      title: 'Purchase Receipts',
      icon: <ReconciliationOutlined />,
      path: '/reports/purchase/receipts',
      color: colors.green,
      type: 'receipt',
      hoverColor: colors.hoverGreen
    },

    // Red Reports (Negative/Attention Needed)
    {
      title: 'Pending Purchases',
      icon: <HourglassOutlined />,
      path: '/reports/purchase/pending',
      color: colors.red,
      type: 'pending',
      hoverColor: colors.hoverRed
    },
    {
      title: 'Overdue Orders',
      icon: <FileSearchOutlined />,
      path: '/reports/purchase/overdue',
      color: colors.red,
      type: 'overdue',
      hoverColor: colors.hoverRed
    },
    {
      title: 'Purchase Returns',
      icon: <DollarOutlined />,
      path: '/reports/purchase/returns',
      color: colors.red,
      type: 'return',
      hoverColor: colors.hoverRed
    },

    // Black Reports (Neutral/Informational)
    {
      title: 'Purchase History',
      icon: <BarChartOutlined />,
      path: '/reports/purchase/history',
      color: colors.black,
      type: 'history',
      hoverColor: colors.hoverBlack
    },
    {
      title: 'Expected Deliveries',
      icon: <TruckOutlined />,
      path: '/reports/purchase/deliveries',
      color: colors.black,
      type: 'delivery',
      hoverColor: colors.hoverBlack
    },
    {
      title: 'Item Purchase Frequency',
      icon: <OrderedListOutlined />,
      path: '/reports/purchase/frequency',
      color: colors.black,
      type: 'frequency',
      hoverColor: colors.hoverBlack
    }
  ];

  const handleCardClick = (path) => {
    navigate(path);
  };

  return (
    <div style={{ padding: '20px', backgroundColor: colors.white }}>
      <h2 style={{ marginBottom: '24px', color: colors.black }}>Purchase Reports</h2>
      <Row gutter={[16, 16]}>
        {reports.map((report, index) => (
          <Col xs={24} sm={12} md={8} lg={6} key={index}>
            <Card
              hoverable
              style={{ 
                borderRadius: '8px',
                borderTop: `3px solid ${report.color}`,
                backgroundColor: colors.white,
                border: `1px solid ${colors.border}`,
                transition: 'all 0.3s ease',
                ':hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: `0 4px 12px ${report.color}20`,
                  backgroundColor: report.hoverColor
                }
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
                    fontWeight: 500,
                    transition: 'all 0.2s ease',
                    ':hover': {
                      textDecoration: 'underline'
                    }
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
                    borderRadius: '50%',
                    transition: 'all 0.3s ease'
                  } 
                })}
                title={
                  <span style={{ 
                    color: colors.black,
                    transition: 'all 0.2s ease'
                  }}>
                    {report.title}
                  </span>
                }
                description={
                  <div>
                    <span style={{ color: '#595959' }}>
                      {report.type === 'completed' && 'Fulfilled purchase orders'}
                      {report.type === 'performance' && 'Vendor evaluation metrics'}
                      {report.type === 'receipt' && 'Received inventory records'}
                      {report.type === 'pending' && 'Awaiting fulfillment'}
                      {report.type === 'overdue' && 'Delayed orders'}
                      {report.type === 'return' && 'Returned items'}
                      {report.type === 'history' && 'Historical purchase data'}
                      {report.type === 'delivery' && 'Upcoming shipments'}
                      {report.type === 'frequency' && 'Item purchase patterns'}
                    </span>
                    <div style={{ marginTop: 8 }}>
                      <Tag
                        color={report.color === colors.black ? 'default' : report.color}
                        style={{ 
                          border: report.color === colors.black ? `1px solid ${colors.border}` : 'none',
                          color: report.color === colors.black ? colors.black : colors.white,
                          transition: 'all 0.2s ease'
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

export default PurchaseReports;