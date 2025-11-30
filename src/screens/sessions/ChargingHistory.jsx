import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box, Typography, Paper, Stack, Button, Chip, List, ListItemButton,
  TextField, InputAdornment, MenuItem, Select, FormControl, FormLabel
} from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import MobileShell from '../../components/layout/MobileShell';

function CommercialBadge({ isCommercial }) {
  return (
    <Chip size="small" label={isCommercial ? 'Commercial Charger' : 'Not commercial'}
      color={isCommercial ? 'secondary' : 'default'} sx={{ color: isCommercial ? 'common.white' : undefined }} />
  );
}

function Row({ s, onOpenReceipt }) {
  return (
    <Paper elevation={0} sx={{ p: 1.25, borderRadius: 1.5, bgcolor: '#fff', border: '1px solid #eef3f1' }}>
      <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
        <Box>
          <Typography variant="subtitle2" fontWeight={700}>{s.date} — {s.site}</Typography>
          <Typography variant="caption" color="text.secondary">{s.kwh} kWh • {s.duration} • UGX {s.amount.toLocaleString()}</Typography>
        </Box>
        <Button size="small" onClick={() => (onOpenReceipt ? onOpenReceipt(s) : console.info('Open receipt', s))}>Receipt</Button>
      </Stack>
    </Paper>
  );
}

export default function ChargingHistory({
  chargers = [{ id: 'st1', name: 'Home Charger' }, { id: 'st2', name: 'Office Charger' }],
  defaultChargerId = 'st1',
  commercialChargerId,
  selectedChargerId,
  aggregatorUrl,
  onOpenAggregator,
  onBack, onHelp, onNavChange, onOpenReceipt
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const [navValue, setNavValue] = useState(2);
  const [chargerId, setChargerId] = useState(defaultChargerId);
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState('all'); // all | public | private

  const routes = useMemo(() => ['/', '/chargers', '/sessions', '/wallet', '/settings'], []);
  
  // Sync navValue with current route
  useEffect(() => {
    const pathIndex = routes.findIndex(route => location.pathname === route || location.pathname.startsWith(route + '/'));
    if (pathIndex !== -1) {
      setNavValue(pathIndex);
    }
  }, [location.pathname, routes]);

  const currentId = selectedChargerId || chargerId;
  const isCommercial = currentId && commercialChargerId && currentId === commercialChargerId;

  const handleNavChange = useCallback((value) => {
    setNavValue(value);
    if (routes[value] !== undefined) {
      navigate(routes[value]);
    }
    if (onNavChange) onNavChange(value);
  }, [navigate, routes, onNavChange]);

  const data = useMemo(() => ([
    { id: 's1', date: '2025-10-18', site: 'Home Charger', chargerId: 'st1', kwh: 12.4, duration: '01:32', amount: 14880, type: 'public' },
    { id: 's2', date: '2025-10-12', site: 'Home Charger', chargerId: 'st1', kwh: 6.1, duration: '00:45', amount: 6120, type: 'private' },
    { id: 's3', date: '2025-10-15', site: 'Office Charger', chargerId: 'st2', kwh: 8.5, duration: '01:15', amount: 10200, type: 'private' },
    { id: 's4', date: '2025-10-10', site: 'Office Charger', chargerId: 'st2', kwh: 15.2, duration: '02:00', amount: 18240, type: 'public' }
  ]), []);

  const filtered = data.filter(s => {
    const matchesCharger = !chargerId || s.chargerId === chargerId;
    const matchesMode = mode === 'all' || s.type === mode;
    const matchesQuery = query.trim() === '' || s.site.toLowerCase().includes(query.toLowerCase());
    return matchesCharger && matchesMode && matchesQuery;
  });

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
            <Select value={chargerId} onChange={(e)=>setChargerId(e.target.value)}>
              {chargers.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
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

        {!filtered.length && (
          <Paper elevation={0} sx={{ p: 2, borderRadius: 1.5, bgcolor: '#fff', border: '1px dashed #e0e0e0', textAlign: 'center', mx: 2 }}>
            <Typography variant="caption" color="text.secondary">No results for the selected filters.</Typography>
          </Paper>
        )}
      </Box>
    </MobileShell>
  );
}
