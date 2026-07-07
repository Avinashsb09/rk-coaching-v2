/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * RBAC Configuration — Permission Matrix
 * ────────────────────────────────────────
 * Defines which permissions are granted to each role.
 * This is the single source of truth for authorization decisions.
 *
 * Usage in components:
 *   import { hasPermission } from '../../config/rbac.config';
 *   if (!hasPermission(role, 'content:publish')) return <Forbidden />;
 */

import type { Permission, RolePermissionMap, UserRole } from '../types/rbac.types';

/** Complete role → permission mapping */
export const ROLE_PERMISSIONS: RolePermissionMap = {
  visitor: [],

  student: [
    'academic:read',
    'content:read',
    'analytics:read', // own progress only
  ],

  teacher: [
    'academic:read',
    'content:read',
    'content:write',
    'analytics:read',
    'announcements:write',
  ],

  admin: [
    'academic:read',
    'academic:write',
    'academic:delete',
    'content:read',
    'content:write',
    'content:publish',
    'content:delete',
    'users:read',
    'users:write',
    'payments:read',
    'analytics:read',
    'settings:read',
    'activity_logs:read',
    'announcements:write',
  ],

  super_admin: [
    'academic:read',
    'academic:write',
    'academic:delete',
    'content:read',
    'content:write',
    'content:publish',
    'content:delete',
    'users:read',
    'users:write',
    'users:delete',
    'users:assign_role',
    'payments:read',
    'payments:configure',
    'analytics:read',
    'settings:read',
    'settings:write',
    'feature_flags:manage',
    'activity_logs:read',
    'announcements:write',
  ],
} as const;

/**
 * Check whether a role has a specific permission.
 * Use this in route guards and component-level conditionals.
 *
 * @example
 *   hasPermission('admin', 'users:delete')  // false
 *   hasPermission('super_admin', 'users:delete')  // true
 */
export function hasPermission(role: UserRole, permission: Permission): boolean {
  return (ROLE_PERMISSIONS[role] as ReadonlyArray<Permission>).includes(permission);
}

/**
 * Check whether a role has ALL listed permissions.
 */
export function hasAllPermissions(role: UserRole, permissions: Permission[]): boolean {
  return permissions.every(p => hasPermission(role, p));
}

/**
 * Check whether a role has ANY of the listed permissions.
 */
export function hasAnyPermission(role: UserRole, permissions: Permission[]): boolean {
  return permissions.some(p => hasPermission(role, p));
}

/**
 * Route guard helper — returns true if the role meets the minimum required role.
 * Role hierarchy: visitor < student < teacher < admin < super_admin
 */
const ROLE_RANK: Record<UserRole, number> = {
  visitor:     0,
  student:     1,
  teacher:     2,
  admin:       3,
  super_admin: 4,
};

export function meetsMinimumRole(userRole: UserRole, minimumRole: UserRole): boolean {
  return ROLE_RANK[userRole] >= ROLE_RANK[minimumRole];
}
