import api from './index';

export const chargerApi = {
  getAll: (params) => api.get('/charge-points', { params }),
  getById: (id) => api.get(`/charge-points/${id}`),
  getConnectors: (id) => api.get(`/charge-points/${id}/connectors`),
  create: (data) => api.post('/charge-points', data),
  update: (id, data) => api.patch(`/charge-points/${id}`, data),
  delete: (id) => api.delete(`/charge-points/${id}`),
  testConnection: (id) => api.post(`/charge-points/${id}/commands/soft-reset`),
  publish: (id) => api.put(`/charge-points/${id}/publication`, { published: true }),
};
