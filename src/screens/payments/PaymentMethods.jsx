import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import {
  CssBaseline,
  Container,
  Box,
  Typography,
  Paper,
  Stack,
  Button,
  Chip,
  TextField,
  IconButton,
  RadioGroup,
  Radio,
  FormControlLabel,
  AppBar,
  Toolbar,
  BottomNavigation,
  BottomNavigationAction
} from '@mui/material';
import AccountBalanceWalletRoundedIcon from '@mui/icons-material/AccountBalanceWalletRounded';
import AddCardRoundedIcon from '@mui/icons-material/AddCardRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import VerifiedRoundedIcon from '@mui/icons-material/VerifiedRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import EvStationIcon from '@mui/icons-material/EvStation';
import HistoryIcon from '@mui/icons-material/History';
import SupportAgentRoundedIcon from '@mui/icons-material/SupportAgentRounded';

const theme = createTheme({
  palette: { primary: { main: '#03cd8c' }, secondary: { main: '#f77f00' }, background: { default: '#f2f2f2' } },
  shape: { borderRadius: 7 },
  typography: { fontFamily: 'Inter, Roboto, Arial, sans-serif' },
});

function MobileShell({ title, tagline, onBack, onHelp, navValue, onNavChange, footer, children }) {
  const handleBack = () => { if (onBack) return onBack(); console.info('Navigate to: 12 — Charger Settings (Mobile, React + MUI, JS)'); };
  return (
    <Box sx={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
      <AppBar position="fixed" elevation={1} color="primary">
        <Toolbar sx={{ px: 0 }}>
          <Box sx={{ width: '100%', maxWidth: 480, mx: 'auto', px: 1, display: 'flex', alignItems: 'center' }}>
            <IconButton size="small" edge="start" onClick={handleBack} aria-label="Back" sx={{ color: 'common.white', mr: 1 }}>
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

function CommercialBadge({ isCommercial }) {
  return (
    <Chip size="small" label={isCommercial ? 'Commercial Chareger' : 'Not commercial'}
      color={isCommercial ? 'secondary' : 'default'} sx={{ color: isCommercial ? 'common.white' : undefined }} />
  );
}

function CardRow({ card, onSetDefault, onVerify, onRemove }) {
  return (
    <Paper elevation={0} sx={{ p: 1.25, borderRadius: 1.5, bgcolor: '#fff', border: '1px solid #eef3f1' }}>
      <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
        <Box>
          <Typography variant="subtitle2" fontWeight={700}>{card.brand} •••• {card.last4}</Typography>
          <Typography variant="caption" color="text.secondary">Exp {card.exp}</Typography>
          <Stack direction="row" spacing={1} sx={{ mt: 0.5, flexWrap: 'wrap' }}>
            {card.default && <Chip size="small" icon={<StarRoundedIcon />} label="Default" />}
            {card.verified ? <Chip size="small" icon={<VerifiedRoundedIcon />} label="Verified" color="success" /> : <Chip size="small" label="Unverified" />}
          </Stack>
        </Box>
        <Stack direction="row" spacing={0.5}>
          {!card.default && (
            <Button size="small" variant="outlined" onClick={() => (onSetDefault ? onSetDefault(card) : console.info('Set as default card'))}
              sx={{ '&:hover': { bgcolor: 'secondary.main', color: 'common.white', borderColor: 'secondary.main' } }}>Set default</Button>
          )}
          {!card.verified && (
            <Button size="small" variant="outlined" onClick={() => (onVerify ? onVerify(card) : console.info('Verify card (micro-charge)'))}
              sx={{ '&:hover': { bgcolor: 'secondary.main', color: 'common.white', borderColor: 'secondary.main' } }}>Verify</Button>
          )}
          <IconButton size="small" color="error" onClick={() => (onRemove ? onRemove(card) : console.info('Remove card'))}><DeleteOutlineRoundedIcon /></IconButton>
        </Stack>
      </Stack>
    </Paper>
  );
}

export default function PaymentMethodsPatched({
  commercialChargerId,
  selectedChargerId,
  aggregatorUrl,
  onOpenAggregator,
  onBack,
  onHelp,
  onNavChange,
  onTopUp,
  onWithdraw,
  onAddCard,
  onSetDefault,
  onVerifyCard,
  onRemoveCard,
  wallet = { balance: 180000, currency: 'UGX' },
  cards: initialCards,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const [navValue, setNavValue] = useState(3);
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
  
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate('/wallet');
    }
  };
  
  const [cards] = useState(initialCards || [
    { id: 'c1', brand: 'Visa', last4: '1234', exp: '10/27', default: true, verified: true },
    { id: 'c2', brand: 'Mastercard', last4: '5678', exp: '09/26', default: false, verified: false },
  ]);

  const isCommercial = selectedChargerId && commercialChargerId && selectedChargerId === commercialChargerId;

  const Footer = (
    <Box sx={{ px: 2, pb: 'calc(12px + env(safe-area-inset-bottom))', pt: 1.5, background: '#f2f2f2', borderTop: '1px solid #e9eceb' }}>
      <Stack direction="row" spacing={1}>
        <Button variant="outlined" startIcon={<AccountBalanceWalletRoundedIcon />} onClick={() => (onTopUp ? onTopUp() : console.info('Top up wallet'))}
          sx={{ '&:hover': { bgcolor: 'secondary.main', color: 'common.white', borderColor: 'secondary.main' } }}>Top up</Button>
        <Button variant="outlined" onClick={() => (onWithdraw ? onWithdraw() : console.info('Withdraw from wallet'))}
          sx={{ '&:hover': { bgcolor: 'secondary.main', color: 'common.white', borderColor: 'secondary.main' } }}>Withdraw</Button>
        <Button variant="contained" color="secondary" startIcon={<AddCardRoundedIcon />} onClick={() => (onAddCard ? onAddCard() : console.info('Add new card'))}
          sx={{ ml: 'auto', color: 'common.white', '&:hover': { bgcolor: 'secondary.dark', color: 'common.white' } }}>Add card</Button>
      </Stack>
    </Box>
  );

  const totalVerified = useMemo(() => cards.filter(c => c.verified).length, [cards]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="xs" disableGutters>
        <MobileShell title="Payment methods" tagline="wallet • cards • verification" onBack={handleBack} onHelp={onHelp} navValue={navValue} onNavChange={handleNavChange} footer={Footer}>
          <Box sx={{ px: 2, pt: 2 }}>
            {/* Commercial badge + Aggregator CTA */}
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
              <CommercialBadge isCommercial={isCommercial} />
              {!isCommercial && (
                <Button size="small" variant="text" onClick={() => (onOpenAggregator ? onOpenAggregator(aggregatorUrl) : console.info('Open Aggregator', aggregatorUrl))}>Aggregator & CPMS</Button>
              )}
            </Stack>

            {/* Wallet */}
            <Paper elevation={0} sx={{ p: 2, borderRadius: 1.5, bgcolor: '#fff', border: '1px solid #eef3f1' }}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <AccountBalanceWalletRoundedIcon color="secondary" />
                <Box>
                  <Typography variant="subtitle1" fontWeight={800}>Wallet</Typography>
                  <Typography variant="body2" color="text.secondary">Balance</Typography>
                </Box>
                <Box sx={{ ml: 'auto', textAlign: 'right' }}>
                  <Typography variant="h6" fontWeight={800}>{wallet.currency} {wallet.balance.toLocaleString()}</Typography>
                  <Typography variant="caption" color="text.secondary">{totalVerified} verified card(s)</Typography>
                </Box>
              </Stack>
            </Paper>

            {/* Cards list */}
            <Paper elevation={0} sx={{ p: 2, mt: 2, borderRadius: 1.5, bgcolor: '#fff', border: '1px solid #eef3f1' }}>
              <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1 }}>Saved cards</Typography>
              <Stack spacing={1}>
                {cards.map(c => (
                  <CardRow key={c.id} card={c}
                    onSetDefault={(card) => (onSetDefault ? onSetDefault(card) : console.info('Set default'))}
                    onVerify={(card) => (onVerifyCard ? onVerifyCard(card) : console.info('Verify card'))}
                    onRemove={(card) => (onRemoveCard ? onRemoveCard(card) : console.info('Remove card'))}
                  />
                ))}
              </Stack>
            </Paper>

            {/* Quick add card (mock) */}
            <Paper elevation={0} sx={{ p: 2, mt: 2, borderRadius: 1.5, bgcolor: '#fff', border: '1px solid #eef3f1', mb: 2 }}>
              <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1 }}>Add a card</Typography>
              <Stack spacing={1.25}>
                <TextField label="Card number" placeholder="•••• •••• •••• ••••" inputMode="numeric" />
                <Stack direction="row" spacing={1.25}>
                  <TextField label="Expiry (MM/YY)" placeholder="MM/YY" sx={{ flex: 1 }} />
                  <TextField label="CVV" placeholder="•••" inputMode="numeric" sx={{ width: 120 }} />
                </Stack>
                <RadioGroup row defaultValue="visa">
                  <FormControlLabel value="visa" control={<Radio />} label="Visa" />
                  <FormControlLabel value="mc" control={<Radio />} label="Mastercard" />
                  <FormControlLabel value="amex" control={<Radio />} label="Amex" />
                </RadioGroup>
                <Button variant="outlined" onClick={() => (onAddCard ? onAddCard() : console.info('Add card (mock)'))}
                  sx={{ '&:hover': { bgcolor: 'secondary.main', color: 'common.white', borderColor: 'secondary.main' } }}>Save card</Button>
              </Stack>
            </Paper>
          </Box>
        </MobileShell>
      </Container>
    </ThemeProvider>
  );
}
