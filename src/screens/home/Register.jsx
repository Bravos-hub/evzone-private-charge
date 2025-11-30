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

export default function RegisterScreen() {
  const navigate = useNavigate();
  const { register, loading: authLoading, error: authError } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    const result = await register(
      formData.email,
      formData.password,
      formData.firstName,
      formData.lastName
    );

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
          EVzone — Register
        </Typography>

        {(error || authError) && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error || authError}
          </Alert>
        )}

        <Box component="form" onSubmit={handleRegister}>
          <TextField
            fullWidth
            label="First Name"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            margin="normal"
            required
            disabled={loading || authLoading}
          />

          <TextField
            fullWidth
            label="Last Name"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            margin="normal"
            required
            disabled={loading || authLoading}
          />

          <TextField
            fullWidth
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            margin="normal"
            required
            disabled={loading || authLoading}
          />

          <TextField
            fullWidth
            label="Password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            margin="normal"
            required
            disabled={loading || authLoading}
          />

          <TextField
            fullWidth
            label="Confirm Password"
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
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
            {loading || authLoading ? <CircularProgress size={24} /> : 'Register'}
          </Button>

          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2">
              Already have an account?{' '}
              <Button
                size="small"
                onClick={() => navigate('/')}
                disabled={loading || authLoading}
              >
                Login
              </Button>
            </Typography>
          </Box>
        </Box>
      </Card>
    </Container>
  );
}
