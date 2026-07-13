import { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { getSupabase, isSupabaseConfigured } from '../../lib/supabase';
import { mockChapters, mockLessons, mockNotes, mockVideos } from '../../lib/mockData';
import { AcademicChapter, Lesson, Note, Video } from '../../types';
import { RazorpayGatewayModal } from '../../components/commerce/RazorpayGatewayModal';
import { PremiumComingSoonModal } from '../../components/shared/PremiumComingSoonModal';
import { isPremiumEnabled, isPaymentEnabled, PremiumConfig } from '../../lib/systemConfig';
import { 
  ArrowLeft, 
  Play, 
  BookOpen, 
  FileText, 
  Tv, 
  Layers, 
  Lock, 
  CheckCircle, 
  CreditCard, 
  Activity, 
  ArrowRight,
  Bookmark,
  Share2
} from 'lucide-react';

export default function CourseView() {
  const { 
    courses, 
    user, 
    selectedCourseId, 
    setCurrentView, 
    setSelectedLessonId,
    setBreadcrumbs,
    addToast,
    bookmarksList,
    addBookmark,
    removeBookmark,
    isBookmarked,
    progressList,
    chapters,
    lessons,
    notes,
    videos,
    enrolledCourseIds,
    enrollInCourse
  } = useApp();

  const [chaptersList, setChaptersList] = useState<AcademicChapter[]>(chapters);
  const [lessonsList, setLessonsList] = useState<Lesson[]>(lessons);
  const [notesList, setNotesList] = useState<Note[]>(notes);
  const [videosList, setVideosList] = useState<Video[]>(videos);

  useEffect(() => { setChaptersList(chapters); }, [chapters]);
  useEffect(() => { setLessonsList(lessons); }, [lessons]);
  useEffect(() => { setNotesList(notes); }, [notes]);
  useEffect(() => { setVideosList(videos); }, [videos]);
  
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [premiumComingSoonOpen, setPremiumComingSoonOpen] = useState(false);
  const [enrollLoading, setEnrollLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const courseObj = courses.find(c => c.id === selectedCourseId);
  const isEnrolled = courseObj ? enrolledCourseIds.includes(courseObj.id) : false;



  // Set breadcrumbs
  useEffect(() => {
    if (courseObj) {
      setBreadcrumbs([
        { label: 'Syllabus Catalog', view: 'catalog' },
        { label: courseObj.title }
      ]);
    }
  }, [courseObj, setBreadcrumbs]);

  if (!courseObj) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">Course standard information not found.</p>
        <Button variant="primary" className="mt-4" onClick={() => setCurrentView('home')}>
          Go to Home
        </Button>
      </div>
    );
  }

  // Filter and calculate totals
  const courseLessons = lessonsList.filter(l => l.courseId === courseObj.id);
  const chapterIds = Array.from(new Set(courseLessons.map(l => l.chapterId)));
  const courseChapters = chaptersList.filter(chap => chapterIds.includes(chap.id));
  
  const totalChapters = courseChapters.length || 1;
  const totalLessons = courseLessons.length;
  
  const lessonIds = courseLessons.map(l => l.id);
  const videoCount = videosList.filter(v => lessonIds.includes(v.lessonId)).length;
  const notesCount = notesList.filter(n => lessonIds.includes(n.lessonId)).length;

  // Course Progress Calculate
  const courseProgressList = progressList.filter(p => p.courseId === courseObj.id);
  const completedLessonsCount = courseProgressList.filter(p => p.isCompleted).length;
  const progressPercent = totalLessons > 0 ? Math.round((completedLessonsCount / totalLessons) * 100) : 0;

  // Handle Enrollment
  const handleEnroll = async () => {
    if (user?.role === 'visitor' || !user) {
      addToast('Please log in as student to enroll in courses.', 'warning');
      setCurrentView('auth');
      return;
    }

    if (courseObj.isPremium) {
      // Feature flag: show coming soon modal instead of payment checkout
      if (!isPremiumEnabled()) {
        setPremiumComingSoonOpen(true);
        return;
      }
      setCheckoutOpen(true);
    } else {
      setEnrollLoading(true);
      try {
        await enrollInCourse(courseObj.id, false);
      } catch (err: any) {
        addToast(err.message || 'Enrollment failed', 'error');
      } finally {
        setEnrollLoading(false);
      }
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: courseObj.title,
        text: courseObj.subtitle,
        url: window.location.href
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      addToast('Link copied to clipboard!', 'success');
    }
  };

  const bookmarkType = 'course';
  const bookmarked = isBookmarked(bookmarkType, courseObj.id);

  const handleBookmarkToggle = () => {
    if (bookmarked) {
      removeBookmark(bookmarkType, courseObj.id);
    } else {
      addBookmark(bookmarkType, courseObj.id, courseObj.title);
    }
  };

  return (
    <div className="space-y-8 py-4 text-left">
      {/* Back Header navigation bar */}
      <div className="flex items-center justify-between">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setCurrentView('catalog')} 
          leftIcon={<ArrowLeft className="w-4 h-4" />}
          className="hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
        >
          Catalog Home
        </Button>
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleBookmarkToggle} 
            className={`${bookmarked ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/40' : 'text-slate-500'}`}
          >
            <Bookmark className="w-4 h-4 mr-1.5 fill-current" />
            {bookmarked ? 'Bookmarked' : 'Bookmark'}
          </Button>
          <Button variant="ghost" size="sm" onClick={handleShare} className="text-slate-500">
            <Share2 className="w-4 h-4 mr-1.5" />
            Share
          </Button>
        </div>
      </div>

      {/* Main Grid Card layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Course details and Chapters */}
        <div className="lg:col-span-2 space-y-6">
          <section className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/40 dark:bg-blue-950/30 text-xs font-bold">
              <span>BOARD COMPATIBLE</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
              {courseObj.title}
            </h1>
            <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 font-medium">
              {courseObj.subtitle}
            </p>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
              {courseObj.description}
            </p>
          </section>

          {/* Chapters and Lessons hierarchy listing */}
          <section className="space-y-4 pt-4">
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-500" />
              Course Structure ({totalChapters} Chapters, {totalLessons} Lessons)
            </h2>

            {courseChapters.length === 0 ? (
              <Card className="p-6 text-center border-dashed border-2">
                <p className="text-slate-500 text-sm">No chapters registered yet under this course.</p>
              </Card>
            ) : (
              <div className="space-y-4">
                {courseChapters.map((chapter) => {
                  const chapterLessons = courseLessons.filter(l => l.chapterId === chapter.id);
                  return (
                    <Card key={chapter.id} className="border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
                      <div className="bg-slate-50/60 dark:bg-slate-900/40 p-4 border-b border-slate-100 dark:border-slate-800/80">
                        <h3 className="text-xs sm:text-sm font-extrabold text-slate-800 dark:text-slate-200">
                          {chapter.name}
                        </h3>
                      </div>
                      <CardContent className="p-0 text-left">
                        {chapterLessons.map((lesson) => (
                          <div 
                            key={lesson.id} 
                            className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50/30 dark:hover:bg-slate-900/10 cursor-pointer border-b border-slate-50 last:border-0"
                            onClick={() => {
                              setSelectedLessonId(lesson.id);
                              setCurrentView('lesson-view');
                              addToast(`Opening: ${lesson.title}`, 'success');
                            }}
                          >
                            <div className="flex items-center gap-3">
                              {lesson.isPremium ? <Lock className="w-4 h-4 text-amber-500" /> : <Play className="w-3 h-3 text-emerald-500 fill-current" />}
                              <div className="space-y-0.5">
                                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">{lesson.title}</h4>
                                <p className="text-[10px] text-slate-500 line-clamp-1">{lesson.description}</p>
                              </div>
                            </div>
                            <Badge variant={lesson.isPremium ? 'warning' : 'success'} className="text-[9px] scale-90">
                              {lesson.isPremium ? 'PREMIUM' : 'FREE'}
                            </Badge>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        {/* Right Column: Checkout Pricing / Call to Action / Stats Box */}
        <div className="space-y-6">
          <Card className="border-slate-100 dark:border-slate-800 shadow-lg overflow-hidden sticky top-20">
            <div className="h-44 w-full bg-slate-100 dark:bg-slate-900 relative">
              <img src={courseObj.thumbnailUrl} alt={courseObj.title} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end p-4">
                <Badge variant={courseObj.isPremium ? 'warning' : 'success'}>
                  {courseObj.isPremium ? 'PREMIUM PREP' : 'FREE CATALOG'}
                </Badge>
              </div>
            </div>

            <CardContent className="p-6 space-y-6 text-left">
              {/* Syllabus Core details count */}
              <div className="grid grid-cols-2 gap-4 text-center border-b border-slate-100 dark:border-slate-800/80 pb-4">
                <div>
                  <p className="text-lg font-extrabold text-blue-600 dark:text-blue-400">{videoCount}</p>
                  <p className="text-[10px] text-slate-500 font-semibold uppercase">Video Lectures</p>
                </div>
                <div className="border-l border-slate-100 dark:border-slate-800">
                  <p className="text-lg font-extrabold text-indigo-500">{notesCount}</p>
                  <p className="text-[10px] text-slate-500 font-semibold uppercase">Revision PDFs</p>
                </div>
              </div>

              {/* Progress Tracker Bar */}
              {isEnrolled && (
                <div className="space-y-2 border-b border-slate-100 dark:border-slate-800/80 pb-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-600 dark:text-slate-400">Your Course Progress</span>
                    <span className="font-extrabold text-blue-600">{progressPercent}%</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full" style={{ width: `${progressPercent}%` }} />
                  </div>
                  <p className="text-[10px] text-slate-400 text-center font-semibold">
                    Completed {completedLessonsCount} of {totalLessons} lessons
                  </p>
                </div>
              )}

              {/* Pricing section */}
              <div className="space-y-2 text-left">
                <p className="text-xs text-slate-500 font-bold uppercase">Syllabus Access Price</p>
                {courseObj.isPremium ? (
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-slate-900 dark:text-white">₹{courseObj.discountPrice}</span>
                    <span className="text-sm text-slate-400 line-through">₹{courseObj.price}</span>
                    <span className="text-xs text-emerald-600 font-extrabold">Save {Math.round((1 - (courseObj.discountPrice / courseObj.price)) * 100)}%</span>
                  </div>
                ) : (
                  <span className="text-2xl font-black text-emerald-600">100% FREE CONTENT</span>
                )}
              </div>

              {/* Button controllers */}
              <div className="space-y-3 pt-2">
                {isEnrolled ? (
                  <Button 
                    variant="primary" 
                    className="w-full shadow-md py-3 font-extrabold text-sm"
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                    onClick={() => {
                      // Resume last accessed or first lesson
                      const firstLesson = courseLessons[0];
                      if (firstLesson) {
                        setSelectedLessonId(firstLesson.id);
                        setCurrentView('lesson-view');
                        addToast(`Resuming Lesson: ${firstLesson.title}`, 'success');
                      } else {
                        addToast('Lessons under development for this course standard.', 'info');
                      }
                    }}
                  >
                    Continue Learning
                  </Button>
                ) : (
                  <Button 
                    variant="primary" 
                    className="w-full shadow-md py-3 font-extrabold text-sm"
                    isLoading={enrollLoading}
                    onClick={handleEnroll}
                  >
                    {courseObj.isPremium ? PremiumConfig.ui.enrollButtonLabel : 'Enroll Free Now'}
                  </Button>
                )}
                <p className="text-[10px] text-slate-400 text-center leading-relaxed font-semibold">
                  Secured by TLS 1.3 & Encrypted Supabase Transactions. Live doubt clearing support included.
                </p>
              </div>

            </CardContent>
          </Card>
        </div>

      </div>

      {/* Premium Coming Soon Modal — shown when Premium System is disabled */}
      <PremiumComingSoonModal
        isOpen={premiumComingSoonOpen}
        onClose={() => setPremiumComingSoonOpen(false)}
      />

      {/* Razorpay Checkout Modal — only mounted when payment system is active */}
      {isPaymentEnabled() && (
        <RazorpayGatewayModal
          isOpen={checkoutOpen}
          onClose={() => setCheckoutOpen(false)}
          courseTitle={courseObj.title}
          courseId={courseObj.id}
          amount={courseObj.discountPrice || courseObj.price || 499}
          userEmail={user?.email}
          userFullName={user?.fullName}
          onSuccess={async (paymentId, orderId) => {
            try {
              await enrollInCourse(courseObj.id, true, paymentId, orderId);
              setCheckoutOpen(false);
            } catch (err: any) {
              addToast(err.message || 'Payment enrollment sync failed', 'error');
            }
          }}
          onFailure={(reason) => {
            addToast(`Razorpay payment failed: ${reason}`, 'error');
          }}
          onCancel={() => {
            addToast('Payment checkout cancelled.', 'info');
          }}
        />
      )}
    </div>
  );
}
