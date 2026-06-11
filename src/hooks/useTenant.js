import { useState, useEffect, useCallback, useMemo } from 'react';
import api from '../services/api';

export function useTenant() {
  const [memberships, setMemberships] = useState([]);
  const [activeTenantId, setActiveTenantId] = useState(() =>
    localStorage.getItem('activeTenantId'),
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadMemberships = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/users/me');
      const data = response?.data || response;
      const userMemberships = data?.memberships || [];
      setMemberships(userMemberships);

      // Ensure activeTenantId is valid
      const currentId = localStorage.getItem('activeTenantId');
      const hasCurrent = userMemberships.some(
        (m) => m.tenantId === currentId || m.organizationId === currentId,
      );
      if (!hasCurrent && userMemberships.length > 0) {
        const first = userMemberships[0];
        const newId = first.tenantId || first.organizationId;
        localStorage.setItem('activeTenantId', newId);
        setActiveTenantId(newId);
      }

      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load tenant memberships');
      setMemberships([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const switchTenant = useCallback((tenantId) => {
    localStorage.setItem('activeTenantId', tenantId);
    setActiveTenantId(tenantId);
    // Force page reload so axios interceptor picks up new tenant header
    window.location.reload();
  }, []);

  const activeTenant = useMemo(() => {
    return (
      memberships.find(
        (m) => m.tenantId === activeTenantId || m.organizationId === activeTenantId,
      ) || null
    );
  }, [memberships, activeTenantId]);

  useEffect(() => {
    loadMemberships();
  }, [loadMemberships]);

  return {
    memberships,
    activeTenantId,
    activeTenant,
    loading,
    error,
    switchTenant,
    refresh: loadMemberships,
  };
}
