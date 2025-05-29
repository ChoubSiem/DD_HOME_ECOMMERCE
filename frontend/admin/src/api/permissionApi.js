import api from './axiosConfig';

export const PermissionApi = {
  list: (params) => api.get('/permission/list', { params }),
  create: (data) => api.post('/permission/create', data),
  update: (id, data) => api.put(`/permission/update/${id}`, data),
  delete: (id) => api.delete(`/permission/delete/${id}`),
};