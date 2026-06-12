import api from './index';

export const diagnosticsApi = {
  getVehicleFaults: (vehicleId) => api.get(`/diagnostics/vehicles/${vehicleId}/faults`),
  getVehicleSummary: (vehicleId) => api.get(`/diagnostics/vehicles/${vehicleId}/summary`),
  acknowledgeFault: (faultId, note) =>
    api.patch(`/diagnostics/faults/${faultId}/acknowledge`, { note }),
  resolveFault: (faultId, note) =>
    api.patch(`/diagnostics/faults/${faultId}/resolve`, { note }),
  clearFault: (faultId, note) =>
    api.delete(`/diagnostics/faults/${faultId}`, { data: { note } }),

  // Station-level incidents are used as the diagnostics feed until a
  // dedicated station diagnostics endpoint exists.
  getIncidents: (params) => api.get('/incidents', { params }),
  updateIncident: (id, data) => api.patch(`/incidents/${id}`, data),
};
