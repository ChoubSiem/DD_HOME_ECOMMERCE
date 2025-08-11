// api/axiosConfig.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://backend.ddhomekh.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  response => response.data,
  error => Promise.reject(error.response?.data || error.message)
);

export default api;
