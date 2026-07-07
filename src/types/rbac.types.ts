/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * RBAC Type Definitions
 * ─────────────────────
 * Defines permissions, role capability matrices, and related types
 * for the Role-Based Access Control system.
 *
 * These types are consumed by:
 *  - config/rbac.config.ts  (permission matrix)
 *  - Super Admin → Roles & Permissions module
 *  - Route guards in App.tsx
 */

/** All five roles in the RK Coaching LMS hierarchy */
export type UserRole = 'visitor' | 'student' | 'teacher' | 'admin' | 'super_admin';

/** All granular permission keys available in the system */
export type Permission =
  // Academic
  | 'academic:read'
  | 'academic:write'
  | 'academic:delete'
  // Content
  | 'content:read'
  | 'content:write'
  | 'content:publish'
  | 'content:delete'
  // Users
  | 'users:read'
  | 'users:write'
  | 'users:delete'
  | 'users:assign_role'
  // Payments
  | 'payments:read'
  | 'payments:configure'
  // Analytics
  | 'analytics:read'
  // System
  | 'settings:read'
  | 'settings:write'
  | 'feature_flags:manage'
  | 'activity_logs:read'
  // Communications
  | 'announcements:write';

/** Maps each role to its set of granted permissions */
export type RolePermissionMap = Record<UserRole, ReadonlyArray<Permission>>;

/** A single permission definition entry (for display in the admin UI) */
export interface PermissionDefinition {
  key: Permission;
  label: string;
  description: string;
  category: 'Academic' | 'Content' | 'Users' | 'Payments' | 'Analytics' | 'System' | 'Communications';
}

/** Content lifecycle states for educational resources */
export type ContentStatus = 'draft' | 'review' | 'published' | 'archived';

/** Activity log entry for admin audit trail */
export interface ActivityLog {
  id: string;
  userId: string;
  userRole: UserRole;
  action: string;
  resource: string;
  resourceId?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

/** Premium package definition (for Super Admin to configure) */
export interface PremiumPackage {
  id: string;
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  durationDays?: number; // null = lifetime
  features: string[];
  isActive: boolean;
  createdAt: string;
}
