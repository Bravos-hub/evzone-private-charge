import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Paper, Stack, Button, Chip, IconButton,
  FormControl, Select, MenuItem, TextField,
  List, ListItemButton, Dialog, DialogTitle, DialogContent, DialogActions,
  Alert, CircularProgress
} from '@mui/material';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import EditCalendarRoundedIcon from '@mui/icons-material/EditCalendarRounded';
import FileDownloadRoundedIcon from '@mui/icons-material/FileDownloadRounded';
import MobileShell from '../../components/layout/MobileShell';
import { useBookings } from '../../hooks/useBookings';
import { useChargers } from '../../hooks/useChargers';
import { bookingApi } from '../../services/api/bookings';
import { EV } from '../../utils/theme';

function ResRow({ r, onApprove, onDeny, onReschedule, onOpen }) {
  const userName = r.user?.name || r.customerNameSnapshot || 'Unknown';
  const connectorLabel = r.chargePoint?.connectors?.[0]?.type || `Connector ${r.connectorId || ''}`;
  const startStr = r.startTime ? new Date(r.startTime).toLocaleString() : '—';
  const endStr = r.endTime ? new Date(r.endTime).toLocaleTimeString() : '—';
  const status = r.status || 'PENDING';

  return (
    <Paper elevation={0} sx={{ p: 1.25, borderRadius: 1.5, bgcolor: '#fff', border: '1px solid #eef3f1' }}>
      <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
        <Box onClick={() => onOpen && onOpen(r)} sx={{ cursor: 'pointer', flex: 1 }}>
          <Typography variant="subtitle2" fontWeight={700}>{userName} — {connectorLabel}</Typography>
          <Typography variant="caption" color="text.secondary"><AccessTimeRoundedIcon fontSize="inherit"/> {startStr} → {endStr}</Typography>
          <Stack direction="row" spacing={1} sx={{ mt: 0.5, flexWrap: 'wrap' }}>
            <Chip size="small" label={status} color={status==='CONFIRMED' ? 'success' : status==='CANCELLED' ? 'error' : status==='EXPIRED' ? 'error' : 'warning'} />
            {r.feeAmount && <Chip size="small" label={`UGX ${Number(r.feeAmount).toLocaleString()}`} variant="outlined" />}
          </Stack>
        </Box>
        <Stack direction="row" spacing={0.5}>
          {status==='PENDING' && <IconButton size="small" color="success" onClick={()=>onApprove&&onApprove(r)} aria-label="Approve"><CheckRoundedIcon/></IconButton>}
          {status==='PENDING' && <IconButton size="small" color="error" onClick={()=>onDeny&&onDeny(r)} aria-label="Deny"><CloseRoundedIcon/></IconButton>}
          <IconButton size="small" onClick={()=>onReschedule&&onReschedule(r)} aria-label="Reschedule"><EditCalendarRoundedIcon/></IconButton>
        </Stack>
      </Stack>
    </Paper>
  );
}

export default function BookingsReservations() {
  const navigate = useNavigate();
  const [navValue, setNavValue] = useState(1);
  const [chargerId, setChargerId] = useState('');
  const [tab, setTab] = useState('upcoming');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [edit, setEdit] = useState(null);
  const [newStart, setNewStart] = useState('');
  const [newEnd, setNewEnd] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState('');

  const { bookings, loading, error, refetch } = useBookings();
  const { chargers } = useChargers();

  useEffect(() => {
    if (chargers.length > 0 && !chargerId) {
      setChargerId(chargers[0].id);
    }
  }, [chargers, chargerId]);

  const filteredBookings = bookings.filter((b) => {
    if (chargerId && b.chargePointId !== chargerId) return false;
    const status = b.status || 'PENDING';
    const isUpcoming = ['PENDING', 'CONFIRMED'].includes(status);
    const isPast = ['COMPLETED', 'CANCELLED', 'EXPIRED', 'NO_SHOW'].includes(status);
    return tab === 'upcoming' ? isUpcoming : isPast;
  });

  const openReschedule = (r) => {
    setEdit(r);
    setNewStart(r.startTime ? new Date(r.startTime).toISOString().slice(0, 16) : '');
    setNewEnd(r.endTime ? new Date(r.endTime).toISOString().slice(0, 16) : '');
    setDialogOpen(true);
  };

  const saveReschedule = async () => {
    if (!edit) return;
    setActionLoading(true);
    setActionError('');
    try {
      await bookingApi.update(edit.id, {
        startAt: newStart ? new Date(newStart).toISOString() : undefined,
        durationMinutes: newStart && newEnd
          ? Math.max(1, Math.floor((new Date(newEnd).getTime() - new Date(newStart).getTime()) / 60000))
          : undefined,
      });
      setDialogOpen(false);
      refetch();
    } catch (err) {
      setActionError(err.response?.data?.message || err.message || 'Failed to reschedule');
    } finally {
      setActionLoading(false);
    }
  };

  const approveReservation = async (r) => {
    setActionLoading(true);
    setActionError('');
    try {
      await bookingApi.checkin(r.id);
      refetch();
    } catch (err) {
      setActionError(err.response?.data?.message || err.message || 'Failed to approve');
    } finally {
      setActionLoading(false);
    }
  };

  const denyReservation = async (r) => {
    setActionLoading(true);
    setActionError('');
    try {
      await bookingApi.cancel(r.id, 'Denied by operator');
      refetch();
    } catch (err) {
      setActionError(err.response?.data?.message || err.message || 'Failed to deny');
    } finally {
      setActionLoading(false);
    }
  };

  const exportCSV = () => {
    const headers = ['id','user','chargePointId','startTime','endTime','status','feeAmount'];
    const rows = filteredBookings.map(r => [
      r.id,
      r.user?.name || r.customerNameSnapshot || '',
      r.chargePointId || '',
      r.startTime || '',
      r.endTime || '',
      r.status || '',
      r.feeAmount || ''
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reservations-${tab}-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleNavChange = (value) => {
    const routes = ['/', '/stations', '/sessions', '/wallet', '/settings'];
    if (routes[value]) navigate(routes[value]);
    setNavValue(value);
  };

  const Footer = (
    <Box sx={{ px: 2, pb: 'calc(12px + env(safe-area-inset-bottom))', pt: 1.5, background: '#f2f2f2', borderTop: '1px solid #e9eceb' }}>
      <Stack direction="row" spacing={1}>
        <Chip label="Upcoming" clickable color={tab==='upcoming'?'secondary':'default'} onClick={()=>setTab('upcoming')} />
        <Chip label="Past" clickable color={tab==='past'?'secondary':'default'} onClick={()=>setTab('past')} />
        <Box sx={{ flexGrow: 1 }} />
        <Button variant="contained" color="secondary" startIcon={<FileDownloadRoundedIcon />} onClick={exportCSV}
          sx={{ color: 'common.white', '&:hover': { bgcolor: 'secondary.dark', color: 'common.white' } }}>Export</Button>
      </Stack>
    </Box>
  );

  return (
    <MobileShell
      title="Bookings & reservations"
      tagline="approve • reschedule • monetize"
      navValue={navValue}
      onNavChange={handleNavChange}
      onBack={() => navigate('/dashboard')}
      footer={Footer}
    >
      <Box sx={{ px: 2, pt: 2 }}>
        {actionError && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setActionError('')}>{actionError}</Alert>}
        {loading && (
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
            <CircularProgress size={18} />
            <Typography variant="body2" color="text.secondary">Loading bookings…</Typography>
          </Stack>
        )}
        {error && <Alert severity="warning" sx={{ mb: 2 }}>{error}</Alert>}

        {/* Charger selector */}
        <Paper elevation={0} sx={{ p: 2, borderRadius: 1.5, bgcolor: '#fff', border: `1px solid ${EV.divider}`, mb: 2 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
            <Typography variant="subtitle2" fontWeight={800}>My chargers</Typography>
            <Button
              size="small"
              variant="contained"
              color="secondary"
              startIcon={<AddRoundedIcon />}
              onClick={() => navigate('/bookings/new')}
              sx={{ color: 'common.white' }}
            >
              New
            </Button>
          </Stack>
          <FormControl size="small" fullWidth>
            <Select value={chargerId} onChange={(e)=>setChargerId(e.target.value)} displayEmpty>
              <MenuItem value="">All chargers</MenuItem>
              {chargers.map(c => <MenuItem key={c.id} value={c.id}>{c.name || c.model || c.ocppId}</MenuItem>)}
            </Select>
          </FormControl>
        </Paper>

        <List sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {filteredBookings.map(r => (
            <ListItemButton key={r.id} sx={{ p: 0 }} onClick={() => navigate(`/bookings/${r.id}`)}>
              <ResRow r={r}
                onOpen={(x) => navigate(`/bookings/${x.id}`)}
                onApprove={approveReservation}
                onDeny={denyReservation}
                onReschedule={openReschedule}
              />
            </ListItemButton>
          ))}
        </List>

        {!loading && filteredBookings.length === 0 && (
          <Paper elevation={0} sx={{ p: 2, borderRadius: 1.5, bgcolor: '#fff', border: '1px dashed #e0e0e0', textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary">No {tab} reservations.</Typography>
          </Paper>
        )}
      </Box>

      {/* Reschedule dialog */}
      <Dialog open={dialogOpen} onClose={()=>setDialogOpen(false)} fullWidth>
        <DialogTitle>Reschedule</DialogTitle>
        <DialogContent>
          {actionError && <Alert severity="error" sx={{ mb: 1 }}>{actionError}</Alert>}
          <Stack spacing={1.25} sx={{ pt: 1 }}>
            <TextField label="Start" type="datetime-local" InputLabelProps={{ shrink: true }} value={newStart} onChange={(e)=>setNewStart(e.target.value)} fullWidth />
            <TextField label="End" type="datetime-local" InputLabelProps={{ shrink: true }} value={newEnd} onChange={(e)=>setNewEnd(e.target.value)} fullWidth />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={()=>setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" color="secondary" onClick={saveReschedule} disabled={actionLoading} sx={{ color: 'common.white' }}>
            {actionLoading ? <CircularProgress size={18} /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </MobileShell>
  );
}
