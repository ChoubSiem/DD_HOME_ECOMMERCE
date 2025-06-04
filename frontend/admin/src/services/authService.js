import axios from 'axios';
const API_URL = 'https://backend.ddhomekh.com/api';


export const loginUser = async ({ phone, password }) => {
    try {
      const response = await axios.post(`${API_URL}/login`, {
        phone: phone.toString().trim(),
        password
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
  
      if (response.status !== 200) {
        throw new Error(`Server responded with ${response.status}`);
      }                              
      return response.data;
    } catch (error) {
      const serverMessage = 'message error';

    }
  };

export const logoutUser = async (token) => {
  try {
    
    await axios.post(`${API_URL}/logout`, {}, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    localStorage.clear();
    Cookies.remove("user");
    Cookies.remove("permissions");
  } catch (error) {
    throw new Error('Failed to logout. Please try again.');
  }


};

export const fetchUserProfile = async (token) => {  
  try {
    const response = await axios.get(`${API_URL}/me`, {
      headers: { 
        Authorization: `Bearer ${token}` 
      }
    });        
    return response.data.user;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return false;
  }
};
