import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Modal, Input, Button, Table, InputNumber, Spin, Tag, Space } from 'antd';
import { FiSearch, FiShoppingCart, FiX } from 'react-icons/fi';
import './ProductSearchModal.css';
import Cookies from "js-cookie";
import { useProductTerm } from '../../../hooks/UserProductTerm';
import { debounce } from 'lodash';

const ProductSearchModal = ({
  visible,
  onCancel,
  onConfirm,
  tempSelectedProducts,
  setTempSelectedProducts,
  searchTerm,
  setSearchTerm,
  selectedCategory,
}) => {
  const { handleProducts } = useProductTerm();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [displayCount, setDisplayCount] = useState(20); 
  const [isSearching, setIsSearching] = useState(false);
  const token = localStorage.getItem('token');
  const userData = JSON.parse(Cookies.get('user') || {});

  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  
  const debouncedSearch = useCallback(
    debounce((term) => {
      setDebouncedSearchTerm(term);
      setIsSearching(!!term);
      setDisplayCount(20);
    }, 300),
    []
  );

  useEffect(() => {
    if (visible) {
      fetchProducts();
      setDisplayCount(20);
    }
  }, [visible]);

  useEffect(() => {
    if (searchTerm) {
      debouncedSearch(searchTerm);
    } else {
      setDebouncedSearchTerm('');
      setIsSearching(false);
    }
    return () => debouncedSearch.cancel();
  }, [searchTerm, debouncedSearch]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const result = await handleProducts(token, userData.warehouse_id);
      if (result?.success) {
        setProducts(result.products || []);
      }
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const allFilteredProducts = useMemo(() => {
    if (!debouncedSearchTerm && !selectedCategory) {
      return products;
    }
    
    const term = debouncedSearchTerm.toLowerCase();
    return products.filter(product => {
      const nameMatch = product.name?.toLowerCase().includes(term);
      const codeMatch = product.code?.toLowerCase().includes(term);
      const categoryMatch = selectedCategory ? product.category_name === selectedCategory : true;
      return (nameMatch || codeMatch) && categoryMatch;
    });
  }, [products, debouncedSearchTerm, selectedCategory]);

  const displayedProducts = useMemo(() => {
    return allFilteredProducts.slice(0, displayCount);
  }, [allFilteredProducts, displayCount]);

  const hasMoreProducts = displayCount < allFilteredProducts.length;

  const loadMoreProducts = () => {
    setDisplayCount(prev => prev + 20); // Load more items at once
  };

  const toggleProductSelection = useCallback((product) => {
    setTempSelectedProducts(prev => {
      const existingIndex = prev.findIndex(p => p.id === product.id);
      return existingIndex >= 0 
        ? prev.filter(p => p.id !== product.id)
        : [...prev, {...product, quantity: 1}];
    });
  }, []);

  const updateTempQuantity = useCallback((productId, newQuantity) => {
    setTempSelectedProducts(prev =>
      prev.map(item =>
        item.id === productId ? { ...item, quantity: Math.max(1, newQuantity) } : item
      )
    );
  }, []);

  const ProductCard = React.memo(({ product, isSelected, onClick }) => {
    return (
      <div 
        className={`product-card ${isSelected ? 'selected' : ''}`}
        onClick={onClick}
      >
        <div className="product-info">
          <div className="product-header">
            <h4 className="product-name">{product.name}</h4>
            <span className="product-code">{product.code}</span>
          </div>
          
          <div className="price-grid">
            <div className="price-item">
              <span className="price-label">Retail:</span>
              <span className="price-value retail">${product.retail_price?.toFixed(2)}</span>
            </div>
            <div className="price-item">
              <span className="price-label">VIP:</span>
              <span className="price-value vip">${product.vip_price?.toFixed(2)}</span>
            </div>
            <div className="stock-item">
              <span className={`stock-value ${product.stock <= 0 ? 'out-of-stock' : 'in-stock'}`}>
                {product.stock <= 0 ? 'Out of stock' : `${product.stock} available`}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  });

  const tableColumns = [
    { 
      title: 'Product', 
      dataIndex: 'name', 
      key: 'name',
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{text}</div>
          <div style={{ fontSize: 12, color: '#666' }}>{record.code}</div>
        </div>
      )
    },
    { 
      title: 'Price', 
      key: 'price',
      render: (_, record) => (
        <Space>
          <span style={{ color: '#1890ff' }}>${record.retail_price?.toFixed(2)}</span>
        </Space>
      )
    },
    { 
      title: 'VIP', 
      key: 'vip_price',
      render: (_, record) => (
        <Space>
          <span style={{ color: '#1890ff' }}>${record.vip_price?.toFixed(2)}</span>
        </Space>
      )
    },
    { 
      title: 'Dealer', 
      key: 'dealer_price',
      render: (_, record) => (
        <Space>
          <span style={{ color: '#1890ff' }}>${record.dealer_price?.toFixed(2)}</span>
        </Space>
      )
    },
    { 
      title: 'Qty', 
      key: 'quantity',
      render: (_, record) => (
        <InputNumber 
          min={1}
          value={record.quantity}
          onChange={(value) => updateTempQuantity(record.id, value)}
          style={{ width: 50 }}
        />
      )
    },
    {
      title: '',
      key: 'action',
      render: (_, record) => (
        <Button 
          type="text" 
          danger 
          icon={<FiX />}
          onClick={(e) => {
            e.stopPropagation();
            toggleProductSelection(record);
          }}
        />
      )
    }
  ];


  return (
    <Modal
      title={
        <div className="modal-header">
          <span>Search Products</span>
          <div className="search-count">
            {isSearching ? (
              <span>Showing {displayedProducts.length} of {allFilteredProducts.length} results</span>
            ) : (
              <span>{products.length} products available</span>
            )}
          </div>
        </div>
      }
      open={visible}
      onCancel={onCancel}
      width="95%"
      style={{ top: 20, maxWidth: '1500px' }}
      footer={[
        <Button key="back" onClick={onCancel}>
          Cancel
        </Button>,
        <Button 
          key="submit" 
          type="primary" 
          onClick={() => {
            onConfirm(tempSelectedProducts);   // Call the parent handler
            setTempSelectedProducts([]);       // Clear the selection
          }}
          disabled={tempSelectedProducts.length === 0}
          className="confirm-button"
        >
          Confirm
        </Button>

      ]}
      className="product-search-modal"
    >
      <div className="product-search-container">
        <div className="search-section">
          <Input
            placeholder="Search by name or code..."
            prefix={<FiSearch />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            allowClear
            className="search-input"
            size="large"
          />
        </div>

        {loading ? (
          <div className="loading-container">
            <Spin size="large" />
          </div>
        ) : (
          <div className="content-container">
            <div className="product-grid-section">
              <div className="product-grid">
                {displayedProducts.map(product => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    isSelected={tempSelectedProducts.some(p => p.id === product.id)}
                    onClick={() => toggleProductSelection(product)}
                  />
                ))}
              </div>
              
              {hasMoreProducts && (
                <div className="load-more-container">
                  <Button 
                    type="dashed" 
                    onClick={loadMoreProducts}
                    block
                  >
                    Load More ({allFilteredProducts.length - displayCount} remaining)
                  </Button>
                </div>
              )}
            </div>

            <div className="selected-products-section">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ margin: 0 }}>Selected Products</h3>
                <Tag color="blue">{tempSelectedProducts.length} selected</Tag>
              </div>
              
              {tempSelectedProducts.length > 0 ? (
                <Table
                  dataSource={tempSelectedProducts}
                  columns={tableColumns}
                  rowKey="id"
                  pagination={false}
                  bordered={false}
                  // showHeader={false} 
                  components={{
                    table: (props) => <table {...props} />,
                    header: {
                      wrapper: (props) => <thead {...props} />,
                      cell: (props) => <th {...props} style={{ 
                        padding: 8,
                        fontWeight: 'normal',
                        textAlign: 'left'
                      }} />
                    },
                    body: {
                      wrapper: (props) => <tbody {...props} />,
                      cell: (props) => <td {...props} style={{ 
                        padding: 8,
                        border: '1px solid #ddd'
                      }} />
                    }
                  }}
                  style={{
                    width: '100%',
                    borderCollapse: 'collapse'
                  }}
                />
              ) : (
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  height: 200,
                  color: '#999'
                }}>
                  <FiShoppingCart size={48} style={{ marginBottom: 16, color: '#d9d9d9' }} />
                  <p style={{ marginBottom: 4 }}>No products selected yet</p>
                  <p style={{ fontSize: 12 }}>Click on products to add them</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default React.memo(ProductSearchModal);