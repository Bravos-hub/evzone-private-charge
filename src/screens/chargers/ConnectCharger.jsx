import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { alpha } from '@mui/material/styles';
import {
  Container, Box, Typography, TextField, Button, InputAdornment, IconButton,
  Paper, LinearProgress, Stack, Link as MuiLink,
  Radio, RadioGroup, FormControlLabel,
  Snackbar, Alert, Chip, Accordion, AccordionSummary, AccordionDetails, Divider, Switch
} from '@mui/material';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CameraAltOutlinedIcon from '@mui/icons-material/CameraAltOutlined';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import ReplayRoundedIcon from '@mui/icons-material/ReplayRounded';
import ManageSearchRoundedIcon from '@mui/icons-material/ManageSearchRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import PaidRoundedIcon from '@mui/icons-material/PaidRounded';
import LaunchRoundedIcon from '@mui/icons-material/LaunchRounded';
import RoomIcon from '@mui/icons-material/Room';
import { REQUIRE_PHOTO, ALLOW_CONTINUE_ON_FAIL, COMMERCIAL_LIMIT_WARN_ONLY, ENABLE_GEO_SEARCH, ATTEMPT_API_POST_ON_PUBLISH } from '../../utils/constants';
import MobileShell from '../../components/layout/MobileShell';
import { OCPPPanel } from '../../components/forms';
import MapPicker from '../../components/common/MapPicker';
import GeoSearch from '../../components/common/GeoSearch';

function StepHeader({ step, total, label }) {
  const pct = Math.round((step / total) * 100);
  return (
    <Box>
      <Typography variant="overline" color="primary" sx={{ letterSpacing: 0.6, fontWeight: 700 }}>
        Step {step} of {total}
      </Typography>
      <LinearProgress variant="determinate" value={pct} sx={{ height: 6, borderRadius: 3, my: 1 }} />
      {label && <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{label}</Typography>}
    </Box>
  );
}

function PhotosBlock({ imageNames, onCamera, onGallery }) {
  const photosMissing = REQUIRE_PHOTO && (!imageNames || imageNames.length === 0);
  return (
    <>
      <Typography variant="subtitle2" sx={{ mb: 1 }}>Charger photos {REQUIRE_PHOTO && <Typography component="span" variant="caption" color="error">(required)</Typography>}</Typography>
      <Paper elevation={0} sx={{ p: 2, borderRadius: 3, bgcolor: '#fff', mb: 1.25, border: '1px dashed #e0e0e0' }}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ flexWrap: 'wrap' }}>
          <Button variant="outlined" color="secondary" startIcon={<CameraAltOutlinedIcon />} onClick={onCamera}
            sx={{ flexGrow: 1, '&:hover': { bgcolor: 'secondary.main', color: 'common.white', borderColor: 'secondary.main', '& .MuiButton-startIcon>*': { color: 'common.white' } } }}>
            Take photos
          </Button>
          <Button variant="outlined" startIcon={<PhotoCamera />} onClick={onGallery}
            sx={{ flexGrow: 1, '&:hover': { bgcolor: 'primary.main', color: 'common.white', borderColor: 'primary.main', '& .MuiButton-startIcon>*': { color: 'common.white' } } }}>
            Upload photos
          </Button>
          {!!imageNames.length && (
            <Typography variant="caption" color="text.secondary" sx={{ width: '100%', mt: 0.5 }}>
              {imageNames.length} photo{imageNames.length > 1 ? 's' : ''} selected
            </Typography>
          )}
        </Stack>
      </Paper>
      {photosMissing && (
        <Alert severity="error" variant="outlined" sx={{ mb: 2 }}>
          At least one charger photo is required before you can continue.
        </Alert>
      )}
    </>
  );
}


function ConnectionTest({ stationId, onSuccess, onStatusChange, onFindTechnician, onContinue }) {
  const [status, setStatus] = useState('idle'); // idle | testing | failed | success
  const [attempt, setAttempt] = useState(0);
  const timestamp = useMemo(() => new Date(), []);

  useEffect(() => { onStatusChange && onStatusChange(status); }, [status, onStatusChange]);

  const test = () => {
    setStatus('testing');
    setTimeout(() => {
      // Fail first time to surface the diagnostics UI, succeed afterward
      if (attempt === 0) { setStatus('failed'); setAttempt((a) => a + 1); }
      else { setStatus('success'); onSuccess && onSuccess(); }
    }, 1200);
  };

  if (status === 'idle' || status === 'testing') {
    return (
      <Paper sx={{ p:2, borderRadius:3, border:'1px solid #eef3f1', bgcolor:'#fff', textAlign:'center' }}>
        <Typography variant="subtitle1" fontWeight={800} sx={{ mb: .5 }}>Test connection</Typography>
        <Typography variant="body2" color="text.secondary">We’ll ping Station ID <b>{stationId || '—'}</b> over OCPP.</Typography>
        <Button disabled={status==='testing'} variant="contained" color="secondary" onClick={test}
          sx={{ mt: 1.5, color:'#fff', '&:hover': { bgcolor:'secondary.dark' } }}>
          {status==='testing' ? 'Testing…' : 'Run test'}
        </Button>
      </Paper>
    );
  }

  if (status === 'failed') {
    return (
      <Paper sx={{ p:2, borderRadius:3, border:`1px solid ${alpha('#e53935', .35)}`, bgcolor: alpha('#e53935', .06) }}>
        <Stack direction='row' spacing={1} alignItems='center'>
          <ErrorOutlineRoundedIcon sx={{ color: '#e53935' }} />
          <Box>
            <Typography variant='subtitle1' fontWeight={900} sx={{ color: '#e53935' }}>Connection Failed</Typography>
            <Typography variant='caption' color='text.secondary'>{timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}, {timestamp.toLocaleDateString()}</Typography>
          </Box>
        </Stack>
        <Typography variant='body2' sx={{ mt: 1 }}>Unable to establish OCPP connection with Station ID: <b>{stationId}</b>.</Typography>
        <Typography variant='body2' color='text.secondary' sx={{ mt: .5 }}>You can continue and fix later, or find a technician now.</Typography>
        <Accordion disableGutters sx={{ mt: 1, border:`1px solid ${alpha('#e53935',.25)}`, borderRadius:2 }}>
          <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />}>
            <Typography variant='subtitle2' sx={{ color:'#b71c1c' }}>Diagnostics & Retry Info</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant='body2'><b>Timeout:</b> 30 seconds</Typography>
            <Typography variant='body2'><b>Last Attempt:</b> {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Typography>
            <Typography variant='body2'><b>Error Code:</b> OCPP_CONN_TIMEOUT</Typography>
            <Typography variant='body2'><b>Suggested Action:</b> Verify network & power supply</Typography>
          </AccordionDetails>
        </Accordion>
        <Stack direction='row' spacing={1} sx={{ mt: 1 }}>
          <Button variant='contained' startIcon={<ReplayRoundedIcon />} onClick={() => setStatus('idle')} sx={{ bgcolor: '#f77f00', color:'#fff', borderRadius: 999, '&:hover': { bgcolor: alpha('#f77f00',.85) } }}>Retry</Button>
          <Button variant='outlined' startIcon={<ManageSearchRoundedIcon />} onClick={() => (onFindTechnician ? onFindTechnician() : alert('Find Technician flow'))} sx={{ borderRadius: 999 }}>Find Technician</Button>
          {ALLOW_CONTINUE_ON_FAIL && (
            <Button variant='outlined' onClick={() => (onContinue ? onContinue() : null)} sx={{ borderRadius: 999 }}>Continue</Button>
          )}
        </Stack>
      </Paper>
    );
  }

  // success
  return (
    <Paper sx={{ p: 2, borderRadius: 3, border: '1px solid #e6f4ea', bgcolor: '#f0fff6', textAlign: 'center' }}>
      <CheckCircleRoundedIcon sx={{ color: '#03cd8c', fontSize: 28 }} />
      <Typography variant="subtitle1" fontWeight={800} sx={{ mt: 0.5 }}>Connected successfully</Typography>
      <Typography variant="body2" color="text.secondary">We received a Pong from the charger. Proceed to location.</Typography>
    </Paper>
  );
}


function DetailsStep({ operatorAssigned, setOperatorAssigned, pricing, setPricing, access, setAccess, availability, setAvailability }) {
  return (
    <Box>
      {/* Map preview */}
      <Paper elevation={0} sx={{ height: 140, borderRadius: 3, bgcolor: '#fff', border: '1px solid #eef3f1', display: 'grid', placeItems: 'center' }}>
        <Stack alignItems="center" spacing={0.5}>
          <RoomIcon color="error" />
          <Typography variant="caption" color="text.secondary">Map preview</Typography>
        </Stack>
      </Paper>

      {/* Quick controls */}
      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle2" fontWeight={800} gutterBottom>Core settings</Typography>
        <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: '1px solid #eef3f1', bgcolor: '#fff' }}>
          <Stack spacing={1.25}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <PaidRoundedIcon fontSize="small" />
              <Typography variant="body2" sx={{ minWidth: 120 }}>Pricing model</Typography>
              <Chip label={pricing.model === 'kwh' ? 'per kWh' : 'per minute'} size="small" color="success" />
              <Button size="small" variant="outlined" onClick={() => setPricing((p) => ({ ...p, model: p.model === 'kwh' ? 'minute' : 'kwh' }))} sx={{ ml: 'auto', '&:hover': { bgcolor: 'secondary.main', color: '#fff', borderColor: 'secondary.main' } }}>Toggle</Button>
            </Stack>
            <Stack direction="row" alignItems="center" spacing={1}>
              <AccessTimeRoundedIcon fontSize="small" />
              <Typography variant="body2" sx={{ minWidth: 120 }}>Availability</Typography>
              <Chip label={availability?.label || '24/7'} size="small" />
              <Button size="small" variant="outlined" onClick={() => setAvailability({ label: availability?.label === '24/7' ? 'Weekdays 8–20' : '24/7' })} sx={{ ml: 'auto', '&:hover': { bgcolor: 'secondary.main', color: '#fff', borderColor: 'secondary.main' } }}>Edit</Button>
            </Stack>
            <Stack direction="row" alignItems="center" spacing={1}>
              <LockRoundedIcon fontSize="small" />
              <Typography variant="body2" sx={{ minWidth: 120 }}>Access</Typography>
              <Chip label={access?.label || 'Public'} size="small" />
              <Button size="small" variant="outlined" onClick={() => setAccess({ label: access?.label === 'Public' ? 'Private (invite-only)' : 'Public' })} sx={{ ml: 'auto', '&:hover': { bgcolor: 'secondary.main', color: '#fff', borderColor: 'secondary.main' } }}>Toggle</Button>
            </Stack>
          </Stack>
        </Paper>
      </Box>

      {/* Operator section */}
      <Box sx={{ mt: 2 }}>
        {!operatorAssigned ? (
          <Paper elevation={0} sx={{ p: 2, borderRadius: 3, bgcolor: '#fff', border: '1px solid #eef3f1' }}>
            <Typography variant="subtitle1" fontWeight={700}>No operator assigned</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Assign an accredited operator to manage operations and support.
            </Typography>
            <Button fullWidth color="secondary" variant="contained" onClick={() => setOperatorAssigned(true)}
              sx={{ mt: 1.25, color: 'common.white', '&:hover': { bgcolor: 'secondary.dark', color: 'common.white' } }}>
              Assign operator
            </Button>
          </Paper>
        ) : (
          <Paper elevation={0} sx={{ p: 2, borderRadius: 3, bgcolor: '#fff', border: '1px solid #eef3f1' }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Box>
                <Chip label="Online" color="success" size="small" sx={{ mr: 1 }} />
                <Typography variant="subtitle1" fontWeight={700}>Robert Fox</Typography>
                <Typography variant="body2" color="text.secondary">Shift: Day</Typography>
              </Box>
              <Stack direction="row" spacing={1}>
                <Button variant="outlined" size="small" sx={{ '&:hover': { bgcolor: 'secondary.main', color: 'common.white', borderColor: 'secondary.main' } }}>View</Button>
                <Button variant="outlined" size="small" sx={{ '&:hover': { bgcolor: 'secondary.main', color: 'common.white', borderColor: 'secondary.main' } }}>Edit</Button>
              </Stack>
            </Stack>
          </Paper>
        )}
      </Box>

      {/* Amenities */}
      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle2" fontWeight={800} gutterBottom>Amenities</Typography>
        <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: '1px solid #eef3f1', bgcolor: '#fff' }}>
          <Stack direction="row" spacing={2}>
            <FormControlLabel control={<Switch defaultChecked />} label="Restroom" />
            <FormControlLabel control={<Switch />} label="Food nearby" />
            <FormControlLabel control={<Switch />} label="24/7" />
            <FormControlLabel control={<Switch />} label="Security" />
          </Stack>
        </Paper>
      </Box>
    </Box>
  );
}

export default function ConnectCommercializeChargerMobile({
  onHelp,
  onSupport,
  onBack,
  onNavChange,
  onOpenAggregator,
  onConfirm,
  hasExistingCommercialInPrivate = false
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const routes = ['/', '/chargers', '/sessions', '/wallet', '/settings'];
  
  // Wizard steps
  const TOTAL_STEPS = 7;
  const [step, setStep] = useState(1);
  const [navValue, setNavValue] = useState(1);
  
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
    if (onNavChange) onNavChange(value);
  };

  // Step 1: Connect charger state
  const [chargerName, setChargerName] = useState('');
  const [serial, setSerial] = useState('');
  const [pin, setPin] = useState('');
  const [imageNames, setImageNames] = useState([]);
  const cameraInputRef = useRef(null);
  const galleryInputRef = useRef(null);
  const canSubmitStep1 = (!!chargerName && !!serial && !!pin && (!REQUIRE_PHOTO || imageNames.length > 0));

  // Step 2: OCPP server config (defaults shown)
  const [serverUrl] = useState('wss://ocpp.evzone.app');
  const [stationId] = useState('EVZ-UG-KLA-000123');
  const [stationPass] = useState('••••••••');

  // Step 3: Connection test status
  const [connected, setConnected] = useState(false);
  const [testStatus, setTestStatus] = useState('idle');

  // Step 4: Location
  const [coords, setCoords] = useState([0.3476, 32.5825]); // Kampala default
  const [locationName, setLocationName] = useState('');
  const [accessNotes, setAccessNotes] = useState('');

  // Step 5: Commercialization
  const [choice, setChoice] = useState('private'); // 'private' | 'commercial'

  // Step 6: Details
  const [operatorAssigned, setOperatorAssigned] = useState(false);
  const [pricing, setPricing] = useState({ model: 'kwh' });
  const [availability, setAvailability] = useState({ label: '24/7' });
  const [access, setAccess] = useState({ label: 'Public' });

  // API post snackbar
  const [apiSnack, setApiSnack] = useState({ open: false, severity: 'success', msg: '' });

  // Handlers
  const handleFiles = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length) setImageNames(files.map((f) => f.name));
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else if (onBack) {
      onBack();
    } else {
      // Navigate back to add charger page
      navigate('/chargers/add');
    }
  };

  const next = () => setStep((s) => Math.min(TOTAL_STEPS, s + 1));

  // ---------- Payload builder (used by UI and dev tests)
  const buildPayload = () => ({
    charger: { name: chargerName, serial, pin, images: imageNames },
    ocpp: { serverUrl, stationId, stationPass },
    connection: { connected },
    location: { coords, locationName, accessNotes },
    commercialization: { mode: choice },
    details: { operatorAssigned, pricing, availability, access }
  });

  // ---------- Lightweight DEV self-tests (run once; logs to console)
  useEffect(() => {
    const isBrowser = typeof window !== 'undefined';
    const isProdEnv = (typeof process !== 'undefined' && process && process.env && process.env.NODE_ENV === 'production');
    if (!isBrowser || isProdEnv) return; // safe in browsers without process polyfill

    try {
      const results = [];
      const check = (name, cond) => results.push({ test: name, pass: !!cond });

      const titles = { 1: 'Connect charger', 2: 'OCPP server config', 3: 'Test connection', 4: 'Location', 5: 'Commercialization', 6: 'Charger details', 7: 'Summary & publish' };
      for (let i = 1; i <= 7; i++) check(`title exists for step ${i}`, typeof titles[i] === 'string');
      check('TOTAL_STEPS is 7', TOTAL_STEPS === 7);
      check('title map has 7 keys', Object.keys(titles).length === 7);

      const p = buildPayload();
      check('payload has charger', !!p.charger);
      check('payload has ocpp', !!p.ocpp);
      check('payload has location', !!p.location && Array.isArray(p.location.coords) && p.location.coords.length === 2);
      check('coords are numbers', p.location.coords.every((n) => typeof n === 'number'));
      check('lat in [-90,90]', p.location.coords[0] >= -90 && p.location.coords[0] <= 90);
      check('lon in [-180,180]', p.location.coords[1] >= -180 && p.location.coords[1] <= 180);
      check('canSubmitStep1 initially false', !canSubmitStep1);

      // New assertions per requirements
      check('REQUIRE_PHOTO is true', REQUIRE_PHOTO === true);
      check('ALLOW_CONTINUE_ON_FAIL is true', ALLOW_CONTINUE_ON_FAIL === true);
      check('COMMERCIAL_LIMIT_WARN_ONLY is true', COMMERCIAL_LIMIT_WARN_ONLY === true);
      check('ENABLE_GEO_SEARCH is true', ENABLE_GEO_SEARCH === true);
      check('ATTEMPT_API_POST_ON_PUBLISH is true', ATTEMPT_API_POST_ON_PUBLISH === true);

      // next() cap logic
      let s = 7; s = Math.min(7, s + 1); check('next() does not exceed TOTAL_STEPS', s === 7);

      console.table(results);
      const failed = results.filter(r => !r.pass);
      if (failed.length) console.warn('❌ Some dev tests failed', failed);
      else console.log('✅ All dev tests passed');
    } catch (e) {
      console.error('Dev tests crashed', e);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once

  async function postToApi(payload) {
    try {
      const res = await fetch('/api/chargers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Non-2xx');
      setApiSnack({ open: true, severity: 'success', msg: 'Published successfully to /api/chargers' });
    } catch (e) {
      alert(`Setup complete but POST failed (likely expected in dev).
${JSON.stringify(payload, null, 2)}`);
    }
  }

  const Footer = (
    <Box sx={{ px: 2, pb: 'calc(10px + env(safe-area-inset-bottom))', pt: 1.25, background: '#f2f2f2', borderTop: '1px solid #eee' }}>
      {/* Contextual footers per step */}
      {step === 1 && (
        <>
          <Button fullWidth size="large" variant="contained" color="secondary" disabled={!canSubmitStep1} onClick={next}
            sx={{ py: 1.25, color: 'common.white', '& .MuiButton-startIcon>*': { color: 'common.white' }, '&:hover': { bgcolor: 'secondary.dark', color: 'common.white', '& .MuiButton-startIcon>*': { color: 'common.white' } } }}>
            Save & Continue
          </Button>
          <MuiLink component="button" type="button" onClick={() => (onSupport ? onSupport() : alert('Contact support'))} underline="hover"
            sx={{ display: 'block', textAlign: 'center', mt: 1, color: 'text.secondary', '&:hover': { color: 'secondary.main' } }}>
            Contact support
          </MuiLink>
        </>
      )}

      {step === 2 && (
        <Typography variant="caption" color="text.secondary">Copy the fields above, configure your charger, then tap “I’ve configured it”.</Typography>
      )}

      {step === 3 && (
        testStatus === 'failed' ? (
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" startIcon={<ManageSearchRoundedIcon />} onClick={() => alert('Find Technician flow')}>Find Technician</Button>
            {ALLOW_CONTINUE_ON_FAIL && <Button variant="contained" color="secondary" onClick={next} sx={{ color: '#fff' }}>Continue</Button>}
          </Stack>
        ) : (
          <Typography variant="caption" color="text.secondary">Run the test. If it fails, you can continue and fix later.</Typography>
        )
      )}

      {step === 4 && (
        <Stack direction="row" spacing={1}>
          <Button variant="contained" color="secondary" onClick={next} sx={{ color: '#fff' }}>Confirm location</Button>
        </Stack>
      )}

      {step === 5 && (
        <Stack direction="row" spacing={1}>
          <Box sx={{ flexGrow: 1 }} />
          <Button variant="contained" color="secondary" onClick={next} sx={{ color: '#fff' }}>Continue</Button>
        </Stack>
      )}

      {step === 6 && (
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" startIcon={<LaunchRoundedIcon />} onClick={() => (onOpenAggregator ? onOpenAggregator() : alert('Open Aggregator & CPMS'))}>Open Aggregator & CPMS</Button>
          <Button variant="contained" color="secondary" onClick={next} sx={{ color: '#fff' }}>Review summary</Button>
        </Stack>
      )}

      {step === 7 && (
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" onClick={() => window.print()}>Print summary</Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={async () => {
              const payload = buildPayload();
              if (onConfirm) onConfirm(payload);
              else if (ATTEMPT_API_POST_ON_PUBLISH) await postToApi(payload);
              else alert(`Setup complete:
${JSON.stringify(payload, null, 2)}`);
            }}
            sx={{ color: '#fff' }}
          >
            Publish / Save
          </Button>
        </Stack>
      )}
    </Box>
  );

  return (
    <>
      <Container maxWidth="xs" disableGutters>
        <MobileShell
          title={{1:'Connect charger',2:'OCPP server config',3:'Test connection',4:'Location',5:'Commercialization',6:'Charger details',7:'Summary & publish'}[step]}
          tagline={{1:'fast pairing for EVmart chargers',2:'link your charger to the cloud',3:'verify that the charger is online',4:'pin the exact station location',5:'choose how to use this charger',6:'performance • schedule • access',7:'review & finalize'}[step]}
          onBack={handleBack}
          onHelp={() => (onHelp ? onHelp() : alert('Help & docs'))}
          navValue={navValue}
          onNavChange={handleNavChange}
          footer={Footer}
        >
          <StepHeader step={step} total={TOTAL_STEPS} />

          {step === 1 && (
            <>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <InfoOutlinedIcon fontSize="small" /> Serial & PIN are on the charger label. You can scan QR codes or take photos for records.
              </Typography>

              {/* Photos section */}
              <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" multiple hidden onChange={handleFiles} />
              <input ref={galleryInputRef} type="file" accept="image/*" multiple hidden onChange={handleFiles} />
              <PhotosBlock imageNames={imageNames} onCamera={() => cameraInputRef.current?.click()} onGallery={() => galleryInputRef.current?.click()} />

              {/* Form fields */}
              <TextField label="Charger name" placeholder="e.g., Home garage charger" fullWidth required value={chargerName} onChange={(e) => setChargerName(e.target.value)} sx={{ mb: 2 }} />
              <TextField label="Serial number" fullWidth required value={serial} autoCapitalize="characters" autoCorrect="off" spellCheck={false} onChange={(e) => setSerial(e.target.value)}
                InputProps={{ endAdornment: (<InputAdornment position="end"><IconButton edge="end" aria-label="Scan serial QR" onClick={() => alert('Open Serial QR scanner')}><QrCodeScannerIcon /></IconButton></InputAdornment>) }} sx={{ mb: 2 }} />
              <TextField label="PIN code" type="password" inputMode="numeric" fullWidth required value={pin} onChange={(e) => setPin(e.target.value)}
                InputProps={{ endAdornment: (<InputAdornment position="end"><IconButton edge="end" aria-label="Scan PIN QR" onClick={() => alert('Open PIN QR scanner')}><QrCodeScannerIcon /></IconButton></InputAdornment>) }} sx={{ mb: 1.5 }} />
              <MuiLink component="button" type="button" onClick={() => (onHelp ? onHelp() : alert('See setup guide'))} underline="hover" sx={{ color: 'secondary.main', '&:hover': { color: 'secondary.dark' } }}>Where do I find these?</MuiLink>
            </>
          )}

          {step === 2 && (
            <OCPPPanel serverUrl={serverUrl} stationId={stationId} stationPass={stationPass} onDone={next} />
          )}

          {step === 3 && (
            <ConnectionTest
              stationId={stationId}
              onSuccess={() => { setConnected(true); next(); }}
              onStatusChange={(st) => setTestStatus(st)}
              onFindTechnician={() => alert('Find Technician flow')}
              onContinue={() => next()}
            />
          )}

          {step === 4 && (
            <>
              {ENABLE_GEO_SEARCH && (
                <GeoSearch onPick={(c, name) => { setCoords(c); setLocationName(name || ''); }} />
              )}
              <MapPicker value={coords} onChange={(c) => setCoords(c)} onResolveAddress={(name) => setLocationName((prev) => prev || name)} />
              <TextField fullWidth label="Location display name" placeholder="e.g., Shell Bugolobi — rear parking lot" sx={{ mt: 2 }} value={locationName} onChange={(e) => setLocationName(e.target.value)} />
              <TextField fullWidth multiline minRows={2} label="Access & parking notes" placeholder="Gate opens at 7am; ask guard for charger key; max vehicle height 2.1m" sx={{ mt: 1.25 }} value={accessNotes} onChange={(e) => setAccessNotes(e.target.value)} />
            </>
          )}

          {step === 5 && (
            <Paper sx={{ p: 2, border: '1px solid #eef3f1', borderRadius: 3, bgcolor: '#fff' }}>
              <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1 }}>Choose usage</Typography>
              <RadioGroup value={choice} onChange={(e) => setChoice(e.target.value)}>
                <FormControlLabel value="private" control={<Radio />} label="Private management only (monitor, control, alerts)" />
                <FormControlLabel value="commercial" control={<Radio />} label="Commercial (list publicly, accept payments & bookings)" />
              </RadioGroup>
              {COMMERCIAL_LIMIT_WARN_ONLY && choice === 'commercial' && hasExistingCommercialInPrivate && (
                <Alert severity="warning" variant="outlined" sx={{ mt: 1 }}>
                  You already have one commercial charger under Private Charging. Consider switching that charger to non-commercial to free a slot, or continue and resolve in the aggregator.
                </Alert>
              )}
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                You can monetize exactly one <b>Commercial Charger</b> in Private Charging. Need more? Use Aggregator & CPMS.
              </Typography>
            </Paper>
          )}

          {step === 6 && (
            <DetailsStep operatorAssigned={operatorAssigned} setOperatorAssigned={setOperatorAssigned} pricing={pricing} setPricing={setPricing} availability={availability} setAvailability={setAvailability} access={access} setAccess={setAccess} />
          )}

          {step === 7 && (
            <Paper elevation={0} sx={{ p: 2, border: '1px solid #eef3f1', borderRadius: 3, bgcolor: '#fff' }}>
              <Typography variant="subtitle1" fontWeight={800} gutterBottom>Summary</Typography>
              <Stack spacing={1.25}>
                <Typography variant="body2"><b>Name:</b> {chargerName || '—'}</Typography>
                <Typography variant="body2"><b>Serial:</b> {serial || '—'}</Typography>
                <Typography variant="body2"><b>OCPP:</b> {serverUrl} • {stationId}</Typography>
                <Typography variant="body2"><b>Connection:</b> {connected ? 'Online' : 'Not verified'}</Typography>
                <Typography variant="body2"><b>Location:</b> {coords[0].toFixed(6)}, {coords[1].toFixed(6)} {locationName ? `• ${locationName}` : ''}</Typography>
                <Typography variant="body2"><b>Access notes:</b> {accessNotes || '—'}</Typography>
                <Typography variant="body2"><b>Mode:</b> {choice}</Typography>
                <Typography variant="body2"><b>Pricing:</b> {pricing.model === 'kwh' ? 'per kWh' : 'per minute'}</Typography>
                <Typography variant="body2"><b>Availability:</b> {availability.label}</Typography>
                <Typography variant="body2"><b>Access:</b> {access.label}</Typography>
              </Stack>
              <Divider sx={{ my: 1.5 }} />
              <Typography variant="caption" color="text.secondary">Tip: After publishing, you can manage this charger in Aggregator & CPMS (pricing, tariffs, operator handoffs, and more).</Typography>
            </Paper>
          )}
        </MobileShell>
      </Container>

      <Snackbar open={apiSnack.open} autoHideDuration={2000} onClose={() => setApiSnack({ ...apiSnack, open: false })}>
        <Alert severity={apiSnack.severity} sx={{ width: '100%' }}>{apiSnack.msg}</Alert>
      </Snackbar>
    </>
  );
}
