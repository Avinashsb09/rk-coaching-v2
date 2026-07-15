/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { usePayments } from '../../context/PaymentContext';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { 
  FolderLock, 
  FileText, 
  Play, 
  Tv, 
  Sparkles, 
  BookOpen, 
  Clock, 
  ChevronRight, 
  ArrowRight,
  Library
} from 'lucide-react';

export default function PremiumMaterials() {
  const {
    subjects,
    chapters,
    lessons,
    videos,
    notes,
    classes,
    setCurrentView,
    setSelectedLessonId,
    setSelectedCourseId,
    setBreadcrumbSource,
    setLessonActiveTab
  } = useApp();

  const { hasSubjectAccess } = usePayments();
  const [activeSection, setActiveSection] = useState<'notes' | 'videos'>('notes');

  // 1. Resolve and filter purchased premium notes
  const purchasedNotes = useMemo(() => {
    return notes.filter(n => {
      if (!n.isPremium) return false;
      let subjectId = n.subjectId;
      if (!subjectId && n.lessonId) {
        const lesson = lessons.find(l => l.id === n.lessonId);
        const chapter = chapters.find(c => c.id === lesson?.chapterId);
        subjectId = chapter?.subjectId || null;
      }
      if (!subjectId) return false;
      return hasSubjectAccess(subjectId);
    });
  }, [notes, lessons, chapters, hasSubjectAccess]);

  // 2. Resolve and filter purchased premium videos
  const purchasedVideos = useMemo(() => {
    return videos.filter(v => {
      if (!v.isPremium) return false;
      let subjectId = v.subjectId;
      if (!subjectId && v.lessonId) {
        const lesson = lessons.find(l => l.id === v.lessonId);
        const chapter = chapters.find(c => c.id === lesson?.chapterId);
        subjectId = chapter?.subjectId || null;
      }
      if (!subjectId) return false;
      return hasSubjectAccess(subjectId);
    });
  }, [videos, lessons, chapters, hasSubjectAccess]);

  // Class priorities map for sorting
  const classPriorityMap = useMemo(() => {
    const map: Record<string, number> = {};
    classes.forEach(c => {
      map[c.id] = c.priority || 99;
    });
    return map;
  }, [classes]);

  // 3. Sort Notes: Class -> Subject -> Chapter -> Lesson
  const sortedNotes = useMemo(() => {
    return [...purchasedNotes].sort((a, b) => {
      const lessonA = lessons.find(l => l.id === a.lessonId);
      const chapterA = chapters.find(c => c.id === lessonA?.chapterId);
      const subjectA = subjects.find(s => s.id === chapterA?.subjectId);

      const lessonB = lessons.find(l => l.id === b.lessonId);
      const chapterB = chapters.find(c => c.id === lessonB?.chapterId);
      const subjectB = subjects.find(s => s.id === chapterB?.subjectId);

      const priorityA = classPriorityMap[subjectA?.classId || ''] || 99;
      const priorityB = classPriorityMap[subjectB?.classId || ''] || 99;
      if (priorityA !== priorityB) return priorityA - priorityB;

      const nameA = subjectA?.name || '';
      const nameB = subjectB?.name || '';
      if (nameA !== nameB) return nameA.localeCompare(nameB);

      const chapIndexA = chapterA?.orderIndex || 0;
      const chapIndexB = chapterB?.orderIndex || 0;
      if (chapIndexA !== chapIndexB) return chapIndexA - chapIndexB;

      const lessonIndexA = lessonA?.orderIndex || 0;
      const lessonIndexB = lessonB?.orderIndex || 0;
      return lessonIndexA - lessonIndexB;
    });
  }, [purchasedNotes, lessons, chapters, subjects, classPriorityMap]);

  // 4. Sort Videos: Class -> Subject -> Chapter -> Lesson
  const sortedVideos = useMemo(() => {
    return [...purchasedVideos].sort((a, b) => {
      const lessonA = lessons.find(l => l.id === a.lessonId);
      const chapterA = chapters.find(c => c.id === lessonA?.chapterId);
      const subjectA = subjects.find(s => s.id === chapterA?.subjectId);

      const lessonB = lessons.find(l => l.id === b.lessonId);
      const chapterB = chapters.find(c => c.id === lessonB?.chapterId);
      const subjectB = subjects.find(s => s.id === chapterB?.subjectId);

      const priorityA = classPriorityMap[subjectA?.classId || ''] || 99;
      const priorityB = classPriorityMap[subjectB?.classId || ''] || 99;
      if (priorityA !== priorityB) return priorityA - priorityB;

      const nameA = subjectA?.name || '';
      const nameB = subjectB?.name || '';
      if (nameA !== nameB) return nameA.localeCompare(nameB);

      const chapIndexA = chapterA?.orderIndex || 0;
      const chapIndexB = chapterB?.orderIndex || 0;
      if (chapIndexA !== chapIndexB) return chapIndexA - chapIndexB;

      const lessonIndexA = lessonA?.orderIndex || 0;
      const lessonIndexB = lessonB?.orderIndex || 0;
      return lessonIndexA - lessonIndexB;
    });
  }, [purchasedVideos, lessons, chapters, subjects, classPriorityMap]);

  // Count unique subjects represented in purchased materials
  const uniqueSubjectsCount = useMemo(() => {
    const subjectIds = new Set<string>();
    
    purchasedNotes.forEach(n => {
      let subjectId = n.subjectId;
      if (!subjectId && n.lessonId) {
        const lesson = lessons.find(l => l.id === n.lessonId);
        const chapter = chapters.find(c => c.id === lesson?.chapterId);
        subjectId = chapter?.subjectId || null;
      }
      if (subjectId) subjectIds.add(subjectId);
    });

    purchasedVideos.forEach(v => {
      let subjectId = v.subjectId;
      if (!subjectId && v.lessonId) {
        const lesson = lessons.find(l => l.id === v.lessonId);
        const chapter = chapters.find(c => c.id === lesson?.chapterId);
        subjectId = chapter?.subjectId || null;
      }
      if (subjectId) subjectIds.add(subjectId);
    });

    return subjectIds.size;
  }, [purchasedNotes, purchasedVideos, lessons, chapters]);

  // Navigate to target lesson view with specific tab highlighted
  const handleOpenMaterial = (lessonId: string, courseId: string, tab: 'notes' | 'video') => {
    setBreadcrumbSource('premium');
    setLessonActiveTab(tab);
    setSelectedLessonId(lessonId);
    setSelectedCourseId(courseId);
    setCurrentView('lesson-view');
  };

  const hasAnyMaterials = sortedNotes.length > 0 || sortedVideos.length > 0;

  return (
    <div className="space-y-6 py-4 text-left animate-fade-in">
      
      {/* 1. Page Header Block */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/50 dark:border-slate-800/40 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              My Premium Materials
            </h1>
            <Badge variant="warning" className="text-[9px] uppercase font-black tracking-wider px-2 py-0.5 bg-amber-500/10 text-amber-500 border border-amber-500/20">
              Premium Library
            </Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Access all the premium notes and videos you have purchased in one place.
          </p>
        </div>
      </div>

      {/* 2. Material Summary Cards */}
      {hasAnyMaterials && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="bg-slate-50/50 dark:bg-slate-900/25 border-slate-200/60 dark:border-slate-800/50 p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center border border-blue-500/20">
                <FileText className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Premium Notes</p>
                <p className="text-lg font-black text-slate-900 dark:text-white">{purchasedNotes.length} Items</p>
              </div>
            </div>
          </Card>

          <Card className="bg-slate-50/50 dark:bg-slate-900/25 border-slate-200/60 dark:border-slate-800/50 p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center border border-indigo-500/20">
                <Play className="w-5 h-5 fill-current" />
              </div>
              <div className="text-left">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Premium Videos</p>
                <p className="text-lg font-black text-slate-900 dark:text-white">{purchasedVideos.length} Items</p>
              </div>
            </div>
          </Card>

          <Card className="bg-slate-50/50 dark:bg-slate-900/25 border-slate-200/60 dark:border-slate-800/50 p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20">
                <BookOpen className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Subjects</p>
                <p className="text-lg font-black text-slate-900 dark:text-white">{uniqueSubjectsCount} Subjects</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* 3. Empty Library State */}
      {!hasAnyMaterials ? (
        <Card glassmorphism className="p-8 text-center max-w-md mx-auto border-dashed border-slate-350 dark:border-slate-800">
          <div className="h-14 w-14 rounded-full bg-slate-100 dark:bg-slate-900 text-slate-400 dark:text-slate-500 flex items-center justify-center mx-auto mb-4 border border-slate-200 dark:border-slate-800">
            <FolderLock className="w-6 h-6" />
          </div>
          <h3 className="text-base font-extrabold text-slate-950 dark:text-white">Your premium library is empty</h3>
          <p className="text-xs text-slate-500 mt-2 mb-5 leading-relaxed">
            Premium notes and videos you purchase will appear here. Start by exploring our board and prep courses.
          </p>
          <Button 
            variant="primary" 
            size="sm" 
            onClick={() => setCurrentView('catalog')}
            rightIcon={<ArrowRight className="w-4 h-4" />}
            className="text-xs font-bold px-6"
          >
            Explore Courses
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Section Selector Tab Controllers */}
          <div className="flex border-b border-slate-200 dark:border-slate-800 gap-2">
            <button
              onClick={() => setActiveSection('notes')}
              className={`pb-2.5 px-4 text-xs font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
                activeSection === 'notes'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-slate-400 hover:text-slate-650'
              }`}
            >
              Notes ({sortedNotes.length})
            </button>
            <button
              onClick={() => setActiveSection('videos')}
              className={`pb-2.5 px-4 text-xs font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
                activeSection === 'videos'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-slate-400 hover:text-slate-650'
              }`}
            >
              Videos ({sortedVideos.length})
            </button>
          </div>

          {/* Section A: Premium Notes list */}
          {activeSection === 'notes' && (
            sortedNotes.length === 0 ? (
              <Card className="p-6 text-center max-w-sm mx-auto border-slate-200 dark:border-slate-800">
                <FileText className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                <h4 className="text-sm font-extrabold text-slate-800 dark:text-white">No premium notes yet</h4>
                <p className="text-xs text-slate-400 mt-1 mb-4">Your purchased premium notes will appear here.</p>
                <Button variant="outline" size="sm" onClick={() => setCurrentView('catalog')}>
                  Explore Courses
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {sortedNotes.map(note => {
                  const lesson = lessons.find(l => l.id === note.lessonId);
                  const chapter = chapters.find(c => c.id === lesson?.chapterId);
                  const subject = subjects.find(s => s.id === chapter?.subjectId);
                  const cls = classes.find(c => c.id === subject?.classId);

                  return (
                    <div
                      key={note.id}
                      tabIndex={0}
                      onClick={() => handleOpenMaterial(note.lessonId || '', lesson?.courseId || '', 'notes')}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleOpenMaterial(note.lessonId || '', lesson?.courseId || '', 'notes');
                        }
                      }}
                      className="group border border-slate-200/80 dark:border-slate-800/80 rounded-xl p-5 bg-white dark:bg-slate-950 flex flex-col justify-between min-h-[170px] text-left cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <div className="space-y-3.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400">
                            {cls?.name || 'Standard'}
                          </span>
                          <span className="text-[8px] font-black uppercase text-amber-500 flex items-center gap-1">
                            <Sparkles className="w-2.5 h-2.5 fill-current" /> Premium Notes
                          </span>
                        </div>

                        <div>
                          <h4 className="text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-wide">
                            {subject?.name || 'Subject'}
                          </h4>
                          <p className="text-[11px] font-extrabold text-slate-700 dark:text-slate-350 leading-tight mt-0.5">
                            {chapter?.name || 'Chapter'}
                          </p>
                          <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 mt-2 truncate">
                            {note.title}
                          </p>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-50 dark:border-slate-900/60 mt-3 flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-400">Status: Active</span>
                        <button
                          type="button"
                          className="text-[11px] font-black text-blue-600 dark:text-blue-400 flex items-center gap-1 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors"
                        >
                          <span>Open Notes</span>
                          <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          )}

          {/* Section B: Premium Videos list */}
          {activeSection === 'videos' && (
            sortedVideos.length === 0 ? (
              <Card className="p-6 text-center max-w-sm mx-auto border-slate-200 dark:border-slate-800">
                <Tv className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                <h4 className="text-sm font-extrabold text-slate-800 dark:text-white">No premium videos yet</h4>
                <p className="text-xs text-slate-400 mt-1 mb-4">Your purchased premium videos will appear here.</p>
                <Button variant="outline" size="sm" onClick={() => setCurrentView('catalog')}>
                  Explore Courses
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {sortedVideos.map(video => {
                  const lesson = lessons.find(l => l.id === video.lessonId);
                  const chapter = chapters.find(c => c.id === lesson?.chapterId);
                  const subject = subjects.find(s => s.id === chapter?.subjectId);
                  const cls = classes.find(c => c.id === subject?.classId);

                  return (
                    <div
                      key={video.id}
                      tabIndex={0}
                      onClick={() => handleOpenMaterial(video.lessonId, lesson?.courseId || '', 'video')}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleOpenMaterial(video.lessonId, lesson?.courseId || '', 'video');
                        }
                      }}
                      className="group border border-slate-200/80 dark:border-slate-800/80 rounded-xl p-5 bg-white dark:bg-slate-950 flex flex-col justify-between min-h-[170px] text-left cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <div className="space-y-3.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400">
                            {cls?.name || 'Standard'}
                          </span>
                          <span className="text-[8px] font-black uppercase text-amber-500 flex items-center gap-1">
                            <Sparkles className="w-2.5 h-2.5 fill-current" /> Premium Video
                          </span>
                        </div>

                        <div>
                          <h4 className="text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-wide">
                            {subject?.name || 'Subject'}
                          </h4>
                          <p className="text-[11px] font-extrabold text-slate-700 dark:text-slate-350 leading-tight mt-0.5">
                            {chapter?.name || 'Chapter'}
                          </p>
                          <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 mt-2 truncate">
                            {video.title}
                          </p>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-50 dark:border-slate-900/60 mt-3 flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {Math.round(video.durationSeconds / 60)} mins
                        </span>
                        <button
                          type="button"
                          className="text-[11px] font-black text-blue-600 dark:text-blue-400 flex items-center gap-1 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors"
                        >
                          <span>Watch Video</span>
                          <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          )}
        </div>
      )}

    </div>
  );
}
