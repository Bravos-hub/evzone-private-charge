import React, { useMemo, useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import {
  CssBaseline, Container, Box, Typography, Paper, Stack, Button, IconButton,
  AppBar, Toolbar, BottomNavigation, BottomNavigationAction, FormControl, Select, MenuItem, TextField,
  List, ListItemButton, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import FileDownloadRoundedIcon from '@mui/icons-material/FileDownloadRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import EvStationIcon from '@mui/icons-material/EvStation';
import HistoryIcon from '@mui/icons-material/History';
import AccountBalanceWalletRoundedIcon from '@mui/icons-material/AccountBalanceWalletRounded';
import SupportAgentRoundedIcon from '@mui/icons-material/SupportAgentRounded';

const theme = createTheme({ palette: { primary: { main: '#03cd8c' }, secondary: { main: '#f77f00' }, background: { default: '#f2f2f2' } }, shape: { borderRadius: 7 }, typography: { fontFamily: 'Inter, Roboto, Arial, sans-serif' } });

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

function AuditRow({ a, onOpen }) {
  return (
    <Paper elevation={0} sx={{ p: 1.25, borderRadius: 1.5, bgcolor: '#fff', border: '1px solid #eef3f1' }}>
      <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
        <Box>
          <Typography variant="subtitle2" fontWeight={700}>{a.action}</Typography>
          <Typography variant="caption" color="text.secondary">{a.time} • {a.user} • IP {a.ip}</Typography>
        </Box>
        <IconButton size="small" onClick={() => onOpen && onOpen(a)} aria-label="Open"><VisibilityRoundedIcon /></IconButton>
      </Stack>
    </Paper>
  );
}

export default function AuditCommandLog({
  chargers = [{ id: 'st1', name: 'Home Charger' }, { id: 'st2', name: 'Office Charger' }],
  defaultChargerId = 'st1',
  onBack, onHelp, onNavChange,
  onExportAudit,
  onOpenEntry
}) {
  const [navValue, setNavValue] = useState(1);
  const [chargerId, setChargerId] = useState(defaultChargerId);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [query, setQuery] = useState('');
  const initial = useMemo(() => ({
    st1: [
      { id: 'a1', time: '2025-10-18 14:22', user: 'Robert', action: 'Unlock connector 1', ip: '203.0.113.1' },
      { id: 'a2', time: '2025-10-18 14:30', user: 'Albert', action: 'Start session', ip: '203.0.113.2' }
    ],
    st2: [
      { id: 'b1', time: '2025-10-12 09:10', user: 'Robert', action: 'Reboot charger', ip: '203.0.113.3' }
    ]
  }), []);

  const all = initial[chargerId] || [];
  const filtered = all.filter(a => (
    (!from || a.time >= from) && (!to || a.time <= to) && (!query || a.action.toLowerCase().includes(query.toLowerCase()))
  ));

  const Footer = (
    <Box sx={{ px: 2, pb: 'calc(12px + env(safe-area-inset-bottom))', pt: 1.5, background: '#f2f2f2', borderTop: '1px solid #e9eceb' }}>
      <Stack direction="row" spacing={1}>
        <TextField size="small" placeholder="Search" value={query} onChange={(e)=>setQuery(e.target.value)} sx={{ bgcolor: '#fff', borderRadius: 1, flex: 1 }} />
        <TextField size="small" type="date" label="From" InputLabelProps={{ shrink: true }} value={from} onChange={(e)=>setFrom(e.target.value)} sx={{ bgcolor: '#fff', borderRadius: 1 }} />
        <TextField size="small" type="date" label="To" InputLabelProps={{ shrink: true }} value={to} onChange={(e)=>setTo(e.target.value)} sx={{ bgcolor: '#fff', borderRadius: 1 }} />
        <Button variant="contained" color="secondary" startIcon={<FileDownloadRoundedIcon />} onClick={() => (onExportAudit ? onExportAudit({ chargerId, from, to, query, count: filtered.length }) : console.info('Export CSV', { chargerId }))}
          sx={{ color: 'common.white', '&:hover': { bgcolor: 'secondary.dark', color: 'common.white' } }}>Export</Button>
      </Stack>
    </Box>
  );

  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(null);
  const openEntry = (a) => { setActive(a); setOpen(true); onOpenEntry && onOpenEntry({ chargerId, entry: a }); };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="xs" disableGutters>
        <MobileShell title="Audit & command log" tagline="who • what • when • where" onBack={onBack} onHelp={onHelp} navValue={navValue} onNavChange={(v)=>{ setNavValue(v); onNavChange&&onNavChange(v); }} footer={Footer}>
          <Box sx={{ px: 2, pt: 2 }}>
            {/* Charger selector */}
            <Paper elevation={0} sx={{ p: 2, borderRadius: 1.5, bgcolor: '#fff', border: '1px solid #eef3f1', mb: 2 }}>
              <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1 }}>My chargers</Typography>
              <FormControl size="small" fullWidth>
                <Select value={chargerId} onChange={(e)=>setChargerId(e.target.value)}>
                  {chargers.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                </Select>
              </FormControl>
            </Paper>

            <List sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {filtered.map(a => (
                <ListItemButton key={a.id} sx={{ p: 0 }} onClick={()=>openEntry(a)}>
                  <AuditRow a={a} onOpen={openEntry} />
                </ListItemButton>
              ))}
            </List>

            {!filtered.length && (
              <Paper elevation={0} sx={{ p: 2, borderRadius: 1.5, bgcolor: '#fff', border: '1px dashed #e0e0e0', textAlign: 'center' }}>
                <Typography variant="caption" color="text.secondary">No entries for the selected filters.</Typography>
              </Paper>
            )}
          </Box>
        </MobileShell>

        <Dialog open={open} onClose={()=>setOpen(false)} fullWidth>
          <DialogTitle>Entry detail</DialogTitle>
          <DialogContent>
            {active ? (
              <Stack spacing={0.5}>
                <Typography variant="body2"><strong>Action:</strong> {active.action}</Typography>
                <Typography variant="body2"><strong>Time:</strong> {active.time}</Typography>
                <Typography variant="body2"><strong>User:</strong> {active.user}</Typography>
                <Typography variant="body2"><strong>IP:</strong> {active.ip}</Typography>
              </Stack>
            ) : null}
          </DialogContent>
          <DialogActions>
            <Button onClick={()=>setOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      </Container>
    </ThemeProvider>
  );
}
