/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BookOpen, ArrowRight, ShieldCheck, Star, Users, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { SearchBar } from '../../components/shared/SearchBar';

export default function LandingPage() {
  const { 
    classes, 
    courses, 
    setCurrentView, 
    addToast,
    setSelectedClassSlug,
    setSelectedCourseId,
    homepageConfig
  } = useApp();

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
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/40 dark:bg-blue-950/30 text-xs font-bold animate-pulse">
          <Sparkles className="w-3.5 h-3.5" />
          <span>India's Premium Board & NEET LMS Engine</span>
        </div>
        
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
          {homepageConfig.heroTitle || "Achieve Top Rank in Boards & NEET Exams"}
        </h1>
        
        <p className="text-base sm:text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
          {homepageConfig.heroSubtitle || "Access high-yield handwritten PDF Notes, interactive conceptual quizzes, video lectures, and real-time gamified student leaderboards."}
        </p>

        {/* Global Search Bar */}
        <div className="max-w-2xl mx-auto pt-2">
          <SearchBar />
        </div>

        {/* Rapid stats overview */}
        <div className="grid grid-cols-3 gap-4 pt-6 max-w-xl mx-auto text-center border-t border-slate-100 dark:border-slate-800/80">
          <div>
            <p className="text-2xl font-extrabold text-blue-600 dark:text-blue-400">Class 6-12</p>
            <p className="text-xs text-slate-500 font-semibold uppercase">Supported</p>
          </div>
          <div className="border-x border-slate-100 dark:border-slate-800">
            <p className="text-2xl font-extrabold text-emerald-500">Handwritten</p>
            <p className="text-xs text-slate-500 font-semibold uppercase">Revision Notes</p>
          </div>
          <div>
            <p className="text-2xl font-extrabold text-amber-500">NEET Prep</p>
            <p className="text-xs text-slate-500 font-semibold uppercase">Curriculum</p>
          </div>
        </div>
      </section>

      {/* 2. CLASSES CAROUSEL SELECTOR */}
      <section className="space-y-6 px-4 max-w-7xl mx-auto text-left">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Select Your Academic Standard
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Pick your class to load high-relevance subject structures and revision sheets instantly.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {classes.map((c) => (
            <button
              key={c.id}
              onClick={() => selectClass(c.slug)}
              className="p-4 border border-slate-200 hover:border-blue-500/55 dark:border-slate-800 dark:hover:border-blue-500 rounded-2xl bg-white dark:bg-slate-950 text-center transition-all hover:shadow-md hover:-translate-y-0.5 cursor-pointer group"
            >
              <div className="mx-auto w-8 h-8 flex items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 mb-2.5 group-hover:scale-105 transition-transform">
                <BookOpen className="w-4.5 h-4.5" />
              </div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {c.name}
              </p>
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
          <Button variant="outline" size="sm" onClick={() => setCurrentView('home')} rightIcon={<ArrowRight className="w-4 h-4" />}>
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
                  NEET Specialty
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

      {/* 4. BRAND CREDENTIALS */}
      <section className="bg-slate-50 dark:bg-slate-950/50 border-y border-slate-200 dark:border-slate-800 py-12 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
          <div className="flex flex-col items-center md:items-start gap-4">
            <div className="h-12 w-12 rounded-2xl bg-blue-100 dark:bg-blue-950 text-blue-600 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">Direct Guard Auth</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Direct token logins without middle-tier databases ensuring maximum security.</p>
            </div>
          </div>
          <div className="flex flex-col items-center md:items-start gap-4">
            <div className="h-12 w-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
              <Star className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">Self-Testing Relational Quizzes</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Get immediate responses, explanations, timers and diagnostic reports instantly.</p>
            </div>
          </div>
          <div className="flex flex-col items-center md:items-start gap-4">
            <div className="h-12 w-12 rounded-2xl bg-amber-100 dark:bg-amber-950 text-amber-600 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">Razorpay Secure Integrations</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Fast, reliable gateway payments automatically granting premium keys post transaction.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
