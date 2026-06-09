import { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box, Typography, Skeleton, IconButton, Button } from '@mui/material';
import { GoogleMap, MarkerF, PolylineF, DirectionsRenderer } from '@react-google-maps/api';
import { ArrowBack, Navigation } from '@mui/icons-material';
import MobileShell from '../../components/layout/MobileShell';
import { useGeolocation } from '../../hooks/useGeolocation';
import { useStation } from '../../hooks/useStation';
import { useGoogleMaps } from '../../hooks/useGoogleMaps';
import { geographyApi } from '../../services/api/geography';
import { EV } from '../../utils/theme';

const mapContainerStyle = { width: '100%', height: '100%' };

function decodePolyline(encoded) {
  if (!window.google?.maps?.geometry?.encoding?.decodePath) return [];
  return window.google.maps.geometry.encoding.decodePath(encoded).map((pt) => ({
    lat: pt.lat(),
    lng: pt.lng(),
  }));
}

export default function RoutePlanner() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const stationId = searchParams.get('station');
  const { position } = useGeolocation();
  const { station, loading: stationLoading } = useStation(stationId);
  const { isLoaded, loading: mapsLoading, error: mapsError } = useGoogleMaps();

  const [route, setRoute] = useState(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeError, setRouteError] = useState(null);
  const [directions, setDirections] = useState(null);

  const userCoords = useMemo(
    () => (position ? { lat: position.latitude, lng: position.longitude } : null),
    [position],
  );

  const stationCoords = useMemo(
    () =>
      station ? { lat: station.latitude, lng: station.longitude } : null,
    [station],
  );

  const center = useMemo(() => {
    if (userCoords && stationCoords) {
      return {
        lat: (userCoords.lat + stationCoords.lat) / 2,
        lng: (userCoords.lng + stationCoords.lng) / 2,
      };
    }
    return stationCoords || userCoords || { lat: 0.3476, lng: 32.5825 };
  }, [userCoords, stationCoords]);

  useEffect(() => {
    if (!userCoords || !stationCoords || !isLoaded) return;
    setRouteLoading(true);
    setRouteError(null);
    geographyApi
      .getRoute(userCoords.lat, userCoords.lng, stationCoords.lat, stationCoords.lng)
      .then((res) => {
        const data = res?.data || res;
        setRoute(data);

        if (window.google?.maps?.DirectionsService) {
          const ds = new window.google.maps.DirectionsService();
          ds.route(
            {
              origin: userCoords,
              destination: stationCoords,
              travelMode: window.google.maps.TravelMode.DRIVING,
            },
            (result, status) => {
              if (status === window.google.maps.DirectionsStatus.OK) {
                setDirections(result);
              }
            },
          );
        }
      })
      .catch((err) => {
        setRouteError(err.response?.data?.message || err.message || 'Failed to get route');
      })
      .finally(() => setRouteLoading(false));
  }, [userCoords, stationCoords, isLoaded]);

  const polylinePath = useMemo(() => {
    if (!route?.polyline || !isLoaded) return [];
    return decodePolyline(route.polyline);
  }, [route, isLoaded]);

  const handleStartNavigation = useCallback(() => {
    if (!stationCoords) return;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${stationCoords.lat},${stationCoords.lng}`;
    window.open(url, '_blank');
  }, [stationCoords]);

  if (mapsError) {
    return (
      <MobileShell title="Route" showNav={false}>
        <Box sx={{ p: 2 }}>
          <IconButton onClick={() => navigate(-1)}><ArrowBack /></IconButton>
          <Typography color="error" sx={{ mt: 2 }}>
            Failed to load maps: {mapsError}
          </Typography>
        </Box>
      </MobileShell>
    );
  }

  if (!isLoaded || mapsLoading || stationLoading) {
    return (
      <MobileShell title="Route" showNav={false}>
        <Box sx={{ p: 2 }}>
          <IconButton onClick={() => navigate(-1)}><ArrowBack /></IconButton>
          <Skeleton variant="rectangular" height={400} sx={{ mt: 1, borderRadius: 2 }} />
        </Box>
      </MobileShell>
    );
  }

  if (!stationId || !station) {
    return (
      <MobileShell title="Route" showNav={false}>
        <Box sx={{ p: 2 }}>
          <IconButton onClick={() => navigate(-1)}><ArrowBack /></IconButton>
          <Typography sx={{ mt: 2 }}>No station selected.</Typography>
          <Button variant="contained" sx={{ mt: 2, borderRadius: 3, textTransform: 'none', bgcolor: EV.primary }} onClick={() => navigate('/stations')}>
            Find a Station
          </Button>
        </Box>
      </MobileShell>
    );
  }

  return (
    <MobileShell title="Route to Station" showNav={false} sx={{ overflow: 'hidden' }}>
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

        <Box sx={{ position: 'absolute', top: 8, left: 56, zIndex: 10, bgcolor: 'rgba(255,255,255,0.95)', borderRadius: 2, px: 1.5, py: 1, boxShadow: 1, maxWidth: 300 }}>
          <Typography variant="subtitle2" fontWeight={700}>{station.name}</Typography>
          {routeLoading ? (
            <Skeleton width={120} height={20} />
          ) : routeError ? (
            <Typography variant="caption" color="error">{routeError}</Typography>
          ) : route ? (
            <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
              <Typography variant="caption" fontWeight={600}>{route.distanceKm?.toFixed(1)} km</Typography>
              <Typography variant="caption" color="text.secondary">·</Typography>
              <Typography variant="caption" fontWeight={600}>{Math.round(route.durationMin)} min</Typography>
            </Box>
          ) : (
            <Typography variant="caption" color="text.secondary">Calculating route...</Typography>
          )}
        </Box>

        <Box sx={{ position: 'absolute', bottom: 100, right: 16, zIndex: 10 }}>
          <IconButton
            onClick={handleStartNavigation}
            sx={{
              bgcolor: EV.primary, color: '#fff', boxShadow: 1,
              '&:hover': { bgcolor: EV.primaryDark },
            }}
          >
            <Navigation />
          </IconButton>
        </Box>

        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={center}
          zoom={13}
          options={{
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: false,
            zoomControl: true,
          }}
        >
          {userCoords && (
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
          )}

          {stationCoords && (
            <MarkerF
              position={stationCoords}
              icon={{
                url: 'data:image/svg+xml;base64,' + btoa(
                  '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="#10B981" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/></svg>',
                ),
                scaledSize: new window.google.maps.Size(32, 32),
                anchor: new window.google.maps.Point(16, 32),
              }}
            />
          )}

          {directions && (
            <DirectionsRenderer
              directions={directions}
              options={{
                suppressMarkers: true,
                polylineOptions: {
                  strokeColor: EV.primary,
                  strokeWeight: 5,
                  strokeOpacity: 0.8,
                },
              }}
            />
          )}

          {!directions && polylinePath.length > 0 && (
            <PolylineF
              path={polylinePath}
              options={{
                strokeColor: EV.primary,
                strokeWeight: 5,
                strokeOpacity: 0.8,
              }}
            />
          )}
        </GoogleMap>
      </Box>
    </MobileShell>
  );
}
