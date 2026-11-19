import axios from 'axios';

// Determine API base URL:
// 1. In local dev (no VITE_API_URL), defaults to '/api/v1' (forwarded to localhost:5000 by Vite proxy)
// 2. In production, ensures trailing slashes are removed and '/api/v1' is automatically appended if omitted
const getBaseURL = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (!envUrl) {
    return '/api/v1';
  }
  const cleanUrl = envUrl.replace(/\/+$/, '');
  return cleanUrl.endsWith('/api/v1') ? cleanUrl : `${cleanUrl}/api/v1`;
};

const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to attach Authorization header
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('lab_auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle unauthenticated 401s
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token and redirect to login if session expired
      if (window.location.pathname.startsWith('/admin') || window.location.pathname.startsWith('/assistant')) {
        localStorage.removeItem('lab_auth_token');
        localStorage.removeItem('lab_auth_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
