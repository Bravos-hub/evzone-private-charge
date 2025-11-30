import api from './index';

export const accessApi = {
  getPermissions: (params) => api.get('/access-permissions', { params }),
  grantPermission: (data) => api.post('/access-permissions', data),
  revokePermission: (id) => api.delete(`/access-permissions/${id}`),

  getGuestPasses: (params) => api.get('/guest-passes', { params }),
  createGuestPass: (data) => api.post('/guest-passes', data),
  validateGuestPass: (id, data) => api.post(`/guest-passes/${id}/validate`, data),
};
