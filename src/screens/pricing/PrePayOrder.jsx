import React, { useMemo, useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import {
  CssBaseline, Container, Box, Typography, Paper, Stack, Button, Chip, RadioGroup, Radio, FormControlLabel,
  AppBar, Toolbar, BottomNavigation, BottomNavigationAction, IconButton
} from '@mui/material';
import Divider from '@mui/material/Divider';
import PaymentRoundedIcon from '@mui/icons-material/PaymentRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import EvStationIcon from '@mui/icons-material/EvStation';
import HistoryIcon from '@mui/icons-material/History';
import AccountBalanceWalletRoundedIcon from '@mui/icons-material/AccountBalanceWalletRounded';
import SupportAgentRoundedIcon from '@mui/icons-material/SupportAgentRounded';

const theme = createTheme({ palette: { primary: { main: '#03cd8c' }, secondary: { main: '#f77f00' }, background: { default: '#f2f2f2' } }, shape: { borderRadius: 14 }, typography: { fontFamily: 'Inter, Roboto, Arial, sans-serif' } });

function MobileShell({ title, tagline, onBack, onHelp, navValue, onNavChange, footer, children }) {
  const handleBack = () => { if (onBack) return onBack(); console.info('Navigate to: 13 — Charger Actions (Mobile, React + MUI, JS)'); };
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

function CommercialBadge({ isCommercial }) {
  return (
    <Chip size="small" label={isCommercial ? 'Commercial Chareger' : 'Not commercial'}
      color={isCommercial ? 'secondary' : 'default'} sx={{ color: isCommercial ? 'common.white' : undefined }} />
  );
}

export default function PrePayOrderPatched({ onBack, onHelp, onNavChange, onConfirm, onSelectMethod, onOpenPaymentMethods, estimate, currency = 'UGX',
  commercialChargerId,
  selectedChargerId,
  aggregatorUrl,
  onOpenAggregator
}) {
  const [navValue, setNavValue] = useState(2);
  const [method, setMethod] = useState('wallet');
  const quote = useMemo(() => estimate || ({ site: 'Home Charger', connector: 'CCS 2', power: '80 kW', energy: 12.4, rate: 1200, fees: 2000, taxes: 0.18 }), [estimate]);

  const subtotal = quote.energy * quote.rate;
  const taxes = Math.round(subtotal * quote.taxes);
  const total = subtotal + taxes + quote.fees;

  const isCommercial = selectedChargerId && commercialChargerId && selectedChargerId === commercialChargerId;

  const Footer = (
    <Box sx={{ px: 2, pb: 'calc(12px + env(safe-area-inset-bottom))', pt: 1.5, background: '#f2f2f2', borderTop: '1px solid #e9eceb' }}>
      <Button fullWidth variant="contained" color="secondary" startIcon={<LockRoundedIcon />} onClick={() => (onConfirm ? onConfirm({ method, total, quote }) : console.info('Confirm & lock booking'))}
        sx={{ color: 'common.white', '&:hover': { bgcolor: 'secondary.dark', color: 'common.white' } }}>Confirm & lock</Button>
    </Box>
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="xs" disableGutters>
        <MobileShell title="Pre‑pay order" tagline="estimate • fees • payment" onBack={onBack} onHelp={onHelp} navValue={navValue} onNavChange={(v) => { setNavValue(v); onNavChange && onNavChange(v); }} footer={Footer}>
          <Box sx={{ px: 2, pt: 2 }}>
            {/* Commercial badge + Aggregator CTA */}
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
              <CommercialBadge isCommercial={isCommercial} />
              {!isCommercial && (
                <Button size="small" variant="text" onClick={() => (onOpenAggregator ? onOpenAggregator(aggregatorUrl) : console.info('Open Aggregator', aggregatorUrl))}>Aggregator & CPMS</Button>
              )}
            </Stack>

            {!isCommercial && (
              <Paper elevation={0} sx={{ p: 1.25, mb: 1.5, borderRadius: 3, border: '1px solid #fdd1a1', bgcolor: 'rgba(247,127,0,0.08)' }}>
                <Typography variant="caption" color="text.secondary">
                  Pre‑pay is for public sessions on your Commercial Chareger. Make this charger commercial to enable public pre‑pay, or use EVzone Aggregator & CPMS for multiple commercial chargers.
                </Typography>
              </Paper>
            )}

            <Paper elevation={0} sx={{ p: 2, borderRadius: 3, bgcolor: '#fff', border: '1px solid #eef3f1' }}>
              <Typography variant="subtitle2" fontWeight={800}>Order details</Typography>
              <Stack spacing={0.5} sx={{ mt: 0.5 }}>
                <Typography variant="body2"><strong>Site:</strong> {quote.site}</Typography>
                <Typography variant="body2"><strong>Connector:</strong> {quote.connector}</Typography>
                <Typography variant="body2"><strong>Max power:</strong> {quote.power}</Typography>
                <Typography variant="body2"><strong>Energy (est.):</strong> {quote.energy} kWh</Typography>
                <Typography variant="body2"><strong>Rate:</strong> {currency} {quote.rate.toLocaleString()} / kWh</Typography>
              </Stack>
              <Divider sx={{ my: 1 }} />
              <Stack spacing={0.5}>
                <Typography variant="body2"><strong>Subtotal:</strong> {currency} {subtotal.toLocaleString()}</Typography>
                <Typography variant="body2"><strong>Fees:</strong> {currency} {quote.fees.toLocaleString()}</Typography>
                <Typography variant="body2"><strong>Taxes:</strong> {currency} {taxes.toLocaleString()}</Typography>
                <Typography variant="h6" fontWeight={800} sx={{ mt: 0.5 }}><strong>Total:</strong> {currency} {total.toLocaleString()}</Typography>
              </Stack>
            </Paper>

            <Paper elevation={0} sx={{ p: 2, mt: 2, borderRadius: 3, bgcolor: '#fff', border: '1px solid #eef3f1' }}>
              <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1 }}>Payment method</Typography>
              <RadioGroup value={method} onChange={(e) => { setMethod(e.target.value); onSelectMethod && onSelectMethod(e.target.value); }}>
                <FormControlLabel value="wallet" control={<Radio />} label="EVzone Pay (Wallet)" />
                <FormControlLabel value="card" control={<Radio />} label="Card" />
                <FormControlLabel value="mobile" control={<Radio />} label="Mobile money" />
              </RadioGroup>
              <Button variant="outlined" startIcon={<PaymentRoundedIcon />} onClick={() => (onOpenPaymentMethods ? onOpenPaymentMethods(method) : console.info('Navigate to: 28 — Payment Methods (Mobile, React + MUI, JS)'))}
                sx={{ mt: 1, '&:hover': { bgcolor: 'secondary.main', color: 'common.white', borderColor: 'secondary.main' } }}>Manage methods</Button>
            </Paper>
          </Box>
        </MobileShell>
      </Container>
    </ThemeProvider>
  );
}
