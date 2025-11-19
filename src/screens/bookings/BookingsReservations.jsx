import React, { useMemo, useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import {
  CssBaseline, Container, Box, Typography, Paper, Stack, Button, Chip, IconButton,
  AppBar, Toolbar, BottomNavigation, BottomNavigationAction, FormControl, Select, MenuItem, TextField,
  List, ListItemButton, Dialog, DialogTitle, DialogContent, DialogActions, FormControlLabel, Switch
} from '@mui/material';
import Divider from '@mui/material/Divider';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import EditCalendarRoundedIcon from '@mui/icons-material/EditCalendarRounded';
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

function ResRow({ r, onApprove, onDeny, onReschedule, onOpen, onOpenCalendar }) {
  return (
    <Paper elevation={0} sx={{ p: 1.25, borderRadius: 3, bgcolor: '#fff', border: '1px solid #eef3f1' }}>
      <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
        <Box onClick={() => { onOpen && onOpen(r); onOpenCalendar && onOpenCalendar(r); }} sx={{ cursor: 'pointer' }}>
          <Typography variant="subtitle2" fontWeight={700}>{r.user} — {r.connector}</Typography>
          <Typography variant="caption" color="text.secondary"><AccessTimeRoundedIcon fontSize="inherit"/> {r.start} → {r.end}</Typography>
          <Stack direction="row" spacing={1} sx={{ mt: 0.5, flexWrap: 'wrap' }}>
            <Chip size="small" label={r.status} color={r.status==='Approved' ? 'success' : r.status==='Denied' ? 'default' : 'warning'} />
            {r.paid && <Chip size="small" label="Paid" color="success" />}
          </Stack>
        </Box>
        <Stack direction="row" spacing={0.5}>
          {r.status==='Pending' && <IconButton size="small" color="success" onClick={()=>onApprove&&onApprove(r)} aria-label="Approve"><CheckRoundedIcon/></IconButton>}
          {r.status==='Pending' && <IconButton size="small" color="error" onClick={()=>onDeny&&onDeny(r)} aria-label="Deny"><CloseRoundedIcon/></IconButton>}
          <IconButton size="small" onClick={()=>onReschedule&&onReschedule(r)} aria-label="Reschedule"><EditCalendarRoundedIcon/></IconButton>
        </Stack>
      </Stack>
    </Paper>
  );
}

export default function BookingReservationsWired({
  chargers = [{ id: 'st1', name: 'Home Charger' }, { id: 'st2', name: 'Office Charger' }],
  defaultChargerId = 'st1',
  onBack, onHelp, onNavChange,
  onApprove, onDeny, onReschedule, onOpen,
  onOpenOnCalendar, // → 45 highlight
  onExportReservations, // CSV export
  getPricingSnapshot,       // NEW: async ({ chargerId }) => snapshot
  onCreateSession,          // NEW: ({ chargerId, reservation, pricingSnapshot })
  onOpenPricingForApproval  // NEW: ({ chargerId, reservation })
}) {
  const [navValue, setNavValue] = useState(1);
  const [chargerId, setChargerId] = useState(defaultChargerId);
  const [tab, setTab] = useState('upcoming');
  const [monetized, setMonetized] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [edit, setEdit] = useState(null);
  const [newStart, setNewStart] = useState('');
  const [newEnd, setNewEnd] = useState('');

  const initial = useMemo(() => ({
    st1: {
      upcoming: [
        { id: 'r1', user: 'Lydia', connector: 'Connector 1', date: '2025-11-01', start: '2025-11-01 14:00', end: '15:30', status: 'Pending', paid: false },
        { id: 'r2', user: 'Noah', connector: 'Connector 2', date: '2025-11-02', start: '2025-11-02 09:00', end: '10:00', status: 'Approved', paid: true }
      ],
      past: [
        { id: 'r3', user: 'Amara', connector: 'Connector 1', date: '2025-10-10', start: '2025-10-10 10:00', end: '11:00', status: 'Completed', paid: true }
      ]
    },
    st2: {
      upcoming: [
        { id: 'r4', user: 'Ken', connector: 'Connector 3', date: '2025-11-01', start: '2025-11-01 08:00', end: '09:00', status: 'Pending', paid: false }
      ],
      past: []
    }
  }), []);

  const list = (initial[chargerId] || { upcoming: [], past: [] })[tab] || [];

  const openReschedule = (r) => { setEdit(r); setNewStart(r.start); setNewEnd(r.end); setDialogOpen(true); };
  const saveReschedule = () => {
    if (onReschedule) onReschedule({ chargerId, reservation: edit, start: newStart, end: newEnd });
    else console.info('Reschedule', edit?.id, newStart, newEnd, chargerId);
    setDialogOpen(false);
  };

  const approveReservation = async (r) => {
    if (onApprove) onApprove({ chargerId, reservation: r }); else console.info('Approve', r);
    if (getPricingSnapshot && onCreateSession) {
      try {
        const pricingSnapshot = await getPricingSnapshot({ chargerId });
        onCreateSession({ chargerId, reservation: r, pricingSnapshot });
        return;
      } catch (e) {
        console.info('Pricing snapshot fetch failed; routing to Pricing & Fees', e);
      }
    }
    if (onOpenPricingForApproval) { onOpenPricingForApproval({ chargerId, reservation: r }); return; }
    console.info('Navigate to: 07 — Pricing & Fees (review pricing) or create session');
  };

  const exportCSV = () => {
    const headers = ['id','user','connector','date','start','end','status','paid'];
    const rows = list.map(r => headers.map(h => r[h]));
    const payload = { chargerId, tab, count: list.length, headers, rows };
    if (onExportReservations) onExportReservations(payload);
    else console.info('Export reservations CSV', payload);
  };

  const Footer = (
    <Box sx={{ px: 2, pb: 'calc(12px + env(safe-area-inset-bottom))', pt: 1.5, background: '#f2f2f2', borderTop: '1px solid #e9eceb' }}>
      <Stack direction="row" spacing={1}>
        <Chip label="Upcoming" clickable color={tab==='upcoming'?'secondary':'default'} onClick={()=>setTab('upcoming')} />
        <Chip label="Past" clickable color={tab==='past'?'secondary':'default'} onClick={()=>setTab('past')} />
        <FormControlLabel control={<Switch checked={monetized} onChange={(e)=>setMonetized(e.target.checked)} />} label="Monetized" sx={{ ml: 'auto' }} />
        <Button variant="contained" color="secondary" startIcon={<FileDownloadRoundedIcon />} onClick={exportCSV}
          sx={{ color: 'common.white', '&:hover': { bgcolor: 'secondary.dark', color: 'common.white' } }}>Export</Button>
      </Stack>
    </Box>
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="xs" disableGutters>
        <MobileShell title="Bookings & reservations" tagline="approve • reschedule • monetize" onBack={onBack} onHelp={onHelp} navValue={navValue} onNavChange={(v)=>{ setNavValue(v); onNavChange&&onNavChange(v); }} footer={Footer}>
          <Box sx={{ px: 2, pt: 2 }}>
            {/* Charger selector */}
            <Paper elevation={0} sx={{ p: 2, borderRadius: 3, bgcolor: '#fff', border: '1px solid #eef3f1', mb: 2 }}>
              <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1 }}>My chargers</Typography>
              <FormControl size="small" fullWidth>
                <Select value={chargerId} onChange={(e)=>setChargerId(e.target.value)}>
                  {chargers.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                </Select>
              </FormControl>
            </Paper>

            <List sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {list.map(r => (
                <ListItemButton key={r.id} sx={{ p: 0 }}>
                  <ResRow r={r}
                    onOpen={(x)=> onOpen ? onOpen({ chargerId, reservation: x }) : console.info('Open reservation', x)}
                    onOpenCalendar={(x)=> onOpenOnCalendar ? onOpenOnCalendar({ chargerId, highlight: { date: x.date } }) : console.info('Navigate to: 45 — Schedule Calendars (highlight)', x.date)}
                    onApprove={approveReservation}
                    onDeny={(x)=> onDeny ? onDeny({ chargerId, reservation: x }) : console.info('Deny', x)}
                    onReschedule={openReschedule}
                  />
                </ListItemButton>
              ))}
            </List>

            {!list.length && (
              <Paper elevation={0} sx={{ p: 2, borderRadius: 3, bgcolor: '#fff', border: '1px dashed #e0e0e0', textAlign: 'center' }}>
                <Typography variant="caption" color="text.secondary">No {tab} reservations.</Typography>
              </Paper>
            )}
          </Box>
        </MobileShell>

        {/* Reschedule dialog */}
        <Dialog open={dialogOpen} onClose={()=>setDialogOpen(false)} fullWidth>
          <DialogTitle>Reschedule</DialogTitle>
          <DialogContent>
            <Stack spacing={1.25} sx={{ pt: 1 }}>
              <TextField label="Start" type="datetime-local" InputLabelProps={{ shrink: true }} value={newStart} onChange={(e)=>setNewStart(e.target.value)} fullWidth />
              <TextField label="End" type="datetime-local" InputLabelProps={{ shrink: true }} value={newEnd} onChange={(e)=>setNewEnd(e.target.value)} fullWidth />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={()=>setDialogOpen(false)}>Cancel</Button>
            <Button variant="contained" color="secondary" onClick={saveReschedule} sx={{ color: 'common.white' }}>Save</Button>
          </DialogActions>
        </Dialog>
      </Container>
    </ThemeProvider>
  );
}
