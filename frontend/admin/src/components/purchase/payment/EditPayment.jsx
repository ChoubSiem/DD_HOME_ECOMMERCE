import React from 'react';
import { Modal, Form, Input, InputNumber, DatePicker, Select, message } from 'antd';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;

const EditPaymentModal = ({ payment, visible, onUpdate, onCancel }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (payment) {
      form.setFieldsValue({
        ...payment,
        date: dayjs(payment.date)
      });
    }
  }, [payment, form]);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      await onUpdate({
        ...payment,
        ...values,
        date: values.date.format('YYYY-MM-DD'),
        amount: Number(values.amount)
      });
    } catch (error) {
      message.error('Validation failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={`Edit Payment #${payment?.id}`}
      open={visible}
      onOk={handleSubmit}
      onCancel={onCancel}
      confirmLoading={loading}
      width={600}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="amount"
          label="Amount"
          rules={[
            { required: true, message: 'Please enter payment amount' },
            { type: 'number', min: 0.01, message: 'Amount must be positive' }
          ]}
        >
          <InputNumber
            style={{ width: '100%' }}
            min={0.01}
            step={0.01}
            precision={2}
            formatter={value => `$ ${value}`}
          />
        </Form.Item>

        <Form.Item
          name="date"
          label="Payment Date"
          rules={[{ required: true, message: 'Please select payment date' }]}
        >
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          name="method"
          label="Payment Method"
          rules={[{ required: true, message: 'Please select payment method' }]}
        >
          <Select placeholder="Select payment method">
            <Option value="credit_card">Credit Card</Option>
            <Option value="bank_transfer">Bank Transfer</Option>
            <Option value="cash">Cash</Option>
            <Option value="check">Check</Option>
            <Option value="other">Other</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="status"
          label="Status"
          rules={[{ required: true, message: 'Please select status' }]}
        >
          <Select>
            <Option value="pending">Pending</Option>
            <Option value="approved">Approved</Option>
            <Option value="rejected">Rejected</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="reference"
          label="Reference Number"
          rules={[{ required: true, message: 'Please enter reference number' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item name="notes" label="Notes">
          <TextArea rows={3} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditPaymentModal;