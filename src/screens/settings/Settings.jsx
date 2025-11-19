import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import MobileShell from '../../components/layout/MobileShell';
import {
  Box,
  Typography,
  Stack,
  List,
  Card,
  CardActionArea,
} from '@mui/material';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import EvStationIcon from '@mui/icons-material/EvStation';
import LanguageRoundedIcon from '@mui/icons-material/LanguageRounded';
import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded';
import SupportAgentRoundedIcon from '@mui/icons-material/SupportAgentRounded';
import DataObjectRoundedIcon from '@mui/icons-material/DataObjectRounded';
import BugReportRoundedIcon from '@mui/icons-material/BugReportRounded';
import ArrowForwardIosRoundedIcon from '@mui/icons-material/ArrowForwardIosRounded';

export default function Settings() {
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
  }, [navigate, routes]);

  const MenuTile = ({ icon, title, subtitle, onClick }) => (
    <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #eef3f1', bgcolor: '#fff', mb: 1 }}>
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
      title="Settings"
      tagline="configure • manage • customize"
      navValue={navValue}
      onNavChange={handleNavChange}
      onBack={() => navigate('/dashboard')}
    >
      <Box sx={{ pt: 2 }}>
        {/* Menu Items */}
        <List sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <MenuTile
            icon={<EvStationIcon color="secondary" />}
            title="Sites & Chargers"
            subtitle="Manage sites and charger settings"
            onClick={() => navigate('/settings/sites')}
          />
          <MenuTile
            icon={<LanguageRoundedIcon color="secondary" />}
            title="Language & Currency"
            subtitle="Set language and currency preferences"
            onClick={() => navigate('/settings/language')}
          />
          <MenuTile
            icon={<NotificationsRoundedIcon color="secondary" />}
            title="Notifications & Rules"
            subtitle="Configure notification preferences"
            onClick={() => navigate('/settings/notifications')}
          />
          <MenuTile
            icon={<SupportAgentRoundedIcon color="secondary" />}
            title="Support & Help"
            subtitle="Get help and contact support"
            onClick={() => navigate('/settings/support')}
          />
          <MenuTile
            icon={<DataObjectRoundedIcon color="secondary" />}
            title="Data Export"
            subtitle="Export sessions, invoices, and logs"
            onClick={() => navigate('/settings/export')}
          />
          <MenuTile
            icon={<BugReportRoundedIcon color="secondary" />}
            title="Diagnostics & Logs"
            subtitle="View diagnostics and system logs"
            onClick={() => navigate('/settings/diagnostics')}
          />
          <MenuTile
            icon={<SettingsRoundedIcon color="secondary" />}
            title="Advanced Configuration"
            subtitle="Advanced system settings"
            onClick={() => navigate('/settings/advanced')}
          />
        </List>
      </Box>
    </MobileShell>
  );
}

