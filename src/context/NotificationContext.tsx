/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Notification } from '../types';
import { getSupabase, isSupabaseConfigured } from '../lib/supabase';

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

  const loadNotifications = async (userId: string) => {
    if (isSupabaseConfigured() && getSupabase()) {
      const supabase = getSupabase()!;
      try {
        const { data } = await supabase
          .from('notifications')
          .select('*')
          .eq('userId', userId)
          .order('createdAt', { ascending: false });
        if (data) {
          setNotifications(data as any);
        }
      } catch (err) {
        console.error('Failed to load notifications:', err);
      }
    } else {
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
    }
  };

  const unreadNotificationsCount = notifications.filter((n) => !n.isRead).length;

  const addNotification = async (title: string, message: string, userId: string | undefined) => {
    if (!userId) return;
    if (isSupabaseConfigured() && getSupabase()) {
      const supabase = getSupabase()!;
      try {
        await (supabase.from('notifications') as any).insert({
          userId,
          title,
          message,
          isRead: false
        });
        await loadNotifications(userId);
      } catch (err) {
        console.error(err);
      }
    } else {
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
    }
  };

  const markNotificationRead = async (id: string, userId: string | undefined) => {
    if (!userId) return;
    if (isSupabaseConfigured() && getSupabase()) {
      const supabase = getSupabase()!;
      try {
        await (supabase.from('notifications') as any).update({ isRead: true }).eq('id', id);
        await loadNotifications(userId);
      } catch (err) {
        console.error(err);
      }
    } else {
      setNotifications((prev) => {
        const updated = prev.map((n) => (n.id === id ? { ...n, isRead: true } : n));
        localStorage.setItem(`rk_notifications_${userId}`, JSON.stringify(updated));
        return updated;
      });
    }
  };

  const markAllNotificationsRead = async (userId: string | undefined) => {
    if (!userId) return;
    if (isSupabaseConfigured() && getSupabase()) {
      const supabase = getSupabase()!;
      try {
        await (supabase.from('notifications') as any).update({ isRead: true }).eq('userId', userId);
        await loadNotifications(userId);
      } catch (err) {
        console.error(err);
      }
    } else {
      setNotifications((prev) => {
        const updated = prev.map((n) => ({ ...n, isRead: true }));
        localStorage.setItem(`rk_notifications_${userId}`, JSON.stringify(updated));
        return updated;
      });
    }
    addToast('All notifications marked as read', 'success');
  };

  const deleteNotification = async (id: string, userId: string | undefined) => {
    if (!userId) return;
    if (isSupabaseConfigured() && getSupabase()) {
      const supabase = getSupabase()!;
      try {
        await supabase.from('notifications').delete().eq('id', id);
        await loadNotifications(userId);
      } catch (err) {
        console.error(err);
      }
    } else {
      setNotifications((prev) => {
        const updated = prev.filter((n) => n.id !== id);
        localStorage.setItem(`rk_notifications_${userId}`, JSON.stringify(updated));
        return updated;
      });
    }
    addToast('Notification dismissed', 'info');
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
