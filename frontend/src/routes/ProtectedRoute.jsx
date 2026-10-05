import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        height: '100vh',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '16px',
        backgroundColor: '#f8fafc',
        fontFamily: 'system-ui, sans-serif'
      }}>
        <div className="btn-spinner" style={{ width: 36, height: 36, borderTopColor: '#f97316' }} />
        <p style={{ color: '#64748b', fontSize: '14px', fontWeight: 600 }}>
          Initializing POS terminal session...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
