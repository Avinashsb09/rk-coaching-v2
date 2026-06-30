/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { isSupabaseConfigured, getSupabase } from '../../lib/supabase';
import { ShieldCheck, Mail, Lock, User, Sparkles, BookOpen, AlertCircle, ArrowLeft, RefreshCw, Eye, EyeOff } from 'lucide-react';

export default function AuthPage() {
  const { loginAs, addToast, setCurrentView, syncUserProfile, currentView } = useApp();
  
  // Tab states: 'login' | 'signup' | 'forgot' | 'reset'
  const [activeTab, setActiveTab] = useState<'login' | 'signup' | 'forgot' | 'reset'>(() => {
    return currentView === 'auth-signup' ? 'signup' : 'login';
  });

  React.useEffect(() => {
    if (currentView === 'auth-signup') {
      setActiveTab('signup');
    } else if (currentView === 'auth') {
      setActiveTab('login');
    }
  }, [currentView]);
  
  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedClass, setSelectedClass] = useState('neet-prep');
  const [selectedRole, setSelectedRole] = useState<'student' | 'teacher' | 'admin'>('student');
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [signUpError, setSignUpError] = useState('');

  const supabase = getSupabase();
  const configured = isSupabaseConfigured();

  // 1. SIGN IN ACTION
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      addToast('Please specify email and password', 'error');
      return;
    }

    setIsLoading(true);
    try {
      if (configured && supabase) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (error) throw error;
        
        addToast('Successfully authenticated via Supabase!', 'success');
        // Retrieve and sync user profile role
        await syncUserProfile(data.user?.id);
      } else {
        // Fallback demo mode
        addToast('No Supabase credentials. Simulating authentic verification...', 'info');
        // Match simulated user role based on email or selections
        if (email.includes('teacher')) {
          loginAs('teacher');
        } else if (email.includes('admin')) {
          loginAs('admin');
        } else {
          loginAs('student');
        }
      }
    } catch (err: any) {
      addToast(err.message || 'Authentication failed. Please check your inputs.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // 2. SIGN UP ACTION
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    if (!email || !password || !confirmPassword || !fullName) {
      addToast('Please fill out all required fields', 'error');
      return;
    }

    if (password !== confirmPassword) {
      setSignUpError('Passwords do not match');
      addToast('Passwords do not match. Please verify.', 'error');
      return;
    } else {
      setSignUpError('');
    }

    setIsLoading(true);
    try {
      if (configured && supabase) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}?verified=true`,
            data: {
              fullName,
              role: selectedRole,
              classId: selectedClass,
              avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fullName)}`
            }
          }
        });
        if (error) throw error;
        
        setVerificationSent(true);
        addToast('Account created successfully in Supabase! Verification email triggered.', 'success');
      } else {
        // Fallback demo mode
        addToast(`Registered Demo Student Account for ${fullName}!`, 'success');
        loginAs('student');
      }
    } catch (err: any) {
      addToast(err.message || 'Signup failed', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // 3. FORGOT PASSWORD ACTION
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      addToast('Please enter your email address', 'error');
      return;
    }

    setIsLoading(true);
    try {
      if (configured && supabase) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/#reset`
        });
        if (error) throw error;
        addToast('Password reset email sent successfully via Supabase!', 'success');
      } else {
        addToast(`Reset link simulated for "${email}".`, 'info');
      }
      setActiveTab('login');
    } catch (err: any) {
      addToast(err.message || 'Failed to trigger reset email', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // 4. RESET PASSWORD ACTION
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      addToast('Please type a new password', 'error');
      return;
    }

    setIsLoading(true);
    try {
      if (configured && supabase) {
        const { error } = await supabase.auth.updateUser({ password });
        if (error) throw error;
        addToast('Your password was updated in Supabase!', 'success');
      } else {
        addToast('Demo: Password reset successfully completed.', 'success');
      }
      setActiveTab('login');
    } catch (err: any) {
      addToast(err.message || 'Failed to update password', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // 5. QUICK PRESET LOGIN
  const triggerQuickLogin = (roleType: 'student' | 'teacher' | 'admin') => {
    addToast(`Entering via Quick Demo Preset: ${roleType.toUpperCase()}`, 'info');
    loginAs(roleType);
  };

  return (
    <div className="max-w-md mx-auto py-8 space-y-6 text-left">
      
      {/* 1. Header back button */}
      <button
        onClick={() => setCurrentView('catalog')}
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Course Syllabus</span>
      </button>

      {/* Supabase connection status indicator */}
      <div className={`p-3.5 rounded-2xl border flex items-center gap-3 ${
        configured 
          ? 'bg-emerald-50 border-emerald-100 text-emerald-800 dark:bg-emerald-950/20 dark:border-emerald-900/40 dark:text-emerald-400'
          : 'bg-amber-50 border-amber-150 text-amber-850 dark:bg-amber-950/20 dark:border-amber-900/40 dark:text-amber-400'
      }`}>
        <div className={`h-2.5 w-2.5 rounded-full ${configured ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500 animate-pulse'}`} />
        <div className="flex-1 text-xs">
          <p className="font-bold">
            {configured ? 'Supabase Database Connected' : 'Running in Local Demo Mode'}
          </p>
          <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">
            {configured 
              ? 'Users, course catalogs, and leaderboard XP are sync’d directly with Supabase.' 
              : 'Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to environment secrets to sync real users.'}
          </p>
        </div>
      </div>

      <Card className="p-6">
        <CardContent className="p-0 space-y-5">
          
          {/* LOGO AND MOTTO */}
          <div className="text-center space-y-1.5">
            <div className="mx-auto h-10 w-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/10">
              <BookOpen className="w-5.5 h-5.5" />
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mt-3">
              {activeTab === 'login' && 'Sign in to RK Coaching'}
              {activeTab === 'signup' && 'Create Scholar Account'}
              {activeTab === 'forgot' && 'Reset your password'}
              {activeTab === 'reset' && 'Type new password'}
            </h2>
            <p className="text-xs text-slate-500">
              {activeTab === 'login' && 'Unlock free-tier mock tests and handwriting notes'}
              {activeTab === 'signup' && 'Access standard class study programs in India'}
              {activeTab === 'forgot' && 'We’ll email you a secure link to restore access'}
            </p>
          </div>

          {/* VERIFICATION SENT ALERT */}
          {verificationSent && (
            <div className="p-4 bg-blue-50 border border-blue-200 text-blue-800 rounded-2xl text-xs space-y-2">
              <p className="font-bold">Verification Email Triggered!</p>
              <p className="text-slate-600">Please check your inbox. Once verified, you can sign in directly to your academic dashboard.</p>
              <Button size="sm" variant="outline" className="w-full bg-white text-blue-700" onClick={() => setVerificationSent(false)}>
                Return to Login
              </Button>
            </div>
          )}

          {!verificationSent && (
            <>
              {/* RENDER FORMS */}
              {activeTab === 'login' && (
                <form onSubmit={handleSignIn} className="space-y-4">
                  <Input
                    label="Email Address"
                    type="email"
                    placeholder="e.g. aarav@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
                  />
                  <Input
                    label="Password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
                  />

                  {/* REMEMBER ME & FORGOT PASSWORD */}
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <label className="flex items-center gap-2 text-slate-600 dark:text-slate-400 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="rounded border-slate-300 dark:border-slate-800 text-blue-600 focus:ring-blue-500"
                      />
                      <span>Remember Me</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setActiveTab('forgot')}
                      className="text-blue-600 hover:underline cursor-pointer"
                    >
                      Forgot Password?
                    </button>
                  </div>

                  <Button variant="primary" type="submit" className="w-full" isLoading={isLoading}>
                    Sign In
                  </Button>
                </form>
              )}

              {activeTab === 'signup' && (
                <form onSubmit={handleSignUp} className="space-y-4">
                  <Input
                    label="Full Name *"
                    placeholder="e.g. Aarav Sharma"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    leftIcon={<User className="w-4 h-4 text-slate-400" />}
                  />
                  <Input
                    label="Email Address *"
                    type="email"
                    placeholder="e.g. aarav@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
                  />
                  
                  <Input
                    label="Password (min 6 chars) *"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (signUpError && e.target.value === confirmPassword) {
                        setSignUpError('');
                      }
                    }}
                    required
                    leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
                    rightIcon={
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer flex items-center justify-center"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    }
                  />

                  <Input
                    label="Confirm Password *"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (signUpError && e.target.value === password) {
                        setSignUpError('');
                      }
                    }}
                    required
                    leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
                    rightIcon={
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer flex items-center justify-center"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    }
                    error={signUpError}
                  />

                  {/* SELECT ROLE GROUP */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      Account Role Category
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedRole('student')}
                        className={`py-2 px-3 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer ${
                          selectedRole === 'student'
                            ? 'bg-blue-50 border-blue-450 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400'
                            : 'bg-white border-slate-200 text-slate-600 dark:bg-slate-950 dark:border-slate-800'
                        }`}
                      >
                        Student
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedRole('teacher')}
                        className={`py-2 px-3 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer ${
                          selectedRole === 'teacher'
                            ? 'bg-amber-50 border-amber-450 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                            : 'bg-white border-slate-200 text-slate-600 dark:bg-slate-950 dark:border-slate-800'
                        }`}
                      >
                        Teacher
                      </button>
                    </div>
                  </div>

                  {/* CLASS CHOSEN */}
                  {selectedRole === 'student' && (
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                        Academic Standard
                      </label>
                      <select
                        value={selectedClass}
                        onChange={(e) => setSelectedClass(e.target.value)}
                        className="block w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs px-3 py-2.5 focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="class-6">Class 6</option>
                        <option value="class-10">Class 10</option>
                        <option value="class-12-science">Class 12 (Science)</option>
                        <option value="neet-prep">NEET (Biology & Chemistry) Preparation</option>
                      </select>
                    </div>
                  )}

                  <Button variant="primary" type="submit" className="w-full" isLoading={isLoading}>
                    Create Account
                  </Button>
                </form>
              )}

              {activeTab === 'forgot' && (
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <Input
                    label="Email Address"
                    type="email"
                    placeholder="e.g. aarav@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
                  />
                  <Button variant="primary" type="submit" className="w-full" isLoading={isLoading}>
                    Send Reset Email
                  </Button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('login')}
                    className="w-full text-center text-xs font-bold text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    Return to login
                  </button>
                </form>
              )}

              {/* ROUTE TOGGLE TAB LINKS */}
              {activeTab !== 'forgot' && activeTab !== 'reset' && (
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 text-center text-xs text-slate-500">
                  {activeTab === 'login' ? (
                    <p>
                      Don't have an account?{' '}
                      <button
                        onClick={() => setActiveTab('signup')}
                        className="font-bold text-blue-600 hover:underline cursor-pointer"
                      >
                        Sign Up Free
                      </button>
                    </p>
                  ) : (
                    <p>
                      Already registered?{' '}
                      <button
                        onClick={() => setActiveTab('login')}
                        className="font-bold text-blue-600 hover:underline cursor-pointer"
                      >
                        Sign In Now
                      </button>
                    </p>
                  )}
                </div>
              )}
            </>
          )}

          {/* End of login forms */}

        </CardContent>
      </Card>
    </div>
  );
}
