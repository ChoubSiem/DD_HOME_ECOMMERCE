import React, { useEffect, useState } from "react";
import { Card, Row, Col, DatePicker, Input, Form, Select } from "antd";
import dayjs from 'dayjs';
import Cookies from "js-cookie";

const { Option } = Select;

const SaleDetailCard = ({
  reference ,
  warehouses,
  customers, 
  customer,
  setReference,
  salesperson = { name: '', id: null },
  products,
  setFilteredProducts,
  onToWarehouseChange,
  date
}) => {
let now;

if (typeof date === 'string') {
  const cleanedDate = date.split('.')[0]; // remove .000000 if present
  now = dayjs(cleanedDate);
} else {
  now = dayjs(date || new Date());
}
  const [form] = Form.useForm();
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const userData = JSON.parse(Cookies.get("user"));
  const safeSalesperson = {
    name: salesperson?.name || '',
    id: salesperson?.id || null
  };
  useEffect(() => {
    if (customer?.id) {
      form.setFieldsValue({
        customer_id: customer.id
      });
    }
  }, [customer, form]);
    
  useEffect(() => {
    if (selectedWarehouse && selectedWarehouse !== "company") {
      const filtered = (products || []).filter(product =>
        product.warehouse_id === selectedWarehouse
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(products);
    }
  }, [selectedWarehouse, products, setFilteredProducts]);

  const handleWarehouseChange = (value) => {
    setSelectedWarehouse(value);
    onToWarehouseChange?.(value);
  };

  const handleCustomerChange = (value) => {
    console.log("Selected customer:", value);
  };
  

  return (
    <Card title="Sale Details" style={{ marginBottom: 20, borderRadius: 0 }}>
      <Form form={form} layout="vertical">
        <Row gutter={16} align="bottom">
          <Col xs={24} sm={8} md={8} lg={8}>
            <Form.Item label="Date & Time" style={{ marginBottom: 0 }}>
            <DatePicker
              showTime
              format="YYYY-MM-DD HH:mm:ss"
              style={{ width: '100%' }}
              value={now} 
            />
          </Form.Item>

          </Col>

          <Col xs={24} sm={8} md={8} lg={8}>
            <Form.Item label="Reference" style={{ marginBottom: 0 }}>
              <Input
                placeholder="Enter reference number"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                disabled
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={8} md={8} lg={8}>
            <Form.Item label="Salesperson" style={{ marginBottom: 0 }}>
              <Input value={safeSalesperson.name} disabled />
              <input
                type="hidden"
                name="salesperson_id"
                value={safeSalesperson.id || ''}
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={8} md={8} lg={8} style={{ marginTop: "30px" }}>
            {!userData?.warehouse_id ? (
              <Form.Item
                label="Warehouse"
                name="warehouse_id"
                rules={[{ required: true, message: 'Please select a warehouse' }]}
              >
                <Select
                  placeholder="Select warehouse"
                  onChange={handleWarehouseChange}
                  allowClear
                >
                  <Option value="company">Company</Option>
                  {warehouses?.map((warehouse) => (
                    <Option key={warehouse.id} value={warehouse.id}>
                      {warehouse.warehouse_name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            ) : (
              <Form.Item
                label="Customer"
                name="customer_id"
                rules={[{ required: true, message: 'Please select a customer' }]}
                initialValue={customer?.id} 
              >
                <Select
                  placeholder="Select customer"
                  onChange={handleCustomerChange}
                  allowClear
                  value={customer?.id ?? undefined} 
                >
                  {customers?.length ? (
                    customers.map((c) => (
                      <Option key={c.id} value={c.id}>
                        {c.username} ({c.phone})
                      </Option>
                    ))
                  ) : (
                    <Option disabled>No customers available</Option>
                  )}
                </Select>
              </Form.Item>
            )}
          </Col>
        </Row>
      </Form>
    </Card>
  );
};

export default SaleDetailCard;
