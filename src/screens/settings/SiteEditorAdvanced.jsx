import React, { useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import {
  CssBaseline, Container, Box, Typography, Paper, Stack, Button, IconButton,
  AppBar, Toolbar, BottomNavigation, BottomNavigationAction, FormControl, Select, MenuItem, TextField,
  Switch, FormControlLabel, List, ListItemButton
} from '@mui/material';
import PlaceRoundedIcon from '@mui/icons-material/PlaceRounded';
import MapRoundedIcon from '@mui/icons-material/MapRounded';
import AddPhotoAlternateRoundedIcon from '@mui/icons-material/AddPhotoAlternateRounded';
import AddLocationAltRoundedIcon from '@mui/icons-material/AddLocationAltRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import EvStationIcon from '@mui/icons-material/EvStation';
import HistoryIcon from '@mui/icons-material/History';
import AccountBalanceWalletRoundedIcon from '@mui/icons-material/AccountBalanceWalletRounded';
import SupportAgentRoundedIcon from '@mui/icons-material/SupportAgentRounded';

const theme = createTheme({ palette: { primary: { main: '#03cd8c' }, secondary: { main: '#f77f00' }, background: { default: '#f2f2f2' } }, shape: { borderRadius: 7 }, typography: { fontFamily: 'Inter, Roboto, Arial, sans-serif' } });

function MobileShell({ title, tagline, onBack, onHelp, navValue, onNavChange, footer, children }) {
  const handleBack = () => { if (onBack) return onBack(); console.info('Navigate back'); };
  return (
    <Box sx={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
      <AppBar position="fixed" elevation={1} color="primary"><Toolbar sx={{ px: 0 }}>
        <Box sx={{ width: '100%', maxWidth: 480, mx: 'auto', px: 1, display: 'flex', alignItems: 'center' }}>
          <IconButton size="small" edge="start" onClick={handleBack} aria-label="Back" sx={{ color: 'common.white', mr: 1 }}><ArrowBackIosNewIcon fontSize="small" /></IconButton>
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" color="inherit" sx={{ fontWeight: 700, lineHeight: 1.15 }}>{title}</Typography>
            {tagline && <Typography variant="caption" color="common.white" sx={{ opacity: 0.9 }}>{tagline}</Typography>}
          </Box>
          <Box sx={{ flexGrow: 1 }} />
          <IconButton size="small" edge="end" aria-label="Help" onClick={onHelp} sx={{ color: 'common.white' }}><HelpOutlineIcon fontSize="small" /></IconButton>
        </Box>
      </Toolbar></AppBar>
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

function HoursTable({ hours, onChange }) {
  const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  return (
    <Stack spacing={0.75}>
      {days.map(d => (
        <Stack key={d} direction="row" spacing={1} alignItems="center">
          <Typography variant="caption" sx={{ width: 36 }}>{d}</Typography>
          <FormControlLabel control={<Switch checked={hours[d]?.open ?? true} onChange={(e)=>onChange(d,{...hours[d], open: e.target.checked})} />} label="Open" />
          <TextField type="time" size="small" label="Start" InputLabelProps={{ shrink: true }} value={hours[d]?.start || '08:00'} onChange={(e)=>onChange(d,{...hours[d], start: e.target.value})} sx={{ maxWidth: 120 }} />
          <TextField type="time" size="small" label="End" InputLabelProps={{ shrink: true }} value={hours[d]?.end || '18:00'} onChange={(e)=>onChange(d,{...hours[d], end: e.target.value})} sx={{ maxWidth: 120 }} />
        </Stack>
      ))}
    </Stack>
  );
}

export default function SiteEditorAdvanced({
  sites = [{ id: 'st1', name: 'Home Site' }, { id: 'st2', name: 'Office Site' }],
  defaultSiteId = 'st1',
  onBack, onHelp, onNavChange,
  onSaveSite, onDeleteSite, onUploadPhotos, onOpenMobileRequests, onUseMyLocation
}) {
  const [navValue, setNavValue] = useState(1);
  const [siteId, setSiteId] = useState(defaultSiteId);
  const [name, setName] = useState('EVzone Site');
  const [address, setAddress] = useState('Kampala, Uganda');
  const [desc, setDesc] = useState('');
  const [lat, setLat] = useState(-0.3476);
  const [lng, setLng] = useState(32.5825);
  const [fence, setFence] = useState([{ lat: -0.347, lng: 32.582 }, { lat:-0.348, lng:32.581 }]);
  const [notes, setNotes] = useState('');
  const [hours, setHours] = useState({});
  const [mobileStation, setMobileStation] = useState(false);
  const [photos, setPhotos] = useState([]);
  const [photoPreviews, setPhotoPreviews] = useState([]);

  const addFencePoint = () => setFence(prev => [...prev, { lat, lng }]);
  const removeFencePoint = (i) => setFence(prev => prev.filter((_,idx)=>idx!==i));

  const onSelectPhotos = (e) => {
    const files = Array.from(e.target.files || []);
    setPhotos(files);
    setPhotoPreviews(files.map(f => URL.createObjectURL(f)));
  };

  const Footer = (
    <Box sx={{ px: 2, pb: 'calc(12px + env(safe-area-inset-bottom))', pt: 1.5, background: '#f2f2f2', borderTop: '1px solid #e9eceb' }}>
      <Stack direction="row" spacing={1}>
        <Button
          variant="outlined"
          startIcon={<MapRoundedIcon />}
          onClick={() => (mobileStation && onOpenMobileRequests ? onOpenMobileRequests({ siteId }) : console.info('Open: 47 — Mobile Station Requests'))}
          disabled={!mobileStation}
          sx={{ '&:hover': { bgcolor: 'secondary.main', color: 'common.white', borderColor: 'secondary.main' } }}
        >
          Mobile requests
        </Button>
        <Button variant="outlined" color="error" startIcon={<DeleteOutlineRoundedIcon />} onClick={() => (onDeleteSite ? onDeleteSite({ siteId }) : console.info('Delete site', siteId))}>Delete</Button>
        <Button variant="contained" color="secondary" onClick={() => (onSaveSite ? onSaveSite({ siteId, name, address, desc, lat, lng, fence, notes, hours, mobileStation }) : console.info('Save site'))}
          sx={{ ml: 'auto', color: 'common.white', '&:hover': { bgcolor: 'secondary.dark', color: 'common.white' } }}>Save</Button>
      </Stack>
    </Box>
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="xs" disableGutters>
        <MobileShell title="Site editor (advanced)" tagline="details • pin • geo‑fence • photos • hours" onBack={onBack} onHelp={onHelp} navValue={navValue} onNavChange={(v)=>{ setNavValue(v); onNavChange&&onNavChange(v); }} footer={Footer}>
          <Box sx={{ px: 2, pt: 2 }}>
            {/* Site selector */}
            <Paper elevation={0} sx={{ p: 2, borderRadius: 1.5, bgcolor: '#fff', border: '1px solid #eef3f1', mb: 2 }}>
              <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1 }}>My sites</Typography>
              <FormControl size="small" fullWidth>
                <Select value={siteId} onChange={(e)=>setSiteId(e.target.value)}>
                  {sites.map(s => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
                </Select>
              </FormControl>
            </Paper>

            {/* Details */}
            <Paper elevation={0} sx={{ p: 2, borderRadius: 1.5, bgcolor: '#fff', border: '1px solid #eef3f1' }}>
              <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1 }}>Details</Typography>
              <Stack spacing={1.25}>
                <TextField label="Name" value={name} onChange={(e)=>setName(e.target.value)} fullWidth />
                <TextField label="Address" value={address} onChange={(e)=>setAddress(e.target.value)} fullWidth />
                <TextField label="Description" value={desc} onChange={(e)=>setDesc(e.target.value)} fullWidth multiline rows={3} />
                <FormControlLabel control={<Switch checked={mobileStation} onChange={(e)=>setMobileStation(e.target.checked)} />} label="Mobile station" />
              </Stack>
            </Paper>

            {/* Pin & geofence */}
            <Paper elevation={0} sx={{ mt: 2, p: 2, borderRadius: 1.5, bgcolor: '#fff', border: '1px solid #eef3f1' }}>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                <PlaceRoundedIcon />
                <Typography variant="subtitle2" fontWeight={800}>Location & geo‑fence</Typography>
              </Stack>
              <Stack direction="row" spacing={1}>
                <TextField label="Latitude" value={lat} onChange={(e)=>setLat(Number(e.target.value)||0)} sx={{ flex: 1 }} />
                <TextField label="Longitude" value={lng} onChange={(e)=>setLng(Number(e.target.value)||0)} sx={{ flex: 1 }} />
              </Stack>
              <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                <Button variant="outlined" startIcon={<AddLocationAltRoundedIcon />} onClick={addFencePoint}
                  sx={{ '&:hover': { bgcolor: 'secondary.main', color: 'common.white', borderColor: 'secondary.main' } }}>Add fence point</Button>
                <Button variant="outlined" startIcon={<MapRoundedIcon />} onClick={() => (onUseMyLocation ? onUseMyLocation({ setLat, setLng }) : console.info('Use my location'))}
                  sx={{ '&:hover': { bgcolor: 'secondary.main', color: 'common.white', borderColor: 'secondary.main' } }}>Use my location</Button>
              </Stack>
              <List dense sx={{ mt: 1, border: '1px dashed #e0e0e0', borderRadius: 2 }}>
                {fence.map((p, idx) => (
                  <ListItemButton key={idx} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="caption">{p.lat.toFixed(6)}, {p.lng.toFixed(6)}</Typography>
                    <IconButton size="small" color="error" onClick={()=>removeFencePoint(idx)}><DeleteOutlineRoundedIcon/></IconButton>
                  </ListItemButton>
                ))}
              </List>
            </Paper>

            {/* Notes & photos */}
            <Paper elevation={0} sx={{ mt: 2, p: 2, borderRadius: 1.5, bgcolor: '#fff', border: '1px solid #eef3f1' }}>
              <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1 }}>Notes & photos</Typography>
              <TextField label="Notes" value={notes} onChange={(e)=>setNotes(e.target.value)} fullWidth multiline rows={3} />
              <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                <Button component="label" variant="outlined" startIcon={<AddPhotoAlternateRoundedIcon />}
                  sx={{ '&:hover': { bgcolor: 'secondary.main', color: 'common.white', borderColor: 'secondary.main' } }}>
                  Upload photos
                  <input type="file" accept="image/*" multiple hidden onChange={onSelectPhotos} />
                </Button>
                <Button variant="outlined" onClick={() => (onUploadPhotos ? onUploadPhotos({ siteId, photos }) : console.info('Upload photos', photos.length))}
                  sx={{ '&:hover': { bgcolor: 'secondary.main', color: 'common.white', borderColor: 'secondary.main' } }}>Save photos</Button>
              </Stack>
              <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap' }}>
                {photoPreviews.map((src, i) => (
                  <Box key={i} sx={{ width: 80, height: 80, borderRadius: 1, overflow: 'hidden', border: '1px solid #eef3f1' }}>
                    <img src={src} alt={`photo-${i}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </Box>
                ))}
              </Stack>
            </Paper>

            {/* Opening hours */}
            <Paper elevation={0} sx={{ mt: 2, p: 2, borderRadius: 1.5, bgcolor: '#fff', border: '1px solid #eef3f1', mb: 2 }}>
              <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1 }}>Opening hours</Typography>
              <HoursTable hours={hours} onChange={(day, v)=>setHours(prev=>({ ...prev, [day]: v }))} />
            </Paper>
          </Box>
        </MobileShell>
      </Container>
    </ThemeProvider>
  );
}
