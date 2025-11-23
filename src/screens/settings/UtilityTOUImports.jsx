import React, { useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import {
  CssBaseline, Container, Box, Typography, Paper, Stack, Button, Chip, IconButton,
  AppBar, Toolbar, BottomNavigation, BottomNavigationAction, FormControl, Select, MenuItem, TextField,
} from '@mui/material';
import UploadFileRoundedIcon from '@mui/icons-material/UploadFileRounded';
import CloudDownloadRoundedIcon from '@mui/icons-material/CloudDownloadRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
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

function CommercialBadge({ isCommercial }) {
  return (
    <Chip size="small" label={isCommercial ? 'Commercial Chareger' : 'Not commercial'}
      color={isCommercial ? 'secondary' : 'default'} sx={{ color: isCommercial ? 'common.white' : undefined }} />
  );
}

function parseCSV(text) {
  const rows = text.split(/\r?\n/).filter(Boolean);
  const [h, ...rest] = rows;
  const idx = (k) => h.split(',').map(s=>s.trim()).indexOf(k);
  const col = { name: idx('name'), start: idx('start'), end: idx('end'), days: idx('days'), rate: idx('rate') };
  return rest.map(line => {
    const c = line.split(',');
    return {
      name: (c[col.name]||'').trim(),
      start: (c[col.start]||'').trim(),
      end: (c[col.end]||'').trim(),
      days: (c[col.days]||'').trim().split('|'),
      rate: Number((c[col.rate]||'0').trim())||0
    };
  });
}

function PeriodRow({ p }) {
  return (
    <Paper elevation={0} sx={{ p: 1, borderRadius: 1, bgcolor: '#fff', border: '1px solid #eef3f1' }}>
      <Typography variant="subtitle2" fontWeight={700}>{p.name}</Typography>
      <Typography variant="caption" color="text.secondary">{p.start} → {p.end} • {p.days.join(', ')}</Typography>
      <Chip label={`UGX ${p.rate}/kWh`} size="small" sx={{ mt: 0.5 }} />
    </Paper>
  );
}

export default function UtilityTOUImportPatched({
  chargers = [{ id: 'st1', name: 'Home Charger' }, { id: 'st2', name: 'Office Charger' }],
  defaultChargerId = 'st1',
  commercialChargerId,
  selectedChargerId,
  aggregatorUrl,
  onOpenAggregator,
  onBack, onHelp, onNavChange,
  onApplyTOU, onFetchFromAPI,
  onNavigatePricing // navigate to 07 with periods
}) {
  const [navValue, setNavValue] = useState(1);
  const [chargerId, setChargerId] = useState(defaultChargerId);
  const [csv, setCsv] = useState('name,start,end,days,rate\nOff‑peak,00:00,05:59,Mon|Tue|Wed|Thu|Fri|Sat|Sun,900\nPeak,18:00,22:59,Mon|Tue|Wed|Thu|Fri,1500');
  const [periods, setPeriods] = useState([]);
  const [apiUrl, setApiUrl] = useState('');

  const currentId = selectedChargerId || chargerId;
  const isCommercial = currentId && commercialChargerId && currentId === commercialChargerId;

  const parse = () => {
    try { const p = parseCSV(csv); setPeriods(p); } catch (e) { console.info('CSV parse error', e); }
  };
  const apply = () => {
    onApplyTOU ? onApplyTOU({ chargerId: currentId, periods }) : console.info('Apply TOU', { chargerId: currentId, periods });
    onNavigatePricing ? onNavigatePricing({ chargerId: currentId, periods }) : console.info('Navigate to: 07 — Pricing & Fees (with periods)');
  };

  const Footer = (
    <Box sx={{ px: 2, pb: 'calc(12px + env(safe-area-inset-bottom))', pt: 1.5, background: '#f2f2f2', borderTop: '1px solid #e9eceb' }}>
      <Stack direction="row" spacing={1}>
        <Button variant="outlined" startIcon={<CloudDownloadRoundedIcon />} onClick={()=> (onFetchFromAPI ? onFetchFromAPI({ chargerId: currentId, url: apiUrl }) : console.info('Fetch TOU from API', apiUrl))}
          sx={{ '&:hover': { bgcolor: 'secondary.main', color: 'common.white', borderColor: 'secondary.main' } }}>Fetch from API</Button>
        <Button variant="contained" color="secondary" startIcon={<CheckCircleRoundedIcon />} onClick={apply}
          sx={{ ml: 'auto', color: 'common.white', '&:hover': { bgcolor: 'secondary.dark', color: 'common.white' } }}>Apply to pricing</Button>
      </Stack>
    </Box>
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="xs" disableGutters>
        <MobileShell title="Utility TOU import" tagline="CSV/API • preview • apply" onBack={onBack} onHelp={onHelp} navValue={navValue} onNavChange={(v)=>{ setNavValue(v); onNavChange&&onNavChange(v); }} footer={Footer}>
          <Box sx={{ px: 2, pt: 2 }}>
            {/* Charger selector */}
            <Paper elevation={0} sx={{ p: 2, borderRadius: 1.5, bgcolor: '#fff', border: '1px solid #eef3f1', mb: 1 }}>
              <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1 }}>My chargers</Typography>
              <FormControl size="small" fullWidth>
                <Select value={chargerId} onChange={(e)=>setChargerId(e.target.value)}>
                  {chargers.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                </Select>
              </FormControl>
            </Paper>

            {/* Commercial badge + Aggregator CTA */}
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
              <CommercialBadge isCommercial={isCommercial} />
              {!isCommercial && (
                <Button size="small" variant="text" onClick={() => (onOpenAggregator ? onOpenAggregator(aggregatorUrl) : console.info('Open Aggregator', aggregatorUrl))}>Aggregator & CPMS</Button>
              )}
            </Stack>

            {/* CSV area */}
            <Paper elevation={0} sx={{ p: 2, borderRadius: 1.5, bgcolor: '#fff', border: '1px solid #eef3f1', mb: 2 }}>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                <UploadFileRoundedIcon />
                <Typography variant="subtitle2" fontWeight={800}>Paste CSV</Typography>
              </Stack>
              <Typography variant="caption" color="text.secondary">Columns: <strong>name,start,end,days,rate</strong>. Example below. Use <strong>Mon|Tue|...|Sun</strong> for days.</Typography>
              <TextField multiline minRows={5} value={csv} onChange={(e)=>setCsv(e.target.value)} fullWidth sx={{ mt: 1 }} />
              <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                <Button variant="outlined" onClick={parse}
                  sx={{ '&:hover': { bgcolor: 'secondary.main', color: 'common.white', borderColor: 'secondary.main' } }}>Parse</Button>
              </Stack>
            </Paper>

            {/* API URL */}
            <Paper elevation={0} sx={{ p: 2, borderRadius: 1.5, bgcolor: '#fff', border: '1px solid #eef3f1', mb: 2 }}>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                <CloudDownloadRoundedIcon />
                <Typography variant="subtitle2" fontWeight={800}>Fetch from API (optional)</Typography>
              </Stack>
              <TextField placeholder="https://utility.example/api/tou" value={apiUrl} onChange={(e)=>setApiUrl(e.target.value)} fullWidth />
              <Typography variant="caption" color="text.secondary">This will call your handler to fetch and map utility data.</Typography>
            </Paper>

            {/* Preview periods */}
            <Paper elevation={0} sx={{ p: 2, borderRadius: 1.5, bgcolor: '#fff', border: '1px solid #eef3f1' }}>
              <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1 }}>Preview</Typography>
              <Stack spacing={1}>
                {periods.map((p, i) => (
                  <PeriodRow key={i} p={p} />
                ))}
                {!periods.length && (
                  <Typography variant="caption" color="text.secondary">No periods yet. Paste CSV and press Parse.</Typography>
                )}
              </Stack>
            </Paper>
          </Box>
        </MobileShell>
      </Container>
    </ThemeProvider>
  );
}
