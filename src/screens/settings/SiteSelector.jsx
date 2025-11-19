import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import {
  CssBaseline, Box, Typography, Paper, Stack, Button, Switch, FormControlLabel, List, ListItemButton,
} from '@mui/material';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import MobileShell from '../../components/layout/MobileShell';

const theme = createTheme({
  palette: {
    primary: { main: '#03cd8c' },
    secondary: { main: '#f77f00' },
    background: { default: '#f2f2f2' }
  },
  shape: { borderRadius: 14 },
  typography: { fontFamily: 'Inter, Roboto, Arial, sans-serif' }
});

function SiteRow({ site, selected, onSelect }) {
  return (
    <Paper elevation={0} sx={{ p: 1.5, borderRadius: 3, bgcolor: '#fff', border: selected ? '2px solid #f77f00' : '1px solid #eef3f1' }}>
      <Stack direction="row" spacing={1.25} alignItems="center" onClick={() => onSelect(site.id)}>
        {selected ? <RadioButtonCheckedIcon color="secondary" /> : <RadioButtonUncheckedIcon color="disabled" />}
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle2" fontWeight={700}>{site.name}</Typography>
          <Typography variant="caption" color="text.secondary">{site.address}</Typography>
        </Box>
      </Stack>
    </Paper>
  );
}

/**
 * UPDATED: uses `openAddSite` (preferred). Falls back to `onAddSite` if provided for backward compatibility.
 */
export default function ChooseSite({ onBack, onHelp, onNavChange, onConfirm, openAddSite, onAddSite }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [navValue, setNavValue] = useState(4);
  const routes = useMemo(() => ['/', '/chargers', '/sessions', '/wallet', '/settings'], []);
  
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
      navigate('/settings');
    }
  }, [navigate, onBack]);
  
  const [mobileStation, setMobileStation] = useState(false);
  const [selected, setSelected] = useState('1');

  const sites = [
    { id: '1', name: 'EVzone Charge Station', address: 'Kampala, Uganda' },
    { id: '2', name: 'Soroti Charge Station', address: 'Soroti, Uganda' }
  ];

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <MobileShell
        title="Choose site"
        tagline="select or add a location"
        onBack={handleBack}
        onHelp={onHelp}
        navValue={navValue}
        onNavChange={handleNavChange}
      >
        <Box>
          <List sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
            {sites.map(s => (
              <ListItemButton key={s.id} sx={{ p: 0 }} onClick={() => setSelected(s.id)}>
                <SiteRow site={s} selected={selected === s.id} onSelect={setSelected} />
              </ListItemButton>
            ))}
          </List>

          {/* Action buttons */}
          <Stack spacing={1} sx={{ px: 2, pb: 2 }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <FormControlLabel control={<Switch checked={mobileStation} onChange={(e) => setMobileStation(e.target.checked)} />} label="Mobile station" />
              <Button variant="outlined" onClick={() => (openAddSite ? openAddSite() : (onAddSite ? onAddSite() : console.info('Navigate to: 17 — Add Site (Mobile, React + MUI, JS)')))}
                sx={{ ml: 'auto', '&:hover': { bgcolor: 'secondary.main', color: 'common.white', borderColor: 'secondary.main' } }}>+ Add site</Button>
            </Stack>
            <Button fullWidth size="large" variant="contained" color="secondary"
              onClick={() => (onConfirm ? onConfirm({ selected, mobileStation }) : console.info('Confirmed site → return to details'))}
              sx={{ py: 1.25, color: 'common.white', '&:hover': { bgcolor: 'secondary.dark', color: 'common.white' } }}>
              Confirm
            </Button>
          </Stack>
        </Box>
      </MobileShell>
    </ThemeProvider>
  );
}
