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
  initializing: boolean;
  setInitializing: (initializing: boolean) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<UserRole>('visitor');
  const [user, setUser] = useState<UserProfile | null>(null);
  const [initializing, setInitializing] = useState(true);
  const syncPromisesRef = React.useRef<Record<string, Promise<UserProfile | null>>>({});

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
  };

  const syncUserProfile = async (
    userId: string,
    addToast: any,
    setCurrentView: any
  ): Promise<UserProfile | null> => {
    if (syncPromisesRef.current[userId]) {
      return syncPromisesRef.current[userId];
    }

    const syncPromise = (async () => {
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
          
          // Try to auto-create the profile row dynamically as a fallback!
          try {
            const { data: { user: authUser } } = await supabase.auth.getUser();
            if (authUser) {
              console.log('Missing profile row detected. Attempting automatic sync/creation fallback...');
              const newProfile = {
                id: authUser.id,
                email: authUser.email!,
                fullName: authUser.user_metadata?.fullName || authUser.user_metadata?.name || 'Scholar',
                role: authUser.user_metadata?.role || 'student',
                avatarUrl: authUser.user_metadata?.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(authUser.email || 'Scholar')}`,
                classId: authUser.user_metadata?.classId || null,
                dailyStreak: 1,
                totalXp: 0
              };

              const { data: insertedProfile, error: insertError } = await (supabase
                .from('profiles') as any)
                .insert(newProfile)
                .select('*')
                .single();

              if (!insertError && insertedProfile) {
                console.log('Successfully auto-created user profile fallback:', insertedProfile);
                const profileData = insertedProfile as any;
                const userProfile: UserProfile = {
                  id: profileData.id,
                  email: profileData.email,
                  fullName: profileData.fullName || 'Scholar',
                  role: (profileData.role as any) || 'student',
                  avatarUrl: profileData.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(profileData.fullName || 'Scholar')}`,
                  dailyStreak: profileData.dailyStreak || 1,
                  totalXp: profileData.totalXp || 0,
                  badges: ['streak_1'],
                  classId: profileData.classId || null,
                  phone: profileData.phone || null,
                  schoolName: profileData.schoolName || null,
                  address: profileData.address || null,
                  state: profileData.state || null,
                  district: profileData.district || null
                };
                setUser(userProfile);
                setRoleState(userProfile.role);
                
                // Redirect
                const currentHash = typeof window !== 'undefined' ? window.location.hash.substring(1) : '';
                const isOnDefaultPage = !currentHash || currentHash === 'home' || currentHash === 'auth';
                if (isOnDefaultPage) {
                  if (userProfile.role === 'student') setCurrentView('student-dashboard');
                  else if (userProfile.role === 'teacher') setCurrentView('teacher-dashboard');
                  else if (userProfile.role === 'admin') setCurrentView('admin-dashboard');
                } else {
                  setCurrentView(currentHash);
                }
                return userProfile;
              } else {
                console.error('Insert query failed during auto-creation:', insertError);
              }
            }
          } catch (e) {
            console.error('Exception during profile auto-creation fallback:', e);
          }

          const err = error as any;
          const isAuthErr = err && (err.status === 401 || err.message?.toLowerCase().includes('jwt') || err.message?.toLowerCase().includes('unauthorized') || err.code === 'PGRST301');
          if (isAuthErr) {
            console.warn('Session is invalid or expired. Signing out automatically.');
            await supabase.auth.signOut().catch(() => {});
            try {
              for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && (key.startsWith('sb-') || key.includes('supabase.auth'))) {
                  localStorage.removeItem(key);
                }
              }
            } catch (e) {}
          } else {
            addToast('Authentication profile record not found. Please register or contact system administrator.', 'error');
          }
          
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
          badges: ['streak_1'],
          classId: profileData.classId || null,
          phone: profileData.phone || null,
          schoolName: profileData.schoolName || null,
          address: profileData.address || null,
          state: profileData.state || null,
          district: profileData.district || null
        };

        setUser(userProfile);
        setRoleState(userProfile.role);

        // Transition router safely if not already on a deep link or specific view
        const currentHash = typeof window !== 'undefined' ? window.location.hash.substring(1) : '';
        const isOnDefaultPage = !currentHash || currentHash === 'home' || currentHash === 'auth';

        if (isOnDefaultPage) {
          if (userProfile.role === 'student') {
            setCurrentView('student-dashboard');
          } else if (userProfile.role === 'teacher') {
            setCurrentView('teacher-dashboard');
          } else if (userProfile.role === 'admin') {
            setCurrentView('admin-dashboard');
          }
        } else {
          // Keeps user exactly on their current deep-linked view
          setCurrentView(currentHash);
        }

        return userProfile;
      } catch (err) {
        console.error('Failed to synchronize user profile:', err);
        return null;
      }
    })();

    syncPromisesRef.current[userId] = syncPromise;
    try {
      return await syncPromise;
    } finally {
      delete syncPromisesRef.current[userId];
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
        syncUserProfile,
        initializing,
        setInitializing
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
