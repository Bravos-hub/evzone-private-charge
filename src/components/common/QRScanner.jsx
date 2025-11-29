import React, { useEffect, useRef, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  Typography,
  Box,
  CircularProgress,
  Alert,
} from '@mui/material';
import QrCode2RoundedIcon from '@mui/icons-material/QrCode2Rounded';
import CameraAltOutlinedIcon from '@mui/icons-material/CameraAltOutlined';
import { Html5Qrcode } from 'html5-qrcode';
import { EV } from '../../utils/theme';

/**
 * QR Scanner Dialog Component
 * Uses HTML5 QR Code library for scanning QR codes from camera
 */
export default function QRScanner({ open, onClose, onScanSuccess, title = 'Scan QR Code' }) {
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState(null);
  const [hasPermission, setHasPermission] = useState(null);
  const scannerRef = useRef(null);

  useEffect(() => {
    if (open) {
      // Check for camera permission
      navigator.mediaDevices?.getUserMedia({ video: true })
        .then(() => {
          setHasPermission(true);
          setError(null);
        })
        .catch((err) => {
          setHasPermission(false);
          if (err.name === 'NotAllowedError') {
            setError('Camera permission denied. Please allow camera access to scan QR codes.');
          } else if (err.name === 'NotFoundError') {
            setError('No camera found on this device.');
          } else {
            setError('Unable to access camera. Please check your device settings.');
          }
        });
    } else {
      // Cleanup when dialog closes
      setScanning(false);
      setError(null);
      setHasPermission(null);
      if (scannerRef.current) {
        scannerRef.current = null;
      }
    }
  }, [open]);

  const startScanning = async () => {
    if (!hasPermission) {
      setError('Camera permission is required to scan QR codes.');
      return;
    }

    try {
      setScanning(true);
      setError(null);

      const qrCode = new Html5Qrcode('qr-reader');
      scannerRef.current = qrCode;

      await qrCode.start(
        { facingMode: 'environment' }, // Use back camera
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          // Successfully scanned
          handleScanSuccess(decodedText);
        },
        (errorMessage) => {
          // Ignore scanning errors (they're normal while searching for QR code)
        }
      );
    } catch (err) {
      setScanning(false);
      setError(err.message || 'Failed to start QR scanner. Please try again.');
    }
  };

  const stopScanning = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        await scannerRef.current.clear();
      } catch (err) {
        console.warn('Error stopping scanner:', err);
      }
      scannerRef.current = null;
    }
    setScanning(false);
  };

  const handleScanSuccess = (decodedText) => {
    stopScanning();
    if (onScanSuccess) {
      onScanSuccess(decodedText);
    }
    if (onClose) {
      onClose();
    }
  };

  const handleClose = async () => {
    await stopScanning();
    if (onClose) {
      onClose();
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Use html5-qrcode to scan from file
    try {
      const qrCode = new Html5Qrcode('qr-reader');
      qrCode.scanFile(file, true)
        .then((decodedText) => {
          handleScanSuccess(decodedText);
        })
        .catch((err) => {
          setError('Could not read QR code from image. Please try again or use manual entry.');
          console.error('QR scan error:', err);
        });
    } catch (err) {
      setError('QR scanner library not available. Please use manual entry.');
      console.error('QR scanner error:', err);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          maxWidth: 420,
        },
      }}
    >
      <DialogTitle>
        <Stack direction="row" spacing={1} alignItems="center">
          <QrCode2RoundedIcon sx={{ color: EV.orange }} />
          <Typography variant="h6" fontWeight={700}>
            {title}
          </Typography>
        </Stack>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} alignItems="center" sx={{ py: 2 }}>
          {error && (
            <Alert severity="error" sx={{ width: '100%' }}>
              {error}
            </Alert>
          )}

          {hasPermission === null && !error && (
            <Box sx={{ textAlign: 'center' }}>
              <CircularProgress size={40} />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Checking camera permissions...
              </Typography>
            </Box>
          )}

          {hasPermission === false && !error && (
            <Box sx={{ textAlign: 'center' }}>
              <CameraAltOutlinedIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Camera access is required to scan QR codes.
              </Typography>
              <Button
                variant="outlined"
                onClick={() => {
                  navigator.mediaDevices?.getUserMedia({ video: true })
                    .then(() => {
                      setHasPermission(true);
                      setError(null);
                    })
                    .catch(() => {
                      setError('Please enable camera access in your browser settings.');
                    });
                }}
              >
                Request Permission
              </Button>
            </Box>
          )}

          {/* QR Code Scanner Container */}
          <Box
            id="qr-reader"
            sx={{
              width: '100%',
              minHeight: 300,
              display: scanning ? 'block' : 'none',
              borderRadius: 1,
              overflow: 'hidden',
              bgcolor: '#000',
            }}
          />

          {hasPermission && !scanning && !error && (
            <Box sx={{ textAlign: 'center' }}>
              <QrCode2RoundedIcon sx={{ fontSize: 72, color: EV.orange, mb: 2 }} />
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Position the QR code within the camera view
              </Typography>
              <Button
                variant="contained"
                startIcon={<CameraAltOutlinedIcon />}
                onClick={startScanning}
                sx={{
                  bgcolor: EV.orange,
                  color: '#fff',
                  '&:hover': { bgcolor: EV.orange },
                }}
              >
                Start Camera Scanner
              </Button>
            </Box>
          )}

          {hasPermission && (
            <Box sx={{ width: '100%', textAlign: 'center', pt: 2, borderTop: '1px solid #eee' }}>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                Or scan from an image file
              </Typography>
              <Button
                variant="outlined"
                component="label"
                startIcon={<CameraAltOutlinedIcon />}
                sx={{ borderRadius: 1.5 }}
              >
                Choose Image
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleFileUpload}
                />
              </Button>
            </Box>
          )}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 2, pb: 2 }}>
        <Button onClick={handleClose} sx={{ borderRadius: 1.5 }}>
          {scanning ? 'Stop & Close' : 'Close'}
        </Button>
        {scanning && (
          <Button
            onClick={stopScanning}
            variant="outlined"
            sx={{ borderRadius: 1.5 }}
          >
            Stop Scanning
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

