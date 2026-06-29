/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { UserProgress } from '../types';
import { getSupabase, isSupabaseConfigured } from '../lib/supabase';

export interface ProgressContextType {
  progressList: UserProgress[];
  setProgressList: React.Dispatch<React.SetStateAction<UserProgress[]>>;
  saveProgress: (courseId: string, lessonId: string, watchedPercentage: number, isCompleted: boolean, studyTimeSeconds: number, userId: string | undefined) => Promise<void>;
  getLessonProgress: (lessonId: string) => UserProgress | null;
  loadProgress: (userId: string) => Promise<void>;
}

export const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [progressList, setProgressList] = useState<UserProgress[]>([]);

  const loadProgress = async (userId: string) => {
    if (isSupabaseConfigured() && getSupabase()) {
      const supabase = getSupabase()!;
      try {
        const { data } = await supabase
          .from('user_progress')
          .select('*')
          .eq('userId', userId);
        if (data) {
          setProgressList(data as any);
        }
      } catch (err) {
        console.error('Failed to load progress list:', err);
      }
    } else {
      const saved = localStorage.getItem(`rk_progress_${userId}`);
      if (saved) {
        setProgressList(JSON.parse(saved));
      } else {
        setProgressList([]);
      }
    }
  };

  const saveProgress = async (
    courseId: string,
    lessonId: string,
    watchedPercentage: number,
    isCompleted: boolean,
    studyTimeSeconds: number,
    userId: string | undefined
  ) => {
    const idVal = userId || 'guest';
    if (typeof window !== 'undefined') {
      localStorage.setItem('rk_last_course_id', courseId);
      localStorage.setItem('rk_last_lesson_id', lessonId);
    }

    if (isSupabaseConfigured() && getSupabase() && userId) {
      const supabase = getSupabase()!;
      try {
        const { error } = await (supabase.from('user_progress') as any).upsert(
          {
            userId,
            courseId,
            lessonId,
            watchedPercentage,
            isCompleted,
            studyTimeSeconds,
            lastAccessedAt: new Date().toISOString()
          },
          { onConflict: 'userId,lessonId' }
        );
        if (!error) {
          await loadProgress(userId);
        }
      } catch (err) {
        console.error('Error saving progress:', err);
      }
    } else {
      setProgressList((prev) => {
        const existingIdx = prev.findIndex((p) => p.lessonId === lessonId);
        const list = [...prev];
        if (existingIdx > -1) {
          list[existingIdx] = {
            ...list[existingIdx],
            watchedPercentage: Math.max(list[existingIdx].watchedPercentage, watchedPercentage),
            isCompleted: list[existingIdx].isCompleted || isCompleted,
            studyTimeSeconds: list[existingIdx].studyTimeSeconds + studyTimeSeconds,
            lastAccessedAt: new Date().toISOString()
          };
        } else {
          list.push({
            id: Math.random().toString(36).substring(2, 9),
            userId: idVal,
            courseId,
            lessonId,
            watchedPercentage,
            isCompleted,
            studyTimeSeconds,
            lastAccessedAt: new Date().toISOString()
          });
        }
        localStorage.setItem(`rk_progress_${idVal}`, JSON.stringify(list));
        return list;
      });
    }
  };

  const getLessonProgress = (lessonId: string) => {
    return progressList.find((p) => p.lessonId === lessonId) || null;
  };

  return (
    <ProgressContext.Provider
      value={{
        progressList,
        setProgressList,
        saveProgress,
        getLessonProgress,
        loadProgress
      }}
    >
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress() {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error('useProgress must be used within ProgressProvider');
  return ctx;
}
