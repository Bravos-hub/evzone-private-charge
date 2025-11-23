import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import {
  CssBaseline, Container, Box, Typography, Paper, Stack, Button, Card, CardActionArea,
  Select, MenuItem, FormControl, FormLabel, RadioGroup, Radio, FormControlLabel, Tooltip
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
import LaunchRoundedIcon from '@mui/icons-material/LaunchRounded';
import MobileShell from '../../components/layout/MobileShell';

const theme = createTheme({
  palette: { primary: { main: '#03cd8c' }, secondary: { main: '#f77f00' }, background: { default: '#f2f2f2' } },
  shape: { borderRadius: 7 },
  typography: { fontFamily: 'Inter, Roboto, Arial, sans-serif' }
});

// Example connectors per charger (would come from API)
const CONNECTORS = {
  st1: [ { id: 'c1', label: 'A1 — Type 2' }, { id: 'c2', label: 'A2 — CCS 2' } ],
  st2: [ { id: 'c3', label: 'B1 — CHAdeMO' } ]
};

function MenuTile({ icon, title, subtitle, onClick, cta }) {
  return (
    <Card elevation={0} sx={{ borderRadius: 1.5, border: '1px solid #eef3f1', bgcolor: '#fff' }}>
      <CardActionArea onClick={onClick} sx={{ p: 1.5 }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box sx={{ width: 44, height: 44, borderRadius: 2, display: 'grid', placeItems: 'center', bgcolor: '#f2f2f2' }}>
            {icon}
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle2" fontWeight={700}>{title}</Typography>
            <Typography variant="caption" color="text.secondary">{subtitle}</Typography>
          </Box>
          {cta || <ArrowForwardIosRoundedIcon fontSize="small" />}
        </Stack>
      </CardActionArea>
    </Card>
  );
}

export default function ChargerSettingsHubPro({
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
  openHistory,
  onOpenAggregator
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
  
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      // Navigate back to charger details or chargers list
      const chargerId = location.pathname.match(/\/chargers\/([^/]+)/)?.[1];
      if (chargerId) {
        navigate(`/chargers/${chargerId}`);
      } else {
        navigate('/chargers');
      }
    }
  };
  
  const [chargerId, setChargerId] = useState(defaultChargerId);
  const [scope, setScope] = useState('charger'); // 'charger' | 'connector'
  const connectors = useMemo(() => CONNECTORS[chargerId] || [], [chargerId]);
  const [connectorId, setConnectorId] = useState(connectors[0]?.id || '');

  // keep connectorId in sync
  React.useEffect(() => { setConnectorId((CONNECTORS[chargerId]||[])[0]?.id || ''); }, [chargerId]);

  const pass = (fn, msg) => () => {
    if (fn) return fn(chargerId, scope === 'connector' ? connectorId : undefined);
    const scopeMsg = scope === 'connector' ? ` (connector ${connectorId||'none'})` : '';
    alert(`${msg} — ${chargerId}${scopeMsg}`);
  };

  const Footer = (
    <Box sx={{ px: 2, pb: 'calc(12px + env(safe-area-inset-bottom))', pt: 1.5, background: '#f2f2f2', borderTop: '1px solid #e9eceb' }}>
      <Stack direction="row" spacing={1}>
        <Button fullWidth variant="contained" color="secondary" onClick={pass(openPricing, 'Pricing & Fees')}
          sx={{ color: 'common.white', '&:hover': { bgcolor: 'secondary.dark', color: 'common.white' } }}>Open pricing</Button>
        <Button fullWidth variant="outlined" onClick={pass(openAvailability, 'Availability')}
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
          tagline="quick actions hub (per‑charger or per‑connector)"
          onBack={handleBack}
          onHelp={onHelp}
          navValue={navValue}
          onNavChange={handleNavChange}
          footer={Footer}
        >
          <Box>
            {/* Charger & scope selector */}
            <Paper elevation={0} sx={{ p: 2, borderRadius: 1.5, bgcolor: '#fff', border: '1px solid #eef3f1', mb: 2 }}>
              <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1 }}>Target</Typography>
              <Stack spacing={1}>
                <FormControl size="small" fullWidth>
                  <FormLabel>Charger</FormLabel>
                  <Select value={chargerId} onChange={(e)=>setChargerId(e.target.value)}>
                    {chargers.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel>Scope</FormLabel>
                  <RadioGroup row value={scope} onChange={(e)=>setScope(e.target.value)}>
                    <FormControlLabel value="charger" control={<Radio />} label="Charger" />
                    <FormControlLabel value="connector" control={<Radio />} label="Connector" />
                  </RadioGroup>
                </FormControl>

                {scope === 'connector' && (
                  <Tooltip title={connectors.length? '' : 'No connectors found for this charger'}>
                    <span>
                      <FormControl size="small" fullWidth disabled={!connectors.length}>
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

            <Stack spacing={1.25}>
              <MenuTile icon={<RequestQuoteRoundedIcon />} title="Pricing & fees" subtitle="Set rates by charger or connector" onClick={pass(openPricing, 'Pricing & Fees')} />
              <MenuTile icon={<AccessTimeRoundedIcon />} title="Availability" subtitle="Hours & days (charger/connector)" onClick={pass(openAvailability, 'Availability')} />
              <MenuTile icon={<LockPersonRoundedIcon />} title="Access & permissions" subtitle="Who can use (charger/connector)" onClick={pass(openAccess, 'Access & Permissions')} />
              <MenuTile icon={<PlaceRoundedIcon />} title="Sites" subtitle="Select or add a location" onClick={pass(openChooseSite, 'Choose Site')} />
              <MenuTile icon={<DevicesOtherRoundedIcon />} title="Other devices" subtitle="Link cards, meters & peripherals" onClick={pass(openDevices, 'Other devices')} />
              <MenuTile icon={<SettingsEthernetRoundedIcon />} title="Advanced configuration" subtitle="OCPP data & limits" onClick={pass(openAdvancedConfig, 'Advanced Configuration')} />
              <MenuTile icon={<HistoryIcon />} title="History" subtitle="Energy • duration • receipts" onClick={pass(openHistory, 'Charging History')} />
              <MenuTile icon={<BugReportRoundedIcon />} title="Diagnostics & logs" subtitle="Faults and telemetry" onClick={pass(openDiagnostics, 'Diagnostics & Logs')} />
              <MenuTile icon={<LaunchRoundedIcon color="secondary" />} title="Aggregator & CPMS" subtitle="Manage tariffs, handoffs, public listing" onClick={() => (onOpenAggregator ? onOpenAggregator(chargerId, connectorId, scope) : alert('Open Aggregator'))}
                cta={<LaunchRoundedIcon color="secondary" />} />
            </Stack>
          </Box>
        </MobileShell>
      </Container>
    </ThemeProvider>
  );
}
