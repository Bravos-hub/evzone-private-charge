import React, { useMemo, useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import {
  CssBaseline, Container, Box, Typography, Paper, Stack, Button, Divider,
  AppBar, Toolbar, BottomNavigation, BottomNavigationAction, IconButton
} from '@mui/material';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import ShareRoundedIcon from '@mui/icons-material/ShareRounded';
import FileDownloadRoundedIcon from '@mui/icons-material/FileDownloadRounded';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import EvStationIcon from '@mui/icons-material/EvStation';
import HistoryIcon from '@mui/icons-material/History';
import AccountBalanceWalletRoundedIcon from '@mui/icons-material/AccountBalanceWalletRounded';
import SupportAgentRoundedIcon from '@mui/icons-material/SupportAgentRounded';

const theme = createTheme({ palette: { primary: { main: '#03cd8c' }, secondary: { main: '#f77f00' }, background: { default: '#f2f2f2' } }, shape: { borderRadius: 14 }, typography: { fontFamily: 'Inter, Roboto, Arial, sans-serif' } });

function MobileShell({ title, tagline, onBack, onHelp, navValue, onNavChange, footer, children }) {
  const handleBack = () => { if (onBack) return onBack(); console.info('Navigate to: 19 — Charging History (Mobile, React + MUI, JS)'); };
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

export default function ReceiptViewer({ onBack, onHelp, onNavChange, onShare, onDownload, currency = 'UGX', data }) {
  const [navValue, setNavValue] = useState(2);
  const receipt = useMemo(() => data || ({
    id: 'ORD-20251018-001',
    site: 'Home Charger',
    start: '10:17',
    end: '11:49',
    energy: 12.4,
    rate: 1200,
    amount: 14880,
    date: '2025-10-18'
  }), [data]);

  const Footer = (
    <Box sx={{ px: 2, pb: 'calc(12px + env(safe-area-inset-bottom))', pt: 1.5, background: '#f2f2f2', borderTop: '1px solid #e9eceb' }}>
      <Stack direction="row" spacing={1}>
        <Button variant="outlined" startIcon={<ShareRoundedIcon />} onClick={() => (onShare ? onShare(receipt) : console.info('Share receipt'))}
          sx={{ '&:hover': { bgcolor: 'secondary.main', color: 'common.white', borderColor: 'secondary.main' } }}>Share</Button>
        <Button variant="contained" color="secondary" startIcon={<FileDownloadRoundedIcon />} onClick={() => (onDownload ? onDownload(receipt) : console.info('Download receipt PDF'))}
          sx={{ ml: 'auto', color: 'common.white', '&:hover': { bgcolor: 'secondary.dark', color: 'common.white' } }}>Download</Button>
      </Stack>
    </Box>
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="xs" disableGutters>
        <MobileShell title="Receipt" tagline="summary • PDF • share" onBack={onBack} onHelp={onHelp} navValue={navValue} onNavChange={(v) => { setNavValue(v); onNavChange && onNavChange(v); }} footer={Footer}>
          <Box sx={{ px: 2, pt: 2 }}>
            <Paper elevation={0} sx={{ p: 2, borderRadius: 3, bgcolor: '#fff', border: '1px solid #eef3f1' }}>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                <ReceiptLongRoundedIcon />
                <Typography variant="subtitle1" fontWeight={800}>{receipt.id}</Typography>
              </Stack>
              <Typography variant="body2"><strong>Site:</strong> {receipt.site}</Typography>
              <Typography variant="body2"><strong>Date:</strong> {receipt.date}</Typography>
              <Typography variant="body2"><strong>Start:</strong> {receipt.start}</Typography>
              <Typography variant="body2"><strong>End:</strong> {receipt.end}</Typography>
              <Divider sx={{ my: 1 }} />
              <Typography variant="body2"><strong>Energy:</strong> {receipt.energy} kWh</Typography>
              <Typography variant="body2"><strong>Rate:</strong> {currency} {receipt.rate.toLocaleString()} / kWh</Typography>
              <Typography variant="h6" fontWeight={800} sx={{ mt: 0.5 }}><strong>Total:</strong> {currency} {receipt.amount.toLocaleString()}</Typography>
              <Paper variant="outlined" sx={{ p: 1, mt: 1, bgcolor: '#fafafa', height: 160, display: 'grid', placeItems: 'center' }}>
                <Typography variant="caption" color="text.secondary">PDF preview coming soon</Typography>
              </Paper>
            </Paper>
          </Box>
        </MobileShell>
      </Container>
    </ThemeProvider>
  );
}

/**
 * Usage examples
 * <ReceiptViewer onDownload={(r)=>console.log('download', r)} onShare={(r)=>console.log('share', r)} />
 */
