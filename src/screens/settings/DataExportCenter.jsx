import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import {
  CssBaseline, Box, Typography, Paper, Stack, Button, FormControl, Select, MenuItem, TextField,
  Checkbox, FormControlLabel
} from '@mui/material';
import IosShareRoundedIcon from '@mui/icons-material/IosShareRounded';
import MobileShell from '../../components/layout/MobileShell';

const theme = createTheme({ palette: { primary: { main: '#03cd8c' }, secondary: { main: '#f77f00' }, background: { default: '#f2f2f2' } }, shape: { borderRadius: 14 }, typography: { fontFamily: 'Inter, Roboto, Arial, sans-serif' } });

function EntityRow({ label, checked, onToggle, children }) {
  return (
    <Paper elevation={0} sx={{ p: 1.25, borderRadius: 3, bgcolor: '#fff', border: '1px solid #eef3f1' }}>
      <Stack spacing={1}>
        <FormControlLabel control={<Checkbox checked={checked} onChange={onToggle} />} label={label} />
        {checked && <Box sx={{ pl: 3 }}>{children}</Box>}
      </Stack>
    </Paper>
  );
}

export default function DataExportCenter({
  chargers = [{ id: 'st1', name: 'Home Charger' }, { id: 'st2', name: 'Office Charger' }],
  defaultChargerId = 'st1',
  onBack, onHelp, onNavChange,
  onExport,
  // NEW quick open handlers
  onOpenSessions,
  onOpenFaults,
  onOpenInvoices
}) {
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
  const [chargerId, setChargerId] = useState(defaultChargerId);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [format, setFormat] = useState('csv');
  const [compress, setCompress] = useState(false);
  const [anonymize, setAnonymize] = useState(true);

  const [entities, setEntities] = useState({ sessions: true, faults: false, invoices: false, reservations: false });
  const [fields] = useState({
    sessions: ['id','site','kWh','start','end','amount'],
    faults: ['code','title','time','connector'],
    invoices: ['id','date','site','amount','status'],
    reservations: ['id','user','connector','date','start','end','status']
  });

  const selected = Object.keys(entities).filter(k => entities[k]);

  const exportNow = () => {
    const payload = { chargerId, from, to, format, compress, anonymize, entities: selected, fields: Object.fromEntries(selected.map(k => [k, fields[k]])) };
    if (onExport) onExport(payload); else console.info('Export', payload);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <MobileShell title="Data export center" tagline="choose • preview • export" onBack={handleBack} onHelp={onHelp} navValue={navValue} onNavChange={handleNavChange}>
        <Box>
            {/* Charger & Range */}
            <Paper elevation={0} sx={{ p: 2, borderRadius: 3, bgcolor: '#fff', border: '1px solid #eef3f1', mb: 2 }}>
              <Stack spacing={1}>
                <FormControl size="small" fullWidth>
                  <Select value={chargerId} onChange={(e)=>setChargerId(e.target.value)}>
                    {chargers.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                  </Select>
                </FormControl>
                <Stack direction="row" spacing={1}>
                  <TextField size="small" type="date" label="From" InputLabelProps={{ shrink: true }} value={from} onChange={(e)=>setFrom(e.target.value)} sx={{ flex: 1 }} />
                  <TextField size="small" type="date" label="To" InputLabelProps={{ shrink: true }} value={to} onChange={(e)=>setTo(e.target.value)} sx={{ flex: 1 }} />
                </Stack>
              </Stack>
            </Paper>

            {/* Entities */}
            <Stack spacing={1}>
              <EntityRow label="Sessions" checked={entities.sessions} onToggle={(e)=>setEntities(s=>({ ...s, sessions: e.target.checked }))}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="caption" color="text.secondary">Fields: {fields.sessions.join(', ')}</Typography>
                  <Button size="small" variant="outlined" onClick={()=> (onOpenSessions ? onOpenSessions({ chargerId, from, to }) : console.info('Navigate to: 19 — Charging History'))}
                    sx={{ ml: 'auto', '&:hover': { bgcolor: 'secondary.main', color: 'common.white', borderColor: 'secondary.main' } }}>Open (19)</Button>
                </Stack>
              </EntityRow>

              <EntityRow label="Faults" checked={entities.faults} onToggle={(e)=>setEntities(s=>({ ...s, faults: e.target.checked }))}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="caption" color="text.secondary">Fields: {fields.faults.join(', ')}</Typography>
                  <Button size="small" variant="outlined" onClick={()=> (onOpenFaults ? onOpenFaults({ chargerId, from, to }) : console.info('Navigate to: 21 — Diagnostics & Logs'))}
                    sx={{ ml: 'auto', '&:hover': { bgcolor: 'secondary.main', color: 'common.white', borderColor: 'secondary.main' } }}>Open (21)</Button>
                </Stack>
              </EntityRow>

              <EntityRow label="Invoices" checked={entities.invoices} onToggle={(e)=>setEntities(s=>({ ...s, invoices: e.target.checked }))}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="caption" color="text.secondary">Fields: {fields.invoices.join(', ')}</Typography>
                  <Button size="small" variant="outlined" onClick={()=> (onOpenInvoices ? onOpenInvoices({ chargerId, from, to }) : console.info('Navigate to: 29 — Invoices & Billing'))}
                    sx={{ ml: 'auto', '&:hover': { bgcolor: 'secondary.main', color: 'common.white', borderColor: 'secondary.main' } }}>Open (29)</Button>
                </Stack>
              </EntityRow>

              <EntityRow label="Reservations" checked={entities.reservations} onToggle={(e)=>setEntities(s=>({ ...s, reservations: e.target.checked }))}>
                <Typography variant="caption" color="text.secondary">Fields: {fields.reservations.join(', ')}</Typography>
              </EntityRow>
            </Stack>

            {/* Options */}
            <Paper elevation={0} sx={{ mt: 2, p: 2, borderRadius: 3, bgcolor: '#fff', border: '1px solid #eef3f1' }}>
              <Stack direction="row" spacing={2}>
                <FormControlLabel control={<Checkbox checked={compress} onChange={(e)=>setCompress(e.target.checked)} />} label="Compress (zip)" />
                <FormControlLabel control={<Checkbox checked={anonymize} onChange={(e)=>setAnonymize(e.target.checked)} />} label="Anonymize PII" />
              </Stack>
            </Paper>

            {/* Preview hint */}
            <Paper elevation={0} sx={{ mt: 2, p: 2, borderRadius: 3, bgcolor: '#fff', border: '1px solid #eef3f1', mb: 2 }}>
              <Typography variant="caption" color="text.secondary">Tip: Use the **Sessions** entity for energy analytics; **Faults** for diagnostics; **Invoices** for finance systems. Exports honor your selected date range.</Typography>
            </Paper>

            {/* Action buttons */}
            <Stack direction="row" spacing={1} sx={{ px: 2, pb: 2 }}>
              <Button variant="outlined" startIcon={<IosShareRoundedIcon />} onClick={exportNow}
                sx={{ '&:hover': { bgcolor: 'secondary.main', color: 'common.white', borderColor: 'secondary.main' } }}>Export</Button>
              <FormControl size="small" sx={{ minWidth: 120, ml: 'auto' }}>
                <Select value={format} onChange={(e)=>setFormat(e.target.value)}>
                  <MenuItem value="csv">CSV</MenuItem>
                  <MenuItem value="xlsx">XLSX</MenuItem>
                  <MenuItem value="json">JSON</MenuItem>
                </Select>
              </FormControl>
            </Stack>
        </Box>
      </MobileShell>
    </ThemeProvider>
  );
}
