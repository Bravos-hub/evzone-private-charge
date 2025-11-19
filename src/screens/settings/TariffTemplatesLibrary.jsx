import React, { useMemo, useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import {
  CssBaseline, Container, Box, Typography, Paper, Stack, Button, Chip, IconButton,
  AppBar, Toolbar, BottomNavigation, BottomNavigationAction, FormControl, Select, MenuItem, TextField,
  Dialog, DialogTitle, DialogContent, DialogActions, List, ListItemButton
} from '@mui/material';
import Divider from '@mui/material/Divider';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import EvStationIcon from '@mui/icons-material/EvStation';
import HistoryIcon from '@mui/icons-material/History';
import AccountBalanceWalletRoundedIcon from '@mui/icons-material/AccountBalanceWalletRounded';
import SupportAgentRoundedIcon from '@mui/icons-material/SupportAgentRounded';

const theme = createTheme({ palette: { primary: { main: '#03cd8c' }, secondary: { main: '#f77f00' }, background: { default: '#f2f2f2' } }, shape: { borderRadius: 14 }, typography: { fontFamily: 'Inter, Roboto, Arial, sans-serif' } });

function MobileShell({ title, tagline, onBack, onHelp, navValue, onNavChange, footer, children }) {
  const handleBack = () => { if (onBack) return onBack(); console.info('Navigate back'); };
  return (
    <Box sx={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
      <AppBar position="fixed" elevation={1} color="primary"><Toolbar sx={{ px: 0 }}>
        <Box sx={{ width: '100%', maxWidth: 480, mx: 'auto', px: 1, display: 'flex', alignItems: 'center' }}>
          <IconButton size="small" edge="start" onClick={handleBack} aria-label="Back" sx={{ color: 'common.white', mr: 1 }}><ArrowBackIosNewIcon fontSize="small" /></IconButton>
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" color="inherit" sx={{ fontWeight: 700, lineHeight: 1.15 }}>{title}</Typography>
            {tagline && <Typography variant="caption" color="common.white" sx={{ opacity: 0.9 }}>{tagline}</Typography>}
          </Box>
          <Box sx={{ flexGrow: 1 }} />
          <IconButton size="small" edge="end" aria-label="Help" onClick={onHelp} sx={{ color: 'common.white' }}><HelpOutlineIcon fontSize="small" /></IconButton>
        </Box>
      </Toolbar></AppBar>
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

function TemplateRow({ t, onApply, onDelete, onOpen }) {
  return (
    <Paper elevation={0} sx={{ p: 1.25, borderRadius: 3, bgcolor: '#fff', border: '1px solid #eef3f1' }}>
      <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
        <Box onClick={()=>onOpen&&onOpen(t)} sx={{ cursor: 'pointer' }}>
          <Typography variant="subtitle2" fontWeight={700}>{t.name}</Typography>
          <Stack direction="row" spacing={1} sx={{ mt: 0.5, flexWrap: 'wrap' }}>
            <Chip size="small" label={`${t.chargeBy==='energy'?'UGX/kWh':'UGX/min'} ${t.rate}`} />
            <Chip size="small" label={t.model.toUpperCase()} />
            {t.includeVat && <Chip size="small" label={`VAT ${t.vat}% incl.`} />}
          </Stack>
        </Box>
        <Stack direction="row" spacing={0.5}>
          <Button size="small" variant="outlined" startIcon={<CheckCircleRoundedIcon />} onClick={()=>onApply&&onApply(t)}
            sx={{ '&:hover': { bgcolor: 'secondary.main', color: 'common.white', borderColor: 'secondary.main' } }}>Apply</Button>
          <IconButton size="small" color="error" onClick={()=>onDelete&&onDelete(t)} aria-label="Delete"><DeleteOutlineRoundedIcon/></IconButton>
        </Stack>
      </Stack>
    </Paper>
  );
}

export default function TariffTemplatesLibraryPatched({
  chargers = [{ id: 'st1', name: 'Home Charger' }, { id: 'st2', name: 'Office Charger' }],
  connectorsByCharger = { st1: [{id:'all',name:'All connectors'},{id:'c1',name:'Connector 1'},{id:'c2',name:'Connector 2'}], st2: [{id:'all',name:'All connectors'},{id:'c3',name:'Connector 3'}] },
  defaultChargerId = 'st1',
  commercialChargerId,
  selectedChargerId,
  aggregatorUrl,
  onOpenAggregator,
  onBack, onHelp, onNavChange,
  onSaveTemplate, onDeleteTemplate,
  onApplyTemplate
}) {
  const [navValue, setNavValue] = useState(1);
  const [chargerId, setChargerId] = useState(defaultChargerId);
  const [connectorId, setConnectorId] = useState('all');
  const [editorOpen, setEditorOpen] = useState(false);
  const [form, setForm] = useState({ name: '', chargeBy: 'energy', rate: 1200, vat: 18, includeVat: false, model: 'single' });
  const [templates, setTemplates] = useState([
    { id: 't1', name: 'Night Saver', chargeBy: 'energy', rate: 1000, vat: 18, includeVat: true, model: 'tou' },
    { id: 't2', name: 'Flat All Day', chargeBy: 'energy', rate: 1200, vat: 0, includeVat: false, model: 'single' }
  ]);

  const connectorList = connectorsByCharger[chargerId] || [{id:'all',name:'All connectors'}];
  const currentId = selectedChargerId || chargerId;
  const isCommercial = currentId && commercialChargerId && currentId === commercialChargerId;

  const openEditor = () => { setForm({ name: '', chargeBy: 'energy', rate: 1200, vat: 18, includeVat: false, model: 'single' }); setEditorOpen(true); };
  const saveTemplate = () => {
    const t = { id: `t${Date.now()}`, ...form };
    setTemplates(prev => [...prev, t]);
    if (onSaveTemplate) onSaveTemplate(t);
    else console.info('Save template', t);
    setEditorOpen(false);
  };
  const deleteT = (t) => { setTemplates(prev => prev.filter(x=>x.id!==t.id)); onDeleteTemplate ? onDeleteTemplate(t) : console.info('Delete template', t); };
  const applyT = (t) => {
    if (!isCommercial) {
      console.info('Applying template to a non-commercial charger — private only');
    }
    if (onApplyTemplate) onApplyTemplate({ chargerId: currentId, connectorId, template: t });
    else console.info('Apply template', t, currentId, connectorId);
  };

  const Footer = (
    <Box sx={{ px: 2, pb: 'calc(12px + env(safe-area-inset-bottom))', pt: 1.5, background: '#f2f2f2', borderTop: '1px solid #e9eceb' }}>
      <Stack direction="row" spacing={1}>
        <Button variant="outlined" startIcon={<SaveRoundedIcon />} onClick={openEditor}
          sx={{ '&:hover': { bgcolor: 'secondary.main', color: 'common.white', borderColor: 'secondary.main' } }}>New template</Button>
      </Stack>
    </Box>
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="xs" disableGutters>
        <MobileShell title="Tariff templates" tagline="save • reuse • apply" onBack={onBack} onHelp={onHelp} navValue={navValue} onNavChange={(v)=>{ setNavValue(v); onNavChange&&onNavChange(v); }} footer={Footer}>
          <Box sx={{ px: 2, pt: 2 }}>
            {/* Scope selectors */}
            <Paper elevation={0} sx={{ p: 2, borderRadius: 3, bgcolor: '#fff', border: '1px solid #eef3f1', mb: 1 }}>
              <Stack direction="row" spacing={1}>
                <FormControl size="small" sx={{ minWidth: 160 }}>
                  <Select value={chargerId} onChange={(e)=>setChargerId(e.target.value)}>
                    {chargers.map(c=> <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                  </Select>
                </FormControl>
                <FormControl size="small" sx={{ minWidth: 160 }}>
                  <Select value={connectorId} onChange={(e)=>setConnectorId(e.target.value)}>
                    {connectorList.map(conn=> <MenuItem key={conn.id} value={conn.id}>{conn.name}</MenuItem>)}
                  </Select>
                </FormControl>
              </Stack>
            </Paper>

            {/* Commercial badge + Aggregator CTA */}
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
              <CommercialBadge isCommercial={isCommercial} />
              {!isCommercial && (
                <Button size="small" variant="text" onClick={() => (onOpenAggregator ? onOpenAggregator(aggregatorUrl) : console.info('Open Aggregator', aggregatorUrl))}>Aggregator & CPMS</Button>
              )}
            </Stack>

            {/* Templates list */}
            <List sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {templates.map(t => (
                <ListItemButton key={t.id} sx={{ p: 0 }}>
                  <TemplateRow t={t} onApply={applyT} onDelete={deleteT} onOpen={(x)=>console.info('Open template detail', x)} />
                </ListItemButton>
              ))}
            </List>

            {!templates.length && (
              <Paper elevation={0} sx={{ p: 2, borderRadius: 3, bgcolor: '#fff', border: '1px dashed #e0e0e0', textAlign: 'center' }}>
                <Typography variant="caption" color="text.secondary">No templates yet. Create one below.</Typography>
              </Paper>
            )}
          </Box>
        </MobileShell>

        {/* Editor dialog */}
        <Dialog open={editorOpen} onClose={()=>setEditorOpen(false)} fullWidth>
          <DialogTitle>New tariff template</DialogTitle>
          <DialogContent>
            <Stack spacing={1.25} sx={{ pt: 1 }}>
              <TextField label="Name" value={form.name} onChange={(e)=>setForm(f=>({ ...f, name: e.target.value }))} fullWidth />
              <FormControl size="small">
                <Select value={form.chargeBy} onChange={(e)=>setForm(f=>({ ...f, chargeBy: e.target.value }))}>
                  <MenuItem value="energy">Energy (UGX/kWh)</MenuItem>
                  <MenuItem value="duration">Duration (UGX/min)</MenuItem>
                </Select>
              </FormControl>
              <TextField label="Rate" type="number" value={form.rate} onChange={(e)=>setForm(f=>({ ...f, rate: Number(e.target.value)||0 }))} fullWidth />
              <Stack direction="row" spacing={1}>
                <TextField label="VAT (%)" type="number" value={form.vat} onChange={(e)=>setForm(f=>({ ...f, vat: Number(e.target.value)||0 }))} sx={{ width: 130 }} />
                <FormControl size="small">
                  <Select value={form.includeVat? 'incl':'excl'} onChange={(e)=>setForm(f=>({ ...f, includeVat: e.target.value==='incl' }))}>
                    <MenuItem value="incl">VAT included</MenuItem>
                    <MenuItem value="excl">VAT excluded</MenuItem>
                  </Select>
                </FormControl>
                <FormControl size="small">
                  <Select value={form.model} onChange={(e)=>setForm(f=>({ ...f, model: e.target.value }))}>
                    <MenuItem value="single">Single</MenuItem>
                    <MenuItem value="tou">TOU</MenuItem>
                  </Select>
                </FormControl>
              </Stack>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={()=>setEditorOpen(false)}>Cancel</Button>
            <Button variant="contained" color="secondary" startIcon={<SaveRoundedIcon/>} onClick={saveTemplate} sx={{ color: 'common.white' }}>Save template</Button>
          </DialogActions>
        </Dialog>
      </Container>
    </ThemeProvider>
  );
}
