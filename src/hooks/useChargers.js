import { useState, useEffect } from 'react';
import { chargerApi } from '../services/api/chargers';

export function useChargers() {
  const [chargers, setChargers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    chargerApi.getAll()
      .then((response) => {
        // Handle axios response structure (response.data) or direct array
        const data = Array.isArray(response) ? response : (response?.data || []);
        setChargers(data);
        setError(null);
      })
      .catch((err) => {
        setError(err.response?.data?.message || err.message || 'Failed to fetch chargers');
        setChargers([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const refetch = () => {
    setLoading(true);
    chargerApi.getAll()
      .then((response) => {
        const data = Array.isArray(response) ? response : (response?.data || []);
        setChargers(data);
        setError(null);
      })
      .catch((err) => {
        setError(err.response?.data?.message || err.message || 'Failed to fetch chargers');
      })
      .finally(() => setLoading(false));
  };

  return { chargers, loading, error, refetch };
}

