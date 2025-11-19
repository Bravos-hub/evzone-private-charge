import React from 'react';
import { Box, AppBar, Toolbar, Typography, IconButton, Paper, BottomNavigation, BottomNavigationAction, Tooltip } from '@mui/material';
import { alpha } from '@mui/material/styles';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import EvStationIcon from '@mui/icons-material/EvStation';
import HistoryIcon from '@mui/icons-material/History';
import AccountBalanceWalletRoundedIcon from '@mui/icons-material/AccountBalanceWalletRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import { EV } from '../../utils/theme';

export default function MobileShell({ 
  title, 
  subtitle, 
  tagline,
  navIndex = 0, 
  navValue,
  onNavChange, 
  onBack, 
  onHelp, 
  onNotifications,
  footerSlot,
  footer,
  children 
}) {
  const handleBack = (e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    if (typeof onBack === 'function') {
      onBack();
    } else {
      console.info('Back - no handler');
    }
  };
  
  const handleHelp = (e) => {
    e?.preventDefault?.();
    if (typeof onHelp === 'function') {
      onHelp();
    } else {
      console.info('Help');
    }
  };
  
  const handleNotifications = (e) => {
    e?.preventDefault?.();
    if (typeof onNotifications === 'function') {
      onNotifications();
    } else {
      console.info('Notifications');
    }
  };
  
  const handleNavChange = (event, newValue) => {
    if (typeof onNavChange === 'function') {
      onNavChange(newValue);
    } else {
      console.info('Nav change - no handler', newValue);
    }
  };
  
  const nav = navValue !== undefined ? navValue : navIndex;

  return (
    <Box sx={{ 
      minHeight: '100dvh', 
      display: 'flex', 
      flexDirection: 'column', 
      bgcolor: EV.bg,
      position: 'relative',
      isolation: 'isolate',
      zIndex: 0
    }}>
      <AppBar position="fixed" elevation={1} sx={{
        background: `linear-gradient(180deg, ${alpha(EV.green, .92)} 0%, ${alpha(EV.green, .78)} 60%, ${alpha(EV.green, .70)} 100%)`,
        backdropFilter: 'blur(6px)',
        zIndex: (theme) => theme.zIndex.drawer + 1
      }}>
        <Toolbar sx={{ px: 0 }}>
          <Box sx={{ width: '100%', maxWidth: 420, mx: 'auto', px: 1, display: 'flex', alignItems: 'center' }}>
            <IconButton size="small" edge="start" onClick={handleBack} aria-label="Back" sx={{ color: 'common.white', mr: 1 }}>
              <ArrowBackIosNewIcon fontSize="small" />
            </IconButton>
            <Box sx={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
              <Typography variant="h6" color="inherit" noWrap sx={{ fontWeight: 800, lineHeight: 1.1 }}>{title}</Typography>
              {(subtitle || tagline) && (
                <Typography variant="caption" color="common.white" noWrap sx={{ opacity: 0.9 }}>{subtitle || tagline}</Typography>
              )}
            </Box>
            <Box sx={{ flexGrow: 1 }} />
            {onNotifications && (
              <Tooltip title="Notifications">
                <span>
                  <IconButton size="small" onClick={handleNotifications} sx={{ color: 'common.white', mr: 1 }}>
                    <HelpOutlineIcon fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
            )}
            {onHelp && (
              <Tooltip title="Help & docs">
                <span>
                  <IconButton size="small" edge="end" aria-label="Help" onClick={handleHelp} sx={{ color: 'common.white' }}>
                    <HelpOutlineIcon fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
            )}
          </Box>
        </Toolbar>
      </AppBar>
      <Toolbar />

      <Box component="main" sx={{ flex: 1 }}>
        <Box sx={{ maxWidth: 420, mx: 'auto', px: 2, pt: 2, pb: 2 }}>
          {children}
        </Box>
      </Box>

      {footerSlot && (
        <Box sx={{ px: 2, pt: 1, pb: 1, borderTop: `1px solid ${EV.divider}`, bgcolor: '#fff' }}>
          <Box sx={{ maxWidth: 420, mx: 'auto' }}>{footerSlot}</Box>
        </Box>
      )}

      {footer && (
        <Box component="footer" sx={{ position: 'sticky', bottom: 0 }}>
          {footer}
        </Box>
      )}

      <Paper elevation={10} sx={{ 
        borderTopLeftRadius: 16, 
        borderTopRightRadius: 16, 
        position: 'sticky', 
        bottom: 0, 
        backdropFilter: 'blur(6px)',
        zIndex: (theme) => theme.zIndex.drawer + 1
      }}>
        <Box sx={{ maxWidth: 420, mx: 'auto' }}>
          <BottomNavigation
            value={nav}
            onChange={handleNavChange}
            showLabels
            sx={{ '& .Mui-selected, & .Mui-selected .MuiSvgIcon-root': { color: EV.green } }}
          >
            <BottomNavigationAction label="Home" icon={<HomeRoundedIcon />} />
            <BottomNavigationAction label="Stations" icon={<EvStationIcon />} />
            <BottomNavigationAction label="Sessions" icon={<HistoryIcon />} />
            <BottomNavigationAction label="Wallet" icon={<AccountBalanceWalletRoundedIcon />} />
            <BottomNavigationAction label="Settings" icon={<SettingsRoundedIcon />} />
          </BottomNavigation>
        </Box>
      </Paper>
    </Box>
  );
}

