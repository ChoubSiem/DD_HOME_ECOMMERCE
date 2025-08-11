import api from "../api/axiosConfig";

export const getPurchaseReports = async (values, token) => {
  const response = await api.get('/report/purchases', {
    headers: { Authorization: `Bearer ${token}` },
    params: values
  });
  return response;
};

export const getSaleReports = async (values, token) => {
  const response = await api.get('/report/sales', {
    headers: { Authorization: `Bearer ${token}` },
    params: values
  });
  return response;
};

export const getShiftReports = async (warehouse_id, token) => {
  const response = await api.get('/report/shifts', {
    headers: { Authorization: `Bearer ${token}` },
    params: { warehouse_id }
  });
  return response;
};

export const getStockReports = async (values, token) => {
  const response = await api.get('/report/stocks', {
    headers: { Authorization: `Bearer ${token}` },
    params: values
  });
  return response;
};

export const getProductReports = async (values, token) => {
  const response = await api.get('/report/products', {
    headers: { Authorization: `Bearer ${token}` },
    params: values
  });
  return response;
};

export const getPaymentReport = async (values, token) => {
  const response = await api.get('/report/payments', {
    headers: { Authorization: `Bearer ${token}` },
    params: values
  });
  return response;
};

export const getStockTransitionReport = async (values, token) => {
  const response = await api.get('/report/stock/transition', {
    headers: { Authorization: `Bearer ${token}` },
    params: values
  });
  return response;
};

export const getCreditSales = async (values, token) => {
  const response = await api.get('/report/credit-sale', {
    headers: { Authorization: `Bearer ${token}` },
    params: values
  });
  return response;
};
