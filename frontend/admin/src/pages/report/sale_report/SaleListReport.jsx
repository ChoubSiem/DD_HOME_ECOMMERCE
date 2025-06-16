import React from 'react';
import { Card, Row, Col, Tag } from 'antd';
import { useNavigate } from 'react-router-dom';
import {
  ShoppingOutlined,
  TagOutlined,
  GiftOutlined,
  PercentageOutlined,
  BarChartOutlined,
  FileTextOutlined,
  TeamOutlined,
  CalendarOutlined,
  DashboardOutlined
} from '@ant-design/icons';

const { Meta } = Card;

const ReportCards = () => {
  const navigate = useNavigate();

  // Color definitions
  const colors = {
    green: '#52c41a',  // Positive/growth
    red: '#f5222d',    // Negative/attention
    black: '#262626',  // Neutral
    white: '#ffffff',  // Background
    border: '#d9d9d9'  // Borders
  };

  const reports = [
    // Green Reports (Positive performance)
    { 
      title: 'Product Sale Report', 
      icon: <ShoppingOutlined />,
      path: '/reports/product-sale',
      color: colors.green,
      type: 'sales'
    },
    { 
      title: 'Daily Sale Report', 
      icon: <BarChartOutlined />,
      path: '/reports/daily-sale',
      color: colors.green,
      type: 'trends'
    },
    { 
      title: 'Yearly Product Report', 
      icon: <DashboardOutlined />,
      path: '/reports/yearly-product',
      color: colors.green,
      type: 'growth'
    },

    // Red Reports (Need attention)
    { 
      title: 'Product Discount Report', 
      icon: <PercentageOutlined />,
      path: '/reports/sale-discount',
      color: colors.red,
      type: 'discounts'
    },
    { 
      title: 'Product Free Report', 
      icon: <GiftOutlined />,
      path: '/reports/product-free',
      color: colors.red,
      type: 'giveaways'
    },

    // Black Reports (Neutral)
    { 
      title: 'Product Promotion Report', 
      icon: <TagOutlined />,
      path: '/reports/product-promotion',
      color: colors.black,
      type: 'marketing'
    },
    { 
      title: 'Sale Detail Report', 
      icon: <FileTextOutlined />,
      path: '/reports/sale-detail',
      color: colors.black,
      type: 'details'
    },
    { 
      title: 'Customer By Product', 
      icon: <TeamOutlined />,
      path: '/reports/customer-product',
      color: colors.black,
      type: 'analysis'
    },
    { 
      title: 'Monthly Product Report', 
      icon: <CalendarOutlined />,
      path: '/reports/monthly-product',
      color: colors.black,
      type: 'periodic'
    }
  ];

  const handleCardClick = (path) => {
    navigate(path);
  };

  return (
    <div style={{ padding: '20px', backgroundColor: colors.white }}>
      <h2 style={{ marginBottom: '24px', color: colors.black }}>Sales List Reports</h2>
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
                cursor: 'pointer'
              }}
              onClick={() => handleCardClick(report.path)}
              actions={[
                <span 
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
                title={<span style={{ color: colors.black }}>{report.title}</span>}
                description={
                  <div>
                    <span style={{ color: '#595959' }}>
                      {report.type === 'sales' && 'Product sales performance'}
                      {report.type === 'trends' && 'Daily sales trends'}
                      {report.type === 'growth' && 'Annual sales growth'}
                      {report.type === 'discounts' && 'Discounted items report'}
                      {report.type === 'giveaways' && 'Free product distributions'}
                      {report.type === 'marketing' && 'Promotional campaigns'}
                      {report.type === 'details' && 'Detailed sales records'}
                      {report.type === 'analysis' && 'Customer product preferences'}
                      {report.type === 'periodic' && 'Monthly sales breakdown'}
                    </span>
                    <div style={{ marginTop: 8 }}>
                      <Tag
                        color={report.color === colors.black ? 'default' : report.color}
                        style={{ 
                          border: report.color === colors.black ? `1px solid ${colors.border}` : 'none',
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

export default ReportCards;