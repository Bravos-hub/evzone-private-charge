import React, { useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import {
  CssBaseline, Container, Box, Typography, Paper, Stack, Button,
  AppBar, Toolbar, BottomNavigation, BottomNavigationAction, IconButton,
  FormControl, Select, MenuItem, Stepper, Step, StepLabel, TextField, FormControlLabel, Switch
} from '@mui/material';
import Divider from '@mui/material/Divider';
import PowerSettingsNewRoundedIcon from '@mui/icons-material/PowerSettingsNewRounded';
import WifiOffRoundedIcon from '@mui/icons-material/WifiOffRounded';
import GppMaybeRoundedIcon from '@mui/icons-material/GppMaybeRounded';
import CableRoundedIcon from '@mui/icons-material/CableRounded';
import ReplayRoundedIcon from '@mui/icons-material/ReplayRounded';
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded';
import BuildRoundedIcon from '@mui/icons-material/BuildRounded';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import EvStationIcon from '@mui/icons-material/EvStation';
import HistoryIcon from '@mui/icons-material/History';
import AccountBalanceWalletRoundedIcon from '@mui/icons-material/AccountBalanceWalletRounded';
import SupportAgentRoundedIcon from '@mui/icons-material/SupportAgentRounded';

const theme = createTheme({ palette: { primary: { main: '#03cd8c' }, secondary: { main: '#f77f00' }, background: { default: '#f2f2f2' } }, shape: { borderRadius: 7 }, typography: { fontFamily: 'Inter, Roboto, Arial, sans-serif' } });

function MobileShell({ title, tagline, onBack, onHelp, navValue, onNavChange, footer, children }) {
  const handleBack = () => { if (onBack) return onBack(); console.info('Navigate back'); };
  return (
    <Box sx={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
      <AppBar position="fixed" elevation={1} color="primary"><Toolbar sx={{ px: 0 }}>
        <Box sx={{ width: '100%', maxWidth: 480, mx: 'auto', px: 1, display: 'flex', alignItems: 'center' }}>
          <IconButton size="small" edge="start" onClick={handleBack} aria-label="Back" sx={{ color: 'common.white', mr: 1 }}><ArrowBackIosNewIcon fontSize="small" /></IconButton>
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" color="inherit" sx={{ fontWeight: 700, lineHeight: 1.15 }}>{title}</Typography>
            {tagline && <Typography variant="caption" color="common.white" sx={{ opacity: 0.9 }}>{tagline}</Typography>}
          </Box>
          <Box sx={{ flexGrow: 1 }} />
          <IconButton size="small" edge="end" aria-label="Help" onClick={onHelp} sx={{ color: 'common.white' }}><HelpOutlineIcon fontSize="small" /></IconButton>
        </Box>
      </Toolbar></AppBar>
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

const STEPS = [
  { key: 'power', label: 'Power', icon: <PowerSettingsNewRoundedIcon /> },
  { key: 'network', label: 'Network', icon: <WifiOffRoundedIcon /> },
  { key: 'rcd', label: 'RCD', icon: <GppMaybeRoundedIcon /> },
  { key: 'connector', label: 'Connector', icon: <CableRoundedIcon /> }
];

export default function TroubleshootingWizard({
  chargers = [{ id: 'st1', name: 'Home Charger' }, { id: 'st2', name: 'Office Charger' }],
  defaultChargerId = 'st1',
  onBack, onHelp, onNavChange,
  onRestartSession, onResetConnector, onRebootCharger, onSaveNotes
}) {
  const [navValue, setNavValue] = useState(1);
  const [chargerId, setChargerId] = useState(defaultChargerId);
  const [active, setActive] = useState(0);
  const [notes, setNotes] = useState('');
  const [ack, setAck] = useState(true);

  const next = () => setActive((i) => Math.min(i + 1, STEPS.length - 1));
  const back = () => setActive((i) => Math.max(i - 1, 0));
  const step = STEPS[active];

  const Footer = (
    <Box sx={{ px: 2, pb: 'calc(12px + env(safe-area-inset-bottom))', pt: 1.5, background: '#f2f2f2', borderTop: '1px solid #e9eceb' }}>
      <Stack direction="row" spacing={1}>
        <Button variant="outlined" onClick={back} disabled={active===0}
          sx={{ '&:hover': { bgcolor: 'secondary.main', color: 'common.white', borderColor: 'secondary.main' } }}>Back</Button>
        {active < STEPS.length - 1 ? (
          <Button variant="contained" color="secondary" onClick={next}
            sx={{ color: 'common.white', '&:hover': { bgcolor: 'secondary.dark', color: 'common.white' } }}>Next</Button>
        ) : (
          <Button variant="contained" color="secondary" onClick={() => (onSaveNotes ? onSaveNotes({ chargerId, notes }) : console.info('Save notes', chargerId))}
            sx={{ color: 'common.white', '&:hover': { bgcolor: 'secondary.dark', color: 'common.white' } }}>Finish</Button>
        )}
      </Stack>
    </Box>
  );

  const QuickActions = (
    <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap' }}>
      <Button size="small" variant="outlined" startIcon={<RestartAltRoundedIcon />} onClick={() => (onRestartSession ? onRestartSession({ chargerId }) : console.info('Restart session', chargerId))}
        sx={{ '&:hover': { bgcolor: 'secondary.main', color: 'common.white', borderColor: 'secondary.main' } }}>Restart session</Button>
      <Button size="small" variant="outlined" startIcon={<BuildRoundedIcon />} onClick={() => (onResetConnector ? onResetConnector({ chargerId }) : console.info('Reset connector', chargerId))}
        sx={{ '&:hover': { bgcolor: 'secondary.main', color: 'common.white', borderColor: 'secondary.main' } }}>Reset connector</Button>
      <Button size="small" variant="outlined" color="error" startIcon={<ReplayRoundedIcon />} onClick={() => (onRebootCharger ? onRebootCharger({ chargerId }) : console.info('Reboot charger', chargerId))}>Reboot charger</Button>
    </Stack>
  );

  const StepBody = () => (
    <>
      {step.key === 'power' && (
        <Stack spacing={1}>
          <Typography variant="body2">• Verify mains power; ensure breaker is ON.</Typography>
          <Typography variant="body2">• Confirm input voltage within spec.</Typography>
          <FormControlLabel control={<Switch checked={ack} onChange={(e)=>setAck(e.target.checked)} />} label="I checked the power inputs." />
          {QuickActions}
        </Stack>
      )}
      {step.key === 'network' && (
        <Stack spacing={1}>
          <Typography variant="body2">• Check Ethernet/Wi‑Fi/LTE connectivity.</Typography>
          <Typography variant="body2">• Confirm OCPP server reachable.</Typography>
          {QuickActions}
        </Stack>
      )}
      {step.key === 'rcd' && (
        <Stack spacing={1}>
          <Typography variant="body2">• Test residual current device (RCD).</Typography>
          <Typography variant="body2">• Reset and verify no fault LEDs.</Typography>
          {QuickActions}
        </Stack>
      )}
      {step.key === 'connector' && (
        <Stack spacing={1}>
          <Typography variant="body2">• Inspect connector pins; clean debris.</Typography>
          <Typography variant="body2">• Try another cable/vehicle if available.</Typography>
          {QuickActions}
        </Stack>
      )}
      <Divider sx={{ my: 1.25 }} />
      <TextField label="Notes" placeholder="What did you find?" multiline rows={3} value={notes} onChange={(e)=>setNotes(e.target.value)} fullWidth />
    </>
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="xs" disableGutters>
        <MobileShell title="Troubleshooting wizard" tagline="guided steps • quick actions" onBack={onBack} onHelp={onHelp} navValue={navValue} onNavChange={(v)=>{ setNavValue(v); onNavChange&&onNavChange(v); }} footer={Footer}>
          <Box sx={{ px: 2, pt: 2 }}>
            {/* Charger selector */}
            <Paper elevation={0} sx={{ p: 2, borderRadius: 1.5, bgcolor: '#fff', border: '1px solid #eef3f1', mb: 2 }}>
              <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1 }}>My chargers</Typography>
              <FormControl size="small" fullWidth>
                <Select value={chargerId} onChange={(e)=>setChargerId(e.target.value)}>
                  {chargers.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                </Select>
              </FormControl>
            </Paper>

            {/* Stepper */}
            <Paper elevation={0} sx={{ p: 2, borderRadius: 1.5, bgcolor: '#fff', border: '1px solid #eef3f1' }}>
              <Stepper activeStep={active} alternativeLabel>
                {STEPS.map(s => (
                  <Step key={s.key}><StepLabel icon={s.icon}>{s.label}</StepLabel></Step>
                ))}
              </Stepper>
              <Box sx={{ mt: 2 }}>
                <StepBody />
              </Box>
            </Paper>
          </Box>
        </MobileShell>
      </Container>
    </ThemeProvider>
  );
}
