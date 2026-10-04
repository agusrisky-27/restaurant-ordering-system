import React, { createContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize session on mount
  useEffect(() => {
    try {
      const savedUser = authService.getCurrentUser();
      const hasToken = authService.isAuthenticated();

      if (hasToken && savedUser) {
        setUser(savedUser);
      } else {
        setUser(null);
      }
    } catch (e) {
      console.error('Failed to restore auth session:', e);
      setUser(null);
    } finally {
      setLoading(false);
    }

    // Global unauthorized listener from apiClient
    const handleUnauthorized = () => {
      setUser(null);
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  const login = useCallback(async ({ email, password, rememberMe }) => {
    const data = await authService.login({ email, password, rememberMe });
    setUser(data.user);
    return data;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
    }
  }, []);

  const value = {
    user,
    isAuthenticated: Boolean(user),
    loading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
