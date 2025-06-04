import axios from 'axios';

const API_BASE = 'https://backend.ddhomekh.com/api';

export const getRoles = async (token) => {
  const response = await axios.get(`${API_BASE}/role/list`, {
    headers: { Authorization: `Bearer ${token}` }
  });    
  console.log(response);
  
  return response.data;
};

export const createRole = async (values,token) => {
  const response = await axios.post(`${API_BASE}/role/create`,values, {
    headers: { 
      Authorization: `Bearer ${token}` ,
      'Content-Type': 'application/json'
        },
  });    
  return response.data;
};

export const updateRole = async (roleId,values,token) => {
  const response = await axios.put(`${API_BASE}/role/update/${roleId}`,values, {
    headers: { 
      Authorization: `Bearer ${token}` ,
      'Content-Type': 'application/json'
        },
  });    
  return response.data;
};

export const deleteRole = async (roleId,token) => {
  const response = await axios.delete(`${API_BASE}/role/delete/${roleId}`, {
    headers: { 
      Authorization: `Bearer ${token}` ,
      'Content-Type': 'application/json'
        },
  });    
  return response.data;
};
export const roleWithPermission = async (token) => {
  const response = await axios.get(`${API_BASE}/role/permission`, {
    headers: { 
      Authorization: `Bearer ${token}` ,
      'Content-Type': 'application/json'
        },
  });    
  return response.data;
};

export const showRolePermissions = async (token,roleId) => {
  const response = await axios.get(`${API_BASE}/role/show/${roleId}`, {
    headers: { 
      Authorization: `Bearer ${token}` ,
      'Content-Type': 'application/json'
        },
  });    
  return response.data;
};

export const updateRolePermissions = async (token, values,roleId) => {
  const response = await axios.put(`${API_BASE}/role/permission/update/${roleId}`,values, {
    headers: { 
      Authorization: `Bearer ${token}` ,
      'Content-Type': 'application/json'
        },
  });      
  return response.data;
};

