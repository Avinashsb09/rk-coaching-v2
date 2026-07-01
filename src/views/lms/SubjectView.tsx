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
    lessons
  } = useApp();

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
        onClick={() => setCurrentView('class-view')} 
        leftIcon={<ArrowLeft className="w-4 h-4" />}
        className="hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
      >
        Back to Class Dashboard
      </Button>

      {/* Header Info */}
      <section className="bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden border border-indigo-500/10 shadow-xl">
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-4">
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
          <div className="shrink-0">
            <Button 
              variant="secondary" 
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold border-none flex items-center gap-1.5"
              onClick={() => setCurrentView('pyq-view')}
            >
              Open Subject PYQs & Mocks
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Grid: Left chapters, Right teacher & courses */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Chapters Section (Left column, spanning 2 grids) */}
        <div className="lg:col-span-2 space-y-6">
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
    </div>
  );
}
