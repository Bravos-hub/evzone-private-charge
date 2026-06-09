import { useState, useEffect, useCallback } from 'react';
import { stationApi } from '../services/api/stations';

export function useStation(stationId) {
  const [station, setStation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStation = useCallback(() => {
    if (!stationId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    stationApi.getById(stationId)
      .then((response) => {
        const data = response?.data || response;
        setStation(data);
        setError(null);
      })
      .catch((err) => {
        setError(err.response?.data?.message || err.message || 'Failed to fetch station');
        setStation(null);
      })
      .finally(() => setLoading(false));
  }, [stationId]);

  useEffect(() => {
    fetchStation();
  }, [fetchStation]);

  return { station, loading, error, refetch: fetchStation };
}
