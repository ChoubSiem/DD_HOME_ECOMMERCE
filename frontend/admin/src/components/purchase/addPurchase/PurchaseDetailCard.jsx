import { Card, Row, Col, DatePicker, Input, Form, Select, Button, Modal, message } from "antd";
import dayjs from 'dayjs';
import React, { useState, useEffect } from "react";

const { Option } = Select;

const PurchaseDetailsCard = ({ 
  reference = null, 
  setReference,
  suppliers,
  purchase = { name: '', id: null },
  onPaymentSubmit,
  selectSupplier,
  initialPayment = null
}) => {

  const now = dayjs();
  const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);
  const [paymentType, setPaymentType] = useState(initialPayment?.type || null);
  const [paymentDate, setPaymentDate] = useState(initialPayment?.date ? dayjs(initialPayment.date) : dayjs().add(7, 'day'));
  const [paymentAmount, setPaymentAmount] = useState(initialPayment?.amount || '');
  const [selectedSupplier, setSelectedSupplier] = useState(null);

  const handleSupplierChange = (value) => {
    setSelectedSupplier(value);
    if (selectSupplier) {
      selectSupplier(value); 
    }
  };
  useEffect(()=>{
    if (selectSupplier) {
      
    var  selectSupplier = selectSupplier;
    }
  },[selectedSupplier]);

  const safePurchase = {
    name: purchase?.name || '',
    id: purchase?.id || null
  };
  

  useEffect(() => {
    if (initialPayment) {
      setPaymentType(initialPayment.type);
      setPaymentDate(initialPayment.date ? dayjs(initialPayment.date) : dayjs().add(7, 'day'));
      setPaymentAmount(initialPayment.amount || '');
    }
  }, [initialPayment]);

  const handlePaymentClick = () => {
    setIsPaymentModalVisible(true);
  };

  const handlePaymentOk = () => {
    if (!paymentType) {
      message.error('Please select a payment type');
      return;
    }

    if (paymentType === 'Credit' && (!paymentAmount || isNaN(paymentAmount))) {
      message.error('Please enter a valid amount for credit payment');
      return;
    }

    const paymentData = {
      type: paymentType,
      date: paymentType === 'Credit' ? paymentDate.format('YYYY-MM-DD') : null,
      amount: paymentType === 'Credit' ? parseFloat(paymentAmount) : null,
      supplier_id: selectedSupplier
    };

    if (onPaymentSubmit) {
      onPaymentSubmit(paymentData);
    }

    setIsPaymentModalVisible(false);
  };

  const handlePaymentCancel = () => {
    setIsPaymentModalVisible(false);
  };

  // const handleSupplierChange = (value) => {
  //   setSelectedSupplier(value);
  // };

  return (
    <>
      <Card title="Purchase Details" style={{ marginBottom: 20, borderRadius: 0 }}>
        <Form layout="vertical">
          <Row gutter={16} align="bottom">
            <Col xs={16} sm={6} md={6} lg={6}>
              <Form.Item label="Date & Time" style={{ marginBottom: 0 }}>
                <DatePicker
                  showTime
                  format="YYYY-MM-DD HH:mm:ss"
                  style={{ width: '100%' }}
                  defaultValue={now}
                />
              </Form.Item>
            </Col>

            <Col xs={16} sm={6} md={6} lg={6}>
              <Form.Item label="Reference" style={{ marginBottom: 0 }}>
                <Input 
                  placeholder="Enter reference number" 
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                />
              </Form.Item>
            </Col>
            <Col xs={16} sm={6} md={6} lg={6}>
              <Form.Item label="Suppliers" style={{ marginBottom: 0 }}>
                <Select 
                  placeholder="Select supplier"
                  style={{borderRadius:"10px"}}
                  onChange={handleSupplierChange}
                >
                  {suppliers.map((supplier) => (
                    <Option key={supplier.id} value={supplier.id}>
                      {supplier.username}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col xs={16} sm={6} md={6} lg={6}>
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
            <Col xs={16} sm={6} md={6} lg={6}>
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

      <Modal 
        title="Select Payment Method" 
        open={isPaymentModalVisible} 
        onOk={handlePaymentOk}
        onCancel={handlePaymentCancel}
        okText="Confirm"
        width={600}
      >
        <Form layout="vertical">
          <Form.Item label="Payment Type" required>
            <Select 
              placeholder="Select payment type"
              onChange={(value) => setPaymentType(value)}
              style={{ width: '100%' }}
              value={paymentType}
            >
              <Option value="COD">COD (Cash On Delivery)</Option>
              <Option value="Credit">Credit</Option>
            </Select>
          </Form.Item>

          {paymentType === 'Credit' && (
            <>
              <Form.Item label="Credit Amount" required>
                <Input 
                  type="number" 
                  placeholder="Enter amount" 
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                />
              </Form.Item>
              <Form.Item label="Payment Date" required>
                <DatePicker
                  style={{ width: '100%' }}
                  value={paymentDate}
                  onChange={(date) => setPaymentDate(date)}
                />
              </Form.Item>
            </>
          )}
        </Form>
      </Modal>
    </>
  );
};

export default PurchaseDetailsCard;