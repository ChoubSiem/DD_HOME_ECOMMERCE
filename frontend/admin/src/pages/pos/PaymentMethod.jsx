import React, { useState } from "react";
import { Button, Table, Modal, Select, InputNumber, Radio, Typography, Alert } from "antd";
import { PlusOutlined, DollarOutlined, BankOutlined, WalletOutlined, CloseCircleOutlined } from '@ant-design/icons';

const { Text } = Typography;

const paymentOptions = [
  { name: "Cash", icon: <DollarOutlined /> },
  { name: "ABA", icon: <BankOutlined /> },
  { name: "AC", icon: <WalletOutlined /> },
  { name: "Bakong", icon: <BankOutlined /> },
];

const PaymentMethods = ({ 
  payments = [], 
  setPayments, 
  total = 0, 
  open, 
  onCancel, 
  change_due,
  onOk ,
}) => {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("Cash");
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentNote, setPaymentNote] = useState("");
  const [selectedCurrency, setSelectedCurrency] = useState("USD");
  const [exchangeRate, setExchangeRate] = useState(4100);

  const calculatePaidAmount = () => {
    return payments.reduce((sum, payment) => {
      const amount = parseFloat(payment.amount) || 0;
      return sum + amount;
    }, 0);
  };

  const paidAmount = calculatePaidAmount();
  const remainingBalance = Math.max(0, total - paidAmount);
  const changeDue = Math.max(0, paidAmount - total);

  const handleAddPayment = () => {
    if (!paymentAmount || paymentAmount <= 0) return;
    
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

  const formatCurrency = (value, isKHR = false) => {
    const num = parseFloat(value) || 0;
    return isKHR ? num.toFixed(0) : num.toFixed(2);
  };

  const handleCompletePayment = () => {
    if (remainingBalance > 0) {
      Modal.error({
        title: 'Incomplete Payment',
        content: `Please add $${formatCurrency(remainingBalance)} more to complete the payment.`
      });
      return;
    }
        
    onOk(payments ,changeDue);
  };

  return (
    <Modal
      title="Payment Methods"
      visible={open}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Cancel
        </Button>,
        <Button 
          key="complete" 
          type="primary" 
          onClick={handleCompletePayment}
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
                onChange={setExchangeRate}
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

        <div style={{ marginBottom: 8 }}>
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
        </div>

        <Button 
          type="dashed" 
          onClick={handleAddPayment}
          icon={<PlusOutlined />}
          style={{ width: '100%' }}
          disabled={!paymentAmount || paymentAmount < 0}
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
                    onClick={() => {
                      const newPayments = [...payments];
                      newPayments.splice(index, 1);
                      setPayments(newPayments);
                    }}
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
  );
};

export default PaymentMethods;