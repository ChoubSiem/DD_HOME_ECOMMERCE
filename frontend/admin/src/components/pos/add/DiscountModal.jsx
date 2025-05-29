import React, { useState, useEffect } from "react";
import { Modal, Form, Input, Button, message, Typography, Radio } from "antd";
import { PercentageOutlined } from "@ant-design/icons";
import "./DiscountModal.css";

const { Text } = Typography;

const AddDiscountModal = ({ open, onCancel, subtotal, onSubmit }) => {
  const [form] = Form.useForm();
  const [calculatedDiscount, setCalculatedDiscount] = useState(0);
  const [discountType, setDiscountType] = useState("percentage"); // 'percentage' or 'amount'

  const handleValuesChange = (changedValues, allValues) => {
    const discountValue = parseFloat(allValues.discountValue) || 0;

    let discount = 0;
    if (discountType === "percentage") {
      discount = (discountValue / 100) * (subtotal || 0);
    } else {
      discount = discountValue;
    }

    setCalculatedDiscount(discount);
  };

  const handleSubmit = (values) => {
    const discountValue = parseFloat(values.discountValue);
    let discount = 0;

    if (discountType === "percentage") {
      discount = (discountValue / 100) * (subtotal || 0);
    } else {
      discount = discountValue;
    }

    message.success("Discount applied successfully");
    form.resetFields();
    setCalculatedDiscount(0);
    setDiscountType("percentage");
    onSubmit(discount);
  };

  useEffect(() => {
    if (!open) {
      form.resetFields();
      setCalculatedDiscount(0);
      setDiscountType("percentage");
    }
  }, [open, form]);

  return (
    <Modal
      title="Apply Cart Discount"
      open={open}
      onCancel={onCancel}
      footer={null}
      width={600}
      centered
      destroyOnClose
      className="add-discount-modal"
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        onValuesChange={handleValuesChange}
        initialValues={{
          discountValue: "",
        }}
      >
        <Form.Item label="Discount Type">
          <Radio.Group
            value={discountType}
            onChange={(e) => {
              setDiscountType(e.target.value);
              form.setFieldsValue({ discountValue: "" });
              setCalculatedDiscount(0);
            }}
          >
            <Radio value="percentage">Percentage (%)</Radio>
            <Radio value="amount">Fixed Amount ($)</Radio>
          </Radio.Group>
        </Form.Item>

        <Form.Item
          label={discountType === "percentage" ? "Discount Percentage" : "Discount Amount"}
          name="discountValue"
          rules={[
            { required: true, message: "Please enter a discount value" },
            {
              validator: (_, value) => {
                const numValue = parseFloat(value);
                if (!value || isNaN(numValue) || numValue <= 0) {
                  return Promise.reject(new Error("Discount must be greater than 0"));
                }
                if (discountType === "percentage" && numValue > 100) {
                  return Promise.reject(new Error("Percentage cannot exceed 100%"));
                }
                if (discountType === "amount" && numValue > subtotal) {
                  return Promise.reject(new Error("Amount cannot exceed subtotal"));
                }
                return Promise.resolve();
              },
            },
          ]}
        >
          <Input
            prefix={discountType === "percentage" ? "%" : "$"}
            type="number"
            step="0.01"
            min="0"
            max={discountType === "percentage" ? "100" : subtotal}
            placeholder={`Enter discount ${discountType}`}
          />
        </Form.Item>

        <Form.Item label="Calculated Discount">
          <Text strong>${calculatedDiscount.toFixed(2)}</Text>
        </Form.Item>

        <Form.Item>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <Button onClick={onCancel}>Cancel</Button>
            <Button
              type="primary"
              htmlType="submit"
              icon={<PercentageOutlined />}
              style={{ backgroundColor: "#52c41a", borderColor: "#52c41a" }}
            >
              Apply Discount
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddDiscountModal;
