import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Paper,
  Stack,
  Typography,
  Button,
  Chip,
  TextField,
  Alert,
  CircularProgress,
} from '@mui/material';
import FileDownloadRoundedIcon from '@mui/icons-material/FileDownloadRounded';
import FlashOnRoundedIcon from '@mui/icons-material/FlashOnRounded';
import LocalGasStationRoundedIcon from '@mui/icons-material/LocalGasStationRounded';
import TimelineRoundedIcon from '@mui/icons-material/TimelineRounded';
import MobileShell from '../../components/layout/MobileShell';
import OnboardingOverlay from '../../components/onboarding/OnboardingOverlay';
import { useOnboarding } from '../../context/OnboardingContext';
import { analyticsApi } from '../../services/api/analytics';
import { privateChargingApi } from '../../services/api/privateCharging';

function Metric(props) {
  return (
    <Paper elevation={0} sx={{ p: 1.25, borderRadius: 1, bgcolor: '#fff', border: '1px solid #eef3f1', flex: 1, minWidth: 110, textAlign: 'center' }}>
      <Stack direction='row' spacing={0.5} alignItems='center' justifyContent='center' sx={{ mb: .25 }}>
        {props.icon}
        <Typography variant='caption' color='text.secondary'>{props.label}</Typography>
      </Stack>
      <Typography variant='subtitle1' fontWeight={800}>{props.value}</Typography>
    </Paper>
  );
}

function AreaChartMini(props) {
  var data = props.data || [];
  var xKey = props.xKey; var yKey = props.yKey;
  var stroke = props.stroke || '#03cd8c'; var fill = props.fill || 'rgba(3,205,140,0.28)';
  var W = 360, H = 140, P = 24; if (!data || data.length === 0) return <Box sx={{ height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'text.secondary' }}>No data</Box>;
  var ys = data.map(function (d) { return d[yKey]; }); var yMax = Math.max.apply(null, [1].concat(ys));
  var xStep = (W - 2 * P) / Math.max(1, data.length - 1);
  function X(i) { return P + i * xStep; } function Y(v) { return H - P - (v / yMax) * (H - 2 * P); }
  var path = data.map(function (d, i) { return (i === 0 ? 'M ' : 'L ') + X(i) + ' ' + Y(d[yKey]); }).join(' ');
  var area = path + ' L ' + X(data.length - 1) + ' ' + (H - P) + ' L ' + X(0) + ' ' + (H - P) + ' Z';
  return (
    <Box sx={{ width: '100%', height: 160 }}>
      <svg viewBox={'0 0 ' + W + ' ' + H} width='100%' height='100%' preserveAspectRatio='none'>
        <g stroke='#eef3f1' strokeWidth='1'>{[0, 1, 2, 3, 4].map(function (i) { return <line key={i} x1={P} x2={W - P} y1={P + i * (H - 2 * P) / 4} y2={P + i * (H - 2 * P) / 4} />; })}</g>
        <path d={area} fill={fill} stroke='none' />
        <path d={path} fill='none' stroke={stroke} strokeWidth='2' />
        <g fill='#98a1a0' fontSize='10'>{data.map(function (d, i) { return <text key={i} x={X(i)} y={H - 6} textAnchor='middle'>{d[xKey]}</text>; })}</g>
      </svg>
    </Box>
  );
}

function DualBarChartMini(props) {
  var data = props.data || [];
  var xKey = props.xKey, leftKey = props.leftKey, rightKey = props.rightKey;
  var leftColor = props.leftColor || '#f77f00', rightColor = props.rightColor || '#03cd8c';
  var W = 360, H = 180, P = 28, G = 6; if (!data || data.length === 0) return <Box sx={{ height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'text.secondary' }}>No data</Box>;
  var yMax = Math.max.apply(null, [1].concat(data.map(function (d) { return Math.max(d[leftKey], d[rightKey]); })));
  var band = (W - 2 * P) / data.length; var barW = (band - G) / 2;
  function XL(i) { return P + i * band; } function XR(i) { return P + i * band + barW + G; } function Y(v) { return H - P - (v / yMax) * (H - 2 * P); }
  return (
    <Box sx={{ width: '100%', height: 200 }}>
      <svg viewBox={'0 0 ' + W + ' ' + H} width='100%' height='100%' preserveAspectRatio='none'>
        <g stroke='#eef3f1' strokeWidth='1'>{[0, 1, 2, 3, 4].map(function (i) { return <line key={i} x1={P} x2={W - P} y1={P + i * (H - 2 * P) / 4} y2={P + i * (H - 2 * P) / 4} />; })}</g>
        {data.map(function (d, i) {
          return (
            <g key={i}>
              <rect x={XL(i)} y={Y(d[leftKey])} width={barW} height={H - P - Y(d[leftKey])} fill={leftColor} />
              <rect x={XR(i)} y={Y(d[rightKey])} width={barW} height={H - P - Y(d[rightKey])} fill={rightColor} />
            </g>
          );
        })}
        <g fill='#98a1a0' fontSize='10'>{data.map(function (d, i) { return <text key={i} x={P + i * band + band / 2} y={H - 6} textAnchor='middle'>{d[xKey]}</text>; })}</g>
      </svg>
      <Stack direction='row' spacing={1} sx={{ mt: .5, justifyContent: 'center' }}>
        <Chip size='small' label='Cost' sx={{ bgcolor: leftColor, color: '#fff' }} />
        <Chip size='small' label='Revenue' sx={{ bgcolor: rightColor, color: '#fff' }} />
      </Stack>
    </Box>
  );
}

export default function EnergyAnalytics(props) {
  var currency = props.currency || 'UGX';
  var onExportAnalytics = props.onExportAnalytics;
  var { completeStep, finishOnboarding } = useOnboarding();
  var onHelp = props.onHelp; var onBack = props.onBack; var onNavChange = props.onNavChange;

  const navigate = useNavigate();
  const location = useLocation();
  const routes = useMemo(() => ['/', '/chargers', '/sessions', '/wallet', '/settings'], []);
  const [navValue, setNavValue] = useState(0);
  const [range, setRange] = useState('7d');
  const [from, setFrom] = useState(''); var [to, setTo] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dashboard, setDashboard] = useState(null);
  const [usage, setUsage] = useState(null);

  useEffect(() => {
    if (location.pathname.startsWith('/analytics')) {
      setNavValue(0);
    } else {
      const pathIndex = routes.findIndex(route =>
        (location.pathname === route || location.pathname.startsWith(route + '/')) && route !== '/'
      );
      if (pathIndex !== -1) setNavValue(pathIndex);
    }
  }, [location.pathname, routes]);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError('');
      try {
        const query = { range: range === 'custom' ? 'ALL' : range };
        const [dashRes, usageRes] = await Promise.all([
          analyticsApi.getOwnerDashboard(query),
          privateChargingApi.getUsageReport(query),
        ]);
        if (!mounted) return;
        setDashboard(dashRes?.data || dashRes);
        setUsage(usageRes?.data || usageRes);
      } catch (err) {
        if (!mounted) return;
        setError(err?.response?.data?.message || err.message || 'Unable to load analytics.');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [range]);

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

  const kpis = dashboard?.kpis || {};
  const totalKwh = kpis.energySoldKwh?.value || 0;
  const totalSessions = kpis.sessions?.value || 0;
  const totalRevenue = kpis.revenue?.value || 0;

  const series = useMemo(function () {
    const trend = dashboard?.commercial?.revenueCostMarginTrend || [];
    if (!trend.length) return [];
    const revenueSum = trend.reduce(function (s, d) { return s + (d.revenue || 0); }, 0) || 1;
    return trend.map(function (d) {
      const share = (d.revenue || 0) / revenueSum;
      return {
        label: d.date ? String(d.date).slice(5, 10) : '',
        kWh: Math.round(totalKwh * share),
        sessions: Math.max(1, Math.round(totalSessions * share)),
        cost: d.cost || 0,
        revenue: d.revenue || 0,
      };
    });
  }, [dashboard, totalKwh, totalSessions]);

  function handleExport() {
    const payload = { range, from, to, series, totals: { totalKwh, totalSessions, totalRevenue } };
    if (typeof onExportAnalytics === 'function') onExportAnalytics(payload);
    else privateChargingApi.exportReports({ range: range === 'custom' ? 'ALL' : range });
  }

  return (
    <MobileShell
      title='Energy analytics'
      tagline='kWh • cost • sessions'
      onBack={handleBack}
      onHelp={onHelp}
      navValue={navValue}
      onNavChange={handleNavChange}
    >
      {loading && <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}><CircularProgress /></Box>}
      {error && <Alert severity='warning' sx={{ mb: 2 }}>{error}</Alert>}

      <Paper elevation={0} sx={{ p: 2, borderRadius: 1.5, bgcolor: '#fff', border: '1px solid #eef3f1', mb: 2 }}>
        <Stack spacing={1}>
          <Stack direction='row' spacing={1} alignItems='center' sx={{ flexWrap: 'wrap' }}>
            {['7d', '30d', '90d'].map(function (k) { return <Chip key={k} label={k.toUpperCase()} clickable color={range === k ? 'secondary' : 'default'} onClick={function () { setRange(k); }} />; })}
            <Chip label='CUSTOM' clickable color={range === 'custom' ? 'secondary' : 'default'} onClick={function () { setRange('custom'); }} />
            <Button variant='contained' color='secondary' size='small' startIcon={<FileDownloadRoundedIcon />} onClick={handleExport} sx={{ ml: 'auto', color: '#fff' }}>Export</Button>
          </Stack>
          {range === 'custom' ? (
            <Stack direction='row' spacing={1}>
              <TextField size='small' type='date' label='From' InputLabelProps={{ shrink: true }} value={from} onChange={function (e) { setFrom(e.target.value); }} />
              <TextField size='small' type='date' label='To' InputLabelProps={{ shrink: true }} value={to} onChange={function (e) { setTo(e.target.value); }} />
            </Stack>
          ) : null}
        </Stack>
      </Paper>

      <Stack direction='row' spacing={1} sx={{ mb: 1 }}>
        <Metric icon={<FlashOnRoundedIcon fontSize='small' />} label='kWh' value={totalKwh.toLocaleString()} />
        <Metric icon={<LocalGasStationRoundedIcon fontSize='small' />} label={'Revenue (' + currency + ')'} value={totalRevenue.toLocaleString()} />
        <Metric icon={<TimelineRoundedIcon fontSize='small' />} label='Sessions' value={totalSessions.toLocaleString()} />
      </Stack>

      <Paper elevation={0} sx={{ p: 1.5, borderRadius: 1.5, bgcolor: '#fff', border: '1px solid #eef3f1', mb: 1 }}>
        <Typography variant='subtitle2' fontWeight={800} sx={{ mb: 1 }}>Energy (kWh)</Typography>
        <AreaChartMini data={series} xKey='label' yKey='kWh' />
      </Paper>

      <Paper elevation={0} sx={{ p: 1.5, borderRadius: 1.5, bgcolor: '#fff', border: '1px solid #eef3f1' }}>
        <Typography variant='subtitle2' fontWeight={800} sx={{ mb: 1 }}>Cost & revenue</Typography>
        <DualBarChartMini data={series} xKey='label' leftKey='cost' rightKey='revenue' />
      </Paper>

      {usage && (
        <Paper elevation={0} sx={{ p: 2, mt: 2, borderRadius: 1.5, bgcolor: '#fff', border: '1px solid #eef3f1' }}>
          <Typography variant='subtitle2' fontWeight={800} sx={{ mb: 1 }}>Usage breakdown</Typography>
          <Typography variant='body2' color='text.secondary'>
            Total sessions: {usage.totals?._count?._all || 0} · Energy: {Math.round(usage.totals?._sum?.totalEnergy || 0).toLocaleString()} kWh · Revenue: {Math.round(usage.totals?._sum?.amount || 0).toLocaleString()} {currency}
          </Typography>
        </Paper>
      )}

      <OnboardingOverlay
        stepId="monitor-analyze"
        title="Monitor & Analyze"
        description="Track your charging station's performance. View energy usage, costs, sessions, and revenue. Use these insights to optimize your operations."
        onComplete={() => {
          completeStep('monitor-analyze');
          finishOnboarding();
        }}
      />
    </MobileShell>
  );
}
