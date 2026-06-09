import { useState, useEffect, useCallback, useRef } from 'react';
import { bookingApi } from '../services/api/bookings';

export function useBookings(params) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const paramsRef = useRef(params);
  paramsRef.current = params;

  const fetchBookings = useCallback(() => {
    setLoading(true);
    bookingApi.getAll(paramsRef.current)
      .then((response) => {
        const data = Array.isArray(response) ? response : (response?.data || []);
        setBookings(data);
        setError(null);
      })
      .catch((err) => {
        setError(err.response?.data?.message || err.message || 'Failed to fetch bookings');
        setBookings([]);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchBookings, JSON.stringify(params)]);

  return { bookings, loading, error, refetch: fetchBookings };
}
