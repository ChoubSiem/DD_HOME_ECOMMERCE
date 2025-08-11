import api from "../api/axiosConfig";

export const fetchUsers = async (token) => {
  try {
    const response = await api.get('/user/list/employee', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response;
  } catch (error) {
    console.error('Error fetching users:', error);
    return false;
  }
};

export const createUser = async (values, token) => {
  try {
    const response = await api.post('/user/create', values, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response;
  } catch (error) {
    console.error('Error creating user:', error);
    return false;
  }
};

export const updateUser = async (id, values, token) => {
  try {
    const response = await api.put(`/user/update/${id}`, values, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response;
  } catch (error) {
    console.error('Error updating user:', error);
    return false;
  }
};

export const deleteUser = async (id, token) => {
  try {
    const response = await api.delete(`/user/delete/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response;
  } catch (error) {
    console.error('Error deleting user:', error);
    return false;
  }
};

export const createEmployee = async (values, token) => {
  try {
    const response = await api.post('/employee/create', values, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    });
    return response;
  } catch (error) {
    console.error('Error creating employee:', error);
    return false;
  }
};

export const showEmployee = async (employeeId, token) => {
  try {
    const response = await api.get(`/user/edit/${employeeId}`, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    });
    return response;
  } catch (error) {
    console.error('Error fetching employee:', error);
    return false;
  }
};

export const fetchCustomer = async (token) => {
  try {
    const response = await api.get('/user/list/customer', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response;
  } catch (error) {
    console.error('Error fetching customers:', error);
    return false;
  }
};

export const quickCreateCustomer = async (values, token) => {
  try {
    const response = await api.post('/customer/quick-create', values, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response;
  } catch (error) {
    console.error('Error quick creating customer:', error);
    return false;
  }
};

export const createCustomer = async (values, token) => {
  try {
    const response = await api.post('/customer/create', values, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response;
  } catch (error) {
    console.error('Error creating customer:', error);
    return false;
  }
};

export const fetchSuppliers = async (token) => {
  try {
    const response = await api.get('/user/list/supplier', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response;
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    return false;
  }
};

export const createSupplier = async (values, token) => {
  try {
    const response = await api.post('/supplier/create', values, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response;
  } catch (error) {
    console.error('Error creating supplier:', error);
    return false;
  }
};

export const updateSupplier = async (supplierId, values, token) => {
  try {
    const response = await api.put(`/supplier/update/${supplierId}`, values, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response;
  } catch (error) {
    console.error('Error updating supplier:', error);
    return false;
  }
};

export const deleteSupplier = async (supplierId, token) => {
  try {
    const response = await api.delete(`/supplier/delete/${supplierId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response;
  } catch (error) {
    console.error('Error deleting supplier:', error);
    return false;
  }
};

// ========================= customer group =================

export const getCustomerGroups = async (token) => {
  try {
    const response = await api.get('/customer-group/list', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response;
  } catch (error) {
    console.error('Error fetching customer groups:', error);
    return false;
  }
};

export const addCustomerGroup = async (values, token) => {
  try {
    const response = await api.post('/customer-group/create', values, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response;
  } catch (error) {
    console.error('Error adding customer group:', error);
    return false;
  }
};

export const updateCustomerGroup = async (groupId, values, token) => {
  try {
    const response = await api.put(`/customer-group/update/${groupId}`, values, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response;
  } catch (error) {
    console.error('Error updating customer group:', error);
    return false;
  }
};

export const deleteCustomerGroup = async (groupId, token) => {
  try {
    const response = await api.delete(`/customer-group/delete/${groupId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response;
  } catch (error) {
    console.error('Error deleting customer group:', error);
    return false;
  }
};

export const deleteCustomer = async (customerId, token) => {
  try {
    const response = await api.delete(`/customer/delete/${customerId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response;
  } catch (error) {
    console.error('Error deleting customer:', error);
    return false;
  }
};

export const updateCustomer = async (customerId, values, token) => {
  try {
    const response = await api.put(`/customer/update/${customerId}`, values, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response;
  } catch (error) {
    console.error('Error updating customer:', error);
    return false;
  }
};

export const importCustomer = async (values, token) => {
  try {
    const response = await api.post('/customer/import', { customers: values }, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response;
  } catch (error) {
    console.error('Error importing customers:', error);
    return false;
  }
};

export const getOneCustomer = async (cusId, token) => {
  try {
    const response = await api.get(`/customer/show/${cusId}`, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response;
  } catch (error) {
    console.error('Error fetching one customer:', error);
    return false;
  }
};
