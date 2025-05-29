import React from 'react';
import { Form, Divider, Spin, Row, Col, Button } from 'antd';
import { SaveOutlined, CloseOutlined } from '@ant-design/icons';
import { useProductForm } from './hooks/useProductForm';
import { ImageUploader } from './components/ImageUploader';
import { ProductBasicInfo } from './components/ProductBasicInfo';
import "./AddProduct.css";

export const ProductForm = ({ onCancel, onSubmit, isEdit = false }) => {
  const [form] = Form.useForm();
  const { 
    loading, 
    imageList, 
    setImageList,
    productData,
    generateRandomCode,
    beforeUpload,
    token
  } = useProductForm(id, isEdit);

  const handleSubmit = async (values) => {
    try {
      // Submit logic here
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const normFile = (e) => (Array.isArray(e) ? e : e?.fileList);

  return (
    <Spin spinning={loading}>
      <Form
        className="form"
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          status: "active",
          type: "medium",
        }}
      >
        <div className="form-container">
          <Row gutter={16}>
            <Col span={24}>
              <ProductBasicInfo 
                form={form}
                isEdit={isEdit}
                categories={categories}
                productGroups={productGroups}
                units={units}
                generateRandomCode={generateRandomCode}
                productData={productData}
                loading={loading}
              />
            </Col>
          </Row>

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
                  <ImageUploader 
                    imageList={imageList} 
                    setImageList={setImageList} 
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>

          <Form.Item style={{ textAlign: "right" }}>
            <Button
              type="default"
              icon={<CloseOutlined />}
              onClick={onCancel}
              style={{ marginRight: 10 }}
            >
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
              {isEdit ? "Update" : "Submit"}
            </Button>
          </Form.Item>
        </div>
      </Form>
    </Spin>
  );
};