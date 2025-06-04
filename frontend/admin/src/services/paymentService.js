import axios from 'axios';
const API_BASE = 'http://159.65.134.127/api';

export const createPayment = async (values , token) => {
  
  const response = await axios.post(`${API_BASE}/sale-payment/create`,values, {
    headers: { Authorization: `Bearer ${token}` }
  });  
  
  return response.data;
};

