import axios from 'axios';
const API_BASE = 'http://127.0.0.1:8000/api';

export const fetchUsers = async (token) => {
  
  const response = await axios.get(`${API_BASE}/user/list/${"employee"}`, {
    headers: { Authorization: `Bearer ${token}` }
  });  
  return response.data;
};


export const createUser = async (values, token) => {
  const response = await axios.post(`${API_BASE}/user/create`, values, {
    headers: { Authorization: `Bearer ${token}` }
  });
  
  return response;
};

export const updateUser = async (id, values, token) => {
  const response = await axios.put(`${API_BASE}/user/update/${id}`, values, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const deleteUser = async (id, token) => {
  const response = await axios.delete(`${API_BASE}/user/delete/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response;
};


export const createEmployee = async ( values,token) => {
  const response = await axios.post(`${API_BASE}/employee/create`,values, {
    headers: { Authorization: `Bearer ${token}`,
                 'Content-Type': 'multipart/form-data'
  }
});
  return response.data;
};


export const showEmployee = async ( employeeId,token) => {
  const response = await axios.get(`${API_BASE}/user/edit/${employeeId}`, {
    headers: {
                   Authorization: `Bearer ${token}`,
                 'Content-Type': 'multipart/form-data'
              }
  });  
  return response.data;
};




export const fetchCustomer = async (token) => {
  
  const response = await axios.get(`${API_BASE}/user/list/${"customer"}`, {
    headers: { Authorization: `Bearer ${token}` }
  });  
  return response.data;
};

export const quickCreateCustomer = async (values,token) => {
  
  const response = await axios.post(`${API_BASE}/customer/quick-create`,values, {
    headers: { Authorization: `Bearer ${token}` }
  });  
  return response.data;
};
export const createCustomer = async (values,token) => {
  
  const response = await axios.post(`${API_BASE}/customer/create`,values, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: values.username,
          phone: values.phone,
          address: values.address,
          customer_group_id: values.customer_group_id
        })

  });  
  return response.data;
};

export const fetchSuppliers = async (token) => {
  
  const response = await axios.get(`${API_BASE}/user/list/${"supplier"}`, {
    headers: { Authorization: `Bearer ${token}` }
  });  
  return response.data;
};

export const createSupplier = async (values,token) => {
  
  const response = await axios.post(`${API_BASE}/supplier/create`,values, {
    headers: { Authorization: `Bearer ${token}` }
  });  
  return response.data;
};
export const updateSupplier = async (supplierId,values,token) => {
  
  const response = await axios.put(`${API_BASE}/supplier/update/${supplierId}`,values, {
    headers: { Authorization: `Bearer ${token}` }
  });  
  return response.data;
};
export const deleteSupplier = async (supplierId,token) => {
  
  const response = await axios.delete(`${API_BASE}/supplier/delete/${supplierId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });  
  return response.data;
};

//========================= customer group =================

export const getCustomerGroups = async (token) => {
  
  const response = await axios.get(`${API_BASE}/customer-group/list`, {
    headers: { Authorization: `Bearer ${token}` }
  });  
  return response.data;
};


export const addCustomerGroup = async (values,token) => {
  
  const response = await axios.post(`${API_BASE}/customer-group/create`,values, {
    headers: { Authorization: `Bearer ${token}` }
  });  
  return response.data;
};
export const updateCustomerGroup = async (groupId,values,token) => {
  
  const response = await axios.put(`${API_BASE}/customer-group/update/${groupId}`,values, {
    headers: { Authorization: `Bearer ${token}` }
  });  
  return response.data;
};
export const deleteCustomerGroup = async (groupId,token) => {
  
  const response = await axios.delete(`${API_BASE}/customer-group/delete/${groupId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });  
  return response.data;
};
export const deleteCustomer = async (groupId,token) => {
  
  const response = await axios.delete(`${API_BASE}/customer/delete/${groupId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });  
  return response.data;
};
export const udpateCustomer = async (customId,values,token) => {
  
  const response = await axios.put(`${API_BASE}/customer/update/${customId}`,values, {
    headers: { Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
    // body: JSON.stringify({
    //   username: values.username,
    //   phone: values.phone,
    //   address: values.address,
    //   customer_group_id: values.customer_group_id
    // })
  });  
  // console.log(response);
  
  return response.data;
};
export const importCustomer = async (values,token) => {
  
  const response = await axios.post(`${API_BASE}/customer/import`,{customers:values}, {
    headers: { Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  });  
  return response.data;
};
export const getOneCustomer = async (cusId,token) => {
  
  const response = await axios.get(`${API_BASE}/customer/show/${cusId}`, {
    headers: { Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  });  
  return response.data;
};
