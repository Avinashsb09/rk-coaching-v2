/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserRole, UserProfile, Course, AcademicClass, AcademicSubject, AcademicChapter, Lesson, Video, Note, Announcement, FaqItem, Bookmark, UserProgress, Order, Payment, Notification, PaymentSettings } from '../types';
import { getSupabase, isSupabaseConfigured } from '../lib/supabase';
import { ThemeProvider, useTheme } from './ThemeContext';
import { NotificationProvider, useNotifications, ToastMessage } from './NotificationContext';
export type { ToastMessage };
import { DatabaseProvider, useDatabase } from './DatabaseContext';
import { BookmarkProvider, useBookmarks } from './BookmarkContext';
import { ProgressProvider, useProgress } from './ProgressContext';
import { CourseProvider, useCourses } from './CourseContext';
import { PaymentProvider, usePayments } from './PaymentContext';
import { AuthProvider, useAuth } from './AuthContext';

interface AppContextType {
  // Authentication & Roles
  role: UserRole;
  user: UserProfile | null;
  setRole: (role: UserRole) => void;
  loginAs: (role: UserRole) => void;
  logout: () => void;
  syncUserProfile: (userId: string) => Promise<void>;

  // View Routing (Simulated SPA App Router)
  currentView: string;
  setCurrentView: (view: string) => void;
  breadcrumbs: { label: string; view?: string }[];
  setBreadcrumbs: (crumbs: { label: string; view?: string }[]) => void;

  // Selected LMS Routing IDs
  selectedClassSlug: string | null;
  setSelectedClassSlug: (slug: string | null) => void;
  selectedSubjectId: string | null;
  setSelectedSubjectId: (id: string | null) => void;
  selectedCourseId: string | null;
  setSelectedCourseId: (id: string | null) => void;
  selectedLessonId: string | null;
  setSelectedLessonId: (id: string | null) => void;

  // Bookmarks
  bookmarksList: Bookmark[];
  addBookmark: (targetType: 'course' | 'lesson' | 'note', targetId: string, title: string) => Promise<void>;
  removeBookmark: (targetType: 'course' | 'lesson' | 'note', targetId: string) => Promise<void>;
  isBookmarked: (targetType: 'course' | 'lesson' | 'note', targetId: string) => boolean;

  // Progress
  progressList: UserProgress[];
  saveProgress: (courseId: string, lessonId: string, watchedPercentage: number, isCompleted: boolean, studyTimeSeconds: number) => Promise<void>;
  getLessonProgress: (lessonId: string) => UserProgress | null;

  // Theme Settings
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;

  // Toast Notifications
  toasts: ToastMessage[];
  addToast: (message: string, type?: ToastMessage['type'], duration?: number) => void;
  dismissToast: (id: string) => void;

  // Search Engine
  globalSearch: string;
  setGlobalSearch: (query: string) => void;

  // Mock Global Database
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
  setHomepageConfig: React.Dispatch<React.SetStateAction<{
    heroTitle: string;
    heroSubtitle: string;
    featuredCourseIds: string[];
    testimonials: { id: string; author: string; role: string; quote: string; rating: number }[];
    contactPhone: string;
    contactEmail: string;
    contactAddress: string;
    footerText: string;
  }>>;

  // Commercial & Notification additionals
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  payments: Payment[];
  setPayments: React.Dispatch<React.SetStateAction<Payment[]>>;
  paymentSettings: PaymentSettings;
  setPaymentSettings: React.Dispatch<React.SetStateAction<PaymentSettings>>;
  notifications: Notification[];
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
  unreadNotificationsCount: number;
  enrolledCourseIds: string[];
  addNotification: (title: string, message: string, category?: string) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  deleteNotification: (id: string) => void;
  enrollInCourse: (courseId: string, isPaid?: boolean, rzpId?: string, rzpOrderId?: string) => Promise<void>;
  hasCourseAccess: (courseId: string) => boolean;
  getEnrolledCourses: () => Course[];
  unlockedSubjectNoteIds: string[];
  unlockSubjectNotes: (subjectId: string, rzpId?: string, rzpOrderId?: string) => Promise<void>;
  hasSubjectNotesAccess: (subjectId: string) => boolean;

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

const AppContext = createContext<AppContextType | undefined>(undefined);

function AppSyncController({
  currentView,
  setCurrentView
}: {
  currentView: string;
  setCurrentView: (view: string) => void;
}) {
  const { user, setUser, syncUserProfile } = useAuth();
  const { loadBookmarks, setBookmarksList } = useBookmarks();
  const { loadProgress, setProgressList } = useProgress();
  const { loadNotifications, setNotifications } = useNotifications();
  const { loadPaymentData, setOrders, setPayments } = usePayments();
  const { loadEnrollments, setEnrolledCourseIds, loadSubjectNotesPurchases, setUnlockedSubjectNoteIds } = useCourses();
  const { addToast } = useNotifications();

  // Listen to Auth sessions reactively
  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) return;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        syncUserProfile(session.user.id, addToast, setCurrentView);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          await syncUserProfile(session.user.id, addToast, setCurrentView);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setCurrentView('home');
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Listen to user entity changes to fetch relational tables
  useEffect(() => {
    if (user) {
      loadBookmarks(user.id);
      loadProgress(user.id);
      loadNotifications(user.id);
      loadPaymentData(user.id);
      loadEnrollments(user.id);
      loadSubjectNotesPurchases(user.id);
    } else {
      setBookmarksList([]);
      setProgressList([]);
      setNotifications([]);
      setOrders([]);
      setPayments([]);
      setEnrolledCourseIds([]);
      setUnlockedSubjectNoteIds([]);
    }
  }, [user]);

  return null;
}

export function AppProvider({ children }: { children: ReactNode }) {
  // Navigation Routing States
  const [currentView, setCurrentView] = useState<string>(() => {
    if (typeof window !== 'undefined' && window.location.hash) {
      const hash = window.location.hash.substring(1);
      if (hash) return hash;
    }
    return 'home';
  });
  const [breadcrumbs, setBreadcrumbs] = useState<{ label: string; view?: string }[]>([
    { label: 'Home', view: 'home' }
  ]);
  const [globalSearch, setGlobalSearch] = useState<string>('');

  // Synchronize state changes to URL hash
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const currentHash = window.location.hash.substring(1);
      if (currentView && currentView !== currentHash) {
        window.location.hash = currentView;
      }
    }
  }, [currentView]);

  // Synchronize URL hash changes to state (back/forward browser buttons)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleHashChange = () => {
      const hash = window.location.hash.substring(1);
      if (hash && hash !== currentView) {
        setCurrentView(hash);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [currentView]);

  return (
    <ThemeProvider>
      <NotificationProvider>
        <DatabaseProvider>
          <BookmarkProvider>
            <ProgressProvider>
              <CourseProvider>
                <PaymentProvider>
                  <AuthProvider>
                    <AppSyncController currentView={currentView} setCurrentView={setCurrentView} />
                    <AppContextInjector
                      currentView={currentView}
                      setCurrentView={setCurrentView}
                      breadcrumbs={breadcrumbs}
                      setBreadcrumbs={setBreadcrumbs}
                      globalSearch={globalSearch}
                      setGlobalSearch={setGlobalSearch}
                    >
                      {children}
                    </AppContextInjector>
                  </AuthProvider>
                </PaymentProvider>
              </CourseProvider>
            </ProgressProvider>
          </BookmarkProvider>
        </DatabaseProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
}

function AppContextInjector({
  children,
  currentView,
  setCurrentView,
  breadcrumbs,
  setBreadcrumbs,
  globalSearch,
  setGlobalSearch
}: {
  children: ReactNode;
  currentView: string;
  setCurrentView: (view: string) => void;
  breadcrumbs: { label: string; view?: string }[];
  setBreadcrumbs: (crumbs: { label: string; view?: string }[]) => void;
  globalSearch: string;
  setGlobalSearch: (query: string) => void;
}) {
  const { darkMode, setDarkMode } = useTheme();
  const { toasts, addToast, dismissToast, notifications, setNotifications, unreadNotificationsCount, addNotification, markNotificationRead, markAllNotificationsRead, deleteNotification } = useNotifications();
  const { 
    classes, setClasses, subjects, setSubjects, courses, setCourses, 
    chapters, setChapters, lessons, setLessons, videos, setVideos, 
    notes, setNotes, announcements, setAnnouncements, faqs, setFaqs, 
    users, setUsers, homepageConfig, setHomepageConfig,
    quizzes, setQuizzes, quizQuestions, setQuizQuestions, 
    quizOptions, setQuizOptions, quizAttempts, setQuizAttempts, 
    leaderboardEntries, setLeaderboardEntries 
  } = useDatabase();
  const { bookmarksList, addBookmark, removeBookmark, isBookmarked } = useBookmarks();
  const { progressList, saveProgress, getLessonProgress } = useProgress();
  const { 
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
    unlockedSubjectNoteIds,
    setUnlockedSubjectNoteIds,
    unlockSubjectNotes,
    hasSubjectNotesAccess,
    loadSubjectNotesPurchases
  } = useCourses();
  const { orders, setOrders, payments, setPayments, paymentSettings, setPaymentSettings } = usePayments();
  const { role, user, setRole, loginAs, logout, syncUserProfile } = useAuth();

  const handleSyncUserProfile = async (userId: string) => {
    await syncUserProfile(userId, addToast, setCurrentView);
  };

  const handleLoginAs = (targetRole: UserRole) => {
    loginAs(targetRole, addToast, setCurrentView);
  };

  const handleLogout = () => {
    logout(addToast, setCurrentView, setBreadcrumbs);
  };

  const handleAddBookmark = async (targetType: 'course' | 'lesson' | 'note', targetId: string, title: string) => {
    await addBookmark(targetType, targetId, title, user?.id, addToast);
  };

  const handleRemoveBookmark = async (targetType: 'course' | 'lesson' | 'note', targetId: string) => {
    await removeBookmark(targetType, targetId, user?.id, addToast);
  };

  const handleSaveProgress = async (courseId: string, lessonId: string, watchedPercentage: number, isCompleted: boolean, studyTimeSeconds: number) => {
    await saveProgress(courseId, lessonId, watchedPercentage, isCompleted, studyTimeSeconds, user?.id);
  };

  const handleEnrollInCourse = async (courseId: string, isPaid?: boolean, rzpId?: string, rzpOrderId?: string) => {
    await enrollInCourse(courseId, isPaid, rzpId, rzpOrderId, user?.id, courses, addToast, handleAddNotification);
  };

  const handleHasCourseAccess = (courseId: string) => {
    return hasCourseAccess(courseId, role, courses);
  };

  const handleUnlockSubjectNotes = async (subjectId: string, rzpId?: string, rzpOrderId?: string) => {
    await unlockSubjectNotes(subjectId, rzpId, rzpOrderId, user?.id, courses, addToast, handleAddNotification);
  };

  const handleHasSubjectNotesAccess = (subjectId: string) => {
    return hasSubjectNotesAccess(subjectId, role);
  };

  const handleGetEnrolledCourses = () => {
    return getEnrolledCourses(role, courses);
  };

  const handleAddNotification = async (title: string, message: string) => {
    await addNotification(title, message, user?.id);
  };

  const handleMarkNotificationRead = async (id: string) => {
    await markNotificationRead(id, user?.id);
  };

  const handleMarkAllNotificationsRead = async () => {
    await markAllNotificationsRead(user?.id);
  };

  const handleDeleteNotification = async (id: string) => {
    await deleteNotification(id, user?.id);
  };

  const contextValue: AppContextType = {
    role,
    user,
    setRole,
    loginAs: handleLoginAs,
    logout: handleLogout,
    syncUserProfile: handleSyncUserProfile,
    currentView,
    setCurrentView,
    breadcrumbs,
    setBreadcrumbs,
    selectedClassSlug,
    setSelectedClassSlug,
    selectedSubjectId,
    setSelectedSubjectId,
    selectedCourseId,
    setSelectedCourseId,
    selectedLessonId,
    setSelectedLessonId,
    bookmarksList,
    addBookmark: handleAddBookmark,
    removeBookmark: handleRemoveBookmark,
    isBookmarked,
    progressList,
    saveProgress: handleSaveProgress,
    getLessonProgress,
    darkMode,
    setDarkMode,
    toasts,
    addToast,
    dismissToast,
    globalSearch,
    setGlobalSearch,
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
    orders,
    setOrders,
    payments,
    setPayments,
    paymentSettings,
    setPaymentSettings,
    notifications,
    setNotifications,
    unreadNotificationsCount,
    enrolledCourseIds,
    addNotification: handleAddNotification,
    markNotificationRead: handleMarkNotificationRead,
    markAllNotificationsRead: handleMarkAllNotificationsRead,
    deleteNotification: handleDeleteNotification,
    enrollInCourse: handleSaveProgress ? handleEnrollInCourse : async () => {},
    hasCourseAccess: handleHasCourseAccess,
    getEnrolledCourses: handleGetEnrolledCourses,
    unlockedSubjectNoteIds,
    unlockSubjectNotes: handleUnlockSubjectNotes,
    hasSubjectNotesAccess: handleHasSubjectNotesAccess,
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
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
