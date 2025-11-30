import React, { createContext, useState, useCallback, useEffect } from 'react';
import api from '../services/api';

export const SiteContext = createContext();

export function SiteProvider({ children }) {
  const [sites, setSites] = useState([]);
  const [currentSite, setCurrentSite] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load current site from localStorage
  useEffect(() => {
    const storedSite = localStorage.getItem('currentSite');
    if (storedSite) {
      setCurrentSite(JSON.parse(storedSite));
    }
  }, []);

  const fetchSites = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/sites');
      setSites(response.data.data);
      return response.data.data;
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to fetch sites';
      setError(message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const createSite = useCallback(async (siteData) => {
    try {
      setError(null);
      const response = await api.post('/sites', siteData);
      setSites([...sites, response.data.data]);
      return { success: true, data: response.data.data };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to create site';
      setError(message);
      return { success: false, error: message };
    }
  }, [sites]);

  const updateSite = useCallback(async (siteId, siteData) => {
    try {
      setError(null);
      const response = await api.put(`/sites/${siteId}`, siteData);
      setSites(sites.map((s) => (s.id === siteId ? response.data.data : s)));
      if (currentSite?.id === siteId) {
        setCurrentSite(response.data.data);
        localStorage.setItem('currentSite', JSON.stringify(response.data.data));
      }
      return { success: true, data: response.data.data };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to update site';
      setError(message);
      return { success: false, error: message };
    }
  }, [sites, currentSite]);

  const deleteSite = useCallback(async (siteId) => {
    try {
      setError(null);
      await api.delete(`/sites/${siteId}`);
      setSites(sites.filter((s) => s.id !== siteId));
      if (currentSite?.id === siteId) {
        setCurrentSite(null);
        localStorage.removeItem('currentSite');
      }
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to delete site';
      setError(message);
      return { success: false, error: message };
    }
  }, [sites, currentSite]);

  const selectSite = useCallback((site) => {
    setCurrentSite(site);
    localStorage.setItem('currentSite', JSON.stringify(site));
  }, []);

  const value = {
    sites,
    currentSite,
    loading,
    error,
    fetchSites,
    createSite,
    updateSite,
    deleteSite,
    selectSite,
  };

  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>;
}

export function useSite() {
  const context = React.useContext(SiteContext);
  if (!context) {
    throw new Error('useSite must be used within SiteProvider');
  }
  return context;
}
