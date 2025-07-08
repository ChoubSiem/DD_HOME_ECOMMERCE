import axios from 'axios';
const API_BASE = 'https://backend.ddhomekh.com/api';

export const fetchCategory = async (token) => {

  const response = await axios.get(`${API_BASE}/category/list`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  return response.data;
};

export const createCategory = async (values, token) => {
  const response = await axios.post(`${API_BASE}/category/create`, values, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const updateCategory = async (id, values, token) => {
  const response = await axios.put(`${API_BASE}/category/update/${id}`, values, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response;
};

export const deleteCategory = async (id, token) => {
  const response = await axios.delete(`${API_BASE}/category/delete/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

// unit ===================================================================================

export const fetchUnit = async (token) => {

  const response = await axios.get(`${API_BASE}/unit/list`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const createUnit = async (values, token) => {
  const response = await axios.post(`${API_BASE}/unit/create`, values, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const updateUnit = async (id, values, token) => {
  const response = await axios.put(`${API_BASE}/unit/update/${id}`, values, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const deleteUnit = async (id, token) => {
  const response = await axios.delete(`${API_BASE}/unit/delete/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

// product ==========================================
export const fetchProduct = async (token, warehouse_id) => {
  try {
    const response = await axios.get(`${API_BASE}/product/list`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { warehouse_id },
    });
    
    return response.data;
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
};
export const showProduct = async (proudctId, token) => {

  const response = await axios.get(`${API_BASE}/product/edit/${proudctId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const createProduct = async (values, token) => {

  const response = await axios.post(`${API_BASE}/product/create`, values, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};
export const updateProduct = async (id, values, token) => {
  const response = await axios.put(`${API_BASE}/product/update/${id}`, values, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'

    }
  });
  return response.data;
};
export const importProduct = async (products, token) => {

  const response = await axios.post(`${API_BASE}/product/import`, { products: products }, {
    headers: { Authorization: `Bearer ${token}` },
    
  });  
  
  return response.data;
};

export const UpdatePriceByCode = async (products, token) => {

  const response = await axios.put(`${API_BASE}/product/update-price`, { products: products }, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const deleteProduct = async (id, token) => {
  const response = await axios.delete(`${API_BASE}/product/delete/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  return response.data;
};
export const fetchBrand = async (token) => {
  const response = await axios.get(`${API_BASE}/brand/list`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const createBrand = async (values, token) => {
  const response = await axios.post(`${API_BASE}/brand/create`, values, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const updateBrand = async (id, values, token) => {
  const response = await axios.put(`${API_BASE}/brand/update/${id}`, values, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const deleteBrand = async (id, token) => {
  const response = await axios.delete(`${API_BASE}/brand/delete/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const showBrand = async (id, token) => {
  const response = await axios.put(`${API_BASE}/brand/show/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};


// product group =============================
export const fetchProductGroup = async (token) => {
  const response = await axios.get(`${API_BASE}/product-group/list`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const createProductGroup = async (values, token) => {
  const response = await axios.post(`${API_BASE}/product-group/create`, values, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const updateProductGroup = async (id, values, token) => {
  const response = await axios.put(`${API_BASE}/product-group/update/${id}`, values, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const deleteProductGroup = async (id, token) => {
  const response = await axios.delete(`${API_BASE}/product-group/delete/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const showProductGroup = async (id, token) => {
  const response = await axios.get(`${API_BASE}/product-group/edit/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};


export const selectWarehouseProduct = async (values, token) => {
  const response = await axios.post(`${API_BASE}/warehouse/product`, values, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const warehouseProducts = async (warehouseId, token) => {
  const response = await axios.get(`${API_BASE}/warehouse/product/list/${warehouseId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};


// fetch UOM Transfer 
export const uomTranfers = async (warehouseId, token) => {
  const response = await axios.get(`${API_BASE}/uom-tranfer/list/${warehouseId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};


export const uomTransferCreate = async (token) => {
  const response = await axios.get(`${API_BASE}/uom-tranfer/create`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};
export const uomTransferEdit = async (warehouseId, token) => {
  const response = await axios.get(`${API_BASE}/uom-tranfer/show/${warehouseId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};
export const uomTranfersUpdate = async (warehouseId, values, token) => {
  const response = await axios.put(`${API_BASE}/uom-tranfer/update/${warehouseId}`, values, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};
export const uomTranfersDelete = async (warehouseId, token) => {
  const response = await axios.delete(`${API_BASE}/uom-tranfer/delete/${warehouseId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};
export const uomConversions = async (token) => {
  const response = await axios.get(`${API_BASE}/uom-conversion/list`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};
export const uomConversionsCreate = async (values, token) => {
  const response = await axios.post(`${API_BASE}/uom-conversion/create`, values, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};
export const uomConversionsEdit = async (uomId, token) => {
  const response = await axios.get(`${API_BASE}/uom-conversion/edit/${uomId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};
export const uomConversionsUpdate = async (uomId, values, token) => {
  const response = await axios.put(`${API_BASE}/uom-conversion/update/${uomId}`, values, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const uomConversionsDelete = async (uomId, token) => {
  const response = await axios.delete(`${API_BASE}/uom-conversion/delete/${uomId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const getProductDetail = async (warehouse_id, product_id, token) => {
  const response = await axios.get(`${API_BASE}/product/detail`, {
    headers: {
      Authorization: `Bearer ${token}`
    },
    params: {
      warehouse_id,
      product_id
    }
  });  
  return response.data;
};
