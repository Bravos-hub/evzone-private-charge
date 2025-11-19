import api from './index';

export const sessionApi = {
  getAll: (params) => api.get('/sessions', { params }),
  getById: (id) => api.get(`/sessions/${id}`),
  start: (data) => api.post('/sessions', data),
  stop: (id) => api.post(`/sessions/${id}/stop`),
  pause: (id) => api.post(`/sessions/${id}/pause`),
  resume: (id) => api.post(`/sessions/${id}/resume`),
};

