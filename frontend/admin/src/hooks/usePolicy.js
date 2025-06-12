// src/hooks/useRoles.js
import { useState, useEffect } from 'react';
import { message } from 'antd';
import {getRoles,createRole , updateRole,deleteRole, roleWithPermission ,showRolePermissions,updateRolePermissions} from '../services/roleService';
import {fetchRolePermissions} from '../services/permissionService';
export const usePolicy = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const token = localStorage.getItem('token');
  const handleRoles = async () => {
    try {
      
      const result = await getRoles(token);      
      if (result) {
        return {
          success:true,
          roles: result.roles,
          message:result.message
        };
      }
    } catch (err) {
      setError(err);
      message.error('Failed to load roles');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleCreate = async (value,token) => {
    try {
      const result = await createRole(value,token) ;
      if (result) {
        return {
          success:true,
          role: result.role,
          message:result.message
        };
      }
    } catch (err) {
      throw err;
    }
  };

  const handleRoleUpdate = async (roleId,value,token) => {
    try {
      const result = await updateRole(roleId,value,token) ;
      if (result) {
        return {
          success:true,
          role: result.role,
          message:result.message
        };
      }
    } catch (err) {
      throw err;
    }
  };


  const handleRoleDelete = async (roleId,token) => {
    try {
      const result = await deleteRole(roleId,token) ;
      if (result) {
        return {
          success:true,
          role: result.role,
          message:result.message
        };
      }
    } catch (err) {
      throw err;
    }
  };

  const handleRolePermission = async(role_id) => {

      let result = await fetchRolePermissions(token , role_id);      
      if (result) {
        return {
          success:true,
          rolePermissions:result,
  
        }
      }
  }
  const handleRoleHasPermission = async(role_id) => {

      let result = await roleWithPermission(token , role_id);      
      if (result) {
        return {
          success:true,
          rolePermissions:result,
  
        }
      }
  }
  const handleShowRolePermission = async(token,role_id) => {

      let result = await showRolePermissions(token , role_id);      
      if (result) {
        return {
          success:true,
          rolePermissions:result,
  
        }
      }
  }
  const handleUpdateRolePermission = async(token,values,roleId) => {

      let result = await updateRolePermissions(token , values,roleId);      
      if (result) {
        return {

          success:true,
          message:result.message,
  
        }
      }
  }

  return {
    roles,
    loading,
    error,
    updateRole,
    deleteRole,
    handleRoles,
    handleRolePermission,

    handleRoleCreate,
    handleRoleUpdate,
    handleRoleDelete,
    handleRoleHasPermission,
    handleShowRolePermission,
    handleUpdateRolePermission
  };
};