import React, { useState, useEffect } from 'react';
import { Modal, Input, Button, message, Typography, Divider, Form } from 'antd';
import Cookies from 'js-cookie';
import { useSale } from '../../../hooks/UseSale';

const { Text } = Typography;

const EditShift = ({ visible, onClose, onShiftOpen, shiftData }) => {
  const [form] = Form.useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { handleOpenShiftUpdate } = useSale();
  const userData = JSON.parse(Cookies.get("user"));
  const token = localStorage.getItem("token");
  // Populate form fields when modal opens
  useEffect(() => {
    if (visible && shiftData) {
      form.setFieldsValue({
        shiftAmount: shiftData.initial_cash,
        note: shiftData.note,
      });
    }
  }, [visible, shiftData, form]);

  const handleOpenShift = async ({ shiftAmount, note }) => {
    if (!shiftAmount || isNaN(shiftAmount)) {
      message.error('Please enter a valid amount');
      return;
    }

    const start_time = new Date().toISOString().slice(0, 19).replace('T', ' '); 
    const values = {
      initial_cash: shiftAmount,
      user_id: userData.id,
      warehouse_id: userData.warehouse_id,
      start_time: start_time,
      note: note,
    };

    setIsSubmitting(true);

    try {
      const result = await handleOpenShiftUpdate(shiftData.id, values, token);

      if (result.success) {
        Cookies.set('is_openshift', 'true');
        Cookies.set('shift_amount', shiftAmount);
        Cookies.set('shift_opened_at', new Date().toISOString());

        message.success(`Shift edited with $${shiftAmount}`);
        onClose();
      }
    } catch (error) {
      message.error('Failed to edit shift. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    form.resetFields(); 
    onClose();
  };

  return (
    <Modal
      title={<span style={{ fontSize: '18px' }}>✏️ Edit Shift</span>}
      open={visible}
      onCancel={handleCancel}
      footer={null}
      closable={false}
      maskClosable={false}
      width={400}
    >
      <div style={{ padding: '16px' }}>
        <Text type="secondary">
          Edit the starting cash amount and note for the shift.
        </Text>

        <Divider style={{ margin: '16px 0' }} />

        <Form
          form={form}
          layout="vertical"
          onFinish={handleOpenShift}
          autoComplete="off"
        >
          <Form.Item
            name="shiftAmount"
            rules={[
              { required: true, message: 'Amount is required' },
              {
                pattern: /^\d+(\.\d{1,2})?$/,
                message: 'Enter a valid amount (e.g. 100.00)',
              },
            ]}
          >
            <Input
              placeholder="e.g. 100.00"
              prefix="$"
              type="number"
              disabled={isSubmitting}
              autoFocus
              style={{ height: '40px' }}
            />
          </Form.Item>

          <Form.Item name="note">
            <Input.TextArea
              placeholder="note"
              disabled={isSubmitting}
              style={{ height: '80px', resize: 'none' }}
            />
          </Form.Item>

          <div style={{ display: 'flex', gap: '8px' }}>
            <Button
              type="primary"
              size="large"
              htmlType="submit"
              loading={isSubmitting}
              disabled={isSubmitting}
              style={{ flex: 1, borderRadius: '6px' }}
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button
              size="large"
              onClick={handleCancel}
              disabled={isSubmitting}
              style={{ flex: 1, borderRadius: '6px' }}
            >
              Cancel
            </Button>
          </div>
        </Form>
      </div>
    </Modal>
  );
};

export default EditShift;
