import axios from 'axios';

const API_BASE = 'https://backend.ddhomekh.com/api';

export const fetchCompany = async (token) => {
  const response = await axios.get(`${API_BASE}/company/list`, {
    headers: { Authorization: `Bearer ${token}` }
  });  
  return response.data;
};

export const createCompany = async (values, token) => {
  const response = await axios.post(`${API_BASE}/company/create`, values, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const showCompany = async (id, token) => {
  const response = await axios.get(`${API_BASE}/company/show/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });  
  return response.data;
};

export const updateCompany = async (id, values, token) => {
  const response = await axios.put(`${API_BASE}/company/update/${id}`, values, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const deleteCompany = async (id, token) => {
  const response = await axios.delete(`${API_BASE}/company/delete/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};