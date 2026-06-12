import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box, Typography, Paper, Stack, Button, List, ListItemButton, Alert, CircularProgress, IconButton,
} from '@mui/material';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import MobileShell from '../../components/layout/MobileShell';
import { sitesApi } from '../../services/api/sites';

function SiteRow({ site, selected, onSelect, onDelete }) {
  return (
    <Paper elevation={0} sx={{ p: 1.5, borderRadius: 1.5, bgcolor: '#fff', border: selected ? '2px solid #f77f00' : '1px solid #eef3f1' }}>
      <Stack direction="row" spacing={1.25} alignItems="center">
        <Box onClick={() => onSelect(site.id)} sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
          {selected ? <RadioButtonCheckedIcon color="secondary" /> : <RadioButtonUncheckedIcon color="disabled" />}
          <Box>
            <Typography variant="subtitle2" fontWeight={700}>{site.name}</Typography>
            <Typography variant="caption" color="text.secondary">{site.address || site.city || ''}</Typography>
          </Box>
        </Box>
        <IconButton size="small" color="error" onClick={() => onDelete && onDelete(site)} aria-label="Delete"><DeleteOutlineIcon /></IconButton>
      </Stack>
    </Paper>
  );
}

export default function SiteSelector({ onBack, onHelp, onNavChange, onConfirm }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [navValue, setNavValue] = useState(4);
  const routes = useMemo(() => ['/', '/chargers', '/sessions', '/wallet', '/settings'], []);

  useEffect(() => {
    const pathIndex = routes.findIndex(route => location.pathname === route || location.pathname.startsWith(route + '/'));
    if (pathIndex !== -1) setNavValue(pathIndex);
  }, [location.pathname, routes]);

  const handleNavChange = useCallback((value) => {
    setNavValue(value);
    if (routes[value] !== undefined) navigate(routes[value]);
    if (onNavChange) onNavChange(value);
  }, [navigate, routes, onNavChange]);

  const handleBack = useCallback(() => {
    if (onBack) onBack();
    else navigate('/settings');
  }, [navigate, onBack]);

  const [sites, setSites] = useState([]);
  const [selected, setSelected] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function loadSites() {
    setLoading(true);
    setError('');
    try {
      const res = await sitesApi.getAll({ limit: 100 });
      const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      setSites(list);
      if (list.length && !selected) setSelected(list[0].id);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Unable to load sites.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSites();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = async (site) => {
    try {
      await sitesApi.remove(site.id);
      await loadSites();
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to delete site.');
    }
  };

  const handleConfirm = () => {
    if (onConfirm) onConfirm({ selected });
    else navigate('/settings');
  };

  return (
    <MobileShell
      title="Choose site"
      tagline="select or add a location"
      onBack={handleBack}
      onHelp={onHelp}
      navValue={navValue}
      onNavChange={handleNavChange}
    >
      <Box sx={{ px: 2, pt: 2, pb: 2 }}>
        {loading && <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}><CircularProgress /></Box>}
        {error && <Alert severity="warning" sx={{ mb: 1 }}>{error}</Alert>}

        <List sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
          {sites.map(s => (
            <ListItemButton key={s.id} sx={{ p: 0 }} onClick={() => setSelected(s.id)}>
              <SiteRow site={s} selected={selected === s.id} onSelect={setSelected} onDelete={handleDelete} />
            </ListItemButton>
          ))}
          {!loading && !sites.length && (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>No sites yet.</Typography>
          )}
        </List>

        <Stack spacing={1}>
          <Button variant="outlined" onClick={() => navigate('/settings/sites/add')} sx={{ '&:hover': { bgcolor: 'secondary.main', color: 'common.white', borderColor: 'secondary.main' } }}>+ Add site</Button>
          <Button fullWidth size="large" variant="contained" color="secondary" onClick={handleConfirm} sx={{ py: 1.25, color: 'common.white' }}>
            Confirm
          </Button>
        </Stack>
      </Box>
    </MobileShell>
  );
}
