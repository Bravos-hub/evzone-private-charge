import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import MobileShell from '../../components/layout/MobileShell';
import {
  Box,
  Typography,
  Paper,
  Stack,
  Button,
  List,
  Card,
  CardActionArea,
  Alert,
  CircularProgress
} from '@mui/material';
import AccountBalanceWalletRoundedIcon from '@mui/icons-material/AccountBalanceWalletRounded';
import PaymentRoundedIcon from '@mui/icons-material/PaymentRounded';
import ReceiptRoundedIcon from '@mui/icons-material/ReceiptRounded';
import ArrowForwardIosRoundedIcon from '@mui/icons-material/ArrowForwardIosRounded';
import { EV } from '../../utils/theme';

export default function Wallet() {
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

  // TODO: integrate with backend wallet API when available
  const [wallet] = useState({ balance: 0, currency: 'UGX' });
  const [loading] = useState(false);

  const handleNavChange = useCallback((value) => {
    setNavValue(value);
    if (routes[value] !== undefined) {
      navigate(routes[value]);
    }
  }, [navigate, routes]);

  const MenuTile = ({ icon, title, subtitle, onClick }) => (
    <Card elevation={0} sx={{ borderRadius: 1.5, border: '1px solid #eef3f1', bgcolor: '#fff', mb: 1 }}>
      <CardActionArea onClick={onClick} sx={{ p: 1.5 }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box sx={{ width: 44, height: 44, borderRadius: 2, display: 'grid', placeItems: 'center', bgcolor: '#f2f2f2' }}>
            {icon}
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle2" fontWeight={700}>{title}</Typography>
            {subtitle && <Typography variant="caption" color="text.secondary">{subtitle}</Typography>}
          </Box>
          <ArrowForwardIosRoundedIcon fontSize="small" />
        </Stack>
      </CardActionArea>
    </Card>
  );

  return (
    <MobileShell
      title="Wallet"
      tagline="balance • payments • invoices"
      navValue={navValue}
      onNavChange={handleNavChange}
      onBack={() => navigate('/dashboard')}
    >
      <Box sx={{ pt: 2 }}>
        {loading && (
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
            <CircularProgress size={18} />
            <Typography variant="body2" color="text.secondary">Loading wallet…</Typography>
          </Stack>
        )}

        <Paper elevation={0} sx={{ p: 3, borderRadius: 2, bgcolor: '#fff', border: `1px solid ${EV.divider}`, mb: 2 }}>
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
            <AccountBalanceWalletRoundedIcon sx={{ color: EV.green }} />
            <Typography variant="subtitle2" fontWeight={800}>Balance</Typography>
          </Stack>
          <Typography variant="h4" fontWeight={800}>{wallet.currency} {wallet.balance.toLocaleString()}</Typography>
          <Button variant="contained" color="secondary" fullWidth sx={{ mt: 2, color: 'common.white' }} onClick={() => navigate('/payments')}>
            Top up
          </Button>
        </Paper>

        <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1 }}>
          Menu
        </Typography>

        <List>
          <MenuTile
            icon={<PaymentRoundedIcon sx={{ color: EV.green }} />}
            title="Payment methods"
            subtitle="Cards, mobile money"
            onClick={() => navigate('/payments')}
          />
          <MenuTile
            icon={<ReceiptRoundedIcon sx={{ color: EV.green }} />}
            title="Invoices"
            subtitle="Download & history"
            onClick={() => navigate('/invoices')}
          />
        </List>

        <Alert severity="info" sx={{ mt: 2 }}>
          Wallet balance is managed by the backend. Frontend will sync when the wallet API endpoint is exposed.
        </Alert>
      </Box>
    </MobileShell>
  );
}
