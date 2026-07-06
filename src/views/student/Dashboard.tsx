/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { 
  ChevronRight, Sparkles, GraduationCap, X, 
  BookOpen, ArrowRight 
} from 'lucide-react';

export default function StudentDashboard() {
  const { 
    user, 
    classes,
    setCurrentView, 
    setSelectedClassSlug,
    addToast
  } = useApp();

  const [showExploreModal, setShowExploreModal] = useState(false);

  // Find registered class standard based on user's classId
  const userClassId = user?.classId;
  const activeClass = classes.find(c => c.id === userClassId || c.slug === userClassId);

  // Direct study click handler
  const handleLetsStudy = () => {
    if (activeClass) {
      setSelectedClassSlug(activeClass.slug);
      setCurrentView('class-view');
      addToast(`Opening ${activeClass.name} Curriculum`, 'success');
    } else {
      addToast('Please select your Academic Standard in your Profile settings first.', 'warning');
      setCurrentView('update-profile');
    }
  };

  // Select class for temporary exploration (no profile update)
  const handleExploreClass = (slug: string, name: string) => {
    setSelectedClassSlug(slug);
    setCurrentView('class-view');
    setShowExploreModal(false);
    addToast(`Exploring ${name} (Temporary Navigation)`, 'success');
  };

  return (
    <div className="space-y-6 py-4 text-left animate-fade-in max-w-xl mx-auto">
      
      {/* 1. LIVE QUIZ ARENA CARD */}
      <Card 
        hoverEffect 
        glassmorphism 
        className="border-indigo-500/20 p-5 bg-slate-900/60 dark:bg-slate-950/40 backdrop-blur-lg flex items-center justify-between cursor-pointer hover:border-indigo-500/40"
        onClick={() => setCurrentView('quiz-dashboard')}
      >
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
            <Sparkles className="w-6 h-6" />
          </div>
          <div className="text-left">
            <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5">
              Live Quiz Arena
              <Badge variant="warning" className="text-[7px] py-0 px-1 font-black">CBT</Badge>
            </h3>
            <p className="text-[11px] text-slate-400 mt-1">Test core concepts & derivations with timed CBT quizzes.</p>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-indigo-400 shrink-0" />
      </Card>

      {/* 2. PREVIOUS YEAR PAPERS (PYQ) CARD */}
      <Card 
        hoverEffect 
        glassmorphism 
        className="border-amber-500/20 p-5 bg-slate-900/60 dark:bg-slate-950/40 backdrop-blur-lg flex items-center justify-between cursor-pointer hover:border-amber-500/40"
        onClick={() => setCurrentView('pyq-dashboard')}
      >
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div className="text-left">
            <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5">
              Previous Year Papers (PYQ)
              <Badge variant="info" className="text-[7px] py-0 px-1 font-black bg-blue-600 text-white">BOARD</Badge>
            </h3>
            <p className="text-[11px] text-slate-400 mt-1">Practice official past year solved CBT papers.</p>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-amber-400 shrink-0" />
      </Card>

      {/* 3. YOUR ACADEMIC STANDARD CARD */}
      <Card glassmorphism className="border-slate-200/40 dark:border-slate-800/40 p-6 flex flex-col justify-between min-h-[160px]">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
            <BookOpen className="w-5 h-5" />
            <h3 className="text-xs font-black uppercase tracking-wider">YOUR ACADEMIC STANDARD</h3>
          </div>
          
          <div className="space-y-1">
            {classes.length === 0 ? (
              <p className="text-xs text-slate-400 animate-pulse">Loading academic standard...</p>
            ) : (
              <>
                <p className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                  {activeClass?.name || 'No Academic Standard Selected'}
                </p>
                {!activeClass && (
                  <p className="text-[11px] text-slate-450 dark:text-slate-400">
                    Please select your class standard in settings or explore all options below.
                  </p>
                )}
              </>
            )}
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800/40 mt-4 flex justify-end">
          <Button 
            variant="primary" 
            size="sm" 
            onClick={handleLetsStudy}
            rightIcon={<ChevronRight className="w-4 h-4" />}
            className="text-xs font-bold px-5"
          >
            LET'S STUDY
          </Button>
        </div>
      </Card>

      {/* 4. EXPLORE ALL ACADEMIC STANDARDS CARD */}
      <Card 
        hoverEffect
        glassmorphism 
        className="border-slate-200/30 dark:border-slate-800/30 p-5 cursor-pointer hover:border-blue-500/35"
        onClick={() => setShowExploreModal(true)}
      >
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h4 className="text-xs font-extrabold text-slate-800 dark:text-slate-200">
              Explore All Academic Standards
            </h4>
            <p className="text-[10px] text-slate-400">
              Explore syllabus chapters & resources of other classes.
            </p>
          </div>
          <div className="flex items-center gap-1 text-[10px] font-black uppercase text-blue-600 dark:text-blue-400 shrink-0">
            <span>Explore</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </Card>

      {/* EXPLORATION MODAL DIALOG */}
      {showExploreModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md">
          <Card className="w-full max-w-md border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-6 relative overflow-hidden animate-scale-up text-left">
            <button 
              onClick={() => setShowExploreModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-5">
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                <BookOpen className="w-5 h-5" />
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
                  Explore Academic Standards
                </h3>
              </div>

              <p className="text-[11px] text-slate-450 dark:text-slate-400 leading-relaxed font-semibold pb-1 border-b border-slate-100 dark:border-slate-800">
                Select any academic class below to temporarily explore its courses, lectures, and resources without changing your profile configurations.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[300px] overflow-y-auto pr-1">
                {classes.map(cls => (
                  <button
                    key={cls.id}
                    type="button"
                    onClick={() => handleExploreClass(cls.slug, cls.name)}
                    className="p-3 text-xs font-bold text-left rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/30 text-slate-800 dark:text-slate-200 hover:border-blue-500/40 hover:bg-blue-500/5 transition-all flex items-center justify-between cursor-pointer"
                  >
                    <span>{cls.name}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                ))}
              </div>
            </div>
          </Card>
        </div>
      )}

    </div>
  );
}
