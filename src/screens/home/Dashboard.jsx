import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { alpha } from '@mui/material/styles';
import {
  Box, Typography, Paper, Stack, Button, Chip, IconButton,
  FormControl, Select, MenuItem,
  CircularProgress, Grid,
  Tooltip, Snackbar, Alert, Menu, ListItemIcon
} from '@mui/material';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import FlashOnRoundedIcon from '@mui/icons-material/FlashOnRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import LockPersonRoundedIcon from '@mui/icons-material/LockPersonRounded';
import SettingsEthernetRoundedIcon from '@mui/icons-material/SettingsEthernetRounded';
import PlaceRoundedIcon from '@mui/icons-material/PlaceRounded';
import RequestQuoteRoundedIcon from '@mui/icons-material/RequestQuoteRounded';
import BugReportRoundedIcon from '@mui/icons-material/BugReportRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import ForestRoundedIcon from '@mui/icons-material/ForestRounded';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import MoreHorizRoundedIcon from '@mui/icons-material/MoreHorizRounded';
import LaunchRoundedIcon from '@mui/icons-material/LaunchRounded';
import SupportAgentRoundedIcon from '@mui/icons-material/SupportAgentRounded';
import AccountBalanceWalletRoundedIcon from '@mui/icons-material/AccountBalanceWalletRounded';
import MobileShell from '../../components/layout/MobileShell';
import { SwitchCommercialModal, AddChargerModal } from '../../components/modals';
import Sparkline from '../../components/common/Sparkline';

function CommercialBadge({ isCommercial }) {
  return (
    <Chip size="small" label={isCommercial ? 'Commercial Charger' : 'Not commercial'}
      color={isCommercial ? 'secondary' : 'default'} sx={{ color: isCommercial ? 'common.white' : undefined }} />
  );
}

export default function HomeDashboard({
  // Data
  chargers = [{ id: 'st1', name: 'Home Charger' }, { id: 'st2', name: 'Office Charger' }],
  commercialChargerId,
  selectedChargerId: selectedId,
  liveSession,          // { chargerId, powerKW, kwh, elapsedSec }
  todayBookings = 0,    // number for commercial charger
  alerts = { faults: 0, offline: 0 },
  priceSummary = { rate: 1200, unit: 'UGX/kWh', publicHours: '09:00–18:00' },
  wallet = { balance: 180000, currency: 'UGX' },
  lastInvoice = { amount: 14880, currency: 'UGX' },
  energyTrend = [4,6,5,7,8,6,9], sessionsTrend = [1,2,1,2,3,2,3], revenueTrend = [9,11,10,12,13,12,15],
  errorMessage,
  loading = false,
  aggregatorUrl = 'https://aggregator.evzone.app',

  // Navigation
  onBack, onHelp, onNavChange,
  openStartQR, openActions, openBookings, openCalendar, openDiagnostics,
  openPricing, openAvailability, openWallet, openInvoices, openHistory,
  openSiteEditor, openAccess, openConnectorMgmt, openSupport, openEnergyAnalytics, openCO2,
  onRefresh,
  onAddCharger,           // kept for compatibility (optional)
  onStartOnboarding,      // NEW: route into 01–03 onboarding with payload

  // Commercial switching
  onRequestCommercial, onConfirmSwitchCommercial, onOpenAggregator, onCheckActivePublicSessions
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const routes = useMemo(() => ['/', '/chargers', '/sessions', '/wallet', '/settings'], []);
  const [navValue, setNavValue] = useState(0); // Home tab (Dashboard is the home view)
  
  // Sync navValue with current route
  useEffect(() => {
    // Map /dashboard to Home tab (index 0)
    if (location.pathname === '/dashboard' || location.pathname === '/') {
      setNavValue(0);
    } else {
      const pathIndex = routes.findIndex(route => 
        (location.pathname === route || location.pathname.startsWith(route + '/')) && route !== '/'
      );
      if (pathIndex !== -1) {
        setNavValue(pathIndex);
      }
    }
  }, [location.pathname, routes]);
  
  const handleNavChange = useCallback((value) => {
    setNavValue(value);
    if (value === 0) {
      // Home tab should navigate to dashboard
      navigate('/dashboard');
    } else if (routes[value] !== undefined) {
      navigate(routes[value]);
    }
    if (onNavChange) onNavChange(value);
  }, [navigate, routes, onNavChange]);
  
  const [switchOpen, setSwitchOpen] = useState(false);
  const [selectedChargerId, setSelectedChargerId] = useState(selectedId || (chargers[0] && chargers[0].id));
  const [snack, setSnack] = useState(false);
  const [moreEl, setMoreEl] = useState(null);
  const [addOpen, setAddOpen] = useState(false);

  const openMore = (e) => setMoreEl(e.currentTarget);
  const closeMore = () => setMoreEl(null);

  const isCommercial = selectedChargerId && commercialChargerId && selectedChargerId === commercialChargerId;
  const selectedName = useMemo(() => (chargers.find(c => c.id === selectedChargerId)?.name || '—'), [chargers, selectedChargerId]);

  // Header actions (Refresh + Add Charger + More)
  const HeaderActions = (
    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
      <Button
        size="small"
        variant="outlined"
        startIcon={<RefreshRoundedIcon />}
        onClick={() => { onRefresh ? onRefresh(selectedChargerId) : console.info('Refresh'); setSnack(true); }}
        sx={{ borderRadius: 1.5, whiteSpace: 'nowrap', flex: '0 1 auto' }}
      >
        REFRESH
      </Button>
      <Button
        size="small"
        variant="outlined"
        startIcon={<AddCircleOutlineIcon />}
        onClick={() => setAddOpen(true)}
        sx={{ borderRadius: 1.5, whiteSpace: 'nowrap', flex: '0 1 auto' }}
      >
        ADD CHARGER
      </Button>
      <Button
        size="small"
        variant="outlined"
        startIcon={<MoreHorizRoundedIcon />}
        onClick={openMore}
        sx={{ borderRadius: 1.5, whiteSpace: 'nowrap', flex: '0 1 auto' }}
      >
        MORE
      </Button>
      {errorMessage && (
        <Chip size="small" color="warning" label={errorMessage} sx={{ gridColumn: '1 / -1', justifySelf: 'center' }} />
      )}
      <Menu
        anchorEl={moreEl}
        open={Boolean(moreEl)}
        onClose={closeMore}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <MenuItem onClick={() => { 
          closeMore(); 
          if (openSupport) {
            openSupport();
          } else {
            navigate('/settings/support');
          }
        }}>
          <ListItemIcon><SupportAgentRoundedIcon fontSize="small" /></ListItemIcon>
          Support
        </MenuItem>
        <MenuItem onClick={() => { closeMore(); onOpenAggregator ? onOpenAggregator(aggregatorUrl) : console.info('Open Aggregator', aggregatorUrl); }}>
          <ListItemIcon><LaunchRoundedIcon fontSize="small" /></ListItemIcon>
          Aggregator
        </MenuItem>
        <MenuItem onClick={() => { closeMore(); openPricing ? openPricing(selectedChargerId) : console.info('Open pricing'); }}>
          <ListItemIcon><RequestQuoteRoundedIcon fontSize="small" /></ListItemIcon>
          Pricing
        </MenuItem>
      </Menu>
    </Box>
  );

  // Card shell with motion
  const Card = ({ children, delay = 0 }) => (
    <Paper elevation={0} sx={{
      p: 2, borderRadius: 1.5, border: '1px solid', borderColor: 'divider', bgcolor: '#fff',
      animation: 'fadeUp .4s ease both', animationDelay: `${delay}ms`,
      '@keyframes fadeUp': { from: { opacity: 0, transform: 'translateY(8px)' }, to: { opacity: 1, transform: 'translateY(0)' } }
    }}>
      {children}
    </Paper>
  );

  // KPI strip (centered)
  const KpiCard = (
    <Card delay={60}>
      {loading ? (
        <Stack direction="row" alignItems="center" spacing={1}><CircularProgress size={16} /><Typography variant="caption">Loading…</Typography></Stack>
      ) : (
        <Grid container spacing={1} alignItems="center" justifyContent="center">
          {[{
            label: 'Energy (kWh)', value: (energyTrend.reduce((a,b)=>a+b,0)).toFixed(0), trend: energyTrend, color: '#03cd8c'
          },{
            label: 'Sessions', value: sessionsTrend.reduce((a,b)=>a+b,0), trend: sessionsTrend, color: '#8bc34a'
          },{
            label: 'Revenue', value: `${wallet.currency} ${(revenueTrend.reduce((a,b)=>a+b,0)*1000).toLocaleString()}`, trend: revenueTrend, color: '#f77f00'
          }].map((k,i)=> (
            <Grid item xs={4} key={i}>
              <Stack alignItems="center" spacing={0.5}>
                <Typography variant="caption" color="text.secondary">{k.label}</Typography>
                <Typography variant="subtitle2" fontWeight={800}>{k.value}</Typography>
                <Sparkline data={k.trend} stroke={k.color} fill={alpha(k.color, .18)} />
              </Stack>
            </Grid>
          ))}
        </Grid>
      )}
    </Card>
  );

  const StatusCard = (
    <Card delay={0}>
      <Stack direction="row" alignItems="center" spacing={1}>
        <Typography variant="subtitle2" fontWeight={800}>Commercial status</Typography>
        <CommercialBadge isCommercial={isCommercial} />
        {!isCommercial && (
          <Button size="small" variant="outlined" onClick={() => { onRequestCommercial ? onRequestCommercial(selectedChargerId) : console.info('Request commercial', selectedChargerId); setSwitchOpen(true); }}
            sx={{ ml: 'auto', borderRadius: 1.5, '&:hover': { bgcolor:'secondary.main', color:'common.white', borderColor:'secondary.main' } }}>MAKE THIS MY COMMERCIAL CHARGER</Button>
        )}
      </Stack>
      {!isCommercial && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          Only one Commercial Charger is allowed per account. Want more? <Button size="small" onClick={() => (onOpenAggregator ? onOpenAggregator(aggregatorUrl) : console.info('Open Aggregator', aggregatorUrl))}>Aggregator & CPMS</Button>
        </Typography>
      )}
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
        <Typography variant="caption" color="text.secondary">Selected:</Typography>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <Select value={selectedChargerId} onChange={(e)=>setSelectedChargerId(e.target.value)}>
            {chargers.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
          </Select>
        </FormControl>
      </Stack>
    </Card>
  );

  const LiveCard = (
    <Card delay={120}>
      <Stack direction="row" spacing={1} alignItems="center">
        <FlashOnRoundedIcon color={liveSession ? 'secondary' : 'disabled'} />
        <Typography variant="subtitle2" fontWeight={800}>
          {liveSession ? 'Live session' : 'No live session'}
        </Typography>
        {liveSession ? (
          <Chip 
            size="small" 
            label={`${liveSession.powerKW} kW`} 
            color="secondary"
            sx={{ ml: 'auto' }} 
            onClick={() => navigate('/sessions/live')}
            clickable
          />
        ) : null}
      </Stack>
      {liveSession ? (
        <>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            {selectedName} • {liveSession.kwh} kWh • {Math.floor(liveSession.elapsedSec/60)} min
          </Typography>
          <Button 
            size="small" 
            variant="outlined" 
            onClick={() => navigate('/sessions/live')}
            sx={{ mt: 1, borderRadius: 1.5, '&:hover': { bgcolor:'secondary.main', color:'common.white', borderColor:'secondary.main' } }}
          >
            View
          </Button>
        </>
      ) : (
        <>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            Start a session quickly by QR or open actions.
          </Typography>
          <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
            <Button 
              size="small" 
              variant="outlined" 
              startIcon={<QrCodeScannerIcon />} 
              onClick={() => {
                if (openStartQR) {
                  openStartQR(selectedChargerId);
                } else {
                  navigate('/start');
                }
              }}
              sx={{ borderRadius: 1.5, '&:hover': { bgcolor:'secondary.main', color:'common.white', borderColor:'secondary.main' } }}
            >
              START BY QR
            </Button>
            <Button 
              size="small" 
              variant="outlined" 
              onClick={() => {
                if (openActions) {
                  openActions(selectedChargerId);
                } else {
                  navigate('/start');
                }
              }}
              sx={{ borderRadius: 1.5, '&:hover': { bgcolor:'secondary.main', color:'common.white', borderColor:'secondary.main' } }}
            >
              ACTIONS
            </Button>
          </Stack>
        </>
      )}
    </Card>
  );

  const BookingsCard = (
    <Card delay={180}>
      <Stack direction="row" spacing={1} alignItems="center">
        <CalendarMonthRoundedIcon />
        <Typography variant="subtitle2" fontWeight={800}>Bookings today</Typography>
        <Chip size="small" label={todayBookings} sx={{ ml: 'auto' }} />
      </Stack>
      {!isCommercial && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>Bookings are available only on your Commercial Charger.</Typography>
      )}
      <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
        <Button size="small" variant="outlined" onClick={() => {
          if (openBookings) {
            openBookings(selectedChargerId);
          } else {
            navigate('/bookings');
          }
        }}
          disabled={!isCommercial} sx={{ borderRadius: 1.5, '&:hover': { bgcolor:'secondary.main', color:'common.white', borderColor:'secondary.main' } }}>MANAGE</Button>
        <Button size="small" variant="outlined" onClick={() => {
          if (openCalendar) {
            openCalendar(selectedChargerId);
          } else {
            navigate('/settings/calendars');
          }
        }}
          sx={{ borderRadius: 1.5, '&:hover': { bgcolor:'secondary.main', color:'common.white', borderColor:'secondary.main' } }}>CALENDAR</Button>
      </Stack>
    </Card>
  );

  const AlertsCard = (
    <Card delay={240}>
      <Stack direction="row" spacing={1} alignItems="center">
        <BugReportRoundedIcon />
        <Typography variant="subtitle2" fontWeight={800}>Health & alerts</Typography>
        <Chip size="small" label={`Faults ${alerts.faults}`} color={alerts.faults ? 'warning' : 'default'} sx={{ ml: 'auto' }} />
        <Chip size="small" label={`Offline ${alerts.offline}`} color={alerts.offline ? 'warning' : 'default'} />
      </Stack>
      <Button size="small" variant="outlined" sx={{ mt: 1, borderRadius: 1.5, '&:hover': { bgcolor:'secondary.main', color:'common.white', borderColor:'secondary.main' } }}
        onClick={() => {
          if (openDiagnostics) {
            openDiagnostics(selectedChargerId);
          } else {
            navigate('/settings/diagnostics');
          }
        }}>OPEN DIAGNOSTICS</Button>
    </Card>
  );

  const PricesCard = (
    <Card delay={300}>
      <Stack direction="row" spacing={1} alignItems="center">
        <RequestQuoteRoundedIcon />
        <Typography variant="subtitle2" fontWeight={800}>Prices & availability</Typography>
        <Chip size="small" label={`${priceSummary.unit} ${priceSummary.rate.toLocaleString()}`} sx={{ ml: 'auto' }} />
      </Stack>
      {isCommercial ? (
        <Typography variant="caption" color="text.secondary">Public hours: {priceSummary.publicHours}</Typography>
      ) : (
        <Typography variant="caption" color="text.secondary">This charger is not commercial — public pricing won’t go live here.</Typography>
      )}
      <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
        <Button size="small" variant="outlined" onClick={() => {
          if (openPricing) {
            openPricing(selectedChargerId);
          } else {
            navigate('/pricing');
          }
        }}
          sx={{ borderRadius: 1.5, '&:hover': { bgcolor:'secondary.main', color:'common.white', borderColor:'secondary.main' } }}>PRICING</Button>
        <Button size="small" variant="outlined" onClick={() => {
          if (openAvailability) {
            openAvailability(selectedChargerId);
          } else {
            navigate('/availability');
          }
        }}
          sx={{ borderRadius: 1.5, '&:hover': { bgcolor:'secondary.main', color:'common.white', borderColor:'secondary.main' } }}>AVAILABILITY</Button>
      </Stack>
    </Card>
  );

  const WalletCard = (
    <Card delay={360}>
      <Stack direction="row" spacing={1.5} alignItems="center">
        <AccountBalanceWalletRoundedIcon color="secondary" />
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle2" fontWeight={800}>Wallet & invoices</Typography>
          <Typography variant="caption" color="text.secondary">Balance: {wallet.currency} {wallet.balance.toLocaleString()} • Last invoice: {lastInvoice.currency} {lastInvoice.amount.toLocaleString()}</Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button size="small" variant="outlined" onClick={() => {
            if (openWallet) {
              openWallet();
            } else {
              navigate('/wallet');
            }
          }}
            sx={{ borderRadius: 1.5, '&:hover': { bgcolor:'secondary.main', color:'common.white', borderColor:'secondary.main' } }}>WALLET</Button>
          <Button size="small" variant="outlined" onClick={() => {
            if (openInvoices) {
              openInvoices(selectedChargerId);
            } else {
              navigate('/invoices');
            }
          }}
            sx={{ borderRadius: 1.5, '&:hover': { bgcolor:'secondary.main', color:'common.white', borderColor:'secondary.main' } }}>INVOICES</Button>
        </Stack>
      </Stack>
    </Card>
  );

  const QuickGrid = (
    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1 }}>
      {[
        { label:'Start b...', icon:<QrCodeScannerIcon/>, route: '/start', fn:openStartQR },
        { label:'Actions', icon:<SettingsEthernetRoundedIcon/>, route: '/start', fn:openActions },
        { label:'Conne...', icon:<SettingsEthernetRoundedIcon/>, route: '/settings/connectors', fn:openConnectorMgmt },
        { label:'Access', icon:<LockPersonRoundedIcon/>, route: '/access', fn:openAccess },
        { label:'Site', icon:<PlaceRoundedIcon/>, route: '/settings/site-editor', fn:openSiteEditor },
        { label:'Support', icon:<SupportAgentRoundedIcon/>, route: '/settings/support', fn:openSupport },
        { label:'Analytics', icon:<TrendingUpRoundedIcon/>, route: '/analytics/energy', fn:openEnergyAnalytics },
        { label:'CO₂', icon:<ForestRoundedIcon/>, route: '/analytics/co2', fn:openCO2 }
      ].map((t, i) => (
        <Paper key={i} elevation={0} sx={{
          borderRadius: 1.5, textAlign: 'center', border: '1px solid', borderColor:'divider', bgcolor: '#fff',
          width: '100%', aspectRatio: '1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: 1.5,
          '&:active':{ transform: 'scale(.98)' },
          animation: 'popIn .36s ease both', animationDelay: `${i*60}ms`,
          '@keyframes popIn': { from:{ opacity:0, transform:'scale(.96)' }, to:{ opacity:1, transform:'scale(1)' } }
        }}>
          <Tooltip title={t.label}>
            <IconButton onClick={() => {
              if (t.fn) {
                t.fn(selectedChargerId);
              } else if (t.route) {
                navigate(t.route);
              } else {
                console.info('Open', t.label);
              }
            }} sx={{ mb: 0.5 }}>{t.icon}</IconButton>
          </Tooltip>
          <Typography variant="caption" sx={{ fontSize: '0.7rem', lineHeight: 1.2, textAlign: 'center' }}>{t.label}</Typography>
        </Paper>
      ))}
    </Box>
  );


  return (
    <>
      <MobileShell 
        title="Dashboard" 
        tagline="glance • act • resolve" 
        onBack={onBack} 
        onHelp={() => (openSupport ? openSupport() : console.info('Open support'))} 
        navValue={navValue} 
        onNavChange={handleNavChange}
      >
        <Box>
            {HeaderActions}
            <Box sx={{ mb: 1.5 }} />
            {StatusCard}
            <Box sx={{ mb: 1.5 }} />
            {KpiCard}
            <Box sx={{ mb: 1.5 }} />
            {LiveCard}
            <Box sx={{ mb: 1.5 }} />
            {BookingsCard}
            <Box sx={{ mb: 1.5 }} />
            {AlertsCard}
            <Box sx={{ mb: 1.5 }} />
            {PricesCard}
            <Box sx={{ mb: 1.5 }} />
            {WalletCard}
            <Box sx={{ mb: 1.5 }} />
          {QuickGrid}
        </Box>
      </MobileShell>

      {/* Switch modal */}
        <SwitchCommercialModal
          open={switchOpen}
          onClose={() => setSwitchOpen(false)}
          oldId={commercialChargerId}
          newId={selectedChargerId}
          aggregatorUrl={aggregatorUrl}
          onConfirmSwitchCommercial={onConfirmSwitchCommercial}
          onOpenAggregator={onOpenAggregator}
          onCheckActivePublicSessions={onCheckActivePublicSessions}
        />

        {/* Add Charger flow */}
        <AddChargerModal
          open={addOpen}
          onClose={() => setAddOpen(false)}
          onStartOnboarding={onStartOnboarding}
          onAddCharger={onAddCharger}
        />

        <Snackbar
          open={snack}
          autoHideDuration={1500}
          onClose={() => setSnack(false)}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert icon={<RefreshRoundedIcon />} severity="success" variant="filled" sx={{ bgcolor:'secondary.main' }}>Refreshed!</Alert>
        </Snackbar>
    </>
  );
}

/**
 * Usage tests
 * <HomeDashboard commercialChargerId="st1" chargers={[{id:'st1',name:'Home'},{id:'st2',name:'Office'}]}
 *   onConfirmSwitchCommercial={({oldId,newId})=>console.log('switch',oldId,'->',newId)}
 *   onOpenAggregator={(url)=>console.log('open aggregator', url)}
 *   onRefresh={()=>console.log('refresh')}
 *   onStartOnboarding={(payload)=>console.log('start 01–03', payload)}
 * />
 */
