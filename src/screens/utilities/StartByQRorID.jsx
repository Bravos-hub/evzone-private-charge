import React, { useMemo, useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import {
  CssBaseline, Container, Box, Typography, Paper, Stack, Button, TextField, IconButton, Chip, Checkbox, FormControlLabel,
  AppBar, Toolbar, BottomNavigation, BottomNavigationAction, Dialog, DialogTitle, DialogContent, DialogActions, InputAdornment,
  FormControl, Select, MenuItem
} from '@mui/material';
import Divider from '@mui/material/Divider';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import CameraAltOutlinedIcon from '@mui/icons-material/CameraAltOutlined';
import QrCode2RoundedIcon from '@mui/icons-material/QrCode2Rounded';
import SecurityRoundedIcon from '@mui/icons-material/SecurityRounded';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import EvStationIcon from '@mui/icons-material/EvStation';
import HistoryIcon from '@mui/icons-material/History';
import AccountBalanceWalletRoundedIcon from '@mui/icons-material/AccountBalanceWalletRounded';
import SupportAgentRoundedIcon from '@mui/icons-material/SupportAgentRounded';

const theme = createTheme({ palette: { primary: { main: '#03cd8c' }, secondary: { main: '#f77f00' }, background: { default: '#f2f2f2' } }, shape: { borderRadius: 14 }, typography: { fontFamily: 'Inter, Roboto, Arial, sans-serif' } });

function MobileShell({ title, tagline, onBack, onHelp, navValue, onNavChange, footer, children }) {
  const handleBack = () => { if (onBack) return onBack(); console.info('Navigate to: 06 — Charger Details (Mobile, React + MUI, JS)'); };
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

export default function StartByQrManual({ onBack, onHelp, onNavChange, onResolve, onStart, onOpenActions }) {
  const [navValue, setNavValue] = useState(1);
  const [manualId, setManualId] = useState('');
  const [safetyOk, setSafetyOk] = useState(false);
  const [scanOpen, setScanOpen] = useState(false);
  const [resolved, setResolved] = useState(null);

  // Multi‑charger awareness
  const chargers = useMemo(() => ([
    { id: 'st1', name: 'Home Charger' },
    { id: 'st2', name: 'Office Charger' },
  ]), []);
  const [chargerId, setChargerId] = useState('st1');

  const connectors = useMemo(() => ([
    { id: 'c1', label: 'Connector 1 — Type 2', status: 'Available' },
    { id: 'c2', label: 'Connector 2 — CCS 2', status: 'Available' },
    { id: 'c3', label: 'Connector 3 — CHAdeMO', status: 'In use' },
  ]), []);

  const resolve = (idOrQr) => {
    const st = chargers.find(x => x.id === chargerId) || chargers[0];
    const station = { id: idOrQr || st.id, name: st.name, location: 'Kampala' };
    setResolved(station);
    onResolve && onResolve(station);
  };

  const proceed = () => {
    const chosen = connectors.find(c => c.status === 'Available');
    if (onStart) return onStart({ station: resolved, connector: chosen });
    if (onOpenActions) return onOpenActions(resolved);
    console.info('Navigate to: 13 — Charger Actions (Mobile, React + MUI, JS)');
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="xs" disableGutters>
        <MobileShell title="Start session" tagline="scan QR or enter ID • safety" onBack={onBack} onHelp={onHelp} navValue={navValue} onNavChange={(v)=>{setNavValue(v); onNavChange&&onNavChange(v);}} footer={null}>
          <Box sx={{ px: 2, pt: 2 }}>
            {/* Charger selector */}
            <Paper elevation={0} sx={{ p: 2, borderRadius: 3, bgcolor: '#fff', border: '1px solid #eef3f1', mb: 2 }}>
              <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1 }}>My chargers</Typography>
              <FormControl size="small" fullWidth>
                <Select value={chargerId} onChange={(e)=>setChargerId(e.target.value)}>
                  {chargers.map(ch => <MenuItem key={ch.id} value={ch.id}>{ch.name}</MenuItem>)}
                </Select>
              </FormControl>
            </Paper>

            {/* QR and Manual */}
            <Paper elevation={0} sx={{ p: 2, borderRadius: 3, bgcolor: '#fff', border: '1px solid #eef3f1' }}>
              <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1 }}>Identify charger</Typography>
              <Stack direction="row" spacing={1}>
                <Button variant="outlined" startIcon={<QrCodeScannerIcon />} onClick={() => setScanOpen(true)}
                  sx={{ '&:hover': { bgcolor: 'secondary.main', color: 'common.white', borderColor: 'secondary.main' } }}>Scan QR</Button>
                <TextField placeholder="Enter charger ID" value={manualId} onChange={(e)=>setManualId(e.target.value)}
                  InputProps={{ startAdornment: <InputAdornment position="start">ID</InputAdornment> }} sx={{ flex: 1 }} />
                <Button variant="contained" color="secondary" onClick={() => resolve(manualId)} sx={{ color: 'common.white' }}>Resolve</Button>
              </Stack>

              {resolved && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2"><strong>Station:</strong> {resolved.name} • {resolved.id}</Typography>
                  <Typography variant="caption" color="text.secondary">{resolved.location}</Typography>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 0.5 }}>Choose connector</Typography>
                  <Stack spacing={1}>
                    {connectors.map(c => (
                      <Chip key={c.id} label={`${c.label} • ${c.status}`} color={c.status === 'Available' ? 'default' : 'warning'} disabled={c.status !== 'Available'} />
                    ))}
                  </Stack>
                </Box>
              )}
            </Paper>

            {/* Safety */}
            <Paper elevation={0} sx={{ p: 2, mt: 2, borderRadius: 3, bgcolor: '#fff', border: '1px solid #eef3f1' }}>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                <SecurityRoundedIcon color="secondary" />
                <Typography variant="subtitle2" fontWeight={800}>Safety checklist</Typography>
              </Stack>
              <FormControlLabel control={<Checkbox checked={safetyOk} onChange={(e)=>setSafetyOk(e.target.checked)} />} label="I confirm the cable and area are safe to charge." />
              <Button fullWidth variant="contained" color="secondary" disabled={!resolved || !safetyOk}
                onClick={proceed} sx={{ mt: 1, color: 'common.white', '&:hover': { bgcolor: 'secondary.dark', color: 'common.white' } }}>
                Start charging
              </Button>
            </Paper>
          </Box>
        </MobileShell>

        {/* Scan dialog (stub) */}
        <Dialog open={scanOpen} onClose={() => setScanOpen(false)} fullWidth>
          <DialogTitle>Scan charger QR</DialogTitle>
          <DialogContent>
            <Stack spacing={1} alignItems="center" sx={{ py: 2 }}>
              <QrCode2RoundedIcon sx={{ fontSize: 72, color: 'primary.main' }} />
              <Typography variant="caption" color="text.secondary">Live camera scanning to be integrated. Use manual ID for now.</Typography>
              <Button startIcon={<CameraAltOutlinedIcon />} variant="outlined" component="label">
                Open camera
                <input type="file" accept="image/*" capture="environment" hidden onChange={(e)=>{ setScanOpen(false); resolve('EVZ-QR-000999'); }} />
              </Button>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={()=>setScanOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      </Container>
    </ThemeProvider>
  );
}
