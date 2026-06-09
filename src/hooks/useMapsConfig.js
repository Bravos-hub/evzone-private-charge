import { useState, useEffect } from 'react';
import { geographyApi } from '../services/api/geography';

export function useMapsConfig() {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const res = await geographyApi.getMapsConfig();
        const data = res?.data || res;
        if (mounted) {
          setConfig(data);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          setError(err.response?.data?.message || err.message);
          setConfig(null);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  return { config, loading, error };
}
