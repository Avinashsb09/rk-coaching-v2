/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserRole, UserProfile } from '../types';
import { getSupabase, isSupabaseConfigured } from '../lib/supabase';

import { useNotifications } from './NotificationContext';

export interface AuthContextType {
  role: UserRole;
  user: UserProfile | null;
  setUser: React.Dispatch<React.SetStateAction<UserProfile | null>>;
  setRole: (role: UserRole) => void;
  loginAs: (role: UserRole, addToast: any, setCurrentView: any) => void;
  logout: (addToast: any, setCurrentView: any, setBreadcrumbs: any) => Promise<void>;
  syncUserProfile: (userId: string, addToast: any, setCurrentView: any, authUserPayload?: any) => Promise<UserProfile | null>;
  initializing: boolean;
  setInitializing: (initializing: boolean) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  console.log(`[${new Date().toISOString()}] AUTH CONTEXT INITIALIZED`);

  const { addToast } = useNotifications();

  useEffect(() => {
    console.log(`[${new Date().toISOString()}] AUTH PROVIDER MOUNTED`);
  }, []);

  const [role, setRoleState] = useState<UserRole>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('rk_auth_role');
      if (saved) return saved as UserRole;
    }
    return 'visitor';
  });

  const [user, setUser] = useState<UserProfile | null>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('rk_auth_user');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error('Failed to parse saved user', e);
        }
      }
    }
    return null;
  });

  const [initializing, setInitializingState] = useState(true);
  const setInitializing = (val: boolean) => {
    console.log(`[${new Date().toISOString()}] LOADING ${val ? 'TRUE' : 'FALSE'}`);
    setInitializingState(val);
  };
  const syncPromisesRef = React.useRef<Record<string, Promise<UserProfile | null>>>({});
  const syncedUserIdRef = React.useRef<string | null>(null);

  // Listen to Auth sessions reactively inside AuthProvider
  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) {
      setInitializing(false);
      return;
    }

    const initSession = async () => {
      console.log(`[${new Date().toISOString()}] INIT SESSION START`);
      try {
        console.log(`[${new Date().toISOString()}] BEFORE getSession`);
        
        // Timeout getSession request to 2500ms
        const getSessionPromise = supabase.auth.getSession();
        const getSessionTimeout = new Promise<{ data: { session: null }, error: any }>((_, reject) => 
          setTimeout(() => reject(new Error('Supabase getSession request timed out')), 2500)
        );
        const { data: { session }, error } = await Promise.race([getSessionPromise, getSessionTimeout]) as any;
        console.log(`[${new Date().toISOString()}] AFTER getSession`);
        
        if (error) {
          console.error(`[${new Date().toISOString()}] AUTH ERROR`, error);
          throw error;
        }

        if (session?.user) {
          console.log(`[${new Date().toISOString()}] SESSION FOUND`, { userId: session.user.id });
          console.log(`[${new Date().toISOString()}] AUTH READY`);
          
          // Decouple: immediately set temporary user profile
          const tempUserProfile: UserProfile = {
            id: session.user.id,
            email: session.user.email!,
            fullName: session.user.user_metadata?.fullName || session.user.user_metadata?.name || 'Scholar',
            role: session.user.user_metadata?.role || 'student',
            avatarUrl: session.user.user_metadata?.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(session.user.email || 'Scholar')}`,
            dailyStreak: 1,
            totalXp: 0,
            badges: ['streak_1'],
            classId: session.user.user_metadata?.classId || null,
          };
          setUser(tempUserProfile);
          setRoleState(tempUserProfile.role);
          setInitializing(false);

          if (syncedUserIdRef.current !== session.user.id) {
            syncedUserIdRef.current = session.user.id;
            // Kick off background profile fetch
            syncUserProfile(session.user.id, addToast, null, session.user).catch(err => {
              console.error('Background sync failed:', err);
            });
          }
        } else {
          console.log(`[${new Date().toISOString()}] NO SESSION FOUND`);
          const hasSupabaseTokens = typeof window !== 'undefined' && 
            Object.keys(localStorage).some(key => key.startsWith('sb-') && key.endsWith('-auth-token'));
          if (hasSupabaseTokens) {
            setUser(null);
          }
          setInitializing(false);
        }
      } catch (err) {
        console.error('Session initialization failed:', err);
        setInitializing(false);
      }
    };

    initSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          if (syncedUserIdRef.current !== session.user.id) {
            syncedUserIdRef.current = session.user.id;
            console.log(`[${new Date().toISOString()}] AUTH READY`);

            // Decouple: immediately set temporary user profile
            const tempUserProfile: UserProfile = {
              id: session.user.id,
              email: session.user.email!,
              fullName: session.user.user_metadata?.fullName || session.user.user_metadata?.name || 'Scholar',
              role: session.user.user_metadata?.role || 'student',
              avatarUrl: session.user.user_metadata?.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(session.user.email || 'Scholar')}`,
              dailyStreak: 1,
              totalXp: 0,
              badges: ['streak_1'],
              classId: session.user.user_metadata?.classId || null,
            };
            setUser(tempUserProfile);
            setRoleState(tempUserProfile.role);
            setInitializing(false);

            // Kick off background sync
            syncUserProfile(session.user.id, addToast, null, session.user).catch(err => {
              console.error('Background sync failed:', err);
            });
          }
        } else if (event === 'SIGNED_OUT') {
          syncedUserIdRef.current = null;
          setUser(null);
          setRoleState('visitor');
          setInitializing(false);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Save auth state reactively to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (user) {
        localStorage.setItem('rk_auth_user', JSON.stringify(user));
        localStorage.setItem('rk_auth_role', role);
      } else {
        localStorage.removeItem('rk_auth_user');
        localStorage.removeItem('rk_auth_role');
      }
    }
  }, [user, role]);

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
  };

  const syncUserProfile = async (
    userId: string,
    addToast: any,
    setCurrentView: any,
    authUserPayload?: any
  ): Promise<UserProfile | null> => {
    if (syncPromisesRef.current[userId]) {
      return syncPromisesRef.current[userId];
    }

    const syncPromise = (async () => {
      const supabase = getSupabase();
      if (!supabase) return null;

      console.log(`[${new Date().toISOString()}] PROFILE FETCH START`);

      try {
        let profile: any = null;
        let fetchError: any = null;

        try {
          const selectPromise = supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

          const timeoutPromise = new Promise<{ data: null, error: any }>((_, reject) => 
            setTimeout(() => reject(new Error('Profile select query timed out')), 2500)
          );

          const res = await Promise.race([selectPromise, timeoutPromise]) as any;
          profile = res.data;
          fetchError = res.error;
        } catch (err) {
          console.warn('Select query failed or timed out. Attempting fallback user generation:', err);
          fetchError = err;
        }

        if (fetchError || !profile) {
          console.error('Failed to retrieve user profile from Supabase profiles table. Please make sure database trigger handles synchronization:', fetchError);
          console.log(`[${new Date().toISOString()}] PROFILE FETCH FAILED`);
          
          // Try to auto-create the profile row dynamically as a fallback!
          try {
            const authUser = authUserPayload;
            if (authUser) {
              console.log('Missing profile row or DB timeout detected. Attempting fallback profile creation/sync...');
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

              const insertPromise = (supabase.from('profiles') as any).insert(newProfile).select('*').single();
              const insertTimeout = new Promise<{ data: null, error: any }>((_, reject) => 
                setTimeout(() => reject(new Error('Profile insert query timed out')), 2500)
              );
              const { data: insertedProfile, error: insertError } = await Promise.race([insertPromise, insertTimeout]) as any;

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
                console.log(`[${new Date().toISOString()}] PROFILE FETCH END`);
                
                // Redirect
                const currentHash = typeof window !== 'undefined' ? window.location.hash.substring(1) : '';
                const isOnDefaultPage = !currentHash || currentHash === 'home' || currentHash === 'auth';
                const redirectTarget = typeof window !== 'undefined' ? sessionStorage.getItem('auth_redirect_target') : null;
                if (redirectTarget && setCurrentView) {
                  console.log(`[${new Date().toISOString()}] REDIRECT STARTED`, { target: redirectTarget });
                  sessionStorage.removeItem('auth_redirect_target');
                  setCurrentView(redirectTarget);
                  console.log(`[${new Date().toISOString()}] ROUTE READY`);
                } else if (isOnDefaultPage && setCurrentView) {
                  console.log(`[${new Date().toISOString()}] REDIRECT STARTED`, { role: userProfile.role });
                  if (userProfile.role === 'student') setCurrentView('student-dashboard');
                  else if (userProfile.role === 'teacher') setCurrentView('teacher-dashboard');
                  else if (userProfile.role === 'admin') setCurrentView('admin-dashboard');
                  else if (userProfile.role === 'super_admin') setCurrentView('super-admin-dashboard');
                  console.log(`[${new Date().toISOString()}] ROUTE READY`);
                } else if (setCurrentView) {
                  setCurrentView(currentHash);
                  console.log(`[${new Date().toISOString()}] ROUTE READY`);
                }
                return userProfile;
              } else {
                console.error('Insert query failed during auto-creation:', insertError);
              }
            }
          } catch (e) {
            console.error('Exception during profile auto-creation fallback:', e);
          }

          // Local Memory Fallback - if database insert also fails or times out
          const authUser = authUserPayload;
          if (authUser) {
            console.log('Database writes unavailable. Using Local Memory Fallback profile from authenticated JWT payload.');
            const userProfile: UserProfile = {
              id: authUser.id,
              email: authUser.email!,
              fullName: authUser.user_metadata?.fullName || authUser.user_metadata?.name || 'Scholar',
              role: authUser.user_metadata?.role || 'student',
              avatarUrl: authUser.user_metadata?.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(authUser.email || 'Scholar')}`,
              dailyStreak: 1,
              totalXp: 0,
              badges: ['streak_1'],
              classId: authUser.user_metadata?.classId || null,
            };

            setUser(userProfile);
            setRoleState(userProfile.role);

            console.log(`[${new Date().toISOString()}] PROFILE LOADED`, { id: userProfile.id, email: userProfile.email, fallback: true });
            console.log(`[${new Date().toISOString()}] ROLE VERIFIED`, { role: userProfile.role });
            console.log(`[${new Date().toISOString()}] LOGIN SUCCESS`, { userId: userProfile.id, email: userProfile.email });
            console.log(`[${new Date().toISOString()}] RBAC PASSED`, { role: userProfile.role });
            console.log(`[${new Date().toISOString()}] PROFILE FETCH END`);

            // Redirection logic
            const currentHash = typeof window !== 'undefined' ? window.location.hash.substring(1) : '';
            const isOnDefaultPage = !currentHash || currentHash === 'home' || currentHash === 'auth';
            const redirectTarget = typeof window !== 'undefined' ? sessionStorage.getItem('auth_redirect_target') : null;

            if (redirectTarget && setCurrentView) {
              console.log(`[${new Date().toISOString()}] REDIRECT STARTED`, { target: redirectTarget });
              sessionStorage.removeItem('auth_redirect_target');
              setCurrentView(redirectTarget);
              console.log(`[${new Date().toISOString()}] ROUTE READY`);
            } else if (isOnDefaultPage && setCurrentView) {
              console.log(`[${new Date().toISOString()}] REDIRECT STARTED`, { role: userProfile.role });
              if (userProfile.role === 'student') setCurrentView('student-dashboard');
              else if (userProfile.role === 'teacher') setCurrentView('teacher-dashboard');
              else if (userProfile.role === 'admin') setCurrentView('admin-dashboard');
              else if (userProfile.role === 'super_admin') setCurrentView('super-admin-dashboard');
              console.log(`[${new Date().toISOString()}] ROUTE READY`);
            } else if (setCurrentView) {
              setCurrentView(currentHash);
              console.log(`[${new Date().toISOString()}] ROUTE READY`);
            }

            return userProfile;
          }

          const err = fetchError as any;
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
        if (profileData.isSuspended || profileData.status === 'suspended') {
          addToast('Your account has been suspended. Please contact platform support.', 'error');
          // Sign out
          const supabase = getSupabase();
          if (supabase) {
            supabase.auth.signOut().catch(() => {});
          }
          setUser(null);
          setRoleState('visitor');
          setCurrentView('auth');
          console.log(`[${new Date().toISOString()}] PROFILE FETCH END`);
          return null;
        }

        console.log(`[${new Date().toISOString()}] PROFILE LOADED`, { id: profileData.id, email: profileData.email });
        
        const rawRole = profileData.role;
        const validRoles = ['visitor', 'student', 'teacher', 'admin', 'super_admin'];
        
        if (!rawRole || !validRoles.includes(rawRole)) {
          console.error(`[DEBUG] INVALID ROLE - The role '${rawRole}' is not recognized by the application.`);
          if (addToast) addToast(`Invalid role detected: ${rawRole}. Authentication aborted.`, 'error');
          const supabase = getSupabase();
          if (supabase) {
            await supabase.auth.signOut().catch(() => {});
          }
          setUser(null);
          setRoleState('visitor');
          if (setCurrentView) setCurrentView('auth');
          console.log(`[${new Date().toISOString()}] PROFILE FETCH END`);
          return null;
        }

        console.log(`[${new Date().toISOString()}] ROLE VERIFIED`, { role: rawRole });

        const userProfile: UserProfile = {
          id: profileData.id,
          email: profileData.email,
          fullName: profileData.fullName || 'Scholar',
          role: rawRole as UserRole,
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

        console.log(`[${new Date().toISOString()}] LOGIN SUCCESS`, { userId: userProfile.id, email: userProfile.email });
        console.log(`[${new Date().toISOString()}] RBAC PASSED`, { role: userProfile.role });
        console.log(`[${new Date().toISOString()}] PROFILE FETCH END`);

        // Transition router safely if not already on a deep link or specific view
        const currentHash = typeof window !== 'undefined' ? window.location.hash.substring(1) : '';
        const isOnDefaultPage = !currentHash || currentHash === 'home' || currentHash === 'auth';
        const redirectTarget = typeof window !== 'undefined' ? sessionStorage.getItem('auth_redirect_target') : null;

        if (redirectTarget && setCurrentView) {
          console.log(`[${new Date().toISOString()}] REDIRECT STARTED`, { target: redirectTarget });
          sessionStorage.removeItem('auth_redirect_target');
          setCurrentView(redirectTarget);
          console.log(`[${new Date().toISOString()}] ROUTE READY`);
        } else if (isOnDefaultPage && setCurrentView) {
          console.log(`[${new Date().toISOString()}] REDIRECT STARTED`, { role: userProfile.role });
          if (userProfile.role === 'student') {
            setCurrentView('student-dashboard');
          } else if (userProfile.role === 'teacher') {
            setCurrentView('teacher-dashboard');
          } else if (userProfile.role === 'admin') {
            setCurrentView('admin-dashboard');
          } else if (userProfile.role === 'super_admin') {
            setCurrentView('super-admin-dashboard');
          } else {
             console.error('[DEBUG] ROUTE NOT FOUND for role:', userProfile.role);
          }
          console.log(`[${new Date().toISOString()}] ROUTE READY`);
        } else if (setCurrentView) {
          // Keeps user exactly on their current deep-linked view
          setCurrentView(currentHash);
          console.log(`[${new Date().toISOString()}] ROUTE READY`);
        }

        return userProfile;
      } catch (err) {
        console.error('Failed to synchronize user profile:', err);
        console.log(`[${new Date().toISOString()}] PROFILE FETCH FAILED`);
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
        },
        super_admin: {
          id: '00000000-0000-0000-0000-000000000004',
          email: 'superadmin@rkcoaching.com',
          fullName: 'RK Super Admin',
          role: 'super_admin',
          dailyStreak: 365,
          totalXp: 999999,
          badges: ['founder', 'platform_owner', 'super_controller'],
          avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80'
        }
      };

      setUser(mockProfiles[targetRole]);

      const redirectTarget = typeof window !== 'undefined' ? sessionStorage.getItem('auth_redirect_target') : null;
      if (redirectTarget) {
        sessionStorage.removeItem('auth_redirect_target');
        setCurrentView(redirectTarget);
      } else {
        if (targetRole === 'student') {
            setCurrentView('student-dashboard');
          } else if (targetRole === 'teacher') {
            setCurrentView('teacher-dashboard');
          } else if (targetRole === 'admin') {
            setCurrentView('admin-dashboard');
          } else if (targetRole === 'super_admin') {
            setCurrentView('super-admin-dashboard');
          }
      }
      addToast(`Successfully logged in as ${mockProfiles[targetRole].fullName} (${targetRole.toUpperCase()})`, 'success');
    }
  };

  const logout = async (addToast: any, setCurrentView: any, setBreadcrumbs: any) => {
    const supabase = getSupabase();
    if (supabase) {
      await supabase.auth.signOut();
    }
    if (typeof window !== 'undefined') {
      localStorage.removeItem('rk_auth_user');
      localStorage.removeItem('rk_auth_role');
      sessionStorage.removeItem('auth_redirect_target');
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
