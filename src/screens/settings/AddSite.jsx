import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box, Typography, Paper, Stack, Button, TextField, Alert, CircularProgress,
  FormControl, InputLabel, Select, MenuItem,
} from '@mui/material';
import PlaceRoundedIcon from '@mui/icons-material/PlaceRounded';
import MobileShell from '../../components/layout/MobileShell';
import { sitesApi } from '../../services/api/sites';

export default function AddSite({ onBack, onHelp, onNavChange, onConfirm }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [navValue, setNavValue] = useState(4);
  const routes = useMemo(() => ['/', '/chargers', '/sessions', '/wallet', '/settings'], []);

  useEffect(() => {
    const pathIndex = routes.findIndex(route => location.pathname === route || location.pathname.startsWith(route + '/'));
    if (pathIndex !== -1) setNavValue(pathIndex);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  const handleNavChange = useCallback((value) => {
    setNavValue(value);
    if (routes[value] !== undefined) navigate(routes[value]);
    if (onNavChange) onNavChange(value);
  }, [navigate, routes, onNavChange]);

  const handleBack = useCallback(() => {
    if (onBack) onBack();
    else navigate('/settings/sites');
  }, [navigate, onBack]);

  const [siteName, setSiteName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [purpose, setPurpose] = useState('PERSONAL');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleConfirm = async () => {
    if (!siteName || !address) {
      setError('Site name and address are required.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const payload = {
        name: siteName,
        address,
        city,
        purpose,
        siteType: 'CHARGING',
        ...(lat && lng ? { latitude: Number(lat), longitude: Number(lng) } : {}),
      };
      const res = await sitesApi.create(payload);
      if (onConfirm) onConfirm(res?.data || res);
      navigate('/settings/sites');
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to create site.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MobileShell
      title="Add a site"
      tagline="pin the location and name it"
      onBack={handleBack}
      onHelp={onHelp}
      navValue={navValue}
      onNavChange={handleNavChange}
    >
      <Box sx={{ px: 2, pt: 2, pb: 2 }}>
        {loading && <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}><CircularProgress /></Box>}
        {error && <Alert severity="warning" sx={{ mb: 2 }}>{error}</Alert>}

        <Paper elevation={0} sx={{ height: 180, borderRadius: 1.5, bgcolor: '#fff', border: '1px solid #eef3f1', display: 'grid', placeItems: 'center', mb: 2 }}>
          <Stack alignItems="center" spacing={0.5}>
            <PlaceRoundedIcon color="error" />
            <Typography variant="caption" color="text.secondary">Drag map to position the red pin</Typography>
          </Stack>
        </Paper>

        <Stack spacing={1.5}>
          <TextField label="Site name" value={siteName} onChange={(e) => setSiteName(e.target.value)} fullWidth />
          <TextField label="Address" value={address} onChange={(e) => setAddress(e.target.value)} fullWidth />
          <TextField label="City" value={city} onChange={(e) => setCity(e.target.value)} fullWidth />
          <FormControl fullWidth size="small">
            <InputLabel id="purpose-label">Purpose</InputLabel>
            <Select labelId="purpose-label" value={purpose} label="Purpose" onChange={(e) => setPurpose(e.target.value)}>
              <MenuItem value="PERSONAL">Personal</MenuItem>
              <MenuItem value="COMMERCIAL">Commercial</MenuItem>
            </Select>
          </FormControl>
          <Stack direction="row" spacing={1}>
            <TextField label="Latitude" value={lat} onChange={(e) => setLat(e.target.value)} fullWidth />
            <TextField label="Longitude" value={lng} onChange={(e) => setLng(e.target.value)} fullWidth />
          </Stack>
          <Button fullWidth size="large" variant="contained" color="secondary" onClick={handleConfirm} disabled={loading}
            sx={{ py: 1.25, color: 'common.white', '&:hover': { bgcolor: 'secondary.dark', color: 'common.white' } }}>
            Confirm
          </Button>
        </Stack>
      </Box>
    </MobileShell>
  );
}
