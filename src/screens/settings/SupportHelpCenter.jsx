import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import {
  CssBaseline,
  Box,
  Typography,
  Paper,
  Stack,
  Button,
  FormControl,
  Select,
  MenuItem,
  TextField,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import AttachFileRoundedIcon from '@mui/icons-material/AttachFileRounded';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MobileShell from '../../components/layout/MobileShell';

const theme = createTheme({
  palette: { primary: { main: '#03cd8c' }, secondary: { main: '#f77f00' }, background: { default: '#f2f2f2' } },
  shape: { borderRadius: 14 },
  typography: { fontFamily: 'Inter, Roboto, Arial, sans-serif' }
});

export default function SupportHelpCenter({
  chargers = [{ id: 'st1', name: 'Home Charger' }, { id: 'st2', name: 'Office Charger' }],
  defaultChargerId = 'st1',
  categories = ['Billing', 'Technical', 'Account', 'Other'],
  faqs = [
    { q: 'Why is my charger offline?', a: 'Check power and network connectivity, then run self‑tests.' },
    { q: 'How do I change pricing?', a: 'Open Charger Settings → Prices and update per‑charger rates.' }
  ],
  // Prefill payload from 37 — Notifications & Rules
  prefill,
  onBack, onHelp, onNavChange,
  onOpenTicket, onAttachLogs
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const [navValue, setNavValue] = useState(4); // Settings tab index
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

  const [chargerId, setChargerId] = useState(defaultChargerId);
  // Initialize from prefill when available (avoid optional chaining for broader compat)
  const [cat, setCat] = useState(prefill && prefill.cat ? prefill.cat : 'Technical');
  const [subject, setSubject] = useState(prefill && prefill.subject ? prefill.subject : '');
  const [desc, setDesc] = useState(prefill && prefill.desc ? prefill.desc : '');
  const [attach, setAttach] = useState(typeof prefill !== 'undefined' && typeof prefill.attach !== 'undefined' ? prefill.attach : true);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <MobileShell title="Support & help" tagline="contact • logs • FAQ" onBack={handleBack} onHelp={onHelp} navValue={navValue} onNavChange={handleNavChange}>
        <Box>
            {/* Prefill banner */}
            {prefill && (
              <Paper elevation={0} sx={{ p: 1.5, borderRadius: 3, bgcolor: 'rgba(247,127,0,0.08)', borderLeft: '4px solid', borderColor: 'secondary.main', mb: 2 }}>
                <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                  <Typography variant="caption" color="text.secondary">
                    Prefilled from Notifications & Rules: category <strong>{prefill && prefill.cat ? prefill.cat : 'Technical'}</strong>{prefill && prefill.subject ? ` • subject "${prefill.subject}"` : ''}.
                  </Typography>
                  <Button size="small" variant="text" onClick={() => { setCat('Technical'); setSubject(''); setDesc(''); setAttach(true); }}>
                    Reset to defaults
                  </Button>
                </Stack>
              </Paper>
            )}

            {/* Charger selector */}
            <Paper elevation={0} sx={{ p: 2, borderRadius: 3, bgcolor: '#fff', border: '1px solid #eef3f1', mb: 2 }}>
              <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1 }}>For charger</Typography>
              <FormControl size="small" fullWidth>
                <Select value={chargerId} onChange={(e)=>setChargerId(e.target.value)}>
                  {chargers.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                </Select>
              </FormControl>
            </Paper>

            {/* Ticket form */}
            <Paper elevation={0} sx={{ p: 2, borderRadius: 3, bgcolor: '#fff', border: '1px solid #eef3f1', mb: 2 }}>
              <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1 }}>Contact support</Typography>
              <Stack spacing={1.25}>
                <FormControl size="small">
                  <Select value={cat} onChange={(e)=>setCat(e.target.value)}>
                    {categories.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                  </Select>
                </FormControl>
                <TextField label="Subject" value={subject} onChange={(e)=>setSubject(e.target.value)} fullWidth />
                <TextField label="Describe the issue" value={desc} onChange={(e)=>setDesc(e.target.value)} fullWidth multiline rows={4} />
                <FormControlLabel control={<Checkbox checked={attach} onChange={(e)=>setAttach(e.target.checked)} />} label="Include diagnostics logs" />
              </Stack>
            </Paper>

            {/* FAQ */}
            <Paper elevation={0} sx={{ p: 2, borderRadius: 3, bgcolor: '#fff', border: '1px solid #eef3f1', mb: 2 }}>
              <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1 }}>FAQs</Typography>
              {faqs.map((f,i)=> (
                <Accordion key={i} disableGutters>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>{f.q}</AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body2">{f.a}</Typography>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Paper>

            {/* Action buttons */}
            <Stack direction="row" spacing={1} sx={{ px: 2, pb: 2 }}>
              <Button variant="outlined" startIcon={<AttachFileRoundedIcon />} onClick={() => (onAttachLogs ? onAttachLogs({ chargerId }) : console.info('Attach logs', chargerId))}
                sx={{ '&:hover': { bgcolor: 'secondary.main', color: 'common.white', borderColor: 'secondary.main' } }}>Attach logs</Button>
              <Button variant="contained" color="secondary" endIcon={<SendRoundedIcon />} onClick={() => (onOpenTicket ? onOpenTicket({ chargerId, cat, subject, desc, attach }) : console.info('Open ticket', { chargerId, cat, subject }))}
                sx={{ ml: 'auto', color: 'common.white', '&:hover': { bgcolor: 'secondary.dark', color: 'common.white' } }}>Submit</Button>
            </Stack>
        </Box>
      </MobileShell>
    </ThemeProvider>
  );
}
