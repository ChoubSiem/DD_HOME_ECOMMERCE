import { Modal, Form, Input, InputNumber, Radio } from "antd";
import React, { useEffect, useState } from "react";

const EditItemModal = ({ visible, onCancel, onSubmit, initialValues }) => {
  const [form] = Form.useForm();
  const [discountType, setDiscountType] = useState();
  const [originalPrice, setOriginalPrice] = useState(0);
  const [finalPrice, setFinalPrice] = useState(0);
  
  useEffect(() => {
    if (visible && initialValues) {
      const price = initialValues.price || 0;
      setOriginalPrice(price);
      setFinalPrice(price);
      
      // Set discount type based on what's passed in initialValues
      const initialDiscountType = initialValues.discountType || "percentage";
      setDiscountType(initialDiscountType);

      form.setFieldsValue({
        ...initialValues,
        price,
        finalPrice: price,
        discountType: initialDiscountType,
        discount: initialValues.discount || 0,
        discountAmount: initialValues.discount || 0
      });
    }
  }, [visible, initialValues]);


  
  const calculateDiscountAmount = (value, type) => {
    if (!value || originalPrice <= 0) return 0;
    return type === "percentage" ? (originalPrice * value) / 100 : value;
  };

  const handleDiscountChange = (value, type) => {
    if (!value) value = 0;
    
    if (type === "percentage") {
      const discountAmount = calculateDiscountAmount(value, "percentage");
      const newFinalPrice = originalPrice - discountAmount;
      form.setFieldsValue({
        discountAmount,
        finalPrice: newFinalPrice,
      });
      setFinalPrice(newFinalPrice);
    } else {
      const discountAmount = value;
      const discountPercentage = originalPrice > 0 ? (discountAmount / originalPrice) * 100 : 0;
      const newFinalPrice = parseFloat((originalPrice - discountAmount).toFixed(4));
      
      form.setFieldsValue({
        discount: discountPercentage,
        finalPrice: newFinalPrice,
      });
      setFinalPrice(newFinalPrice);
    }
  };

  const handleDiscountTypeChange = (e) => {
    const newType = e.target.value;
    setDiscountType(newType);
    
    const currentValue = form.getFieldValue(newType === "percentage" ? "discount" : "discountAmount") || 0;
    handleDiscountChange(currentValue, newType);
  };

  return (
    <Modal
      title="Edit Item"
      open={visible}
      onCancel={() => {
        form.resetFields();
        onCancel();
      }}
      onOk={() => {
        form.validateFields().then((values) => {
          const discountValue = discountType === "percentage" ? values.discount : values.discountAmount;
          const discountAmount = calculateDiscountAmount(discountValue, discountType);
          
          onSubmit({
            ...values,
            discountType,
            discount: values.discount,
            discountAmount,
            finalPrice: originalPrice - discountAmount,
            originalPrice,
          });
          form.resetFields();
        }).catch((info) => {
          console.log("Validation Failed:", info);
        });
      }}
      okText="Save"
      cancelText="Cancel"
      destroyOnClose
    >
      <Form form={form} layout="vertical">
        <Form.Item label="Original Price" name="price">
          <InputNumber
            formatter={(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
            style={{ width: "100%", height: "50px" }}
            readOnly
          />
        </Form.Item>

        <Form.Item label="Discount Type" name="discountType">
          <Radio.Group onChange={handleDiscountTypeChange}>
            <Radio value="percentage">Percentage</Radio>
            <Radio value="amount">Dollar Amount</Radio>
          </Radio.Group>
        </Form.Item>

        {discountType === "percentage" ? (
          <Form.Item name="discount" label="Discount Percentage">
            <InputNumber
              min={0}
              max={100}
              formatter={(value) => `${value}%`}
              parser={(value) => value.replace("%", "")}
              style={{ width: "100%", height: "50px" }}
              onChange={(value) => handleDiscountChange(value, "percentage")}
            />
          </Form.Item>
        ) : (
          <Form.Item name="discountAmount" label="Discount Amount">
            <InputNumber
              min={0}
              max={originalPrice}
              formatter={(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
              parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
              style={{ width: "100%", height: "50px" }}
              onChange={(value) => handleDiscountChange(value, "amount")}
            />
          </Form.Item>
        )}

        <Form.Item name="finalPrice" label="Final Price">
          <InputNumber
            formatter={(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
            style={{ width: "100%", height: "50px" }}
            readOnly
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};


export default EditItemModal;
