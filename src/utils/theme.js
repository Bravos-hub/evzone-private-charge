import { createTheme } from '@mui/material/styles';

export const EVzoneTheme = createTheme({
  palette: {
    primary: { main: '#03cd8c' },
    secondary: { main: '#f77f00' },
    background: { default: '#f7f9f8' },
    text: { primary: '#0E1726', secondary: '#5B6372' },
  },
  shape: { borderRadius: 16 },
  typography: {
    fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial',
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          transition: 'box-shadow .2s ease, transform .06s ease',
        },
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
    },
  },
});

export const EV = {
  green: '#03cd8c',
  orange: '#f77f00',
  secondary: '#f77f00',
  secondaryDark: '#d66a00',
  bg: '#f7f9f8',
  divider: '#eef3f1',
};

