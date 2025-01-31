import axios from 'axios';
import msalInstance from '../authConfig';
import { getUserIdToken } from './authUtils';

// Logout function using MSAL
const handleLogout = async () => {
  try {
    // Remove MSAL tokens and account information
    msalInstance.logoutRedirect();

    // Clear all local storage related to MSAL
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('msal.')) {
        localStorage.removeItem(key);
      }
    });

    // Optional: Clear all local storage if needed
    // localStorage.clear();

    // Redirect to login page or home page
    window.location.href = '/login';
  } catch (error) {
    console.error('Logout error:', error);
  }
};

const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL
});

axiosInstance.interceptors.request.use(
  async (config) => {
    try {
      const token = await getUserIdToken(msalInstance);
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
      return config;
    } catch (error) {
      console.error('Error adding token to request:', error);
      return config;
    }
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling 401 errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Check if the error is a 401 Unauthorized error
    if (error.response && error.response.status === 401) {
      handleLogout();
      return Promise.reject(error);
    }

    // Handle other errors
    return Promise.reject(error);
  }
);

export default axiosInstance;
