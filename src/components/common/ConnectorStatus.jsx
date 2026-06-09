import React from 'react';
import { Chip } from '@mui/material';

const STATUS_COLORS = {
  Available: 'success',
  Preparing: 'warning',
  Charging: 'info',
  SuspendedEVSE: 'default',
  SuspendedEV: 'default',
  Finishing: 'warning',
  Reserved: 'secondary',
  Unavailable: 'error',
  Faulted: 'error',
  UNKNOWN: 'default',
};

export default function ConnectorStatus({ status }) {
  const normalized = status || 'UNKNOWN';
  const color = STATUS_COLORS[normalized] || 'default';
  return <Chip size="small" label={normalized} color={color} />;
}
