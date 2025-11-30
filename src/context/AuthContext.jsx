import React, { createContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load token from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));

      // Set default Authorization header
      api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
    }

    setLoading(false);
  }, []);

  const register = useCallback(async (email, password, firstName, lastName) => {
    try {
      setError(null);
      const response = await api.post('/auth/register', {
        email,
        password,
        firstName,
        lastName,
      });

      const { data } = response.data;

      setToken(data.token);
      setUser(data.user);

      localStorage.setItem('authToken', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;

      return { success: true, user: data.user };
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed';
      setError(message);
      return { success: false, error: message };
    }
  }, []);

  const login = useCallback(async (email, password) => {
    try {
      setError(null);
      const response = await api.post('/auth/login', { email, password });

      const { data } = response.data;

      setToken(data.token);
      setUser(data.user);

      localStorage.setItem('authToken', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;

      return { success: true, user: data.user };
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed';
      setError(message);
      return { success: false, error: message };
    }
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    setError(null);

    localStorage.removeItem('authToken');
    localStorage.removeItem('user');

    delete api.defaults.headers.common['Authorization'];
  }, []);

  const refreshToken = useCallback(async () => {
    if (!token) return false;

    try {
      const response = await api.post('/auth/refresh');
      const newToken = response.data.data.token;

      setToken(newToken);
      localStorage.setItem('authToken', newToken);
      api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

      return true;
    } catch (err) {
      logout();
      return false;
    }
  }, [token, logout]);

  const value = {
    user,
    token,
    loading,
    error,
    isAuthenticated: !!token,
    register,
    login,
    logout,
    refreshToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
