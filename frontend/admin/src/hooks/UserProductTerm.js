import { message } from 'antd';
import { 
  fetchCategory , 
  fetchUnit,
  createCategory ,
  createUnit, 
  createProduct, 
  importProduct, 
  fetchProduct,
  deleteCategory,
  deleteUnit,
  deleteProduct,
  updateUnit,
  fetchBrand,
  createBrand,
  updateBrand,
  showBrand,
  deleteBrand,
  fetchProductGroup,
  createProductGroup,
  updateProductGroup,
  deleteProductGroup,
  showProductGroup,
  showProduct,
  updateProduct,
  selectWarehouseProduct,
  warehouseProducts,
  // uomTransfers,
  // uomTransferCreate,
  // uomTransferEdit,
  // uomTransferssUpdate,
  // uomTransfersDelete,
  uomConversions,
  uomConversionCreate,
  uomConversionEdit,
  uomConversionDelete,
  uomConversionUpdate,
  updatePriceByCode,
  updateCategory,
  getProductDetail,
  setNewStock
} from '../services/productTermService';

export const useProductTerm = () => {
  const handleCategories = async (token) => {
    try {
      const cateogryData = await fetchCategory(token);                        
      return {
        success: true,
        categories: cateogryData.categories,     
        message: cateogryData.message  
      };
      
    } catch (error) {
      
    }
  };

  const handleCategoryCreate = async (values,token) => {
    try {
      const cateogryData = await createCategory(values,token);      
                        
      return {
        success: true,
        categories: cateogryData.categories,     
        message: cateogryData.message  
      };
      
    } catch (error) {
      
    }
  };
  const handleCategoryUpdate = async (cateId, values,token) => {
    try {
      const cateogryData = await updateCategory(cateId,values,token);      
                        
      return {
        success: true,
        categories: cateogryData.categories,     
        message: cateogryData.message  
      };
      
    } catch (error) {
      
    }
  };

  const handleCategoryDelete = async (id, token) => {
    try {      
      const response = await deleteCategory(id, token); // call your API  
      return {
        success: true,
        message: response.message,
      };
    } catch (error) {
      console.error('Delete error:', error);
  
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to delete category',
      };
    }
  };

  const handleUnitDelete = async (id, token) => {
    try {      
      const response = await deleteUnit(id, token); // call your API  
      
      return {
        success: true,
        message: response.message,
      };
    } catch (error) {
      console.error('Delete error:', error);
  
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to delete unit',
      };
    }
  };
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  const handleRegional = async (token) => {
    try {
      const regionalData = await fetchRegional(token);
      return {
        success: true,
        data: regionalData.regionals,     
        message: regionalData.message  
      };
      
    } catch (error) {
      
    }
  };
  
  const handleWarehouse = async (token) => {
    try {
      const warehouseData = await fetchWarehouse(token);            
      return {
        success: true,
        data: warehouseData.warehouses,     
        message: warehouseData.message  
      };
      
    } catch (error) {
      
    }
  };
  
  const handleUnits = async (token) => {
    try {
      const unitData = await fetchUnit(token);            
      return {
        success: true,
        units: unitData.units,     
        message: unitData.message  
      };
      
    } catch (error) {
      
    }
  };
  const handleUnitUpdate = async (values,token,id) => {
    try {
      const unitData = await updateUnit(id , values , token);            
      return {
        success: true,
        unit: unitData.unit,     
        message: unitData.message  
      };
      
    } catch (error) {
      
    }
  };
  
  const handleUnitCreate = async (values,token) => {
    try {
      const unitData = await createUnit(values,token);      
      return {
        success: true,
        unit: unitData.unit,     
        message: unitData.message  
      };
      
    } catch (error) {
      
    }
  };
  

    const handleProducts = async (token , warehouseId) => {
      try {
        const productData = await fetchProduct(token , warehouseId);                        
        return {
          success: true,
          products: productData.products,     
          message: productData.message  
        };
        
      } catch (error) {
        
      }
    };
  const handleProductEdit = async (productId , token) => {
    try {
      const productData = await showProduct(productId,token);                        
      return {
        success: true,
        product: productData.product,     
        message: productData.message  
      };
      
    } catch (error) {
      
    }
  };

  const handleProductUpdate = async (productId, values, token) => {
    try {
      const productData = await updateProduct(productId, values, token);                        
      return {
        success: true,
        product: productData.product,     
        message: productData.message  
      };
    } catch (error) {
      return {
        success: false,
        message: error?.response?.data?.message || "An error occurred during update"
      };
    }
  };
  
  
  
  
  const handleProductCreate = async (values,token) => {
    try {
      const productData = await createProduct(values,token);      
      return {
        success: true,
        products: productData.products,     
        message: productData.message  
      };
      
    } catch (error) {
      
    }
  };
  const handleProductImport = async (values,token) => {
    try {
      const productData = await importProduct(values,token);      
      return {
        success: true,
        products: productData.products,     
        message: productData.message  
      };
      
    } catch (error) {
      
    }
  };
  const handleSetNewStock = async (values,token) => {
    try {
      const productData = await setNewStock(values,token);      
      return {
        success: true,
        products: productData.products,     
        message: productData.message  
      };
      
    } catch (error) {
      
    }
  };

  const handleProductDelete = async (id, token) => {
    try {      
      const response = await deleteProduct(id, token); 
      
      return {
        success: true,
        message: response.message,
      };
    } catch (error) {
      console.error('Delete error:', error);
  
      return {
        success: false,
        message: error.response?.message || 'Failed to delete product',
      };
    }
  };

  // brand =======================================================================
  const handleBrands = async (token) => {
    try {
      const productData = await fetchBrand(token);                        
      return {
        success: true,
        brands: productData.brands,     
        message: productData.message  
      };
      
    } catch (error) {
      
    }
  };
  
  
  
  const handleBrandCreate = async (values,token) => {
    try {
      const productData = await createBrand(values,token);      
      return {
        success: true,
        brand: productData.brand,     
        message: productData.message  
      };
      
    } catch (error) {
      
    }
  };
  const handleBrandUpdate = async (brandId,values,token) => {
    try {
      const productData = await updateBrand(brandId,values,token);      
      return {
        success: true,
        brand: productData.brand,     
        message: productData.message  
      };
      
    } catch (error) {
      
    }
  };

  const handleBrandDelete = async (id, token) => {
    try {      
      const response = await deleteBrand(id, token); 
      
      return {
        success: true,
        message: response.message,
      };
    } catch (error) {
      console.error('Delete error:', error);
  
      return {
        success: false,
        message: error.response?.message || 'Failed to delete product',
      };
    }
  };

  // product group 

  const handleProductGroups = async (token) => {
    try {
      const productData = await fetchProductGroup(token);                                 
      return {
        success: true,
        groups: productData.groups,     
        message: productData.message  
      };
      
    } catch (error) {
      console.error('Fetch product groups error:', error);
      return {
        success: false,
        message: error.response?.message || 'Failed to fetch product groups',
      };
    }
  };
  
  const handleProductGroupCreate = async (values, token) => {
    try {
      const productData = await createProductGroup(values, token);      
      return {
        success: true,
        group: productData.group,     
        message: productData.message  
      };
      
    } catch (error) {
      console.error('Create product group error:', error);
      return {
        success: false,
        message: error.response?.message || 'Failed to create product group',
      };
    }
  };
  
  const handleProductGroupUpdate = async (groupId, values, token) => {
    try {
      const productData = await updateProductGroup(groupId, values, token);      
      return {
        success: true,
        group: productData.group,     
        message: productData.message  
      };
      
    } catch (error) {
      console.error('Update product group error:', error);
      return {
        success: false,
        message: error.response?.message || 'Failed to update product group',
      };
    }
  };
  
  const handleProductGroupDelete = async (id, token) => {
    try {      
      const response = await deleteProductGroup(id, token); 
      
      return {
        success: true,
        message: response.message,
      };
    } catch (error) {
      console.error('Delete product group error:', error);
  
      return {
        success: false,
        message: error.response?.message || 'Failed to delete product group',
      };
    }
  };
  
  const handleSelectWarehouseProduct = async (values, token) => {
    try {
      const productData = await selectWarehouseProduct(values, token);      
      return {
        success: true,
        products  : productData.products,     
        message: productData.message  
      };
      
    } catch (error) {
      console.error('Create product group error:', error);
      return {
        success: false,
        message: error.response?.message || 'Failed to create product group',
      };
    }
  };

  const handleWarehouseProducts = async (warehouseId, token) => {
    try {
      const productData = await warehouseProducts(warehouseId, token);      
      return {
        success: true,
        products  : productData.products,     
        message: productData.message  
      };
      
    } catch (error) {
      console.error('Create product group error:', error);
      return {
        success: false,
        message: error.response?.message || 'Failed to create product group',
      };
    }
  };


  const handleUomConversions = async (token) => {
    try {
      const uomData = await uomConversions(token);            
      return {
        success: true,
        uoms  : uomData.uoms,     
        message: uomData.message  
      };
      
    } catch (error) {
      console.error('Create product group error:', error);
      return {
        success: false,
        message: error.response?.message || 'Failed to create product group',
      };
    }
  };
  const handleUomConversionsCreate = async (values,token) => {
    try {
      const uomData = await uomConversionCreate(values,token);      
      return {
        success: true,
        uom  : uomData.uom,     
        message: uomData.message  
      };
      
    } catch (error) {
      console.error('Create product group error:', error);
      return {
        success: false,
        message: error.response?.message || 'Failed to create product group',
      };
    }
  };
  
  const handleUomConversionsEdit = async (uomId,token) => {
    try {
      const uomData = await uomConversionEdit(uomId,token);      
      return {
        success: true,
        uom  : uomData.uom,     
        message: uomData.message  
      };
      
    } catch (error) {
      console.error('Create product group error:', error);
      return {
        success: false,
        message: error.response?.message || 'Failed to create product group',
      };
    }
  };

  const handleUomConversionsUpdate = async (uomId,values,token) => {
    try {
      const uomData = await uomConversionUpdate(uomId,values,token);      
      return {
        success: true,
        uom  : uomData.uom,     
        message: uomData.message  
      };
      
    } catch (error) {
      console.error('Create product group error:', error);
      return {
        success: false,
        message: error.response?.message || 'Failed to create product group',
      };
    }
  };
  const handleUomConversionsDelete = async (uomId,token) => {
    try {
      const uomData = await uomConversionDelete(uomId,token);      
      return {
        success: true,
        uom  : uomData.uom,     
        message: uomData.message  
      };
      
    } catch (error) {
      console.error('Create product group error:', error);
      return {
        success: false,
        message: error.response?.message || 'Failed to create product group',
      };
    }
  };

  const handleUpdateProductPrice = async (values, token) => {
    try {
      const productData = await updatePriceByCode(values, token);

      return {
        success: true,
        products: productData.products,
        message: productData.message,
      };
    } catch (error) {
      console.error('Update failed:', error);

      return {
        success: false,
        message: error.response?.data?.message || 'Something went wrong',
      };
    }
  };
  const handleProductDetail = async (warehouse_id, product_id, token) => {
    try {
      const productData = await getProductDetail(warehouse_id, product_id, token);

      return {
        success: true,
        product: productData.product,
        message: productData.message,
      };
    } catch (error) {
      console.error('get failed:', error);

      return {
        success: false,
        message: error.response?.data?.message || 'Something went wrong',
      };
    }
};

  
  


  return { 
    handleCategories ,
    handleUnits ,
    handleCategoryCreate,
     handleCategoryDelete ,
     handleUnitCreate, 
     handleProductCreate ,
     handleProductImport ,
     handleProducts,
     handleUnitDelete,
     handleProductDelete,
     handleUnitUpdate,
     handleBrandCreate,
     handleBrandDelete,
     handleBrands,
     handleBrandUpdate,
     handleProductGroupCreate,
     handleProductGroupDelete,
     handleProductGroupUpdate,
     handleProductGroups,     
     handleProductEdit,
     handleProductUpdate,
     handleSelectWarehouseProduct,
     handleWarehouseProducts,
     handleUomConversions,
     handleUomConversionsCreate,
     handleUomConversionsDelete,
     handleUomConversionsEdit,
     handleUomConversionsUpdate,
     handleUpdateProductPrice,
     handleCategoryUpdate,
     handleProductDetail,
     handleSetNewStock,
     handleRegional,
     handleWarehouse

    };
};
