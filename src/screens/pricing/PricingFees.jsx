import React, { useState, useMemo, useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import {
  CssBaseline, Container, Box, Typography, Paper, Stack, Button,
  FormControl, FormLabel, RadioGroup, FormControlLabel, Radio,
  TextField, Switch, IconButton, Select, MenuItem, AppBar, Toolbar,
  BottomNavigation, BottomNavigationAction, FormHelperText, Divider, Tooltip
} from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import EvStationIcon from '@mui/icons-material/EvStation';
import HistoryIcon from '@mui/icons-material/History';
import AccountBalanceWalletRoundedIcon from '@mui/icons-material/AccountBalanceWalletRounded';
import SupportAgentRoundedIcon from '@mui/icons-material/SupportAgentRounded';

const theme = createTheme({ palette: { primary: { main: '#03cd8c' }, secondary: { main: '#f77f00' }, background: { default: '#f2f2f2' } }, shape: { borderRadius: 14 }, typography: { fontFamily: 'Inter, Roboto, Arial, sans-serif' } });

// Example connectors by charger (stubbed for UI)
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
  const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  return (
    <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
      {days.map(d => (
        <Button key={d} size="small" variant={value.includes(d)?'contained':'outlined'} color={value.includes(d)?'secondary':'inherit'} onClick={() => onChange(d)}>{d}</Button>
      ))}
    </Stack>
  );
}

export default function PricingFeesPro({
  chargers = [{ id: 'st1', name: 'Home Charger' }, { id: 'st2', name: 'Office Charger' }],
  defaultChargerId = 'st1',
  onBack, onHelp, onNavChange, onSave,
  prefillTOU
}) {
  const [navValue, setNavValue] = useState(1);
  const [chargerId, setChargerId] = useState(defaultChargerId);
  const [scope, setScope] = useState('charger'); // 'charger' | 'connector'
  const connectors = useMemo(() => CONNECTORS[chargerId] || [], [chargerId]);
  const [connectorId, setConnectorId] = useState(connectors[0]?.id || '');
  useEffect(()=>{ setConnectorId((CONNECTORS[chargerId]||[])[0]?.id || ''); }, [chargerId]);

  // Basic pricing
  const [chargeBy, setChargeBy] = useState('energy'); // 'energy' | 'duration'
  const [rate, setRate] = useState(1200);
  const [vat, setVat] = useState(18);
  const [includeVat, setIncludeVat] = useState(false);

  // Pricing model
  const [model, setModel] = useState('single'); // 'single' | 'tou'
  const [periods, setPeriods] = useState([
    { id: 1, name: 'Evening', start: '18:00', end: '23:59', days: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'], rate: 1500 }
  ]);

  // Extra fees & rules
  const [idleEnabled, setIdleEnabled] = useState(true);
  const [idleRate, setIdleRate] = useState(200); // UGX/min after grace
  const [idleGrace, setIdleGrace] = useState(10); // minutes
  const [minChargeEnabled, setMinChargeEnabled] = useState(false);
  const [minCharge, setMinCharge] = useState(3000);
  const [freeMinutesEnabled, setFreeMinutesEnabled] = useState(false);
  const [freeMinutes, setFreeMinutes] = useState(5);
  const [cancelFeeEnabled, setCancelFeeEnabled] = useState(false);
  const [cancelFee, setCancelFee] = useState(2000);
  const [membershipDiscEnabled, setMembershipDiscEnabled] = useState(false);
  const [membershipDiscPct, setMembershipDiscPct] = useState(5);

  // Booking fees
  const [bookingFlatEnabled, setBookingFlatEnabled] = useState(true);
  const [bookingFlat, setBookingFlat] = useState(5000);
  const [bookingPctEnabled, setBookingPctEnabled] = useState(true);
  const [bookingPct, setBookingPct] = useState(10);

  // Payment timing
  const [timing, setTiming] = useState('prepaid'); // 'prepaid' | 'postpaid'

  useEffect(() => {
    if (prefillTOU && Array.isArray(prefillTOU) && prefillTOU.length) {
      setModel('tou');
      setPeriods(prefillTOU.map((p, i) => ({ id: Date.now()+i, name: p.name || 'Imported', start: p.start, end: p.end, days: p.days||[], rate: p.rate||0 })));
    }
  }, [prefillTOU]);

  const addPeriod = () => {
    const id = Date.now();
    setPeriods(p => [...p, { id, name: 'Custom', start: '09:00', end: '12:00', days: ['Mon','Tue','Wed'], rate }]);
  };
  const removePeriod = (id) => setPeriods(p => p.filter(x => x.id !== id));
  const updatePeriod = (id, patch) => setPeriods(p => p.map(x => x.id === id ? { ...x, ...patch } : x));

  const Footer = (
    <Box sx={{ px: 2, pb: 'calc(12px + env(safe-area-inset-bottom))', pt: 1.5, background: '#f2f2f2', borderTop: '1px solid #e9eceb' }}>
      <Button fullWidth size="large" variant="contained" color="secondary"
        onClick={() => onSave ? onSave({
          scope,
          chargerId,
          connectorId: scope==='connector' ? connectorId : undefined,
          chargeBy, rate, vat, includeVat, model, periods,
          bookingFlatEnabled, bookingFlat, bookingPctEnabled, bookingPct, timing,
          idleEnabled, idleRate, idleGrace, minChargeEnabled, minCharge, freeMinutesEnabled, freeMinutes, cancelFeeEnabled, cancelFee, membershipDiscEnabled, membershipDiscPct
        }) : alert('Save pricing (payload logged)')}
        sx={{ py: 1.25, color: 'common.white', '&:hover': { bgcolor: 'secondary.dark', color: 'common.white' } }}>
        Save pricing
      </Button>
    </Box>
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="xs" disableGutters>
        <MobileShell title="Pricing & fees" tagline="per‑charger or per‑connector with TOU" onBack={onBack} onHelp={onHelp} navValue={navValue} onNavChange={(v) => { setNavValue(v); onNavChange && onNavChange(v); }} footer={Footer}>
          <Box sx={{ px: 2, pt: 2 }}>
            {/* Target selector */}
            <Paper elevation={0} sx={{ p: 2, borderRadius: 3, bgcolor: '#fff', border: '1px solid #eef3f1', mb: 2 }}>
              <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1 }}>Target</Typography>
              <Stack spacing={1}>
                <FormControl size="small" fullWidth>
                  <FormLabel>Charger</FormLabel>
                  <Select value={chargerId} onChange={(e)=>setChargerId(e.target.value)}>
                    {chargers.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                  </Select>
                  <FormHelperText>Rates will be saved for this target.</FormHelperText>
                </FormControl>

                <FormControl>
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
              </Stack>
            </Paper>

            {/* Tip Strip (orange theme) */}
            <Paper elevation={0} sx={{ p: 1.5, borderRadius: 3, bgcolor: 'rgba(247,127,0,0.08)', borderLeft: '4px solid', borderColor: 'secondary.main', mb: 2 }}>
              <Stack direction="row" spacing={1.25} alignItems="center">
                <InfoOutlinedIcon sx={{ color: 'secondary.main' }} />
                <Typography variant="caption" color="text.secondary">Set different rates per connector (e.g., CCS vs Type 2) when needed.</Typography>
              </Stack>
            </Paper>

            {/* Charge by & Rate */}
            <Paper elevation={0} sx={{ p: 2, borderRadius: 3, bgcolor: '#fff', border: '1px solid #eef3f1' }}>
              <FormControl component="fieldset" sx={{ mb: 2 }}>
                <FormLabel>Charge by</FormLabel>
                <RadioGroup row value={chargeBy} onChange={(e) => setChargeBy(e.target.value)}>
                  <FormControlLabel value="energy" control={<Radio />} label="Energy (UGX/kWh)" />
                  <FormControlLabel value="duration" control={<Radio />} label="Duration (UGX/min)" />
                </RadioGroup>
              </FormControl>

              <Stack direction="row" spacing={2}>
                <TextField label={`Rate (UGX/${chargeBy === 'energy' ? 'kWh' : 'min'})`} type="number" value={rate} onChange={(e) => setRate(Number(e.target.value) || 0)} sx={{ flex: 1 }} />
                <TextField label="VAT (%)" type="number" value={vat} onChange={(e) => setVat(Number(e.target.value) || 0)} sx={{ width: 110 }} />
              </Stack>
              <FormControlLabel control={<Switch checked={includeVat} onChange={(e) => setIncludeVat(e.target.checked)} />} label="Prices include VAT" />
            </Paper>

            {/* Pricing model */}
            <Paper elevation={0} sx={{ mt: 2, p: 2, borderRadius: 3, bgcolor: '#fff', border: '1px solid #eef3f1' }}>
              <FormControl component="fieldset" sx={{ mb: 2 }}>
                <FormLabel>Pricing model</FormLabel>
                <RadioGroup value={model} onChange={(e) => setModel(e.target.value)}>
                  <FormControlLabel value="single" control={<Radio />} label="Single rate (all times)" />
                  <FormControlLabel value="tou" control={<Radio />} label="Time‑of‑Use" />
                </RadioGroup>
              </FormControl>

              {model === 'tou' && (
                <Box>
                  {periods.map(p => (
                    <Paper key={p.id} variant="outlined" sx={{ p: 1.25, mb: 1, borderRadius: 2 }}>
                      <Stack spacing={1}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <TextField label="Name" value={p.name} onChange={(e) => updatePeriod(p.id, { name: e.target.value })} sx={{ flex: 1 }} />
                          <IconButton color="error" onClick={() => removePeriod(p.id)} aria-label="Remove period"><DeleteOutlineIcon /></IconButton>
                        </Stack>
                        <Stack direction="row" spacing={1}>
                          <TextField label="Start" type="time" value={p.start} onChange={(e) => updatePeriod(p.id, { start: e.target.value })} sx={{ flex: 1 }} />
                          <TextField label="End" type="time" value={p.end} onChange={(e) => updatePeriod(p.id, { end: e.target.value })} sx={{ flex: 1 }} />
                        </Stack>
                        <DayChips value={p.days} onChange={(d) => updatePeriod(p.id, { days: p.days.includes(d) ? p.days.filter(x => x !== d) : [...p.days, d] })} />
                        <TextField label={`Rate (UGX/${chargeBy === 'energy' ? 'kWh' : 'min'})`} type="number" value={p.rate} onChange={(e) => updatePeriod(p.id, { rate: Number(e.target.value) || 0 })} />
                      </Stack>
                    </Paper>
                  ))}
                  <Button startIcon={<AddCircleOutlineIcon />} onClick={addPeriod} sx={{ mt: 0.5 }}>Add TOU period</Button>
                </Box>
              )}
            </Paper>

            {/* Extra fees & rules */}
            <Paper elevation={0} sx={{ mt: 2, p: 2, borderRadius: 3, bgcolor: '#fff', border: '1px solid #eef3f1' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>Extra fees & rules</Typography>
              <Stack spacing={1.5}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <FormControlLabel control={<Switch checked={idleEnabled} onChange={(e) => setIdleEnabled(e.target.checked)} />} label="Idle fee after grace" />
                  <TextField label="Grace (min)" type="number" value={idleGrace} onChange={(e) => setIdleGrace(Number(e.target.value)||0)} sx={{ width: 130 }} />
                  <TextField label="Idle rate (UGX/min)" type="number" value={idleRate} onChange={(e) => setIdleRate(Number(e.target.value)||0)} sx={{ flex: 1 }} />
                </Stack>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <FormControlLabel control={<Switch checked={minChargeEnabled} onChange={(e) => setMinChargeEnabled(e.target.checked)} />} label="Minimum session charge" />
                  <TextField label="Min charge (UGX)" type="number" value={minCharge} onChange={(e) => setMinCharge(Number(e.target.value)||0)} sx={{ flex: 1 }} />
                </Stack>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <FormControlLabel control={<Switch checked={freeMinutesEnabled} onChange={(e) => setFreeMinutesEnabled(e.target.checked)} />} label="Free minutes at start" />
                  <TextField label="Free (min)" type="number" value={freeMinutes} onChange={(e) => setFreeMinutes(Number(e.target.value)||0)} sx={{ width: 150 }} />
                </Stack>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <FormControlLabel control={<Switch checked={cancelFeeEnabled} onChange={(e) => setCancelFeeEnabled(e.target.checked)} />} label="Cancellation fee" />
                  <TextField label="Cancel fee (UGX)" type="number" value={cancelFee} onChange={(e) => setCancelFee(Number(e.target.value)||0)} sx={{ flex: 1 }} />
                </Stack>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <FormControlLabel control={<Switch checked={membershipDiscEnabled} onChange={(e) => setMembershipDiscEnabled(e.target.checked)} />} label="Membership discount" />
                  <TextField label="Discount (%)" type="number" value={membershipDiscPct} onChange={(e) => setMembershipDiscPct(Number(e.target.value)||0)} sx={{ width: 160 }} />
                </Stack>
              </Stack>
            </Paper>

            {/* Booking fees */}
            <Paper elevation={0} sx={{ mt: 2, p: 2, borderRadius: 3, bgcolor: '#fff', border: '1px solid #eef3f1' }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>Booking fees</Typography>
              <Stack spacing={1.5}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <FormControlLabel control={<Switch checked={bookingFlatEnabled} onChange={(e) => setBookingFlatEnabled(e.target.checked)} />} label="Flat" />
                  <TextField label="UGX" type="number" value={bookingFlat} onChange={(e) => setBookingFlat(Number(e.target.value) || 0)} sx={{ flex: 1 }} />
                </Stack>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <FormControlLabel control={<Switch checked={bookingPctEnabled} onChange={(e) => setBookingPctEnabled(e.target.checked)} />} label="Percent" />
                  <TextField label="%" type="number" value={bookingPct} onChange={(e) => setBookingPct(Number(e.target.value) || 0)} sx={{ flex: 1 }} />
                </Stack>
              </Stack>
            </Paper>

            {/* Payment timing */}
            <Paper elevation={0} sx={{ mt: 2, p: 2, borderRadius: 3, bgcolor: '#fff', border: '1px solid #eef3f1', mb: 2 }}>
              <FormControl component="fieldset">
                <FormLabel>Payment timing</FormLabel>
                <RadioGroup row value={timing} onChange={(e) => setTiming(e.target.value)}>
                  <FormControlLabel value="prepaid" control={<Radio />} label="Pre‑paid" />
                  <FormControlLabel value="postpaid" control={<Radio />} label="Post‑paid" />
                </RadioGroup>
              </FormControl>
            </Paper>
          </Box>
        </MobileShell>
      </Container>
    </ThemeProvider>
  );
}
