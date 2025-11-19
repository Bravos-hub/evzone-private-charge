import React from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import {
  Box,
  Paper,
  Stack,
  Grid,
  Typography,
  Button,
  Chip,
  IconButton,
  AppBar,
  Toolbar,
  BottomNavigation,
  BottomNavigationAction,
  Tooltip,
  CssBaseline
} from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import AccountBalanceWalletRoundedIcon from '@mui/icons-material/AccountBalanceWalletRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import IosShareRoundedIcon from '@mui/icons-material/IosShareRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';

const theme = createTheme({
  palette: { primary: { main: '#03cd8c' }, secondary: { main: '#f77f00' }, background: { default: '#f7f9f8' } },
  shape: { borderRadius: 14 },
  typography: { fontFamily: 'Inter, system-ui, -apple-system, Roboto, Arial, sans-serif' }
});

function MobileShell({ title, subtitle, nav = 2, onNav, onBack, onBell, children }) {
  return (
    <Box sx={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
      <AppBar
        position='fixed'
        elevation={1}
        sx={{ backgroundImage: 'linear-gradient(180deg, rgba(3,205,140,.92) 0%, rgba(3,205,140,.78) 60%, rgba(3,205,140,.70) 100%)', backdropFilter: 'blur(6px)' }}
      >
        <Toolbar sx={{ px: 0 }}>
          <Box sx={{ width: '100%', maxWidth: 420, mx: 'auto', px: 1, display: 'flex', alignItems: 'center' }}>
            <IconButton size='small' onClick={() => (onBack ? onBack() : console.info('Back'))} sx={{ color: 'common.white', mr: 1 }}>
              <ArrowBackIosNewIcon fontSize='small' />
            </IconButton>
            <Box sx={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
              <Typography variant='h6' color='inherit' noWrap sx={{ fontWeight: 800, lineHeight: 1.1 }}>
                {title}
              </Typography>
              {subtitle ? (
                <Typography variant='caption' color='common.white' noWrap sx={{ opacity: 0.9 }}>
                  {subtitle}
                </Typography>
              ) : null}
            </Box>
            <Box sx={{ flexGrow: 1 }} />
            <Tooltip title='Notifications'>
              <span>
                <IconButton size='small' onClick={() => (onBell ? onBell() : 0)} sx={{ color: 'common.white' }}>
                  <NotificationsRoundedIcon fontSize='small' />
                </IconButton>
              </span>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>
      <Toolbar />
      <Box sx={{ flex: 1 }}>
        <Box sx={{ maxWidth: 420, mx: 'auto', px: 2, pt: 2, pb: 2 }}>{children}</Box>
      </Box>
      <Paper elevation={8} sx={{ position: 'sticky', bottom: 0, borderTopLeftRadius: 16, borderTopRightRadius: 16 }}>
        <Box sx={{ maxWidth: 420, mx: 'auto' }}>
          <BottomNavigation value={nav} onChange={(_, v) => (onNav ? onNav(v) : 0)} showLabels sx={{ '& .Mui-selected, & .Mui-selected .MuiSvgIcon-root': { color: '#03cd8c' } }}>
            <BottomNavigationAction label='Home' icon={<HomeRoundedIcon />} />
            <BottomNavigationAction label='Dashboard' icon={<DashboardRoundedIcon />} />
            <BottomNavigationAction label='Sessions' icon={<HistoryRoundedIcon />} />
            <BottomNavigationAction label='Wallet' icon={<AccountBalanceWalletRoundedIcon />} />
            <BottomNavigationAction label='Settings' icon={<SettingsRoundedIcon />} />
          </BottomNavigation>
        </Box>
      </Paper>
    </Box>
  );
}

export default function SessionSummaryMobile({
  onBack,
  onBell,
  onNav,
  site = 'Home Charger',
  connector = 'CCS2',
  start = '10:12',
  end = '11:05',
  kwh = 12.8,
  duration = '53m',
  cost = 14880,
  currency = 'UGX',
  receiptId = 'RCPT-2025-10-001',
  onShare,
  onDownload,
  onViewReceipt,
  onDone
}) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <MobileShell title='Session summary' subtitle='energy • time • cost' onBack={onBack} onBell={onBell} onNav={onNav}>
        <Paper sx={{ p: 2, borderRadius: 3, border: '1px solid #eef3f1', bgcolor: '#fff' }}>
          <Stack spacing={1}>
            <Typography variant='subtitle2' fontWeight={800}>{site}</Typography>
            <Typography variant='caption' color='text.secondary'>Connector: {connector}</Typography>
            <Grid container spacing={1} sx={{ mt: 1 }}>
              {[
                { label: 'Energy', value: `${kwh} kWh` },
                { label: 'Duration', value: duration },
                { label: 'Cost', value: `${currency} ${cost.toLocaleString()}` }
              ].map((m) => (
                <Grid item xs={4} key={m.label}>
                  <Paper sx={{ p: 1, borderRadius: 2, textAlign: 'center', border: '1px solid #eef3f1' }}>
                    <Typography variant='caption' color='text.secondary'>{m.label}</Typography>
                    <Typography variant='subtitle2' fontWeight={800}>{m.value}</Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
            <Typography variant='caption' color='text.secondary'>Start {start} • End {end}</Typography>
            <Stack direction='row' spacing={1} sx={{ mt: 1 }}>
              <Button variant='outlined' startIcon={<ReceiptLongRoundedIcon />} onClick={() => (onViewReceipt ? onViewReceipt(receiptId) : 0)} sx={{ borderRadius: 999 }}>View receipt</Button>
              <Button variant='outlined' startIcon={<DownloadRoundedIcon />} onClick={() => (onDownload ? onDownload(receiptId) : 0)} sx={{ borderRadius: 999 }}>Download</Button>
              <Button variant='contained' color='secondary' startIcon={<IosShareRoundedIcon />} onClick={() => (onShare ? onShare(receiptId) : 0)} sx={{ color: '#fff', borderRadius: 999 }}>Share</Button>
            </Stack>
          </Stack>
        </Paper>
        <Stack direction='row' spacing={1} justifyContent='center' sx={{ mt: 2 }}>
          <Button variant='contained' onClick={() => (onDone ? onDone() : 0)} sx={{ bgcolor: '#03cd8c', color: '#fff', borderRadius: 999, '&:hover': { bgcolor: '#02b87e' } }}>Done</Button>
        </Stack>
      </MobileShell>
    </ThemeProvider>
  );
}
