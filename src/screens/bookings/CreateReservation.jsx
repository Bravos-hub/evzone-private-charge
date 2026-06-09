import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Typography, Stack, Alert, Button, TextField, Paper, Chip, CircularProgress, Stepper, Step, StepLabel
} from '@mui/material';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import MobileShell from '../../components/layout/MobileShell';
import EstimatedTimeCalc, { calculateEstimatedMinutes, formatDuration } from '../../components/common/EstimatedTimeCalc';
import { useStation } from '../../hooks/useStation';
import { useCharger } from '../../hooks/useCharger';
import { useConnectors } from '../../hooks/useConnectors';
import { bookingApi } from '../../services/api/bookings';
import { EV } from '../../utils/theme';

const STEPS = ['Station', 'Connector', 'Schedule', 'Review'];

export default function CreateReservation() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const stationId = searchParams.get('stationId');
  const chargePointId = searchParams.get('chargePointId');

  const [activeStep, setActiveStep] = useState(0);
  const [selectedConnectorId, setSelectedConnectorId] = useState('');
  const [startAt, setStartAt] = useState('');
  const [targetKwh, setTargetKwh] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const { station } = useStation(stationId);
  const { charger } = useCharger(chargePointId);
  const { connectors } = useConnectors(chargePointId);

  const selectedConnector = connectors.find((c) => (c.id || String(c.ocppConnectorId)) === selectedConnectorId);

  const estimatedMinutes = useMemo(() => {
    if (!selectedConnector || !targetKwh) return 0;
    return calculateEstimatedMinutes(
      Number(targetKwh),
      selectedConnector.maxPowerKw || charger?.power || 7.4,
      selectedConnector.powerType || 'AC'
    );
  }, [selectedConnector, targetKwh, charger]);

  useEffect(() => {
    if (chargePointId && connectors.length > 0 && !selectedConnectorId) {
      setSelectedConnectorId(connectors[0].id || String(connectors[0].ocppConnectorId));
    }
  }, [chargePointId, connectors, selectedConnectorId]);

  useEffect(() => {
    if (stationId && chargePointId) {
      setActiveStep(1); // Skip to connector selection if pre-filled
    }
  }, [stationId, chargePointId]);

  const handleNext = () => setActiveStep((s) => Math.min(s + 1, STEPS.length - 1));
  const handleBack = () => setActiveStep((s) => Math.max(s - 1, 0));

  const handleSubmit = async () => {
    if (!startAt || !targetKwh) return;
    setSubmitting(true);
    setSubmitError('');
    try {
      const payload = {
        stationId,
        chargePointId,
        connectorId: selectedConnectorId ? Number(selectedConnectorId) : undefined,
        startAt: new Date(startAt).toISOString(),
        durationMinutes: estimatedMinutes + 15, // buffer
        requiredKwh: Number(targetKwh),
      };
      const res = await bookingApi.create(payload);
      const bookingId = res?.data?.id || res?.id;
      if (bookingId) {
        navigate(`/bookings/${bookingId}`);
      } else {
        setSubmitError('Booking created but no ID returned.');
      }
    } catch (err) {
      setSubmitError(err.response?.data?.message || err.message || 'Failed to create booking');
    } finally {
      setSubmitting(false);
    }
  };

  const handleNavChange = (value) => {
    const routes = ['/', '/stations', '/sessions', '/wallet', '/settings'];
    if (routes[value]) navigate(routes[value]);
  };

  const nowLocal = new Date();
  nowLocal.setMinutes(nowLocal.getMinutes() - nowLocal.getTimezoneOffset());
  const minDateTime = nowLocal.toISOString().slice(0, 16);

  return (
    <MobileShell
      title="New Reservation"
      tagline="Book your charging session"
      navValue={1}
      onNavChange={handleNavChange}
      onBack={() => navigate(-1)}
    >
      <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 3 }}>
        {STEPS.map((label) => (
          <Step key={label}><StepLabel>{label}</StepLabel></Step>
        ))}
      </Stepper>

      {submitError && <Alert severity="error" sx={{ mb: 2 }}>{submitError}</Alert>}

      {activeStep === 0 && (
        <Stack spacing={2}>
          <Typography variant="subtitle1" fontWeight={800}>Select Station</Typography>
          {station ? (
            <Paper elevation={0} sx={{ p: 2, borderRadius: 1.5, bgcolor: '#fff', border: `1px solid ${EV.divider}` }}>
              <Typography variant="subtitle2" fontWeight={700}>{station.name}</Typography>
              <Typography variant="body2" color="text.secondary">{station.address}</Typography>
              <Button variant="outlined" sx={{ mt: 1 }} onClick={handleNext}>Continue</Button>
            </Paper>
          ) : (
            <Alert severity="info">Loading station…</Alert>
          )}
        </Stack>
      )}

      {activeStep === 1 && (
        <Stack spacing={2}>
          <Typography variant="subtitle1" fontWeight={800}>Select Connector</Typography>
          {charger && (
            <Typography variant="body2" color="text.secondary">
              {charger.model || charger.ocppId} · {charger.power ? `${charger.power} kW` : ''}
            </Typography>
          )}
          <Stack spacing={1}>
            {connectors.map((c) => (
              <Paper
                key={c.id || c.ocppConnectorId}
                elevation={0}
                onClick={() => setSelectedConnectorId(c.id || String(c.ocppConnectorId))}
                sx={{
                  p: 1.5,
                  borderRadius: 1.5,
                  bgcolor: '#fff',
                  border: (c.id || String(c.ocppConnectorId)) === selectedConnectorId ? `2px solid ${EV.orange}` : `1px solid ${EV.divider}`,
                  cursor: 'pointer',
                }}
              >
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Typography variant="body2" fontWeight={700}>
                    {c.type || 'Unknown'} · {c.maxPowerKw ? `${c.maxPowerKw} kW` : ''} · {c.powerType || ''}
                  </Typography>
                </Stack>
              </Paper>
            ))}
            {connectors.length === 0 && <Alert severity="warning">No connectors available.</Alert>}
          </Stack>
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" onClick={handleBack}>Back</Button>
            <Button variant="contained" color="secondary" disabled={!selectedConnectorId} onClick={handleNext} sx={{ color: 'common.white' }}>
              Continue
            </Button>
          </Stack>
        </Stack>
      )}

      {activeStep === 2 && (
        <Stack spacing={2}>
          <Typography variant="subtitle1" fontWeight={800}>Schedule & Target</Typography>
          <TextField
            label="Start time"
            type="datetime-local"
            InputLabelProps={{ shrink: true }}
            inputProps={{ min: minDateTime }}
            value={startAt}
            onChange={(e) => setStartAt(e.target.value)}
            fullWidth
          />
          <TextField
            label="Target kWh"
            type="number"
            value={targetKwh}
            onChange={(e) => setTargetKwh(e.target.value)}
            helperText="How much energy do you need?"
            fullWidth
          />
          {selectedConnector && targetKwh && (
            <Paper elevation={0} sx={{ p: 2, borderRadius: 1.5, bgcolor: '#fff', border: `1px solid ${EV.divider}` }}>
              <EstimatedTimeCalc
                targetKwh={Number(targetKwh)}
                maxPowerKw={selectedConnector.maxPowerKw || charger?.power || 7.4}
                powerType={selectedConnector.powerType || 'AC'}
              />
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                Suggested end: <strong>{formatDuration(estimatedMinutes + 15)}</strong> after start (includes 15 min buffer)
              </Typography>
            </Paper>
          )}
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" onClick={handleBack}>Back</Button>
            <Button variant="contained" color="secondary" disabled={!startAt || !targetKwh} onClick={handleNext} sx={{ color: 'common.white' }}>
              Review
            </Button>
          </Stack>
        </Stack>
      )}

      {activeStep === 3 && (
        <Stack spacing={2}>
          <Typography variant="subtitle1" fontWeight={800}>Review & Confirm</Typography>
          <Paper elevation={0} sx={{ p: 2, borderRadius: 1.5, bgcolor: '#fff', border: `1px solid ${EV.divider}` }}>
            <Stack spacing={1}>
              <Typography variant="body2"><strong>Station:</strong> {station?.name}</Typography>
              <Typography variant="body2"><strong>Charger:</strong> {charger?.model || charger?.ocppId}</Typography>
              <Typography variant="body2"><strong>Connector:</strong> {selectedConnector?.type} ({selectedConnector?.powerType})</Typography>
              <Typography variant="body2"><strong>Start:</strong> {startAt ? new Date(startAt).toLocaleString() : '—'}</Typography>
              <Typography variant="body2"><strong>Target:</strong> {targetKwh} kWh</Typography>
              <Typography variant="body2"><strong>Estimated duration:</strong> {formatDuration(estimatedMinutes)}</Typography>
              <Chip size="small" label={`UGX ${(station?.price || 0).toLocaleString()} / kWh`} variant="outlined" />
            </Stack>
          </Paper>
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" onClick={handleBack}>Back</Button>
            <Button
              variant="contained"
              color="secondary"
              startIcon={<CalendarMonthRoundedIcon />}
              onClick={handleSubmit}
              disabled={submitting}
              sx={{ color: 'common.white' }}
            >
              {submitting ? <CircularProgress size={20} color="inherit" /> : 'Confirm Booking'}
            </Button>
          </Stack>
        </Stack>
      )}
    </MobileShell>
  );
}
