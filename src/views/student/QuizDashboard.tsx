/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { BrainCircuit, ChevronRight, AlertTriangle } from 'lucide-react';

export default function QuizDashboard() {
  const { 
    classes, 
    subjects, 
    chapters, 
    setCurrentView,
    addToast,
    user
  } = useApp();

  // Selection states
  const [classId, setClassId] = useState<string>('');
  const [subjectId, setSubjectId] = useState<string>('');
  const [chapterId, setChapterId] = useState<string>('');

  const allowedClassIds = ['c6', 'c7', 'c8', 'c9', 'c10', 'c11_sci', 'c12_sci', 'neet'];
  const filteredClasses = classes.filter(c => allowedClassIds.includes(c.id));

  // Auto-detect registered standard on mount/load
  useEffect(() => {
    if (user?.classId) {
      const matched = classes.find(c => c.id === user.classId || c.slug === user.classId);
      if (matched && allowedClassIds.includes(matched.id)) {
        setClassId(matched.id);
      }
    }
  }, [user, classes]);

  // Reset selections when parent fields change
  const handleClassChange = (val: string) => {
    setClassId(val);
    setSubjectId('');
    setChapterId('');
  };

  const handleSubjectChange = (val: string) => {
    setSubjectId(val);
    setChapterId('');
  };

  // Filter subjects based on selected classId
  const activeSubjects = classId ? subjects.filter(s => s.classId === classId) : [];

  // Filter chapters list based on selected subjectId
  const activeChapters = subjectId ? chapters.filter(c => c.subjectId === subjectId) : [];

  // Loading state check
  if (classes.length === 0) {
    return (
      <div className="space-y-8 py-4 max-w-4xl mx-auto text-left">
        <Card glassmorphism className="p-8 border-slate-200/40 dark:border-slate-800/40">
          <div className="flex flex-col items-center justify-center space-y-4 py-8">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500" />
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Loading curriculum data from database...</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 py-4 text-left animate-fade-in max-w-4xl mx-auto">
      
      {/* 1. Header Banner */}
      <section className="bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/40 rounded-3xl p-6 sm:p-8 text-slate-900 dark:text-white relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center border border-indigo-500/20 shadow-inner shrink-0">
              <BrainCircuit className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                Live Quiz Arena
                <Badge variant="info" className="text-[8px] tracking-wider uppercase font-black px-1.5 py-0.5 rounded-lg">LMS WORKFLOW</Badge>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md leading-relaxed font-semibold">
                Select your parameters sequentially to build your study and revision plan.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Profile Check Notice */}
      {!user?.classId && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-600 dark:text-amber-400 font-semibold flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 backdrop-blur-md">
          <span className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-500" />
            Please update your academic standard in your profile to customize your dashboard experience.
          </span>
          <Button 
            variant="warning" 
            size="sm" 
            onClick={() => setCurrentView('update-profile')} 
            className="text-[10px] py-1 h-7 text-amber-900 bg-amber-500 hover:bg-amber-600 shrink-0 font-bold"
          >
            Update Profile
          </Button>
        </div>
      )}

      {/* 2. Step Selector Panel Card */}
      <Card glassmorphism className="border-slate-200/40 dark:border-slate-800/40 p-6 space-y-6">
        
        {/* STEP 1: Academic Standard */}
        <div className="space-y-2">
          <label className="block text-slate-455 dark:text-slate-400 font-black text-xs uppercase tracking-wider">
            STEP 1: Select Your Academic Standard
          </label>
          <div className="relative">
            <select 
              value={classId} 
              onChange={e => handleClassChange(e.target.value)}
              className="w-full p-4 pr-10 rounded-2xl border border-slate-200 dark:border-slate-850 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl text-slate-800 dark:text-white outline-none text-xs font-bold shadow-lg focus:border-indigo-500 transition-all appearance-none cursor-pointer"
            >
              <option value="">-- Choose Standard --</option>
              {filteredClasses.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400">
              <ChevronRight className="w-4 h-4 rotate-90" />
            </div>
          </div>
        </div>

        {/* STEP 2: Choose Subject */}
        <div className="space-y-2">
          <label className="block text-slate-450 dark:text-slate-400 font-black text-xs uppercase tracking-wider">
            STEP 2: Choose Subject
          </label>
          {classId ? (
            activeSubjects.length > 0 ? (
              <div className="relative">
                <select 
                  value={subjectId} 
                  onChange={e => handleSubjectChange(e.target.value)}
                  className="w-full p-4 pr-10 rounded-2xl border border-slate-200 dark:border-slate-850 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl text-slate-800 dark:text-white outline-none text-xs font-bold shadow-lg focus:border-indigo-500 transition-all appearance-none cursor-pointer"
                >
                  <option value="">-- Choose Subject --</option>
                  {activeSubjects.map(sub => (
                    <option key={sub.id} value={sub.id}>{sub.name}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400">
                  <ChevronRight className="w-4 h-4 rotate-90" />
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl border border-dashed border-red-500/25 bg-red-500/5 text-red-500 text-xs font-semibold text-center">
                No subjects found for the selected academic standard in the database.
              </div>
            )
          ) : (
            <div className="p-4 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 text-slate-400 text-xs text-center select-none cursor-not-allowed opacity-60">
              Please select an Academic Standard first to load subjects.
            </div>
          )}
        </div>

        {/* STEP 3: Choose Chapter */}
        <div className="space-y-2">
          <label className="block text-slate-450 dark:text-slate-400 font-black text-xs uppercase tracking-wider">
            STEP 3: Choose Chapter
          </label>
          {subjectId ? (
            activeChapters.length > 0 ? (
              <div className="relative">
                <select 
                  value={chapterId} 
                  onChange={e => setChapterId(e.target.value)}
                  className="w-full p-4 pr-10 rounded-2xl border border-slate-200 dark:border-slate-850 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl text-slate-800 dark:text-white outline-none text-xs font-bold shadow-lg focus:border-indigo-500 transition-all appearance-none cursor-pointer"
                >
                  <option value="">-- Choose Chapter --</option>
                  {activeChapters.map(chap => (
                    <option key={chap.id} value={chap.id}>{chap.name}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400">
                  <ChevronRight className="w-4 h-4 rotate-90" />
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl border border-dashed border-red-500/25 bg-red-500/5 text-red-500 text-xs font-semibold text-center">
                No chapters found for the selected subject in the database.
              </div>
            )
          ) : (
            <div className="p-4 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 text-slate-400 text-xs text-center select-none cursor-not-allowed opacity-60">
              Please choose a Subject first to load chapters.
            </div>
          )}
        </div>

        {/* Selection Summary */}
        {chapterId && (
          <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-slate-700 dark:text-slate-300 flex flex-col gap-2 font-semibold animate-fade-in">
            <p className="font-bold text-sm text-indigo-600 dark:text-indigo-400">✅ Selection Complete!</p>
            <p>
              You have selected: <strong>{filteredClasses.find(c => c.id === classId)?.name}</strong> &gt; <strong>{subjects.find(s => s.id === subjectId)?.name}</strong> &gt; <strong>{activeChapters.find(c => c.id === chapterId)?.name}</strong>
            </p>
          </div>
        )}

      </Card>
    </div>
  );
}
