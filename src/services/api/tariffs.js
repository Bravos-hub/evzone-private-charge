import api from './index';

export const tariffsApi = {
  getTemplates: () => api.get('/tariffs/templates'),
  getAll: (params) => api.get('/tariffs', { params }),
  getById: (id) => api.get(`/tariffs/${id}`),
  create: (data) => api.post('/tariffs', data),
  update: (id, data) => api.patch(`/tariffs/${id}`, data),
  clone: (id, data) => api.post(`/tariffs/${id}/clone`, data || {}),
  activate: (id, data) => api.post(`/tariffs/${id}/activate`, data || {}),
  archive: (id, data) => api.post(`/tariffs/${id}/archive`, data || {}),
  suspend: (id, data) => api.post(`/tariffs/${id}/suspend`, data || {}),
  simulate: (data) => api.post('/tariffs/simulate', data),
};
