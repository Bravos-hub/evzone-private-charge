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
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  FormControlLabel,
  Switch,
  Snackbar,
  Alert,
  Link as MuiLink,
} from '@mui/material';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import BlockRoundedIcon from '@mui/icons-material/BlockRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import { EVzoneTheme } from '../../utils/theme';
import MobileShell from '../../components/layout/MobileShell';
import MapPicker from '../../components/common/MapPicker';
import Stat from '../../components/common/Stat';

// ---- Reusable helpers
function onCallOr(fn) {
  return () => (typeof fn === 'function' ? fn() : alert('Action'));
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
    usage: 'private', // 'private' | 'commercial'
    availabilityLabel: '24/7',
    accessLabel: 'Public',
    operatorAssigned: false,
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
    setNavValue(value); // Update immediately for visual feedback
    if (routes[value] !== undefined) {
      navigate(routes[value]);
    }
    if (onNavChange) onNavChange(value);
  }, [navigate, onNavChange, routes]);
  
  const handleBack = useCallback(() => {
    if (onBack) {
      onBack();
    } else {
      // Navigate back to chargers list
      navigate('/chargers');
    }
  }, [navigate, onBack]);
  
  const [name, setName] = useState(initial.name || '');
  const [locationName, setLocationName] = useState(initial.locationName || '');
  const [coords, setCoords] = useState(initial.coords || [0.3476, 32.5825]);
  const [accessNotes, setAccessNotes] = useState(initial.accessNotes || '');
  const [usage, setUsage] = useState(initial.usage || 'private');
  const [availability] = useState({ label: initial.availabilityLabel || '24/7' });
  const [access, setAccess] = useState({ label: initial.accessLabel || 'Public' });
  const [operatorAssigned] = useState(!!initial.operatorAssigned);
  const [editBasics, setEditBasics] = useState(false);
  const canSave = useMemo(() => Boolean(name && locationName), [name, locationName]);
  const [snack, setSnack] = useState({ open: false, msg: '' });

  // ---------- Dev self-tests (console-only, browser-safe)
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
      check('canSave reflects basic fields', canSave === !!(name && locationName));

      console.table(results);
    } catch (e) {
      console.warn('Dev tests crashed', e);
    }
    // eslint-disable-next-line
  }, []);

  const handleSave = () => {
    const payload = {
      name,
      locationName,
      coords,
      accessNotes,
      usage,
      availability: availability?.label,
      access: access?.label,
    };
    if (typeof onSave === 'function') onSave(payload);
    else setSnack({ open: true, msg: `Saved: ${JSON.stringify(payload)}` });
  };

  const Footer = (
    <Box sx={{ px: 2, pb: 'calc(10px + env(safe-area-inset-bottom))', pt: 1.25, background: '#f2f2f2', borderTop: '1px solid #eee' }}>
      <Stack direction="row" spacing={1} alignItems="center">
        <Button variant="outlined" onClick={handleBack} sx={{ mr: 'auto', '&:hover': { bgcolor: 'secondary.main', color: '#fff' } }}>Back</Button>
        <Button variant="outlined" onClick={onCallOr(onOpenPricing)} sx={{ '&:hover': { bgcolor: 'secondary.main', color: '#fff' } }}>Pricing &amp; fees</Button>
        <Button variant="outlined" onClick={onCallOr(onOpenAvail)} sx={{ '&:hover': { bgcolor: 'secondary.main', color: '#fff' } }}>Availability</Button>
        <Button variant="outlined" onClick={onCallOr(onOpenAccess)} sx={{ '&:hover': { bgcolor: 'secondary.main', color: '#fff' } }}>Access</Button>
        <Button disabled={!canSave} variant="contained" color="secondary" onClick={handleSave} sx={{ ml: 0.5, color: '#fff' }}>
          Save changes
        </Button>
      </Stack>
    </Box>
  );

  return (
    <ThemeProvider theme={EVzoneTheme}>
      <CssBaseline />
      <MobileShell
          title="Charger details"
          tagline="performance • schedule • access"
          onBack={handleBack}
          onHelp={onHelp}
          navValue={navValue}
          onNavChange={handleNavChange}
          footer={Footer}
          onOpenAggregator={onOpenAggregator}
        >
          <Box sx={{ px: 2, pt: 2 }}>
            {/* Location & map (editable) */}
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>Location</Typography>
            <MapPicker value={coords} onChange={setCoords} />
            <TextField
              label="Location display name"
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              placeholder="e.g., Basement P2 – Slot 12"
              fullWidth
              sx={{ mt: 1.25 }}
              disabled={!editBasics}
            />

            {/* Basic details */}
            <Paper elevation={0} sx={{ mt: 2, p: 2, borderRadius: 1.5, border: '1px solid #eef3f1', bgcolor: '#fff' }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                <Typography variant="subtitle2" fontWeight={800}>Basic details</Typography>
                <Button size="small" startIcon={<EditRoundedIcon />} onClick={() => setEditBasics(p => !p)}>
                  {editBasics ? 'Done' : 'Edit details'}
                </Button>
              </Stack>
              <Stack spacing={1.25}>
                <TextField
                  label="Charger name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Home garage charger"
                  fullWidth
                  disabled={!editBasics}
                />
                <TextField
                  label="Access & parking notes"
                  value={accessNotes}
                  onChange={(e) => setAccessNotes(e.target.value)}
                  placeholder="Gate opens at 07:00; ask guard; max vehicle height 2.1m"
                  fullWidth
                  multiline
                  minRows={2}
                  disabled={!editBasics}
                />
              </Stack>
            </Paper>

            {/* Core settings (quick tweaks) */}
            <Paper elevation={0} sx={{ mt: 2, p: 2, borderRadius: 1.5, border: '1px solid #eef3f1', bgcolor: '#fff' }}>
              <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1 }}>Core settings</Typography>
              <Stack spacing={1.25}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Typography variant="body2" sx={{ minWidth: 120 }}>Usage</Typography>
                  <ToggleButtonGroup
                    exclusive
                    size="small"
                    value={usage}
                    onChange={(_, v) => v && setUsage(v)}
                  >
                    <ToggleButton value="private">Private</ToggleButton>
                    <ToggleButton value="commercial">Commercial</ToggleButton>
                  </ToggleButtonGroup>
                  <MuiLink component="button" onClick={onCallOr(onOpenAggregator)} sx={{ ml: 'auto', color: 'secondary.main', '&:hover': { color: 'primary.dark' } }}>
                    Manage in Aggregator &amp; CPMS
                  </MuiLink>
                </Stack>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Typography variant="body2" sx={{ minWidth: 120 }}>Availability</Typography>
                  <Chip size="small" label={availability?.label || '—'} />
                  <Button size="small" variant="outlined" onClick={onCallOr(onOpenAvail)} sx={{ ml: 'auto', '&:hover': { bgcolor: 'secondary.main', color: '#fff' } }}>
                    Edit
                  </Button>
                </Stack>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Typography variant="body2" sx={{ minWidth: 120 }}>Access</Typography>
                  <Chip size="small" label={access?.label || 'Public'} />
                  <FormControlLabel
                    control={<Switch checked={access?.label !== 'private'} onChange={(e) => setAccess({ label: e.target.checked ? 'Public' : 'private' })} />}
                    label={access?.label}
                    sx={{ ml: 'auto' }}
                  />
                </Stack>
              </Stack>
            </Paper>

            {/* Monthly overview */}
            <Box sx={{ mt: 2 }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Typography variant="subtitle2" fontWeight={700}>September overview</Typography>
                <Button size="small" variant="text">View details</Button>
              </Stack>
              <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                <Stat label="Cost" value="UGX 240,000" />
                <Stat label="Energy" value="128.5 kWh" />
                <Stat label="Sessions" value="3" />
                <Stat label="Duration" value="15:00" />
              </Stack>
            </Box>

            {/* Operator */}
            <Box sx={{ mt: 2 }}>
              {!operatorAssigned ? (
                <Paper elevation={0} sx={{ p: 2, borderRadius: 1.5, bgcolor: '#fff', border: '1px solid #eef3f1' }}>
                  <Typography variant="subtitle1" fontWeight={700}>No operator assigned</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    Assign an accredited operator to manage operations and support.
                  </Typography>
                  <Button
                    fullWidth
                    color="secondary"
                    variant="contained"
                    onClick={onCallOr(onAssignOperator)}
                    sx={{ mt: 1.25, color: 'common.white', '&:hover': { bgcolor: 'secondary.dark' } }}
                  >
                    Assign operator
                  </Button>
                </Paper>
              ) : (
                <Paper elevation={0} sx={{ p: 2, borderRadius: 1.5, bgcolor: '#fff', border: '1px solid #eef3f1' }}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Chip label="Online" color="success" size="small" sx={{ mr: 1 }} />
                      <Typography variant="subtitle1" fontWeight={700}>Robert&nbsp;Fox</Typography>
                      <Typography variant="body2" color="text.secondary">Shift: Day</Typography>
                    </Box>
                    <Stack direction="row" spacing={1}>
                      <Button variant="outlined" size="small" onClick={onCallOr(onViewOperator)} sx={{ '&:hover': { bgcolor: 'secondary.main', color: 'common.white' } }}>View</Button>
                      <Button variant="outlined" size="small" onClick={onCallOr(onEditOperator)} sx={{ '&:hover': { bgcolor: 'secondary.main', color: 'common.white' } }}>Edit</Button>
                    </Stack>
                  </Stack>
                </Paper>
              )}
            </Box>

            {/* Amenities (editable) */}
            <Paper 
              elevation={0} 
              sx={{ 
                mt: 2, 
                p: 2, 
                borderRadius: 1.5, 
                border: '1px solid #eef3f1', 
                bgcolor: '#fff',
                width: '100%',
                maxWidth: '100%',
                boxSizing: 'border-box',
                overflow: 'hidden'
              }}
            >
              <Typography variant="subtitle2" fontWeight={800} gutterBottom>Amenities</Typography>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' },
                  gap: { xs: 1.5, sm: 2 },
                  width: '100%',
                  maxWidth: '100%',
                  '& .MuiFormControlLabel-root': {
                    margin: 0,
                    width: '100%',
                    maxWidth: '100%',
                    minWidth: 0,
                    justifyContent: 'flex-start',
                    overflow: 'hidden',
                    '& .MuiFormControlLabel-label': {
                      fontSize: { xs: '0.7rem', sm: '0.75rem' },
                      lineHeight: 1.3,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      maxWidth: '100%',
                      minWidth: 0
                    },
                    '& .MuiSwitch-root': {
                      flexShrink: 0,
                      marginRight: { xs: '8px', sm: '12px' }
                    }
                  }
                }}
              >
                <FormControlLabel control={<Switch defaultChecked />} label="Restroom" />
                <FormControlLabel control={<Switch />} label="Food & drinks" />
                <FormControlLabel control={<Switch defaultChecked />} label="24/7" />
                <FormControlLabel control={<Switch />} label="Security" />
              </Box>
            </Paper>

            {/* Connectors quick actions (status + ops) */}
            <Paper elevation={0} sx={{ mt: 2, p: 2, borderRadius: 1.5, border: '1px solid #eef3f1', bgcolor: '#fff' }}>
              <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1 }}>Connectors</Typography>
              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
                <Chip
                  size="small"
                  avatar={<Box component="span" sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#03cd8c' }} />}
                  label="B1 • CCS 2 • 90kW"
                  onClick={() => alert('Select B1 on map')}
                  sx={{ '&:hover': { bgcolor: 'secondary.main', color: '#fff' } }}
                />
                <Chip
                  size="small"
                  avatar={<Box component="span" sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#f77f00' }} />}
                  label="B2 • Type 2 • 22kW"
                  onClick={() => alert('Select B2 on map')}
                  sx={{ '&:hover': { bgcolor: 'secondary.main', color: '#fff' } }}
                />
              </Stack>
              <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                <Button size="small" variant="outlined" startIcon={<PlayArrowRoundedIcon />} onClick={() => alert('Start selected connector')} sx={{ '&:hover': { bgcolor: 'secondary.main', color: '#fff' } }}>Start</Button>
                <Button size="small" variant="outlined" startIcon={<BlockRoundedIcon />} onClick={() => alert('Disable selected connector')} sx={{ '&:hover': { bgcolor: 'secondary.main', color: '#fff' } }}>Disable</Button>
                <Button size="small" variant="outlined" startIcon={<LockRoundedIcon />} onClick={() => alert('Lock cable')} sx={{ '&:hover': { bgcolor: 'secondary.main', color: '#fff' } }}>Lock</Button>
              </Stack>
            </Paper>

            {/* Monthly performance quick stats */}
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

      <Snackbar
        open={snack.open}
        autoHideDuration={2000}
        onClose={() => setSnack({ open: false, msg: '' })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" sx={{ width: '100%' }}>{snack.msg}</Alert>
      </Snackbar>
    </ThemeProvider>
  );
}
