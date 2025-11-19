import React, { useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import {
  CssBaseline, Container, Box, Typography, Paper, Stack, Button, Chip, IconButton,
  AppBar, Toolbar, BottomNavigation, BottomNavigationAction, Avatar
} from '@mui/material';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import PhoneInTalkRoundedIcon from '@mui/icons-material/PhoneInTalkRounded';
import ChatRoundedIcon from '@mui/icons-material/ChatRounded';
import ShieldRoundedIcon from '@mui/icons-material/ShieldRounded';
import MapRoundedIcon from '@mui/icons-material/MapRounded';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import EvStationIcon from '@mui/icons-material/EvStation';
import HistoryIcon from '@mui/icons-material/History';
import AccountBalanceWalletRoundedIcon from '@mui/icons-material/AccountBalanceWalletRounded';
import SupportAgentRoundedIcon from '@mui/icons-material/SupportAgentRounded';

const theme = createTheme({ palette: { primary: { main: '#03cd8c' }, secondary: { main: '#f77f00' }, background: { default: '#f2f2f2' } }, shape: { borderRadius: 14 }, typography: { fontFamily: 'Inter, Roboto, Arial, sans-serif' } });

function MobileShell({ title, tagline, onBack, onHelp, navValue, onNavChange, footer, children }) {
  const handleBack = () => { if (onBack) return onBack(); console.info('Navigate to: 10 — Operator Selection (Mobile, React + MUI, JS)'); };
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

export default function OperatorMarketplaceDetail({ onBack, onHelp, onNavChange, onAssign, onCall, onMessage, operator }) {
  const [navValue, setNavValue] = useState(1);
  const op = operator || {
    name: 'Theresa Webb',
    rating: 4.9,
    reviews: 203,
    phone: '+256 777 111 222',
    email: 'theresa.webb@ops.example',
    shift: 'Day',
    certifications: ['EVSE L2 Certified', 'OCPP 1.6/2.0 Familiar', 'Electrical Safety'],
    coverage: 'Kampala, Wakiso, Mukono',
    pricing: 'UGX 30,000 per on-site visit',
  };

  const Footer = (
    <Box sx={{ px: 2, pb: 'calc(12px + env(safe-area-inset-bottom))', pt: 1.5, background: '#f2f2f2', borderTop: '1px solid #e9eceb' }}>
      <Stack direction="row" spacing={1}>
        <Button variant="outlined" startIcon={<ChatRoundedIcon />} onClick={() => (onMessage ? onMessage(op) : console.info('Message operator'))}
          sx={{ '&:hover': { bgcolor: 'secondary.main', color: 'common.white', borderColor: 'secondary.main' } }}>Message</Button>
        <Button variant="contained" color="secondary" startIcon={<PhoneInTalkRoundedIcon />} onClick={() => (onCall ? onCall(op) : console.info('Call operator'))}
          sx={{ color: 'common.white', '&:hover': { bgcolor: 'secondary.dark', color: 'common.white' } }}>Call</Button>
        <Button variant="contained" color="secondary" onClick={() => (onAssign ? onAssign(op) : console.info('Assign operator'))}
          sx={{ color: 'common.white', '&:hover': { bgcolor: 'secondary.dark', color: 'common.white' } }}>Assign operator</Button>
      </Stack>
    </Box>
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="xs" disableGutters>
        <MobileShell title="Operator detail" tagline="skills • coverage • pricing" onBack={onBack} onHelp={onHelp} navValue={navValue} onNavChange={(v) => { setNavValue(v); onNavChange && onNavChange(v); }} footer={Footer}>
          <Box sx={{ px: 2, pt: 2 }}>
            <Paper elevation={0} sx={{ p: 2, borderRadius: 3, bgcolor: '#fff', border: '1px solid #eef3f1' }}>
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
                <Avatar sx={{ width: 56, height: 56 }}>T</Avatar>
                <Box>
                  <Typography variant="subtitle1" fontWeight={800}>{op.name}</Typography>
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <StarRoundedIcon key={i} fontSize="small" sx={{ color: i < Math.round(op.rating) ? '#f7b500' : '#e0e0e0' }} />
                    ))}
                    <Typography variant="caption" color="text.secondary">({op.reviews})</Typography>
                  </Stack>
                </Box>
              </Stack>
              <Stack direction="row" spacing={1} sx={{ mb: 1, flexWrap: 'wrap' }}>
                <Chip icon={<ShieldRoundedIcon />} label={op.certifications[0]} />
                <Chip icon={<ShieldRoundedIcon />} label={op.certifications[1]} />
                <Chip icon={<ShieldRoundedIcon />} label={op.certifications[2]} />
              </Stack>
              <Typography variant="body2"><strong>Shift:</strong> {op.shift}</Typography>
              <Typography variant="body2"><strong>Coverage:</strong> {op.coverage}</Typography>
              <Typography variant="body2" sx={{ mb: 1 }}><strong>Pricing:</strong> {op.pricing}</Typography>
              <Stack direction="row" spacing={1}>
                <Chip icon={<MapRoundedIcon />} label="View on map" onClick={() => console.info('Open operator map')} />
                <Chip label={op.email} />
              </Stack>
            </Paper>
          </Box>
        </MobileShell>
      </Container>
    </ThemeProvider>
  );
}
