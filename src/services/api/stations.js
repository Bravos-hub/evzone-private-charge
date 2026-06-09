import api from './index';

export const stationApi = {
  getAll: (params) => api.get('/stations', { params }),
  getNearby: (lat, lng) => api.get('/stations/nearby', { params: { lat, lng } }),
  getById: (id) => api.get(`/stations/${id}`),
  getStats: (id) => api.get(`/stations/${id}/stats`),
  getByCode: (code) => api.get(`/stations/code/${code}`),
};
