import axios from 'axios';
const API_BASE = 'http://159.65.134.127/api';

export const fetchAdjustment = async (token) => {
  
  const response = await axios.get(`${API_BASE}/adjustment/list`, {
    headers: { Authorization: `Bearer ${token}` }
  });  
  return response.data;
};

export const createAdjustment = async (values,token) => {
  
  const response = await axios.post(`${API_BASE}/adjustment/create`,values, {
    headers: {
         Authorization: `Bearer ${token}`,
         
         }
  });  
  return response.data;
};
export const showAdjustment = async (id,token) => {
  
  const response = await axios.get(`${API_BASE}/adjustment/show/${id}`, {
    headers: {
         Authorization: `Bearer ${token}`,
         
         }
  });  
  return response.data;
};
export const updateAdjustment = async (adjustId,values,token) => {
  
  const response = await axios.put(`${API_BASE}/adjustment/update/${adjustId}`,values, {
    headers: {
         Authorization: `Bearer ${token}`,

         }
  });  
  return response.data;
};

export const deleteAdjustment = async (adjustId,token) => {
  
  const response = await axios.delete(`${API_BASE}/adjustment/delete/${adjustId}`, {
    headers: {
         Authorization: `Bearer ${token}`,

         }
  });  
  console.log(response);
  return response.data;
};


export const createUomTransfer = async (values,token) => {
  
  const response = await axios.post(`${API_BASE}/uom-transfer/create`,values, {
    headers: {
         Authorization: `Bearer ${token}`,
         'Content-Type': 'application/json',
         'Accept': 'application/json'
         }
  });  
  return response.data;
};


export const getUomTransfer = async (token, warehouse_id) => {
  const response = await axios.get(`${API_BASE}/uom-transfer/list?warehouse_id=${warehouse_id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    }
  });  
  return response.data;
};

export const getUomTransferOne = async (token, uomId) => {
  const response = await axios.get(`${API_BASE}/uom-transfer/edit/${uomId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    }
  });  
  return response.data;
};
export const updateUomTransfer = async (uomId,values,token) => {
  const response = await axios.put(`${API_BASE}/uom-transfer/update/${uomId}`,values,{
    headers: {
      Authorization: `Bearer ${token}`,
      'content-Type': 'application/json',
      // 'Accept': 'application/json',
    }
  });  
  return response.data;
};
export const deleteUomTransfer = async (token,uomId) => {
  const response = await axios.delete(`${API_BASE}/uom-transfer/delete/${uomId}`,{
    headers: {
      Authorization: `Bearer ${token}`,
    }
  });  
  return response.data;
};

export const getStockTransfers = async (warehouse_id,token) => {
  
  const response = await axios.get(`${API_BASE}/stock-transfer/list`, {
    headers: {
         Authorization: `Bearer ${token}`,
         'Content-Type': 'application/json',
         'Accept': 'application/json'
         },
         params:{warehouse_id}
  });    
  return response.data;
};
export const createStockTransfer = async (values,token) => {
  
  const response = await axios.post(`${API_BASE}/stock-transfer/create`,values, {
    headers: {
         Authorization: `Bearer ${token}`,
         'Content-Type': 'application/json',
         'Accept': 'application/json'
         }
  });    
  return response.data;
};

//  =========================== PURCHASE ==================================

export const fetchPurchase = async (values,token) => {
  
  const response = await axios.get(`${API_BASE}/purchase/list`, {
    headers: { Authorization: `Bearer ${token}`,
    params:{values}
     }
  });  
  return response.data;
};
export const createPurchase = async (values,token) => {
  
  const response = await axios.post(`${API_BASE}/purchase/create`,values, {
    headers: {
         Authorization: `Bearer ${token}`,
         
         }
  });  
  return response.data;
};
export const showPurchase = async (id,token) => {
  
  const response = await axios.get(`${API_BASE}/purchase/show/${id}`, {
    headers: {
         Authorization: `Bearer ${token}`,
         
         }
  });  
  return response.data;
};
export const updatePurchase = async (purchaseId,values,token) => {
  
  const response = await axios.put(`${API_BASE}/purchase/update/${purchaseId}`,values, {
    headers: {
         Authorization: `Bearer ${token}`,

         }
  });  
  return response.data;
};



export const deletePurchase = async (purchaseId,token) => {
  
  const response = await axios.delete(`${API_BASE}/purchase/delete/${purchaseId}`, {
    headers: {
         Authorization: `Bearer ${token}`,

         }
  });  
  return response.data;
};



//  =========================== SUSPEND ==================================

export const createSuspand = async (values,warehouse_id,token) => {
  
  const response = await axios.post(`${API_BASE}/suspand/create`,values, {
    headers: {
         Authorization: `Bearer ${token}`,
         'Accept' : 'application/json',
         },
         params: { warehouse_id }
  });  
  return response.data;
};


export const deleteSuspand = async (suspendId,token) => {
  
  const response = await axios.delete(`${API_BASE}/suspand/delete/${suspendId}`, {
    headers: {
         Authorization: `Bearer ${token}`,
         'Accept' : 'application/json',
         }
  });  
  return response.data;
};


export const getSuspends = async (warehouse_id,shift_id , token) => {
  
  const response = await axios.get(`${API_BASE}/suspand/get`, {
    headers: {
         Authorization: `Bearer ${token}`,
         'Accept' : 'application/json',
         },
        params:{warehouse_id, shift_id}
  });  
  return response.data;
};
