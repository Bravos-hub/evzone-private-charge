import api from './index';

export const sessionApi = {
  getAll: (params) => api.get('/sessions', { params }),
  getById: (id) => api.get(`/sessions/${id}`),
  start: (data) => api.post('/sessions/start', data),
  stop: (id, data) => api.post(`/sessions/${id}/stop`, data),
  // Legacy endpoints (stub for future implementation)
  pause: (id) => api.post(`/sessions/${id}/pause`),
  resume: (id) => api.post(`/sessions/${id}/resume`),
};

