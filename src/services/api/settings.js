import api from './index';

export const settingsApi = {
  // User profile
  getMe: () => api.get('/users/me'),
  updateMe: (data) => api.patch('/users/me', data),
  changePassword: (data) => api.post('/users/me/password', data),

  // Tenant branding
  getTenantBranding: () => api.get('/tenant-branding'),
  saveTenantBrandingDraft: (data) => api.put('/tenant-branding/draft', data),
  publishTenantBranding: () => api.post('/tenant-branding/publish'),

  // Tenant tariff settings
  getTenantTariffSettings: () => api.get('/tariffs/tenant-settings'),
  saveTenantTariffSettings: (data) => api.post('/tariffs/tenant-settings', data),

  // Organization (tenant) update
  updateOrganization: (id, data) => api.patch(`/organizations/${id}`, data),
};
