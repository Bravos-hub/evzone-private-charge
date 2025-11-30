import { useState, useCallback } from 'react';
import { chargerApi } from '../services/api/chargers';

export function useChargers() {
  const [chargers, setChargers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchChargers = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      const response = await chargerApi.getAll(params);
      const data = response.data.data || [];
      setChargers(data);
      return data;
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to fetch chargers';
      setError(message);
      setChargers([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const createCharger = useCallback(async (data) => {
    try {
      setError(null);
      const response = await chargerApi.create(data);
      const newCharger = response.data.data;
      setChargers([...chargers, newCharger]);
      return { success: true, data: newCharger };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to create charger';
      setError(message);
      return { success: false, error: message };
    }
  }, [chargers]);

  const updateCharger = useCallback(async (id, data) => {
    try {
      setError(null);
      const response = await chargerApi.update(id, data);
      const updated = response.data.data;
      setChargers(chargers.map((c) => (c.id === id ? updated : c)));
      return { success: true, data: updated };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to update charger';
      setError(message);
      return { success: false, error: message };
    }
  }, [chargers]);

  const deleteCharger = useCallback(async (id) => {
    try {
      setError(null);
      await chargerApi.delete(id);
      setChargers(chargers.filter((c) => c.id !== id));
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to delete charger';
      setError(message);
      return { success: false, error: message };
    }
  }, [chargers]);

  const getChargerStatus = useCallback(async (id) => {
    try {
      const response = await chargerApi.getStatus(id);
      return response.data.data;
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to get status';
      setError(message);
      return null;
    }
  }, []);

  return {
    chargers,
    loading,
    error,
    fetchChargers,
    createCharger,
    updateCharger,
    deleteCharger,
    getChargerStatus,
  };
}

