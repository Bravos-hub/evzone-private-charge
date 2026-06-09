import { useState, useEffect, useCallback, useRef } from 'react';
import { stationApi } from '../services/api/stations';

export function useStations(params) {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const paramsRef = useRef(params);
  paramsRef.current = params;

  const fetchStations = useCallback(() => {
    setLoading(true);
    stationApi.getAll(paramsRef.current)
      .then((response) => {
        const data = Array.isArray(response) ? response : (response?.data || []);
        setStations(data);
        setError(null);
      })
      .catch((err) => {
        setError(err.response?.data?.message || err.message || 'Failed to fetch stations');
        setStations([]);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchStations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchStations, JSON.stringify(params)]);

  return { stations, loading, error, refetch: fetchStations };
}
