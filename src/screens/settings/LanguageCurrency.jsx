import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import {
  CssBaseline, Box, Typography, Paper, Stack, Button, FormControl, Select, MenuItem,
  FormControlLabel, Switch
} from '@mui/material';
import RestoreRoundedIcon from '@mui/icons-material/RestoreRounded';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import MobileShell from '../../components/layout/MobileShell';

const theme = createTheme({ palette: { primary: { main: '#03cd8c' }, secondary: { main: '#f77f00' }, background: { default: '#f2f2f2' } }, shape: { borderRadius: 14 }, typography: { fontFamily: 'Inter, Roboto, Arial, sans-serif' } });

function formatPreview(locale, currency) {
  try {
    const amount = 14880.25;
    const now = new Date('2025-11-01T14:35:00Z');
    const money = new Intl.NumberFormat(locale || undefined, { style: 'currency', currency: currency || 'UGX' }).format(amount);
    const date = new Intl.DateTimeFormat(locale || undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(now);
    const number = new Intl.NumberFormat(locale || undefined).format(10000.5);
    return { money, date, number };
  } catch (e) {
    return { money: `${currency || 'UGX'} 14,880.25`, date: '2025-11-01, 14:35', number: '10,000.5' };
  }
}

export default function LanguageCurrencySelector({
  onBack, onHelp, onNavChange,
  onSaveLocaleCurrency,
  supportedLocales = ['en-UG','fr-FR','de-DE','sw-KE','en-GB','en-US'],
  supportedCurrencies = ['UGX','KES','TZS','USD','EUR','GBP'],
  defaults = { locale: 'en-UG', currency: 'UGX' }
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const [navValue, setNavValue] = useState(4);
  const routes = useMemo(() => ['/', '/chargers', '/sessions', '/wallet', '/settings'], []);
  
  // Sync navValue with current route
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
  const [locale, setLocale] = useState(defaults.locale);
  const [currency, setCurrency] = useState(defaults.currency);
  const [persist, setPersist] = useState(true);

  const preview = useMemo(() => formatPreview(locale, currency), [locale, currency]);

  const save = () => {
    const payload = { locale, currency, persist };
    if (onSaveLocaleCurrency) onSaveLocaleCurrency(payload); else console.info('Save locale/currency', payload);
  };

  const reset = () => {
    setLocale(defaults.locale);
    setCurrency(defaults.currency);
    setPersist(true);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <MobileShell title="Language & currency" tagline="override • preview • persist" onBack={handleBack} onHelp={onHelp} navValue={navValue} onNavChange={handleNavChange}>
        <Box>
            <Paper elevation={0} sx={{ p: 2, borderRadius: 3, bgcolor: '#fff', border: '1px solid #eef3f1', mb: 2 }}>
              <Stack spacing={1}>
                <FormControl size="small" fullWidth>
                  <Typography variant="caption" color="text.secondary">Language</Typography>
                  <Select value={locale} onChange={(e)=>setLocale(e.target.value)}>
                    {supportedLocales.map(l => <MenuItem key={l} value={l}>{l}</MenuItem>)}
                  </Select>
                </FormControl>
                <FormControl size="small" fullWidth>
                  <Typography variant="caption" color="text.secondary">Currency</Typography>
                  <Select value={currency} onChange={(e)=>setCurrency(e.target.value)}>
                    {supportedCurrencies.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                  </Select>
                </FormControl>
                <FormControlLabel control={<Switch checked={persist} onChange={(e)=>setPersist(e.target.checked)} />} label="Persist across sessions" />
              </Stack>
            </Paper>

            <Paper elevation={0} sx={{ p: 2, borderRadius: 3, bgcolor: '#fff', border: '1px solid #eef3f1', mb: 2 }}>
              <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1 }}>Preview</Typography>
              <Typography variant="body2"><strong>Money:</strong> {preview.money}</Typography>
              <Typography variant="body2"><strong>Date:</strong> {preview.date}</Typography>
              <Typography variant="body2"><strong>Number:</strong> {preview.number}</Typography>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>Preview uses JavaScript Intl formatting for the selected locale and currency.</Typography>
            </Paper>

            <Stack direction="row" spacing={1} sx={{ px: 2, pb: 2 }}>
              <Button variant="outlined" startIcon={<RestoreRoundedIcon />} onClick={reset}
                sx={{ '&:hover': { bgcolor: 'secondary.main', color: 'common.white', borderColor: 'secondary.main' } }}>Reset</Button>
              <Button variant="contained" color="secondary" startIcon={<SaveRoundedIcon />} onClick={save}
                sx={{ ml: 'auto', color: 'common.white', '&:hover': { bgcolor: 'secondary.dark', color: 'common.white' } }}>Save</Button>
            </Stack>
        </Box>
      </MobileShell>
    </ThemeProvider>
  );
}
