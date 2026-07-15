import { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { 
  ArrowLeft, 
  BookOpen, 
  FileText, 
  Award, 
  HelpCircle, 
  CheckCircle,
  Clock,
  Sparkles,
  ChevronRight,
  ClipboardList
} from 'lucide-react';

export default function PyqView() {
  const { 
    subjects, 
    classes,
    selectedSubjectId, 
    setCurrentView, 
    setBreadcrumbs,
    addToast
  } = useApp();

  const [activeSection, setActiveSection] = useState<'all' | 'pyq' | 'mocks' | 'solved' | 'practice'>('all');

  const subjectObj = subjects.find(s => s.id === selectedSubjectId);
  const classObj = subjectObj ? classes.find(c => c.id === subjectObj.classId) : null;

  useEffect(() => {
    if (subjectObj && classObj) {
      setBreadcrumbs([
        { label: 'All Courses', view: 'catalog' },
        { label: classObj.name, view: 'class-view' },
        { label: `${subjectObj.name} PYQ Dashboard` }
      ]);
    }
  }, [subjectObj, classObj, setBreadcrumbs]);

  if (!subjectObj) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">Subject PYQ structure not selected.</p>
        <Button variant="primary" className="mt-4" onClick={() => setCurrentView('catalog')}>
          Go to Catalog
        </Button>
      </div>
    );
  }

  // Simulated items for each required section
  const chapterWisePyqs = [
    { id: 'pyq1', title: 'Chapter 1: Solved PYQ Board Collection (2020-2025)', yearRange: '2020-2025', count: '12 Questions', size: '1.4 MB' },
    { id: 'pyq2', title: 'Chapter 2: Master formula derivation past papers', yearRange: '2018-2024', count: '8 Questions', size: '980 KB' },
    { id: 'pyq3', title: 'Chapter 3: Analytical problem solving patterns', yearRange: '2015-2023', count: '15 Questions', size: '2.1 MB' }
  ];

  const mockTests = [
    { id: 'mock1', title: 'Full Syllabus Rank-Booster Mock Exam 1', duration: '3 Hours', marks: '100 Marks', status: 'Available' },
    { id: 'mock2', title: 'High-Yield Formula Speed Test Series', duration: '1 Hour', marks: '40 Marks', status: 'Available' },
    { id: 'mock3', title: 'Weekend Rank Assessment Challenge', duration: '2 Hours', marks: '75 Marks', status: 'Starts soon' }
  ];

  const solvedPyqs = [
    { id: 'solved1', title: 'Fully Solved Official Board Paper (2024 Edition)', author: 'Prof. Rajesh Khanna', solutions: 'Step-by-step', rating: '4.9/5' },
    { id: 'solved2', title: 'Top 50 Most Repeated Concept Solutions', author: 'Dr. Anand Ramanujan', solutions: 'Detailed explanations', rating: '5.0/5' }
  ];

  const practiceSets = [
    { id: 'prac1', title: 'Chapter-wise Daily Practice Problem Set (DPP)', difficulty: 'Medium to Hard', total: '25 Questions' },
    { id: 'prac2', title: 'Syllabus Formula Cards & Speed Drills', difficulty: 'Easy to Medium', total: '150 Cards' },
    { id: 'prac3', title: 'Board Pattern Answer Writing Practice', difficulty: 'Board Standard', total: '10 Handouts' }
  ];

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
        Back to {classObj?.name || 'Class'} Dashboard
      </Button>

      {/* Header Info */}
      <section className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden border border-indigo-500/10 shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl" />
        <div className="relative space-y-4">
          <Badge variant="warning" className="bg-amber-500/20 text-amber-300 border-amber-500/30">
            {classObj?.name} Previous Year Questions (PYQs)
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            {subjectObj.name} PYQ Dashboard
          </h1>
          <p className="text-sm text-slate-300 max-w-xl leading-relaxed">
            Boost your exam preparation with solved past papers, official boards keys, subject-wise DPPs, and simulated full-syllabus mock exams designed by RK experts.
          </p>
        </div>
      </section>

      {/* Interactive Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-800 pb-4">
        {[
          { id: 'all', label: 'All Resources' },
          { id: 'pyq', label: 'Chapter-wise PYQs' },
          { id: 'mocks', label: 'Mock Tests' },
          { id: 'solved', label: 'Solved PYQs' },
          { id: 'practice', label: 'Practice Sets' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSection(tab.id as any)}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              activeSection === tab.id
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-100 dark:border-slate-800 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* CHAPTER-WISE PYQs */}
        {(activeSection === 'all' || activeSection === 'pyq') && (
          <section className="space-y-4 col-span-1">
            <div className="flex items-center gap-2 pb-1">
              <FileText className="w-5 h-5 text-indigo-500" />
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">Chapter-wise PYQs</h2>
            </div>
            <div className="space-y-3">
              {chapterWisePyqs.map((pyq) => (
                <Card key={pyq.id} className="p-4 hover:border-indigo-500/40 transition-all border-slate-100 dark:border-slate-800">
                  <div className="flex justify-between items-start gap-4">
                    <div className="space-y-1">
                      <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">{pyq.title}</h3>
                      <p className="text-[10px] text-slate-500">Year range: {pyq.yearRange} • {pyq.count}</p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 text-[10px] shrink-0 font-bold text-blue-600"
                      onClick={() => addToast(`Opening chapter PYQ workbook: ${pyq.title}`, 'success')}
                      rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
                    >
                      Open
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* MOCK TESTS */}
        {(activeSection === 'all' || activeSection === 'mocks') && (
          <section className="space-y-4 col-span-1">
            <div className="flex items-center gap-2 pb-1">
              <Award className="w-5 h-5 text-emerald-500" />
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">Mock Tests</h2>
            </div>
            <div className="space-y-3">
              {mockTests.map((mock) => (
                <Card key={mock.id} className="p-4 hover:border-emerald-500/40 transition-all border-slate-100 dark:border-slate-800">
                  <div className="flex justify-between items-start gap-4">
                    <div className="space-y-1">
                      <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">{mock.title}</h3>
                      <p className="text-[10px] text-slate-500">Duration: {mock.duration} • Marks: {mock.marks}</p>
                    </div>
                    <Badge variant={mock.status === 'Available' ? 'success' : 'info'} className="text-[9px] shrink-0">
                      {mock.status}
                    </Badge>
                  </div>
                  {mock.status === 'Available' && (
                    <div className="mt-3 flex justify-end">
                      <Button 
                        variant="primary" 
                        size="sm" 
                        className="h-7 text-[9px] font-bold"
                        onClick={() => addToast(`Initializing online mock test environment for ${mock.title}`, 'success')}
                      >
                        Start Mock Test
                      </Button>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* SOLVED PREVIOUS YEAR QUESTIONS */}
        {(activeSection === 'all' || activeSection === 'solved') && (
          <section className="space-y-4 col-span-1">
            <div className="flex items-center gap-2 pb-1">
              <CheckCircle className="w-5 h-5 text-blue-500" />
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">Solved Previous Year Questions</h2>
            </div>
            <div className="space-y-3">
              {solvedPyqs.map((sol) => (
                <Card key={sol.id} className="p-4 hover:border-blue-500/40 transition-all border-slate-100 dark:border-slate-800">
                  <div className="flex justify-between items-start gap-4">
                    <div className="space-y-1">
                      <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">{sol.title}</h3>
                      <p className="text-[10px] text-slate-500">Solutions Author: {sol.author} • Rating: {sol.rating}</p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 text-[10px] shrink-0 font-bold text-blue-600"
                      onClick={() => addToast(`Loading verified solution PDF: ${sol.title}`, 'success')}
                      rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
                    >
                      View Solution
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* PRACTICE SETS */}
        {(activeSection === 'all' || activeSection === 'practice') && (
          <section className="space-y-4 col-span-1">
            <div className="flex items-center gap-2 pb-1">
              <ClipboardList className="w-5 h-5 text-purple-500" />
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">Practice Sets</h2>
            </div>
            <div className="space-y-3">
              {practiceSets.map((prac) => (
                <Card key={prac.id} className="p-4 hover:border-purple-500/40 transition-all border-slate-100 dark:border-slate-800">
                  <div className="flex justify-between items-start gap-4">
                    <div className="space-y-1">
                      <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">{prac.title}</h3>
                      <p className="text-[10px] text-slate-500">Difficulty: {prac.difficulty} • Total: {prac.total}</p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 text-[10px] shrink-0 font-bold text-blue-600"
                      onClick={() => addToast(`Opening Practice Set: ${prac.title}`, 'success')}
                      rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
                    >
                      Practice
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        )}

      </div>
    </div>
  );
}
