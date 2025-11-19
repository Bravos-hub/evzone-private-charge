import React, { useMemo, useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import {
  CssBaseline, Container, Box, Typography, Paper, Stack, Button, Chip, IconButton,
  AppBar, Toolbar, BottomNavigation, BottomNavigationAction, FormControl, Select, MenuItem, TextField,
  List, ListItemButton, Dialog, DialogTitle, DialogContent, DialogActions, FormControlLabel, Switch
} from '@mui/material';
import Divider from '@mui/material/Divider';
import RouteRoundedIcon from '@mui/icons-material/RouteRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import DoneAllRoundedIcon from '@mui/icons-material/DoneAllRounded';
import LocalShippingRoundedIcon from '@mui/icons-material/LocalShippingRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
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

function RequestRow({ r, onAccept, onReject, onDispatch, onComplete, onRoute }) {
  return (
    <Paper elevation={0} sx={{ p: 1.25, borderRadius: 3, bgcolor: '#fff', border: '1px solid #eef3f1' }}>
      <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
        <Box>
          <Typography variant="subtitle2" fontWeight={700}>{r.customer} • {r.energy} kWh</Typography>
          <Typography variant="caption" color="text.secondary"><MapRoundedIcon fontSize="inherit"/> {r.location} • ETA {r.eta}</Typography>
          <Stack direction="row" spacing={1} sx={{ mt: 0.5, flexWrap: 'wrap' }}>
            <Chip size="small" label={r.status} color={r.status==='Dispatched' ? 'warning' : r.status==='Completed' ? 'success' : 'default'} />
          </Stack>
        </Box>
        <Stack direction="row" spacing={0.5}>
          {r.status==='Queued' && <IconButton size="small" color="success" onClick={()=>onAccept&&onAccept(r)} aria-label="Accept"><CheckRoundedIcon/></IconButton>}
          {r.status==='Queued' && <IconButton size="small" color="error" onClick={()=>onReject&&onReject(r)} aria-label="Reject"><CloseRoundedIcon/></IconButton>}
          {r.status==='Accepted' && <IconButton size="small" color="primary" onClick={()=>onDispatch&&onDispatch(r)} aria-label="Dispatch"><SendRoundedIcon/></IconButton>}
          {r.status==='Dispatched' && <IconButton size="small" color="primary" onClick={()=>onRoute&&onRoute(r)} aria-label="Route"><RouteRoundedIcon/></IconButton>}
          {r.status==='Dispatched' && <IconButton size="small" color="success" onClick={()=>onComplete&&onComplete(r)} aria-label="Complete"><DoneAllRoundedIcon/></IconButton>}
        </Stack>
      </Stack>
    </Paper>
  );
}

export default function MobileStationRequests({
  sites = [{ id: 'st1', name: 'Home Site' }, { id: 'st2', name: 'Office Site' }],
  defaultSiteId = 'st1',
  onBack, onHelp, onNavChange,
  onAccept, onReject, onDispatch, onComplete, onRoute,
  onToggleOnline
}) {
  const [navValue, setNavValue] = useState(1);
  const [siteId, setSiteId] = useState(defaultSiteId);
  const [online, setOnline] = useState(true);
  const initial = useMemo(() => ({
    st1: [
      { id: 'ms1', customer: 'Tim', location: 'Ntinda', energy: 20, eta: '14:30', status: 'Queued' },
      { id: 'ms2', customer: 'Eve', location: 'Bukoto', energy: 15, eta: '15:10', status: 'Accepted' }
    ],
    st2: [ { id: 'ms3', customer: 'Sara', location: 'Nalya', energy: 10, eta: '16:05', status: 'Dispatched' } ]
  }), []);

  const queue = initial[siteId] || [];

  const Footer = (
    <Box sx={{ px: 2, pb: 'calc(12px + env(safe-area-inset-bottom))', pt: 1.5, background: '#f2f2f2', borderTop: '1px solid #e9eceb' }}>
      <Stack direction="row" spacing={1}>
        <FormControlLabel control={<Switch checked={online} onChange={(e)=>{ setOnline(e.target.checked); onToggleOnline && onToggleOnline({ siteId, online: e.target.checked }); }} />} label={online ? 'Online' : 'Offline'} />
        <Chip label={`Queue: ${queue.length}`} />
      </Stack>
    </Box>
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="xs" disableGutters>
        <MobileShell title="Mobile station requests" tagline="queue • route • dispatch" onBack={onBack} onHelp={onHelp} navValue={navValue} onNavChange={(v)=>{ setNavValue(v); onNavChange&&onNavChange(v); }} footer={Footer}>
          <Box sx={{ px: 2, pt: 2 }}>
            {/* Site selector */}
            <Paper elevation={0} sx={{ p: 2, borderRadius: 3, bgcolor: '#fff', border: '1px solid #eef3f1', mb: 2 }}>
              <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1 }}>My sites</Typography>
              <FormControl size="small" fullWidth>
                <Select value={siteId} onChange={(e)=>setSiteId(e.target.value)}>
                  {sites.map(s => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
                </Select>
              </FormControl>
            </Paper>

            {/* Queue */}
            <List sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {queue.map(r => (
                <ListItemButton key={r.id} sx={{ p: 0 }}>
                  <RequestRow r={r}
                    onAccept={(x)=> onAccept ? onAccept({ siteId, request: x }) : console.info('Accept', x)}
                    onReject={(x)=> onReject ? onReject({ siteId, request: x }) : console.info('Reject', x)}
                    onDispatch={(x)=> onDispatch ? onDispatch({ siteId, request: x }) : console.info('Dispatch', x)}
                    onComplete={(x)=> onComplete ? onComplete({ siteId, request: x }) : console.info('Complete', x)}
                    onRoute={(x)=> onRoute ? onRoute({ siteId, request: x }) : console.info('Open route in maps', x)}
                  />
                </ListItemButton>
              ))}
            </List>

            {!queue.length && (
              <Paper elevation={0} sx={{ p: 2, borderRadius: 3, bgcolor: '#fff', border: '1px dashed #e0e0e0', textAlign: 'center' }}>
                <Typography variant="caption" color="text.secondary">No requests in the queue.</Typography>
              </Paper>
            )}
          </Box>
        </MobileShell>
      </Container>
    </ThemeProvider>
  );
}
