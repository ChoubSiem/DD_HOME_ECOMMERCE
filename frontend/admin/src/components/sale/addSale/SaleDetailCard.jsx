import React, { useEffect, useState } from "react";
import { Card, Row, Col, DatePicker, Input, Form, Select } from "antd";
import dayjs from 'dayjs';
import Cookies from "js-cookie";

const { Option } = Select;

const SaleDetailCard = ({
  reference = null,
  warehouses,
  customers, 
  setReference,
  salesperson = { name: '', id: null },
  products,
  setFilteredProducts,
  selectedCustomer,
  onToWarehouseChange
}) => {
  const now = dayjs();
  const [form] = Form.useForm();
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const userData = JSON.parse(Cookies.get("user"));
  const safeSalesperson = {
    name: salesperson?.name || '',
    id: salesperson?.id || null
  };
  

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
    selectedCustomer(value);
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
                defaultValue={now}
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={8} md={8} lg={8}>
            <Form.Item label="Reference" style={{ marginBottom: 0 }}>
              <Input
                placeholder="Enter reference number"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
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
            {!userData.warehouse_id ? (
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
              >
                <Select
                  placeholder="Select customer"
                  onChange={handleCustomerChange}
                  allowClear
                  showSearch
                  filterOption={(input, option) =>
                    (option?.children || '')
                      .toString()
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                >
                  {customers?.length ? (
                    customers.map((customer) => (
                      <Option key={customer.id} value={customer.id}>
                        {customer.username} ({customer.phone}){' '}
                        <span style={{ color: 'green' }}>({customer.group_name})</span>
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
