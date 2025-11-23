import React, { useState, useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import {
  CssBaseline, Container, Box, Typography, Paper, Stack, Button, TextField, Chip, Slider, Switch, FormControlLabel,
  AppBar, Toolbar, BottomNavigation, BottomNavigationAction, IconButton
} from '@mui/material';
import Divider from '@mui/material/Divider';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import EvStationIcon from '@mui/icons-material/EvStation';
import HistoryIcon from '@mui/icons-material/History';
import AccountBalanceWalletRoundedIcon from '@mui/icons-material/AccountBalanceWalletRounded';
import SupportAgentRoundedIcon from '@mui/icons-material/SupportAgentRounded';

const theme = createTheme({
  palette: { primary: { main: '#03cd8c' }, secondary: { main: '#f77f00' }, background: { default: '#f2f2f2' } },
  shape: { borderRadius: 7 },
  typography: { fontFamily: 'Inter, Roboto, Arial, sans-serif' }
});

function MobileShell({ title, tagline, onBack, onHelp, navValue, onNavChange, footer, children }) {
  const handleBack = () => { if (onBack) return onBack(); console.info('Navigate to: 20 — Charge Schedules (Mobile, React + MUI, JS)'); };
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

function DayChips({ value, onChange }) {
  const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  return (
    <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
      {days.map((d) => (
        <Chip key={d} label={d} clickable color={value.includes(d) ? 'secondary' : 'default'} onClick={() => onChange(d)} />
      ))}
    </Stack>
  );
}

export default function ScheduleEditor({
  onBack,
  onHelp,
  onNavChange,
  onSave,
  onCancel,
  onDelete,
  mode = 'create', // 'create' | 'edit'
  initial = { name: '', start: '22:00', end: '06:00', target: 90, days: ['Mon','Tue','Wed','Thu','Fri'], enabled: true },
}) {
  const [navValue, setNavValue] = useState(1);
  const [form, setForm] = useState(initial);

  // Dev checks (console-only)
  useEffect(() => {
    const rows = [];
    const ok = (t, c) => rows.push({ test: t, pass: !!c });
    ok('target is number', typeof form.target === 'number' || !isNaN(Number(form.target)));
    ok('days array not empty', Array.isArray(form.days) && form.days.length > 0);
    console.table(rows);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // once

  const Footer = (
    <Box sx={{ px: 2, pb: 'calc(12px + env(safe-area-inset-bottom))', pt: 1.5, background: '#f2f2f2', borderTop: '1px solid #e9eceb' }}>
      <Stack direction="row" spacing={1}>
        <Button
          variant="outlined"
          startIcon={<CancelRoundedIcon />}
          onClick={() => (onCancel ? onCancel() : console.info('Cancel editor'))}
          sx={{ '&:hover': { bgcolor: 'secondary.main', color: 'common.white', borderColor: 'secondary.main' } }}
        >
          Cancel
        </Button>
        {mode === 'edit' && (
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteOutlineRoundedIcon />}
            onClick={() => (onDelete ? onDelete(form) : console.info('Delete schedule'))}
          >
            Delete
          </Button>
        )}
        <Button
          variant="contained"
          color="secondary"
          startIcon={<SaveRoundedIcon />}
          onClick={() => (onSave ? onSave(form) : console.info('Save schedule'))}
          sx={{ ml: 'auto', color: 'common.white', '&:hover': { bgcolor: 'secondary.dark', color: 'common.white' } }}
        >
          Save
        </Button>
      </Stack>
    </Box>
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="xs" disableGutters>
        <MobileShell
          title={mode === 'edit' ? 'Edit schedule' : 'Create schedule'}
          tagline="times • target SoC • days"
          onBack={onBack}
          onHelp={onHelp}
          navValue={navValue}
          onNavChange={(v) => { setNavValue(v); onNavChange && onNavChange(v); }}
          footer={Footer}
        >
          <Box sx={{ px: 2, pt: 2 }}>
            <Paper elevation={0} sx={{ p: 2, borderRadius: 1.5, bgcolor: '#fff', border: '1px solid #eef3f1' }}>
              <TextField
                label="Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                fullWidth
                sx={{ mb: 1.5 }}
              />

              <Stack direction="row" spacing={1.25} sx={{ mb: 1.5 }}>
                <TextField label="Start" type="time" value={form.start} onChange={(e) => setForm({ ...form, start: e.target.value })} fullWidth />
                <TextField label="End" type="time" value={form.end} onChange={(e) => setForm({ ...form, end: e.target.value })} fullWidth />
              </Stack>

              <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.5 }}>Target state of charge</Typography>
              <Slider
                min={50}
                max={100}
                step={1}
                value={Number(form.target)}
                onChange={(_, v) => {
                  const val = Array.isArray(v) ? v[0] : v;
                  setForm({ ...form, target: Number(val) });
                }}
                valueLabelDisplay="on"
                sx={{ mb: 1.5 }}
              />

              <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.5 }}>Days</Typography>
              <DayChips
                value={form.days}
                onChange={(d) =>
                  setForm({
                    ...form,
                    days: form.days.includes(d) ? form.days.filter((x) => x !== d) : [...form.days, d]
                  })
                }
              />

              <FormControlLabel
                control={<Switch checked={!!form.enabled} onChange={(e) => setForm({ ...form, enabled: e.target.checked })} />}
                label="Enabled"
                sx={{ mt: 1.5 }}
              />

              <Divider sx={{ my: 1.5 }} />

              <Stack direction="row" spacing={1}>
                <Chip size="small" icon={<AccessTimeRoundedIcon />} label={`${form.start} → ${form.end}`} />
                <Chip size="small" icon={<BoltRoundedIcon />} label={`Target ${form.target}%`} />
                <Chip size="small" label={form.days.join(', ')} />
              </Stack>
            </Paper>
          </Box>
        </MobileShell>
      </Container>
    </ThemeProvider>
  );
}

/**
 * Usage examples
 * <ScheduleEditor onSave={(s)=>console.log('save', s)} />
 * <ScheduleEditor mode="edit" initial={{ name: 'Weekdays night', start: '22:00', end: '06:00', target: 90, days: ['Mon','Tue','Wed','Thu','Fri'], enabled: true }} />
 * // Edge case test: disabled schedule & weekend-only
 * <ScheduleEditor mode="edit" initial={{ name: 'Weekend early', start: '06:00', end: '08:00', target: 80, days: ['Sat','Sun'], enabled: false }} />
 */
