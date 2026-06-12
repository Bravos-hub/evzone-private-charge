import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box, Typography, Paper, Stack, Button, TextField, Chip, IconButton,
  FormControl, InputLabel, Select, MenuItem, Alert, CircularProgress,
  List, ListItem,
} from '@mui/material';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import BlockRoundedIcon from '@mui/icons-material/BlockRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import MobileShell from '../../components/layout/MobileShell';
import OnboardingOverlay from '../../components/onboarding/OnboardingOverlay';
import { useOnboarding } from '../../context/OnboardingContext';
import { privateChargingApi, ACCESS_RULE_TYPES } from '../../services/api/privateCharging';
import { chargerApi } from '../../services/api/chargers';

function RuleRow({ rule, onDisable, onReactivate, onDelete }) {
  const status = rule.status || 'ACTIVE';
  return (
    <Paper elevation={0} sx={{ p: 1.5, borderRadius: 1.5, bgcolor: '#fff', border: '1px solid #eef3f1' }}>
      <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="subtitle2" fontWeight={700} noWrap>{rule.ruleType}</Typography>
          <Typography variant="caption" color="text.secondary" display="block" noWrap>
            {rule.ruleValue || rule.inviteCode || rule.allowedUserId || rule.allowedVehicleId || '—'}
          </Typography>
          {rule.expiresAt && <Typography variant="caption" color="text.secondary">Expires {new Date(rule.expiresAt).toLocaleString()}</Typography>}
        </Box>
        <Stack direction="row" spacing={0.5} alignItems="center">
          <Chip size="small" label={status} color={status === 'ACTIVE' ? 'success' : 'default'} />
          {status === 'ACTIVE' ? (
            <IconButton size="small" onClick={() => onDisable(rule)} title="Disable"><BlockRoundedIcon fontSize="small" /></IconButton>
          ) : (
            <IconButton size="small" onClick={() => onReactivate(rule)} title="Reactivate"><CheckCircleRoundedIcon fontSize="small" /></IconButton>
          )}
          <IconButton size="small" color="error" onClick={() => onDelete(rule)} title="Delete"><DeleteOutlineIcon fontSize="small" /></IconButton>
        </Stack>
      </Stack>
    </Paper>
  );
}

export default function AccessPermissions({ onBack, onHelp, onNavChange }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { completeStep } = useOnboarding();
  const routes = useMemo(() => ['/', '/chargers', '/sessions', '/wallet', '/settings'], []);
  const [navValue, setNavValue] = useState(1);

  useEffect(() => {
    const pathIndex = routes.findIndex(route =>
      (location.pathname === route || location.pathname.startsWith(route + '/')) && route !== '/'
    );
    if (pathIndex !== -1) setNavValue(pathIndex);
  }, [location.pathname, routes]);

  const handleNavChange = useCallback((value) => {
    setNavValue(value);
    if (value === 0) navigate('/dashboard');
    else if (routes[value] !== undefined) navigate(routes[value]);
    if (onNavChange) onNavChange(value);
  }, [navigate, routes, onNavChange]);

  const handleBack = useCallback(() => {
    if (onBack) onBack();
    else navigate('/dashboard');
  }, [navigate, onBack]);

  const [rules, setRules] = useState([]);
  const [chargers, setChargers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [saveMessage, setSaveMessage] = useState('');

  const [ruleType, setRuleType] = useState('USER');
  const [ruleValue, setRuleValue] = useState('');
  const [chargePointId, setChargePointId] = useState('');
  const [maxSessions, setMaxSessions] = useState('');
  const [maxKwh, setMaxKwh] = useState('');
  const [expiresAt, setExpiresAt] = useState('');

  async function loadData() {
    setLoading(true);
    setError('');
    try {
      const [rulesRes, chargersRes] = await Promise.all([
        privateChargingApi.getAccessRules(),
        chargerApi.getAll(),
      ]);
      setRules(Array.isArray(rulesRes?.data) ? rulesRes.data : Array.isArray(rulesRes) ? rulesRes : []);
      const list = Array.isArray(chargersRes?.data) ? chargersRes.data : Array.isArray(chargersRes) ? chargersRes : [];
      setChargers(list);
      if (list.length && !chargePointId) setChargePointId(list[0].id);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Unable to load access rules.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const createRule = async () => {
    setError('');
    setSaveMessage('');
    if (!ruleValue && ruleType !== 'TIME_WINDOW') {
      setError('Enter a value for this access rule.');
      return;
    }
    try {
      const payload = {
        ruleType,
        ruleValue: ruleType === 'INVITE_CODE' ? ruleValue : ruleValue,
        inviteCode: ruleType === 'INVITE_CODE' ? ruleValue : undefined,
        chargePointId: chargePointId || undefined,
        maxSessions: maxSessions ? Number(maxSessions) : undefined,
        maxKwh: maxKwh ? Number(maxKwh) : undefined,
        expiresAt: expiresAt || undefined,
      };
      await privateChargingApi.createAccessRule(payload);
      setSaveMessage('Access rule saved.');
      setRuleValue('');
      setMaxSessions('');
      setMaxKwh('');
      setExpiresAt('');
      await loadData();
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to save access rule.');
    }
  };

  const createGuestPass = () => {
    const code = `EVZ-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    setRuleType('INVITE_CODE');
    setRuleValue(code);
  };

  const handleDisable = async (rule) => {
    try {
      await privateChargingApi.disableAccessRule(rule.id, {});
      await loadData();
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to disable rule.');
    }
  };

  const handleReactivate = async (rule) => {
    try {
      await privateChargingApi.reactivateAccessRule(rule.id, {});
      await loadData();
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to reactivate rule.');
    }
  };

  const handleDelete = async (rule) => {
    try {
      await privateChargingApi.deleteAccessRule(rule.id);
      await loadData();
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to delete rule.');
    }
  };

  const Footer = (
    <Box sx={{ px: 2, pb: 'calc(12px + env(safe-area-inset-bottom))', pt: 1.5, background: '#f2f2f2', borderTop: '1px solid #e9eceb' }}>
      <Button fullWidth size="large" variant="contained" color="secondary" onClick={createRule} sx={{ py: 1.25, color: 'common.white' }}>
        Save access rule
      </Button>
    </Box>
  );

  return (
    <MobileShell
      title="Access & permissions"
      tagline="who can use per charger or connector"
      onBack={handleBack}
      onHelp={onHelp}
      navValue={navValue}
      onNavChange={handleNavChange}
      footerSlot={Footer}
    >
      <Box>
        {loading && <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}><CircularProgress /></Box>}
        {error && <Alert severity="warning" sx={{ mb: 1 }}>{error}</Alert>}
        {saveMessage && <Alert severity="success" sx={{ mb: 1 }} onClose={() => setSaveMessage('')}>{saveMessage}</Alert>}

        <Paper elevation={0} sx={{ p: 2, borderRadius: 1.5, bgcolor: '#fff', border: '1px solid #eef3f1', mb: 2 }}>
          <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1 }}>Existing rules</Typography>
          <List sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {rules.map(rule => (
              <ListItem key={rule.id} sx={{ p: 0 }}>
                <RuleRow rule={rule} onDisable={handleDisable} onReactivate={handleReactivate} onDelete={handleDelete} />
              </ListItem>
            ))}
            {!loading && !rules.length && (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>No access rules yet.</Typography>
            )}
          </List>
        </Paper>

        <Paper elevation={0} sx={{ p: 2, borderRadius: 1.5, bgcolor: '#fff', border: '1px solid #eef3f1', mb: 2 }}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
            <PersonAddAlt1Icon color="secondary" />
            <Typography variant="subtitle2" fontWeight={700}>Add access rule</Typography>
          </Stack>
          <Stack spacing={1.5}>
            <FormControl size="small" fullWidth>
              <InputLabel id="rule-type-label">Rule type</InputLabel>
              <Select labelId="rule-type-label" value={ruleType} label="Rule type" onChange={(e) => setRuleType(e.target.value)}>
                {ACCESS_RULE_TYPES.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
              </Select>
            </FormControl>
            <TextField label="Value (user id, vehicle id, phone, invite code…)" size="small" fullWidth value={ruleValue} onChange={(e) => setRuleValue(e.target.value)} />
            <FormControl size="small" fullWidth>
              <InputLabel id="charger-label">Charge point</InputLabel>
              <Select labelId="charger-label" value={chargePointId} label="Charge point" onChange={(e) => setChargePointId(e.target.value)}>
                {chargers.map(cp => <MenuItem key={cp.id} value={cp.id}>{cp.name || cp.ocppId || cp.id}</MenuItem>)}
              </Select>
            </FormControl>
            <Stack direction="row" spacing={1}>
              <TextField label="Max sessions" type="number" size="small" sx={{ flex: 1 }} value={maxSessions} onChange={(e) => setMaxSessions(e.target.value)} />
              <TextField label="Max kWh" type="number" size="small" sx={{ flex: 1 }} value={maxKwh} onChange={(e) => setMaxKwh(e.target.value)} />
            </Stack>
            <TextField label="Expires at" type="datetime-local" size="small" fullWidth value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} InputLabelProps={{ shrink: true }} />
            <Button size="small" variant="outlined" onClick={createGuestPass}>Generate guest invite code</Button>
          </Stack>
        </Paper>
      </Box>
      <OnboardingOverlay
        stepId="access-control"
        title="Access Control"
        description="Manage who can use your charger. Add users, set up guest passes, create access codes, and configure permissions per charger or connector."
        onComplete={() => {
          completeStep('access-control');
        }}
      />
    </MobileShell>
  );
}
