import React, { useMemo, useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import {
  CssBaseline, Container, Box, Typography, Paper, Stack, Button, Chip, TextField, IconButton, List, ListItemButton,
  AppBar, Toolbar, BottomNavigation, BottomNavigationAction, Dialog, DialogTitle, DialogContent, DialogActions,
  FormControl, Select, MenuItem
} from '@mui/material';
import Divider from '@mui/material/Divider';
import QrCode2RoundedIcon from '@mui/icons-material/QrCode2Rounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import LinkRoundedIcon from '@mui/icons-material/LinkRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import EvStationIcon from '@mui/icons-material/EvStation';
import HistoryIcon from '@mui/icons-material/History';
import AccountBalanceWalletRoundedIcon from '@mui/icons-material/AccountBalanceWalletRounded';
import SupportAgentRoundedIcon from '@mui/icons-material/SupportAgentRounded';

const theme = createTheme({ palette: { primary: { main: '#03cd8c' }, secondary: { main: '#f77f00' }, background: { default: '#f2f2f2' } }, shape: { borderRadius: 14 }, typography: { fontFamily: 'Inter, Roboto, Arial, sans-serif' } });

function MobileShell({ title, tagline, onBack, onHelp, navValue, onNavChange, footer, children }) {
  const handleBack = () => { if (onBack) return onBack(); console.info('Navigate to: 09 — Access & Permissions (Mobile, React + MUI, JS)'); };
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

function PassRow({ p, onRevoke, onShowQR, onCopy }) {
  return (
    <Paper elevation={0} sx={{ p: 1.25, borderRadius: 3, bgcolor: '#fff', border: '1px solid #eef3f1' }}>
      <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
        <Box>
          <Typography variant="subtitle2" fontWeight={700}>{p.label}</Typography>
          <Typography variant="caption" color="text.secondary">{p.code} • {p.expires}</Typography>
          <Stack direction="row" spacing={1} sx={{ mt: 0.5, flexWrap: 'wrap' }}>
            <Chip size="small" label={p.scope} />
            <Chip size="small" label={p.method.join(', ')} />
            <Chip size="small" label={p.status} color={p.status === 'Active' ? 'success' : 'default'} />
          </Stack>
        </Box>
        <Stack direction="row" spacing={0.5}>
          <IconButton size="small" aria-label="Show QR" onClick={() => onShowQR && onShowQR(p)}><QrCode2RoundedIcon /></IconButton>
          <IconButton size="small" aria-label="Copy link" onClick={() => onCopy && onCopy(p)}><LinkRoundedIcon /></IconButton>
          <IconButton size="small" aria-label="Revoke" color="error" onClick={() => onRevoke && onRevoke(p)}><DeleteOutlineRoundedIcon /></IconButton>
        </Stack>
      </Stack>
    </Paper>
  );
}

export default function GuestPassAccess({ onBack, onHelp, onNavChange, onCreate, onRevoke, onCopy, onShowQR }) {
  const [navValue, setNavValue] = useState(1);
  const chargers = useMemo(() => ([{ id: 'st1', name: 'Home Charger' }, { id: 'st2', name: 'Office Charger' }]), []);
  const [chargerId, setChargerId] = useState('st1');
  const [label, setLabel] = useState('Visitor pass');
  const [expires, setExpires] = useState('');
  const [scope, setScope] = useState('Station');
  const [method, setMethod] = useState(['App','QR']);
  const [qrOpen, setQrOpen] = useState(false);
  const [activeQR, setActiveQR] = useState(null);

  const passes = useMemo(() => ({
    st1: [
      { id: 'gp1', label: 'Contractor (AM)', code: 'EVZ-GP-7F3A', expires: '2025-10-31 12:00', scope: 'Station', method: ['App','QR'], status: 'Active' }
    ],
    st2: [
      { id: 'gp2', label: 'Guest (Weekend)', code: 'EVZ-GP-1B9D', expires: '2025-10-20 20:00', scope: 'Connector 2', method: ['QR'], status: 'Revoked' }
    ]
  }), []);

  const Footer = (
    <Box sx={{ px: 2, pb: 'calc(12px + env(safe-area-inset-bottom))', pt: 1.5, background: '#f2f2f2', borderTop: '1px solid #e9eceb' }}>
      <Button fullWidth variant="contained" color="secondary" onClick={() => (onCreate ? onCreate({ chargerId, label, expires, scope, method }) : console.info('Create pass'))}
        sx={{ color: 'common.white', '&:hover': { bgcolor: 'secondary.dark', color: 'common.white' } }}>Create pass</Button>
    </Box>
  );

  const showQR = (p) => { setActiveQR(p); setQrOpen(true); onShowQR && onShowQR(p); };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="xs" disableGutters>
        <MobileShell title="Guest pass & access codes" tagline="time‑bound passes • QR/link" onBack={onBack} onHelp={onHelp} navValue={navValue} onNavChange={(v)=>{setNavValue(v); onNavChange&&onNavChange(v);}} footer={Footer}>
          <Box sx={{ px: 2, pt: 2 }}>

            {/* Charger selector */}
            <Paper elevation={0} sx={{ p: 2, borderRadius: 3, bgcolor: '#fff', border: '1px solid #eef3f1', mb: 2 }}>
              <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1 }}>My chargers</Typography>
              <FormControl size="small" fullWidth>
                <Select value={chargerId} onChange={(e)=>setChargerId(e.target.value)}>
                  {chargers.map(ch => <MenuItem key={ch.id} value={ch.id}>{ch.name}</MenuItem>)}
                </Select>
              </FormControl>
            </Paper>

            {/* Create */}
            <Paper elevation={0} sx={{ p: 2, borderRadius: 3, bgcolor: '#fff', border: '1px solid #eef3f1' }}>
              <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1 }}>Create time‑bound pass</Typography>
              <Stack spacing={1}>
                <TextField label="Label" value={label} onChange={(e)=>setLabel(e.target.value)} fullWidth />
                <TextField label="Expires" type="datetime-local" InputLabelProps={{ shrink: true }} value={expires} onChange={(e)=>setExpires(e.target.value)} fullWidth />
                <TextField label="Scope (e.g., Station / Connector 2)" value={scope} onChange={(e)=>setScope(e.target.value)} fullWidth />
                <Stack direction="row" spacing={1}>
                  {['App','QR','RFID'].map(m => (
                    <Chip key={m} label={m} clickable color={method.includes(m) ? 'secondary' : 'default'} onClick={()=>setMethod(prev => prev.includes(m) ? prev.filter(x=>x!==m) : [...prev, m])} />
                  ))}
                </Stack>
              </Stack>
            </Paper>

            {/* Existing passes */}
            <Paper elevation={0} sx={{ p: 2, mt: 2, borderRadius: 3, bgcolor: '#fff', border: '1px solid #eef3f1' }}>
              <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1 }}>Existing passes</Typography>
              <List sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {(passes[chargerId] || []).map(p => (
                  <ListItemButton key={p.id} sx={{ p: 0 }}>
                    <PassRow p={p} onRevoke={onRevoke} onShowQR={showQR} onCopy={onCopy} />
                  </ListItemButton>
                ))}
              </List>
            </Paper>

            {/* Usage logs */}
            <Paper elevation={0} sx={{ p: 2, mt: 2, borderRadius: 3, bgcolor: '#fff', border: '1px solid #eef3f1', mb: 2 }}>
              <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1 }}>Usage logs</Typography>
              <Stack spacing={0.5}>
                <Typography variant="body2">2025-10-18 10:21 — EVZ-GP-7F3A — Connector 2 — Success</Typography>
                <Typography variant="body2">2025-10-15 18:10 — EVZ-GP-1B9D — Station — Revoked</Typography>
              </Stack>
            </Paper>
          </Box>
        </MobileShell>

        {/* QR Dialog */}
        <Dialog open={qrOpen} onClose={()=>setQrOpen(false)} fullWidth>
          <DialogTitle>Pass QR — {activeQR?.label}</DialogTitle>
          <DialogContent>
            <Stack spacing={1} alignItems="center" sx={{ py: 2 }}>
              <QrCode2RoundedIcon sx={{ fontSize: 96, color: 'primary.main' }} />
              <Typography variant="caption" color="text.secondary">Share this code or tap copy link to send a deep link.</Typography>
              <Stack direction="row" spacing={1}>
                <Button size="small" startIcon={<ContentCopyRoundedIcon />} onClick={()=>console.info('Copy deep link')}>Copy link</Button>
                <Button size="small" startIcon={<VisibilityRoundedIcon />} onClick={()=>console.info('Preview link')}>Preview</Button>
              </Stack>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={()=>setQrOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      </Container>
    </ThemeProvider>
  );
}
