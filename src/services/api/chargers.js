import api from './index';

export const chargerApi = {
  getAll: () => api.get('/chargers'),
  getById: (id) => api.get(`/chargers/${id}`),
  create: (data) => api.post('/chargers', data),
  update: (id, data) => api.put(`/chargers/${id}`, data),
  delete: (id) => api.delete(`/chargers/${id}`),
  testConnection: (id) => api.post(`/chargers/${id}/test-connection`),
  publish: (id) => api.post(`/chargers/${id}/publish`),
};

