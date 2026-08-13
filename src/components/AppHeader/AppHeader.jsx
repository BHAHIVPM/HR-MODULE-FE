import HeaderMenu from './HeaderMenu';
import './AppHeader.css';

function AppHeader({ title, subtitle }) {
  return (
    <header className="app-header">
      <div className="app-header-left">
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
