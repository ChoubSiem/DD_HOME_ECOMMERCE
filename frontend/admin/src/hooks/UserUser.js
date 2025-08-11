import { message } from 'antd';
import { 
  fetchUsers , 
  createEmployee  ,
  showEmployee,
  updateUser, 
  fetchSuppliers , 
  createCustomer,
  quickCreateCustomer,
  fetchCustomer,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  addCustomerGroup,
  getCustomerGroups,
  updateCustomerGroup,
  deleteCustomerGroup,
  updateCustomer,
  deleteCustomer,
  importCustomer,
  getOneCustomer
} from '../services/userService';

export const useUser = () => {
  const handleEmployee = async (token) => {
    try {
      const employeeData = await fetchUsers(token);                  
      return {
        success: true,
        data: employeeData,
        employees: employeeData.users, 
        roles: employeeData.roles            
      };
      
    } catch (error) {
      message.error(error.message);
      return {
        success: false,
        error: error.message
      };
    }
  };
  const handleEmployeeCreate = async (values,token) => {
    try {
      const employeeData = await createEmployee(values,token);                  
      return {
        success: true,
        employee: employeeData.employee, 
      };
      
    } catch (error) {
      message.error(error.message);
      return {
        success: false,
        error: error.message
      };
    }
  };
  const handleEmployeeEdit = async (employeeId , token) => {
    try {
      const employeeData = await showEmployee(employeeId,token);                  
      return {
        success: true,
        employee: employeeData.customer, 
      };
      
    } catch (error) {
      message.error(error.message);
      return {
        success: false,
        error: error.message
      };
    }
  };

  const handleEmployeeUpdate = async (employeeId,values , token) => {
    
    try {
      const employeeData = await updateUser(employeeId,values,token);                  
      return {
        success: true,
        employee: employeeData.customer, 
      };
      
    } catch (error) {
      message.error(error.message);
      return {
        success: false,
        error: error.message
      };
    }
  };
  const handleSuppliers = async ( token) => {
    try {
      const supplierData = await fetchSuppliers(token);                  
      return {
        success: true,
        suppliers: supplierData.users, 
      };
      
    } catch (error) {
      message.error(error.message);
      return {
        success: false,
        error: error.message
      };
    }
  };
  const handleCustomerQuickCreate = async (values, token) => {
    try {
      const customerData = await quickCreateCustomer(values,token);                  
      return {
        success: true,
        customer: customerData.customer, 
      };
      
    } catch (error) {
      message.error(error.message);
      return {
        success: false,
        error: error.message
      };
    }
  };
  const handleCustomerCreate = async (values, token) => {
    try {
      const customerData = await createCustomer(values,token);                  
      return {
        success: true,
        customer: customerData.customer, 
      };
      
    } catch (error) {
      message.error(error.message);
      return {
        success: false,
        error: error.message
      };
    }
  };
  const handleCustomers = async ( token) => {
    try {
      const customerData = await fetchCustomer(token);                  
      return {
        success: true,
        customers: customerData.users, 
      };
      
    } catch (error) {
      
    }
  };
  const handleSupplierCreate = async (values, token) => {
    try {
      const supplierData = await createSupplier(values,token);                  
      return {
        success: true,
        supplier: supplierData.supplier, 
      };
      
    } catch (error) {
      message.error(error.message);
      return {
        success: false,
        error: error.message
      };
    }
  };
  const handleSupplierUpdate = async (supplierId,values, token) => {
    try {
      const supplierData = await updateSupplier(supplierId,values,token);                  
      return {
        success: true,
        supplier: supplierData.supplier, 
      };
      
    } catch (error) {
      message.error(error.message);
      return {
        success: false,
        error: error.message
      };
    }
  };
  const handleDeleteSupplier = async (supplierId, token) => {
    try {
      const supplierData = await deleteSupplier(supplierId,token);                  
      return {
        success: true,
        supplier: supplierData.supplier, 
      };
      
    } catch (error) {
      message.error(error.message);
      return {
        success: false,
        error: error.message
      };
    }
  };

  const handleCreateCustomerGroup = async (values, token) => {
    try {
      const group = await addCustomerGroup(values,token);                  
      return {
        success: true,
        groups: group.data, 
      };
      
    } catch (error) {
      message.error(error.message);
      return {
        success: false,
        error: error.message
      };
    }
  };
  const handleGetCustomerGroup = async (token) => {
    try {
      const group = await getCustomerGroups(token);                  
      return {
        success: true,
        groups: group.groups, 
      };
      
    } catch (error) {
      message.error(error.message);
      return {
        success: false,
        error: error.message
      };
    }
  };
  const handleUpdateCustomerGroup = async (groupId , values , token) => {
    try {
      const group = await updateCustomerGroup(groupId,values,token);                  
      return {
        success: true,
        group: group.group, 
      };
      
    } catch (error) {
      message.error(error.message);
      return {
        success: false,
        error: error.message
      };
    }
  };
  const handleDeleteCustomerGroup = async (groupId  , token) => {
    try {
      const group = await deleteCustomerGroup(groupId,token);                  
      return {
        success: true,
        group: group.group, 
      };
      
    } catch (error) {
      message.error(error.message);
      return {
        success: false,
        error: error.message
      };
    }
  };
  const handleUpdateCustomer = async (groupId ,values , token) => {
    try {
      const result = await updateCustomer(groupId,values,token);                  
      return {
        success: true,
        customer: result.customer, 
      };
      
    } catch (error) {
      message.error(error.message);
      return {
        success: false,
        error: error.message
      };
    }
  };
  const handleDeleteCustomer = async (groupId  , token) => {
    try {
      const result = await deleteCustomer(groupId,token);                  
      return {
        success: true,
        customer: result.customer, 
      };
      
    } catch (error) {
      message.error(error.message);
      return {
        success: false,
        error: error.message
      };
    }
  };
  const handleImportCustomer = async (values  , token) => {
    try {
      const result = await importCustomer(values,token);                  
      return {
        success: true,
        customer: result.customer, 
        message: result.message, 
      };
      
    } catch (error) {
      message.error(error.message);
      return {
        success: false,
        error: error.message
      };
    }
  };
  const handleGetOneCustomer = async (useId  , token) => {
    try {
      const result = await getOneCustomer(useId,token);                  
      return {
        success: true,
        customer: result.customer, 
        message: result.message, 
      };
      
    } catch (error) {
      message.error(error.message);
      return {
        success: false,
        error: error.message
      };
    }
  };

  
  
  return { 
    handleEmployee ,
    handleEmployeeCreate , 
    handleEmployeeEdit,
    handleEmployeeUpdate,
    handleSuppliers,
    handleCustomerCreate,
    handleCustomers, 
    handleSupplierCreate,
    handleSupplierUpdate,
    handleDeleteSupplier,
    handleCreateCustomerGroup,
    handleGetCustomerGroup,
    handleUpdateCustomerGroup,
    handleDeleteCustomerGroup,
    handleCustomerQuickCreate,
    handleUpdateCustomer,
    handleDeleteCustomer,
    handleImportCustomer,
    handleGetOneCustomer
  
  };
};