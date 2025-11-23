import React, { useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import {
  CssBaseline, Container, Box, Typography, Paper, Stack, Button, Chip, IconButton, List, ListItemButton, Switch, TextField, Slider,
  AppBar, Toolbar, BottomNavigation, BottomNavigationAction, FormControlLabel, Select, MenuItem, FormControl
} from '@mui/material';
import ElectricBoltRoundedIcon from '@mui/icons-material/ElectricBoltRounded';
import SpeedRoundedIcon from '@mui/icons-material/SpeedRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import EvStationIcon from '@mui/icons-material/EvStation';
import HistoryIcon from '@mui/icons-material/History';
import AccountBalanceWalletRoundedIcon from '@mui/icons-material/AccountBalanceWalletRounded';
import SupportAgentRoundedIcon from '@mui/icons-material/SupportAgentRounded';

const theme = createTheme({ palette: { primary: { main: '#03cd8c' }, secondary: { main: '#f77f00' }, background: { default: '#f2f2f2' } }, shape: { borderRadius: 7 }, typography: { fontFamily: 'Inter, Roboto, Arial, sans-serif' } });

function MobileShell({ title, tagline, onBack, onHelp, navValue, onNavChange, footer, children }) {
  const handleBack = () => { if (onBack) return onBack(); console.info('Navigate to: 06 — Charger Details'); };
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

function CommercialBadge({ isCommercial }) {
  return (
    <Chip size="small" label={isCommercial ? 'Commercial Chareger' : 'Not commercial'}
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
  const [navValue, setNavValue] = useState(1);
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
        <Button variant="outlined" onClick={() => (onOpenPricingGlobal ? onOpenPricingGlobal() : console.info('Navigate to: 07 — Pricing & Fees (global)'))}
          sx={{ '&:hover': { bgcolor: 'secondary.main', color: 'common.white', borderColor: 'secondary.main' } }}>Global pricing</Button>
        <Button variant="outlined" onClick={() => (onOpenAvailability ? onOpenAvailability() : console.info('Navigate to: 08 — Availability'))}
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
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="xs" disableGutters>
        <MobileShell title="Connector management" tagline="status • pricing • current • tests" onBack={onBack} onHelp={onHelp} navValue={navValue} onNavChange={(v)=>{setNavValue(v); onNavChange&&onNavChange(v);}} footer={Footer}>
          <Box sx={{ px: 2, pt: 2 }}>
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
      </Container>
    </ThemeProvider>
  );
}
