import api from './index';

export const chargerApi = {
  getAll: (params) => api.get('/chargers', { params }),
  getById: (id) => api.get(`/chargers/${id}`),
  getStatus: (id) => api.get(`/chargers/${id}/status`),
  create: (data) => api.post('/chargers', data),
  update: (id, data) => api.put(`/chargers/${id}`, data),
  delete: (id) => api.delete(`/chargers/${id}`),
  // Legacy endpoints (stub for future implementation)
  testConnection: (id) => api.post(`/chargers/${id}/test-connection`),
  publish: (id) => api.post(`/chargers/${id}/publish`),
};

