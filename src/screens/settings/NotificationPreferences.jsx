import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Typography, Stack, Alert, Button, Paper, FormControlLabel, Checkbox, Chip, Divider
} from '@mui/material';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import MobileShell from '../../components/layout/MobileShell';
import { EV } from '../../utils/theme';

const INTERVAL_OPTIONS = [
  { value: 60, label: '1 hour before' },
  { value: 30, label: '30 minutes before' },
  { value: 15, label: '15 minutes before' },
  { value: 5, label: '5 minutes before' },
];

const CHANNEL_OPTIONS = [
  { key: 'push', label: 'Push notifications' },
  { key: 'email', label: 'Email' },
  { key: 'sms', label: 'SMS' },
];

const STORAGE_KEY = 'evzone:notification:preferences';

export default function NotificationPreferences() {
  const navigate = useNavigate();
  const [intervals, setIntervals] = useState([30, 15]);
  const [channels, setChannels] = useState({ push: true, email: true, sms: false });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.intervals) setIntervals(parsed.intervals);
        if (parsed.channels) setChannels(parsed.channels);
      }
    } catch (_) {
      // ignore
    }
  }, []);

  const toggleInterval = (value) => {
    setIntervals((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value].sort((a, b) => a - b)
    );
    setSaved(false);
  };

  const toggleChannel = (key) => {
    setChannels((prev) => ({ ...prev, [key]: !prev[key] }));
    setSaved(false);
  };

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ intervals, channels }));
    setSaved(true);
    // TODO: sync to backend user profile when endpoint is available
  };

  const handleNavChange = (value) => {
    const routes = ['/', '/stations', '/sessions', '/wallet', '/settings'];
    if (routes[value]) navigate(routes[value]);
  };

  return (
    <MobileShell
      title="Notifications"
      tagline="reminders & alerts"
      navValue={4}
      onNavChange={handleNavChange}
      onBack={() => navigate('/settings')}
    >
      <Stack spacing={2}>
        {saved && <Alert severity="success" onClose={() => setSaved(false)}>Preferences saved locally.</Alert>}

        <Alert severity="info" sx={{ py: 0.5 }}>
          Reminders are sent using the backend notification service. A backend cron job is required to schedule them.
        </Alert>

        <Paper elevation={0} sx={{ p: 2, borderRadius: 1.5, bgcolor: '#fff', border: `1px solid ${EV.divider}` }}>
          <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 1.5 }}>
            Reminder Intervals
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
            Choose when to be reminded before a booked session starts.
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {INTERVAL_OPTIONS.map((opt) => (
              <Chip
                key={opt.value}
                label={opt.label}
                clickable
                color={intervals.includes(opt.value) ? 'secondary' : 'default'}
                onClick={() => toggleInterval(opt.value)}
                sx={{
                  '&.MuiChip-colorSecondary': { color: 'common.white' },
                }}
              />
            ))}
          </Stack>
        </Paper>

        <Paper elevation={0} sx={{ p: 2, borderRadius: 1.5, bgcolor: '#fff', border: `1px solid ${EV.divider}` }}>
          <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 1.5 }}>
            Channels
          </Typography>
          <Stack spacing={0.5}>
            {CHANNEL_OPTIONS.map((ch) => (
              <FormControlLabel
                key={ch.key}
                control={
                  <Checkbox
                    checked={channels[ch.key]}
                    onChange={() => toggleChannel(ch.key)}
                    color="secondary"
                  />
                }
                label={ch.label}
              />
            ))}
          </Stack>
        </Paper>

        <Button
          fullWidth
          variant="contained"
          color="secondary"
          startIcon={<SaveRoundedIcon />}
          onClick={handleSave}
          sx={{ color: 'common.white' }}
        >
          Save Preferences
        </Button>

        <Divider sx={{ my: 1 }} />

        <Typography variant="caption" color="text.secondary">
          These settings are stored in your browser. To sync across devices, a backend user-preferences endpoint will be needed.
        </Typography>
      </Stack>
    </MobileShell>
  );
}
