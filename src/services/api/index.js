import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api/v1',
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// The shared EVzone backend authenticates via httpOnly cookies. Keep only
// non-sensitive tenant routing hints in browser storage.
api.interceptors.request.use((config) => {
  const tenantId = localStorage.getItem('activeTenantId');
  if (tenantId && !config.headers['x-tenant-id']) {
    config.headers['x-tenant-id'] = tenantId;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      window.dispatchEvent(new CustomEvent('evzone:auth:expired'));
    }
    return Promise.reject(error);
  }
);

export default api;

