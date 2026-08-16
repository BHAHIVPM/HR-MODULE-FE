import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSessionTimeout } from '../hooks/useSessionTimeout';
import SessionWarningModal from '../components/SessionWarningModal/SessionWarningModal';
import './MainLayout.css';

function MainLayout({ children }) {
  const { logout } = useAuth();
  const { showWarning, extendSession, forceLogout } = useSessionTimeout();

  return (
    <div className="main-layout">
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

      <main className="main-layout-content">{children}</main>

      {showWarning && (
        <SessionWarningModal onStay={extendSession} onLogout={forceLogout} />
      )}
    </div>
  );
}

export default MainLayout;
