import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthLayout } from '../layouts/AuthLayout';
import { MainLayout } from '../layouts/MainLayout';
import { ProtectedRoute } from './ProtectedRoute';

// Pages
import { LoginPage } from '../pages/Login/LoginPage';
import { DashboardPage } from '../pages/Dashboard/DashboardPage';
import { MenuPage } from '../pages/Menu/MenuPage';
import { TablesPage } from '../pages/Tables/TablesPage';
import { OrdersPage } from '../pages/Orders/OrdersPage';
import { OrderDetailPage } from '../pages/OrderDetail/OrderDetailPage';
import { OrderHistoryPage } from '../pages/OrderHistory/OrderHistoryPage';
import { SettingsPage } from '../pages/Settings/SettingsPage';

export function AppRoutes() {
  return (
    <Routes>
      {/* Public Authentication Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>

      {/* Protected Restaurant Application Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/menu" element={<MenuPage />} />
          <Route path="/tables" element={<TablesPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/orders/:orderId" element={<OrderDetailPage />} />
          <Route path="/history" element={<OrderHistoryPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
