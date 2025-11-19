import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { alpha } from '@mui/material/styles';
import {
  Box, Paper, Stack, Grid, Typography, Button, Tooltip, IconButton,
  Divider, Link as MuiLink, Radio, FormControlLabel,
  TextField, MenuItem, Checkbox, FormGroup
} from '@mui/material';
import StorefrontRoundedIcon from '@mui/icons-material/StorefrontRounded';
import CableRoundedIcon from '@mui/icons-material/CableRounded';
import InfoRoundedIcon from '@mui/icons-material/InfoRounded';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import MobileShell from '../../components/layout/MobileShell';
import { EV } from '../../utils/theme';

/********************
 * COMBINED SCREEN — Add Charger (Welcome + Source + Manual)
 * - Hero from Welcome
 * - Source selector from Charger Source
 * - Scan QR / Manual add actions
 * - Manual form (make, model, serial, ocpp, charger power)
 * - Connectors builder (multi-connector aware)
 * - Single consent checkbox (ToS + Privacy)
 * - Tip + link: Aggregator & CPMS
 ********************/
export default function AddChargerStartPro({
  onBack,
  onNotifications,
  onOpenAggregator,
  onScan,
  onContinue
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const [navValue, setNavValue] = useState(1);
  const routes = ['/', '/chargers', '/sessions', '/wallet', '/settings'];
  
  // Sync navValue with current route
  useEffect(() => {
    const pathIndex = routes.findIndex(route => location.pathname === route || location.pathname.startsWith(route + '/'));
    if (pathIndex !== -1) {
      setNavValue(pathIndex);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);
  
  const handleNavChange = (value) => {
    setNavValue(value);
    if (routes[value] !== undefined) {
      navigate(routes[value]);
    }
  };
  
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate('/dashboard');
    }
  };
  const [source, setSource] = useState('evmart'); // 'evmart' | 'other'
  const [showManual, setShowManual] = useState(false);
  const [form, setForm] = useState({
    make: '',
    model: '',
    serial: '',
    ocpp: '1.6J',
    powerKw: '', // charger-level max
    reseller: ''
  });

  // multi-connector builder
  const [connectors, setConnectors] = useState([
    { id: 1, label: 'A1', type: 'Type 2', powerKw: '' }
  ]);

  const connectorTypes = ['Type 2','CCS 2','CHAdeMO','GB/T'];
  const addConnector = () => setConnectors(prev => [...prev, { id: Date.now(), label: `A${prev.length+1}`, type: 'Type 2', powerKw: '' }]);
  const updateConnector = (id, patch) => setConnectors(prev => prev.map(c => c.id === id ? { ...c, ...patch } : c));
  const removeConnector = (id) => setConnectors(prev => prev.length <= 1 ? prev : prev.filter(c => c.id !== id));

  const [consent, setConsent] = useState(false);

  const canContinue = useMemo(() => {
    const hasConsents = !!consent;
    if (!showManual) {
      // If not adding manually, allow continue with consent only (QR scan path collects details later)
      return hasConsents;
    }
    const makeOk = !!form.make?.trim();
    const modelOk = !!form.model?.trim();
    const serialOk = !!form.serial?.trim();
    const ocppOk = !!form.ocpp?.trim();
    const powerOk = form.powerKw !== '' && !Number.isNaN(Number(form.powerKw));
    const hasConnector = connectors.length >= 1;
    const connectorTypesOk = connectors.every(c => !!c.type?.trim());
    const connectorLabelsOk = connectors.every(c => !!c.label?.trim());
    return hasConsents && makeOk && modelOk && serialOk && ocppOk && powerOk && hasConnector && connectorTypesOk && connectorLabelsOk;
  }, [showManual, consent, form, connectors]);

  const footerSlot = (
    <Stack direction="row" spacing={1} justifyContent="center">
      <Button
        variant="outlined"
        onClick={handleBack}
        sx={{ borderRadius: 999, minWidth: 140, color: EV.green, borderColor: EV.green, '&:hover': { bgcolor: EV.green, color: '#fff', borderColor: EV.green } }}
      >
        Back
      </Button>
      <Button
        variant="contained"
        disabled={!canContinue}
        onClick={() => {
          const payload = {
            source,
            startedManual: showManual,
            form,
            connectors,
            consent
          };
          if (onContinue) {
            onContinue(payload);
          } else {
            // Default behavior: navigate to connect charger page
            navigate('/chargers/connect', { state: payload });
          }
        }}
        sx={{ borderRadius: 999, minWidth: 160, color: '#fff', bgcolor: EV.orange, '&:hover': { bgcolor: alpha(EV.orange, .85) } }}
      >
        Save & Continue
      </Button>
    </Stack>
  );

  // ---------- Dev self-tests (console only, browser-safe)
  useEffect(() => {
    const isBrowser = typeof window !== 'undefined';
    const isProd = (typeof process !== 'undefined' && process?.env?.NODE_ENV === 'production');
    if (!isBrowser || isProd) return;
    try {
      const results = [];
      const check = (name, cond) => results.push({ test: name, pass: !!cond });
      check('default source is evmart', source === 'evmart');
      check('manual form hidden initially', !showManual);
      check('consent single boolean defaults false', consent === false);
      check('connectors array exists', Array.isArray(connectors));
      check('first connector has label and type', !!connectors[0].label && !!connectors[0].type);
      check('form has no firmware', !('firmware' in form));
      check('form has no orderId', !('orderId' in form));
      check('form has no purchaseDate', !('purchaseDate' in form));
      console.table(results);
    } catch (e) { console.warn('dev tests crashed', e); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <MobileShell title="Add charger" subtitle="welcome • select source • add details" navValue={navValue} onNavChange={handleNavChange} onNotifications={onNotifications} onBack={handleBack} footerSlot={footerSlot}>
      {/* Hero */}
      <Stack spacing={1.25} alignItems="center" sx={{ textAlign: 'center' }}>
        <BoltRoundedIcon sx={{ color: EV.green }} />
        <Typography variant="h6" fontWeight={900}>Everything you need to set up your charger</Typography>
        <Typography variant="caption" color="text.secondary">
          Connect any compliant charger — monetize one with EVzone or just manage it privately.
        </Typography>
      </Stack>

      {/* Source selector */}
      <Grid container spacing={1.2} alignItems="stretch" justifyContent="center" sx={{ mt: 2 }}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2, borderRadius: 3, border: `2px solid ${source==='evmart' ? EV.orange : EV.divider}` }} onClick={()=>setSource('evmart')}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Radio checked={source==='evmart'} onChange={()=>setSource('evmart')} sx={{ color: EV.orange, '&.Mui-checked': { color: EV.orange } }} />
              <StorefrontRoundedIcon sx={{ color: EV.orange }} />
              <Box sx={{ ml: .5 }}>
                <Typography variant="subtitle2" fontWeight={800}>EVmart‑certified</Typography>
                <Typography variant='caption' color='text.secondary' sx={{ display:'block', mt:.5 }}>If bought from EVzone's EVmart or MyLiveDealz, the charger is pre‑tested for compliance.</Typography>
              </Box>
            </Stack>
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Paper sx={{ p: 2, borderRadius: 3, border: `2px solid ${source==='other' ? EV.orange : EV.divider}` }} onClick={()=>setSource('other')}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Radio checked={source==='other'} onChange={()=>setSource('other')} sx={{ color: EV.orange, '&.Mui-checked': { color: EV.orange } }} />
              <CableRoundedIcon sx={{ color: EV.orange }} />
              <Box sx={{ ml: .5 }}>
                <Typography variant="subtitle2" fontWeight={800}>Other brand (OCPP 1.6J+)</Typography>
                <Typography variant="caption" color="text.secondary">Add any compatible OCPP 1.6J or higher charger. We’ll help you pass compliance checks.</Typography>
              </Box>
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      {/* Actions */}
      <Grid container spacing={1.2} sx={{ mt: 1.5 }} alignItems="stretch" justifyContent="center">
        <Grid item xs={12}>
          <Paper sx={{ p: 2, borderRadius: 3, border: `1px solid ${EV.divider}`, textAlign: 'center' }}>
            <Stack spacing={1.25} alignItems="center">
              <QrCodeScannerIcon sx={{ color: EV.orange }} />
              <Typography variant="subtitle2" fontWeight={800}>Scan QR on the charger</Typography>
              <Typography variant="caption" color="text.secondary">Fastest way to pull serial & model</Typography>
              <Button
                variant="contained"
                startIcon={<QrCodeScannerIcon/>}
                onClick={()=> (onScan ? onScan() : console.info('Scan QR'))}
                sx={{ color:'#fff', borderRadius: 999, px: 2, bgcolor: EV.orange, '&:hover': { bgcolor: alpha(EV.orange, .85) } }}
              >
                Scan QR
              </Button>
            </Stack>
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Paper sx={{ p: 2, borderRadius: 3, border: `1px solid ${EV.divider}`, textAlign: 'center' }}>
            <Stack spacing={1.25} alignItems="center">
              <AddCircleOutlineIcon sx={{ color: EV.green }} />
              <Typography variant="subtitle2" fontWeight={800}>Add manually</Typography>
              <Typography variant="caption" color="text.secondary">Enter charger make, model & serial</Typography>
              <Button variant="outlined" startIcon={<AddCircleOutlineIcon/>}
                onClick={()=> setShowManual(true)}
                sx={{ borderRadius: 999, px: 2, color: EV.green, borderColor: EV.green, '&:hover': { bgcolor: EV.green, color: '#fff', borderColor: EV.green } }}>Add manually</Button>
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      {/* Manual form (revealed when chosen) */}
      {showManual && (
        <Paper sx={{ mt: 2, p: 2, borderRadius: 3, border: `1px solid ${EV.divider}` }}>
          <Typography variant="subtitle2" fontWeight={800} gutterBottom>Charger details</Typography>
          <Grid container spacing={1.2}>
            <Grid item xs={12} sm={6}><TextField fullWidth label="Make" value={form.make} onChange={(e)=>setForm({...form, make: e.target.value})} /></Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth label="Model" value={form.model} onChange={(e)=>setForm({...form, model: e.target.value})} /></Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth label="Serial" value={form.serial} onChange={(e)=>setForm({...form, serial: e.target.value})} /></Grid>
            <Grid item xs={6} sm={3}>
              <TextField select fullWidth label="OCPP" value={form.ocpp} onChange={(e)=>setForm({...form, ocpp: e.target.value})}>
                {['1.6J','2.0.1'].map(v=> <MenuItem key={v} value={v}>{v}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={6} sm={3}><TextField fullWidth label="Charger max (kW)" value={form.powerKw} inputMode="decimal" onChange={(e)=>setForm({...form, powerKw: e.target.value})} /></Grid>
          </Grid>

          {/* Connectors builder */}
          <Divider sx={{ my: 2 }} />
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
            <Typography variant="subtitle2" fontWeight={800}>Connectors (ports)</Typography>
            <Typography variant="caption" color="text.secondary">Add one or more ports if this unit has multiple connectors.</Typography>
          </Stack>
          <Stack spacing={1}>
            {connectors.map((c) => (
              <Paper key={c.id} variant="outlined" sx={{ p: 1.25, borderRadius: 2 }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                  <TextField label="Label / Port ID" value={c.label} onChange={(e)=>updateConnector(c.id, { label: e.target.value })} sx={{ flex: 1 }} />
                  <TextField select label="Type" value={c.type} onChange={(e)=>updateConnector(c.id, { type: e.target.value })} sx={{ flex: 1 }}>
                    {connectorTypes.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                  </TextField>
                  <TextField label="Power (kW)" inputMode="decimal" value={c.powerKw} onChange={(e)=>updateConnector(c.id, { powerKw: e.target.value })} sx={{ flex: 1 }} />
                  <Tooltip title={connectors.length <= 1 ? 'At least one connector' : 'Remove this connector'}>
                    <span>
                      <IconButton color="error" onClick={()=>removeConnector(c.id)} disabled={connectors.length <= 1} aria-label="Remove connector"><DeleteOutlineIcon /></IconButton>
                    </span>
                  </Tooltip>
                </Stack>
              </Paper>
            ))}
            <Button startIcon={<AddCircleOutlineIcon />} onClick={addConnector} sx={{ alignSelf: 'flex-start' }}>Add connector</Button>
          </Stack>
        </Paper>
      )}

      {/* Single consent */}
      <Paper sx={{ mt: 2, p: 1.25, borderRadius: 3, border: `1px solid ${EV.divider}` }}>
        <FormGroup>
          <FormControlLabel
            control={<Checkbox checked={consent} onChange={(e)=>setConsent(e.target.checked)} />}
            label={
              <Typography variant="caption">
                I agree to the <MuiLink component="button" type="button" onClick={()=>alert('Open Terms')}>Terms of Service</MuiLink> and
                {' '}<MuiLink component="button" type="button" onClick={()=>alert('Open Privacy Policy')}>Privacy Policy</MuiLink>
              </Typography>
            }
          />
        </FormGroup>
      </Paper>

      {/* Tip (orange theme) */}
      <Paper sx={{ mt: 2, p: 1.25, borderRadius: 3, border: `1px solid ${EV.orange}`, bgcolor: alpha(EV.orange, .06) }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <InfoRoundedIcon sx={{ color: EV.orange }} />
          <Box>
            <Typography variant="caption" color="text.secondary">
              You can connect for monitoring/alerts without monetizing. You may monetize exactly one <b>Commercial Charger</b> in Private Charging.
              Need more? Use <MuiLink component='button' onClick={()=> (onOpenAggregator ? onOpenAggregator() : console.info('Open Aggregator'))} sx={{ color: EV.orange, '&:hover': { color: alpha(EV.orange, .9) } }}>EVzone Aggregator & CPMS</MuiLink>.
            </Typography>
          </Box>
        </Stack>
      </Paper>
    </MobileShell>
  );
}

/**
 * Usage (dev)
 * <AddChargerStartPro onContinue={(p)=>console.log('continue', p)} onOpenAggregator={()=>console.log('open aggregator')} />
 */
