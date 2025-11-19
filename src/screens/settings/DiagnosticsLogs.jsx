import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import {
  CssBaseline, Box, Typography, Paper, Stack, Button, Chip, List, ListItemButton
} from '@mui/material';
import FileDownloadRoundedIcon from '@mui/icons-material/FileDownloadRounded';
import FilterListRoundedIcon from '@mui/icons-material/FilterListRounded';
import MobileShell from '../../components/layout/MobileShell';

const theme = createTheme({ palette: { primary: { main: '#03cd8c' }, secondary: { main: '#f77f00' }, background: { default: '#f2f2f2' } }, shape: { borderRadius: 14 }, typography: { fontFamily: 'Inter, Roboto, Arial, sans-serif' } });

function FaultRow({ f }) {
  const color = f.severity === 'Critical' ? 'error' : f.severity === 'Warning' ? 'warning' : 'default';
  return (
    <Paper elevation={0} sx={{ p: 1.25, borderRadius: 3, bgcolor: '#fff', border: '1px solid #eef3f1' }}>
      <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
        <Box>
          <Typography variant="subtitle2" fontWeight={700}>{f.code} — {f.title}</Typography>
          <Typography variant="caption" color="text.secondary">{f.time}</Typography>
        </Box>
        <Chip size="small" label={f.severity} color={color} />
      </Stack>
    </Paper>
  );
}

export default function DiagnosticsLogs({ onBack, onHelp, onNavChange, onExport, onFilter, onOpenFault }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [navValue, setNavValue] = useState(4);
  const routes = useMemo(() => ['/', '/chargers', '/sessions', '/wallet', '/settings'], []);
  
  // Sync navValue with current route
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
      navigate('/settings');
    }
  }, [navigate, onBack]);
  const [tab, setTab] = useState('faults');
  const faults = [
    { id: 'f1', code: 'E101', title: 'Overcurrent detected', severity: 'Critical', time: '2025-10-18 14:22' },
    { id: 'f2', code: 'W208', title: 'Temperature high', severity: 'Warning', time: '2025-10-15 09:10' }
  ];
  const events = [
    { id: 'e1', title: 'Session started', time: '2025-10-18 14:00' },
    { id: 'e2', title: 'Connector locked', time: '2025-10-18 14:01' }
  ];

  const Footer = (
    <Box sx={{ px: 2, pb: 'calc(12px + env(safe-area-inset-bottom))', pt: 1.5, background: '#f2f2f2', borderTop: '1px solid #e9eceb' }}>
      <Stack direction="row" spacing={1}>
        <Button variant="outlined" startIcon={<FilterListRoundedIcon />} onClick={() => (onFilter ? onFilter(tab) : console.info('Open filter'))}
          sx={{ '&:hover': { bgcolor: 'secondary.main', color: 'common.white', borderColor: 'secondary.main' } }}>Filter</Button>
        <Button variant="contained" color="secondary" startIcon={<FileDownloadRoundedIcon />} onClick={() => (onExport ? onExport(tab) : console.info('Export logs'))}
          sx={{ ml: 'auto', color: 'common.white', '&:hover': { bgcolor: 'secondary.dark', color: 'common.white' } }}>Export</Button>
      </Stack>
    </Box>
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <MobileShell title="Diagnostics & logs" tagline="faults • events • export" onBack={handleBack} onHelp={onHelp} navValue={navValue} onNavChange={handleNavChange} footer={Footer}>
        <Box>
            {/* Tab chips */}
            <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
              {['faults','events'].map(k => (
                <Chip key={k} label={k} clickable color={tab === k ? 'secondary' : 'default'} onClick={() => setTab(k)} />
              ))}
            </Stack>

            {tab === 'faults' ? (
              <List sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {faults.map(f => (
                  <ListItemButton key={f.id} sx={{ p: 0 }} onClick={() => (onOpenFault ? onOpenFault(f) : console.info('Navigate to: 22 — Fault Detail (Mobile, React + MUI, JS)'))}>
                    <FaultRow f={f} />
                  </ListItemButton>
                ))}
              </List>
            ) : (
              <Paper elevation={0} sx={{ p: 1.25, borderRadius: 3, bgcolor: '#fff', border: '1px solid #eef3f1' }}>
                <Stack spacing={0.75}>
                  {events.map(e => (
                    <Box key={e.id}>
                      <Typography variant="subtitle2" fontWeight={700}>{e.title}</Typography>
                      <Typography variant="caption" color="text.secondary">{e.time}</Typography>
                    </Box>
                  ))}
                </Stack>
              </Paper>
            )}
        </Box>
      </MobileShell>
    </ThemeProvider>
  );
}
