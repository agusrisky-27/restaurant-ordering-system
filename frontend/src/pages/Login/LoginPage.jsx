import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, LogIn, ChefHat, Sparkles, CheckCircle2 } from 'lucide-react';
import { Input } from '../../components/common/Input/Input';
import { Button } from '../../components/common/Button/Button';
import { Alert } from '../../components/common/Alert/Alert';
import { useAuth } from '../../hooks/useAuth';
import { validateLoginForm } from '../../utils/validators';
import { storage } from '../../utils/storage';
import { STORAGE_KEYS } from '../../utils/constants';
import './LoginPage.css';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [successNotice, setSuccessNotice] = useState(null);

  // If already logged in, redirect to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      const target = location.state?.from?.pathname || '/dashboard';
      navigate(target, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  // Load remembered email on mount
  useEffect(() => {
    const rememberedEmail = storage.get(STORAGE_KEYS.REMEMBER_EMAIL, '');
    if (rememberedEmail) {
      setFormData((prev) => ({
        ...prev,
        email: rememberedEmail,
        rememberMe: true,
      }));
    }
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;

    setFormData((prev) => ({ ...prev, [name]: newValue }));

    // Clear field-specific error as user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
    if (authError) {
      setAuthError(null);
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));

    // Field-level validation on blur
    const { errors: formErrors } = validateLoginForm(formData);
    if (formErrors[name]) {
      setErrors((prev) => ({ ...prev, [name]: formErrors[name] }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthError(null);
    setSuccessNotice(null);

    // Mark all touched
    setTouched({ email: true, password: true });

    // Validate
    const { isValid, errors: formErrors } = validateLoginForm(formData);
    if (!isValid) {
      setErrors(formErrors);
      return;
    }

    setIsLoading(true);

    try {
      await login({
        email: formData.email,
        password: formData.password,
        rememberMe: formData.rememberMe,
      });

      setSuccessNotice('Login successful! Redirecting to floor dashboard...');
      setTimeout(() => {
        const target = location.state?.from?.pathname || '/dashboard';
        navigate(target, { replace: true });
      }, 400);
    } catch (err) {
      setAuthError(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  // Quick fill helper for testing
  const handleQuickFill = (email, password) => {
    setFormData((prev) => ({
      ...prev,
      email,
      password,
    }));
    setErrors({});
    setAuthError(null);
  };

  return (
    <div className="login-card animate-fade-in">
      <div className="login-header">
        <div className="login-icon-badge">
          <ChefHat size={28} />
        </div>
        <h2 className="login-title">Staff Portal</h2>
        <p className="login-subtitle">
          Sign in to access restaurant ordering, kitchen display, and floor management.
        </p>
      </div>

      {authError && (
        <Alert
          type="error"
          title="Sign-in Error"
          message={authError}
          onClose={() => setAuthError(null)}
          className="login-alert"
        />
      )}

      {successNotice && (
        <Alert
          type="success"
          title="Welcome Back"
          message={successNotice}
          className="login-alert"
        />
      )}

      <form onSubmit={handleSubmit} className="login-form" noValidate>
        {/* Email Field */}
        <Input
          id="email"
          name="email"
          type="email"
          label="Staff Email Address"
          placeholder="e.g. admin@bistro.com"
          value={formData.email}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.email ? errors.email : null}
          leftIcon={<Mail size={18} />}
          required
          autoComplete="email"
          disabled={isLoading}
        />

        {/* Password Field with Show/Hide toggle */}
        <Input
          id="password"
          name="password"
          type="password"
          label="Password"
          placeholder="••••••••"
          value={formData.password}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.password ? errors.password : null}
          leftIcon={<Lock size={18} />}
          required
          autoComplete="current-password"
          disabled={isLoading}
        />

        {/* Remember Me & Help */}
        <div className="login-options-row">
          <label className="remember-me-checkbox">
            <input
              type="checkbox"
              name="rememberMe"
              checked={formData.rememberMe}
              onChange={handleChange}
              disabled={isLoading}
            />
            <span className="checkbox-custom" />
            <span className="checkbox-label">Remember my email</span>
          </label>

          <button
            type="button"
            className="forgot-password-link"
            onClick={() =>
              alert(
                'Password recovery: Contact the Restaurant Administrator or use demo credentials below.'
              )
            }
          >
            Forgot password?
          </button>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          isLoading={isLoading}
          leftIcon={!isLoading && <LogIn size={18} />}
        >
          {isLoading ? 'Verifying Credentials...' : 'Sign In to POS'}
        </Button>
      </form>

      {/* Demo Credentials Quick Switcher */}
      <div className="demo-credentials-box">
        <div className="demo-header">
          <Sparkles size={14} className="text-primary" />
          <span className="demo-title">TEST MOCK CREDENTIALS</span>
        </div>
        <p className="demo-hint">Click any role below to prefill test credentials:</p>
        <div className="demo-chips">
          <button
            type="button"
            className="demo-chip"
            onClick={() => handleQuickFill('admin@bistro.com', 'password123')}
          >
            <span className="demo-chip-role">Admin / Chef</span>
            <span className="demo-chip-email">admin@bistro.com</span>
          </button>

          <button
            type="button"
            className="demo-chip"
            onClick={() => handleQuickFill('manager@bistro.com', 'password123')}
          >
            <span className="demo-chip-role">Floor Manager</span>
            <span className="demo-chip-email">manager@bistro.com</span>
          </button>

          <button
            type="button"
            className="demo-chip"
            onClick={() => handleQuickFill('waiter@bistro.com', 'password123')}
          >
            <span className="demo-chip-role">Server</span>
            <span className="demo-chip-email">waiter@bistro.com</span>
          </button>
        </div>
      </div>
    </div>
  );
}
