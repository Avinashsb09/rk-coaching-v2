/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { BookOpen, ArrowRight, ShieldCheck, Star, Users, Sparkles, GraduationCap, Atom, Dna } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { SearchBar } from '../../components/shared/SearchBar';

export default function LandingPage({ showCatalog: initialShowCatalog = false }: { showCatalog?: boolean }) {
  const { 
    classes, 
    courses, 
    setCurrentView, 
    addToast,
    setSelectedClassSlug,
    setSelectedCourseId,
    homepageConfig
  } = useApp();

  const [showCatalog, setShowCatalog] = useState(initialShowCatalog);

  useEffect(() => {
    setShowCatalog(initialShowCatalog);
  }, [initialShowCatalog]);

  const handleExploreCourse = (courseId: string) => {
    setSelectedCourseId(courseId);
    setCurrentView('course-view');
    addToast('Opening Course Details Catalog', 'success');
  };

  const selectClass = (slug: string) => {
    setSelectedClassSlug(slug);
    setCurrentView('class-view');
    addToast(`Loading ${slug.replace('-', ' ')} syllabus`, 'success');
  };

  return (
    <div className="space-y-16 py-8">
      
      {/* 1. HERO SECTION */}
      <section className="relative px-4 text-center max-w-4xl mx-auto space-y-6">
        
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight px-2 sm:px-0">
          {homepageConfig.heroTitle || "Achieve Top Rank in Boards & NEET (Biology & Chemistry) Exams"}
        </h1>
        
        <p className="text-base sm:text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed px-1">
          {homepageConfig.heroSubtitle || "Access high-yield handwritten PDF Notes, interactive conceptual quizzes, video lectures, and real-time gamified student leaderboards."}
        </p>

        {/* Global Search Bar */}
        <div className="max-w-2xl mx-auto pt-2">
          <SearchBar />
        </div>

        {/* Rapid stats overview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-4 pt-6 max-w-2xl mx-auto text-center border-t border-slate-100 dark:border-slate-800/80">
          <div className="px-3 py-2 sm:py-0">
            <p className="text-xl sm:text-2xl font-extrabold text-blue-600 dark:text-blue-400 leading-tight mb-1">Class 6–12</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Supported Standards</p>
          </div>
          <div className="border-y sm:border-y-0 sm:border-x border-slate-100 dark:border-slate-800 px-3 py-4 sm:py-0">
            <p className="text-xl sm:text-2xl font-extrabold text-emerald-500 leading-tight mb-1">Handwritten Notes</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Revision PDFs & Guides</p>
          </div>
          <div className="px-3 py-2 sm:py-0">
            <p className="text-xl sm:text-2xl font-extrabold text-amber-500 leading-tight mb-1">NEET (Biology & Chemistry)</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Curriculum Coaching</p>
          </div>
        </div>

        {/* Quiz Arena Card */}
        <div className="max-w-md mx-auto mb-6 p-5 border border-indigo-500/25 rounded-3xl bg-slate-900/60 dark:bg-slate-950/40 backdrop-blur-lg flex items-center justify-between shadow-xl cursor-pointer hover:border-indigo-500/40 transition-all hover:scale-[1.02] text-left"
             onClick={() => setCurrentView('quiz-dashboard')}>
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30 shadow-inner">
              <Sparkles className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                Live Quiz Arena
                <span className="text-[8px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded-md bg-indigo-600 text-white">CBT ACTIVE</span>
              </h3>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold mt-1">Challenge yourself, practice PYQs, and climb the student leaderboards!</p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-indigo-400 shrink-0" />
        </div>

        {/* Explore CTA buttons */}
        {!showCatalog && (
          <div className="flex justify-center pt-2 max-w-md mx-auto">
            <Button 
              variant="primary" 
              size="lg" 
              onClick={() => {
                setShowCatalog(true);
                setCurrentView('catalog');
              }}
              className="w-full sm:w-auto h-11 px-6 rounded-xl sm:rounded-2xl font-bold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all text-xs sm:text-sm"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Explore Syllabus Catalog
            </Button>
          </div>
        )}
      </section>

      {showCatalog && (
        <>
          {/* 2. ACADEMIC STANDARDS CARDS */}
          <section className="space-y-6 px-4 max-w-7xl mx-auto text-left">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                Select Your Academic Standard
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Pick your level to load high-relevance subject structures and revision sheets instantly.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {[
                {
                  title: 'Class 6–9',
                  description: 'Comprehensive subject notes, worksheets, and study guides for Class 6, 7, 8, and 9.',
                  slug: 'class-6-9',
                  icon: <GraduationCap className="w-5 h-5" />,
                  color: 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 border-blue-100 dark:border-blue-900/30'
                },
                {
                  title: 'Class 10',
                  description: 'Ace your Class 10 Board exams with handwritten revision sheets and solved keys.',
                  slug: 'class-10',
                  icon: <BookOpen className="w-5 h-5" />,
                  color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30'
                },
                {
                  title: 'Class 11–12 (Science)',
                  description: 'Advanced board-oriented study materials in Physics, Chemistry, and Biology.',
                  slug: 'class-11-12-science',
                  icon: <Atom className="w-5 h-5" />,
                  color: 'bg-cyan-50 text-cyan-600 dark:bg-cyan-950/40 dark:text-cyan-400 border-cyan-100 dark:border-cyan-900/30'
                },
                {
                  title: 'NEET (Biology & Chemistry)',
                  description: 'Rank-boosting Biology & Chemistry guides, diagram sets, and previous mock keys.',
                  slug: 'neet',
                  icon: <Dna className="w-5 h-5" />,
                  color: 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 border-amber-100 dark:border-amber-900/30'
                }
              ].map((card) => (
                <button
                  key={card.slug}
                  onClick={() => selectClass(card.slug)}
                  className="p-5 border border-slate-200/40 dark:border-slate-800/40 hover:border-blue-500/50 dark:hover:border-blue-500/50 rounded-2xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-lg text-left transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer group flex flex-col justify-between h-full"
                >
                  <div className="space-y-4">
                    <div className={`w-10 h-10 flex items-center justify-center rounded-xl border ${card.color} group-hover:scale-110 transition-transform duration-300`}>
                      {card.icon}
                    </div>
                    <div className="space-y-1.5">
                      <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {card.title}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
                        {card.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 mt-4 group-hover:translate-x-1 transition-transform duration-300">
                    <span>Explore Syllabus</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </button>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
