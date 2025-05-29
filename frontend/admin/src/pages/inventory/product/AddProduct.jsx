import React, { useState, useEffect } from "react";
import {
  Form,
  Input,
  InputNumber,
  Select,
  Upload,
  Button,
  Divider,
  message,
  Spin,
  Row,
  Col,
  Card,
  Typography,
} from "antd";
import {
  UploadOutlined,
  SyncOutlined,
  SaveOutlined,
  CloseOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import "./AddProduct.css";
import { useProductTerm } from "../../../hooks/UserProductTerm";
const { Option } = Select;
import { useNavigate } from "react-router-dom";
const { Title, Text } = Typography;

const ProductForm = ({ onCancel, onSubmit, initialValues }) => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [imageList, setImageList] = useState([]);
  const [documentList, setDocumentList] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [productGroups, setProductGroups] = useState([]);
  const [units, setUnits] = useState([]);
  const { handleCategories, handleUnits, handleProductGroups, handleProductCreate, handleBrands } =
    useProductTerm();
  const token = localStorage.getItem("token");

  // Data fetching functions
  const fetchData = async () => {
    try {
      setLoading(true);
      const [categoriesRes, groupsRes, unitsRes, brandsRes] = await Promise.all([
        handleCategories(token),
        handleProductGroups(token),
        handleUnits(token),
        handleBrands(token),
      ]);
      
      setCategories(categoriesRes.categories || []);
      setProductGroups(groupsRes.groups || []);
      setUnits(unitsRes.units || []);
      setBrands(brandsRes.brands || []);
    } catch (error) {
      message.error("Failed to load form data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  const normFile = (e) => (Array.isArray(e) ? e : e?.fileList);

  const handleImageChange = ({ fileList }) => setImageList(fileList);
  const handleDocumentChange = ({ fileList }) => setDocumentList(fileList);

  const generateRandomCode = () => {
    const chars = "0123456789";
    let result = "";
    for (let i = 0; i < 10; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    form.setFieldsValue({ code: result });
  };

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      const formData = new FormData();
      
      Object.entries(values).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formData.append(key, typeof value === "object" ? JSON.stringify(value) : value);
        }
      });
      
      imageList.forEach((file) => {
        if (file.originFileObj) {
          formData.append("images[]", file.originFileObj);
        }
      });
      
      const result = await handleProductCreate(formData, token);
      if (result?.success) {
        message.success(result.message || "Product created successfully");
        form.resetFields();
        onSubmit?.();
        navigate("/product");
      } else {
        message.error(result?.message || "Failed to create product");
      }
    } catch (error) {
      message.error(error?.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => navigate("/product");

  return (
    <Spin spinning={loading}>
      <div className="product-form-container">
        <Card
          title={
            <Title level={4} style={{ margin: 0 }}>
              {initialValues ? "Edit Product" : "Add New Product"}
            </Title>
          }
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={initialValues || {
              status: "active",
              type: "medium",
              priceGroup: "Retail",
            }}
          >
            {/* Basic Information Section */}
            <Card
              title="Basic Information"
              size="small"
              className="form-section-card"
            >
              <Row gutter={16}>
                <Col xs={24} md={12} lg={8}>
                  <Form.Item
                    label="Product Name"
                    name="name"
                    rules={[{ required: true, message: "Required" }]}
                  >
                    <Input placeholder="Enter product name" size="large" style={{height:"50px",border:"1px solid #52c41a",borderRadius:"10px",width:"100%"}}/>
                  </Form.Item>
                </Col>
                <Col xs={24} md={12} lg={8}>
                  <Form.Item
                    label="Product Code"
                    name="code"
                    rules={[{ required: true, message: "Required" }]}
                    tooltip={{
                      title: "Click the refresh icon to generate random code",
                      icon: <InfoCircleOutlined />,
                    }}
                  >
                    <Input
                    style={{height:"50px",border:"1px solid #52c41a",borderRadius:"10px",width:"100%"}}
                      placeholder="Enter product code"
                      size="large"
                      suffix={
                        <Button
                          type="text"
                          icon={<SyncOutlined />}
                          onClick={generateRandomCode}
                        />
                      }
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12} lg={8}>
                  <Form.Item label="Category" name="category_id">
                    <Select placeholder="Select category" size="large" loading={loading} style={{height:"50px",border:"1px solid #52c41a",borderRadius:"10px"}}>
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
                <Col xs={24} md={12} lg={8}>
                  <Form.Item label="Product Group" name="product_group_id">
                    <Select placeholder="Select product group" size="large" style={{height:"50px",border:"1px solid #52c41a",borderRadius:"10px"}}>
                      {productGroups.map((group) => (
                        <Option key={group.id} value={group.id}>
                          {group.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} md={12} lg={8}>
                  <Form.Item label="Unit" name="unit">
                    <Select placeholder="Select unit" size="large" style={{height:"50px",border:"1px solid #52c41a",borderRadius:"10px"}}>
                      {units.map((unit) => (
                        <Option key={unit.id} value={unit.id}>
                          {unit.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} md={12} lg={8}>
                  <Form.Item label="Brand" name="brand_id">
                    <Select placeholder="Select brand" size="large" loading={loading} style={{height:"50px",border:"1px solid #52c41a",borderRadius:"10px"}}>
                      {brands.map((brand) => (
                        <Option key={brand.id} value={brand.id}>
                          {brand.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            {/* Pricing Section */}
            <Card
              title="Pricing Information"
              size="small"
              className="form-section-card"
            >
              <Row gutter={16}>
                <Col xs={24} sm={12} md={8} lg={6}>
                  <Form.Item
                    label="Cost"
                    name="cost"
                    rules={[{ required: true, message: "Required" }]}
                  >
                    <InputNumber
                    
                      min={0}
                      style={{height:"50px",border:"1px solid #52c41a",borderRadius:"10px",width:"100%"}}
                      size="large"
                      formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={value => value.replace(/\$\s?|(,*)/g, '')}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8} lg={6}>
                  <Form.Item
                    label="Branch Price"
                    name="price"
                    rules={[{ required: true, message: "Required" }]}
                  >
                    <InputNumber
                    
                      min={0}
                      style={{height:"50px",border:"1px solid #52c41a",borderRadius:"10px",width:"100%"}}
                      size="large"
                      formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={value => value.replace(/\$\s?|(,*)/g, '')}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8} lg={6}>
                  <Form.Item
                    label="Depot Price"
                    name="depot_price"
                  >
                    <InputNumber
                      min={0}
                      style={{height:"50px",border:"1px solid #52c41a",borderRadius:"10px",width:"100%"}}
                      size="large"
                      formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8} lg={6}>
                  <Form.Item
                    label="Dealer Price"
                    name="dealer_price"
                  >
                    <InputNumber
                      min={0}
                      style={{height:"50px",border:"1px solid #52c41a",borderRadius:"10px",width:"100%"}}
                      size="large"
                      formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8} lg={6}>
                  <Form.Item
                    label="VIP Price"
                    name="vip_price"
                  >
                    <InputNumber
                      min={0}
                      style={{height:"50px",border:"1px solid #52c41a",borderRadius:"10px",width:"100%"}}
                      size="large"
                      formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8} lg={6}>
                  <Form.Item
                    label="Retail Price"
                    name="retail_price"
                  >
                    <InputNumber
                      min={0}
                      style={{height:"50px",border:"1px solid #52c41a",borderRadius:"10px",width:"100%"}}
                      size="large"
                      formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8} lg={6}>
                  <Form.Item
                    label="Alert Quantity"
                    name="alert_qty"
                    rules={[{ required: true, message: "Required" }]}
                  >
                    <InputNumber
                      min={0}
                      style={{height:"50px",border:"1px solid #52c41a",borderRadius:"10px",width:"100%"}}
                      size="large"
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            {/* Additional Information Section */}

            {/* Media Section */}
            <Card
              title="Media & Documents"
              size="small"
              className="form-section-card"
            >
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="Product Images"
                    name="images"
                    valuePropName="fileList"
                    getValueFromEvent={normFile}
                  >
                    <Upload
                      listType="picture-card"
                      fileList={imageList}
                      onChange={handleImageChange}
                      beforeUpload={() => false}
                      multiple
                      accept="image/*"
                    >
                      {imageList.length >= 8 ? null : (
                        <div>
                          <UploadOutlined />
                          <div>Upload (Max 8)</div>
                        </div>
                      )}
                    </Upload>
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="Documents"
                    name="documents"
                    valuePropName="fileList"
                    getValueFromEvent={normFile}
                  >
                    <Upload
                      fileList={documentList}
                      onChange={handleDocumentChange}
                      beforeUpload={() => false}
                      multiple
                    >
                      <Button icon={<UploadOutlined />} size="large">
                        Upload Documents
                      </Button>
                    </Upload>
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            {/* Form Actions */}
            {/* <div className="form-actions">
              <Button
                type="primary"
                htmlType="submit"
                icon={<SaveOutlined />}
                size="large"
                style={{ minWidth: 150 }}
                loading={loading}
              >
                {initialValues ? "Update" : "Create"} Product
              </Button>
              <Button
                icon={<CloseOutlined />}
                size="large"
                onClick={handleCancel}
                style={{ minWidth: 150, marginLeft: 16 }}
                disabled={loading}
              >
                Cancel
              </Button>
            </div> */}
            <Form.Item style={{ marginTop: "50px" }}>
                      <Row gutter={16}>
                        <Col xs={24} sm={12}>
                          <Button
                            block
                            size="large"
                            type="default"
                            icon={<CloseOutlined />}
                            onClick={handleCancel}
                            danger
                            style={{ height: 48 }}
                          >
                            Cancel
                          </Button>
                        </Col>
                        <Col xs={24} sm={12}>
                          <Button
                            block
                            size="large"
                            type="primary"
                            htmlType="submit"
                            icon={<SaveOutlined />}
                            style={{ height: 48 }}
                          >
                          Add Product
                          </Button>
                        </Col>
                      </Row>
                    </Form.Item>
          </Form>
        </Card>
      </div>
    </Spin>
  );
};

export default ProductForm;