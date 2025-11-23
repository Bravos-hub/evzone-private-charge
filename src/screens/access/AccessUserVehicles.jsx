import React, { useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import {
  CssBaseline, Container, Box, Typography, Paper, Stack, Button, IconButton, Checkbox, List, ListItemButton,
  AppBar, Toolbar, BottomNavigation, BottomNavigationAction
} from '@mui/material';
import DirectionsCarRoundedIcon from '@mui/icons-material/DirectionsCarRounded';
import AddCircleOutlineRoundedIcon from '@mui/icons-material/AddCircleOutlineRounded';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import QrCodeRoundedIcon from '@mui/icons-material/QrCodeRounded';

const theme = createTheme({
  palette: { primary: { main: '#03cd8c' }, secondary: { main: '#f77f00' }, background: { default: '#f2f2f2' } },
  shape: { borderRadius: 7 },
  typography: { fontFamily: 'Inter, Roboto, Arial, sans-serif' }
});

function MobileShell({ title, tagline, onBack, onBell, navValue, onNavChange, footer, children }) {
  const handleBack = () => { if (onBack) return onBack(); console.info('Navigate to: 25 — User Editor'); };
  return (
    <Box sx={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
      <AppBar position="fixed" elevation={1} color="primary">
        <Toolbar sx={{ px: 0 }}>
          <Box sx={{ width: '100%', maxWidth: 420, mx: 'auto', px: 1, display: 'flex', alignItems: 'center' }}>
            <IconButton size="small" edge="start" onClick={handleBack} aria-label="Back" sx={{ color: 'common.white', mr: 1 }}>
              <ArrowBackIosNewIcon fontSize="small" />
            </IconButton>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6" color="inherit" sx={{ fontWeight: 700, lineHeight: 1.15 }}>{title}</Typography>
              {tagline && <Typography variant="caption" color="common.white" sx={{ opacity: 0.9 }}>{tagline}</Typography>}
            </Box>
            <Box sx={{ flexGrow: 1 }} />
            <IconButton size="small" edge="end" aria-label="Notifications" onClick={onBell} sx={{ color: 'common.white' }}>
              <NotificationsRoundedIcon fontSize="small" />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>
      <Toolbar />
      <Box component="main" sx={{ flex: 1 }}>
        <Box sx={{ maxWidth: 420, mx: 'auto', px: 2, pt: 2, pb: 2 }}>{children}</Box>
      </Box>
      <Box component="footer" sx={{ position: 'sticky', bottom: 0 }}>
        {footer}
        <Paper elevation={8} sx={{ borderTopLeftRadius: 16, borderTopRightRadius: 16 }}>
          <Box sx={{ maxWidth: 420, mx: 'auto' }}>
            <BottomNavigation value={navValue} onChange={(_, v) => onNavChange && onNavChange(v)} showLabels sx={{ '& .Mui-selected, & .Mui-selected .MuiSvgIcon-root': { color: '#03cd8c' } }}>
              <BottomNavigationAction label="Home" icon={<HomeRoundedIcon />} />
              <BottomNavigationAction label="Dashboard" icon={<DashboardRoundedIcon />} />
              <BottomNavigationAction label="Sessions" icon={<HistoryRoundedIcon />} />
              <BottomNavigationAction label="QR Poster" icon={<QrCodeRoundedIcon />} />
              <BottomNavigationAction label="Settings" icon={<SettingsRoundedIcon />} />
            </BottomNavigation>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}

function VehicleRow({ v, onToggle, onOpenQr }) {
  return (
    <Paper elevation={0} sx={{ p: 1.25, borderRadius: 1.5, bgcolor: '#fff', border: '1px solid #eef3f1' }}>
      <Stack direction="row" spacing={1} alignItems="center">
        <Checkbox checked={v.authorized} onChange={() => onToggle(v)} />
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle2" fontWeight={700}>{v.model}</Typography>
          <Typography variant="caption" color="text.secondary">{v.plate}</Typography>
        </Box>
        <IconButton size="small" aria-label="Open QR poster" onClick={() => onOpenQr ? onOpenQr(v) : console.info('Open QR poster for', v.id)}>
          <QrCodeRoundedIcon />
        </IconButton>
      </Stack>
    </Paper>
  );
}

export default function UserVehicles({ onBack, onBell, onNavChange, onToggleVehicle, onSave, onAddVehicle, onOpenQrPoster, vehicles: initialVehicles }) {
  const [navValue, setNavValue] = useState(1);
  const [vehicles, setVehicles] = useState(initialVehicles || [
    { id: 'v1', model: 'Tesla Model X', plate: 'UBF 123X', authorized: true },
    { id: 'v2', model: 'Tesla Model 3', plate: 'UAY 782P', authorized: false }
  ]);

  const Footer = (
    <Box sx={{ px: 2, pb: 'calc(12px + env(safe-area-inset-bottom))', pt: 1.5, background: '#f2f2f2', borderTop: '1px solid #e9eceb' }}>
      <Stack direction="row" spacing={1}>
        <Button variant="outlined" startIcon={<AddCircleOutlineRoundedIcon />} onClick={() => (onAddVehicle ? onAddVehicle() : console.info('Open Add Vehicle'))}
          sx={{ '&:hover': { bgcolor: 'secondary.main', color: 'common.white', borderColor: 'secondary.main' } }}>Add vehicle</Button>
        <Button variant="outlined" startIcon={<QrCodeRoundedIcon />} onClick={() => (onOpenQrPoster ? onOpenQrPoster() : console.info('Open QR Poster'))}>QR Poster</Button>
        <Button variant="contained" color="secondary" onClick={() => (onSave ? onSave(vehicles) : console.info('Save vehicles'))}
          sx={{ ml: 'auto', color: 'common.white', '&:hover': { bgcolor: 'secondary.dark', color: 'common.white' } }}>Save</Button>
      </Stack>
    </Box>
  );

  const toggle = (v) => {
    const next = vehicles.map(x => x.id === v.id ? { ...x, authorized: !x.authorized } : x);
    setVehicles(next);
    if (onToggleVehicle) onToggleVehicle(next.find(x => x.id === v.id));
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="xs" disableGutters>
        <MobileShell title="User vehicles" tagline="authorize which vehicles can charge" onBack={onBack} onBell={onBell} navValue={navValue} onNavChange={(v) => { setNavValue(v); onNavChange && onNavChange(v); }} footer={Footer}>
          <Box sx={{ px: 2, pt: 2 }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
              <DirectionsCarRoundedIcon color="primary" />
              <Typography variant="subtitle2" fontWeight={800}>Authorized vehicles</Typography>
            </Stack>
            <List sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {vehicles.map(v => (
                <ListItemButton key={v.id} sx={{ p: 0 }} onClick={() => toggle(v)}>
                  <VehicleRow v={v} onToggle={toggle} onOpenQr={onOpenQrPoster} />
                </ListItemButton>
              ))}
            </List>
          </Box>
        </MobileShell>
      </Container>
    </ThemeProvider>
  );
}
