import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { EVzoneTheme } from './utils/theme';
import AppRoutes from './routes';
import ErrorBoundary from './components/common/ErrorBoundary';
import { OnboardingProvider } from './context/OnboardingContext';

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider theme={EVzoneTheme}>
        <CssBaseline />
        <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <OnboardingProvider>
            <AppRoutes />
          </OnboardingProvider>
        </BrowserRouter>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;

