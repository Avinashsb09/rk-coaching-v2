/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import { getSupabase, isSupabaseConfigured } from '../lib/supabase';
import { Course, Lesson, Quiz, LeaderboardEntry } from '../types';

/**
 * Reusable hook to fetch and synchronize course directories from Supabase.
 * Falls back gracefully with loading, error, empty, and retry states.
 */
export function useSupabaseCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCourses = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      return; // Fallback to context's pre-seeded data in demo mode
    }

    const supabase = getSupabase();
    if (!supabase) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error: err } = await supabase
        .from('courses')
        .select('*')
        .order('createdAt', { ascending: false });

      if (err) throw err;
      setCourses(data || []);
    } catch (e: any) {
      setError(e.message || 'Failed to fetch course syllabus directory');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  return { courses, loading, error, retry: fetchCourses, isEmpty: courses.length === 0 };
}

/**
 * Reusable hook to fetch course lessons from Supabase.
 */
export function useSupabaseLessons(courseId: string) {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLessons = useCallback(async () => {
    if (!courseId || !isSupabaseConfigured()) return;

    const supabase = getSupabase();
    if (!supabase) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error: err } = await supabase
        .from('lessons')
        .select('*')
        .eq('courseId', courseId)
        .order('orderIndex', { ascending: true });

      if (err) throw err;
      setLessons(data || []);
    } catch (e: any) {
      setError(e.message || 'Failed to retrieve lessons');
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchLessons();
  }, [fetchLessons]);

  return { lessons, loading, error, retry: fetchLessons, isEmpty: lessons.length === 0 };
}

/**
 * Reusable hook to retrieve lesson quizzes and assessments.
 */
export function useSupabaseQuizzes(lessonId: string) {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchQuizzes = useCallback(async () => {
    if (!lessonId || !isSupabaseConfigured()) return;

    const supabase = getSupabase();
    if (!supabase) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error: err } = await supabase
        .from('quizzes')
        .select('*')
        .eq('lessonId', lessonId);

      if (err) throw err;
      setQuizzes(data || []);
    } catch (e: any) {
      setError(e.message || 'Failed to fetch active quizzes');
    } finally {
      setLoading(false);
    }
  }, [lessonId]);

  useEffect(() => {
    fetchQuizzes();
  }, [fetchQuizzes]);

  return { quizzes, loading, error, retry: fetchQuizzes, isEmpty: quizzes.length === 0 };
}

/**
 * Reusable hook to fetch the gamified student leaderboard from Supabase.
 */
export function useSupabaseLeaderboard() {
  const [rankings, setRankings] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaderboard = useCallback(async () => {
    if (!isSupabaseConfigured()) return;

    const supabase = getSupabase();
    if (!supabase) return;

    setLoading(true);
    setError(null);

    try {
      // Query profile stats sorted by XP points to build real rankings
      const { data, error: err } = await supabase
        .from('profiles')
        .select('id, fullName, role, avatarUrl, totalXp')
        .order('totalXp', { ascending: false })
        .limit(50);

      if (err) throw err;

      // Map to Leaderboard Entry representation
      const mapped: LeaderboardEntry[] = ((data as any[]) || []).map((row, idx) => ({
        id: row.id,
        userId: row.id,
        fullName: row.fullName || 'Scholar',
        role: row.role as any,
        avatarUrl: row.avatarUrl,
        pointsXp: row.totalXp || 0,
        rank: idx + 1,
      }));

      setRankings(mapped);
    } catch (e: any) {
      setError(e.message || 'Failed to download real-time leaderboard statistics');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  return { rankings, loading, error, retry: fetchLeaderboard, isEmpty: rankings.length === 0 };
}

/**
 * Reusable hook to handle secure uploads to Supabase Storage Buckets.
 * Supports avatar profile pictures, handwriting study notes (PDFs), and academic documents.
 */
export function useUploadFile(bucket: 'avatars' | 'notes' | 'documents' | 'videos') {
  const [uploading, setUploading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [publicUrl, setPublicUrl] = useState<string | null>(null);

  const upload = async (file: File, customPath?: string) => {
    if (!isSupabaseConfigured()) {
      setError('Supabase is not configured yet. Set credentials to enable file uploads.');
      return null;
    }

    const supabase = getSupabase();
    if (!supabase) return null;

    setUploading(true);
    setError(null);
    setPublicUrl(null);

    try {
      const fileExt = file.name.split('.').pop();
      const randomId = Math.random().toString(36).substring(2, 9);
      const filePath = customPath || `${Date.now()}_${randomId}.${fileExt}`;

      const { error: uploadErr } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadErr) throw uploadErr;

      // Retrieve public download link
      const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
      
      setPublicUrl(data.publicUrl);
      return data.publicUrl;
    } catch (err: any) {
      const errMsg = err.message || 'File upload failed';
      setError(errMsg);
      return null;
    } finally {
      setUploading(false);
    }
  };

  return { upload, uploading, error, publicUrl };
}
