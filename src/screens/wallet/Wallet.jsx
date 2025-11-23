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

  const wallet = {
    balance: 180000,
    currency: 'UGX',
  };

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
        {/* Wallet Balance Card */}
        <Paper elevation={0} sx={{ p: 3, borderRadius: 1.5, bgcolor: '#fff', border: '1px solid #eef3f1', mb: 2, textAlign: 'center' }}>
          <AccountBalanceWalletRoundedIcon sx={{ fontSize: 48, color: EV.secondary, mb: 1 }} />
          <Typography variant="h4" fontWeight={800} sx={{ mb: 0.5 }}>
            {wallet.currency} {wallet.balance.toLocaleString()}
          </Typography>
          <Typography variant="caption" color="text.secondary">Current balance</Typography>
        </Paper>

        {/* Quick Actions */}
        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
          <Button
            fullWidth
            variant="outlined"
            onClick={() => navigate('/payments')}
            sx={{ '&:hover': { bgcolor: EV.secondary, color: 'common.white', borderColor: EV.secondary } }}
          >
            Top Up
          </Button>
          <Button
            fullWidth
            variant="contained"
            color="secondary"
            onClick={() => navigate('/payments')}
            sx={{ color: 'common.white', '&:hover': { bgcolor: EV.secondaryDark } }}
          >
            Payment Methods
          </Button>
        </Stack>

        {/* Menu Items */}
        <List sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <MenuTile
            icon={<PaymentRoundedIcon color="secondary" />}
            title="Payment Methods"
            subtitle="Cards, wallet, verification"
            onClick={() => navigate('/payments')}
          />
          <MenuTile
            icon={<ReceiptRoundedIcon color="secondary" />}
            title="Invoices & Billing"
            subtitle="View and manage invoices"
            onClick={() => navigate('/invoices')}
          />
        </List>
      </Box>
    </MobileShell>
  );
}

