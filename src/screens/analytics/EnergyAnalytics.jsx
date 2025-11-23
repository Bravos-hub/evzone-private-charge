import React, { useMemo, useState } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import {
  CssBaseline,
  Box,
  Paper,
  Stack,
  Typography,
  Button,
  Chip,
  IconButton,
  AppBar,
  Toolbar,
  BottomNavigation,
  BottomNavigationAction,
  Tooltip,
  FormControl,
  Select,
  MenuItem,
  TextField
} from '@mui/material';
import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import AccountBalanceWalletRoundedIcon from '@mui/icons-material/AccountBalanceWalletRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import FileDownloadRoundedIcon from '@mui/icons-material/FileDownloadRounded';
import FlashOnRoundedIcon from '@mui/icons-material/FlashOnRounded';
import LocalGasStationRoundedIcon from '@mui/icons-material/LocalGasStationRounded';
import TimelineRoundedIcon from '@mui/icons-material/TimelineRounded';

/**
 * 35 — Energy Analytics (mobile, React + MUI, JS) — Clean
 * Rollup‑safe (no dynamic imports, no optional chaining), strict 420px shell.
 */

const theme = createTheme({
  palette: {
    primary: { main: '#03cd8c' },
    secondary: { main: '#f77f00' },
    background: { default: '#f2f2f2' },
    divider: '#eef3f1'
  },
  shape: { borderRadius: 7 },
  typography: { fontFamily: 'Inter, system-ui, -apple-system, Roboto, Arial, sans-serif' }
});

function MobileShell(props) {
  var title = props.title;
  var tagline = props.tagline;
  var onBack = props.onBack;
  var onHelp = props.onHelp;
  var navValue = props.navValue;
  var onNavChange = props.onNavChange;
  var children = props.children;
  function handleBack(){ if (typeof onBack === 'function') onBack(); }
  function handleBell(){ if (typeof onHelp === 'function') onHelp(); }
  return (
    <Box sx={{ minHeight:'100dvh', display:'flex', flexDirection:'column', bgcolor:'background.default' }}>
      <AppBar position='fixed' elevation={1}
        sx={{ backgroundImage:'linear-gradient(180deg, rgba(3,205,140,0.92) 0%, rgba(3,205,140,0.78) 60%, rgba(3,205,140,0.70) 100%)', backdropFilter:'blur(6px)' }}>
        <Toolbar sx={{ px:0 }}>
          <Box sx={{ width:'100%', maxWidth:420, mx:'auto', px:1, display:'flex', alignItems:'center' }}>
            <IconButton size='small' edge='start' onClick={handleBack} aria-label='Back' sx={{ color:'common.white', mr:1 }}>
              <ArrowBackIosNewIcon fontSize='small' />
            </IconButton>
            <Box sx={{ display:'flex', flexDirection:'column', minWidth:0 }}>
              <Typography variant='h6' color='inherit' noWrap sx={{ fontWeight:800, lineHeight:1.1 }}>{title}</Typography>
              {tagline ? <Typography variant='caption' color='common.white' noWrap sx={{ opacity:.9 }}>{tagline}</Typography> : null}
            </Box>
            <Box sx={{ flexGrow:1 }} />
            <Tooltip title='Notifications'><span><IconButton size='small' edge='end' onClick={handleBell} sx={{ color:'common.white' }}><NotificationsRoundedIcon fontSize='small'/></IconButton></span></Tooltip>
          </Box>
        </Toolbar>
      </AppBar>
      <Toolbar />
      <Box component='main' sx={{ flex:1 }}>
        <Box sx={{ maxWidth:420, mx:'auto', px:2, pt:2, pb:2 }}>{children}</Box>
      </Box>
      <Paper elevation={8} sx={{ borderTopLeftRadius:16, borderTopRightRadius:16, position:'sticky', bottom:0, backdropFilter:'blur(6px)' }}>
        <Box sx={{ maxWidth:420, mx:'auto' }}>
          <BottomNavigation value={navValue} onChange={function(_,v){ if (typeof onNavChange==='function') onNavChange(v); }} showLabels sx={{ '& .Mui-selected, & .Mui-selected .MuiSvgIcon-root': { color: theme.palette.primary.main } }}>
            <BottomNavigationAction label='Home' icon={<HomeRoundedIcon/>}/>
            <BottomNavigationAction label='Dashboard' icon={<DashboardRoundedIcon/>}/>
            <BottomNavigationAction label='Sessions' icon={<HistoryRoundedIcon/>}/>
            <BottomNavigationAction label='Wallet' icon={<AccountBalanceWalletRoundedIcon/>}/>
            <BottomNavigationAction label='Settings' icon={<SettingsRoundedIcon/>}/>
          </BottomNavigation>
        </Box>
      </Paper>
    </Box>
  );
}

function Metric(props){
  return (
    <Paper elevation={0} sx={{ p:1.25, borderRadius:1, bgcolor:'#fff', border:'1px solid #eef3f1', flex:1, minWidth:110, textAlign:'center' }}>
      <Stack direction='row' spacing={0.5} alignItems='center' justifyContent='center' sx={{ mb:.25 }}>
        {props.icon}
        <Typography variant='caption' color='text.secondary'>{props.label}</Typography>
      </Stack>
      <Typography variant='subtitle1' fontWeight={800}>{props.value}</Typography>
    </Paper>
  );
}

function AreaChartMini(props){
  var data = props.data || [];
  var xKey = props.xKey; var yKey = props.yKey;
  var stroke = props.stroke || '#03cd8c'; var fill = props.fill || 'rgba(3,205,140,0.28)';
  var W=360,H=140,P=24; if (!data || data.length===0) return <Box sx={{ height:80, display:'flex', alignItems:'center', justifyContent:'center', color:'text.secondary' }}>No data</Box>;
  var ys = data.map(function(d){ return d[yKey]; }); var yMax = Math.max.apply(null, [1].concat(ys));
  var xStep=(W-2*P)/Math.max(1,data.length-1);
  function X(i){ return P + i*xStep; } function Y(v){ return H-P - (v/yMax)*(H-2*P); }
  var path = data.map(function(d,i){ return (i===0?'M ':'L ')+X(i)+' '+Y(d[yKey]); }).join(' ');
  var area = path + ' L ' + X(data.length-1) + ' ' + (H-P) + ' L ' + X(0) + ' ' + (H-P) + ' Z';
  return (
    <Box sx={{ width:'100%', height:160 }}>
      <svg viewBox={'0 0 '+W+' '+H} width='100%' height='100%' preserveAspectRatio='none'>
        <g stroke='#eef3f1' strokeWidth='1'>{[0,1,2,3,4].map(function(i){ return <line key={i} x1={P} x2={W-P} y1={P+i*(H-2*P)/4} y2={P+i*(H-2*P)/4}/>; })}</g>
        <path d={area} fill={fill} stroke='none'/>
        <path d={path} fill='none' stroke={stroke} strokeWidth='2'/>
        <g fill='#98a1a0' fontSize='10'>{data.map(function(d,i){ return <text key={i} x={X(i)} y={H-6} textAnchor='middle'>{d[xKey]}</text>; })}</g>
      </svg>
    </Box>
  );
}

function DualBarChartMini(props){
  var data = props.data || [];
  var xKey=props.xKey, leftKey=props.leftKey, rightKey=props.rightKey;
  var leftColor=props.leftColor||'#f77f00', rightColor=props.rightColor||'#03cd8c';
  var W=360,H=180,P=28,G=6; if (!data || data.length===0) return <Box sx={{ height:80, display:'flex', alignItems:'center', justifyContent:'center', color:'text.secondary' }}>No data</Box>;
  var yMax = Math.max.apply(null, [1].concat(data.map(function(d){return Math.max(d[leftKey], d[rightKey]);})));
  var band=(W-2*P)/data.length; var barW=(band-G)/2;
  function XL(i){ return P + i*band; } function XR(i){ return P + i*band + barW + G; } function Y(v){ return H-P - (v/yMax)*(H-2*P); }
  return (
    <Box sx={{ width:'100%', height:200 }}>
      <svg viewBox={'0 0 '+W+' '+H} width='100%' height='100%' preserveAspectRatio='none'>
        <g stroke='#eef3f1' strokeWidth='1'>{[0,1,2,3,4].map(function(i){ return <line key={i} x1={P} x2={W-P} y1={P+i*(H-2*P)/4} y2={P+i*(H-2*P)/4}/>; })}</g>
        {data.map(function(d,i){ return (
          <g key={i}>
            <rect x={XL(i)} y={Y(d[leftKey])} width={barW} height={H-P - Y(d[leftKey])} fill={leftColor} />
            <rect x={XR(i)} y={Y(d[rightKey])} width={barW} height={H-P - Y(d[rightKey])} fill={rightColor} />
          </g>
        );})}
        <g fill='#98a1a0' fontSize='10'>{data.map(function(d,i){ return <text key={i} x={P+i*band+band/2} y={H-6} textAnchor='middle'>{d[xKey]}</text>; })}</g>
      </svg>
      <Stack direction='row' spacing={1} sx={{ mt:.5, justifyContent:'center' }}>
        <Chip size='small' label='Cost' sx={{ bgcolor:leftColor, color:'#fff' }}/>
        <Chip size='small' label='Sessions' sx={{ bgcolor:rightColor, color:'#fff' }}/>
      </Stack>
    </Box>
  );
}

export default function EnergyAnalytics(props){
  var chargers = props.chargers || [{ id:'st1', name:'Home Charger' }, { id:'st2', name:'Office Charger' }];
  var connectorsMap = props.connectorsMap || { st1:[{id:'all',name:'All connectors'},{id:'c1',name:'Connector 1'},{id:'c2',name:'Connector 2'}], st2:[{id:'all',name:'All connectors'},{id:'c3',name:'Connector 3'}] };
  var defaultChargerId = props.defaultChargerId || 'st1';
  var currency = props.currency || 'UGX';
  var onExportAnalytics = props.onExportAnalytics;
  var onHelp = props.onHelp; var onBack = props.onBack; var onNavChange = props.onNavChange;

  var [navValue,setNavValue] = useState(2);
  var [chargerId,setChargerId] = useState(defaultChargerId);
  var [connectorId,setConnectorId] = useState('all');
  var [range,setRange] = useState('7d');
  var [from,setFrom] = useState(''); var [to,setTo] = useState('');

  var series = useMemo(function(){
    var days = range==='7d'?7:(range==='30d'?30:(range==='90d'?90:14));
    var labels=['01','02','03','04','05','06','07','08','09','10','11','12'];
    var out=[]; for (var i=0;i<days;i++){ var kWh=Math.round((Math.sin(i/3)+1.3)*6 + (chargerId==='st2'?2:0) + (connectorId!=='all'?1:0)); var sessions=Math.max(1,Math.round(kWh/6)); var cost=kWh*1200; var label=labels[i%labels.length]; out.push({ label:label, kWh:kWh, sessions:sessions, cost:cost }); }
    return out;
  }, [range, chargerId, connectorId]);

  var totals = useMemo(function(){
    var kwhSum = series.reduce(function(s,x){ return s + x.kWh; }, 0);
    var sessSum = series.reduce(function(s,x){ return s + x.sessions; }, 0);
    var costSum = series.reduce(function(s,x){ return s + x.cost; }, 0);
    return { kWh:kwhSum, sessions:sessSum, cost:costSum };
  }, [series]);

  function handleExport(){ var payload={ chargerId:chargerId, connectorId:connectorId, range:range, from:from, to:to, series:series }; if (typeof onExportAnalytics==='function') onExportAnalytics(payload); }

  var connectorList = connectorsMap[chargerId] || [{id:'all',name:'All connectors'}];

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline/>
      <MobileShell title='Energy analytics' tagline='kWh • cost • sessions' onBack={onBack} onHelp={onHelp} navValue={navValue} onNavChange={function(v){ setNavValue(v); if (typeof onNavChange==='function') onNavChange(v); }}>
        <Paper elevation={0} sx={{ p:1.25, borderRadius: 1.5, bgcolor:'rgba(247,127,0,0.08)', mb:2 }}>
          <Typography variant='caption'>Charts are lightweight SVG for reliable bundling in sandboxed environments.</Typography>
        </Paper>

        {/* Filters */}
        <Paper elevation={0} sx={{ p:2, borderRadius: 1.5, bgcolor:'#fff', border:'1px solid #eef3f1', mb:2 }}>
          <Stack spacing={1}>
            <Stack direction='row' spacing={1}>
              <FormControl size='small' sx={{ minWidth:160 }}>
                <Select value={chargerId} onChange={function(e){ setChargerId(e.target.value); }}>
                  {chargers.map(function(c){ return <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>; })}
                </Select>
              </FormControl>
              <FormControl size='small' sx={{ minWidth:160 }}>
                <Select value={connectorId} onChange={function(e){ setConnectorId(e.target.value); }}>
                  {connectorList.map(function(conn){ return <MenuItem key={conn.id} value={conn.id}>{conn.name}</MenuItem>; })}
                </Select>
              </FormControl>
              <Button variant='contained' color='secondary' startIcon={<FileDownloadRoundedIcon/>} onClick={handleExport} sx={{ ml:'auto', color:'#fff' }}>Export</Button>
            </Stack>
            <Stack direction='row' spacing={1} alignItems='center' sx={{ flexWrap:'wrap' }}>
              {['7d','30d','90d'].map(function(k){ return <Chip key={k} label={k.toUpperCase()} clickable color={range===k?'secondary':'default'} onClick={function(){ setRange(k); }}/>; })}
              <Chip label='CUSTOM' clickable color={range==='custom'?'secondary':'default'} onClick={function(){ setRange('custom'); }}/>
              {range==='custom' ? (
                <>
                  <TextField size='small' type='date' label='From' InputLabelProps={{ shrink:true }} value={from} onChange={function(e){ setFrom(e.target.value); }} />
                  <TextField size='small' type='date' label='To' InputLabelProps={{ shrink:true }} value={to} onChange={function(e){ setTo(e.target.value); }} />
                </>
              ) : null}
            </Stack>
          </Stack>
        </Paper>

        {/* Totals */}
        <Stack direction='row' spacing={1} sx={{ mb:1 }}>
          <Metric icon={<FlashOnRoundedIcon fontSize='small'/>} label='kWh' value={totals.kWh} />
          <Metric icon={<LocalGasStationRoundedIcon fontSize='small'/>} label={'Cost ('+currency+')'} value={totals.cost.toLocaleString()} />
          <Metric icon={<TimelineRoundedIcon fontSize='small'/>} label='Sessions' value={totals.sessions} />
        </Stack>

        {/* kWh over time */}
        <Paper elevation={0} sx={{ p:1.5, borderRadius: 1.5, bgcolor:'#fff', border:'1px solid #eef3f1', mb:1 }}>
          <Typography variant='subtitle2' fontWeight={800} sx={{ mb:1 }}>Energy (kWh)</Typography>
          <AreaChartMini data={series} xKey='label' yKey='kWh' />
        </Paper>

        {/* Cost vs Sessions */}
        <Paper elevation={0} sx={{ p:1.5, borderRadius: 1.5, bgcolor:'#fff', border:'1px solid #eef3f1' }}>
          <Typography variant='subtitle2' fontWeight={800} sx={{ mb:1 }}>Cost & sessions</Typography>
          <DualBarChartMini data={series} xKey='label' leftKey='cost' rightKey='sessions' />
        </Paper>
      </MobileShell>
    </ThemeProvider>
  );
}
