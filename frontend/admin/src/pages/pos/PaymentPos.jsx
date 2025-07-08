import React, { useState, useEffect } from "react";
import { 
  Col, 
  Row, 
  Input, 
  Button, 
  Select, 
  Modal, 
  Divider, 
  Card, 
  Radio, 
  message, 
  InputNumber, 
  DatePicker,
  Table,
  Space,
  Popover,
  Tooltip
} from 'antd';
import {
  DollarOutlined,
  MobileOutlined,
  UserAddOutlined,
  CloseOutlined,
  CheckOutlined,
  EyeOutlined,
  FileSearchOutlined,
  PauseOutlined
} from '@ant-design/icons';
import moment from 'moment';
import "./PaymentPos.css";
import { useSale } from "../../hooks/UseSale";
import Cookies from "js-cookie";

const { Option } = Select;
const { Column } = Table;

function PaymentPos({ order, onClose, onPaymentSuccess }) {
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [amountTendered, setAmountTendered] = useState("");
  const [changeDue, setChangeDue] = useState(0);
  const [isCustomerModalVisible, setIsCustomerModalVisible] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedBank, setSelectedBank] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [subtotal, setSubtotal] = useState(0);
  const [tax, setTax] = useState(0);
  const [total, setTotal] = useState(0);
  const [currency, setCurrency] = useState("USD");
  const [exchangeRate, setExchangeRate] = useState(4000);
  const [nextPaymentDate, setNextPaymentDate] = useState(null);
  const [nextPaymentAmount, setNextPaymentAmount] = useState(0);
  const [suspendedOrders, setSuspendedOrders] = useState([]);
  const [viewSuspendedModalVisible, setViewSuspendedModalVisible] = useState(false);
  const [currentDateTime, setCurrentDateTime] = useState(moment());
  
  const { handlePosSaleCreate, handleGetSuspendedOrders } = useSale();
  const token = localStorage.getItem("token");
  const shiftId = Cookies.get("shift_id");
  const userData = JSON.parse(Cookies.get("user"));

  const banks = [
    { id: 1, name: "ABA" },
    { id: 2, name: "ACLEDA" },
    { id: 3, name: "Wing" },
    { id: 4, name: "Chip Mong" },
    { id: 5, name: "Other" },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(moment());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatMoney = (amount) => {
    if (currency === "KHR") {
      return `${(amount * exchangeRate).toFixed(0)}៛`;
    }
    return `$${amount.toFixed(2)}`;
  };

  const convertToUSD = (amount) => {
    if (currency === "KHR" && exchangeRate) {
      return amount / exchangeRate;
    }
    return amount;
  };

  useEffect(() => {
    if (order) {
      const items = Array.isArray(order.items) 
        ? order.items.map(item => ({
            id: item.id || item.product_id,
            name: item.name || item.product_name,
            price: parseFloat(item.price || 0),
            quantity: parseInt(item.quantity || 1),
            discount: parseFloat(item.discount) || 0,
            unit: item.unit
          }))
        : [];

      setCartItems(items);
      setSelectedCustomer(order.customer?.id || null);

      const calculatedSubtotal = order.subtotal || 
        items.reduce((sum, item) => sum + (item.price * item.quantity * (1 - (item.discount / 100))), 0);
      
      const calculatedTax = order.tax || 0;
      const calculatedTotal = order.total || calculatedSubtotal + calculatedTax + (order.delivery?.price || 0);

      setSubtotal(calculatedSubtotal);
      setTax(calculatedTax);
      setTotal(calculatedTotal);
    }
  }, [order]);

  useEffect(() => {
    if (amountTendered && parseFloat(amountTendered) > 0) {
      const tenderedUSD = convertToUSD(parseFloat(amountTendered));
      if (tenderedUSD < total) {
        setNextPaymentAmount(total - tenderedUSD);
        if (!nextPaymentDate) {
          setNextPaymentDate(moment().add(30, 'days'));
        }
      } else {
        setNextPaymentAmount(0);
        setNextPaymentDate(null);
      }
    } else {
      setNextPaymentAmount(0);
      setNextPaymentDate(null);
    }
  }, [amountTendered, total, currency, exchangeRate, nextPaymentDate]);

  const handleAmountTenderedChange = (e) => {
    const value = e.target.value;
    setAmountTendered(value);
    if (value && !isNaN(value)) {
      const tenderedUSD = convertToUSD(parseFloat(value));
      setChangeDue(tenderedUSD - total);
    } else {
      setChangeDue(0);
      setNextPaymentAmount(0);
      setNextPaymentDate(null);
    }
  };

  const handleAddToTendered = (amount) => {
    const newAmount = amountTendered ? parseFloat(amountTendered) + amount : amount;
    setAmountTendered(newAmount.toString());
    const tenderedUSD = convertToUSD(newAmount);
    setChangeDue(tenderedUSD - total);
    if (tenderedUSD < total) {
      setNextPaymentAmount(total - tenderedUSD);
      if (!nextPaymentDate) {
        setNextPaymentDate(moment().add(30, 'days'));
      }
    } else {
      setNextPaymentAmount(0);
      setNextPaymentDate(null);
    }
  };

  const handleAddCustomer = () => {
    if (newCustomerName.trim() === "") {
      message.warning("Please enter customer name");
      return;
    }
  
    const newCustomer = { id: Date.now(), username: newCustomerName };
  
    setSelectedCustomer(newCustomer.id);
  
    setIsCustomerModalVisible(false);
    setNewCustomerName("");
  
    message.success("Customer added successfully");
  };

  const handleCompletePayment = async () => {
    if (paymentMethod === "mobile" && !selectedBank) {
      message.warning("Please select a bank for mobile payment");
      return;
    }

    if (paymentMethod === "cash") {
      if (!amountTendered || parseFloat(amountTendered) <= 0) {
        message.warning("Please enter a valid amount tendered");
        return;
      }
      if (parseFloat(amountTendered) < total && (!nextPaymentDate || !nextPaymentAmount)) {
        message.warning("Please specify next payment date and amount for partial payment");
        return;
      }
    }

    try {
      const paidAmountUSD = paymentMethod === "cash" ? convertToUSD(parseFloat(amountTendered || 0)) : total;
      const nextPaymentDateValue = paidAmountUSD < total && nextPaymentDate ? nextPaymentDate.format('YYYY-MM-DD') : null;
      const nextPaymentAmountValue = paidAmountUSD < total ? nextPaymentAmount : 0;

      const paymentData = {
        order_id: order?.id || Date.now().toString(),
        customer_id: selectedCustomer || "Walk-in Customer",
        warehouse_id: userData.warehouse_id || null,
        shift_id: shiftId,
        date: currentDateTime.format('YYYY-MM-DD HH:mm:ss'),
        items: cartItems.map(item => {
          const isInStock = item.stock > 0;
          return {
            product_id: item.id,
            product_name: item.name,
            quantity: item.quantity,
            price: item.price,
            cost: isInStock ? item.cost : 0,
            discount: item.discount,
            total: item.price * item.quantity * (1 - (item.discount / 100))
          };
        }),
        subtotal,
        tax,
        reference: null,
        discount: order?.discountTotal || 0,
        delivery_fee: order?.delivery?.price || 0,
        total,
        payment_method: paymentMethod,
        amount_paid: paidAmountUSD,
        change_due: changeDue > 0 ? changeDue : 0,
        bank: paymentMethod === 'mobile' ? selectedBank : null,
        currency,
        exchange_rate: currency === 'KHR' ? exchangeRate : null,
        next_payment_date: nextPaymentDateValue,
        next_payment_amount: nextPaymentAmountValue
      };
      const response = await handlePosSaleCreate(paymentData, token);

      if (response.success) {
        if (onPaymentSuccess) {
          onPaymentSuccess({
            paidAmount: paidAmountUSD,
            nextPaymentDate: nextPaymentDateValue,
            nextPaymentAmount: nextPaymentAmountValue
          });
        }
        if (onClose) {
          onClose();
        }
      } else {
        throw new Error(response.message || 'Payment failed');
      }
    } catch (error) {
      message.error(error.message || 'Failed to complete payment. Please try again.');
      console.error('Payment error:', error);
    }
  };

  const handleViewSuspendedOrders = async () => {
    try {
      const response = await handleGetSuspendedOrders(token);
      if (response.success) {
        setSuspendedOrders(response.data);
        setViewSuspendedModalVisible(true);
      } else {
        throw new Error(response.message || 'Failed to fetch suspended orders');
      }
    } catch (error) {
      message.error(error.message || 'Failed to load suspended orders');
      console.error('Fetch suspended orders error:', error);
    }
  };

  const handleResumeOrder = (order) => {
    message.success(`Resuming order ${order.order_id}`);
    setViewSuspendedModalVisible(false);
  };

  const suspendedOrderColumns = [
    {
      title: 'Order ID',
      dataIndex: 'order_id',
      key: 'order_id',
    },
    {
      title: 'Customer',
      dataIndex: 'customer_id',
      key: 'customer_id',
    },
    {
      title: 'Items',
      dataIndex: 'items',
      key: 'items',
      render: (items) => items.length,
    },
    {
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
      render: (total) => formatMoney(total),
    },
    {
      title: 'Next Payment',
      dataIndex: 'next_payment_amount',
      key: 'next_payment_amount',
      render: (amount, record) => (
        amount > 0 ? `$${amount.toFixed(2)} due on ${moment(record.next_payment_date).format('YYYY-MM-DD')}` : '-'
      ),
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (date) => moment(date).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Button 
            type="primary" 
            icon={<EyeOutlined />} 
            onClick={() => handleResumeOrder(record)}
          >
            Resume
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="pos-payment-container">
      <div className="order-summary">
        <span>Order #{order?.id || 'N/A'}</span>
        <span>{currentDateTime.format('YYYY-MM-DD HH:mm:ss')}</span>
      </div>

      <Row gutter={16} className="payment-content">
        <Col span={12} className="order-summary-section">
          <Card 
            title="Order Items" 
            className="order-card"
          >
            <div className="order-items">
              {cartItems.length > 0 ? (
                cartItems.map(item => (
                  <div key={item.id} className="order-item">
                    <div className="item-info">
                      <span className="item-name">{item.name}</span>
                      <span className="item-quantity">
                        {item.quantity} {item.unit} × {formatMoney(item.price)}
                        {item.discount > 0 && (
                          <span className="item-discount"> (-{formatMoney(item.price * item.quantity * item.discount / 100)})</span>
                        )}
                      </span>
                    </div>
                    <div className="item-price">
                      {formatMoney(item.price * item.quantity * (1 - (item.discount / 100)))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-items">No items in this order</div>
              )}
            </div>
            
            <Divider className="custom-divider" />
            
            <div className="order-totals">
              {order?.discountTotal > 0 && (
                <div className="total-row">
                  <span>Discount:</span>
                  <span>-{formatMoney(order.discountTotal)}</span>
                </div>
              )}
              <div className="total-row">
                <span>Subtotal:</span>
                <span>{formatMoney(subtotal)}</span>
              </div>
              {tax > 0 && (
                <div className="total-row">
                  <span>Tax:</span>
                  <span>{formatMoney(tax)}</span>
                </div>
              )}
              {order?.delivery?.price > 0 && (
                <div className="total-row">
                  <span>Delivery ({order.delivery.name}):</span>
                  <span>{formatMoney(order.delivery.price)}</span>
                </div>
              )}
              <div className="total-row grand-total">
                <span>Total:</span>
                <span>{formatMoney(total)}</span>
              </div>
            </div>
          </Card>
        </Col>

        <Col span={12} className="payment-options-section">
          <div className="currency-selector">
            <Select 
              value={currency} 
              onChange={setCurrency}
              style={{ width: 120, marginBottom: 16 }}
            >
              <Option value="USD">USD ($)</Option>
              <Option value="KHR">KHR (៛)</Option>
            </Select>
            {currency === "KHR" && (
              <Input
                placeholder="Exchange Rate"
                value={exchangeRate}
                onChange={(e) => setExchangeRate(parseFloat(e.target.value) || 4000)}
                style={{ width: 120, marginLeft: 8 }}
                type="number"
              />
            )}
          </div>

          <div className="customer-info">
            <span>Customer: </span>
            <span className="customer-name">
              {selectedCustomer || 'No customer selected'}
            </span>
            <Button 
              type="link" 
              onClick={() => setIsCustomerModalVisible(true)}
              icon={<UserAddOutlined />}
            >
              {selectedCustomer ? 'Change' : 'Add'}
            </Button>
          </div>
          
          <Radio.Group 
            value={paymentMethod} 
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="payment-methods"
          >
            <Radio.Button value="cash" className="payment-method">
              <DollarOutlined /> Cash
            </Radio.Button>
            <Radio.Button value="mobile" className="payment-method">
              <MobileOutlined /> Mobile Pay
            </Radio.Button>
          </Radio.Group>

          {paymentMethod === "cash" && (
            <div className="cash-payment-details">
              <div className="amount-due">
                <span>Amount Due:</span>
                <span className="amount">{formatMoney(total)}</span>
              </div>
              <Input
                placeholder="Amount Tendered"
                prefix={currency === "USD" ? <DollarOutlined /> : <span>៛</span>}
                value={amountTendered}
                onChange={handleAmountTenderedChange}
                className="amount-input"
                type="number"
              />
              
              <div className="denomination-buttons">
                {currency === "USD" ? (
                  <>
                    <Button onClick={() => handleAddToTendered(1)}>$1</Button>
                    <Button onClick={() => handleAddToTendered(5)}>$5</Button>
                    <Button onClick={() => handleAddToTendered(10)}>$10</Button>
                    <Button onClick={() => handleAddToTendered(20)}>$20</Button>
                    <Button onClick={() => handleAddToTendered(50)}>$50</Button>
                    <Button onClick={() => handleAddToTendered(100)}>$100</Button>
                  </>
                ) : (
                  <>
                    <Button onClick={() => handleAddToTendered(1000)}>1000៛</Button>
                    <Button onClick={() => handleAddToTendered(5000)}>5000៛</Button>
                    <Button onClick={() => handleAddToTendered(10000)}>10000៛</Button>
                    <Button onClick={() => handleAddToTendered(50000)}>50000៛</Button>
                    <Button onClick={() => handleAddToTendered(100000)}>100000៛</Button>
                  </>
                )}
                <Button onClick={() => setAmountTendered(total.toFixed(2))}>Exact Amount</Button>
                <Button onClick={() => setAmountTendered("")}>Clear</Button>
              </div>
              
              <div className="change-due">
                <span>Change Due:</span>
                <span className="amount">
                  {changeDue > 0 ? formatMoney(changeDue) : formatMoney(0)}
                </span>
              </div>

              {amountTendered && parseFloat(amountTendered) < total && (
                <div className="next-payment-section" style={{display:"flex",justifyContent:"space-between"}}>

                  <div className="next-payment-row">
                    <DatePicker
                      value={nextPaymentDate}
                      onChange={setNextPaymentDate}
                      disabledDate={(current) => current && current < moment().endOf('day')}
                      className="next-payment-picker"
                    />
                  </div>

                  <div className="next-payment-row">
                    {/* <label className="next-payment-label">Next Payment Amount:</label> */}
                    <InputNumber
                      min={0}
                      value={nextPaymentAmount}
                      onChange={setNextPaymentAmount}
                      formatter={value => `$ ${value}`}
                      parser={value => value.replace(/\$\s?|(,*)/g, '')}
                      className="next-payment-input"
                    />
                  </div>
                </div>


              )}
            </div>
          )}

          {paymentMethod === "mobile" && (
            <div className="mobile-payment-details">
              <Select
                placeholder="Select Bank"
                className="bank-selector"
                value={selectedBank}
                onChange={setSelectedBank}
                style={{ width: '100%', marginBottom: '16px' }}
              >
                {banks.map(bank => (
                  <Option key={bank.id} value={bank.name}>{bank.name}</Option>
                ))}
              </Select>
              <div className="qr-code-placeholder">
                <div className="qr-code"></div>
                <p>Scan QR code to complete payment</p>
              </div>
              <Input 
                placeholder="Transaction Reference Number" 
                className="transaction-input"
              />
            </div>
          )}

          <div className="payment-actions">
            <Button 
              type="primary" 
              size="large" 
              className="complete-payment-btn"
              onClick={handleCompletePayment}
              icon={<CheckOutlined />}
              disabled={cartItems.length === 0}
            >
              Complete Payment ({formatMoney(total)})
            </Button>
          </div>
        </Col>
      </Row>

      <Modal
        title={selectedCustomer ? "Change Customer" : "Add New Customer"}
        visible={isCustomerModalVisible}
        onCancel={() => setIsCustomerModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsCustomerModalVisible(false)} icon={<CloseOutlined />}>
            Cancel
          </Button>,
          <Button 
            key="add" 
            type="primary" 
            onClick={handleAddCustomer}
            icon={<UserAddOutlined />}
          >
            {selectedCustomer ? 'Update' : 'Add'} Customer
          </Button>,
        ]}
        className="customer-modal"
      >
        <Input
          placeholder="Customer Name"
          value={newCustomerName}
          onChange={(e) => setNewCustomerName(e.target.value)}
          onPressEnter={handleAddCustomer}
          autoFocus
        />
      </Modal>

      <Modal
        title="Suspended Orders"
        visible={viewSuspendedModalVisible}
        onCancel={() => setViewSuspendedModalVisible(false)}
        width={800}
        footer={[
          <Button key="close" onClick={() => setViewSuspendedModalVisible(false)}>
            Close
          </Button>
        ]}
      >
        <Table
          dataSource={suspendedOrders}
          columns={suspendedOrderColumns}
          rowKey="order_id"
          pagination={{ pageSize: 5 }}
        />
      </Modal>
    </div>
  );
}

export default PaymentPos;