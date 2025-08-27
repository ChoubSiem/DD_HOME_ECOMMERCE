import api from "../api/axiosConfig";

export const getAdjustmentNotification = async (token) => {
  const response = await api.get(`/notification/adjustments`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response;
};
export const updateAdjustmentNotification = async (token,id) => {
  const response = await api.put(`/notification/adjustments/update/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response;
};

