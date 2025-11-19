import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import {
  CssBaseline, Container, Box, Typography, Paper, Stack, Button, Card, CardActionArea,
  Select, MenuItem, FormControl
} from '@mui/material';
import DevicesOtherRoundedIcon from '@mui/icons-material/DevicesOtherRounded';
import RequestQuoteRoundedIcon from '@mui/icons-material/RequestQuoteRounded';
import LockPersonRoundedIcon from '@mui/icons-material/LockPersonRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import SettingsEthernetRoundedIcon from '@mui/icons-material/SettingsEthernetRounded';
import BugReportRoundedIcon from '@mui/icons-material/BugReportRounded';
import PlaceRoundedIcon from '@mui/icons-material/PlaceRounded';
import HistoryIcon from '@mui/icons-material/History';
import ArrowForwardIosRoundedIcon from '@mui/icons-material/ArrowForwardIosRounded';
import MobileShell from '../../components/layout/MobileShell';

const theme = createTheme({
  palette: {
    primary: { main: '#03cd8c' },
    secondary: { main: '#f77f00' },
    background: { default: '#f2f2f2' }
  },
  shape: { borderRadius: 14 },
  typography: { fontFamily: 'Inter, Roboto, Arial, sans-serif' }
});

function MenuTile({ icon, title, subtitle, onClick }) {
  return (
    <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #eef3f1', bgcolor: '#fff' }}>
      <CardActionArea onClick={onClick} sx={{ p: 1.5 }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box sx={{ width: 44, height: 44, borderRadius: 2, display: 'grid', placeItems: 'center', bgcolor: '#f2f2f2' }}>
            {icon}
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle2" fontWeight={700}>{title}</Typography>
            <Typography variant="caption" color="text.secondary">{subtitle}</Typography>
          </Box>
          <ArrowForwardIosRoundedIcon fontSize="small" />
        </Stack>
      </CardActionArea>
    </Card>
  );
}

export default function ChargerSettingsMulti({
  chargers = [{ id: 'st1', name: 'Home Charger' }, { id: 'st2', name: 'Office Charger' }],
  defaultChargerId = 'st1',
  onBack, onHelp, onNavChange,
  openDevices,
  openPricing,
  openAccess,
  openAvailability,
  openChooseSite,
  openAdvancedConfig,
  openDiagnostics,
  openHistory
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
      // Navigate back to charger settings
      const chargerId = location.pathname.match(/\/chargers\/([^/]+)/)?.[1];
      if (chargerId) {
        navigate(`/chargers/${chargerId}/settings`);
      } else {
        navigate('/chargers');
      }
    }
  }, [navigate, onBack, location.pathname]);
  
  const [chargerId, setChargerId] = useState(defaultChargerId);

  // Fallback wrappers that pass chargerId
  const go = (fn, fallback) => () => (fn ? fn(chargerId) : console.info(fallback));

  const Footer = (
    <Box sx={{ px: 2, pb: 'calc(12px + env(safe-area-inset-bottom))', pt: 1.5, background: '#f2f2f2', borderTop: '1px solid #e9eceb' }}>
      <Stack direction="row" spacing={1}>
        <Button fullWidth variant="contained" color="secondary" onClick={go(openPricing, 'Navigate to: 07 — Pricing & Fees')}
          sx={{ color: 'common.white', '&:hover': { bgcolor: 'secondary.dark', color: 'common.white' } }}>Open pricing</Button>
        <Button fullWidth variant="outlined" onClick={go(openAvailability, 'Navigate to: 08 — Availability')}
          sx={{ '&:hover': { bgcolor: 'secondary.main', color: 'common.white', borderColor: 'secondary.main' } }}>Open availability</Button>
      </Stack>
    </Box>
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="xs" disableGutters>
        <MobileShell
          title="Charger settings"
          tagline="quick actions hub"
          onBack={handleBack}
          onHelp={onHelp}
          navValue={navValue}
          onNavChange={handleNavChange}
          footer={Footer}
        >
          <Box>
            {/* Charger selector */}
            <Paper elevation={0} sx={{ p: 2, borderRadius: 3, bgcolor: '#fff', border: '1px solid #eef3f1', mb: 2 }}>
              <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1 }}>My chargers</Typography>
              <FormControl size="small" fullWidth>
                <Select value={chargerId} onChange={(e)=>setChargerId(e.target.value)}>
                  {chargers.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                </Select>
              </FormControl>
            </Paper>

            <Stack spacing={1.25}>
              <MenuTile icon={<DevicesOtherRoundedIcon />} title="Other devices" subtitle="Link or manage peripherals" onClick={go(openDevices, 'Navigate to: Other devices')} />
              <MenuTile icon={<RequestQuoteRoundedIcon />} title="Prices" subtitle="Set rates and fees" onClick={go(openPricing, 'Navigate to: 07 — Pricing & Fees')} />
              <MenuTile icon={<LockPersonRoundedIcon />} title="Access" subtitle="Grant users and methods" onClick={go(openAccess, 'Navigate to: 09 — Access & Permissions')} />
              <MenuTile icon={<AccessTimeRoundedIcon />} title="Availability" subtitle="Hours and days" onClick={go(openAvailability, 'Navigate to: 08 — Availability')} />
              <MenuTile icon={<PlaceRoundedIcon />} title="Sites" subtitle="Select or add a location" onClick={go(openChooseSite, 'Navigate to: 16 — Choose Site')} />
              <MenuTile icon={<SettingsEthernetRoundedIcon />} title="Advanced configuration" subtitle="OCPP data & limits" onClick={go(openAdvancedConfig, 'Navigate to: 18 — Advanced Configuration')} />
              <MenuTile icon={<HistoryIcon />} title="History" subtitle="Energy • duration • receipts" onClick={go(openHistory, 'Navigate to: 19 — Charging History')} />
              <MenuTile icon={<BugReportRoundedIcon />} title="Diagnostics & logs" subtitle="View faults and telemetry" onClick={go(openDiagnostics, 'Navigate to: 21 — Diagnostics & Logs')} />
            </Stack>
          </Box>
        </MobileShell>
      </Container>
    </ThemeProvider>
  );
}

/**
 * Usage
 * <ChargerSettingsMulti openPricing={(id)=>navigate('/pricing-fees', { state: { chargerId: id } })} />
 */
