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
                  title: 'Class 6',
                  description: 'Comprehensive subject notes, worksheets, and study guides for Class 6.',
                  slug: 'class-6',
                  icon: <GraduationCap className="w-5 h-5" />,
                  color: 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 border-blue-100 dark:border-blue-900/30'
                },
                {
                  title: 'Class 7',
                  description: 'Structured mathematical formulas and foundational science revisions for Class 7.',
                  slug: 'class-7',
                  icon: <GraduationCap className="w-5 h-5" />,
                  color: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/30'
                },
                {
                  title: 'Class 8',
                  description: 'High-relevance chapter notes, homework aids, and key textbook solutions for Class 8.',
                  slug: 'class-8',
                  icon: <GraduationCap className="w-5 h-5" />,
                  color: 'bg-violet-50 text-violet-600 dark:bg-violet-950/40 dark:text-violet-400 border-violet-100 dark:border-violet-900/30'
                },
                {
                  title: 'Class 9',
                  description: 'Core CBSE board preparation strategies and essential notes for Class 9 pupils.',
                  slug: 'class-9',
                  icon: <GraduationCap className="w-5 h-5" />,
                  color: 'bg-teal-50 text-teal-600 dark:bg-teal-950/40 dark:text-teal-400 border-teal-100 dark:border-teal-900/30'
                },
                {
                  title: 'Class 10',
                  description: 'Ace your Class 10 Board exams with handwritten revision sheets and solved keys.',
                  slug: 'class-10',
                  icon: <BookOpen className="w-5 h-5" />,
                  color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30'
                },
                {
                  title: 'Class 11 (Science)',
                  description: 'Advanced board-oriented study materials in Physics, Chemistry, and Biology.',
                  slug: 'class-11-science',
                  icon: <Atom className="w-5 h-5" />,
                  color: 'bg-cyan-50 text-cyan-600 dark:bg-cyan-950/40 dark:text-cyan-400 border-cyan-100 dark:border-cyan-900/30'
                },
                {
                  title: 'Class 12 (Science)',
                  description: 'Full-syllabus formula decks, boards prep questions, and final revisions.',
                  slug: 'class-12-science',
                  icon: <Atom className="w-5 h-5" />,
                  color: 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 border-rose-100 dark:border-rose-900/30'
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

          {/* 3. FEATURED COURSES DIRECTORY */}
          <section className="space-y-6 px-4 max-w-7xl mx-auto text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Trending Preparation Modules
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Handpicked courses featuring handwritten revisions, sample board templates, and expert mock tests.
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setCurrentView('catalog')} rightIcon={<ArrowRight className="w-4 h-4" />}>
                View Full Catalog
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {courses.map((course) => (
                <Card key={course.id} hoverEffect>
                  <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
                    <img src={course.thumbnailUrl} alt={course.title} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                    <div className="absolute top-3 right-3">
                      <Badge variant={course.isPremium ? 'warning' : 'success'}>
                        {course.isPremium ? 'PREMIUM (RZP)' : '100% FREE'}
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="space-y-3.5">
                    <span className="text-[10px] uppercase font-extrabold tracking-widest text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2.5 py-1 rounded-md">
                      {course.classId === 'neet' ? 'NEET (Biology & Chemistry) Specialty' : 'CBSE Boards'}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug line-clamp-1">
                      {course.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {course.subtitle}
                    </p>
                    <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80 pt-3.5">
                      <div>
                        {course.isPremium ? (
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-sm font-extrabold text-slate-900 dark:text-white">₹{course.discountPrice}</span>
                            <span className="text-[10px] text-slate-400 line-through">₹{course.price}</span>
                          </div>
                        ) : (
                          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">FREE NOTEBOOK</span>
                        )}
                      </div>
                      <Button variant="primary" size="sm" onClick={() => handleExploreCourse(course.id)}>
                        Explore Course
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
