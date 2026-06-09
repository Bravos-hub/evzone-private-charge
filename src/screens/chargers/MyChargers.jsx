import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box, Typography, Button, Paper, List, ListItemButton, Chip, Stack, Alert, CircularProgress
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import MobileShell from '../../components/layout/MobileShell';
import { useChargers } from '../../hooks/useChargers';

function ChargerCard({ charger, selected, onSelect }) {
  const name = charger.name || charger.model || charger.ocppId || 'Unnamed Charger';
  const tag = charger.tag || (charger.visibility === 'PUBLIC_MAP' ? 'Commercial' : 'Home');
  const location = charger.location || charger.station?.address || charger.parkingAccessNotes || 'Unknown location';
  const connector = charger.connectors?.[0]?.type || charger.type || 'Unknown';
  const maxPower = charger.maxPowerKw || charger.power ? `${charger.maxPowerKw || charger.power} kW` : '—';
  const amount = charger.price || charger.amount || 0;

  return (
    <Paper elevation={0} sx={{ p: 2, borderRadius: 1.5, bgcolor: '#fff', border: selected ? '2px solid #f77f00' : '1px solid #eef3f1' }}>
      <Stack direction="row" alignItems="flex-start" spacing={1.5}>
        {selected ? <RadioButtonCheckedIcon color="secondary" /> : <RadioButtonUncheckedIcon color="disabled" />}
        <Box sx={{ flex: 1 }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography variant="subtitle1" fontWeight={700}>{name}</Typography>
            <Chip size="small" label={tag} color={tag === 'Commercial' ? 'success' : 'default'} />
          </Stack>
          <Typography variant="body2" color="text.secondary">{location}</Typography>
          <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
            <Typography variant="caption"><strong>Connector:</strong> {connector}</Typography>
            <Typography variant="caption"><strong>Max:</strong> {maxPower}</Typography>
            <Typography variant="caption"><strong>Amount:</strong> UGX {Number(amount).toLocaleString()}</Typography>
          </Stack>
        </Box>
      </Stack>
    </Paper>
  );
}

export default function MyChargers({ onAdd, onBack, onHelp, onNavChange, onOpenCharger }) {
  const navigate = useNavigate();
  const location = useLocation();
  const routes = useMemo(() => ['/', '/chargers', '/sessions', '/wallet', '/settings'], []);
  const [navValue, setNavValue] = useState(1);
  const [selectedId, setSelectedId] = useState('');

  const { chargers, loading, error } = useChargers();

  // Sync navValue with current route
  useEffect(() => {
    const pathIndex = routes.findIndex(route => location.pathname === route || location.pathname.startsWith(route + '/'));
    if (pathIndex !== -1) {
      setNavValue(pathIndex);
    }
  }, [location.pathname, routes]);

  // Auto-select first charger when data loads
  useEffect(() => {
    if (chargers.length > 0 && !selectedId) {
      setSelectedId(chargers[0].id);
    }
  }, [chargers, selectedId]);

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
      navigate('/dashboard');
    }
  }, [navigate, onBack]);

  const handleChargerClick = useCallback((charger) => {
    setSelectedId(charger.id);
    if (onOpenCharger) {
      onOpenCharger(charger);
    } else {
      navigate(`/chargers/${charger.id}`);
    }
  }, [navigate, onOpenCharger]);

  const handleAddCharger = useCallback(() => {
    if (onAdd) {
      onAdd();
    } else {
      navigate('/chargers/add');
    }
  }, [navigate, onAdd]);

  return (
    <MobileShell
      title="My chargers"
      tagline="manage all your sites"
      onBack={handleBack}
      onHelp={onHelp}
      navValue={navValue}
      onNavChange={handleNavChange}
    >
      <Box sx={{ pt: 2 }}>
        {loading && (
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
            <CircularProgress size={18} />
            <Typography variant="body2" color="text.secondary">Loading chargers…</Typography>
          </Stack>
        )}

        {error && <Alert severity="warning" sx={{ mb: 2 }}>{error}</Alert>}

        <List sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
          {chargers.map((c) => (
            <ListItemButton key={c.id} onClick={() => handleChargerClick(c)} sx={{ p: 0 }}>
              <ChargerCard charger={c} selected={selectedId === c.id} />
            </ListItemButton>
          ))}
        </List>

        {!loading && chargers.length === 0 && !error && (
          <Alert severity="info" sx={{ mb: 2 }}>No chargers found. Add your first charger below.</Alert>
        )}

        <Box sx={{ mt: 2, px: 2, pb: 2 }}>
          <Button
            fullWidth
            size="large"
            color="secondary"
            variant="contained"
            startIcon={<AddCircleOutlineIcon />}
            onClick={handleAddCharger}
            sx={{
              py: 1.25,
              color: 'common.white',
              '& .MuiButton-startIcon>*': { color: 'common.white' },
              '&:hover': {
                bgcolor: 'secondary.dark',
                color: 'common.white',
                '& .MuiButton-startIcon>*': { color: 'common.white' }
              }
            }}
          >
            Add charger
          </Button>
        </Box>
      </Box>
    </MobileShell>
  );
}
