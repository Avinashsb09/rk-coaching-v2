/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Faculty & Teacher Assignment Service — Supabase-First with LocalStorage Fallback
 * ─────────────────────────────────────────────────────────────────────────────
 * Manages academic staff assignments with start/end dates, primary status,
 * historical versioning (preserving deactivated bounds), and publish workflow review/rejections.
 */

import { getSupabase, isSupabaseConfigured } from '../lib/supabase';
import type { TeacherAssignment, UserProfile } from '../types';

export interface ServiceResult<T> {
  data: T | null;
  error: string | null;
}

const MOCK_ASSIGNMENTS_KEY = 'rk_mock_teacher_assignments';

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
    console.log(`[Activity Log Mock] User ${payload.userId} performed action "${payload.action}" on resource "${payload.resource}" (${payload.resourceId})`, payload.metadata);
  }
}

export const teacherService = {
  /**
   * List teaching assignments, optionally filtered by teacherId.
   * Can filter active vs inactive.
   */
  async listTeacherAssignments(
    teacherId?: string,
    onlyActive: boolean = false
  ): Promise<ServiceResult<TeacherAssignment[]>> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabase() as any;
        let query = supabase.from('teacher_assignments').select('*');
        if (teacherId) query = query.eq('teacherId', teacherId);
        if (onlyActive) query = query.eq('status', 'active');
        
        const { data, error } = await query;
        if (error) return { data: null, error: error.message };
        return { data: data || [], error: null };
      } catch (err: any) {
        return { data: null, error: err.message || 'Supabase exception listing assignments' };
      }
    }

    // Mock mode
    let list: any[] = [];
    try {
      const raw = localStorage.getItem(MOCK_ASSIGNMENTS_KEY);
      list = raw ? JSON.parse(raw) : [];
    } catch {
      list = [];
    }

    if (teacherId) {
      list = list.filter(a => a.teacherId === teacherId);
    }
    if (onlyActive) {
      list = list.filter(a => a.status === 'active' || !a.status);
    }
    return { data: list, error: null };
  },

  /**
   * Creates a teaching assignment, preventing duplicate ACTIVE assignments.
   */
  async assignTeacher(
    teacherId: string,
    classId: string,
    subjectId: string | null = null,
    chapterId: string | null = null,
    isPrimary: boolean = true,
    startDate: string = new Date().toISOString().split('T')[0],
    endDate: string | null = null,
    currentUserId?: string
  ): Promise<ServiceResult<TeacherAssignment>> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabase() as any;
        
        // 1. Check duplicate active in service layer for additional safety
        const { data: dupCheck } = await supabase
          .from('teacher_assignments')
          .select('id')
          .eq('teacherId', teacherId)
          .eq('classId', classId)
          .eq('subjectId', subjectId)
          .eq('chapterId', chapterId)
          .eq('status', 'active');

        if (dupCheck && dupCheck.length > 0) {
          return { data: null, error: 'Duplicate active assignment exists for this scope.' };
        }

        const { data, error } = await supabase
          .from('teacher_assignments')
          .insert({
            teacherId,
            classId,
            subjectId,
            chapterId,
            isPrimary,
            startDate,
            endDate,
            status: 'active'
          })
          .select('*')
          .single();

        if (error) return { data: null, error: error.message };

        // Auditing
        await logActivity({
          userId: currentUserId,
          action: 'CREATE',
          resource: 'teacher_assignment',
          resourceId: data.id,
          metadata: { teacherId, classId, subjectId, chapterId, isPrimary }
        });

        return { data, error: null };
      } catch (err: any) {
        return { data: null, error: err.message || 'Supabase assignment exception' };
      }
    }

    // Mock Mode
    let list: any[] = [];
    try {
      const raw = localStorage.getItem(MOCK_ASSIGNMENTS_KEY);
      list = raw ? JSON.parse(raw) : [];
    } catch {}

    const isDup = list.some(
      a =>
        a.teacherId === teacherId &&
        a.classId === classId &&
        a.subjectId === subjectId &&
        a.chapterId === chapterId &&
        (a.status === 'active' || !a.status)
    );

    if (isDup) {
      return { data: null, error: 'Duplicate active assignment exists for this scope.' };
    }

    const newAssignment: any = {
      id: `mock-taid-${Math.random().toString(36).substring(2, 9)}`,
      teacherId,
      classId,
      subjectId,
      chapterId,
      isPrimary,
      startDate,
      endDate,
      status: 'active',
      createdAt: new Date().toISOString()
    };

    list.push(newAssignment);
    localStorage.setItem(MOCK_ASSIGNMENTS_KEY, JSON.stringify(list));

    // Auditing
    await logActivity({
      userId: currentUserId,
      action: 'CREATE',
      resource: 'teacher_assignment',
      resourceId: newAssignment.id,
      metadata: { teacherId, classId, subjectId, chapterId, isPrimary }
    });

    return { data: newAssignment, error: null };
  },

  /**
   * Version update: Marks an old assignment inactive instead of overwriting,
   * creating a new active assignment.
   */
  async updateAssignmentStatus(
    assignmentId: string,
    nextStatus: 'active' | 'inactive',
    currentUserId?: string
  ): Promise<ServiceResult<{ success: boolean }>> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabase() as any;
        const { error } = await supabase
          .from('teacher_assignments')
          .update({ status: nextStatus, endDate: nextStatus === 'inactive' ? new Date().toISOString().split('T')[0] : null })
          .eq('id', assignmentId);

        if (error) return { data: null, error: error.message };

        // Auditing
        await logActivity({
          userId: currentUserId,
          action: nextStatus === 'inactive' ? 'EXPIRE' : 'ACTIVATE',
          resource: 'teacher_assignment',
          resourceId: assignmentId
        });

        return { data: { success: true }, error: null };
      } catch (err: any) {
        return { data: null, error: err.message || 'Supabase exception during assignment update' };
      }
    }

    // Mock Mode
    try {
      const raw = localStorage.getItem(MOCK_ASSIGNMENTS_KEY);
      let list: any[] = raw ? JSON.parse(raw) : [];
      const idx = list.findIndex(a => a.id === assignmentId);
      if (idx !== -1) {
        list[idx].status = nextStatus;
        list[idx].endDate = nextStatus === 'inactive' ? new Date().toISOString().split('T')[0] : null;
        localStorage.setItem(MOCK_ASSIGNMENTS_KEY, JSON.stringify(list));

        // Auditing
        await logActivity({
          userId: currentUserId,
          action: nextStatus === 'inactive' ? 'EXPIRE' : 'ACTIVATE',
          resource: 'teacher_assignment',
          resourceId: assignmentId
        });
      }
      return { data: { success: true }, error: null };
    } catch {
      return { data: null, error: 'Failed to update mock assignment' };
    }
  },

  /**
   * Permanently deletes assignment or logs soft removal.
   */
  async deleteAssignment(assignmentId: string, currentUserId?: string): Promise<ServiceResult<{ success: boolean }>> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabase() as any;
        const { error } = await supabase.from('teacher_assignments').delete().eq('id', assignmentId);
        if (error) return { data: null, error: error.message };

        await logActivity({
          userId: currentUserId,
          action: 'DELETE',
          resource: 'teacher_assignment',
          resourceId: assignmentId
        });
        return { data: { success: true }, error: null };
      } catch (err: any) {
        return { data: null, error: err.message || 'Supabase delete assignment exception' };
      }
    }

    // Mock
    try {
      const raw = localStorage.getItem(MOCK_ASSIGNMENTS_KEY);
      let list: any[] = raw ? JSON.parse(raw) : [];
      const filtered = list.filter(a => a.id !== assignmentId);
      localStorage.setItem(MOCK_ASSIGNMENTS_KEY, JSON.stringify(filtered));

      await logActivity({
        userId: currentUserId,
        action: 'DELETE',
        resource: 'teacher_assignment',
        resourceId: assignmentId
      });
      return { data: { success: true }, error: null };
    } catch {
      return { data: null, error: 'Failed to delete mock assignment' };
    }
  },

  /**
   * Content review workflow helper: Teacher submits content for review.
   */
  async submitForReview(
    resourceType: 'notes' | 'videos' | 'quizzes',
    id: string,
    currentUserId: string
  ): Promise<ServiceResult<{ success: boolean }>> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabase() as any;
        const { error } = await supabase
          .from(resourceType)
          .update({ status: 'review' })
          .eq('id', id);

        if (error) return { data: null, error: error.message };

        await logActivity({
          userId: currentUserId,
          action: 'PUBLISH_SUBMIT',
          resource: resourceType === 'notes' ? 'note' : resourceType === 'videos' ? 'video' : 'quiz',
          resourceId: id
        });
        return { data: { success: true }, error: null };
      } catch (err: any) {
        return { data: null, error: err.message };
      }
    }

    // Mock fallback
    try {
      const key = `rk_mock_${resourceType}`;
      const raw = localStorage.getItem(key) || '[]';
      const list = JSON.parse(raw);
      const idx = list.findIndex((x: any) => x.id === id);
      if (idx !== -1) {
        list[idx].status = 'review';
        localStorage.setItem(key, JSON.stringify(list));

        await logActivity({
          userId: currentUserId,
          action: 'PUBLISH_SUBMIT',
          resource: resourceType === 'notes' ? 'note' : resourceType === 'videos' ? 'video' : 'quiz',
          resourceId: id
        });
      }
      return { data: { success: true }, error: null };
    } catch {
      return { data: null, error: 'Failed mock submit' };
    }
  },

  /**
   * Content review workflow helper: Super Admin approves content.
   */
  async approveContent(
    resourceType: 'notes' | 'videos' | 'quizzes',
    id: string,
    reviewerId: string
  ): Promise<ServiceResult<{ success: boolean }>> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabase() as any;
        const { error } = await supabase
          .from(resourceType)
          .update({
            status: 'published',
            publishedBy: reviewerId,
            reviewedBy: reviewerId,
            reviewedAt: new Date().toISOString()
          })
          .eq('id', id);

        if (error) return { data: null, error: error.message };

        await logActivity({
          userId: reviewerId,
          action: 'PUBLISH_APPROVE',
          resource: resourceType === 'notes' ? 'note' : resourceType === 'videos' ? 'video' : 'quiz',
          resourceId: id
        });
        return { data: { success: true }, error: null };
      } catch (err: any) {
        return { data: null, error: err.message };
      }
    }

    // Mock
    try {
      const key = `rk_mock_${resourceType}`;
      const raw = localStorage.getItem(key) || '[]';
      const list = JSON.parse(raw);
      const idx = list.findIndex((x: any) => x.id === id);
      if (idx !== -1) {
        list[idx].status = 'published';
        list[idx].publishedBy = reviewerId;
        list[idx].reviewedBy = reviewerId;
        list[idx].reviewedAt = new Date().toISOString();
        localStorage.setItem(key, JSON.stringify(list));

        await logActivity({
          userId: reviewerId,
          action: 'PUBLISH_APPROVE',
          resource: resourceType === 'notes' ? 'note' : resourceType === 'videos' ? 'video' : 'quiz',
          resourceId: id
        });
      }
      return { data: { success: true }, error: null };
    } catch {
      return { data: null, error: 'Mock approval failed' };
    }
  },

  /**
   * Content review workflow helper: Super Admin rejects content.
   */
  async rejectContent(
    resourceType: 'notes' | 'videos' | 'quizzes',
    id: string,
    reason: string,
    comment: string,
    reviewerId: string
  ): Promise<ServiceResult<{ success: boolean }>> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabase() as any;
        const { error } = await supabase
          .from(resourceType)
          .update({
            status: 'draft', // Returns to Draft automatically
            rejectionReason: reason,
            rejectionComment: comment,
            rejectedAt: new Date().toISOString(),
            reviewedBy: reviewerId,
            reviewedAt: new Date().toISOString()
          })
          .eq('id', id);

        if (error) return { data: null, error: error.message };

        await logActivity({
          userId: reviewerId,
          action: 'PUBLISH_REJECT',
          resource: resourceType === 'notes' ? 'note' : resourceType === 'videos' ? 'video' : 'quiz',
          resourceId: id,
          metadata: { reason, comment }
        });
        return { data: { success: true }, error: null };
      } catch (err: any) {
        return { data: null, error: err.message };
      }
    }

    // Mock
    try {
      const key = `rk_mock_${resourceType}`;
      const raw = localStorage.getItem(key) || '[]';
      const list = JSON.parse(raw);
      const idx = list.findIndex((x: any) => x.id === id);
      if (idx !== -1) {
        list[idx].status = 'draft';
        list[idx].rejectionReason = reason;
        list[idx].rejectionComment = comment;
        list[idx].rejectedAt = new Date().toISOString();
        list[idx].reviewedBy = reviewerId;
        list[idx].reviewedAt = new Date().toISOString();
        localStorage.setItem(key, JSON.stringify(list));

        await logActivity({
          userId: reviewerId,
          action: 'PUBLISH_REJECT',
          resource: resourceType === 'notes' ? 'note' : resourceType === 'videos' ? 'video' : 'quiz',
          resourceId: id,
          metadata: { reason, comment }
        });
      }
      return { data: { success: true }, error: null };
    } catch {
      return { data: null, error: 'Mock rejection failed' };
    }
  },

  /**
   * Helper to retrieve statistics and content counters.
   */
  async getTeacherStats(teacherId: string): Promise<ServiceResult<{
    notesCount: number;
    videosCount: number;
    pyqsCount: number;
    quizzesCount: number;
    assignmentsCount: number;
    draftsCount: number;
    reviewCount: number;
    publishedCount: number;
    rejectedCount: number;
  }>> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabase() as any;

        // Fetch counts parallel
        const [notesRes, videosRes, quizzesRes, assignmentsRes] = await Promise.all([
          supabase.from('notes').select('id, status', { count: 'exact' }).eq('ownerId', teacherId),
          supabase.from('videos').select('id, status', { count: 'exact' }).eq('ownerId', teacherId),
          supabase.from('quizzes').select('id, status', { count: 'exact' }).eq('ownerId', teacherId),
          supabase.from('teacher_assignments').select('id', { count: 'exact' }).eq('teacherId', teacherId).eq('status', 'active')
        ]);

        const notes = notesRes.data || [];
        const videos = videosRes.data || [];
        const quizzes = quizzesRes.data || [];

        // Count pyqs
        const pyqsCount = notes.filter((n: any) => n.type === 'pyq').length;

        // Group status counts
        const allItems = [...notes, ...videos, ...quizzes];
        const draftsCount = allItems.filter((i: any) => i.status === 'draft').length;
        const reviewCount = allItems.filter((i: any) => i.status === 'review').length;
        const publishedCount = allItems.filter((i: any) => i.status === 'published').length;
        const rejectedCount = allItems.filter((i: any) => i.rejectionReason).length;

        return {
          data: {
            notesCount: notes.length - pyqsCount,
            videosCount: videos.length,
            pyqsCount,
            quizzesCount: quizzes.length,
            assignmentsCount: assignmentsRes.count ?? 0,
            draftsCount,
            reviewCount,
            publishedCount,
            rejectedCount
          },
          error: null
        };
      } catch (err: any) {
        return { data: null, error: err.message || 'Supabase exception stats' };
      }
    }

    // Mock Mode
    let notesCount = 0;
    let pyqsCount = 0;
    let videosCount = 0;
    let quizzesCount = 0;
    let assignmentsCount = 0;
    let draftsCount = 0;
    let reviewCount = 0;
    let publishedCount = 0;
    let rejectedCount = 0;

    try {
      const rawTA = localStorage.getItem(MOCK_ASSIGNMENTS_KEY);
      const assignmentsList: any[] = rawTA ? JSON.parse(rawTA) : [];
      assignmentsCount = assignmentsList.filter(a => a.teacherId === teacherId && a.status === 'active').length;

      const rawNotes = localStorage.getItem('rk_mock_notes') || '[]';
      const notesList = JSON.parse(rawNotes).filter((n: any) => n.ownerId === teacherId);
      notesCount = notesList.filter((n: any) => n.type !== 'pyq').length;
      pyqsCount = notesList.filter((n: any) => n.type === 'pyq').length;

      const rawVideos = localStorage.getItem('rk_mock_videos') || '[]';
      const videosList = JSON.parse(rawVideos).filter((v: any) => v.ownerId === teacherId);
      videosCount = videosList.length;

      const rawQuizzes = localStorage.getItem('rk_mock_quizzes') || '[]';
      const quizzesList = JSON.parse(rawQuizzes).filter((q: any) => q.ownerId === teacherId);
      quizzesCount = quizzesList.length;

      const all = [...notesList, ...videosList, ...quizzesList];
      draftsCount = all.filter(i => i.status === 'draft' || !i.status).length;
      reviewCount = all.filter(i => i.status === 'review').length;
      publishedCount = all.filter(i => i.status === 'published').length;
      rejectedCount = all.filter(i => i.rejectionReason).length;
    } catch {}

    return {
      data: {
        notesCount,
        videosCount,
        pyqsCount,
        quizzesCount,
        assignmentsCount,
        draftsCount,
        reviewCount,
        publishedCount,
        rejectedCount
      },
      error: null
    };
  }
};
