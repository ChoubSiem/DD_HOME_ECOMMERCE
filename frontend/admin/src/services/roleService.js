import api from "../api/axiosConfig";

export const getRoles = async (token) => {
  const response = await api.get('/role/list', {
    headers: { Authorization: `Bearer ${token}` }
  });      
  return response;
};

export const createRole = async (values, token) => {
  const response = await api.post('/role/create', values, {
    headers: { 
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
  });    
  return response;
};

export const updateRole = async (roleId, values, token) => {
  const response = await api.put(`/role/update/${roleId}`, values, {
    headers: { 
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
  });    
  return response;
};

export const deleteRole = async (roleId, token) => {
  const response = await api.delete(`/role/delete/${roleId}`, {
    headers: { 
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
  });    
  return response;
};

export const roleWithPermission = async (token) => {
  const response = await api.get('/role/permission', {
    headers: { 
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
  });    
  return response;
};

export const showRolePermissions = async (token, roleId) => {
  const response = await api.get(`/role/show/${roleId}`, {
    headers: { 
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
  });    
  return response;
};

export const updateRolePermissions = async (token, values, roleId) => {
  const response = await api.put(`/role/permission/update/${roleId}`, values, {
    headers: { 
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
  });      
  return response;
};
