import axios from 'axios';
const API_BASE = 'http://127.0.0.1:8000/api';

export const createPayment = async (values , token) => {
  
  const response = await axios.post(`${API_BASE}/sale-payment/create`,values, {
    headers: { Authorization: `Bearer ${token}` }
  });  
  
  return response.data;
};
export const getPurchasePayment = async (purchaseId, token) => {
  const response = await axios.get(`${API_BASE}/purchase-payment/${purchaseId}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });  
  return response.data;
};
export const addPurchasePayment = async (values, token) => {
  const response = await axios.post(`${API_BASE}/purchase-payment/add`, values, {
    headers: { 
      Authorization: `Bearer ${token}`
    },
    params: {
      warehouse_id: values.warehouse_id 
    }
  });

  return response.data;
};
export const updatePurchasePayment = async (purchaseId,values, token) => {
  const response = await axios.post(`${API_BASE}/purchase-payment/edit/${purchaseId}`, values, {
    headers: {
      Authorization: `Bearer ${token}`
    },
    params: {
      warehouse_id: values.warehouse_id 
    }
  });

  return response.data;
};