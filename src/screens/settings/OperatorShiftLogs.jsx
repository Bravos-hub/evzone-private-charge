import React, { useMemo, useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import {
  CssBaseline, Container, Box, Typography, Paper, Stack, Button, Chip, IconButton,
  AppBar, Toolbar, BottomNavigation, BottomNavigationAction, FormControl, Select, MenuItem, TextField,
  List, ListItemButton, Checkbox, FormControlLabel
} from '@mui/material';
import Divider from '@mui/material/Divider';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import StopRoundedIcon from '@mui/icons-material/StopRounded';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import AssignmentTurnedInRoundedIcon from '@mui/icons-material/AssignmentTurnedInRounded';
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

function TaskRow({ t, onToggle }) {
  return (
    <Paper elevation={0} sx={{ p: 1, borderRadius: 2, bgcolor: '#fff', border: '1px solid #eef3f1' }}>
      <FormControlLabel control={<Checkbox checked={t.done} onChange={()=>onToggle&&onToggle(t)} />} label={t.title} />
    </Paper>
  );
}

export default function OperatorShiftLogs({
  chargers = [{ id: 'st1', name: 'Home Charger' }, { id: 'st2', name: 'Office Charger' }],
  defaultChargerId = 'st1',
  onBack, onHelp, onNavChange,
  onStartShift, onEndShift, onSaveDraft,
  // NEW: open 40
  onOpenAuditLog
}) {
  const [navValue, setNavValue] = useState(1);
  const [chargerId, setChargerId] = useState(defaultChargerId);
  const [started, setStarted] = useState(false);
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('17:00');
  const [outgoing, setOutgoing] = useState('');
  const [incoming, setIncoming] = useState('');
  const [kpi, setKpi] = useState({ sessions: 0, kwh: 0, revenue: 0, faults: 0 });
  const [tasks, setTasks] = useState([
    { id: 't1', title: 'Check connectors', done: false },
    { id: 't2', title: 'Verify network', done: false },
    { id: 't3', title: 'Clean area', done: false },
  ]);
  const [attachAudit, setAttachAudit] = useState(true);

  const toggleTask = (t) => setTasks(prev => prev.map(x => x.id===t.id ? { ...x, done: !x.done } : x));

  const Footer = (
    <Box sx={{ px: 2, pb: 'calc(12px + env(safe-area-inset-bottom))', pt: 1.5, background: '#f2f2f2', borderTop: '1px solid #e9eceb' }}>
      <Stack direction="row" spacing={1}>
        {!started ? (
          <Button variant="outlined" startIcon={<PlayArrowRoundedIcon />} onClick={()=>{ setStarted(true); onStartShift ? onStartShift({ chargerId, start: startTime }) : console.info('Start shift', startTime); }}
            sx={{ '&:hover': { bgcolor: 'secondary.main', color: 'common.white', borderColor: 'secondary.main' } }}>Start shift</Button>
        ) : (
          <Button variant="outlined" color="error" startIcon={<StopRoundedIcon />} onClick={()=>{ setStarted(false); onEndShift ? onEndShift({ chargerId, end: endTime, outgoing, incoming, tasks, kpi, attachAudit }) : console.info('End shift'); }}>
            End & submit
          </Button>
        )}
        <Button variant="contained" color="secondary" startIcon={<SaveRoundedIcon />} onClick={()=> (onSaveDraft ? onSaveDraft({ chargerId, outgoing, incoming, tasks, kpi }) : console.info('Save draft'))}
          sx={{ ml: 'auto', color: 'common.white', '&:hover': { bgcolor: 'secondary.dark', color: 'common.white' } }}>Save draft</Button>
      </Stack>
    </Box>
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="xs" disableGutters>
        <MobileShell title="Operator shift logs" tagline="handover • checklist • KPIs" onBack={onBack} onHelp={onHelp} navValue={navValue} onNavChange={(v)=>{ setNavValue(v); onNavChange&&onNavChange(v); }} footer={Footer}>
          <Box sx={{ px: 2, pt: 2 }}>
            {/* Charger selector */}
            <Paper elevation={0} sx={{ p: 2, borderRadius: 3, bgcolor: '#fff', border: '1px solid #eef3f1', mb: 2 }}>
              <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1 }}>For charger</Typography>
              <FormControl size="small" fullWidth>
                <Select value={chargerId} onChange={(e)=>setChargerId(e.target.value)}>
                  {chargers.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                </Select>
              </FormControl>
            </Paper>

            {/* Times & KPIs */}
            <Paper elevation={0} sx={{ p: 2, borderRadius: 3, bgcolor: '#fff', border: '1px solid #eef3f1' }}>
              <Stack direction="row" spacing={1}>
                <TextField label="Start" type="time" value={startTime} onChange={(e)=>setStartTime(e.target.value)} sx={{ flex: 1 }} />
                <TextField label="End" type="time" value={endTime} onChange={(e)=>setEndTime(e.target.value)} sx={{ flex: 1 }} />
              </Stack>
              <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                <TextField label="Sessions" type="number" value={kpi.sessions} onChange={(e)=>setKpi(k=>({ ...k, sessions: Number(e.target.value)||0 }))} sx={{ width: 110 }} />
                <TextField label="kWh" type="number" value={kpi.kwh} onChange={(e)=>setKpi(k=>({ ...k, kwh: Number(e.target.value)||0 }))} sx={{ width: 110 }} />
                <TextField label="Revenue (UGX)" type="number" value={kpi.revenue} onChange={(e)=>setKpi(k=>({ ...k, revenue: Number(e.target.value)||0 }))} sx={{ width: 160 }} />
                <TextField label="Faults" type="number" value={kpi.faults} onChange={(e)=>setKpi(k=>({ ...k, faults: Number(e.target.value)||0 }))} sx={{ width: 110 }} />
              </Stack>
            </Paper>

            {/* Tasks */}
            <Paper elevation={0} sx={{ mt: 2, p: 2, borderRadius: 3, bgcolor: '#fff', border: '1px solid #eef3f1' }}>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                <AssignmentTurnedInRoundedIcon />
                <Typography variant="subtitle2" fontWeight={800}>Tasks</Typography>
              </Stack>
              <Stack spacing={0.75}>
                {tasks.map(t => (
                  <TaskRow key={t.id} t={t} onToggle={toggleTask} />
                ))}
              </Stack>
            </Paper>

            {/* Notes & audit */}
            <Paper elevation={0} sx={{ mt: 2, p: 2, borderRadius: 3, bgcolor: '#fff', border: '1px solid #eef3f1', mb: 2 }}>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                <TrendingUpRoundedIcon />
                <Typography variant="subtitle2" fontWeight={800}>Handover notes</Typography>
              </Stack>
              <TextField label="Outgoing notes" value={outgoing} onChange={(e)=>setOutgoing(e.target.value)} fullWidth multiline rows={3} sx={{ mb: 1 }} />
              <TextField label="Incoming notes" value={incoming} onChange={(e)=>setIncoming(e.target.value)} fullWidth multiline rows={3} />
              <FormControlLabel control={<Checkbox checked={attachAudit} onChange={(e)=>setAttachAudit(e.target.checked)} />} label="Attach audit logs" />
              <Button size="small" variant="outlined" onClick={()=> (onOpenAuditLog ? onOpenAuditLog({ chargerId }) : console.info('Navigate to: 40 — Audit & command log'))}
                sx={{ mt: 1, '&:hover': { bgcolor: 'secondary.main', color: 'common.white', borderColor: 'secondary.main' } }}>
                Open audit log (40)
              </Button>
            </Paper>
          </Box>
        </MobileShell>
      </Container>
    </ThemeProvider>
  );
}
