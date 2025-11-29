import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Paper,
  Stack,
  Chip,
  CircularProgress,
  List,
  ListItemButton,
  IconButton,
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import EvStationIcon from '@mui/icons-material/EvStation';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';
import { useChargers } from '../../hooks/useChargers';
import MobileShell from '../../components/layout/MobileShell';

function ChargerCard({ charger, onSelect, onSettings }) {
  const status = charger?.status || 'unknown';
  const isOnline = status === 'online' || status === 'available';
  const isCommercial = charger?.usage === 'commercial' || charger?.isCommercial;

  return (
    <Paper 
      elevation={0} 
      sx={{ 
        p: 1.5, 
        borderRadius: 1.5, 
        bgcolor: '#fff', 
        border: '1px solid #eef3f1',
        '&:hover': {
          borderColor: 'secondary.main',
          boxShadow: '0 2px 8px rgba(247, 127, 0, 0.1)',
        },
        transition: 'all 0.2s ease',
      }}
    >
      <Stack direction="row" spacing={1.5} alignItems="center">
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: 1.5,
            bgcolor: isOnline ? '#E0F3EC' : '#F5F5F5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <EvStationIcon 
            sx={{ 
              fontSize: 28, 
              color: isOnline ? '#03cd8c' : '#999' 
            }} 
          />
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
            <Typography 
              variant="subtitle2" 
              fontWeight={700}
              sx={{ 
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {charger?.name || charger?.id || 'Unnamed Charger'}
            </Typography>
            {isCommercial && (
              <Chip 
                size="small" 
                label="Commercial" 
                color="secondary"
                sx={{ 
                  height: 20,
                  fontSize: '0.65rem',
                  '& .MuiChip-label': { px: 0.75 },
                }}
              />
            )}
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            {isOnline ? (
              <>
                <CheckCircleRoundedIcon sx={{ fontSize: 14, color: '#03cd8c' }} />
                <Typography variant="caption" color="text.secondary">
                  Online
                </Typography>
              </>
            ) : (
              <>
                <ErrorOutlineRoundedIcon sx={{ fontSize: 14, color: '#999' }} />
                <Typography variant="caption" color="text.secondary">
                  {status === 'offline' ? 'Offline' : 'Unknown'}
                </Typography>
              </>
            )}
            {charger?.locationName && (
              <>
                <Typography variant="caption" color="text.secondary">•</Typography>
                <Typography 
                  variant="caption" 
                  color="text.secondary"
                  sx={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    maxWidth: 120,
                  }}
                >
                  {charger.locationName}
                </Typography>
              </>
            )}
          </Stack>
        </Box>
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            if (onSettings) onSettings(charger);
          }}
          sx={{ 
            color: 'text.secondary',
            '&:hover': { bgcolor: 'secondary.main', color: 'common.white' },
          }}
        >
          <SettingsRoundedIcon fontSize="small" />
        </IconButton>
      </Stack>
    </Paper>
  );
}

export default function MyChargers({
  onBack,
  onHelp,
  onNavChange,
  onAddCharger,
  onSelectCharger,
  onSettingsCharger,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { chargers, loading, error, refetch } = useChargers();
  const [navValue, setNavValue] = useState(1); // Stations tab index
  const routes = useMemo(() => ['/', '/chargers', '/sessions', '/wallet', '/settings'], []);

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

  const handleAddCharger = useCallback(() => {
    if (onAddCharger) {
      onAddCharger();
    } else {
      navigate('/chargers/add');
    }
  }, [navigate, onAddCharger]);

  const handleSelectCharger = useCallback((charger) => {
    if (onSelectCharger) {
      onSelectCharger(charger);
    } else {
      navigate(`/chargers/${charger.id}`);
    }
  }, [navigate, onSelectCharger]);

  const handleSettingsCharger = useCallback((charger, e) => {
    if (e) e.stopPropagation();
    if (onSettingsCharger) {
      onSettingsCharger(charger);
    } else {
      navigate(`/chargers/${charger.id}/settings`);
    }
  }, [navigate, onSettingsCharger]);

  return (
    <MobileShell
      title="My Chargers"
      tagline="stations • status • manage"
      navValue={navValue}
      onNavChange={handleNavChange}
      onBack={handleBack}
      onHelp={onHelp}
    >
      <Box>
        {/* Header with Add button */}
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h6" sx={{ flex: 1, fontWeight: 800 }}>
            Stations
          </Typography>
          <Button
            size="small"
            variant="contained"
            startIcon={<AddCircleOutlineIcon />}
            onClick={handleAddCharger}
            sx={{
              borderRadius: 1.5,
              bgcolor: 'secondary.main',
              color: 'common.white',
              textTransform: 'none',
              fontWeight: 700,
              '&:hover': { bgcolor: 'secondary.dark' },
            }}
          >
            Add Charger
          </Button>
        </Stack>

        {/* Loading state */}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
            <CircularProgress size={32} />
          </Box>
        )}

        {/* Error state */}
        {error && !loading && (
          <Paper 
            elevation={0} 
            sx={{ 
              p: 3, 
              borderRadius: 1.5, 
              bgcolor: '#fff', 
              border: '1px dashed #e0e0e0', 
              textAlign: 'center' 
            }}
          >
            <ErrorOutlineRoundedIcon sx={{ fontSize: 48, color: 'error.main', mb: 1 }} />
            <Typography variant="body2" color="error" sx={{ mb: 1 }}>
              Failed to load chargers
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
              {error}
            </Typography>
            <Button 
              size="small" 
              variant="outlined" 
              onClick={refetch}
              sx={{ borderRadius: 1.5 }}
            >
              Retry
            </Button>
          </Paper>
        )}

        {/* Empty state */}
        {!loading && !error && (!chargers || chargers.length === 0) && (
          <Paper 
            elevation={0} 
            sx={{ 
              p: 4, 
              borderRadius: 1.5, 
              bgcolor: '#fff', 
              border: '1px dashed #e0e0e0', 
              textAlign: 'center' 
            }}
          >
            <EvStationIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
            <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
              No chargers yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Add your first charger to get started with EVzone Private Charging.
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddCircleOutlineIcon />}
              onClick={handleAddCharger}
              sx={{
                borderRadius: 1.5,
                bgcolor: 'secondary.main',
                color: 'common.white',
                textTransform: 'none',
                fontWeight: 700,
                px: 3,
                '&:hover': { bgcolor: 'secondary.dark' },
              }}
            >
              Add Your First Charger
            </Button>
          </Paper>
        )}

        {/* Chargers list */}
        {!loading && !error && chargers && chargers.length > 0 && (
          <List sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {chargers.map((charger) => (
              <ListItemButton
                key={charger.id}
                onClick={() => handleSelectCharger(charger)}
                sx={{ p: 0, borderRadius: 1.5 }}
              >
                <ChargerCard
                  charger={charger}
                  onSelect={() => handleSelectCharger(charger)}
                  onSettings={(c) => handleSettingsCharger(c)}
                />
              </ListItemButton>
            ))}
          </List>
        )}
      </Box>
    </MobileShell>
  );
}
