import api from './index';

const BASE = '/charge-points';

export const chargePointApi = {
  getAll: (params) => api.get(BASE, { params }),
  getById: (id) => api.get(`${BASE}/${id}`),
  getConnectors: (id) => api.get(`${BASE}/${id}/connectors`),
  update: (id, data) => api.patch(`${BASE}/${id}`, data),
  remoteStart: (id, data) => api.post(`${BASE}/${id}/commands/remote-start`, data),
  unlock: (id, data) => api.post(`${BASE}/${id}/commands/unlock`, data),
};
