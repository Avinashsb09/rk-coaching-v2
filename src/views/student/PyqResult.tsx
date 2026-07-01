import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { 
  Trophy, CheckCircle, AlertTriangle, AlertCircle, Clock, 
  HelpCircle, ArrowLeft, RefreshCw, Eye, Star, ChevronDown, ChevronUp 
} from 'lucide-react';

interface AttemptQuestionResult {
  id: string;
  questionText: string;
  options: { id: string; text: string; isCorrect: boolean }[];
  explanation: string;
  selectedOptionId: string | null;
  correctOptionId: string;
}

export default function PyqResult() {
  const { setCurrentView } = useApp();

  const rawAttempt = sessionStorage.getItem('last_pyq_attempt');
  if (!rawAttempt) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500 font-bold">No PYQ CBT result found in active session.</p>
        <Button variant="primary" className="mt-4" onClick={() => setCurrentView('pyq-dashboard')}>
          Back to PYQ Arena
        </Button>
      </div>
    );
  }

  const attempt = JSON.parse(rawAttempt);
  const questionsList: AttemptQuestionResult[] = attempt.questions || [];

  const [expandedQuestionId, setExpandedQuestionId] = useState<string | null>(null);

  // Time format helper
  const formatTimeSpent = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins}m ${remainingSecs}s`;
  };

  const toggleExpand = (id: string) => {
    if (expandedQuestionId === id) {
      setExpandedQuestionId(null);
    } else {
      setExpandedQuestionId(id);
    }
  };

  return (
    <div className="space-y-8 py-4 text-left animate-fade-in max-w-5xl mx-auto">
      {/* Upper Congrats Header */}
      <section className="bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/40 rounded-3xl p-6 sm:p-8 text-slate-900 dark:text-white relative overflow-hidden shadow-xl text-center">
        <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl" />
        <div className="max-w-md mx-auto space-y-4">
          <div className="h-16 w-16 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20 mx-auto shadow-inner">
            <Trophy className="w-9 h-9" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            CBT Paper Scorecard
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
            {attempt.paperTitle}
          </p>
          <div className="flex justify-center gap-2">
            <Badge variant={attempt.isPassed ? 'success' : 'danger'} className="text-[10px] font-black uppercase tracking-wider py-1 px-3.5 rounded-full">
              {attempt.isPassed ? 'PASSED (PASSING: 60%)' : 'FAILED (PASSING: 60%)'}
            </Badge>
          </div>
        </div>
      </section>

      {/* Grid Stats widgets */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card glassmorphism>
          <CardContent className="p-5 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Star className="w-5.5 h-5.5" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wide">Score Obtained</p>
              <p className="text-lg font-black text-slate-900 dark:text-white">{attempt.scoreObtained} / {attempt.totalQuestions * 3}</p>
            </div>
          </CardContent>
        </Card>

        <Card glassmorphism>
          <CardContent className="p-5 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle className="w-5.5 h-5.5" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wide">Correct Answers</p>
              <p className="text-lg font-black text-slate-900 dark:text-white text-emerald-500">{attempt.correctCount} Right</p>
            </div>
          </CardContent>
        </Card>

        <Card glassmorphism>
          <CardContent className="p-5 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center">
              <AlertTriangle className="w-5.5 h-5.5" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wide">Wrong / Skipped</p>
              <p className="text-lg font-black text-slate-900 dark:text-white text-red-500">{attempt.wrongCount} W / {attempt.skippedCount} S</p>
            </div>
          </CardContent>
        </Card>

        <Card glassmorphism>
          <CardContent className="p-5 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Clock className="w-5.5 h-5.5" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wide">Time Taken</p>
              <p className="text-lg font-black text-slate-900 dark:text-white">{formatTimeSpent(attempt.timeSpentSeconds)}</p>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* CBT Solutions Review Section */}
      <section className="space-y-4">
        <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <Eye className="w-5 h-5 text-indigo-500" />
          Review Solutions & Postulates
        </h2>

        <div className="space-y-3">
          {questionsList.map((q, idx) => {
            const isCorrect = q.selectedOptionId === q.correctOptionId;
            const isSkipped = !q.selectedOptionId;
            const isExpanded = expandedQuestionId === q.id;

            return (
              <Card key={q.id} className="border-slate-200/40 dark:border-slate-800/40 bg-white/70 dark:bg-slate-900/60 backdrop-blur-lg overflow-hidden">
                {/* Header collapse trigger */}
                <button
                  onClick={() => toggleExpand(q.id)}
                  className="w-full p-4 sm:p-5 flex items-center justify-between gap-4 text-left hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3.5">
                    <span className="text-xs font-black text-slate-400">Q{idx + 1}</span>
                    <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 truncate max-w-[250px] sm:max-w-xl">
                      {q.questionText}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {isSkipped ? (
                      <Badge variant="secondary" className="font-extrabold text-[8px] uppercase tracking-wide bg-slate-100 text-slate-500">SKIPPED</Badge>
                    ) : isCorrect ? (
                      <Badge variant="success" className="font-extrabold text-[8px] uppercase tracking-wide">CORRECT</Badge>
                    ) : (
                      <Badge variant="danger" className="font-extrabold text-[8px] uppercase tracking-wide">WRONG</Badge>
                    )}
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </div>
                </button>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="p-5 border-t border-slate-100 dark:border-slate-800/50 bg-slate-50/30 dark:bg-slate-900/20 space-y-4 text-xs sm:text-sm">
                    <p className="font-bold text-slate-800 dark:text-slate-200 leading-relaxed">
                      {q.questionText}
                    </p>

                    {/* Options status */}
                    <div className="grid grid-cols-1 gap-2.5">
                      {q.options.map((opt, oIdx) => {
                        const optLetter = ['A', 'B', 'C', 'D'][oIdx];
                        const isOptSelected = q.selectedOptionId === opt.id;
                        const isOptCorrect = opt.isCorrect;

                        let cardStyle = 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400';
                        if (isOptCorrect) {
                          cardStyle = 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400 font-bold';
                        } else if (isOptSelected) {
                          cardStyle = 'bg-red-500/10 border-red-500/30 text-red-700 dark:text-red-400 font-bold';
                        }

                        return (
                          <div 
                            key={opt.id} 
                            className={`p-3.5 rounded-xl border flex items-center gap-3 text-xs ${cardStyle}`}
                          >
                            <span className={`w-5 h-5 rounded flex items-center justify-center font-extrabold text-[10px] shrink-0 border ${
                              isOptCorrect ? 'bg-emerald-500 text-white border-emerald-500' :
                              isOptSelected ? 'bg-red-500 text-white border-red-500' :
                              'bg-slate-100 dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-500'
                            }`}>
                              {optLetter}
                            </span>
                            <span>{opt.text}</span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Explanation */}
                    <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-xl space-y-1.5 text-left">
                      <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-wider flex items-center gap-1.5">
                        <HelpCircle className="w-3.5 h-3.5" /> High-Yield Solution Explanation
                      </h4>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-semibold">
                        {q.explanation}
                      </p>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </section>

      {/* Button navigation row */}
      <footer className="pt-6 border-t border-slate-200 dark:border-slate-800/50 flex flex-wrap gap-4 justify-between items-center">
        <Button 
          variant="secondary"
          onClick={() => setCurrentView('pyq-dashboard')}
          leftIcon={<ArrowLeft className="w-4 h-4" />}
          className="text-xs font-bold"
        >
          Return to PYQ Arena
        </Button>
        <Button 
          variant="primary"
          onClick={() => setCurrentView('student-dashboard')}
          className="text-xs font-black uppercase bg-blue-600 hover:bg-blue-700"
        >
          Go to Student Dashboard
        </Button>
      </footer>
    </div>
  );
}
