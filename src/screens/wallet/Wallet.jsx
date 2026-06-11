import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import MobileShell from '../../components/layout/MobileShell';
import {
  Box,
  Typography,
  Paper,
  Stack,
  Card,
  CardActionArea,
  Alert,
  CircularProgress,
} from '@mui/material';
import AccountBalanceWalletRoundedIcon from '@mui/icons-material/AccountBalanceWalletRounded';
import PaymentRoundedIcon from '@mui/icons-material/PaymentRounded';
import ReceiptRoundedIcon from '@mui/icons-material/ReceiptRounded';
import ArrowForwardIosRoundedIcon from '@mui/icons-material/ArrowForwardIosRounded';
import { EV } from '../../utils/theme';
import { walletApi } from '../../services/api/wallet';

export default function Wallet() {
  const navigate = useNavigate();
  const location = useLocation();
  const [navValue, setNavValue] = useState(3);

  const routes = useMemo(
    () => ['/', '/chargers', '/sessions', '/wallet', '/settings'],
    [],
  );

  const [wallet, setWallet] = useState({ balance: 0, currency: 'UGX' });
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;

    const loadWallet = async () => {
      setLoading(true);
      try {
        const [balanceResponse, transactionsResponse] = await Promise.all([
          walletApi.getBalance(),
          walletApi.getTransactions({ limit: 10 }),
        ]);
        if (!active) return;

        const balanceData = balanceResponse?.data || balanceResponse || {};
        const txData = transactionsResponse?.data || transactionsResponse || [];

        setWallet({
          balance: balanceData.balance ?? 0,
          currency: balanceData.currency || 'UGX',
        });
        setTransactions(Array.isArray(txData) ? txData : []);
        setError(null);
      } catch (err) {
        if (!active) return;
        setError(err.response?.data?.message || err.message || 'Failed to load wallet');
      } finally {
        if (active) setLoading(false);
      }
    };

    loadWallet();
    return () => {
      active = false;
    };
  }, []);

  // Sync navValue with current route
  useEffect(() => {
    const pathIndex = routes.findIndex(
      (route) =>
        location.pathname === route || location.pathname.startsWith(route + '/'),
    );
    if (pathIndex !== -1) {
      setNavValue(pathIndex);
    }
  }, [location.pathname, routes]);

  const handleNavChange = useCallback(
    (value) => {
      setNavValue(value);
      if (routes[value] !== undefined) {
        navigate(routes[value]);
      }
    },
    [navigate, routes],
  );

  const MenuTile = ({ icon, title, subtitle, onClick }) => (
    <Card
      elevation={0}
      sx={{
        borderRadius: 1.5,
        border: '1px solid #eef3f1',
        bgcolor: '#fff',
        mb: 1,
      }}
    >
      <CardActionArea onClick={onClick} sx={{ p: 1.5 }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 2,
              display: 'grid',
              placeItems: 'center',
              bgcolor: '#f2f2f2',
            }}
          >
            {icon}
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle2" fontWeight={700}>
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary">
                {subtitle}
              </Typography>
            )}
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
            <Typography variant="body2" color="text.secondary">
              Loading wallet…
            </Typography>
          </Stack>
        )}

        {error && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Balance Card */}
        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            mb: 2,
            borderRadius: 2,
            bgcolor: EV.green,
            color: '#fff',
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
            <AccountBalanceWalletRoundedIcon />
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Available Balance
            </Typography>
          </Stack>
          <Typography variant="h4" fontWeight={800}>
            {wallet.currency} {Number(wallet.balance).toLocaleString()}
          </Typography>
        </Paper>

        {/* Menu Tiles */}
        <MenuTile
          icon={<PaymentRoundedIcon sx={{ color: EV.green }} />}
          title="Top Up"
          subtitle="Add funds to your wallet"
          onClick={() => navigate('/wallet/topup')}
        />
        <MenuTile
          icon={<ReceiptRoundedIcon sx={{ color: EV.green }} />}
          title="Transactions"
          subtitle={`${transactions.length} recent transactions`}
          onClick={() => navigate('/wallet/transactions')}
        />
      </Box>
    </MobileShell>
  );
}
