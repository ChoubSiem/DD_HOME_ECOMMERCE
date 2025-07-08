import React, { useState, useEffect } from "react";
import { Table, InputNumber, Button, Popconfirm, Typography, Select, Row, Col, DatePicker, Form } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const { Text } = Typography;
const { Option } = Select;

// Helper functions
const currencyFormatter = (value) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

const useTotalsCalculator = (products, invoiceDiscount) => {
  return React.useMemo(() => {
    const results = products.reduce(
      (acc, item) => {
        const itemSubtotal = item.price * item.quantity;
        const itemDiscount = item.discountAmount || (itemSubtotal * (item.discountPercent || 0)) / 100;
        const itemTotal = itemSubtotal - itemDiscount;

        return {
          subtotal: acc.subtotal + itemSubtotal,
          itemDiscounts: acc.itemDiscounts + itemDiscount,
          totalBeforeInvoiceDiscount: acc.totalBeforeInvoiceDiscount + itemTotal,
          totalQuantity: acc.totalQuantity + item.quantity,
          rawTotalPrice: acc.rawTotalPrice + itemSubtotal,
        };
      },
      {
        subtotal: 0,
        itemDiscounts: 0,
        totalBeforeInvoiceDiscount: 0,
        totalQuantity: 0,
        rawTotalPrice: 0,
      }
    );

    const invoiceDiscountValue =
      invoiceDiscount.type === "amount"
        ? invoiceDiscount.value
        : (results.totalBeforeInvoiceDiscount * invoiceDiscount.value) / 100;

    return {
      ...results,
      invoiceDiscount: invoiceDiscountValue,
      grandTotal: results.totalBeforeInvoiceDiscount - invoiceDiscountValue,
    };
  }, [products, invoiceDiscount]);
};

const ProductsTable = ({
  selectedProducts,
  handleQuantityChange,
  handlePriceChange,
  handleItemDiscountChange,
  handleRemoveProduct,
  onInvoiceDiscountChange,
  onPaymentMethodChange = () => {},
  onCreditDetailsChange = () => {},
  paymentMethod = "cash",
  creditAmount = 0,
  nextPaymentDate = null,
  onAmountChange = () => {},
}) => {
  const [invoiceDiscount, setInvoiceDiscount] = useState({
    type: "amount",
    value: 0,
  });

  const totals = useTotalsCalculator(selectedProducts, invoiceDiscount);

  // Notify parent of amount changes
  useEffect(() => {
    onAmountChange(totals.subtotal);

  }, [totals.subtotal]);

  // Handle credit payment logic
  useEffect(() => {
    if (creditAmount > 0 && paymentMethod !== "credit") {
      onPaymentMethodChange("credit");
    }
  }, [creditAmount]);

  const handlePaymentMethodChange = (value) => {
    if (value !== "credit" && creditAmount > 0) {
      onCreditDetailsChange(0, null);
    }
    onPaymentMethodChange(value);
  };

  const handleCreditAmountChange = (value) => {
    const amount = Math.min(value || 0, totals.grandTotal);
    onCreditDetailsChange(amount, nextPaymentDate);
  };

  const handleNextPaymentDateChange = (date) => {
    onCreditDetailsChange(creditAmount, date);
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
      render: (name, record) => (
        <Text strong>
          {name}{" "}
          {record.productCode && `(${record.productCode})(${record.stock})`}
        </Text>
      ),
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
          parser={(value) => parseFloat(value.replace(/\$\s?|(,*)/g, ""))}
          style={{ width: "100%" }}
        />
      ),
      align: "right",
    },
    {
      title: "Qty",
      key: "quantity",
      width: 100,
      render: (_, record) => (
        <InputNumber
          min={1}
          max={record.stock || 1000}
          value={record.quantity}
          onChange={(value) => handleQuantityChange(record.key, value)}
          style={{ width: "100%" }}
        />
      ),
      align: "center",
    },
    {
      title: "Item Discount",
      key: "discount",
      width: 200,
      render: (_, record) => {
        const maxDiscount = record.price * record.quantity;
        return (
          <div style={{ display: "flex", gap: 8 }}>
            <InputNumber
              min={0}
              max={maxDiscount}
              value={record.discountAmount || 0}
              onChange={(value) =>
                handleItemDiscountChange(record.key, value, "amount")
              }
              formatter={currencyFormatter}
              parser={(value) =>
                parseFloat(value.replace(/\$\s?|(,*)/g, ""))
              }
              style={{ width: "60%" }}
            />
            <InputNumber
              min={0}
              max={100}
              value={record.discountPercent || 0}
              onChange={(value) =>
                handleItemDiscountChange(record.key, value, "percent")
              }
              formatter={(value) => `${value}%`}
              parser={(value) => parseFloat(value.replace("%", ""))}
              style={{ width: "40%" }}
            />
          </div>
        );
      },
      align: "right",
    },
    {
      title: "Total",
      key: "total",
      width: 120,
      render: (_, record) => {
        const subtotal = record.price * record.quantity;
        const discount =
          record.discountAmount ||
          (subtotal * (record.discountPercent || 0)) / 100;
        return <Text strong>{currencyFormatter(subtotal - discount)}</Text>;
      },
      align: "right",
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
      align: "center",
    },
  ];

  const tableFooter = () => (
    <div style={{ textAlign: "right", paddingRight: 10, marginRight: "65px" }}>
      <div>
        <Text strong>Subtotal: </Text>
        <Text>{currencyFormatter(totals.subtotal)}</Text>
      </div>
      <div>
        <Text strong>Item Discounts: </Text>
        <Text type="danger">-{currencyFormatter(totals.itemDiscounts)}</Text>
      </div>
      <div>
        <Text strong>Invoice Discount: </Text>
        <Text type="danger">-{currencyFormatter(totals.invoiceDiscount)}</Text>
      </div>
      <div>
        <Text strong style={{ fontSize: 16 }}>Grand Total: </Text>
        <Text strong style={{ fontSize: 18 }}>{currencyFormatter(totals.grandTotal)}</Text>
      </div>
    </div>
  );

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
          <InvoiceDiscountSection 
            invoiceDiscount={invoiceDiscount}
            setInvoiceDiscount={setInvoiceDiscount}
            onInvoiceDiscountChange={onInvoiceDiscountChange}
            maxAmount={totals.totalBeforeInvoiceDiscount}
          />
        </Col>
        <Col span={12}>
          <PaymentSection
            paymentMethod={paymentMethod}
            onPaymentMethodChange={handlePaymentMethodChange}
            creditAmount={creditAmount}
            onCreditAmountChange={handleCreditAmountChange}
            nextPaymentDate={nextPaymentDate}
            onNextPaymentDateChange={handleNextPaymentDateChange}
            maxCredit={totals.grandTotal}
          />
        </Col>
      </Row>
    </div>
  );
};

// Extracted components
const InvoiceDiscountSection = ({ invoiceDiscount, setInvoiceDiscount, onInvoiceDiscountChange, maxAmount }) => (
  <div style={{ padding: 16, backgroundColor: "#fafafa", border: "1px solid #f0f0f0", borderRadius: 4 }}>
    <Text strong style={{ display: "block", marginBottom: 8 }}>
      Invoice Discount:
    </Text>
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <InputNumber
        min={0}
        max={invoiceDiscount.type === "amount" ? maxAmount : 100}
        value={invoiceDiscount.value}
        onChange={(value) => {
          setInvoiceDiscount({ ...invoiceDiscount, value });
          onInvoiceDiscountChange(value, invoiceDiscount.type);
        }}
        style={{ width: "70%" }}
      />
      <Select
        value={invoiceDiscount.type}
        onChange={(type) => {
          setInvoiceDiscount({ ...invoiceDiscount, type });
          onInvoiceDiscountChange(invoiceDiscount.value, type);
        }}
        style={{ width: "30%" }}
      >
        <Option value="amount">$ Amount</Option>
        <Option value="percent">% Percentage</Option>
      </Select>
    </div>
  </div>
);

const PaymentSection = ({
  paymentMethod,
  onPaymentMethodChange,
  creditAmount,
  onCreditAmountChange,
  nextPaymentDate,
  onNextPaymentDateChange,
  maxCredit
}) => (
  <div style={{ padding: 16, backgroundColor: "#fafafa", border: "1px solid #f0f0f0", borderRadius: 4 }}>
    <Form layout="vertical">
      <Form.Item label="Payment Method">
        <Select value={paymentMethod} onChange={onPaymentMethodChange}>
          <Option value="cash">Cash</Option>
          <Option value="credit">Credit</Option>
          <Option value="other">Other</Option>
        </Select>
      </Form.Item>

      {paymentMethod === "credit" && (
        <>
          <Form.Item label="Credit Amount">
            <InputNumber
              min={0}
              max={maxCredit}
              value={creditAmount}
              onChange={onCreditAmountChange}
              formatter={currencyFormatter}
              parser={(value) => parseFloat(value.replace(/\$\s?|(,*)/g, ""))}
              style={{ width: "100%" }}
            />
          </Form.Item>

          <Form.Item label="Next Payment Date">
            <DatePicker
              value={nextPaymentDate ? dayjs(nextPaymentDate) : null}
              onChange={onNextPaymentDateChange}
              style={{ width: "100%" }}
            />
          </Form.Item>
        </>
      )}
    </Form>
  </div>
);

export default ProductsTable;
