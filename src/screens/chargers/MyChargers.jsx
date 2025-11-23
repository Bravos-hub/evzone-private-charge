import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import {
  CssBaseline,
  Box,
  Typography,
  Button,
  Paper,
  Stack,
  Chip,
  IconButton,
  Divider,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  FormControlLabel,
  Switch,
  Snackbar,
  Alert,
  Link as MuiLink,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import BlockRoundedIcon from '@mui/icons-material/BlockRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import LanIcon from '@mui/icons-material/Lan';
import MemoryIcon from '@mui/icons-material/Memory';
import PowerIcon from '@mui/icons-material/Power';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { EVzoneTheme } from '../../utils/theme';
import MobileShell from '../../components/layout/MobileShell';
import MapPicker from '../../components/common/MapPicker';
import Stat from '../../components/common/Stat';

// ---- Helpers
const onCallOr = (fn) => () => (typeof fn === 'function' ? fn() : alert('Action'));
const copy = (text) => navigator.clipboard?.writeText(text).then(() => alert('Copied')).catch(() => alert(text));

// ---------- New: Device & Hardware panel (merged from Device Info screen)
function DeviceInfoPanel({ device = {}, ocpp = {} }) {
  const {
    make = 'EVmart',
    model = 'AC22-T2-2S',
    serial = 'EVZ-UG-KLA-000123',
    firmware = 'v1.8.4',
    power = '22 kW (dual 11 kW)',
    connectors = [{ id: 'B1', type: 'CCS 2', power: '90 kW' }, { id: 'B2', type: 'Type 2', power: '22 kW' }],
    heartbeat = '12s ago',
    uptime = '99.2% (30d)'
  } = device;
  const { server = 'wss://ocpp.evzone.app', stationId = serial, password = '••••••••' } = ocpp;

  return (
    <Paper elevation={0} sx={{ mt: 2, p: 2, borderRadius: 1.5, border: '1px solid #eef3f1', bgcolor: '#fff' }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
        <MemoryIcon fontSize="small" />
        <Typography variant="subtitle2" fontWeight={800}>Device & hardware</Typography>
      </Stack>

      <Stack spacing={1.25}>
        <Stack direction="row" spacing={2}>
          <Typography variant="body2" sx={{ minWidth: 110 }}><b>Make / Model</b></Typography>
          <Typography variant="body2">{make} • {model}</Typography>
        </Stack>
        <Stack direction="row" spacing={2}>
          <Typography variant="body2" sx={{ minWidth: 110 }}><b>Serial</b></Typography>
          <Typography variant="body2">{serial}</Typography>
          <IconButton size="small" onClick={() => copy(serial)}><ContentCopyIcon fontSize="inherit" /></IconButton>
        </Stack>
        <Stack direction="row" spacing={2}>
          <Typography variant="body2" sx={{ minWidth: 110 }}><b>Firmware</b></Typography>
          <Typography variant="body2">{firmware}</Typography>
        </Stack>
        <Stack direction="row" spacing={2}>
          <Typography variant="body2" sx={{ minWidth: 110 }}><b>Power</b></Typography>
          <Typography variant="body2">{power}</Typography>
        </Stack>
        <Stack>
          <Typography variant="body2" sx={{ mb: .5 }}><b>Connectors</b></Typography>
          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
            {connectors.map((c) => (
              <Chip key={c.id} size="small" icon={<PowerIcon />} label={`${c.id} • ${c.type} • ${c.power}`} />
            ))}
          </Stack>
        </Stack>
      </Stack>

      <Divider sx={{ my: 2 }} />

      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
        <LanIcon fontSize="small" />
        <Typography variant="subtitle2" fontWeight={800}>OCPP & connectivity</Typography>
      </Stack>
      <Stack spacing={1.25}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Typography variant="body2" sx={{ minWidth: 110 }}><b>Server</b></Typography>
          <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>{server}</Typography>
          <IconButton size="small" onClick={() => copy(server)}><ContentCopyIcon fontSize="inherit" /></IconButton>
        </Stack>
        <Stack direction="row" spacing={2} alignItems="center">
          <Typography variant="body2" sx={{ minWidth: 110 }}><b>Station ID</b></Typography>
          <Typography variant="body2">{stationId}</Typography>
          <IconButton size="small" onClick={() => copy(stationId)}><ContentCopyIcon fontSize="inherit" /></IconButton>
        </Stack>
        <Stack direction="row" spacing={2} alignItems="center">
          <Typography variant="body2" sx={{ minWidth: 110 }}><b>Password</b></Typography>
          <Typography variant="body2">{password}</Typography>
          <IconButton size="small" onClick={() => copy(password)}><ContentCopyIcon fontSize="inherit" /></IconButton>
        </Stack>
        <Stack direction="row" spacing={2}>
          <Typography variant="body2" sx={{ minWidth: 110 }}><b>Last heartbeat</b></Typography>
          <Typography variant="body2">{heartbeat}</Typography>
        </Stack>
        <Stack direction="row" spacing={2}>
          <Typography variant="body2" sx={{ minWidth: 110 }}><b>Uptime</b></Typography>
          <Typography variant="body2">{uptime}</Typography>
        </Stack>
      </Stack>

      <Accordion sx={{ mt: 2 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}><Typography variant="body2" fontWeight={700}>Diagnostics & logs</Typography></AccordionSummary>
        <AccordionDetails>
          <Typography variant="caption" color="text.secondary">Use Aggregator & CPMS for full telemetry, logs, and remote diagnostics. This device supports status notifications, meter values, and firmware updates via OCPP 1.6J.</Typography>
        </AccordionDetails>
      </Accordion>
    </Paper>
  );
}

export default function ChargerDetails({
  onBack,
  onHelp,
  onNavChange,
  onAssignOperator,
  onViewOperator,
  onEditOperator,
  onOpenPricing,
  onOpenAvail,
  onOpenAccess,
  onOpenAggregator,
  onSave,
  initial = {
    name: 'EVZ Station – Bugolobi',
    locationName: 'Rear parking lot, Block B',
    coords: [0.3476, 32.5825],
    accessNotes: 'Gate opens at 07:00, ask guard; max height 2.1m',
    usage: 'private',
    availabilityLabel: '24/7',
    accessLabel: 'Public',
    operatorAssigned: false,
    device: { make: 'EVmart', model: 'AC22-T2-2S', serial: 'EVZ-UG-KLA-000123', firmware: 'v1.8.4', power: '22 kW (dual 11 kW)' },
    ocpp: { server: 'wss://ocpp.evzone.app', stationId: 'EVZ-UG-KLA-000123', password: '••••••••' },
  },
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const [navValue, setNavValue] = useState(1);
  const routes = useMemo(() => ['/', '/chargers', '/sessions', '/wallet', '/settings'], []);
  
  // Sync navValue with current route
  useEffect(() => {
    const pathIndex = routes.findIndex(route => location.pathname === route || location.pathname.startsWith(route + '/'));
    if (pathIndex !== -1) {
      setNavValue(pathIndex);
    }
  }, [location.pathname, routes]);
  
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
      navigate('/');
    }
  }, [navigate, onBack]);
  const [name, setName] = useState(initial.name || '');
  const [locationName, setLocationName] = useState(initial.locationName || '');
  const [coords, setCoords] = useState(initial.coords || [0.3476, 32.5825]);
  const [accessNotes, setAccessNotes] = useState(initial.accessNotes || '');
  const [usage, setUsage] = useState(initial.usage || 'private');
  const [availability] = useState({ label: initial.availabilityLabel || '24/7' });
  const [access, setAccess] = useState({ label: initial.accessLabel || 'Public' });
  const [editBasics, setEditBasics] = useState(false);
  const canSave = useMemo(() => Boolean(name && locationName), [name, locationName]);
  const [snack, setSnack] = useState({ open: false, msg: '' });

  // New: merged device info
  const device = initial.device || {};
  const ocpp = initial.ocpp || {};

  useEffect(() => {
    try {
      const results = [];
      const check = (t, c) => results.push({ test: t, pass: !!c });
      check('has name field', typeof name === 'string');
      check('has locationName field', typeof locationName === 'string');
      check('coords is [lat, lon]', Array.isArray(coords) && coords.length === 2 && coords.every(n => typeof n === 'number'));
      check('usage valid', usage === 'private' || usage === 'commercial');
      check('availability label present', typeof availability?.label === 'string');
      check('access label present', typeof access?.label === 'string');
      // New tests for merged info
      check('device object present', typeof device === 'object');
      check('ocpp object present', typeof ocpp === 'object');
      check('canSave reflects basic fields', canSave === !!(name && locationName));
      console.table(results);
    } catch (e) { console.warn('Dev tests crashed', e); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const Footer = (
    <Box sx={{ px: 2, pb: 'calc(10px + env(safe-area-inset-bottom))', pt: 1.25, background: '#f2f2f2', borderTop: '1px solid #eee' }}>
      <Stack direction="row" spacing={1} alignItems="center">
        <Button variant="outlined" onClick={onCallOr(onBack)} sx={{ mr: 'auto', '&:hover': { bgcolor: 'secondary.main', color: '#fff' } }}>Back</Button>
        <Button variant="outlined" onClick={onCallOr(onOpenPricing)} sx={{ '&:hover': { bgcolor: 'secondary.main', color: '#fff' } }}>Pricing &amp; fees</Button>
        <Button variant="outlined" onClick={onCallOr(onOpenAvail)} sx={{ '&:hover': { bgcolor: 'secondary.main', color: '#fff' } }}>Availability</Button>
        <Button variant="outlined" onClick={onCallOr(onOpenAccess)} sx={{ '&:hover': { bgcolor: 'secondary.main', color: '#fff' } }}>Access</Button>
        <Button disabled={!canSave} variant="contained" color="secondary" onClick={() => {
          const payload = { name, locationName, coords, accessNotes, usage, availability: availability?.label, access: access?.label, device, ocpp };
          if (typeof onSave === 'function') onSave(payload); else setSnack({ open: true, msg: `Saved: ${JSON.stringify(payload)}` });
        }} sx={{ ml: 0.5, color: '#fff' }}>Save changes</Button>
      </Stack>
    </Box>
  );

  return (
    <ThemeProvider theme={EVzoneTheme}>
      <CssBaseline />
      <MobileShell title="Charger details" tagline="performance • schedule • access" onBack={handleBack} onHelp={onHelp} navValue={navValue} onNavChange={handleNavChange} footer={Footer} onOpenAggregator={onOpenAggregator}>
        <Box>
            {/* Location & map */}
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>Location</Typography>
            <MapPicker value={coords} onChange={setCoords} />
            <TextField label="Location display name" value={locationName} onChange={(e) => setLocationName(e.target.value)} placeholder="e.g., Basement P2 – Slot 12" fullWidth sx={{ mt: 1.25 }} disabled={!editBasics} />

            {/* Basic details */}
            <Paper elevation={0} sx={{ mt: 2, p: 2, borderRadius: 1.5, border: '1px solid #eef3f1', bgcolor: '#fff' }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                <Typography variant="subtitle2" fontWeight={800}>Basic details</Typography>
                <Button size="small" startIcon={<EditRoundedIcon />} onClick={() => setEditBasics(p => !p)}>{editBasics ? 'Done' : 'Edit details'}</Button>
              </Stack>
              <Stack spacing={1.25}>
                <TextField label="Charger name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Home garage charger" fullWidth disabled={!editBasics} />
                <TextField label="Access & parking notes" value={accessNotes} onChange={(e) => setAccessNotes(e.target.value)} placeholder="Gate opens at 07:00; ask guard; max vehicle height 2.1m" fullWidth multiline minRows={2} disabled={!editBasics} />
              </Stack>
            </Paper>

            {/* Core settings */}
            <Paper elevation={0} sx={{ mt: 2, p: 2, borderRadius: 1.5, border: '1px solid #eef3f1', bgcolor: '#fff' }}>
              <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1 }}>Core settings</Typography>
              <Stack spacing={1.25}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Typography variant="body2" sx={{ minWidth: 120 }}>Usage</Typography>
                  <ToggleButtonGroup exclusive size="small" value={usage} onChange={(_, v) => v && setUsage(v)}>
                    <ToggleButton value="private">Private</ToggleButton>
                    <ToggleButton value="commercial">Commercial</ToggleButton>
                  </ToggleButtonGroup>
                  <MuiLink component="button" onClick={onCallOr(onOpenAggregator)} sx={{ ml: 'auto', color: 'secondary.main', '&:hover': { color: 'primary.dark' } }}>Manage in Aggregator &amp; CPMS</MuiLink>
                </Stack>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Typography variant="body2" sx={{ minWidth: 120 }}>Availability</Typography>
                  <Chip size="small" label={availability?.label || '—'} />
                  <Button size="small" variant="outlined" onClick={onCallOr(onOpenAvail)} sx={{ ml: 'auto', '&:hover': { bgcolor: 'secondary.main', color: '#fff' } }}>Edit</Button>
                </Stack>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Typography variant="body2" sx={{ minWidth: 120 }}>Access</Typography>
                  <Chip size="small" label={access?.label || 'Public'} />
                  <FormControlLabel control={<Switch checked={access?.label !== 'private'} onChange={(e) => setAccess({ label: e.target.checked ? 'Public' : 'private' })} />} label={access?.label} sx={{ ml: 'auto' }} />
                </Stack>
              </Stack>
            </Paper>

            {/* New merged section: Device & Hardware + OCPP */}
            <DeviceInfoPanel device={device} ocpp={ocpp} />

            {/* Connectors actions */}
            <Paper elevation={0} sx={{ mt: 2, p: 2, borderRadius: 1.5, border: '1px solid #eef3f1', bgcolor: '#fff' }}>
              <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1 }}>Connectors</Typography>
              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
                <Chip size="small" avatar={<Box component="span" sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#03cd8c' }} />} label="B1 • CCS 2 • 90kW" onClick={() => alert('Select B1 on map')} sx={{ '&:hover': { bgcolor: 'secondary.main', color: '#fff' } }} />
                <Chip size="small" avatar={<Box component="span" sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#f77f00' }} />} label="B2 • Type 2 • 22kW" onClick={() => alert('Select B2 on map')} sx={{ '&:hover': { bgcolor: 'secondary.main', color: '#fff' } }} />
              </Stack>
              <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                <Button size="small" variant="outlined" startIcon={<PlayArrowRoundedIcon />} onClick={() => alert('Start selected connector')} sx={{ '&:hover': { bgcolor: 'secondary.main', color: '#fff' } }}>Start</Button>
                <Button size="small" variant="outlined" startIcon={<BlockRoundedIcon />} onClick={() => alert('Disable selected connector')} sx={{ '&:hover': { bgcolor: 'secondary.main', color: '#fff' } }}>Disable</Button>
                <Button size="small" variant="outlined" startIcon={<LockRoundedIcon />} onClick={() => alert('Lock cable')} sx={{ '&:hover': { bgcolor: 'secondary.main', color: '#fff' } }}>Lock</Button>
              </Stack>
            </Paper>

            {/* Performance quick stats */}
            <Box sx={{ mt: 2 }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Typography variant="subtitle2" fontWeight={700}>Performance</Typography>
                <Button size="small" variant="text" onClick={() => alert('Open analytics')}>View analytics</Button>
              </Stack>
              <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                <Stat label="Uptime" value="99.2%" />
                <Stat label="Avg. kWh / session" value="17.3" />
                <Stat label="Revenue" value="UGX 1.2M" />
              </Stack>
            </Box>
        </Box>
      </MobileShell>

      <Snackbar open={snack.open} autoHideDuration={2000} onClose={() => setSnack({ open: false, msg: '' })} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity="success" sx={{ width: '100%' }}>{snack.msg}</Alert>
      </Snackbar>
    </ThemeProvider>
  );
}
