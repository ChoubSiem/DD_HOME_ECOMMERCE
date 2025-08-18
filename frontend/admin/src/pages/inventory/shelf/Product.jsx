import React, { useState, useEffect,useMemo  } from "react";
import { Card, message, Space, Button, Spin,Dropdown, Menu } from "antd";
import { UploadOutlined, DownloadOutlined, PlusOutlined ,MenuOutlined, EditFilled } from "@ant-design/icons";
import CategoryModal from "../../../components/category/CategoryModal";
import ProductTable from "../../../components/product/ProductTable";
import ProductToolBar from "../../../components/product/ProductToolbar";
import "./Product.css";
import Cookies from "js-cookie";
import { useProductTerm } from "../../../hooks/UserProductTerm";
import { useNavigate } from "react-router-dom";
import ImportProductModal from '../../../components/product/addProduct/ImporProductModal'; 
import ProductDetailModal from '../../../components/product/ProductDetailModal';
import ProductUpdatePrice from "../../../components/product/importUpdateProductPrice";
import { useCompany } from "../../../hooks/UseCompnay";
import ImportNewStock from "../../../components/product/addProduct/importSetNewStockModal";
const ProductManagement = () => {
  const token = localStorage.getItem('token');
  const [modalVisible, setModalVisible] = useState(false);
  const [modalSetNewStock, setModalSetNewStock] = useState(false);
  const [modalUpdatePriceVisible, setModalUpdatePriceVisible] = useState(false);

  const [products, setProducts] = useState([]);
  const { handleCategories, handleProductImport,handleSetNewStock, handleProducts, handleProductDelete ,handleUpdateProductPrice,handleProductDetail} = useProductTerm();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isProductDetailVisible, setIsProductDetailVisible] = useState(false);
  const {handleWarehouseId} = useCompany();
  const [currentProducts, setCurrentProducts] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [showFilter, setShowFilter] = useState(false);
  const [categories, setCategories] = useState([]);
  const [productDetail, setProductDetail] = useState([]);
  const user = Cookies.get('user');
  const userData = JSON.parse(user);    
  const [searchTriggered, setSearchTriggered] = useState(false);

  useEffect(() => {
    const fetchProductDetail = async () => {
      if (selectedProduct && isProductDetailVisible) {
        try {
          const result = await handleProductDetail(
            userData.warehouse_id,
            selectedProduct.id,
            token
          );
          setProductDetail(result.product);
        } catch (error) {
          console.error('Failed to fetch product detail:', error);
        }
      }
    };

    fetchProductDetail();
  }, [selectedProduct, isProductDetailVisible, userData.warehouse_id, token]);

  const handleRowClick = (product) => {
    setSelectedProduct(product);
    setIsProductDetailVisible(true);
  };
  

  const handleImport = async(importedProducts) => {
    setLoading(true);
    let result = await handleProductImport(importedProducts, token);    
    console.log(result);
    
    if (result.success) {
      setProducts(importedProducts);
      setModalVisible(false); 
      message.success('Products imported successfully!');
      setLoading(false);
    }

  };

  const handleNewStock = async(importedProducts) => {
    setLoading(true);
    let result = await handleSetNewStock(importedProducts, token);    
    console.log(result);
    
    if (result.success) {
      // setProducts(importedProducts);
      fetchProducts();
      setModalVisible(false); 
      message.success('Products imported successfully!');
      setLoading(false);
    }

  };
  const handleImportPriceUpdate = async(products) => {
    setLoading(true);
    let result = await handleUpdateProductPrice(products, token);    
    if (result.success) {
      setProducts(products);
      setModalUpdatePriceVisible(false); 
      message.success('Products update successfully!');
      setLoading(false);
      location.reload();
    }

  };

  const handleCreate = () => {
    navigate('/product/add');
  };

  const handleEdit = (id) => {
    navigate(`/product/edit/${id}`);
  };

  const fetchProducts = async () => {
    setLoading(true);
    let result;
    try {      
        result = await handleProducts(token,userData.warehouse_id);                               
      if (result) {          
        setProducts(result.products); 
      } else {
        message.error("Failed to load product: No data received");
      }
    } catch (error) {
      message.error("Failed to load product");
    } finally {
      setLoading(false); 
    }
  };
  const items = [
    {
      key: 'import',
      icon: <UploadOutlined />,
      label: 'Import Product',
      onClick: () => setModalVisible(true),
    },
    {
      key:'setStock',
      icon: <UploadOutlined />,
      label: 'Import New Stock',
      onClick: () => setModalSetNewStock(true),
    },
    {
      key: 'update',
      icon: <EditFilled />,
      label: 'Update Price',
      onClick: () => setModalUpdatePriceVisible(true),
    },
    {
      key: 'export',
      icon: <DownloadOutlined />,
      label: 'Export Product',
    },
    {
      key: 'add',
      icon: <PlusOutlined />,
      label: 'Add Product',
      onClick: handleCreate,
    },
  ];

  useEffect(() => {
    fetchProducts();
    handleCategoriesData();
  }, []);
  
  const handleSave = (values) => {
    setIsModalVisible(false);
  };
  
  const handleDelete = async (productId) => {
    let result = await handleProductDelete(productId, token);
    if (result.success) {
      setProducts(products.filter((c) => c.key !== productId));
      fetchProducts(token);
      message.success("product deleted successfully");
    }
  };

  const handleCategoriesData = async () => {
    let result = await handleCategories(token);
    if (result.success) {
      setCategories(result.categories);
      setCategoryFilter("all");         
    }
  };
  const onSearch = () => {
  fetchProducts({
    name: searchTerm,
    status: statusFilter,
    category: categoryFilter,
    type: typeFilter,
  });
};


const filteredProducts = products.filter((product) => {
  const searchTermLower = searchTerm.toLowerCase();  
  const matchesSearch =
    String(product.name || "").toLowerCase().includes(searchTermLower) ||
    String(product.code || "").toLowerCase().includes(searchTermLower) ||
    String(product.barcode || "").toLowerCase().includes(searchTermLower) ||
    String(product.category_name || "").toLowerCase().includes(searchTermLower) ||
    String(product.status || "").toLowerCase().includes(searchTermLower) ||
    String(product.type_name || "").toLowerCase().includes(searchTermLower);

  const matchesStatus =
    statusFilter === "all" || product.status === statusFilter;

  const matchesCategory =
    categoryFilter === "all" ||
    String(product.category_name) === String(categoryFilter);

  const matchesType =
    typeFilter === "all" || product.type === typeFilter;

  return matchesSearch && matchesStatus && matchesCategory && matchesType;
});



  return (
    <Spin spinning={loading}>
        <Card className="product-header-card" style={{ body: { padding: "24px" },borderRadius:0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div className="product-header-content" style={{ display: 'flex', flexDirection: 'column' }}>
              <h1 style={{ color: "#52c41a", fontSize: "23px", margin: 0 }}>Product Management</h1>
              <p style={{ margin: "8px 0 0", fontSize: "14px", color: "#666" }}>
                Manage your product information
              </p>
            </div>
            <ImportProductModal
              visible={modalVisible}
              onCancel={() => setModalVisible(false)}
              onImport={handleImport}
            />
            <ImportNewStock
              visible={modalSetNewStock}
              onCancel={() => setModalSetNewStock(false)}
              OnImportNewStock={handleNewStock}
            />
            <ProductUpdatePrice
              visible={modalUpdatePriceVisible}
              onCancel={() => setModalUpdatePriceVisible(false)}
              onImport={handleImportPriceUpdate}
            />
            <Dropdown
              menu={{ 
                items, 
                style: { borderRadius: 0 } 
              }}
              trigger={['click']}
            >
              <Button 
                icon={<MenuOutlined />} 
                type="primary" 
                style={{ borderRadius: 0 }} 
              />
            </Dropdown>
          </div>
        </Card>

        {/* <Space direction="vertical" size="middle" style={{ width: "100%", marginBottom: '30px' }}> */}
          <ProductToolBar
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            categoryFilter={categoryFilter}
            setCategoryFilter={setCategoryFilter}
            typeFilter={typeFilter}
            setTypeFilter={setTypeFilter}
            showFilter={showFilter}
            setShowFilter={setShowFilter}
            categories={categories} 
            onSearch={onSearch}
          />
        {/* </Space> */}



        {selectedProduct && (
          <ProductDetailModal
            open={isProductDetailVisible}
            onCancel={() => setIsProductDetailVisible(false)}
            product={productDetail || selectedProduct} // Show detail if loaded
            onEdit={() => {
              setIsProductDetailVisible(false);
              handleEdit(selectedProduct.id || selectedProduct.key);
            }}
            onDelete={() => {
              setIsProductDetailVisible(false);
              handleDelete(selectedProduct.id || selectedProduct.key);
            }}
          />
        )}

        <ProductTable
          products={filteredProducts}
          onRowClick={handleRowClick}
          setCurrentProducts={setCurrentProducts}
          setIsModalVisible={setIsModalVisible}
          handleDelete={handleDelete}
          handleEdit={handleEdit}
        />
    </Spin>
  );
};

export default ProductManagement;