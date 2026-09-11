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
    label: 'Organization',
    listPath: '/organization',
    icon: OrganizationIcon,
  },
  {
    label: 'Shifts & Rosters',
    listPath: '/shifts',
    icon: ShiftIcon,
  },
  {
    label: 'Attendance',
    listPath: '/attendance',
    icon: AttendanceIcon,
  },
  {
    label: 'Leaves',
    listPath: '/leaves',
    icon: LeaveIcon,
  },
  {
    label: 'Holidays',
    listPath: '/holidays',
    icon: HolidayIcon,
  },
  {
    label: 'Payroll & Salary',
    listPath: '/payroll-management',
    icon: PayrollIcon,
  },
  {
    label: 'Assets',
    listPath: '/assets',
    icon: AssetIcon,
  },
  {
    label: 'Documents',
    listPath: '/documents',
    icon: DocumentIcon,
  },
  {
    label: 'Appraisals',
    listPath: '/performance-reviews',
    icon: PerformanceIcon,
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
  if (pathname === '/organization') return 'Organization Structure';
  if (pathname === '/shifts') return 'Shift & Rostering';
  if (pathname === '/attendance') return 'Attendance Log';
  if (pathname === '/leaves') return 'Leave Management';
  if (pathname === '/holidays') return 'Holiday Calendar';
  if (pathname === '/payroll-management') return 'Payroll & Compensation';
  if (pathname === '/assets') return 'Asset Inventory';
  if (pathname === '/documents') return 'Document Repository';
  if (pathname === '/performance-reviews') return 'Performance Reviews & Appraisals';
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

function OrganizationIcon() {
  return (
    <svg viewBox="0 0 20 20" width="18" height="18" fill="none" aria-hidden="true">
      <path d="M10 2v4M5 6h10M5 6v3M15 6v3M10 10v3M3 13h14M3 13v4M10 13v4M17 13v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function ShiftIcon() {
  return (
    <svg viewBox="0 0 20 20" width="18" height="18" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10 6v4l2.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function AttendanceIcon() {
  return (
    <svg viewBox="0 0 20 20" width="18" height="18" fill="none" aria-hidden="true">
      <rect x="3" y="3" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M7 10l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function LeaveIcon() {
  return (
    <svg viewBox="0 0 20 20" width="18" height="18" fill="none" aria-hidden="true">
      <rect x="3" y="4" width="14" height="13" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3 8h14M7 2v4M13 2v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function HolidayIcon() {
  return (
    <svg viewBox="0 0 20 20" width="18" height="18" fill="none" aria-hidden="true">
      <path d="M10 3l2.2 4.5 4.9.7-3.5 3.4.8 4.9L10 14.2l-4.4 2.3.8-4.9L2.9 8.2l4.9-.7L10 3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

function PayrollIcon() {
  return (
    <svg viewBox="0 0 20 20" width="18" height="18" fill="none" aria-hidden="true">
      <rect x="2.5" y="4.5" width="15" height="11" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M2.5 8.5h15M6.5 12.5h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function AssetIcon() {
  return (
    <svg viewBox="0 0 20 20" width="18" height="18" fill="none" aria-hidden="true">
      <rect x="3" y="4" width="14" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M7 16h6M10 13v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function DocumentIcon() {
  return (
    <svg viewBox="0 0 20 20" width="18" height="18" fill="none" aria-hidden="true">
      <path d="M5 3.5h7l4 4v9a1.5 1.5 0 01-1.5 1.5h-9.5A1.5 1.5 0 013.5 16.5v-11.5A1.5 1.5 0 015 3.5z" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 3.5v4h4M7 11h6M7 14h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function PerformanceIcon() {
  return (
    <svg viewBox="0 0 20 20" width="18" height="18" fill="none" aria-hidden="true">
      <path d="M3 16l4-5 3.5 3 5.5-8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13 6h3v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
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


