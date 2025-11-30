import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import {
  CssBaseline, Container, Box, Typography, Paper, Stack, Button, Chip, IconButton,
  FormControl, Select, MenuItem
} from '@mui/material';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import ViewWeekRoundedIcon from '@mui/icons-material/ViewWeekRounded';
import MobileShell from '../../components/layout/MobileShell';

function MonthGrid({ year, month, items, onOpen, highlightDate }) {
  const first = new Date(year, month, 1);
  const startDay = first.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i=0;i<42;i++) {
    const dayNum = i - startDay + 1;
    const inMonth = dayNum >= 1 && dayNum <= daysInMonth;
    const dateKey = inMonth ? `${year}-${String(month+1).padStart(2,'0')}-${String(dayNum).padStart(2,'0')}` : '';
    const dayItems = inMonth ? (items[dateKey] || []) : [];
    cells.push({ inMonth, dayNum, dateKey, dayItems });
  }
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0.5 }}>
      {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
        <Box key={d} sx={{ textAlign: 'center', py: 0.5, fontSize: 12, color: 'text.secondary' }}>{d}</Box>
      ))}
      {cells.map((c, i) => (
        <Paper key={i} elevation={0} sx={{ p: 0.75, borderRadius: 1, bgcolor: c.inMonth ? '#fff' : '#fafafa', border: '2px solid', borderColor: c.dateKey===highlightDate ? 'secondary.main':'#eef3f1', minHeight: 64 }}>
          <Typography variant="caption" color="text.secondary">{c.inMonth ? c.dayNum : ''}</Typography>
          <Stack spacing={0.25} sx={{ mt: 0.25 }}>
            {c.dayItems.slice(0,2).map((it, idx) => (
              <Chip key={idx} size="small" label={`${it.type==='schedule'?'Sch:':'Res:'} ${it.title}`} onClick={()=>onOpen&&onOpen(it)} sx={{ bgcolor: it.type==='schedule'?'#03cd8c':'#f77f00', color: 'white' }} />
            ))}
            {c.dayItems.length>2 && <Typography variant="caption" color="text.secondary">+{c.dayItems.length-2} more</Typography>}
          </Stack>
        </Paper>
      ))}
    </Box>
  );
}

function WeekList({ startDate, items, onOpen, highlightDate }) {
  const days = Array.from({ length: 7 }).map((_,i)=>{
    const d = new Date(startDate.getTime() + i*86400000);
    const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    return { label: d.toDateString().slice(0,10), key };
  });
  return (
    <Stack spacing={0.5}>
      {days.map((d)=> (
        <Paper key={d.key} elevation={0} sx={{ p: 1, borderRadius: 1, border: '2px solid', borderColor: d.key===highlightDate?'secondary.main':'#eef3f1' }}>
          <Typography variant="subtitle2" fontWeight={700}>{d.label}</Typography>
          <Stack direction="row" spacing={0.5} sx={{ mt: 0.5, flexWrap: 'wrap' }}>
            {(items[d.key]||[]).map((it,idx)=>(
              <Chip key={idx} size="small" label={`${it.time ? it.time+' • ' : ''}${it.type==='schedule'?'Sch:':'Res:'} ${it.title}`} onClick={()=>onOpen&&onOpen(it)} sx={{ bgcolor: it.type==='schedule'?'#03cd8c':'#f77f00', color: 'white' }} />
            ))}
          </Stack>
        </Paper>
      ))}
    </Stack>
  );
}

export default function ScheduleCalendars({
  chargers = [{ id: 'st1', name: 'Home Charger' }, { id: 'st2', name: 'Office Charger' }],
  defaultChargerId = 'st1',
  onBack, onHelp, onNavChange,
  onNavigate, onOpenItem, onCreateSchedule,
  highlight // { date?: 'YYYY-MM-DD' }
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const [navValue, setNavValue] = useState(1); // Stations tab index
  const routes = useMemo(() => ['/', '/chargers', '/sessions', '/wallet', '/settings'], []);

  useEffect(() => {
    const pathIndex = routes.findIndex(route => location.pathname === route || location.pathname.startsWith(route + '/'));
    if (pathIndex !== -1) {
      setNavValue(pathIndex);
    }
  }, [location.pathname, routes]);

  const handleNavChange = useCallback((value) => {
    setNavValue(value);
    if (routes[value] !== undefined) {
      navigate(routes[value]);
    }
    if (onNavChange) onNavChange(value);
  }, [navigate, routes, onNavChange]);

  const handleBack = useCallback(() => {
    if (onBack) {
      onBack();
    } else {
      navigate('/settings');
    }
  }, [navigate, onBack]);

  const handleHelp = useCallback(() => {
    if (onHelp) {
      onHelp();
    } else {
      console.info('Help');
    }
  }, [onHelp]);

  const [chargerId, setChargerId] = useState(defaultChargerId);
  const [mode, setMode] = useState('month');
  const today = new Date();
  const [cursor, setCursor] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

  const items = useMemo(() => ({
    '2025-11-01': [ { type:'schedule', title:'Night 22:00-06:00', time:'' }, { type:'reservation', title:'Lydia', time:'14:00' } ],
    '2025-11-02': [ { type:'reservation', title:'Noah', time:'09:00' } ]
  }), []);

  const changeMonth = (delta) => {
    const d = new Date(cursor.getFullYear(), cursor.getMonth()+delta, 1);
    setCursor(d);
    onNavigate ? onNavigate({ chargerId, mode:'month', year:d.getFullYear(), month:d.getMonth()+1 }) : console.info('Navigate month', d);
  };
  
  const changeWeek = (delta) => {
    const d = new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate()+delta*7);
    setCursor(d);
    onNavigate ? onNavigate({ chargerId, mode:'week', start:d }) : console.info('Navigate week', d);
  };

  const Footer = (
    <Box sx={{ px: 2, pb: 'calc(12px + env(safe-area-inset-bottom))', pt: 1.5, background: '#f2f2f2', borderTop: '1px solid #e9eceb' }}>
      <Stack direction="row" spacing={1}>
        <Chip icon={<CalendarMonthRoundedIcon/>} label="Month" clickable color={mode==='month'?'secondary':'default'} onClick={()=>setMode('month')} />
        <Chip icon={<ViewWeekRoundedIcon/>} label="Week" clickable color={mode==='week'?'secondary':'default'} onClick={()=>setMode('week')} />
        <Button variant="contained" color="secondary" onClick={()=> (onCreateSchedule ? onCreateSchedule({ chargerId, date: cursor }) : console.info('Create schedule', cursor))}
          sx={{ ml: 'auto', color: 'common.white', '&:hover': { bgcolor: 'secondary.dark', color: 'common.white' } }}>New schedule</Button>
      </Stack>
    </Box>
  );

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const weekStart = new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate() - cursor.getDay());

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="xs" disableGutters>
        <MobileShell title="Schedule calendars" tagline="overlap • month • week" onBack={onBack} onHelp={onHelp} navValue={navValue} onNavChange={(v)=>{ setNavValue(v); onNavChange&&onNavChange(v); }} footer={Footer}>
          <Box sx={{ px: 2, pt: 2 }}>
            {/* Charger selector + nav */}
            <Paper elevation={0} sx={{ p: 2, borderRadius: 1.5, bgcolor: '#fff', border: '1px solid #eef3f1', mb: 2 }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <FormControl size="small" sx={{ minWidth: 160 }}>
                  <Select value={chargerId} onChange={(e)=>setChargerId(e.target.value)}>
                    {chargers.map(c=> <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                  </Select>
                </FormControl>
                <IconButton onClick={()=> mode==='month'? changeMonth(-1) : changeWeek(-1)}><ChevronLeftRoundedIcon/></IconButton>
                <Typography variant="subtitle2" fontWeight={800} sx={{ flex: 1, textAlign: 'center' }}>{year} • {month+1}</Typography>
                <IconButton onClick={()=> mode==='month'? changeMonth(1) : changeWeek(1)}><ChevronRightRoundedIcon/></IconButton>
              </Stack>
            </Paper>

            {mode==='month' ? (
              <MonthGrid year={year} month={month} items={items} onOpen={(it)=> onOpenItem ? onOpenItem({ chargerId, item: it }) : console.info('Open item', it)} highlightDate={highlight?.date} />
            ) : (
              <WeekList startDate={weekStart} items={items} onOpen={(it)=> onOpenItem ? onOpenItem({ chargerId, item: it }) : console.info('Open item', it)} highlightDate={highlight?.date} />
            )}
          </Box>
        </MobileShell>
      </Container>
    </ThemeProvider>
  );
}
