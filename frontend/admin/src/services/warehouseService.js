import axios from 'axios';
const API_BASE = 'https://backend.ddhomekh.com/api';

export const fetchWarehouse = async (token) => {
  
  const response = await axios.get(`${API_BASE}/warehouse/list`, {
    headers: { Authorization: `Bearer ${token}` }
  });  
  
  return response.data;
};

export const createWarehouse = async (values, token) => {
  const response = await axios.post(`${API_BASE}/warehouse/create`, values, {
    headers: { Authorization: `Bearer ${token}` }
  });
  console.log(response);
  
  return response.data;
};

export const updateWarehouse = async (id, values, token) => {
  const response = await axios.put(`${API_BASE}/warehouse/update/${id}`, values, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const deleteWarehouse = async (id, token) => {
  const response = await axios.delete(`${API_BASE}/warehouse/delete/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response;
};

export const showWarehouse = async (id, token) => {
  const response = await axios.get(`${API_BASE}/warehouse/show/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
  });  
  return response.data;
};
