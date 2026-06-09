import React from 'react';
import { Paper, Stack, Typography, Box, Chip } from '@mui/material';
import LocationOnRoundedIcon from '@mui/icons-material/LocationOnRounded';
import EvStationRoundedIcon from '@mui/icons-material/EvStationRounded';
import { EV } from '../../utils/theme';

export default function StationCard({ station, onClick }) {
  const { name, address, type, status, rating, price } = station || {};

  return (
    <Paper
      elevation={0}
      onClick={onClick}
      sx={{
        p: 2,
        borderRadius: 1.5,
        bgcolor: '#fff',
        border: `1px solid ${EV.divider}`,
        cursor: onClick ? 'pointer' : 'default',
        '&:hover': onClick ? { borderColor: EV.green, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' } : {},
      }}
    >
      <Stack spacing={0.75}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <EvStationRoundedIcon fontSize="small" sx={{ color: EV.green }} />
          <Typography variant="subtitle1" fontWeight={700} sx={{ flex: 1 }}>
            {name || 'Unnamed Station'}
          </Typography>
          {status && (
            <Chip
              size="small"
              label={status}
              color={status === 'ACTIVE' ? 'success' : status === 'MAINTENANCE' ? 'warning' : 'default'}
            />
          )}
        </Stack>

        <Stack direction="row" alignItems="center" spacing={0.5}>
          <LocationOnRoundedIcon fontSize="small" color="disabled" />
          <Typography variant="body2" color="text.secondary">
            {address || 'No address'}
          </Typography>
        </Stack>

        <Stack direction="row" spacing={1} sx={{ pt: 0.5 }}>
          {type && (
            <Chip size="small" variant="outlined" label={type} />
          )}
          {typeof rating === 'number' && (
            <Chip size="small" variant="outlined" label={`⭐ ${rating.toFixed(1)}`} />
          )}
          {typeof price === 'number' && (
            <Chip size="small" variant="outlined" label={`UGX ${price.toLocaleString()}`} />
          )}
        </Stack>
      </Stack>
    </Paper>
  );
}
