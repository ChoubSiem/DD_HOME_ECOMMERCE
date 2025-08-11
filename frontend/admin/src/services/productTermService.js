import api from "../api/axiosConfig";

// CATEGORY
export const fetchCategory = async (token) => {
  const response = await api.get('/category/list', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response;
};

export const createCategory = async (values, token) => {
  const response = await api.post('/category/create', values, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response;
};

export const updateCategory = async (id, values, token) => {
  const response = await api.put(`/category/update/${id}`, values, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response;
};

export const deleteCategory = async (id, token) => {
  const response = await api.delete(`/category/delete/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response;
};

// UNIT
export const fetchUnit = async (token) => {
  const response = await api.get('/unit/list', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response;
};

export const createUnit = async (values, token) => {
  const response = await api.post('/unit/create', values, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response;
};

export const updateUnit = async (id, values, token) => {
  const response = await api.put(`/unit/update/${id}`, values, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response;
};

export const deleteUnit = async (id, token) => {
  const response = await api.delete(`/unit/delete/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response;
};

// PRODUCT
export const fetchProduct = async (token, warehouse_id) => {
  const response = await api.get('/product/list', {
    headers: { Authorization: `Bearer ${token}` },
    params: { warehouse_id }
  });
  return response;
};

export const showProduct = async (productId, token) => {
  const response = await api.get(`/product/edit/${productId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response;
};

export const createProduct = async (values, token) => {
  const response = await api.post('/product/create', values, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response;
};

export const updateProduct = async (id, values, token) => {
  const response = await api.put(`/product/update/${id}`, values, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json'
    }
  });
  return response;
};

export const importProduct = async (products, token) => {
  const response = await api.post('/product/import', { products }, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response;
};

export const setNewStock = async (products, token) => {
  const response = await api.put('/product/update/stock', { products }, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response;
};

export const updatePriceByCode = async (products, token) => {
  const response = await api.put('/product/update-price', { products }, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response;
};

export const deleteProduct = async (id, token) => {
  const response = await api.delete(`/product/delete/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response;
};

// BRAND
export const fetchBrand = async (token) => {
  const response = await api.get('/brand/list', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response;
};

export const createBrand = async (values, token) => {
  const response = await api.post('/brand/create', values, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response;
};

export const updateBrand = async (id, values, token) => {
  const response = await api.put(`/brand/update/${id}`, values, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response;
};

export const deleteBrand = async (id, token) => {
  const response = await api.delete(`/brand/delete/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response;
};

export const showBrand = async (id, token) => {
  const response = await api.get(`/brand/show/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response;
};

// PRODUCT GROUP
export const fetchProductGroup = async (token) => {
  const response = await api.get('/product-group/list', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response;
};

export const createProductGroup = async (values, token) => {
  const response = await api.post('/product-group/create', values, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response;
};

export const updateProductGroup = async (id, values, token) => {
  const response = await api.put(`/product-group/update/${id}`, values, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response;
};

export const deleteProductGroup = async (id, token) => {
  const response = await api.delete(`/product-group/delete/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response;
};

export const showProductGroup = async (id, token) => {
  const response = await api.get(`/product-group/edit/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response;
};

// WAREHOUSE PRODUCTS
export const selectWarehouseProduct = async (values, token) => {
  const response = await api.post('/warehouse/product', values, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response;
};

export const warehouseProducts = async (warehouseId, token) => {
  const response = await api.get(`/warehouse/product/list/${warehouseId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response;
};

// UOM TRANSFER
export const uomTransfers = async (warehouseId, token) => {
  const response = await api.get(`/uom-transfer/list/${warehouseId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response;
};

export const uomTransferCreate = async (token) => {
  const response = await api.get('/uom-transfer/create', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response;
};

export const uomTransferEdit = async (uomId, token) => {
  const response = await api.get(`/uom-transfer/show/${uomId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response;
};

export const uomTransferUpdate = async (uomId, values, token) => {
  const response = await api.put(`/uom-transfer/update/${uomId}`, values, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response;
};

export const uomTransferDelete = async (uomId, token) => {
  const response = await api.delete(`/uom-transfer/delete/${uomId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response;
};

// UOM CONVERSION
export const uomConversions = async (token) => {
  const response = await api.get('/uom-conversion/list', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response;
};

export const uomConversionCreate = async (values, token) => {
  const response = await api.post('/uom-conversion/create', values, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response;
};

export const uomConversionEdit = async (uomId, token) => {
  const response = await api.get(`/uom-conversion/edit/${uomId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response;
};

export const uomConversionUpdate = async (uomId, values, token) => {
  const response = await api.put(`/uom-conversion/update/${uomId}`, values, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response;
};

export const uomConversionDelete = async (uomId, token) => {
  const response = await api.delete(`/uom-conversion/delete/${uomId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response;
};

// PRODUCT DETAIL
export const getProductDetail = async (warehouse_id, product_id, token) => {
  const response = await api.get('/product/detail', {
    headers: { Authorization: `Bearer ${token}` },
    params: { warehouse_id, product_id }
  });
  return response;
};
