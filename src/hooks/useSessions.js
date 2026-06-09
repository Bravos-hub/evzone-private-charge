import { useState, useEffect, useCallback, useRef } from 'react';
import { sessionApi } from '../services/api/sessions';

export function useSessions(params) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const paramsRef = useRef(params);
  paramsRef.current = params;

  const fetchSessions = useCallback(() => {
    setLoading(true);
    sessionApi.getAll(paramsRef.current)
      .then((response) => {
        const data = Array.isArray(response) ? response : (response?.data || []);
        setSessions(data);
        setError(null);
      })
      .catch((err) => {
        setError(err.response?.data?.message || err.message || 'Failed to fetch sessions');
        setSessions([]);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchSessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchSessions, JSON.stringify(params)]);

  return { sessions, loading, error, refetch: fetchSessions };
}
