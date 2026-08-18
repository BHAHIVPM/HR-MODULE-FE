<<<<<<< HEAD
import { NavLink, useLocation, Outlet } from 'react-router-dom';
import { useState } from 'react';
=======
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
>>>>>>> d0ebdba3f460d4c0c55afbe2346a4b9167f24491
import { useSessionTimeout } from '../hooks/useSessionTimeout';
import SessionWarningModal from '../components/SessionWarningModal/SessionWarningModal';
import AppHeader from '../components/AppHeader/AppHeader';
import './MainLayout.css';

const NAV_ITEMS = [
  {
    label: 'Dashboard',
    path: '/dashboard',
    icon: DashboardIcon,
  },
  {
    label: 'Registrations',
    icon: RegistrationIcon,
    children: [
      { label: 'User', path: '/registrations/user' },
      { label: 'Employee', path: '/registrations/employee' },
      { label: 'Client', path: '/registrations/client' },
    ],
  },
];

function MainLayout() {
  const { showWarning, extendSession, forceLogout } = useSessionTimeout();
  const location = useLocation();
  const [registrationsOpen, setRegistrationsOpen] = useState(
    location.pathname.startsWith('/registrations')
  );

  const isRegistrationsActive = location.pathname.startsWith('/registrations');

  return (
    <div className="main-layout">
<<<<<<< HEAD
      <aside className="main-layout-sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-mark">
            <svg viewBox="0 0 32 32" width="18" height="18" fill="none">
              <path d="M16 2 L29 9 V23 L16 30 L3 23 V9 Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="sidebar-title">HR Module</span>
        </div>
=======
      <header className="main-layout-header">
        <div className="main-layout-brand-section">
          <span className="main-layout-title">
            HR Module <span className="main-layout-title-badge">Portal</span>
          </span>
          <nav className="main-layout-nav">
            <NavLink
              to="/dashboard"
              className={({ isActive }) => `main-nav-link ${isActive ? 'active' : ''}`}
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/employees"
              className={({ isActive }) => `main-nav-link ${isActive ? 'active' : ''}`}
            >
              Employees
            </NavLink>
          </nav>
        </div>

        <div className="main-layout-user-section">
          <button className="main-layout-logout" onClick={logout}>
            Logout
          </button>
        </div>
      </header>
>>>>>>> d0ebdba3f460d4c0c55afbe2346a4b9167f24491

        <nav className="sidebar-nav" aria-label="Main navigation">
          {NAV_ITEMS.map((item) =>
            item.children ? (
              <div key={item.label} className="sidebar-group">
                <button
                  type="button"
                  className={`sidebar-link sidebar-group-toggle ${isRegistrationsActive ? 'sidebar-link-active' : ''}`}
                  onClick={() => setRegistrationsOpen((o) => !o)}
                  aria-expanded={registrationsOpen}
                >
                  <item.icon />
                  <span>{item.label}</span>
                  <ChevronIcon open={registrationsOpen} />
                </button>
                {registrationsOpen && (
                  <ul className="sidebar-submenu">
                    {item.children.map((child) => (
                      <li key={child.path}>
                        <NavLink
                          to={child.path}
                          className={({ isActive }) =>
                            `sidebar-sublink ${isActive ? 'sidebar-sublink-active' : ''}`
                          }
                        >
                          {child.label}
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ) : (
              <NavLink
                key={item.path}
                to={item.path}
                end
                className={({ isActive }) =>
                  `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`
                }
              >
                <item.icon />
                <span>{item.label}</span>
              </NavLink>
            )
          )}
        </nav>
      </aside>

      <div className="main-layout-body">
        <AppHeader title={getPageTitle(location.pathname)} />

        <main className={`main-layout-content ${location.state?.fromLogin ? 'page-enter' : ''}`}>
          <Outlet />
        </main>
      </div>

      {showWarning && (
        <SessionWarningModal onStay={extendSession} onLogout={forceLogout} />
      )}
    </div>
  );
}

function getPageTitle(pathname) {
  if (pathname === '/dashboard') return 'Dashboard';
  if (pathname === '/registrations/user') return 'User Registration';
  if (pathname === '/registrations/employee') return 'Employee Registration';
  if (pathname === '/registrations/client') return 'Client Registration';
  return 'HR Module';
}

function DashboardIcon() {
  return (
    <svg viewBox="0 0 20 20" width="18" height="18" fill="none" aria-hidden="true">
      <rect x="2.5" y="2.5" width="6.5" height="6.5" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="11" y="2.5" width="6.5" height="6.5" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="2.5" y="11" width="6.5" height="6.5" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="11" y="11" width="6.5" height="6.5" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function RegistrationIcon() {
  return (
    <svg viewBox="0 0 20 20" width="18" height="18" fill="none" aria-hidden="true">
      <path d="M10 10a3.25 3.25 0 1 0 0-6.5 3.25 3.25 0 0 0 0 6.5Z" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3.5 17c1.2-3.4 4-5 6.5-5s5.3 1.6 6.5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M14.5 3.5h3v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13 7l4.5-4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function ChevronIcon({ open }) {
  return (
    <svg
      viewBox="0 0 20 20"
      width="14"
      height="14"
      fill="none"
      aria-hidden="true"
      className={`sidebar-chevron ${open ? 'sidebar-chevron-open' : ''}`}
    >
      <path d="M7 8l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default MainLayout;
