import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Paper,
  Stack,
  Typography,
  Button,
  Chip,
  Alert,
  CircularProgress,
} from '@mui/material';
import FileDownloadRoundedIcon from '@mui/icons-material/FileDownloadRounded';
import FlashOnRoundedIcon from '@mui/icons-material/FlashOnRounded';
import LocalGasStationRoundedIcon from '@mui/icons-material/LocalGasStationRounded';
import TimelineRoundedIcon from '@mui/icons-material/TimelineRounded';
import MobileShell from '../../components/layout/MobileShell';
import { analyticsApi } from '../../services/api/analytics';

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

const KG_CO2_PER_KWH = 0.4;

export default function CO2SavingsImpact(props) {
  var currency = props.currency || 'UGX';
  var onExportAnalytics = props.onExportAnalytics;
  var onHelp = props.onHelp; var onBack = props.onBack; var onNavChange = props.onNavChange;

  const navigate = useNavigate();
  const location = useLocation();
  const routes = useMemo(() => ['/', '/chargers', '/sessions', '/wallet', '/settings'], []);
  const [navValue, setNavValue] = useState(0);
  const [range, setRange] = useState('7d');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dashboard, setDashboard] = useState(null);

  useEffect(() => {
    if (location.pathname.startsWith('/analytics')) setNavValue(0);
    else {
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
        const res = await analyticsApi.getOwnerDashboard({ range });
        if (!mounted) return;
        setDashboard(res?.data || res);
      } catch (err) {
        if (!mounted) return;
        setError(err?.response?.data?.message || err.message || 'Unable to load CO₂ impact data.');
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
  const co2SavedKg = Math.round(totalKwh * KG_CO2_PER_KWH);

  const series = useMemo(function () {
    const trend = dashboard?.commercial?.revenueCostMarginTrend || [];
    if (!trend.length) return [];
    const revenueSum = trend.reduce(function (s, d) { return s + (d.revenue || 0); }, 0) || 1;
    return trend.map(function (d) {
      const share = (d.revenue || 0) / revenueSum;
      return {
        label: d.date ? String(d.date).slice(5, 10) : '',
        kWh: Math.round(totalKwh * share),
        co2: Math.round(totalKwh * share * KG_CO2_PER_KWH),
      };
    });
  }, [dashboard, totalKwh]);

  function handleExport() {
    const payload = { range, series, totals: { totalKwh, totalSessions, totalRevenue, co2SavedKg } };
    if (typeof onExportAnalytics === 'function') onExportAnalytics(payload);
  }

  return (
    <MobileShell
      title='CO₂ Savings Impact'
      tagline='kWh • cost • sessions'
      onBack={handleBack}
      onHelp={onHelp}
      navValue={navValue}
      onNavChange={handleNavChange}
    >
      {loading && <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}><CircularProgress /></Box>}
      {error && <Alert severity='warning' sx={{ mb: 2 }}>{error}</Alert>}

      <Paper elevation={0} sx={{ p: 2, borderRadius: 1.5, bgcolor: '#fff', border: '1px solid #eef3f1', mb: 2 }}>
        <Stack direction='row' spacing={1} alignItems='center' sx={{ flexWrap: 'wrap' }}>
          {['7d', '30d', '90d'].map(function (k) { return <Chip key={k} label={k.toUpperCase()} clickable color={range === k ? 'secondary' : 'default'} onClick={function () { setRange(k); }} />; })}
          <Box sx={{ flexGrow: 1 }} />
          <Button variant='contained' color='secondary' size='small' startIcon={<FileDownloadRoundedIcon />} onClick={handleExport} sx={{ color: '#fff' }}>Export</Button>
        </Stack>
      </Paper>

      <Stack direction='row' spacing={1} sx={{ mb: 1 }}>
        <Metric icon={<FlashOnRoundedIcon fontSize='small' />} label='kWh' value={totalKwh.toLocaleString()} />
        <Metric icon={<LocalGasStationRoundedIcon fontSize='small' />} label={'Revenue (' + currency + ')'} value={totalRevenue.toLocaleString()} />
        <Metric icon={<TimelineRoundedIcon fontSize='small' />} label='Sessions' value={totalSessions.toLocaleString()} />
      </Stack>

      <Paper elevation={0} sx={{ p: 2, borderRadius: 1.5, bgcolor: 'rgba(3,205,140,0.08)', border: '1px solid #eef3f1', mb: 1 }}>
        <Typography variant='subtitle2' fontWeight={800} sx={{ mb: .5 }}>Estimated CO₂ saved</Typography>
        <Typography variant='h5' fontWeight={800} color='primary.main'>{co2SavedKg.toLocaleString()} kg</Typography>
        <Typography variant='caption' color='text.secondary'>Based on {KG_CO2_PER_KWH} kg CO₂ avoided per kWh of EV charging vs. ICE.</Typography>
      </Paper>

      <Paper elevation={0} sx={{ p: 1.5, borderRadius: 1.5, bgcolor: '#fff', border: '1px solid #eef3f1' }}>
        <Typography variant='subtitle2' fontWeight={800} sx={{ mb: 1 }}>CO₂ avoided (kg)</Typography>
        <AreaChartMini data={series} xKey='label' yKey='co2' stroke='#03cd8c' fill='rgba(3,205,140,0.28)' />
      </Paper>
    </MobileShell>
  );
}
