/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Course } from '../types';
import { getSupabase, isSupabaseConfigured } from '../lib/supabase';

export interface CourseContextType {
  selectedClassSlug: string | null;
  setSelectedClassSlug: (slug: string | null) => void;
  selectedSubjectId: string | null;
  setSelectedSubjectId: (id: string | null) => void;
  selectedCourseId: string | null;
  setSelectedCourseId: (id: string | null) => void;
  selectedLessonId: string | null;
  setSelectedLessonId: (id: string | null) => void;

  enrolledCourseIds: string[];
  setEnrolledCourseIds: React.Dispatch<React.SetStateAction<string[]>>;
  enrollInCourse: (courseId: string, isPaid: boolean | undefined, rzpId: string | undefined, rzpOrderId: string | undefined, userId: string | undefined, courses: Course[], addToast: any, addNotification: any) => Promise<void>;
  hasCourseAccess: (courseId: string, role: string, courses: Course[]) => boolean;
  getEnrolledCourses: (role: string, courses: Course[]) => Course[];
  loadEnrollments: (userId: string) => Promise<void>;

  unlockedSubjectNoteIds: string[];
  setUnlockedSubjectNoteIds: React.Dispatch<React.SetStateAction<string[]>>;
  unlockSubjectNotes: (subjectId: string, rzpId: string | undefined, rzpOrderId: string | undefined, userId: string | undefined, courses: Course[], addToast: any, addNotification: any) => Promise<void>;
  hasSubjectNotesAccess: (subjectId: string, role: string) => boolean;
  loadSubjectNotesPurchases: (userId: string) => Promise<void>;
}

export const CourseContext = createContext<CourseContextType | undefined>(undefined);

export function CourseProvider({ children }: { children: ReactNode }) {
  const [selectedClassSlug, setSelectedClassSlug] = useState<string | null>(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<string[]>([]);
  const [unlockedSubjectNoteIds, setUnlockedSubjectNoteIds] = useState<string[]>([]);

  const loadSubjectNotesPurchases = async (userId: string) => {
    if (isSupabaseConfigured() && getSupabase()) {
      const supabase = getSupabase()!;
      try {
        const { data } = await supabase
          .from('subject_notes_purchases')
          .select('subjectId')
          .eq('userId', userId);
        if (data) {
          setUnlockedSubjectNoteIds(data.map((e: any) => e.subjectId));
        }
      } catch (err) {
        console.error('Failed to load subject notes purchases:', err);
      }
    } else {
      const saved = localStorage.getItem(`rk_subject_notes_${userId}`);
      if (saved) {
        setUnlockedSubjectNoteIds(JSON.parse(saved));
      } else {
        setUnlockedSubjectNoteIds([]);
      }
    }
  };

  const unlockSubjectNotes = async (
    subjectId: string,
    rzpId = '',
    rzpOrderId = '',
    userId: string | undefined,
    courses: Course[],
    addToast: any,
    addNotification: any
  ) => {
    if (!userId) {
      addToast('Please login to purchase premium notes', 'error');
      return;
    }

    if (isSupabaseConfigured() && getSupabase()) {
      const supabase = getSupabase()!;
      try {
        await (supabase.from('subject_notes_purchases') as any).upsert(
          {
            userId,
            subjectId
          },
          { onConflict: 'userId,subjectId' }
        );

        const matchedCourse = courses.find((c) => c.subjectId === subjectId);
        if (matchedCourse) {
          const orderId = rzpOrderId || 'order_' + Math.random().toString(36).substring(2, 9);
          const paymentId = rzpId || 'pay_' + Math.random().toString(36).substring(2, 9);

          await (supabase.from('orders') as any).insert({
            id: orderId,
            userId,
            courseId: matchedCourse.id,
            amount: 30,
            status: 'completed'
          });

          await (supabase.from('payments') as any).insert({
            id: paymentId,
            orderId,
            userId,
            amount: 30,
            method: 'Razorpay Checkout (Notes)',
            status: 'success'
          });
        }

        await loadSubjectNotesPurchases(userId);
      } catch (err) {
        console.error('Failed to save subject notes purchase on Supabase:', err);
      }
    } else {
      setUnlockedSubjectNoteIds((prev) => {
        const updated = Array.from(new Set([...prev, subjectId]));
        localStorage.setItem(`rk_subject_notes_${userId}`, JSON.stringify(updated));
        return updated;
      });
    }

    await addNotification(
      'Premium Notes Unlocked',
      `Subject notes purchased and unlocked successfully! You now have permanent access.`,
      userId
    );
    addToast('Premium Notes Unlocked!', 'success');
  };

  const hasSubjectNotesAccess = (subjectId: string, role: string): boolean => {
    if (role === 'admin' || role === 'teacher') return true;
    return unlockedSubjectNoteIds.includes(subjectId);
  };

  const loadEnrollments = async (userId: string) => {
    if (isSupabaseConfigured() && getSupabase()) {
      const supabase = getSupabase()!;
      try {
        const { data } = await supabase
          .from('enrollments')
          .select('courseId')
          .eq('userId', userId);
        if (data) {
          setEnrolledCourseIds(data.map((e: any) => e.courseId));
        }
      } catch (err) {
        console.error('Failed to load enrollments:', err);
      }
    } else {
      const saved = localStorage.getItem(`rk_enrollments_${userId}`);
      if (saved) {
        setEnrolledCourseIds(JSON.parse(saved));
      } else {
        setEnrolledCourseIds([]);
      }
    }
  };

  const enrollInCourse = async (
    courseId: string,
    isPaid = false,
    rzpId = '',
    rzpOrderId = '',
    userId: string | undefined,
    courses: Course[],
    addToast: any,
    addNotification: any
  ) => {
    if (!userId) {
      addToast('Please login to enroll in courses', 'error');
      return;
    }

    if (isSupabaseConfigured() && getSupabase()) {
      const supabase = getSupabase()!;
      try {
        await (supabase.from('enrollments') as any).upsert(
          {
            userId,
            courseId
          },
          { onConflict: 'userId,courseId' }
        );

        if (isPaid) {
          const course = courses.find((c) => c.id === courseId);
          const amount = course?.discountPrice || course?.price || 0;
          const orderId = rzpOrderId || 'order_' + Math.random().toString(36).substring(2, 9);
          const paymentId = rzpId || 'pay_' + Math.random().toString(36).substring(2, 9);

          await (supabase.from('orders') as any).insert({
            id: orderId,
            userId,
            courseId,
            amount,
            status: 'completed'
          });

          await (supabase.from('payments') as any).insert({
            id: paymentId,
            orderId,
            userId,
            amount,
            method: 'Razorpay Checkout',
            status: 'success'
          });
        }

        await loadEnrollments(userId);
      } catch (err) {
        console.error('Failed to enroll in course on Supabase:', err);
      }
    } else {
      setEnrolledCourseIds((prev) => {
        const updated = Array.from(new Set([...prev, courseId]));
        localStorage.setItem(`rk_enrollments_${userId}`, JSON.stringify(updated));
        return updated;
      });
    }

    const courseObj = courses.find((c) => c.id === courseId);
    await addNotification(
      isPaid ? 'Premium Course Unlocked' : 'Enrolled Successfully',
      `You are now enrolled in "${courseObj?.title || 'Course'}". Start studying interactive notes and lectures instantly!`,
      userId
    );
    addToast(isPaid ? 'Premium Course Unlocked!' : 'Enrolled successfully!', 'success');
  };

  const hasCourseAccess = (courseId: string, role: string, courses: Course[]): boolean => {
    if (role === 'admin' || role === 'teacher') return true;
    const course = courses.find((c) => c.id === courseId);
    if (!course) return false;
    if (!course.isPremium) return true;
    return enrolledCourseIds.includes(courseId);
  };

  const getEnrolledCourses = (role: string, courses: Course[]): Course[] => {
    if (role === 'admin' || role === 'teacher') return courses;
    return courses.filter((c) => enrolledCourseIds.includes(c.id));
  };

  return (
    <CourseContext.Provider
      value={{
        selectedClassSlug,
        setSelectedClassSlug,
        selectedSubjectId,
        setSelectedSubjectId,
        selectedCourseId,
        setSelectedCourseId,
        selectedLessonId,
        setSelectedLessonId,
        enrolledCourseIds,
        setEnrolledCourseIds,
        enrollInCourse,
        hasCourseAccess,
        getEnrolledCourses,
        loadEnrollments,
        unlockedSubjectNoteIds,
        setUnlockedSubjectNoteIds,
        unlockSubjectNotes,
        hasSubjectNotesAccess,
        loadSubjectNotesPurchases
      }}
    >
      {children}
    </CourseContext.Provider>
  );
}

export function useCourses() {
  const ctx = useContext(CourseContext);
  if (!ctx) throw new Error('useCourses must be used within CourseProvider');
  return ctx;
}
