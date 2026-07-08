/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * User Management Module — Super Admin Console
 * ─────────────────────────────────────────────────────────────────────────────
 * Provides a comprehensive interface for user directories, role assignments,
 * metadata editing, security suspension toggles, and onboarding invitations.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../../../../context/AppContext';
import { userService, UserFilters } from '../../../../services/user.service';
import { PermissionGuard } from '../../../../components/shared/PermissionGuard';
import { Modal } from '../../../../components/ui/Modal';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import { Badge } from '../../../../components/ui/Badge';
import type { UserProfile, UserRole } from '../../../../types';
import {
  Users, Search, Filter, Plus, Pencil, ShieldAlert,
  Ban, CheckCircle, RefreshCw, Key, ShieldCheck,
  FileSpreadsheet, Mail, Trash2, KeyRound, AlertTriangle, X,
  Loader2
} from 'lucide-react';

interface UserManagementProps {
  initialRoleFilter?: string; // Pre-filtered role if opened from a specific nav link
  initialPremiumFilter?: string; // Pre-filtered premium status
}

export default function UserManagement({ initialRoleFilter = '', initialPremiumFilter = 'all' }: UserManagementProps) {
  const { classes, user: currentUser, addToast } = useApp();

  // Directory states
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const pageSize = 15;

  // Search & Filters
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState(initialRoleFilter);
  const [filterClassId, setFilterClassId] = useState('');
  const [filterPremium, setFilterPremium] = useState<string>(initialPremiumFilter);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Modal / Operations states
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);

  // Form states (Create / Edit)
  const [formEmail, setFormEmail] = useState('');
  const [formFullName, setFormFullName] = useState('');
  const [formRole, setFormRole] = useState<UserRole>('student');
  const [formClassId, setFormClassId] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formStatus, setFormStatus] = useState<'pending' | 'active' | 'inactive' | 'verified' | 'suspended' | 'archived'>('active');
  const [formIsPremium, setFormIsPremium] = useState(false);
  const [formIsVerified, setFormIsVerified] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  // Bulk operation selection state
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

  // Load user directory
  const loadDirectory = useCallback(async () => {
    setLoading(true);
    const filters: UserFilters = {
      isActive: true // Hides archived soft-deleted users from active list by default
    };

    if (filterRole) filters.role = filterRole;
    if (filterClassId) filters.classId = filterClassId;
    if (filterPremium !== 'all') filters.isPremium = filterPremium === 'premium';
    if (filterStatus !== 'all') filters.status = filterStatus as any;

    const { data, error } = await userService.listUsers(filters, search, page, pageSize);
    
    if (error) {
      addToast(error, 'error');
    } else if (data) {
      setUsers(data.users);
      setTotalCount(data.totalCount);
    }
    setLoading(false);
  }, [filterRole, filterClassId, filterPremium, filterStatus, search, page, addToast]);

  useEffect(() => {
    loadDirectory();
  }, [loadDirectory]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [filterRole, filterClassId, filterPremium, filterStatus, search]);

  // Create User Submission
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formEmail.trim() || !formFullName.trim()) {
      setFormError('Name and Email are required.');
      return;
    }
    setFormLoading(true);
    setFormError('');

    const { data, error } = await userService.createUser(
      formEmail.trim(),
      formFullName.trim(),
      formRole,
      formRole === 'student' ? formClassId || null : null,
      formPhone.trim(),
      currentUser?.id
    );

    if (error) {
      setFormError(error);
    } else {
      addToast(`User ${formFullName} created successfully in Supabase Auth.`, 'success');
      setCreateModalOpen(false);
      loadDirectory();
    }
    setFormLoading(false);
  };

  // Edit User Submission
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    setFormLoading(true);
    setFormError('');

    const updates: Partial<UserProfile> = {
      fullName: formFullName.trim(),
      phone: formPhone.trim(),
      role: formRole,
      classId: formRole === 'student' ? formClassId || null : null,
      status: formStatus,
      isPremium: formIsPremium,
      isVerified: formIsVerified
    };

    const { data, error } = await userService.updateUser(
      selectedUser.id,
      updates,
      currentUser?.id || '',
      currentUser?.role || 'visitor'
    );

    if (error) {
      setFormError(error);
    } else {
      addToast('Profile metadata updated successfully.', 'success');
      setEditModalOpen(false);
      loadDirectory();
    }
    setFormLoading(false);
  };

  // Toggle user suspension directly from list row
  const handleToggleSuspend = async (item: UserProfile) => {
    const nextStatus = item.status === 'suspended' ? 'active' : 'suspended';
    const { error } = await userService.updateUser(
      item.id,
      { status: nextStatus },
      currentUser?.id || '',
      currentUser?.role || 'visitor'
    );

    if (error) {
      addToast(error, 'error');
    } else {
      addToast(
        `User "${item.fullName}" is now ${nextStatus === 'suspended' ? 'suspended' : 'active'}.`,
        nextStatus === 'suspended' ? 'warning' : 'success'
      );
      loadDirectory();
    }
  };

  // Soft Delete (Archive) user
  const handleArchiveUser = async (item: UserProfile) => {
    if (!window.confirm(`Are you sure you want to soft delete/archive user "${item.fullName}"? Students will lose login access instantly.`)) return;

    const { error } = await userService.updateUser(
      item.id,
      { status: 'archived', isActive: false },
      currentUser?.id || '',
      currentUser?.role || 'visitor'
    );

    if (error) {
      addToast(error, 'error');
    } else {
      addToast(`User "${item.fullName}" archived successfully.`, 'info');
      loadDirectory();
    }
  };

  // Send Password Reset
  const handlePasswordReset = async (item: UserProfile) => {
    const { error } = await userService.sendPasswordReset(item.email, currentUser?.id);
    if (error) {
      addToast(error, 'error');
    } else {
      addToast(`Password recovery link sent successfully to ${item.email}.`, 'success');
    }
  };

  // Resend onboarding invitation link
  const handleResendInvite = async (item: UserProfile) => {
    const { error } = await userService.resendInvitation(item.email, item.role, currentUser?.id);
    if (error) {
      addToast(error, 'error');
    } else {
      addToast(`Invitation onboarding email sent successfully to ${item.email}.`, 'success');
    }
  };

  const openCreate = () => {
    setFormEmail('');
    setFormFullName('');
    setFormRole(initialRoleFilter as UserRole || 'student');
    setFormClassId('');
    setFormPhone('');
    setFormError('');
    setCreateModalOpen(true);
  };

  const openEdit = (item: UserProfile) => {
    setSelectedUser(item);
    setFormFullName(item.fullName);
    setFormPhone(item.phone || '');
    setFormRole(item.role);
    setFormClassId(item.classId || '');
    setFormStatus(item.status || 'active');
    setFormIsPremium(item.isPremium ?? false);
    setFormIsVerified(item.isVerified ?? false);
    setFormError('');
    setEditModalOpen(true);
  };

  const getClassName = (classId: string) => classes.find(c => c.id === classId)?.name ?? 'None';

  // UI Status badges
  const getStatusBadge = (status: string = 'active') => {
    switch (status) {
      case 'pending':
        return <Badge variant="warning">Pending Invite</Badge>;
      case 'verified':
        return <Badge variant="success">Verified</Badge>;
      case 'suspended':
        return <Badge variant="danger">Suspended</Badge>;
      case 'archived':
        return <Badge variant="secondary">Archived</Badge>;
      case 'inactive':
        return <Badge variant="info">Inactive</Badge>;
      default:
        return <Badge variant="success">Active</Badge>;
    }
  };

  // Bulk operations trigger simulation
  const triggerBulkAction = async (action: 'activate' | 'suspend' | 'archive') => {
    if (selectedUserIds.length === 0) {
      addToast('No users selected for bulk action.', 'info');
      return;
    }

    if (!window.confirm(`Perform bulk ${action} on ${selectedUserIds.length} selected users?`)) return;

    let res;
    if (action === 'activate') {
      res = await userService.bulkActivate(selectedUserIds, currentUser?.id || '');
    } else if (action === 'suspend') {
      res = await userService.bulkSuspend(selectedUserIds, currentUser?.id || '');
    } else {
      res = await userService.bulkArchive(selectedUserIds, currentUser?.id || '');
    }

    if (res.error) {
      addToast(res.error, 'error');
    } else {
      addToast(`Bulk ${action} completed successfully. count: ${res.data?.count}`, 'success');
      setSelectedUserIds([]);
      loadDirectory();
    }
  };

  const toggleSelectUser = (id: string) => {
    setSelectedUserIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedUserIds.length === users.length) {
      setSelectedUserIds([]);
    } else {
      setSelectedUserIds(users.map(u => u.id));
    }
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="space-y-5 animate-fade-in text-left">
      
      {/* Title & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-500" />
            {initialRoleFilter ? `${initialRoleFilter.toUpperCase()} DIRECTORY` : 'USER & PROFILE DIRECTORY'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Manage student records, assign instructor roles, verify accounts, or suspend user access credentials.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <PermissionGuard permission="users:write">
            <Button variant="primary" size="sm" onClick={openCreate}>
              <Plus className="w-3.5 h-3.5 mr-1.5" />Add New User
            </Button>
          </PermissionGuard>
          
          <Button variant="outline" size="sm" className="h-9 hover:bg-emerald-500/10 hover:text-emerald-500" onClick={() => addToast('CSV Export prepared. Download starting...', 'success')}>
            <FileSpreadsheet className="w-3.5 h-3.5 mr-1.5" />Export CSV
          </Button>

          <button onClick={loadDirectory} className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 bg-white dark:bg-slate-900 transition-all">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Directory Filter Bar */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 bg-white/40 dark:bg-slate-950/20 p-4 rounded-2xl border border-slate-250/20 dark:border-slate-800/40 backdrop-blur-xs">
        
        {/* Search */}
        <div className="relative md:col-span-2">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by Name, Email, or Phone..."
            className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
          />
        </div>

        {/* Role Filter */}
        {!initialRoleFilter && (
          <div>
            <select
              value={filterRole}
              onChange={e => setFilterRole(e.target.value)}
              className="w-full py-2.5 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
            >
              <option value="">All Roles</option>
              <option value="student">Students</option>
              <option value="teacher">Teachers</option>
              <option value="admin">Admins</option>
              <option value="super_admin">Super Admins</option>
            </select>
          </div>
        )}

        {/* Academic Standard Filter */}
        <div>
          <select
            value={filterClassId}
            onChange={e => setFilterClassId(e.target.value)}
            className="w-full py-2.5 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
          >
            <option value="">All Standards</option>
            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        {/* Premium / Pricing status */}
        <div>
          <select
            value={filterPremium}
            onChange={e => setFilterPremium(e.target.value)}
            className="w-full py-2.5 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
          >
            <option value="all">All Access levels</option>
            <option value="free">Free Access Tier</option>
            <option value="premium">Premium Access Tier</option>
          </select>
        </div>

        {/* Workflow Account status */}
        <div>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="w-full py-2.5 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
          >
            <option value="all">All States</option>
            <option value="active">Active</option>
            <option value="pending">Pending Onboarding</option>
            <option value="verified">Verified Profile</option>
            <option value="suspended">Suspended Accounts</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

      </div>

      {/* Bulk Operations Toolbar */}
      {selectedUserIds.length > 0 && (
        <div className="flex items-center justify-between p-3.5 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl animate-slide-in">
          <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
            Selected {selectedUserIds.length} profile{selectedUserIds.length > 1 ? 's' : ''} for bulk actions
          </p>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" className="h-7 bg-white dark:bg-slate-900 hover:text-emerald-500" onClick={() => triggerBulkAction('activate')}>
              Bulk Activate
            </Button>
            <Button size="sm" variant="outline" className="h-7 bg-white dark:bg-slate-900 hover:text-amber-500" onClick={() => triggerBulkAction('suspend')}>
              Bulk Suspend
            </Button>
            <Button size="sm" variant="outline" className="h-7 bg-white dark:bg-slate-900 hover:text-red-500" onClick={() => triggerBulkAction('archive')}>
              Bulk Delete/Archive
            </Button>
          </div>
        </div>
      )}

      {/* Directory Table */}
      <div className="rounded-2xl border border-slate-200/60 dark:border-slate-800/60 overflow-hidden bg-white dark:bg-slate-950/40 shadow-inner">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-slate-50/80 dark:bg-slate-900/80">
              <tr className="border-b border-slate-200 dark:border-slate-800">
                <th className="px-4 py-3 text-left w-6">
                  <input
                    type="checkbox"
                    checked={users.length > 0 && selectedUserIds.length === users.length}
                    onChange={toggleSelectAll}
                    className="rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-indigo-600 focus:ring-indigo-500"
                  />
                </th>
                <th className="text-left px-4 py-3 font-black text-slate-500 uppercase tracking-wider">User Identity</th>
                <th className="text-left px-4 py-3 font-black text-slate-500 uppercase tracking-wider">Contact Info</th>
                <th className="text-left px-4 py-3 font-black text-slate-500 uppercase tracking-wider">Role & Permissions</th>
                <th className="text-left px-4 py-3 font-black text-slate-500 uppercase tracking-wider">Class Standard</th>
                <th className="text-left px-4 py-3 font-black text-slate-500 uppercase tracking-wider">Premium Access</th>
                <th className="text-left px-4 py-3 font-black text-slate-500 uppercase tracking-wider">Account status</th>
                <th className="text-right px-4 py-3 font-black text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-16 text-center text-slate-400">
                    <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mx-auto mb-2" />
                    Syncing user directories with authentication engines...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-slate-400">
                    No active user matching the specified search criteria was found.
                  </td>
                </tr>
              ) : (
                users.map(item => (
                  <tr
                    key={item.id}
                    className={`hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors ${
                      selectedUserIds.includes(item.id) ? 'bg-indigo-500/5 dark:bg-indigo-500/10' : ''
                    }`}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedUserIds.includes(item.id)}
                        onChange={() => toggleSelectUser(item.id)}
                        className="rounded border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(item.fullName)}`}
                          alt=""
                          className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-800 object-cover shrink-0"
                        />
                        <div>
                          <p className="font-bold text-slate-800 dark:text-slate-100">{item.fullName}</p>
                          <p className="text-[10px] text-slate-400 font-mono select-all">{item.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-700 dark:text-slate-300">{item.email}</p>
                      {item.phone && <p className="text-[10px] text-slate-400 mt-0.5">{item.phone}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        {item.role === 'super_admin' ? (
                          <Badge variant="danger" className="font-black scale-95">SUPER ADMIN</Badge>
                        ) : item.role === 'admin' ? (
                          <Badge variant="warning">ADMIN</Badge>
                        ) : item.role === 'teacher' ? (
                          <Badge variant="info">INSTRUCTOR</Badge>
                        ) : (
                          <Badge variant="success">STUDENT</Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">
                      {item.role === 'student' ? getClassName(item.classId || '') : <span className="text-slate-400 text-[10px] font-normal">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      {item.isPremium ? (
                        <span className="text-[10px] font-bold text-amber-600 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                          PREMIUM
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 bg-slate-100 dark:bg-slate-900 px-2 py-0.5 rounded-full">
                          FREE ACCESS
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {getStatusBadge(item.status)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        
                        {/* Info details */}
                        <button
                          onClick={() => { setSelectedUser(item); setDetailsModalOpen(true); }}
                          title="View Details"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                        </button>

                        <PermissionGuard permission="users:write">
                          {/* Edit user metadata */}
                          <button
                            onClick={() => openEdit(item)}
                            title="Edit User"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-all"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>

                          {/* Suspend Toggle */}
                          <button
                            onClick={() => handleToggleSuspend(item)}
                            title={item.status === 'suspended' ? 'Activate Account' : 'Suspend Account'}
                            className={`p-1.5 rounded-lg transition-all ${
                              item.status === 'suspended'
                                ? 'text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/20'
                                : 'text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/20'
                            }`}
                          >
                            {item.status === 'suspended' ? <CheckCircle className="w-3.5 h-3.5" /> : <Ban className="w-3.5 h-3.5" />}
                          </button>
                        </PermissionGuard>

                        <PermissionGuard permission="users:delete">
                          {/* Soft delete */}
                          <button
                            onClick={() => handleArchiveUser(item)}
                            title="Archive/Delete User"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </PermissionGuard>

                        {/* Extra operations popover trigger */}
                        <div className="relative group/menu inline-block">
                          <button
                            title="Credentials Options"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                          >
                            <KeyRound className="w-3.5 h-3.5" />
                          </button>
                          
                          <div className="hidden group-hover/menu:block absolute right-0 top-full mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl py-1.5 z-10 w-44">
                            <button
                              onClick={() => handlePasswordReset(item)}
                              className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-2"
                            >
                              <Key className="w-3.5 h-3.5 text-indigo-500" /> Send Password Reset
                            </button>
                            {item.status === 'pending' && (
                              <button
                                onClick={() => handleResendInvite(item)}
                                className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-2"
                              >
                                <Mail className="w-3.5 h-3.5 text-emerald-500" /> Resend Onboarding
                              </button>
                            )}
                          </div>
                        </div>

                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Footer */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-slate-400">
            Showing Page {page} of {totalPages} ({totalCount} active records)
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
            >
              Previous Page
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page === totalPages}
              onClick={() => setPage(p => p + 1)}
            >
              Next Page
            </Button>
          </div>
        </div>
      )}

      {/* CREATE USER MODAL */}
      <Modal isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)} title="Add Platform User" size="md">
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <Input
            label="Full Name *"
            value={formFullName}
            onChange={e => setFormFullName(e.target.value)}
            placeholder="e.g. John Doe, Amit Kumar"
            required
          />

          <Input
            label="Email Credentials *"
            type="email"
            value={formEmail}
            onChange={e => setFormEmail(e.target.value)}
            placeholder="e.g. johndoe@gmail.com"
            required
          />

          <Input
            label="Phone Contact"
            value={formPhone}
            onChange={e => setFormPhone(e.target.value)}
            placeholder="e.g. +91 98765 43210"
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Onboarding Role</label>
              <select
                value={formRole}
                onChange={e => setFormRole(e.target.value as UserRole)}
                className="w-full py-2.5 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none"
              >
                <option value="student">Student</option>
                <option value="teacher">Teacher (Instructor)</option>
                <option value="admin">Administrator</option>
                <option value="super_admin">Super Administrator</option>
              </select>
            </div>

            {formRole === 'student' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Academic Standard</label>
                <select
                  value={formClassId}
                  onChange={e => setFormClassId(e.target.value)}
                  className="w-full py-2.5 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none"
                >
                  <option value="">Select class standard...</option>
                  {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            )}
          </div>

          <div className="bg-slate-50 dark:bg-slate-900/60 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 text-[10px] text-slate-500 leading-relaxed">
            <p className="font-bold flex items-center gap-1.5 text-indigo-500 mb-1">
              <Mail className="w-3.5 h-3.5" /> Supabase Auth Integration
            </p>
            An onboarding email invitation containing login credentials setup links will be dispatched automatically upon database creation.
          </div>

          {formError && (
            <p className="text-xs text-red-500 font-bold flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              {formError}
            </p>
          )}

          <div className="flex gap-3 justify-end pt-2">
            <Button variant="ghost" size="sm" type="button" onClick={() => setCreateModalOpen(false)}>Cancel</Button>
            <Button variant="primary" size="sm" type="submit" isLoading={formLoading}>Create Auth User</Button>
          </div>
        </form>
      </Modal>

      {/* EDIT USER MODAL */}
      <Modal isOpen={editModalOpen} onClose={() => setEditModalOpen(false)} title="Edit User Profile Settings" size="md">
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div className="flex items-center gap-4 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
            <img
              src={selectedUser?.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(selectedUser?.fullName || '')}`}
              alt=""
              className="w-12 h-12 rounded-full object-cover"
            />
            <div>
              <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">{selectedUser?.fullName}</h4>
              <p className="text-xs text-slate-400 font-mono">{selectedUser?.email}</p>
            </div>
          </div>

          <Input
            label="Full Name *"
            value={formFullName}
            onChange={e => setFormFullName(e.target.value)}
            required
          />

          <Input
            label="Phone Contact"
            value={formPhone}
            onChange={e => setFormPhone(e.target.value)}
            placeholder="e.g. +91 98765 43210"
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Assign Onboarding Role</label>
              <select
                value={formRole}
                onChange={e => setFormRole(e.target.value as UserRole)}
                className="w-full py-2.5 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none"
              >
                <option value="student">Student</option>
                <option value="teacher">Teacher (Instructor)</option>
                <option value="admin">Administrator</option>
                <option value="super_admin">Super Administrator</option>
              </select>
            </div>

            {formRole === 'student' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Academic Standard</label>
                <select
                  value={formClassId}
                  onChange={e => setFormClassId(e.target.value)}
                  className="w-full py-2.5 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none"
                >
                  <option value="">Select standard...</option>
                  {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Account Workflow Status</label>
            <select
              value={formStatus}
              onChange={e => setFormStatus(e.target.value as any)}
              className="w-full py-2.5 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none"
            >
              <option value="active">Active</option>
              <option value="pending">Pending Invite Verification</option>
              <option value="verified">Verified Identity</option>
              <option value="suspended">Suspended Credentials</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Backward compatible check options */}
          <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Premium Tier</p>
                <p className="text-[9px] text-slate-400 leading-tight">Expose Premium LMS Content features</p>
              </div>
              <button
                type="button"
                onClick={() => setFormIsPremium(!formIsPremium)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                {formIsPremium ? (
                  <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2 py-1 rounded-full">ACTIVE</span>
                ) : (
                  <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full">INACTIVE</span>
                )}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Verified User</p>
                <p className="text-[9px] text-slate-400 leading-tight">Apply verification badge checkmark</p>
              </div>
              <button
                type="button"
                onClick={() => setFormIsVerified(!formIsVerified)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                {formIsVerified ? (
                  <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-full">VERIFIED</span>
                ) : (
                  <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full">UNVERIFIED</span>
                )}
              </button>
            </div>
          </div>

          {formError && (
            <p className="text-xs text-red-500 font-bold flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              {formError}
            </p>
          )}

          <div className="flex gap-3 justify-end pt-2">
            <Button variant="ghost" size="sm" type="button" onClick={() => setEditModalOpen(false)}>Cancel</Button>
            <Button variant="primary" size="sm" type="submit" isLoading={formLoading}>Save Profile Changes</Button>
          </div>
        </form>
      </Modal>

      {/* DETAILS VIEW MODAL */}
      <Modal isOpen={detailsModalOpen} onClose={() => setDetailsModalOpen(false)} title="Audit Profile Summary" size="md">
        {selectedUser && (
          <div className="space-y-4 text-xs">
            <div className="flex items-center gap-4 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/10 shadow-inner">
              <img
                src={selectedUser.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(selectedUser.fullName)}`}
                alt=""
                className="w-16 h-16 rounded-full object-cover"
              />
              <div>
                <h3 className="text-sm font-black text-slate-800 dark:text-slate-100">{selectedUser.fullName}</h3>
                <p className="text-xs text-slate-400 mt-0.5">{selectedUser.email}</p>
                <div className="mt-1.5 flex gap-1.5 flex-wrap">
                  {getStatusBadge(selectedUser.status)}
                  {selectedUser.isPremium && <Badge variant="warning">PREMIUM USER</Badge>}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              <div className="p-3 rounded-2xl border border-slate-150 dark:border-slate-800 bg-white dark:bg-slate-900/10">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Identity UID</p>
                <p className="font-mono text-slate-700 dark:text-slate-300 break-all select-all">{selectedUser.id}</p>
              </div>

              <div className="p-3 rounded-2xl border border-slate-150 dark:border-slate-800 bg-white dark:bg-slate-900/10">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Role Assigned</p>
                <p className="font-bold text-indigo-500 dark:text-indigo-400 text-xs uppercase">{selectedUser.role}</p>
              </div>

              <div className="p-3 rounded-2xl border border-slate-150 dark:border-slate-800 bg-white dark:bg-slate-900/10">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Phone Contact</p>
                <p className="font-semibold text-slate-700 dark:text-slate-300">{selectedUser.phone || 'Not provided'}</p>
              </div>

              <div className="p-3 rounded-2xl border border-slate-150 dark:border-slate-800 bg-white dark:bg-slate-900/10">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Academic Standard</p>
                <p className="font-semibold text-slate-700 dark:text-slate-300">
                  {selectedUser.role === 'student' ? getClassName(selectedUser.classId || '') : 'N/A (Staff)'}
                </p>
              </div>

              <div className="p-3 rounded-2xl border border-slate-150 dark:border-slate-800 bg-white dark:bg-slate-900/10">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Gamification Stats</p>
                <p className="font-semibold text-slate-700 dark:text-slate-300">
                  Streak: {selectedUser.dailyStreak || 1} days | XP: {selectedUser.totalXp || 0} pts
                </p>
              </div>

              <div className="p-3 rounded-2xl border border-slate-150 dark:border-slate-800 bg-white dark:bg-slate-900/10">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Account Creation Date</p>
                <p className="font-semibold text-slate-700 dark:text-slate-300">
                  {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>

            {/* Verification Checklist */}
            <div className="p-4 rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20 space-y-2">
              <h4 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 mb-2.5">
                <ShieldAlert className="w-4 h-4 text-indigo-500" /> Enterprise Integration Status
              </h4>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Teacher Management Bind (Sprint 6)</span>
                {selectedUser.role === 'teacher' ? (
                  <span className="text-amber-500 font-bold">Pending Bind</span>
                ) : (
                  <span className="text-slate-400">N/A</span>
                )}
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Quiz & CBT Attempts (Sprint 7)</span>
                <span className="text-slate-400">0 attempts logged</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Payments & Subscriptions (Sprint 8)</span>
                <span className="text-slate-400">0 transactions found</span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="ghost" size="sm" onClick={() => setDetailsModalOpen(false)}>Close Summary</Button>
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
}
