import React from 'react';
import { Modal, Descriptions, Tag, Typography } from 'antd';
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';

const { Text, Paragraph } = Typography;

const ViewPaymentModal = ({ payment, visible, onCancel }) => {
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
        return (
          <Tag icon={<CloseCircleOutlined />} color="red">
            {status?.toUpperCase() || 'UNKNOWN'}
          </Tag>
        );
    }
  };

  return (
    <Modal
      title={`💳 Payment Details #${payment?.id}`}
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={720}
    >
      <Descriptions bordered column={2} labelStyle={{ width: 180 }}>
        <Descriptions.Item label="💰 Amount" span={2}>
          <Text strong style={{ fontSize: '16px' }}>
            ${payment?.amount?.toFixed(2)}
          </Text>
        </Descriptions.Item>
        <Descriptions.Item label="🗓️ Date">
          {payment?.date || <Text type="secondary">No date</Text>}
        </Descriptions.Item>
        <Descriptions.Item label="💳 Method">
          {payment?.method || <Text type="secondary">No method</Text>}
        </Descriptions.Item>
        <Descriptions.Item label="📌 Status" span={2}>
          {renderStatus(payment?.status)}
        </Descriptions.Item>
        <Descriptions.Item label="📝 Notes" span={2}>
          <Paragraph style={{ marginBottom: 0 }}>
            {payment?.notes || (
              <Text type="secondary">No notes available</Text>
            )}
          </Paragraph>
        </Descriptions.Item>
      </Descriptions>
    </Modal>
  );
};

export default ViewPaymentModal;
