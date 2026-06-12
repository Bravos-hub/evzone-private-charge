import api from './index';

export const firmwareApi = {
  getFirmwareEvents: (stationId, query = {}) =>
    api.get(`/stations/${stationId}/firmware/events`, { params: query }),
  updateFirmware: (stationId, data) =>
    api.post(`/stations/${stationId}/commands/update-firmware`, data),
};
