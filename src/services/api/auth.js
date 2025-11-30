import api from './index';

export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  refresh: () => api.post('/auth/refresh'),
  logout: () => {
    // Clear local storage handled in AuthContext
    return Promise.resolve();
  },
};
