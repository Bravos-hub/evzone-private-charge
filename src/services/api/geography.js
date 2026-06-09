import api from './index';

export const geographyApi = {
  getRoute: (fromLat, fromLng, toLat, toLng) =>
    api.get('/geography/route', {
      params: { fromLat, fromLng, toLat, toLng },
    }),
  getMapsConfig: () => api.get('/geography/config/maps'),
  getNearbyStations: (lat, lng) => api.get('/stations/nearby', { params: { lat, lng } }),
  reverseGeocode: (lat, lng) => api.get('/geography/reverse', { params: { lat, lng } }),
  detectLocation: () => api.get('/geography/detect'),
};
