import React from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Box, Paper, Stack, Typography, Button, Chip, IconButton, AppBar, Toolbar, BottomNavigation, BottomNavigationAction, Tooltip } from '@mui/material';
import Grid from '@mui/material/Grid';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import AccountBalanceWalletRoundedIcon from '@mui/icons-material/AccountBalanceWalletRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import LaunchRoundedIcon from '@mui/icons-material/LaunchRounded';
import VerifiedRoundedIcon from '@mui/icons-material/VerifiedRounded';
import ApartmentRoundedIcon from '@mui/icons-material/ApartmentRounded';

const theme = createTheme({
  palette: {
    primary: { main: '#03cd8c' },
    secondary: { main: '#f77f00' },
    background: { default: '#f7f9f8' }
  },
  shape: { borderRadius: 7 },
  typography: { fontFamily: 'Inter, system-ui, -apple-system, Roboto, Arial, sans-serif' }
});

function Shell({ title, subtitle, nav = 1, onNav, onBack, onBell, children }) {
  return (
    <Box sx={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
      <AppBar
        position='fixed'
        elevation={1}
        sx={{ backgroundImage: 'linear-gradient(180deg, rgba(3,205,140,.92) 0%, rgba(3,205,140,.78) 60%, rgba(3,205,140,.70) 100%)' }}
      >
        <Toolbar sx={{ px: 0 }}>
          <Box sx={{ width: '100%', maxWidth: 420, mx: 'auto', px: 1, display: 'flex', alignItems: 'center' }}>
            <IconButton size='small' onClick={() => (onBack ? onBack() : 0)} sx={{ color: 'common.white', mr: 1 }}>
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
          <BottomNavigation
            value={nav}
            onChange={(_, v) => (onNav ? onNav(v) : 0)}
            showLabels
            sx={{ '& .Mui-selected, & .Mui-selected .MuiSvgIcon-root': { color: '#03cd8c' } }}
          >
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

export default function AggregatorBridge({ onBack, onBell, onNav, onOpenAggregator, onReadDocs }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Shell
        title='EVzone Aggregator & CPMS'
        subtitle='manage unlimited commercial stations'
        onBack={onBack}
        onBell={onBell}
        onNav={onNav}
      >
        <Paper sx={{ p: 2, border: '1px solid #eef3f1', borderRadius: 1.5, bgcolor: '#fff' }}>
          <Stack spacing={1}>
            <Typography variant='subtitle2' fontWeight={800}>
              Why Aggregator & CPMS?
            </Typography>
            <Typography variant='caption' color='text.secondary'>
              Operate multiple commercial chargers at scale: routing, tenant billing, RFID, bulk diagnostics, smart tariffs and enterprise exports.
            </Typography>
            <Grid container spacing={1}>
              {[
                { icon: <VerifiedRoundedIcon />, label: 'Certified billing & receipts' },
                { icon: <ApartmentRoundedIcon />, label: 'Multi‑site operations' }
              ].map((f, i) => (
                <Grid item xs={6} key={i}>
                  <Chip icon={f.icon} label={f.label} sx={{ width: '100%' }} />
                </Grid>
              ))}
            </Grid>
            <Stack direction='row' spacing={1} sx={{ mt: 1 }}>
              <Button
                variant='contained'
                color='secondary'
                startIcon={<LaunchRoundedIcon />}
                onClick={() => (onOpenAggregator ? onOpenAggregator() : console.info('Open Aggregator'))}
                sx={{ color: '#fff' }}
              >
                Open Aggregator
              </Button>
              <Button variant='outlined' onClick={() => (onReadDocs ? onReadDocs() : console.info('Read docs'))}>
                Read docs
              </Button>
            </Stack>
            <Typography variant='caption' color='text.secondary'>
              Note: In EVzone Private Charging, you can monetize exactly one Commercial Charger. Use Aggregator & CPMS for more.
            </Typography>
          </Stack>
        </Paper>
      </Shell>
    </ThemeProvider>
  );
}
