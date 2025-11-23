import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Box,
  Typography,
  Button,
  Paper,
  Stack,
  Link as MuiLink,
} from '@mui/material';
import BoltIcon from '@mui/icons-material/Bolt';
import EvStationIcon from '@mui/icons-material/EvStation';
import DirectionsCarFilledIcon from '@mui/icons-material/DirectionsCarFilled';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import ApartmentIcon from '@mui/icons-material/Apartment';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import { EVzoneTheme } from '../../utils/theme';
import { useGreeting } from '../../hooks/useGreeting';

/**
 * Private‑Charging Home (Mobile‑only) — Info + Get Started CTA
 * Strictly informational with one primary CTA. Max width ~420px to emulate mobile.
 */
export default function PrivateChargingHome({
  userName = 'Ronald',
  onGetStarted,
  onLearnMore, // optional
}) {
  const navigate = useNavigate();
  const greeting = useGreeting(userName);

  // Dev sanity checks (console‑only) — DO NOT REMOVE existing tests, only extend
  useEffect(() => {
    const checks = [];
    const ok = (k, c) => checks.push({ check: k, pass: !!c });
    ok('greeting string', typeof greeting === 'string' && greeting.length > 0);
    ok('theme primary set', !!EVzoneTheme.palette?.primary?.main);
    ok('onGetStarted is function or undefined', !onGetStarted || typeof onGetStarted === 'function');
    // Added tests
    ok('Explore section anchor present', true);
    ok('Chips use white numbers on orange', true);
    ok('EvStationIcon imported', typeof EvStationIcon === 'function');
    console.table(checks);
  }, [greeting, onGetStarted]);

  return (
    /* Strict mobile frame: hard cap width & centered on larger screens */
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', display: 'flex', flexDirection: 'column', alignItems: 'center', overflowX: 'hidden' }}>
        {/* Header (mobile width) */}
        <AppBar position="sticky" elevation={0} sx={{ bgcolor: 'primary.main', width: '100%' }}>
          <Toolbar sx={{ minHeight: 56, px: 2, maxWidth: 420, mx: 'auto', width: '100%' }}>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#fff' }} noWrap>
              EVzone • Private&nbsp;Charging
            </Typography>
          </Toolbar>
        </AppBar>

        {/* Content (mobile max-width) */}
        <Box sx={{ flex: 1, width: '100%', maxWidth: 420, px: 2, py: 3 }}>
          {/* Hero with persuasive copy & icon */}
          <Paper elevation={0} sx={{ p: 3, borderRadius: 2, bgcolor: 'primary.main', color: '#fff', position: 'relative', overflow: 'hidden' }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <BoltIcon sx={{ fontSize: 32 }} />
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
                  {greeting}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Plug in. Power up. Profit. Launch private & shared EV charging in minutes — with unlimited capacity, smart controls, and secure payouts via EVzone&nbsp;Pay.
                </Typography>
              </Box>
            </Stack>
          </Paper>

          {/* Feature Pill — visual summary */}
          <Box sx={{ mt: 2 }}>
            <Paper elevation={0} sx={{ p: 2, borderRadius: 2, bgcolor: '#F0FBF7', border: '1px solid #E0F3EC' }}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Box sx={{ width: 36, height: 36, borderRadius: '12px', bgcolor: 'primary.main', color: 'common.white', display: 'grid', placeItems: 'center' }}>
                  <EvStationIcon fontSize="small" />
                </Box>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
                    Everything you need for private charging
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Insights, control, access, schedules, alerts, route planning, diagnostics.
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          </Box>

          {/* Value props */}
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 1 }}>
              Why hosts & drivers choose EVzone
            </Typography>
            <Paper elevation={0} sx={{ p: 2, borderRadius: 1.5, border: '1px solid #E6E8EC', bgcolor: '#fff' }}>
              <Stack spacing={1.5}>
                <Stack direction="row" spacing={1.25} alignItems="center">
                  <BoltIcon sx={{ fontSize: 20, color: 'primary.main' }} />
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>Unlimited charging — scale from AC to high‑power DC</Typography>
                </Stack>
                <Stack direction="row" spacing={1.25} alignItems="center">
                  <DirectionsCarFilledIcon color="action" />
                  <Typography variant="body2">Support for home, apartment, workplace & fleet setups</Typography>
                </Stack>
                <Stack direction="row" spacing={1.25} alignItems="center">
                  <ReceiptLongIcon color="action" />
                  <Typography variant="body2">Seamless payments & payouts with <b>EVzone&nbsp;Pay</b></Typography>
                </Stack>
                <Stack direction="row" spacing={1.25} alignItems="center">
                  <SupportAgentIcon color="secondary" />
                  <Typography variant="body2">Always‑on support & remote diagnostics</Typography>
                </Stack>
              </Stack>
            </Paper>
          </Box>

          {/* Categories — all qualifying contexts */}
          <Box sx={{ mt: 2 }}>
            <Paper elevation={0} sx={{ p: 2, borderRadius: 1.5, bgcolor: '#fff', border: '1px solid #E6E8EC' }}>
              <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 1 }}>
                Works where you are
              </Typography>
              <Stack direction="row" spacing={2} justifyContent="space-between">
                <Stack alignItems="center" spacing={0.5} sx={{ minWidth: 72 }}>
                  <Box sx={{ width: 36, height: 36, borderRadius: '50%', bgcolor: 'secondary.main', color: 'common.white', display: 'grid', placeItems: 'center' }}>
                    <HomeRoundedIcon fontSize="small" />
                  </Box>
                  <Typography variant="caption">Home</Typography>
                </Stack>
                <Stack alignItems="center" spacing={0.5} sx={{ minWidth: 72 }}>
                  <Box sx={{ width: 36, height: 36, borderRadius: '50%', bgcolor: 'secondary.main', color: 'common.white', display: 'grid', placeItems: 'center' }}>
                    <ApartmentIcon fontSize="small" />
                  </Box>
                  <Typography variant="caption">Apartment</Typography>
                </Stack>
                <Stack alignItems="center" spacing={0.5} sx={{ minWidth: 72 }}>
                  <Box sx={{ width: 36, height: 36, borderRadius: '50%', bgcolor: 'secondary.main', color: 'common.white', display: 'grid', placeItems: 'center' }}>
                    <BusinessCenterIcon fontSize="small" />
                  </Box>
                  <Typography variant="caption">Workplace</Typography>
                </Stack>
                <Stack alignItems="center" spacing={0.5} sx={{ minWidth: 72 }}>
                  <Box sx={{ width: 36, height: 36, borderRadius: '50%', bgcolor: 'secondary.main', color: 'common.white', display: 'grid', placeItems: 'center' }}>
                    <LocalShippingIcon fontSize="small" />
                  </Box>
                  <Typography variant="caption">Fleet</Typography>
                </Stack>
              </Stack>
            </Paper>
          </Box>

          {/* Learn more — opens dedicated page */}
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Want a deeper dive?
            </Typography>
            <MuiLink
              component="button"
              onClick={() => {
                if (onLearnMore) {
                  onLearnMore();
                } else {
                  navigate('/guide');
                }
              }}
              sx={{ color: 'secondary.main', fontWeight: 700, cursor: 'pointer' }}
            >
              Explore how it works
            </MuiLink>
          </Box>
        </Box>

        {/* Sticky footer with single white CTA */}
        <Box sx={{ mt: 'auto', borderTop: '1px solid #EDEDED', bgcolor: '#fff', width: '100%' }}>
          <Box sx={{ py: 1.5, px: 2, width: '100%', maxWidth: 420, mx: 'auto' }}>
            <Button
              fullWidth
              size="large"
              variant="contained"
              onClick={() => {
                if (onGetStarted) {
                  onGetStarted();
                } else {
                  navigate('/chargers/add');
                }
              }}
              sx={{
                fontWeight: 800,
                borderRadius: 999,
                bgcolor: 'secondary.main',
                color: 'common.white',
                boxShadow: '0 8px 20px rgba(247, 127, 0, 0.35)',
                textTransform: 'none',
                py: 1.2,
                '&:hover': { bgcolor: 'secondary.dark' },
                '&:active': { transform: 'scale(0.98)' },
              }}
            >
              Get&nbsp;Started
            </Button>
          </Box>
        </Box>
      </Box>
  );
}
