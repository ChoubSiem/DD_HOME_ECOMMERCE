import api from "../api/axiosConfig";

export const fetchAdjustment = async (token) => {
  try {
    const response = await api.get('/adjustment/list', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response;
  } catch (error) {
    console.error('Error fetching adjustments:', error);
    return false;
  }
};

export const createAdjustment = async (values, token) => {
  try {
    const response = await api.post('/adjustment/create', values, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response;
  } catch (error) {
    console.error('Error creating adjustment:', error);
    return false;
  }
};

export const showAdjustment = async (id, token) => {
  try {
    const response = await api.get(`/adjustment/show/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response;
  } catch (error) {
    console.error('Error showing adjustment:', error);
    return false;
  }
};

export const updateAdjustment = async (adjustId, values, token) => {
  try {
    const response = await api.put(`/adjustment/update/${adjustId}`, values, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response;
  } catch (error) {
    console.error('Error updating adjustment:', error);
    return false;
  }
};

export const deleteAdjustment = async (adjustId, token) => {
  try {
    const response = await api.delete(`/adjustment/delete/${adjustId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response;
  } catch (error) {
    console.error('Error deleting adjustment:', error);
    return false;
  }
};

export const createUomTransfer = async (values, token) => {
  try {
    const response = await api.post('/uom-transfer/create', values, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    return response;
  } catch (error) {
    console.error('Error creating UOM transfer:', error);
    return false;
  }
};

export const getUomTransfer = async (token, warehouse_id) => {
  try {
    const response = await api.get('/uom-transfer/list', {
      headers: { Authorization: `Bearer ${token}` },
      params: { warehouse_id }
    });
    return response;
  } catch (error) {
    console.error('Error fetching UOM transfers:', error);
    return false;
  }
};

export const getUomTransferOne = async (token, uomId) => {
  try {
    const response = await api.get(`/uom-transfer/edit/${uomId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response;
  } catch (error) {
    console.error('Error fetching UOM transfer detail:', error);
    return false;
  }
};

export const updateUomTransfer = async (uomId, values, token) => {
  try {
    const response = await api.put(`/uom-transfer/update/${uomId}`, values, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response;
  } catch (error) {
    console.error('Error updating UOM transfer:', error);
    return false;
  }
};

export const deleteUomTransfer = async (token, uomId) => {
  try {
    const response = await api.delete(`/uom-transfer/delete/${uomId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response;
  } catch (error) {
    console.error('Error deleting UOM transfer:', error);
    return false;
  }
};

export const getStockTransfers = async (warehouse_id, token) => {
  try {
    const response = await api.get('/stock-transfer/list', {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      params: { warehouse_id }
    });
    return response;
  } catch (error) {
    console.error('Error fetching stock transfers:', error);
    return false;
  }
};

export const createStockTransfer = async (values, token) => {
  try {
    const response = await api.post('/stock-transfer/create', values, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    return response;
  } catch (error) {
    console.error('Error creating stock transfer:', error);
    return false;
  }
};

// =========================== PURCHASE ==================================

export const fetchPurchase = async (values, token) => {
  try {
    const response = await api.get('/purchase/list', {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      params: values
    });
    return response;
  } catch (error) {
    console.error('Error fetching purchases:', error);
    return false;
  }
};

export const createPurchase = async (values, token) => {
  try {
    const response = await api.post('/purchase/create', values, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response;
  } catch (error) {
    console.error('Error creating purchase:', error);
    return false;
  }
};

export const showPurchase = async (id, token) => {
  try {
    const response = await api.get(`/purchase/show/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response;
  } catch (error) {
    console.error('Error showing purchase:', error);
    return false;
  }
};

export const updatePurchase = async (purchaseId, values, token) => {
  try {
    const response = await api.put(`/purchase/update/${purchaseId}`, values, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response;
  } catch (error) {
    console.error('Error updating purchase:', error);
    return false;
  }
};

export const deletePurchase = async (purchaseId, token) => {
  try {
    const response = await api.delete(`/purchase/delete/${purchaseId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response;
  } catch (error) {
    console.error('Error deleting purchase:', error);
    return false;
  }
};

// =========================== SUSPEND ==================================

export const createSuspend = async (values, warehouse_id, token) => {
  try {
    const response = await api.post('/suspand/create', values, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Accept': 'application/json'
      },
      params: { warehouse_id }
    });
    return response;
  } catch (error) {
    console.error('Error creating suspend:', error);
    return false;
  }
};

export const deleteSuspend = async (suspendId, token) => {
  try {
    const response = await api.delete(`/suspand/delete/${suspendId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });
    return response;
  } catch (error) {
    console.error('Error deleting suspend:', error);
    return false;
  }
};

export const getSuspends = async (warehouse_id, shift_id, token) => {
  try {
    const response = await api.get('/suspand/get', {
      headers: {
        Authorization: `Bearer ${token}`,
        'Accept': 'application/json'
      },
      params: { warehouse_id, shift_id }
    });
    return response;
  } catch (error) {
    console.error('Error fetching suspends:', error);
    return false;
  }
};
