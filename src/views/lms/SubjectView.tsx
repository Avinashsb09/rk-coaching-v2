import { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { getSupabase, isSupabaseConfigured } from '../../lib/supabase';
import { mockChapters, mockLessons } from '../../lib/mockData';
import { AcademicChapter, Lesson, Course } from '../../types';
import { 
  ArrowLeft, 
  Layers, 
  BookOpen, 
  PlayCircle, 
  FileText, 
  Lock, 
  CheckCircle,
  HelpCircle,
  Clock,
  ChevronRight,
  Sparkles,
  UserCheck
} from 'lucide-react';
import { RazorpayGatewayModal } from '../../components/commerce/RazorpayGatewayModal';

export default function SubjectView() {
  const { 
    subjects, 
    courses, 
    selectedSubjectId, 
    setCurrentView, 
    setSelectedCourseId, 
    setSelectedLessonId,
    setBreadcrumbs,
    addToast,
    chapters,
    lessons,
    notes,
    unlockSubjectNotes,
    hasSubjectNotesAccess,
    user
  } = useApp();

  const [checkoutNotesOpen, setCheckoutNotesOpen] = useState(false);

  const handleBuyNotes = () => {
    if (!user) {
      addToast('Please log in to purchase premium notes.', 'warning');
      setCurrentView('auth');
      return;
    }
    setCheckoutNotesOpen(true);
  };

  const [chaptersList, setChaptersList] = useState<AcademicChapter[]>(chapters);
  const [lessonsList, setLessonsList] = useState<Lesson[]>(lessons);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setChaptersList(chapters);
  }, [chapters]);

  useEffect(() => {
    setLessonsList(lessons);
  }, [lessons]);

  const subjectObj = subjects.find(s => s.id === selectedSubjectId);

  // Sync / load dynamic chapters and lessons from Supabase if available
  useEffect(() => {
    const fetchSubjectDetails = async () => {
      if (!selectedSubjectId) return;
      
      if (isSupabaseConfigured() && getSupabase()) {
        const supabase = getSupabase()!;
        setIsLoading(true);
        try {
          const { data: dbChapters } = await supabase
            .from('chapters')
            .select('*')
            .eq('subjectId', selectedSubjectId)
            .order('orderIndex', { ascending: true });
          
          if (dbChapters && dbChapters.length > 0) {
            setChaptersList(dbChapters as any);
          }

          const { data: dbLessons } = await supabase
            .from('lessons')
            .select('*');
          if (dbLessons && dbLessons.length > 0) {
            setLessonsList(dbLessons as any);
          }
        } catch (err) {
          console.error('Failed to load subject detail tables from Supabase:', err);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchSubjectDetails();
  }, [selectedSubjectId]);

  // Sync breadcrumbs
  useEffect(() => {
    if (subjectObj) {
      setBreadcrumbs([
        { label: 'Syllabus Catalog', view: 'catalog' },
        { label: subjectObj.name }
      ]);
    }
  }, [subjectObj, setBreadcrumbs]);

  if (!subjectObj) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">Subject structure not selected.</p>
        <Button variant="primary" className="mt-4" onClick={() => setCurrentView('home')}>
          Go to Home
        </Button>
      </div>
    );
  }

  // Filter content
  const filteredChapters = chaptersList.filter(c => c.subjectId === subjectObj.id);
  const subjectCourses = courses.filter(c => c.subjectId === subjectObj.id);

  // Simulated professional subject teacher
  const teacher = {
    name: 'Dr. Anand Ramanujan, PhD',
    role: 'Senior Academic Expert & NEET (Biology & Chemistry) Author',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=150&h=150&q=80',
    experience: '18+ Years coaching boards & competitive streams.'
  };

  return (
    <div className="space-y-8 py-4 text-left">
      {/* Back button */}
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={() => setCurrentView('catalog')} 
        leftIcon={<ArrowLeft className="w-4 h-4" />}
        className="hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
      >
        Back to Catalog
      </Button>

      {/* Header Info */}
      <section className="bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden border border-indigo-500/10 shadow-xl">
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="relative space-y-4">
          <Badge variant="primary" className="bg-blue-600/20 text-blue-200 border-blue-500/30">
            Subject Syllabus Directory
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            {subjectObj.name}
          </h1>
          <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
            {subjectObj.description}
          </p>
        </div>
      </section>

      {/* Grid: Left chapters, Right teacher & courses */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Chapters Section (Left column, spanning 2 grids) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Premium Subject Notes Card */}
          <Card glassmorphism className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 border-amber-200/40 dark:border-amber-900/30">
            <div className="space-y-2 text-left">
              <Badge variant="warning" className="bg-amber-500/15 text-amber-500 border-amber-500/20 font-black">
                PREMIUM REVISION NOTES
              </Badge>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Lock className="w-4.5 h-4.5 text-amber-500" />
                {subjectObj.name} Premium Notes Package
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xl leading-relaxed">
                Unlock lifetime download access to high-yield handwritten revisions, formulas, and chapter exam papers compiled specifically for {subjectObj.name}.
              </p>
              
              {/* Notes list preview */}
              {notes.filter(n => n.subjectId === subjectObj.id && n.isPremium).length > 0 && (
                <div className="pt-2 flex flex-wrap gap-2">
                  {notes.filter(n => n.subjectId === subjectObj.id && n.isPremium).map(n => (
                    <span key={n.id} className="text-[10px] bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 px-2.5 py-1 rounded-lg border border-slate-200/50 dark:border-slate-700/50 font-bold flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5" />
                      {n.title}
                    </span>
                  ))}
                </div>
              )}
            </div>
            
            <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-center shrink-0 w-full sm:w-44 gap-3">
              {hasSubjectNotesAccess(subjectObj.id) ? (
                <>
                  <div className="h-9 w-9 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center shadow-inner">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase">UNLOCKED</p>
                  
                  {/* Download links for unlocked premium notes */}
                  {notes.filter(n => n.subjectId === subjectObj.id && n.isPremium).length > 0 ? (
                    <div className="flex flex-col gap-1.5 w-full">
                      {notes.filter(n => n.subjectId === subjectObj.id && n.isPremium).map(n => (
                        <a 
                          key={n.id}
                          href={n.pdfUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="w-full text-center py-1 rounded-md bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[9px] font-bold border border-emerald-200/50 dark:border-emerald-900/30 truncate"
                        >
                          Save Notes
                        </a>
                      ))}
                    </div>
                  ) : (
                    <span className="text-[9px] text-slate-400 font-semibold leading-tight">All materials ready to download.</span>
                  )}
                </>
              ) : (
                <>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-black text-slate-900 dark:text-white">₹30</span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">LIFETIME</span>
                  </div>
                  <Button 
                    variant="primary" 
                    size="sm" 
                    className="w-full bg-amber-500 hover:bg-amber-600 text-[10px] font-black py-2 shadow-md shadow-amber-500/20"
                    onClick={handleBuyNotes}
                  >
                    Unlock Notes
                  </Button>
                  <span className="text-[9px] text-slate-400 font-semibold leading-tight">Razorpay Verification</span>
                </>
              )}
            </div>
          </Card>

          <div className="flex items-center justify-between">
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-500" />
              Syllabus Chapters ({filteredChapters.length})
            </h2>
            {isLoading && <span className="text-xs text-slate-400 animate-pulse">Syncing Supabase...</span>}
          </div>

          {filteredChapters.length === 0 ? (
            <Card className="p-6 text-center border-dashed border-2">
              <p className="text-slate-500 text-sm">No chapters registered for this subject yet. Dynamic chapters sync automatically.</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredChapters.map((chapter) => {
                const chapterLessons = lessonsList.filter(l => l.chapterId === chapter.id);
                const freeCount = chapterLessons.filter(l => !l.isPremium).length;
                const premiumCount = chapterLessons.filter(l => l.isPremium).length;

                return (
                  <Card key={chapter.id} className="border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
                    <div className="bg-slate-50/50 dark:bg-slate-900/40 p-5 border-b border-slate-100 dark:border-slate-800/80">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white leading-snug">
                            {chapter.name}
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {chapter.description}
                          </p>
                        </div>
                        <div className="flex flex-col gap-1 items-end shrink-0">
                          <Badge variant="success" className="text-[10px] scale-90">
                            {freeCount} Free Lesson{freeCount !== 1 && 's'}
                          </Badge>
                          {premiumCount > 0 && (
                            <Badge variant="warning" className="text-[10px] scale-90">
                              {premiumCount} Premium Lesson{premiumCount !== 1 && 's'}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    <CardContent className="p-0 text-left">
                      {chapterLessons.length === 0 ? (
                        <p className="text-xs text-slate-400 p-4 italic">No lessons published under this chapter yet.</p>
                      ) : (
                        <div className="divide-y divide-slate-100 dark:divide-slate-800">
                          {chapterLessons.map((lesson) => (
                            <div 
                              key={lesson.id} 
                              className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50/40 dark:hover:bg-slate-900/20 transition-all cursor-pointer"
                              onClick={() => {
                                // Match to course
                                const associatedCourse = subjectCourses.find(c => c.id === lesson.courseId) || subjectCourses[0];
                                if (associatedCourse) {
                                  setSelectedCourseId(associatedCourse.id);
                                }
                                setSelectedLessonId(lesson.id);
                                setCurrentView('lesson-view');
                                addToast(`Opening: ${lesson.title}`, 'success');
                              }}
                            >
                              <div className="flex items-start gap-3">
                                <div className="mt-0.5 text-blue-500">
                                  {lesson.isPremium ? <Lock className="w-4 h-4 text-amber-500" /> : <PlayCircle className="w-4 h-4 text-emerald-500" />}
                                </div>
                                <div className="space-y-0.5">
                                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                    {lesson.title}
                                  </h4>
                                  <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1">
                                    {lesson.description}
                                  </p>
                                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-1 ${
                                      lesson.isPremium 
                                        ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-900/30' 
                                        : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/30'
                                    }`}>
                                      <FileText className="w-3 h-3" />
                                      {lesson.isPremium ? 'Premium Revision Notes' : 'Free Practice Notes'}
                                    </span>
                                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 dark:border-blue-900/30 flex items-center gap-1">
                                      <PlayCircle className="w-3 h-3" />
                                      Chapter-wise Video Lecture
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <span className="text-[10px] font-semibold text-slate-400 hidden sm:inline">PDF notes, video lecture available</span>
                                <ChevronRight className="w-4 h-4 text-slate-400" />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Sidebar details (Right column) */}
        <div className="space-y-6">
          {/* Active Courses */}
          <div className="space-y-4">
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-500" />
              Available Prep Modules
            </h2>
            {subjectCourses.length === 0 ? (
              <Card className="p-4 text-slate-500 text-xs">No active exam prep packages found.</Card>
            ) : (
              <div className="space-y-4">
                {subjectCourses.map((course) => (
                  <Card key={course.id} className="border-slate-100 dark:border-slate-800 overflow-hidden">
                    <img src={course.thumbnailUrl} alt={course.title} referrerPolicy="no-referrer" className="h-28 w-full object-cover" />
                    <CardContent className="p-4 space-y-3">
                      <h3 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1 leading-snug">
                        {course.title}
                      </h3>
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200">
                          {course.isPremium ? `₹${course.discountPrice}` : 'FREE'}
                        </span>
                        <Button 
                          variant="secondary" 
                          size="sm" 
                          className="h-7 text-[10px]"
                          onClick={() => {
                            setSelectedCourseId(course.id);
                            setCurrentView('course-view');
                          }}
                        >
                          View Syllabus
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Teacher Info */}
          <div className="space-y-4">
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-indigo-500" />
              Syllabus Director
            </h2>
            <Card className="p-5 border-slate-100 dark:border-slate-800">
              <CardContent className="p-0 flex items-start gap-4">
                <img 
                  src={teacher.avatar} 
                  alt={teacher.name} 
                  className="w-12 h-12 rounded-2xl object-cover shrink-0 border border-slate-100" 
                />
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">{teacher.name}</h4>
                  <p className="text-[10px] text-slate-500">{teacher.role}</p>
                  <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">{teacher.experience}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

      </div>

      <RazorpayGatewayModal
        isOpen={checkoutNotesOpen}
        onClose={() => setCheckoutNotesOpen(false)}
        courseTitle={`${subjectObj.name} Premium Notes Package`}
        courseId={`notes_${subjectObj.id}`}
        amount={30}
        onSuccess={async (paymentId, orderId) => {
          try {
            await unlockSubjectNotes(subjectObj.id, paymentId, orderId);
            setCheckoutNotesOpen(false);
          } catch (err: any) {
            addToast(err.message || 'Payment notes unlock failed', 'error');
          }
        }}
        onFailure={(reason) => {
          addToast(`Razorpay payment failed: ${reason}`, 'error');
        }}
        onCancel={() => {
          addToast('Payment checkout cancelled.', 'info');
        }}
        userEmail={user?.email || undefined}
        userFullName={user?.fullName || undefined}
      />
    </div>
  );
}
