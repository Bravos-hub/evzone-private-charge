import React, { useState, useMemo } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import {
  CssBaseline, Container, Box, Typography, Paper, Stack, Button,
  FormControl, FormLabel, RadioGroup, FormControlLabel, Radio,
  TextField, Switch, IconButton, Select, MenuItem, AppBar, Toolbar,
  BottomNavigation, BottomNavigationAction, Tooltip
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import EvStationIcon from '@mui/icons-material/EvStation';
import HistoryIcon from '@mui/icons-material/History';
import AccountBalanceWalletRoundedIcon from '@mui/icons-material/AccountBalanceWalletRounded';
import SupportAgentRoundedIcon from '@mui/icons-material/SupportAgentRounded';

const theme = createTheme({ palette: { primary: { main: '#03cd8c' }, secondary: { main: '#f77f00' }, background: { default: '#f2f2f2' } }, shape: { borderRadius: 7 }, typography: { fontFamily: 'Inter, Roboto, Arial, sans-serif' } });

const CONNECTORS = {
  st1: [ { id: 'c1', label: 'A1 — Type 2' }, { id: 'c2', label: 'A2 — CCS 2' } ],
  st2: [ { id: 'c3', label: 'B1 — CHAdeMO' } ]
};

function MobileShell({ title, tagline, onBack, onHelp, navValue, onNavChange, footer, children }) {
  const handleBack = () => { if (onBack) return onBack(); console.info('Navigate back'); };
  return (
    <Box sx={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
      <AppBar position="fixed" elevation={1} color="primary">
        <Toolbar sx={{ px: 0 }}>
          <Box sx={{ width: '100%', maxWidth: 480, mx: 'auto', px: 1, display: 'flex', alignItems: 'center' }}>
            <IconButton size="small" edge="start" onClick={handleBack} aria-label="Back" sx={{ color: 'common.white', mr: 1 }}>
              <ArrowBackIosNewIcon fontSize="small" />
            </IconButton>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6" color="inherit" sx={{ fontWeight: 700, lineHeight: 1.15 }}>{title}</Typography>
              {tagline && <Typography variant="caption" color="common.white" sx={{ opacity: 0.9 }}>{tagline}</Typography>}
            </Box>
            <Box sx={{ flexGrow: 1 }} />
            <IconButton size="small" edge="end" aria-label="Help" onClick={onHelp} sx={{ color: 'common.white' }}>
              <HelpOutlineIcon fontSize="small" />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>
      <Toolbar />
      <Box component="main" sx={{ flex: 1 }}>{children}</Box>
      <Box component="footer" sx={{ position: 'sticky', bottom: 0 }}>
        {footer}
        <Paper elevation={8} sx={{ borderTopLeftRadius: 16, borderTopRightRadius: 16 }}>
          <BottomNavigation value={navValue} onChange={(_, v) => onNavChange && onNavChange(v)} showLabels>
            <BottomNavigationAction label="Home" icon={<HomeRoundedIcon />} />
            <BottomNavigationAction label="Stations" icon={<EvStationIcon />} />
            <BottomNavigationAction label="Sessions" icon={<HistoryIcon />} />
            <BottomNavigationAction label="Support" icon={<SupportAgentRoundedIcon />} />
            <BottomNavigationAction label="Wallet" icon={<AccountBalanceWalletRoundedIcon />} />
          </BottomNavigation>
        </Paper>
      </Box>
    </Box>
  );
}

function DayChips({ value, onChange }) {
  const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  return (
    <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
      {days.map(d => (
        <Button key={d} size="small" variant={value.includes(d)?'contained':'outlined'} color={value.includes(d)?'secondary':'inherit'} onClick={() => onChange(d)}>{d}</Button>
      ))}
    </Stack>
  );
}

export default function AvailabilityPro({
  chargers = [{ id: 'st1', name: 'Home Charger' }, { id: 'st2', name: 'Office Charger' }],
  defaultChargerId = 'st1',
  commercialChargerId,
  selectedChargerId,
  aggregatorUrl,
  onOpenAggregator,
  onBack, onHelp, onNavChange, onSave
}) {
  const [navValue, setNavValue] = useState(1);
  const [chargerId, setChargerId] = useState(defaultChargerId);
  const [scope, setScope] = useState('charger'); // 'charger' | 'connector'
  const connectors = useMemo(() => CONNECTORS[chargerId] || [], [chargerId]);
  const [connectorId, setConnectorId] = useState(connectors[0]?.id || '');
  React.useEffect(()=>{ setConnectorId((CONNECTORS[chargerId]||[])[0]?.id || ''); }, [chargerId]);

  const [online, setOnline] = useState(true);
  const [useMode, setUseMode] = useState('Home');
  const [model, setModel] = useState('Manual');
  const [slots, setSlots] = useState([{ id: 1, start: '09:30', end: '17:30' }]);
  const [days, setDays] = useState(['Mon','Tue','Wed','Thu','Fri']);
  const [timezone] = useState('Africa/Kampala');
  const [leadMins, setLeadMins] = useState(0);
  const [maxHours, setMaxHours] = useState(4);
  const [overnight, setOvernight] = useState(false);
  const [holidayMode, setHolidayMode] = useState(false);
  const [blackout, setBlackout] = useState('');

  // const currentId = selectedChargerId || chargerId; // Unused but kept for potential future use

  const addSlot = () => setSlots(s => [...s, { id: Date.now(), start: '09:00', end: '12:00' }]);
  const removeSlot = (id) => setSlots(s => s.filter(x => x.id !== id));
  const updateSlot = (id, patch) => setSlots(s => s.map(x => x.id === id ? { ...x, ...patch } : x));

  const Footer = (
    <Box sx={{ px: 2, pb: 'calc(12px + env(safe-area-inset-bottom))', pt: 1.5, background: '#f2f2f2', borderTop: '1px solid #e9eceb' }}>
      <Button fullWidth size="large" variant="contained" color="secondary" onClick={() => (onSave ? onSave({ scope, chargerId, connectorId: scope==='connector' ? connectorId : undefined, online, useMode, model, slots, days, timezone, leadMins, maxHours, overnight, holidayMode, blackout }) : alert('Save availability (payload logged)'))}
        sx={{ py: 1.25, color: 'common.white', '&:hover': { bgcolor: 'secondary.dark', color: 'common.white' } }}>
        Save availability
      </Button>
    </Box>
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="xs" disableGutters>
        <MobileShell title="Availability" tagline="set schedule per charger or connector" onBack={onBack} onHelp={onHelp} navValue={navValue} onNavChange={(v) => { setNavValue(v); onNavChange && onNavChange(v); }} footer={Footer}>
          <Box sx={{ px: 2, pt: 2 }}>
            {/* Target selector */}
            <Paper elevation={0} sx={{ p: 2, borderRadius: 1.5, bgcolor: '#fff', border: '1px solid #eef3f1', mb: 1 }}>
              <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1 }}>Target</Typography>
              <FormControl size="small" fullWidth sx={{ mb: 1 }}>
                <FormLabel>Charger</FormLabel>
                <Select value={chargerId} onChange={(e)=>setChargerId(e.target.value)}>
                  {chargers.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                </Select>
              </FormControl>

              <FormControl sx={{ mb: 1 }}>
                <FormLabel>Scope</FormLabel>
                <RadioGroup row value={scope} onChange={(e)=>setScope(e.target.value)}>
                  <FormControlLabel value="charger" control={<Radio />} label="Charger" />
                  <FormControlLabel value="connector" control={<Radio />} label="Connector" />
                </RadioGroup>
              </FormControl>

              {scope === 'connector' && (
                <Tooltip title={(connectors||[]).length ? '' : 'No connectors for this charger'}>
                  <span>
                    <FormControl size="small" fullWidth disabled={!(connectors||[]).length}>
                      <FormLabel>Connector</FormLabel>
                      <Select value={connectorId} onChange={(e)=>setConnectorId(e.target.value)}>
                        {(connectors||[]).map(k => <MenuItem key={k.id} value={k.id}>{k.label}</MenuItem>)}
                      </Select>
                    </FormControl>
                  </span>
                </Tooltip>
              )}
            </Paper>

            {/* Commercial badge + Aggregator CTA */}
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
              <Typography variant="caption" color="text.secondary">Timezone: {timezone}</Typography>
              <Box sx={{ flexGrow: 1 }} />
              <Button size="small" variant="text" onClick={() => (onOpenAggregator ? onOpenAggregator(aggregatorUrl, chargerId, connectorId, scope) : alert('Open Aggregator'))}
                sx={{ '&:hover': { bgcolor: 'secondary.main', color: '#fff' } }}>Aggregator & CPMS</Button>
            </Stack>

            <Paper elevation={0} sx={{ p: 2, borderRadius: 1.5, bgcolor: '#fff', border: '1px solid #eef3f1' }}>
              <FormControl component="fieldset" sx={{ mb: 2 }}>
                <FormLabel>Status</FormLabel>
                <RadioGroup row value={online ? 'online' : 'offline'} onChange={(e) => setOnline(e.target.value === 'online')}>
                  <FormControlLabel value="online" control={<Radio />} label="Online" />
                  <FormControlLabel value="offline" control={<Radio />} label="Offline" />
                </RadioGroup>
              </FormControl>

              <FormControl component="fieldset" sx={{ mb: 2 }}>
                <FormLabel>Use mode</FormLabel>
                <RadioGroup row value={useMode} onChange={(e) => setUseMode(e.target.value)}>
                  <FormControlLabel value="Home" control={<Radio />} label="Home" />
                  <FormControlLabel value="Office" control={<Radio />} label="Office" />
                  <FormControlLabel value="Commercial" control={<Radio />} label="Commercial" />
                </RadioGroup>
              </FormControl>

              <FormControl component="fieldset" sx={{ mb: 1 }}>
                <FormLabel>Availability model</FormLabel>
                <RadioGroup value={model} onChange={(e) => setModel(e.target.value)}>
                  <FormControlLabel value="Day" control={<Radio />} label="Day (06:00–17:59)" />
                  <FormControlLabel value="Night" control={<Radio />} label="Night (18:00–05:59)" />
                  <FormControlLabel value="Manual" control={<Radio />} label="Manual (custom schedule)" />
                </RadioGroup>
              </FormControl>

              {model === 'Manual' && (
                <Box sx={{ mt: 1 }}>
                  {slots.map((s) => (
                    <Paper key={s.id} variant="outlined" sx={{ p: 1.25, mb: 1, borderRadius: 1 }}>
                      <Stack direction="row" spacing={1}>
                        <TextField type="time" label="Start" value={s.start} onChange={(e) => updateSlot(s.id, { start: e.target.value })} sx={{ flex: 1 }} />
                        <TextField type="time" label="End" value={s.end} onChange={(e) => updateSlot(s.id, { end: e.target.value })} sx={{ flex: 1 }} />
                        <IconButton color="error" onClick={() => removeSlot(s.id)} aria-label="Remove slot"><DeleteOutlineIcon /></IconButton>
                      </Stack>
                    </Paper>
                  ))}
                  <Button startIcon={<AddCircleOutlineIcon />} onClick={addSlot}>Add time</Button>

                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1.5 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Days</Typography>
                    <DayChips value={days} onChange={(d) => setDays(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d])} />
                  </Stack>
                </Box>
              )}
            </Paper>

            {/* Advanced rules */}
            <Paper elevation={0} sx={{ mt: 2, p: 2, borderRadius: 1.5, bgcolor: '#fff', border: '1px solid #eef3f1', mb: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>Advanced rules</Typography>
              <Stack spacing={1.5}>
                <Stack direction="row" spacing={1}>
                  <TextField label="Lead time (min)" type="number" value={leadMins} onChange={(e)=>setLeadMins(Number(e.target.value)||0)} sx={{ width: 180 }} />
                  <TextField label="Max session (hrs)" type="number" value={maxHours} onChange={(e)=>setMaxHours(Number(e.target.value)||0)} sx={{ width: 180 }} />
                </Stack>
                <Stack direction="row" spacing={2}>
                  <FormControlLabel control={<Switch checked={overnight} onChange={(e)=>setOvernight(e.target.checked)} />} label="Allow overnight sessions" />
                  <FormControlLabel control={<Switch checked={holidayMode} onChange={(e)=>setHolidayMode(e.target.checked)} />} label="Holiday mode" />
                </Stack>
                <TextField label="Blackout dates / notes" placeholder="e.g., 2025-12-25, 2026-01-01" fullWidth value={blackout} onChange={(e)=>setBlackout(e.target.value)} />
              </Stack>
            </Paper>
          </Box>
        </MobileShell>
      </Container>
    </ThemeProvider>
  );
}
