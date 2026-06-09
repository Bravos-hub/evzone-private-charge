import api from './index';

export const bookingApi = {
  getAll: (params) => api.get('/bookings', { params }),
  getQueue: (params) => api.get('/bookings/queue', { params }),
  getById: (id) => api.get(`/bookings/${id}`),
  create: (data) => api.post('/bookings', data),
  update: (id, data) => api.patch(`/bookings/${id}`, data),
  cancel: (id, reason) => api.patch(`/bookings/${id}/cancel`, { reason }),
  checkin: (id) => api.post(`/bookings/${id}/checkin`),
  dispatchReserve: (id, payload) => api.post(`/bookings/${id}/dispatch-reserve`, payload),
  dispatchCancel: (id, payload) => api.post(`/bookings/${id}/dispatch-cancel`, payload),
  markNoShow: (id, reason) => api.post(`/bookings/${id}/no-show`, { reason }),
  expire: (id, reason) => api.post(`/bookings/${id}/expire`, { reason }),
};
