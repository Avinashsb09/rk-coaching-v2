/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Content Service — CMS CRUD for Notes, Videos, PYQs, and Quizzes
 * ─────────────────────────────────────────────────────────────────────────────
 * Supports Supabase with localStorage fallback.
 * Uses soft delete (archiving): deleting content sets status to 'archived'.
 * Includes support for drag-and-drop order updates in the DB.
 */

import { getSupabase, isSupabaseConfigured } from '../lib/supabase';
import type { Note, Video, Quiz, QuizQuestion, QuizOption } from '../types';

export interface ActivityLogPayload {
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'PUBLISH' | 'ARCHIVE' | 'ORDER';
  resource: 'note' | 'video' | 'quiz' | 'question' | 'option';
  resourceId: string;
  resourceName?: string;
  metadata?: Record<string, unknown>;
}

export type LogCallback = (payload: ActivityLogPayload) => Promise<void>;
const noopLogger: LogCallback = async () => {};

export interface ServiceResult<T> {
  data: T | null;
  error: string | null;
}

const LS_KEYS = {
  notes: 'rk_admin_notes',
  videos: 'rk_admin_videos',
  quizzes: 'rk_admin_quizzes',
  questions: 'rk_admin_quiz_questions',
  options: 'rk_admin_quiz_options',
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
  } catch {}
}

// ─────────────────────────────────────────────────────────────────────────────
//  NOTES & PYQ SERVICE
// ─────────────────────────────────────────────────────────────────────────────

const notesService = {
  async list(): Promise<ServiceResult<Note[]>> {
    if (isSupabaseConfigured()) {
      const supabase = getSupabase() as any;
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .neq('status', 'archived')
        .order('displayOrder', { ascending: true });
      if (error) return { data: null, error: error.message };
      return { data: data as Note[], error: null };
    }
    const all = lsGet<Note>(LS_KEYS.notes);
    return { data: all.filter(n => n.status !== 'archived'), error: null };
  },

  async create(payload: Partial<Note>, userId?: string, onLog: LogCallback = noopLogger): Promise<ServiceResult<Note>> {
    const id = `note_${Date.now()}`;
    const record: Note = {
      id,
      title: payload.title || 'Untitled Note',
      pdfUrl: payload.pdfUrl || '',
      sizeBytes: payload.sizeBytes || 0,
      isPremium: payload.isPremium ?? false,
      price: payload.price || 0,
      lessonId: payload.lessonId || null,
      classId: payload.classId || null,
      subjectId: payload.subjectId || null,
      chapterId: payload.chapterId || null,
      type: payload.type || 'notes',
      status: payload.status || 'draft',
      displayOrder: payload.displayOrder ?? 0,
      examName: payload.examName || '',
      year: payload.year || new Date().getFullYear(),
      solvedStatus: payload.solvedStatus || 'unsolved',
      createdBy: userId || null,
      updatedBy: userId || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (isSupabaseConfigured()) {
      const supabase = getSupabase() as any;
      const { data, error } = await supabase.from('notes').insert(record).select().single();
      if (error) return { data: null, error: error.message };
      await onLog({ action: 'CREATE', resource: 'note', resourceId: id, resourceName: payload.title });
      return { data: data as Note, error: null };
    }

    const all = lsGet<Note>(LS_KEYS.notes);
    all.push(record);
    lsSet(LS_KEYS.notes, all);
    await onLog({ action: 'CREATE', resource: 'note', resourceId: id, resourceName: payload.title });
    return { data: record, error: null };
  },

  async update(id: string, payload: Partial<Note>, userId?: string, onLog: LogCallback = noopLogger): Promise<ServiceResult<Note>> {
    const changes = { ...payload, updatedBy: userId || null, updatedAt: new Date().toISOString() };

    if (isSupabaseConfigured()) {
      const supabase = getSupabase() as any;
      const { data, error } = await supabase.from('notes').update(changes).eq('id', id).select().single();
      if (error) return { data: null, error: error.message };
      await onLog({ action: 'UPDATE', resource: 'note', resourceId: id, metadata: changes });
      return { data: data as Note, error: null };
    }

    const all = lsGet<Note>(LS_KEYS.notes);
    const idx = all.findIndex(n => n.id === id);
    if (idx === -1) return { data: null, error: 'Note not found' };
    all[idx] = { ...all[idx], ...changes };
    lsSet(LS_KEYS.notes, all);
    await onLog({ action: 'UPDATE', resource: 'note', resourceId: id, metadata: changes });
    return { data: all[idx], error: null };
  },

  async delete(id: string, onLog: LogCallback = noopLogger): Promise<ServiceResult<void>> {
    // Soft delete: update status to 'archived'
    const result = await this.update(id, { status: 'archived' }, undefined, onLog);
    if (result.error) return { data: null, error: result.error };
    await onLog({ action: 'ARCHIVE', resource: 'note', resourceId: id });
    return { data: null, error: null };
  },

  async updateOrder(orders: { id: string; displayOrder: number }[], onLog: LogCallback = noopLogger): Promise<ServiceResult<void>> {
    if (isSupabaseConfigured()) {
      const supabase = getSupabase() as any;
      for (const item of orders) {
        await supabase.from('notes').update({ displayOrder: item.displayOrder }).eq('id', item.id);
      }
      await onLog({ action: 'ORDER', resource: 'note', resourceId: 'bulk', metadata: { orders } });
      return { data: null, error: null };
    }

    const all = lsGet<Note>(LS_KEYS.notes);
    orders.forEach(o => {
      const idx = all.findIndex(n => n.id === o.id);
      if (idx !== -1) all[idx].displayOrder = o.displayOrder;
    });
    lsSet(LS_KEYS.notes, all);
    await onLog({ action: 'ORDER', resource: 'note', resourceId: 'bulk', metadata: { orders } });
    return { data: null, error: null };
  }
};

// ─────────────────────────────────────────────────────────────────────────────
//  VIDEO LECTURES SERVICE
// ─────────────────────────────────────────────────────────────────────────────

const videosService = {
  async list(): Promise<ServiceResult<Video[]>> {
    if (isSupabaseConfigured()) {
      const supabase = getSupabase() as any;
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .neq('status', 'archived')
        .order('displayOrder', { ascending: true });
      if (error) return { data: null, error: error.message };
      return { data: data as Video[], error: null };
    }
    const all = lsGet<Video>(LS_KEYS.videos);
    return { data: all.filter(v => v.status !== 'archived'), error: null };
  },

  async create(payload: Partial<Video>, userId?: string, onLog: LogCallback = noopLogger): Promise<ServiceResult<Video>> {
    const id = `vid_${Date.now()}`;
    const record: Video = {
      id,
      title: payload.title || 'Untitled Video',
      provider: payload.provider || 'youtube',
      videoIdOrUrl: payload.videoIdOrUrl || '',
      durationSeconds: payload.durationSeconds || 0,
      lessonId: payload.lessonId || '',
      classId: payload.classId || null,
      subjectId: payload.subjectId || null,
      chapterId: payload.chapterId || null,
      status: payload.status || 'draft',
      displayOrder: payload.displayOrder ?? 0,
      description: payload.description || '',
      isPremium: payload.isPremium || false,
      createdBy: userId || null,
      updatedBy: userId || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (isSupabaseConfigured()) {
      const supabase = getSupabase() as any;
      const { data, error } = await supabase.from('videos').insert(record).select().single();
      if (error) return { data: null, error: error.message };
      await onLog({ action: 'CREATE', resource: 'video', resourceId: id, resourceName: payload.title });
      return { data: data as Video, error: null };
    }

    const all = lsGet<Video>(LS_KEYS.videos);
    all.push(record);
    lsSet(LS_KEYS.videos, all);
    await onLog({ action: 'CREATE', resource: 'video', resourceId: id, resourceName: payload.title });
    return { data: record, error: null };
  },

  async update(id: string, payload: Partial<Video>, userId?: string, onLog: LogCallback = noopLogger): Promise<ServiceResult<Video>> {
    const changes = { ...payload, updatedBy: userId || null, updatedAt: new Date().toISOString() };

    if (isSupabaseConfigured()) {
      const supabase = getSupabase() as any;
      const { data, error } = await supabase.from('videos').update(changes).eq('id', id).select().single();
      if (error) return { data: null, error: error.message };
      await onLog({ action: 'UPDATE', resource: 'video', resourceId: id, metadata: changes });
      return { data: data as Video, error: null };
    }

    const all = lsGet<Video>(LS_KEYS.videos);
    const idx = all.findIndex(v => v.id === id);
    if (idx === -1) return { data: null, error: 'Video not found' };
    all[idx] = { ...all[idx], ...changes };
    lsSet(LS_KEYS.videos, all);
    await onLog({ action: 'UPDATE', resource: 'video', resourceId: id, metadata: changes });
    return { data: all[idx], error: null };
  },

  async delete(id: string, onLog: LogCallback = noopLogger): Promise<ServiceResult<void>> {
    const result = await this.update(id, { status: 'archived' }, undefined, onLog);
    if (result.error) return { data: null, error: result.error };
    await onLog({ action: 'ARCHIVE', resource: 'video', resourceId: id });
    return { data: null, error: null };
  },

  async updateOrder(orders: { id: string; displayOrder: number }[], onLog: LogCallback = noopLogger): Promise<ServiceResult<void>> {
    if (isSupabaseConfigured()) {
      const supabase = getSupabase() as any;
      for (const item of orders) {
        await supabase.from('videos').update({ displayOrder: item.displayOrder }).eq('id', item.id);
      }
      await onLog({ action: 'ORDER', resource: 'video', resourceId: 'bulk', metadata: { orders } });
      return { data: null, error: null };
    }

    const all = lsGet<Video>(LS_KEYS.videos);
    orders.forEach(o => {
      const idx = all.findIndex(v => v.id === o.id);
      if (idx !== -1) all[idx].displayOrder = o.displayOrder;
    });
    lsSet(LS_KEYS.videos, all);
    await onLog({ action: 'ORDER', resource: 'video', resourceId: 'bulk', metadata: { orders } });
    return { data: null, error: null };
  }
};

// ─────────────────────────────────────────────────────────────────────────────
//  LIVE QUIZ SERVICE (Quizzes, Questions, and Options)
// ─────────────────────────────────────────────────────────────────────────────

const quizzesService = {
  async list(): Promise<ServiceResult<Quiz[]>> {
    if (isSupabaseConfigured()) {
      const supabase = getSupabase() as any;
      const { data, error } = await supabase
        .from('quizzes')
        .select('*')
        .neq('status', 'archived');
      if (error) return { data: null, error: error.message };
      return { data: data as Quiz[], error: null };
    }
    const all = lsGet<Quiz>(LS_KEYS.quizzes);
    return { data: all.filter(q => q.status !== 'archived'), error: null };
  },

  async create(payload: Partial<Quiz>, userId?: string, onLog: LogCallback = noopLogger): Promise<ServiceResult<Quiz>> {
    const id = `quiz_${Date.now()}`;
    const record: Quiz = {
      id,
      title: payload.title || 'Untitled Quiz',
      passingScorePct: payload.passingScorePct || 50,
      timerSeconds: payload.timerSeconds || 0,
      lessonId: payload.lessonId || '',
      classId: payload.classId || null,
      subjectId: payload.subjectId || null,
      chapterId: payload.chapterId || null,
      difficulty: payload.difficulty || 'medium',
      status: payload.status || 'draft',
      createdBy: userId || null,
      updatedBy: userId || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (isSupabaseConfigured()) {
      const supabase = getSupabase() as any;
      const { data, error } = await supabase.from('quizzes').insert(record).select().single();
      if (error) return { data: null, error: error.message };
      await onLog({ action: 'CREATE', resource: 'quiz', resourceId: id, resourceName: payload.title });
      return { data: data as Quiz, error: null };
    }

    const all = lsGet<Quiz>(LS_KEYS.quizzes);
    all.push(record);
    lsSet(LS_KEYS.quizzes, all);
    await onLog({ action: 'CREATE', resource: 'quiz', resourceId: id, resourceName: payload.title });
    return { data: record, error: null };
  },

  async update(id: string, payload: Partial<Quiz>, userId?: string, onLog: LogCallback = noopLogger): Promise<ServiceResult<Quiz>> {
    const changes = { ...payload, updatedBy: userId || null, updatedAt: new Date().toISOString() };

    if (isSupabaseConfigured()) {
      const supabase = getSupabase() as any;
      const { data, error } = await supabase.from('quizzes').update(changes).eq('id', id).select().single();
      if (error) return { data: null, error: error.message };
      await onLog({ action: 'UPDATE', resource: 'quiz', resourceId: id, metadata: changes });
      return { data: data as Quiz, error: null };
    }

    const all = lsGet<Quiz>(LS_KEYS.quizzes);
    const idx = all.findIndex(q => q.id === id);
    if (idx === -1) return { data: null, error: 'Quiz not found' };
    all[idx] = { ...all[idx], ...changes };
    lsSet(LS_KEYS.quizzes, all);
    await onLog({ action: 'UPDATE', resource: 'quiz', resourceId: id, metadata: changes });
    return { data: all[idx], error: null };
  },

  async delete(id: string, onLog: LogCallback = noopLogger): Promise<ServiceResult<void>> {
    const result = await this.update(id, { status: 'archived' }, undefined, onLog);
    if (result.error) return { data: null, error: result.error };
    await onLog({ action: 'ARCHIVE', resource: 'quiz', resourceId: id });
    return { data: null, error: null };
  },

  // ── Questions & Options Management ──
  async getQuestions(quizId: string): Promise<ServiceResult<QuizQuestion[]>> {
    if (isSupabaseConfigured()) {
      const supabase = getSupabase() as any;
      const { data, error } = await supabase
        .from('quiz_questions')
        .select('*')
        .eq('quizId', quizId)
        .order('orderIndex', { ascending: true });
      if (error) return { data: null, error: error.message };
      return { data: data as QuizQuestion[], error: null };
    }
    const all = lsGet<QuizQuestion>(LS_KEYS.questions);
    return { data: all.filter(q => q.quizId === quizId), error: null };
  },

  async getOptions(questionId: string): Promise<ServiceResult<QuizOption[]>> {
    if (isSupabaseConfigured()) {
      const supabase = getSupabase() as any;
      const { data, error } = await supabase
        .from('quiz_options')
        .select('*')
        .eq('questionId', questionId);
      if (error) return { data: null, error: error.message };
      return { data: data as QuizOption[], error: null };
    }
    const all = lsGet<QuizOption>(LS_KEYS.options);
    return { data: all.filter(o => o.questionId === questionId), error: null };
  },

  async saveQuestion(
    quizId: string,
    questionText: string,
    options: { text: string; isCorrect: boolean }[],
    questionId?: string,
    onLog: LogCallback = noopLogger
  ): Promise<ServiceResult<void>> {
    const qId = questionId || `q_${Date.now()}`;
    const questionRecord = {
      id: qId,
      quizId,
      questionText,
      orderIndex: 0,
    };

    if (isSupabaseConfigured()) {
      const supabase = getSupabase() as any;
      if (questionId) {
        await supabase.from('quiz_questions').update({ questionText }).eq('id', qId);
        await supabase.from('quiz_options').delete().eq('questionId', qId);
      } else {
        await supabase.from('quiz_questions').insert(questionRecord);
      }

      const optionRecords = options.map((opt, idx) => ({
        id: `opt_${qId}_${idx}_${Date.now()}`,
        questionId: qId,
        optionText: opt.text,
        isCorrect: opt.isCorrect,
      }));

      await supabase.from('quiz_options').insert(optionRecords);
      await onLog({ action: questionId ? 'UPDATE' : 'CREATE', resource: 'question', resourceId: qId });
      return { data: null, error: null };
    }

    // LocalStorage fallback
    const allQuestions = lsGet<QuizQuestion>(LS_KEYS.questions);
    if (questionId) {
      const idx = allQuestions.findIndex(q => q.id === qId);
      if (idx !== -1) allQuestions[idx].questionText = questionText;
    } else {
      allQuestions.push(questionRecord);
    }
    lsSet(LS_KEYS.questions, allQuestions);

    const allOptions = lsGet<QuizOption>(LS_KEYS.options).filter(o => o.questionId !== qId);
    options.forEach((opt, idx) => {
      allOptions.push({
        id: `opt_${qId}_${idx}`,
        questionId: qId,
        optionText: opt.text,
        isCorrect: opt.isCorrect,
      });
    });
    lsSet(LS_KEYS.options, allOptions);
    await onLog({ action: questionId ? 'UPDATE' : 'CREATE', resource: 'question', resourceId: qId });
    return { data: null, error: null };
  },

  async deleteQuestion(questionId: string, onLog: LogCallback = noopLogger): Promise<ServiceResult<void>> {
    if (isSupabaseConfigured()) {
      const supabase = getSupabase() as any;
      await supabase.from('quiz_options').delete().eq('questionId', questionId);
      const { error } = await supabase.from('quiz_questions').delete().eq('id', questionId);
      if (error) return { data: null, error: error.message };
      await onLog({ action: 'DELETE', resource: 'question', resourceId: questionId });
      return { data: null, error: null };
    }

    lsSet(LS_KEYS.questions, lsGet<QuizQuestion>(LS_KEYS.questions).filter(q => q.id !== questionId));
    lsSet(LS_KEYS.options, lsGet<QuizOption>(LS_KEYS.options).filter(o => o.questionId !== questionId));
    await onLog({ action: 'DELETE', resource: 'question', resourceId: questionId });
    return { data: null, error: null };
  }
};

// ─────────────────────────────────────────────────────────────────────────────
//  BULK ORDERING SERVICE FOR ENTITIES
// ─────────────────────────────────────────────────────────────────────────────

export const orderingService = {
  async updateOrder(
    type: 'standards' | 'subjects' | 'chapters' | 'notes' | 'videos' | 'pyqs',
    orders: { id: string; displayOrder: number }[],
    onLog: LogCallback = noopLogger
  ): Promise<ServiceResult<void>> {
    const tableMap = {
      standards: 'classes',
      subjects: 'subjects',
      chapters: 'chapters',
      notes: 'notes',
      videos: 'videos',
      pyqs: 'notes',
    } as const;

    const columnMap = {
      standards: 'priority',
      subjects: 'displayOrder',
      chapters: 'orderIndex',
      notes: 'displayOrder',
      videos: 'displayOrder',
      pyqs: 'displayOrder',
    } as const;

    const table = tableMap[type];
    const column = columnMap[type];

    if (isSupabaseConfigured()) {
      const supabase = getSupabase() as any;
      for (const item of orders) {
        await supabase.from(table).update({ [column]: item.displayOrder }).eq('id', item.id);
      }
      await onLog({ action: 'ORDER', resource: 'note', resourceId: 'bulk', metadata: { type, orders } });
      return { data: null, error: null };
    }

    const lsKeyMap = {
      standards: 'rk_admin_classes',
      subjects: 'rk_admin_subjects',
      chapters: 'rk_admin_chapters',
      notes: 'rk_admin_notes',
      videos: 'rk_admin_videos',
      pyqs: 'rk_admin_notes',
    } as const;

    const key = lsKeyMap[type];
    const all = lsGet<any>(key);
    orders.forEach(o => {
      const idx = all.findIndex((n: any) => n.id === o.id);
      if (idx !== -1) {
        all[idx][column] = o.displayOrder;
      }
    });
    lsSet(key, all);
    await onLog({ action: 'ORDER', resource: 'note', resourceId: 'bulk', metadata: { type, orders } });
    return { data: null, error: null };
  }
};

export const contentService = {
  notes: notesService,
  videos: videosService,
  quizzes: quizzesService,
};
