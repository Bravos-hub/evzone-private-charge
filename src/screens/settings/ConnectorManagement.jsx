import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box, Typography, Paper, Stack, Button, Chip, IconButton, List, ListItemButton, Switch, TextField, Slider,
  FormControlLabel, Select, MenuItem, FormControl
} from '@mui/material';
import ElectricBoltRoundedIcon from '@mui/icons-material/ElectricBoltRounded';
import SpeedRoundedIcon from '@mui/icons-material/SpeedRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import MobileShell from '../../components/layout/MobileShell';

function CommercialBadge({ isCommercial }) {
  return (
    <Chip size="small" label={isCommercial ? 'Commercial Charger' : 'Not commercial'}
      color={isCommercial ? 'secondary' : 'default'} sx={{ color: isCommercial ? 'common.white' : undefined }} />
  );
}

function ConnectorRow({ c, onToggle, onTest, onOpenPricingConnector }) {
  return (
    <Paper elevation={0} sx={{ p: 1.25, borderRadius: 1.5, bgcolor: '#fff', border: '1px solid #eef3f1' }}>
      <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
        <Box>
          <Typography variant="subtitle2" fontWeight={700}>{c.name}</Typography>
          <Stack direction="row" spacing={1} sx={{ mt: 0.5, flexWrap: 'wrap' }}>
            <Chip size="small" icon={<ElectricBoltRoundedIcon />} label={`${c.maxPower}`} />
            <Chip size="small" label={c.pricing} onClick={() => (onOpenPricingConnector ? onOpenPricingConnector(c) : console.info('Navigate to: 07 — Pricing & Fees (per‑connector)'))} clickable />
            <Chip size="small" label={c.status} color={c.status === 'Disabled' ? 'default' : c.status === 'Charging' ? 'warning' : 'success'} />
          </Stack>
        </Box>
        <Stack direction="row" spacing={0.5} alignItems="center">
          <FormControlLabel control={<Switch checked={c.enabled} onChange={() => onToggle && onToggle(c)} />} label={c.enabled ? 'On' : 'Off'} />
          <IconButton size="small" onClick={() => (onTest ? onTest(c) : console.info('Test connector'))} aria-label="Test"><PlayArrowRoundedIcon /></IconButton>
        </Stack>
      </Stack>
    </Paper>
  );
}

export default function ConnectorManagementPatched({
  chargers = [{ id: 'st1', name: 'Home Charger' }, { id: 'st2', name: 'Office Charger' }],
  defaultChargerId = 'st1',
  commercialChargerId,
  selectedChargerId,
  aggregatorUrl,
  onOpenAggregator,
  onBack, onHelp, onNavChange, onSave, onToggle, onTest, onOpenPricingGlobal, onOpenAvailability, onOpenPricingConnector
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const routes = useMemo(() => ['/', '/chargers', '/sessions', '/wallet', '/settings'], []);
  const [navValue, setNavValue] = useState(4); // Settings tab index

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
      navigate('/dashboard');
    }
  }, [navigate, onBack]);
  const [unit, setUnit] = useState('UGX/kWh');
  const [applyAllPrice, setApplyAllPrice] = useState('1200');
  const [applyAllCurrent, setApplyAllCurrent] = useState(32);
  const [priceError, setPriceError] = useState('');

  const [connectors, setConnectors] = useState([
    { id: 'c1', name: 'Connector 1 — Type 2', status: 'Available', enabled: true, maxPower: '22 kW', pricing: 'UGX 1200/kWh', maxCurrent: 32 },
    { id: 'c2', name: 'Connector 2 — CCS 2', status: 'Charging', enabled: true, maxPower: '90 kW', pricing: 'UGX 1500/kWh', maxCurrent: 100 },
    { id: 'c3', name: 'Connector 3 — CHAdeMO', status: 'Disabled', enabled: false, maxPower: '50 kW', pricing: 'UGX 1200/kWh', maxCurrent: 60 },
  ]);

  const [chargerId] = useState(defaultChargerId);
  const currentId = selectedChargerId || chargerId;
  const isCommercial = currentId && commercialChargerId && currentId === commercialChargerId;

  const Footer = (
    <Box sx={{ px: 2, pb: 'calc(12px + env(safe-area-inset-bottom))', pt: 1.5, background: '#f2f2f2', borderTop: '1px solid #e9eceb' }}>
      <Stack direction="row" spacing={1}>
        <Button variant="outlined" onClick={() => {
          if (onOpenPricingGlobal) {
            onOpenPricingGlobal();
          } else {
            navigate('/pricing');
          }
        }}
          sx={{ '&:hover': { bgcolor: 'secondary.main', color: 'common.white', borderColor: 'secondary.main' } }}>Global pricing</Button>
        <Button variant="outlined" onClick={() => {
          if (onOpenAvailability) {
            onOpenAvailability();
          } else {
            navigate('/availability');
          }
        }}
          sx={{ '&:hover': { bgcolor: 'secondary.main', color: 'common.white', borderColor: 'secondary.main' } }}>Availability</Button>
        <Button variant="contained" color="secondary" onClick={() => (onSave ? onSave(connectors) : console.info('Save connectors'))}
          sx={{ ml: 'auto', color: 'common.white', '&:hover': { bgcolor: 'secondary.dark', color: 'common.white' } }}>Save all</Button>
      </Stack>
    </Box>
  );

  const onPriceChange = (v) => {
    setApplyAllPrice(v);
    const ok = /^\d+(?:\.\d{1,2})?$/.test(v) && parseFloat(v) > 0;
    setPriceError(ok ? '' : 'Enter a valid amount (e.g., 1200 or 1200.50)');
  };

  const applyToAll = () => {
    if (priceError || !applyAllPrice) return;
    const [currency, suffix] = unit.split('/');
    const priceStr = `${currency.trim()} ${applyAllPrice}/${suffix}`;
    const next = connectors.map(c => ({ ...c, pricing: priceStr, maxCurrent: applyAllCurrent }));
    setConnectors(next);
  };

  const toggleConnector = (c) => {
    const next = connectors.map(x => x.id === c.id ? { ...x, enabled: !x.enabled, status: x.enabled ? 'Disabled' : 'Available' } : x);
    setConnectors(next);
    onToggle && onToggle(next.find(x => x.id === c.id));
  };

  const testConnector = (c) => { onTest ? onTest(c) : console.info('Run test on', c.name); };

  return (
    <MobileShell 
      title="Connector management" 
      tagline="status • pricing • current • tests" 
      onBack={handleBack} 
      onHelp={onHelp} 
      navValue={navValue} 
      onNavChange={handleNavChange}
      footerSlot={Footer}
    >
      <Box>
            {/* Commercial badge + Aggregator CTA */}
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
              <CommercialBadge isCommercial={isCommercial} />
              {!isCommercial && (
                <Button size="small" variant="text" onClick={() => (onOpenAggregator ? onOpenAggregator(aggregatorUrl) : console.info('Open Aggregator', aggregatorUrl))}>Aggregator & CPMS</Button>
              )}
            </Stack>

            {/* Global controls */}
            <Paper elevation={0} sx={{ p: 2, borderRadius: 1.5, bgcolor: '#fff', border: '1px solid #eef3f1' }}>
              <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1 }}>Global settings</Typography>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ flexWrap: 'wrap' }}>
                <FormControl size="small" sx={{ minWidth: 130 }}>
                  <Select value={unit} onChange={(e)=>setUnit(e.target.value)}>
                    <MenuItem value="UGX/kWh">UGX/kWh</MenuItem>
                    <MenuItem value="UGX/min">UGX/min</MenuItem>
                  </Select>
                </FormControl>
                <TextField label="Apply price" value={applyAllPrice} onChange={(e)=>onPriceChange(e.target.value)} error={!!priceError} helperText={priceError} sx={{ width: 160 }} inputProps={{ inputMode: 'decimal' }} />
                <Stack direction="row" spacing={1} alignItems="center">
                  <SpeedRoundedIcon fontSize="small" />
                  <Typography variant="caption">Max current (A)</Typography>
                  <Slider min={6} max={125} value={applyAllCurrent} onChange={(_,v)=>setApplyAllCurrent(v)} sx={{ width: 180 }} />
                </Stack>
                <Button variant="outlined" disabled={!!priceError || !applyAllPrice} onClick={applyToAll}
                  sx={{ '&:hover': { bgcolor: 'secondary.main', color: 'common.white', borderColor: 'secondary.main' } }}>Apply to all</Button>
              </Stack>
            </Paper>

            {/* Connectors */}
            <Paper elevation={0} sx={{ p: 2, mt: 2, borderRadius: 1.5, bgcolor: '#fff', border: '1px solid #eef3f1', mb: 2 }}>
              <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1 }}>Connectors</Typography>
              <List sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {connectors.map(c => (
                  <ListItemButton key={c.id} sx={{ p: 0 }}>
                    <ConnectorRow c={c} onToggle={toggleConnector} onTest={testConnector} onOpenPricingConnector={onOpenPricingConnector} />
                  </ListItemButton>
                ))}
              </List>
            </Paper>
      </Box>
    </MobileShell>
  );
}
