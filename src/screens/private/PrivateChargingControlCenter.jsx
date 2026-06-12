import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  Grid,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import BusinessRoundedIcon from '@mui/icons-material/BusinessRounded';
import DirectionsCarFilledRoundedIcon from '@mui/icons-material/DirectionsCarFilledRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import QrCode2RoundedIcon from '@mui/icons-material/QrCode2Rounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import MobileShell from '../../components/layout/MobileShell';
import AdminOnly from '../../components/auth/AdminOnly';
import {
  ACCESS_RULE_TYPES,
  ACCESS_MODES,
  BILLING_PARTIES,
  PRIVATE_OPERATING_MODES,
  TARIFF_AUDIENCES,
  VISIBILITY_MODES,
  privateChargingApi,
} from '../../services/api/privateCharging';
import { chargerApi } from '../../services/api/chargers';

const modeIcons = {
  PRIVATE_HOME: <HomeRoundedIcon />,
  WORKPLACE: <BusinessRoundedIcon />,
  FLEET_DEPOT: <DirectionsCarFilledRoundedIcon />,
  RESIDENTIAL: <GroupsRoundedIcon />,
  COMMERCIAL_PRIVATE: <BusinessRoundedIcon />,
  VIP_RESTRICTED: <QrCode2RoundedIcon />,
};

function Stat({ label, value }) {
  return (
    <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2, height: '100%' }}>
      <Typography variant="caption" color="text.secondary">{label}</Typography>
      <Typography variant="h6" fontWeight={800}>{value}</Typography>
    </Paper>
  );
}

export default function PrivateChargingControlCenter({ view = 'control' }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dashboard, setDashboard] = useState(null);
  const [accessRules, setAccessRules] = useState([]);
  const [tariffs, setTariffs] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [mode, setMode] = useState('PRIVATE_HOME');
  const [accessMode, setAccessMode] = useState('PRIVATE');
  const [visibility, setVisibility] = useState('HIDDEN');
  const [audience, setAudience] = useState('OWNER');
  const [billingParty, setBillingParty] = useState('OWNER');
  const [pricePerKwh, setPricePerKwh] = useState('900');
  const [freeAllowanceKwh, setFreeAllowanceKwh] = useState('0');
  const [idleFeePerMinute, setIdleFeePerMinute] = useState('0');
  const [usageCapKwh, setUsageCapKwh] = useState('');
  const [subsidyPercent, setSubsidyPercent] = useState('0');
  const [guestLimit, setGuestLimit] = useState('2');
  const [inviteCode, setInviteCode] = useState('');
  const [stationId, setStationId] = useState('');
  const [chargerCode, setChargerCode] = useState('');
  const [connectorType, setConnectorType] = useState('TYPE_2');
  const [connectorPowerKw, setConnectorPowerKw] = useState('7.4');
  const [parkingNotes, setParkingNotes] = useState('');
  const [accessRuleType, setAccessRuleType] = useState('USER');
  const [accessRuleValue, setAccessRuleValue] = useState('');
  const [maxKwh, setMaxKwh] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError('');
      try {
        const [dashboardRes, rulesRes, tariffsRes, sessionsRes] = await Promise.all([
          privateChargingApi.getDashboard(),
          privateChargingApi.getAccessRules(),
          privateChargingApi.getTariffs(),
          privateChargingApi.getSessions(),
        ]);
        if (!mounted) return;
        setDashboard(dashboardRes.data);
        setAccessRules(Array.isArray(rulesRes.data) ? rulesRes.data : []);
        setTariffs(Array.isArray(tariffsRes.data) ? tariffsRes.data : []);
        setSessions(Array.isArray(sessionsRes.data) ? sessionsRes.data : []);
      } catch (err) {
        if (!mounted) return;
        setError(err?.response?.data?.message || 'Unable to load private charging data.');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const reimbursementEligible = useMemo(
    () => sessions.filter((session) => session.reimbursementEligible).length,
    [sessions],
  );

  async function linkPrivateCharger() {
    if (!stationId || !chargerCode) {
      setSaveMessage('Enter a station ID and charger code before linking.');
      return;
    }

    await chargerApi.create({
      stationId,
      ocppId: chargerCode,
      serialNumber: chargerCode,
      model: mode.replaceAll('_', ' '),
      accessMode,
      visibility,
      parkingAccessNotes: parkingNotes,
      connectors: [
        {
          type: connectorType,
          powerType: connectorPowerKw && Number(connectorPowerKw) > 22 ? 'DC' : 'AC',
          maxPowerKw: Number(connectorPowerKw) || undefined,
        },
      ],
    });
    setSaveMessage('Private charger link saved.');
  }

  async function createAccessRule() {
    if (!accessRuleValue && accessRuleType !== 'TIME_WINDOW') {
      setSaveMessage('Enter a user, vehicle, fleet, organization, RFID, phone, or invite value.');
      return;
    }

    const inviteValue = accessRuleType === 'INVITE_CODE' ? accessRuleValue : undefined;
    await privateChargingApi.createAccessRule({
      ruleType: accessRuleType,
      ruleValue: accessRuleValue || accessRuleType,
      inviteCode: inviteValue,
      phoneNumber: accessRuleType === 'PHONE_NUMBER' ? accessRuleValue : undefined,
      expiresAt: expiresAt || undefined,
      maxSessions: Number(guestLimit) || undefined,
      maxKwh: Number(maxKwh) || undefined,
    });
    const rulesRes = await privateChargingApi.getAccessRules();
    setAccessRules(Array.isArray(rulesRes.data) ? rulesRes.data : []);
    setAccessRuleValue('');
    setSaveMessage('Access rule saved.');
  }

  async function createGuestPass() {
    const code = `EVZ-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    await privateChargingApi.createAccessRule({
      ruleType: 'INVITE_CODE',
      inviteCode: code,
      ruleValue: code,
      maxSessions: Number(guestLimit) || 1,
    });
    setInviteCode(code);
    const rulesRes = await privateChargingApi.getAccessRules();
    setAccessRules(Array.isArray(rulesRes.data) ? rulesRes.data : []);
  }

  async function createTariff() {
    await privateChargingApi.createTariff({
      audience,
      billingParty,
      pricePerKwh: Number(pricePerKwh) || 0,
      freeAllowanceKwh: Number(freeAllowanceKwh) || undefined,
      idleFeePerMinute: Number(idleFeePerMinute) || undefined,
      usageCapKwh: Number(usageCapKwh) || undefined,
      subsidyPercent: Number(subsidyPercent) || undefined,
      currency: 'UGX',
    });
    const tariffsRes = await privateChargingApi.getTariffs();
    setTariffs(Array.isArray(tariffsRes.data) ? tariffsRes.data : []);
    setSaveMessage('Audience tariff saved.');
  }

  const Footer = (
    <Box sx={{ display: 'flex', gap: 1 }}>
      <Button fullWidth variant="outlined" onClick={() => window.history.back()}>
        Back
      </Button>
      <AdminOnly>
        <Button fullWidth variant="contained" color="secondary" sx={{ color: '#fff' }} onClick={createGuestPass}>
          Guest Pass
        </Button>
      </AdminOnly>
    </Box>
  );

  return (
    <MobileShell
      title={view === 'reports' ? 'Private charging reports' : 'Private charging'}
      tagline="home / workplace / fleet / residential"
      footer={Footer}
    >
      <Stack spacing={2}>
        {error && <Alert severity="warning">{error}</Alert>}
        {loading && <Alert severity="info">Loading shared backend data...</Alert>}
        {saveMessage && <Alert severity="success" onClose={() => setSaveMessage('')}>{saveMessage}</Alert>}

        <Grid container spacing={1.5}>
          <Grid item xs={6}><Stat label="Access rules" value={accessRules.length} /></Grid>
          <Grid item xs={6}><Stat label="Tariffs" value={tariffs.length} /></Grid>
          <Grid item xs={6}><Stat label="Sessions" value={sessions.length} /></Grid>
          <Grid item xs={6}><Stat label="Reimbursements" value={reimbursementEligible} /></Grid>
        </Grid>

        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
          <Typography variant="subtitle1" fontWeight={800}>Operating mode</Typography>
          <Grid container spacing={1} sx={{ mt: 1 }}>
            {PRIVATE_OPERATING_MODES.map((item) => (
              <Grid item xs={6} key={item.value}>
                <Button
                  fullWidth
                  variant={mode === item.value ? 'contained' : 'outlined'}
                  color="secondary"
                  startIcon={modeIcons[item.value]}
                  onClick={() => setMode(item.value)}
                  sx={{ justifyContent: 'flex-start', color: mode === item.value ? '#fff' : undefined }}
                >
                  {item.label}
                </Button>
              </Grid>
            ))}
          </Grid>
        </Paper>

        <AdminOnly permission="charge_points.write">
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
            <Typography variant="subtitle1" fontWeight={800}>Link charger</Typography>
            <Stack spacing={1.25} sx={{ mt: 1 }}>
              <TextField label="Station ID" value={stationId} onChange={(event) => setStationId(event.target.value)} />
              <TextField label="QR / OCPP charger code" value={chargerCode} onChange={(event) => setChargerCode(event.target.value)} />
              <Grid container spacing={1}>
                <Grid item xs={7}>
                  <TextField fullWidth select label="Connector" value={connectorType} onChange={(event) => setConnectorType(event.target.value)}>
                    {['TYPE_2', 'CCS2', 'CHADEMO', 'GB_T'].map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
                  </TextField>
                </Grid>
                <Grid item xs={5}>
                  <TextField fullWidth label="kW" value={connectorPowerKw} onChange={(event) => setConnectorPowerKw(event.target.value)} />
                </Grid>
              </Grid>
              <TextField
                label="Parking and access notes"
                value={parkingNotes}
                onChange={(event) => setParkingNotes(event.target.value)}
                multiline
                minRows={2}
              />
              <Button variant="contained" color="secondary" sx={{ color: '#fff' }} onClick={linkPrivateCharger}>
                Link private charger
              </Button>
            </Stack>
          </Paper>
        </AdminOnly>

        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
          <Typography variant="subtitle1" fontWeight={800}>Visibility and sharing</Typography>
          <Stack spacing={1.25} sx={{ mt: 1 }}>
            <TextField select label="Access mode" value={accessMode} onChange={(event) => setAccessMode(event.target.value)}>
              {ACCESS_MODES.map((item) => <MenuItem key={item.value} value={item.value}>{item.label}</MenuItem>)}
            </TextField>
            <TextField select label="Visibility" value={visibility} onChange={(event) => setVisibility(event.target.value)}>
              {VISIBILITY_MODES.map((item) => <MenuItem key={item.value} value={item.value}>{item.label}</MenuItem>)}
            </TextField>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
              {['Family', 'Employees', 'Residents', 'Fleets', 'Vehicles', 'RFID', 'Phone numbers'].map((label) => (
                <Chip key={label} label={label} size="small" />
              ))}
            </Box>
          </Stack>
        </Paper>

        <AdminOnly permission="private_charging.access.write">
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
            <Typography variant="subtitle1" fontWeight={800}>Access rule</Typography>
            <Stack spacing={1.25} sx={{ mt: 1 }}>
              <TextField select label="Rule type" value={accessRuleType} onChange={(event) => setAccessRuleType(event.target.value)}>
                {ACCESS_RULE_TYPES.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
              </TextField>
              <TextField
                label="User, vehicle, fleet, organization, RFID, phone, or invite code"
                value={accessRuleValue}
                onChange={(event) => setAccessRuleValue(event.target.value)}
              />
              <Grid container spacing={1}>
                <Grid item xs={6}>
                  <TextField fullWidth label="Max sessions" value={guestLimit} onChange={(event) => setGuestLimit(event.target.value)} />
                </Grid>
                <Grid item xs={6}>
                  <TextField fullWidth label="Max kWh" value={maxKwh} onChange={(event) => setMaxKwh(event.target.value)} />
                </Grid>
              </Grid>
              <TextField
                label="Expires at"
                type="datetime-local"
                value={expiresAt}
                onChange={(event) => setExpiresAt(event.target.value)}
                InputLabelProps={{ shrink: true }}
              />
              <Button variant="outlined" onClick={createAccessRule}>
                Save access rule
              </Button>
            </Stack>
          </Paper>
        </AdminOnly>

        <AdminOnly permission="private_charging.tariffs.write">
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
            <Typography variant="subtitle1" fontWeight={800}>Audience tariff</Typography>
            <Stack spacing={1.25} sx={{ mt: 1 }}>
              <TextField select label="Audience" value={audience} onChange={(event) => setAudience(event.target.value)}>
                {TARIFF_AUDIENCES.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
              </TextField>
              <TextField select label="Billing party" value={billingParty} onChange={(event) => setBillingParty(event.target.value)}>
                {BILLING_PARTIES.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
              </TextField>
              <Grid container spacing={1}>
                <Grid item xs={6}>
                  <TextField fullWidth label="UGX per kWh" value={pricePerKwh} onChange={(event) => setPricePerKwh(event.target.value)} />
                </Grid>
                <Grid item xs={6}>
                  <TextField fullWidth label="Idle fee/min" value={idleFeePerMinute} onChange={(event) => setIdleFeePerMinute(event.target.value)} />
                </Grid>
                <Grid item xs={6}>
                  <TextField fullWidth label="Free kWh" value={freeAllowanceKwh} onChange={(event) => setFreeAllowanceKwh(event.target.value)} />
                </Grid>
                <Grid item xs={6}>
                  <TextField fullWidth label="Usage cap kWh" value={usageCapKwh} onChange={(event) => setUsageCapKwh(event.target.value)} />
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth label="Subsidy percent" value={subsidyPercent} onChange={(event) => setSubsidyPercent(event.target.value)} />
                </Grid>
              </Grid>
              <Button variant="contained" color="secondary" sx={{ color: '#fff' }} startIcon={<ReceiptLongRoundedIcon />} onClick={createTariff}>
                Save tariff
              </Button>
            </Stack>
          </Paper>
        </AdminOnly>

        <AdminOnly permission="private_charging.access.write">
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
            <Typography variant="subtitle1" fontWeight={800}>Guest pass</Typography>
            <Stack spacing={1.25} sx={{ mt: 1 }}>
              <TextField label="Session limit" value={guestLimit} onChange={(event) => setGuestLimit(event.target.value)} />
              <Button variant="outlined" startIcon={<QrCode2RoundedIcon />} onClick={createGuestPass}>
                Create invite code
              </Button>
              {inviteCode && <Alert severity="success">Guest code: {inviteCode}</Alert>}
            </Stack>
          </Paper>
        </AdminOnly>

        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
          <Typography variant="subtitle1" fontWeight={800}>Reports and reimbursements</Typography>
          <Divider sx={{ my: 1 }} />
          <Typography variant="body2" color="text.secondary">
            Usage can be grouped by charger, connector, user, vehicle, audience, billing party, month, and reimbursement status from the shared backend report endpoint.
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
            {['Sessions CSV', 'Access CSV', 'Invoices', 'Reimbursements', 'Fleet home charging'].map((label) => (
              <Chip key={label} label={label} variant="outlined" />
            ))}
          </Box>
        </Paper>

        {dashboard?.charging && (
          <Alert severity="info">
            Backend summary: {dashboard.charging.sessionsToday} sessions today / {dashboard.charging.connectors} connectors.
          </Alert>
        )}
      </Stack>
    </MobileShell>
  );
}
