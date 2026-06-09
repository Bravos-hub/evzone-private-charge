import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box, Typography, Stack, Alert, Button, Paper, Chip, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import DirectionsRoundedIcon from '@mui/icons-material/DirectionsRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import QrCode2RoundedIcon from '@mui/icons-material/QrCode2Rounded';
import MobileShell from '../../components/layout/MobileShell';
import { useBooking } from '../../hooks/useBooking';
import { bookingApi } from '../../services/api/bookings';
import { EV } from '../../utils/theme';

export default function ReservationDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { booking, loading, error, refetch } = useBooking(id, { pollInterval: 15000 });
  const [cancelling, setCancelling] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelError, setCancelError] = useState('');

  const handleCancel = async () => {
    setCancelling(true);
    setCancelError('');
    try {
      await bookingApi.cancel(id, 'Cancelled by user');
      setCancelDialogOpen(false);
      refetch();
    } catch (err) {
      setCancelError(err.response?.data?.message || err.message || 'Failed to cancel');
    } finally {
      setCancelling(false);
    }
  };

  const handleNavChange = (value) => {
    const routes = ['/', '/stations', '/sessions', '/wallet', '/settings'];
    if (routes[value]) navigate(routes[value]);
  };

  const openNavigation = () => {
    if (!booking?.station?.latitude || !booking?.station?.longitude) return;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${booking.station.latitude},${booking.station.longitude}`;
    window.open(url, '_blank');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'CONFIRMED': return 'success';
      case 'PENDING': return 'warning';
      case 'CANCELLED': return 'error';
      case 'NO_SHOW': return 'error';
      case 'EXPIRED': return 'error';
      default: return 'default';
    }
  };

  const qrUrl = booking?.id
    ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`evzone:booking:${booking.id}`)}`
    : null;

  return (
    <MobileShell
      title="Reservation"
      tagline={booking?.station?.name || ''}
      navValue={1}
      onNavChange={handleNavChange}
      onBack={() => navigate('/bookings')}
    >
      {loading && (
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
          <CircularProgress size={18} />
          <Typography variant="body2" color="text.secondary">Loading reservation…</Typography>
        </Stack>
      )}

      {error && <Alert severity="warning" sx={{ mb: 2 }}>{error}</Alert>}

      {booking && (
        <Stack spacing={2}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Chip
              size="small"
              label={booking.status}
              color={getStatusColor(booking.status)}
            />
            {booking.reservationId && (
              <Typography variant="caption" color="text.secondary">
                OCPP Reservation #{booking.reservationId}
              </Typography>
            )}
          </Stack>

          <Paper elevation={0} sx={{ p: 2, borderRadius: 1.5, bgcolor: '#fff', border: `1px solid ${EV.divider}` }}>
            <Stack spacing={1}>
              <Typography variant="body2"><strong>Station:</strong> {booking.station?.name || '—'}</Typography>
              <Typography variant="body2"><strong>Address:</strong> {booking.station?.address || '—'}</Typography>
              <Typography variant="body2"><strong>Start:</strong> {booking.startTime ? new Date(booking.startTime).toLocaleString() : '—'}</Typography>
              <Typography variant="body2"><strong>End:</strong> {booking.endTime ? new Date(booking.endTime).toLocaleString() : '—'}</Typography>
              {booking.requiredKwh && (
                <Typography variant="body2"><strong>Target:</strong> {booking.requiredKwh} kWh</Typography>
              )}
              {booking.feeAmount && (
                <Typography variant="body2"><strong>Fee:</strong> {booking.feeCurrency || 'UGX'} {Number(booking.feeAmount).toLocaleString()}</Typography>
              )}
              {booking.reservationCommandStatus && (
                <Typography variant="caption" color="text.secondary">
                  OCPP command status: {booking.reservationCommandStatus}
                </Typography>
              )}
            </Stack>
          </Paper>

          {booking.status === 'PENDING' && (
            <Paper elevation={0} sx={{ p: 2, borderRadius: 1.5, bgcolor: '#fff', border: `1px solid ${EV.divider}`, textAlign: 'center' }}>
              <QrCode2RoundedIcon sx={{ fontSize: 40, color: EV.green, mb: 1 }} />
              <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
                Scan at the station
              </Typography>
              {qrUrl ? (
                <Box
                  component="img"
                  src={qrUrl}
                  alt="Booking QR Code"
                  sx={{ width: 180, height: 180, mx: 'auto', display: 'block', borderRadius: 1 }}
                />
              ) : (
                <Typography variant="caption" color="text.secondary">QR code unavailable</Typography>
              )}
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                {booking.id}
              </Typography>
            </Paper>
          )}

          <Stack direction="row" spacing={1}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<DirectionsRoundedIcon />}
              onClick={openNavigation}
              sx={{ color: EV.green, borderColor: EV.green, '&:hover': { bgcolor: EV.green, color: '#fff' } }}
            >
              Navigate
            </Button>
            {['PENDING', 'CONFIRMED'].includes(booking.status) && (
              <Button
                fullWidth
                variant="outlined"
                color="error"
                startIcon={<CancelRoundedIcon />}
                onClick={() => setCancelDialogOpen(true)}
              >
                Cancel
              </Button>
            )}
          </Stack>
        </Stack>
      )}

      <Dialog open={cancelDialogOpen} onClose={() => setCancelDialogOpen(false)} fullWidth>
        <DialogTitle>Cancel Reservation?</DialogTitle>
        <DialogContent>
          <Typography variant="body2">This will release your slot and send a CancelReservation command to the charger.</Typography>
          {cancelError && <Alert severity="error" sx={{ mt: 1 }}>{cancelError}</Alert>}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialogOpen(false)}>Keep Booking</Button>
          <Button variant="contained" color="error" onClick={handleCancel} disabled={cancelling}>
            {cancelling ? <CircularProgress size={18} /> : 'Cancel Reservation'}
          </Button>
        </DialogActions>
      </Dialog>
    </MobileShell>
  );
}
