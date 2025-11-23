import React, { useMemo, useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import {
  CssBaseline, Container, Box, Typography, Paper, Stack, Button, Divider,
  AppBar, Toolbar, BottomNavigation, BottomNavigationAction, IconButton, Chip, Link as MuiLink,
  FormControl, Select, MenuItem
} from '@mui/material';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import PaymentRoundedIcon from '@mui/icons-material/PaymentRounded';
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
  const handleBack = () => { if (onBack) return onBack(); console.info('Navigate to: 06 — Charger Details'); };
  return (
    <Box sx={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
      <AppBar position="fixed" elevation={1} color="primary">
        <Toolbar sx={{ px: 0 }}>
          <Box sx={{ width: '100%', maxWidth: 480, mx: 'auto', px: 1, display: 'flex', alignItems: 'center' }}>
            <IconButton size="small" edge="start" onClick={handleBack} aria-label="Back" sx={{ color: 'common.white', mr: 1 }}><ArrowBackIosNewIcon fontSize="small" /></IconButton>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6" color="inherit" sx={{ fontWeight: 700, lineHeight: 1.15 }}>{title}</Typography>
              {tagline && <Typography variant="caption" color="common.white" sx={{ opacity: 0.9 }}>{tagline}</Typography>}
            </Box>
            <Box sx={{ flexGrow: 1 }} />
            <IconButton size="small" edge="end" aria-label="Help" onClick={onHelp} sx={{ color: 'common.white' }}><HelpOutlineIcon fontSize="small" /></IconButton>
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

export default function SessionSummaryPaymentMulti({
  chargers = [{ id: 'st1', name: 'Home Charger' }, { id: 'st2', name: 'Office Charger' }],
  defaultChargerId = 'st1',
  onBack, onHelp, onNavChange,
  onPay, onViewReceipt, onDone,
  currency = 'UGX', billing = 'postpaid'
}) {
  const [navValue, setNavValue] = useState(2);
  const [chargerId, setChargerId] = useState(defaultChargerId);
  const selected = useMemo(() => chargers.find(c => c.id === chargerId) || chargers[0], [chargers, chargerId]);
  const totals = useMemo(() => ({ energy: 12.4, duration: '01:32:10', start: '10:17', end: '11:49', rate: 1200, amount: 14880 }), []);

  const goDone = () => { if (onDone) return onDone({ chargerId }); console.info('Navigate to: 06 — Charger Details'); };
  const openReceipt = () => { if (onViewReceipt) return onViewReceipt({ chargerId }); console.info('Navigate to: 24 — Receipt Viewer'); };

  const Footer = (
    <Box sx={{ px: 2, pb: 'calc(12px + env(safe-area-inset-bottom))', pt: 1.5, background: '#f2f2f2', borderTop: '1px solid #e9eceb' }}>
      {billing === 'prepaid' ? (
        <Stack direction="row" spacing={1}>
          <Button fullWidth variant="outlined" startIcon={<ReceiptLongRoundedIcon />} onClick={openReceipt}
            sx={{ '&:hover': { bgcolor: 'secondary.main', color: 'common.white', borderColor: 'secondary.main' } }}>View receipt</Button>
          <Button fullWidth variant="contained" color="secondary" startIcon={<CheckCircleRoundedIcon />} onClick={goDone}
            sx={{ color: 'common.white', '&:hover': { bgcolor: 'secondary.dark', color: 'common.white' } }}>Done</Button>
        </Stack>
      ) : (
        <Stack direction="row" spacing={1}>
          <Button fullWidth variant="outlined" startIcon={<ReceiptLongRoundedIcon />} onClick={openReceipt}
            sx={{ '&:hover': { bgcolor: 'secondary.main', color: 'common.white', borderColor: 'secondary.main' } }}>View receipt</Button>
          <Button fullWidth variant="contained" color="secondary" startIcon={<PaymentRoundedIcon />} onClick={() => (onPay ? onPay({ chargerId }) : console.info('Pay now'))}
            sx={{ color: 'common.white', '&:hover': { bgcolor: 'secondary.dark', color: 'common.white' } }}>Pay now</Button>
        </Stack>
      )}
    </Box>
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="xs" disableGutters>
        <MobileShell
          title="Session summary"
          tagline="energy • time • cost"
          onBack={onBack}
          onHelp={onHelp}
          navValue={navValue}
          onNavChange={(v) => { setNavValue(v); onNavChange && onNavChange(v); }}
          footer={Footer}
        >
          <Box sx={{ px: 2, pt: 2 }}>
            {/* Charger selector */}
            <Paper elevation={0} sx={{ p: 2, borderRadius: 1.5, bgcolor: '#fff', border: '1px solid #eef3f1', mb: 2 }}>
              <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1 }}>For charger</Typography>
              <FormControl size="small" fullWidth>
                <Select value={chargerId} onChange={(e)=>setChargerId(e.target.value)}>
                  {chargers.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                </Select>
              </FormControl>
            </Paper>

            <Paper elevation={0} sx={{ p: 2, borderRadius: 1.5, bgcolor: '#fff', border: '1px solid #eef3f1' }}>
              <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1 }}>Order details</Typography>
              <Stack spacing={0.75}>
                <Typography variant="body2"><strong>Charger:</strong> {selected?.name}</Typography>
                <Typography variant="body2"><strong>Energy:</strong> {totals.energy} kWh</Typography>
                <Typography variant="body2"><strong>Duration:</strong> {totals.duration}</Typography>
                <Typography variant="body2"><strong>Start time:</strong> {totals.start}</Typography>
                <Typography variant="body2"><strong>End time:</strong> {totals.end}</Typography>
                <Typography variant="body2"><strong>Rate:</strong> {currency} {totals.rate.toLocaleString()} / kWh</Typography>
                <Divider sx={{ my: 1 }} />
                <Typography variant="h6" fontWeight={800}><strong>Total:</strong> {currency} {totals.amount.toLocaleString()}</Typography>
                <Chip label={billing === 'prepaid' ? 'EVzone Pay — Pre‑paid' : 'EVzone Pay — Post‑paid'} color="secondary" sx={{ alignSelf: 'flex-start', color: 'common.white' }} />
              </Stack>
            </Paper>

            <MuiLink component="button" type="button" underline="hover" sx={{ mt: 1.5, color: 'secondary.main' }} onClick={openReceipt}>
              Download receipt (PDF)
            </MuiLink>
          </Box>
        </MobileShell>
      </Container>
    </ThemeProvider>
  );
}
