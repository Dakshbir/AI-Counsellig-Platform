import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

// Create the API base URL pointing to your backend
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Add request/response interceptors for debugging
axios.interceptors.request.use(request => {
  console.log('Starting Request:', request);
  return request;
});

axios.interceptors.response.use(
  response => {
    console.log('Response:', response);
    return response;
  },
  error => {
    console.log('Response Error:', error);
    return Promise.reject(error);
  }
);


// For debugging - log the API URL
console.log('API URL:', API_URL);

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Check if user is logged in on component mount
    const token = localStorage.getItem('token');
    if (token) {
      // Set up axios headers
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Fetch user profile
      fetchUserProfile();
    } else {
      setLoading(false);
    }
  }, []);
  
  const fetchUserProfile = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/users/me`);
      setUser(response.data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
    } finally {
      setLoading(false);
    }
  };
  
  const login = async (email, password) => {
    try {
      console.log('Attempting login for:', email);
      
      // Format data as form data for OAuth2 compatibility
      const formData = new FormData();
      formData.append('username', email);
      formData.append('password', password);
      
      const response = await axios.post(`${API_URL}/api/users/login`, formData);
      console.log('Login response:', response.data);
      
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(user);
      return true;
    } catch (error) {
      console.error('Login failed', error);
      console.error('Error response:', error.response?.data);
      return false;
    }
  };
  
  const register = async (userData) => {
    try {
      console.log('Registering user with data:', userData);
      console.log('Registration endpoint:', `${API_URL}/api/users`);
      
      // Add explicit headers for clarity
      const config = {
        headers: {
          'Content-Type': 'application/json'
        }
      };
      
      const response = await axios.post(`${API_URL}/api/users`, userData, config);
      console.log('Registration successful, response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Registration failed', error);
      
      // Log more detailed error information
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Error data:', error.response.data);
        console.error('Error status:', error.response.status);
        console.error('Error headers:', error.response.headers);
      } else if (error.request) {
        // The request was made but no response was received
        console.error('Error request:', error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Error message:', error.message);
      }
      
      throw error;
    }
  };
  
  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };
  
  const updateProfile = async (userData) => {
    try {
      const response = await axios.put(`${API_URL}/api/users/me`, userData);
      setUser(response.data);
      return response.data;
    } catch (error) {
      console.error('Profile update failed', error);
      throw error;
    }
  };
  
  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
    isAuthenticated: !!user,
  };
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
