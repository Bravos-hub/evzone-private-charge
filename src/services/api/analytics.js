import api from './index';

export const analyticsApi = {
  getOwnerDashboard: (query = {}) => api.get('/analytics/owner/dashboard', { params: query }),
  getDashboard: (period = 'today') => api.get('/analytics/dashboard', { params: { period } }),
  getUptime: (stationId) => api.get('/analytics/uptime', { params: stationId ? { stationId } : {} }),
  getUsage: () => api.get('/analytics/usage'),
  getRealtime: () => api.get('/analytics/realtime'),
};
