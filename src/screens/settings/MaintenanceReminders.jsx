import React, { useMemo, useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import {
  CssBaseline, Container, Box, Typography, Paper, Stack, Button, IconButton,
  AppBar, Toolbar, BottomNavigation, BottomNavigationAction, FormControl, Select, MenuItem, TextField,
  Dialog, DialogTitle, DialogContent, DialogActions, List, ListItemButton, Checkbox
} from '@mui/material';
import EventAvailableRoundedIcon from '@mui/icons-material/EventAvailableRounded';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
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

function ReminderRow({ r, onToggle, onDelete }) {
  return (
    <Paper elevation={0} sx={{ p: 1.25, borderRadius: 1.5, bgcolor: '#fff', border: '1px solid #eef3f1' }}>
      <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
        <Stack direction="row" spacing={1} alignItems="center">
          <Checkbox checked={r.done} onChange={() => onToggle(r)} />
          <Box>
            <Typography variant="subtitle2" fontWeight={700}>{r.title}</Typography>
            <Typography variant="caption" color="text.secondary">{r.when} • {r.kind}</Typography>
          </Box>
        </Stack>
        <IconButton size="small" color="error" onClick={() => onDelete(r)} aria-label="Delete"><DeleteOutlineIcon /></IconButton>
      </Stack>
    </Paper>
  );
}

export default function MaintenanceReminders({
  chargers = [{ id: 'st1', name: 'Home Charger' }, { id: 'st2', name: 'Office Charger' }],
  defaultChargerId = 'st1',
  onBack, onHelp, onNavChange,
  onSaveReminders, onExportCalendar
}) {
  const [navValue, setNavValue] = useState(1);
  const [chargerId, setChargerId] = useState(defaultChargerId);
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ title: '', when: '', kind: 'Inspection' });

  const initial = useMemo(() => ({
    st1: [ { id: 'r1', title: 'Filter change', when: '2025-11-01 10:00', kind: 'Filter', done: false } ],
    st2: [ { id: 'r2', title: 'Safety inspection', when: '2025-11-05 09:00', kind: 'Inspection', done: false } ]
  }), []);
  const [byCharger, setByCharger] = useState(initial);
  const reminders = byCharger[chargerId] || [];

  const addReminder = () => {
    const r = { id: `r${Date.now()}`, ...form, done: false };
    setByCharger(prev => ({ ...prev, [chargerId]: [...(prev[chargerId]||[]), r] }));
    setAddOpen(false); setForm({ title: '', when: '', kind: 'Inspection' });
  };
  const toggle = (r) => setByCharger(prev => ({ ...prev, [chargerId]: (prev[chargerId]||[]).map(x => x.id===r.id ? { ...x, done: !x.done } : x) }));
  const removeR = (r) => setByCharger(prev => ({ ...prev, [chargerId]: (prev[chargerId]||[]).filter(x => x.id!==r.id) }));

  const Footer = (
    <Box sx={{ px: 2, pb: 'calc(12px + env(safe-area-inset-bottom))', pt: 1.5, background: '#f2f2f2', borderTop: '1px solid #e9eceb' }}>
      <Stack direction="row" spacing={1}>
        <Button variant="outlined" startIcon={<EventAvailableRoundedIcon />} onClick={() => (onExportCalendar ? onExportCalendar({ chargerId, reminders }) : console.info('Export calendar', chargerId))}
          sx={{ '&:hover': { bgcolor: 'secondary.main', color: 'common.white', borderColor: 'secondary.main' } }}>Export calendar</Button>
        <Button variant="contained" color="secondary" startIcon={<AddCircleOutlineIcon />} onClick={() => setAddOpen(true)}
          sx={{ color: 'common.white', '&:hover': { bgcolor: 'secondary.dark', color: 'common.white' } }}>Add reminder</Button>
        <Button variant="contained" color="secondary" onClick={() => (onSaveReminders ? onSaveReminders({ chargerId, reminders }) : console.info('Save reminders', { chargerId }))}
          sx={{ ml: 'auto', color: 'common.white', '&:hover': { bgcolor: 'secondary.dark', color: 'common.white' } }}>Save</Button>
      </Stack>
    </Box>
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="xs" disableGutters>
        <MobileShell title="Maintenance & reminders" tagline="create • schedule • complete" onBack={onBack} onHelp={onHelp} navValue={navValue} onNavChange={(v)=>{ setNavValue(v); onNavChange&&onNavChange(v); }} footer={Footer}>
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

            {/* Reminders list */}
            <List sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {reminders.map(r => (
                <ListItemButton key={r.id} sx={{ p: 0 }}>
                  <ReminderRow r={r} onToggle={toggle} onDelete={removeR} />
                </ListItemButton>
              ))}
            </List>

            {!reminders.length && (
              <Paper elevation={0} sx={{ p: 2, borderRadius: 1.5, bgcolor: '#fff', border: '1px dashed #e0e0e0', textAlign: 'center' }}>
                <Typography variant="caption" color="text.secondary">No reminders yet. Add one below.</Typography>
              </Paper>
            )}
          </Box>
        </MobileShell>

        {/* Add reminder dialog */}
        <Dialog open={addOpen} onClose={()=>setAddOpen(false)} fullWidth>
          <DialogTitle>New reminder</DialogTitle>
          <DialogContent>
            <Stack spacing={1.25} sx={{ pt: 1 }}>
              <TextField label="Title" value={form.title} onChange={(e)=>setForm(f=>({ ...f, title: e.target.value }))} fullWidth />
              <TextField label="When" type="datetime-local" InputLabelProps={{ shrink: true }} value={form.when} onChange={(e)=>setForm(f=>({ ...f, when: e.target.value }))} fullWidth />
              <TextField label="Type" value={form.kind} onChange={(e)=>setForm(f=>({ ...f, kind: e.target.value }))} fullWidth />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={()=>setAddOpen(false)}>Cancel</Button>
            <Button variant="contained" color="secondary" onClick={addReminder} sx={{ color: 'common.white' }}>Add</Button>
          </DialogActions>
        </Dialog>
      </Container>
    </ThemeProvider>
  );
}
