/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserRole, UserProfile } from '../types';
import { getSupabase, isSupabaseConfigured } from '../lib/supabase';

export interface AuthContextType {
  role: UserRole;
  user: UserProfile | null;
  setUser: React.Dispatch<React.SetStateAction<UserProfile | null>>;
  setRole: (role: UserRole) => void;
  loginAs: (role: UserRole, addToast: any, setCurrentView: any) => void;
  logout: (addToast: any, setCurrentView: any, setBreadcrumbs: any) => Promise<void>;
  syncUserProfile: (userId: string, addToast: any, setCurrentView: any) => Promise<UserProfile | null>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<UserRole>('visitor');
  const [user, setUser] = useState<UserProfile | null>(null);

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
  };

  const syncUserProfile = async (
    userId: string,
    addToast: any,
    setCurrentView: any
  ): Promise<UserProfile | null> => {
    const supabase = getSupabase();
    if (!supabase) return null;

    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error || !profile) {
        console.error('Failed to retrieve user profile from Supabase profiles table. Please make sure database trigger handles synchronization:', error);
        addToast('Authentication profile record not found. Please register or contact system administrator.', 'error');
        setUser(null);
        setRoleState('visitor');
        return null;
      }

      const profileData = profile as any;
      const userProfile: UserProfile = {
        id: profileData.id,
        email: profileData.email,
        fullName: profileData.fullName || 'Scholar',
        role: (profileData.role as any) || 'student',
        avatarUrl: profileData.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(profileData.fullName || 'Scholar')}`,
        dailyStreak: profileData.dailyStreak || 1,
        totalXp: profileData.totalXp || 0,
        badges: ['streak_1']
      };

      setUser(userProfile);
      setRoleState(userProfile.role);

      // Transition router safely
      if (userProfile.role === 'student') {
        setCurrentView('student-dashboard');
      } else if (userProfile.role === 'teacher') {
        setCurrentView('teacher-dashboard');
      } else if (userProfile.role === 'admin') {
        setCurrentView('admin-dashboard');
      }

      return userProfile;
    } catch (err) {
      console.error('Failed to synchronize user profile:', err);
      return null;
    }
  };

  const loginAs = (targetRole: UserRole, addToast: any, setCurrentView: any) => {
    setRoleState(targetRole);
    if (targetRole === 'visitor') {
      setUser(null);
      setCurrentView('home');
      addToast('Browsing as Guest Visitor', 'info');
    } else {
      const mockProfiles: Record<Exclude<UserRole, 'visitor'>, UserProfile> = {
        student: {
          id: '00000000-0000-0000-0000-000000000001',
          email: 'student@rkcoaching.com',
          fullName: 'Aarav Sharma',
          role: 'student',
          dailyStreak: 5,
          totalXp: 1250,
          badges: ['streak_5', 'quiz_master', 'speed_learner'],
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80'
        },
        teacher: {
          id: '00000000-0000-0000-0000-000000000002',
          email: 'teacher@rkcoaching.com',
          fullName: 'Prof. Rajesh Khanna',
          role: 'teacher',
          dailyStreak: 12,
          totalXp: 5400,
          badges: ['pioneer', 'mentor_lvl_3'],
          avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=150&h=150&q=80'
        },
        admin: {
          id: '00000000-0000-0000-0000-000000000003',
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

  const logout = async (addToast: any, setCurrentView: any, setBreadcrumbs: any) => {
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

  return (
    <AuthContext.Provider
      value={{
        role,
        user,
        setUser,
        setRole,
        loginAs,
        logout,
        syncUserProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
