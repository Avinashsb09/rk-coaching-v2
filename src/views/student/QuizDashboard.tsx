import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { 
  Trophy, BookOpen, Layers, Clock, Play, ChevronRight, Award, 
  HelpCircle, Sparkles, BrainCircuit, CheckCircle 
} from 'lucide-react';

export default function QuizDashboard() {
  const { 
    classes, 
    subjects, 
    chapters, 
    lessons, 
    quizzes, 
    quizQuestions,
    setCurrentView,
    addToast
  } = useApp();

  // Tab State: '6-9' | '10' | '11-12' | 'neet'
  const [activeTab, setActiveTab] = useState<'6-9' | '10' | '11-12' | 'neet'>('neet');
  
  // Selected state for navigation flow
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);

  // Helper: Get details for a quiz (lesson, chapter, subject, class)
  const getQuizMetadata = (quiz: any) => {
    const lesson = lessons.find(l => l.id === quiz.lessonId);
    const chapter = chapters.find(c => c.id === lesson?.chapterId);
    const subject = subjects.find(s => s.id === chapter?.subjectId);
    const cls = classes.find(c => c.id === subject?.classId);
    const qCount = quizQuestions.filter(q => q.quizId === quiz.id).length;
    return { lesson, chapter, subject, cls, qCount };
  };

  // Filter classes according to activeTab
  const getFilteredClasses = () => {
    if (activeTab === '6-9') {
      return classes.filter(c => ['class-6', 'class-7', 'class-8', 'class-9'].includes(c.slug));
    }
    if (activeTab === '10') {
      return classes.filter(c => c.slug === 'class-10');
    }
    if (activeTab === '11-12') {
      return classes.filter(c => ['class-11-science', 'class-12-science'].includes(c.slug));
    }
    return classes.filter(c => c.slug === 'neet');
  };

  const filteredClassIds = getFilteredClasses().map(c => c.id);

  // Subjects for filtered classes
  const filteredSubjects = subjects.filter(s => filteredClassIds.includes(s.classId));

  // If a subject is selected, chapters for that subject
  const filteredChapters = selectedSubjectId 
    ? chapters.filter(c => c.subjectId === selectedSubjectId)
    : [];

  const handleStartQuiz = (quizId: string) => {
    // Save selected quiz ID in sessionStorage for the CBT screen to pull
    sessionStorage.setItem('active_quiz_id', quizId);
    setCurrentView('quiz-play');
    addToast('Initializing CBT Quiz Engine...', 'success');
  };

  return (
    <div className="space-y-8 py-4 text-left animate-fade-in">
      
      {/* 1. HERO TOP LEADERBOARD SHORTCUT CARD */}
      <div className="p-6 border border-slate-200/40 dark:border-slate-800/40 rounded-3xl bg-slate-900/60 dark:bg-slate-950/40 backdrop-blur-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="flex items-center gap-4 relative z-10">
          <div className="h-14 w-14 rounded-2xl bg-amber-500/15 text-amber-500 flex items-center justify-center border border-amber-500/20 shadow-inner">
            <Trophy className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              LMS Gamified Leaderboard
              <Badge variant="warning" className="text-[8px] tracking-wider uppercase font-black px-1.5 py-0.5 rounded-lg">LIVE</Badge>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md font-semibold leading-relaxed">
              Correct answers yield +3 marks, wrong answers deduct -1. Compare your streak and accuracy against rankers in India.
            </p>
          </div>
        </div>
        <Button 
          variant="primary" 
          size="sm" 
          onClick={() => setCurrentView('leaderboard')}
          leftIcon={<Trophy className="w-4 h-4" />}
          className="w-full md:w-auto text-xs font-bold bg-amber-500 hover:bg-amber-600 border-none text-slate-950 shrink-0 shadow-lg shadow-amber-500/10"
        >
          See Leaderboard
        </Button>
      </div>

      {/* 2. TABBED CATEGORY FILTER */}
      <div className="space-y-6">
        <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800/80 pb-3">
          <h3 className="text-lg font-black text-slate-950 dark:text-white flex items-center gap-2.5">
            <BrainCircuit className="w-5.5 h-5.5 text-indigo-500" />
            Select Syllabus Class
          </h3>
          
          <div className="flex gap-1.5 p-1 bg-slate-100 dark:bg-slate-900/60 rounded-xl border border-slate-200/20">
            {(['6-9', '10', '11-12', 'neet'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setSelectedSubjectId(null);
                  setSelectedChapterId(null);
                }}
                className={`px-3 py-1.5 text-[11px] font-black rounded-lg uppercase tracking-wider transition-all cursor-pointer ${
                  activeTab === tab 
                    ? 'bg-indigo-600 text-white shadow-md' 
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                {tab === 'neet' ? 'NEET Prep' : `Class ${tab}`}
              </button>
            ))}
          </div>
        </div>

        {/* 3. GRID OF SUBJECTS FOR CHOSEN CLASS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filteredSubjects.map((sub) => {
            const cls = classes.find(c => c.id === sub.classId);
            const isSelected = selectedSubjectId === sub.id;
            return (
              <Card 
                key={sub.id} 
                hoverEffect 
                onClick={() => {
                  setSelectedSubjectId(sub.id);
                  setSelectedChapterId(null);
                }}
                className={`cursor-pointer transition-all border p-5 ${
                  isSelected 
                    ? 'border-indigo-500/50 bg-indigo-950/10 dark:bg-indigo-950/20' 
                    : 'border-slate-100 dark:border-slate-800 hover:border-indigo-500/20'
                }`}
              >
                <div className="flex items-start gap-4 text-left">
                  <div className="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0">
                    <BookOpen className="w-5.5 h-5.5" />
                  </div>
                  <div>
                    <span className="text-[8px] font-black text-indigo-400 uppercase tracking-widest bg-indigo-500/10 px-2 py-0.5 rounded">
                      {cls?.name}
                    </span>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 mt-2">
                      {sub.name}
                    </h4>
                    <p className="text-[10px] text-slate-400 mt-1 leading-normal font-semibold">
                      Click to expand chapter tests and mock cards.
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* 4. CHAPTER & QUIZ ROSTER */}
        {selectedSubjectId && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-slate-100 dark:border-slate-800/80 animate-fade-in">
            {/* Chapters list (Left Panel) */}
            <div className="md:col-span-1 space-y-3">
              <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">Chapters List</h4>
              {filteredChapters.length === 0 ? (
                <p className="text-xs text-slate-500 font-semibold">No chapter tests created yet.</p>
              ) : (
                <div className="space-y-2">
                  {filteredChapters.map((chap) => {
                    const isSelected = selectedChapterId === chap.id;
                    return (
                      <button
                        key={chap.id}
                        onClick={() => setSelectedChapterId(chap.id)}
                        className={`w-full p-3 rounded-2xl text-xs font-bold flex items-center justify-between transition-all border text-left cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-500/15'
                            : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-indigo-500/30'
                        }`}
                      >
                        <span className="truncate pr-2">{chap.name}</span>
                        <ChevronRight className="w-4 h-4 shrink-0" />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Quizzes list (Right Panel) */}
            <div className="md:col-span-2 space-y-4">
              <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">Available Quizzes</h4>
              
              {!selectedChapterId ? (
                <div className="p-8 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl text-center">
                  <Layers className="w-8 h-8 text-slate-400 mx-auto mb-2.5 opacity-60" />
                  <p className="text-xs text-slate-500 font-semibold">Select a chapter from the list to view its mock tests.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {quizzes.filter(q => {
                    // Match quiz by lesson chapter relation
                    const metadata = getQuizMetadata(q);
                    return metadata.chapter?.id === selectedChapterId;
                  }).length === 0 ? (
                    <div className="p-8 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl text-center">
                      <HelpCircle className="w-8 h-8 text-slate-400 mx-auto mb-2.5 opacity-60" />
                      <p className="text-xs text-slate-500 font-semibold">No active quizzes found in this chapter. Ask your instructor to publish one!</p>
                    </div>
                  ) : (
                    quizzes.filter(q => {
                      const metadata = getQuizMetadata(q);
                      return metadata.chapter?.id === selectedChapterId;
                    }).map((q) => {
                      const metadata = getQuizMetadata(q);
                      return (
                        <Card key={q.id} className="p-5 border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/30 backdrop-blur-md">
                          <CardContent className="p-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="space-y-1.5 text-left">
                              <h4 className="text-sm font-black text-slate-900 dark:text-slate-100">{q.title}</h4>
                              <div className="flex flex-wrap gap-3 mt-1.5 text-[10px] font-bold text-slate-500">
                                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {Math.round(q.timerSeconds / 60)} Mins</span>
                                <span className="flex items-center gap-1"><HelpCircle className="w-3.5 h-3.5" /> {metadata.qCount} Questions</span>
                                <span className="flex items-center gap-1"><Award className="w-3.5 h-3.5 text-emerald-500" /> Passing: {q.passingScorePct}%</span>
                              </div>
                            </div>
                            <Button
                              onClick={() => handleStartQuiz(q.id)}
                              variant="primary"
                              size="sm"
                              className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-lg shadow-indigo-500/10 shrink-0"
                              leftIcon={<Play className="w-3.5 h-3.5 fill-current" />}
                            >
                              Attempt Quiz
                            </Button>
                          </CardContent>
                        </Card>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
