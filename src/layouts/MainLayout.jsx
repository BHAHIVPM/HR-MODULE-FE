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
// has privileges), so the modules needed to bootstrap the system - User
// Management (create users and assign their user type, e.g. SUPERADMIN), Role
// Assignment (holds the Role Privileges tab) and Menu Management (defines what
// every menu contains) - MUST always be reachable for developer accounts,
// otherwise the bootstrap user is locked out of the very screens needed to
// grant itself access. Every other user type relies purely on the
// menu-management / privilege configuration returned by the backend.
const MANDATORY_DEVELOPER_MENUS = [
  {
    mainGroupId: 'dev-mandatory-user-management',
    mainGroupName: 'User Management',
    // iconPath intentionally omitted -> sidebar renders the default menu icon
    subGroup: [
      {
        subGroupId: 'dev-mandatory-user-management-group',
        subGroupName: null,
        subItems: [
          {
            menuNameId: 'dev-mandatory-user-management-item',
            menuName: 'User Management',
            componentPath: '/userData',
            canView: true,
            // canAdd true so the sidebar's "+ Add" button (which routes to
            // /registrations/user) is shown, letting the developer create new
            // users and assign their user type / role from there.
            canAdd: true,
          },
        ],
      },
    ],
  },
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
            menuNameId: 'dev-mandatory-main-groups-item',
            menuName: 'Main Groups',
            componentPath: '/menu-management?tab=mainGroups',
            canView: true,
            canAdd: true,
          },
          {
            menuNameId: 'dev-mandatory-sub-groups-item',
            menuName: 'Sub Groups',
            componentPath: '/menu-management?tab=subGroups',
            canView: true,
            canAdd: true,
          },
          {
            menuNameId: 'dev-mandatory-menu-items-item',
            menuName: 'Menu Items',
            componentPath: '/menu-management?tab=menuItems',
            canView: true,
            canAdd: true,
          },
          {
            menuNameId: 'dev-mandatory-menu-preview-item',
            menuName: 'Menu Preview',
            componentPath: '/menu-management?tab=menuPreview',
            canView: true,
            canAdd: false,
          },
        ],
      },
    ],
  },
];

// Default Dashboard menu item prepended for ALL users if backend response does not include it
const DASHBOARD_MAIN_GROUP = {
  mainGroupId: 'default-dashboard-group',
  mainGroupName: 'Dashboard',
  iconPath: 'dashboard-icon',
  subGroup: [
    {
      subGroupId: 'default-dashboard-subgroup',
      subGroupName: null,
      subItems: [
        {
          menuNameId: 'default-dashboard-item',
          menuName: 'Dashboard',
          componentPath: '/dashboard',
          canView: true,
          canAdd: false,
        },
      ],
    },
  ],
};

// Ensures Dashboard is the #1 default menu item for ALL users
function ensureDashboardMenu(menu) {
  const base = Array.isArray(menu) ? menu : [];
  if (menuHasVisibleItem(base, '/dashboard')) {
    return base;
  }
  return [DASHBOARD_MAIN_GROUP, ...base];
}

// True when `menu` already contains a VISIBLE item pointing at `componentPath`.
function menuHasVisibleItem(menu, componentPath) {
  const normTarget = componentPath ? componentPath.split('?')[0] : '';
  return (Array.isArray(menu) ? menu : []).some((mainGroup) =>
    (Array.isArray(mainGroup?.subGroup) ? mainGroup.subGroup : []).some((subGroup) =>
      (Array.isArray(subGroup?.subItems) ? subGroup.subItems : []).some((item) => {
        if (!item?.componentPath || item?.canView === false) return false;
        const normItem = item.componentPath.split('?')[0];
        return normItem === normTarget;
      })
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
    const items = mandatory.subGroup[0]?.subItems || [];
    return !items.some((item) => menuHasVisibleItem(base, item.componentPath));
  });
  return missing.length > 0 ? [...base, ...missing] : base;
}

// Helper to auto-close drawer on mobile navigation
function handleMobileNav(setIsCollapsed) {
  if (window.innerWidth <= 1024) {
    setIsCollapsed(true);
  }
}

// Static navigation fallback: used only when the backend menu could not be loaded,
// so the app stays navigable during network/server failures.
function renderStaticNav(location, navigate, isCollapsed, setIsCollapsed) {
  return NAV_ITEMS.map((item) => {
    const isListActive = location.pathname === item.listPath;
    const isFormActive = item.formPath && location.pathname === item.formPath;
    const isRowActive = isListActive || isFormActive;

    return (
      <div
        key={item.label}
        className={`sidebar-menu-row ${isRowActive ? 'sidebar-menu-row-active' : ''}`}
        onClick={() => {
          navigate(item.listPath);
          handleMobileNav(setIsCollapsed);
        }}
        role="button"
        tabIndex={0}
        data-tooltip={item.label}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            navigate(item.listPath);
            handleMobileNav(setIsCollapsed);
          }
        }}
      >
        <div className="sidebar-menu-left">
          <item.icon />
          <span className="sidebar-menu-label">{item.label}</span>
        </div>

        {item.formPath && !isCollapsed && (
          <button
            type="button"
            className={`sidebar-add-btn ${isFormActive ? 'sidebar-add-btn-active' : ''}`}
            title={`Register / Add ${item.label}`}
            onClick={(e) => {
              e.stopPropagation();
              navigate(item.formPath);
              handleMobileNav(setIsCollapsed);
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
function renderBackendNav(menu, location, isCollapsed, expandedGroups, toggleGroup, navigate, setIsCollapsed) {
  return menu.map((mainGroup) => {
    const mgKey = String(mainGroup.mainGroupId ?? mainGroup.mainGroupName);
    const subGroups = Array.isArray(mainGroup.subGroup) ? mainGroup.subGroup : [];
    const groupsWithItems = subGroups.filter(
      (subGroup) =>
        (Array.isArray(subGroup.subItems) ? subGroup.subItems : []).some(
          (item) => item.canView !== false
        )
    );
    if (groupsWithItems.length === 0) return null;

    const currentFull = location.pathname + location.search;
    const hasActiveChild = groupsWithItems.some((sg) =>
      (Array.isArray(sg.subItems) ? sg.subItems : []).some((item) => {
        const addPath = resolveAddPath(item.componentPath);
        return (
          currentFull === item.componentPath ||
          (location.pathname === item.componentPath && !location.search) ||
          (addPath && location.pathname === addPath)
        );
      })
    );

    const isOpen = expandedGroups[mgKey] !== undefined ? !!expandedGroups[mgKey] : hasActiveChild;

    // Check if this is a single-item group without subgroup title (e.g. Dashboard)
    const singleSubItem =
      groupsWithItems.length === 1 &&
      groupsWithItems[0].subItems.length === 1 &&
      !groupsWithItems[0].subGroupName
        ? groupsWithItems[0].subItems[0]
        : null;

    const isSingleActive =
      singleSubItem &&
      singleSubItem.componentPath &&
      (currentFull === singleSubItem.componentPath ||
        (location.pathname === singleSubItem.componentPath && !location.search));

    return (
      <div key={`mg-${mgKey}`} className={`sidebar-group ${isOpen ? 'sidebar-group-open' : ''}`}>
        <div
          className={`sidebar-menu-row sidebar-main-group-row ${
            isOpen ? 'sidebar-main-group-row-open' : ''
          } ${isSingleActive ? 'sidebar-menu-row-active' : ''}`}
          onClick={() => {
            if (singleSubItem?.componentPath) {
              navigate(singleSubItem.componentPath);
              handleMobileNav(setIsCollapsed);
            } else {
              toggleGroup(mgKey);
            }
          }}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              if (singleSubItem?.componentPath) {
                navigate(singleSubItem.componentPath);
                handleMobileNav(setIsCollapsed);
              } else {
                toggleGroup(mgKey);
              }
            }
          }}
          data-tooltip={mainGroup.mainGroupName}
        >
          <div className="sidebar-menu-left">
            {mainGroup.iconPath === 'dashboard-icon' ? (
              <DashboardIcon />
            ) : mainGroup.iconPath ? (
              <i className={mainGroup.iconPath} style={{ fontSize: 16 }} aria-hidden="true" />
            ) : (
              <MenuIcon />
            )}
            <span className="sidebar-menu-label">{mainGroup.mainGroupName}</span>
          </div>
          {!singleSubItem && !isCollapsed && (
            <ChevronIcon className={`sidebar-chevron ${isOpen ? 'sidebar-chevron-open' : ''}`} />
          )}
        </div>
        {!singleSubItem && (isOpen || isCollapsed) && (
          <ul className="sidebar-submenu">
            {groupsWithItems.map((subGroup) => (
              <Fragment key={`sg-${subGroup.subGroupId ?? `null-${mainGroup.mainGroupId}`}`}>
                {subGroup.subGroupName ? (
                  <li className="sidebar-subgroup-label">{subGroup.subGroupName}</li>
                ) : null}
                {(Array.isArray(subGroup.subItems) ? subGroup.subItems : [])
                  .filter((item) => item.canView !== false)
                  .map((item) => {
                    const isActive =
                      !!item.componentPath &&
                      (currentFull === item.componentPath ||
                        (location.pathname === item.componentPath && !location.search));
                    const addPath = resolveAddPath(item.componentPath);
                    const showAdd = !!addPath && item.canAdd !== false;
                    const isAddActive = showAdd && location.pathname === addPath;
                    return (
                      <li key={`it-${item.menuNameId}`} className="sidebar-sublink-row" data-tooltip={item.menuName}>
                        <Link
                          to={item.componentPath || '#'}
                          className={`sidebar-sublink ${isActive ? 'sidebar-sublink-active' : ''}`}
                          onClick={() => handleMobileNav(setIsCollapsed)}
                        >
                          {item.menuName}
                        </Link>
                        {showAdd && !isCollapsed && (
                          <Link
                            to={addPath}
                            className={`sidebar-add-btn sidebar-add-btn-sm ${isAddActive ? 'sidebar-add-btn-active' : ''}`}
                            title={`Register / Add ${item.menuName}`}
                            aria-label={`Add ${item.menuName}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMobileNav(setIsCollapsed);
                            }}
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
        )}
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
  const [expandedGroups, setExpandedGroups] = useState({});

  const toggleGroup = useCallback((groupKey) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupKey]: !prev[groupKey],
    }));
  }, []);

  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window !== 'undefined' && window.innerWidth <= 1024) {
      return true;
    }
    const saved = localStorage.getItem('hr_sidebar_collapsed');
    if (saved !== null) return JSON.parse(saved);
    return false;
  });

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 1024) {
        setIsCollapsed(true);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      if (window.innerWidth > 1024) {
        localStorage.setItem('hr_sidebar_collapsed', JSON.stringify(next));
      }
      return next;
    });
  };

  // Ensure Dashboard menu is always top-level default menu for ALL users.
  // DEVELOPER accounts also get User Management, Role Assignment & Menu Management.
  const { currentUserType } = useCurrentUser();
  const isDeveloperUser = String(currentUserType || '').trim().toUpperCase() === 'DEVELOPER';
  const menuWithDashboard = ensureDashboardMenu(menu);
  const effectiveMenu = isDeveloperUser
    ? ensureMandatoryDeveloperMenus(menuWithDashboard)
    : menuWithDashboard;

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
    navContent = renderStaticNav(location, navigate, isCollapsed, setIsCollapsed);
  } else if (Array.isArray(effectiveMenu) && effectiveMenu.length > 0) {
    navContent = renderBackendNav(effectiveMenu, location, isCollapsed, expandedGroups, toggleGroup, navigate, setIsCollapsed);
  } else if (Array.isArray(menu)) {
    navContent = (
      <div className="sidebar-empty">
        <span>No menus assigned to your account.</span>
      </div>
    );
  }

  return (
    <div className="main-layout">
      {!isCollapsed && (
        <div
          className="main-layout-backdrop"
          onClick={() => setIsCollapsed(true)}
          aria-hidden="true"
        />
      )}

      <aside className={`main-layout-sidebar ${isCollapsed ? 'is-collapsed' : ''}`}>
        <div className="sidebar-brand">
          <button
            type="button"
            className={`sidebar-mark ${isCollapsed ? 'sidebar-mark-collapsed' : ''}`}
            onClick={toggleSidebar}
            title={isCollapsed ? "Expand menu" : "Collapse menu"}
            aria-label={isCollapsed ? "Expand menu" : "Collapse menu"}
          >
            <svg viewBox="0 0 32 32" width="20" height="20" fill="none" className="hexagon-icon">
              <path d="M16 2 L29 9 V23 L16 30 L3 23 V9 Z" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" />
            </svg>
          </button>
          <span className="sidebar-title">HR Module</span>
        </div>

        <nav className="sidebar-nav" aria-label="Main navigation">
          {navContent}
        </nav>
      </aside>

      <div className="main-layout-body">
        <AppHeader
          title={getPageTitle(location.pathname)}
          onToggleSidebar={toggleSidebar}
          isSidebarCollapsed={isCollapsed}
        />

        <main className={`main-layout-content ${location.state?.fromLogin ? 'page-enter' : ''}`}>
          <Outlet />
        </main>
      </div>

      <MobileNavSheet
        isOpen={!isCollapsed}
        onClose={() => setIsCollapsed(true)}
        menu={effectiveMenu}
        location={location}
        navigate={navigate}
        isDeveloperUser={isDeveloperUser}
      />

      {showWarning && (
        <SessionWarningModal onStay={extendSession} onLogout={forceLogout} />
      )}
    </div>
  );
}

function MobileNavSheet({ isOpen, onClose, menu, location, navigate, isDeveloperUser }) {
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const items = [];
  const sourceMenu = Array.isArray(menu) ? menu : [];

  sourceMenu.forEach((mainGroup) => {
    const mgName = mainGroup.mainGroupName || 'Menu';
    const subGroups = Array.isArray(mainGroup.subGroup) ? mainGroup.subGroup : [];
    subGroups.forEach((subGroup) => {
      const subItems = Array.isArray(subGroup.subItems) ? subGroup.subItems : [];
      subItems.forEach((item) => {
        if (item.canView !== false && item.componentPath) {
          items.push({
            group: mgName,
            label: item.menuName,
            path: item.componentPath,
            canAdd: item.canAdd !== false,
          });
        }
      });
    });
  });

  const displayItems = items.length > 0 ? items : NAV_ITEMS.map((i) => ({
    group: 'General',
    label: i.label,
    path: i.listPath,
    canAdd: !!i.formPath,
  }));

  const filteredItems = displayItems.filter(
    (item) =>
      item.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.group.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="mobile-nav-overlay" onClick={onClose}>
      <div className="mobile-nav-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="mobile-sheet-drag-handle" />
        <div className="mobile-sheet-header">
          <div className="mobile-sheet-profile">
            <div className="mobile-sheet-avatar">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <div className="mobile-sheet-user-text">
              <span className="mobile-sheet-user-name">HR Navigation</span>
              <span className="mobile-sheet-user-role">{isDeveloperUser ? 'Developer' : 'Portal'} Workspace</span>
            </div>
          </div>
          <button type="button" className="mobile-sheet-close-btn" onClick={onClose} aria-label="Close navigation sheet">
            &times;
          </button>
        </div>

        <div className="mobile-sheet-search">
          <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" className="search-icon">
            <circle cx="9" cy="9" r="6" />
            <path d="M13.5 13.5L17 17" />
          </svg>
          <input
            type="text"
            placeholder="Search modules & pages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button type="button" className="clear-search" onClick={() => setSearchTerm('')}>
              &times;
            </button>
          )}
        </div>

        <div className="mobile-sheet-grid">
          {filteredItems.map((item) => {
            const isActive = location.pathname === item.path.split('?')[0];
            const addPath = resolveAddPath(item.path);
            return (
              <div
                key={item.path + item.label}
                className={`mobile-sheet-card ${isActive ? 'active' : ''}`}
                onClick={() => {
                  navigate(item.path);
                  onClose();
                }}
              >
                <div className="mobile-card-icon">
                  <MenuIcon />
                </div>
                <div className="mobile-card-info">
                  <span className="mobile-card-title">{item.label}</span>
                  <span className="mobile-card-group">{item.group}</span>
                </div>
                {item.canAdd && addPath && (
                  <button
                    type="button"
                    className="mobile-card-add-btn"
                    title={`Add ${item.label}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(addPath);
                      onClose();
                    }}
                  >
                    + Add
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
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
  if (pathname === '/role-assignment') return 'Role Management';
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

function ChevronIcon({ className = '' }) {
  return (
    <svg viewBox="0 0 20 20" width="16" height="16" fill="none" className={className} aria-hidden="true">
      <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default MainLayout;


