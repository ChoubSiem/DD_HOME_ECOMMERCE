import React from 'react';
import { Modal, Card, Tag, Typography, Divider, Row, Col, Space } from 'antd';
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  DollarOutlined,
  CalendarOutlined,
  CreditCardOutlined,
  FileTextOutlined
} from '@ant-design/icons';

const { Text, Title } = Typography;

const ViewPaymentModal = ({ payments, visible, onCancel }) => {
  const renderStatus = (status) => {
    switch (status) {
      case 'approved':
        return (
          <Tag icon={<CheckCircleOutlined />} color="green">
            APPROVED
          </Tag>
        );
      case 'pending':
        return (
          <Tag icon={<ClockCircleOutlined />} color="orange">
            PENDING
          </Tag>
        );
      default:
        // return (
        //   <Tag icon={<CloseCircleOutlined />} color="red">
        //     {status?.toUpperCase() || 'UNKNOWN'}
        //   </Tag>
        // );
    }
  };
//   console.log(payments);
  

  const renderPaymentRow = (payment, index) => (
    <Card 
      key={payment?.id || index}
      style={{ marginBottom: 16 }}
      title={
        <Space>
          <Text strong>Payment #{payment?.reference}</Text>
          {renderStatus(payment?.status)}
        </Space>
      }
    >
      <Row gutter={16}>
        <Col span={8}>
          <Space direction="vertical">
            <Text type="secondary"><DollarOutlined /> Amount</Text>
            <Text strong>${payment?.paid}</Text>
          </Space>
        </Col>
        <Col span={8}>
          <Space direction="vertical">
            <Text type="secondary"><CalendarOutlined /> Date</Text>
            <Text>{payment?.created_at || <Text type="secondary">No date</Text>}</Text>
          </Space>
        </Col>
        <Col span={8}>
          <Space direction="vertical">
            <Text type="secondary"><CreditCardOutlined /> Method</Text>
            <Text>{payment?.payment_type || <Text type="secondary">No method</Text>}</Text>
          </Space>
        </Col>
      </Row>
      
      {payment?.notes && (
        <div style={{ marginTop: 16 }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Text type="secondary"><FileTextOutlined /> Notes</Text>
            <Text>{payment.notes}</Text>
          </Space>
        </div>
      )}
    </Card>
  );

  return (
    <Modal
      title={<Title level={4} style={{ margin: 0 }}>💳 Payment Details</Title>}
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={800}
    >
      <div style={{ maxHeight: '60vh', overflowY: 'auto', padding: '0 8px' }}>
        {Array.isArray(payments) ? (
          <>
            {payments.map(renderPaymentRow)}
            <Divider />
            <div style={{ textAlign: 'right', paddingRight: 16 }}>
              <Text strong>Total Amount: </Text>
              <Text strong type="success" style={{ fontSize: '1.2em' }}>
                ${((payments || []).reduce((sum, p) => sum + (parseFloat(p.paid) || 0), 0)).toFixed(2)}
              </Text>

            </div>
          </>
        ) : (
          renderPaymentRow(payments, 0)
        )}
      </div>
    </Modal>
  );
};

export default ViewPaymentModal;