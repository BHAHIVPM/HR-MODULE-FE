/**
 * Centralized Role Category & User Type hierarchy source of truth across the HR Module.
 *
 * Ensures consistent options and logged-in user hierarchy enforcement across:
 * - User Management
 * - User Registration
 * - Role Creation & Management
 * - User Role Assignments
 */

export const USER_TYPE_LABELS = {
  DEVELOPER: 'Developer',
  SUPERADMIN: 'SuperAdmin',
  ADMIN: 'Admin',
  EMPLOYEE: 'Employee',
  USER: 'User',
};

// ---------------------------------------------------------------------------
// 1. User Creation Hierarchy (Strict 1-level creation tree)
// ---------------------------------------------------------------------------
// DEVELOPER  -> SUPERADMIN
// SUPERADMIN -> ADMIN
// ADMIN      -> USER
export const CREATABLE_USER_TYPES = {
  DEVELOPER: ['SUPERADMIN'],
  SUPERADMIN: ['ADMIN'],
  ADMIN: ['USER'],
};

// Fallback option list when logged-in user type is not yet known
export const UNCLASSIFIED_LOGIN_USER_TYPES = ['ADMIN', 'EMPLOYEE', 'USER'];

// ---------------------------------------------------------------------------
// 2. Role Creation & Management Hierarchy
// ---------------------------------------------------------------------------
// Defines which role categories a logged-in user can create, assign, or view.
export const MANAGABLE_ROLE_CATEGORIES = {
  DEVELOPER: [
    { value: 'SUPERADMIN', label: 'SuperAdmin' },
    { value: 'ADMIN', label: 'Admin' },
    { value: 'EMPLOYEE', label: 'Employee' },
    { value: 'USER', label: 'User' },
  ],
  SUPERADMIN: [
    { value: 'ADMIN', label: 'Admin' },
    { value: 'EMPLOYEE', label: 'Employee' },
    { value: 'USER', label: 'User' },
  ],
  ADMIN: [
    { value: 'EMPLOYEE', label: 'Employee' },
    { value: 'USER', label: 'User' },
  ],
  EMPLOYEE: [
    { value: 'USER', label: 'User' },
  ],
  USER: [
    { value: 'USER', label: 'User' },
  ],
};

export const DEFAULT_ROLE_CATEGORIES = [
  { value: 'SUPERADMIN', label: 'SuperAdmin' },
  { value: 'ADMIN', label: 'Admin' },
  { value: 'EMPLOYEE', label: 'Employee' },
  { value: 'USER', label: 'User' },
];

/**
 * Normalizes userType / roleCategory string to uppercase trimmed value.
 */
export const normalizeRoleCategory = (value) =>
  value === null || value === undefined ? '' : String(value).trim().toUpperCase();

/**
 * Gets human-readable label for a role category or user type.
 */
export const getRoleCategoryLabel = (value) => {
  const norm = normalizeRoleCategory(value);
  return USER_TYPE_LABELS[norm] || value || '';
};

/**
 * Gets creatable user types for user registration (strict creation hierarchy).
 */
export const getAllowedCreatableUserTypes = (currentUserType) => {
  const loginType = normalizeRoleCategory(currentUserType);
  if (!loginType) return null;
  return CREATABLE_USER_TYPES[loginType] || [];
};

/**
 * Gets manageable role categories for Role Creation & Role Assignment.
 *
 * @param {string|null|undefined} currentUserType Logged-in user type
 * @returns {{ value: string, label: string }[]} List of allowed category objects
 */
export const getAllowedRoleCategories = (currentUserType) => {
  const loginType = normalizeRoleCategory(currentUserType);
  if (!loginType) return DEFAULT_ROLE_CATEGORIES;
  return MANAGABLE_ROLE_CATEGORIES[loginType] || DEFAULT_ROLE_CATEGORIES;
};

/**
 * Gets manageable role category string values (e.g. ['ADMIN', 'EMPLOYEE', 'USER']).
 */
export const getAllowedRoleCategoryValues = (currentUserType) => {
  return getAllowedRoleCategories(currentUserType).map((cat) => cat.value);
};
