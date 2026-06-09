import React, { useState, useRef, useCallback } from 'react';
import { Box, TextField, Paper, List, ListItemButton, ListItemText, Typography } from '@mui/material';
import { useGoogleMaps } from '../../hooks/useGoogleMaps';
import { EV } from '../../utils/theme';

async function safeFetchJson(url) {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 3500);
    const res = await fetch(url, { headers: { 'Accept': 'application/json' }, signal: ctrl.signal });
    clearTimeout(t);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return await res.json();
  } catch (_) {
    return null;
  }
}

export default function GeoSearch({ onPick }) {
  const { isLoaded } = useGoogleMaps();
  const [q, setQ] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const timer = useRef();
  const inputRef = useRef(null);

  const offline = [
    { name: 'Shell Bugolobi, Kampala', lat: 0.313, lon: 32.615 },
    { name: 'Lugogo Mall, Kampala', lat: 0.332, lon: 32.606 },
    { name: 'Freedom City, Kampala-Entebbe Rd', lat: 0.307, lon: 32.566 }
  ];

  const doSearch = async (term) => {
    if (!term.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);

    if (isLoaded && window.google?.maps?.places?.PlacesService) {
      try {
        const service = new window.google.maps.places.AutocompleteService();
        const predictions = await new Promise((resolve, reject) => {
          service.getPlacePredictions({ input: term, types: ['geocode'] }, (preds, status) => {
            if (status === window.google.maps.places.PlacesServiceStatus.OK) {
              resolve(preds || []);
            } else {
              reject(status);
            }
          });
        });

        const places = await Promise.all(
          predictions.slice(0, 6).map((p) =>
            new Promise((resolve) => {
              const detailsService = new window.google.maps.places.PlacesService(document.createElement('div'));
              detailsService.getDetails({ placeId: p.place_id, fields: ['geometry', 'formatted_address'] }, (place, status) => {
                if (status === window.google.maps.places.PlacesServiceStatus.OK && place?.geometry?.location) {
                  resolve({
                    name: place.formatted_address || p.description,
                    lat: place.geometry.location.lat(),
                    lon: place.geometry.location.lng(),
                  });
                } else {
                  resolve(null);
                }
              });
            })
          )
        );

        const valid = places.filter(Boolean);
        if (valid.length) {
          setResults(valid);
          setLoading(false);
          return;
        }
      } catch (_) {
        // Fall through to nominatim
      }
    }

    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(term)}`;
    const data = await safeFetchJson(url);
    const items = (data || []).slice(0, 6).map(d => ({
      name: d.display_name,
      lat: parseFloat(d.lat),
      lon: parseFloat(d.lon)
    }));
    setResults(items.length ? items : offline);
    setLoading(false);
  };

  const handleChange = useCallback((e) => {
    const v = e.target.value;
    setQ(v);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => doSearch(v), 450);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded]);

  return (
    <Box sx={{ mb: 1.25 }}>
      <TextField
        fullWidth
        size="small"
        label="Search address or place"
        placeholder="Type to search"
        value={q}
        onChange={handleChange}
        inputRef={inputRef}
      />
      {results.length > 0 && (
        <Paper elevation={0} sx={{ mt: 0.5, border: `1px solid ${EV.divider}` }}>
          <List dense>
            {results.map((r, i) => (
              <ListItemButton
                key={`${r.lat}-${r.lon}-${i}`}
                onClick={() => {
                  onPick([r.lat, r.lon], r.name);
                  setResults([]);
                  setQ(r.name);
                }}
              >
                <ListItemText primary={r.name} secondary={`Lat ${r.lat.toFixed(5)}, Lon ${r.lon.toFixed(5)}`} />
              </ListItemButton>
            ))}
          </List>
          <Typography variant="caption" sx={{ px: 1, pb: 1 }} color="text.secondary">
            {isLoaded ? 'Results by Google Places (with fallback).' : 'Results by OpenStreetMap (with offline fallback).'}
          </Typography>
        </Paper>
      )}
      {loading && <Typography variant="caption" color="text.secondary">Searching…</Typography>}
    </Box>
  );
}
