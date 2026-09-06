import { useState } from 'react';
import authService from '../services/authService';
import { isValidVerhoeff } from '../../../utils/verhoeff';
import './LoginForm.css';

function LoginForm({ onSubmit, error, loading }) {
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // First time temp password flow state
  const [isTempPwMode, setIsTempPwMode] = useState(false);
  const [tempPassword, setTempPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState(1); // 1: Verify Temp Password, 2: Set New Password
  const [tempSuccessMsg, setTempSuccessMsg] = useState(null);
  const [tempErrorMsg, setTempErrorMsg] = useState(null);
  const [tempLoading, setTempLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!loginId || !password) return;
    onSubmit({ loginId, username: loginId, password });
  };

  const handleVerifyTempPassword = async (e) => {
    e.preventDefault();
    if (!loginId || !tempPassword) return;
    setTempLoading(true);
    setTempErrorMsg(null);
    setTempSuccessMsg(null);
    // Verhoeff checksum validation - every login ID must end with a valid Verhoeff check digit.
    if (!isValidVerhoeff(loginId)) {
      setTempErrorMsg('Invalid Login ID: the Verhoeff check digit is incorrect.');
      setTempLoading(false);
      return;
    }
    try {
      const res = await authService.verifyTempPassword(loginId, tempPassword);
      setTempSuccessMsg(res?.data?.message || 'Temp password verified! Enter your new password below.');
      setStep(2);
    } catch (err) {
      setTempErrorMsg(err.response?.data?.message || 'Invalid temp password or login ID');
    } finally {
      setTempLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!loginId || !tempPassword || !newPassword) return;
    setTempLoading(true);
    setTempErrorMsg(null);
    setTempSuccessMsg(null);
    // Verhoeff checksum validation - every login ID must end with a valid Verhoeff check digit.
    if (!isValidVerhoeff(loginId)) {
      setTempErrorMsg('Invalid Login ID: the Verhoeff check digit is incorrect.');
      setTempLoading(false);
      return;
    }
    try {
      const res = await authService.changePassword(loginId, tempPassword, newPassword);
      setTempSuccessMsg(res?.data?.message || 'Password changed successfully! You can now log in.');
      setTimeout(() => {
        setIsTempPwMode(false);
        setPassword(newPassword);
        setStep(1);
        setTempSuccessMsg(null);
      }, 2000);
    } catch (err) {
      setTempErrorMsg(err.response?.data?.message || 'Could not change password');
    } finally {
      setTempLoading(false);
    }
  };

  return (
    <div className="login-screen">
      {/* Left — brand panel (60%) */}
      <div className="login-brand" aria-hidden="true">
        <div className="login-brand-grid" />
        <div className="login-brand-glow login-brand-glow-a" />
        <div className="login-brand-glow login-brand-glow-b" />

        <div className="login-brand-content">
          <div className="login-mark">
            <svg viewBox="0 0 32 32" width="20" height="20" fill="none">
              <path d="M16 2 L29 9 V23 L16 30 L3 23 V9 Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
              <path d="M16 2 V30 M3 9 L29 23 M29 9 L3 23" stroke="currentColor" strokeWidth="1" opacity="0.4" />
            </svg>
          </div>

          <div className="login-brand-copy">
            <h1 className="login-brand-title">Sign in to your workspace</h1>
            <p className="login-brand-subtitle">
              Manage your employees, user accounts, and company operations seamlessly.
            </p>
          </div>

          <ul className="login-brand-features">
            <li>
              <FeatureIcon />
              <span>Multi-tenant routing via 12-digit Login ID</span>
            </li>
            <li>
              <FeatureIcon />
              <span>Encrypted sessions with automatic timeout protection</span>
            </li>
            <li>
              <FeatureIcon />
              <span>Role-based access control (Admin, Employee, User)</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Right — form panel (40%) */}
      <div className="login-panel">
        <div className="login-panel-inner">
          <div className="login-mark login-mark-mobile" aria-hidden="true">
            <svg viewBox="0 0 32 32" width="20" height="20" fill="none">
              <path d="M16 2 L29 9 V23 L16 30 L3 23 V9 Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
              <path d="M16 2 V30 M3 9 L29 23 M29 9 L3 23" stroke="currentColor" strokeWidth="1" opacity="0.4" />
            </svg>
          </div>

          {!isTempPwMode ? (
            <>
              <div className="login-form-header">
                <h2>Welcome back</h2>
                <p>Enter your 12-digit Login ID and password to sign in.</p>
              </div>

              {error && (
                <div className="login-form-error" role="alert">
                  <svg viewBox="0 0 20 20" width="16" height="16" fill="none" aria-hidden="true">
                    <circle cx="10" cy="10" r="8.5" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M10 6.5V10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    <circle cx="10" cy="13.5" r="0.9" fill="currentColor" />
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              <form className="login-form" onSubmit={handleSubmit} noValidate>
                <div className="login-field">
                  <label className="login-label" htmlFor="loginId">
                    12-Digit Login ID
                  </label>
                  <div className="login-input-wrap">
                    <span className="login-input-icon" aria-hidden="true">
                      <svg viewBox="0 0 20 20" width="16" height="16" fill="none">
                        <circle cx="10" cy="6.5" r="3.25" stroke="currentColor" strokeWidth="1.5" />
                        <path d="M3.5 17c1.2-3.4 4-5 6.5-5s5.3 1.6 6.5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                    </span>
                    <input
                      id="loginId"
                      name="loginId"
                      type="text"
                      maxLength={12}
                      autoComplete="username"
                      placeholder="e.g. 100112345678"
                      value={loginId}
                      onChange={(e) => setLoginId(e.target.value)}
                      disabled={loading}
                      required
                    />
                  </div>
                </div>

                <div className="login-field">
                  <label className="login-label" htmlFor="password">
                    Password
                  </label>
                  <div className="login-input-wrap">
                    <span className="login-input-icon" aria-hidden="true">
                      <svg viewBox="0 0 20 20" width="16" height="16" fill="none">
                        <rect x="4.5" y="8.5" width="11" height="8" rx="1.75" stroke="currentColor" strokeWidth="1.5" />
                        <path d="M6.75 8.5V6a3.25 3.25 0 0 1 6.5 0v2.5" stroke="currentColor" strokeWidth="1.5" />
                      </svg>
                    </span>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading}
                      required
                    />
                    <button
                      type="button"
                      className="login-input-toggle"
                      onClick={() => setShowPassword((s) => !s)}
                      disabled={loading}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                  </div>
                </div>

                <label className="login-remember">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    disabled={loading}
                  />
                  <span>Keep me signed in on this device</span>
                </label>

                <button type="submit" className="login-submit" disabled={loading}>
                  {loading && <span className="login-spinner" aria-hidden="true" />}
                  {loading ? 'Signing in…' : 'Sign in'}
                </button>
              </form>

              <div style={{ marginTop: '16px', textAlign: 'center' }}>
                <button
                  type="button"
                  onClick={() => setIsTempPwMode(true)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#38bdf8',
                    cursor: 'pointer',
                    fontSize: '13px',
                    textDecoration: 'underline'
                  }}
                >
                  First time login? Verify Temporary Password
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="login-form-header">
                <h2>Set Permanent Password</h2>
                <p>Verify your one-time temporary password to choose a new password.</p>
              </div>

              {tempErrorMsg && (
                <div className="login-form-error" role="alert">
                  <span>{tempErrorMsg}</span>
                </div>
              )}

              {tempSuccessMsg && (
                <div style={{
                  padding: '10px 14px',
                  backgroundColor: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(16, 185, 129, 0.4)',
                  color: '#34d399',
                  borderRadius: '6px',
                  fontSize: '13px',
                  marginBottom: '16px'
                }}>
                  <span>{tempSuccessMsg}</span>
                </div>
              )}

              {step === 1 ? (
                <form className="login-form" onSubmit={handleVerifyTempPassword}>
                  <div className="login-field">
                    <label className="login-label">12-Digit Login ID</label>
                    <input
                      type="text"
                      maxLength={12}
                      placeholder="Enter 12-digit login ID"
                      value={loginId}
                      onChange={(e) => setLoginId(e.target.value)}
                      required
                    />
                  </div>

                  <div className="login-field">
                    <label className="login-label">Temporary Password</label>
                    <input
                      type="text"
                      placeholder="Enter raw temporary password"
                      value={tempPassword}
                      onChange={(e) => setTempPassword(e.target.value)}
                      required
                    />
                  </div>

                  <button type="submit" className="login-submit" disabled={tempLoading}>
                    {tempLoading ? 'Verifying…' : 'Verify Temp Password'}
                  </button>
                </form>
              ) : (
                <form className="login-form" onSubmit={handleChangePassword}>
                  <div className="login-field">
                    <label className="login-label">New Permanent Password</label>
                    <input
                      type="password"
                      placeholder="Choose new password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                  </div>

                  <button type="submit" className="login-submit" disabled={tempLoading}>
                    {tempLoading ? 'Saving…' : 'Set New Password & Continue'}
                  </button>
                </form>
              )}

              <div style={{ marginTop: '16px', textAlign: 'center' }}>
                <button
                  type="button"
                  onClick={() => setIsTempPwMode(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    fontSize: '13px'
                  }}
                >
                  ← Back to standard login
                </button>
              </div>
            </>
          )}

          <p className="login-footnote">
            <svg viewBox="0 0 20 20" width="13" height="13" fill="none" aria-hidden="true">
              <rect x="4.5" y="8.5" width="11" height="8" rx="1.75" stroke="currentColor" strokeWidth="1.5" />
              <path d="M6.75 8.5V6a3.25 3.25 0 0 1 6.5 0v2.5" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            Protected by enterprise-grade security
          </p>
        </div>
      </div>
    </div>
  );
}

function FeatureIcon() {
  return (
    <svg viewBox="0 0 20 20" width="16" height="16" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.2" opacity="0.5" />
      <path d="M6.5 10.2l2.3 2.3 4.7-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg viewBox="0 0 20 20" width="16" height="16" fill="none" aria-hidden="true">
      <path d="M1.5 10S4.5 4.5 10 4.5 18.5 10 18.5 10 15.5 15.5 10 15.5 1.5 10 1.5 10Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg viewBox="0 0 20 20" width="16" height="16" fill="none" aria-hidden="true">
      <path d="M2.5 2.5l15 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M8.3 4.7C8.85 4.57 9.42 4.5 10 4.5c5.5 0 8.5 5.5 8.5 5.5a15.6 15.6 0 0 1-2.9 3.6M5.6 6.1A15.7 15.7 0 0 0 1.5 10s3 5.5 8.5 5.5c1.1 0 2.1-.22 3-.6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8.1 10a1.9 1.9 0 0 0 2.7 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export default LoginForm;

