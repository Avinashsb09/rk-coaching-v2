import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  AcademicClass, AcademicSubject, Course, AcademicChapter, Lesson, Video, Note, 
  Announcement, FaqItem, UserProfile, Quiz, QuizQuestion, QuizOption, QuizAttempt, LeaderboardEntry 
} from '../types';
import { getSupabase, isSupabaseConfigured } from '../lib/supabase';
import { 
  mockClasses, mockSubjects, mockCourses, mockChapters, mockLessons, 
  mockVideos, mockNotes, mockAnnouncements 
} from '../lib/mockData';
import { 
  initialQuizzes, initialQuestions, initialOptions, initialAttempts, initialLeaderboards 
} from '../lib/quizMockData';
import { useAuth } from './AuthContext';
import { DEMO_STUDENT_ID } from '../config/dataMode';

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

  // Quiz Module states
  quizzes: Quiz[];
  setQuizzes: React.Dispatch<React.SetStateAction<Quiz[]>>;
  quizQuestions: QuizQuestion[];
  setQuizQuestions: React.Dispatch<React.SetStateAction<QuizQuestion[]>>;
  quizOptions: QuizOption[];
  setQuizOptions: React.Dispatch<React.SetStateAction<QuizOption[]>>;
  quizAttempts: QuizAttempt[];
  setQuizAttempts: React.Dispatch<React.SetStateAction<QuizAttempt[]>>;
  leaderboardEntries: LeaderboardEntry[];
  setLeaderboardEntries: React.Dispatch<React.SetStateAction<LeaderboardEntry[]>>;
}

export const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);

export function DatabaseProvider({ children }: { children: ReactNode }) {
  const { initializing } = useAuth();
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

  // Quiz States
  const [quizzes, setQuizzes] = useState<Quiz[]>(() => {
    const saved = localStorage.getItem('rk_quizzes');
    return saved ? JSON.parse(saved) : initialQuizzes;
  });
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>(() => {
    const saved = localStorage.getItem('rk_quiz_questions');
    return saved ? JSON.parse(saved) : initialQuestions;
  });
  const [quizOptions, setQuizOptions] = useState<QuizOption[]>(() => {
    const saved = localStorage.getItem('rk_quiz_options');
    return saved ? JSON.parse(saved) : initialOptions;
  });
  const [quizAttempts, setQuizAttempts] = useState<QuizAttempt[]>(() => {
    const saved = localStorage.getItem('rk_quiz_attempts');
    return saved ? JSON.parse(saved) : initialAttempts;
  });
  const [leaderboardEntries, setLeaderboardEntries] = useState<LeaderboardEntry[]>(() => {
    const saved = localStorage.getItem('rk_leaderboards');
    return saved ? JSON.parse(saved) : initialLeaderboards;
  });

  // Local Storage synchronizers
  useEffect(() => {
    localStorage.setItem('rk_quizzes', JSON.stringify(quizzes));
  }, [quizzes]);

  useEffect(() => {
    localStorage.setItem('rk_quiz_questions', JSON.stringify(quizQuestions));
  }, [quizQuestions]);

  useEffect(() => {
    localStorage.setItem('rk_quiz_options', JSON.stringify(quizOptions));
  }, [quizOptions]);

  useEffect(() => {
    localStorage.setItem('rk_quiz_attempts', JSON.stringify(quizAttempts));
  }, [quizAttempts]);

  useEffect(() => {
    localStorage.setItem('rk_leaderboards', JSON.stringify(leaderboardEntries));
  }, [leaderboardEntries]);

  const [homepageConfig, setHomepageConfigState] = useState({
    heroTitle: 'RK coaching institute',
    heroSubtitle: 'Transforming Academic Potential into Top Ranks. Comprehensive syllabus coverage, digital study binders, and interactive assessments for Class 6–12 & NEET (Biology & Chemistry) Aspirants.',
    featuredCourseIds: ['course_cbse_math', 'course_neet_bio'],
    testimonials: [
      { id: 't1', author: 'Aditya Vardhan', role: 'NEET (Biology & Chemistry) Rank 184 (2025)', quote: 'The digital revision notes and continuous chapter tests saved me hundreds of hours of preparation time!', rating: 5 },
      { id: 't2', author: 'Priya Sharma', role: 'Class 12 Board 98.4%', quote: 'Highly clean, premium platform. Tapping to unlock chapters instantly via UPI made standard studying seamless.', rating: 5 }
    ],
    contactPhone: '+91 88220 91760',
    contactEmail: 'ravikantjnv18@gmail.com',
    contactAddress: '',
    footerText: '© 2026 RK Coaching Institute. All Rights Reserved. Empowering students across standard board classes and national competitive exams.'
  });

  const setHomepageConfig = (action: React.SetStateAction<any>) => {
    setHomepageConfigState((prev) => {
      const next = typeof action === 'function' ? (action as Function)(prev) : action;
      if (isSupabaseConfigured()) {
        const supabase = getSupabase();
        if (supabase) {
          (async () => {
            try {
              const { error } = await (supabase as any).from('admin_settings').upsert({ id: 'homepage_config', value: next });
              if (error) throw error;
            } catch (err) {
              console.error("Error background syncing homepage config:", err);
            }
          })();
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
          s.from('admin_settings').select('*').eq('id', 'homepage_config').single(),
          
          // Quiz fallbacks wrapped in proper async/await error isolation wrappers
          (async () => {
            try {
              return await s.from('quizzes').select('*');
            } catch {
              return { data: null };
            }
          })(),
          (async () => {
            try {
              return await s.from('quiz_questions').select('*');
            } catch {
              return { data: null };
            }
          })(),
          (async () => {
            try {
              return await s.from('quiz_options').select('*');
            } catch {
              return { data: null };
            }
          })(),
          (async () => {
            try {
              return await s.from('quiz_attempts').select('*');
            } catch {
              return { data: null };
            }
          })(),
          (async () => {
            try {
              return await s.from('leaderboard').select('*');
            } catch {
              return { data: null };
            }
          })()
        ]);

        const authError = results.slice(0, 11).find(
          (r: any) =>
            r.error &&
            (r.error.status === 401 ||
              r.error.message?.toLowerCase().includes('jwt') ||
              r.error.message?.toLowerCase().includes('unauthorized') ||
              r.error.code === 'PGRST301')
        );

        if (authError) {
          console.warn('Stale or invalid authentication session detected on startup. Clearing session to restore public access:', authError.error);
          await supabase.auth.signOut().catch(() => {});
          try {
            for (let i = 0; i < localStorage.length; i++) {
              const key = localStorage.key(i);
              if (key && (key.startsWith('sb-') || key.includes('supabase.auth'))) {
                localStorage.removeItem(key);
              }
            }
          } catch (e) {}

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
          { data: dbSettings },
          
          dbQuizzesRes,
          dbQuestionsRes,
          dbOptionsRes,
          dbAttemptsRes,
          dbLeaderboardsRes
        ] = results;

        setClasses(dbClasses && dbClasses.length > 0 ? dbClasses : mockClasses);
        setSubjects(dbSubjects && dbSubjects.length > 0 ? dbSubjects : mockSubjects);
        setCourses(dbCourses && dbCourses.length > 0 ? dbCourses : mockCourses);
        setChapters(dbChapters && dbChapters.length > 0 ? dbChapters : mockChapters);
        setLessons(dbLessons && dbLessons.length > 0 ? dbLessons : mockLessons);
        setVideos(dbVideos && dbVideos.length > 0 ? dbVideos : mockVideos);
        setNotes(dbNotes && dbNotes.length > 0 ? dbNotes : mockNotes);
        setAnnouncements(dbAnnouncements && dbAnnouncements.length > 0 ? dbAnnouncements : mockAnnouncements);
        setFaqs(dbFaqs && dbFaqs.length > 0 ? dbFaqs : [
          {
            id: 'faq_1',
            category: 'admission',
            question: 'Which classes are supported by RK Coaching?',
            answer: 'We provide comprehensive courses for Class 6 to Class 12 and NEET (Biology & Chemistry) pre-medical preparation modules.',
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
        setUsers(dbProfiles && dbProfiles.length > 0 ? dbProfiles : []);

        if (dbSettings && dbSettings.value) {
          setHomepageConfigState(dbSettings.value);
        }

        // Apply fallback checks for quizzes
        setQuizzes(dbQuizzesRes && dbQuizzesRes.data && dbQuizzesRes.data.length > 0 ? dbQuizzesRes.data : initialQuizzes);
        setQuizQuestions(dbQuestionsRes && dbQuestionsRes.data && dbQuestionsRes.data.length > 0 ? dbQuestionsRes.data : initialQuestions);
        setQuizOptions(dbOptionsRes && dbOptionsRes.data && dbOptionsRes.data.length > 0 ? dbOptionsRes.data : initialOptions);
        setQuizAttempts(dbAttemptsRes && dbAttemptsRes.data && dbAttemptsRes.data.length > 0 ? dbAttemptsRes.data : initialAttempts);
        setLeaderboardEntries(dbLeaderboardsRes && dbLeaderboardsRes.data && dbLeaderboardsRes.data.length > 0 ? dbLeaderboardsRes.data : initialLeaderboards);

      } catch (err) {
        console.error('Failed to load catalog data from Supabase, falling back to mock data:', err);
        setClasses(mockClasses);
        setSubjects(mockSubjects);
        setCourses(mockCourses);
        setChapters(mockChapters);
        setLessons(mockLessons);
        setVideos(mockVideos);
        setNotes(mockNotes);
        setAnnouncements(mockAnnouncements);
        setQuizzes(initialQuizzes);
        setQuizQuestions(initialQuestions);
        setQuizOptions(initialOptions);
        setQuizAttempts(initialAttempts);
        setLeaderboardEntries(initialLeaderboards);
      } finally {
        setLoadingCatalog(false);
      }
    } else {
      setClasses(mockClasses);
      setSubjects(mockSubjects);
      setCourses(mockCourses);
      setChapters(mockChapters);
      setLessons(mockLessons);
      setVideos(mockVideos);
      setNotes(mockNotes);
      setAnnouncements(mockAnnouncements);
      setQuizzes(initialQuizzes);
      setQuizQuestions(initialQuestions);
      setQuizOptions(initialOptions);
      setQuizAttempts(initialAttempts);
      setLeaderboardEntries(initialLeaderboards);
      setFaqs([
        {
          id: 'faq_1',
          category: 'admission',
          question: 'Which classes are supported by RK Coaching?',
          answer: 'We provide comprehensive courses for Class 6 to Class 12 and NEET (Biology & Chemistry) pre-medical preparation modules.',
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
          id: DEMO_STUDENT_ID,
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
    setLoadingCatalog(false);
    console.log(`[${new Date().toISOString()}] CATALOG INITIALIZED`);
  };

  useEffect(() => {
    if (!initializing) {
      loadCatalogData();
    }
  }, [initializing]);

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
        loadCatalogData,

        // Quiz State Exports
        quizzes,
        setQuizzes,
        quizQuestions,
        setQuizQuestions,
        quizOptions,
        setQuizOptions,
        quizAttempts,
        setQuizAttempts,
        leaderboardEntries,
        setLeaderboardEntries
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
