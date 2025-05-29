import { message } from 'antd';
import { fetchPermissions } from '../services/permissionService';
export const usePermission = () => {
  const handlePermission = async (token) => {
    try {
      const permissionData = await fetchPermissions(token);            
      return {
        success: true,
        data: permissionData,
        permissions: permissionData.permissions, 
        roles: permissionData.roles            
      };
      
    } catch (error) {
      
    }
  };

  return { handlePermission };
};