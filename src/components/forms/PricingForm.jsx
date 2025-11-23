import React from 'react';
import {
  Box,
  Paper,
  Stack,
  TextField,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Switch,
  Typography,
  Divider,
  Button,
  IconButton
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { EV } from '../../utils/theme';

export default function PricingForm({
  pricing,
  onChange,
  onAddPeriod,
  onRemovePeriod,
  onUpdatePeriod
}) {
  const handleChange = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    onChange({ ...pricing, [field]: value });
  };

  return (
    <Paper elevation={0} sx={{ p: 2, borderRadius: 1, border: `1px solid ${EV.divider}`, bgcolor: '#fff' }}>
      <Typography variant="subtitle2" fontWeight={800} gutterBottom>
        Pricing configuration
      </Typography>

      <Stack spacing={2}>
        {/* Charge by */}
        <FormControl>
          <FormLabel>Charge by</FormLabel>
          <RadioGroup
            row
            value={pricing.chargeBy || 'energy'}
            onChange={handleChange('chargeBy')}
          >
            <FormControlLabel value="energy" control={<Radio />} label="Energy (kWh)" />
            <FormControlLabel value="duration" control={<Radio />} label="Duration (min)" />
          </RadioGroup>
        </FormControl>

        {/* Basic rate */}
        <TextField
          fullWidth
          label={`Rate (${pricing.chargeBy === 'energy' ? 'per kWh' : 'per minute'})`}
          type="number"
          value={pricing.rate || ''}
          onChange={handleChange('rate')}
          InputProps={{
            startAdornment: <Typography sx={{ mr: 1 }}>UGX</Typography>
          }}
        />

        {/* VAT */}
        <Stack direction="row" spacing={2} alignItems="center">
          <TextField
            fullWidth
            label="VAT (%)"
            type="number"
            value={pricing.vat || ''}
            onChange={handleChange('vat')}
          />
          <FormControlLabel
            control={
              <Switch
                checked={pricing.includeVat || false}
                onChange={handleChange('includeVat')}
              />
            }
            label="Include in price"
          />
        </Stack>

        {/* Pricing model */}
        <Divider />
        <FormControl>
          <FormLabel>Pricing model</FormLabel>
          <RadioGroup
            value={pricing.model || 'single'}
            onChange={handleChange('model')}
          >
            <FormControlLabel value="single" control={<Radio />} label="Single rate" />
            <FormControlLabel value="tou" control={<Radio />} label="Time-of-use (TOU)" />
          </RadioGroup>
        </FormControl>

        {/* TOU Periods */}
        {pricing.model === 'tou' && pricing.periods && (
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Time-of-use periods
            </Typography>
            <Stack spacing={1.5}>
              {pricing.periods.map((period, index) => (
                <Paper
                  key={period.id || index}
                  variant="outlined"
                  sx={{ p: 1.5, borderRadius: 1 }}
                >
                  <Stack spacing={1}>
                    <TextField
                      fullWidth
                      label="Period name"
                      value={period.name || ''}
                      onChange={(e) => onUpdatePeriod(period.id, { name: e.target.value })}
                      size="small"
                    />
                    <Stack direction="row" spacing={1}>
                      <TextField
                        label="Start time"
                        type="time"
                        value={period.start || ''}
                        onChange={(e) => onUpdatePeriod(period.id, { start: e.target.value })}
                        size="small"
                        sx={{ flex: 1 }}
                        InputLabelProps={{ shrink: true }}
                      />
                      <TextField
                        label="End time"
                        type="time"
                        value={period.end || ''}
                        onChange={(e) => onUpdatePeriod(period.id, { end: e.target.value })}
                        size="small"
                        sx={{ flex: 1 }}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Stack>
                    <TextField
                      fullWidth
                      label="Rate"
                      type="number"
                      value={period.rate || ''}
                      onChange={(e) => onUpdatePeriod(period.id, { rate: e.target.value })}
                      size="small"
                    />
                    {pricing.periods.length > 1 && (
                      <IconButton
                        color="error"
                        onClick={() => onRemovePeriod(period.id)}
                        size="small"
                        sx={{ alignSelf: 'flex-start' }}
                      >
                        <DeleteOutlineIcon />
                      </IconButton>
                    )}
                  </Stack>
                </Paper>
              ))}
              <Button
                startIcon={<AddCircleOutlineIcon />}
                onClick={onAddPeriod}
                variant="outlined"
                size="small"
                sx={{ alignSelf: 'flex-start' }}
              >
                Add period
              </Button>
            </Stack>
          </Box>
        )}
      </Stack>
    </Paper>
  );
}

