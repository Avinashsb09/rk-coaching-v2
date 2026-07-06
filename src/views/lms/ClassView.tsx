import { useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { 
  ArrowLeft, 
  BookOpen, 
  Layers, 
  Sparkles, 
  ArrowRight,
  Calculator,
  Beaker,
  Atom,
  FlaskConical,
  Dna,
  Briefcase,
  CreditCard,
  Download,
  FileText,
  GraduationCap
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
  BookOpen,
  GraduationCap
};

export default function ClassView() {
  const { 
    classes, 
    subjects, 
    courses, 
    selectedClassSlug, 
    setSelectedClassSlug,
    setCurrentView, 
    setSelectedSubjectId, 
    setSelectedCourseId,
    setBreadcrumbs,
    notes
  } = useApp();

  // If selecting Class 6-9 category, render the class picker
  if (selectedClassSlug === 'class-6-9') {
    return (
      <div className="space-y-8 py-4 text-left animate-fade-in">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setCurrentView('catalog')} 
          leftIcon={<ArrowLeft className="w-4 h-4" />}
          className="hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
        >
          Back to Catalog
        </Button>

        {/* Hero */}
        <section className="bg-gradient-to-br from-blue-900 via-slate-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl border border-indigo-500/10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/15 rounded-full blur-3xl animate-pulse" />
          <div className="relative space-y-4">
            <Badge variant="primary" className="bg-blue-500/20 text-blue-200 border-blue-500/30">
              Class 6-9 Syllabus Catalog
            </Badge>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Select Your Class (6th - 9th)
            </h1>
            <p className="text-sm text-slate-300 max-w-xl leading-relaxed">
              Select your academic standard below to explore specialized state-board aligned study notes, daily chapter-wise videos, solved previous year papers, and chapter mock sheets.
            </p>
          </div>
        </section>

        {/* Grid of classes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {['class-6', 'class-7', 'class-8', 'class-9'].map((slug) => {
            const cls = classes.find(c => c.slug === slug);
            if (!cls) return null;
            return (
              <Card 
                key={cls.slug} 
                hoverEffect 
                className="cursor-pointer border-slate-100 dark:border-slate-800 p-6 flex flex-col justify-between h-48 hover:border-blue-500/40"
                onClick={() => {
                  setSelectedClassSlug(cls.slug);
                }}
              >
                <div className="space-y-3">
                  <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">{cls.name}</h3>
                  <p className="text-xs text-slate-500">Board exam masterclass, notes, & mock sets.</p>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-blue-600">
                  <span>Enter Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    );
  }

  // If selecting Class 11-12 Science category, render the standard picker
  if (selectedClassSlug === 'class-11-12-science') {
    return (
      <div className="space-y-8 py-4 text-left animate-fade-in">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setCurrentView('catalog')} 
          leftIcon={<ArrowLeft className="w-4 h-4" />}
          className="hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
        >
          Back to Catalog
        </Button>

        {/* Hero */}
        <section className="bg-gradient-to-br from-cyan-900 via-slate-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl border border-indigo-500/10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/15 rounded-full blur-3xl animate-pulse" />
          <div className="relative space-y-4">
            <Badge variant="primary" className="bg-cyan-500/20 text-cyan-200 border-cyan-500/30">
              Class 11-12 Science Directory
            </Badge>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Select Your Standard (Class 11 or 12)
            </h1>
            <p className="text-sm text-slate-300 max-w-xl leading-relaxed">
              Explore professional board-oriented preparation plans, formula cheatsheets, live revisions, and PYQ collections in Physics, Chemistry, and Biology.
            </p>
          </div>
        </section>

        {/* Grid of classes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl">
          {['class-11-science', 'class-12-science'].map((slug) => {
            const cls = classes.find(c => c.slug === slug);
            if (!cls) return null;
            return (
              <Card 
                key={cls.slug} 
                hoverEffect 
                className="cursor-pointer border-slate-100 dark:border-slate-800 p-6 flex flex-col justify-between h-48 hover:border-cyan-500/40"
                onClick={() => {
                  setSelectedClassSlug(cls.slug);
                }}
              >
                <div className="space-y-3">
                  <div className="h-10 w-10 rounded-xl bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
                    <Atom className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">{cls.name}</h3>
                  <p className="text-xs text-slate-500">Physics, Chemistry, and Biology master revision packs.</p>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-600">
                  <span>Enter Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    );
  }

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
        <Button variant="primary" className="mt-4" onClick={() => setCurrentView('catalog')}>
          Go to Syllabus Catalog
        </Button>
      </div>
    );
  }

  // Filter subjects and courses
  const classSubjects = subjects.filter(s => s.classId === classObj.id);
  const classCourses = courses.filter(c => c.classId === classObj.id);

  // Simulated enrollment / student counts
  const studentCount = classObj.id === 'neet' ? '45,200+' : '12,800+';

  // Hierarchical back click behavior
  const handleBack = () => {
    if (['class-6', 'class-7', 'class-8', 'class-9'].includes(classObj.slug)) {
      setSelectedClassSlug('class-6-9');
    } else if (['class-11-science', 'class-12-science'].includes(classObj.slug)) {
      setSelectedClassSlug('class-11-12-science');
    } else {
      setCurrentView('catalog');
    }
  };

  return (
    <div className="space-y-8 py-4 text-left animate-fade-in">
      {/* Back button */}
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={handleBack} 
        leftIcon={<ArrowLeft className="w-4 h-4" />}
        className="hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
      >
        {['class-6', 'class-7', 'class-8', 'class-9'].includes(classObj.slug) ? 'Back to Class 6-9 Selection' :
         ['class-11-science', 'class-12-science'].includes(classObj.slug) ? 'Back to Class 11-12 Selection' :
         'Back to Catalog'}
      </Button>

      {/* Hero Header */}
      <section className="bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-950 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl border border-indigo-500/10">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="relative space-y-4">
          <Badge variant="info" className="bg-indigo-500/20 text-indigo-200 border-indigo-500/30">
            {classObj.name} Dashboard
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Comprehensive Syllabus for {classObj.name}
          </h1>
        </div>
      </section>

      {/* SECTION 1: SUBJECTS */}
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
                        <span>Explore Notes & Videos</span>
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
    </div>
  );
}
