import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box, Typography, Paper, Stack, Button, TextField, Chip, Checkbox, FormControlLabel,
  InputAdornment,
  FormControl, Select, MenuItem
} from '@mui/material';
import Divider from '@mui/material/Divider';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import SecurityRoundedIcon from '@mui/icons-material/SecurityRounded';
import MobileShell from '../../components/layout/MobileShell';
import QRScanner from '../../components/common/QRScanner';

export default function StartByQrManual({ onBack, onHelp, onNavChange, onResolve, onStart, onOpenActions }) {
  const navigate = useNavigate();
  const location = useLocation();
  const routes = useMemo(() => ['/', '/chargers', '/sessions', '/wallet', '/settings'], []);
  const [navValue, setNavValue] = useState(2); // Sessions tab index
  const [manualId, setManualId] = useState('');
  const [safetyOk, setSafetyOk] = useState(false);
  const [scanOpen, setScanOpen] = useState(false);
  const [resolved, setResolved] = useState(null);

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
      navigate('/dashboard');
    }
  }, [navigate, onBack]);

  // Multi‑charger awareness
  const chargers = useMemo(() => ([
    { id: 'st1', name: 'Home Charger' },
    { id: 'st2', name: 'Office Charger' },
  ]), []);
  const [chargerId, setChargerId] = useState('st1');

  const connectors = useMemo(() => ([
    { id: 'c1', label: 'Connector 1 — Type 2', status: 'Available' },
    { id: 'c2', label: 'Connector 2 — CCS 2', status: 'Available' },
    { id: 'c3', label: 'Connector 3 — CHAdeMO', status: 'In use' },
  ]), []);

  const resolve = (idOrQr) => {
    const st = chargers.find(x => x.id === chargerId) || chargers[0];
    const station = { id: idOrQr || st.id, name: st.name, location: 'Kampala' };
    setResolved(station);
    onResolve && onResolve(station);
  };

  const proceed = () => {
    const chosen = connectors.find(c => c.status === 'Available');
    if (onStart) return onStart({ station: resolved, connector: chosen });
    if (onOpenActions) return onOpenActions(resolved);
    console.info('Navigate to: 13 — Charger Actions (Mobile, React + MUI, JS)');
  };

  return (
    <>
      <MobileShell 
        title="Start session" 
        tagline="scan QR or enter ID • safety" 
        onBack={handleBack} 
        onHelp={onHelp} 
        navValue={navValue} 
        onNavChange={handleNavChange}
      >
        <Box>
            {/* Charger selector */}
            <Paper elevation={0} sx={{ p: 2, borderRadius: 1.5, bgcolor: '#fff', border: '1px solid #eef3f1', mb: 2 }}>
              <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1 }}>My chargers</Typography>
              <FormControl size="small" fullWidth>
                <Select value={chargerId} onChange={(e)=>setChargerId(e.target.value)}>
                  {chargers.map(ch => <MenuItem key={ch.id} value={ch.id}>{ch.name}</MenuItem>)}
                </Select>
              </FormControl>
            </Paper>

            {/* QR and Manual */}
            <Paper elevation={0} sx={{ p: 2, borderRadius: 1.5, bgcolor: '#fff', border: '1px solid #eef3f1' }}>
              <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1 }}>Identify charger</Typography>
              <Stack direction="row" spacing={1}>
                <Button variant="outlined" startIcon={<QrCodeScannerIcon />} onClick={() => setScanOpen(true)}
                  sx={{ '&:hover': { bgcolor: 'secondary.main', color: 'common.white', borderColor: 'secondary.main' } }}>Scan QR</Button>
                <TextField placeholder="Enter charger ID" value={manualId} onChange={(e)=>setManualId(e.target.value)}
                  InputProps={{ 
                    startAdornment: <InputAdornment position="start">ID</InputAdornment>,
                    endAdornment: <InputAdornment position="end">
                      <Button size="small" variant="contained" color="secondary" onClick={() => resolve(manualId)} sx={{ color: 'common.white', minWidth: 'auto', px: 1.5 }}>Resolve</Button>
                    </InputAdornment>
                  }} 
                  sx={{ flex: 1 }} 
                />
              </Stack>

              {resolved && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2"><strong>Station:</strong> {resolved.name} • {resolved.id}</Typography>
                  <Typography variant="caption" color="text.secondary">{resolved.location}</Typography>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 0.5 }}>Choose connector</Typography>
                  <Stack spacing={1}>
                    {connectors.map(c => (
                      <Chip key={c.id} label={`${c.label} • ${c.status}`} color={c.status === 'Available' ? 'default' : 'warning'} disabled={c.status !== 'Available'} />
                    ))}
                  </Stack>
                </Box>
              )}
            </Paper>

            {/* Safety */}
            <Paper elevation={0} sx={{ p: 2, mt: 2, borderRadius: 1.5, bgcolor: '#fff', border: '1px solid #eef3f1' }}>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                <SecurityRoundedIcon color="secondary" />
                <Typography variant="subtitle2" fontWeight={800}>Safety checklist</Typography>
              </Stack>
              <FormControlLabel control={<Checkbox checked={safetyOk} onChange={(e)=>setSafetyOk(e.target.checked)} />} label="I confirm the cable and area are safe to charge." />
              <Button fullWidth variant="contained" color="secondary" disabled={!resolved || !safetyOk}
                onClick={proceed} sx={{ mt: 1, color: 'common.white', '&:hover': { bgcolor: 'secondary.dark', color: 'common.white' } }}>
                Start charging
              </Button>
            </Paper>
        </Box>
      </MobileShell>

      {/* QR Scanner Dialog */}
      <QRScanner
        open={scanOpen}
        onClose={() => setScanOpen(false)}
        onScanSuccess={(decodedText) => {
          resolve(decodedText);
          setScanOpen(false);
        }}
        title="Scan Charger QR Code"
      />
    </>
  );
}
