import { create } from 'zustand';
import Cookies from 'js-cookie';
import { fetchUserProfile } from '../services/authService';

const secureGetToken = () => localStorage.getItem('token');
const secureRemoveToken = () => localStorage.removeItem('token');

export const useProfileStore = create((set, get) => ({
  isAuthenticated: false,
  user: null,
  permissions: null,
  token: null,
  error: null,
  loading: true,

  initialize: async () => {
    set({ loading: true });
    const token = secureGetToken();
    const userCookie = Cookies.get('user');
    const permissionsCookie = Cookies.get('permissions');

    if (!token) {
      set({ isAuthenticated: false, loading: false });
      return false;
    }

    try {
      // Try to get fresh data from API first
      const result = await fetchUserProfile(token);
      
      if (result?.data) {
        const userData = result.data.user || (userCookie ? JSON.parse(userCookie) : null);
        const permissions = result.data.permissions || (permissionsCookie ? JSON.parse(permissionsCookie) : null);
        
        // Update cookies with fresh data
        Cookies.set('user', JSON.stringify(userData), { expires: 7 });
        if (permissions) {
          Cookies.set('permissions', JSON.stringify(permissions), { expires: 7 });
        }

        set({
          isAuthenticated: true,
          token,
          user: userData,
          permissions,
          loading: false,
          error: null
        });
        return true;
      }

      // Fallback to cookie data if API fails but we have cookies
      if (userCookie) {
        set({
          isAuthenticated: true,
          token,
          user: JSON.parse(userCookie),
          permissions: permissionsCookie ? JSON.parse(permissionsCookie) : null,
          loading: false
        });
        return true;
      }

      // If no valid data found
      secureRemoveToken();
      Cookies.remove('user');
      Cookies.remove('permissions');
      set({ isAuthenticated: false, loading: false });
      return false;

    } catch (error) {
      console.error('Profile initialization error:', error);
      secureRemoveToken();
      Cookies.remove('user');
      Cookies.remove('permissions');
      set({
        isAuthenticated: false,
        token: null,
        user: null,
        permissions: null,
        loading: false,
        error: error.message || 'Failed to initialize session'
      });
      return false;
    }
  },

  login: async (token, userInfo, permissions, remember = false) => {
    try {
      // Store tokens and user data
      localStorage.setItem('token', token);
      Cookies.set('user', JSON.stringify(userInfo), { expires: remember ? 7 : undefined });
      
      if (permissions && Array.isArray(permissions)) {
        Cookies.set('permissions', JSON.stringify(permissions), { expires: remember ? 7 : undefined });
      }

      set({
        isAuthenticated: true,
        token,
        user: userInfo,
        permissions,
        error: null,
        loading: false
      });

      return true;
    } catch (error) {
      console.error('Login error:', error);
      // Clean up on error
      secureRemoveToken();
      Cookies.remove('user');
      Cookies.remove('permissions');
      
      set({
        error: error.message || 'Login failed',
        isAuthenticated: false,
        token: null,
        user: null,
        permissions: null,
        loading: false
      });
      throw error;
    }
  },

  logout: () => {
    secureRemoveToken();
    Cookies.remove('user');
    Cookies.remove('permissions');
    set({ 
      isAuthenticated: false, 
      token: null, 
      user: null,
      permissions: null, 
      loading: false,
      error: null
    });
  },

  // Helper method to check permissions
  hasPermission: (permissionKey) => {
    const { permissions } = get();
    if (!permissions) return false;
    return permissions.some(perm => 
      perm.web_route_key === permissionKey || 
      perm.name === permissionKey
    );
  },

  setError: (error) => set({ error }),
}));