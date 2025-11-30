import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import {
  Box, Typography, Paper, Stack, Card, CardActionArea,
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
import OnboardingOverlay from '../../components/onboarding/OnboardingOverlay';
import { useOnboarding } from '../../context/OnboardingContext';

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
  const params = useParams();
  const { completeStep, setChargerIdForOnboarding } = useOnboarding();
  const chargerIdFromRoute = params.id || defaultChargerId;
  
  // Set charger ID for onboarding if in onboarding mode
  useEffect(() => {
    if (chargerIdFromRoute) {
      setChargerIdForOnboarding(chargerIdFromRoute);
    }
  }, [chargerIdFromRoute, setChargerIdForOnboarding]);
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

  return (
    <MobileShell
      title="Charger settings"
      tagline="quick actions hub (per‑charger or per‑connector)"
      onBack={handleBack}
      onHelp={onHelp}
      navValue={navValue}
      onNavChange={handleNavChange}
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
          <OnboardingOverlay
            stepId="configure-settings"
            title="Configure Settings"
            description="Set up pricing, access controls, schedules, and availability for your charger. Click on any option below to configure it. When you're done, click Continue to proceed."
            onComplete={() => {
              completeStep('configure-settings');
            }}
          />
    </MobileShell>
  );
}
