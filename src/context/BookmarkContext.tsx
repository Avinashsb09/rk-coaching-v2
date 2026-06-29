/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Bookmark } from '../types';
import { getSupabase, isSupabaseConfigured } from '../lib/supabase';

export interface BookmarkContextType {
  bookmarksList: Bookmark[];
  setBookmarksList: React.Dispatch<React.SetStateAction<Bookmark[]>>;
  addBookmark: (targetType: 'course' | 'lesson' | 'note', targetId: string, title: string, userId: string | undefined, addToast: any) => Promise<void>;
  removeBookmark: (targetType: 'course' | 'lesson' | 'note', targetId: string, userId: string | undefined, addToast: any) => Promise<void>;
  isBookmarked: (targetType: 'course' | 'lesson' | 'note', targetId: string) => boolean;
  loadBookmarks: (userId: string) => Promise<void>;
}

export const BookmarkContext = createContext<BookmarkContextType | undefined>(undefined);

export function BookmarkProvider({ children }: { children: ReactNode }) {
  const [bookmarksList, setBookmarksList] = useState<Bookmark[]>([]);

  const loadBookmarks = async (userId: string) => {
    if (isSupabaseConfigured() && getSupabase()) {
      const supabase = getSupabase()!;
      try {
        const { data } = await supabase
          .from('bookmarks')
          .select('*')
          .eq('userId', userId);
        if (data) {
          setBookmarksList(data as any);
        }
      } catch (err) {
        console.error('Failed to load bookmarks:', err);
      }
    } else {
      const saved = localStorage.getItem(`rk_bookmarks_${userId}`);
      if (saved) {
        setBookmarksList(JSON.parse(saved));
      } else {
        setBookmarksList([]);
      }
    }
  };

  const addBookmark = async (
    targetType: 'course' | 'lesson' | 'note',
    targetId: string,
    title: string,
    userId: string | undefined,
    addToast: any
  ) => {
    const idVal = userId || 'guest';
    const newB: Bookmark = {
      id: Math.random().toString(36).substring(2, 9),
      userId: idVal,
      targetType,
      targetId,
      title,
      createdAt: new Date().toISOString()
    };

    if (isSupabaseConfigured() && getSupabase() && userId) {
      const supabase = getSupabase()!;
      try {
        const { error } = await (supabase.from('bookmarks') as any).upsert(
          {
            userId,
            targetType,
            targetId,
            title
          },
          { onConflict: 'userId,targetType,targetId' }
        );
        if (!error) {
          await loadBookmarks(userId);
        }
      } catch (err) {
        console.error('Error saving bookmark:', err);
      }
    } else {
      setBookmarksList((prev) => {
        const updated = [...prev, newB];
        localStorage.setItem(`rk_bookmarks_${idVal}`, JSON.stringify(updated));
        return updated;
      });
    }
    addToast(`Bookmarked ${targetType} successfully!`, 'success');
  };

  const removeBookmark = async (
    targetType: 'course' | 'lesson' | 'note',
    targetId: string,
    userId: string | undefined,
    addToast: any
  ) => {
    const idVal = userId || 'guest';
    if (isSupabaseConfigured() && getSupabase() && userId) {
      const supabase = getSupabase()!;
      try {
        await supabase
          .from('bookmarks')
          .delete()
          .eq('userId', userId)
          .eq('targetType', targetType)
          .eq('targetId', targetId);
        await loadBookmarks(userId);
      } catch (err) {
        console.error('Error deleting bookmark:', err);
      }
    } else {
      setBookmarksList((prev) => {
        const updated = prev.filter((b) => !(b.targetType === targetType && b.targetId === targetId));
        localStorage.setItem(`rk_bookmarks_${idVal}`, JSON.stringify(updated));
        return updated;
      });
    }
    addToast('Removed bookmark', 'info');
  };

  const isBookmarked = (targetType: 'course' | 'lesson' | 'note', targetId: string) => {
    return bookmarksList.some((b) => b.targetType === targetType && b.targetId === targetId);
  };

  return (
    <BookmarkContext.Provider
      value={{
        bookmarksList,
        setBookmarksList,
        addBookmark,
        removeBookmark,
        isBookmarked,
        loadBookmarks
      }}
    >
      {children}
    </BookmarkContext.Provider>
  );
}

export function useBookmarks() {
  const ctx = useContext(BookmarkContext);
  if (!ctx) throw new Error('useBookmarks must be used within BookmarkProvider');
  return ctx;
}
