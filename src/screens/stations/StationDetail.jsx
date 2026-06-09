import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Typography, Stack, Alert, CircularProgress, Button, Paper, Chip, Divider
} from '@mui/material';
import LocationOnRoundedIcon from '@mui/icons-material/LocationOnRounded';
import DirectionsRoundedIcon from '@mui/icons-material/DirectionsRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import MobileShell from '../../components/layout/MobileShell';
import ConnectorStatus from '../../components/common/ConnectorStatus';
import { useStation } from '../../hooks/useStation';
import { useChargers } from '../../hooks/useChargers';
import { useConnectors } from '../../hooks/useConnectors';
import { EV } from '../../utils/theme';

function ChargePointCard({ chargePoint, stationId }) {
  const navigate = useNavigate();
  const { connectors, loading, error } = useConnectors(chargePoint?.id);

  return (
    <Paper elevation={0} sx={{ p: 2, borderRadius: 1.5, bgcolor: '#fff', border: `1px solid ${EV.divider}` }}>
      <Stack spacing={1}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="subtitle2" fontWeight={700}>
            {chargePoint?.model || chargePoint?.ocppId || 'Unknown Charger'}
          </Typography>
          <Chip
            size="small"
            label={chargePoint?.status || 'Unknown'}
            color={chargePoint?.status === 'ACTIVE' ? 'success' : 'default'}
          />
        </Stack>

        {chargePoint?.power && (
          <Typography variant="body2" color="text.secondary">
            Power: {chargePoint.power} kW · {chargePoint?.type || 'Unknown type'}
          </Typography>
        )}

        <Divider sx={{ my: 0.5 }} />

        <Typography variant="caption" fontWeight={700} color="text.secondary">
          Connectors
        </Typography>

        {loading && <CircularProgress size={16} />}
        {error && <Alert severity="error" sx={{ py: 0.25 }}>{error}</Alert>}

        <Stack spacing={0.75}>
          {connectors.map((c) => (
            <Stack key={c.id || c.ocppConnectorId} direction="row" alignItems="center" justifyContent="space-between">
              <Typography variant="body2">
                {c.type || 'Unknown'} · {c.maxPowerKw ? `${c.maxPowerKw} kW` : ''} · {c.powerType || ''}
              </Typography>
              <ConnectorStatus status={c.status} />
            </Stack>
          ))}
          {!loading && connectors.length === 0 && (
            <Typography variant="caption" color="text.secondary">No connectors listed.</Typography>
          )}
        </Stack>

        <Button
          fullWidth
          variant="contained"
          color="secondary"
          startIcon={<CalendarMonthRoundedIcon />}
          onClick={() => navigate(`/bookings/new?stationId=${stationId}&chargePointId=${chargePoint.id}`)}
          sx={{ color: 'common.white', mt: 1 }}
        >
          Book this charger
        </Button>
      </Stack>
    </Paper>
  );
}

export default function StationDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { station, loading: stationLoading, error: stationError } = useStation(id);
  const { chargers, loading: chargersLoading } = useChargers();

  // Filter chargers for this station
  const stationChargers = chargers.filter((c) => c.stationId === id);

  const handleNavChange = (value) => {
    const routes = ['/', '/stations', '/sessions', '/wallet', '/settings'];
    if (routes[value]) navigate(routes[value]);
  };

  const openNavigation = () => {
    if (!station?.latitude || !station?.longitude) return;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${station.latitude},${station.longitude}`;
    window.open(url, '_blank');
  };

  return (
    <MobileShell
      title={station?.name || 'Station'}
      tagline={station?.address || ''}
      navValue={1}
      onNavChange={handleNavChange}
      onBack={() => navigate('/stations')}
    >
      {stationLoading && (
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
          <CircularProgress size={18} />
          <Typography variant="body2" color="text.secondary">Loading station…</Typography>
        </Stack>
      )}

      {stationError && <Alert severity="warning" sx={{ mb: 2 }}>{stationError}</Alert>}

      {station && (
        <Stack spacing={2}>
          <Paper elevation={0} sx={{ p: 2, borderRadius: 1.5, bgcolor: '#fff', border: `1px solid ${EV.divider}` }}>
            <Stack spacing={1}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <LocationOnRoundedIcon fontSize="small" sx={{ color: EV.green }} />
                <Typography variant="body2" color="text.secondary">{station.address}</Typography>
              </Stack>

              {typeof station.price === 'number' && (
                <Typography variant="body2">
                  Price: <strong>UGX {station.price.toLocaleString()}</strong> per kWh
                </Typography>
              )}

              {typeof station.rating === 'number' && (
                <Typography variant="body2">Rating: ⭐ {station.rating.toFixed(1)}</Typography>
              )}

              {station.open247 && (
                <Chip size="small" label="Open 24/7" color="success" />
              )}

              <Button
                fullWidth
                variant="outlined"
                startIcon={<DirectionsRoundedIcon />}
                onClick={openNavigation}
                sx={{ mt: 0.5, color: EV.green, borderColor: EV.green, '&:hover': { bgcolor: EV.green, color: '#fff' } }}
              >
                Get Directions
              </Button>
            </Stack>
          </Paper>

          <Typography variant="subtitle1" fontWeight={800}>
            Available Chargers
          </Typography>

          {chargersLoading && (
            <Stack direction="row" alignItems="center" spacing={1}>
              <CircularProgress size={16} />
              <Typography variant="body2" color="text.secondary">Loading chargers…</Typography>
            </Stack>
          )}

          <Stack spacing={1.25}>
            {stationChargers.map((cp) => (
              <ChargePointCard key={cp.id} chargePoint={cp} stationId={id} />
            ))}
            {!chargersLoading && stationChargers.length === 0 && (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                No chargers registered at this station yet.
              </Typography>
            )}
          </Stack>
        </Stack>
      )}
    </MobileShell>
  );
}
