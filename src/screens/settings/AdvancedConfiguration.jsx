import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box, Typography, Paper, Button, TextField, Switch, FormControlLabel, Alert,
  CircularProgress, FormControl, InputLabel, Select, MenuItem,
} from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import MobileShell from '../../components/layout/MobileShell';
import { chargerApi } from '../../services/api/chargers';
import { commandsApi } from '../../services/api/commands';

function Field({ label, children, helper }) {
  return (
    <Box sx={{ mb: 1.5 }}>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        {label} {helper && <InfoOutlinedIcon fontSize="inherit" titleAccess={helper} />}
      </Typography>
      {children}
    </Box>
  );
}

export default function AdvancedConfiguration({ onBack, onHelp, onNavChange }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [navValue, setNavValue] = useState(4);
  const routes = useMemo(() => ['/', '/chargers', '/sessions', '/wallet', '/settings'], []);

  useEffect(() => {
    const pathIndex = routes.findIndex(route => location.pathname === route || location.pathname.startsWith(route + '/'));
    if (pathIndex !== -1) setNavValue(pathIndex);
  }, [location.pathname, routes]);

  const handleNavChange = useCallback((value) => {
    setNavValue(value);
    if (routes[value] !== undefined) navigate(routes[value]);
    if (onNavChange) onNavChange(value);
  }, [navigate, routes, onNavChange]);

  const handleBack = useCallback(() => {
    if (onBack) onBack();
    else navigate('/settings');
  }, [navigate, onBack]);

  const [chargers, setChargers] = useState([]);
  const [chargePointId, setChargePointId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    let mounted = true;
    chargerApi.getAll().then((res) => {
      const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      if (!mounted) return;
      setChargers(list);
      if (list.length && !chargePointId) setChargePointId(list[0].id);
    }).catch(() => {});
    return () => { mounted = false; };
  }, [chargePointId]);

  const [mvInterval, setMvInterval] = useState(60);
  const [mvMaxLen, setMvMaxLen] = useState(5);
  const [caInterval, setCaInterval] = useState(300);
  const [caMaxLen, setCaMaxLen] = useState(5);
  const [reserveAll, setReserveAll] = useState(true);

  const sendConfig = async (key, value) => {
    return commandsApi.create({
      chargePointId,
      commandType: 'ChangeConfiguration',
      ocppVersion: '1.6J',
      payload: { key, value: String(value) },
    });
  };

  const handleSave = async () => {
    if (!chargePointId) {
      setError('Select a charge point first.');
      return;
    }
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const measurands = ['Energy.Active.Import.Register', 'Power.Active.Import', 'Current.Import', 'Voltage', 'Temperature'].slice(0, Math.max(1, mvMaxLen)).join(',');
      await Promise.all([
        sendConfig('MeterValueSampleInterval', mvInterval),
        sendConfig('MeterValuesSampledData', measurands),
        sendConfig('ClockAlignedDataInterval', caInterval),
        sendConfig('MeterValuesAlignedData', measurands),
        sendConfig('ReserveConnectorZeroSupported', reserveAll ? 'true' : 'false'),
      ]);
      setMessage('Configuration commands sent to charger.');
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to send configuration (MFA may be required).');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MobileShell
      title="Advanced configuration"
      tagline="data reporting • limits • behavior"
      onBack={handleBack}
      onHelp={onHelp}
      navValue={navValue}
      onNavChange={handleNavChange}
    >
      <Box sx={{ px: 2, pt: 2, pb: 2 }}>
        {loading && <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}><CircularProgress /></Box>}
        {error && <Alert severity="warning" sx={{ mb: 1 }}>{error}</Alert>}
        {message && <Alert severity="success" sx={{ mb: 1 }} onClose={() => setMessage('')}>{message}</Alert>}

        <Paper elevation={0} sx={{ p: 2, borderRadius: 1.5, bgcolor: '#fff', border: '1px solid #eef3f1', mb: 2 }}>
          <FormControl fullWidth size="small">
            <InputLabel id="cp-select-label">Charge point</InputLabel>
            <Select labelId="cp-select-label" value={chargePointId} label="Charge point" onChange={(e) => setChargePointId(e.target.value)}>
              {chargers.map(cp => <MenuItem key={cp.id} value={cp.id}>{cp.name || cp.ocppId || cp.id}</MenuItem>)}
            </Select>
          </FormControl>
        </Paper>

        <Paper elevation={0} sx={{ p: 2, borderRadius: 1.5, bgcolor: '#fff', border: '1px solid #eef3f1' }}>
          <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1 }}>Meter values — sampled</Typography>
          <Field label="Interval (seconds)" helper="How often the charger reports live session data.">
            <TextField type="number" value={mvInterval} onChange={(e) => setMvInterval(Number(e.target.value) || 0)} fullWidth size="small" />
          </Field>
          <Field label="Sampled data max length" helper="Max measurands included per sample message.">
            <TextField type="number" value={mvMaxLen} onChange={(e) => setMvMaxLen(Number(e.target.value) || 0)} fullWidth size="small" />
          </Field>
        </Paper>

        <Paper elevation={0} sx={{ p: 2, mt: 2, borderRadius: 1.5, bgcolor: '#fff', border: '1px solid #eef3f1' }}>
          <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1 }}>Meter values — clock‑aligned</Typography>
          <Field label="Interval (seconds)" helper="Fixed schedule reporting aligned to the clock.">
            <TextField type="number" value={caInterval} onChange={(e) => setCaInterval(Number(e.target.value) || 0)} fullWidth size="small" />
          </Field>
          <Field label="Aligned data max length" helper="Max measurands per aligned report.">
            <TextField type="number" value={caMaxLen} onChange={(e) => setCaMaxLen(Number(e.target.value) || 0)} fullWidth size="small" />
          </Field>
        </Paper>

        <Paper elevation={0} sx={{ p: 2, mt: 2, borderRadius: 1.5, bgcolor: '#fff', border: '1px solid #eef3f1', mb: 2 }}>
          <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1 }}>Connectors & reservation</Typography>
          <Field label="Reserve connector zero" helper="Reserve all connectors by booking connector 0.">
            <FormControlLabel control={<Switch checked={reserveAll} onChange={(e) => setReserveAll(e.target.checked)} />} label="Enable" />
          </Field>
        </Paper>

        <Button fullWidth size="large" variant="contained" color="secondary" onClick={handleSave} disabled={loading}
          sx={{ py: 1.25, color: 'common.white', '&:hover': { bgcolor: 'secondary.dark', color: 'common.white' } }}>
          Save configuration
        </Button>
      </Box>
    </MobileShell>
  );
}
