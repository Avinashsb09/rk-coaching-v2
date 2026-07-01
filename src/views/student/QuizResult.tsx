import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { 
  Trophy, CheckCircle, XCircle, AlertCircle, ArrowLeft, 
  HelpCircle, RefreshCw, Printer, Download, BookOpen, Clock, Target 
} from 'lucide-react';

export default function QuizResult() {
  const { 
    quizzes, 
    quizQuestions, 
    quizOptions, 
    setCurrentView,
    addToast
  } = useApp();

  const [reviewMode, setReviewMode] = useState(false);

  const attemptStr = sessionStorage.getItem('last_quiz_attempt');
  const attempt = attemptStr ? JSON.parse(attemptStr) : null;

  if (!attempt) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500 font-bold">No recent attempt results cached.</p>
        <Button variant="primary" className="mt-4" onClick={() => setCurrentView('quiz-dashboard')}>
          Back to Quiz Arena
        </Button>
      </div>
    );
  }

  const quiz = quizzes.find(q => q.id === attempt.quizId);
  const questions = quizQuestions.filter(q => q.quizId === attempt.quizId).sort((a, b) => a.orderIndex - b.orderIndex);

  const handlePrintScorecard = () => {
    window.print();
  };

  const handleDownloadScorecard = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(attempt, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `scorecard_${attempt.id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    addToast('Scorecard JSON downloaded!', 'success');
  };

  return (
    <div className="space-y-8 py-4 text-left animate-fade-in">
      
      {/* 1. SCORE SUMMARY HERO HEADER CARD */}
      <div className="p-6 border border-slate-200/40 dark:border-slate-800/40 rounded-3xl bg-slate-900/60 dark:bg-slate-950/40 backdrop-blur-lg flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl text-slate-100">
        <div className="space-y-2 text-left">
          <Badge variant={attempt.isPassed ? 'success' : 'danger'} className="uppercase font-black text-[9px] tracking-wider px-2 py-0.5">
            {attempt.isPassed ? 'Test Cleared' : 'Below Passing Score'}
          </Badge>
          <h2 className="text-lg font-black">{attempt.quizTitle || 'Practice Chapter Quiz'} Result</h2>
          <p className="text-xs text-slate-400 font-semibold leading-relaxed">
            Completed on {new Date(attempt.attemptedAt).toLocaleString('en-IN')}. Correct answers yielded +3 marks; wrong answers deducted -1.
          </p>
        </div>
        <div className="flex gap-2 w-full md:w-auto shrink-0">
          <Button
            onClick={handlePrintScorecard}
            variant="outline"
            size="sm"
            className="w-full md:w-auto text-xs font-bold border-slate-800 text-slate-300 hover:bg-slate-800"
            leftIcon={<Printer className="w-4 h-4" />}
          >
            Print
          </Button>
          <Button
            onClick={handleDownloadScorecard}
            variant="outline"
            size="sm"
            className="w-full md:w-auto text-xs font-bold border-slate-800 text-slate-300 hover:bg-slate-800"
            leftIcon={<Download className="w-4 h-4" />}
          >
            Download Scorecard
          </Button>
        </div>
      </div>

      {/* 2. STATS GRID BUBBLES */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Marks Obtained', value: `${attempt.scoreObtained} / ${attempt.totalQuestions * 3}`, sub: 'Score tally (+3 / -1)', icon: Trophy, color: 'text-indigo-400 border-indigo-900/30 bg-indigo-950/20' },
          { label: 'Correct Answers', value: `${attempt.correctCount} Right`, sub: `${attempt.wrongCount} Wrong / ${attempt.skippedCount} Skipped`, icon: CheckCircle, color: 'text-emerald-400 border-emerald-900/30 bg-emerald-950/20' },
          { label: 'Test Accuracy', value: `${attempt.accuracy}%`, sub: 'Answer precision rate', icon: Target, color: 'text-amber-400 border-amber-900/30 bg-amber-950/20' },
          { label: 'Time Spent', value: `${Math.floor(attempt.timeTakenSeconds / 60)}m ${attempt.timeTakenSeconds % 60}s`, sub: `Allocated: ${Math.round((quiz?.timerSeconds || 180) / 60)} Mins`, icon: Clock, color: 'text-blue-400 border-blue-900/30 bg-blue-950/20' }
        ].map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Card key={idx} className={`border ${stat.color}`}>
              <CardContent className="p-5 flex items-center gap-4 text-left">
                <div className="h-10 w-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase text-slate-500 tracking-wider">{stat.label}</p>
                  <p className="text-base font-extrabold text-slate-100 mt-0.5">{stat.value}</p>
                  <p className="text-[9px] text-slate-400 font-semibold mt-0.5">{stat.sub}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* 3. CTA CONTROLS */}
      <div className="flex gap-4">
        <Button
          onClick={() => setCurrentView('quiz-dashboard')}
          variant="secondary"
          className="text-xs font-bold py-2.5 px-5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800"
          leftIcon={<ArrowLeft className="w-4 h-4" />}
        >
          Return to Arena
        </Button>
        <Button
          onClick={() => setReviewMode(!reviewMode)}
          variant="primary"
          className="text-xs font-bold py-2.5 px-5 bg-indigo-600 hover:bg-indigo-700 text-white"
          leftIcon={<BookOpen className="w-4 h-4" />}
        >
          {reviewMode ? 'Hide Question Review' : 'Review Answers'}
        </Button>
      </div>

      {/* 4. QUESTION BY QUESTION DETAILED REVIEW */}
      {reviewMode && (
        <div className="space-y-6 pt-4 border-t border-slate-100 dark:border-slate-800/80 animate-fade-in">
          <h3 className="text-base font-black text-slate-950 dark:text-white flex items-center gap-2">
            <HelpCircle className="w-5.5 h-5.5 text-indigo-500" />
            Detailed Question Review
          </h3>

          <div className="space-y-4">
            {questions.map((q, idx) => {
              const qOptions = quizOptions.filter(o => o.questionId === q.id);
              const correctOpt = qOptions.find(o => o.isCorrect);
              // In review mode, we can show option explanations if available
              return (
                <Card key={q.id} className="border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                  <CardContent className="p-5 space-y-4 text-left">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      <span className="text-indigo-500 mr-1.5">Q{idx + 1}.</span>
                      {q.questionText}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-semibold">
                      {qOptions.map((opt) => (
                        <div 
                          key={opt.id} 
                          className={`p-3 rounded-xl border flex items-center justify-between ${
                            opt.isCorrect 
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/20 dark:border-emerald-900/40 dark:text-emerald-400' 
                              : 'bg-slate-50 dark:bg-slate-950/50 border-slate-100 dark:border-slate-800/60 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          <span>{opt.optionText}</span>
                          {opt.isCorrect && <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />}
                        </div>
                      ))}
                    </div>

                    <div className="p-3.5 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl text-[11px] font-semibold text-slate-500 dark:text-slate-400 leading-relaxed">
                      <p className="font-black text-indigo-400 uppercase tracking-wide text-[9px] mb-1">Answer explanation</p>
                      The correct answer is <span className="font-extrabold text-indigo-500 dark:text-indigo-400">"{correctOpt?.optionText}"</span>. Review the chapter core notes and formulas tab to solidify electrostatics charge definitions and vector field derivations.
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
