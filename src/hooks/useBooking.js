import { useState, useEffect, useCallback, useRef } from 'react';
import { bookingApi } from '../services/api/bookings';

export function useBooking(bookingId, options = {}) {
  const { pollInterval = 0 } = options;
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const intervalRef = useRef(null);

  const fetchBooking = useCallback(() => {
    if (!bookingId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    bookingApi.getById(bookingId)
      .then((response) => {
        const data = response?.data || response;
        setBooking(data);
        setError(null);
      })
      .catch((err) => {
        setError(err.response?.data?.message || err.message || 'Failed to fetch booking');
        setBooking(null);
      })
      .finally(() => setLoading(false));
  }, [bookingId]);

  useEffect(() => {
    fetchBooking();
    if (pollInterval > 0) {
      intervalRef.current = setInterval(fetchBooking, pollInterval);
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchBooking, pollInterval]);

  return { booking, loading, error, refetch: fetchBooking };
}
