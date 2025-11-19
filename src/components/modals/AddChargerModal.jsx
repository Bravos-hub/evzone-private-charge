import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  Box,
  Typography
} from '@mui/material';
import AddPhotoAlternateRoundedIcon from '@mui/icons-material/AddPhotoAlternateRounded';

export default function AddChargerModal({
  open,
  onClose,
  onStartOnboarding,
  onAddCharger
}) {
  const [form, setForm] = useState({
    name: '',
    id: '',
    photo: null,
    preview: ''
  });

  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setForm(prev => ({ ...prev, photo: file, preview: url }));
    }
  };

  const handleContinue = () => {
    if (onStartOnboarding) {
      onStartOnboarding({
        name: form.name,
        id: form.id,
        photo: form.photo,
        previewUrl: form.preview
      });
    } else if (onAddCharger) {
      onAddCharger({
        name: form.name,
        id: form.id,
        photo: form.photo
      });
    } else {
      console.info('Navigate to: Add Charger', form);
    }
    handleClose();
  };

  const handleClose = () => {
    setForm({ name: '', id: '', photo: null, preview: '' });
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Add charger</DialogTitle>
      <DialogContent>
        <Stack spacing={1.25} sx={{ pt: 1 }}>
          <TextField
            label="Charger name"
            value={form.name}
            onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
            fullWidth
            required
          />
          <TextField
            label="Charger ID / Serial"
            value={form.id}
            onChange={(e) => setForm(prev => ({ ...prev, id: e.target.value }))}
            fullWidth
            required
          />
          <Stack direction="row" spacing={1} alignItems="center">
            <Button
              component="label"
              variant="outlined"
              startIcon={<AddPhotoAlternateRoundedIcon />}
              sx={{
                '&:hover': {
                  bgcolor: 'secondary.main',
                  color: 'common.white',
                  borderColor: 'secondary.main'
                }
              }}
            >
              Take/Upload photo
              <input
                type="file"
                accept="image/*"
                capture="environment"
                hidden
                onChange={handleFileChange}
              />
            </Button>
            {form.preview && (
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: 1,
                  overflow: 'hidden',
                  border: '1px solid #eef3f1'
                }}
              >
                <img
                  src={form.preview}
                  alt="preview"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </Box>
            )}
          </Stack>
          <Typography variant="caption" color="text.secondary">
            You'll continue to quick setup.
          </Typography>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          variant="contained"
          color="secondary"
          onClick={handleContinue}
          disabled={!form.name || !form.id}
          sx={{ color: 'common.white' }}
        >
          Continue → Setup
        </Button>
      </DialogActions>
    </Dialog>
  );
}

