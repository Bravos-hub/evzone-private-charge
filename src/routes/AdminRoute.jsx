import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useAuthorization } from '../hooks/useAuthorization';
import { CircularProgress, Box } from '@mui/material';

export default function AdminRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  const { isTenantAdmin } = useAuthorization();

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (!isTenantAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
