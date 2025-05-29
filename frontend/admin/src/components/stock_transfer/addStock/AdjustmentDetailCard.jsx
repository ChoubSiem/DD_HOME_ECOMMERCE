import React ,{ useEffect, useState } from "react";
import { Card, Row, Col, DatePicker, Input, Form, Select } from "antd";
import dayjs from 'dayjs';

const { Option } = Select;

const AdjustmentDetailsCard = ({ 
  reference = null, 
  warehouses,
  setReference, 
  adjuster = { name: '', id: null },
  products, 
  setFilteredProducts,
  onFromWarehouseChange, // New prop for from_warehouse_id changes
  onToWarehouseChange    // New prop for to_warehouse_id changes
}) => {
  const now = dayjs();
  const [form] = Form.useForm();
  const [fromWarehouse, setFromWarehouse] = useState(null);
  const [toWarehouse, setToWarehouse] = useState(null);

  const safeAdjuster = {
    name: adjuster?.name || '',
    id: adjuster?.id || null
  };  

  // Update filtered products based on warehouse selection
  useEffect(() => {
    if (fromWarehouse && fromWarehouse !== "company") {
      const filtered = (products || []).filter(product => 
        product.warehouse_id === fromWarehouse
      );
      setFilteredProducts(filtered);
    } else if (toWarehouse && toWarehouse !== "company") {
      const filtered = (products || []).filter(product => 
        product.warehouse_id === toWarehouse
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(products);
    }
  }, [fromWarehouse, toWarehouse, products, setFilteredProducts]);

  const handleFromWarehouseChange = (value) => {
    setFromWarehouse(value);
    if (value === toWarehouse) {
      form.setFieldsValue({ to_warehouse_id: undefined });
      setToWarehouse(null);
      onToWarehouseChange?.(null); // Notify parent of to_warehouse_id change
    }
    onFromWarehouseChange?.(value); // Notify parent of from_warehouse_id change
  };

  const handleToWarehouseChange = (value) => {
    setToWarehouse(value);
    if (value === fromWarehouse) {
      form.setFieldsValue({ from_warehouse_id: undefined });
      setFromWarehouse(null);
      onFromWarehouseChange?.(null); // Notify parent of from_warehouse_id change
    }
    onToWarehouseChange?.(value); // Notify parent of to_warehouse_id change
  };

  return (
    <Card title="Stock Details" style={{ marginBottom: 20, borderRadius: 0 }}>
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
            <Form.Item label="Transfer User" style={{ marginBottom: 0 }}>
              <Input
                value={safeAdjuster.name}
                disabled
              />
              <input 
                type="hidden" 
                name="adjuster_id" 
                value={safeAdjuster.id || ''} 
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={8} md={8} lg={8} style={{ marginTop: "30px" }}>
            <Form.Item
              label="From (Location)"
              name="from_warehouse_id"
              rules={[{ required: true, message: 'Please select a warehouse' }]}
            >
              <Select 
                placeholder="Select source warehouse"
                onChange={handleFromWarehouseChange}
                allowClear
              >
                <Option value="company">Company</Option>
                {warehouses?.map(warehouse => (
                  <Option key={warehouse.id} value={warehouse.id}>
                    {warehouse.warehouse_name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          <Col xs={24} sm={8} md={8} lg={8}>
            <Form.Item
              label="To (Location)"
              name="to_warehouse_id"
              rules={[{ required: true, message: 'Please select a warehouse' }]}
            >
              <Select 
                placeholder="Select destination warehouse"
                onChange={handleToWarehouseChange}
                allowClear
              >
                <Option value="company">Company</Option>
                {warehouses?.map(warehouse => (
                  <Option key={warehouse.id} value={warehouse.id}>
                    {warehouse.warehouse_name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Card>
  );
};

export default AdjustmentDetailsCard;