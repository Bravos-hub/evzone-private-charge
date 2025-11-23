import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Box,
  Typography,
  Button,
  Paper,
  Stack,
  IconButton,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import BoltIcon from '@mui/icons-material/Bolt';
import EvStationIcon from '@mui/icons-material/EvStation';
import SettingsIcon from '@mui/icons-material/Settings';
import PaymentIcon from '@mui/icons-material/Payment';
import SecurityIcon from '@mui/icons-material/Security';
import AnalyticsIcon from '@mui/icons-material/Analytics';

/**
 * Guide Page - Explains how EVzone Private Charging works
 * Mobile-first design with max width ~420px
 */
export default function Guide() {
  const navigate = useNavigate();

  const sections = [
    {
      icon: <EvStationIcon />,
      title: 'Add Your Charger',
      description: 'Start by adding your EV charger with basic information like name, make, model, and serial number. Our system will guide you through the setup process.',
    },
    {
      icon: <SettingsIcon />,
      title: 'Configure Settings',
      description: 'Set up pricing, access controls, schedules, and availability. Customize your charging station to match your needs and preferences.',
    },
    {
      icon: <PaymentIcon />,
      title: 'Payment & Payouts',
      description: 'Accept payments seamlessly through EVzone Pay. Get paid automatically with secure, fast payouts directly to your account.',
    },
    {
      icon: <SecurityIcon />,
      title: 'Access Control',
      description: 'Manage who can use your charger. Set up user permissions, guest passes, and access codes for complete control over your charging station.',
    },
    {
      icon: <AnalyticsIcon />,
      title: 'Monitor & Analyze',
      description: 'Track energy usage, sessions, revenue, and CO2 savings. Get insights to optimize your charging operations and maximize efficiency.',
    },
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', display: 'flex', flexDirection: 'column', alignItems: 'center', overflowX: 'hidden' }}>
      {/* Header */}
      <AppBar position="sticky" elevation={0} sx={{ bgcolor: 'primary.main', width: '100%' }}>
        <Toolbar sx={{ minHeight: 56, px: 2, maxWidth: 420, mx: 'auto', width: '100%' }}>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => navigate('/')}
            sx={{ mr: 1 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#fff' }} noWrap>
            How It Works
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Content */}
      <Box sx={{ flex: 1, width: '100%', maxWidth: 420, px: 2, py: 3 }}>
        {/* Hero Section */}
        <Paper elevation={0} sx={{ p: 3, borderRadius: 2, bgcolor: 'primary.main', color: '#fff', mb: 3 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <BoltIcon sx={{ fontSize: 32 }} />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.2, mb: 1 }}>
                Getting Started with EVzone
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Set up your private charging station in minutes. Follow these simple steps to get started.
              </Typography>
            </Box>
          </Stack>
        </Paper>

        {/* Steps */}
        <Stack spacing={3}>
          {sections.map((section, index) => (
            <Paper
              key={index}
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: 1.5,
                border: '1px solid #E6E8EC',
                bgcolor: '#fff',
              }}
            >
              <Stack direction="row" spacing={2} alignItems="flex-start">
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: '12px',
                    bgcolor: 'secondary.main',
                    color: 'common.white',
                    display: 'grid',
                    placeItems: 'center',
                    flexShrink: 0,
                  }}
                >
                  {section.icon}
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 0.5 }}>
                    {index + 1}. {section.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                    {section.description}
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          ))}
        </Stack>

        {/* CTA Section */}
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
            Ready to get started?
          </Typography>
          <Button
            fullWidth
            size="large"
            variant="contained"
            onClick={() => navigate('/chargers/add')}
            sx={{
              fontWeight: 800,
              borderRadius: 999,
              bgcolor: 'secondary.main',
              color: 'common.white',
              boxShadow: '0 8px 20px rgba(247, 127, 0, 0.35)',
              textTransform: 'none',
              py: 1.2,
              '&:hover': { bgcolor: 'secondary.dark' },
            }}
          >
            Add Your First Charger
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

