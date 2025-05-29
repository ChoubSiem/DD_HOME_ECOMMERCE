import { create } from 'zustand';
import { fetchRoles, fetchPermissions, createRole, updateRole, deleteRole } from '../services/permissionService';

export const usePolicyStore = create((set) => ({
  roles: [],
  permissions: [],
  loading: false,
  error: null,

  loadRoles: async (token) => {
    set({ loading: true, error: null });
    try {
      const response = await fetchRoles(token);
      set({ roles: response.roles, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  loadPermissions: async (token) => {
    set({ loading: true, error: null });
    try {
      const response = await fetchPermissions(token);
      set({ permissions: response.data, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },
  setPermissions: (newPermissions) => set({ 
    permissions: Array.isArray(newPermissions) ? newPermissions : [] 
  }),

  addRole: async (roleData, token) => {
    set({ loading: true });
    try {
      const response = await createRole(roleData, token);
      set(state => ({ 
        roles: [...state.roles, response.data],
        loading: false 
      }));
      return response.data;
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  // Update role
  updateRole: async (roleId, updates, token) => {
    set({ loading: true });
    try {
      const response = await updateRole(roleId, updates, token);
      set(state => ({
        roles: state.roles.map(role => 
          role.id === roleId ? response.data : role
        ),
        loading: false
      }));
      return response.data;
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  // Delete role
  removeRole: async (roleId, token) => {
    set({ loading: true });
    try {
      await deleteRole(roleId, token);
      set(state => ({
        roles: state.roles.filter(role => role.id !== roleId),
        loading: false
      }));
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  // Helper function
  getRoleById: (roleId) => {
    return get().roles.find(role => role.id === roleId);
  }
}));