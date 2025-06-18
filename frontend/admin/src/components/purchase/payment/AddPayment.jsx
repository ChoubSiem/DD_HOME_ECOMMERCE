import React from 'react';
import {
  Modal,
  Form,
  Input,
  InputNumber,
  DatePicker,
  Select,
  message,
  Typography,
  Divider,
} from 'antd';
import {
  DollarCircleOutlined,
  CalendarOutlined,
  CreditCardOutlined,
  NumberOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;
const { Title, Text } = Typography;

const AddPaymentModal = ({ visible, onCreate, onCancel, purchase }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      await onCreate({
        ...values,
        date: values.date.format('YYYY-MM-DD'),
        purchaseId: purchase.id,
        amount: Number(values.amount),
      });
      form.resetFields();
    } catch (error) {
      message.error('Validation failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={<Title level={4}>💳 Add Payment for Purchase #{purchase?.id}</Title>}
      open={visible}
      onOk={handleSubmit}
      onCancel={onCancel}
      confirmLoading={loading}
      width={650}
      okText="Submit Payment"
    >
      <Form form={form} layout="vertical">
        {/* <Divider orientation="left" plain>
          Payment Info
        </Divider> */}

        <Form.Item
          name="amount"
          label="Amount"
          rules={[
            { required: true, message: 'Please enter payment amount' },
            { type: 'number', min: 0.01, message: 'Amount must be positive' },
          ]}
        >
          <InputNumber
            prefix={<DollarCircleOutlined />}
            style={{ width: '100%' }}
            min={0.01}
            step={0.01}
            precision={2}
            formatter={(value) => `$ ${value}`}
            placeholder="Enter payment amount"
          />
        </Form.Item>

        <Form.Item
          name="date"
          label="Payment Date"
          initialValue={dayjs()}
          rules={[{ required: true, message: 'Please select payment date' }]}
        >
          <DatePicker
            style={{ width: '100%' }}
            suffixIcon={<CalendarOutlined />}
            placeholder="Select payment date"
          />
        </Form.Item>

        <Form.Item
          name="method"
          label="Payment Method"
          rules={[{ required: true, message: 'Please select payment method' }]}
        >
          <Select
            placeholder="Choose a payment method"
            suffixIcon={<CreditCardOutlined />}
            >
            <Option value="aba">🏦 ABA Bank</Option>
            <Option value="acleda">🏦 Acleda Bank</Option>
            <Option value="bakong">🌐 Bakong</Option>
            <Option value="cash">💵 Cash</Option>
        </Select>

        </Form.Item>

        <Form.Item name="notes" label="Notes">
          <TextArea
            rows={3}
            placeholder="Add any payment notes or remarks"
            allowClear
            prefix={<FileTextOutlined />}
          />
        </Form.Item>

        <Text type="secondary" style={{ display: 'block', marginTop: 12 }}>
          All fields marked with * are required.
        </Text>
      </Form>
    </Modal>
  );
};

export default AddPaymentModal;
