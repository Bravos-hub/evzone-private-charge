import React, { useRef } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Box, Paper, Stack, Typography, Button, IconButton, AppBar, Toolbar, BottomNavigation, BottomNavigationAction, Tooltip, Chip } from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import AccountBalanceWalletRoundedIcon from '@mui/icons-material/AccountBalanceWalletRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import PrintRoundedIcon from '@mui/icons-material/PrintRounded';

const theme = createTheme({ palette:{ primary:{ main:'#03cd8c' }, secondary:{ main:'#f77f00' }, background:{ default:'#f7f9f8' } }, shape:{ borderRadius:14 }, typography:{ fontFamily:'Inter, system-ui, -apple-system, Roboto, Arial, sans-serif' } });

function Shell({ title, subtitle, nav=1, onNav, onBack, onBell, children }){
  return(
    <Box sx={{ minHeight:'100dvh', display:'flex', flexDirection:'column', bgcolor:'background.default' }}>
      <AppBar position='fixed' elevation={1} sx={{ backgroundImage:'linear-gradient(180deg, rgba(3,205,140,.92) 0%, rgba(3,205,140,.78) 60%, rgba(3,205,140,.70) 100%)' }}>
        <Toolbar sx={{ px:0 }}>
          <Box sx={{ width:'100%', maxWidth:420, mx:'auto', px:1, display:'flex', alignItems:'center' }}>
            <IconButton size='small' onClick={()=>onBack?onBack():0} sx={{ color:'common.white', mr:1 }}><ArrowBackIosNewIcon fontSize='small'/></IconButton>
            <Box sx={{ display:'flex', flexDirection:'column', minWidth:0 }}>
              <Typography variant='h6' color='inherit' noWrap sx={{ fontWeight:800, lineHeight:1.1 }}>{title}</Typography>
              {subtitle? <Typography variant='caption' color='common.white' noWrap sx={{ opacity:.9 }}>{subtitle}</Typography>:null}
            </Box>
            <Box sx={{ flexGrow:1 }}/>
            <Tooltip title='Notifications'><span><IconButton size='small' onClick={()=>onBell?onBell():0} sx={{ color:'common.white' }}><NotificationsRoundedIcon fontSize='small'/></IconButton></span></Tooltip>
          </Box>
        </Toolbar>
      </AppBar>
      <Toolbar/>
      <Box sx={{ flex:1 }}>
        <Box sx={{ maxWidth:420, mx:'auto', px:2, pt:2, pb:2 }}>{children}</Box>
      </Box>
      <Paper elevation={8} sx={{ position:'sticky', bottom:0, borderTopLeftRadius:16, borderTopRightRadius:16 }}>
        <Box sx={{ maxWidth:420, mx:'auto' }}>
          <BottomNavigation value={nav} onChange={(_,v)=>onNav?onNav(v):0} showLabels sx={{ '& .Mui-selected, & .Mui-selected .MuiSvgIcon-root':{ color:'#03cd8c' } }}>
            <BottomNavigationAction label='Home' icon={<HomeRoundedIcon/>}/>
            <BottomNavigationAction label='Dashboard' icon={<DashboardRoundedIcon/>}/>
            <BottomNavigationAction label='Sessions' icon={<HistoryRoundedIcon/>}/>
            <BottomNavigationAction label='Wallet' icon={<AccountBalanceWalletRoundedIcon/>}/>
            <BottomNavigationAction label='Settings' icon={<SettingsRoundedIcon/>}/>
          </BottomNavigation>
        </Box>
      </Paper>
    </Box>
  );
}

function QRBlock({ site='Home Charger', code='EVZ-QR-1023' }){
  return (
    <Box sx={{ p:2, border:'1px dashed #e0e0e0', borderRadius:2, textAlign:'center', bgcolor:'#fff' }}>
      <Typography variant='subtitle2' fontWeight={800}>{site}</Typography>
      <Box sx={{ mt:1, width:200, height:200, mx:'auto', borderRadius:2, bgcolor:'#000', display:'grid', placeItems:'center', color:'#fff' }}>QR</Box>
      <Typography variant='caption' color='text.secondary' sx={{ mt:1, display:'block' }}>Scan to start a charging session</Typography>
      <Chip size='small' label={code} sx={{ mt:1 }}/>
    </Box>
  );
}

export default function QrPosterMobile({ onBack, onBell, onNav, site, code, onDownload, onPrint }){
  const posterRef = useRef(null);
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline/>
      <Shell title='QR Poster' subtitle='print • share' onBack={onBack} onBell={onBell} onNav={onNav}>
        <QRBlock site={site} code={code}/>
        <Stack direction='row' spacing={1} justifyContent='center' sx={{ mt:2 }}>
          <Button variant='contained' color='secondary' startIcon={<DownloadRoundedIcon/>} onClick={()=>onDownload?onDownload({ref:posterRef, site, code}):0} sx={{ color:'#fff' }}>Download PNG</Button>
          <Button variant='outlined' startIcon={<PrintRoundedIcon/>} onClick={()=>onPrint?onPrint({ref:posterRef, site, code}):0}>Print</Button>
        </Stack>
      </Shell>
    </ThemeProvider>
  );
}
