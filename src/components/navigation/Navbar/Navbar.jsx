import React from 'react';
import { Menu, Bell, Plus, Radio, Server } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../common/Button/Button';
import { useAuth } from '../../../hooks/useAuth';
import './Navbar.css';

export function Navbar({ onOpenMobileSidebar }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isMock = import.meta.env.VITE_USE_MOCK !== 'false';

  return (
    <header className="app-navbar">
      <div className="navbar-left">
        <button
          type="button"
          className="navbar-mobile-toggle"
          onClick={onOpenMobileSidebar}
          aria-label="Open navigation menu"
        >
          <Menu size={22} />
        </button>

        <div className="navbar-status-pill">
          <span className="status-indicator-dot pulse" />
          <span className="navbar-status-text">Restaurant Open • Dinner Shift</span>
        </div>
      </div>

      <div className="navbar-right">
        {/* Backend integration indicator */}
        <div
          className={`api-mode-indicator ${isMock ? 'is-mock' : 'is-connected'}`}
          title={
            isMock
              ? 'Running in Mock Mode. Set VITE_USE_MOCK=false in .env to connect to REST backend.'
              : `Connected to REST API: ${import.meta.env.VITE_API_BASE_URL}`
          }
          onClick={() => navigate('/settings')}
        >
          <Server size={14} />
          <span>{isMock ? 'Mock API Mode' : 'Live API'}</span>
        </div>

        {/* Quick action: New Order */}
        <Button
          size="sm"
          variant="primary"
          leftIcon={<Plus size={16} />}
          onClick={() => navigate('/orders')}
        >
          New Order
        </Button>

        {/* Notification Bell */}
        <button
          type="button"
          className="navbar-icon-btn"
          aria-label="Notifications"
          title="3 Kitchen notifications"
        >
          <Bell size={18} />
          <span className="navbar-bell-dot" />
        </button>

        {/* Current user mini-badge */}
        <div className="navbar-user-chip" onClick={() => navigate('/settings')}>
          <div className="user-avatar-small">{user?.avatar || '👨‍🍳'}</div>
          <span className="navbar-username">{user?.name?.split(' ')[0] || 'Admin'}</span>
        </div>
      </div>
    </header>
  );
}
