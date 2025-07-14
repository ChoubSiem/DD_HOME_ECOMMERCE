import React, { useState, useEffect } from "react";
import { 
  Card, 
  Row, 
  Col, 
  DatePicker, 
  Input, 
  Form, 
  Select, 
  Button, 
  Modal, 
  message, 
  Divider, 
  Table, 
  Tag,
  InputNumber,
  Switch,
  Alert,
  Radio,
  Typography
} from "antd";
import { 
  DeleteOutlined, 
  ExclamationCircleOutlined, 
  PlusOutlined, 
  DollarOutlined, 
  BankOutlined, 
  WalletOutlined, 
  CloseCircleOutlined 
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Option } = Select;
const { Text } = Typography;
import Cookies from "js-cookie";
import { useUser } from "../../../hooks/UserUser";
const paymentOptions = [
  { name: "Cash", icon: <DollarOutlined /> },
  { name: "ABA", icon: <BankOutlined /> },
  { name: "AC", icon: <WalletOutlined /> },
  { name: "Bakong", icon: <BankOutlined /> },
];

const PurchaseDetailsCard = ({ 
  reference = null, 
  setReference,
  suppliers,
  purchase = { name: '', id: null },
  onPaymentSubmit,
  selectSupplier,
  initialPayment = null,
  total = 0, // Total amount to be paid
  baseCurrency = 'USD' // Default base currency
}) => {
  const now = dayjs();
  const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const {handleSupplierCreate} = useUser();
  // Payment state
  const [payments, setPayments] = useState([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("Cash");
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentNote, setPaymentNote] = useState("");
  const [selectedCurrency, setSelectedCurrency] = useState("USD");
  const [exchangeRate, setExchangeRate] = useState(4100);
  const token = localStorage.getItem('token');
  const safePurchase = {
    name: purchase?.name || '',
    id: purchase?.id || null
  };

  // Calculate payment totals
  const calculatePaidAmount = () => {
    return payments.reduce((sum, payment) => {
      const amount = parseFloat(payment.amount) || 0;
      return sum + amount;
    }, 0);
  };

  const paidAmount = calculatePaidAmount();
  const remainingBalance = Math.max(0, total - paidAmount);
  const changeDue = Math.max(0, paidAmount - total);

  // Format currency values
  const formatCurrency = (value, isKHR = false) => {
    const num = parseFloat(value) || 0;
    return isKHR ? num.toFixed(0) : num.toFixed(2);
  };

  // Initialize with any existing payment data
  useEffect(() => {
    if (initialPayment) {
      setPayments(initialPayment.payments || []);
    }
  }, [initialPayment]);

  const handleSupplierChange = (value) => {
    setSelectedSupplier(value);
    if (selectSupplier) {
      selectSupplier(value); 
    }
  };

  const handlePaymentClick = () => {
    setIsPaymentModalVisible(true);
  };

  const handleAddPayment = () => {
    if (!paymentAmount || paymentAmount <= 0) {
      message.error('Please enter a valid amount');
      return;
    }
    
    const amountInUSD = selectedCurrency === 'USD' 
      ? parseFloat(paymentAmount) || 0
      : (parseFloat(paymentAmount) || 0) / exchangeRate;

    const newPayment = {
      method: selectedPaymentMethod,
      amount: amountInUSD.toFixed(2),
      currency: selectedCurrency,
      originalAmount: paymentAmount,
      note: paymentNote,
      exchangeRate: selectedCurrency === 'KHR' ? exchangeRate : 1
    };
    
    setPayments([...payments, newPayment]);

    // Reset form
    setPaymentAmount(0);
    setPaymentNote("");
  };

  const handleRemovePayment = (index) => {
    const newPayments = [...payments];
    newPayments.splice(index, 1);
    setPayments(newPayments);
  };

  const handlePaymentSubmit = () => {
    if (remainingBalance > 0) {
      message.error(`Please add $${formatCurrency(remainingBalance)} more to complete the payment`);
      return;
    }

    const paymentData = {
      payments: payments,
      supplier_id: selectedSupplier,
      totalPaid: paidAmount,
      changeDue: changeDue,
      baseCurrency: baseCurrency
    };

    if (onPaymentSubmit) {
      onPaymentSubmit(paymentData);
    }

    setIsPaymentModalVisible(false);
  };

  const handlePaymentCancel = () => {
    setIsPaymentModalVisible(false);
    // Reset payments if cancelling
    if (initialPayment) {
      setPayments(initialPayment.payments || []);
    } else {
      setPayments([]);
    }
  };

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newSupplier, setNewSupplier] = useState({
    username: '',
    contactNumber: '',
    company: '',
    address: ''
  });

  const showModal = () => {
    setIsModalVisible(true);
  };

const handleOk = async() => {
  let response = await handleSupplierCreate(newSupplier , token);
  if (response.success) {
    setIsModalVisible(false);
    location.reload();
    setNewSupplier({
      username: '',
      contactNumber: '',
      company: '',
      address: ''
    });
    
  }  
};

const handleCancel = () => {
  setIsModalVisible(false);
};

const handleInputChange = (e) => {
  const { name, value } = e.target;
  setNewSupplier(prev => ({ ...prev, [name]: value }));
};

  return (
    <>
      <Card title="Purchase Details" style={{ marginBottom: 20, borderRadius: 0 }}>
        <Form layout="vertical">
          <Row gutter={16} align="bottom">
            <Col xs={24} sm={6} md={6} lg={6}>
              <Form.Item label="Date & Time" style={{ marginBottom: 0 }}>
                <DatePicker
                  showTime
                  format="YYYY-MM-DD HH:mm:ss"
                  style={{ width: '100%' }}
                  defaultValue={now}
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={6} md={6} lg={6}>
              <Form.Item label="Reference" style={{ marginBottom: 0 }}>
                <Input 
                  placeholder="Enter reference number" 
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={6} md={6} lg={6}>
              <Form.Item label="Suppliers" style={{ marginBottom: 0 }}>
                <div style={{ display: 'flex' }}>
                  <Select 
                    placeholder="Select supplier"
                    style={{ width: '100%', marginRight: 8 }}
                    onChange={handleSupplierChange}
                    value={selectedSupplier}
                  >
                    {suppliers?.map((supplier) => (
                      <Option key={supplier.id} value={supplier.id}>
                        {supplier.username}
                      </Option>
                    ))}
                  </Select>
                  <Button type="primary" onClick={showModal}>
                    Add
                  </Button>
                </div>
              </Form.Item>
            </Col>

            <Modal 
              title="Add New Supplier" 
              visible={isModalVisible} 
              onOk={handleOk} 
              onCancel={handleCancel}
            >
              <Form layout="vertical">
                <Form.Item label="Username">
                  <Input 
                    name="username"
                    value={newSupplier.username}
                    onChange={handleInputChange}
                  />
                </Form.Item>
                <Form.Item label="Contact Number">
                  <Input 
                    name="contactNumber"
                    value={newSupplier.contactNumber}
                    onChange={handleInputChange}
                  />
                </Form.Item>
                <Form.Item label="Company">
                  <Input 
                    name="company"
                    value={newSupplier.company}
                    onChange={handleInputChange}
                  />
                </Form.Item>
                <Form.Item label="Address">
                  <Input.TextArea 
                    name="address"
                    value={newSupplier.address}
                    onChange={handleInputChange}
                  />
                </Form.Item>
              </Form>
            </Modal>

            <Col xs={24} sm={6} md={6} lg={6}>
              <Form.Item label="Purchaser" style={{ marginBottom: 0 }}>
                <Input
                  value={safePurchase.name}
                  disabled
                />
                <input 
                  type="hidden" 
                  name="purchase_id" 
                  value={safePurchase.id || ''} 
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={6} md={6} lg={6}>
              <Form.Item style={{ marginBottom: 0, marginTop: "30px" }}>
                <Button 
                  type="primary" 
                  onClick={handlePaymentClick}
                  style={{ width: '100%' }}
                >
                  {initialPayment ? 'Edit Payment' : 'Select Payment'}
                </Button>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>

      {/* Payment Modal */}
      <Modal
        title="Payment Methods"
        open={isPaymentModalVisible}
        onCancel={handlePaymentCancel}
        footer={[
          <Button key="cancel" onClick={handlePaymentCancel}>
            Cancel
          </Button>,
          <Button 
            key="complete" 
            type="primary" 
            onClick={handlePaymentSubmit}
            disabled={remainingBalance > 0}
          >
            Complete Payment
          </Button>
        ]}
        width={800}
      >
        <div style={{ marginBottom: 16 }}>
          <div style={{ marginBottom: 8 }}>
            <Text strong>Total Due: ${formatCurrency(total)}</Text>
          </div>
          
          {remainingBalance > 0 && (
            <Alert 
              message={`Payment incomplete - Need $${formatCurrency(remainingBalance)} more`}
              type="warning"
              showIcon
              style={{ marginBottom: 16 }}
            />
          )}

          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <Radio.Group 
              value={selectedCurrency} 
              onChange={(e) => setSelectedCurrency(e.target.value)}
              buttonStyle="solid"
            >
              <Radio.Button value="USD">USD</Radio.Button>
              <Radio.Button value="KHR">KHR</Radio.Button>
            </Radio.Group>
            
            {selectedCurrency === 'KHR' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Text>Exchange Rate:</Text>
                <InputNumber 
                  min={1} 
                  value={exchangeRate} 
                  onChange={(value) => setExchangeRate(value || 4100)}
                  style={{ width: 100 }}
                />
                <Text>៛ per $1</Text>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <Select
              style={{ width: 150 }}
              value={selectedPaymentMethod}
              onChange={setSelectedPaymentMethod}
              options={paymentOptions.map(option => ({
                value: option.name,
                label: (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {option.icon}
                    {option.name}
                  </div>
                )
              }))}
            />
            
            <InputNumber
              style={{ flex: 1 }}
              min={0}
              value={paymentAmount}
              onChange={setPaymentAmount}
              addonAfter={selectedCurrency}
              precision={selectedCurrency === 'USD' ? 2 : 0}
            />
          </div>

          {/* <div style={{ marginBottom: 8 }}>
            <input
              type="text"
              placeholder="Payment note (optional)"
              value={paymentNote}
              onChange={(e) => setPaymentNote(e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #d9d9d9',
                borderRadius: '4px'
              }}
            />
          </div> */}

          <Button 
            type="dashed" 
            onClick={handleAddPayment}
            icon={<PlusOutlined />}
            style={{ width: '100%' }}
            disabled={!paymentAmount || paymentAmount <= 0}
          >
            Add Payment
          </Button>
        </div>

        {payments.length > 0 && (
          <>
            <Table
              columns={[
                {
                  title: 'Method',
                  dataIndex: 'method',
                  key: 'method',
                  render: (method, record) => (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {paymentOptions.find(opt => opt.name === method)?.icon}
                      <div>
                        <div>{method}</div>
                        {record.note && <Text type="secondary" style={{ fontSize: 12 }}>{record.note}</Text>}
                      </div>
                    </div>
                  )
                },
                {
                  title: 'Amount',
                  dataIndex: 'amount',
                  key: 'amount',
                  render: (amount, record) => (
                    <div>
                      <div>${formatCurrency(amount)}</div>
                      {record.currency === 'KHR' && (
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {formatCurrency(record.originalAmount, true)}៛ @ {record.exchangeRate}៛/$
                        </Text>
                      )}
                    </div>
                  )
                },
                {
                  title: 'Action',
                  key: 'action',
                  render: (_, record, index) => (
                    <Button 
                      type="text" 
                      danger 
                      icon={<CloseCircleOutlined />}
                      onClick={() => handleRemovePayment(index)}
                    />
                  )
                }
              ]}
              dataSource={payments}
              pagination={false}
              rowKey={(_, index) => index}
              size="small"
              style={{ marginBottom: 16 }}
            />

            <div style={{ 
              padding: 16, 
              backgroundColor: '#f0f0f0',
              borderRadius: 4
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text strong>Total Paid:</Text>
                <Text strong>${formatCurrency(paidAmount)}</Text>
              </div>
              
              {remainingBalance > 0 ? (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#ff4d4f', marginBottom: 4 }}>
                    <Text>Remaining (USD):</Text>
                    <Text>${formatCurrency(remainingBalance)}</Text>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#ff4d4f' }}>
                    <Text>Remaining (KHR):</Text>
                    <Text>{formatCurrency(remainingBalance * exchangeRate, true)}៛</Text>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#52c41a', marginBottom: 4 }}>
                    <Text>Change Due (USD):</Text>
                    <Text>${formatCurrency(changeDue)}</Text>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#52c41a' }}>
                    <Text>Change Due (KHR):</Text>
                    <Text>{formatCurrency(changeDue * exchangeRate, true)}៛</Text>
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </Modal>
    </>
  );
};

export default PurchaseDetailsCard;