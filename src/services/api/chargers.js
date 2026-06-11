import api from './index';

const mapStationToChargers = (station) => {
  const chargePoints = station.chargePoints || [];
  if (chargePoints.length === 0) {
    // Return station as a single charger-like object if no charge points
    return [
      {
        id: station.id,
        name: station.name,
        location: station.address || 'Unknown location',
        status: station.status,
        type: station.type || 'Unknown',
        maxPowerKw: station.power || 0,
        price: station.price || 0,
        visibility: station.visibility,
        connectors: station.connectors || [],
        station: {
          id: station.id,
          name: station.name,
          address: station.address,
        },
      },
    ];
  }

  return chargePoints.map((cp) => ({
    id: cp.id,
    name: cp.model || station.name || 'Unnamed Charger',
    ocppId: cp.ocppId,
    model: cp.model,
    vendor: cp.vendor,
    status: cp.status,
    type: cp.type || 'CCS2',
    maxPowerKw: cp.power || 0,
    power: cp.power || 0,
    price: station.price || 0,
    amount: station.price || 0,
    visibility: cp.visibility || station.visibility,
    tag: cp.visibility === 'PUBLIC_MAP' ? 'Commercial' : 'Home',
    location: station.address || 'Unknown location',
    parkingAccessNotes: cp.parkingAccessNotes || station.address,
    connectors: Array.isArray(cp.connectors)
      ? cp.connectors.map((c) => ({
          id: c.id,
          type: c.type || cp.type || 'CCS2',
          maxPowerKw: c.maxPowerKw || cp.power || 0,
          status: c.status || cp.status,
        }))
      : [],
    station: {
      id: station.id,
      name: station.name,
      address: station.address,
    },
  }));
};

export const chargerApi = {
  getAll: async (params) => {
    const response = await api.get('/stations', { params });
    const data = response?.data || [];
    const stations = Array.isArray(data) ? data : data.data || [];
    // Flatten stations into charge-point-like objects
    const chargers = stations.flatMap(mapStationToChargers);
    return { data: chargers };
  },
  getById: async (id) => {
    // Try to find as a charge point within a station
    // First get all stations and search for the charge point
    const response = await api.get('/stations');
    const data = response?.data || [];
    const stations = Array.isArray(data) ? data : data.data || [];
    for (const station of stations) {
      const cp = (station.chargePoints || []).find((c) => c.id === id);
      if (cp) {
        const chargers = mapStationToChargers(station);
        const found = chargers.find((c) => c.id === id);
        if (found) return { data: found };
      }
    }
    // Fallback: try as a station itself
    try {
      const stationResponse = await api.get(`/stations/${id}`);
      const station = stationResponse?.data;
      if (station) {
        const chargers = mapStationToChargers(station);
        return { data: chargers[0] || station };
      }
    } catch {
      // ignore
    }
    throw new Error('Charger not found');
  },
  getConnectors: (id) => api.get(`/stations/${id}/connectors`),
  create: (data) => api.post('/stations', data),
  update: (id, data) => api.patch(`/stations/${id}`, data),
  delete: (id) => api.delete(`/stations/${id}`),
  testConnection: (id) => api.post(`/stations/${id}/commands/soft-reset`),
  publish: (id) => api.put(`/stations/${id}/publication`, { published: true }),
};
