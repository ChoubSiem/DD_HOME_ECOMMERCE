import React, { useState } from "react";
import { Form, Input, InputNumber, Select, Button, Row, Col, Divider, Upload } from "antd";
import { SyncOutlined, PlusOutlined, DeleteOutlined, UploadOutlined, CloseOutlined, SaveOutlined } from '@ant-design/icons';

const { Option } = Select;

const AddProductForm = ({ initialValues, categories, units, loading, imageList, documentList, onCancel, handleSubmit, generateRandomCode, handleUnitChange, handleRemoveUnit, handleAddUnit, handleImageChange, handleDocumentChange, normFile, unitRows }) => {
  const [form] = Form.useForm();

  return (
    <Form
      className="form"
      form={form}
      layout="vertical"
      initialValues={
        initialValues || {
          status: "active",
          type: "medium",
          units: "pcs",
          priceGroup: "Retail",
        }
      }
    >
      <div className="form-container">
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              label="Product Name"
              name="name"
              rules={[{ required: true, message: "Please enter product name" }]}
            >
              <Input placeholder="Enter product name" style={{ height: "40px", fontSize: "16px" }} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label="Product Code"
              name="code"
              rules={[{ required: true, message: "Please enter product code" }]}
            >
              <Input
                placeholder="Enter product code"
                suffix={
                  <Button
                    type="text"
                    icon={<SyncOutlined />}
                    onClick={generateRandomCode}
                    style={{ marginRight: -8 }}
                  />
                }
                style={{ height: "40px", fontSize: "16px" }}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label="Category"
              name="category"
              rules={[{ required: true, message: "Please select category" }]}
            >
              <Select
                placeholder="Select category"
                style={{ height: "40px", fontSize: "16px" }}
                loading={loading}
              >
                {categories.map((category) => (
                  <Option key={category.id} value={category.id}>
                    {category.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              label="Product Type"
              name="type"
              rules={[{ required: true, message: "Please select product type" }]}
            >
              <Select placeholder="Select product type" style={{ height: "40px", fontSize: "16px" }}>
                <Option value="low">Low</Option>
                <Option value="medium">Medium</Option>
                <Option value="high">High</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label="Cost ($)"
              name="cost"
              rules={[{ required: true, message: "Please enter cost" }]}
            >
              <InputNumber min={0} style={{ width: "100%", height: "40px", fontSize: "16px" }} step={0.01} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label="Branch Price ($)"
              name="price"
              rules={[{ required: true, message: "Please enter branch price" }]}
            >
              <InputNumber min={0} style={{ width: "100%", height: "40px", fontSize: "16px" }} step={0.01} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              label="Alert Quantity"
              name="alertQty"
              rules={[{ required: true, message: "Please enter alert quantity" }]}
            >
              <InputNumber min={0} style={{ width: "100%", height: "40px", fontSize: "16px" }} />
            </Form.Item>
          </Col>
        </Row>
      </div>

      <Divider />

      <div className="form-container">
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item label="Discount (%)" name="discount">
              <InputNumber min={0} max={100} style={{ width: "100%", height: "40px", fontSize: "16px" }} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="Price Group" name="priceGroup">
              <Select placeholder="Select price group" style={{ width: "100%", height: "40px", fontSize: "16px" }}>
                <Option value="Retail">Retail</Option>
                <Option value="Wholesale">Wholesale</Option>
                <Option value="VIP">VIP</Option>
                <Option value="Bulk">Bulk</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label="Status"
              name="status"
              rules={[{ required: true, message: "Please select status" }]}
            >
              <Select placeholder="Select status" style={{ width: "100%", height: "40px", fontSize: "16px" }}>
                <Option value="active">Active</Option>
                <Option value="inactive">Inactive</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
      </div>

      <Divider />

      <div className="form-container">
        {unitRows.map((row, index) => (
          <Row gutter={16} key={index} align="middle" style={{ marginBottom: 8 }}>
            <Col span={8}>
              <Form.Item label={`Unit ${index + 1}`}>
                <Select
                  value={row.unit ?? null}
                  onChange={(value) => handleUnitChange(index, "unit", value)}
                  placeholder="Select unit"
                  style={{ width: "100%", height: '40px' }}
                >
                  {units.map((unit) => (
                    <Option key={unit.id} value={unit.id}>{unit.name}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Price">
                <InputNumber
                  value={row.price}
                  onChange={(value) => handleUnitChange(index, "price", value)}
                  min={0}
                  style={{ width: "100%", height: '40px' }}
                />
              </Form.Item>
            </Col>
            <Col span={8} style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
              {unitRows.length > 1 && (
                <Button
                  icon={<DeleteOutlined />}
                  danger
                  onClick={() => handleRemoveUnit(index)}
                  style={{ marginTop: 0 }}
                />
              )}
            </Col>
          </Row>
        ))}

        <Form.Item>
          <Button
            type="dashed"
            icon={<PlusOutlined />}
            onClick={handleAddUnit}
            style={{ width: "20%", height: "40px", background: "green", color: "white", fontWeight: "bold" }}
          >
            Add Unit
          </Button>
        </Form.Item>
      </div>

      <Divider />

      <div className="form-container">
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Images"
              name="images"
              valuePropName="fileList"
              getValueFromEvent={normFile}
            >
              <Upload
                action="/upload"
                listType="picture-card"
                fileList={imageList}
                onChange={handleImageChange}
              >
                <div>
                  <UploadOutlined />
                  <div>Upload</div>
                </div>
              </Upload>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Documents"
              name="documents"
              valuePropName="fileList"
              getValueFromEvent={normFile}
            >
              <Upload
                action="/upload"
                listType="text"
                fileList={documentList}
                onChange={handleDocumentChange}
              >
                <Button icon={<UploadOutlined />}>Upload Document</Button>
              </Upload>
            </Form.Item>
          </Col>
        </Row>
      </div>

      <Divider />

      <Form.Item style={{ textAlign: "right" }}>
        <Button
          type="default"
          icon={<CloseOutlined />}
          onClick={onCancel}
          style={{ marginRight: 10 }}
        >
          Cancel
        </Button>
        <Button
          type="primary"
          icon={<SaveOutlined />}
          onClick={handleSubmit}
        >
          Submit
        </Button>
      </Form.Item>
    </Form>
  );
};

export default AddProductForm;
