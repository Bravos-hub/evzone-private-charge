import React from 'react';
import {
  Paper,
  TextField,
  Grid,
  Typography,
  InputAdornment,
  IconButton
} from '@mui/material';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import { EV } from '../../utils/theme';

export default function ChargerForm({
  form,
  onChange,
  onScanSerial,
  onScanPin,
  errors = {}
}) {
  const handleChange = (field) => (e) => {
    onChange({ ...form, [field]: e.target.value });
  };

  return (
    <Paper elevation={0} sx={{ p: 2, borderRadius: 1.5, border: `1px solid ${EV.divider}`, bgcolor: '#fff' }}>
      <Typography variant="subtitle2" fontWeight={800} gutterBottom>
        Charger details
      </Typography>
      <Grid container spacing={1.2}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Charger name"
            value={form.name || ''}
            onChange={handleChange('name')}
            error={!!errors.name}
            helperText={errors.name}
            placeholder="e.g., Home garage charger"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Make"
            value={form.make || ''}
            onChange={handleChange('make')}
            error={!!errors.make}
            helperText={errors.make}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Model"
            value={form.model || ''}
            onChange={handleChange('model')}
            error={!!errors.model}
            helperText={errors.model}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Serial number"
            value={form.serial || ''}
            onChange={handleChange('serial')}
            error={!!errors.serial}
            helperText={errors.serial}
            autoCapitalize="characters"
            autoCorrect="off"
            spellCheck={false}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    edge="end"
                    aria-label="Scan serial QR"
                    onClick={onScanSerial}
                    size="small"
                  >
                    <QrCodeScannerIcon />
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="PIN code"
            type="password"
            inputMode="numeric"
            value={form.pin || ''}
            onChange={handleChange('pin')}
            error={!!errors.pin}
            helperText={errors.pin}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    edge="end"
                    aria-label="Scan PIN QR"
                    onClick={onScanPin}
                    size="small"
                  >
                    <QrCodeScannerIcon />
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <TextField
            select
            fullWidth
            label="OCPP"
            value={form.ocpp || '1.6J'}
            onChange={handleChange('ocpp')}
            SelectProps={{ native: true }}
          >
            <option value="1.6J">1.6J</option>
            <option value="2.0.1">2.0.1</option>
          </TextField>
        </Grid>
        <Grid item xs={6} sm={3}>
          <TextField
            fullWidth
            label="Charger max (kW)"
            type="number"
            inputMode="decimal"
            value={form.powerKw || ''}
            onChange={handleChange('powerKw')}
            error={!!errors.powerKw}
            helperText={errors.powerKw}
          />
        </Grid>
      </Grid>
    </Paper>
  );
}

