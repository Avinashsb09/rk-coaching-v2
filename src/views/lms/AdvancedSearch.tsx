/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo } from 'react';
import { Search, SlidersHorizontal, BookOpen, GraduationCap, Sparkles, RefreshCcw, Eye, Lock, Award, ShieldAlert, ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

export default function AdvancedSearch() {
  const {
    courses,
    classes,
    subjects,
    chapters,
    lessons,
    setCurrentView,
    setSelectedCourseId,
    setGlobalSearch,
    addToast,
    hasCourseAccess
  } = useApp();

  // Search filter states
  const [keyword, setKeyword] = useState('');
  const [selectedClassId, setSelectedClassId] = useState('all');
  const [selectedSubjectId, setSelectedSubjectId] = useState('all');
  const [selectedTeacher, setSelectedTeacher] = useState('all');
  const [pricingFilter, setPricingFilter] = useState<'all' | 'free' | 'premium'>('all');

  // Unique list of teachers from courses
  const teachers = useMemo(() => {
    const list = new Set<string>();
    courses.forEach(c => {
      if (c.teacherName) list.add(c.teacherName);
    });
    return Array.from(list);
  }, [courses]);

  // Combined search filtering logic
  const filteredResults = useMemo(() => {
    return courses.filter(course => {
      // 1. Keyword search (matches course title, description, lessons)
      const matchesKeyword = !keyword ? true : (
        course.title.toLowerCase().includes(keyword.toLowerCase()) ||
        course.description.toLowerCase().includes(keyword.toLowerCase()) ||
        course.teacherName?.toLowerCase().includes(keyword.toLowerCase()) ||
        // chapters match
        chapters.some(ch => ch.subjectId === course.subjectId && ch.name.toLowerCase().includes(keyword.toLowerCase())) ||
        // lessons match
        lessons.some(l => {
          const courseChapters = chapters.filter(ch => ch.subjectId === course.subjectId).map(ch => ch.id);
          return courseChapters.includes(l.chapterId) && l.title.toLowerCase().includes(keyword.toLowerCase());
        })
      );

      // 2. Class filter
      const matchesClass = selectedClassId === 'all' ? true : (
        course.classId === selectedClassId
      );

      // 3. Subject filter
      const matchesSubject = selectedSubjectId === 'all' ? true : (
        course.subjectId === selectedSubjectId
      );

      // 4. Teacher filter
      const matchesTeacher = selectedTeacher === 'all' ? true : (
        course.teacherName === selectedTeacher
      );

      // 5. Pricing filter
      const matchesPricing = pricingFilter === 'all' ? true : (
        pricingFilter === 'free' ? !course.isPremium : course.isPremium
      );

      return matchesKeyword && matchesClass && matchesSubject && matchesTeacher && matchesPricing;
    });
  }, [courses, keyword, selectedClassId, selectedSubjectId, selectedTeacher, pricingFilter, chapters, lessons]);

  const handleClearFilters = () => {
    setKeyword('');
    setSelectedClassId('all');
    setSelectedSubjectId('all');
    setSelectedTeacher('all');
    setPricingFilter('all');
    addToast('Filters reset successfully', 'info');
  };

  const handleViewCourse = (courseId: string) => {
    setSelectedCourseId(courseId);
    setCurrentView('course-view');
  };

  return (
    <div className="space-y-8 py-4 text-left">
      {/* Title block */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Search className="w-6 h-6 text-blue-600" />
            Advanced Course Finder
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Search by class, subject, chapter syllabus, lessons, instructors and premium status.
          </p>
        </div>
        {/* Quick Reset */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleClearFilters}
          leftIcon={<RefreshCcw className="w-4 h-4" />}
          className="self-start md:self-center text-xs"
        >
          Reset All Filters
        </Button>
      </div>

      {/* Advanced Filters Card */}
      <Card className="border-slate-200/60 dark:border-slate-800/80 shadow-md">
        <CardContent className="p-6 space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800/60">
            <SlidersHorizontal className="w-4 h-4 text-blue-600" />
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-500">Syllabus Filters</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search Keyword */}
            <div className="space-y-1.5 lg:col-span-2">
              <label htmlFor="keyword-field" className="text-[10px] font-black uppercase text-slate-400">Search Course or Chapter</label>
              <div className="relative">
                <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  id="keyword-field"
                  type="text"
                  placeholder="e.g. Electrostatics, Calculus..."
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 dark:bg-slate-950 outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Class Standard Selector */}
            <div className="space-y-1.5">
              <label htmlFor="class-select-field" className="text-[10px] font-black uppercase text-slate-400">Standard Class</label>
              <select
                id="class-select-field"
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 dark:bg-slate-950 outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="all">All Classes</option>
                {classes.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Subject Selector */}
            <div className="space-y-1.5">
              <label htmlFor="subject-select-field" className="text-[10px] font-black uppercase text-slate-400">Subject Field</label>
              <select
                id="subject-select-field"
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 dark:bg-slate-950 outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="all">All Subjects</option>
                {subjects.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            {/* Teacher Selector */}
            <div className="space-y-1.5">
              <label htmlFor="teacher-select-field" className="text-[10px] font-black uppercase text-slate-400">Instructor Coach</label>
              <select
                id="teacher-select-field"
                value={selectedTeacher}
                onChange={(e) => setSelectedTeacher(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 dark:bg-slate-950 outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="all">All Instructors</option>
                {teachers.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Pricing Access Toggle */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-100 dark:border-slate-800/60">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase text-slate-400">Content Access Level:</span>
              <div className="inline-flex rounded-xl p-1 bg-slate-100 dark:bg-slate-950">
                <button
                  onClick={() => setPricingFilter('all')}
                  className={`px-3 py-1 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                    pricingFilter === 'all' ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setPricingFilter('free')}
                  className={`px-3 py-1 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                    pricingFilter === 'free' ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Free Modules
                </button>
                <button
                  onClick={() => setPricingFilter('premium')}
                  className={`px-3 py-1 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                    pricingFilter === 'premium' ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Premium Only
                </button>
              </div>
            </div>

            <div className="text-xs text-slate-400 font-semibold">
              Found <span className="font-extrabold text-blue-600">{filteredResults.length}</span> matching courses
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grid of Course results */}
      {filteredResults.length === 0 ? (
        <div className="py-16 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl space-y-3">
          <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
          <div>
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-400">No Courses Match Filters</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">Try typing a different chapter name or resetting the class selectors to explore the standard LMS catalog.</p>
          </div>
          <Button variant="outline" size="sm" onClick={handleClearFilters} className="mt-2 text-xs">
            Reset Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResults.map((course) => {
            const isUnlocked = hasCourseAccess(course.id);
            return (
              <Card key={course.id} className="group relative overflow-hidden flex flex-col hover:border-blue-500/50 hover:shadow-lg transition-all duration-300">
                <div className="h-44 w-full bg-slate-100 overflow-hidden relative">
                  <img
                    src={course.thumbnailUrl}
                    alt={course.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Top-right premium badge */}
                  <div className="absolute top-3.5 right-3.5 flex items-center gap-1.5">
                    {course.isPremium ? (
                      <Badge variant="warning" className="bg-amber-500 text-white font-extrabold flex items-center gap-1">
                        <Lock className="w-3 h-3" />
                        Premium
                      </Badge>
                    ) : (
                      <Badge variant="success" className="bg-emerald-600 text-white font-extrabold flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        Free Access
                      </Badge>
                    )}
                  </div>
                </div>

                <CardContent className="p-5 flex-1 flex flex-col justify-between text-left space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-black uppercase text-blue-600 tracking-wider">
                        {classes.find(c => c.id === course.classId)?.name || 'Class Standard'}
                      </span>
                      <span className="text-[10px] font-black uppercase text-purple-600 tracking-wider">
                        {subjects.find(s => s.id === course.subjectId)?.name || 'Subject'}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-blue-600 transition-colors">
                      {course.title}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {course.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Instructor Coach</p>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">{course.teacherName || 'Prof. Rajesh Khanna'}</p>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewCourse(course.id)}
                      className="text-xs text-blue-600 dark:text-blue-400 font-bold group"
                      rightIcon={<ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                    >
                      {isUnlocked ? 'Start Learning' : 'Enroll & Pay'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
