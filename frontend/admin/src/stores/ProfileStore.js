import { create } from 'zustand';
import Cookies from 'js-cookie';
// import { useNavigate } from 'react-router-dom';
import { fetchUserProfile } from '../services/authService';

const secureGetToken = () => {
  return localStorage.getItem('token');
};

const secureRemoveToken = () => {
  localStorage.removeItem('token');
};
// let token =  localStorage.getItem('token');

export const useProfileStore = create((set) => ({
  isAuthenticated: false,
  user: null,
  permissions:null,
  token: null,
  error: null,
  loading: true,

  initialize: async (navigate) => {
    // const navigate = useNavigate();
    const token = localStorage.getItem('token');

    const user = Cookies.get('user');    
    if (!token) {
      set({ isAuthenticated: false, loading: false });
      return;
    }

  
    try {
      const result = await fetchUserProfile(token);                        
      if (result) {
        set({
          isAuthenticated: true,
          token,
          user: user ? JSON.parse(user) : null,
          loading: false,
        });
      }else{
        navigate("/login");
        Cookies.remove("permission");
      }
    } catch (error) {
      set({
        isAuthenticated: false,
        token,
        user: null,
        permissions:null,
        loading: false,
      });
      localStorage.removeItem('token');
      Cookies.remove('user');
      navigate("/login");
    }
  },
  
  
  login: async (token, userInfo,permissions, remember) => {
    return new Promise(async (resolve, reject) => {
      try {
        localStorage.setItem('token', token);
        Cookies.set('user', JSON.stringify(userInfo), { expires: remember ? 7 : null });
        Cookies.set('permissions', JSON.stringify(permissions));
        
        set({
          isAuthenticated: true,
          token,
          user: userInfo,
          permissions:permissions,
          error: null,
          loading: false
        });
  
        resolve(true);
      } catch (error) {
        set({
          error: error.message,
          isAuthenticated: false,
          token: null,
          permissions:null,
          user: null,
          loading: false
        });
        reject(error);
      }
    });
  },
  
  
  

  // Handle logout: Remove token and user data
  logout: () => {
    localStorage.removeItem('token');
    set({ isAuthenticated: false, token: null, user: null,permissions:null, loading: false });
  },

  setError: (error) => set({ error }),
  refreshToken: async () => {
    try {
      const response = await fetch('http://yourapi.com/refresh-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: secureGetToken() }),
      });

      const data = await response.json();
      if (data.token) {
        secureStoreToken(data.token); 
        set({ token: data.token }); 
      }
    } catch (error) {
      set({ error: 'Failed to refresh token' });
    }
  },
}));
