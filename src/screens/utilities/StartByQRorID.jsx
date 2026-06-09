import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box, Typography, Paper, Stack, Button, TextField, Chip, Checkbox, FormControlLabel,
  InputAdornment,
  FormControl, Select, MenuItem,
  Alert, CircularProgress
} from '@mui/material';
import Divider from '@mui/material/Divider';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import SecurityRoundedIcon from '@mui/icons-material/SecurityRounded';
import MobileShell from '../../components/layout/MobileShell';
import QRScanner from '../../components/common/QRScanner';
import { useChargers } from '../../hooks/useChargers';
import { useConnectors } from '../../hooks/useConnectors';

export default function StartByQrManual({ onBack, onHelp, onNavChange, onResolve, onStart, onOpenActions }) {
  const navigate = useNavigate();
  const location = useLocation();
  const routes = useMemo(() => ['/', '/chargers', '/sessions', '/wallet', '/settings'], []);
  const [navValue, setNavValue] = useState(2); // Sessions tab index
  const [manualId, setManualId] = useState('');
  const [safetyOk, setSafetyOk] = useState(false);
  const [scanOpen, setScanOpen] = useState(false);
  const [resolved, setResolved] = useState(null);

  const { chargers, loading: chargersLoading } = useChargers();
  const [chargerId, setChargerId] = useState('');

  const { connectors, loading: connectorsLoading } = useConnectors(chargerId);

  // Sync navValue with current route
  useEffect(() => {
    const pathIndex = routes.findIndex(route => location.pathname === route || location.pathname.startsWith(route + '/'));
    if (pathIndex !== -1) {
      setNavValue(pathIndex);
    }
  }, [location.pathname, routes]);

  useEffect(() => {
    if (chargers.length > 0 && !chargerId) {
      setChargerId(chargers[0].id);
    }
  }, [chargers, chargerId]);

  const handleNavChange = useCallback((value) => {
    setNavValue(value);
    if (routes[value] !== undefined) {
      navigate(routes[value]);
    }
    if (onNavChange) onNavChange(value);
  }, [navigate, routes, onNavChange]);

  const handleBack = useCallback(() => {
    if (onBack) {
      onBack();
    } else {
      navigate('/dashboard');
    }
  }, [navigate, onBack]);

  const selectedCharger = chargers.find(c => c.id === chargerId);

  return (
    <MobileShell
      title="Start charging"
      tagline="scan QR or enter ID"
      navValue={navValue}
      onNavChange={handleNavChange}
      onBack={handleBack}
      onHelp={onHelp}
    >
      <Box sx={{ pt: 2 }}>
        {chargersLoading && (
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
            <CircularProgress size={18} />
            <Typography variant="body2" color="text.secondary">Loading chargers…</Typography>
          </Stack>
        )}

        {/* Charger selector */}
        <Paper elevation={0} sx={{ p: 2, borderRadius: 1.5, bgcolor: '#fff', border: '1px solid #eef3f1', mb: 2 }}>
          <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1 }}>Select charger</Typography>
          <FormControl size="small" fullWidth>
            <Select value={chargerId} onChange={(e) => setChargerId(e.target.value)} displayEmpty>
              {chargers.map(c => <MenuItem key={c.id} value={c.id}>{c.name || c.model || c.ocppId}</MenuItem>)}
            </Select>
          </FormControl>
        </Paper>

        {/* Connector chips */}
        <Paper elevation={0} sx={{ p: 2, borderRadius: 1.5, bgcolor: '#fff', border: '1px solid #eef3f1', mb: 2 }}>
          <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1 }}>Connectors</Typography>
          {connectorsLoading && <CircularProgress size={16} sx={{ mb: 1 }} />}
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {connectors.map(c => (
              <Chip
                key={c.id || c.ocppConnectorId}
                label={`${c.type || 'Unknown'} · ${c.status || 'Unknown'}`}
                color={c.status === 'Available' ? 'success' : 'default'}
                size="small"
              />
            ))}
            {!connectorsLoading && connectors.length === 0 && (
              <Typography variant="caption" color="text.secondary">No connectors available.</Typography>
            )}
          </Stack>
        </Paper>

        {/* QR Scan */}
        <Button
          fullWidth
          variant="contained"
          color="secondary"
          startIcon={<QrCodeScannerIcon />}
          onClick={() => setScanOpen(true)}
          sx={{ color: 'common.white', mb: 2 }}
        >
          Scan QR Code
        </Button>

        {scanOpen && (
          <Box sx={{ mb: 2 }}>
            <QRScanner
              onScan={(text) => {
                setScanOpen(false);
                setManualId(text);
                if (onResolve) onResolve(text);
                else setResolved({ id: text, charger: selectedCharger });
              }}
              onClose={() => setScanOpen(false)}
            />
          </Box>
        )}

        <Divider sx={{ mb: 2 }}>or</Divider>

        {/* Manual ID */}
        <TextField
          fullWidth
          size="small"
          label="Enter Charger / Connector ID"
          placeholder="e.g., EVZ-CP-001"
          value={manualId}
          onChange={(e) => setManualId(e.target.value)}
          InputProps={{
            startAdornment: <InputAdornment position="start"><QrCodeScannerIcon /></InputAdornment>
          }}
          sx={{ mb: 2 }}
        />

        <FormControlLabel
          control={<Checkbox checked={safetyOk} onChange={(e) => setSafetyOk(e.target.checked)} />}
          label="I confirm the vehicle is safely parked and the cable is properly connected."
          sx={{ mb: 2 }}
        />

        <Stack direction="row" spacing={1}>
          <Button
            fullWidth
            variant="contained"
            color="secondary"
            disabled={!manualId || !safetyOk || !chargerId}
            onClick={() => {
              if (onStart) onStart({ chargerId, connectorId: manualId });
              else console.info('Start session', { chargerId, connectorId: manualId });
            }}
            sx={{ color: 'common.white' }}
          >
            Start Session
          </Button>
          {onOpenActions && (
            <Button fullWidth variant="outlined" startIcon={<SecurityRoundedIcon />} onClick={() => onOpenActions({ chargerId })}>
              Actions
            </Button>
          )}
        </Stack>

        {resolved && (
          <Alert severity="success" sx={{ mt: 2 }}>
            Resolved: {resolved.id} @ {resolved.charger?.name || 'Unknown'}
          </Alert>
        )}
      </Box>
    </MobileShell>
  );
}
