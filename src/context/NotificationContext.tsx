/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { Notification } from '../types';
import { getSupabase, isSupabaseConfigured, deduplicateRequest } from '../lib/supabase';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

export interface NotificationContextType {
  toasts: ToastMessage[];
  addToast: (message: string, type?: ToastMessage['type'], duration?: number) => void;
  dismissToast: (id: string) => void;
  notifications: Notification[];
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
  unreadNotificationsCount: number;
  addNotification: (title: string, message: string, userId: string | undefined) => Promise<void>;
  markNotificationRead: (id: string, userId: string | undefined) => Promise<void>;
  markAllNotificationsRead: (userId: string | undefined) => Promise<void>;
  deleteNotification: (id: string, userId: string | undefined) => Promise<void>;
  loadNotifications: (userId: string) => Promise<void>;
}

export const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const lastLoadedUserIdRef = useRef<string | null>(null);
  const loadingUserIdRef = useRef<string | null>(null);

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

  const isUuid = (val: string | undefined): boolean => {
    return !!val && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);
  };

  const loadNotifications = async (userId: string) => {
    if (!userId) {
      lastLoadedUserIdRef.current = null;
      loadingUserIdRef.current = null;
      setNotifications([]);
      return;
    }
    if (lastLoadedUserIdRef.current === userId || loadingUserIdRef.current === userId) {
      return;
    }
    loadingUserIdRef.current = userId;

    if (isSupabaseConfigured() && getSupabase() && isUuid(userId)) {
      const supabase = getSupabase()!;
      try {
        const { data, error } = await deduplicateRequest(`notifications_${userId}`, async () =>
          await supabase
            .from('notifications')
            .select('*')
            .eq('userId', userId)
            .order('createdAt', { ascending: false })
        );
        
        if (error) {
          console.warn('Failed to load notifications from DB:', error.message);
          fallbackToLocal(userId);
          lastLoadedUserIdRef.current = userId;
          return;
        }

        if (data) {
          setNotifications(data as any);
        }
        lastLoadedUserIdRef.current = userId;
      } catch (err) {
        console.warn('Failed to load notifications:', err);
        fallbackToLocal(userId);
        lastLoadedUserIdRef.current = userId;
      } finally {
        loadingUserIdRef.current = null;
      }
    } else {
      fallbackToLocal(userId);
      lastLoadedUserIdRef.current = userId;
      loadingUserIdRef.current = null;
    }
  };

  const fallbackToLocal = (userId: string) => {
    const saved = localStorage.getItem(`rk_notifications_${userId}`);
    if (saved) {
      setNotifications(JSON.parse(saved));
    } else {
      const defaults: Notification[] = [
        {
          id: 'not_1',
          userId,
          title: 'Welcome to RK Coaching Platform!',
          message: 'Unlock highly professional Class 6-12 syllabus standard revision binders, practice test series, and top rank lecture videos.',
          isRead: false,
          createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
        },
        {
          id: 'not_2',
          userId,
          title: 'New Chemistry Handout Uploaded',
          message: 'Prof. Rajesh Khanna published handwritten notes for Chemistry - Organic Reactions under Chapter 2. Download standard PDFs now!',
          isRead: false,
          createdAt: new Date(Date.now() - 3600000 * 24).toISOString()
        }
      ];
      setNotifications(defaults);
      localStorage.setItem(`rk_notifications_${userId}`, JSON.stringify(defaults));
    }
  };

  const unreadNotificationsCount = notifications.filter((n) => !n.isRead).length;

  const addNotification = async (title: string, message: string, userId: string | undefined) => {
    if (!userId) return;
    if (isSupabaseConfigured() && getSupabase() && isUuid(userId)) {
      const supabase = getSupabase()!;
      try {
        const { error } = await (supabase.from('notifications') as any).insert({
          userId,
          title,
          message,
          isRead: false
        });
        if (error) {
          console.warn('Failed to insert notification in DB:', error.message);
          fallbackAddLocal(title, message, userId);
          return;
        }
        await loadNotifications(userId);
      } catch (err) {
        console.warn(err);
        fallbackAddLocal(title, message, userId);
      }
    } else {
      fallbackAddLocal(title, message, userId);
    }
  };

  const fallbackAddLocal = (title: string, message: string, userId: string) => {
    const newNotif: Notification = {
      id: 'not_' + Math.random().toString(36).substring(2, 9),
      userId,
      title,
      message,
      isRead: false,
      createdAt: new Date().toISOString()
    };
    setNotifications((prev) => {
      const updated = [newNotif, ...prev];
      localStorage.setItem(`rk_notifications_${userId}`, JSON.stringify(updated));
      return updated;
    });
  };

  const markNotificationRead = async (id: string, userId: string | undefined) => {
    if (!userId) return;
    if (isSupabaseConfigured() && getSupabase() && isUuid(userId) && id.includes('-')) {
      const supabase = getSupabase()!;
      try {
        await (supabase.from('notifications') as any).update({ isRead: true }).eq('id', id);
        await loadNotifications(userId);
      } catch (err) {
        console.warn(err);
        fallbackMarkReadLocal(id, userId);
      }
    } else {
      fallbackMarkReadLocal(id, userId);
    }
  };

  const fallbackMarkReadLocal = (id: string, userId: string) => {
    setNotifications((prev) => {
      const updated = prev.map((n) => (n.id === id ? { ...n, isRead: true } : n));
      localStorage.setItem(`rk_notifications_${userId}`, JSON.stringify(updated));
      return updated;
    });
  };

  const markAllNotificationsRead = async (userId: string | undefined) => {
    if (!userId) return;
    if (isSupabaseConfigured() && getSupabase() && isUuid(userId)) {
      const supabase = getSupabase()!;
      try {
        await (supabase.from('notifications') as any).update({ isRead: true }).eq('userId', userId);
        await loadNotifications(userId);
      } catch (err) {
        console.warn(err);
        fallbackMarkAllReadLocal(userId);
      }
    } else {
      fallbackMarkAllReadLocal(userId);
    }
    addToast('All notifications marked as read', 'success');
  };

  const fallbackMarkAllReadLocal = (userId: string) => {
    setNotifications((prev) => {
      const updated = prev.map((n) => ({ ...n, isRead: true }));
      localStorage.setItem(`rk_notifications_${userId}`, JSON.stringify(updated));
      return updated;
    });
  };

  const deleteNotification = async (id: string, userId: string | undefined) => {
    if (!userId) return;
    if (isSupabaseConfigured() && getSupabase() && isUuid(userId) && id.includes('-')) {
      const supabase = getSupabase()!;
      try {
        await supabase.from('notifications').delete().eq('id', id);
        await loadNotifications(userId);
      } catch (err) {
        console.warn(err);
        fallbackDeleteLocal(id, userId);
      }
    } else {
      fallbackDeleteLocal(id, userId);
    }
    addToast('Notification dismissed', 'info');
  };

  const fallbackDeleteLocal = (id: string, userId: string) => {
    setNotifications((prev) => {
      const updated = prev.filter((n) => n.id !== id);
      localStorage.setItem(`rk_notifications_${userId}`, JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <NotificationContext.Provider
      value={{
        toasts,
        addToast,
        dismissToast,
        notifications,
        setNotifications,
        unreadNotificationsCount,
        addNotification,
        markNotificationRead,
        markAllNotificationsRead,
        deleteNotification,
        loadNotifications
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
}
