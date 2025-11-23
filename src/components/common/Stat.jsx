import React from 'react';
import { Paper, Typography } from '@mui/material';
import { EV } from '../../utils/theme';

export default function Stat({ label, value }) {
  return (
    <Paper elevation={0} sx={{ p: 1.25, borderRadius: 1, bgcolor: '#fff', border: `1px solid ${EV.divider}`, textAlign: 'center' }}>
      <Typography variant="caption" color="text.secondary">{label}</Typography>
      <Typography variant="subtitle1" fontWeight={700}>{value}</Typography>
    </Paper>
  );
}

