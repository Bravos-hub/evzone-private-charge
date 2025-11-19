import React, { useMemo, useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import {
  CssBaseline, Container, Box, Typography, Paper, Stack, Button, TextField, InputAdornment,
  Chip, Avatar, IconButton, List, ListItemButton,
  AppBar, Toolbar, BottomNavigation, BottomNavigationAction
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import EvStationIcon from '@mui/icons-material/EvStation';
import HistoryIcon from '@mui/icons-material/History';
import AccountBalanceWalletRoundedIcon from '@mui/icons-material/AccountBalanceWalletRounded';
import SupportAgentRoundedIcon from '@mui/icons-material/SupportAgentRounded';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import StarRoundedIcon from '@mui/icons-material/StarRounded';

const theme = createTheme({
  palette: {
    primary: { main: '#03cd8c' },
    secondary: { main: '#f77f00' },
    background: { default: '#f2f2f2' }
  },
  shape: { borderRadius: 14 },
  typography: { fontFamily: 'Inter, Roboto, Arial, sans-serif' }
});

function MobileShell({ title, tagline, onBack, onHelp, navValue, onNavChange, footer, children }) {
  return (
    <Box sx={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
      <AppBar position="fixed" elevation={1} color="primary">
        <Toolbar sx={{ px: 0 }}>
          <Box sx={{ width: '100%', maxWidth: 480, mx: 'auto', px: 1, display: 'flex', alignItems: 'center' }}>
            <IconButton size="small" edge="start" onClick={onBack} aria-label="Back" sx={{ color: 'common.white', mr: 1 }}>
              <ArrowBackIosNewIcon fontSize="small" />
            </IconButton>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6" color="inherit" sx={{ fontWeight: 700, lineHeight: 1.15 }}>{title}</Typography>
              {tagline && <Typography variant="caption" color="common.white" sx={{ opacity: 0.9 }}>{tagline}</Typography>}
            </Box>
            <Box sx={{ flexGrow: 1 }} />
            <IconButton size="small" edge="end" aria-label="Help" onClick={onHelp} sx={{ color: 'common.white' }}>
              <HelpOutlineIcon fontSize="small" />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>
      <Toolbar />

      <Box component="main" sx={{ flex: 1 }}>{children}</Box>

      <Box component="footer" sx={{ position: 'sticky', bottom: 0 }}>
        {footer}
        <Paper elevation={8} sx={{ borderTopLeftRadius: 16, borderTopRightRadius: 16 }}>
          <BottomNavigation value={navValue} onChange={(_, v) => onNavChange && onNavChange(v)} showLabels>
            <BottomNavigationAction label="Home" icon={<HomeRoundedIcon />} />
            <BottomNavigationAction label="Stations" icon={<EvStationIcon />} />
            <BottomNavigationAction label="Sessions" icon={<HistoryIcon />} />
            <BottomNavigationAction label="Support" icon={<SupportAgentRoundedIcon />} />
            <BottomNavigationAction label="Wallet" icon={<AccountBalanceWalletRoundedIcon />} />
          </BottomNavigation>
        </Paper>
      </Box>
    </Box>
  );
}

function OperatorRow({ op, selected, onSelect }) {
  return (
    <Paper elevation={0} sx={{ p: 1.5, borderRadius: 3, bgcolor: '#fff', border: selected ? '2px solid #f77f00' : '1px solid #eef3f1' }}>
      <Stack direction="row" spacing={1.25} alignItems="center">
        {selected ? <RadioButtonCheckedIcon color="secondary" /> : <RadioButtonUncheckedIcon color="disabled" />}
        <Avatar src={op.photo} alt={op.name} sx={{ width: 40, height: 40 }} />
        <Box sx={{ flex: 1 }} onClick={() => onSelect(op)}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="subtitle2" fontWeight={700}>{op.name}</Typography>
            <Chip size="small" label={op.shift} color={op.shift === 'Day' ? 'default' : 'default'} />
            <Chip size="small" label={op.status} color={op.status === 'Online' ? 'success' : 'default'} />
          </Stack>
          <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 0.5 }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <StarRoundedIcon key={i} fontSize="small" sx={{ color: i < op.rating ? '#f7b500' : '#e0e0e0' }} />
            ))}
            <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>({op.reviews})</Typography>
          </Stack>
        </Box>
      </Stack>
    </Paper>
  );
}

export default function OperatorSelection({ onBack, onHelp, onNavChange, onConfirm }) {
  const [navValue, setNavValue] = useState(1);
  const [query, setQuery] = useState('');
  const [filterShift, setFilterShift] = useState('All'); // All | Day | Night
  const [selectedId, setSelectedId] = useState(null);

  const operators = [
    { id: '1', name: 'Robert Fox', shift: 'Day', status: 'Online', rating: 4, reviews: 87 },
    { id: '2', name: 'Albert Flores', shift: 'Night', status: 'Online', rating: 5, reviews: 132 },
    { id: '3', name: 'Marvin McKinney', shift: 'Day', status: 'Offline', rating: 4, reviews: 54 },
    { id: '4', name: 'Theresa Webb', shift: 'Day', status: 'Online', rating: 5, reviews: 203 }
  ];

  const filtered = useMemo(() => {
    return operators.filter(op =>
      (filterShift === 'All' || op.shift === filterShift) &&
      (op.name.toLowerCase().includes(query.toLowerCase()))
    );
  }, [operators, query, filterShift]);

  const Footer = (
    <Box sx={{ px: 2, pb: 'calc(12px + env(safe-area-inset-bottom))', pt: 1.5, background: '#f2f2f2', borderTop: '1px solid #e9eceb' }}>
      <Button fullWidth size="large" variant="contained" color="secondary" disabled={!selectedId}
        onClick={() => onConfirm && onConfirm(operators.find(o => o.id === selectedId))}
        sx={{ py: 1.25, color: 'common.white', '&:hover': { bgcolor: 'secondary.dark', color: 'common.white' } }}>
        Confirm operator
      </Button>
    </Box>
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="xs" disableGutters>
        <MobileShell
          title="Operator selection"
          tagline="pick a certified pro"
          onBack={onBack}
          onHelp={onHelp}
          navValue={navValue}
          onNavChange={(v) => { setNavValue(v); onNavChange && onNavChange(v); }}
          footer={Footer}
        >
          <Box sx={{ px: 2, pt: 2 }}>
            <TextField fullWidth placeholder="Search operators" value={query} onChange={(e) => setQuery(e.target.value)}
              InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }} sx={{ mb: 1.25 }} />

            <Stack direction="row" spacing={1} sx={{ mb: 1.25 }}>
              {['All','Day','Night'].map(key => (
                <Chip key={key} label={key} clickable onClick={() => setFilterShift(key)}
                  color={filterShift === key ? 'secondary' : 'default'} />
              ))}
            </Stack>

            <List sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {filtered.map(op => (
                <ListItemButton key={op.id} onClick={() => setSelectedId(op.id)} sx={{ p: 0 }}>
                  <OperatorRow op={op} selected={selectedId === op.id} onSelect={() => setSelectedId(op.id)} />
                </ListItemButton>
              ))}
            </List>
          </Box>
        </MobileShell>
      </Container>
    </ThemeProvider>
  );
}
