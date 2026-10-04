import React from 'react';
import './Badge.css';

export function Badge({
  children,
  variant = 'neutral',
  size = 'md',
  dot = false,
  className = '',
  icon = null,
}) {
  return (
    <span className={`badge badge-${variant} badge-${size} ${className}`}>
      {dot && <span className="badge-dot" aria-hidden="true" />}
      {icon && <span className="badge-icon">{icon}</span>}
      <span className="badge-text">{children}</span>
    </span>
  );
}
