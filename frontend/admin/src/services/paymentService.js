import api from "../api/axiosConfig";

export const createPayment = async (values, token) => {
  const response = await api.post(`/sale-payment/create`, values, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response;
};

export const getPurchasePayment = async (purchaseId, token) => {
  const response = await api.get(`/purchase-payment/${purchaseId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response;
};

export const addPurchasePayment = async (values, token) => {
  const response = await api.post(`/purchase-payment/add`, values, {
    headers: { Authorization: `Bearer ${token}` },
    params: { warehouse_id: values.warehouse_id }
  });
  return response;
};

export const updatePurchasePayment = async (purchaseId, values, token) => {
  const response = await api.post(`/purchase-payment/edit/${purchaseId}`, values, {
    headers: { Authorization: `Bearer ${token}` },
    params: { warehouse_id: values.warehouse_id }
  });
  return response;
};
