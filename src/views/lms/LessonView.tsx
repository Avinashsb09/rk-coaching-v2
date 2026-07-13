import { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { getSupabase, isSupabaseConfigured, resolveSecureDownloadUrl } from '../../lib/supabase';
import { mockChapters, mockLessons, mockVideos, mockNotes } from '../../lib/mockData';
import { AcademicChapter, Lesson, Video, Note } from '../../types';
import { 
  ArrowLeft, 
  Play, 
  Pause, 
  CheckCircle, 
  Download, 
  ExternalLink, 
  Maximize, 
  Volume2, 
  RotateCcw,
  BookOpen,
  ArrowRight,
  ArrowLeftRight,
  ChevronLeft,
  ChevronRight,
  Bookmark,
  Share2,
  Tv,
  FileText,
  Clock,
  Printer,
  Lock
} from 'lucide-react';
import { PremiumComingSoonModal } from '../../components/shared/PremiumComingSoonModal';
import { isPremiumEnabled, PremiumConfig } from '../../lib/systemConfig';
import { usePayments } from '../../context/PaymentContext';

export default function LessonView() {
  const { 
    courses, 
    user, 
    selectedCourseId, 
    selectedLessonId, 
    setSelectedLessonId,
    setCurrentView, 
    setBreadcrumbs,
    addToast,
    saveProgress,
    getLessonProgress,
    isBookmarked,
    addBookmark,
    removeBookmark,
    chapters,
    lessons,
    videos,
    notes,
    subjects
  } = useApp();

  const { hasSubjectAccess } = usePayments();

  // Load datasets (syncing Supabase if present)
  const [chaptersList, setChaptersList] = useState<AcademicChapter[]>(chapters);
  const [lessonsList, setLessonsList] = useState<Lesson[]>(lessons);
  const [videosList, setVideosList] = useState<Video[]>(videos);
  const [notesList, setNotesList] = useState<Note[]>(notes);

  useEffect(() => { setChaptersList(chapters); }, [chapters]);
  useEffect(() => { setLessonsList(lessons); }, [lessons]);
  useEffect(() => { setVideosList(videos); }, [videos]);
  useEffect(() => { setNotesList(notes); }, [notes]);

  const [activeTab, setActiveTab] = useState<'video' | 'notes'>('video');
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [studyTime, setStudyTime] = useState(0); // in seconds
  const [progressPercent, setProgressPercent] = useState(0); // simulated video watching percent
  const [notesTab, setNotesTab] = useState<'notes' | 'pyq' | 'practiceset'>('notes');
  const [premiumComingSoonOpen, setPremiumComingSoonOpen] = useState(false);

  const videoRef = useRef<HTMLDivElement>(null);
  const studyTrackerInterval = useRef<any>(null);

  const lessonObj = lessonsList.find(l => l.id === selectedLessonId);
  const courseObj = courses.find(c => c.id === selectedCourseId);



  // Start Study Tracker Timer
  useEffect(() => {
    if (lessonObj && user) {
      // Clear any existing tracker
      if (studyTrackerInterval.current) clearInterval(studyTrackerInterval.current);
      
      setStudyTime(0);
      setProgressPercent(0);

      // Check existing progress
      const existingProg = getLessonProgress(lessonObj.id);
      if (existingProg) {
        setProgressPercent(existingProg.watchedPercentage || 0);
      }

      studyTrackerInterval.current = setInterval(() => {
        setStudyTime(prev => {
          const nextTime = prev + 5;
          // Slowly increase watching percentage when playing video
          setProgressPercent(curr => {
            const added = isPlaying ? 3 : 0;
            const nextPercent = Math.min(curr + added, 100);
            
            // Save progress every 15 seconds
            if (nextTime % 15 === 0) {
              saveProgress(
                selectedCourseId || '',
                lessonObj.id,
                nextPercent,
                nextPercent >= 90,
                5
              );
            }
            return nextPercent;
          });
          return nextTime;
        });
      }, 5000);
    }

    return () => {
      if (studyTrackerInterval.current) clearInterval(studyTrackerInterval.current);
    };
  }, [lessonObj, user, isPlaying]);

  if (!lessonObj) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">Lesson was not found.</p>
        <Button variant="primary" className="mt-4" onClick={() => setCurrentView('home')}>
          Go to Home
        </Button>
      </div>
    );
  }

  const chapterObj = chaptersList.find(c => c.id === lessonObj.chapterId);
  const subjectObj = subjects.find(s => s.id === chapterObj?.subjectId);

  // Sync breadcrumbs
  useEffect(() => {
    if (lessonObj && subjectObj) {
      setBreadcrumbs([
        { label: 'Syllabus Catalog', view: 'catalog' },
        { label: subjectObj.name, view: 'subject-view' },
        { label: lessonObj.title }
      ]);
    }
  }, [lessonObj, subjectObj, setBreadcrumbs]);

  // Filter video & notes
  const activeVideo = videosList.find(v => v.lessonId === lessonObj.id);
  const activeNote = notesList.find(n => n.lessonId === lessonObj.id);

  const selectedTabNote = notesList.find(n => 
    n.lessonId === lessonObj.id && 
    (n.type === notesTab || (!n.type && notesTab === 'notes'))
  );

  const [resolvedPdfUrl, setResolvedPdfUrl] = useState<string>('');

  useEffect(() => {
    if (selectedTabNote) {
      resolveSecureDownloadUrl(selectedTabNote.pdfUrl).then(url => {
        setResolvedPdfUrl(url);
      });
    } else {
      setResolvedPdfUrl('');
    }
  }, [selectedTabNote]);

  // Filter lessons for chapter navigation
  const chapterLessons = lessonsList
    .filter(l => l.chapterId === lessonObj.chapterId && l.isPremium === lessonObj.isPremium)
    .sort((a, b) => a.orderIndex - b.orderIndex);
  
  const currentIdx = chapterLessons.findIndex(l => l.id === lessonObj.id);
  const prevLesson = currentIdx > 0 ? chapterLessons[currentIdx - 1] : null;
  const nextLesson = currentIdx < chapterLessons.length - 1 ? chapterLessons[currentIdx + 1] : null;

  // Determine current lesson completion status
  const currentProgress = getLessonProgress(lessonObj.id);
  const isCompleted = currentProgress?.isCompleted || false;

  // Manual toggle mark complete
  const handleToggleComplete = () => {
    if (!user) {
      addToast('Please log in to track study progress.', 'warning');
      return;
    }
    const targetStatus = !isCompleted;
    saveProgress(
      selectedCourseId || '',
      lessonObj.id,
      targetStatus ? 100 : progressPercent,
      targetStatus,
      0
    );
    addToast(targetStatus ? 'Lesson marked as Completed! XP Added!' : 'Progress reset.', 'success');
  };

  // Video URL parser
  const extractYoutubeId = (urlOrId: string): string => {
    if (!urlOrId) return '';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = urlOrId.match(regExp);
    return (match && match[2].length === 11) ? match[2] : urlOrId;
  };

  const getVideoEmbedUrl = () => {
    if (!activeVideo) return '';
    if (activeVideo.provider === 'youtube') {
      const yId = extractYoutubeId(activeVideo.videoIdOrUrl);
      return `https://www.youtube.com/embed/${yId}?autoplay=1&rel=0&showinfo=0&mute=0&controls=1`;
    }
    if (activeVideo.provider === 'vimeo') {
      return `https://player.vimeo.com/video/${activeVideo.videoIdOrUrl}?autoplay=1&badge=0&byline=0&portrait=0`;
    }
    if (activeVideo.provider === 'gdrive') {
      // Direct Drive file embed
      return activeVideo.videoIdOrUrl.includes('preview') 
        ? activeVideo.videoIdOrUrl 
        : activeVideo.videoIdOrUrl.replace('/view', '/preview');
    }
    return activeVideo.videoIdOrUrl;
  };

  // Bookmark Toggle
  const bookmarked = isBookmarked('lesson', lessonObj.id);
  const handleBookmarkToggle = () => {
    if (bookmarked) {
      removeBookmark('lesson', lessonObj.id);
    } else {
      addBookmark('lesson', lessonObj.id, lessonObj.title);
    }
  };

  // Open Notes in New Tab
  const handleOpenNotes = () => {
    if (activeNote) {
      window.open(resolvedPdfUrl || activeNote.pdfUrl, '_blank');
    }
  };

  return (
    <div className="space-y-6 py-4 text-left">
      {/* Upper Navigation Row */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setCurrentView('course-view')} 
          leftIcon={<ArrowLeft className="w-4 h-4" />}
          className="hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
        >
          Course Syllabus
        </Button>

        {/* Action Widgets */}
        <div className="flex items-center gap-2">
          {user && (
            <div className="flex items-center gap-1.5 text-xs bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-400 px-3 py-1.5 rounded-full border border-indigo-100 dark:border-indigo-900/40">
              <Clock className="w-3.5 h-3.5" />
              <span className="font-bold">Studying: {Math.floor(studyTime / 60)}m {studyTime % 60}s</span>
            </div>
          )}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleBookmarkToggle} 
            className={`${bookmarked ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/40' : 'text-slate-500'}`}
          >
            <Bookmark className="w-4 h-4 fill-current mr-1" />
            {bookmarked ? 'Saved' : 'Save'}
          </Button>
          <Button 
            variant={isCompleted ? 'success' : 'secondary'} 
            size="sm"
            onClick={handleToggleComplete}
            leftIcon={<CheckCircle className="w-4 h-4" />}
          >
            {isCompleted ? 'Completed' : 'Mark Complete'}
          </Button>
        </div>
      </div>

      {/* Side-by-Side Dual Deck Layout: Desktop splits, Mobile stacks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        
        {/* DECK A: Responsive Video Player Frame */}
        <Card className="border-slate-100 dark:border-slate-800 flex flex-col justify-between overflow-hidden shadow-md">
          <div className="bg-slate-900 aspect-video relative flex items-center justify-center text-white">
            {activeVideo ? (
              <iframe 
                src={getVideoEmbedUrl()} 
                title={activeVideo.title}
                className="w-full h-full"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className="p-8 text-center space-y-3">
                <Tv className="w-12 h-12 text-slate-500 mx-auto" />
                <p className="text-sm font-semibold text-slate-400">Video tutorial not found for this lesson.</p>
                <p className="text-xs text-slate-600">Please review the downloadable study notes on the right deck.</p>
              </div>
            )}
          </div>

          <CardContent className="p-5 space-y-3 flex-1 text-left">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md">
                Active Lecture
              </span>
              {activeVideo && (
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> {Math.round(activeVideo.durationSeconds / 60)} Mins
                </span>
              )}
            </div>
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white leading-tight">
              {lessonObj.title}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {lessonObj.description}
            </p>

            {/* Simulated Playback Speed controllers */}
            <div className="flex items-center gap-2 pt-2 border-t border-slate-50 dark:border-slate-800/80 mt-4">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Speed:</span>
              {[1, 1.25, 1.5, 2].map((sp) => (
                <button
                  key={sp}
                  onClick={() => {
                    setPlaybackSpeed(sp);
                    setIsPlaying(true);
                    addToast(`Speed toggled to ${sp}x`, 'info');
                  }}
                  className={`text-xs px-2.5 py-1 rounded-md font-bold transition-all ${
                    playbackSpeed === sp 
                      ? 'bg-blue-600 text-white shadow-sm' 
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  {sp}x
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* DECK B: Dynamic Study Notes Split-Screen Panel */}
        <Card className="border-slate-100 dark:border-slate-800 flex flex-col overflow-hidden shadow-md">
          {/* Header Panel */}
          <div className="p-4 bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-500" />
                <h3 className="text-xs sm:text-sm font-extrabold text-slate-800 dark:text-white">
                  Lesson Study Materials
                </h3>
              </div>
              {selectedTabNote && (
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleOpenNotes} 
                    leftIcon={<ExternalLink className="w-3.5 h-3.5" />}
                    className="h-8 text-[10px]"
                  >
                    Popout Notes
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* PDF Embed Sandbox Canvas */}
          <div className="bg-slate-200 dark:bg-slate-950 flex-1 min-h-[300px] lg:min-h-[auto] relative flex flex-col">
            {selectedTabNote ? (
              (selectedTabNote.isPremium && !hasSubjectAccess(subjectObj?.id || '') && user?.role === 'student') ? (
                <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 text-center mt-6 space-y-4">
                  <div className="h-14 w-14 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20 mx-auto shadow-inner">
                    <Lock className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-extrabold text-slate-800 dark:text-white">Premium Handout Locked</h4>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
                    This study notes PDF is reserved for premium tier users. Unlock access once the Premium Learning System is activated.
                  </p>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      if (user?.role === 'visitor' || !user) {
                        addToast('Please register or log in to unlock content.', 'warning');
                        setCurrentView('auth');
                        return;
                      }
                      // Feature flag: show coming soon modal instead of redirecting to checkout
                      if (!isPremiumEnabled()) {
                        setPremiumComingSoonOpen(true);
                      } else {
                        setCurrentView('subject-view');
                      }
                    }}
                    className="text-xs font-bold bg-amber-500 border-none text-slate-950 hover:bg-amber-600"
                  >
                    {PremiumConfig.ui.notesCTALabel}
                  </Button>
                </div>
              ) : (
                <iframe 
                  src={`${resolvedPdfUrl || selectedTabNote.pdfUrl}#toolbar=1`} 
                  title={selectedTabNote.title}
                  className="w-full h-full flex-1 border-0"
                />
              )
            ) : (
              <div className="m-auto p-6 text-center space-y-3">
                <FileText className="w-12 h-12 text-slate-400 mx-auto" />
                <p className="text-sm font-semibold text-slate-500">
                  {notesTab === 'notes' && 'Core revision notes not yet uploaded.'}
                  {notesTab === 'pyq' && 'No Previous Year Questions (PYQs) uploaded yet.'}
                  {notesTab === 'practiceset' && 'No Practice Sets uploaded yet.'}
                </p>
                <p className="text-xs text-slate-400">All materials will sync automatically. Refer to announcements.</p>
              </div>
            )}
          </div>

          {/* Engagement Footer info */}
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="font-semibold">{selectedTabNote ? selectedTabNote.title : 'No PDF assigned'}</span>
            <span className="font-bold">Alignment: CBSE Board 2026</span>
          </div>
        </Card>

      </div>

      {/* Related / Previous / Next chapter-lesson guide controllers */}
      <footer className="flex items-center justify-between gap-4 border-t border-slate-100 dark:border-slate-800/80 pt-6">
        <div>
          {prevLesson ? (
            <Button 
              variant="secondary"
              leftIcon={<ChevronLeft className="w-4 h-4" />}
              onClick={() => {
                setSelectedLessonId(prevLesson.id);
                addToast(`Opening: ${prevLesson.title}`, 'info');
              }}
            >
              <div className="hidden sm:block text-left">
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Previous</p>
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate max-w-[150px]">{prevLesson.title}</p>
              </div>
            </Button>
          ) : (
            <div />
          )}
        </div>

        <div>
          {nextLesson ? (
            <Button 
              variant="primary"
              rightIcon={<ChevronRight className="w-4 h-4" />}
              onClick={() => {
                setSelectedLessonId(nextLesson.id);
                addToast(`Opening: ${nextLesson.title}`, 'info');
              }}
            >
              <div className="hidden sm:block text-left">
                <p className="text-[10px] text-indigo-200 uppercase font-semibold">Up Next</p>
                <p className="text-xs font-bold text-white truncate max-w-[150px]">{nextLesson.title}</p>
              </div>
            </Button>
          ) : (
            <div className="text-center">
              <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 justify-center">
                <CheckCircle className="w-4 h-4" /> Syllabus Complete!
              </p>
            </div>
          )}
        </div>
      </footer>

      {/* Premium Coming Soon Modal — shown when Premium System is disabled */}
      <PremiumComingSoonModal
        isOpen={premiumComingSoonOpen}
        onClose={() => setPremiumComingSoonOpen(false)}
      />
    </div>
  );
}
