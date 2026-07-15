/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { UserRole, UserProfile, Course, AcademicClass, AcademicSubject, AcademicChapter, Lesson, Video, Note, Announcement, FaqItem, Bookmark, UserProgress, Order, Payment, Notification, PaymentSettings, Quiz, QuizQuestion, QuizOption, QuizAttempt, LeaderboardEntry } from '../types';
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
  setUser: React.Dispatch<React.SetStateAction<UserProfile | null>>;
  setRole: (role: UserRole) => void;
  loginAs: (role: UserRole) => void;
  logout: () => void;
  syncUserProfile: (userId: string) => Promise<void>;
  initializing: boolean;
  profileSyncing: boolean;

  // View Routing (Simulated SPA App Router)
  currentView: string;
  setCurrentView: (view: string) => void;
  breadcrumbs: { label: string; view?: string }[];
  setBreadcrumbs: (crumbs: { label: string; view?: string }[]) => void;
  breadcrumbSource: 'catalog' | 'premium';
  setBreadcrumbSource: (source: 'catalog' | 'premium') => void;
  lessonActiveTab: 'video' | 'notes';
  setLessonActiveTab: (tab: 'video' | 'notes') => void;

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

  // Mock Global Database
  loadingCatalog: boolean;
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

let appLastLoadedUserId: string | null = null;
let appLoadingUserId: string | null = null;

function AppSyncController({
  currentView,
  setCurrentView
}: {
  currentView: string;
  setCurrentView: (view: string) => void;
}) {
  const { user, setUser, role, initializing, syncUserProfile, setInitializing } = useAuth();
  const { loadBookmarks, setBookmarksList } = useBookmarks();
  const { loadProgress, setProgressList } = useProgress();
  const { loadNotifications, setNotifications } = useNotifications();
  const { loadPaymentData, setOrders, setPayments } = usePayments();
  const { loadEnrollments, setEnrolledCourseIds, loadSubjectNotesPurchases, setUnlockedSubjectNoteIds } = useCourses();
  const { addToast } = useNotifications();

  // Centralized Route Guards and Access Protection
  useEffect(() => {
    // Stop guards while auth context is establishing its startup session state
    if (initializing) return;

    const protectedViews = [
      'student-dashboard',
      'premium-materials',
      'teacher-dashboard',
      'teacher-content',
      'admin-dashboard',
      'admin-controls',
      'quiz-dashboard',
      'quiz-play',
      'quiz-result',
      'pyq-dashboard',
      'pyq-play',
      'pyq-result',
      'class-view',
      'subject-view',
      'pyq-view',
      'course-view',
      'lesson-view',
      'update-profile',
      'purchases-invoices'
    ];

    const isAuthenticated = user && role !== 'visitor';

    if (!isAuthenticated) {
      // Guest trying to enter protected views
      if (protectedViews.includes(currentView)) {
        addToast('Please login or register to access this study resource.', 'warning');
        const isDashboardView = currentView.endsWith('-dashboard') || currentView === 'teacher-content' || currentView === 'admin-controls';
        if (!isDashboardView) {
          console.log(`[${new Date().toISOString()}] REDIRECT TARGET STORED: ${currentView}`);
          sessionStorage.setItem('auth_redirect_target', currentView);
        } else {
          console.log(`[${new Date().toISOString()}] BYPASS REDIRECT TARGET FOR DASHBOARD VIEW: ${currentView}`);
          sessionStorage.removeItem('auth_redirect_target');
        }
        console.log(`[${new Date().toISOString()}] ROUTE DECISION - GUEST REDIRECTED TO AUTH FROM: ${currentView}`);
        setCurrentView('auth');
      }
    } else {
      // Logged-in user trying to enter auth pages or landing pages
      if (currentView === 'auth' || currentView === 'auth-signup' || currentView === 'home' || currentView === 'catalog') {
        const redirectTarget = sessionStorage.getItem('auth_redirect_target');
        if (redirectTarget && redirectTarget !== 'auth' && redirectTarget !== 'auth-signup' && redirectTarget !== 'home' && redirectTarget !== 'catalog') {
          console.log(`[${new Date().toISOString()}] ROUTE DECISION - REDIRECT TARGET RESTORED: ${redirectTarget}`);
          sessionStorage.removeItem('auth_redirect_target');
          setCurrentView(redirectTarget);
        } else {
          let target = 'student-dashboard';
          if (role === 'student') target = 'student-dashboard';
          else if (role === 'teacher') target = 'teacher-dashboard';
          else if (role === 'admin') target = 'admin-dashboard';
          else if (role === 'super_admin') target = 'super-admin-dashboard';
          
          console.log(`[${new Date().toISOString()}] ROUTE DECISION - ROUTING ROLE '${role}' TO DEFAULT VIEW: ${target}`);
          setCurrentView(target);
        }
      }
    }
  }, [role, user, currentView, initializing]);

  // Listen to Auth sessions reactively


  useEffect(() => {
    if (user) {
      if (appLastLoadedUserId === user.id || appLoadingUserId === user.id) {
        return;
      }
      appLoadingUserId = user.id;
      appLastLoadedUserId = user.id; // Set immediately to prevent any loop if state updates render concurrently

      (async () => {
        try {
          await Promise.all([
            loadBookmarks(user.id),
            loadProgress(user.id),
            loadNotifications(user.id),
            loadPaymentData(user.id),
            loadEnrollments(user.id),
            loadSubjectNotesPurchases(user.id)
          ]);
          console.log(`[${new Date().toISOString()}] PAYMENT INITIALIZED`);
          console.log(`[${new Date().toISOString()}] APPLICATION READY`);
        } catch (e) {
          console.error("Relational data loading failed, continuing application startup:", e);
        } finally {
          appLoadingUserId = null;
        }
      })();
    } else {
      appLastLoadedUserId = null;
      appLoadingUserId = null;
      setBookmarksList([]);
      setProgressList([]);
      setNotifications([]);
      setOrders([]);
      setPayments([]);
      setEnrolledCourseIds([]);
      setUnlockedSubjectNoteIds([]);
      if (!initializing) {
        console.log(`[${new Date().toISOString()}] APPLICATION READY`);
      }
    }
  }, [user, initializing]);

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
  const [breadcrumbSource, setBreadcrumbSource] = useState<'catalog' | 'premium'>('catalog');
  const [lessonActiveTab, setLessonActiveTab] = useState<'video' | 'notes'>('video');

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
        <AuthProvider>
          <DatabaseProvider>
            <BookmarkProvider>
              <ProgressProvider>
                <CourseProvider>
                  <PaymentProvider>
                    <AppSyncController currentView={currentView} setCurrentView={setCurrentView} />
                    <AppContextInjector
                      currentView={currentView}
                      setCurrentView={setCurrentView}
                      breadcrumbs={breadcrumbs}
                      setBreadcrumbs={setBreadcrumbs}
                      breadcrumbSource={breadcrumbSource}
                      setBreadcrumbSource={setBreadcrumbSource}
                      lessonActiveTab={lessonActiveTab}
                      setLessonActiveTab={setLessonActiveTab}
                    >
                      {children}
                    </AppContextInjector>
                  </PaymentProvider>
                </CourseProvider>
              </ProgressProvider>
            </BookmarkProvider>
          </DatabaseProvider>
        </AuthProvider>
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
  breadcrumbSource,
  setBreadcrumbSource,
  lessonActiveTab,
  setLessonActiveTab
}: {
  children: ReactNode;
  currentView: string;
  setCurrentView: (view: string) => void;
  breadcrumbs: { label: string; view?: string }[];
  setBreadcrumbs: (crumbs: { label: string; view?: string }[]) => void;
  breadcrumbSource: 'catalog' | 'premium';
  setBreadcrumbSource: (source: 'catalog' | 'premium') => void;
  lessonActiveTab: 'video' | 'notes';
  setLessonActiveTab: (tab: 'video' | 'notes') => void;
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
    leaderboardEntries, setLeaderboardEntries,
    loadingCatalog
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
  const { role, user, setUser, setRole, loginAs, logout, syncUserProfile, initializing, profileSyncing } = useAuth();

  const handleSyncUserProfile = async (userId: string) => {
    await syncUserProfile(userId, addToast, setCurrentView);
  };

  const handleLoginAs = (targetRole: UserRole) => {
    setBreadcrumbSource('catalog');
    loginAs(targetRole, addToast, setCurrentView);
  };

  const handleLogout = () => {
    setBreadcrumbSource('catalog');
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
    setUser,
    setRole,
    loginAs: handleLoginAs,
    logout: handleLogout,
    syncUserProfile: handleSyncUserProfile,
    initializing,
    profileSyncing,
    currentView,
    setCurrentView,
    breadcrumbs,
    setBreadcrumbs,
    breadcrumbSource,
    setBreadcrumbSource,
    lessonActiveTab,
    setLessonActiveTab,
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
    loadingCatalog,
    classes: (role === 'admin' || role === 'super_admin' || role === 'teacher')
      ? classes
      : classes.filter(c => c.isActive !== false),
    setClasses,
    subjects: (role === 'admin' || role === 'super_admin' || role === 'teacher')
      ? subjects
      : subjects.filter(s => s.isActive !== false),
    setSubjects,
    courses,
    setCourses,
    chapters: (role === 'admin' || role === 'super_admin' || role === 'teacher')
      ? chapters
      : chapters.filter(c => c.isActive !== false),
    setChapters,
    lessons,
    setLessons,
    videos: (role === 'admin' || role === 'super_admin' || role === 'teacher')
      ? videos
      : videos.filter(v => v.status === 'published' || !v.status),
    setVideos,
    notes: (role === 'admin' || role === 'super_admin' || role === 'teacher')
      ? notes
      : notes.filter(n => n.status === 'published' || !n.status),
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
    quizzes: (role === 'admin' || role === 'super_admin' || role === 'teacher')
      ? quizzes
      : quizzes.filter(q => q.status === 'published' || !q.status),
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
