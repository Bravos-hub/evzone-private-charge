import React, { useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import {
  CssBaseline,
  Container,
  Box,
  Typography,
  Paper,
  Stack,
  Button,
  TextField,
  Switch,
  FormControlLabel,
  RadioGroup,
  Radio,
  FormLabel,
  FormControl,
  Chip,
  IconButton,
  AppBar,
  Toolbar,
  BottomNavigation,
  BottomNavigationAction
} from '@mui/material';
import Divider from '@mui/material/Divider';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import DevicesRoundedIcon from '@mui/icons-material/DevicesRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import DirectionsCarRoundedIcon from '@mui/icons-material/DirectionsCarRounded';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import EvStationIcon from '@mui/icons-material/EvStation';
import HistoryIcon from '@mui/icons-material/History';
import AccountBalanceWalletRoundedIcon from '@mui/icons-material/AccountBalanceWalletRounded';
import SupportAgentRoundedIcon from '@mui/icons-material/SupportAgentRounded';

const theme = createTheme({
  palette: { primary: { main: '#03cd8c' }, secondary: { main: '#f77f00' }, background: { default: '#f2f2f2' } },
  shape: { borderRadius: 7 },
  typography: { fontFamily: 'Inter, Roboto, Arial, sans-serif' }
});

function MobileShell({ title, tagline, onBack, onHelp, navValue, onNavChange, footer, children }) {
  const handleBack = () => { if (onBack) return onBack(); console.info('Navigate to: 09 — Access & Permissions (Mobile, React + MUI, JS)'); };
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

export default function UserEditor({
  onBack,
  onHelp,
  onNavChange,
  onSaveUser,
  onDeleteUser,
  onOpenVehicles,
  initial = { name: 'Robert Fox', sid: 'APP-123456', relation: 'Family', app: true, rfid: true, assignCard: false, cardNo: '', offline: true, selfService: true }
}) {
  const [navValue, setNavValue] = useState(1);
  const [form, setForm] = useState(initial);

  const Footer = (
    <Box sx={{ px: 2, pb: 'calc(12px + env(safe-area-inset-bottom))', pt: 1.5, background: '#f2f2f2', borderTop: '1px solid #e9eceb' }}>
      <Stack direction="row" spacing={1}>
        <Button variant="outlined" color="error" startIcon={<DeleteOutlineRoundedIcon />} onClick={() => (onDeleteUser ? onDeleteUser(form) : console.info('Delete user'))}>Delete</Button>
        <Button variant="contained" color="secondary" startIcon={<SaveRoundedIcon />} onClick={() => (onSaveUser ? onSaveUser(form) : console.info('Save user'))}
          sx={{ ml: 'auto', color: 'common.white', '&:hover': { bgcolor: 'secondary.dark', color: 'common.white' } }}>
          Save
        </Button>
      </Stack>
    </Box>
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="xs" disableGutters>
        <MobileShell title="User editor" tagline="identity • methods • permissions" onBack={onBack} onHelp={onHelp} navValue={navValue} onNavChange={(v) => { setNavValue(v); onNavChange && onNavChange(v); }} footer={Footer}>
          <Box sx={{ px: 2, pt: 2 }}>
            <Paper elevation={0} sx={{ p: 2, borderRadius: 1.5, bgcolor: '#fff', border: '1px solid #eef3f1' }}>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                <PersonRoundedIcon />
                <Typography variant="subtitle1" fontWeight={800}>Identity</Typography>
              </Stack>
              <TextField label="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} fullWidth sx={{ mb: 1.25 }} />
              <TextField label="App SID" value={form.sid} onChange={(e) => setForm({ ...form, sid: e.target.value })} fullWidth sx={{ mb: 1.25 }} />
              <FormControl sx={{ mb: 1.25 }}>
                <FormLabel>Relation</FormLabel>
                <RadioGroup row value={form.relation} onChange={(e) => setForm({ ...form, relation: e.target.value })}>
                  {['Family','Employee','Guest'].map(r => <FormControlLabel key={r} value={r} control={<Radio />} label={r} />)}
                </RadioGroup>
              </FormControl>
              <Divider sx={{ my: 1.5 }} />

              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                <DevicesRoundedIcon />
                <Typography variant="subtitle1" fontWeight={800}>Access methods</Typography>
              </Stack>
              <Stack direction="row" spacing={2} sx={{ mb: 1 }}>
                <FormControlLabel control={<Switch checked={form.app} onChange={(e) => setForm({ ...form, app: e.target.checked })} />} label="App" />
                <FormControlLabel control={<Switch checked={form.rfid} onChange={(e) => setForm({ ...form, rfid: e.target.checked })} />} label="RFID" />
                <FormControlLabel control={<Switch checked={form.assignCard} onChange={(e) => setForm({ ...form, assignCard: e.target.checked })} />} label="Assign card" />
              </Stack>
              {form.assignCard && (
                <TextField label="Card number" value={form.cardNo} onChange={(e) => setForm({ ...form, cardNo: e.target.value })} fullWidth sx={{ mb: 1.25 }} />
              )}
              <Stack direction="row" spacing={2}>
                <FormControlLabel control={<Switch checked={form.offline} onChange={(e) => setForm({ ...form, offline: e.target.checked })} />} label="Allow offline" />
                <FormControlLabel control={<Switch checked={form.selfService} onChange={(e) => setForm({ ...form, selfService: e.target.checked })} />} label="Allow self service" />
              </Stack>

              <Divider sx={{ my: 1.5 }} />
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                <DirectionsCarRoundedIcon />
                <Typography variant="subtitle1" fontWeight={800}>Authorized vehicles</Typography>
                <Chip label="Manage" size="small" onClick={() => (onOpenVehicles ? onOpenVehicles(form) : console.info('Navigate to: 26 — User Vehicles (Mobile, React + MUI, JS)'))} sx={{ ml: 'auto' }} />
              </Stack>
              <Typography variant="caption" color="text.secondary">Manage which of the user’s vehicles can charge at this site.</Typography>
            </Paper>
          </Box>
        </MobileShell>
      </Container>
    </ThemeProvider>
  );
}
