// src/hooks/usePermissions.js
import { useState, useEffect } from 'react';
import { message } from 'antd';
import permissionService from '../services/';

export const usePermissions = () => {
  // const [permissions, setPermissions] = useState([]);
  // const [loading, setLoading] = useState(false);
  // const [error, setError] = useState(null);

  const fetchPermissions = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await permissionService.getAll();
      setPermissions(result);
    } catch (err) {
      setError(err);
      message.error('Failed to load permissions');
    } finally {
      setLoading(false);
    }
  };

  return {
    fetchPermissions
  };
};