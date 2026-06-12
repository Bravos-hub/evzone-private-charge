import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box, Typography, Paper, Stack, Button, LinearProgress,
  TextField, FormControl, InputLabel, Select, MenuItem, Alert, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogActions,
} from '@mui/material';
import SystemUpdateRoundedIcon from '@mui/icons-material/SystemUpdateRounded';
import ReplayRoundedIcon from '@mui/icons-material/ReplayRounded';
import FactCheckRoundedIcon from '@mui/icons-material/FactCheckRounded';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import MobileShell from '../../components/layout/MobileShell';
import { stationApi } from '../../services/api/stations';
import { firmwareApi } from '../../services/api/firmware';

export default function FirmwareSelfTest({ onBack, onHelp, onNavChange }) {
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

  const [stations, setStations] = useState([]);
  const [selectedStationId, setSelectedStationId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(false);

  const [firmwareUrl, setFirmwareUrl] = useState('');
  const [retrieveAt, setRetrieveAt] = useState('');
  const [installing, setInstalling] = useState(false);
  const [progress, setProgress] = useState(0);
  const [confirmReboot, setConfirmReboot] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        const res = await stationApi.getAll({ limit: '100' });
        const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        if (!mounted) return;
        setStations(list);
        if (list.length && !selectedStationId) setSelectedStationId(list[0].id);
      } catch (err) {
        if (!mounted) return;
        setError(err?.response?.data?.message || err.message || 'Unable to load stations.');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [selectedStationId]);

  async function loadEvents() {
    if (!selectedStationId) return;
    setEventsLoading(true);
    try {
      const res = await firmwareApi.getFirmwareEvents(selectedStationId, { limit: 50 });
      const data = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      setEvents(data);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Unable to load firmware events.');
    } finally {
      setEventsLoading(false);
    }
  }

  useEffect(() => {
    loadEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStationId]);

  useEffect(() => {
    if (!installing) return;
    const timer = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(timer);
          setInstalling(false);
          loadEvents();
          return 100;
        }
        return Math.min(p + 10, 100);
      });
    }, 800);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [installing]);

  const checkForUpdate = async () => {
    if (!selectedStationId) {
      setError('Select a station first.');
      return;
    }
    setError('');
    await loadEvents();
  };

  const startUpdate = async () => {
    if (!selectedStationId) {
      setError('Select a station first.');
      return;
    }
    if (!firmwareUrl) {
      setError('Enter a firmware HTTPS URL.');
      return;
    }
    setError('');
    setInstalling(true);
    setProgress(0);
    try {
      await firmwareApi.updateFirmware(selectedStationId, {
        location: firmwareUrl,
        retrieveAt: retrieveAt || new Date().toISOString(),
        retries: 3,
        retryIntervalSec: 30,
      });
    } catch (err) {
      setInstalling(false);
      setError(err?.response?.data?.message || err.message || 'Firmware update failed.');
    }
  };

  const runSelfTests = () => { console.info('Run: RCD, relay, insulation, ground'); };
  const reboot = () => { setConfirmReboot(false); console.info('Reboot charger'); };

  const selectedStation = stations.find(s => s.id === selectedStationId);

  return (
    <MobileShell title="Firmware & self‑test" tagline="OTA updates • diagnostics • reboot" onBack={handleBack} onHelp={onHelp} navValue={navValue} onNavChange={handleNavChange}>
      <Box sx={{ px: 2, pt: 2, pb: 2 }}>
        {loading && <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}><CircularProgress /></Box>}
        {error && <Alert severity="warning" sx={{ mb: 2 }}>{error}</Alert>}

        <Paper elevation={0} sx={{ p: 2, borderRadius: 1.5, bgcolor: '#fff', border: '1px solid #eef3f1', mb: 2 }}>
          <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1 }}>Station</Typography>
          <FormControl fullWidth size="small">
            <InputLabel id="station-select-label">Select station</InputLabel>
            <Select labelId="station-select-label" value={selectedStationId} label="Select station" onChange={(e) => setSelectedStationId(e.target.value)}>
              {stations.map(s => <MenuItem key={s.id} value={s.id}>{s.name || s.id}</MenuItem>)}
            </Select>
          </FormControl>
        </Paper>

        <Paper elevation={0} sx={{ p: 2, borderRadius: 1.5, bgcolor: '#fff', border: '1px solid #eef3f1' }}>
          <Typography variant="subtitle2" fontWeight={800}>Firmware</Typography>
          {selectedStation && (
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
              Current: {selectedStation.firmwareVersion || 'v1.2.3'}
            </Typography>
          )}
          <Stack spacing={1} sx={{ mt: 1 }}>
            <TextField label="Firmware HTTPS URL" size="small" fullWidth value={firmwareUrl} onChange={(e) => setFirmwareUrl(e.target.value)} />
            <TextField label="Retrieve at" type="datetime-local" size="small" fullWidth value={retrieveAt} onChange={(e) => setRetrieveAt(e.target.value)} InputLabelProps={{ shrink: true }} />
            <Stack direction="row" spacing={1}>
              <Button variant="outlined" startIcon={<SystemUpdateRoundedIcon />} onClick={checkForUpdate}>Check for updates</Button>
              <Button variant="contained" color="secondary" disabled={installing} onClick={startUpdate} sx={{ color: 'common.white' }}>Start OTA</Button>
            </Stack>
            {installing && (
              <Box sx={{ mt: 1 }}>
                <LinearProgress variant="determinate" value={progress} />
                <Typography variant="caption" color="text.secondary">Installing… {progress}%</Typography>
              </Box>
            )}
          </Stack>
        </Paper>

        <Paper elevation={0} sx={{ p: 2, mt: 2, borderRadius: 1.5, bgcolor: '#fff', border: '1px solid #eef3f1' }}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
            <DescriptionRoundedIcon />
            <Typography variant="subtitle2" fontWeight={800}>Firmware events</Typography>
          </Stack>
          {eventsLoading && <CircularProgress size={20} />}
          <Stack spacing={1}>
            {events.map((ev, idx) => (
              <Box key={idx}>
                <Typography variant="body2" fontWeight={700}>{ev.type || ev.status || 'Event'}</Typography>
                <Typography variant="caption" color="text.secondary">{ev.timestamp ? new Date(ev.timestamp).toLocaleString() : ''}</Typography>
                {ev.message && <Typography variant="caption" display="block" color="text.secondary">{ev.message}</Typography>}
              </Box>
            ))}
            {!eventsLoading && !events.length && (
              <Typography variant="body2" color="text.secondary">No firmware events.</Typography>
            )}
          </Stack>
        </Paper>

        <Paper elevation={0} sx={{ p: 2, mt: 2, borderRadius: 1.5, bgcolor: '#fff', border: '1px solid #eef3f1', mb: 2 }}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
            <FactCheckRoundedIcon />
            <Typography variant="subtitle2" fontWeight={800}>Self‑tests</Typography>
          </Stack>
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" onClick={runSelfTests}>Run tests</Button>
            <Button variant="outlined" color="error" startIcon={<ReplayRoundedIcon />} onClick={() => setConfirmReboot(true)}>Reboot charger</Button>
          </Stack>
        </Paper>
      </Box>

      <Dialog open={confirmReboot} onClose={() => setConfirmReboot(false)} fullWidth>
        <DialogTitle>Confirm reboot</DialogTitle>
        <DialogContent>
          <Typography variant="body2">Are you sure you want to reboot the charger? Ongoing sessions will stop.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmReboot(false)}>Cancel</Button>
          <Button variant="contained" color="secondary" onClick={reboot} sx={{ color: 'common.white' }}>Reboot</Button>
        </DialogActions>
      </Dialog>
    </MobileShell>
  );
}
