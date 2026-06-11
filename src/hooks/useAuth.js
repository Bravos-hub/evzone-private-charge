import { useState, useEffect, useCallback, useMemo } from 'react';
import api from '../services/api';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);

  const checkSession = useCallback(async () => {
    try {
      const response = await api.get('/users/me');
      const data = response?.data || response;
      setUser(data);
      setStatus('authenticated');
      setError(null);
      return data;
    } catch (err) {
      if (err.response?.status === 401) {
        setUser(null);
        setStatus('unauthenticated');
        setError(null);
      } else {
        setUser(null);
        setStatus('unauthenticated');
        setError(err.response?.data?.message || err.message || 'Session check failed');
      }
      return null;
    }
  }, []);

  useEffect(() => {
    let active = true;

    const bootstrap = async () => {
      const result = await checkSession();
      if (!active) return;
      // If authenticated, ensure tenant context is set
      if (result?.memberships?.length > 0) {
        const currentTenantId = localStorage.getItem('activeTenantId');
        const hasCurrentMembership = result.memberships.some(
          (m) => m.tenantId === currentTenantId || m.organizationId === currentTenantId,
        );
        if (!hasCurrentMembership) {
          const firstMembership = result.memberships[0];
          localStorage.setItem(
            'activeTenantId',
            firstMembership.tenantId || firstMembership.organizationId,
          );
        }
      }
    };

    bootstrap();

    const handleAuthExpired = () => {
      setUser(null);
      setStatus('unauthenticated');
    };

    window.addEventListener('evzone:auth:expired', handleAuthExpired);

    return () => {
      active = false;
      window.removeEventListener('evzone:auth:expired', handleAuthExpired);
    };
  }, [checkSession]);

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Ignore logout errors
    }
    setUser(null);
    setStatus('unauthenticated');
    localStorage.removeItem('activeTenantId');
  }, []);

  const value = useMemo(
    () => ({
      user,
      status,
      error,
      isAuthenticated: status === 'authenticated',
      isLoading: status === 'loading',
      logout,
      refresh: checkSession,
    }),
    [user, status, error, checkSession, logout],
  );

  return value;
}
