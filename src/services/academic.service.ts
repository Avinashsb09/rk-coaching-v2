/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Academic Service — CRUD for Classes, Subjects, Chapters
 * ─────────────────────────────────────────────────────────
 * Provides all data operations for the Academic Management module.
 *
 * Architecture:
 *  - Uses Supabase when configured, localStorage as fallback.
 *  - Each operation accepts an optional `onLog` callback (activity log stub)
 *    so Sprint 8 can inject a real logger without changing signatures.
 *  - Returns typed results — no raw Supabase types leak to callers.
 *
 * Usage:
 *   import { academicService } from '../../services/academic.service';
 *   const classes = await academicService.classes.list();
 *   await academicService.classes.create({ name: 'Class 10', slug: 'class-10', priority: 1 });
 */

import { getSupabase, isSupabaseConfigured } from '../lib/supabase';
import type { AcademicClass, AcademicSubject, AcademicChapter } from '../types';

// ─────────────────────────────────────────────────────────────────────────────
//  Activity Log Stub (Sprint 8 will inject real implementation)
// ─────────────────────────────────────────────────────────────────────────────

export interface ActivityLogPayload {
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'ACTIVATE' | 'DEACTIVATE' | 'PUBLISH' | 'ARCHIVE';
  resource: 'class' | 'subject' | 'chapter' | 'course' | 'lesson' | 'note' | 'video' | 'quiz';
  resourceId?: string;
  resourceName?: string;
  metadata?: Record<string, unknown>;
}

/** Callback type for activity logging — inject in Sprint 8 */
export type LogCallback = (payload: ActivityLogPayload) => Promise<void>;

/** No-op logger stub used until Sprint 8 activates real logging */
const noopLogger: LogCallback = async () => {};

// ─────────────────────────────────────────────────────────────────────────────
//  Service Result Type
// ─────────────────────────────────────────────────────────────────────────────

export interface ServiceResult<T> {
  data: T | null;
  error: string | null;
}

// ─────────────────────────────────────────────────────────────────────────────
//  LocalStorage Fallback Keys
// ─────────────────────────────────────────────────────────────────────────────

const LS_KEYS = {
  classes:  'rk_admin_classes',
  subjects: 'rk_admin_subjects',
  chapters: 'rk_admin_chapters',
} as const;

function lsGet<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
}

function lsSet<T>(key: string, data: T[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    // Storage full or unavailable — silently ignore
  }
}

// ─────────────────────────────────────────────────────────────────────────────
//  Generate a readable slug
// ─────────────────────────────────────────────────────────────────────────────

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

// ─────────────────────────────────────────────────────────────────────────────
//  CLASSES (Academic Standards)
// ─────────────────────────────────────────────────────────────────────────────

const classesService = {
  async list(): Promise<ServiceResult<AcademicClass[]>> {
    if (isSupabaseConfigured()) {
      const supabase = getSupabase() as any;
      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .order('priority', { ascending: true });
      if (error) return { data: null, error: error.message };
      return { data: data as AcademicClass[], error: null };
    }
    return { data: lsGet<AcademicClass>(LS_KEYS.classes), error: null };
  },

  async create(
    payload: { name: string; slug: string; priority: number; isActive?: boolean },
    onLog: LogCallback = noopLogger
  ): Promise<ServiceResult<AcademicClass>> {
    const id = payload.slug || generateSlug(payload.name);
    const record: AcademicClass = {
      id,
      name: payload.name,
      slug: payload.slug,
      priority: payload.priority,
      isActive: payload.isActive ?? true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (isSupabaseConfigured()) {
      const supabase = getSupabase() as any;
      const { data, error } = await supabase
        .from('classes')
        .insert({ ...record, isActive: record.isActive })
        .select()
        .single();
      if (error) return { data: null, error: error.message };
      await onLog({ action: 'CREATE', resource: 'class', resourceId: id, resourceName: payload.name });
      return { data: data as AcademicClass, error: null };
    }

    const all = lsGet<AcademicClass>(LS_KEYS.classes);
    all.push(record);
    lsSet(LS_KEYS.classes, all);
    await onLog({ action: 'CREATE', resource: 'class', resourceId: id, resourceName: payload.name });
    return { data: record, error: null };
  },

  async update(
    id: string,
    payload: Partial<{ name: string; slug: string; priority: number; isActive: boolean }>,
    onLog: LogCallback = noopLogger
  ): Promise<ServiceResult<AcademicClass>> {
    const changes = { ...payload, updatedAt: new Date().toISOString() };

    if (isSupabaseConfigured()) {
      const supabase = getSupabase() as any;
      const { data, error } = await supabase
        .from('classes')
        .update(changes)
        .eq('id', id)
        .select()
        .single();
      if (error) return { data: null, error: error.message };
      await onLog({ action: 'UPDATE', resource: 'class', resourceId: id, metadata: changes });
      return { data: data as AcademicClass, error: null };
    }

    const all = lsGet<AcademicClass>(LS_KEYS.classes);
    const idx = all.findIndex(c => c.id === id);
    if (idx === -1) return { data: null, error: 'Record not found' };
    all[idx] = { ...all[idx], ...changes };
    lsSet(LS_KEYS.classes, all);
    await onLog({ action: 'UPDATE', resource: 'class', resourceId: id, metadata: changes });
    return { data: all[idx], error: null };
  },

  async delete(
    id: string,
    onLog: LogCallback = noopLogger
  ): Promise<ServiceResult<void>> {
    if (isSupabaseConfigured()) {
      const supabase = getSupabase() as any;
      const { error } = await supabase.from('classes').delete().eq('id', id);
      if (error) return { data: null, error: error.message };
      await onLog({ action: 'DELETE', resource: 'class', resourceId: id });
      return { data: null, error: null };
    }

    const all = lsGet<AcademicClass>(LS_KEYS.classes);
    lsSet(LS_KEYS.classes, all.filter(c => c.id !== id));
    await onLog({ action: 'DELETE', resource: 'class', resourceId: id });
    return { data: null, error: null };
  },

  async toggleActive(
    id: string,
    isActive: boolean,
    onLog: LogCallback = noopLogger
  ): Promise<ServiceResult<AcademicClass>> {
    const result = await classesService.update(id, { isActive }, onLog);
    if (!result.error) {
      await onLog({
        action: isActive ? 'ACTIVATE' : 'DEACTIVATE',
        resource: 'class',
        resourceId: id,
      });
    }
    return result;
  },
};

// ─────────────────────────────────────────────────────────────────────────────
//  SUBJECTS
// ─────────────────────────────────────────────────────────────────────────────

const subjectsService = {
  async list(classId?: string): Promise<ServiceResult<AcademicSubject[]>> {
    if (isSupabaseConfigured()) {
      const supabase = getSupabase() as any;
      let query = supabase.from('subjects').select('*').order('displayOrder', { ascending: true });
      if (classId) query = query.eq('classId', classId);
      const { data, error } = await query;
      if (error) return { data: null, error: error.message };
      return { data: data as AcademicSubject[], error: null };
    }
    const all = lsGet<AcademicSubject>(LS_KEYS.subjects);
    return { data: classId ? all.filter(s => s.classId === classId) : all, error: null };
  },

  async create(
    payload: {
      classId: string; name: string; icon: string;
      description: string; displayOrder?: number; isActive?: boolean;
    },
    userId?: string,
    onLog: LogCallback = noopLogger
  ): Promise<ServiceResult<AcademicSubject>> {
    const id = `subj_${generateSlug(payload.name)}_${Date.now()}`;
    const record: AcademicSubject = {
      id,
      classId: payload.classId,
      name: payload.name,
      icon: payload.icon || '📚',
      description: payload.description,
      displayOrder: payload.displayOrder ?? 0,
      isActive: payload.isActive ?? true,
      createdBy: userId ?? null,
      updatedBy: userId ?? null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (isSupabaseConfigured()) {
      const supabase = getSupabase() as any;
      const { data, error } = await supabase.from('subjects').insert(record).select().single();
      if (error) return { data: null, error: error.message };
      await onLog({ action: 'CREATE', resource: 'subject', resourceId: id, resourceName: payload.name });
      return { data: data as AcademicSubject, error: null };
    }

    const all = lsGet<AcademicSubject>(LS_KEYS.subjects);
    all.push(record);
    lsSet(LS_KEYS.subjects, all);
    await onLog({ action: 'CREATE', resource: 'subject', resourceId: id, resourceName: payload.name });
    return { data: record, error: null };
  },

  async update(
    id: string,
    payload: Partial<AcademicSubject>,
    userId?: string,
    onLog: LogCallback = noopLogger
  ): Promise<ServiceResult<AcademicSubject>> {
    const changes = { ...payload, updatedBy: userId ?? null, updatedAt: new Date().toISOString() };

    if (isSupabaseConfigured()) {
      const supabase = getSupabase() as any;
      const { data, error } = await supabase
        .from('subjects')
        .update(changes)
        .eq('id', id)
        .select()
        .single();
      if (error) return { data: null, error: error.message };
      await onLog({ action: 'UPDATE', resource: 'subject', resourceId: id, metadata: changes });
      return { data: data as AcademicSubject, error: null };
    }

    const all = lsGet<AcademicSubject>(LS_KEYS.subjects);
    const idx = all.findIndex(s => s.id === id);
    if (idx === -1) return { data: null, error: 'Record not found' };
    all[idx] = { ...all[idx], ...changes };
    lsSet(LS_KEYS.subjects, all);
    await onLog({ action: 'UPDATE', resource: 'subject', resourceId: id, metadata: changes });
    return { data: all[idx], error: null };
  },

  async delete(
    id: string,
    onLog: LogCallback = noopLogger
  ): Promise<ServiceResult<void>> {
    if (isSupabaseConfigured()) {
      const supabase = getSupabase() as any;
      const { error } = await supabase.from('subjects').delete().eq('id', id);
      if (error) return { data: null, error: error.message };
      await onLog({ action: 'DELETE', resource: 'subject', resourceId: id });
      return { data: null, error: null };
    }

    lsSet(LS_KEYS.subjects, lsGet<AcademicSubject>(LS_KEYS.subjects).filter(s => s.id !== id));
    await onLog({ action: 'DELETE', resource: 'subject', resourceId: id });
    return { data: null, error: null };
  },

  async toggleActive(
    id: string,
    isActive: boolean,
    userId?: string,
    onLog: LogCallback = noopLogger
  ): Promise<ServiceResult<AcademicSubject>> {
    return subjectsService.update(id, { isActive }, userId, onLog);
  },
};

// ─────────────────────────────────────────────────────────────────────────────
//  CHAPTERS
// ─────────────────────────────────────────────────────────────────────────────

const chaptersService = {
  async list(subjectId?: string): Promise<ServiceResult<AcademicChapter[]>> {
    if (isSupabaseConfigured()) {
      const supabase = getSupabase() as any;
      let query = supabase.from('chapters').select('*').order('orderIndex', { ascending: true });
      if (subjectId) query = query.eq('subjectId', subjectId);
      const { data, error } = await query;
      if (error) return { data: null, error: error.message };
      return { data: data as AcademicChapter[], error: null };
    }
    const all = lsGet<AcademicChapter>(LS_KEYS.chapters);
    return { data: subjectId ? all.filter(c => c.subjectId === subjectId) : all, error: null };
  },

  async create(
    payload: {
      subjectId: string; name: string;
      description: string; orderIndex?: number; isActive?: boolean;
    },
    userId?: string,
    onLog: LogCallback = noopLogger
  ): Promise<ServiceResult<AcademicChapter>> {
    const id = `ch_${generateSlug(payload.name)}_${Date.now()}`;
    const record: AcademicChapter = {
      id,
      subjectId: payload.subjectId,
      name: payload.name,
      description: payload.description,
      orderIndex: payload.orderIndex ?? 0,
      isActive: payload.isActive ?? true,
      createdBy: userId ?? null,
      updatedBy: userId ?? null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (isSupabaseConfigured()) {
      const supabase = getSupabase() as any;
      const { data, error } = await supabase.from('chapters').insert(record).select().single();
      if (error) return { data: null, error: error.message };
      await onLog({ action: 'CREATE', resource: 'chapter', resourceId: id, resourceName: payload.name });
      return { data: data as AcademicChapter, error: null };
    }

    const all = lsGet<AcademicChapter>(LS_KEYS.chapters);
    all.push(record);
    lsSet(LS_KEYS.chapters, all);
    await onLog({ action: 'CREATE', resource: 'chapter', resourceId: id, resourceName: payload.name });
    return { data: record, error: null };
  },

  async update(
    id: string,
    payload: Partial<AcademicChapter>,
    userId?: string,
    onLog: LogCallback = noopLogger
  ): Promise<ServiceResult<AcademicChapter>> {
    const changes = { ...payload, updatedBy: userId ?? null, updatedAt: new Date().toISOString() };

    if (isSupabaseConfigured()) {
      const supabase = getSupabase() as any;
      const { data, error } = await supabase
        .from('chapters')
        .update(changes)
        .eq('id', id)
        .select()
        .single();
      if (error) return { data: null, error: error.message };
      await onLog({ action: 'UPDATE', resource: 'chapter', resourceId: id, metadata: changes });
      return { data: data as AcademicChapter, error: null };
    }

    const all = lsGet<AcademicChapter>(LS_KEYS.chapters);
    const idx = all.findIndex(c => c.id === id);
    if (idx === -1) return { data: null, error: 'Record not found' };
    all[idx] = { ...all[idx], ...changes };
    lsSet(LS_KEYS.chapters, all);
    await onLog({ action: 'UPDATE', resource: 'chapter', resourceId: id, metadata: changes });
    return { data: all[idx], error: null };
  },

  async delete(
    id: string,
    onLog: LogCallback = noopLogger
  ): Promise<ServiceResult<void>> {
    if (isSupabaseConfigured()) {
      const supabase = getSupabase() as any;
      const { error } = await supabase.from('chapters').delete().eq('id', id);
      if (error) return { data: null, error: error.message };
      await onLog({ action: 'DELETE', resource: 'chapter', resourceId: id });
      return { data: null, error: null };
    }

    lsSet(LS_KEYS.chapters, lsGet<AcademicChapter>(LS_KEYS.chapters).filter(c => c.id !== id));
    await onLog({ action: 'DELETE', resource: 'chapter', resourceId: id });
    return { data: null, error: null };
  },

  async toggleActive(
    id: string,
    isActive: boolean,
    userId?: string,
    onLog: LogCallback = noopLogger
  ): Promise<ServiceResult<AcademicChapter>> {
    return chaptersService.update(id, { isActive }, userId, onLog);
  },
};

// ─────────────────────────────────────────────────────────────────────────────
//  Exported namespace
// ─────────────────────────────────────────────────────────────────────────────

export const academicService = {
  classes:  classesService,
  subjects: subjectsService,
  chapters: chaptersService,
};
