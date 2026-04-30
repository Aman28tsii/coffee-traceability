import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

const API = axios.create({
  baseURL: API_URL,  // NO /api here
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add /api prefix to all requests
API.interceptors.request.use(
  (config) => {
    config.url = `/api${config.url}`;
    
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default API;