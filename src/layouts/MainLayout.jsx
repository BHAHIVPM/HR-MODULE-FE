import React, { useState, useEffect, useCallback, Fragment } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useSessionTimeout } from '../hooks/useSessionTimeout';
import SessionWarningModal from '../components/SessionWarningModal/SessionWarningModal';
import AppHeader from '../components/AppHeader/AppHeader';
import mainGroupService from '../features/menu/services/mainGroupService';
import useCurrentUser from '../hooks/useCurrentUser';
import {
  MODULE_REGISTRATIONS,
  resolveAddPath,
} from '../features/registration/config/moduleRegistrationConfig';
import './MainLayout.css';

const NAV_ITEMS = [
  {
    label: 'Dashboard',
    listPath: '/dashboard',
    icon: DashboardIcon,
  },
  {
    label: 'Menu Management',
    listPath: '/menu-management',
    formPath: '/registrations/main-group',
    icon: MenuIcon,
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
    formPath: '/registrations/department',
    icon: OrganizationIcon,
  },
  {
    label: 'Shifts & Rosters',
    listPath: '/shifts',
    formPath: '/registrations/shift',
    icon: ShiftIcon,
  },
  {
    label: 'Attendance',
    listPath: '/attendance',
    formPath: '/registrations/attendance',
    icon: AttendanceIcon,
  },
  {
    label: 'Leaves',
    listPath: '/leaves',
    formPath: '/registrations/leave-application',
    icon: LeaveIcon,
  },
  {
    label: 'Holidays',
    listPath: '/holidays',
    formPath: '/registrations/holiday',
    icon: HolidayIcon,
  },
  {
    label: 'Payroll & Salary',
    listPath: '/payroll-management',
    formPath: '/registrations/salary-structure',
    icon: PayrollIcon,
  },
  {
    label: 'Assets',
    listPath: '/assets',
    formPath: '/registrations/asset',
    icon: AssetIcon,
  },
  {
    label: 'Documents',
    listPath: '/documents',
    formPath: '/registrations/document',
    icon: DocumentIcon,
  },
  {
    label: 'Appraisals',
    listPath: '/performance-reviews',
    formPath: '/registrations/performance-review',
    icon: PerformanceIcon,
  },
  {
    label: 'Users',
    listPath: '/userData',
    formPath: '/registrations/user',
    icon: UserDataIcon,
  },
  {
    label: 'Role Assignment',
    listPath: '/role-assignment',
    formPath: '/registrations/role',
    icon: RoleAssignmentIcon,
  },
  {
    label: 'Clients',
    listPath: '/clients',
    formPath: '/registrations/client',
    icon: ClientIcon,
  },
];

// ---------------------------------------------------------------------------
// Mandatory menus for DEVELOPER accounts
// ---------------------------------------------------------------------------
// The first user in the system is a seeded DEVELOPER account. Nobody can assign
// role privileges to it yet (role assignment itself requires a user who already
// has privileges), so the modules needed to bootstrap the system - Role
// Assignment (holds the Role Privileges tab) and Menu Management (defines what
// every menu contains) - MUST always be reachable for developer accounts,
// otherwise the bootstrap user is locked out of the very screens needed to
// grant itself access. Every other user type relies purely on the
// menu-management / privilege configuration returned by the backend.
const MANDATORY_DEVELOPER_MENUS = [
  {
    mainGroupId: 'dev-mandatory-role-assignment',
    mainGroupName: 'Role Assignment',
    // iconPath intentionally omitted -> sidebar renders the default menu icon
    subGroup: [
      {
        subGroupId: 'dev-mandatory-role-assignment-group',
        subGroupName: null,
        subItems: [
          {
            menuNameId: 'dev-mandatory-role-assignment-item',
            menuName: 'Role Assignment',
            componentPath: '/role-assignment',
            canView: true,
            canAdd: false,
          },
        ],
      },
    ],
  },
  {
    mainGroupId: 'dev-mandatory-menu-management',
    mainGroupName: 'Menu Management',
    subGroup: [
      {
        subGroupId: 'dev-mandatory-menu-management-group',
        subGroupName: null,
        subItems: [
          {
            menuNameId: 'dev-mandatory-menu-management-item',
            menuName: 'Menu Management',
            componentPath: '/menu-management',
            canView: true,
            canAdd: false,
          },
        ],
      },
    ],
  },
];

// True when `menu` already contains a VISIBLE item pointing at `componentPath`.
function menuHasVisibleItem(menu, componentPath) {
  return (Array.isArray(menu) ? menu : []).some((mainGroup) =>
    (Array.isArray(mainGroup?.subGroup) ? mainGroup.subGroup : []).some((subGroup) =>
      (Array.isArray(subGroup?.subItems) ? subGroup.subItems : []).some(
        (item) => item?.componentPath === componentPath && item?.canView !== false
      )
    )
  );
}

// Returns the menu with every mandatory developer entry the backend did not
// already expose (or exposed as hidden) appended, so the entry is never lost.
// Duplicate-free by design: the synthetic entry is only added when no visible
// counterpart exists, and renderBackendNav hides items with canView === false.
function ensureMandatoryDeveloperMenus(menu) {
  const base = Array.isArray(menu) ? menu : [];
  const missing = MANDATORY_DEVELOPER_MENUS.filter((mandatory) => {
    const item = mandatory.subGroup[0].subItems[0];
    return !menuHasVisibleItem(base, item.componentPath);
  });
  return missing.length > 0 ? [...base, ...missing] : base;
}

// Static navigation fallback: used only when the backend menu could not be loaded,
// so the app stays navigable during network/server failures.
function renderStaticNav(location, navigate) {
  return NAV_ITEMS.map((item) => {
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
  });
}

// Backend-driven navigation built from GET /api/main-group-operation/full.
// Menu names come straight from the backend response (English master data);
// entries with canView === false are hidden.
function renderBackendNav(menu, location) {
  return menu.map((mainGroup) => {
    const subGroups = Array.isArray(mainGroup.subGroup) ? mainGroup.subGroup : [];
    const groupsWithItems = subGroups.filter(
      (subGroup) =>
        (Array.isArray(subGroup.subItems) ? subGroup.subItems : []).some(
          (item) => item.canView !== false
        )
    );
    if (groupsWithItems.length === 0) return null;

    return (
      <div key={`mg-${mainGroup.mainGroupId ?? mainGroup.mainGroupName}`} className="sidebar-group">
        <div className="sidebar-menu-row sidebar-main-group-row">
          <div className="sidebar-menu-left">
            {mainGroup.iconPath ? (
              <i className={mainGroup.iconPath} style={{ fontSize: 16 }} aria-hidden="true" />
            ) : (
              <MenuIcon />
            )}
            <span className="sidebar-menu-label">{mainGroup.mainGroupName}</span>
          </div>
        </div>
        <ul className="sidebar-submenu">
          {groupsWithItems.map((subGroup) => (
            <Fragment key={`sg-${subGroup.subGroupId ?? `null-${mainGroup.mainGroupId}`}`}>
              {subGroup.subGroupName ? (
                <li className="sidebar-subgroup-label">{subGroup.subGroupName}</li>
              ) : null}
              {(Array.isArray(subGroup.subItems) ? subGroup.subItems : [])
                .filter((item) => item.canView !== false)
                .map((item) => {
                  const isActive = !!item.componentPath && location.pathname === item.componentPath;
                  const addPath = resolveAddPath(item.componentPath);
                  // Backend menu items expose the user's add privilege via canAdd.
                  const showAdd = !!addPath && item.canAdd !== false;
                  const isAddActive = showAdd && location.pathname === addPath;
                  return (
                    <li key={`it-${item.menuNameId}`} className="sidebar-sublink-row">
                      <Link
                        to={item.componentPath || '#'}
                        className={`sidebar-sublink ${isActive ? 'sidebar-sublink-active' : ''}`}
                      >
                        {item.menuName}
                      </Link>
                      {showAdd && (
                        <Link
                          to={addPath}
                          className={`sidebar-add-btn sidebar-add-btn-sm ${isAddActive ? 'sidebar-add-btn-active' : ''}`}
                          title={`Register / Add ${item.menuName}`}
                          aria-label={`Add ${item.menuName}`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          +
                        </Link>
                      )}
                    </li>
                  );
                })}
            </Fragment>
          ))}
        </ul>
      </div>
    );
  });
}

function MainLayout() {
  const { showWarning, extendSession, forceLogout } = useSessionTimeout();
  const location = useLocation();
  const navigate = useNavigate();
  const [menu, setMenu] = useState(null);
  const [menuError, setMenuError] = useState(false);
  // DEVELOPER accounts (the seeded bootstrap user) always keep access to the
  // Role Assignment and Menu Management modules - see MANDATORY_DEVELOPER_MENUS.
  const { currentUserType } = useCurrentUser();
  const isDeveloperUser = String(currentUserType || '').trim().toUpperCase() === 'DEVELOPER';
  const effectiveMenu = isDeveloperUser ? ensureMandatoryDeveloperMenus(menu) : menu;

  const loadMenu = useCallback(async () => {
    try {
      const res = await mainGroupService.getFullMenu();
      const list = res?.data?.responseOutput || res?.data || [];
      setMenu(Array.isArray(list) ? list : []);
      setMenuError(false);
    } catch {
      setMenuError(true);
    }
  }, []);

  useEffect(() => {
    loadMenu();
  }, [loadMenu]);

  let navContent = null;
  if (menuError) {
    // Server failure: static fallback keeps the app navigable (it already
    // contains the Role Assignment entry, so developers are covered here too).
    navContent = renderStaticNav(location, navigate);
  } else if (Array.isArray(effectiveMenu) && effectiveMenu.length > 0) {
    navContent = renderBackendNav(effectiveMenu, location);
  } else if (Array.isArray(menu)) {
    // Backend answered but the account has no menus assigned.
    navContent = (
      <div className="sidebar-empty">
        <span>No menus assigned to your account.</span>
      </div>
    );
  }

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
          {navContent}
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
  if (pathname.startsWith('/registrations/')) {
    const moduleKey = pathname.replace('/registrations/', '');
    const config = MODULE_REGISTRATIONS[moduleKey];
    return config ? config.pageTitle : 'Registration';
  }
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

function MenuIcon() {
  return (
    <svg viewBox="0 0 20 20" width="18" height="18" fill="none" aria-hidden="true">
      <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
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

function RoleAssignmentIcon() {
  return (
    <svg viewBox="0 0 20 20" width="18" height="18" fill="none" aria-hidden="true">
      <path d="M10 2L13 4L15 2.5L16.5 5L19 5.5L18 8L19.5 10L17 11.5L17.5 14L15 14.5L13.5 17L10 15.5L6.5 17L5 14.5L2.5 14L3 11.5L0.5 10L2 8L1 5.5L3.5 5L5 2.5L7 4L10 2Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
      <circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export default MainLayout;


