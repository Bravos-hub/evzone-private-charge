import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { alpha } from '@mui/material/styles';
import {
  Box, Paper, Stack, Grid, Typography, Button, Chip, Tooltip,
  FormControl, Select, MenuItem, IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
  Divider, Link
} from '@mui/material';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import PauseRoundedIcon from '@mui/icons-material/PauseRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import StopRoundedIcon from '@mui/icons-material/StopRounded';
import FlashOnRoundedIcon from '@mui/icons-material/FlashOnRounded';
import TimelineRoundedIcon from '@mui/icons-material/TimelineRounded';
import LocalGasStationRoundedIcon from '@mui/icons-material/LocalGasStationRounded';
import SpeedRoundedIcon from '@mui/icons-material/SpeedRounded';
import RequestQuoteRoundedIcon from '@mui/icons-material/RequestQuoteRounded';
import MobileShell from '../../components/layout/MobileShell';

/********************
 * EVzone palette
 ********************/
const EV = { green: '#03cd8c', orange: '#f77f00', bg: '#f2f2f2', divider: '#eef3f1' };

/********************
 * RING + SPARKLINE
 ********************/
function Ring({ percent = 0, size = 212, thickness = 16, active = true, bounce = false, dim = false }) {
  const angle = Math.min(Math.max(percent, 0), 100) * 3.6;
  const ringColor = dim ? alpha(EV.green, 0.45) : EV.green;
  return (
    <Box sx={{ position: 'relative', width: size, height: size, mx: 'auto', ...(bounce && { animation: 'pop .5s ease-out' }), '@keyframes pop': { '0%': { transform: 'scale(.98)' }, '50%': { transform: 'scale(1.04)' }, '100%': { transform: 'scale(1)' } } }}>
      <Box sx={{ position: 'absolute', inset: -10, borderRadius: '50%', boxShadow: `0 0 40px ${alpha(ringColor, .35)}`, filter: 'blur(2px)' }} />
      <Box sx={{ width: '100%', height: '100%', borderRadius: '50%', background: `conic-gradient(${ringColor} ${angle}deg, #e9eceb 0deg)`, WebkitMask: `radial-gradient(circle ${size/2 - thickness}px, transparent 98%, black 99%)`, mask: `radial-gradient(circle ${size/2 - thickness}px, transparent 98%, black 99%)` }} />
      <Box sx={{ position: 'absolute', inset: thickness, borderRadius: '50%', display: 'grid', placeItems: 'center', bgcolor: '#fff' }}>
        <Stack alignItems='center' spacing={0}>
          <Typography variant='h3' fontWeight={900}>{Math.round(percent)}%</Typography>
          <Stack direction='row' spacing={0.5} alignItems='center'>
            <BoltRoundedIcon sx={{ color: ringColor }} fontSize='small' />
            <Typography variant='caption' color='text.secondary'>State of charge</Typography>
          </Stack>
        </Stack>
      </Box>
      {active && (
        <Box sx={{ position: 'absolute', inset: thickness/2, borderRadius: '50%', mask: `radial-gradient(circle ${size/2 - thickness}px, transparent 98%, black 99%)`, background: `conic-gradient(from 0deg, ${alpha(ringColor,.0)} 0 60%, ${alpha(ringColor,.25)} 60% 70%, ${alpha(ringColor,.0)} 70% 100%)`, animation: 'spin 3s linear infinite', '@keyframes spin': { from:{ transform:'rotate(0deg)' }, to:{ transform:'rotate(360deg)' } } }} />
      )}
      <Box sx={{ position: 'absolute', inset: 0, borderRadius: '50%', animation: active ? 'pulse 2.4s ease-out infinite' : 'none', border: `2px solid ${alpha(ringColor,.25)}`, '@keyframes pulse': { from:{ transform:'scale(.96)', opacity:.6 }, to:{ transform:'scale(1.06)', opacity:0 } } }} />
    </Box>
  );
}

function Spark({ data = [], color = EV.orange }) {
  const W=200,H=42,P=4; if(!data.length) return null;
  const max=Math.max(...data), step=(W-P*2)/(data.length-1);
  const x=i=>P+i*step, y=v=>H-P-(v/(max||1))*(H-P*2);
  const d=data.map((v,i)=>`${i?'L':'M'} ${x(i)} ${y(v)}`).join(' ');
  const area=`${d} L ${x(data.length-1)} ${H-P} L ${x(0)} ${H-P} Z`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H}>
      <path d={area} fill={alpha(color,.15)} />
      <path d={d} fill='none' stroke={color} strokeWidth='2' strokeLinecap='round' />
    </svg>
  );
}

/********************
 * SCREEN — 14 Charging Live Session (mobile)
 ********************/
export default function ChargingLive14({ onBack, onHelp, onNavChange }) {
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
      navigate('/sessions');
    }
  }, [navigate, onBack]);

  // demo state (safe fallback)
  const [chargers] = useState([
    { id:'st1', name:'Home Charger', connectors:[{id:'c1',label:'CCS 1'},{id:'c2',label:'Type 2'}] },
    { id:'st2', name:'Office Charger', connectors:[{id:'c1',label:'CCS 2'}] }
  ]);
  const [chargerId, setChargerId] = useState('st1');
  const [connectorId, setConnectorId] = useState('c1');

  const [percent, setPercent] = useState(44);
  const [kwh, setKwh] = useState(6.68);
  const [rate] = useState(1200);
  const [amount, setAmount] = useState(19181);
  const [powerKW, setPowerKW] = useState(25.5);
  const [elapsed, setElapsed] = useState(66);
  const [paused, setPaused] = useState(false);
  const [resumedPulse, setResumedPulse] = useState(false);
  const [showStop, setShowStop] = useState(false);
  const [trend, setTrend] = useState([18,21,24,26,24,27,25]);
  const [ended, setEnded] = useState(false);           // 100% full session end
  const [supplyOn] = useState(true);      // power supply state
  const [resumeBlocked, setResumeBlocked] = useState(false);
  const [showInfo, setShowInfo] = useState({ open:false, title:'', message:'' });
  const [isMobileRequest] = useState(false);           // when true, show ETA; else N/A
  const [vehicleConnected] = useState(false);          // BLE/OBD status for Est. range

  // Commercial policy — only one monetizable charger
  const [commercialChargerId] = useState('st1');
  const isCommercial = chargerId === commercialChargerId;          // BLE/OBD status for Est. range

  // live tick: power trend always updates; counters update only when active
  useEffect(()=>{
    const t=setInterval(()=>{
      // simulate supply fluctuation
      setPowerKW(w => {
        const next = supplyOn ? (w + (Math.random()*2-1)) : Math.max(0, w - 0.8);
        const kw = +Math.max(0, Math.min(80, next)).toFixed(1);
        setTrend(tr => (tr.length>30 ? tr.slice(1) : tr).concat(kw));
        return kw;
      });

      const canCount = !paused && supplyOn && !ended;
      if (canCount) {
        setElapsed(s => s + 1);
        setKwh(v => +(v + powerKW/3600).toFixed(3));
        setAmount(a => a + Math.round((powerKW/3600) * rate));
        setPercent(p => {
          const np = Math.min(100, p + 0.05);
          if (np >= 100 && !ended) {
            // Auto stop when full
            setEnded(true);
            setPaused(true);
            setShowInfo({ open:true, title:'Charging complete', message:'Battery is full (100%). You can stop the session now.' });
          }
          return np;
        });
      }

      // Auto-pause if supply lost
      if (!supplyOn && !paused) {
        setPaused(true);
        setResumeBlocked(true);
        setShowInfo({ open:true, title:'Power supply lost', message:'Charging was paused because power supply stopped. You can stop the session or wait until power is restored.' });
      }
    }, 1000);
    return ()=>clearInterval(t);
  }, [paused, supplyOn, ended, powerKW, rate]);

  // Resume bounce chip
  useEffect(()=>{ if(!paused){ setResumedPulse(true); const t=setTimeout(()=>setResumedPulse(false),500); return ()=>clearTimeout(t);} },[paused]);

  const hhmmss = useMemo(()=>{
    const h=String(Math.floor(elapsed/3600)).padStart(2,'0');
    const m=String(Math.floor((elapsed%3600)/60)).padStart(2,'0');
    const s=String(elapsed%60).padStart(2,'0');
    return `${h}:${m}:${s}`;
  },[elapsed]);

  const handlePauseResume = () => {
    if (paused) {
      if (ended) {
        setShowInfo({ open:true, title:'Cannot resume', message:'Charging is already complete (100%). Please stop the session.' });
        return;
      }
      if (resumeBlocked && !supplyOn) {
        setShowInfo({ open:true, title:'Cannot resume', message:'Power supply is still off. You can stop the session or wait until power returns.' });
        return;
      }
      // OK to resume
      setPaused(false);
      setResumeBlocked(false);
      return;
    }
    setPaused(true);
  };

  const footerSlot = (
    <Box sx={{ px:2, pb:'calc(12px + env(safe-area-inset-bottom))', pt: 1.5, background: '#f2f2f2', borderTop: '1px solid #e9eceb' }}>
      <Stack direction="row" spacing={1} justifyContent="center">
        <Button
          variant={paused ? 'contained' : 'outlined'}
          startIcon={paused ? <PlayArrowRoundedIcon/> : <PauseRoundedIcon />}
          onClick={handlePauseResume}
          sx={{
            borderRadius: 999,
            minWidth: 160,
            ...(paused
              ? { bgcolor: EV.green, color: '#fff', '&:hover': { bgcolor: alpha(EV.green, .85) } }
              : { color: EV.orange, borderColor: EV.orange, '&:hover': { bgcolor: EV.orange, color: 'white', borderColor: EV.orange } }
            )
          }}
        >
          {paused ? 'Resume' : 'Pause'}
        </Button>
        <Button
          variant='contained'
          color='error'
          startIcon={<StopRoundedIcon />}
          disabled={showStop}
          onClick={() => setShowStop(true)}
          sx={{ borderRadius: 999, minWidth: 160, color: 'white', '&:hover': { bgcolor: (t)=>t.palette.error.dark } }}
        >
          Stop
        </Button>
      </Stack>
    </Box>
  );

  return (
    <MobileShell title='Charging session' subtitle='power • energy • time' navValue={navValue} onNavChange={handleNavChange} onBack={handleBack} onHelp={onHelp} footerSlot={footerSlot}>
      <Box>
        {/* My chargers card (single row) */}
        <Paper sx={{ p:2, borderRadius:3, bgcolor:'#fff', border:`1px solid ${EV.divider}`, mb:2 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <FormControl size='small' sx={{ flex: 1 }}>
              <Select value={chargerId} onChange={(e)=>{ setChargerId(e.target.value); setConnectorId('c1'); }}>
                {chargers.map(c=>(<MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>))}
              </Select>
            </FormControl>
            <FormControl size='small' sx={{ width: 160 }}>
              <Select value={connectorId} onChange={(e)=>setConnectorId(e.target.value)}>
                {(chargers.find(c=>c.id===chargerId)?.connectors||[]).map(k=> (<MenuItem key={k.id} value={k.id}>{k.label}</MenuItem>))}
              </Select>
            </FormControl>
          </Stack>
        </Paper>

        {/* Ring block */}
        <Box sx={{ mt:2 }}>
          <Ring percent={percent} active={!paused && supplyOn && !ended} bounce={resumedPulse} dim={paused || ended || !supplyOn} />
        </Box>
        <Typography variant='caption' color='text.secondary' sx={{ display:'block', textAlign:'center', mt:.5 }}>
          {chargers.find(c=>c.id===chargerId)?.name}
        </Typography>
        {resumedPulse && (
          <Box sx={{ textAlign:'center', mt:.5 }}>
            <Chip size='small' label='Resuming…' color='secondary' variant='outlined' />
          </Box>
        )}

        {/* Info strip (mobile, centered) */}
        <Paper variant='outlined' sx={{ mt:2, p:1.25, borderRadius:3 }}>
          <Stack direction='row' alignItems='center' justifyContent='space-evenly' divider={<Divider flexItem orientation='vertical' />}> 
            <Box sx={{ textAlign:'center' }}>
              <Typography variant='caption' color='text.secondary'>Battery</Typography>
              <Stack direction='row' spacing={0.5} alignItems='center' justifyContent='center'>
                <BoltRoundedIcon fontSize='small'/>
                <Typography variant='subtitle2' fontWeight={800}>{Math.round(percent)}%</Typography>
              </Stack>
            </Box>
            <Box sx={{ textAlign:'center' }}>
              <Typography variant='caption' color='text.secondary'>Est. range</Typography>
              {vehicleConnected
                ? <Typography variant='subtitle2' fontWeight={800}>{Math.round(kwh*6)} km</Typography>
                : <Typography variant='subtitle2' fontWeight={800}>N/A</Typography>}
            </Box>
            <Box sx={{ textAlign:'center' }}>
              <Typography variant='caption' color='text.secondary'>ETA 80%</Typography>
              <Typography variant='subtitle2' fontWeight={800}>{isMobileRequest ? etaToTarget(percent, 80, powerKW) : 'N/A'}</Typography>
            </Box>
          </Stack>
        </Paper>

        {!vehicleConnected && (
          <Paper sx={{ mt:1, p:1, borderRadius:2, border:`1px dashed ${EV.divider}`, bgcolor: alpha(EV.orange,.06) }}>
            <Typography variant='caption' color='text.secondary'>Est. range is unavailable because your vehicle is not connected. </Typography>
            <Link component='button' variant='caption' onClick={()=>console.info('Open vehicle connection flow')} sx={{ ml: .5, color: EV.orange }}>Connect now</Link>
          </Paper>
        )}

        {/* Commercial note */}
        {!isCommercial && (
          <Paper sx={{ mt:1, p:1, borderRadius:2, border:`1px dashed ${EV.divider}`, bgcolor: alpha(EV.orange,.06) }}>
            <Typography variant='caption' color='text.secondary'>This charger is not commercial. Amount and payments are N/A. To enable public pricing and payments, make this your Commercial Charger.</Typography>
          </Paper>
        )}

        {/* Metrics grid (3-up centered + full-width power) */}
        <Grid container spacing={1} sx={{ mt: 2 }} justifyContent="center" alignItems="stretch">
          <Grid item xs={4}><Metric label='Energy' icon={<FlashOnRoundedIcon/>} value={`${kwh.toFixed(2)} kWh`} /></Grid>
          <Grid item xs={4}><Metric label='Duration' icon={<TimelineRoundedIcon/>} value={hhmmss} /></Grid>
          <Grid item xs={4}><Metric label='Amount' icon={<LocalGasStationRoundedIcon/>} value={isCommercial ? `UGX ${amount.toLocaleString()}` : 'N/A'} /></Grid>
          <Grid item xs={12}>
            <Paper sx={{ p:1.25, borderRadius:3, border:`1px solid ${EV.divider}`, textAlign:'center' }}>
              <Stack direction='row' spacing={.5} alignItems='center' justifyContent='center'>
                <SpeedRoundedIcon/>
                <Typography variant='caption' color='text.secondary'>Power</Typography>
              </Stack>
              <Box sx={{ mt: 0.5 }}>
                <Spark data={[...trend]} color={EV.orange} />
              </Box>
              <Chip size='small' label={`${powerKW.toFixed(1)} kW`} sx={{ bgcolor:EV.orange, color:'#fff', mt: .5, alignSelf:'center' }} />
            </Paper>
          </Grid>
        </Grid>

        {/* Quick actions under ring (mobile) */}
        <Stack direction='row' spacing={1} sx={{ mt: 2, justifyContent:'center' }}>
          <Tooltip title='Scan to share'><IconButton onClick={()=>console.info('QR')}><QrCodeScannerIcon/></IconButton></Tooltip>
          <Tooltip title='Copy session link'><IconButton onClick={()=>console.info('Link')}><RequestQuoteRoundedIcon/></IconButton></Tooltip>
        </Stack>

        {/* Stop dialog */}
        <Dialog open={showStop} onClose={()=>setShowStop(false)} fullWidth>
          <DialogTitle>End charging?</DialogTitle>
          <DialogContent>
            <Typography variant='body2'>Energy <b>{kwh.toFixed(2)} kWh</b> • Duration <b>{hhmmss}</b> • Total <b>{isCommercial ? `UGX ${amount.toLocaleString()}` : 'N/A'}</b></Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={()=>setShowStop(false)}>Cancel</Button>
            <Button variant='contained' color='error' sx={{ color:'#fff' }} onClick={()=>{ setShowStop(false); console.info('Stop → Summary'); }}>Stop & view summary</Button>
          </DialogActions>
        </Dialog>

        {/* Info dialog (complete, supply lost, cannot resume) */}
        <Dialog open={showInfo.open} onClose={()=>setShowInfo(s=>({...s, open:false}))} fullWidth>
          <DialogTitle>{showInfo.title || 'Info'}</DialogTitle>
          <DialogContent>
            <Typography variant='body2'>{showInfo.message || '—'}</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={()=>setShowInfo(s=>({...s, open:false}))}>Close</Button>
            <Button color='error' variant='contained' onClick={()=>{ setShowInfo(s=>({...s, open:false})); setShowStop(true); }}>Stop session</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </MobileShell>
  );
}

function Metric({ icon, label, value }){
  return (
    <Paper sx={{ p:1.25, borderRadius:3, border:`1px solid ${EV.divider}`, textAlign:'center' }}>
      <Stack direction='row' spacing={.5} alignItems='center' justifyContent='center'>
        <Box sx={{ color:'text.secondary' }}>{icon}</Box>
        <Typography variant='caption' color='text.secondary'>{label}</Typography>
      </Stack>
      <Typography variant='subtitle1' fontWeight={800}>{value}</Typography>
    </Paper>
  );
}

/**
 * Usage tests (keep for sanity):
 * 1) Auto‑stop at 100%: session ends, counters freeze, power graph continues.
 * 2) Supply lost: auto‑pause, resume blocked with explanation + Stop option; resumes when supply returns.
 * 3) ETA shows N/A unless isMobileRequest === true.
 * 4) Est. range shows N/A unless vehicleConnected === true; shows connect link.
 */

function etaToTarget(currentPct, targetPct, kw){
  const remainingPct = Math.max(0, targetPct - currentPct);
  const kWhPerPct = 0.6; // ~60kWh pack assumption (1% ≈ 0.6 kWh)
  const hours = (remainingPct * kWhPerPct) / Math.max(kw, 1);
  const totalMins = Math.round(hours * 60);
  const h = Math.floor(totalMins/60), m = totalMins % 60;
  return h>0 ? `${h}h ${m}m` : `${m}m`;
}
