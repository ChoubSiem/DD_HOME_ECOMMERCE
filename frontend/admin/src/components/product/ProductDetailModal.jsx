import React from 'react';
import { 
  Modal, 
  Descriptions, 
  Image, 
  Button, 
  Card, 
  Tag, 
  Divider, 
  Row, 
  Col, 
  Typography, 
  Spin,
  Empty,
  message 
} from 'antd';
import { 
  DollarOutlined, 
  TagOutlined, 
  InfoCircleOutlined, 
  AppstoreOutlined,
  CloseOutlined,
  EditOutlined,
  DeleteOutlined,
  ShoppingCartOutlined,
  NumberOutlined,
  BarcodeOutlined,
  ShopOutlined,
  UserOutlined,
  CrownOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import "./ProductDetail.css";
import Cookies from 'js-cookie';
const { Text } = Typography;

const ProductDetailModal = ({ 
  open, 
  onCancel, 
  product, 
  onEdit, 
  onDelete, 
  loading = false,
  error = null 
}) => {
  const [messageApi, contextHolder] = message.useMessage();
  const userData = JSON.parse(Cookies.get('user'));
  const getImageUrls = () => {
    if (!product?.images) return ['default.jpg'];
    
    try {
      const imageArray = typeof product.images === 'string' 
        ? product.images.split(',').map(img => img.trim())
        : Array.isArray(product.images)
        ? product.images
        : [product.images];
      
      return imageArray.length > 0 ? imageArray : ['default.jpg'];
    } catch (err) {
      console.error("Error processing images:", err);
      return ['default.jpg'];
    }
  };

  const imageUrls = getImageUrls();

const priceTypes = [
  { label: 'Retail Price', value: product?.retail_price, icon: <DollarOutlined />, color: 'green' },
  { label: 'VIP Price', value: product?.vip_price, icon: <CrownOutlined />, color: 'gold' },
  { label: 'Dealer Price', value: product?.dealer_price, icon: <UserOutlined />, color: 'geekblue' },
  { label: 'Depot Price', value: product?.depot_price, icon: <ShopOutlined />, color: 'blue' },
  { label: 'Branch Price', value: product?.price, icon: <DollarOutlined />, color: 'green', key: 'branch' },
  { label: 'Cost', value: product?.cost, icon: <BarcodeOutlined />, color: 'volcano' },
].filter(item => {
  if (userData?.warehouse_id && item.label === 'Branch Price') {
    return false; 
  }
  return true;
});


  const handleDelete = () => {
    Modal.confirm({
      title: 'Are you sure you want to delete this product?',
      icon: <ExclamationCircleOutlined />,
      content: 'This action cannot be undone.',
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk() {
        onDelete();
      },
    });
  };

  if (error) {
    messageApi.error('Failed to load product details');
    return null;
  }

  return (
    <>
      {contextHolder}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <AppstoreOutlined style={{ fontSize: 24, color: "#52c41a" }} />
            <Text strong style={{ fontSize: 20, color: "#52c41a" }}>Product Details</Text>
          </div>
        }
        open={open}
        onCancel={onCancel}
        width="60%"
        className="modern-product-modal"
        footer={null}
        centered
        destroyOnClose
      >
        {loading ? (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            height: '60vh',
            flexDirection: 'column'
          }}>
            <Spin 
              size="large" 
              tip="Loading product details..." 
              style={{ 
                fontSize: 18,
                color: '#52c41a'
              }}
            />
            <Text 
              style={{ 
                marginTop: 16,
                color: '#666',
                fontSize: 16
              }}
            >
              Please wait while we load the product information...
            </Text>
          </div>
        ) : product ? (
          <div className="product-detail-container">
            <Card 
              title={<Text strong>Product Images</Text>}
              className="image-gallery-card"
              style={{  body: { padding: 16 } }}
            >
              <div className="image-gallery">
                {imageUrls.map((imagePath, index) => (
                  <div key={index} className="gallery-item">
                    <Image
                      className='khmer-text'
                      src={`http://localhost:8000/storage/product_images/${imagePath}`}
                      alt={product.name}
                      style={{
                        width: '100%',
                        height: 180,
                        objectFit: 'cover',
                        borderRadius: 8,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                      }}
                      placeholder={
                        <div style={{
                          width: '100%',
                          height: 180,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: '#f0f0f0'
                        }}>
                          <Spin />
                        </div>
                      }
                      preview={{
                        mask: <span className="image-preview-mask">View</span>
                      }}
                    />
                  </div>
                ))}
              </div>
            </Card>

            <Divider style={{ margin: '24px 0' }} />

            <Row gutter={[24, 24]}>
              <Col xs={24} md={12}>
                <Card 
                  title={<Text strong>Basic Information</Text>}
                  className="info-card"
                  style={{  body: { padding: 16 } }}
                >
                  <Descriptions column={1} className="product-descriptions">
                    <Descriptions.Item 
                      label={
                        <span className="description-label">
                          <TagOutlined style={{ marginRight: 8 }} />
                          Name
                        </span>
                      }
                    >
                      <Text strong className="khmer-text">{product.name}</Text>

                    </Descriptions.Item>

                    <Descriptions.Item 
                      label={
                        <span className="description-label">
                          <NumberOutlined style={{ marginRight: 8 }} />
                          Product Code
                        </span>
                      }
                    >
                      <Tag color="cyan">{product.code}</Tag>
                    </Descriptions.Item>

                    <Descriptions.Item 
                      label={
                        <span className="description-label">
                          <NumberOutlined style={{ marginRight: 8 }} />
                          Product Unit
                        </span>
                      }
                    >
                      <Tag color="cyan">{product.unit_code}</Tag>
                    </Descriptions.Item>

                    <Descriptions.Item 
                      label={
                        <span className="description-label">
                          <AppstoreOutlined style={{ marginRight: 8 }} />
                          Category
                        </span>
                      }
                    >
                      {product.category_name && <Tag>{product.category_name}</Tag>}
                    </Descriptions.Item>

                    <Descriptions.Item 
                      label={
                        <span className="description-label">
                          <ShoppingCartOutlined style={{ marginRight: 8 }} />
                          Stock
                        </span>
                      }
                    >
                      <Tag color={product.stock > 0 ? 'success' : 'error'}>
                        {product.stock ?? '0'} {product.unit}
                      </Tag>
                    </Descriptions.Item>

                    <Descriptions.Item 
                      label={
                        <span className="description-label">
                          <TagOutlined style={{ marginRight: 8 }} />
                          Status
                        </span>
                      }
                    >
                      <Tag color={product.status === 'active' ? 'success' : 'error'}>
                        {product.status?.toUpperCase() || 'UNKNOWN'}
                      </Tag>
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              </Col>

              <Col xs={24} md={12}>
                <Card 
                  title={<Text strong>Pricing Information</Text>}
                  className="info-card"
                  style={{  body: { padding: 16 } }}
                >
                  <Descriptions column={1} className="product-descriptions">
                    {priceTypes.map((price, index) => (
                      <Descriptions.Item 
                        key={index}
                        label={
                          <span className="description-label">
                            {price.icon}
                            <span style={{ marginLeft: 8 }}>{price.label}</span>
                          </span>
                        }
                      >
                        <Tag color={price.color} style={{ fontSize: 14 }}>
                          ${price.value ? Number(price.value).toFixed(2) : '0.00'}
                        </Tag>
                      </Descriptions.Item>
                    ))}

                    <Descriptions.Item 
                      label={
                        <span className="description-label">
                          <InfoCircleOutlined style={{ marginRight: 8 }} />
                          Alert Quantity
                        </span>
                      }
                    >
                      <Tag color="orange">{product.alert_qty || '0'} {product.unit}</Tag>
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              </Col>
            </Row>

            {product.description && (
              <>
                <Divider style={{ margin: '24px 0' }} />
                <Card 
                  title={<Text strong>Product Description</Text>}
                  className="description-card"
                >
                  <Text style={{ whiteSpace: 'pre-line' }}>{product.description}</Text>
                </Card>
              </>
            )}

            <div className="action-buttons" style={{ marginTop: 24 }}>
              <Button 
                type="default" 
                icon={<CloseOutlined />} 
                onClick={onCancel}
                style={{ 
                  borderColor: '#ff4d4f',
                  color: '#ff4d4f',
                  width: '30%'
                }}
              >
                Close
              </Button>
              <Button 
                type="primary" 
                icon={<EditOutlined />} 
                onClick={onEdit}
                style={{ 
                  backgroundColor: '#52c41a',
                  borderColor: '#52c41a',
                  width: '30%',
                  margin: '0 16px'
                }}
              >
                Edit
              </Button>
              <Button 
                danger 
                icon={<DeleteOutlined />} 
                onClick={handleDelete}
                style={{ width: '30%' }}
              >
                Delete
              </Button>
            </div>
          </div>
        ) : (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <Text type="secondary">No product data available</Text>
            }
            style={{ padding: '40px 0' }}
          />
        )}
      </Modal>
    </>
  );
};

export default ProductDetailModal;