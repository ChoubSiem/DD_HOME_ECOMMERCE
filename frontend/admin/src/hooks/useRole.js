// src/hooks/useRoles.js
import { useState, useEffect } from 'react';
import { message } from 'antd';
import roleService from '../services/roleService';

export const useRoles = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRoles = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await roleService.getAll();
      setRoles(result);
    } catch (err) {
      setError(err);
      message.error('Failed to load roles');
    } finally {
      setLoading(false);
    }
  };

  const createRole = async (roleData) => {
    try {
      const result = await roleService.create(roleData);
      await fetchRoles();
      return result;
    } catch (err) {
      throw err;
    }
  };

  const updateRole = async (roleData) => {
    try {
      const result = await roleService.update(roleData);
      await fetchRoles();
      return result;
    } catch (err) {
      throw err;
    }
  };

  const deleteRole = async (roleId) => {
    try {
      await roleService.delete(roleId);
      await fetchRoles();
    } catch (err) {
      throw err;
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  return {
    roles,
    loading,
    error,
    createRole,
    updateRole,
    deleteRole,
    fetchRoles
  };
};