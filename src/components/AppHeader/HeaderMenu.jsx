import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import './HeaderMenu.css';

const COLOR_OPTIONS = [
  { key: 'primary', label: 'Primary' },
  { key: 'secondary', label: 'Secondary' },
  { key: 'third', label: 'Third' },
];

const MODE_OPTIONS = [
  { value: 'system', label: 'System', hint: 'Match browser' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
];

function HeaderMenu() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const { isAuthenticated, logout } = useAuth();
  const { colors, updateColor, colorMode, setColorMode, resolvedMode } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    const handleEscape = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const handleLogin = () => {
    setOpen(false);
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  const handleLogout = async () => {
    setOpen(false);
    await logout();
    navigate('/login');
  };

  return (
    <div className="header-menu" ref={menuRef}>
      <button
        type="button"
        className="header-menu-trigger"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="true"
        aria-label="Open menu"
      >
        <MenuIcon />
      </button>

      {open && (
        <div className="header-menu-dropdown" role="menu">
          <div className="header-menu-section">
            <span className="header-menu-section-label">Account</span>
            {isAuthenticated ? (
              <>
                {location.pathname !== '/dashboard' && (
                  <Link to="/dashboard" className="header-menu-item" role="menuitem" onClick={() => setOpen(false)}>
                    <DashboardIcon />
                    Dashboard
                  </Link>
                )}
                <button type="button" className="header-menu-item" role="menuitem" onClick={handleLogout}>
                  <LogoutIcon />
                  Logout
                </button>
              </>
            ) : (
              <button type="button" className="header-menu-item" role="menuitem" onClick={handleLogin}>
                <LoginIcon />
                Login
              </button>
            )}
          </div>

          <div className="header-menu-divider" />

          <div className="header-menu-section">
            <span className="header-menu-section-label">Theme colors</span>
            {COLOR_OPTIONS.map(({ key, label }) => (
              <label key={key} className="header-menu-color-item" role="menuitem">
                <span className="header-menu-color-label">{label}</span>
                <input
                  type="color"
                  value={colors[key]}
                  onChange={(e) => updateColor(key, e.target.value)}
                  aria-label={`${label} color`}
                />
                <span className="header-menu-color-hex">{colors[key]}</span>
              </label>
            ))}
          </div>

          <div className="header-menu-divider" />

          <div className="header-menu-section">
            <span className="header-menu-section-label">
              Appearance
              <span className="header-menu-mode-badge">{resolvedMode}</span>
            </span>
            <div className="header-menu-mode-group" role="group" aria-label="Color mode">
              {MODE_OPTIONS.map(({ value, label, hint }) => (
                <button
                  key={value}
                  type="button"
                  className={`header-menu-mode-btn ${colorMode === value ? 'header-menu-mode-btn-active' : ''}`}
                  onClick={() => setColorMode(value)}
                  title={hint}
                >
                  {value === 'system' && <SystemIcon />}
                  {value === 'light' && <SunIcon />}
                  {value === 'dark' && <MoonIcon />}
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MenuIcon() {
  return (
    <svg viewBox="0 0 20 20" width="18" height="18" fill="none" aria-hidden="true">
      <circle cx="10" cy="4.5" r="1.25" fill="currentColor" />
      <circle cx="10" cy="10" r="1.25" fill="currentColor" />
      <circle cx="10" cy="15.5" r="1.25" fill="currentColor" />
    </svg>
  );
}

function LoginIcon() {
  return (
    <svg viewBox="0 0 20 20" width="16" height="16" fill="none" aria-hidden="true">
      <path d="M7 10h7M12 7l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 4.5v11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg viewBox="0 0 20 20" width="16" height="16" fill="none" aria-hidden="true">
      <path d="M13 10H6M9 7l-3 3 3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16 4.5v11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function DashboardIcon() {
  return (
    <svg viewBox="0 0 20 20" width="16" height="16" fill="none" aria-hidden="true">
      <rect x="2.5" y="2.5" width="6.5" height="6.5" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="11" y="2.5" width="6.5" height="6.5" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="2.5" y="11" width="6.5" height="6.5" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="11" y="11" width="6.5" height="6.5" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function SystemIcon() {
  return (
    <svg viewBox="0 0 20 20" width="14" height="14" fill="none" aria-hidden="true">
      <rect x="3" y="4" width="14" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M7 16h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg viewBox="0 0 20 20" width="14" height="14" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="3.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10 2.5v2M10 15.5v2M2.5 10h2M15.5 10h2M4.4 4.4l1.4 1.4M14.2 14.2l1.4 1.4M4.4 15.6l1.4-1.4M14.2 5.8l1.4-1.4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 20 20" width="14" height="14" fill="none" aria-hidden="true">
      <path d="M15.5 11.2a5.5 5.5 0 0 1-6.7-6.7 5.5 5.5 0 1 0 6.7 6.7Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

export default HeaderMenu;
