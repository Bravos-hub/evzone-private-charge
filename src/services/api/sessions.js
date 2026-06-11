import api from './index';

export const sessionApi = {
  // Operator/CPO session endpoints
  getHistory: (params) => api.get('/sessions/history/all', { params }),
  getActive: (params) => api.get('/sessions/active', { params }),
  getStats: () => api.get('/sessions/stats/summary'),
  getById: (id) => api.get(`/sessions/${id}`),
  stop: (id, data) => api.post(`/sessions/${id}/stop`, data),

  // Backwards compatibility: getAll maps to history
  getAll: (params) => api.get('/sessions/history/all', { params }),

  // User-facing charging session endpoints (if needed by private app)
  start: (data) => api.post('/charging/sessions', data),
  pause: (id) => api.post(`/charging/sessions/${id}/pause`),
  resume: (id) => api.post(`/charging/sessions/${id}/resume`),
};
