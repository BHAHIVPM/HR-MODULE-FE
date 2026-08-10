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
        <span className="main-layout-title">App</span>
        <button className="main-layout-logout" onClick={logout}>
          Logout
        </button>
      </header>

      <main className="main-layout-content">{children}</main>

      {showWarning && (
        <SessionWarningModal onStay={extendSession} onLogout={forceLogout} />
      )}
    </div>
  );
}

export default MainLayout;
