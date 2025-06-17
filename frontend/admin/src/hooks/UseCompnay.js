import { message } from 'antd';
import { fetchCompany , createCompany, updateCompany,deleteCompnay,showCompany} from '../services/companyService';
import { fetchRegional, updateRegional ,createRegional,showRegional,deleteRegional} from '../services/regionalService';
import { fetchWarehouse , createWarehouse,showWarehouse, updateWarehouse,deleteWarehouse } from '../services/warehouseService';

export const useCompany = () => {
  const handleCompany = async (token) => {
    try {
      const companyData = await fetchCompany(token);            
      return {
        success: true,
        companies: companyData.companies,     
        message: companyData.message  
      };
      
    } catch (error) {
      
    }
  };

  const handleCompanyCreate = async (values, token) => {
    try {
      const response = await createCompany(values, token);
      return {
        success: true,
        data: response.data.company, 
        message: response.data.message || "Company created successfully",
      };
    } catch (error) {
      return {
        success: false,
        message: error?.response?.data?.message || "Failed to create company",
      };
    }
  };
  const handleCompanyEdit = async (id, token) => {
    try {
      const response = await showCompany(id, token);
      return {
        success: true,
        data: response.company, 
        message: response.message || "Company created successfully",
      };
    } catch (error) {
      return {
        success: false,
        message: error?.response?.data?.message || "Failed to create company",
      };
    }
  };
  const handleCompanyUpdate = async (values, token , currentCompany) => {
    try {
      const companyId = values?.id || currentCompany?.id;
      const response = await updateCompany(companyId, values, token);
      
      return {
        success: true,
        data: response.company, 
        message: response.message || "Company updated successfully",
      };
    } catch (error) {
      console.error("Error updating company:", error);
      return {
        success: false,
        message: error?.response?.data?.message || "Failed to update company",
      };
    }
  };
  
  
  const handleCompanyDelete = async (id, token) => {
    if (!id) return { success: false, message: "Company ID is missing" };
  
    try {
      const response = await deleteCompnay(id, token);
      return { success: true, message: response.message || "Company deleted successfully" };
    } catch (error) {
      return { success: false, message: error?.response?.data?.message || "Failed to delete company" };
    }
  };
  
  
  
  
  const handleRegional = async (token) => {
    try {
      const regionalData = await fetchRegional(token);            
      return {
        success: true,
        regionals: regionalData.regionals,     
        message: regionalData.message  
      };
      
    } catch (error) {
      
    }
  };
  
  const handleRegionalCreate = async (values,token) => {
    try {
      const regionalData = await createRegional(values,token);       
      
      return {
        success: true,
        regionals: regionalData.regional,     
        message: regionalData.message  
      };
      
    } catch (error) {
      
    }
  };
  const handleRegionalEdit = async (id, token) => {
    try {
      const response = await showRegional(id, token);
      return {
        success: true,
        data: response.regional, 
        message: response.message || "Company created successfully",
      };
    } catch (error) {
      return {
        success: false,
        message: error?.response?.data?.message || "Failed to create company",
      };
    }
  };
  
  const handleRegionalUpdate = async (values, token , regionalId) => {
    try {
      const response = await updateRegional(regionalId, values, token);      
      return {
        success: true,
        data: response.regional, 
        message: response.message || "Regional updated successfully",
      };
    } catch (error) {
      console.error("Error updating regional:", error);
      return {
        success: false,
        message: error?.response?.data?.message || "Failed to update company",
      };
    }
  };
  const handleRegionalDelete = async (regionalId,token ) => {
    try {
      const response = await deleteRegional(regionalId, token);      
      return {
        success: response.success,
        data: response.regional, 
        message: response.message,
      };
    } catch (error) {
      console.error("Error updating regional:", error);
      return {
        success: false,
        message: error?.response?.data?.message || "Failed to update company",
      };
    }
  };

  const handleWarehouse = async (token) => {
    try {
      const warehouseData = await fetchWarehouse(token);            
      return {
        success: true,
        warehouses: warehouseData.warehouses,     
        message: warehouseData.message  
      };
      
    } catch (error) {
      
    }
  };
  
  const handleWarehouseCreate = async (values,token) => {
    try {
      const warehouseData = await createWarehouse(values,token);          
      console.log(warehouseData);              
      return {
        success: true,
          warehouse: warehouseData.warehouse,     
        message: warehouseData.message  
      };
      
    } catch (error) {
      
    }
  };

  const handleWarehouseEdit = async (id, token) => {
    try {
      const response = await showWarehouse(id, token);      
      return {
        success: true,
        data: response.warehouse, 
        message: response.message || "Warehouse created successfully",
      };
    } catch (error) {
      return {
        success: false,
        message: error?.response?.data?.message || "Failed to create warehouse",
      };
    }
  };

  const handleWarehouseUpdate = async (values, token , id) => {
    try {
      const response = await updateWarehouse(id, values, token);
      console.log(response);
      
      return {
        success: true,
        data: response.warehouse, 
        message: response.message || "Warehouse updated successfully",
      };
    } catch (error) {
      console.error("Error updating warehouse:", error);
      return {
        success: false,
        message: error?.response?.data?.message || "Failed to update warehouse",
      };
    }
  };
  // const handleWarehouseId = async (userId,token) => {
  //   try {
  //     const response = await getWarehoueId(userId,token);
      
  //     return {
  //       success: true,
  //       warehouse_id: response, 
  //       message: response.message || "Warehouse get successfully",
  //     };
  //   } catch (error) {
  //     console.error("Error updating warehouse:", error);
  //     return {
  //       success: false,
  //       message: error?.response?.data?.message || "Failed to update warehouse",
  //     };
  //   }
  // };

  const handleWarehouseDelete = async (id , token) => {
    try {
      const response = await deleteWarehouse(id, token);      
      return {
        success: true,
        data: response.warehouse, 
        message: response.message || "Warehouse updated successfully",
      };
    } catch (error) {
      console.error("Error updating warehouse:", error);
      return {
        success: false,
        message: error?.response?.data?.message || "Failed to update warehouse",
      };
    }
  };

  return { 
    handleCompany,
    handleRegional,
    handleWarehouse ,
    handleCompanyCreate,
    handleCompanyUpdate,
    handleWarehouseEdit,
    handleCompanyEdit,
    handleCompanyDelete,
    handleRegionalCreate,
    handleRegionalEdit,
    handleRegionalUpdate,
    handleWarehouseCreate,
    handleWarehouseUpdate,
    handleRegionalDelete,
    handleWarehouseDelete
  };
};