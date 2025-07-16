import React,{useState ,useEffect} from "react";
import { Modal, Form, Input, Select, Button, Descriptions, Table, Empty, Tag, message } from "antd";
import { DollarOutlined, HistoryOutlined } from "@ant-design/icons";
import { usePayment } from "../../../hooks/UsePayment";
import moment from "moment";
import { useSale } from "../../../hooks/UseSale";

const { Option } = Select;
const { TextArea } = Input;

const AddPaymentModal = ({ open, onCancel, sale, onSubmit }) => {
  const [form] = Form.useForm();
  const { handlePaymentCreate } = usePayment();
  const token = localStorage.getItem("token");
  const [loading, setLoading] = React.useState(false);
  const {handleGetPaymentOne} = useSale();
  const [payments , setPayments] = useState([]);
  const handleGetPaymentOneData = async() =>{
    let result = await handleGetPaymentOne(sale.id ,token);      
    if (result.success) {
      setPayments(result.payments);
    }
  }
  useEffect(() => {
    if (open && sale?.id) {
      handleGetPaymentOneData();
    }
  }, [open, sale]);
  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      
      const paymentData = {
        sale_id: sale?.id,
        reference_no: `PAY-${Date.now()}`,
        date: moment().format('YYYY-MM-DD'),
        paid: parseFloat(values.amount),
        warehouse_id: sale?.warehouse_id || 1,
        payment_method: values.paymentMethod,
        note: values.note || ''
      };
      console.log(paymentData);
      

      const response = await handlePaymentCreate(paymentData, token);
      if (response.success) {
        message.success('Payment created successfully!');
        form.resetFields();
        onSubmit(response.data); 
        onCancel();
      } else {
        throw new Error(response.message || 'Failed to create payment');
      }
    } catch (error) {
      console.error('Payment error:', error);
      message.error(error.response?.data?.message || error.message || 'Failed to create payment');
    } finally {
      setLoading(false);
    }
  };

  const oldestPayment = payments.length > 0
    ? payments.reduce((oldest, current) => {
        const oldestDate = oldest.date ? moment(oldest.date) : moment(0);
        const currentDate = current.date ? moment(current.date) : moment(0);
        return currentDate.isBefore(oldestDate) ? current : oldest;
      })
    : null;

  const columns = [
    {
      title: "Payment Date",
      dataIndex: "date",
      key: "date",
      render: (date) => date ? moment(date).format('MMM D, YYYY') : 'N/A',
      width: "25%",
    },
    {
      title: "Amount",
      dataIndex: "paid",
      key: "paid",
      render: (paid) => `$${parseFloat(paid || 0).toFixed(2)}`,
      width: "20%",
    },
      {
      title: "Payment Method",
      dataIndex: "payment_method",  // fix typo here to match your data property
      key: "payment_method",
      render: (method) => {
        const methodMap = {
          cash: "Cash",
          credit: "Credit Card",       // map 'credit' to 'Credit Card'
          credit_card: "Credit Card",  // keep for possible other values
          bank_transfer: "Bank Transfer",
          check: "Check",
        };
        return (
          <Tag color="#52c41a">{methodMap[method] || method || "N/A"}</Tag>
        );
      },
      width: "20%",
    },
    {
      title: "Note",
      dataIndex: "note",
      key: "note",
      render: (note) => note || "-",
      width: "30%",
    },
  ];

  return (
    <Modal
      title="Add Payment"
      open={open}
      onCancel={() => {
        form.resetFields();
        onCancel();
      }}
      footer={null}
      width={800}
      destroyOnClose
      className="add-payment-modal"
    >
      {sale ? (
        <>
          {/* Sale Details */}
          <Descriptions
            title="Sale Information"
            bordered
            column={1}
            size="small"
            style={{ marginBottom: 24 }}
          >
            <Descriptions.Item label="Invoice #">
              {sale.reference_no || sale.reference || "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label="Customer">
              {sale.customer?.username || sale.customerName || "Walk-in Customer"}
            </Descriptions.Item>
            <Descriptions.Item label="Total">
              ${parseFloat(sale.total || sale.totalPrice || 0).toFixed(2)}
            </Descriptions.Item>
            <Descriptions.Item label="Paid">
              ${parseFloat(sale.paid || sale.paid || sale.paid || 0).toFixed(2)}
            </Descriptions.Item>
            <Descriptions.Item label="Balance">
              ${parseFloat(sale.totalPrice - sale.paid  || 0).toFixed(2)}
            </Descriptions.Item>
          </Descriptions>

          {/* Payment History Table */}
          <div style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: 16, color: "#52c41a", marginBottom: 16 }}>
              Payment History
            </h3>
            {payments.length > 0 ? (
              <Table
                columns={columns}
                dataSource={payments}
                rowKey={(record) => record.id || record.payment_id || Math.random().toString(36).substring(2)}
                pagination={false}
                bordered
                size="middle"
                className="payment-history-table"
              />
            ) : (
              <Empty
                image={<HistoryOutlined style={{ fontSize: 48, color: "#52c41a" }} />}
                description="No payment history"
                style={{ margin: "24px 0" }}
              />
            )}
          </div>

          {/* Payment Form */}
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{
              amount: "",
              paymentMethod: "cash",
              note: "",
            }}
          >
            <Form.Item
              label="Payment Amount"
              name="amount"
              rules={[
                { required: true, message: "Please enter the payment amount" },
                {
                  validator: (_, value) => {
                    const balance = parseFloat(sale.balance || sale.total || sale.totalPrice || 0);
                    const amount = parseFloat(value || 0);
                    
                    if (isNaN(amount)) {
                      return Promise.reject(new Error("Please enter a valid number"));
                    }
                    
                    if (amount <= 0) {
                      return Promise.reject(new Error("Amount must be greater than 0"));
                    }
                    
                    if (amount > balance) {
                      return Promise.reject(
                        new Error(`Amount cannot exceed balance due ($${balance.toFixed(2)})`)
                      );
                    }
                    
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <Input
                prefix="$"
                type="number"
                step="0.01"
                min="0"
                placeholder="Enter amount"
              />
            </Form.Item>

            <Form.Item
              label="Payment Method"
              name="paymentMethod"
              rules={[{ required: true, message: "Please select a payment method" }]}
            >
              <Select placeholder="Select payment method">
                <Option value="cash">Cash</Option>
                <Option value="credit_card">Credit Card</Option>
                <Option value="bank_transfer">Bank Transfer</Option>
                <Option value="check">Check</Option>
                <Option value="mobile">Mobile Payment</Option>
                <Option value="bank">Bank Transfer</Option>
              </Select>
            </Form.Item>

            <Form.Item label="Note" name="note">
              <TextArea rows={3} placeholder="Optional payment note" />
            </Form.Item>

            <Form.Item>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                <Button 
                  onClick={() => {
                    form.resetFields();
                    onCancel();
                  }}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<DollarOutlined />}
                  style={{ backgroundColor: "#52c41a", borderColor: "#52c41a" }}
                  loading={loading}
                >
                  Submit Payment
                </Button>
              </div>
            </Form.Item>
          </Form>
        </>
      ) : (
        <p>No sale selected</p>
      )}
    </Modal>
  );
};

export default AddPaymentModal;