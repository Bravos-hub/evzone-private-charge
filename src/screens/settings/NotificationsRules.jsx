import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import {
  CssBaseline, Box, Typography, Paper, Stack, Button, FormControl, Select, MenuItem,
  TextField, Switch, FormControlLabel, List, ListItemButton, Checkbox,
  Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import NotificationsActiveOutlinedIcon from '@mui/icons-material/NotificationsActiveOutlined';
import ThermostatRoundedIcon from '@mui/icons-material/ThermostatRounded';
import FlashOnRoundedIcon from '@mui/icons-material/FlashOnRounded';
import CloudOffRoundedIcon from '@mui/icons-material/CloudOffRounded';
import MobileShell from '../../components/layout/MobileShell';

const theme = createTheme({ palette: { primary: { main: '#03cd8c' }, secondary: { main: '#f77f00' }, background: { default: '#f2f2f2' } }, shape: { borderRadius: 7 }, typography: { fontFamily: 'Inter, Roboto, Arial, sans-serif' } });

export default function NotificationsRules({
  chargers = [{ id: 'st1', name: 'Home Charger' }, { id: 'st2', name: 'Office Charger' }],
  users = [{ id: 'u1', name: 'Robert Fox' }, { id: 'u2', name: 'Albert Flores' }],
  defaultChargerId = 'st1',
  onBack, onHelp, onNavChange,
  onSaveRules, onTestNotification
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
  const [rules, setRules] = useState({
    overTemp: true, tempC: 70,
    overCurrent: true, currentA: 120,
    offline: true, offlineMin: 10,
    channels: { app: true, rfid: false, email: true }
  });
  const [recipients, setRecipients] = useState(['u1']);
  const [previewOpen, setPreviewOpen] = useState(false);

  const toggleRecipient = (id) => setRecipients(prev => prev.includes(id) ? prev.filter(x=>x!==id) : [...prev, id]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <MobileShell title="Notifications & rules" tagline="thresholds • recipients • channels" onBack={handleBack} onHelp={onHelp} navValue={navValue} onNavChange={handleNavChange}>
        <Box>
            {/* Charger selector */}
            <Paper elevation={0} sx={{ p: 2, borderRadius: 1.5, bgcolor: '#fff', border: '1px solid #eef3f1', mb: 2 }}>
              <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1 }}>My chargers</Typography>
              <FormControl size="small" fullWidth>
                <Select value={chargerId} onChange={(e)=>setChargerId(e.target.value)}>
                  {chargers.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                </Select>
              </FormControl>
            </Paper>

            {/* Thresholds */}
            <Paper elevation={0} sx={{ p: 2, borderRadius: 1.5, bgcolor: '#fff', border: '1px solid #eef3f1' }}>
              <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1 }}>Thresholds</Typography>
              <Stack spacing={1}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <FormControlLabel control={<Switch checked={rules.overTemp} onChange={(e)=>setRules(r=>({...r, overTemp: e.target.checked}))} />} label={<Stack direction="row" spacing={0.5} alignItems="center"><ThermostatRoundedIcon fontSize="small"/> <span>Over‑temperature</span></Stack>} />
                  <TextField type="number" label="°C" size="small" value={rules.tempC} onChange={(e)=>setRules(r=>({...r, tempC: Number(e.target.value)||0}))} sx={{ width: 100 }} />
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center">
                  <FormControlLabel control={<Switch checked={rules.overCurrent} onChange={(e)=>setRules(r=>({...r, overCurrent: e.target.checked}))} />} label={<Stack direction="row" spacing={0.5} alignItems="center"><FlashOnRoundedIcon fontSize="small"/> <span>Over‑current</span></Stack>} />
                  <TextField type="number" label="A" size="small" value={rules.currentA} onChange={(e)=>setRules(r=>({...r, currentA: Number(e.target.value)||0}))} sx={{ width: 100 }} />
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center">
                  <FormControlLabel control={<Switch checked={rules.offline} onChange={(e)=>setRules(r=>({...r, offline: e.target.checked}))} />} label={<Stack direction="row" spacing={0.5} alignItems="center"><CloudOffRoundedIcon fontSize="small"/> <span>Offline</span></Stack>} />
                  <TextField type="number" label="Min" size="small" value={rules.offlineMin} onChange={(e)=>setRules(r=>({...r, offlineMin: Number(e.target.value)||0}))} sx={{ width: 100 }} />
                </Stack>
              </Stack>
            </Paper>

            {/* Channels */}
            <Paper elevation={0} sx={{ p: 2, mt: 2, borderRadius: 1.5, bgcolor: '#fff', border: '1px solid #eef3f1' }}>
              <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1 }}>Channels</Typography>
              <Stack direction="row" spacing={2}>
                <FormControlLabel control={<Switch checked={rules.channels.app} onChange={(e)=>setRules(r=>({...r, channels: {...r.channels, app: e.target.checked}}))} />} label="App" />
                <FormControlLabel control={<Switch checked={rules.channels.rfid} onChange={(e)=>setRules(r=>({...r, channels: {...r.channels, rfid: e.target.checked}}))} />} label="RFID" />
                <FormControlLabel control={<Switch checked={rules.channels.email} onChange={(e)=>setRules(r=>({...r, channels: {...r.channels, email: e.target.checked}}))} />} label="Email" />
              </Stack>
            </Paper>

            {/* Recipients */}
            <Paper elevation={0} sx={{ p: 2, mt: 2, borderRadius: 1.5, bgcolor: '#fff', border: '1px solid #eef3f1', mb: 2 }}>
              <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1 }}>Recipients</Typography>
              <List dense sx={{ border: '1px dashed #e0e0e0', borderRadius: 2, p: 1 }}>
                {users.map(u => (
                  <ListItemButton key={u.id} sx={{ px: 0 }} onClick={()=>toggleRecipient(u.id)}>
                    <Checkbox checked={recipients.includes(u.id)} />
                    <Typography variant="body2">{u.name}</Typography>
                  </ListItemButton>
                ))}
              </List>
            </Paper>

            {/* Action buttons */}
            <Stack direction="row" spacing={1} sx={{ px: 2, pb: 2 }}>
              <Button variant="outlined" startIcon={<NotificationsActiveOutlinedIcon />} onClick={() => (onTestNotification ? onTestNotification({ chargerId, recipients }) : setPreviewOpen(true))}
                sx={{ '&:hover': { bgcolor: 'secondary.main', color: 'common.white', borderColor: 'secondary.main' } }}>Send test</Button>
              <Button variant="contained" color="secondary" onClick={() => (onSaveRules ? onSaveRules({ chargerId, rules, recipients }) : console.info('Save rules', { chargerId, rules, recipients }))}
                sx={{ ml: 'auto', color: 'common.white', '&:hover': { bgcolor: 'secondary.dark', color: 'common.white' } }}>Save rules</Button>
            </Stack>
        </Box>
      </MobileShell>

      {/* Test preview dialog (stub) */}
      <Dialog open={previewOpen} onClose={()=>setPreviewOpen(false)} fullWidth>
        <DialogTitle>Test notification</DialogTitle>
        <DialogContent>
          <Typography variant="body2">A test notification would be sent to: {users.filter(u=>recipients.includes(u.id)).map(u=>u.name).join(', ') || 'None'}.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={()=>setPreviewOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  );
}
