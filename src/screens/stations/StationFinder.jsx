import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Skeleton, IconButton, Chip, TextField, InputAdornment,
} from '@mui/material';
import {
  GoogleMap, MarkerF, InfoWindowF, CircleF,
} from '@react-google-maps/api';
import {
  ArrowBack, MyLocation, Search, LocationOn,
} from '@mui/icons-material';
import MobileShell from '../../components/layout/MobileShell';
import { useGeolocation } from '../../hooks/useGeolocation';
import { useStations } from '../../hooks/useStations';
import { useGoogleMaps } from '../../hooks/useGoogleMaps';
import { EV } from '../../utils/theme';

const mapContainerStyle = { width: '100%', height: '100%' };
const defaultCenter = { lat: 0.3476, lng: 32.5825 };

export default function StationFinder() {
  const navigate = useNavigate();
  const { position, loading: geoLoading, refresh: refreshGeo } = useGeolocation();
  const { stations, loading: stationsLoading } = useStations();
  const { isLoaded, loading: mapsLoading, error: mapsError } = useGoogleMaps();

  const [search, setSearch] = useState('');
  const [activeStation, setActiveStation] = useState(null);
  const [mapCenter, setMapCenter] = useState(null);

  const userCoords = useMemo(
    () => (position ? { lat: position.latitude, lng: position.longitude } : null),
    [position],
  );

  const center = mapCenter || userCoords || defaultCenter;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return stations;
    return stations.filter(
      (s) =>
        s.name?.toLowerCase().includes(q) ||
        s.address?.toLowerCase().includes(q) ||
        s.city?.toLowerCase().includes(q),
    );
  }, [stations, search]);

  const handleMarkerClick = useCallback((station) => {
    setActiveStation(station);
  }, []);

  const handleMapClick = useCallback(() => {
    setActiveStation(null);
  }, []);

  const handleRecenter = useCallback(() => {
    if (userCoords) setMapCenter(userCoords);
    refreshGeo();
  }, [userCoords, refreshGeo]);

  if (mapsError) {
    return (
      <MobileShell title="Find Stations" showNav={false}>
        <Box sx={{ p: 2 }}>
          <IconButton onClick={() => navigate(-1)}><ArrowBack /></IconButton>
          <Typography color="error" sx={{ mt: 2 }}>
            Failed to load maps: {mapsError}
          </Typography>
        </Box>
      </MobileShell>
    );
  }

  if (!isLoaded || mapsLoading || geoLoading || stationsLoading) {
    return (
      <MobileShell title="Find Stations" showNav={false}>
        <Box sx={{ p: 2 }}>
          <IconButton onClick={() => navigate(-1)}><ArrowBack /></IconButton>
          <Skeleton variant="rectangular" height={400} sx={{ mt: 1, borderRadius: 2 }} />
          <Skeleton variant="rectangular" height={60} sx={{ mt: 1, borderRadius: 2 }} />
        </Box>
      </MobileShell>
    );
  }

  return (
    <MobileShell title="Find Stations" showNav={false} sx={{ overflow: 'hidden' }}>
      <Box sx={{ position: 'relative', height: '100vh', width: '100%' }}>
        <Box sx={{ position: 'absolute', top: 8, left: 8, zIndex: 10 }}>
          <IconButton
            onClick={() => navigate(-1)}
            sx={{
              bgcolor: 'rgba(255,255,255,0.9)', boxShadow: 1, '&:hover': { bgcolor: 'rgba(255,255,255,1)' },
            }}
          >
            <ArrowBack />
          </IconButton>
        </Box>

        <Box sx={{ position: 'absolute', top: 8, left: 56, right: 16, zIndex: 10 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search stations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{
              bgcolor: 'rgba(255,255,255,0.95)',
              borderRadius: 2,
              '& .MuiOutlinedInput-root': { borderRadius: 2 },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start"><Search sx={{ color: EV.text.secondary }} /></InputAdornment>
              ),
            }}
          />
        </Box>

        <Box sx={{ position: 'absolute', bottom: 100, right: 16, zIndex: 10 }}>
          <IconButton
            onClick={handleRecenter}
            sx={{
              bgcolor: 'rgba(255,255,255,0.9)', boxShadow: 1, '&:hover': { bgcolor: 'rgba(255,255,255,1)' },
            }}
          >
            <MyLocation />
          </IconButton>
        </Box>

        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={center}
          zoom={13}
          onClick={handleMapClick}
          options={{
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: false,
            zoomControl: true,
          }}
        >
          {userCoords && (
            <>
              <MarkerF
                position={userCoords}
                icon={{
                  url: 'data:image/svg+xml;base64,' + btoa(
                    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8" fill="#3B82F6" stroke="white" stroke-width="2"/></svg>',
                  ),
                  scaledSize: new window.google.maps.Size(24, 24),
                  anchor: new window.google.maps.Point(12, 12),
                }}
              />
              <CircleF
                center={userCoords}
                radius={500}
                options={{
                  fillColor: '#3B82F6',
                  fillOpacity: 0.1,
                  strokeColor: '#3B82F6',
                  strokeOpacity: 0.3,
                  strokeWeight: 1,
                }}
              />
            </>
          )}

          {filtered.map((station) => (
            <MarkerF
              key={station.id}
              position={{ lat: station.latitude, lng: station.longitude }}
              onClick={() => handleMarkerClick(station)}
              icon={{
                url: 'data:image/svg+xml;base64,' + btoa(
                  '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24"><path fill="' +
                  (station.status === 'available' ? '#10B981' : '#EF4444') +
                  '" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/></svg>',
                ),
                scaledSize: new window.google.maps.Size(28, 28),
                anchor: new window.google.maps.Point(14, 28),
              }}
            >
              {activeStation?.id === station.id && (
                <InfoWindowF onCloseClick={() => setActiveStation(null)}>
                  <Box sx={{ minWidth: 180, p: 0.5 }}>
                    <Typography variant="subtitle2" fontWeight={700}>
                      {station.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <LocationOn sx={{ fontSize: 14 }} /> {station.address}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 0.5 }}>
                      {station.connectorTypes?.map((t) => (
                        <Chip key={t} size="small" label={t} sx={{ fontSize: 10, height: 20 }} />
                      )) || (
                        <Chip size="small" label={station.connectorType || 'Unknown'} sx={{ fontSize: 10, height: 20 }} />
                      )}
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5 }}>
                      <Typography variant="caption" fontWeight={600} sx={{ color: station.status === 'available' ? EV.success : EV.error }}>
                        {station.status === 'available' ? 'Available' : station.status}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {station.distance ? `${station.distance.toFixed(1)} km` : ''}
                      </Typography>
                    </Box>
                  </Box>
                </InfoWindowF>
              )}
            </MarkerF>
          ))}
        </GoogleMap>
      </Box>
    </MobileShell>
  );
}
