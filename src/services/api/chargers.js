import api from './index';

export const chargerApi = {
  getAll: () => api.get('/charge-points'),
  getById: (id) => api.get(`/charge-points/${id}`),
  create: (data) => api.post('/charge-points', data),
  update: (id, data) => api.patch(`/charge-points/${id}`, data),
  delete: (id) => api.delete(`/charge-points/${id}`),
  testConnection: (id) => api.post(`/charge-points/${id}/commands/soft-reset`),
  publish: (id) => api.put(`/charge-points/${id}/publication`, { published: true }),
};

