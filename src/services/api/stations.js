import api from './index';

export const stationApi = {
  getAll: (params) => api.get('/stations', { params }),
  getNearby: (lat, lng) => api.get('/stations/nearby', { params: { lat, lng } }),
  getById: (id) => api.get(`/stations/${id}`),
  getStats: (id) => api.get(`/stations/${id}/stats`),
  getByCode: (code) => api.get(`/stations/code/${code}`),
  update: (id, data) => api.patch(`/stations/${id}`, data),
  updateVisibility: (id, data) => api.patch(`/stations/${id}/visibility`, data),
  requestVisibilityChange: (id, data) => api.post(`/stations/${id}/visibility-change-requests`, data),
};

export const chargePointApi = {
  getAll: (params) => api.get('/charge-points', { params }),
  getById: (id) => api.get(`/charge-points/${id}`),
  getConnectors: (id) => api.get(`/charge-points/${id}/connectors`),
  update: (id, data) => api.patch(`/charge-points/${id}`, data),
  remoteStart: (id, data) => api.post(`/charge-points/${id}/commands/remote-start`, data || {}),
  remoteStop: (id, data) => api.post(`/charge-points/${id}/commands/remote-stop`, data || {}),
  unlockConnector: (id, data) => api.post(`/charge-points/${id}/commands/unlock`, data || {}),
};
