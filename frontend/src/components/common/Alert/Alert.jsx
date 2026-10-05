import React from 'react';
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';
import './Alert.css';

const ALERT_ICONS = {
  error: AlertCircle,
  success: CheckCircle2,
  info: Info,
  warning: AlertTriangle,
};

export function Alert({
  type = 'info',
  title,
  message,
  children,
  onClose,
  className = '',
}) {
  const IconComponent = ALERT_ICONS[type] || Info;

  return (
    <div className={`alert-banner alert-${type} ${className}`} role="alert">
      <div className="alert-icon-container">
        <IconComponent size={20} />
      </div>

      <div className="alert-content">
        {title && <strong className="alert-title">{title}</strong>}
        {message && <div className="alert-message">{message}</div>}
        {children}
      </div>

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="alert-close-btn"
          aria-label="Dismiss alert"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}
