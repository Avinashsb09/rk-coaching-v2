/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Identity & User Management Service — Supabase-First with LocalStorage fallback
 * ─────────────────────────────────────────────────────────────────────────────
 * Implements CRUD, safety blocks against self-lockout, unified status modeling,
 * server-side pagination stubs, and auditing activity log hooks.
 */

import { getSupabase, isSupabaseConfigured } from '../lib/supabase';
import type { UserProfile, UserRole } from '../types';

async function logActivity(payload: {
  userId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  metadata?: Record<string, any>;
}) {
  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabase() as any;
      let userRole = 'visitor';
      
      // Fetch role of acting user
      if (payload.userId) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', payload.userId)
          .single();
        if (profile) userRole = profile.role;
      }

      await supabase.from('activity_logs').insert({
        userId: payload.userId,
        userRole,
        action: payload.action,
        resource: payload.resource,
        resourceId: payload.resourceId,
        metadata: payload.metadata
      });
    } catch (e) {
      console.warn('Failed to insert audit activity log:', e);
    }
  } else {
    // Log to console in mock dev mode
    console.log(`[Activity Log Mock] User ${payload.userId} performed action "${payload.action}" on resource "${payload.resource}" (${payload.resourceId})`, payload.metadata);
  }
}

export interface UserFilters {
  role?: string;
  classId?: string;
  isPremium?: boolean;
  isSuspended?: boolean;
  isVerified?: boolean;
  isActive?: boolean;
  status?: 'pending' | 'active' | 'inactive' | 'verified' | 'suspended' | 'archived';
}

export interface ServiceResult<T> {
  data: T | null;
  error: string | null;
}

export const userService = {
  /**
   * Fetches users matching filters with pagination and search.
   * Supabase-first query with client-side filters for local mock mode.
   */
  async listUsers(
    filters: UserFilters = {},
    search: string = '',
    page: number = 1,
    pageSize: number = 20
  ): Promise<ServiceResult<{ users: UserProfile[]; totalCount: number }>> {
    const fromIndex = (page - 1) * pageSize;
    const toIndex = fromIndex + pageSize - 1;

    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabase() as any;
        let query = supabase
          .from('profiles')
          .select('*', { count: 'exact' });

        // Apply filters
        if (filters.isActive !== undefined) query = query.eq('isActive', filters.isActive);
        if (filters.isPremium !== undefined) query = query.eq('isPremium', filters.isPremium);
        if (filters.isSuspended !== undefined) query = query.eq('isSuspended', filters.isSuspended);
        if (filters.isVerified !== undefined) query = query.eq('isVerified', filters.isVerified);
        if (filters.classId) query = query.eq('classId', filters.classId);
        if (filters.role) query = query.eq('role', filters.role);
        if (filters.status) query = query.eq('status', filters.status);

        // Apply search by Name, Email, Phone
        if (search.trim()) {
          const s = `%${search.trim()}%`;
          query = query.or(`fullName.ilike.${s},email.ilike.${s},phone.ilike.${s}`);
        }

        // Apply pagination
        query = query
          .order('createdAt', { ascending: false })
          .range(fromIndex, toIndex);

        const { data, count, error } = await query;
        if (error) return { data: null, error: error.message };

        // Map database fields to UserProfile
        const users: UserProfile[] = (data || []).map((p: any) => ({
          id: p.id,
          email: p.email,
          fullName: p.fullName || 'Scholar',
          role: p.role,
          avatarUrl: p.avatarUrl,
          dailyStreak: p.dailyStreak || 1,
          totalXp: p.totalXp || 0,
          badges: p.badges || [],
          classId: p.classId,
          phone: p.phone,
          schoolName: p.schoolName,
          address: p.address,
          state: p.state,
          district: p.district,
          status: p.status || 'active',
          isVerified: p.isVerified ?? false,
          isSuspended: p.isSuspended ?? false,
          isPremium: p.isPremium ?? false,
          isActive: p.isActive ?? true,
          archivedAt: p.archivedAt,
          createdAt: p.createdAt
        }));

        return {
          data: {
            users,
            totalCount: count ?? users.length
          },
          error: null
        };
      } catch (err: any) {
        return { data: null, error: err.message || 'Supabase exception during fetch' };
      }
    }

    // Mock mode fallback using localStorage
    let mockProfiles: UserProfile[] = [];
    try {
      const stored = localStorage.getItem('rk_mock_profiles');
      if (stored) {
        mockProfiles = JSON.parse(stored);
      } else {
        // Init default mock profiles
        mockProfiles = [
          {
            id: '00000000-0000-0000-0000-000000000001',
            email: 'student@rkcoaching.com',
            fullName: 'Aarav Sharma',
            role: 'student',
            dailyStreak: 5,
            totalXp: 1250,
            badges: ['streak_5'],
            classId: 'class-10',
            phone: '9876543210',
            status: 'active',
            isVerified: true,
            isSuspended: false,
            isPremium: false,
            isActive: true,
            createdAt: new Date().toISOString()
          },
          {
            id: '00000000-0000-0000-0000-000000000002',
            email: 'teacher@rkcoaching.com',
            fullName: 'Prof. Rajesh Khanna',
            role: 'teacher',
            dailyStreak: 12,
            totalXp: 5400,
            badges: ['pioneer'],
            phone: '8765432109',
            status: 'verified',
            isVerified: true,
            isSuspended: false,
            isPremium: true,
            isActive: true,
            createdAt: new Date().toISOString()
          },
          {
            id: '00000000-0000-0000-0000-000000000003',
            email: 'admin@rkcoaching.com',
            fullName: 'RK Admin Control',
            role: 'admin',
            dailyStreak: 154,
            totalXp: 99999,
            badges: ['founder'],
            status: 'active',
            isVerified: true,
            isSuspended: false,
            isPremium: false,
            isActive: true,
            createdAt: new Date().toISOString()
          },
          {
            id: '00000000-0000-0000-0000-000000000004',
            email: 'superadmin@rkcoaching.com',
            fullName: 'RK Super Admin',
            role: 'super_admin',
            dailyStreak: 365,
            totalXp: 999999,
            badges: ['founder', 'platform_owner'],
            status: 'verified',
            isVerified: true,
            isSuspended: false,
            isPremium: true,
            isActive: true,
            createdAt: new Date().toISOString()
          }
        ];
        localStorage.setItem('rk_mock_profiles', JSON.stringify(mockProfiles));
      }
    } catch {
      mockProfiles = [];
    }

    // Apply mock filtering
    let filtered = mockProfiles;

    if (filters.isActive !== undefined) filtered = filtered.filter(u => u.isActive === filters.isActive);
    if (filters.isPremium !== undefined) filtered = filtered.filter(u => u.isPremium === filters.isPremium);
    if (filters.isSuspended !== undefined) filtered = filtered.filter(u => u.isSuspended === filters.isSuspended);
    if (filters.isVerified !== undefined) filtered = filtered.filter(u => u.isVerified === filters.isVerified);
    if (filters.classId) filtered = filtered.filter(u => u.classId === filters.classId);
    if (filters.role) filtered = filtered.filter(u => u.role === filters.role);
    if (filters.status) filtered = filtered.filter(u => u.status === filters.status);

    if (search.trim()) {
      const s = search.toLowerCase().trim();
      filtered = filtered.filter(
        u =>
          u.fullName.toLowerCase().includes(s) ||
          u.email.toLowerCase().includes(s) ||
          (u.phone && u.phone.includes(s))
      );
    }

    // Pagination slice
    const totalCount = filtered.length;
    const paginated = filtered.slice(fromIndex, fromIndex + pageSize);

    return {
      data: {
        users: paginated,
        totalCount
      },
      error: null
    };
  },

  /**
   * Registers a user in Supabase Auth, which triggers auto-profile generation.
   * If offline, stores directly in mock localStorage list.
   */
  async createUser(
    email: string,
    fullName: string,
    role: UserRole,
    classId: string | null = null,
    phone: string = '',
    currentUserId?: string
  ): Promise<ServiceResult<UserProfile>> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabase() as any;

        // Secure flow: create user in auth.users.
        // In client-side setups without service key access, we trigger signUp.
        // It triggers invitation emails or email confirmation.
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password: `TempPass_${Math.random().toString(36).slice(-8)}!`, // Temporary random password
          options: {
            data: {
              fullName,
              role,
              classId,
              phone
            }
          }
        });

        if (authError) return { data: null, error: authError.message };
        if (!authData.user) return { data: null, error: 'Auth user creation failed.' };

        // Wait brief instant for trigger to create profile row, then update phone/details
        const authUser = authData.user;
        const { data: updatedProfile, error: profileErr } = await supabase
          .from('profiles')
          .update({
            fullName,
            role,
            classId,
            phone,
            status: 'pending', // Starts in pending invitation onboarding status
            isActive: true,
            isVerified: false,
            isSuspended: false
          })
          .eq('id', authUser.id)
          .select('*')
          .single();

        if (profileErr) {
          console.warn('Sync insert fallback required:', profileErr.message);
          // Force manual row insertion if database sync trigger was missing or slow
          const { data: manualProfile, error: manualErr } = await supabase
            .from('profiles')
            .insert({
              id: authUser.id,
              email,
              fullName,
              role,
              classId,
              phone,
              status: 'pending',
              isActive: true,
              isVerified: false,
              isSuspended: false
            })
            .select('*')
            .single();

          if (manualErr) return { data: null, error: manualErr.message };
          return { data: manualProfile, error: null };
        }

        // Centralized Log Activity
        await logActivity({
          userId: currentUserId,
          action: 'CREATE',
          resource: 'user',
          resourceId: authUser.id,
          metadata: { email, fullName, role, classId }
        });

        return { data: updatedProfile, error: null };
      } catch (err: any) {
        return { data: null, error: err.message || 'Supabase auth creation exception' };
      }
    }

    // Mock mode user registration
    const mockId = `mock-uid-${Math.random().toString(36).substring(2, 9)}`;
    const newProfile: UserProfile = {
      id: mockId,
      email,
      fullName,
      role,
      classId,
      phone,
      dailyStreak: 1,
      totalXp: 0,
      badges: [],
      status: 'pending',
      isVerified: false,
      isSuspended: false,
      isActive: true,
      createdAt: new Date().toISOString()
    };

    try {
      const stored = localStorage.getItem('rk_mock_profiles');
      const list = stored ? JSON.parse(stored) : [];
      list.push(newProfile);
      localStorage.setItem('rk_mock_profiles', JSON.stringify(list));

      // Centralized Log Activity
      await logActivity({
        userId: currentUserId,
        action: 'CREATE',
        resource: 'user',
        resourceId: mockId,
        metadata: { email, fullName, role, classId }
      });
    } catch (e) {
      return { data: null, error: 'Failed to write mock profile' };
    }

    return { data: newProfile, error: null };
  },

  /**
   * Updates an existing profile, enforcing Super Admin safety locks.
   */
  async updateUser(
    targetUserId: string,
    updates: Partial<UserProfile>,
    currentUserId: string,
    currentRole: UserRole
  ): Promise<ServiceResult<UserProfile>> {
    // 1. SAFETY LOCK: Retrieve target user's current values to evaluate safety rules
    let currentTarget: UserProfile | null = null;
    
    if (isSupabaseConfigured()) {
      const supabase = getSupabase() as any;
      const { data, error } = await supabase.from('profiles').select('*').eq('id', targetUserId).single();
      if (!error && data) {
        currentTarget = data;
      }
    } else {
      const stored = localStorage.getItem('rk_mock_profiles');
      if (stored) {
        const list = JSON.parse(stored) as UserProfile[];
        currentTarget = list.find(u => u.id === targetUserId) || null;
      }
    }

    if (!currentTarget) {
      return { data: null, error: 'Target user profile not found.' };
    }

    // 2. CHECK FOR SELF-LOCKOUT VIOLATIONS
    const isSelfEdit = targetUserId === currentUserId;
    if (isSelfEdit) {
      if (updates.isSuspended === true || updates.status === 'suspended') {
        return { data: null, error: 'Platform Safety Rule: Self-suspension is disabled to prevent lockout.' };
      }
      if (updates.isActive === false || updates.status === 'archived') {
        return { data: null, error: 'Platform Safety Rule: Self-archiving/deletion is disabled to prevent lockout.' };
      }
      if (updates.role && updates.role !== currentTarget.role) {
        return { data: null, error: 'Platform Safety Rule: Self role removal is disabled to prevent lockout.' };
      }
    }

    // 3. CHECK FOR REMOVING THE LAST SUPER ADMIN
    if (currentTarget.role === 'super_admin' && updates.role && updates.role !== 'super_admin') {
      // Must verify there is at least one OTHER active super admin
      let count = 0;
      if (isSupabaseConfigured()) {
        const supabase = getSupabase() as any;
        const { count: superAdminCount } = await supabase
          .from('profiles')
          .select('id', { count: 'exact', head: true })
          .eq('role', 'super_admin')
          .eq('isActive', true)
          .eq('isSuspended', false);
        count = superAdminCount ?? 0;
      } else {
        const stored = localStorage.getItem('rk_mock_profiles');
        const list = stored ? JSON.parse(stored) as UserProfile[] : [];
        count = list.filter(u => u.role === 'super_admin' && u.isActive !== false && u.isSuspended !== true).length;
      }

      if (count <= 1) {
        return { data: null, error: 'Platform Safety Rule: At least one active Super Admin must always exist on the platform.' };
      }
    }

    // Map account status to individual boolean fields for backward compatibility
    if (updates.status) {
      if (updates.status === 'suspended') {
        updates.isSuspended = true;
        updates.isActive = true;
      } else if (updates.status === 'archived') {
        updates.isActive = false;
        updates.archivedAt = new Date().toISOString();
      } else {
        updates.isSuspended = false;
        updates.isActive = true;
        if (updates.status === 'verified') {
          updates.isVerified = true;
        }
      }
    }

    // 4. PERFORM WRITE
    let updatedProfile: UserProfile;

    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabase() as any;
        const { data, error } = await supabase
          .from('profiles')
          .update({
            fullName: updates.fullName,
            classId: updates.classId,
            phone: updates.phone,
            role: updates.role,
            status: updates.status,
            isVerified: updates.isVerified,
            isSuspended: updates.isSuspended,
            isPremium: updates.isPremium,
            isActive: updates.isActive,
            archivedAt: updates.archivedAt,
            schoolName: updates.schoolName,
            address: updates.address,
            state: updates.state,
            district: updates.district
          })
          .eq('id', targetUserId)
          .select('*')
          .single();

        if (error) return { data: null, error: error.message };
        updatedProfile = data;
      } catch (err: any) {
        return { data: null, error: err.message || 'Supabase exception during update' };
      }
    } else {
      // Mock mode update
      try {
        const stored = localStorage.getItem('rk_mock_profiles');
        const list = stored ? JSON.parse(stored) as UserProfile[] : [];
        const idx = list.findIndex(u => u.id === targetUserId);
        if (idx === -1) return { data: null, error: 'User not found in mock list.' };

        const merged = { ...list[idx], ...updates };
        list[idx] = merged;
        localStorage.setItem('rk_mock_profiles', JSON.stringify(list));
        updatedProfile = merged;
      } catch (e) {
        return { data: null, error: 'Failed to write mock update' };
      }
    }

    // 5. AUDIT TRAIL LOGGING
    await logActivity({
      userId: currentUserId,
      action: 'UPDATE',
      resource: 'user',
      resourceId: targetUserId,
      metadata: {
        previous: {
          fullName: currentTarget.fullName,
          role: currentTarget.role,
          status: currentTarget.status,
          isPremium: currentTarget.isPremium,
          isSuspended: currentTarget.isSuspended
        },
        changed: updates
      }
    });

    return { data: updatedProfile, error: null };
  },

  /**
   * Resets user password by sending a reset password link.
   */
  async sendPasswordReset(email: string, currentUserId?: string): Promise<ServiceResult<{ success: boolean }>> {
    if (isSupabaseConfigured()) {
      const supabase = getSupabase() as any;
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/#auth?reset=true`
      });

      if (error) return { data: null, error: error.message };

      if (currentUserId) {
        await logActivity({
          userId: currentUserId,
          action: 'RESET_PASSWORD',
          resource: 'user',
          metadata: { email }
        });
      }

      return { data: { success: true }, error: null };
    }

    console.log(`[User Service Mock] Password reset link sent to ${email}`);
    return { data: { success: true }, error: null };
  },

  /**
   * Resends invitation setup link to pending teachers or admins.
   */
  async resendInvitation(email: string, role: string, currentUserId?: string): Promise<ServiceResult<{ success: boolean }>> {
    if (isSupabaseConfigured()) {
      const supabase = getSupabase() as any;
      // Triggers OTP setup link or recovery link as invite fallback
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/#auth?invite=true`
      });
      if (error) return { data: null, error: error.message };

      if (currentUserId) {
        await logActivity({
          userId: currentUserId,
          action: 'INVITE',
          resource: 'user',
          metadata: { email, role }
        });
      }
      return { data: { success: true }, error: null };
    }

    console.log(`[User Service Mock] Resent invitation onboarding email to pending ${role} (${email})`);
    return { data: { success: true }, error: null };
  },

  /**
   * Bulk activation placeholder (Stubbed for future expansion)
   */
  async bulkActivate(userIds: string[], currentUserId: string): Promise<ServiceResult<{ count: number }>> {
    let count = 0;
    for (const uid of userIds) {
      const { error } = await this.updateUser(uid, { status: 'active', isSuspended: false, isActive: true }, currentUserId, 'super_admin');
      if (!error) count++;
    }
    return { data: { count }, error: null };
  },

  /**
   * Bulk suspension placeholder (Stubbed for future expansion)
   */
  async bulkSuspend(userIds: string[], currentUserId: string): Promise<ServiceResult<{ count: number }>> {
    let count = 0;
    for (const uid of userIds) {
      const { error } = await this.updateUser(uid, { status: 'suspended', isSuspended: true }, currentUserId, 'super_admin');
      if (!error) count++;
    }
    return { data: { count }, error: null };
  },

  /**
   * Bulk archiving placeholder (Stubbed for future archiving deletion)
   */
  async bulkArchive(userIds: string[], currentUserId: string): Promise<ServiceResult<{ count: number }>> {
    let count = 0;
    for (const uid of userIds) {
      const { error } = await this.updateUser(uid, { status: 'archived', isActive: false }, currentUserId, 'super_admin');
      if (!error) count++;
    }
    return { data: { count }, error: null };
  }
};
