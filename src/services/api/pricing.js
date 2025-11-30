import api from './index';

export const pricingApi = {
  getPlans: (params) => api.get('/pricing-plans', { params }),
  getPlanById: (id) => api.get(`/pricing-plans/${id}`),
  createPlan: (data) => api.post('/pricing-plans', data),
  updatePlan: (id, data) => api.put(`/pricing-plans/${id}`, data),
  deletePlan: (id) => api.delete(`/pricing-plans/${id}`),

  getTariffs: (params) => api.get('/tariffs', { params }),
  getTariffById: (id) => api.get(`/tariffs/${id}`),
  importTariffs: (data) => api.post('/tariffs/import', data),
};
