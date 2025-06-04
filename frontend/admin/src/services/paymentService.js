import axios from 'axios';
const API_BASE = 'https://backend.ddhomekh.com/api';

export const createPayment = async (values , token) => {
  
  const response = await axios.post(`${API_BASE}/sale-payment/create`,values, {
    headers: { Authorization: `Bearer ${token}` }
  });  
  
  return response.data;
};

