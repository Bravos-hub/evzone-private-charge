import React, { useState } from 'react';
import {
  Container,
  Box,
  Button,
  TextField,
  Typography,
  Card,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function LoginScreen() {
  const navigate = useNavigate();
  const { login, loading: authLoading, error: authError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Card sx={{ p: 4 }}>
        <Typography variant="h4" align="center" sx={{ mb: 3 }}>
          EVzone — Login
        </Typography>

        {(error || authError) && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error || authError}
          </Alert>
        )}

        <Box component="form" onSubmit={handleLogin}>
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            margin="normal"
            required
            disabled={loading || authLoading}
          />

          <TextField
            fullWidth
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
            required
            disabled={loading || authLoading}
          />

          <Button
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            type="submit"
            disabled={loading || authLoading}
          >
            {loading || authLoading ? <CircularProgress size={24} /> : 'Login'}
          </Button>

          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2">
              Don't have an account?{' '}
              <Button
                size="small"
                onClick={() => navigate('/register')}
                disabled={loading || authLoading}
              >
                Register
              </Button>
            </Typography>
          </Box>
        </Box>

        {/* Test credentials */}
        <Box sx={{ mt: 4, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
          <Typography variant="caption" display="block">
            Test Credentials:
          </Typography>
          <Typography variant="caption">
            Email: admin@evzone.com
          </Typography>
          <Typography variant="caption">
            Password: password123
          </Typography>
        </Box>
      </Card>
    </Container>
  );
}
