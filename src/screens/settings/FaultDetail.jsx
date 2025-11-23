import React, { useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
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
  Divider,
  AppBar,
  Toolbar,
  BottomNavigation,
  BottomNavigationAction,
} from '@mui/material';
import BugReportRoundedIcon from '@mui/icons-material/BugReportRounded';
import HistoryEduRoundedIcon from '@mui/icons-material/HistoryEduRounded';
import FileDownloadRoundedIcon from '@mui/icons-material/FileDownloadRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import EvStationIcon from '@mui/icons-material/EvStation';
import HistoryIcon from '@mui/icons-material/History';
import AccountBalanceWalletRoundedIcon from '@mui/icons-material/AccountBalanceWalletRounded';
import SupportAgentRoundedIcon from '@mui/icons-material/SupportAgentRounded';

const theme = createTheme({
  palette: { primary: { main: '#03cd8c' }, secondary: { main: '#f77f00' }, background: { default: '#f2f2f2' } },
  shape: { borderRadius: 7 },
  typography: { fontFamily: 'Inter, Roboto, Arial, sans-serif' },
});

function MobileShell({ title, tagline, onBack, onHelp, navValue, onNavChange, footer, children }) {
  const handleBack = () => { if (onBack) return onBack(); console.info('Navigate to: 21 — Diagnostics & Logs (Mobile, React + MUI, JS)'); };
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

function SeverityChip({ severity }) {
  const color = severity === 'Critical' ? 'error' : severity === 'Warning' ? 'warning' : 'default';
  return <Chip size="small" label={severity} color={color} sx={{ alignSelf: 'flex-start' }} />;
}

export default function FaultDetail({ onBack, onHelp, onNavChange, onResolve, onAcknowledge, onExport, fault }) {
  const [navValue, setNavValue] = useState(1);
  const f = fault || { code: 'E101', title: 'Overcurrent detected', severity: 'Critical', time: '2025-10-18 14:22', connector: 'Connector 1', description: 'Current exceeded safe operating threshold.', recommendations: ['Check cable and connector for damage', 'Reduce charging power', 'Restart the charger'], raw: '{"code":"E101","amp":112}' };

  const Footer = (
    <Box sx={{ px: 2, pb: 'calc(12px + env(safe-area-inset-bottom))', pt: 1.5, background: '#f2f2f2', borderTop: '1px solid #e9eceb' }}>
      <Stack direction="row" spacing={1}>
        <Button variant="outlined" startIcon={<HistoryEduRoundedIcon />} onClick={() => (onAcknowledge ? onAcknowledge(f) : console.info('Acknowledge fault'))}
          sx={{ '&:hover': { bgcolor: 'secondary.main', color: 'common.white', borderColor: 'secondary.main' } }}>Acknowledge</Button>
        <Button variant="contained" color="secondary" startIcon={<CheckCircleRoundedIcon />} onClick={() => (onResolve ? onResolve(f) : console.info('Resolve fault'))}
          sx={{ ml: 'auto', color: 'common.white', '&:hover': { bgcolor: 'secondary.dark', color: 'common.white' } }}>Resolve</Button>
      </Stack>
    </Box>
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="xs" disableGutters>
        <MobileShell title="Fault detail" tagline="inspect • acknowledge • resolve" onBack={onBack} onHelp={onHelp} navValue={navValue} onNavChange={(v) => { setNavValue(v); onNavChange && onNavChange(v); }} footer={Footer}>
          <Box sx={{ px: 2, pt: 2 }}>
            <Paper elevation={0} sx={{ p: 2, borderRadius: 1.5, bgcolor: '#fff', border: '1px solid #eef3f1' }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <BugReportRoundedIcon color="error" />
                <Typography variant="subtitle1" fontWeight={800}>{f.code} — {f.title}</Typography>
              </Stack>
              <SeverityChip severity={f.severity} />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>{f.time} • {f.connector}</Typography>
              <Divider sx={{ my: 1.5 }} />
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{f.description}</Typography>
              <Typography variant="subtitle2" sx={{ mt: 2, fontWeight: 700 }}>Recommendations</Typography>
              <Stack spacing={0.5} sx={{ mt: 0.5 }}>
                {f.recommendations.map((r, i) => (
                  <Typography key={i} variant="body2">• {r}</Typography>
                ))}
              </Stack>
              <Button size="small" startIcon={<FileDownloadRoundedIcon />} sx={{ mt: 1 }} onClick={() => (onExport ? onExport(f) : console.info('Export fault log'))}>Export log</Button>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>Raw payload</Typography>
              <Paper variant="outlined" sx={{ p: 1, mt: 0.5, bgcolor: '#fafafa', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace', fontSize: 12 }}>
                {f.raw}
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
 * <FaultDetail onResolve={(f)=>console.log('resolve', f)} onAcknowledge={(f)=>console.log('ack', f)} />
 */
