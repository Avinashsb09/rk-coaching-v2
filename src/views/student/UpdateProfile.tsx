/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { getSupabase } from '../../lib/supabase';
import { User, Phone, Mail, BookOpen, Key, Landmark, CheckCircle, AlertTriangle } from 'lucide-react';

const avatarPresets = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&h=150&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80'
];

export default function UpdateProfile() {
  const { user, setUser, classes, addToast, setCurrentView } = useApp();
  const supabase = getSupabase();

  // Profile fields state
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || avatarPresets[0]);
  const [phone, setPhone] = useState(user?.phone || '');
  const [classId, setClassId] = useState(user?.classId || 'c10');
  const [schoolName, setSchoolName] = useState(user?.schoolName || '');

  // Password fields state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Loading states
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      addToast('Image must be under 2MB', 'error');
      return;
    }

    setIsSavingProfile(true);
    try {
      if (supabase && user?.id) {
        const fileExt = file.name.split('.').pop();
        const filePath = `avatars/${user.id}-${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, file, { upsert: true });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);

        setAvatarUrl(publicUrl);
        addToast('Avatar uploaded successfully!', 'success');
      } else {
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            setAvatarUrl(reader.result);
            addToast('Avatar loaded (local simulation)', 'info');
          }
        };
        reader.readAsDataURL(file);
      }
    } catch (err: any) {
      console.warn('Storage upload failed, using local FileReader simulation:', err);
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setAvatarUrl(reader.result);
          addToast('Avatar loaded (local simulation fallback)', 'info');
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName) {
      addToast('Full name is required', 'error');
      return;
    }

    setIsSavingProfile(true);
    try {
      const updatedFields = {
        fullName,
        avatarUrl,
        phone,
        classId,
        schoolName
      };

      if (supabase && user?.id) {
        // Update public profiles table
        const { error: profileError } = await (supabase
          .from('profiles') as any)
          .update(updatedFields)
          .eq('id', user.id);

        if (profileError) throw profileError;

        // Also update Auth metadata so session stays in sync
        const { error: authError } = await supabase.auth.updateUser({
          data: {
            fullName,
            classId,
            avatarUrl
          }
        });
        if (authError) console.warn('Auth metadata sync failed, database row is updated:', authError);
      }

      // Update local state context
      setUser((prev: any) => {
        if (!prev) return null;
        return {
          ...prev,
          ...updatedFields
        };
      });

      addToast('Profile metadata updated successfully!', 'success');
    } catch (err: any) {
      addToast(err.message || 'Failed to update profile information.', 'error');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      addToast('Please enter both password fields', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      addToast('Passwords do not match. Please verify.', 'error');
      return;
    }
    if (newPassword.length < 6) {
      addToast('Password must be at least 6 characters.', 'error');
      return;
    }

    setIsChangingPassword(true);
    try {
      if (supabase) {
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) throw error;
        addToast('Password changed successfully!', 'success');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        addToast('Supabase auth not configured. Password change simulated.', 'info');
      }
    } catch (err: any) {
      addToast(err.message || 'Password update failed.', 'error');
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="space-y-8 py-4 text-left animate-fade-in max-w-4xl mx-auto">
      
      {/* 1. Header Banner */}
      <section className="bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/40 rounded-3xl p-6 sm:p-8 text-slate-900 dark:text-white relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="relative space-y-2">
          <Badge variant="success" className="bg-emerald-50 text-emerald-600 border border-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/30 font-black">
            PROFILE MANAGER
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Manage Your Student Credentials
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-xl">
            Update your registered standard, personal information, avatar, and system password.
          </p>
        </div>
      </section>

      {/* 2. Grid content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        
        {/* Left Column: Presets & Info card */}
        <div className="space-y-6 md:col-span-1">
          <Card glassmorphism className="border-slate-200/40 dark:border-slate-800/40 p-5">
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-4">Choose Avatar Preset</h3>
            
            <div className="flex flex-col items-center gap-4">
              <img 
                src={avatarUrl} 
                alt="Profile Preview" 
                className="w-24 h-24 rounded-full border-2 border-indigo-500 shadow-xl object-cover"
              />
              
              <div className="grid grid-cols-4 gap-2">
                {avatarPresets.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setAvatarUrl(preset)}
                    className={`rounded-full overflow-hidden border-2 cursor-pointer transition-all hover:scale-105 ${
                      avatarUrl === preset ? 'border-indigo-500 scale-105' : 'border-transparent'
                    }`}
                  >
                    <img src={preset} alt="" className="w-10 h-10 object-cover" />
                  </button>
                ))}
              </div>
              
              <div className="flex flex-col items-center gap-2 pt-2">
                <label className="cursor-pointer bg-indigo-600 hover:bg-indigo-750 text-white text-[10px] font-black px-3 py-1.5 rounded-xl transition-all shadow-md">
                  Upload Custom Image
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleAvatarUpload} 
                    className="hidden" 
                  />
                </label>
                <p className="text-[8px] text-slate-400">Max size: 2MB</p>
              </div>
              
              <div className="w-full text-center space-y-1.5 pt-3 border-t border-slate-101 dark:border-slate-800/60">
                <p className="text-xs font-black text-slate-900 dark:text-white">{user?.fullName || 'Scholar'}</p>
                <p className="text-[10px] text-slate-500 font-semibold">{user?.email}</p>
                <Badge variant="info" className="text-[8px] uppercase tracking-wider font-extrabold mt-1">
                  {classes.find(c => c.id === user?.classId)?.name || 'Class Standard'}
                </Badge>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Forms */}
        <div className="space-y-6 md:col-span-2">
          {/* Profile Edit Form Card */}
          <Card glassmorphism className="border-slate-200/40 dark:border-slate-800/40 p-6">
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-6 border-b border-slate-100 dark:border-slate-850 pb-3">
              Personal Information
            </h3>
            
            <form onSubmit={handleUpdateProfile} className="space-y-5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Full Name *"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="Aarav Sharma"
                  leftIcon={<User className="w-4 h-4 text-slate-400" />}
                  required
                />
                
                <Input
                  label="Phone Number"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="e.g. +91 98765 43210"
                  leftIcon={<Phone className="w-4 h-4 text-slate-400" />}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-bold mb-1.5">Academic Standard</label>
                  <select 
                    value={classId} 
                    onChange={e => setClassId(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 outline-none text-xs"
                  >
                    {classes.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                
                <Input
                  label="School Name"
                  value={schoolName}
                  onChange={e => setSchoolName(e.target.value)}
                  placeholder="Guwahati Public School"
                  leftIcon={<Landmark className="w-4 h-4 text-slate-400" />}
                />
              </div>



              <div className="flex justify-end pt-3">
                <Button 
                  variant="primary" 
                  type="submit" 
                  isLoading={isSavingProfile}
                  className="text-xs font-bold"
                >
                  Save Profile Changes
                </Button>
              </div>
            </form>
          </Card>

          {/* Password Change Form Card */}
          <Card glassmorphism className="border-slate-200/40 dark:border-slate-800/40 p-6">
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-6 border-b border-slate-100 dark:border-slate-850 pb-3">
              Change System Password
            </h3>
            
            <form onSubmit={handleChangePassword} className="space-y-5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="New Password"
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  leftIcon={<Key className="w-4 h-4 text-slate-400" />}
                  required
                />
                
                <Input
                  label="Confirm New Password"
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  leftIcon={<Key className="w-4 h-4 text-slate-400" />}
                  required
                />
              </div>

              <div className="flex justify-end pt-3">
                <Button 
                  variant="danger" 
                  type="submit" 
                  isLoading={isChangingPassword}
                  className="text-xs font-bold bg-red-650 hover:bg-red-750 text-white border-none"
                >
                  Update Password
                </Button>
              </div>
            </form>
          </Card>
        </div>

      </div>
    </div>
  );
}
