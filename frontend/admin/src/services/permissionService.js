import axios from 'axios';
const API_BASE = 'https://backend.ddhomekh.com/api';

export const fetchPermissions = async (token) => {
  
  const response = await axios.get(`${API_BASE}/permission/list`, {
    headers: { Authorization: `Bearer ${token}` }
  });  
  return response.data;
};

export const fetchRolePermissions = async (token, roleId) => {
  try {
    const response = await axios.get(`${API_BASE}/role-permission/${roleId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });    
    return response.data;
  } catch (error) {
    console.error('Error fetching role permissions:', error);
    throw error; 
  }
};



export const createPermission = async (values, token) => {
  const response = await axios.post(`${API_BASE}/permission/create`, values, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response;
};

export const updatePermission = async (id, values, token) => {
  const response = await axios.put(`${API_BASE}/permission/edit/${id}`, values, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response;
};

export const deletePermission = async (id, token) => {
  const response = await axios.delete(`${API_BASE}/permission/delete/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response;
};