import axios from 'axios';
const API_BASE = 'http://127.0.0.1:8000/api';

export const fetchRegional = async (token) => {
  
  const response = await axios.get(`${API_BASE}/regional/list`, {
    headers: { Authorization: `Bearer ${token}` }
  });  
  
  return response.data;
};

export const showRegional = async (id, token) => {
  const response = await axios.get(`${API_BASE}/regional/show/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
  });  
  return response.data;
};

export const createRegional = async (values, token) => {
  const response = await axios.post(`${API_BASE}/regional/create`, values, {
    headers: { Authorization: `Bearer ${token}` }
  });
  
  return response.data;
};

export const updateRegional = async (id, values, token) => {
  const response = await axios.put(`${API_BASE}/regional/update/${id}`, values, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response;
};

export const deleteRegional = async (id, token) => {
  const response = await axios.delete(`${API_BASE}/regional/delete/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });  
  return response.data;
};