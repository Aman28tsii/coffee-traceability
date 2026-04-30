import axios from 'axios';

// Remove /api from here - it will be added by the interceptor
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

const API = axios.create({
  baseURL: `${API_URL}`,  // Changed: removed /api from here
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add /api to all requests
API.interceptors.request.use(
  (config) => {
    // Add /api prefix to URL if not already there
    if (!config.url.startsWith('/api')) {
      config.url = `/api${config.url}`;
    }
    
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default API;