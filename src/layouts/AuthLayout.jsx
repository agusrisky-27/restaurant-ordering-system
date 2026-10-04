import React from 'react';
import { Outlet } from 'react-router-dom';
import './AuthLayout.css';

export function AuthLayout() {
  return (
    <div className="auth-layout">
      <div className="auth-split-left">
        <div className="auth-brand-masthead">
          <div className="auth-brand-logo">🍽️</div>
          <div>
            <h1 className="auth-brand-title">Savory Bistro</h1>
            <p className="auth-brand-tagline">POS & Restaurant Operating System</p>
          </div>
        </div>

        <div className="auth-feature-highlights">
          <div className="feature-item">
            <span className="feature-icon">⚡</span>
            <div>
              <h4 className="feature-title">Real-Time Kitchen Sync</h4>
              <p className="feature-desc">Floor orders sent straight to the chef line instantly.</p>
            </div>
          </div>
          <div className="feature-item">
            <span className="feature-icon">🪑</span>
            <div>
              <h4 className="feature-title">Interactive Floor Map</h4>
              <p className="feature-desc">Visual table occupancy and server turnover tracking.</p>
            </div>
          </div>
          <div className="feature-item">
            <span className="feature-icon">📊</span>
            <div>
              <h4 className="feature-title">Live Revenue Analytics</h4>
              <p className="feature-desc">Monitor shift totals, average covers, and top dishes.</p>
            </div>
          </div>
        </div>

        <div className="auth-left-footer">
          <span>v1.0.0 Enterprise POS Edition</span>
          <span>•</span>
          <span>REST API Ready</span>
        </div>
      </div>

      <div className="auth-split-right">
        <div className="auth-content-box">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
