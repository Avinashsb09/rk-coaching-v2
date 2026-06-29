/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AcademicClass, AcademicSubject, Course, AcademicChapter, Lesson, Video, Note, Announcement, FaqItem, UserProfile } from '../types';
import { getSupabase, isSupabaseConfigured } from '../lib/supabase';
import { mockClasses, mockSubjects, mockCourses, mockChapters, mockLessons, mockVideos, mockNotes, mockAnnouncements } from '../lib/mockData';

export interface DatabaseContextType {
  classes: AcademicClass[];
  setClasses: React.Dispatch<React.SetStateAction<AcademicClass[]>>;
  subjects: AcademicSubject[];
  setSubjects: React.Dispatch<React.SetStateAction<AcademicSubject[]>>;
  courses: Course[];
  setCourses: React.Dispatch<React.SetStateAction<Course[]>>;
  chapters: AcademicChapter[];
  setChapters: React.Dispatch<React.SetStateAction<AcademicChapter[]>>;
  lessons: Lesson[];
  setLessons: React.Dispatch<React.SetStateAction<Lesson[]>>;
  videos: Video[];
  setVideos: React.Dispatch<React.SetStateAction<Video[]>>;
  notes: Note[];
  setNotes: React.Dispatch<React.SetStateAction<Note[]>>;
  announcements: Announcement[];
  setAnnouncements: React.Dispatch<React.SetStateAction<Announcement[]>>;
  faqs: FaqItem[];
  setFaqs: React.Dispatch<React.SetStateAction<FaqItem[]>>;
  users: UserProfile[];
  setUsers: React.Dispatch<React.SetStateAction<UserProfile[]>>;
  homepageConfig: {
    heroTitle: string;
    heroSubtitle: string;
    featuredCourseIds: string[];
    testimonials: { id: string; author: string; role: string; quote: string; rating: number }[];
    contactPhone: string;
    contactEmail: string;
    contactAddress: string;
    footerText: string;
  };
  setHomepageConfig: React.Dispatch<React.SetStateAction<any>>;
  loadingCatalog: boolean;
  loadCatalogData: () => Promise<void>;
}

export const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);

export function DatabaseProvider({ children }: { children: ReactNode }) {
  const [classes, setClasses] = useState<AcademicClass[]>([]);
  const [subjects, setSubjects] = useState<AcademicSubject[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [chapters, setChapters] = useState<AcademicChapter[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loadingCatalog, setLoadingCatalog] = useState(false);

  const [homepageConfig, setHomepageConfigState] = useState({
    heroTitle: 'RK coaching institute',
    heroSubtitle: 'Transforming Academic Potential into Top Ranks. Comprehensive syllabus coverage, digital study binders, and interactive assessments for Class 6–12 & NEET Aspirants.',
    featuredCourseIds: ['course_cbse_math', 'course_neet_bio'],
    testimonials: [
      { id: 't1', author: 'Aditya Vardhan', role: 'NEET Rank 184 (2025)', quote: 'The digital revision notes and continuous chapter tests saved me hundreds of hours of preparation time!', rating: 5 },
      { id: 't2', author: 'Priya Sharma', role: 'Class 12 Board 98.4%', quote: 'Highly clean, premium platform. Tapping to unlock chapters instantly via UPI made standard studying seamless.', rating: 5 }
    ],
    contactPhone: '+91 98765 43210',
    contactEmail: 'admissions@rkcoaching.com',
    contactAddress: 'RK Complex, Sector 4, Rohini, New Delhi, India',
    footerText: '© 2026 RK Coaching Institute. All Rights Reserved. Empowering students across standard board classes and national competitive exams.'
  });

  const setHomepageConfig = (action: React.SetStateAction<any>) => {
    setHomepageConfigState((prev) => {
      const next = typeof action === 'function' ? (action as Function)(prev) : action;
      if (isSupabaseConfigured()) {
        const supabase = getSupabase();
        if (supabase) {
          (supabase as any).from('admin_settings').upsert({ id: 'homepage_config', value: next }).catch((err: any) => {
            console.error("Error background syncing homepage config:", err);
          });
        }
      }
      return next;
    });
  };

  const loadCatalogData = async () => {
    const supabase = getSupabase();
    if (isSupabaseConfigured() && supabase) {
      setLoadingCatalog(true);
      const s = supabase as any;
      try {
        // SELECT only. NO automatic inserts or seeding writes on startup.
        const results = await Promise.all([
          s.from('classes').select('*').order('priority', { ascending: true }),
          s.from('subjects').select('*'),
          s.from('courses').select('*'),
          s.from('chapters').select('*').order('orderIndex', { ascending: true }),
          s.from('lessons').select('*').order('orderIndex', { ascending: true }),
          s.from('videos').select('*'),
          s.from('notes').select('*'),
          s.from('announcements').select('*'),
          s.from('faq').select('*').order('orderIndex', { ascending: true }),
          s.from('profiles').select('*').neq('role', 'visitor'),
          s.from('admin_settings').select('*').eq('id', 'homepage_config').single()
        ]);

        // Detect if any query returned a 401 Unauthorized / expired token error
        const authError = results.find(
          (r: any) =>
            r.error &&
            (r.error.status === 401 ||
              r.error.message?.toLowerCase().includes('jwt') ||
              r.error.message?.toLowerCase().includes('unauthorized') ||
              r.error.code === 'PGRST301')
        );

        if (authError) {
          console.warn('Stale or invalid authentication session detected on startup. Clearing session to restore public access:', authError.error);
          
          // Clear Supabase session and local storage
          await supabase.auth.signOut().catch(() => {});
          try {
            for (let i = 0; i < localStorage.length; i++) {
              const key = localStorage.key(i);
              if (key && (key.startsWith('sb-') || key.includes('supabase.auth'))) {
                localStorage.removeItem(key);
              }
            }
          } catch (e) {}

          // Reset loading and retry loading the catalog cleanly as visitor
          setLoadingCatalog(false);
          await loadCatalogData();
          return;
        }

        const [
          { data: dbClasses },
          { data: dbSubjects },
          { data: dbCourses },
          { data: dbChapters },
          { data: dbLessons },
          { data: dbVideos },
          { data: dbNotes },
          { data: dbAnnouncements },
          { data: dbFaqs },
          { data: dbProfiles },
          { data: dbSettings }
        ] = results;

        setClasses(dbClasses || []);
        setSubjects(dbSubjects || []);
        setCourses(dbCourses || []);
        setChapters(dbChapters || []);
        setLessons(dbLessons || []);
        setVideos(dbVideos || []);
        setNotes(dbNotes || []);
        setAnnouncements(dbAnnouncements || []);
        setFaqs(dbFaqs || []);
        setUsers(dbProfiles || []);

        if (dbSettings && dbSettings.value) {
          setHomepageConfigState(dbSettings.value);
        }
      } catch (err) {
        console.error('Failed to load catalog data from Supabase:', err);
      } finally {
        setLoadingCatalog(false);
      }
    } else {
      // Supabase is not configured, load in-memory fallback mock arrays so the interface is fully interactive
      setClasses(mockClasses);
      setSubjects(mockSubjects);
      setCourses(mockCourses);
      setChapters(mockChapters);
      setLessons(mockLessons);
      setVideos(mockVideos);
      setNotes(mockNotes);
      setAnnouncements(mockAnnouncements);
      setFaqs([
        {
          id: 'faq_1',
          category: 'admission',
          question: 'Which classes are supported by RK Coaching?',
          answer: 'We provide comprehensive courses for Class 6 to Class 12 and NEET pre-medical preparation modules.',
          orderIndex: 1
        },
        {
          id: 'faq_2',
          category: 'payment',
          question: 'How do I unlock Premium Course materials?',
          answer: 'Tap "Buy Now" on any locked lesson. It opens a secure Razorpay checkout modal where you can pay via UPI to unlock instantly.',
          orderIndex: 2
        },
        {
          id: 'faq_3',
          category: 'technical',
          question: 'Are the course PDF notes available for offline download?',
          answer: 'Yes! Once you enroll in a course (or unlock the premium tier), you can tap the Download icon next to any PDF study note to save it directly to your phone or computer for offline reading.',
          orderIndex: 3
        }
      ]);
      setUsers([
        {
          id: '00000000-0000-0000-0000-000000000001',
          email: 'student@rkcoaching.com',
          fullName: 'Aarav Sharma',
          role: 'student',
          dailyStreak: 5,
          totalXp: 1250,
          badges: ['streak_5', 'quiz_master', 'speed_learner'],
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80'
        },
        {
          id: '00000000-0000-0000-0000-000000000002',
          email: 'teacher@rkcoaching.com',
          fullName: 'Prof. Rajesh Khanna',
          role: 'teacher',
          dailyStreak: 12,
          totalXp: 5400,
          badges: ['pioneer', 'mentor_lvl_3'],
          avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=150&h=150&q=80'
        },
        {
          id: '00000000-0000-0000-0000-000000000003',
          email: 'admin@rkcoaching.com',
          fullName: 'RK Admin Control',
          role: 'admin',
          dailyStreak: 154,
          totalXp: 99999,
          badges: ['founder', 'mod_supreme'],
          avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&h=150&q=80'
        }
      ]);
    }
  };

  useEffect(() => {
    loadCatalogData();
  }, []);

  return (
    <DatabaseContext.Provider
      value={{
        classes,
        setClasses,
        subjects,
        setSubjects,
        courses,
        setCourses,
        chapters,
        setChapters,
        lessons,
        setLessons,
        videos,
        setVideos,
        notes,
        setNotes,
        announcements,
        setAnnouncements,
        faqs,
        setFaqs,
        users,
        setUsers,
        homepageConfig,
        setHomepageConfig,
        loadingCatalog,
        loadCatalogData
      }}
    >
      {children}
    </DatabaseContext.Provider>
  );
}

export function useDatabase() {
  const ctx = useContext(DatabaseContext);
  if (!ctx) throw new Error('useDatabase must be used within DatabaseProvider');
  return ctx;
}
