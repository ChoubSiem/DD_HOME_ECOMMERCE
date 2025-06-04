import axios from 'axios';
const API_BASE = 'https://backend.ddhomekh.com/api';

export const getPurchaseReports = async (warehouse_id,token) => {
  
  const response = await axios.get(`${API_BASE}/report/purchases`, {
    headers: { Authorization: `Bearer ${token}` },
    params: {warehouse_id}
  });  
  return response.data;
};
export const getSaleReports = async (warehouse_id,token) => {
  
  const response = await axios.get(`${API_BASE}/report/sales`, {
    headers: { Authorization: `Bearer ${token}` },
    params: {warehouse_id}
  });  
  return response.data;
};
export const getShiftReports = async (warehouse_id,token) => {
  
  const response = await axios.get(`${API_BASE}/report/shifts`, {
    headers: { Authorization: `Bearer ${token}` },
    params: {warehouse_id}
  });    
  return response.data;
};
