import React, { useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import {
  CssBaseline, Container, Box, Typography, Paper, Stack, Button, LinearProgress, Chip, IconButton,
  AppBar, Toolbar, BottomNavigation, BottomNavigationAction, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import SystemUpdateRoundedIcon from '@mui/icons-material/SystemUpdateRounded';
import ReplayRoundedIcon from '@mui/icons-material/ReplayRounded';
import FactCheckRoundedIcon from '@mui/icons-material/FactCheckRounded';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import EvStationIcon from '@mui/icons-material/EvStation';
import HistoryIcon from '@mui/icons-material/History';
import AccountBalanceWalletRoundedIcon from '@mui/icons-material/AccountBalanceWalletRounded';
import SupportAgentRoundedIcon from '@mui/icons-material/SupportAgentRounded';

const theme = createTheme({ palette: { primary: { main: '#03cd8c' }, secondary: { main: '#f77f00' }, background: { default: '#f2f2f2' } }, shape: { borderRadius: 7 }, typography: { fontFamily: 'Inter, Roboto, Arial, sans-serif' } });

function MobileShell({ title, tagline, onBack, onHelp, navValue, onNavChange, footer, children }) {
  const handleBack = () => { if (onBack) return onBack(); console.info('Navigate to: 12 — Charger Settings (Mobile, React + MUI, JS)'); };
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

export default function FirmwareSelfTest({ onBack, onHelp, onNavChange, onCheckUpdate, onStartUpdate, onRunTests, onReboot }) {
  const [navValue, setNavValue] = useState(1);
  const [checking, setChecking] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [progress, setProgress] = useState(0);
  const [confirmReboot, setConfirmReboot] = useState(false);

  const checkForUpdate = async () => {
    setChecking(true);
    setTimeout(() => { setChecking(false); setUpdateAvailable(true); onCheckUpdate && onCheckUpdate({ version: 'v1.2.4', notes: 'Stability improvements' }); }, 800);
  };

  const startUpdate = async () => {
    setInstalling(true); setProgress(0);
    const timer = setInterval(() => setProgress(p => {
      const n = Math.min(p + 10, 100);
      if (n === 100) { clearInterval(timer); setInstalling(false); setUpdateAvailable(false); }
      return n;
    }), 500);
    onStartUpdate && onStartUpdate();
  };

  const runSelfTests = () => { onRunTests ? onRunTests() : console.info('Run: RCD, relay, insulation, ground'); };

  const reboot = () => { setConfirmReboot(false); onReboot ? onReboot() : console.info('Reboot charger'); };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="xs" disableGutters>
        <MobileShell title="Firmware & self‑test" tagline="OTA updates • diagnostics • reboot" onBack={onBack} onHelp={onHelp} navValue={navValue} onNavChange={(v)=>{setNavValue(v); onNavChange&&onNavChange(v);}} footer={null}>
          <Box sx={{ px: 2, pt: 2 }}>
            {/* Firmware card */}
            <Paper elevation={0} sx={{ p: 2, borderRadius: 1.5, bgcolor: '#fff', border: '1px solid #eef3f1' }}>
              <Typography variant="subtitle2" fontWeight={800}>Firmware</Typography>
              <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                <Chip label="Current: v1.2.3" />
                {updateAvailable ? <Chip label="Update available: v1.2.4" color="warning" /> : <Chip label="Up to date" color="success" />}
              </Stack>
              <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                <Button variant="outlined" startIcon={<SystemUpdateRoundedIcon />} onClick={checkForUpdate}
                  sx={{ '&:hover': { bgcolor: 'secondary.main', color: 'common.white', borderColor: 'secondary.main' } }}>Check for updates</Button>
                <Button variant="contained" color="secondary" disabled={!updateAvailable || installing} onClick={startUpdate}
                  sx={{ color: 'common.white', '&:hover': { bgcolor: 'secondary.dark', color: 'common.white' } }}>Start OTA</Button>
              </Stack>
              {checking && <Typography variant="caption" color="text.secondary">Checking for updates…</Typography>}
              {installing && (
                <Box sx={{ mt: 1 }}>
                  <LinearProgress variant="determinate" value={progress} />
                  <Typography variant="caption" color="text.secondary">Installing… {progress}%</Typography>
                </Box>
              )}
            </Paper>

            {/* Changelog */}
            <Paper elevation={0} sx={{ p: 2, mt: 2, borderRadius: 1.5, bgcolor: '#fff', border: '1px solid #eef3f1' }}>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                <DescriptionRoundedIcon />
                <Typography variant="subtitle2" fontWeight={800}>Changelog</Typography>
              </Stack>
              <Typography variant="body2">• v1.2.4 — Stability improvements, added connector test diagnostics.</Typography>
              <Typography variant="body2">• v1.2.3 — Better OCPP timeouts, UI bug fixes.</Typography>
            </Paper>

            {/* Self‑tests & reboot */}
            <Paper elevation={0} sx={{ p: 2, mt: 2, borderRadius: 1.5, bgcolor: '#fff', border: '1px solid #eef3f1', mb: 2 }}>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                <FactCheckRoundedIcon />
                <Typography variant="subtitle2" fontWeight={800}>Self‑tests</Typography>
              </Stack>
              <Stack direction="row" spacing={1}>
                <Button variant="outlined" onClick={runSelfTests}
                  sx={{ '&:hover': { bgcolor: 'secondary.main', color: 'common.white', borderColor: 'secondary.main' } }}>Run tests</Button>
                <Button variant="outlined" color="error" startIcon={<ReplayRoundedIcon />} onClick={()=>setConfirmReboot(true)}>Reboot charger</Button>
              </Stack>
            </Paper>
          </Box>
        </MobileShell>

        {/* Reboot confirm */}
        <Dialog open={confirmReboot} onClose={()=>setConfirmReboot(false)} fullWidth>
          <DialogTitle>Confirm reboot</DialogTitle>
          <DialogContent>
            <Typography variant="body2">Are you sure you want to reboot the charger? Ongoing sessions will stop.</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={()=>setConfirmReboot(false)}>Cancel</Button>
            <Button variant="contained" color="secondary" onClick={reboot} sx={{ color: 'common.white' }}>Reboot</Button>
          </DialogActions>
        </Dialog>
      </Container>
    </ThemeProvider>
  );
}
