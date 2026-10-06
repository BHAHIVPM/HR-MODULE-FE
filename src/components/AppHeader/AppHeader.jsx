import HeaderMenu from './HeaderMenu';
import './AppHeader.css';

function AppHeader({ title, subtitle, onToggleSidebar, isSidebarCollapsed }) {
  return (
    <header className="app-header">
      <div className="app-header-left">
        {onToggleSidebar && (
          <button
            type="button"
            className="app-header-menu-toggle"
            onClick={onToggleSidebar}
            aria-label={isSidebarCollapsed ? "Open navigation menu" : "Close navigation menu"}
            title={isSidebarCollapsed ? "Open menu" : "Close menu"}
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}
        <div className="app-header-mark" aria-hidden="true">
          <svg viewBox="0 0 32 32" width="18" height="18" fill="none">
            <path d="M16 2 L29 9 V23 L16 30 L3 23 V9 Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
          </svg>
        </div>
        <div className="app-header-titles">
          <span className="app-header-brand">HR Module</span>
          {title && <span className="app-header-page">{title}</span>}
          {subtitle && <span className="app-header-subtitle">{subtitle}</span>}
        </div>
      </div>
      <HeaderMenu />
    </header>
  );
}

export default AppHeader;
