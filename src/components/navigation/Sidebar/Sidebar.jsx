import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  UtensilsCrossed,
  Grid,
  ShoppingBag,
  History,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Flame,
} from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import './Sidebar.css';

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/orders', label: 'Orders', icon: ShoppingBag, badge: '5' },
  { path: '/menu', label: 'Menu Items', icon: UtensilsCrossed },
  { path: '/tables', label: 'Tables Floor', icon: Grid },
  { path: '/history', label: 'Order History', icon: History },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar({ isCollapsed, onToggleCollapse, isMobileOpen, onCloseMobile }) {
  const { user, logout } = useAuth();

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div className="sidebar-backdrop" onClick={onCloseMobile} aria-hidden="true" />
      )}

      <aside
        className={`app-sidebar ${isCollapsed ? 'is-collapsed' : ''} ${
          isMobileOpen ? 'is-mobile-open' : ''
        }`}
      >
        {/* Brand header */}
        <div className="sidebar-brand">
          <div className="brand-logo-container">
            <span className="brand-emoji">🍽️</span>
          </div>
          {!isCollapsed && (
            <div className="brand-info">
              <span className="brand-title">Savory Bistro</span>
              <span className="brand-badge">POS & KITCHEN</span>
            </div>
          )}
          <button
            type="button"
            className="sidebar-collapse-btn desktop-only"
            onClick={onToggleCollapse}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        {/* Navigation links */}
        <nav className="sidebar-nav">
          <div className="nav-section-title">{!isCollapsed ? 'MAIN MENU' : '•••'}</div>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  `sidebar-link ${isActive ? 'is-active' : ''}`
                }
                title={isCollapsed ? item.label : undefined}
              >
                <div className="sidebar-link-icon">
                  <Icon size={20} />
                </div>
                {!isCollapsed && <span className="sidebar-link-text">{item.label}</span>}
                {!isCollapsed && item.badge && (
                  <span className="sidebar-badge">{item.badge}</span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Live Kitchen Status Banner */}
        {!isCollapsed && (
          <div className="sidebar-kitchen-status">
            <div className="kitchen-status-header">
              <Flame size={16} className="text-orange-500 animate-pulse" />
              <span className="kitchen-status-title">Kitchen Live</span>
            </div>
            <p className="kitchen-status-text">Average prep: 14 mins</p>
          </div>
        )}

        {/* User Profile & Logout footer */}
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="user-avatar">{user?.avatar || '👨‍🍳'}</div>
            {!isCollapsed && (
              <div className="user-details">
                <span className="user-name">{user?.name || 'Chef Admin'}</span>
                <span className="user-role">{user?.role || 'Administrator'}</span>
              </div>
            )}
          </div>
          <button
            type="button"
            className="logout-btn"
            onClick={logout}
            title="Log Out"
            aria-label="Log Out"
          >
            <LogOut size={18} />
          </button>
        </div>
      </aside>
    </>
  );
}
