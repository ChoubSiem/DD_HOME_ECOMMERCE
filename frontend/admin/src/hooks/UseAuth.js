import { useNavigate } from 'react-router-dom';
import { message } from 'antd';
import { useProfileStore } from '../stores/ProfileStore';
import { loginUser, logoutUser } from '../services/authService';

export const useAuth = () => {
  const navigate = useNavigate();
  const { login, logout, token, setError } = useProfileStore();

  const handleLogin = async (values) => {
    try {
      const { token, user, permissions } = await loginUser(values);            
      login(token, {
        name: user?.username || null,
        role: user?.role || null,
        role_id: user?.role_id || null,
        phone: user?.phone || values.phone,
        warehouse_id: user?.warehouse_id || values.warehouse_id || null,
        }, permissions,values.remember); 

      const success = await login(token, {
        name: user?.username || null,
        id: user?.id || null,
        role: user?.role || null,
        role_id: user?.role_id || null,
        phone: user?.phone || values.phone,
        warehouse_id: user?.warehouse_id || values.warehouse_id || null,

      },permissions, values.remember);
      
      if (success) {
        message.success('Login successful');
        navigate('/');
      }
    } catch (error) {
      const errorMessage = error?.response?.data?.message || error.message || 'Login failed';      
      setError(errorMessage);
      message.error('Your phone number or password is incorrect!');
      return false;
    }
  };

  const handleLogout = async () => {
    try {
      if (token) await logoutUser(token);
    } catch (error) {
      console.warn('Logout warning:', error.message);
    } finally {
      logout();
      message.success('Logged out successfully');
      navigate('/login');
    }
  };

  return {
    handleLogin,
    handleLogout,
    token,
  };
};
