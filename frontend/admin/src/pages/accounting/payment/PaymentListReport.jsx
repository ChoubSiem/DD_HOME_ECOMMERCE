import React from 'react';
import { Card, Row, Col, Tag } from 'antd';
import { useNavigate } from 'react-router-dom';
import {
  CreditCardOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  HistoryOutlined,
  PieChartOutlined,
  TransactionOutlined,
  AuditOutlined
} from '@ant-design/icons';

const { Meta } = Card;

const PaymentReports = () => {
  const navigate = useNavigate();

  // Color scheme
  const colors = {
    green: '#52c41a',  // Success/positive
    red: '#f5222d',    // Issues/negative
    black: '#262626',  // Neutral
    white: '#ffffff',
    border: '#d9d9d9',
    hoverBg: '#fafafa'
  };

  const reports = [
    // Green reports (Successful payments)
    {
      title: 'Payment Reports',
      icon: <CheckCircleOutlined />,
      path: '/reports/payments',
      color: colors.green,
      type: 'completed'
    },
    {
      title: 'Payment Summary',
      icon: <DollarOutlined />,
      path: '/reports/payments/summary',
      color: colors.green,
      type: 'summary'
    },

    // Red reports (Payment issues)
    {
      title: 'Failed Payments',
      icon: <WarningOutlined />,
      path: '/reports/payments/failed',
      color: colors.red,
      type: 'failed'
    },
    {
      title: 'Refund Requests',
      icon: <TransactionOutlined />,
      path: '/reports/payments/refunds',
      color: colors.red,
      type: 'refunds'
    },

    // Black reports (Neutral)
    {
      title: 'Payment History',
      icon: <HistoryOutlined />,
      path: '/reports/payments/history',
      color: colors.black,
      type: 'history'
    },
    {
      title: 'Payment Methods',
      icon: <CreditCardOutlined />,
      path: '/reports/payments/methods',
      color: colors.black,
      type: 'methods'
    },
    {
      title: 'Payment Trends',
      icon: <PieChartOutlined />,
      path: '/reports/payments/trends',
      color: colors.black,
      type: 'analysis'
    },
    {
      title: 'Payment Audit',
      icon: <AuditOutlined />,
      path: '/reports/payments/audit',
      color: colors.black,
      type: 'audit'
    }
  ];

  const handleCardClick = (path) => {
    navigate(path);
  };

  const getDescription = (type) => {
    const descriptions = {
      completed: 'Successful payment transactions',
      summary: 'Daily/weekly payment totals',
      failed: 'Declined or failed payments',
      refunds: 'Processed refund requests',
      history: 'Complete payment records',
      methods: 'Breakdown by payment type',
      analysis: 'Payment pattern analysis',
      audit: 'Payment verification logs'
    };
    return descriptions[type] || 'Payment system report';
  };

  return (
    <div style={{ padding: '20px', backgroundColor: colors.white }}>
      <h2 style={{ marginBottom: '24px', color: colors.black }}>Payment Reports</h2>
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
                  transform: 'translateY(-3px)',
                  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                  backgroundColor: colors.hoverBg
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
                    transition: 'all 0.3s ease',
                    ':hover': {
                      transform: 'scale(1.1)',
                      backgroundColor: `${report.color}20`
                    }
                  } 
                })}
                title={<span style={{ color: colors.black }}>{report.title}</span>}
                description={
                  <div>
                    <span style={{ color: '#595959' }}>
                      {getDescription(report.type)}
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

export default PaymentReports;