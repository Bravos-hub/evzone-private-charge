import { useState, useCallback } from 'react';
import { sessionApi } from '../services/api/sessions';

export function useSessions() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSessions = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      const response = await sessionApi.getAll(params);
      setSessions(response.data.data);
      return response.data.data;
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to fetch sessions';
      setError(message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const startSession = useCallback(async (data) => {
    try {
      setError(null);
      const response = await sessionApi.start(data);
      setSessions([response.data.data, ...sessions]);
      return { success: true, data: response.data.data };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to start session';
      setError(message);
      return { success: false, error: message };
    }
  }, [sessions]);

  const stopSession = useCallback(async (id, data = {}) => {
    try {
      setError(null);
      const response = await sessionApi.stop(id, data);
      setSessions(sessions.map((s) => (s.id === id ? response.data.data : s)));
      return { success: true, data: response.data.data };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to stop session';
      setError(message);
      return { success: false, error: message };
    }
  }, [sessions]);

  return {
    sessions,
    loading,
    error,
    fetchSessions,
    startSession,
    stopSession,
  };
}
