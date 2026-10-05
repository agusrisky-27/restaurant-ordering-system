import React from 'react';
import './Card.css';

export function Card({
  title,
  subtitle,
  action,
  icon,
  children,
  footer,
  className = '',
  hoverable = false,
  onClick,
  ...props
}) {
  const hasHeader = title || subtitle || action || icon;

  return (
    <div
      className={`card ${hoverable ? 'card-hoverable' : ''} ${className}`}
      onClick={onClick}
      {...props}
    >
      {hasHeader && (
        <div className="card-header">
          <div className="card-title-group">
            {icon && <div className="card-header-icon">{icon}</div>}
            <div>
              {title && <h3 className="card-title">{title}</h3>}
              {subtitle && <p className="card-subtitle">{subtitle}</p>}
            </div>
          </div>
          {action && <div className="card-header-action">{action}</div>}
        </div>
      )}

      <div className="card-body">{children}</div>

      {footer && <div className="card-footer">{footer}</div>}
    </div>
  );
}
