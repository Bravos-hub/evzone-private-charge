import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material';
import LaunchRoundedIcon from '@mui/icons-material/LaunchRounded';

export default function SwitchCommercialModal({
  open,
  onClose,
  oldId,
  newId,
  aggregatorUrl,
  onConfirmSwitchCommercial,
  onOpenAggregator,
  onCheckActivePublicSessions
}) {
  const [checking, setChecking] = useState(false);

  const confirm = async () => {
    if (onCheckActivePublicSessions) {
      setChecking(true);
      const hasActive = await onCheckActivePublicSessions(oldId);
      setChecking(false);
      if (hasActive) {
        console.info('Cannot switch while a public session is active.');
        return;
      }
    }
    if (onConfirmSwitchCommercial) {
      onConfirmSwitchCommercial({ oldId, newId });
    } else {
      console.info('Switch Commercial Charger', { oldId, newId });
    }
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Switch Commercial Charger?</DialogTitle>
      <DialogContent>
        <Typography variant="body2" sx={{ mb: 1 }}>
          You can have only one Commercial Charger. Switching will:
        </Typography>
        <ul style={{ margin: 0, paddingInlineStart: 18 }}>
          <li>Move public listing to the new charger</li>
          <li>Disable future bookings on the old charger</li>
          <li>Require no active public session on the old charger</li>
        </ul>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
          Need more than one? Manage unlimited commercial stations with EVzone Aggregator &amp; CPMS.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          startIcon={<LaunchRoundedIcon />}
          onClick={() => {
            if (onOpenAggregator) {
              onOpenAggregator(aggregatorUrl);
            } else {
              console.info('Open Aggregator', aggregatorUrl);
            }
          }}
        >
          Open Aggregator
        </Button>
        <Button
          variant="contained"
          color="secondary"
          disabled={checking}
          onClick={confirm}
          sx={{ color: 'common.white' }}
        >
          {checking ? 'Checking…' : 'Confirm switch'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

