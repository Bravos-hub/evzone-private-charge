import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box, Typography, Paper, Stack, Button, Chip, List, ListItemButton,
  TextField, InputAdornment, MenuItem, Select, FormControl, FormLabel,
  Alert, CircularProgress
} from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import MobileShell from '../../components/layout/MobileShell';
import { useChargers } from '../../hooks/useChargers';
import { useSessions } from '../../hooks/useSessions';

function CommercialBadge({ isCommercial }) {
  return (
    <Chip size="small" label={isCommercial ? 'Commercial Charger' : 'Not commercial'}
      color={isCommercial ? 'secondary' : 'default'} sx={{ color: isCommercial ? 'common.white' : undefined }} />
  );
}

function Row({ s, onOpenReceipt }) {
  const dateStr = s.startTime ? new Date(s.startTime).toLocaleDateString() : '—';
  const siteName = s.chargePoint?.station?.name || s.station?.name || 'Unknown';
  const kwh = s.totalEnergy ?? s.energyDelivered ?? 0;
  const duration = s.durationMinutes
    ? `${Math.floor(s.durationMinutes / 60)}h ${s.durationMinutes % 60}m`
    : '—';
  const amount = s.totalCost ?? s.cost ?? 0;

  return (
    <Paper elevation={0} sx={{ p: 1.25, borderRadius: 1.5, bgcolor: '#fff', border: '1px solid #eef3f1' }}>
      <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
        <Box>
          <Typography variant="subtitle2" fontWeight={700}>{dateStr} — {siteName}</Typography>
          <Typography variant="caption" color="text.secondary">{kwh} kWh • {duration} • UGX {Number(amount).toLocaleString()}</Typography>
        </Box>
        <Button size="small" onClick={() => (onOpenReceipt ? onOpenReceipt(s) : console.info('Open receipt', s))}>Receipt</Button>
      </Stack>
    </Paper>
  );
}

export default function ChargingHistory({
  chargers: propChargers,
  commercialChargerId,
  selectedChargerId,
  aggregatorUrl,
  onOpenAggregator,
  onBack, onHelp, onNavChange, onOpenReceipt
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const [navValue, setNavValue] = useState(2);
  const [chargerId, setChargerId] = useState('');
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState('all'); // all | public | private

  const { chargers: fetchedChargers } = useChargers();
  const { sessions, loading, error } = useSessions();

  const chargers = propChargers || fetchedChargers;

  const routes = useMemo(() => ['/', '/chargers', '/sessions', '/wallet', '/settings'], []);

  // Sync navValue with current route
  useEffect(() => {
    const pathIndex = routes.findIndex(route => location.pathname === route || location.pathname.startsWith(route + '/'));
    if (pathIndex !== -1) {
      setNavValue(pathIndex);
    }
  }, [location.pathname, routes]);

  useEffect(() => {
    if (chargers.length > 0 && !chargerId) {
      setChargerId(chargers[0].id);
    }
  }, [chargers, chargerId]);

  const currentId = selectedChargerId || chargerId;
  const isCommercial = currentId && commercialChargerId && currentId === commercialChargerId;

  const filtered = sessions.filter(s => {
    const matchesCharger = !chargerId || s.chargePointId === chargerId || s.chargePoint?.id === chargerId;
    const matchesMode = mode === 'all' || s.mode === mode || s.type === mode;
    const siteName = s.chargePoint?.station?.name || s.station?.name || '';
    const matchesQuery = query.trim() === '' || siteName.toLowerCase().includes(query.toLowerCase());
    return matchesCharger && matchesMode && matchesQuery;
  });

  const handleNavChange = useCallback((value) => {
    setNavValue(value);
    if (routes[value] !== undefined) {
      navigate(routes[value]);
    }
    if (onNavChange) onNavChange(value);
  }, [navigate, routes, onNavChange]);

  return (
    <MobileShell
      title="Charging history"
      tagline="sessions • energy • receipts"
      navValue={navValue}
      onNavChange={handleNavChange}
      onBack={onBack || (() => navigate('/dashboard'))}
      onHelp={onHelp}
    >
      <Box sx={{ pt: 2 }}>
        {loading && (
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2, px: 2 }}>
            <CircularProgress size={18} />
            <Typography variant="body2" color="text.secondary">Loading sessions…</Typography>
          </Stack>
        )}
        {error && <Alert severity="warning" sx={{ mb: 2, mx: 2 }}>{error}</Alert>}

        {/* Search and Mode filter */}
        <Stack direction="row" spacing={1} alignItems="flex-end" sx={{ mb: 2, px: 2 }}>
          <TextField
            size="small"
            placeholder="Search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            InputProps={{
              startAdornment: <InputAdornment position="start"><SearchRoundedIcon /></InputAdornment>
            }}
            sx={{ flex: 1 }}
          />
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <FormLabel sx={{ mb: 0.5, fontSize: '0.75rem' }}>Mode</FormLabel>
            <Select value={mode} onChange={(e) => setMode(e.target.value)}>
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="public" disabled={!isCommercial}>Public</MenuItem>
              <MenuItem value="private">Private</MenuItem>
            </Select>
          </FormControl>
        </Stack>

        {/* Charger selector */}
        <Paper elevation={0} sx={{ p: 2, borderRadius: 1.5, bgcolor: '#fff', border: '1px solid #eef3f1', mb: 1, mx: 2 }}>
          <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1 }}>My chargers</Typography>
          <FormControl size="small" fullWidth>
            <Select value={chargerId} onChange={(e)=>setChargerId(e.target.value)} displayEmpty>
              <MenuItem value="">All chargers</MenuItem>
              {chargers.map(c => <MenuItem key={c.id} value={c.id}>{c.name || c.model || c.ocppId}</MenuItem>)}
            </Select>
          </FormControl>
        </Paper>

        {/* Commercial badge + Aggregator CTA */}
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1, px: 2 }}>
          <CommercialBadge isCommercial={isCommercial} />
          {!isCommercial && (
            <Button size="small" variant="text" onClick={() => (onOpenAggregator ? onOpenAggregator(aggregatorUrl) : console.info('Open Aggregator', aggregatorUrl))}>Aggregator & CPMS</Button>
          )}
        </Stack>

        {/* List */}
        <List sx={{ display: 'flex', flexDirection: 'column', gap: 1, px: 2 }}>
          {filtered.map(s => (
            <ListItemButton key={s.id} sx={{ p: 0 }}>
              <Row s={s} onOpenReceipt={onOpenReceipt} />
            </ListItemButton>
          ))}
        </List>

        {!loading && filtered.length === 0 && (
          <Paper elevation={0} sx={{ p: 2, borderRadius: 1.5, bgcolor: '#fff', border: '1px dashed #e0e0e0', textAlign: 'center', mx: 2 }}>
            <Typography variant="caption" color="text.secondary">No results for the selected filters.</Typography>
          </Paper>
        )}
      </Box>
    </MobileShell>
  );
}
