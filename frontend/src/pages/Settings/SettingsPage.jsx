import React, { useState, useEffect } from 'react';
import {
  Save,
  Server,
  Store,
  Printer,
  Bell,
  Code2,
  CheckCircle,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';
import { Input } from '../../components/common/Input/Input';
import { Button } from '../../components/common/Button/Button';
import { Card } from '../../components/common/Card/Card';
import { Alert } from '../../components/common/Alert/Alert';
import { Badge } from '../../components/common/Badge/Badge';
import { settingsService } from '../../services/settingsService';
import { API_BASE_URL } from '../../services/api/apiClient';
import './SettingsPage.css';

export function SettingsPage() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [apiPingStatus, setApiPingStatus] = useState(null);
  const [pingingApi, setPingingApi] = useState(false);

  const isMockMode = import.meta.env.VITE_USE_MOCK !== 'false';

  useEffect(() => {
    async function loadSettings() {
      try {
        setLoading(true);
        const data = await settingsService.getSettings();
        setSettings(data);
      } catch (err) {
        console.error('Failed to load settings:', err);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleChange = (field, value) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
    setSaveSuccess(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await settingsService.updateSettings(settings);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      alert(`Failed to save settings: ${err.message}`);
    }
  };

  const handleTestApiConnection = async () => {
    setPingingApi(true);
    setApiPingStatus(null);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);

      const response = await fetch(`${API_BASE_URL}/health`, {
        signal: controller.signal,
      }).catch((e) => ({ ok: false, error: e.message }));
      clearTimeout(timeoutId);

      if (response && response.ok) {
        setApiPingStatus({ success: true, message: `Connected to ${API_BASE_URL} successfully!` });
      } else {
        setApiPingStatus({
          success: false,
          message: `Backend at ${API_BASE_URL} is currently offline. Mock data layer remains active and fully functional.`,
        });
      }
    } catch (e) {
      setApiPingStatus({
        success: false,
        message: `Could not reach ${API_BASE_URL}. Mock service fallback active.`,
      });
    } finally {
      setPingingApi(false);
    }
  };

  if (loading || !settings) {
    return (
      <div className="page-container">
        <div className="dashboard-loading-state">
          <div className="btn-spinner" style={{ width: 28, height: 28 }} />
          <p>Loading restaurant configuration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Restaurant & System Settings</h1>
          <p className="page-subtitle">Configure tax rates, kitchen options, and REST backend API endpoints.</p>
        </div>
        <Button
          variant="primary"
          leftIcon={<Save size={16} />}
          onClick={handleSave}
        >
          Save All Settings
        </Button>
      </div>

      {saveSuccess && (
        <Alert
          type="success"
          title="Settings Saved"
          message="Restaurant profile and POS preferences have been updated."
          onClose={() => setSaveSuccess(false)}
          className="settings-alert"
        />
      )}

      <div className="settings-grid">
        {/* Left Column: Restaurant Profile & POS Config */}
        <div className="settings-left-col">
          <Card
            title="Restaurant Profile"
            subtitle="Business name and address for receipts"
            icon={<Store size={18} />}
          >
            <div className="settings-form-section">
              <Input
                label="Restaurant Name"
                value={settings.restaurantName}
                onChange={(e) => handleChange('restaurantName', e.target.value)}
              />
              <Input
                label="Tagline / Cuisine"
                value={settings.tagline}
                onChange={(e) => handleChange('tagline', e.target.value)}
              />
              <div className="form-two-cols">
                <Input
                  label="Contact Phone"
                  value={settings.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                />
                <Input
                  label="Contact Email"
                  value={settings.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                />
              </div>
              <Input
                label="Physical Address"
                value={settings.address}
                onChange={(e) => handleChange('address', e.target.value)}
              />
            </div>
          </Card>

          <Card
            title="Tax, Service Charges & Operations"
            subtitle="Financial rates applied to order checks"
            icon={<Printer size={18} />}
          >
            <div className="settings-form-section">
              <div className="form-two-cols">
                <Input
                  label="Sales Tax Rate (%)"
                  type="number"
                  step="0.1"
                  value={settings.taxRate}
                  onChange={(e) => handleChange('taxRate', parseFloat(e.target.value))}
                />
                <Input
                  label="Service Charge Rate (%)"
                  type="number"
                  step="0.1"
                  value={settings.serviceChargeRate}
                  onChange={(e) =>
                    handleChange('serviceChargeRate', parseFloat(e.target.value))
                  }
                />
              </div>

              <div className="settings-checkboxes">
                <label className="remember-me-checkbox">
                  <input
                    type="checkbox"
                    checked={settings.enableKitchenSoundAlerts}
                    onChange={(e) =>
                      handleChange('enableKitchenSoundAlerts', e.target.checked)
                    }
                  />
                  <span className="checkbox-custom" />
                  <span className="checkbox-label">
                    Play audio chime on incoming kitchen tickets
                  </span>
                </label>

                <label className="remember-me-checkbox">
                  <input
                    type="checkbox"
                    checked={settings.autoPrintReceipts}
                    onChange={(e) =>
                      handleChange('autoPrintReceipts', e.target.checked)
                    }
                  />
                  <span className="checkbox-custom" />
                  <span className="checkbox-label">
                    Automatically trigger receipt print on payment settlement
                  </span>
                </label>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Backend Architecture & API Config */}
        <div className="settings-right-col">
          <Card
            title="REST API Backend Integration"
            subtitle="Architectural connection point for future backend"
            icon={<Server size={18} />}
          >
            <div className="api-integration-card-content">
              <div className="api-status-banner">
                <div>
                  <span className="api-status-label">Active Connection Mode:</span>
                  <div className="api-badge-row">
                    <Badge variant={isMockMode ? 'warning' : 'success'} size="md" dot>
                      {isMockMode ? 'Mock Service Provider Active' : 'Live REST API Connected'}
                    </Badge>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  isLoading={pingingApi}
                  onClick={handleTestApiConnection}
                >
                  Ping Backend
                </Button>
              </div>

              {apiPingStatus && (
                <Alert
                  type={apiPingStatus.success ? 'success' : 'info'}
                  title={apiPingStatus.success ? 'Server Responding' : 'Offline / Standalone Mode'}
                  message={apiPingStatus.message}
                  onClose={() => setApiPingStatus(null)}
                />
              )}

              <div className="api-config-field">
                <span className="api-field-title">Configured Base URL</span>
                <code className="api-code-block">{API_BASE_URL}</code>
                <span className="api-field-hint">
                  Read from <code>VITE_API_BASE_URL</code> in <code>.env</code>
                </span>
              </div>

              <div className="api-integration-guide">
                <h4 className="guide-title">
                  <Code2 size={16} /> How to Connect Your Real Backend
                </h4>
                <ol className="guide-steps">
                  <li>
                    <strong>Step 1: Set environment variable</strong>
                    <br />
                    In <code>.env</code>, set <code>VITE_USE_MOCK=false</code> and configure <code>VITE_API_BASE_URL=http://localhost:5000/api</code>.
                  </li>
                  <li>
                    <strong>Step 2: API Client automatic token management</strong>
                    <br />
                    All HTTP requests go through <code>src/services/api/apiClient.js</code> which automatically attaches <code>Authorization: Bearer &lt;token&gt;</code> and handles 401 unauth session invalidations.
                  </li>
                  <li>
                    <strong>Step 3: Route endpoints map</strong>
                    <br />
                    Endpoints are centrally mapped in <code>src/services/api/apiEndpoints.js</code>, matching standard REST conventions.
                  </li>
                </ol>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
