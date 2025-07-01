import axios from 'axios';
import { data } from 'react-router-dom';
const API_URL = 'https://backend.ddhomekh.com/api';


export const getPosSales = async (warehouseId,token) => {  
  try {
    const response = await axios.get(`${API_URL}/pos-sale/list`, {
      headers: { 
        Authorization: `Bearer ${token}` 
      },
      params: {  
        warehouse_id: warehouseId 
      }
    });        
    return response.data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return false;
  }
};
export const getSalesInventory = async (warehouseId,token) => {  
  try {
    const response = await axios.get(`${API_URL}/sale/list`, {
      headers: { 
        Authorization: `Bearer ${token}` 
      },
      params: {  
        warehouse_id: warehouseId 
      }
    });            
    return response.data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return false;
  }
};

export const addPosSale = async (values,token) => {  
  try {
    const response = await axios.post(`${API_URL}/pos-sale/create`,values, {
      headers: { 
        Authorization: `Bearer ${token}` 
      }
    });        
    return response.data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return false;
  }
};


export const addOpenShift = async (values,token) => {  
  try {
    const response = await axios.post(`${API_URL}/open-shift/create`,values, {
      headers: { 
        Authorization: `Bearer ${token}` ,
          "Content-Type": "application/json",
          "Accept": "application/json"
      }
    });        
    return response.data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return false;
  }
};
export const addCloseShift = async (values,token) => {  
  try {
    const response = await axios.post(`${API_URL}/close-shift/create`,values, {
      // params:{warehouse_id},
      headers: { 
        Authorization: `Bearer ${token}` ,
          "Content-Type": "application/json",
          "Accept": "application/json"
      }
    });        
    
    return response.data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return false;
  }
};
export const getOneOpenShift = async (shiftId,warehouse_id, token) => {
  if (!shiftId || !warehouse_id || !token) {
    console.error('Missing required parameters:', {  warehouse_id, token });
    throw new Error('Missing required parameters');
  }
  
  try {
    const response = await axios.get(`${API_URL}/open-shift/show/${shiftId}`, {
      params: { warehouse_id },
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.data) {
      console.error('Empty response data:', response);
      throw new Error('No data received from server');
    }    
    return {
      success: true,
      data: response.data,
      status: response.status
    };

  } catch (error) {
    let errorMessage = 'Error fetching shift data';
    
    if (error.response) {
      console.error('Server responded with error status:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers
      });
      errorMessage = error.response.data?.message || `Server error: ${error.response.status}`;
    } else if (error.request) {
      console.error('No response received:', error.request);
      errorMessage = 'No response from server';
    } else {
      console.error('Request setup error:', error.message);
      errorMessage = error.message;
    }

    return {
      success: false,
      error: errorMessage,
      status: error.response?.status || 500
    };
  }
};
export const getOneProcessingShift = async (warehouse_id, token) => {
  if ( !warehouse_id || !token) {
    console.error('Missing required parameters:', {  warehouse_id, token });
    throw new Error('Missing required parameters');
  }
  
  try {
    const response = await axios.get(`${API_URL}/open-shift/processing-shift`, {
      params: { warehouse_id },
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.data) {
      console.error('Empty response data:', response);
      throw new Error('No data received from server');
    }    
    return {
      success: true,
      data: response.data.shift,
      status: response.status
    };

  } catch (error) {
    let errorMessage = 'Error fetching shift data';
    
    if (error.response) {
      console.error('Server responded with error status:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers
      });
      errorMessage = error.response.data?.message || `Server error: ${error.response.status}`;
    } else if (error.request) {
      console.error('No response received:', error.request);
      errorMessage = 'No response from server';
    } else {
      console.error('Request setup error:', error.message);
      errorMessage = error.message;
    }

    return {
      success: false,
      error: errorMessage,
      status: error.response?.status || 500
    };
  }
};

export const UpdateOpenShift = async (shiftId,values,token) => {  
  try {
    const response = await axios.put(`${API_URL}/open-shift/update/${shiftId}`,values, {
      headers: { 
        Authorization: `Bearer ${token}` ,
          "Content-Type": "application/json",
          "Accept": "application/json"
      }
    });        
    return response.data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return false;
  }
};

export const getSalePaymentOne = async (saleId,token) => {  
  try {
    const response = await axios.get(`${API_URL}/sale-payment/show/${saleId}`, {
      headers: { 
        Authorization: `Bearer ${token}` ,
          "Content-Type": "application/json",
          "Accept": "application/json"
      }
    });        
    return response.data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return false;
  }
};
export const getOneInventorySale = async (saleId,token) => {  
  try {
    const response = await axios.get(`${API_URL}/sale/edit/${saleId}`, {
      headers: { 
        Authorization: `Bearer ${token}` ,
          "Content-Type": "application/json",
          "Accept": "application/json"
      }
    });        
    return response.data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return false;
  }
};
export const getOnePosSale = async (saleId,token) => {  
  try {
    const response = await axios.get(`${API_URL}/pos-sale/edit/${saleId}`, {
      headers: { 
        Authorization: `Bearer ${token}` ,
          "Content-Type": "application/json",
          "Accept": "application/json"
      }
    });        
    return response.data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return false;
  }
};
export const updateSaleInventory = async (saleId,values,token) => {  
  try {
    const response = await axios.put(`${API_URL}/sale/update/${saleId}`,values, {
      headers: { 
        Authorization: `Bearer ${token}` ,
          "Content-Type": "application/json",
          "Accept": "application/json"
      }
    });        
    return response.data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return false;
  }
};
export const deleteSaleInventory = async (saleId,token) => {  
  try {
    const response = await axios.delete(`${API_URL}/sale/delete/${saleId}`, {
      headers: { 
        Authorization: `Bearer ${token}` ,
          "Content-Type": "application/json",
          "Accept": "application/json"
      }
    });        
    return response.data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return false;
  }
};
export const deletePosSale = async (saleId,token) => {  
  try {
    const response = await axios.delete(`${API_URL}/pos-sale/delete/${saleId}`, {
      headers: { 
        Authorization: `Bearer ${token}` ,
          "Content-Type": "application/json",
          "Accept": "application/json"
      }
    });        
    return response.data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return false;
  }
};
 
export const getSaleReturn = async (warehouseId,token) => {  
  try {
    const response = await axios.get(`${API_URL}/sale-return/list`, {
      headers: { 
        Authorization: `Bearer ${token}` ,
          "Content-Type": "application/json",
          "Accept": "application/json"
      },
      params:{warehouse_id: warehouseId}
    });        
    return response.data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return false;
  }
};
export const getOneSaleReturn = async (saleReturnId,token) => {  
  try {
    const response = await axios.get(`${API_URL}/sale-return/show/${saleReturnId}`, {
      headers: { 
        Authorization: `Bearer ${token}` ,
          "Content-Type": "application/json",
          "Accept": "application/json"
      }
    });        
    return response.data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return false;
  }
};

export const addSaleReturn = async (values,token) => {  
  try {
    const response = await axios.post(`${API_URL}/sale-return/add`,values, {
      headers: { 
        Authorization: `Bearer ${token}` ,
          "Content-Type": "application/json",
          "Accept": "application/json"
      }
    });        
    return response.data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return false;
  }
};
export const updateSaleReturn = async (saleReturnId,token) => {  
  try {
    const response = await axios.put(`${API_URL}/sale-return/update/${saleReturnId}`, {
      headers: { 
        Authorization: `Bearer ${token}` ,
          "Content-Type": "application/json",
          "Accept": "application/json"
      }
    });        
    return response.data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return false;
  }
};
export const deleteSaleReturn = async (saleReturnId,token) => {  
  try {
    const response = await axios.delete(`${API_URL}/sale-return/delete/${saleReturnId}`, {
      headers: { 
        Authorization: `Bearer ${token}` ,
          "Content-Type": "application/json",
          "Accept": "application/json"
      }
    });        
    return response.data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return false;
  }
};