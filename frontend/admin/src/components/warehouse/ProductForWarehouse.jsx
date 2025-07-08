import React, { useState, useEffect } from 'react';
import { Form, Button, Tag, Space, Checkbox, Spin, Row, Col, Divider, message } from 'antd';
import { SaveOutlined, CloseOutlined, CheckOutlined, ShoppingOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { useProductTerm } from '../../hooks/UserProductTerm';

const WarehouseProductSelection = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [currentWarehouseProducts, setCurrentWarehouseProducts] = useState([]);
  const [checkAll, setCheckAll] = useState(false);
  const token = localStorage.getItem('token');
  const [form] = Form.useForm();
  const { handleProducts, handleSelectWarehouseProduct, handleWarehouseProducts } = useProductTerm();

  const fetchAllProducts = async () => {
    try {
      let result = await handleProducts(token , null);      
      setProducts(result.products || []);
    } catch (error) {
      message.error('Failed to fetch products');
      console.error('Fetch products error:', error);
    }
  };

  const fetchWarehouseProducts = async () => {
    try {
      setLoading(true);
      const response = await handleWarehouseProducts(id, token);
      const productsData = response.products || response.data?.products || response.data || response || [];

      const formattedProducts = productsData.map((product) => ({
        id: product.product_id ?? product.id,
        name: product.name ?? product.product_name ?? 'Unknown Product',
        code: product.code ?? product.barcode ?? product.sku ?? 'N/A',
        images: product.images ?? product.product_images ?? '',
      }));

      setCurrentWarehouseProducts(formattedProducts);
      const initialSelected = formattedProducts.map((p) => p.id);
      setSelectedProducts(initialSelected);
      setCheckAll(initialSelected.length > 0 && initialSelected.length === products.length);
      form.setFieldsValue({ selectedProducts: initialSelected });
    } catch (error) {
      console.error('Fetch warehouse products error:', error);
      console.error('Error response:', error.response);
      message.error(error.response?.data?.message || 'Failed to fetch warehouse products');
      setCurrentWarehouseProducts([]);
      setSelectedProducts([]);
      setCheckAll(false);
      form.setFieldsValue({ selectedProducts: [] });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id && token) {
      fetchAllProducts();
      fetchWarehouseProducts();
    }
  }, [id, token]);

  const handleProductToggle = (productId) => {
    setSelectedProducts((prev) => {
      const newSelectedProducts = prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId];
      setCheckAll(newSelectedProducts.length === products.length);
      form.setFieldsValue({ selectedProducts: newSelectedProducts }); 
      return newSelectedProducts;
    });
  };

  const handleCheckAll = (e) => {
    const checked = e.target.checked;
    setCheckAll(checked);
    const newSelectedProducts = checked ? products.map((product) => product.id) : [];
    setSelectedProducts(newSelectedProducts);
    form.setFieldsValue({ selectedProducts: newSelectedProducts });
  };

  const saveHandler = async () => {
    try {
      const initialProductIds = currentWarehouseProducts.map((p) => p.id);
      const hasChanged =
        selectedProducts.length !== initialProductIds.length ||
        !selectedProducts.every((id) => initialProductIds.includes(id));

      if (!hasChanged) {
        message.warning('No changes detected');
        return;
      }

      setLoading(true);

      const values = {
        warehouse_id: id,
        product_ids: selectedProducts,
      };
      const result = await handleSelectWarehouseProduct(values, token);

      if (result.existing_products) {
        message.warning(
          `These products already exist: ${result.existing_products.join(', ')}`
        );
        return;
      }

      if (!result.success) {
        throw new Error(result.message || 'Failed to update products');
      }

      message.success(result.message || 'Products updated successfully');
      await fetchWarehouseProducts();
      navigate('/warehouse');
    } catch (error) {
      console.error('Save error:', error);
      message.error(error.response?.data?.message || error.message || 'Failed to update products');
      await fetchWarehouseProducts();
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/warehouse');
  };

  return (
    <Spin spinning={loading} size="large">
      <div style={{ width: '100%', border: 'none', padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
          <div
            style={{
              width: 40,
              height: 40,
              backgroundColor: '#f6ffed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 16,
            }}
          >
            <ShoppingOutlined style={{ fontSize: 50, color: '#52c41a', background: 'none' }} />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 600, color: '#52c41a' }}>
              Manage Warehouse Products
            </h2>
            <p style={{ margin: 0, color: '#8c8c8c', fontSize: 12 }}>
              Select products available in this warehouse
            </p>
          </div>
        </div>

        <Form form={form} layout="vertical">
          <div
            style={{
              padding: 24,
              marginBottom: 24,
              backgroundColor: '#fff',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
            }}
          >
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, color: '#262626' }}>
              Available Products
            </h3>
            <p style={{ color: '#8c8c8c', marginBottom: 24, fontSize: 13 }}>
              Select the products you want to assign to this warehouse
            </p>

            <div style={{ marginBottom: 16 }}>
              <Checkbox
                onChange={handleCheckAll}
                checked={checkAll}
                indeterminate={selectedProducts.length > 0 && selectedProducts.length < products.length}
              >
                Select All Products
              </Checkbox>
            </div>

            <Form.Item name="selectedProducts">
              <Row gutter={[16, 16]}>
                {products.map((product) => (
                  <Col xs={24} sm={12} md={8} lg={6} key={product.id}>
                    <Checkbox
                      value={product.id}
                      checked={selectedProducts.includes(product.id)}
                      onChange={() => handleProductToggle(product.id)}
                      style={{ display: 'flex', alignItems: 'center', height: '100%' }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          padding: '8px 12px',
                          backgroundColor: '#fafafa',
                          width: '100%',
                          border: '1px solid #f0f0f0',
                          borderRadius: 4,
                        }}
                      >
                        <CheckOutlined
                          style={{
                            color: selectedProducts.includes(product.id) ? '#52c41a' : 'transparent',
                            marginRight: 8,
                            fontSize: 12,
                          }}
                        />
                        <img
                          src={
                            product.images && product.images[0]
                              ? `http://localhost:8000/storage/product_images/${product.images[0]}`
                              : 'https://www.shutterstock.com/image-vector/default-ui-image-placeholder-wireframes-600nw-1037719192.jpg'
                          }
                          alt={product.name}
                          style={{
                            width: 40,
                            height: 40,
                            objectFit: 'cover',
                            marginRight: 12,
                            borderRadius: 4,
                            backgroundColor: '#f0f0f0',
                          }}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src =
                              'https://www.shutterstock.com/image-vector/default-ui-image-placeholder-wireframes-600nw-1037719192.jpg';
                          }}
                        />
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 500, color: '#595959' }}>{product.name}</div>
                          <div style={{ fontSize: 12, color: '#8c8c8c' }}>
                            Code: {product.code || product.sku || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </Checkbox>
                  </Col>
                ))}
              </Row>
            </Form.Item>
          </div>

          <Divider />

          <div
            style={{
              marginTop: 24,
              paddingTop: 24,
              borderTop: '1px solid #f0f0f0',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 16,
            }}
          >
            <Button
              onClick={handleCancel}
              size="large"
              style={{
                padding: '0 20px',
                height: 40,
                fontWeight: 500,
                borderColor: '#d9d9d9',
              }}
            >
              Cancel
            </Button>
            <Button
              type="primary"
              onClick={saveHandler}
              size="large"
              style={{
                padding: '0 20px',
                height: 40,
                fontWeight: 500,
              }}
              icon={<SaveOutlined />}
              loading={loading}
            >
              Save Products
            </Button>
          </div>
        </Form>
      </div>
    </Spin>
  );
};

export default WarehouseProductSelection;