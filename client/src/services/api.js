import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
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
