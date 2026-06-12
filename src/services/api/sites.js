import api from './index';

export const sitesApi = {
  getAll: (params) => api.get('/sites', { params }),
  getById: (id) => api.get(`/sites/${id}`),
  create: (data) => api.post('/sites', data),
  update: (id, data) => api.patch(`/sites/${id}`, data),
  remove: (id) => api.delete(`/sites/${id}`),
  getStats: (id) => api.get(`/sites/${id}/stats`),
};
