import api from "../api/axiosConfig";

export const fetchCompany = async (token) => {
  const response = await api.get(`/company/list`, {
    headers: { Authorization: `Bearer ${token}` }
  });  
  return response;
};

export const createCompany = async (values, token) => {
  const response = await api.post(`/company/create`, values, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response;
};

export const showCompany = async (id, token) => {
  const response = await api.get(`/company/show/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });  
  return response;
};

export const updateCompany = async (id, values, token) => {
  const response = await api.put(`/company/update/${id}`, values, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response;
};

export const deleteCompany = async (id, token) => {
  const response = await api.delete(`/company/delete/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response;
};
