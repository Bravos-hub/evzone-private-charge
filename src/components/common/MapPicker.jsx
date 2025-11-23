import React, { useState, useEffect } from 'react';
import { Box, Paper, Stack, Button, TextField } from '@mui/material';
import { Map as PigeonMap, Marker } from 'pigeon-maps';
import RoomIcon from '@mui/icons-material/Room';
import { EV } from '../../utils/theme';

export default function MapPicker({ value, onChange, onResolveAddress }) {
  const [center, setCenter] = useState(value || [0.3476, 32.5825]); // Kampala default
  const [marker, setMarker] = useState(value || [0.3476, 32.5825]);

  useEffect(() => {
    if (value) {
      setCenter(value);
      setMarker(value);
    }
  }, [value]);

  const setAndMaybeReverse = async (coords) => {
    setCenter(coords);
    setMarker(coords);
    onChange && onChange(coords);
    if (onResolveAddress) {
      try {
        const data = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords[0]}&lon=${coords[1]}`)
          .then(res => res.json());
        const addr = (data && (data.display_name || data.name)) || '';
        if (addr) onResolveAddress(addr);
      } catch (err) {
        console.warn('Reverse geocoding failed', err);
      }
    }
  };

  const locate = () => {
    if (!navigator.geolocation) {
      alert('Geolocation not supported');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setAndMaybeReverse([pos.coords.latitude, pos.coords.longitude]);
      },
      () => alert('Could not fetch current location')
    );
  };

  return (
    <Paper elevation={0} sx={{ p: 0, borderRadius: 1.5, overflow: 'hidden', border: `1px solid ${EV.divider}` }}>
      <Box sx={{ height: 240 }}>
        <PigeonMap height={240} center={center} defaultZoom={15} onClick={({ latLng }) => setAndMaybeReverse(latLng)}>
          <Marker width={38} anchor={marker} color="#d00" />
        </PigeonMap>
      </Box>
      <Stack direction="row" spacing={1} sx={{ p: 1.25, flexWrap: 'wrap' }}>
        <Button size="small" variant="outlined" onClick={locate} startIcon={<RoomIcon />}
          sx={{ '&:hover': { bgcolor: 'secondary.main', color: '#fff', borderColor: 'secondary.main' } }}>
          Use my location
        </Button>
        <TextField size="small" fullWidth label="Latitude" value={marker[0].toFixed(6)} InputProps={{ readOnly: true }} sx={{ flex: 1, minWidth: '140px' }} />
        <TextField size="small" fullWidth label="Longitude" value={marker[1].toFixed(6)} InputProps={{ readOnly: true }} sx={{ flex: 1, minWidth: '140px' }} />
      </Stack>
    </Paper>
  );
}

