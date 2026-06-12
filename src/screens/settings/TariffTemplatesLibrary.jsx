import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box, Typography, Paper, Stack, Button, Chip, IconButton, Alert, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogActions, List, ListItemButton,
  FormControl, InputLabel, Select, MenuItem, TextField,
} from '@mui/material';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import ArchiveOutlinedIcon from '@mui/icons-material/ArchiveOutlined';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import MobileShell from '../../components/layout/MobileShell';
import { privateChargingApi, TARIFF_AUDIENCES, BILLING_PARTIES } from '../../services/api/privateCharging';

function TariffRow({ t, onActivate, onArchive }) {
  return (
    <Paper elevation={0} sx={{ p: 1.25, borderRadius: 1.5, bgcolor: '#fff', border: '1px solid #eef3f1' }}>
      <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
        <Box>
          <Typography variant="subtitle2" fontWeight={700}>{t.audience || 'Tariff'}</Typography>
          <Stack direction="row" spacing={1} sx={{ mt: 0.5, flexWrap: 'wrap' }}>
            <Chip size="small" label={`UGX/kWh ${t.pricePerKwh || 0}`} />
            <Chip size="small" label={t.status || 'ACTIVE'} />
          </Stack>
        </Box>
        <Stack direction="row" spacing={0.5}>
          {t.status !== 'ACTIVE' && (
            <IconButton size="small" color="success" onClick={() => onActivate && onActivate(t)} title="Activate"><CheckCircleRoundedIcon /></IconButton>
          )}
          {t.status !== 'ARCHIVED' && (
            <IconButton size="small" color="warning" onClick={() => onArchive && onArchive(t)} title="Archive"><ArchiveOutlinedIcon /></IconButton>
          )}
        </Stack>
      </Stack>
    </Paper>
  );
}

export default function TariffTemplatesLibrary({ onBack, onHelp, onNavChange }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [navValue, setNavValue] = useState(4);
  const routes = useMemo(() => ['/', '/chargers', '/sessions', '/wallet', '/settings'], []);

  useEffect(() => {
    const pathIndex = routes.findIndex(route => location.pathname === route || location.pathname.startsWith(route + '/'));
    if (pathIndex !== -1) setNavValue(pathIndex);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  const handleNavChange = useCallback((value) => {
    setNavValue(value);
    if (routes[value] !== undefined) navigate(routes[value]);
    if (onNavChange) onNavChange(value);
  }, [navigate, routes, onNavChange]);

  const handleBack = useCallback(() => {
    if (onBack) onBack();
    else navigate('/settings');
  }, [navigate, onBack]);

  const [tariffs, setTariffs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [editorOpen, setEditorOpen] = useState(false);
  const [form, setForm] = useState({ audience: 'OWNER', billingParty: 'OWNER', pricePerKwh: 1200, idleFeePerMinute: 0, subsidyPercent: 0 });

  async function loadTariffs() {
    setLoading(true);
    setError('');
    try {
      const res = await privateChargingApi.getTariffs();
      const data = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      setTariffs(data);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Unable to load tariffs.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTariffs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveTemplate = async () => {
    setError('');
    setMessage('');
    try {
      await privateChargingApi.createTariff({
        ...form,
        currency: 'UGX',
        freeAllowanceKwh: 0,
      });
      setMessage('Tariff created.');
      setEditorOpen(false);
      await loadTariffs();
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to create tariff.');
    }
  };

  const activateT = async (t) => {
    try {
      await privateChargingApi.activateTariff(t.id);
      await loadTariffs();
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to activate tariff.');
    }
  };

  const archiveT = async (t) => {
    try {
      await privateChargingApi.archiveTariff(t.id);
      await loadTariffs();
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to archive tariff.');
    }
  };

  return (
    <MobileShell
      title="Tariff templates"
      tagline="save • reuse • apply"
      onBack={handleBack}
      onHelp={onHelp}
      navValue={navValue}
      onNavChange={handleNavChange}
    >
      <Box sx={{ px: 2, pt: 2, pb: 2 }}>
        {loading && <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}><CircularProgress /></Box>}
        {error && <Alert severity="warning" sx={{ mb: 1 }}>{error}</Alert>}
        {message && <Alert severity="success" sx={{ mb: 1 }} onClose={() => setMessage('')}>{message}</Alert>}

        <List sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
          {tariffs.map(t => (
            <ListItemButton key={t.id} sx={{ p: 0 }}>
              <TariffRow t={t} onActivate={activateT} onArchive={archiveT} />
            </ListItemButton>
          ))}
          {!loading && !tariffs.length && (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>No tariffs yet.</Typography>
          )}
        </List>

        <Button variant="outlined" startIcon={<SaveRoundedIcon />} onClick={() => setEditorOpen(true)}
          sx={{ '&:hover': { bgcolor: 'secondary.main', color: 'common.white', borderColor: 'secondary.main' } }}>
          New tariff
        </Button>
      </Box>

      <Dialog open={editorOpen} onClose={() => setEditorOpen(false)} fullWidth>
        <DialogTitle>New tariff</DialogTitle>
        <DialogContent>
          <Stack spacing={1.25} sx={{ pt: 1 }}>
            <FormControl fullWidth size="small">
              <InputLabel id="audience-label">Audience</InputLabel>
              <Select labelId="audience-label" value={form.audience} label="Audience" onChange={(e) => setForm(f => ({ ...f, audience: e.target.value }))}>
                {TARIFF_AUDIENCES.map(a => <MenuItem key={a} value={a}>{a}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl fullWidth size="small">
              <InputLabel id="billing-label">Billing party</InputLabel>
              <Select labelId="billing-label" value={form.billingParty} label="Billing party" onChange={(e) => setForm(f => ({ ...f, billingParty: e.target.value }))}>
                {BILLING_PARTIES.map(b => <MenuItem key={b} value={b}>{b}</MenuItem>)}
              </Select>
            </FormControl>
            <TextField label="UGX per kWh" type="number" value={form.pricePerKwh} onChange={(e) => setForm(f => ({ ...f, pricePerKwh: Number(e.target.value) || 0 }))} fullWidth />
            <TextField label="Idle fee/min" type="number" value={form.idleFeePerMinute} onChange={(e) => setForm(f => ({ ...f, idleFeePerMinute: Number(e.target.value) || 0 }))} fullWidth />
            <TextField label="Subsidy percent" type="number" value={form.subsidyPercent} onChange={(e) => setForm(f => ({ ...f, subsidyPercent: Number(e.target.value) || 0 }))} fullWidth />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditorOpen(false)}>Cancel</Button>
          <Button variant="contained" color="secondary" startIcon={<SaveRoundedIcon />} onClick={saveTemplate} sx={{ color: 'common.white' }}>Save</Button>
        </DialogActions>
      </Dialog>
    </MobileShell>
  );
}
