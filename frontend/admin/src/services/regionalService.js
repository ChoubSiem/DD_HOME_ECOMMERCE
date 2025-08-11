import api from "../api/axiosConfig";

export const fetchRegional = async (token) => {
  const response = await api.get('/regional/list', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response;
};

export const showRegional = async (id, token) => {
  const response = await api.get(`/regional/show/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response;
};

export const createRegional = async (values, token) => {
  const response = await api.post('/regional/create', values, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response;
};

export const updateRegional = async (id, values, token) => {
  const response = await api.put(`/regional/update/${id}`, values, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response;
};

export const deleteRegional = async (id, token) => {
  const response = await api.delete(`/regional/delete/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response;
};
