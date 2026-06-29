/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserRole, UserProfile, Course, AcademicClass, AcademicSubject, AcademicChapter, Lesson, Video, Note, Announcement, FaqItem, Bookmark, UserProgress, Order, Payment, Notification, PaymentSettings } from '../types';
import { getSupabase, isSupabaseConfigured } from '../lib/supabase';
import { mockClasses, mockSubjects, mockCourses, mockChapters, mockLessons, mockVideos, mockNotes, mockAnnouncements } from '../lib/mockData';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

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
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  // Read theme from local storage if existing
  const [darkMode, setDarkModeState] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('rk_dark_mode');
      if (saved !== null) return saved === 'true';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // Current view of the app (Simulating Client-side routing)
  const [currentView, setCurrentView] = useState<string>('home');
  const [breadcrumbs, setBreadcrumbs] = useState<{ label: string; view?: string }[]>([
    { label: 'Home', view: 'home' }
  ]);

  // Selected LMS Routing IDs
  const [selectedClassSlug, setSelectedClassSlug] = useState<string | null>(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);

  // Bookmarks & Progress list
  const [bookmarksList, setBookmarksList] = useState<Bookmark[]>([]);
  const [progressList, setProgressList] = useState<UserProgress[]>([]);

  // Commercial & Notification state variables
  const [orders, setOrders] = useState<Order[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('rk_payment_settings');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error(e);
        }
      }
    }
    return {
      razorpayKeyId: 'rzp_live_rkcoaching2026',
      businessName: 'RK Coaching Institute',
      businessLogo: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=80&h=80&q=80',
      supportEmail: 'support@rkcoaching.com',
      supportPhone: '+91 98765 43210',
      successMessage: 'Congratulations! Payment verified and course content unlocked instantly.',
      failureMessage: 'Your bank declined the UPI transaction or session timed out. Please try again.'
    };
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('rk_payment_settings', JSON.stringify(paymentSettings));
    }
  }, [paymentSettings]);

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<string[]>([]);

  // Dynamic user roles. Default is 'visitor'. Reviewer can switch dynamically.
  const [role, setRoleState] = useState<UserRole>('visitor');
  const [user, setUser] = useState<UserProfile | null>(null);
  const [globalSearch, setGlobalSearch] = useState<string>('');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Local storage helpers
  const getStorageKey = (suffix: string) => {
    const userId = user?.id || 'guest';
    return `rk_${suffix}_${userId}`;
  };

  // Sync / Fetch Bookmarks & Progress when user changes
  useEffect(() => {
    const loadUserData = async () => {
      if (isSupabaseConfigured() && getSupabase() && user) {
        const supabase = getSupabase()!;
        try {
          // Fetch Bookmarks
          const { data: bData } = await supabase
            .from('bookmarks')
            .select('*')
            .eq('userId', user.id);
          if (bData) {
            setBookmarksList(bData.map((b: any) => ({
              id: b.id,
              userId: b.userId,
              targetType: b.targetType,
              targetId: b.targetId,
              title: b.title,
              createdAt: b.createdAt
            })));
          }

          // Fetch Progress
          const { data: pData } = await supabase
            .from('user_progress')
            .select('*')
            .eq('userId', user.id);
          if (pData) {
            setProgressList(pData.map((p: any) => ({
              id: p.id,
              userId: p.userId,
              courseId: p.courseId,
              lessonId: p.lessonId,
              watchedPercentage: p.watchedPercentage,
              isCompleted: p.isCompleted,
              studyTimeSeconds: p.studyTimeSeconds,
              lastAccessedAt: p.lastAccessedAt
            })));
          }

          // Fetch Orders & Payments
          const { data: oData } = await supabase.from('orders').select('*').eq('userId', user.id);
          if (oData) setOrders(oData as any);

          const { data: payData } = await supabase.from('payments').select('*').eq('userId', user.id);
          if (payData) setPayments(payData as any);

          // Fetch Enrollments
          const { data: enData } = await supabase.from('enrollments').select('*').eq('userId', user.id);
          if (enData) {
            setEnrolledCourseIds(enData.map((e: any) => e.courseId));
          }

          // Fetch Notifications
          const { data: nData } = await supabase.from('notifications').select('*').eq('userId', user.id).order('createdAt', { ascending: false });
          if (nData) {
            setNotifications(nData as any);
          } else {
            setNotifications([]);
          }
        } catch (err) {
          console.error('Failed to load user data from Supabase:', err);
        }
      } else {
        // Load from LocalStorage fallback
        if (typeof window !== 'undefined') {
          const bKey = getStorageKey('bookmarks');
          const pKey = getStorageKey('progress');
          const oKey = getStorageKey('orders');
          const payKey = getStorageKey('payments');
          const enKey = getStorageKey('enrollments');
          const nKey = getStorageKey('notifications');

          const savedB = localStorage.getItem(bKey);
          const savedP = localStorage.getItem(pKey);
          const savedO = localStorage.getItem(oKey);
          const savedPay = localStorage.getItem(payKey);
          const savedEn = localStorage.getItem(enKey);
          const savedN = localStorage.getItem(nKey);

          setBookmarksList(savedB ? JSON.parse(savedB) : []);
          setProgressList(savedP ? JSON.parse(savedP) : []);
          setOrders(savedO ? JSON.parse(savedO) : []);
          setPayments(savedPay ? JSON.parse(savedPay) : []);
          setEnrolledCourseIds(savedEn ? JSON.parse(savedEn) : []);

          let loadedNotifications = savedN ? JSON.parse(savedN) : [];
          if (loadedNotifications.length === 0 && user) {
            // Seed gorgeous default mock notifications for immediate interaction
            loadedNotifications = [
              {
                id: 'not_1',
                userId: user.id,
                title: 'Welcome to RK Coaching Platform!',
                message: 'Unlock highly professional Class 6-12 syllabus standard revision binders, practice test series, and top rank lecture videos. Feel free to switch roles on the top bar.',
                isRead: false,
                createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
              },
              {
                id: 'not_2',
                userId: user.id,
                title: 'New Chemistry Handout Uploaded',
                message: 'Prof. Rajesh Khanna published handwritten notes for Chemistry - Organic Reactions under Chapter 2. Download standard PDFs now!',
                isRead: false,
                createdAt: new Date(Date.now() - 3600000 * 24).toISOString()
              },
              {
                id: 'not_3',
                userId: user.id,
                title: 'Interactive Biology Quiz Available',
                message: 'Unlock standard CBSE Board practice MCQ exam for NEET pre-medical aspirants. Verify your subject knowledge & earn 500 XP points.',
                isRead: true,
                createdAt: new Date(Date.now() - 3600000 * 48).toISOString()
              }
            ];
            localStorage.setItem(nKey, JSON.stringify(loadedNotifications));
          }
          setNotifications(loadedNotifications);
        }
      }
    };

    loadUserData();
  }, [user]);

  // Add Bookmark
  const addBookmark = async (targetType: 'course' | 'lesson' | 'note', targetId: string, title: string) => {
    const userId = user?.id || 'guest';
    const newBookmark: Bookmark = {
      id: Math.random().toString(36).substring(2, 9),
      userId,
      targetType,
      targetId,
      title,
      createdAt: new Date().toISOString()
    };

    if (isSupabaseConfigured() && getSupabase() && user) {
      const supabase = getSupabase()!;
      try {
        const { error } = await (supabase.from('bookmarks') as any)
          .upsert({
            userId: user.id,
            targetType,
            targetId,
            title
          } as any, { onConflict: 'userId,targetType,targetId' });
        
        if (!error) {
          // Re-fetch to sync
          const { data } = await supabase.from('bookmarks').select('*').eq('userId', user.id);
          if (data) setBookmarksList(data as any);
        }
      } catch (err) {
        console.error(err);
      }
    } else {
      // Local storage fallback
      const list = [...bookmarksList, newBookmark];
      setBookmarksList(list);
      localStorage.setItem(getStorageKey('bookmarks'), JSON.stringify(list));
    }
    addToast(`Bookmarked ${targetType} successfully!`, 'success');
  };

  // Remove Bookmark
  const removeBookmark = async (targetType: 'course' | 'lesson' | 'note', targetId: string) => {
    if (isSupabaseConfigured() && getSupabase() && user) {
      const supabase = getSupabase()!;
      try {
        await supabase
          .from('bookmarks')
          .delete()
          .eq('userId', user.id)
          .eq('targetType', targetType)
          .eq('targetId', targetId);
        
        // Refresh
        const { data } = await supabase.from('bookmarks').select('*').eq('userId', user.id);
        setBookmarksList(data ? (data as any) : []);
      } catch (err) {
        console.error(err);
      }
    } else {
      const list = bookmarksList.filter(b => !(b.targetType === targetType && b.targetId === targetId));
      setBookmarksList(list);
      localStorage.setItem(getStorageKey('bookmarks'), JSON.stringify(list));
    }
    addToast('Removed bookmark', 'info');
  };

  const isBookmarked = (targetType: 'course' | 'lesson' | 'note', targetId: string) => {
    return bookmarksList.some(b => b.targetType === targetType && b.targetId === targetId);
  };

  // Save/Update Progress
  const saveProgress = async (courseId: string, lessonId: string, watchedPercentage: number, isCompleted: boolean, studyTimeSeconds: number) => {
    const userId = user?.id || 'guest';
    
    // Remember Last Accessed Lesson for "Continue Learning"
    if (typeof window !== 'undefined') {
      localStorage.setItem('rk_last_course_id', courseId);
      localStorage.setItem('rk_last_lesson_id', lessonId);
    }

    if (isSupabaseConfigured() && getSupabase() && user) {
      const supabase = getSupabase()!;
      try {
        const { error } = await (supabase.from('user_progress') as any)
          .upsert({
            userId: user.id,
            courseId,
            lessonId,
            watchedPercentage,
            isCompleted,
            studyTimeSeconds,
            lastAccessedAt: new Date().toISOString()
          } as any, { onConflict: 'userId,lessonId' });

        if (!error) {
          const { data } = await supabase.from('user_progress').select('*').eq('userId', user.id);
          if (data) setProgressList(data as any);
        }
      } catch (err) {
        console.error(err);
      }
    } else {
      // Local storage
      const existingIdx = progressList.findIndex(p => p.lessonId === lessonId);
      let list = [...progressList];
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
          userId,
          courseId,
          lessonId,
          watchedPercentage,
          isCompleted,
          studyTimeSeconds,
          lastAccessedAt: new Date().toISOString()
        });
      }
      setProgressList(list);
      localStorage.setItem(getStorageKey('progress'), JSON.stringify(list));
    }
  };

  const getLessonProgress = (lessonId: string) => {
    return progressList.find(p => p.lessonId === lessonId) || null;
  };

  // Notifications Functions
  const unreadNotificationsCount = notifications.filter(n => !n.isRead).length;

  const addNotification = async (title: string, message: string, category = 'info') => {
    if (!user) return;
    const newNotif: Notification = {
      id: 'not_' + Math.random().toString(36).substring(2, 9),
      userId: user.id,
      title,
      message,
      isRead: false,
      createdAt: new Date().toISOString()
    };

    if (isSupabaseConfigured() && getSupabase()) {
      const supabase = getSupabase()!;
      try {
        await (supabase.from('notifications') as any).insert({
          userId: user.id,
          title,
          message,
          isRead: false
        });
        // refresh
        const { data } = await supabase.from('notifications').select('*').eq('userId', user.id).order('createdAt', { ascending: false });
        if (data) setNotifications(data as any);
      } catch (err) {
        console.error(err);
      }
    } else {
      const updated = [newNotif, ...notifications];
      setNotifications(updated);
      localStorage.setItem(getStorageKey('notifications'), JSON.stringify(updated));
    }
  };

  const markNotificationRead = async (id: string) => {
    if (!user) return;
    if (isSupabaseConfigured() && getSupabase()) {
      const supabase = getSupabase()!;
      try {
        await (supabase.from('notifications') as any).update({ isRead: true }).eq('id', id);
        const { data } = await supabase.from('notifications').select('*').eq('userId', user.id).order('createdAt', { ascending: false });
        if (data) setNotifications(data as any);
      } catch (err) {
        console.error(err);
      }
    } else {
      const updated = notifications.map(n => n.id === id ? { ...n, isRead: true } : n);
      setNotifications(updated);
      localStorage.setItem(getStorageKey('notifications'), JSON.stringify(updated));
    }
  };

  const markAllNotificationsRead = async () => {
    if (!user) return;
    if (isSupabaseConfigured() && getSupabase()) {
      const supabase = getSupabase()!;
      try {
        await (supabase.from('notifications') as any).update({ isRead: true }).eq('userId', user.id);
        const { data } = await supabase.from('notifications').select('*').eq('userId', user.id).order('createdAt', { ascending: false });
        if (data) setNotifications(data as any);
      } catch (err) {
        console.error(err);
      }
    } else {
      const updated = notifications.map(n => ({ ...n, isRead: true }));
      setNotifications(updated);
      localStorage.setItem(getStorageKey('notifications'), JSON.stringify(updated));
    }
    addToast('All notifications marked as read', 'success');
  };

  const deleteNotification = async (id: string) => {
    if (!user) return;
    if (isSupabaseConfigured() && getSupabase()) {
      const supabase = getSupabase()!;
      try {
        await supabase.from('notifications').delete().eq('id', id);
        const { data } = await supabase.from('notifications').select('*').eq('userId', user.id).order('createdAt', { ascending: false });
        if (data) setNotifications(data as any);
      } catch (err) {
        console.error(err);
      }
    } else {
      const updated = notifications.filter(n => n.id !== id);
      setNotifications(updated);
      localStorage.setItem(getStorageKey('notifications'), JSON.stringify(updated));
    }
    addToast('Notification dismissed', 'info');
  };

  // Enrolling / Unlocking and Payments logic
  const enrollInCourse = async (courseId: string, isPaid = false, rzpId = '', rzpOrderId = '') => {
    if (!user) return;
    
    // Add Course to Enrolled list
    if (isSupabaseConfigured() && getSupabase()) {
      const supabase = getSupabase()!;
      try {
        // Create Enrollment
        await (supabase.from('enrollments') as any).upsert({
          userId: user.id,
          courseId
        }, { onConflict: 'userId,courseId' });

        // If paid, create order & payment
        if (isPaid) {
          const course = courses.find(c => c.id === courseId);
          const amount = course?.discountPrice || course?.price || 0;
          
          const orderId = rzpOrderId || 'order_' + Math.random().toString(36).substring(2, 9);
          const paymentId = rzpId || 'pay_' + Math.random().toString(36).substring(2, 9);

          await (supabase.from('orders') as any).insert({
            id: orderId,
            userId: user.id,
            courseId,
            amount,
            status: 'completed'
          });

          await (supabase.from('payments') as any).insert({
            id: paymentId,
            orderId,
            userId: user.id,
            amount,
            method: 'Razorpay Checkout',
            status: 'success'
          });
        }

        // Refresh Enrollments, Orders, Payments
        const { data: enData } = await supabase.from('enrollments').select('*').eq('userId', user.id);
        if (enData) setEnrolledCourseIds(enData.map((e: any) => e.courseId));

        const { data: oData } = await supabase.from('orders').select('*').eq('userId', user.id);
        if (oData) setOrders(oData as any);

        const { data: payData } = await supabase.from('payments').select('*').eq('userId', user.id);
        if (payData) setPayments(payData as any);

      } catch (err) {
        console.error('Failed to enroll in course on Supabase:', err);
      }
    } else {
      // Local storage fallback
      const updatedEn = Array.from(new Set([...enrolledCourseIds, courseId]));
      setEnrolledCourseIds(updatedEn);
      localStorage.setItem(getStorageKey('enrollments'), JSON.stringify(updatedEn));

      if (isPaid) {
        const course = courses.find(c => c.id === courseId);
        const amount = course?.discountPrice || course?.price || 0;
        
        const orderId = rzpOrderId || 'order_' + Math.random().toString(36).substring(2, 9);
        const paymentId = rzpId || 'pay_' + Math.random().toString(36).substring(2, 9);

        const newOrder: Order = {
          id: orderId,
          userId: user.id,
          courseId,
          amount,
          currency: 'INR',
          status: 'completed',
          createdAt: new Date().toISOString()
        };

        const newPayment: Payment = {
          id: paymentId,
          orderId,
          userId: user.id,
          amount,
          method: 'Razorpay Checkout',
          status: 'success',
          createdAt: new Date().toISOString()
        };

        const updatedOrders = [newOrder, ...orders];
        const updatedPayments = [newPayment, ...payments];

        setOrders(updatedOrders);
        setPayments(updatedPayments);

        localStorage.setItem(getStorageKey('orders'), JSON.stringify(updatedOrders));
        localStorage.setItem(getStorageKey('payments'), JSON.stringify(updatedPayments));
      }
    }

    const courseObj = courses.find(c => c.id === courseId);
    await addNotification(
      isPaid ? 'Premium Course Unlocked' : 'Enrolled Successfully',
      `You are now enrolled in "${courseObj?.title || 'Course'}". Start studying interactive notes and lectures instantly!`,
      'success'
    );
  };

  const hasCourseAccess = (courseId: string): boolean => {
    if (role === 'admin' || role === 'teacher') return true;
    const course = courses.find(c => c.id === courseId);
    if (!course) return false;
    if (!course.isPremium) return true; // Free courses are accessible
    return enrolledCourseIds.includes(courseId); // Paid courses require enrollment
  };

  const getEnrolledCourses = (): Course[] => {
    if (role === 'admin' || role === 'teacher') return courses;
    return courses.filter(c => enrolledCourseIds.includes(c.id));
  };

  // Toggle Tailwind 4 Dark Mode
  const setDarkMode = (dark: boolean) => {
    setDarkModeState(dark);
    if (typeof window !== 'undefined') {
      localStorage.setItem('rk_dark_mode', String(dark));
      if (dark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  };

  // Sync initial class when context loads
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Add a toast notification to the queue
  const addToast = (message: string, type: ToastMessage['type'] = 'success', duration = 3000) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type, duration }]);
    
    setTimeout(() => {
      dismissToast(id);
    }, duration);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Synchronizes the authenticated user profile with the Supabase database
  const syncUserProfile = async (userId: string) => {
    const supabase = getSupabase();
    if (!supabase) return;

    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        // If profile row doesn't exist yet or has a problem, create/fallback from metadata
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (authUser) {
          const fallbackProfile: UserProfile = {
            id: authUser.id,
            email: authUser.email || '',
            fullName: authUser.user_metadata?.fullName || authUser.user_metadata?.name || 'Scholar',
            role: (authUser.user_metadata?.role as any) || 'student',
            avatarUrl: authUser.user_metadata?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80',
            dailyStreak: 1,
            totalXp: 0,
            badges: ['streak_1']
          };
          setUser(fallbackProfile);
          setRoleState(fallbackProfile.role);
        }
      } else if (profile) {
        const profileData = profile as any;
        const userProfile: UserProfile = {
          id: profileData.id,
          email: profileData.email,
          fullName: profileData.fullName || 'Scholar',
          role: (profileData.role as any) || 'student',
          avatarUrl: profileData.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80',
          dailyStreak: profileData.dailyStreak || 1,
          totalXp: profileData.totalXp || 0,
          badges: ['streak_1']
        };
        setUser(userProfile);
        setRoleState(userProfile.role);
        
        // Redirect to dashboard on initial load
        if (userProfile.role === 'student') {
          setCurrentView('student-dashboard');
        } else if (userProfile.role === 'teacher') {
          setCurrentView('teacher-dashboard');
        } else if (userProfile.role === 'admin') {
          setCurrentView('admin-dashboard');
        }
      }
    } catch (err) {
      console.error('Failed to sync profile with database:', err);
    }
  };

  // Listen to Supabase Auth state change on mount
  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) return;

    // Fetch initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        syncUserProfile(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          await syncUserProfile(session.user.id);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setRoleState('visitor');
          setCurrentView('home');
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Simulate logging in with a specific role
  const loginAs = (targetRole: UserRole) => {
    setRoleState(targetRole);
    if (targetRole === 'visitor') {
      setUser(null);
      setCurrentView('home');
      addToast('Browsing as Guest Visitor', 'info');
    } else {
      const mockProfiles: Record<Exclude<UserRole, 'visitor'>, UserProfile> = {
        student: {
          id: 'std_01',
          email: 'student@rkcoaching.com',
          fullName: 'Aarav Sharma',
          role: 'student',
          dailyStreak: 5,
          totalXp: 1250,
          badges: ['streak_5', 'quiz_master', 'speed_learner'],
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80'
        },
        teacher: {
          id: 'tch_01',
          email: 'teacher@rkcoaching.com',
          fullName: 'Prof. Rajesh Khanna',
          role: 'teacher',
          dailyStreak: 12,
          totalXp: 5400,
          badges: ['pioneer', 'mentor_lvl_3'],
          avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=150&h=150&q=80'
        },
        admin: {
          id: 'adm_01',
          email: 'admin@rkcoaching.com',
          fullName: 'RK Admin Control',
          role: 'admin',
          dailyStreak: 154,
          totalXp: 99999,
          badges: ['founder', 'mod_supreme'],
          avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&h=150&q=80'
        }
      };

      setUser(mockProfiles[targetRole]);
      
      // Redirect to correct dashboard upon switching role
      if (targetRole === 'student') {
        setCurrentView('student-dashboard');
      } else if (targetRole === 'teacher') {
        setCurrentView('teacher-dashboard');
      } else if (targetRole === 'admin') {
        setCurrentView('admin-dashboard');
      }
      addToast(`Successfully logged in as ${mockProfiles[targetRole].fullName} (${targetRole.toUpperCase()})`, 'success');
    }
  };

  const logout = async () => {
    const supabase = getSupabase();
    if (supabase) {
      await supabase.auth.signOut();
    }
    setRoleState('visitor');
    setUser(null);
    setCurrentView('home');
    setBreadcrumbs([{ label: 'Home', view: 'home' }]);
    addToast('Logged out successfully', 'success');
  };

  const setRole = (newRole: UserRole) => {
    loginAs(newRole);
  };

  // Helper function to background sync state arrays to Supabase tables
  const reconcileAndSync = async (
    tableName: string,
    oldList: any[],
    newList: any[],
    idKey: string = 'id'
  ) => {
    if (!isSupabaseConfigured()) return;
    const supabase = getSupabase();
    if (!supabase) return;

    try {
      const oldIds = oldList.map(item => item[idKey]);
      const newIds = newList.map(item => item[idKey]);
      const deletedIds = oldIds.filter(id => !newIds.includes(id));

      if (deletedIds.length > 0) {
        await (supabase as any).from(tableName).delete().in(idKey, deletedIds);
      }

      if (newList.length > 0) {
        await (supabase as any).from(tableName).upsert(newList);
      }
    } catch (err) {
      console.error(`Error background syncing table ${tableName}:`, err);
    }
  };

  const createSyncState = <T extends { id: any }>(
    tableName: string,
    initialValue: T[]
  ): [T[], React.Dispatch<React.SetStateAction<T[]>>] => {
    const [state, setState] = useState<T[]>(initialValue);

    const setSyncState: React.Dispatch<React.SetStateAction<T[]>> = (action) => {
      setState((prev) => {
        const next = typeof action === 'function' ? (action as Function)(prev) : action;
        reconcileAndSync(tableName, prev, next);
        return next;
      });
    };

    return [state, setSyncState];
  };

  // Load real data from Supabase or mock arrays
  const [classes, setClasses] = createSyncState<AcademicClass>('classes', mockClasses);
  const [subjects, setSubjects] = createSyncState<AcademicSubject>('subjects', mockSubjects);
  const [courses, setCourses] = createSyncState<Course>('courses', mockCourses);
  const [chapters, setChapters] = createSyncState<AcademicChapter>('chapters', mockChapters);
  const [lessons, setLessons] = createSyncState<Lesson>('lessons', mockLessons);
  const [videos, setVideos] = createSyncState<Video>('videos', mockVideos);
  const [notes, setNotes] = createSyncState<Note>('notes', mockNotes);
  const [announcements, setAnnouncements] = createSyncState<Announcement>('announcements', mockAnnouncements);

  const [faqs, setFaqs] = createSyncState<FaqItem>('faq', [
    {
      id: 'faq_1',
      category: 'admission',
      question: 'Which classes are supported by RK Coaching?',
      answer: 'We provide comprehensive courses, expert-curated notes, and quizzes for Class 6 to Class 12 (covering Science, Commerce, and Arts streams) as well as intensive NEET pre-medical preparation modules.',
      orderIndex: 1
    },
    {
      id: 'faq_2',
      category: 'payment',
      question: 'How do I unlock Premium Course materials?',
      answer: 'You can tap the "Buy Now" button on any locked lesson or premium syllabus note. It initializes a safe Razorpay checkout modal where you can pay via UPI, NetBanking, Card, or Wallets to unlock content instantly.',
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

  const [users, setUsers] = createSyncState<UserProfile>('profiles', [
    {
      id: 'std_01',
      email: 'student@rkcoaching.com',
      fullName: 'Aarav Sharma',
      role: 'student',
      dailyStreak: 5,
      totalXp: 1250,
      badges: ['streak_5', 'quiz_master', 'speed_learner'],
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80'
    },
    {
      id: 'tch_01',
      email: 'teacher@rkcoaching.com',
      fullName: 'Prof. Rajesh Khanna',
      role: 'teacher',
      dailyStreak: 12,
      totalXp: 5400,
      badges: ['pioneer', 'mentor_lvl_3'],
      avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=150&h=150&q=80'
    },
    {
      id: 'tch_pending',
      email: 'shanti.prasad@rkcoaching.com',
      fullName: 'Dr. Shanti Prasad',
      role: 'visitor',
      dailyStreak: 0,
      totalXp: 100,
      badges: ['candidate'],
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&h=150&q=80'
    },
    {
      id: 'adm_01',
      email: 'admin@rkcoaching.com',
      fullName: 'RK Admin Control',
      role: 'admin',
      dailyStreak: 154,
      totalXp: 99999,
      badges: ['founder', 'mod_supreme'],
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&h=150&q=80'
    }
  ]);

  const [homepageConfig, setHomepageConfigState] = useState({
    heroTitle: 'RK coaching institute',
    heroSubtitle: 'Transforming Academic Potential into Top Ranks. Comprehensive syllabus coverage, digital study binders, and interactive assessments for Class 6–12 & NEET Aspirants.',
    featuredCourseIds: ['course_cbse_math', 'course_neet_bio'],
    testimonials: [
      { id: 't_1', author: 'Siddharth Roy', role: 'NEET AIR 245', quote: 'The handwritten PDF note binders and video speed togglers in RK Coaching LMS were a game changer for my NEET biology revisions!', rating: 5 },
      { id: 't_2', author: 'Ananya Sen', role: 'Class 12 Board 98.4%', quote: 'I unlocked the CBSE Class 12 Maths courses. The interactive mock tests and Razorpay fast unlocking made my experience smooth and premium.', rating: 5 }
    ],
    contactPhone: '+91 98765 43210',
    contactEmail: 'admissions@rkcoaching.com',
    contactAddress: 'RK Complex, Opp. Central Park, Sector 4, New Delhi, India',
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

  useEffect(() => {
    const fetchCatalogData = async () => {
      const supabase = getSupabase();
      if (isSupabaseConfigured() && supabase) {
        const s = supabase as any;
        try {
          // 1. Classes
          const { data: dbClasses } = await s
            .from('classes')
            .select('*')
            .order('priority', { ascending: true });
          
          if (dbClasses && dbClasses.length > 0) {
            setClasses(dbClasses as any);
          } else {
            // Seed classes if completely empty
            await s.from('classes').insert(mockClasses);
            setClasses(mockClasses);
          }

          // 2. Subjects
          const { data: dbSubjects } = await s
            .from('subjects')
            .select('*');
          if (dbSubjects && dbSubjects.length > 0) {
            setSubjects(dbSubjects as any);
          } else {
            await s.from('subjects').insert(mockSubjects);
            setSubjects(mockSubjects);
          }

          // 3. Courses
          const { data: dbCourses } = await s
            .from('courses')
            .select('*');
          if (dbCourses && dbCourses.length > 0) {
            setCourses(dbCourses as any);
          } else {
            await s.from('courses').insert(mockCourses);
            setCourses(mockCourses);
          }

          // 4. Chapters
          const { data: dbChapters } = await s
            .from('chapters')
            .select('*')
            .order('orderIndex', { ascending: true });
          if (dbChapters && dbChapters.length > 0) {
            setChapters(dbChapters as any);
          } else {
            await s.from('chapters').insert(mockChapters);
            setChapters(mockChapters);
          }

          // 5. Lessons
          const { data: dbLessons } = await s
            .from('lessons')
            .select('*')
            .order('orderIndex', { ascending: true });
          if (dbLessons && dbLessons.length > 0) {
            setLessons(dbLessons as any);
          } else {
            await s.from('lessons').insert(mockLessons);
            setLessons(mockLessons);
          }

          // 6. Videos
          const { data: dbVideos } = await s
            .from('videos')
            .select('*');
          if (dbVideos && dbVideos.length > 0) {
            setVideos(dbVideos as any);
          } else {
            await s.from('videos').insert(mockVideos);
            setVideos(mockVideos);
          }

          // 7. Notes
          const { data: dbNotes } = await s
            .from('notes')
            .select('*');
          if (dbNotes && dbNotes.length > 0) {
            setNotes(dbNotes as any);
          } else {
            await s.from('notes').insert(mockNotes);
            setNotes(mockNotes);
          }

          // 8. Announcements
          const { data: dbAnnouncements } = await s
            .from('announcements')
            .select('*');
          if (dbAnnouncements && dbAnnouncements.length > 0) {
            setAnnouncements(dbAnnouncements as any);
          } else {
            const mappedAnnouncements = mockAnnouncements.map((ann, idx) => ({
              ...ann,
              id: ann.id.startsWith('ann_') ? `00000000-0000-0000-0000-00000000000${idx + 1}` : ann.id
            }));
            await s.from('announcements').insert(mappedAnnouncements);
            setAnnouncements(mappedAnnouncements as any);
          }

          // 9. FAQs
          const { data: dbFaqs } = await s
            .from('faq')
            .select('*')
            .order('orderIndex', { ascending: true });
          if (dbFaqs && dbFaqs.length > 0) {
            setFaqs(dbFaqs as any);
          } else {
            const initialFaqs = [
              { id: 'faq_1', category: 'admission', question: 'Which classes are supported by RK Coaching?', answer: 'We provide comprehensive courses for Class 6 to Class 12 and NEET pre-medical preparation modules.', orderIndex: 1 },
              { id: 'faq_2', category: 'payment', question: 'How do I unlock Premium Course materials?', answer: 'Tap "Buy Now" on any locked lesson. It opens a secure Razorpay checkout modal where you can pay via UPI to unlock instantly.', orderIndex: 2 },
              { id: 'faq_3', category: 'technical', question: 'Are the course PDF notes available for offline download?', answer: 'Yes! Once enrolled, tap the Download icon next to any PDF note to save it to your device.', orderIndex: 3 }
            ];
            await s.from('faq').insert(initialFaqs);
            setFaqs(initialFaqs);
          }

          // 10. Profiles (User List)
          const { data: dbProfiles } = await s
            .from('profiles')
            .select('*')
            .neq('role', 'visitor');
          if (dbProfiles && dbProfiles.length > 0) {
            setUsers(dbProfiles as any);
          }

          // 11. Homepage Config Settings
          const { data: dbSettings } = await s
            .from('admin_settings')
            .select('*')
            .eq('id', 'homepage_config')
            .single();
          const settingsData = dbSettings as any;
          if (settingsData && settingsData.value) {
            setHomepageConfigState(settingsData.value);
          }
        } catch (err) {
          console.error('Failed to load catalog data from Supabase:', err);
        }
      }
    };
    fetchCatalogData();
  }, []);

  return (
    <AppContext.Provider
      value={{
        role,
        user,
        setRole,
        loginAs,
        logout,
        syncUserProfile,
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
        addBookmark,
        removeBookmark,
        isBookmarked,
        progressList,
        saveProgress,
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
        addNotification,
        markNotificationRead,
        markAllNotificationsRead,
        deleteNotification,
        enrollInCourse,
        hasCourseAccess,
        getEnrolledCourses
      }}
    >
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
