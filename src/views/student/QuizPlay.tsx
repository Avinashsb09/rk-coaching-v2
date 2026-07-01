import { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { 
  Clock, CheckCircle, AlertTriangle, AlertCircle, HelpCircle, 
  ArrowLeft, ArrowRight, BookOpen, Flag, RefreshCw 
} from 'lucide-react';

export default function QuizPlay() {
  const { 
    quizzes, 
    quizQuestions, 
    quizOptions, 
    quizAttempts, 
    setQuizAttempts,
    user,
    setUsers,
    setCurrentView,
    addToast
  } = useApp();

  const quizId = sessionStorage.getItem('active_quiz_id');
  const quiz = quizzes.find(q => q.id === quizId);

  if (!quiz) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-505 font-bold">Quiz session not found.</p>
        <Button variant="primary" className="mt-4" onClick={() => setCurrentView('quiz-dashboard')}>
          Back to Quiz Arena
        </Button>
      </div>
    );
  }

  // Get questions and option list
  const questions = quizQuestions.filter(q => q.quizId === quiz.id).sort((a, b) => a.orderIndex - b.orderIndex);
  
  const [currentIdx, setCurrentIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(quiz.timerSeconds);
  
  // CBT states
  const [answers, setAnswers] = useState<Record<string, string>>({}); // maps questionId -> optionId
  const [visited, setVisited] = useState<Set<string>>(new Set([questions[0]?.id].filter(Boolean)));
  const [markedForReview, setMarkedForReview] = useState<Set<string>>(new Set());
  const [saved, setSaved] = useState<Set<string>>(new Set());

  const currentQuestion = questions[currentIdx];
  const currentOptions = quizOptions.filter(o => o.questionId === currentQuestion?.id);

  // Timer tick down
  useEffect(() => {
    if (timeLeft <= 0) {
      handleSubmitQuiz();
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  // Track visited question when index changes
  useEffect(() => {
    if (currentQuestion) {
      setVisited(prev => {
        const next = new Set(prev);
        next.add(currentQuestion.id);
        return next;
      });
    }
  }, [currentIdx, currentQuestion]);

  const handleSelectOption = (optionId: string) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: optionId
    }));
  };

  const handleClearResponse = () => {
    setAnswers(prev => {
      const next = { ...prev };
      delete next[currentQuestion.id];
      return next;
    });
    setSaved(prev => {
      const next = new Set(prev);
      next.delete(currentQuestion.id);
      return next;
    });
  };

  const handleSaveAndNext = () => {
    if (answers[currentQuestion.id]) {
      setSaved(prev => {
        const next = new Set(prev);
        next.add(currentQuestion.id);
        return next;
      });
      // Unmark from review if it was marked
      setMarkedForReview(prev => {
        const next = new Set(prev);
        next.delete(currentQuestion.id);
        return next;
      });
    }
    handleNext();
  };

  const handleMarkForReview = () => {
    setMarkedForReview(prev => {
      const next = new Set(prev);
      next.add(currentQuestion.id);
      return next;
    });
    // Remove from saved if we want review state to dominate
    setSaved(prev => {
      const next = new Set(prev);
      next.delete(currentQuestion.id);
      return next;
    });
    handleNext();
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx(prev => prev - 1);
    }
  };

  const handleSubmitQuiz = () => {
    let score = 0;
    let correctCount = 0;
    let wrongCount = 0;
    let skippedCount = 0;

    questions.forEach(q => {
      const answerOptId = answers[q.id];
      if (!answerOptId) {
        skippedCount++;
      } else {
        const opt = quizOptions.find(o => o.id === answerOptId);
        if (opt && opt.isCorrect) {
          correctCount++;
          score += 3; // +3 Marks
        } else {
          wrongCount++;
          score -= 1; // -1 Mark
        }
      }
    });

    const totalAnswered = correctCount + wrongCount;
    const accuracy = totalAnswered > 0 ? Math.round((correctCount / totalAnswered) * 100) : 0;
    const timeTaken = quiz.timerSeconds - timeLeft;

    // Create attempt object
    const attemptId = `att_${Date.now()}`;
    const passingThreshold = questions.length * 3 * (quiz.passingScorePct / 100);
    const isPassed = score >= passingThreshold;

    const newAttempt = {
      id: attemptId,
      userId: user?.id || 'usr_student',
      quizId: quiz.id,
      scoreObtained: score,
      totalQuestions: questions.length,
      isPassed,
      attemptedAt: new Date().toISOString(),
      correctCount,
      wrongCount,
      skippedCount,
      accuracy,
      timeTakenSeconds: timeTaken,
      quizTitle: quiz.title
    };

    // Update attempts array
    setQuizAttempts(prev => [newAttempt, ...prev]);

    // Recalculate/award student XP reactively if logged in
    if (user) {
      const xpReward = Math.max(0, score * 10) + (isPassed ? 100 : 20); // pass bonus +100 XP
      setUsers(prev => prev.map(u => u.id === user.id ? {
        ...u,
        totalXp: u.totalXp + xpReward
      } : u));
      addToast(`Quiz submitted! Awarded +${xpReward} XP Points.`, 'success');
    } else {
      addToast('Quiz submitted successfully!', 'success');
    }

    sessionStorage.setItem('last_quiz_attempt', JSON.stringify(newAttempt));
    setCurrentView('quiz-result');
  };

  // Helper: Format countdown timer
  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Color mappings for question palette status:
  const getPaletteColor = (qId: string) => {
    if (markedForReview.has(qId)) return 'bg-amber-500 text-slate-950 border-amber-400';
    if (saved.has(qId)) return 'bg-emerald-600 text-white border-emerald-500';
    if (visited.has(qId)) return 'bg-red-500 text-white border-red-400';
    return 'bg-slate-800 text-slate-400 border-slate-700';
  };

  return (
    <div className="space-y-6 py-4 text-left animate-fade-in">
      {/* Top bar header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-5 bg-slate-900 border border-slate-800 rounded-3xl text-slate-100">
        <div>
          <span className="text-[9px] uppercase font-black tracking-widest text-indigo-400">Computer Based Test (CBT) Dashboard</span>
          <h2 className="text-base font-black truncate max-w-sm mt-0.5">{quiz.title}</h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-base font-extrabold text-indigo-400">
            <Clock className="w-5 h-5 text-indigo-400 shrink-0" />
            <span>{formatTimer(timeLeft)}</span>
          </div>
          <Button
            onClick={handleSubmitQuiz}
            variant="primary"
            size="sm"
            className="text-xs font-black bg-red-600 hover:bg-red-700 border-none px-4"
          >
            Submit Quiz
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden border border-slate-900">
        <div 
          className="bg-indigo-500 h-full rounded-full transition-all duration-500"
          style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* Main Roster Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* CBT Question Display (Left Panels) */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-slate-800 bg-slate-900/60 backdrop-blur-md">
            <CardContent className="p-6 space-y-6">
              {/* Question Text */}
              <div className="space-y-3">
                <span className="text-[10px] uppercase font-black tracking-wider px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400">
                  Question {currentIdx + 1} of {questions.length}
                </span>
                <p className="text-sm font-bold text-slate-100 leading-relaxed">
                  {currentQuestion?.questionText}
                </p>
              </div>

              {/* Options list */}
              <div className="space-y-2.5">
                {currentOptions.map((opt) => {
                  const isSelected = answers[currentQuestion.id] === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => handleSelectOption(opt.id)}
                      className={`w-full p-4 rounded-2xl text-xs font-bold text-left flex items-center justify-between border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-600/15 border-indigo-500 text-indigo-400'
                          : 'bg-slate-950/40 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <span>{opt.optionText}</span>
                      <div className={`h-4 w-4 rounded-full border flex items-center justify-center shrink-0 ${
                        isSelected ? 'border-indigo-400 bg-indigo-500' : 'border-slate-700'
                      }`}>
                        {isSelected && <div className="h-1.5 w-1.5 rounded-full bg-slate-950" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Controls Footer buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex gap-2">
              <Button
                onClick={handlePrev}
                disabled={currentIdx === 0}
                variant="outline"
                size="sm"
                className="text-xs font-bold border-slate-800 text-slate-300 hover:bg-slate-800 disabled:opacity-50"
              >
                Previous
              </Button>
              <Button
                onClick={handleNext}
                disabled={currentIdx === questions.length - 1}
                variant="outline"
                size="sm"
                className="text-xs font-bold border-slate-800 text-slate-300 hover:bg-slate-800 disabled:opacity-50"
              >
                Next
              </Button>
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={handleClearResponse}
                variant="secondary"
                size="sm"
                className="text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border-none"
              >
                Clear Response
              </Button>
              <Button
                onClick={handleMarkForReview}
                variant="secondary"
                size="sm"
                className="text-xs font-bold bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30"
              >
                Mark For Review
              </Button>
              <Button
                onClick={handleSaveAndNext}
                variant="primary"
                size="sm"
                className="text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white border-none shadow-lg shadow-emerald-600/10"
              >
                Save & Next
              </Button>
            </div>
          </div>
        </div>

        {/* Question Palette Dashboard (Right Panel) */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-slate-800 bg-slate-900/60 backdrop-blur-md p-5 text-slate-300">
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-4">Question Palette</h3>
            
            {/* Grid of question bubbles */}
            <div className="grid grid-cols-5 gap-2.5">
              {questions.map((q, idx) => (
                <button
                  key={q.id}
                  onClick={() => setCurrentIdx(idx)}
                  className={`h-9 w-9 rounded-xl border flex items-center justify-center font-bold text-xs cursor-pointer transition-all hover:scale-105 ${getPaletteColor(q.id)}`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>

            {/* Legend guide log */}
            <div className="mt-6 border-t border-slate-800 pt-4 space-y-2 text-[10px] font-bold">
              <div className="flex items-center gap-2.5">
                <div className="h-3.5 w-3.5 rounded bg-emerald-600 border border-emerald-500" />
                <span>Answered ({saved.size})</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="h-3.5 w-3.5 rounded bg-red-500 border border-red-400" />
                <span>Not Answered ({visited.size - saved.size - markedForReview.size})</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="h-3.5 w-3.5 rounded bg-amber-500 border border-amber-400" />
                <span>Marked for Review ({markedForReview.size})</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="h-3.5 w-3.5 rounded bg-slate-800 border border-slate-700" />
                <span>Not Visited ({questions.length - visited.size})</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
