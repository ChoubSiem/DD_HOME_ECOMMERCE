import axios from 'axios';
const API_BASE = 'http://127.0.0.1:8000/api';

export const getPurchaseReports = async (values,token) => {
  
  const response = await axios.get(`${API_BASE}/report/purchases`, {
    headers: { Authorization: `Bearer ${token}` },
    params: values
  });  
  // console.log(res);
  
  return response.data;
};
export const getSaleReports = async (values,token) => {
  
  const response = await axios.get(`${API_BASE}/report/sales`, {
    headers: { Authorization: `Bearer ${token}` },
    params: values
  });  
  // console.log(response);
  
  return response.data;
};
export const getShiftReports = async (warehouse_id,token) => {
  
  const response = await axios.get(`${API_BASE}/report/shifts`, {
    headers: { Authorization: `Bearer ${token}` },
    params: {warehouse_id}
  });    
  return response.data;
};

  export const getStockReports = async (values,token) => {
    
    const response = await axios.get(`${API_BASE}/report/stocks`, {
      headers: { Authorization: `Bearer ${token}` },
      params: values
    });  
   
    return response.data;
  };
  export const getProductReports = async (values,token) => {
    
    const response = await axios.get(`${API_BASE}/report/products`, {
      headers: { Authorization: `Bearer ${token}` },
      params: values
    });  
   
    return response.data;
  };
  export const getPaymentReport = async (values,token) => {
    
    const response = await axios.get(`${API_BASE}/report/payments`, {
      headers: { Authorization: `Bearer ${token}` },
      params: values
    });  
   
    return response.data;
  };