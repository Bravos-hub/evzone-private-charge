import { useState, useEffect } from 'react';
import { useJsApiLoader } from '@react-google-maps/api';
import { geographyApi } from '../services/api/geography';

const LIBRARIES = ['places', 'geometry'];

export function useGoogleMaps() {
  const [apiKey, setApiKey] = useState('');
  const [configLoading, setConfigLoading] = useState(true);
  const [configError, setConfigError] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function loadConfig() {
      try {
        const res = await geographyApi.getMapsConfig();
        const data = res?.data || res;
        if (mounted && data?.frontendKey) {
          setApiKey(data.frontendKey);
          setConfigError(null);
        } else if (mounted) {
          setConfigError('Maps configuration is incomplete');
        }
      } catch (err) {
        if (mounted) {
          setConfigError(err.response?.data?.message || err.message || 'Failed to load maps config');
        }
      } finally {
        if (mounted) setConfigLoading(false);
      }
    }
    loadConfig();
    return () => { mounted = false; };
  }, []);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey,
    libraries: LIBRARIES,
  });

  const loading = configLoading || (apiKey && !isLoaded && !loadError);
  const error = configError || (loadError ? loadError.message : null);

  return { isLoaded: isLoaded && !!apiKey, loading, error, apiKey };
}
