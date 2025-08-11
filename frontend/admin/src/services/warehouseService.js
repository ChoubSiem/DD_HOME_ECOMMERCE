import api from "../api/axiosConfig";

export const fetchWarehouse = async (token) => {
  const response = await api.get('/warehouse/list', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response;
};

export const createWarehouse = async (values, token) => {
  const response = await api.post('/warehouse/create', values, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response;
};

export const updateWarehouse = async (id, values, token) => {
  const response = await api.put(`/warehouse/update/${id}`, values, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response;
};

export const deleteWarehouse = async (id, token) => {
  const response = await api.delete(`/warehouse/delete/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response;
};

export const showWarehouse = async (id, token) => {
  const response = await api.get(`/warehouse/show/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response;
};
