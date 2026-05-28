import api from './index';

const BASE = '/cpo/private-charging';

export const privateChargingApi = {
  getDashboard: () => api.get('/cpo/dashboard'),
  getAccessRules: () => api.get(`${BASE}/access-rules`),
  createAccessRule: (data) => api.post(`${BASE}/access-rules`, data),
  updateAccessRule: (id, data) => api.patch(`${BASE}/access-rules/${id}`, data),
  getTariffs: () => api.get(`${BASE}/tariffs`),
  createTariff: (data) => api.post(`${BASE}/tariffs`, data),
  updateTariff: (id, data) => api.patch(`${BASE}/tariffs/${id}`, data),
  getSessions: () => api.get(`${BASE}/sessions`),
  getUsageReport: () => api.get(`${BASE}/reports/usage`),
  getEligibleStations: (params) => api.get(`${BASE}/eligible-stations`, { params }),
};

export const PRIVATE_OPERATING_MODES = [
  { value: 'PRIVATE_HOME', label: 'Home charger' },
  { value: 'WORKPLACE', label: 'Workplace charger' },
  { value: 'FLEET_DEPOT', label: 'Fleet depot charger' },
  { value: 'RESIDENTIAL', label: 'Residential charger' },
  { value: 'COMMERCIAL_PRIVATE', label: 'Private business charger' },
  { value: 'VIP_RESTRICTED', label: 'VIP / restricted charger' },
];

export const ACCESS_MODES = [
  { value: 'PRIVATE', label: 'Private' },
  { value: 'WORKPLACE', label: 'Workplace' },
  { value: 'FLEET_ONLY', label: 'Fleet only' },
  { value: 'RESIDENTIAL', label: 'Residential' },
  { value: 'INVITE_ONLY', label: 'Invite only' },
  { value: 'PUBLIC', label: 'Public fallback' },
];

export const VISIBILITY_MODES = [
  { value: 'HIDDEN', label: 'Hidden' },
  { value: 'PRIVATE_LISTED', label: 'Private listed' },
  { value: 'FLEET_LISTED', label: 'Fleet listed' },
  { value: 'WORKPLACE_LISTED', label: 'Workplace listed' },
  { value: 'PUBLIC_FALLBACK', label: 'Public fallback' },
  { value: 'PUBLIC_MAP', label: 'Public map' },
];

export const TARIFF_AUDIENCES = [
  'OWNER',
  'EMPLOYEE',
  'RESIDENT',
  'FLEET_DRIVER',
  'GUEST',
  'PUBLIC',
];

export const ACCESS_RULE_TYPES = [
  'USER',
  'VEHICLE',
  'FLEET',
  'RFID',
  'ORGANIZATION',
  'TENANT',
  'INVITE_CODE',
  'PHONE_NUMBER',
  'TIME_WINDOW',
];

export const BILLING_PARTIES = [
  'USER',
  'TENANT',
  'FLEET',
  'SITE_HOST',
  'EMPLOYER',
  'OWNER',
];
