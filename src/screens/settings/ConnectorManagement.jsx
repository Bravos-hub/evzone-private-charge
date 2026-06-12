import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box, Typography, Paper, Stack, Chip, IconButton, List, ListItemButton, Switch,
  FormControl, InputLabel, Select, MenuItem, Alert, CircularProgress,
} from '@mui/material';
import ElectricBoltRoundedIcon from '@mui/icons-material/ElectricBoltRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import MobileShell from '../../components/layout/MobileShell';
import { chargerApi } from '../../services/api/chargers';
import { chargePointApi } from '../../services/api/chargePoints';

const ENABLED_STATUSES = ['AVAILABLE', 'PREPARING', 'CHARGING', 'SUSPENDED_EV', 'SUSPENDED_EVSE', 'FINISHING'];

function ConnectorRow({ c, onToggle, onTest }) {
  return (
    <Paper elevation={0} sx={{ p: 1.25, borderRadius: 1.5, bgcolor: '#fff', border: '1px solid #eef3f1' }}>
      <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
        <Box>
          <Typography variant="subtitle2" fontWeight={700}>{c.name}</Typography>
          <Stack direction="row" spacing={1} sx={{ mt: 0.5, flexWrap: 'wrap' }}>
            <Chip size="small" icon={<ElectricBoltRoundedIcon />} label={`${c.maxPower}`} />
            <Chip size="small" label={c.status} color={c.enabled ? 'success' : 'default'} />
          </Stack>
        </Box>
        <Stack direction="row" spacing={0.5} alignItems="center">
          <Switch checked={c.enabled} onChange={() => onToggle && onToggle(c)} />
          <IconButton size="small" onClick={() => onTest && onTest(c)} aria-label="Test"><PlayArrowRoundedIcon /></IconButton>
        </Stack>
      </Stack>
    </Paper>
  );
}

export default function ConnectorManagement({ onBack, onHelp, onNavChange }) {
  const navigate = useNavigate();
  const location = useLocation();
  const routes = useMemo(() => ['/', '/chargers', '/sessions', '/wallet', '/settings'], []);
  const [navValue, setNavValue] = useState(4);

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
  const [selectedId, setSelectedId] = useState('');
  const [connectors, setConnectors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    let mounted = true;
    chargerApi.getAll().then((res) => {
      const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      if (!mounted) return;
      setChargers(list);
      if (list.length && !selectedId) setSelectedId(list[0].id);
    }).catch((err) => { if (mounted) setError(err?.response?.data?.message || err.message || 'Unable to load chargers.'); });
    return () => { mounted = false; };
  }, [selectedId]);

  async function loadConnectors() {
    if (!selectedId) return;
    setLoading(true);
    try {
      const res = await chargePointApi.getConnectors(selectedId);
      const data = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      setConnectors(data.map((c) => ({
        id: c.id,
        ocppConnectorId: c.ocppConnectorId,
        name: `Connector ${c.ocppConnectorId || c.id.slice(0, 6)} — ${c.type || 'Unknown'}`,
        status: c.status || 'UNKNOWN',
        enabled: ENABLED_STATUSES.includes(c.status),
        maxPower: c.maxPowerKw ? `${c.maxPowerKw} kW` : '—',
        raw: c,
      })));
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Unable to load connectors.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadConnectors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  const toggleConnector = async (c) => {
    setError('');
    setMessage('');
    const newStatus = c.enabled ? 'MAINTENANCE' : 'AVAILABLE';
    const updated = connectors.map((x) =>
      x.id === c.id ? { ...x, status: newStatus, enabled: !x.enabled } : x
    );
    const connectorPayload = connectors.map((x) => ({
      id: x.raw.id,
      ocppConnectorId: x.raw.ocppConnectorId,
      type: x.raw.type,
      powerType: x.raw.powerType,
      maxPowerKw: x.raw.maxPowerKw,
      status: x.id === c.id ? newStatus : x.raw.status,
    }));
    try {
      await chargePointApi.update(selectedId, { connectors: connectorPayload });
      setConnectors(updated.map((x) => ({ ...x, raw: { ...x.raw, status: x.id === c.id ? newStatus : x.raw.status } })));
      setMessage('Connector status updated.');
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to update connector.');
    }
  };

  const testConnector = async (c) => {
    setError('');
    setMessage('');
    try {
      await chargePointApi.remoteStart(selectedId, { connectorId: c.ocppConnectorId });
      setMessage('Remote start command sent.');
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Remote start failed (MFA may be required).');
    }
  };

  return (
    <MobileShell
      title="Connector management"
      tagline="status • power • tests"
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
            <Select labelId="cp-select-label" value={selectedId} label="Charge point" onChange={(e) => setSelectedId(e.target.value)}>
              {chargers.map(cp => <MenuItem key={cp.id} value={cp.id}>{cp.name || cp.ocppId || cp.id}</MenuItem>)}
            </Select>
          </FormControl>
        </Paper>

        <Paper elevation={0} sx={{ p: 2, borderRadius: 1.5, bgcolor: '#fff', border: '1px solid #eef3f1' }}>
          <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1 }}>Connectors</Typography>
          <List sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {connectors.map(c => (
              <ListItemButton key={c.id} sx={{ p: 0 }}>
                <ConnectorRow c={c} onToggle={toggleConnector} onTest={testConnector} />
              </ListItemButton>
            ))}
            {!loading && !connectors.length && (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>No connectors found.</Typography>
            )}
          </List>
        </Paper>
      </Box>
    </MobileShell>
  );
}
