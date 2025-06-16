
import React from 'react';
import { Card, Row, Col, Tag } from 'antd';
import { useNavigate } from 'react-router-dom';
import {
  EditOutlined,
  PlusOutlined,
  MinusOutlined,
  SwapOutlined,
  AuditOutlined,
  ExceptionOutlined,
  FileSyncOutlined,
  ReconciliationOutlined
} from '@ant-design/icons';

const { Meta } = Card;

const AdjustmentReports = () => {
  const navigate = useNavigate();

  // Color scheme
  const colors = {
    increase: '#52c41a',  // Green for positive adjustments
    decrease: '#f5222d',  // Red for negative adjustments
    neutral: '#1890ff',   // Blue for neutral reports
    text: '#262626',
    description: '#595959'
  };

  const reports = [
    // Inventory Increases (Green)
    {
      title: 'Stock Additions',
      icon: <PlusOutlined />,
      path: '/reports/adjustments/additions',
      color: colors.increase,
      type: 'increase'
    },
    {
      title: 'Positive Adjustments',
      icon: <EditOutlined />,
      path: '/reports/adjustments/positive',
      color: colors.increase,
      type: 'increase'
    },
    
    // Inventory Decreases (Red)
    {
      title: 'Stock Deductions',
      icon: <MinusOutlined />,
      path: '/reports/adjustments/deductions',
      color: colors.decrease,
      type: 'decrease'
    },
    {
      title: 'Negative Adjustments',
      icon: <EditOutlined />,
      path: '/reports/adjustments/negative',
      color: colors.decrease,
      type: 'decrease'
    },
    
    // Neutral Reports (Blue)
    {
      title: 'Adjustment Audit',
      icon: <AuditOutlined />,
      path: '/reports/adjustments/audit',
      color: colors.neutral,
      type: 'audit'
    },
    {
      title: 'Variance Reports',
      icon: <ExceptionOutlined />,
      path: '/reports/adjustments/variance',
      color: colors.neutral,
      type: 'analysis'
    },
    {
      title: 'Stock Transfers',
      icon: <SwapOutlined />,
      path: '/reports/adjustments/transfers',
      color: colors.neutral,
      type: 'transfer'
    },
    {
      title: 'Reconciliation',
      icon: <ReconciliationOutlined />,
      path: '/reports/adjustments/reconciliation',
      color: colors.neutral,
      type: 'audit'
    }
  ];

  const handleCardClick = (path) => {
    navigate(path);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2 style={{ marginBottom: '24px', color: colors.text }}>Adjustment Reports</h2>
      <Row gutter={[16, 16]}>
        {reports.map((report, index) => (
          <Col xs={24} sm={12} md={8} lg={6} key={index}>
            <Card
              hoverable
              style={{ 
                borderRadius: '8px',
                borderTop: `3px solid ${report.color}`,
                backgroundColor: `${report.color}08`
              }}
              actions={[
                <span 
                  key="view" 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCardClick(report.path);
                  }}
                  style={{ color: report.color }}
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
                    backgroundColor: `${report.color}15`,
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
                      {report.type === 'audit' && 'Adjustment audit trails'}
                      {report.type === 'analysis' && 'Variance analysis'}
                      {report.type === 'transfer' && 'Inventory transfers'}
                    </span>
                    <div style={{ marginTop: 8 }}>
                      <Tag color={report.color}>
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

export default AdjustmentReports;