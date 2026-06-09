import React from 'react';
import { Typography } from '@mui/material';

/**
 * Calculate estimated charging time.
 * @param {number} targetKwh - Desired kWh to charge
 * @param {number} maxPowerKw - Connector max power in kW
 * @param {string} powerType - 'AC' or 'DC'
 * @returns {number} Estimated minutes
 */
export function calculateEstimatedMinutes(targetKwh, maxPowerKw, powerType = 'AC') {
  if (!targetKwh || !maxPowerKw || maxPowerKw <= 0) return 0;
  const efficiencyFactor = powerType === 'DC' ? 0.9 : 0.85;
  const hours = targetKwh / (maxPowerKw * efficiencyFactor);
  return Math.ceil(hours * 60);
}

export function formatDuration(minutes) {
  if (minutes <= 0) return '—';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  return `${m}m`;
}

export default function EstimatedTimeCalc({ targetKwh, maxPowerKw, powerType }) {
  const minutes = calculateEstimatedMinutes(targetKwh, maxPowerKw, powerType);
  return (
    <Typography variant="body2" color="text.secondary">
      Estimated charging time: <strong>{formatDuration(minutes)}</strong>
    </Typography>
  );
}
