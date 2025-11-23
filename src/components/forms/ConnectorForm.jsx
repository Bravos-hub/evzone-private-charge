import React from 'react';
import {
  Box,
  Paper,
  Stack,
  TextField,
  Button,
  IconButton,
  Tooltip,
  MenuItem,
  Typography
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { EV } from '../../utils/theme';
import { CONNECTOR_TYPES } from '../../utils/constants';

export default function ConnectorForm({
  connectors = [],
  onAdd,
  onUpdate,
  onRemove
}) {
  const handleAdd = () => {
    const newConnector = {
      id: Date.now(),
      label: `A${connectors.length + 1}`,
      type: 'Type 2',
      powerKw: ''
    };
    onAdd(newConnector);
  };

  const handleUpdate = (id, field) => (e) => {
    onUpdate(id, { [field]: e.target.value });
  };

  const handleRemove = (id) => {
    if (connectors.length > 1) {
      onRemove(id);
    }
  };

  return (
    <Box>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
        <Typography variant="subtitle2" fontWeight={800}>
          Connectors (ports)
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Add one or more ports if this unit has multiple connectors.
        </Typography>
      </Stack>
      <Stack spacing={1}>
        {connectors.map((connector) => (
          <Paper
            key={connector.id}
            variant="outlined"
            sx={{ p: 1.25, borderRadius: 2, border: `1px solid ${EV.divider}` }}
          >
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
              <TextField
                label="Label / Port ID"
                value={connector.label}
                onChange={handleUpdate(connector.id, 'label')}
                sx={{ flex: 1 }}
                size="small"
              />
              <TextField
                select
                label="Type"
                value={connector.type}
                onChange={handleUpdate(connector.id, 'type')}
                sx={{ flex: 1 }}
                size="small"
              >
                {CONNECTOR_TYPES.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="Power (kW)"
                type="number"
                inputMode="decimal"
                value={connector.powerKw}
                onChange={handleUpdate(connector.id, 'powerKw')}
                sx={{ flex: 1 }}
                size="small"
              />
              <Tooltip
                title={connectors.length <= 1 ? 'At least one connector' : 'Remove this connector'}
              >
                <span>
                  <IconButton
                    color="error"
                    onClick={() => handleRemove(connector.id)}
                    disabled={connectors.length <= 1}
                    aria-label="Remove connector"
                    size="small"
                  >
                    <DeleteOutlineIcon />
                  </IconButton>
                </span>
              </Tooltip>
            </Stack>
          </Paper>
        ))}
        <Button
          startIcon={<AddCircleOutlineIcon />}
          onClick={handleAdd}
          variant="outlined"
          sx={{ alignSelf: 'flex-start' }}
        >
          Add connector
        </Button>
      </Stack>
    </Box>
  );
}

