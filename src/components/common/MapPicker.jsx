import { useState, useMemo, useCallback, useRef } from 'react';
import { Box, Typography, Skeleton } from '@mui/material';
import { GoogleMap, MarkerF } from '@react-google-maps/api';
import { useGoogleMaps } from '../../hooks/useGoogleMaps';

const mapContainerStyle = { width: '100%', height: '100%' };
const defaultCenter = { lat: 0.3476, lng: 32.5825 };

export default function MapPicker({ initial, onChange }) {
  const { isLoaded, loading, error } = useGoogleMaps();
  const [marker, setMarker] = useState(initial || null);
  const mapRef = useRef(null);

  const center = useMemo(
    () => marker || initial || defaultCenter,
    [marker, initial],
  );

  const handleMapClick = useCallback((e) => {
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    const coords = { lat, lng };
    setMarker(coords);
    onChange?.(coords);
  }, [onChange]);

  const handleMarkerDragEnd = useCallback((e) => {
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    const coords = { lat, lng };
    setMarker(coords);
    onChange?.(coords);
  }, [onChange]);

  if (error) {
    return (
      <Box sx={{ height: 240, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'grey.100', borderRadius: 2 }}>
        <Typography color="error">Failed to load maps: {error}</Typography>
      </Box>
    );
  }

  if (!isLoaded || loading) {
    return <Skeleton variant="rectangular" height={240} sx={{ borderRadius: 2 }} />;
  }

  return (
    <Box sx={{ width: '100%', height: 240, borderRadius: 2, overflow: 'hidden', position: 'relative' }}>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={14}
        onClick={handleMapClick}
        onLoad={(map) => { mapRef.current = map; }}
        options={{
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
          zoomControl: true,
        }}
      >
        {marker && (
          <MarkerF
            position={marker}
            draggable
            onDragEnd={handleMarkerDragEnd}
            icon={{
              url: 'data:image/svg+xml;base64,' + btoa(
                '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24"><path fill="#03cd8c" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/></svg>',
              ),
              scaledSize: new window.google.maps.Size(28, 28),
              anchor: new window.google.maps.Point(14, 28),
            }}
          />
        )}
      </GoogleMap>
      <Typography
        variant="caption"
        sx={{
          position: 'absolute',
          bottom: 8,
          left: '50%',
          transform: 'translateX(-50%)',
          bgcolor: 'rgba(255,255,255,0.9)',
          px: 1,
          py: 0.5,
          borderRadius: 1,
          fontSize: 11,
          pointerEvents: 'none',
        }}
      >
        {marker ? `${marker.lat.toFixed(5)}, ${marker.lng.toFixed(5)}` : 'Tap on the map to place a pin'}
      </Typography>
    </Box>
  );
}
