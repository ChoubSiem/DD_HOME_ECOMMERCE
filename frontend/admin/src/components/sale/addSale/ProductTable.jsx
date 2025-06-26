import { Table, InputNumber, Button, Popconfirm, Typography, Select, Row, Col, DatePicker, Form, Divider, Space, Card } from "antd";
import { DeleteOutlined, PlusOutlined, CloseOutlined } from "@ant-design/icons";
import React, { useState, useEffect } from "react";

const { Text } = Typography;
const { Option } = Select;

const currencyFormatter = (value) => {
  return `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

const ProductsTable = ({ 
  selectedProducts, 
  handleQuantityChange,
  handlePriceChange,
  handleItemDiscountChange,
  handleRemoveProduct,
  onInvoiceDiscountChange,
  onPaymentMethodsChange,
  paymentMethods = [],
  currencies = [
    { code: 'USD', name: 'US Dollar', symbol: '$', rate: 1 },
    { code: 'KHR', name: 'Cambodian Riel', symbol: '៛', rate: 4100 },
  ],
  onAmountChange = () => {},
  onTotalChange = () => {},
}) => {
  const [invoiceDiscount, setInvoiceDiscount] = useState({ type: 'amount', value: 0 });

  useEffect(() => {
    const totals = calculateTotals();
    onAmountChange(totals.grandTotal);
    onTotalChange(totals.subtotal);
    
    if (paymentMethods.length === 0 && totals.grandTotal > 0) {
      const initialPayment = { 
        method: 'cash', 
        amount: totals.grandTotal,
        currency: 'USD', 
        exchange_rate: 1 
      };
      onPaymentMethodsChange([initialPayment]);
    }
  }, [selectedProducts, invoiceDiscount]);

  const calculateTotals = () => {
    const results = selectedProducts.reduce((acc, item) => {
      const itemSubtotal = item.price * item.quantity;
      const itemDiscount = item.discountAmount || (itemSubtotal * (item.discountPercent || 0)) / 100;
      const itemTotal = itemSubtotal - itemDiscount;
      
      return {
        subtotal: acc.subtotal + itemSubtotal,
        itemDiscounts: acc.itemDiscounts + itemDiscount,
        totalBeforeInvoiceDiscount: acc.totalBeforeInvoiceDiscount + itemTotal,
        totalQuantity: acc.totalQuantity + item.quantity
      };
    }, { subtotal: 0, itemDiscounts: 0, totalBeforeInvoiceDiscount: 0, totalQuantity: 0 });

    const invoiceDiscountValue = invoiceDiscount.type === 'amount' 
      ? invoiceDiscount.value 
      : (results.totalBeforeInvoiceDiscount * invoiceDiscount.value) / 100;

    return {
      ...results,
      invoiceDiscount: invoiceDiscountValue,
      grandTotal: results.totalBeforeInvoiceDiscount - invoiceDiscountValue
    };
  };

  const totals = calculateTotals();

  const formatCurrency = (value, currencyCode) => {
    const currency = currencies.find(c => c.code === currencyCode) || currencies[0];
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.code,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value).replace(currency.code, currency.symbol);
  };

  const handlePaymentMethodChange = (value, index) => {
    const newPayments = [...paymentMethods];
    newPayments[index].method = value;
    
    if (value !== 'credit') {
      delete newPayments[index].nextPaymentDate;
    }
    
    onPaymentMethodsChange(newPayments);
  };

  const handlePaymentAmountChange = (value, index) => {
    const newPayments = [...paymentMethods];
    newPayments[index].amount = value || 0;
    onPaymentMethodsChange(newPayments);
  };

  const handlePaymentCurrencyChange = (value, index) => {
    const newPayments = [...paymentMethods];
    const selectedCurrency = currencies.find(c => c.code === value) || currencies[0];
    
    const currentCurrency = currencies.find(c => c.code === newPayments[index].currency) || currencies[0];
    newPayments[index].amount = (newPayments[index].amount * currentCurrency.rate) / selectedCurrency.rate;
    
    newPayments[index].currency = value;
    newPayments[index].exchangeRate = selectedCurrency.rate;
    onPaymentMethodsChange(newPayments);
  };

  const handleExchangeRateChange = (value, index) => {
    const newPayments = [...paymentMethods];
    newPayments[index].exchangeRate = value;
    onPaymentMethodsChange(newPayments);
  };

  const handleNextPaymentDateChange = (date, index) => {
    const newPayments = [...paymentMethods];
    newPayments[index].nextPaymentDate = date;
    onPaymentMethodsChange(newPayments);
  };

  const addPaymentMethod = () => {
    onPaymentMethodsChange([
      ...paymentMethods,
      { method: 'cash', amount: 0, currency: 'USD', exchangeRate: 1 }
    ]);
  };

  const removePaymentMethod = (index) => {
    if (paymentMethods.length > 1) {
      const newPayments = [...paymentMethods];
      newPayments.splice(index, 1);
      
      // If removing the only payment with amount, set first payment to remaining balance
      if (paymentMethods.reduce((sum, pm) => sum + pm.amount, 0) === totals.grandTotal) {
        newPayments[0].amount = totals.grandTotal;
      }
      
      onPaymentMethodsChange(newPayments);
    }
  };

  const columns = [
    {
      title: "#",
      key: "no",
      width: 50,
      render: (_, __, index) => index + 1,
    },
    {
      title: "Product",
      dataIndex: "productName",
      key: "productName",
      render: (name, record) => <Text strong>{name} {record.productCode && `(${record.productCode + ')('+ record.stock+')'}`}</Text>
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      width: 120,
      render: (price, record) => (
        <InputNumber
          min={0.01}
          step={0.01}
          value={price}
          onChange={(value) => handlePriceChange(record.key, value)}
          formatter={currencyFormatter}
          parser={value => parseFloat(value.replace(/\$\s?|(,*)/g, ''))}
          style={{ width: '100%' }}
        />
      ),
      align: 'right'
    },
    {
      title: "Qty",
      key: "quantity",
      width: 100,
      render: (_, record) => (
        <InputNumber
          min={1}
          value={record.quantity}
          onChange={(value) => handleQuantityChange(record.key, value)}
          style={{ width: '100%' }}
        />
      ),
      align: 'center'
    },
    {
      title: "Item Discount",
      key: "discount",
      width: 200,
      render: (_, record) => {
        const maxDiscount = record.price * record.quantity;
        return (
          <div style={{ display: 'flex', gap: 8 }}>
            <InputNumber
              min={0}
              max={maxDiscount}
              value={record.discountAmount || 0}
              onChange={(value) => handleItemDiscountChange(record.key, value, 'amount')}
              formatter={currencyFormatter}
              parser={value => parseFloat(value.replace(/\$\s?|(,*)/g, ''))}
              style={{ width: '60%' }}
            />
            <InputNumber
              min={0}
              max={100}
              value={record.discountPercent || 0}
              onChange={(value) => handleItemDiscountChange(record.key, value, 'percent')}
              formatter={value => `${value}%`}
              parser={value => parseFloat(value.replace('%', ''))}
              style={{ width: '40%' }}
            />
          </div>
        );
      },
      align: 'right'
    },
    {
      title: "Total",
      key: "total",
      width: 120,
      render: (_, record) => {
        const subtotal = record.price * record.quantity;
        const discount = record.discountAmount || (subtotal * (record.discountPercent || 0)) / 100;
        return <Text strong>{currencyFormatter(subtotal - discount)}</Text>;
      },
      align: 'right'
    },
    {
      title: "Action",
      key: "action",
      width: 80,
      render: (_, record) => (
        <Popconfirm
          title="Remove this product?"
          onConfirm={() => handleRemoveProduct(record.key)}
        >
          <Button type="text" danger icon={<DeleteOutlined />} />
        </Popconfirm>
      ),
      align: 'center'
    },
  ];

  const tableFooter = () => {
    const paidAmountUSD = paymentMethods.reduce((sum, pm) => sum + (pm.amount / pm.exchangeRate), 0);
    const remainingAmount = totals.grandTotal - paidAmountUSD;
    
    return (
      <div style={{ textAlign: 'right', paddingRight: 10, marginRight: "65px" }}>
        <div><Text strong>Subtotal (No Discount): </Text><Text>{formatCurrency(totals.subtotal, 'USD')}</Text></div>
        <div><Text strong>Item Discounts: </Text><Text type="danger">-{formatCurrency(totals.itemDiscounts, 'USD')}</Text></div>
        <div><Text strong>Invoice Discount: </Text><Text type="danger">-{formatCurrency(totals.invoiceDiscount, 'USD')}</Text></div>
        <div><Text strong>Total: </Text><Text>{formatCurrency(totals.totalBeforeInvoiceDiscount, 'USD')}</Text></div>
        <div><Text strong style={{ fontSize: 16 }}>Grand Total: </Text>
          <Text strong style={{ fontSize: 18 }}>{formatCurrency(totals.grandTotal, 'USD')}</Text>
        </div>
        <Divider />
        <div><Text strong>Paid Amount: </Text>
          <Text type="success">
            {paymentMethods.map((pm, i) => (
              <span key={i}>
                {formatCurrency(pm.amount, pm.currency)}{i < paymentMethods.length - 1 ? ' + ' : ''}
              </span>
            ))}
            {` (${formatCurrency(paidAmountUSD, 'USD')})`}
          </Text>
        </div>
        <div><Text strong>Remaining Amount: </Text>
          <Text type={remainingAmount > 0 ? 'danger' : 'success'}>
            {formatCurrency(Math.max(remainingAmount, 0), 'USD')}
          </Text>
        </div>
      </div>
    );
  };

  return (
    <div>
      <Table
        bordered
        dataSource={selectedProducts}
        columns={columns}
        pagination={false}
        rowKey="key"
        size="middle"
        style={{ marginTop: 20 }}
        footer={tableFooter}
      />
      
      <Row gutter={16} style={{ marginTop: 20 }}>
        <Col span={12}>
          <Card title="Invoice Discount" bordered={false}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <InputNumber
                min={0}
                max={invoiceDiscount.type === 'amount' ? totals.totalBeforeInvoiceDiscount : 100}
                value={invoiceDiscount.value}
                onChange={(value) => {
                  setInvoiceDiscount({ ...invoiceDiscount, value });
                  onInvoiceDiscountChange(value, invoiceDiscount.type);
                }}
                style={{ width: '70%' }}
              />
              <Select
                value={invoiceDiscount.type}
                onChange={(type) => {
                  setInvoiceDiscount({ ...invoiceDiscount, type });
                  onInvoiceDiscountChange(invoiceDiscount.value, type);
                }}
                style={{ width: '30%' }}
              >
                <Option value="amount">$ Amount</Option>
                <Option value="percent">% Percentage</Option>
              </Select>
            </div>
          </Card>
        </Col>
        <Col span={12}>
          <Card 
            title="Payment Methods"
            extra={
              <Button 
                type="dashed" 
                onClick={addPaymentMethod} 
                icon={<PlusOutlined />}
                size="small"
              >
                Add Payment
              </Button>
            }
            bordered={false}
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              {paymentMethods.map((payment, index) => (
                <Card
                  key={index}
                  style={{ 
                    position: 'relative',
                    border: '1px solid #f0f0f0',
                    borderRadius: 8
                  }}
                  bodyStyle={{ padding: 16 }}
                >
                  {paymentMethods.length > 1 && (
                    <Button
                      danger
                      type="text"
                      icon={<CloseOutlined />}
                      onClick={() => removePaymentMethod(index)}
                      style={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        zIndex: 1
                      }}
                    />
                  )}

                  <Form layout="vertical">
                    <Row gutter={12}>
                      <Col span={12}>
                        <Form.Item label="Method">
                          <Select
                            value={payment.method}
                            onChange={(value) => handlePaymentMethodChange(value, index)}
                            style={{ width: '100%' }}
                          >
                            <Option value="cash">Cash</Option>
                            <Option value="credit">Credit</Option>
                            <Option value="ac">AC</Option>
                            <Option value="aba">ABA</Option>
                            <Option value="bakong">Bakong</Option>
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item label="Amount">
                          <InputNumber
                            min={0}
                            value={payment.amount}
                            onChange={(value) => handlePaymentAmountChange(value, index)}
                            formatter={(value) => formatCurrency(value, payment.currency)}
                            parser={value => parseFloat(value.replace(/[^\d.-]/g, ''))}
                            style={{ width: '100%' }}
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Row gutter={12}>
                      <Col span={12}>
                        <Form.Item label="Currency">
                          <Select
                            value={payment.currency}
                            onChange={(value) => handlePaymentCurrencyChange(value, index)}
                            style={{ width: '100%' }}
                          >
                            {currencies.map(currency => (
                              <Option key={currency.code} value={currency.code}>
                                {currency.name} ({currency.symbol})
                              </Option>
                            ))}
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item label="Exchange Rate">
                          <InputNumber
                            min={0.0001}
                            step={0.0001}
                            value={payment.exchangeRate}
                            onChange={(value) => handleExchangeRateChange(value, index)}
                            style={{ width: '100%' }}
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                    {payment.method === 'credit' && (
                      <Row gutter={12}>
                        <Col span={12}>
                          <Form.Item label="Next Payment Date">
                            <DatePicker
                              value={payment.nextPaymentDate}
                              onChange={(date) => handleNextPaymentDateChange(date, index)}
                              style={{ width: '100%' }}
                            />
                          </Form.Item>
                        </Col>
                      </Row>
                    )}
                  </Form>
                </Card>
              ))}
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ProductsTable;