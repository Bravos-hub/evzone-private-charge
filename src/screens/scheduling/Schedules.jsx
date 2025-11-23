import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import {
  CssBaseline, Container, Box, Typography, Paper, Stack, Button, IconButton, Switch, FormControlLabel,
  List, ListItemButton, Chip
} from '@mui/material';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import AddCircleOutlineRoundedIcon from '@mui/icons-material/AddCircleOutlineRounded';
import MobileShell from '../../components/layout/MobileShell';

const theme = createTheme({ palette: { primary: { main: '#03cd8c' }, secondary: { main: '#f77f00' }, background: { default: '#f2f2f2' } }, shape: { borderRadius: 7 }, typography: { fontFamily: 'Inter, Roboto, Arial, sans-serif' } });

function ScheduleRow({ s, onEdit, onToggle, onDelete }) {
  return (
    <Paper elevation={0} sx={{ p: 1.25, borderRadius: 1.5, bgcolor: '#fff', border: '1px solid #eef3f1' }}>
      <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
        <Box>
          <Typography variant="subtitle2" fontWeight={700}>{s.name}</Typography>
          <Stack direction="row" spacing={1} sx={{ mt: 0.5, flexWrap: 'wrap' }}>
            <Chip size="small" icon={<AccessTimeRoundedIcon />} label={`${s.start} → ${s.end}`} />
            <Chip size="small" icon={<BoltRoundedIcon />} label={`Target ${s.target}%`} />
            <Chip size="small" label={s.days.join(', ')} />
          </Stack>
        </Box>
        <Stack direction="row" spacing={0.5}>
          <IconButton size="small" onClick={() => (onEdit ? onEdit(s) : console.info('Navigate to: 23 — Schedule Editor (Mobile, React + MUI, JS) [edit]'))} aria-label="Edit"><EditRoundedIcon /></IconButton>
          <IconButton size="small" onClick={() => onDelete && onDelete(s)} aria-label="Delete"><DeleteOutlineRoundedIcon /></IconButton>
          <FormControlLabel control={<Switch checked={s.enabled} onChange={() => onToggle && onToggle(s)} />} label={s.enabled ? 'On' : 'Off'} />
        </Stack>
      </Stack>
    </Paper>
  );
}

export default function ChargeSchedules({ onBack, onHelp, onNavChange, onSave, onAdd, onEdit, onToggle, onDelete }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [navValue, setNavValue] = useState(2); // Sessions tab index
  const routes = useMemo(() => ['/', '/chargers', '/sessions', '/wallet', '/settings'], []);

  useEffect(() => {
    const pathIndex = routes.findIndex(route => location.pathname === route || location.pathname.startsWith(route + '/'));
    if (pathIndex !== -1) {
      setNavValue(pathIndex);
    }
  }, [location.pathname, routes]);

  const handleNavChange = useCallback((value) => {
    setNavValue(value);
    if (routes[value] !== undefined) {
      navigate(routes[value]);
    }
    if (onNavChange) onNavChange(value);
  }, [navigate, routes, onNavChange]);

  const handleBack = useCallback(() => {
    if (onBack) {
      onBack();
    } else {
      navigate('/chargers');
    }
  }, [navigate, onBack]);

  const [schedules] = useState([
    { id: '1', name: 'Weekdays night', start: '22:00', end: '06:00', target: 90, days: ['Mon','Tue','Wed','Thu','Fri'], enabled: true },
    { id: '2', name: 'Weekend morning', start: '07:00', end: '09:00', target: 80, days: ['Sat','Sun'], enabled: false }
  ]);

  const Footer = (
    <Box sx={{ px: 2, pb: 'calc(12px + env(safe-area-inset-bottom))', pt: 1.5, background: '#f2f2f2', borderTop: '1px solid #e9eceb' }}>
      <Stack direction="row" spacing={1}>
        <Button variant="outlined" startIcon={<AddCircleOutlineRoundedIcon />} onClick={() => (onAdd ? onAdd() : console.info('Navigate to: 23 — Schedule Editor (Mobile, React + MUI, JS) [create]'))}
          sx={{ '&:hover': { bgcolor: 'secondary.main', color: 'common.white', borderColor: 'secondary.main' } }}>Add schedule</Button>
        <Button variant="contained" color="secondary" onClick={() => (onSave ? onSave(schedules) : console.info('Save schedules'))}
          sx={{ ml: 'auto', color: 'common.white', '&:hover': { bgcolor: 'secondary.dark', color: 'common.white' } }}>Save all</Button>
      </Stack>
    </Box>
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="xs" disableGutters>
        <MobileShell title="Charge schedules" tagline="automate off‑peak charging" onBack={handleBack} onHelp={onHelp} navValue={navValue} onNavChange={handleNavChange} footer={Footer}>
          <Box>
            <List sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {schedules.map(s => (
                <ListItemButton key={s.id} sx={{ p: 0 }} onClick={() => (onEdit ? onEdit(s) : console.info('Navigate to: 23 — Schedule Editor (Mobile, React + MUI, JS) [edit]'))}>
                  <ScheduleRow s={s} onEdit={onEdit} onToggle={onToggle} onDelete={onDelete} />
                </ListItemButton>
              ))}
            </List>
          </Box>
        </MobileShell>
      </Container>
    </ThemeProvider>
  );
}
