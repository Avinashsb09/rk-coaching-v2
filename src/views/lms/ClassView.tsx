import { useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { 
  ArrowLeft, 
  BookOpen, 
  Users, 
  Layers, 
  Sparkles, 
  ArrowRight,
  Calculator,
  Beaker,
  Atom,
  FlaskConical,
  Dna,
  Briefcase,
  CreditCard
} from 'lucide-react';

// Map icons dynamically
const IconMap: Record<string, any> = {
  Calculator,
  Beaker,
  Atom,
  FlaskConical,
  Dna,
  Briefcase,
  CreditCard,
  BookOpen
};

export default function ClassView() {
  const { 
    classes, 
    subjects, 
    courses, 
    selectedClassSlug, 
    setCurrentView, 
    setSelectedSubjectId, 
    setSelectedCourseId,
    setBreadcrumbs
  } = useApp();

  const classObj = classes.find(c => c.slug === selectedClassSlug);

  useEffect(() => {
    if (classObj) {
      setBreadcrumbs([
        { label: 'Syllabus Catalog', view: 'catalog' },
        { label: classObj.name }
      ]);
    }
  }, [classObj, setBreadcrumbs]);

  if (!classObj) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">Standard standard class not found.</p>
        <Button variant="primary" className="mt-4" onClick={() => setCurrentView('home')}>
          Go to Home
        </Button>
      </div>
    );
  }

  // Filter subjects and courses
  const classSubjects = subjects.filter(s => s.classId === classObj.id);
  const classCourses = courses.filter(c => c.classId === classObj.id);

  // Simulated enrollment / student counts
  const studentCount = classObj.id === 'neet' ? '45,200+' : '12,800+';

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

      {/* Hero Header */}
      <section className="bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-950 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl border border-indigo-500/10">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl" />
        <div className="relative space-y-4">
          <Badge variant="info" className="bg-indigo-500/20 text-indigo-200 border-indigo-500/30">
            {classObj.name} Dashboard
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Comprehensive Syllabus for {classObj.name}
          </h1>
          <p className="text-sm sm:text-base text-slate-300 max-w-xl leading-relaxed">
            Access board-aligned curricula, verified handwritten revisions, chapterwise mock assessments, and step-by-step problem sets designed to boost your ranks.
          </p>

          <div className="flex flex-wrap gap-6 pt-2">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-400" />
              <span className="text-xs font-bold text-slate-200">{studentCount} Enrolled Students</span>
            </div>
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-400" />
              <span className="text-xs font-bold text-slate-200">{classSubjects.length} Active Subjects</span>
            </div>
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-400" />
              <span className="text-xs font-bold text-slate-200">{classCourses.length} Learning Modules</span>
            </div>
          </div>
        </div>
      </section>

      {/* 1. SUBJECTS SECTION */}
      <section className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-600" />
            Syllabus Subjects
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Pick a subject to explore its structure, chapter notes, and free mock quizzes.
          </p>
        </div>

        {classSubjects.length === 0 ? (
          <Card className="p-6 text-center border-dashed border-2">
            <p className="text-slate-500 text-sm">No subjects listed yet for {classObj.name}. Check back shortly!</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {classSubjects.map((subject) => {
              const CustomIcon = IconMap[subject.icon] || BookOpen;
              const subjectCoursesCount = courses.filter(c => c.subjectId === subject.id).length;

              return (
                <Card 
                  key={subject.id} 
                  hoverEffect 
                  className="cursor-pointer border-slate-100 dark:border-slate-800 hover:border-blue-500/40"
                  onClick={() => {
                    setSelectedSubjectId(subject.id);
                    setCurrentView('subject-view');
                  }}
                >
                  <CardContent className="p-5 flex items-start gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                      <CustomIcon className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        {subject.name}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {subject.description}
                      </p>
                      <div className="flex items-center gap-1.5 pt-1.5 text-[10px] font-bold text-blue-600 dark:text-blue-400">
                        <span>{subjectCoursesCount} {subjectCoursesCount === 1 ? 'Course' : 'Courses'} available</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {/* 2. COURSE MODULES SECTION */}
      <section className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            Comprehensive Learning Modules
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Browse targeted exam preparations, fast-track board courses, or complete revisions.
          </p>
        </div>

        {classCourses.length === 0 ? (
          <Card className="p-6 text-center border-dashed border-2">
            <p className="text-slate-500 text-sm">No specific preparation courses available for this standard yet.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {classCourses.map((course) => (
              <Card 
                key={course.id} 
                hoverEffect 
                className="overflow-hidden border-slate-100 dark:border-slate-800"
              >
                <div className="relative h-44 w-full bg-slate-100 dark:bg-slate-900">
                  <img src={course.thumbnailUrl} alt={course.title} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                  <div className="absolute top-3 right-3">
                    <Badge variant={course.isPremium ? 'warning' : 'success'}>
                      {course.isPremium ? 'PREMIUM' : '100% FREE'}
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-5 space-y-3.5 text-left">
                  <span className="text-[10px] uppercase font-extrabold tracking-widest text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2.5 py-1 rounded-md">
                    BOARD & TARGET PREP
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
                    <Button 
                      variant="primary" 
                      size="sm"
                      onClick={() => {
                        setSelectedCourseId(course.id);
                        setCurrentView('course-view');
                      }}
                    >
                      Explore Course
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
