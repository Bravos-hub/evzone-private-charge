import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box, Typography, Button, Paper, List, ListItemButton, Chip, Stack
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import MobileShell from '../../components/layout/MobileShell';

function ChargerCard({ charger, selected, onSelect }) {
  return (
    <Paper elevation={0} sx={{ p: 2, borderRadius: 1.5, bgcolor: '#fff', border: selected ? '2px solid #f77f00' : '1px solid #eef3f1' }}>
      <Stack direction="row" alignItems="flex-start" spacing={1.5}>
        {selected ? <RadioButtonCheckedIcon color="secondary" /> : <RadioButtonUncheckedIcon color="disabled" />}
        <Box sx={{ flex: 1 }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography variant="subtitle1" fontWeight={700}>{charger.name}</Typography>
            <Chip size="small" label={charger.tag} color={charger.tag === 'Commercial' ? 'success' : 'default'} />
          </Stack>
          <Typography variant="body2" color="text.secondary">{charger.location}</Typography>
          <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
            <Typography variant="caption"><strong>Connector:</strong> {charger.connector}</Typography>
            <Typography variant="caption"><strong>Max:</strong> {charger.maxPower}</Typography>
            <Typography variant="caption"><strong>Amount:</strong> UGX {charger.amount.toLocaleString()}</Typography>
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
  const [selectedId, setSelectedId] = useState('1');
  
  // Sync navValue with current route
  useEffect(() => {
    const pathIndex = routes.findIndex(route => location.pathname === route || location.pathname.startsWith(route + '/'));
    if (pathIndex !== -1) {
      setNavValue(pathIndex);
    }
  }, [location.pathname, routes]);

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

  const chargers = [
    { id: '1', name: 'Home Charger', tag: 'Home', location: 'Kampala, Uganda', connector: 'Type 2', maxPower: '22 kW', amount: 124000 },
    { id: '2', name: 'EVzone Charge Station', tag: 'Commercial', location: 'Bugolobi, Kampala', connector: 'CCS 2', maxPower: '90 kW', amount: 240000 },
    { id: '3', name: 'Office Charger', tag: 'Office', location: 'Wandegeya, Kampala', connector: 'CHAdeMO', maxPower: '50 kW', amount: 82000 }
  ];

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
        <List sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
          {chargers.map((c) => (
            <ListItemButton key={c.id} onClick={() => handleChargerClick(c)} sx={{ p: 0 }}>
              <ChargerCard charger={c} selected={selectedId === c.id} />
            </ListItemButton>
          ))}
        </List>
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
