import React from 'react';
import { Card, Row, Col, Tag } from 'antd';
import { useNavigate } from 'react-router-dom';
import {
  CalculatorOutlined,
  MoneyCollectOutlined,
  LockOutlined,
  ReconciliationOutlined,
  CreditCardOutlined,
  SwapOutlined,
  AuditOutlined,
  ScheduleOutlined
} from '@ant-design/icons';

const { Meta } = Card;

const OperationReports = () => {
  const navigate = useNavigate();

  // Color scheme matching sales reports
  const colors = {
    green: '#52c41a',  // Positive/completed
    red: '#f5222d',    // Needs attention
    black: '#262626',  // Neutral
    white: '#ffffff',  // Background
    border: '#d9d9d9', // Card border
    hoverBg: '#fafafa' // Hover background
  };

  const reports = [
    // Green reports (positive/completed)
    {
      title: 'Register Report',
      icon: <CalculatorOutlined />,
      path: '/reports/operations/register',
      color: colors.green,
      type: 'financial'
    },
    {
      title: 'Shift Reconciliation',
      icon: <ReconciliationOutlined />,
      path: '/reports/operations/shift-reconciliation',
      color: colors.green,
      type: 'audit'
    },

    // Red reports (needs attention)
    {
      title: 'Cash Discrepancies',
      icon: <MoneyCollectOutlined />,
      path: '/reports/operations/cash-discrepancies',
      color: colors.red,
      type: 'issue'
    },
    {
      title: 'Pending Shift Closures',
      icon: <LockOutlined />,
      path: '/reports/operations/pending-shifts',
      color: colors.red,
      type: 'alert'
    },

    // Black reports (neutral)
    {
      title: 'Payment Types',
      icon: <CreditCardOutlined />,
      path: '/reports/operations/payment-types',
      color: colors.black,
      type: 'analysis'
    },
    {
      title: 'Shift Handovers',
      icon: <SwapOutlined />,
      path: '/reports/operations/shift-handover',
      color: colors.black,
      type: 'process'
    },
    {
      title: 'Audit Trail',
      icon: <AuditOutlined />,
      path: '/reports/operations/audit-trail',
      color: colors.black,
      type: 'record'
    },
    {
      title: 'Shift Schedule',
      icon: <ScheduleOutlined />,
      path: '/reports/operations/shift-schedule',
      color: colors.black,
      type: 'planning'
    }
  ];

  const handleCardClick = (path) => {
    navigate(path);
  };

  return (
    <div style={{ padding: '20px', backgroundColor: colors.white }}>
      <h2 style={{ marginBottom: '24px', color: colors.black }}>Operations Reports</h2>
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
                // Hover effect
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
                    // Link hover
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
                    // Icon hover
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
                      {report.type === 'financial' && 'Financial register records'}
                      {report.type === 'audit' && 'Shift reconciliation details'}
                      {report.type === 'issue' && 'Cash discrepancy reports'}
                      {report.type === 'alert' && 'Unclosed shifts requiring attention'}
                      {report.type === 'analysis' && 'Payment method breakdown'}
                      {report.type === 'process' && 'Shift handover documentation'}
                      {report.type === 'record' && 'Operation audit trail'}
                      {report.type === 'planning' && 'Shift scheduling'}
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

export default OperationReports;