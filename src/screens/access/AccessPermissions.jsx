import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box, Typography, Paper, Stack, Button, TextField, Switch, Chip, IconButton,
  Avatar, FormControl, FormLabel, RadioGroup, Radio, FormControlLabel, ListItemButton,
  Select, MenuItem, Divider, Tooltip
} from '@mui/material';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import QrCode2RoundedIcon from '@mui/icons-material/QrCode2Rounded';
import LinkRoundedIcon from '@mui/icons-material/LinkRounded';
import PinRoundedIcon from '@mui/icons-material/PinRounded';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import MobileShell from '../../components/layout/MobileShell';

const CONNECTORS = {
  st1: [ { id: 'c1', label: 'A1 — Type 2' }, { id: 'c2', label: 'A2 — CCS 2' } ],
  st2: [ { id: 'c3', label: 'B1 — CHAdeMO' } ]
};

function UserCard({ user, onOpen, onOpenVehicles, onRemove }) {
  return (
    <Paper elevation={0} sx={{ p: 1.5, borderRadius: 1.5, bgcolor: '#fff', border: '1px solid #eef3f1' }}>
      <Stack direction="row" spacing={1.25} alignItems="center">
        <Avatar sx={{ width: 36, height: 36 }}>{user.name[0]}</Avatar>
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle2" fontWeight={700}>{user.name}</Typography>
          <Typography variant="caption" color="text.secondary">{user.relation} • {user.method.join(', ')}</Typography>
          <Stack direction="row" spacing={1} sx={{ mt: 0.75 }}>
            <Chip label="Edit" size="small" onClick={() => onOpen(user)} />
            <Chip label="Vehicles" size="small" onClick={() => onOpenVehicles(user)} />
          </Stack>
        </Box>
        <Chip size="small" label={user.status} color={user.status === 'Active' ? 'success' : 'default'} sx={{ mr: 1 }} />
        <IconButton size="small" onClick={() => onRemove(user)} aria-label="Remove"><DeleteOutlineIcon /></IconButton>
      </Stack>
    </Paper>
  );
}

export default function AccessPermissionsPro({
  chargers = [{ id: 'st1', name: 'Home Charger' }, { id: 'st2', name: 'Office Charger' }],
  defaultChargerId = 'st1',
  commercialChargerId,
  selectedChargerId,
  aggregatorUrl,
  onOpenAggregator,
  onBack, onHelp, onNavChange, onSave, onOpenUser, onOpenUserVehicles
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const routes = useMemo(() => ['/', '/chargers', '/sessions', '/wallet', '/settings'], []);
  const [navValue, setNavValue] = useState(1); // Stations tab

  // Sync navValue with current route
  useEffect(() => {
    const pathIndex = routes.findIndex(route => 
      (location.pathname === route || location.pathname.startsWith(route + '/')) && route !== '/'
    );
    if (pathIndex !== -1) {
      setNavValue(pathIndex);
    }
  }, [location.pathname, routes]);

  const handleNavChange = useCallback((value) => {
    setNavValue(value);
    if (value === 0) {
      navigate('/dashboard');
    } else if (routes[value] !== undefined) {
      navigate(routes[value]);
    }
    if (onNavChange) onNavChange(value);
  }, [navigate, routes, onNavChange]);

  const handleBack = useCallback(() => {
    if (onBack) {
      onBack();
    } else {
      navigate('/dashboard');
    }
  }, [navigate, onBack]);
  const [chargerId, setChargerId] = useState(defaultChargerId);
  const [scope, setScope] = useState('charger'); // 'charger' | 'connector'
  const connectors = useMemo(() => CONNECTORS[chargerId] || [], [chargerId]);
  const [connectorId, setConnectorId] = useState(connectors[0]?.id || '');
  React.useEffect(()=>{ setConnectorId((CONNECTORS[chargerId]||[])[0]?.id || ''); }, [chargerId]);

  // Nested users per charger & scope key ('__charger__' or `conn:<id>`)
  const keyFor = (cid, sc, kid) => sc === 'connector' ? `conn:${kid||''}` : '__charger__';
  const initialUsers = {
    st1: { '__charger__': [ { id: '1', name: 'Robert Fox', relation: 'Brother', method: ['App','RFID'], status: 'Active' } ], 'conn:c1': [], 'conn:c2': [] },
    st2: { '__charger__': [ { id: '2', name: 'Albert Flores', relation: 'Employee', method: ['App'], status: 'Active' } ], 'conn:c3': [] },
  };
  const [users, setUsers] = useState(initialUsers);
  const [vehicles] = useState({ st1: {}, st2: {} });
  const [newUser, setNewUser] = useState({ sid: '', relation: 'Family', app: true, rfid: true, assignCard: false, offline: true, selfService: true });

  // const currentId = selectedChargerId || chargerId; // Unused but kept for potential future use

  const addUser = () => {
    const id = Date.now().toString();
    const u = { id, name: newUser.sid || 'New user', relation: newUser.relation, method: [newUser.app && 'App', newUser.rfid && 'RFID'].filter(Boolean), status: 'Active' };
    const key = keyFor(chargerId, scope, connectorId);
    setUsers(prev => ({ ...prev, [chargerId]: { ...(prev[chargerId]||{}), [key]: [ ...(prev[chargerId]?.[key]||[]), u ] } }));
    setNewUser({ sid: '', relation: 'Family', app: true, rfid: true, assignCard: false, offline: true, selfService: true });
  };

  const removeUser = (user) => {
    const key = keyFor(chargerId, scope, connectorId);
    setUsers(prev => ({ ...prev, [chargerId]: { ...(prev[chargerId]||{}), [key]: (prev[chargerId]?.[key]||[]).filter(x => x.id !== user.id) } }));
  };

  const listUsers = () => (users[chargerId]?.[keyFor(chargerId, scope, connectorId)] || []);

  const Footer = (
    <Box sx={{ px: 2, pb: 'calc(12px + env(safe-area-inset-bottom))', pt: 1.5, background: '#f2f2f2', borderTop: '1px solid #e9eceb' }}>
      <Button fullWidth size="large" variant="contained" color="secondary" onClick={() => (onSave ? onSave({ scope, chargerId, connectorId: scope==='connector' ? connectorId : undefined, users: listUsers(), vehicles: (vehicles[chargerId]||{})[keyFor(chargerId, scope, connectorId)]||[] }) : alert('Save access (payload logged)'))}
        sx={{ py: 1.25, color: 'common.white', '&:hover': { bgcolor: 'secondary.dark', color: 'common.white' } }}>
        Save access
      </Button>
    </Box>
  );

  return (
    <MobileShell 
      title="Access & permissions" 
      tagline="who can use per charger or connector" 
      onBack={handleBack} 
      onHelp={onHelp} 
      navValue={navValue} 
      onNavChange={handleNavChange}
      footerSlot={Footer}
    >
      <Box>
            {/* Target selector */}
            <Paper elevation={0} sx={{ p: 2, borderRadius: 1.5, bgcolor: '#fff', border: '1px solid #eef3f1', mb: 1 }}>
              <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1 }}>Target</Typography>
              <FormControl size="small" fullWidth>
                <FormLabel>Charger</FormLabel>
                <Select value={chargerId} onChange={(e)=>setChargerId(e.target.value)}>
                  {chargers.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                </Select>
              </FormControl>

              <FormControl sx={{ mt: 1 }}>
                <FormLabel>Scope</FormLabel>
                <RadioGroup row value={scope} onChange={(e)=>setScope(e.target.value)}>
                  <FormControlLabel value="charger" control={<Radio />} label="Charger" />
                  <FormControlLabel value="connector" control={<Radio />} label="Connector" />
                </RadioGroup>
              </FormControl>

              {scope === 'connector' && (
                <Tooltip title={(CONNECTORS[chargerId]||[]).length ? '' : 'No connectors for this charger'}>
                  <span>
                    <FormControl size="small" fullWidth disabled={!(CONNECTORS[chargerId]||[]).length} sx={{ mt: 1 }}>
                      <FormLabel>Connector</FormLabel>
                      <Select value={connectorId} onChange={(e)=>setConnectorId(e.target.value)}>
                        {(CONNECTORS[chargerId]||[]).map(k => <MenuItem key={k.id} value={k.id}>{k.label}</MenuItem>)}
                      </Select>
                    </FormControl>
                  </span>
                </Tooltip>
              )}
            </Paper>

            {/* Aggregator CTA */}
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
              <Chip size="small" label={scope==='connector' ? `Connector ${connectorId||''}` : 'Charger scope'} />
              <Box sx={{ flexGrow: 1 }} />
              <Button size="small" variant="text" onClick={() => (onOpenAggregator ? onOpenAggregator(aggregatorUrl, chargerId, connectorId, scope) : alert('Open Aggregator'))}
                sx={{ '&:hover': { bgcolor: 'secondary.main', color: '#fff' } }}>Aggregator & CPMS</Button>
            </Stack>

            {/* Users */}
            <Stack spacing={1}>
              {listUsers().map(u => (
                <ListItemButton key={u.id} sx={{ p: 0 }} onClick={() => (onOpenUser ? onOpenUser(u, chargerId, connectorId, scope) : console.info('Open user editor', u, chargerId, connectorId, scope))}>
                  <UserCard user={u}
                    onOpen={(x) => (onOpenUser ? onOpenUser(x, chargerId, connectorId, scope) : console.info('Open user editor', x))}
                    onOpenVehicles={(x) => (onOpenUserVehicles ? onOpenUserVehicles(x, chargerId, connectorId, scope) : console.info('Open user vehicles', x))}
                    onRemove={removeUser} />
                </ListItemButton>
              ))}
            </Stack>

            {/* Add user */}
            <Paper elevation={0} sx={{ mt: 2, p: 2, borderRadius: 1.5, bgcolor: '#fff', border: '1px solid #eef3f1' }}>
              <Stack direction="row" spacing={1.25} alignItems="center" sx={{ mb: 1 }}>
                <PersonAddAlt1Icon color="secondary" />
                <Typography variant="subtitle2" fontWeight={700}>Add user</Typography>
              </Stack>
              <TextField label="App SID" placeholder="Type app SID" fullWidth value={newUser.sid} onChange={(e) => setNewUser({ ...newUser, sid: e.target.value })} sx={{ mb: 1.5 }} />
              <FormControl fullWidth sx={{ mb: 1.5 }}>
                <FormLabel>Relation</FormLabel>
                <RadioGroup row value={newUser.relation} onChange={(e) => setNewUser({ ...newUser, relation: e.target.value })}>
                  <FormControlLabel value="Family" control={<Radio />} label="Family" />
                  <FormControlLabel value="Employee" control={<Radio />} label="Employee" />
                  <FormControlLabel value="Guest" control={<Radio />} label="Guest" />
                </RadioGroup>
              </FormControl>
              <Stack direction="row" spacing={2} sx={{ mb: 1 }}>
                <FormControlLabel control={<Switch checked={newUser.app} onChange={(e) => setNewUser({ ...newUser, app: e.target.checked })} />} label="App" />
                <FormControlLabel control={<Switch checked={newUser.rfid} onChange={(e) => setNewUser({ ...newUser, rfid: e.target.checked })} />} label="RFID" />
                <FormControlLabel control={<Switch checked={newUser.assignCard} onChange={(e) => setNewUser({ ...newUser, assignCard: e.target.checked })} />} label="Assign card" />
              </Stack>

              <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                <FormControlLabel control={<Switch checked={newUser.offline} onChange={(e) => setNewUser({ ...newUser, offline: e.target.checked })} />} label="Allow offline access" />
                <FormControlLabel control={<Switch checked={newUser.selfService} onChange={(e) => setNewUser({ ...newUser, selfService: e.target.checked })} />} label="Allow self service" />
              </Stack>

              <Button startIcon={<PersonAddAlt1Icon />} variant="contained" color="secondary" onClick={addUser}
                sx={{ color: 'common.white', '&:hover': { bgcolor: 'secondary.dark', color: 'common.white' } }}>Add user</Button>
            </Paper>

            {/* Quick onboard + limits */}
            <Paper elevation={0} sx={{ mt: 2, p: 2, borderRadius: 1.5, bgcolor: '#fff', border: '1px solid #eef3f1', mb: 2 }}>
              <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>Onboard shortcuts & limits</Typography>
              <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                <Button size="small" variant="outlined" startIcon={<LinkRoundedIcon />} onClick={() => alert('Generate invite link')}
                  sx={{ '&:hover': { bgcolor: 'secondary.main', color: '#fff', borderColor: 'secondary.main' } }}>Invite link</Button>
                <Button size="small" variant="outlined" startIcon={<QrCode2RoundedIcon />} onClick={() => alert('Generate QR code')}
                  sx={{ '&:hover': { bgcolor: 'secondary.main', color: '#fff', borderColor: 'secondary.main' } }}>QR code</Button>
                <Button size="small" variant="outlined" startIcon={<PinRoundedIcon />} onClick={() => alert('Create PIN')}
                  sx={{ '&:hover': { bgcolor: 'secondary.main', color: '#fff', borderColor: 'secondary.main' } }}>Assign PIN</Button>
              </Stack>
              <Divider sx={{ my: 1 }} />
              <Stack direction="row" spacing={1}>
                <TextField label="Max sessions / day" type="number" sx={{ flex: 1 }} />
                <TextField label="Max kWh / day" type="number" sx={{ flex: 1 }} />
                <TextField label="Max duration (min)" type="number" sx={{ flex: 1 }} />
              </Stack>
            </Paper>
      </Box>
    </MobileShell>
  );
}
