import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { 
  Trophy, BookOpen, Layers, Clock, Play, ChevronRight, Award, 
  HelpCircle, Sparkles, BrainCircuit, CheckCircle, FileText 
} from 'lucide-react';

export default function PyqDashboard() {
  const { 
    classes, 
    subjects, 
    chapters, 
    setCurrentView, 
    addToast
  } = useApp();

  // Tab State: 'all' | '6-9' | '10' | '11-12' | 'neet'
  const [activeTab, setActiveTab] = useState<'all' | '6-9' | '10' | '11-12' | 'neet'>('all');
  
  // Selected states for navigation flow
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);

  // Filter classes according to activeTab
  const getFilteredClasses = () => {
    // Exclude the backward compatibility 'neet' duplicate class standard
    const base = classes.filter(c => c.id !== 'neet');
    if (activeTab === '6-9') {
      return base.filter(c => ['c6', 'c7', 'c8', 'c9'].includes(c.id));
    }
    if (activeTab === '10') {
      return base.filter(c => c.id === 'c10');
    }
    if (activeTab === '11-12') {
      return base.filter(c => ['c11_sci', 'c12_sci'].includes(c.id));
    }
    if (activeTab === 'neet') {
      return base.filter(c => ['neet-biology', 'neet-chemistry'].includes(c.id));
    }
    return base;
  };

  const filteredClasses = getFilteredClasses();

  // Subjects for selected class
  const filteredSubjects = selectedClassId 
    ? subjects.filter(s => s.classId === selectedClassId)
    : [];

  // Chapters for selected subject
  const filteredChapters = selectedSubjectId 
    ? chapters.filter(c => c.subjectId === selectedSubjectId)
    : [];

  // Mock PYQ exams list based on selections
  const getPyqPapers = () => {
    if (!selectedChapterId) return [];
    
    const chap = chapters.find(c => c.id === selectedChapterId);
    const sub = subjects.find(s => s.id === selectedSubjectId);
    const cls = classes.find(c => c.id === selectedClassId);
    
    return [
      {
        id: `pyq_${selectedClassId}_${selectedSubjectId}_${selectedChapterId}_2024`,
        title: `${cls?.name} ${sub?.name} - Solved Board PYQ Paper (2024)`,
        year: '2024',
        durationMinutes: 45,
        totalQuestions: 15,
        totalMarks: 45,
        difficulty: 'medium'
      },
      {
        id: `pyq_${selectedClassId}_${selectedSubjectId}_${selectedChapterId}_2023`,
        title: `${cls?.name} ${sub?.name} - Solved Board PYQ Paper (2023)`,
        year: '2023',
        durationMinutes: 45,
        totalQuestions: 15,
        totalMarks: 45,
        difficulty: 'hard'
      },
      {
        id: `pyq_${selectedClassId}_${selectedSubjectId}_${selectedChapterId}_2022`,
        title: `${cls?.name} ${sub?.name} - Solved Board PYQ Paper (2022)`,
        year: '2022',
        durationMinutes: 45,
        totalQuestions: 15,
        totalMarks: 45,
        difficulty: 'easy'
      }
    ];
  };

  const pyqPapers = getPyqPapers();

  const handleLaunchCbt = (paper: any) => {
    sessionStorage.setItem('active_pyq_id', paper.id);
    sessionStorage.setItem('active_pyq_title', paper.title);
    sessionStorage.setItem('active_pyq_class_id', selectedClassId || '');
    sessionStorage.setItem('active_pyq_subject_id', selectedSubjectId || '');
    sessionStorage.setItem('active_pyq_chapter_id', selectedChapterId || '');
    sessionStorage.setItem('active_pyq_duration', String(paper.durationMinutes));

    setCurrentView('pyq-play');
    addToast(`Launching CBT Live Exam: ${paper.year} PYQ Paper`, 'success');
  };

  return (
    <div className="space-y-8 py-4 text-left animate-fade-in">
      {/* Hero Header */}
      <section className="bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/40 rounded-3xl p-6 sm:p-8 text-slate-900 dark:text-white relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="relative space-y-4">
          <Badge variant="warning" className="bg-amber-500/15 text-amber-500 border border-amber-500/20 font-black animate-pulse">
            PREVIOUS YEAR QUESTIONS (PYQs)
          </Badge>
          <h1 className="text-3xl font-extrabold tracking-tight">
            PYQ CBT Test Arena
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xl leading-relaxed">
            Solve official board and medical entrance exam past year papers in a premium CBT exam simulator. Get score analytics, correct answers keys, and rank standings.
          </p>
        </div>
      </section>

      {/* Class picker category filter */}
      <div className="flex flex-wrap gap-2 p-1 bg-slate-900/10 dark:bg-slate-900/60 border border-slate-200/40 dark:border-slate-800/40 rounded-xl w-fit">
        {[
          { id: 'all', label: 'All Standards' },
          { id: '6-9', label: 'Classes 6–9' },
          { id: '10', label: 'Class 10' },
          { id: '11-12', label: 'Classes 11–12' },
          { id: 'neet', label: 'NEET Modules' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id as any);
              setSelectedClassId(null);
              setSelectedSubjectId(null);
              setSelectedChapterId(null);
            }}
            className={`px-4 py-2 text-xs font-black rounded-lg uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === tab.id 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Grid selector: 1. SELECT CLASS */}
      {!selectedClassId && (
        <div className="space-y-4">
          <h3 className="text-sm font-extrabold text-slate-500 uppercase tracking-wide">Step 1: Choose Your Class Standard</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredClasses.map(cls => (
              <Card 
                key={cls.id} 
                hoverEffect 
                className="cursor-pointer border-slate-200/40 dark:border-slate-800/40 p-6 bg-white/70 dark:bg-slate-900/60 backdrop-blur-lg flex items-center justify-between"
                onClick={() => setSelectedClassId(cls.id)}
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 dark:text-white">{cls.name}</h4>
                    <p className="text-[10px] text-slate-400">Board exams mock past series.</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* 2. SELECT SUBJECT */}
      {selectedClassId && !selectedSubjectId && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-extrabold text-slate-500 uppercase tracking-wide">
              Step 2: Choose Subject ({classes.find(c => c.id === selectedClassId)?.name})
            </h3>
            <Button variant="ghost" size="sm" onClick={() => setSelectedClassId(null)} className="text-xs text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20">
              ← Change Class
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSubjects.map(sub => (
              <Card 
                key={sub.id} 
                hoverEffect 
                className="cursor-pointer border-slate-200/40 dark:border-slate-800/40 p-6 bg-white/70 dark:bg-slate-900/60 backdrop-blur-lg flex items-center justify-between"
                onClick={() => setSelectedSubjectId(sub.id)}
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 dark:text-white">{sub.name}</h4>
                    <p className="text-[10px] text-slate-400">Past board tests & mock series.</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* 3. SELECT CHAPTER */}
      {selectedClassId && selectedSubjectId && !selectedChapterId && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-extrabold text-slate-500 uppercase tracking-wide">
              Step 3: Choose Chapter Syllabus ({subjects.find(s => s.id === selectedSubjectId)?.name})
            </h3>
            <Button variant="ghost" size="sm" onClick={() => setSelectedSubjectId(null)} className="text-xs text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20">
              ← Change Subject
            </Button>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {filteredChapters.map(chap => (
              <Card 
                key={chap.id} 
                hoverEffect 
                className="cursor-pointer border-slate-200/40 dark:border-slate-800/40 p-5 bg-white/70 dark:bg-slate-900/60 backdrop-blur-lg flex items-center justify-between"
                onClick={() => setSelectedChapterId(chap.id)}
              >
                <div className="flex items-center gap-4">
                  <span className="text-xs font-black text-slate-400">CH {chap.orderIndex}</span>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-white">{chap.name}</h4>
                    <p className="text-[10px] text-slate-400">{chap.description}</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* 4. LAUNCH PYQ CBT PLAYER LIST */}
      {selectedClassId && selectedSubjectId && selectedChapterId && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/10 dark:bg-slate-900/40 p-5 rounded-2xl border border-slate-200/40 dark:border-slate-800/40">
            <div>
              <span className="text-[10px] font-black uppercase text-amber-500">Selected Syllabus Anchor</span>
              <h4 className="text-sm font-black text-slate-800 dark:text-slate-100">
                {classes.find(c => c.id === selectedClassId)?.name} → {subjects.find(s => s.id === selectedSubjectId)?.name} → {chapters.find(c => c.id === selectedChapterId)?.name}
              </h4>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setSelectedChapterId(null)} className="text-xs text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20">
              ← Change Chapter
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {pyqPapers.map(paper => (
              <Card key={paper.id} glassmorphism className="p-5 border border-slate-200/40 dark:border-slate-800/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1.5 text-left">
                  <div className="flex items-center gap-2">
                    <Badge variant="warning" className="bg-amber-500/15 text-amber-500 border border-amber-500/20 uppercase text-[8px] font-black tracking-wider">
                      CBT Past Paper
                    </Badge>
                    <span className="text-[10px] text-slate-400 font-bold">Solved Year: {paper.year}</span>
                  </div>
                  <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white leading-tight">
                    {paper.title}
                  </h3>
                  <div className="flex flex-wrap gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {paper.durationMinutes} Minutes</span>
                    <span className="flex items-center gap-1"><HelpCircle className="w-3.5 h-3.5" /> {paper.totalQuestions} Questions</span>
                    <span className="flex items-center gap-1"><Award className="w-3.5 h-3.5" /> {paper.totalMarks} Marks</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-md uppercase font-black tracking-wider ${
                      paper.difficulty === 'easy' ? 'bg-emerald-950 text-emerald-400 border border-emerald-900/50' :
                      paper.difficulty === 'hard' ? 'bg-red-950 text-red-400 border border-red-900/50' :
                      'bg-indigo-950 text-indigo-400 border border-indigo-900/50'
                    }`}>
                      {paper.difficulty}
                    </span>
                  </div>
                </div>
                <Button 
                  variant="primary" 
                  size="sm" 
                  onClick={() => handleLaunchCbt(paper)}
                  className="w-full sm:w-auto text-xs font-black uppercase tracking-wider bg-blue-600 hover:bg-blue-700 flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/25 shrink-0"
                >
                  <Play className="w-4 h-4 fill-current" /> Launch CBT Exam
                </Button>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
