import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import {
  CssBaseline, Box, Typography, Paper, Button, TextField, Switch, FormControlLabel, Select, MenuItem
} from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import MobileShell from '../../components/layout/MobileShell';

const theme = createTheme({
  palette: {
    primary: { main: '#03cd8c' },
    secondary: { main: '#f77f00' },
    background: { default: '#f2f2f2' }
  },
  shape: { borderRadius: 14 },
  typography: { fontFamily: 'Inter, Roboto, Arial, sans-serif' }
});

function Field({ label, children, helper }) {
  return (
    <Box sx={{ mb: 1.5 }}>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        {label} {helper && <InfoOutlinedIcon fontSize="inherit" titleAccess={helper} />}
      </Typography>
      {children}
    </Box>
  );
}

export default function AdvancedConfiguration({ onBack, onHelp, onNavChange, onSave }) {
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

  // Meter value reporting (sampled)
  const [mvInterval, setMvInterval] = useState(60);
  const [mvMaxLen, setMvMaxLen] = useState(5);

  // Clock-aligned reporting
  const [caInterval, setCaInterval] = useState(300);
  const [caMaxLen, setCaMaxLen] = useState(5);

  // Connector & reservation
  const [reserveAll, setReserveAll] = useState(true);
  const [maxCable, setMaxCable] = useState(0);
  const [phaseRotation, setPhaseRotation] = useState('Rst');

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <MobileShell
        title="Advanced configuration"
        tagline="data reporting • limits • behavior"
        onBack={handleBack}
        onHelp={onHelp}
        navValue={navValue}
        onNavChange={handleNavChange}
      >
        <Box>
            <Paper elevation={0} sx={{ p: 2, borderRadius: 3, bgcolor: '#fff', border: '1px solid #eef3f1' }}>
              <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1 }}>Meter values — sampled</Typography>
              <Field label="Interval (seconds)" helper="How often the charger reports live session data.">
                <TextField type="number" value={mvInterval} onChange={(e) => setMvInterval(Number(e.target.value) || 0)} fullWidth />
              </Field>
              <Field label="Sampled data max length" helper="Max measurands included per sample message.">
                <TextField type="number" value={mvMaxLen} onChange={(e) => setMvMaxLen(Number(e.target.value) || 0)} fullWidth />
              </Field>
            </Paper>

            <Paper elevation={0} sx={{ p: 2, mt: 2, borderRadius: 3, bgcolor: '#fff', border: '1px solid #eef3f1' }}>
              <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1 }}>Meter values — clock‑aligned</Typography>
              <Field label="Interval (seconds)" helper="Fixed schedule reporting aligned to the clock.">
                <TextField type="number" value={caInterval} onChange={(e) => setCaInterval(Number(e.target.value) || 0)} fullWidth />
              </Field>
              <Field label="Aligned data max length" helper="Max measurands per aligned report.">
                <TextField type="number" value={caMaxLen} onChange={(e) => setCaMaxLen(Number(e.target.value) || 0)} fullWidth />
              </Field>
            </Paper>

            <Paper elevation={0} sx={{ p: 2, mt: 2, borderRadius: 3, bgcolor: '#fff', border: '1px solid #eef3f1', mb: 2 }}>
              <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1 }}>Connectors & reservation</Typography>
              <Field label="Reserve connector zero" helper="Reserve all connectors by booking connector 0.">
                <FormControlLabel control={<Switch checked={reserveAll} onChange={(e) => setReserveAll(e.target.checked)} />} label="Enable" />
              </Field>
              <Field label="Max cable length (m)" helper="0 means fixed cable or not set.">
                <TextField type="number" value={maxCable} onChange={(e) => setMaxCable(Number(e.target.value) || 0)} fullWidth />
              </Field>
              <Field label="Connector phase rotation" helper="Load distribution for single‑phase EVs on 3‑phase sites.">
                <Select size="small" value={phaseRotation} onChange={(e) => setPhaseRotation(e.target.value)} fullWidth>
                  {['Rst','Srt','Trs'].map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
                </Select>
              </Field>
            </Paper>

            {/* Save button */}
            <Box sx={{ px: 2, pb: 2 }}>
              <Button fullWidth size="large" variant="contained" color="secondary"
                onClick={() => onSave ? onSave({ mvInterval, mvMaxLen, caInterval, caMaxLen, reserveAll, maxCable, phaseRotation }) : console.info('Saved advanced configuration')}
                sx={{ py: 1.25, color: 'common.white', '&:hover': { bgcolor: 'secondary.dark', color: 'common.white' } }}>
                Save configuration
              </Button>
            </Box>
        </Box>
      </MobileShell>
    </ThemeProvider>
  );
}
