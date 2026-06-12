import api from './index';

export const commandsApi = {
  list: (params) => api.get('/commands', { params }),
  getById: (id) => api.get(`/commands/${id}`),
  create: (data) => api.post('/commands', data),
};
