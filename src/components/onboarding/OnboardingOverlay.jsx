import React from 'react';
import { Box, Paper, Typography, Button, Stack, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { useOnboarding } from '../../context/OnboardingContext';
import { useNavigate } from 'react-router-dom';

export default function OnboardingOverlay({ 
  stepId, 
  title, 
  description, 
  onComplete,
  highlightSelector,
  onScanQR,
  onAddManually,
  hideOverlay = false // Hide overlay when user is interacting with form/scanner
}) {
  const { isOnboarding, currentStep, nextStep, finishOnboarding, getProgress, steps, getStepRoute } = useOnboarding();
  const navigate = useNavigate();
  const progress = getProgress();

  if (!isOnboarding) {
    return null;
  }

  const currentStepInfo = steps[currentStep];
  if (!currentStepInfo || currentStepInfo.id !== stepId) {
    return null;
  }

  // Hide overlay if hideOverlay is true (user is filling form or scanning)
  if (hideOverlay) {
    return null;
  }

  const handleNext = () => {
    if (onComplete) {
      onComplete();
    }
    nextStep();
    
    // Navigate to next step route
    const nextStepIndex = currentStep + 1;
    if (nextStepIndex < steps.length) {
      const nextRoute = getStepRoute(nextStepIndex);
      if (nextRoute) {
        navigate(nextRoute);
      }
    } else {
      finishOnboarding();
      navigate('/dashboard');
    }
  };

  const handleSkip = () => {
    finishOnboarding();
    navigate('/dashboard');
  };

  return (
    <>
      {/* Backdrop - lighter and allows interaction for interactive steps */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          bgcolor: (stepId === 'add-charger' || stepId === 'configure-settings') ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.5)',
          zIndex: 1300,
          pointerEvents: (stepId === 'add-charger' || stepId === 'configure-settings') ? 'none' : 'auto',
        }}
      />
      
      {/* Progress Bar */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          bgcolor: 'rgba(255, 255, 255, 0.2)',
          zIndex: 1301,
        }}
      >
        <Box
          sx={{
            height: '100%',
            bgcolor: 'secondary.main',
            width: `${progress.percentage}%`,
            transition: 'width 0.3s ease',
          }}
        />
      </Box>

      {/* Overlay Card */}
      <Paper
        elevation={24}
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          maxWidth: 420,
          mx: 'auto',
          p: 1.5,
          borderTopLeftRadius: 12,
          borderTopRightRadius: 12,
          zIndex: 1302,
          bgcolor: '#fff',
        }}
      >
        <Stack spacing={1}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box sx={{ flex: 1, pr: 0.5 }}>
              <Typography variant="caption" sx={{ color: 'text.secondary', mb: 0.25, display: 'block', fontSize: '0.65rem' }}>
                Step {progress.current} of {progress.total}
              </Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 0.25, fontSize: '0.9rem' }}>
                {title || currentStepInfo.title}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', lineHeight: 1.3, fontSize: '0.75rem' }}>
                {description}
              </Typography>
            </Box>
            <IconButton size="small" onClick={handleSkip} sx={{ mt: -0.5, p: 0.5 }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>

          {/* Special actions for add-charger step */}
          {stepId === 'add-charger' && (onScanQR || onAddManually) ? (
            <Stack spacing={0.75}>
              <Stack direction="row" spacing={0.75}>
                {onScanQR && (
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<QrCodeScannerIcon fontSize="small" />}
                    onClick={() => {
                      onScanQR();
                    }}
                    sx={{ 
                      flex: 1, 
                      fontSize: '0.75rem', 
                      py: 0.5,
                      px: 1,
                      minHeight: 32,
                      borderColor: 'primary.main',
                      color: 'primary.main',
                      '&:hover': {
                        borderColor: 'primary.dark',
                        bgcolor: 'primary.light',
                        color: 'primary.dark'
                      }
                    }}
                  >
                    Scan QR
                  </Button>
                )}
                {onAddManually && (
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<AddCircleOutlineIcon fontSize="small" />}
                    onClick={() => {
                      onAddManually();
                    }}
                    sx={{ 
                      flex: 1, 
                      fontSize: '0.75rem', 
                      py: 0.5,
                      px: 1,
                      minHeight: 32,
                      borderColor: 'primary.main',
                      color: 'primary.main',
                      '&:hover': {
                        borderColor: 'primary.dark',
                        bgcolor: 'primary.light',
                        color: 'primary.dark'
                      }
                    }}
                  >
                    Add Manually
                  </Button>
                )}
              </Stack>
              <Button
                variant="outlined"
                size="small"
                onClick={handleSkip}
                sx={{ 
                  fontSize: '0.75rem', 
                  py: 0.5,
                  minHeight: 32,
                  borderColor: 'primary.main',
                  color: 'primary.main',
                  '&:hover': {
                    borderColor: 'primary.dark',
                    bgcolor: 'primary.light',
                    color: 'primary.dark'
                  }
                }}
              >
                Skip Tutorial
              </Button>
            </Stack>
          ) : (
            <Stack direction="row" spacing={0.75}>
              <Button
                variant="outlined"
                size="small"
                onClick={handleSkip}
                sx={{ 
                  flex: 1, 
                  fontSize: '0.75rem', 
                  py: 0.5,
                  minHeight: 32
                }}
              >
                Skip Tutorial
              </Button>
              <Button
                variant="contained"
                color="secondary"
                size="small"
                onClick={handleNext}
                endIcon={<ArrowForwardIcon fontSize="small" />}
                sx={{ 
                  flex: 2, 
                  fontSize: '0.75rem', 
                  py: 0.5,
                  minHeight: 32
                }}
              >
                Continue
              </Button>
            </Stack>
          )}
        </Stack>
      </Paper>
    </>
  );
}

