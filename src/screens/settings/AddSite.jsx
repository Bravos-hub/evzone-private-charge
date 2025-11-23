import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import {
  CssBaseline, Container, Box, Typography, Paper, Stack, Button, TextField,
  AppBar, Toolbar, BottomNavigation, BottomNavigationAction, IconButton
} from '@mui/material';
import PlaceRoundedIcon from '@mui/icons-material/PlaceRounded';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import EvStationIcon from '@mui/icons-material/EvStation';
import HistoryIcon from '@mui/icons-material/History';
import AccountBalanceWalletRoundedIcon from '@mui/icons-material/AccountBalanceWalletRounded';
import SupportAgentRoundedIcon from '@mui/icons-material/SupportAgentRounded';

const theme = createTheme({
  palette: {
    primary: { main: '#03cd8c' },
    secondary: { main: '#f77f00' },
    background: { default: '#f2f2f2' }
  },
  shape: { borderRadius: 7 },
  typography: { fontFamily: 'Inter, Roboto, Arial, sans-serif' }
});

function MobileShell({ title, tagline, onBack, onHelp, navValue, onNavChange, footer, children }) {
  const handleBack = () => { if (onBack) return onBack(); console.info('Navigate to: 16 — Choose Site (Mobile, React + MUI, JS)'); };
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

export default function AddSite({ onBack, onHelp, onNavChange, onConfirm }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [navValue, setNavValue] = useState(1);
  const routes = ['/', '/chargers', '/sessions', '/wallet', '/settings'];
  
  // Sync navValue with current route
  useEffect(() => {
    const pathIndex = routes.findIndex(route => location.pathname === route || location.pathname.startsWith(route + '/'));
    if (pathIndex !== -1) {
      setNavValue(pathIndex);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);
  
  const handleNavChange = (value) => {
    setNavValue(value);
    if (routes[value] !== undefined) {
      navigate(routes[value]);
    }
    if (onNavChange) onNavChange(value);
  };
  
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      // Navigate back to site selector
      navigate('/settings/sites');
    }
  };
  
  const [address, setAddress] = useState('');
  const [siteName, setSiteName] = useState('');

  const Footer = (
    <Box sx={{ px: 2, pb: 'calc(12px + env(safe-area-inset-bottom))', pt: 1.5, background: '#f2f2f2', borderTop: '1px solid #e9eceb' }}>
      <Button fullWidth size="large" variant="contained" color="secondary"
        onClick={() => (onConfirm ? onConfirm({ address, siteName }) : console.info('Site saved, returning'))}
        sx={{ py: 1.25, color: 'common.white', '&:hover': { bgcolor: 'secondary.dark', color: 'common.white' } }}>
        Confirm
      </Button>
    </Box>
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="xs" disableGutters>
        <MobileShell
          title="Add a site"
          tagline="pin the location and name it"
          onBack={handleBack}
          onHelp={onHelp}
          navValue={navValue}
          onNavChange={handleNavChange}
          footer={Footer}
        >
          <Box sx={{ px: 2, pt: 2 }}>
            {/* Map placeholder with pin */}
            <Paper elevation={0} sx={{ height: 180, borderRadius: 1.5, bgcolor: '#fff', border: '1px solid #eef3f1', display: 'grid', placeItems: 'center' }}>
              <Stack alignItems="center" spacing={0.5}>
                <PlaceRoundedIcon color="error" />
                <Typography variant="caption" color="text.secondary">Drag map to position the red pin</Typography>
              </Stack>
            </Paper>

            <Stack spacing={1.25} sx={{ mt: 2 }}>
              <TextField label="Address" placeholder="Type address" value={address} onChange={(e) => setAddress(e.target.value)} fullWidth />
              <TextField label="Site name" placeholder="Type site name" value={siteName} onChange={(e) => setSiteName(e.target.value)} fullWidth />
            </Stack>
          </Box>
        </MobileShell>
      </Container>
    </ThemeProvider>
  );
}
