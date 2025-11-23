import React, { useState } from 'react';
import {
  Box,
  Paper,
  Stack,
  TextField,
  Button,
  IconButton,
  Typography,
  Snackbar,
  Alert
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { EV } from '../../utils/theme';

export default function OCPPPanel({
  serverUrl,
  stationId,
  stationPass,
  onDone
}) {
  const [snack, setSnack] = useState({ open: false, msg: '' });

  const copy = async (text, msg) => {
    try {
      await navigator.clipboard.writeText(text);
      setSnack({ open: true, msg });
    } catch (_) {
      setSnack({ open: true, msg: 'Copy failed' });
    }
  };

  const copyAll = () => {
    const bundle = `Server: ${serverUrl}
Station ID: ${stationId}
Password: ${stationPass}`;
    copy(bundle, 'All fields copied');
  };

  return (
    <>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
        Enter these into your charger's OCPP settings panel. Tap the copy icons for each.
      </Typography>
      <Paper
        elevation={0}
        sx={{ p: 2, borderRadius: 1.5, bgcolor: '#fff', border: `1px solid ${EV.divider}` }}
      >
        <Stack spacing={1.5}>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Server URL
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <TextField fullWidth value={serverUrl} InputProps={{ readOnly: true }} size="small" />
              <IconButton
                color="secondary"
                onClick={() => copy(serverUrl, 'Server URL copied')}
                aria-label="Copy server"
                size="small"
              >
                <ContentCopyIcon />
              </IconButton>
            </Stack>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Charger Station ID
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <TextField fullWidth value={stationId} InputProps={{ readOnly: true }} size="small" />
              <IconButton
                color="secondary"
                onClick={() => copy(stationId, 'Station ID copied')}
                aria-label="Copy station id"
                size="small"
              >
                <ContentCopyIcon />
              </IconButton>
            </Stack>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Charger Station Password
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <TextField
                fullWidth
                value={stationPass}
                type="password"
                InputProps={{ readOnly: true }}
                size="small"
              />
              <IconButton
                color="secondary"
                onClick={() => copy(stationPass, 'Password copied')}
                aria-label="Copy password"
                size="small"
              >
                <ContentCopyIcon />
              </IconButton>
            </Stack>
          </Box>
        </Stack>
      </Paper>

      <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
        <Button
          fullWidth
          size="large"
          variant="contained"
          color="secondary"
          onClick={copyAll}
          sx={{
            py: 1.1,
            color: 'common.white',
            '&:hover': { bgcolor: 'secondary.dark', color: 'common.white' }
          }}
        >
          Copy all
        </Button>
        <Button
          fullWidth
          size="large"
          variant="contained"
          color="secondary"
          onClick={onDone}
          sx={{
            py: 1.1,
            color: 'common.white',
            '&:hover': { bgcolor: 'secondary.dark', color: 'common.white' }
          }}
        >
          I've configured it
        </Button>
      </Stack>

      <Snackbar
        open={snack.open}
        autoHideDuration={1600}
        onClose={() => setSnack({ open: false, msg: '' })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" sx={{ width: '100%' }}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </>
  );
}

