import api from "../api/axiosConfig";

export const fetchPermissions = async (token) => {
  const response = await api.get(`/permission/list`, {
    headers: { Authorization: `Bearer ${token}` }
  });  
  return response;
};

export const fetchRolePermissions = async (token, roleId) => {
  try {
    const response = await api.get(`/role-permission/${roleId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });            
    return response;
  } catch (error) {
    console.error('Error fetching role permissions:', error);
    throw error; 
  }
};

export const createPermission = async (values, token) => {
  const response = await api.post(`/permission/create`, values, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response;
};

export const updatePermission = async (id, values, token) => {
  const response = await api.put(`/permission/edit/${id}`, values, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response;
};

export const deletePermission = async (id, token) => {
  const response = await api.delete(`/permission/delete/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response;
};
