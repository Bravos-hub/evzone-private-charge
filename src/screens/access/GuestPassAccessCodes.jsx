import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box, Typography, Paper, Stack, Button, Chip, TextField, IconButton, List, ListItemButton,
  Alert, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions,
  FormControl, InputLabel, Select, MenuItem,
} from '@mui/material';
import QrCode2RoundedIcon from '@mui/icons-material/QrCode2Rounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import LinkRoundedIcon from '@mui/icons-material/LinkRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import MobileShell from '../../components/layout/MobileShell';
import { privateChargingApi } from '../../services/api/privateCharging';
import { chargerApi } from '../../services/api/chargers';

function PassRow({ p, onRevoke, onShowQR, onCopy }) {
  return (
    <Paper elevation={0} sx={{ p: 1.25, borderRadius: 1.5, bgcolor: '#fff', border: '1px solid #eef3f1' }}>
      <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
        <Box>
          <Typography variant="subtitle2" fontWeight={700}>{p.label}</Typography>
          <Typography variant="caption" color="text.secondary">{p.code} • {p.expires}</Typography>
          <Stack direction="row" spacing={1} sx={{ mt: 0.5, flexWrap: 'wrap' }}>
            <Chip size="small" label={p.scope} />
            <Chip size="small" label={p.status} color={p.status === 'Active' ? 'success' : 'default'} />
          </Stack>
        </Box>
        <Stack direction="row" spacing={0.5}>
          <IconButton size="small" aria-label="Show QR" onClick={() => onShowQR && onShowQR(p)}><QrCode2RoundedIcon /></IconButton>
          <IconButton size="small" aria-label="Copy link" onClick={() => onCopy && onCopy(p)}><LinkRoundedIcon /></IconButton>
          <IconButton size="small" aria-label="Revoke" color="error" onClick={() => onRevoke && onRevoke(p)}><DeleteOutlineRoundedIcon /></IconButton>
        </Stack>
      </Stack>
    </Paper>
  );
}

export default function GuestPassAccessCodes({ onBack, onHelp, onNavChange }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [navValue, setNavValue] = useState(1);
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
    else navigate('/access');
  }, [navigate, onBack]);

  const [chargers, setChargers] = useState([]);
  const [chargerId, setChargerId] = useState('');
  const [label, setLabel] = useState('Visitor pass');
  const [expires, setExpires] = useState('');
  const [maxSessions, setMaxSessions] = useState('1');
  const [passes, setPasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [qrOpen, setQrOpen] = useState(false);
  const [activeQR, setActiveQR] = useState(null);

  useEffect(() => {
    let mounted = true;
    chargerApi.getAll().then((res) => {
      const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      if (!mounted) return;
      setChargers(list);
      if (list.length && !chargerId) setChargerId(list[0].id);
    }).catch(() => {});
    return () => { mounted = false; };
  }, [chargerId]);

  async function loadPasses() {
    setLoading(true);
    setError('');
    try {
      const res = await privateChargingApi.getAccessRules();
      const rules = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      const invites = rules.filter(r => r.ruleType === 'INVITE_CODE');
      setPasses(invites.map(r => ({
        id: r.id,
        label: r.label || 'Guest pass',
        code: r.inviteCode || r.ruleValue || '',
        expires: r.expiresAt ? new Date(r.expiresAt).toLocaleString() : 'No expiry',
        scope: r.chargePointId ? 'Connector' : 'Station',
        status: r.status === 'ACTIVE' ? 'Active' : r.status || 'Inactive',
        raw: r,
      })));
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Unable to load guest passes.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPasses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const createPass = async () => {
    setError('');
    setMessage('');
    const code = `EVZ-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    try {
      await privateChargingApi.createAccessRule({
        ruleType: 'INVITE_CODE',
        ruleValue: code,
        inviteCode: code,
        chargePointId: chargerId || undefined,
        label,
        expiresAt: expires || undefined,
        maxSessions: maxSessions ? Number(maxSessions) : 1,
      });
      setMessage(`Guest pass ${code} created.`);
      await loadPasses();
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to create guest pass.');
    }
  };

  const revokePass = async (p) => {
    try {
      await privateChargingApi.disableAccessRule(p.id, {});
      await loadPasses();
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to revoke pass.');
    }
  };

  const showQR = (p) => { setActiveQR(p); setQrOpen(true); };
  const copyLink = (p) => { navigator.clipboard?.writeText(`https://evz.app/guest/${p.code}`); setMessage('Link copied.'); };

  return (
    <MobileShell
      title="Guest pass & access codes"
      tagline="time‑bound passes • QR/link"
      onBack={handleBack}
      onHelp={onHelp}
      navValue={navValue}
      onNavChange={handleNavChange}
    >
      <Box sx={{ px: 2, pt: 2, pb: 2 }}>
        {loading && <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}><CircularProgress /></Box>}
        {error && <Alert severity="warning" sx={{ mb: 1 }}>{error}</Alert>}
        {message && <Alert severity="success" sx={{ mb: 1 }} onClose={() => setMessage('')}>{message}</Alert>}

        <Paper elevation={0} sx={{ p: 2, borderRadius: 1.5, bgcolor: '#fff', border: '1px solid #eef3f1', mb: 2 }}>
          <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1 }}>Charge point</Typography>
          <FormControl fullWidth size="small">
            <InputLabel id="charger-label">Select charge point</InputLabel>
            <Select labelId="charger-label" value={chargerId} label="Select charge point" onChange={(e) => setChargerId(e.target.value)}>
              {chargers.map(ch => <MenuItem key={ch.id} value={ch.id}>{ch.name || ch.ocppId || ch.id}</MenuItem>)}
            </Select>
          </FormControl>
        </Paper>

        <Paper elevation={0} sx={{ p: 2, borderRadius: 1.5, bgcolor: '#fff', border: '1px solid #eef3f1', mb: 2 }}>
          <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1 }}>Create time‑bound pass</Typography>
          <Stack spacing={1}>
            <TextField label="Label" value={label} onChange={(e) => setLabel(e.target.value)} fullWidth size="small" />
            <TextField label="Expires" type="datetime-local" InputLabelProps={{ shrink: true }} value={expires} onChange={(e) => setExpires(e.target.value)} fullWidth size="small" />
            <TextField label="Max sessions" type="number" value={maxSessions} onChange={(e) => setMaxSessions(e.target.value)} fullWidth size="small" />
            <Button variant="contained" color="secondary" onClick={createPass} sx={{ color: 'common.white' }}>Create pass</Button>
          </Stack>
        </Paper>

        <Paper elevation={0} sx={{ p: 2, borderRadius: 1.5, bgcolor: '#fff', border: '1px solid #eef3f1' }}>
          <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1 }}>Existing passes</Typography>
          <List sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {passes.map(p => (
              <ListItemButton key={p.id} sx={{ p: 0 }}>
                <PassRow p={p} onRevoke={revokePass} onShowQR={showQR} onCopy={copyLink} />
              </ListItemButton>
            ))}
            {!loading && !passes.length && (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>No guest passes yet.</Typography>
            )}
          </List>
        </Paper>
      </Box>

      <Dialog open={qrOpen} onClose={() => setQrOpen(false)} fullWidth>
        <DialogTitle>Pass QR — {activeQR?.label}</DialogTitle>
        <DialogContent>
          <Stack spacing={1} alignItems="center" sx={{ py: 2 }}>
            <QrCode2RoundedIcon sx={{ fontSize: 96, color: 'primary.main' }} />
            <Typography variant="h6" fontWeight={800}>{activeQR?.code}</Typography>
            <Typography variant="caption" color="text.secondary">Share this code or tap copy link to send a deep link.</Typography>
            <Stack direction="row" spacing={1}>
              <Button size="small" startIcon={<ContentCopyRoundedIcon />} onClick={() => activeQR && copyLink(activeQR)}>Copy link</Button>
              <Button size="small" startIcon={<VisibilityRoundedIcon />} onClick={() => setQrOpen(false)}>Preview</Button>
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setQrOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </MobileShell>
  );
}
