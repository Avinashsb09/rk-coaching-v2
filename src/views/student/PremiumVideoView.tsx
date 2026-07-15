/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { 
  Play, 
  ArrowLeft, 
  Sparkles, 
  AlertTriangle, 
  Clock, 
  CheckCircle, 
  Bookmark,
  FileText,
  ChevronRight
} from 'lucide-react';

export default function PremiumVideoView() {
  const {
    videos,
    notes,
    subjects,
    chapters,
    lessons,
    setCurrentView,
    setBreadcrumbs,
    selectedPremiumContentId,
    selectedPremiumSubjectId,
    setSelectedPremiumContentId,
    setSelectedPremiumContentType,
    addToast,
    saveProgress,
    getLessonProgress,
    isBookmarked,
    addBookmark,
    removeBookmark,
    user
  } = useApp();

  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [isPlaying, setIsPlaying] = useState(false);

  // Find video by selectedPremiumContentId (Videos context)
  const videoObj = useMemo(() => {
    if (!selectedPremiumContentId) return null;
    return videos.find(v => v.id === selectedPremiumContentId);
  }, [videos, selectedPremiumContentId]);

  // Resolve chapter and subject relations
  const { chapterObj, subjectObj } = useMemo(() => {
    if (!videoObj) return { chapterObj: null, subjectObj: null };
    
    let chap = null;
    let sub = null;

    if (videoObj.lessonId) {
      const lesson = lessons.find(l => l.id === videoObj.lessonId);
      if (lesson) {
        chap = chapters.find(c => c.id === lesson.chapterId) || null;
      }
    }

    if (!chap && videoObj.chapterId) {
      chap = chapters.find(c => c.id === videoObj.chapterId) || null;
    }

    if (chap) {
      sub = subjects.find(s => s.id === chap.subjectId) || null;
    } else if (videoObj.subjectId) {
      sub = subjects.find(s => s.id === videoObj.subjectId) || null;
    }

    return { chapterObj: chap, subjectObj: sub };
  }, [videoObj, chapters, subjects, lessons]);

  // Sync breadcrumbs dynamically
  useEffect(() => {
    if (videoObj && subjectObj && chapterObj) {
      setBreadcrumbs([
        { label: 'My Premium Materials', view: 'premium-materials' },
        { label: 'Videos' },
        { label: subjectObj.name, view: 'premium-content-list' },
        { label: chapterObj.name },
        { label: videoObj.title }
      ]);
    }
  }, [videoObj, subjectObj, chapterObj, setBreadcrumbs]);

  // Resolve related premium notes in the same lesson
  const relatedNote = useMemo(() => {
    if (!videoObj) return null;
    return notes.find(n => n.lessonId === videoObj.lessonId && n.isPremium);
  }, [notes, videoObj]);

  const handleBackToList = () => {
    setCurrentView('premium-content-list');
  };

  const handleBackToLibrary = () => {
    setCurrentView('premium-materials');
  };

  // Progress complete action handler
  const lessonProgress = useMemo(() => {
    if (!videoObj) return null;
    return getLessonProgress(videoObj.lessonId);
  }, [videoObj, getLessonProgress]);

  const isCompleted = lessonProgress?.isCompleted || false;

  const handleToggleComplete = () => {
    if (!user) {
      addToast('Please log in to track study progress.', 'warning');
      return;
    }
    if (!videoObj) return;

    const targetStatus = !isCompleted;
    saveProgress(
      videoObj.subjectId || '',
      videoObj.lessonId,
      targetStatus ? 100 : 0,
      targetStatus,
      0
    );
    addToast(targetStatus ? 'Lecture marked as Completed! XP Added!' : 'Progress reset.', 'success');
  };

  // Bookmark action handler
  const bookmarked = useMemo(() => {
    if (!videoObj) return false;
    return isBookmarked('lesson', videoObj.lessonId);
  }, [videoObj, isBookmarked]);

  const handleBookmarkToggle = () => {
    if (!videoObj) return;
    if (bookmarked) {
      removeBookmark('lesson', videoObj.lessonId);
    } else {
      addBookmark('lesson', videoObj.lessonId, videoObj.title);
    }
  };

  const handleOpenRelatedNotes = () => {
    if (relatedNote) {
      setSelectedPremiumContentId(relatedNote.id);
      setSelectedPremiumContentType('notes');
      setCurrentView('premium-note-view');
    }
  };

  // Check if video source is known to be broken
  const isBrokenSource = useMemo(() => {
    if (!videoObj) return true;
    const brokenIds = ['sfSId8A98y8', 'h7gh96X69Gs'];
    return brokenIds.includes(videoObj.videoIdOrUrl) || !videoObj.videoIdOrUrl;
  }, [videoObj]);

  // Video embed url generator
  const getVideoEmbedUrl = () => {
    if (!videoObj) return '';
    const urlOrId = videoObj.videoIdOrUrl;
    
    if (videoObj.provider === 'youtube') {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
      const match = urlOrId.match(regExp);
      const yId = (match && match[2].length === 11) ? match[2] : urlOrId;
      return `https://www.youtube.com/embed/${yId}?autoplay=1&rel=0&showinfo=0&mute=0&controls=1`;
    }
    if (videoObj.provider === 'vimeo') {
      return `https://player.vimeo.com/video/${urlOrId}?autoplay=1&badge=0&byline=0&portrait=0`;
    }
    if (videoObj.provider === 'gdrive') {
      return urlOrId.includes('preview') 
        ? urlOrId 
        : urlOrId.replace('/view', '/preview');
    }
    return urlOrId;
  };

  // 1. Recovery state if missing video, subject, or chapter relationship
  if (!videoObj || !subjectObj || !chapterObj) {
    return (
      <div className="py-12 text-center max-w-md mx-auto px-4">
        <Card className="p-8 border-slate-205 dark:border-slate-800 shadow-xl bg-slate-900/10 dark:bg-slate-950/20">
          <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4 animate-bounce" />
          <h3 className="text-base font-extrabold text-slate-950 dark:text-white">Premium material unavailable</h3>
          <p className="text-xs text-slate-500 mt-2 mb-6">
            This material could not be found in your purchased library.
          </p>
          <Button variant="primary" className="w-full h-[44px]" onClick={handleBackToLibrary}>
            Back to My Premium Materials
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 py-4 text-left animate-fade-in px-4">
      
      {/* Page Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={handleBackToList}
            className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200/50 text-slate-500 hover:text-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800 dark:border-slate-800 cursor-pointer transition-colors"
            title={`Back to ${subjectObj.name} Videos`}
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-black uppercase text-blue-600 dark:text-blue-400">
                {subjectObj.name}
              </span>
              <span className="text-slate-300 dark:text-slate-700 text-xs">•</span>
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                {chapterObj.name}
              </span>
            </div>
            <h1 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-tight mt-0.5">
              {videoObj.title}
            </h1>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 shrink-0 self-start md:self-center">
          <Button 
            variant="secondary"
            size="sm"
            onClick={handleBookmarkToggle}
            leftIcon={<Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-current text-blue-500' : ''}`} />}
            className="text-xs font-bold bg-slate-100 dark:bg-slate-850 hover:bg-slate-200 dark:hover:bg-slate-800 h-[44px] px-4"
          >
            {bookmarked ? 'Saved' : 'Save'}
          </Button>
          <Button 
            variant={isCompleted ? 'success' : 'secondary'} 
            size="sm"
            onClick={handleToggleComplete}
            leftIcon={<CheckCircle className="w-4 h-4" />}
            className="text-xs font-bold h-[44px] px-4"
          >
            {isCompleted ? 'Completed' : 'Mark Complete'}
          </Button>
        </div>
      </div>

      {/* Main player layout (PDF is completely absent) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        
        {/* Video Player Section */}
        <div className="lg:col-span-2 flex flex-col justify-between overflow-hidden border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-950 min-h-[380px] shadow-lg">
          <div className="bg-slate-950 aspect-video relative flex items-center justify-center text-white">
            {isBrokenSource ? (
              <div className="w-full h-full flex flex-col items-center justify-center bg-slate-950 text-slate-400 p-6 text-center select-none">
                <div className="w-16 h-16 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 flex items-center justify-center mb-4">
                  <Play className="w-8 h-8 fill-current translate-x-0.5" />
                </div>
                <h3 className="text-base font-black text-white">Demo lecture preview</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-xs leading-relaxed">
                  Video content will appear here when a valid lecture source is added.
                </p>
              </div>
            ) : (
              <iframe 
                src={getVideoEmbedUrl()} 
                title={videoObj.title}
                className="w-full h-full border-0"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
              />
            )}
          </div>

          <CardContent className="p-5 space-y-3 flex-1 text-left bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-900/60">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 px-2 py-0.5 rounded-md">
                Active Lecture
              </span>
              <span className="text-xs text-slate-450 dark:text-slate-500 flex items-center gap-1 font-bold">
                <Clock className="w-3.5 h-3.5" /> {Math.round(videoObj.durationSeconds / 60)} Mins
              </span>
            </div>
            
            {videoObj.description && (
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed pt-1">
                {videoObj.description}
              </p>
            )}

            {/* Playback speed controller */}
            {!isBrokenSource && (
              <div className="flex items-center gap-2 pt-4 border-t border-slate-50 dark:border-slate-900/60 mt-4">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Speed:</span>
                {[1, 1.25, 1.5, 2].map((sp) => (
                  <button
                    key={sp}
                    onClick={() => {
                      setPlaybackSpeed(sp);
                      setIsPlaying(true);
                      addToast(`Speed toggled to ${sp}x`, 'info');
                    }}
                    className={`text-xs px-2.5 py-1.5 rounded-md font-bold transition-all cursor-pointer ${
                      playbackSpeed === sp 
                        ? 'bg-blue-600 text-white shadow-sm' 
                        : 'bg-slate-150 hover:bg-slate-200 text-slate-650 dark:bg-slate-850 dark:text-slate-350'
                    }`}
                  >
                    {sp}x
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </div>

        {/* Sidebar notes action card */}
        <div className="flex flex-col">
          <Card className="border-slate-200/80 dark:border-slate-800/80 p-5 bg-white dark:bg-slate-950 flex flex-col justify-between h-full text-left">
            <div className="space-y-4">
              <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center border border-blue-500/20">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white">Related Lecture Notes</h3>
                <p className="text-xs text-slate-550 mt-1 leading-relaxed">
                  Deepen your understanding by reviewing the premium document notes created specifically for this lecture.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-50 dark:border-slate-900/60 mt-4">
              {relatedNote ? (
                <button
                  onClick={handleOpenRelatedNotes}
                  className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-black text-white bg-blue-600 hover:bg-blue-755 rounded-lg transition-all h-[44px] cursor-pointer"
                >
                  <FileText className="w-4 h-4" />
                  <span>View Related Notes</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <div className="text-xs text-slate-400 dark:text-slate-500 text-center py-2 italic">
                  No notes linked to this lecture yet.
                </div>
              )}
            </div>
          </Card>
        </div>

      </div>
      
    </div>
  );
}
