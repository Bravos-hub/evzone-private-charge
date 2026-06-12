import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box, Typography, Paper, Stack, Button, Chip, List, ListItemButton,
  CircularProgress, Alert, IconButton,
} from '@mui/material';
import FileDownloadRoundedIcon from '@mui/icons-material/FileDownloadRounded';
import FilterListRoundedIcon from '@mui/icons-material/FilterListRounded';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import MobileShell from '../../components/layout/MobileShell';
import { diagnosticsApi } from '../../services/api/diagnostics';

function FaultRow({ f, onAcknowledge, onResolve }) {
  const color = f.severity === 'CRITICAL' || f.severity === 'Critical' ? 'error' : f.severity === 'HIGH' || f.severity === 'Warning' ? 'warning' : 'default';
  return (
    <Paper elevation={0} sx={{ p: 1.25, borderRadius: 1.5, bgcolor: '#fff', border: '1px solid #eef3f1' }}>
      <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="subtitle2" fontWeight={700} noWrap>{f.code} — {f.title}</Typography>
          <Typography variant="caption" color="text.secondary">{f.time}</Typography>
        </Box>
        <Chip size="small" label={f.severity} color={color} />
        {f.status === 'OPEN' && (
          <Stack direction="row" spacing={0.5}>
            <IconButton size="small" onClick={() => onAcknowledge && onAcknowledge(f)} title="Acknowledge">
              <CheckCircleOutlineRoundedIcon fontSize="small" />
            </IconButton>
          </Stack>
        )}
        {(f.status === 'OPEN' || f.status === 'ACKNOWLEDGED') && (
          <Button size="small" onClick={() => onResolve && onResolve(f)}>Resolve</Button>
        )}
      </Stack>
    </Paper>
  );
}

export default function DiagnosticsLogs({ onBack, onHelp, onNavChange, onExport, onFilter, onOpenFault }) {
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

  const [tab, setTab] = useState('faults');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [incidents, setIncidents] = useState([]);

  async function loadIncidents() {
    setLoading(true);
    setError('');
    try {
      const res = await diagnosticsApi.getIncidents({ status: tab === 'faults' ? 'OPEN' : undefined });
      const data = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      setIncidents(data);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Unable to load diagnostics.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadIncidents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  const faults = useMemo(() => incidents.map((inc) => ({
    id: inc.id,
    code: inc.id.slice(0, 8).toUpperCase(),
    title: inc.title || inc.description || 'Incident',
    severity: inc.severity || 'LOW',
    status: inc.status || 'OPEN',
    time: inc.createdAt ? new Date(inc.createdAt).toLocaleString() : '',
    raw: inc,
  })), [incidents]);

  const events = useMemo(() => incidents.map((inc) => ({
    id: inc.id,
    title: inc.title || 'Event',
    time: inc.createdAt ? new Date(inc.createdAt).toLocaleString() : '',
  })), [incidents]);

  const handleAcknowledge = async (f) => {
    try {
      await diagnosticsApi.updateIncident(f.id, { status: 'ACKNOWLEDGED' });
      await loadIncidents();
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to acknowledge.');
    }
  };

  const handleResolve = async (f) => {
    try {
      await diagnosticsApi.updateIncident(f.id, { status: 'RESOLVED' });
      await loadIncidents();
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to resolve.');
    }
  };

  const handleFilter = useCallback(() => {
    if (onFilter) onFilter(tab);
    else console.info('Open filter for', tab);
  }, [onFilter, tab]);

  const handleExport = useCallback(() => {
    if (onExport) {
      onExport(tab);
      return;
    }
    const data = tab === 'faults' ? faults : events;
    const csv = [
      tab === 'faults' ? ['Code', 'Title', 'Severity', 'Status', 'Time'].join(',') : ['Title', 'Time'].join(','),
      ...data.map(item => {
        if (tab === 'faults') {
          return [item.code, item.title, item.severity, item.status, item.time].join(',');
        }
        return [item.title, item.time].join(',');
      })
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `diagnostics-${tab}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  }, [onExport, tab, faults, events]);

  const Footer = (
    <Box sx={{ px: 2, pb: 'calc(12px + env(safe-area-inset-bottom))', pt: 1.5, background: '#fff', borderTop: '1px solid #eef3f1' }}>
      <Stack direction="row" spacing={1}>
        <Button variant="contained" color="primary" startIcon={<FilterListRoundedIcon />} onClick={handleFilter} sx={{ borderRadius: 1.5, color: 'common.white' }}>FILTER</Button>
        <Button variant="contained" color="secondary" startIcon={<FileDownloadRoundedIcon />} onClick={handleExport} sx={{ ml: 'auto', borderRadius: 1.5, color: 'common.white' }}>EXPORT</Button>
      </Stack>
    </Box>
  );

  return (
    <MobileShell
      title="Diagnostics & logs"
      tagline="faults • events • export"
      onBack={handleBack}
      onHelp={onHelp}
      navValue={navValue}
      onNavChange={handleNavChange}
      footerSlot={Footer}
    >
      <Box>
        {loading && <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}><CircularProgress /></Box>}
        {error && <Alert severity="warning" sx={{ mb: 1 }}>{error}</Alert>}

        <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
          {['faults', 'events'].map(k => (
            <Chip key={k} label={k} clickable color={tab === k ? 'secondary' : 'default'} onClick={() => setTab(k)} />
          ))}
        </Stack>

        {tab === 'faults' ? (
          <List sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {faults.map(f => (
              <ListItemButton key={f.id} sx={{ p: 0 }} onClick={() => (onOpenFault ? onOpenFault(f.raw) : undefined)}>
                <FaultRow f={f} onAcknowledge={handleAcknowledge} onResolve={handleResolve} />
              </ListItemButton>
            ))}
            {!loading && !faults.length && (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>No open faults.</Typography>
            )}
          </List>
        ) : (
          <Paper elevation={0} sx={{ p: 1.25, borderRadius: 1.5, bgcolor: '#fff', border: '1px solid #eef3f1' }}>
            <Stack spacing={0.75}>
              {events.map(e => (
                <Box key={e.id}>
                  <Typography variant="subtitle2" fontWeight={700}>{e.title}</Typography>
                  <Typography variant="caption" color="text.secondary">{e.time}</Typography>
                </Box>
              ))}
              {!loading && !events.length && (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>No events.</Typography>
              )}
            </Stack>
          </Paper>
        )}
      </Box>
    </MobileShell>
  );
}
