import React from 'react';
import { Navigate } from 'react-router-dom';

export default function PrivateRoute({ children }) {
  // TODO: Implement actual authentication check
  // Temporarily allow all routes to prevent redirect loops
  const isAuthenticated = true; // localStorage.getItem('authToken') !== null;
  
  return isAuthenticated ? children : <Navigate to="/" replace />;
}

