import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import './Input.css';

export function Input({
  id,
  name,
  label,
  type = 'text',
  value,
  onChange,
  onBlur,
  placeholder,
  error,
  hint,
  leftIcon = null,
  rightIcon = null,
  required = false,
  autoComplete,
  disabled = false,
  className = '',
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false);
  const inputId = id || `input-${name || Math.random().toString(36).substr(2, 9)}`;
  const errorId = `${inputId}-error`;
  const hintId = `${inputId}-hint`;

  const isPassword = type === 'password';
  const effectiveType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className={`input-group ${error ? 'has-error' : ''} ${className}`}>
      {label && (
        <div className="input-label-row">
          <label htmlFor={inputId} className="input-label">
            {label} {required && <span className="input-required-star">*</span>}
          </label>
          {hint && (
            <span id={hintId} className="input-hint">
              {hint}
            </span>
          )}
        </div>
      )}

      <div className="input-wrapper">
        {leftIcon && <span className="input-icon-left">{leftIcon}</span>}

        <input
          id={inputId}
          name={name}
          type={effectiveType}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-describedby={
            [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(' ') || undefined
          }
          className={`input-control ${leftIcon ? 'has-left-icon' : ''} ${
            isPassword || rightIcon ? 'has-right-icon' : ''
          }`}
          {...props}
        />

        {isPassword ? (
          <button
            type="button"
            className="input-password-toggle"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        ) : rightIcon ? (
          <span className="input-icon-right">{rightIcon}</span>
        ) : null}
      </div>

      {error && (
        <div id={errorId} className="input-error-msg" role="alert">
          <span aria-hidden="true">⚠️</span> {error}
        </div>
      )}
    </div>
  );
}
