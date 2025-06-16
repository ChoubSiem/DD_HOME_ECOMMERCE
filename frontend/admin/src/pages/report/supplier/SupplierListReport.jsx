import React from 'react';
import { Card, Row, Col } from 'antd';
import { useNavigate } from 'react-router-dom';
import {
  TeamOutlined,
  AuditOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  StarOutlined,
  PercentageOutlined,
  FileTextOutlined,
  CarOutlined,
  DatabaseOutlined
} from '@ant-design/icons';

const { Meta } = Card;

const SupplierReports = () => {
  const navigate = useNavigate();

  // Color definitions matching sales report style
  const colors = {
    green: '#52c41a',  // Positive actions
    red: '#f5222d',    // Needs attention
    black: '#262626',  // Neutral
    white: '#ffffff',  // Background
    border: '#d9d9d9', // Card border
    hoverBg: '#fafafa' // Hover background
  };

  const reports = [
    // Green cards (positive reports)
    {
      title: 'Supplier Directory',
      icon: <TeamOutlined />,
      path: '/reports/suppliers/directory',
      color: colors.green
    },
    {
      title: 'Top Performers',
      icon: <StarOutlined />,
      path: '/reports/suppliers/top-performers',
      color: colors.green
    },
    {
      title: 'Cost Savings',
      icon: <PercentageOutlined />,
      path: '/reports/suppliers/cost-savings',
      color: colors.green
    },

    // Red cards (needs attention)
    {
      title: 'Late Deliveries',
      icon: <ClockCircleOutlined />,
      path: '/reports/suppliers/late-deliveries',
      color: colors.red
    },
    {
      title: 'Quality Issues',
      icon: <AuditOutlined />,
      path: '/reports/suppliers/quality-issues',
      color: colors.red
    },
    {
      title: 'Expiring Contracts',
      icon: <FileTextOutlined />,
      path: '/reports/suppliers/expiring-contracts',
      color: colors.red
    },

    // Black cards (neutral reports)
    {
      title: 'Supplier Contracts',
      icon: <FileTextOutlined />,
      path: '/reports/suppliers/contracts',
      color: colors.black
    },
    {
      title: 'Shipping Methods',
      icon: <CarOutlined />,
      path: '/reports/suppliers/shipping',
      color: colors.black
    },
    {
      title: 'Supplier History',
      icon: <DatabaseOutlined />,
      path: '/reports/suppliers/history',
      color: colors.black
    }
  ];

  const handleCardClick = (path) => {
    navigate(path);
  };

  return (
    <div style={{ padding: '20px', backgroundColor: colors.white }}>
      <h2 style={{ marginBottom: '24px', color: colors.black }}>Supplier Reports</h2>
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
                description="Click to view detailed report"
              />
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default SupplierReports;