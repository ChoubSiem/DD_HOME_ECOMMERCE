import { Card, Row, Col, DatePicker, Input, Form } from "antd";
import dayjs from 'dayjs';
import React from "react";

const AdjustmentDetailsCard = ({ 
  reference = null, 
  setReference, 
  adjuster = { name: '', id: null } 
}) => {
  const now = dayjs();

  const safeAdjuster = {
    name: adjuster?.name || '',
    id: adjuster?.id || null
  };

  return (
    <Card title="Adjustment Details" style={{ marginBottom: 10, borderRadius: 0 }}>
      <Form layout="vertical">
        <Row gutter={16} align="bottom">
          <Col xs={24} sm={8} md={8} lg={8}>
            <Form.Item label="Date & Time" style={{ marginBottom: 0 }}>
              <DatePicker
                showTime
                format="YYYY-MM-DD HH:mm:ss"
                style={{ width: '100%' }}
                defaultValue={now}
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={8} md={8} lg={8}>
            <Form.Item label="Reference" style={{ marginBottom: 0 }}>
              <Input 
                placeholder="Enter reference number" 
                value={reference}
                onChange={(e) => setReference(e.target.value)}
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={8} md={8} lg={8}>
            <Form.Item label="Adjuster" style={{ marginBottom: 0 }}>
              <Input
                value={safeAdjuster.name}
                disabled
              />
              <input 
                type="hidden" 
                name="adjuster_id" 
                value={safeAdjuster.id || ''} 
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Card>
  );
};

export default AdjustmentDetailsCard;