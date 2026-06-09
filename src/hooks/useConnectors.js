import { useState, useEffect, useCallback } from 'react';
import { chargerApi } from '../services/api/chargers';

export function useConnectors(chargePointId) {
  const [connectors, setConnectors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchConnectors = useCallback(() => {
    if (!chargePointId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    chargerApi.getConnectors(chargePointId)
      .then((response) => {
        const data = Array.isArray(response) ? response : (response?.data || []);
        setConnectors(data);
        setError(null);
      })
      .catch((err) => {
        setError(err.response?.data?.message || err.message || 'Failed to fetch connectors');
        setConnectors([]);
      })
      .finally(() => setLoading(false));
  }, [chargePointId]);

  useEffect(() => {
    fetchConnectors();
  }, [fetchConnectors]);

  return { connectors, loading, error, refetch: fetchConnectors };
}
