import { create } from 'zustand';
import { PermissionService } from '../services/permissionService';

export const usePermissionStore = create((set) => ({
  permissions: [],
  isLoading: false,
  error: null,

//   const {createPermission } = PermissionService(),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  // Async Actions
  loadPermissions: async () => {
    try {
      set({ isLoading: true, error: null });
      const permissions = await PermissionService.fetchPermissions();
      set({ permissions });
    } catch (error) {
      set({ error: error.message });
    } finally {
      set({ isLoading: false });
    }
  },

  createPermission: async (payload) => {
    try {
      set({ isLoading: true });
      const newPermission = await PermissionService.addPermission(payload);
      set((state) => ({ permissions: [...state.permissions, newPermission] }));
      return newPermission;
    } catch (error) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  // Add other actions (update, delete) as needed
}));