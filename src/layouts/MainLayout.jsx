import React from 'react';
import { useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useSessionTimeout } from '../hooks/useSessionTimeout';
import SessionWarningModal from '../components/SessionWarningModal/SessionWarningModal';
import AppHeader from '../components/AppHeader/AppHeader';
import './MainLayout.css';

const NAV_ITEMS = [
  {
    label: 'Dashboard',
    listPath: '/dashboard',
    icon: DashboardIcon,
  },
  {
    label: 'Employees',
    listPath: '/employees',
    formPath: '/registrations/employee',
    icon: UsersIcon,
  },
  {
    label: 'Users',
    listPath: '/userData',
    formPath: '/registrations/user',
    icon: UserDataIcon,
  },
  {
    label: 'Clients',
    listPath: '/clients',
    formPath: '/registrations/client',
    icon: ClientIcon,
  },
];

function MainLayout() {
  const { showWarning, extendSession, forceLogout } = useSessionTimeout();
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="main-layout">
      <aside className="main-layout-sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-mark">
            <svg viewBox="0 0 32 32" width="18" height="18" fill="none">
              <path d="M16 2 L29 9 V23 L16 30 L3 23 V9 Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="sidebar-title">HR Module</span>
        </div>

        <nav className="sidebar-nav" aria-label="Main navigation">
          {NAV_ITEMS.map((item) => {
            const isListActive = location.pathname === item.listPath;
            const isFormActive = item.formPath && location.pathname === item.formPath;
            const isRowActive = isListActive || isFormActive;

            return (
              <div
                key={item.label}
                className={`sidebar-menu-row ${isRowActive ? 'sidebar-menu-row-active' : ''}`}
                onClick={() => navigate(item.listPath)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    navigate(item.listPath);
                  }
                }}
              >
                <div className="sidebar-menu-left">
                  <item.icon />
                  <span className="sidebar-menu-label">{item.label}</span>
                </div>

                {item.formPath && (
                  <button
                    type="button"
                    className={`sidebar-add-btn ${isFormActive ? 'sidebar-add-btn-active' : ''}`}
                    title={`Register / Add ${item.label}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(item.formPath);
                    }}
                    aria-label={`Add ${item.label}`}
                  >
                    +
                  </button>
                )}
              </div>
            );
          })}
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
  if (pathname === '/employees') return 'Employee Directory';
  if (pathname === '/userData') return 'User Data Directory';
  if (pathname === '/clients') return 'Client Directory';
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

function UsersIcon() {
  return (
    <svg viewBox="0 0 20 20" width="18" height="18" fill="none" aria-hidden="true">
      <path d="M7 9a3 3 0 100-6 3 3 0 000 6zM13 9a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" stroke="currentColor" strokeWidth="1.5" />
      <path d="M2.5 16.5c1-2.5 3.5-3.5 6.5-3.5s5.5 1 6.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function UserDataIcon() {
  return (
    <svg viewBox="0 0 20 20" width="18" height="18" fill="none" aria-hidden="true">
      <path d="M10 10a3.25 3.25 0 1 0 0-6.5 3.25 3.25 0 0 0 0 6.5Z" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3.5 17c1.2-3.4 4-5 6.5-5s5.3 1.6 6.5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function ClientIcon() {
  return (
    <svg viewBox="0 0 20 20" width="18" height="18" fill="none" aria-hidden="true">
      <rect x="3" y="4" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M7 8h6M7 12h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export default MainLayout;


