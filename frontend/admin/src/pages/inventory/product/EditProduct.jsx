import React, { useState, useEffect } from "react";
import {
  Form,
  Input,
  InputNumber,
  Select,
  Upload,
  Button,
  Spin,
  Row,
  Col,
  Card,
  Typography,
  message,
} from "antd";
import {
  UploadOutlined,
  SaveOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import "./AddProduct.css";
import { useProductTerm } from "../../../hooks/UserProductTerm";
const { Option } = Select;
import { useNavigate, useParams } from "react-router-dom";
const { Title } = Typography;

const EditProductForm = ({ onCancel, onSubmit }) => {
  const [form] = Form.useForm();
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [imageList, setImageList] = useState([]);
  const [documentList, setDocumentList] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [productUnits, setProductUnits] = useState([]);
  const [productGroups, setProductGroups] = useState([]);
  const [units, setUnits] = useState([]);
  const { 
    handleCategories, 
    handleUnits, 
    handleProductGroups, 
    handleProductUpdate, 
    handleProductEdit,
    handleBrands 
  } = useProductTerm();  
  const token = localStorage.getItem("token");

  // Fetch all dropdown data
// In your fetchDropdownData function, ensure you handle errors:
const fetchDropdownData = async () => {
  try {
    // Initialize with null to show loading states
    setCategories(null);
    setBrands(null);
    setProductGroups(null);
    setUnits(null);

    // Fetch all data
    const [categoriesRes, brandsRes, groupsRes, unitsRes] = await Promise.all([
      handleCategories(token),
      handleBrands(token),
      handleProductGroups(token),
      handleUnits(token)
    ]);

    // Update state only if responses are successful
    if (categoriesRes?.success) setCategories(categoriesRes.categories || []);
    if (brandsRes?.success) setBrands(brandsRes.brands || []);
    if (groupsRes?.success) setProductGroups(groupsRes.groups || []);
    if (unitsRes?.success) setUnits(unitsRes.units || []);

  } catch (error) {
    message.error("Failed to load dropdown data");
    // Set empty arrays if there's an error
    setCategories([]);
    setBrands([]);
    setProductGroups([]);
    setUnits([]);
  }
};

  // Fetch product data
  const fetchProductData = async () => {
    try {
      setLoading(true);
      const productRes = await handleProductEdit(id, token); 
      console.log('Product Data:', productRes);
      
      if (productRes?.success && productRes.product) {
        const product = productRes.product;
        
        // Set product units if they exist
        if (product.product_units && product.product_units.length > 0) {
          setProductUnits(product.product_units);
        }
  
        // Prepare form values
        const formValues = {
          name: product.name,
          code: product.code,
          category_id: product.category_id,
          product_group_id: product.product_group_id,
          brand_id: product.brand_id,
          cost: product.cost,
          price: product.price,
          retail_price: product.retail_price,
          depot_price: product.depot_price,
          dealer_price: product.dealer_price,
          vip_price: product.vip_price,
          alert_qty: product.alert_qty,
          status: product.status || "active",
          description: product.description || "",
        };
  
        // Determine unit value - prioritize product_units if available
        if (product.product_units?.length > 0) {
          formValues.unit = product.product_units[0].unit_id;
        } else if (product.unit) {
          formValues.unit = product.unit;
        }
  
        console.log('Form values being set:', formValues);
        form.setFieldsValue(formValues);
  
        // Format images
        if (Array.isArray(product.product_images)) {
          const formattedImages = product.product_images.map((img, index) => ({
            uid: img.id || index,
            name: img.name || `product_image_${index}.jpg`,
            url: img.url || `http://localhost:8000/storage/product_images/${img.name}`,
            status: "done",
          }));
          setImageList(formattedImages);
        }
      } else {
        message.error("Failed to load product details");
      }
    } catch (err) {
      console.error("Error loading product:", err);
      message.error("Error loading product");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDropdownData();
    fetchProductData();
    Upload.isImageUrl = () => true;
  }, [id, token]);

  const normFile = (e) => (Array.isArray(e) ? e : e?.fileList);

  const beforeUpload = (file) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error(`${file.name} is not an image file`);
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('Image must smaller than 2MB!');
    }
    return isImage && isLt2M;
  };
  console.log(productGroups);

  const handleImageChange = ({ fileList }) => setImageList(fileList);
  const handleDocumentChange = ({ fileList }) => setDocumentList(fileList);

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      const formData = new FormData();

      Object.entries(values).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formData.append(key, value);
        }
      });

      imageList.forEach((file) => {
        if (file.originFileObj) {
          formData.append("images[]", file.originFileObj);
        } else if (file.url) {
          formData.append("existing_images[]", file.url);
        }
      });

      documentList.forEach((file) => {
        if (file.originFileObj) {
          formData.append("documents[]", file.originFileObj);
        }
      });

      console.log(formData);
      const result = await handleProductUpdate(id, formData, token);
      if (result?.success) {
        message.success(result.message || "Product updated successfully");
        onSubmit?.();
        navigate("/product");
      } else {
        message.error(result?.message || "Failed to update product");
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
              Edit Product
            </Title>
          }
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
          >
            <Card title="Basic Information" size="small" className="form-section-card">
              <Row gutter={16}>
                <Col xs={24} md={12} lg={8}>
                  <Form.Item 
                    label="Product Name" 
                    name="name" 
                    rules={[{ required: true, message: 'Please enter product name' }]}
                  >
                    <Input 
                      placeholder="Enter product name" 
                      size="large" 
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} md={12} lg={8}>
                  <Form.Item
                    label="Product Code"
                    name="code"
                    rules={[{ required: true, message: 'Please enter product code' }]}
                  >
                    <Input
                      disabled
                      placeholder="Product code"
                      size="large"
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} md={12} lg={8}>
                  <Form.Item 
                    label="Category" 
                    name="category_id"
                  >
                    <Select 
                      placeholder="Select category" 
                      size="large" 
                    >
                      {categories?.map((category) => ( // Safe navigation with ?.
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
                    <Select 
                      placeholder="Select product group" 
                      size="large" 
                    >
                      {productGroups?.map((group) => (
                        <Option key={group.id} value={group.id}>
                          {group.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} md={12} lg={8}>
                  <Form.Item label="Unit" name="unit">
                      <Select 
                        size="large"
                        optionFilterProp="children"
                        showSearch
                      >
                        {units?.map(unit => (
                          <Option 
                            key={unit.id} 
                            value={unit.id}  // Ensure this matches the type of your form value
                          >
                            {unit.name} ({unit.short_name || unit.code || unit.id})
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                </Col>
                <Col xs={24} md={12} lg={8}>
                  <Form.Item label="Brand" name="brand_id">
                    <Select 
                      placeholder="Select brand" 
                      size="large" 
                    >
                      {brands?.map((brand) => (
                        <Option key={brand.id} value={brand.id}>
                          {brand.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            <Card title="Pricing Information" size="small" className="form-section-card">
              <Row gutter={16}>
                <Col xs={24} sm={12} md={8} lg={6}>
                  <Form.Item 
                    label="Cost" 
                    name="cost" 
                    rules={[{ required: true, message: 'Please enter cost price' }]}
                  >
                    <InputNumber
                      min={0}
                      style={{ width: "100%" }}
                      formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8} lg={6}>
                  <Form.Item 
                    label="Branch Price" 
                    name="price" 
                    rules={[{ required: true, message: 'Please enter price' }]}
                  >
                    <InputNumber
                      min={0}
                      style={{ width: "100%" }}
                      formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
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
                      style={{ width: "100%" }}
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
                      style={{ width: "100%" }}
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
                      style={{ width: "100%" }}
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
                      style={{ width: "100%" }}
                      formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8} lg={6}>
                  <Form.Item 
                    label="Alert Quantity" 
                    name="alert_qty" 
                  >
                    <InputNumber
                      min={0}
                      style={{ width: "100%" }}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            <Card title="Additional Information" size="small" className="form-section-card">
              <Row gutter={16}>
                <Col xs={24} md={12} lg={8}>
                  <Form.Item label="Status" name="status">
                    <Select 
                      placeholder="Select status" 
                      size="large"
                    >
                      <Option value="active">Active</Option>
                      <Option value="inactive">Inactive</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
              
              <Form.Item label="Description" name="description">
                <Input.TextArea 
                  rows={4} 
                  placeholder="Enter product description" 
                />
              </Form.Item>
            </Card>

            <Card title="Media & Documents" size="small" className="form-section-card">
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
                      beforeUpload={beforeUpload}
                      multiple
                      accept="image/*"
                    >
                      {imageList.length >= 8 ? null : (
                        <div>
                          <UploadOutlined />
                          <div>Upload</div>
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

            <Form.Item style={{ marginTop: "24px" }}>
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Button
                    block
                    size="large"
                    type="default"
                    icon={<CloseOutlined />}
                    onClick={handleCancel}
                    danger
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
                    loading={loading}
                  >
                    Update Product
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

export default EditProductForm;