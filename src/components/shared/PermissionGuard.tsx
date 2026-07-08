/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * PermissionGuard — Reusable RBAC Guard Component
 * ─────────────────────────────────────────────────
 * Wraps any UI section and only renders its children when the current
 * user's role has the required permission(s).
 *
 * All Super Admin module pages should use this guard instead of
 * implementing inline role checks.
 *
 * Usage:
 *   <PermissionGuard permission="academic:write">
 *     <CreateButton />
 *   </PermissionGuard>
 *
 *   <PermissionGuard permission="users:delete" fallback={<ReadonlyBanner />}>
 *     <DeleteButton />
 *   </PermissionGuard>
 *
 *   <PermissionGuard permissions={['content:write', 'content:publish']} requireAll>
 *     <PublishButton />
 *   </PermissionGuard>
 */

import React from 'react';
import { ShieldX } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { hasPermission, hasAllPermissions, hasAnyPermission } from '../../config/rbac.config';
import type { Permission } from '../../types/rbac.types';

// ─────────────────────────────────────────────────────────────────────────────
//  Props
// ─────────────────────────────────────────────────────────────────────────────

interface PermissionGuardProps {
  /** Single permission to check */
  permission?: Permission;
  /** Multiple permissions to check (use with requireAll or requireAny) */
  permissions?: Permission[];
  /**
   * When using `permissions` array:
   * - requireAll=true → user must have ALL listed permissions
   * - requireAll=false (default) → user must have AT LEAST ONE
   */
  requireAll?: boolean;
  /** Minimum role level required (alternative to permission check) */
  minimumRole?: 'student' | 'teacher' | 'admin' | 'super_admin';
  /** Content to render when check passes */
  children: React.ReactNode;
  /**
   * Content to render when check fails.
   * Defaults to null (nothing rendered).
   * Pass `<AccessDeniedBanner />` for visible feedback.
   */
  fallback?: React.ReactNode;
  /**
   * When true, renders a full-page access denied state.
   * Use for top-level page guards.
   */
  fullPage?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
//  Default fallback for full-page access denied
// ─────────────────────────────────────────────────────────────────────────────

function AccessDeniedPage() {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-6 text-center space-y-5 animate-fade-in">
      <div className="h-16 w-16 rounded-3xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
        <ShieldX className="w-8 h-8 text-red-400" />
      </div>
      <div className="space-y-2 max-w-sm">
        <p className="text-base font-black text-slate-800 dark:text-white">Permission Denied</p>
        <p className="text-xs text-slate-400 leading-relaxed">
          Your current role does not have the required permissions to access this section.
          Contact a Super Admin to request elevated access.
        </p>
      </div>
      <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20">
        <div className="h-2 w-2 rounded-full bg-red-400" />
        <span className="text-[10px] font-black uppercase tracking-wider text-red-400">
          Access Restricted
        </span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  PermissionGuard
// ─────────────────────────────────────────────────────────────────────────────

export function PermissionGuard({
  permission,
  permissions,
  requireAll = false,
  children,
  fallback = null,
  fullPage = false,
}: PermissionGuardProps) {
  const { role } = useApp();

  // Evaluate the permission check
  let granted = false;

  if (permission) {
    // Single permission check
    granted = hasPermission(role, permission);
  } else if (permissions && permissions.length > 0) {
    // Multi-permission check
    granted = requireAll
      ? hasAllPermissions(role, permissions)
      : hasAnyPermission(role, permissions);
  } else {
    // No restriction specified — always grant
    granted = true;
  }

  if (granted) {
    return <>{children}</>;
  }

  // Not granted
  if (fullPage) {
    return <AccessDeniedPage />;
  }

  return <>{fallback}</>;
}
