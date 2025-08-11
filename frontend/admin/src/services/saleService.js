import api from "../api/axiosConfig";

export const getPosSales = async (warehouseId, token) => {  
  try {
    const response = await api.get('/pos-sale/list', {
      headers: { Authorization: `Bearer ${token}` },
      params: { warehouse_id: warehouseId }
    });        
    return response;
  } catch (error) {
    console.error('Error fetching POS sales:', error);
    return false;
  }
};

export const getSalesInventory = async (warehouseId, token) => {  
  try {
    const response = await api.get('/sale/list', {
      headers: { Authorization: `Bearer ${token}` },
      params: { warehouse_id: warehouseId }
    });            
    return response;
  } catch (error) {
    console.error('Error fetching sales inventory:', error);
    return false;
  }
};

export const addPosSale = async (values, token) => {  
  try {
    const response = await api.post('/pos-sale/create', values, {
      headers: { Authorization: `Bearer ${token}` }
    });        
    return response;
  } catch (error) {
    console.error('Error adding POS sale:', error);
    return false;
  }
};

export const addOpenShift = async (values, token) => {  
  try {
    const response = await api.post('/open-shift/create', values, {
      headers: { 
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "Accept": "application/json"
      }
    });        
    return response;
  } catch (error) {
    console.error('Error adding open shift:', error);
    return false;
  }
};

export const addCloseShift = async (values, token) => {  
  try {
    const response = await api.post('/close-shift/create', values, {
      headers: { 
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "Accept": "application/json"
      }
    });        
    return response;
  } catch (error) {
    console.error('Error adding close shift:', error);
    return false;
  }
};

export const getOneOpenShift = async (shiftId, warehouse_id, token) => {
  if (!shiftId || !warehouse_id || !token) {
    console.error('Missing required parameters:', { warehouse_id, token });
    throw new Error('Missing required parameters');
  }
  
  try {
    const response = await api.get(`/open-shift/show/${shiftId}`, {
      params: { warehouse_id },
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response) {
      throw new Error('No data received from server');
    }    
    return {
      success: true,
      data: response,
      status: response.status
    };

  } catch (error) {
    let errorMessage = 'Error fetching shift data';
    
    if (error.response) {
      console.error('Server responded with error status:', {
        status: error.response.status,
        data: error.response,
        headers: error.response.headers
      });
      errorMessage = error.response?.message || `Server error: ${error.response.status}`;
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
  if (!warehouse_id || !token) {
    console.error('Missing required parameters:', { warehouse_id, token });
    throw new Error('Missing required parameters');
  }
  
  try {
    const response = await api.get('/open-shift/processing-shift', {
      params: { warehouse_id },
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response) {
      throw new Error('No data received from server');
    }    
    return {
      success: true,
      data: response.shift,
      status: response.status
    };

  } catch (error) {
    let errorMessage = 'Error fetching shift data';
    
    if (error.response) {
      console.error('Server responded with error status:', {
        status: error.response.status,
        data: error.response,
        headers: error.response.headers
      });
      errorMessage = error.response?.message || `Server error: ${error.response.status}`;
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

export const updateOpenShift = async (shiftId, values, token) => {  
  try {
    const response = await api.put(`/open-shift/update/${shiftId}`, values, {
      headers: { 
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "Accept": "application/json"
      }
    });        
    return response;
  } catch (error) {
    console.error('Error updating open shift:', error);
    return false;
  }
};

export const getSalePaymentOne = async (saleId, token) => {  
  try {
    const response = await api.get(`/sale-payment/show/${saleId}`, {
      headers: { 
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "Accept": "application/json"
      }
    });        
    return response;
  } catch (error) {
    console.error('Error fetching sale payment:', error);
    return false;
  }
};

export const getOneInventorySale = async (saleId, token) => {  
  try {
    const response = await api.get(`/sale/edit/${saleId}`, {
      headers: { 
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "Accept": "application/json"
      }
    });        
    return response;
  } catch (error) {
    console.error('Error fetching inventory sale:', error);
    return false;
  }
};

export const getOnePosSale = async (saleId, token) => {  
  try {
    const response = await api.get(`/pos-sale/edit/${saleId}`, {
      headers: { 
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "Accept": "application/json"
      }
    });        
    return response;
  } catch (error) {
    console.error('Error fetching POS sale:', error);
    return false;
  }
};

export const updateSaleInventory = async (saleId, values, token) => {  
  try {
    const response = await api.put(`/sale/update/${saleId}`, values, {
      headers: { 
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "Accept": "application/json"
      }
    });        
    return response;
  } catch (error) {
    console.error('Error updating sale inventory:', error);
    return false;
  }
};

export const deleteSaleInventory = async (saleId, token) => {  
  try {
    const response = await api.delete(`/sale/delete/${saleId}`, {
      headers: { 
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "Accept": "application/json"
      }
    });        
    return response;
  } catch (error) {
    console.error('Error deleting sale inventory:', error);
    return false;
  }
};

export const deletePosSale = async (saleId, token) => {  
  try {
    const response = await api.delete(`/pos-sale/delete/${saleId}`, {
      headers: { 
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "Accept": "application/json"
      }
    });        
    return response;
  } catch (error) {
    console.error('Error deleting POS sale:', error);
    return false;
  }
};

export const getSaleReturn = async (warehouseId, token) => {  
  try {
    const response = await api.get('/sale-return/list', {
      headers: { 
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      params: { warehouse_id: warehouseId }
    });        
    return response;
  } catch (error) {
    console.error('Error fetching sale return list:', error);
    return false;
  }
};

export const getOneSaleReturn = async (saleReturnId, token) => {  
  try {
    const response = await api.get(`/sale-return/show/${saleReturnId}`, {
      headers: { 
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "Accept": "application/json"
      }
    });        
    return response;
  } catch (error) {
    console.error('Error fetching sale return:', error);
    return false;
  }
};

export const addSaleReturn = async (values, token) => {  
  try {
    const response = await api.post('/sale-return/add', values, {
      headers: { 
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "Accept": "application/json"
      }
    });        
    return response;
  } catch (error) {
    console.error('Error adding sale return:', error);
    return false;
  }
};

export const updateSaleReturn = async (saleReturnId, token) => {  
  try {
    const response = await api.put(`/sale-return/update/${saleReturnId}`, null, {
      headers: { 
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "Accept": "application/json"
      }
    });        
    return response;
  } catch (error) {
    console.error('Error updating sale return:', error);
    return false;
  }
};

export const deleteSaleReturn = async (saleReturnId, token) => {  
  try {
    const response = await api.delete(`/sale-return/delete/${saleReturnId}`, {
      headers: { 
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "Accept": "application/json"
      }
    });        
    return response;
  } catch (error) {
    console.error('Error deleting sale return:', error);
    return false;
  }
};
