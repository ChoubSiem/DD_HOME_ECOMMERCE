import api from '../api/axiosConfig';
import Cookies from 'js-cookie';  

export const loginUser = async ({ phone, password }) => {
  try {
    const response = await api.post('/login', {
      phone: phone.toString().trim(),
      password, 
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });    
    return response;
  } catch (error) {
    const message = error.response?.message || error.message || 'Login failed';
    throw new Error(message);
  }
};

export const logoutUser = async () => {
  try {
    await api.post('/logout');
    localStorage.clear();
    Cookies.remove('user');
    Cookies.remove('permissions');
  } catch (error) {
    throw new Error('Failed to logout. Please try again.');
  }
};

export const fetchUserProfile = async () => {
  try {
    const response = await api.get('/me', {
      headers: { Accept: 'application/json' }, 
    });

    return response.user;
  } catch (error) {
    console.error('Fetch user error:', error.response || error.message || error);
    return false;
  }
};
