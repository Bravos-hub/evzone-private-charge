import { useState, useEffect } from 'react';
import { chargerApi } from '../services/api/chargers';

export function useCharger(chargerId) {
  const [charger, setCharger] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!chargerId) {
      setLoading(false);
      return;
    }
    chargerApi.getById(chargerId)
      .then((data) => {
        setCharger(data);
        setError(null);
      })
      .catch((err) => {
        setError(err.message);
        setCharger(null);
      })
      .finally(() => setLoading(false));
  }, [chargerId]);

  const refetch = () => {
    if (chargerId) {
      setLoading(true);
      chargerApi.getById(chargerId)
        .then((data) => {
          setCharger(data);
          setError(null);
        })
        .catch((err) => {
          setError(err.message);
        })
        .finally(() => setLoading(false));
    }
  };

  return { charger, loading, error, refetch };
}

