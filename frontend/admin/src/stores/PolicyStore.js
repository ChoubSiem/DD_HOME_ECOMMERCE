// src/stores/policyStore.js
import { create } from 'zustand';
import { fetchRoles, fetchPermissions } from '../services/roleAPI';

export const usePolicyStore = create((set, get) => ({
  roles: [],
  permissions: [],
  loading: false,
  error: null,

  // Add this function
  hasPermission: (permissionName) => {
    const { permissions } = get();
    return permissions.some(perm => perm.name === permissionName);
  },

  loadRoles: async (token) => {
    set({ loading: true, error: null });
    try {
      const data = await fetchRoles(token);
      set({ roles: data.roles || [], loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  loadPermissions: async (token) => {
    set({ loading: true, error: null });
    try {
      const data = await fetchPermissions(token);
      set({ permissions: data.permissions || [], loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  }
}));