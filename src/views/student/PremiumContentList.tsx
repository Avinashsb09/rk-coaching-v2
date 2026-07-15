/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { usePayments } from '../../context/PaymentContext';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { 
  FileText, 
  Play, 
  ChevronRight, 
  Clock, 
  ArrowLeft,
  BookOpen
} from 'lucide-react';

export default function PremiumContentList() {
  const {
    subjects,
    chapters,
    lessons,
    notes,
    videos,
    setCurrentView,
    setBreadcrumbs,
    selectedPremiumSubjectId,
    selectedPremiumContentType,
    setSelectedPremiumContentId,
    hasSubjectNotesAccess: contextHasSubjectNotesAccess
  } = useApp();

  const { hasSubjectAccess } = usePayments();

  const subjectObj = useMemo(() => {
    return subjects.find(s => s.id === selectedPremiumSubjectId);
  }, [subjects, selectedPremiumSubjectId]);

  const contentType = selectedPremiumContentType || 'notes';

  // 1. Sync dynamic breadcrumbs
  useEffect(() => {
    if (subjectObj) {
      setBreadcrumbs([
        { label: 'My Premium Materials', view: 'premium-materials' },
        { label: contentType === 'notes' ? 'Notes' : 'Videos' },
        { label: subjectObj.name }
      ]);
    }
  }, [subjectObj, contentType, setBreadcrumbs]);

  // Check access based on contentType
  const hasAccess = useMemo(() => {
    if (!selectedPremiumSubjectId) return false;
    return contentType === 'notes'
      ? contextHasSubjectNotesAccess(selectedPremiumSubjectId)
      : hasSubjectAccess(selectedPremiumSubjectId);
  }, [selectedPremiumSubjectId, contentType, contextHasSubjectNotesAccess, hasSubjectAccess]);

  // 2. Resolve chapters for this subject
  const subjectChapters = useMemo(() => {
    if (!selectedPremiumSubjectId) return [];
    return chapters
      .filter(c => c.subjectId === selectedPremiumSubjectId)
      .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
  }, [chapters, selectedPremiumSubjectId]);

  // 3. Resolve notes grouped by chapter
  const chaptersWithNotes = useMemo(() => {
    if (contentType !== 'notes' || !hasAccess) return [];
    return subjectChapters.map(ch => {
      const chLessons = lessons.filter(l => l.chapterId === ch.id);
      const chNotes = notes.filter(n => {
        if (!n.isPremium) return false;
        // Resolve subject notes belonging to this chapter's lessons
        return n.lessonId && chLessons.some(l => l.id === n.lessonId);
      }).sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

      return {
        chapter: ch,
        items: chNotes
      };
    }).filter(group => group.items.length > 0);
  }, [contentType, subjectChapters, lessons, notes, hasAccess]);

  // 4. Resolve videos grouped by chapter
  const chaptersWithVideos = useMemo(() => {
    if (contentType !== 'videos' || !hasAccess) return [];
    return subjectChapters.map(ch => {
      const chLessons = lessons.filter(l => l.chapterId === ch.id);
      const chVideos = videos.filter(v => {
        if (!v.isPremium) return false;
        return chLessons.some(l => l.id === v.lessonId);
      }).sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

      return {
        chapter: ch,
        items: chVideos
      };
    }).filter(group => group.items.length > 0);
  }, [contentType, subjectChapters, lessons, videos, hasAccess]);

  const handleBackToLibrary = () => {
    setCurrentView('premium-materials');
  };

  const handleOpenNote = (noteId: string) => {
    setSelectedPremiumContentId(noteId);
    setCurrentView('premium-note-view');
  };

  const handleWatchVideo = (videoId: string) => {
    setSelectedPremiumContentId(videoId);
    setCurrentView('premium-video-view');
  };

  if (!subjectObj || !hasAccess) {
    return (
      <div className="py-12 text-center max-w-md mx-auto px-4">
        <Card className="p-8 border-slate-200 dark:border-slate-800">
          <BookOpen className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Premium material unavailable</h3>
          <p className="text-xs text-slate-500 mt-2 mb-6">
            This subject study collection is not active in your purchased library.
          </p>
          <Button variant="primary" className="w-full h-[44px]" onClick={handleBackToLibrary}>
            Back to My Premium Materials
          </Button>
        </Card>
      </div>
    );
  }

  const hasContent = contentType === 'notes' 
    ? chaptersWithNotes.length > 0 
    : chaptersWithVideos.length > 0;

  return (
    <div className="space-y-6 py-4 text-left animate-fade-in px-4">
      {/* Back Button desktop header */}
      <div className="flex items-center gap-3">
        <button 
          onClick={handleBackToLibrary}
          className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200/50 text-slate-500 hover:text-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800 dark:border-slate-800 cursor-pointer transition-colors"
          title="Back to My Premium Materials"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-tight">
            {subjectObj.name} Premium {contentType === 'notes' ? 'Notes' : 'Videos'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {contentType === 'notes' 
              ? `Your purchased chapter-wise ${subjectObj.name} study materials.` 
              : `Your purchased ${subjectObj.name} video lectures.`}
          </p>
        </div>
      </div>

      {/* Content listing grouped by chapter */}
      {!hasContent ? (
        <Card className="p-8 text-center max-w-sm mx-auto border-slate-200 dark:border-slate-800">
          <FileText className="w-10 h-10 text-slate-400 mx-auto mb-2" />
          <h4 className="text-sm font-extrabold text-slate-800 dark:text-white">
            No premium {contentType} available
          </h4>
          <p className="text-xs text-slate-500 mt-1 mb-6">
            There are no purchased premium {contentType} items currently published for this subject.
          </p>
          <Button variant="outline" size="sm" className="h-[44px]" onClick={handleBackToLibrary}>
            Back to Library
          </Button>
        </Card>
      ) : (
        <div className="space-y-8">
          {contentType === 'notes' ? (
            chaptersWithNotes.map(group => (
              <div key={group.chapter.id} className="space-y-4">
                <div className="border-l-4 border-blue-500 pl-3">
                  <h3 className="text-xs font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider">
                    Chapter {group.chapter.orderIndex || 1}
                  </h3>
                  <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white leading-snug">
                    {group.chapter.name}
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {group.items.map(note => (
                    <div
                      key={note.id}
                      tabIndex={0}
                      onClick={() => handleOpenNote(note.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleOpenNote(note.id);
                        }
                      }}
                      className="group border border-slate-200/80 dark:border-slate-800/80 rounded-xl p-5 bg-white dark:bg-slate-950 flex flex-col justify-between min-h-[160px] text-left cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <div className="space-y-3.5">
                        <div className="flex items-center justify-between">
                          <div className="h-8 w-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center border border-blue-500/20">
                            <FileText className="w-4 h-4" />
                          </div>
                          <Badge className="text-[8px] font-black uppercase bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                            Purchased
                          </Badge>
                        </div>

                        <div>
                          <h4 className="text-xs font-black text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-tight">
                            {note.title}
                          </h4>
                          <p className="text-[10px] text-slate-450 dark:text-slate-500 mt-1.5">
                            PDF Document • {Math.round(note.sizeBytes / 12000) || 12} pages
                          </p>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-50 dark:border-slate-900/60 mt-3 flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-450 dark:text-slate-500">Document ready</span>
                        <button
                          type="button"
                          className="text-[11px] font-black text-blue-600 dark:text-blue-400 flex items-center gap-1 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors"
                        >
                          <span>Open Notes</span>
                          <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            chaptersWithVideos.map(group => (
              <div key={group.chapter.id} className="space-y-4">
                <div className="border-l-4 border-indigo-500 pl-3">
                  <h3 className="text-xs font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider">
                    Chapter {group.chapter.orderIndex || 1}
                  </h3>
                  <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white leading-snug">
                    {group.chapter.name}
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {group.items.map(video => (
                    <div
                      key={video.id}
                      tabIndex={0}
                      onClick={() => handleWatchVideo(video.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleWatchVideo(video.id);
                        }
                      }}
                      className="group border border-slate-200/80 dark:border-slate-800/80 rounded-xl p-5 bg-white dark:bg-slate-950 flex flex-col justify-between min-h-[160px] text-left cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <div className="space-y-3.5">
                        <div className="flex items-center justify-between">
                          <div className="h-8 w-8 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center border border-indigo-500/20">
                            <Play className="w-4 h-4 fill-current translate-x-0.5" />
                          </div>
                          <Badge className="text-[8px] font-black uppercase bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                            Purchased
                          </Badge>
                        </div>

                        <div>
                          <h4 className="text-xs font-black text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-tight">
                            {video.title}
                          </h4>
                          <p className="text-[10px] text-slate-450 dark:text-slate-500 mt-1.5 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" /> Video Lecture • {Math.round(video.durationSeconds / 60)} mins
                          </p>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-50 dark:border-slate-900/60 mt-3 flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-450 dark:text-slate-500">Lecture ready</span>
                        <button
                          type="button"
                          className="text-[11px] font-black text-indigo-600 dark:text-indigo-400 flex items-center gap-1 group-hover:text-indigo-700 dark:group-hover:text-indigo-300 transition-colors"
                        >
                          <span>Watch Video</span>
                          <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

    </div>
  );
}
