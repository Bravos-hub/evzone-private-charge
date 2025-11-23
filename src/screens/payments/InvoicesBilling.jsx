import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ThemeProvider, createTheme, alpha } from '@mui/material/styles';
import {
  CssBaseline,
  Container,
  Box,
  Typography,
  Paper,
  Stack,
  Button,
  Chip,
  IconButton,
  List,
  ListItemButton,
  AppBar,
  Toolbar,
  BottomNavigation,
  BottomNavigationAction,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  FormLabel,
  Tooltip,
} from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import FileDownloadRoundedIcon from '@mui/icons-material/FileDownloadRounded';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import EmailRoundedIcon from '@mui/icons-material/EmailRounded';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import AccountBalanceWalletRoundedIcon from '@mui/icons-material/AccountBalanceWalletRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

const theme = createTheme({
  palette: { primary: { main: '#03cd8c' }, secondary: { main: '#f77f00' }, background: { default: '#f2f2f2' } },
  shape: { borderRadius: 7 },
  typography: { fontFamily: 'Inter, Roboto, Arial, sans-serif' },
});

function MobileShell({ title, tagline, onBack, onHelp, navValue, onNavChange, footer, children }) {
  const handleBack = () => { if (onBack) return onBack(); console.info('Navigate to: 28 — Payment Methods'); };
  const handleBell = () => { if (onHelp) return onHelp(); console.info('Notifications'); };
  return (
    <Box sx={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
      <AppBar position="fixed" elevation={1} sx={{
        background: `linear-gradient(180deg, ${alpha('#03cd8c', 0.92)} 0%, ${alpha('#03cd8c', 0.78)} 60%, ${alpha('#03cd8c', 0.70)} 100%)`
      }}>
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
            <Tooltip title="Notifications">
              <span>
                <IconButton size="small" edge="end" aria-label="Notifications" onClick={handleBell} sx={{ color: 'common.white' }}>
                  <NotificationsRoundedIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>
      <Toolbar />
      <Box component="main" sx={{ flex: 1 }}>
        <Box sx={{ maxWidth: 420, mx: 'auto' }}>{children}</Box>
      </Box>
      <Box component="footer" sx={{ position: 'sticky', bottom: 0 }}>
        {footer}
        <Paper elevation={8} sx={{ borderTopLeftRadius: 16, borderTopRightRadius: 16 }}>
          <Box sx={{ maxWidth: 420, mx: 'auto' }}>
            <BottomNavigation value={navValue} onChange={(_, v) => onNavChange && onNavChange(v)} showLabels sx={{ '& .Mui-selected, & .Mui-selected .MuiSvgIcon-root': { color: '#03cd8c' } }}>
              <BottomNavigationAction label="Home" icon={<HomeRoundedIcon />} />
              <BottomNavigationAction label="Dashboard" icon={<DashboardRoundedIcon />} />
              <BottomNavigationAction label="Sessions" icon={<HistoryRoundedIcon />} />
              <BottomNavigationAction label="Wallet" icon={<AccountBalanceWalletRoundedIcon />} />
              <BottomNavigationAction label="Settings" icon={<SettingsRoundedIcon />} />
            </BottomNavigation>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}

function InvoiceRow({ inv, onOpen, onResendEmail, onResendWhatsApp, onDownload, onPrepay }) {
  return (
    <Paper elevation={0} sx={{ p: 1.25, borderRadius: 1.5, bgcolor: '#fff', border: '1px solid #eef3f1' }}>
      <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
        <Box onClick={() => onOpen ? onOpen(inv) : console.info('Open invoice detail')} sx={{ cursor: 'pointer' }}>
          <Typography variant="subtitle2" fontWeight={700}>{inv.id}</Typography>
          <Typography variant="caption" color="text.secondary">{inv.date} • {inv.site}</Typography>
          <Stack direction="row" spacing={1} sx={{ mt: 0.5, flexWrap: 'wrap' }}>
            <Chip size="small" label={inv.status} color={inv.status === 'Paid' ? 'success' : inv.status === 'Unpaid' ? 'warning' : 'default'} />
            <Chip size="small" label={`${inv.currency} ${inv.amount.toLocaleString()}`} />
          </Stack>
        </Box>
        <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
          {inv.status === 'Unpaid' && (
            <Button size="small" variant="contained" color="secondary" onClick={() => (onPrepay ? onPrepay(inv) : console.info('Navigate to: 30 — Pre‑Pay Order'))}
              sx={{ color: 'common.white', '&:hover': { bgcolor: 'secondary.dark', color: 'common.white' } }}>Pre‑pay</Button>
          )}
          <IconButton size="small" onClick={() => (onResendEmail ? onResendEmail(inv) : console.info('Resend via Email'))} aria-label="Email"><EmailRoundedIcon /></IconButton>
          <IconButton size="small" onClick={() => (onResendWhatsApp ? onResendWhatsApp(inv) : console.info('Resend via WhatsApp'))} aria-label="WhatsApp"><WhatsAppIcon /></IconButton>
          <IconButton size="small" onClick={() => (onDownload ? onDownload(inv) : console.info('Download PDF'))} aria-label="Download"><FileDownloadRoundedIcon /></IconButton>
        </Stack>
      </Stack>
    </Paper>
  );
}

export default function InvoicesBilling({ onBack, onHelp, onNavChange, onOpenInvoice, onResendEmail, onResendWhatsApp, onDownloadPDF, onExportFiltered, onPrepay, currency = 'UGX' }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [navValue, setNavValue] = useState(3);
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
      navigate('/wallet');
    }
  };
  
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('All');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [paidOnly, setPaidOnly] = useState(false);

  const invoices = useMemo(() => ([
    { id: 'INV-202510-001', date: '2025-10-18', site: 'Home Charger', amount: 14880, status: 'Paid', currency },
    { id: 'INV-202510-002', date: '2025-10-12', site: 'Office Charger', amount: 6120, status: 'Unpaid', currency },
    { id: 'INV-202509-010', date: '2025-09-28', site: 'Home Charger', amount: 14400, status: 'Paid', currency },
  ]), [currency]);

  const inRange = (d) => {
    if (!from && !to) return true;
    if (from && d < from) return false;
    if (to && d > to) return false;
    return true;
  };

  const filtered = invoices.filter(i => (
    (paidOnly ? i.status === 'Paid' : (status === 'All' || i.status === status)) &&
    (query.trim() === '' || i.id.toLowerCase().includes(query.toLowerCase()) || i.site.toLowerCase().includes(query.toLowerCase())) &&
    inRange(i.date)
  ));

  const Tip = (
    <Paper elevation={0} sx={{ p: 1.25, borderRadius: 9999, bgcolor: 'rgba(247,127,0,0.08)', position: 'relative', overflow: 'hidden' }}>
      <Box sx={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 6, bgcolor: 'secondary.main', borderTopLeftRadius: 9999, borderBottomLeftRadius: 9999 }} />
      <Stack direction="row" spacing={1.25} alignItems="center" sx={{ pl: 2 }}>
        <Box sx={{ width: 22, height: 22, borderRadius: '50%', border: '2px solid', borderColor: 'secondary.main', color: 'secondary.main', display: 'grid', placeItems: 'center' }}>
          <InfoOutlinedIcon sx={{ fontSize: 14 }} />
        </Box>
        <Typography variant="caption" color="text.primary">
          Tip: Use filters to quickly find and resend invoices. EVmart chargers complete compliance tests in advance to speed up pairing and reduce field issues.
        </Typography>
      </Stack>
    </Paper>
  );

  const Controls = (
    <Stack spacing={1} sx={{ mb: 1 }}>
      <Stack direction="row" spacing={1} alignItems="flex-end">
        <TextField size="small" placeholder="Search invoices" value={query} onChange={(e) => setQuery(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchRoundedIcon /></InputAdornment> }} sx={{ flex: 1, bgcolor: '#fff', borderRadius: 1 }} />
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <FormLabel>Status</FormLabel>
          <Select value={status} onChange={(e) => setStatus(e.target.value)}>
            {['All','Paid','Unpaid','Refunded'].map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
          </Select>
        </FormControl>
        <Button variant="contained" color="secondary" startIcon={<FileDownloadRoundedIcon />} onClick={() => (onExportFiltered ? onExportFiltered({ query, status, from, to, paidOnly, count: filtered.length }) : console.info('Export filtered'))}
          sx={{ ml: 'auto', color: 'common.white', '&:hover': { bgcolor: 'secondary.dark', color: 'common.white' } }}>Export</Button>
      </Stack>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ flexWrap: 'wrap' }}>
        <TextField size="small" type="date" label="From" InputLabelProps={{ shrink: true }} value={from} onChange={(e) => setFrom(e.target.value)} sx={{ bgcolor: '#fff', borderRadius: 1 }} />
        <TextField size="small" type="date" label="To" InputLabelProps={{ shrink: true }} value={to} onChange={(e) => setTo(e.target.value)} sx={{ bgcolor: '#fff', borderRadius: 1 }} />
        <Chip label={paidOnly ? 'Paid only ✓' : 'Paid only'} color={paidOnly ? 'secondary' : 'default'} onClick={() => setPaidOnly(!paidOnly)} />
        {/* Preset chips */}
        <Chip label="Today" size="small" onClick={() => { const t = new Date(); const d = t.toISOString().slice(0,10); setFrom(d); setTo(d); }} />
        <Chip label="Last 7" size="small" onClick={() => { const t = new Date(); const toD = t.toISOString().slice(0,10); const fromD = new Date(t.getTime() - 6*86400000).toISOString().slice(0,10); setFrom(fromD); setTo(toD); }} />
        <Chip label="Last 30" size="small" onClick={() => { const t = new Date(); const toD = t.toISOString().slice(0,10); const fromD = new Date(t.getTime() - 29*86400000).toISOString().slice(0,10); setFrom(fromD); setTo(toD); }} />
      </Stack>
    </Stack>
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="xs" disableGutters>
        <MobileShell title="Invoices & billing" tagline="search • filter • resend • download" onBack={handleBack} onHelp={onHelp} navValue={navValue} onNavChange={handleNavChange} footer={null}>
          <Box sx={{ px: 2, pt: 2 }}>
            {Tip}
            <Box sx={{ height: 8 }} />
            {Controls}
            <List sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {filtered.map(inv => (
                <ListItemButton key={inv.id} sx={{ p: 0 }}>
                  <InvoiceRow
                    inv={inv}
                    onOpen={(i) => (onOpenInvoice ? onOpenInvoice(i) : console.info('Open invoice detail'))}
                    onResendEmail={(i) => (onResendEmail ? onResendEmail(i) : console.info('Resend email'))}
                    onResendWhatsApp={(i) => (onResendWhatsApp ? onResendWhatsApp(i) : console.info('Resend WhatsApp'))}
                    onDownload={(i) => (onDownloadPDF ? onDownloadPDF(i) : console.info('Download PDF'))}
                    onPrepay={(i) => (onPrepay ? onPrepay(i) : console.info('Navigate to: 30 — Pre‑Pay Order'))}
                  />
                </ListItemButton>
              ))}
            </List>
          </Box>
        </MobileShell>
      </Container>
    </ThemeProvider>
  );
}

/**
 * Usage examples
 * <InvoicesBilling onExportFiltered={({query,status,from,to,paidOnly,count})=>console.log('export filtered', {query,status,from,to,paidOnly,count})}
 *                  onPrepay={(inv)=>navigate('/prepay', { state: { inv } })}
 * />
 */
