import { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { 
  Clock, CheckCircle, AlertTriangle, AlertCircle, HelpCircle, 
  ArrowLeft, ArrowRight, BookOpen, Flag, RefreshCw 
} from 'lucide-react';

export default function PyqPlay() {
  const { 
    classes, 
    subjects, 
    chapters,
    setCurrentView,
    addToast,
    user
  } = useApp();

  const paperId = sessionStorage.getItem('active_pyq_id');
  const paperTitle = sessionStorage.getItem('active_pyq_title') || 'Solved Board PYQ Paper';
  const classId = sessionStorage.getItem('active_pyq_class_id') || 'c10';
  const subjectId = sessionStorage.getItem('active_pyq_subject_id') || '';
  const chapterId = sessionStorage.getItem('active_pyq_chapter_id') || '';
  const durationMinutes = Number(sessionStorage.getItem('active_pyq_duration') || '45');

  if (!paperId) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500 font-bold">PYQ CBT session parameters not found.</p>
        <Button variant="primary" className="mt-4" onClick={() => setCurrentView('pyq-dashboard')}>
          Back to PYQ Arena
        </Button>
      </div>
    );
  }

  // Generate deterministic questions for PYQ CBT based on subjectId/chapterId
  const getSubjectName = () => {
    const s = subjects.find(sub => sub.id === subjectId);
    return s ? s.name : 'Science';
  };

  const getChapterName = () => {
    const c = chapters.find(chap => chap.id === chapterId);
    return c ? c.name : 'Chapter';
  };

  const subjectName = getSubjectName();
  const chapterName = getChapterName();

  const generateDeterministicQuestions = () => {
    const list = [];
    const topics = [
      'Fundamental Concept Foundations',
      'Core Theoretical Formulation',
      'Advanced Analytical Derivation',
      'Formula Application & Mechanics',
      'Case-based Conceptual Reasoning'
    ];

    for (let i = 1; i <= 15; i++) {
      const topic = topics[(i - 1) % topics.length];
      const correctOptionIndex = (i * 7) % 4; // Deterministic index 0 to 3
      const options = [
        { id: `o_${i}_A`, text: `Option A: Standard conceptual definition under ${topic}`, isCorrect: correctOptionIndex === 0 },
        { id: `o_${i}_B`, text: `Option B: Theoretical mathematical model parameter`, isCorrect: correctOptionIndex === 1 },
        { id: `o_${i}_C`, text: `Option C: Empirical experimental result verification`, isCorrect: correctOptionIndex === 2 },
        { id: `o_${i}_D`, text: `Option D: Logical corollary derived from core postulates`, isCorrect: correctOptionIndex === 3 }
      ];

      // Insert actual correct indicator into text to make it easy to verify/test
      const letter = ['A', 'B', 'C', 'D'][correctOptionIndex];
      options[correctOptionIndex].text += ` (Correct Answer: ${letter})`;

      list.push({
        id: `q_${paperId}_${i}`,
        questionText: `[Question ${i}] Under ${subjectName} (${chapterName}), which of the following statements represents the most accurate scientific formulation regarding ${topic.toLowerCase()}?`,
        options,
        explanation: `Under standard board parameters, option ${letter} presents the most mathematically sound explanation for ${topic.toLowerCase()}.`,
        difficulty: i <= 5 ? 'easy' : i <= 10 ? 'medium' : 'hard',
        marks: 3,
        negativeMarks: 1,
        orderIndex: i
      });
    }
    return list;
  };

  const [questions] = useState(generateDeterministicQuestions());
  const [currentIdx, setCurrentIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(durationMinutes * 60);

  // CBT Answer state: maps questionId -> optionId
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [visited, setVisited] = useState<Set<string>>(new Set([questions[0]?.id].filter(Boolean)));
  const [markedForReview, setMarkedForReview] = useState<Set<string>>(new Set());
  const [saved, setSaved] = useState<Set<string>>(new Set());

  const currentQuestion = questions[currentIdx];
  const currentOptions = currentQuestion?.options || [];

  // Timer countdown hook
  useEffect(() => {
    if (timeLeft <= 0) {
      handleSubmitCbt(true);
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  // Track visited questions
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
    setSaved(prev => {
      const next = new Set(prev);
      next.delete(currentQuestion.id);
      return next;
    });
    handleNext();
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx(currentIdx - 1);
    }
  };

  // Submit CBT Quiz Play Session
  const handleSubmitCbt = (auto = false) => {
    if (!auto) {
      const confirmSubmit = window.confirm('Are you sure you want to submit your CBT exam paper?');
      if (!confirmSubmit) return;
    }

    // Math grading calculations (+3/-1)
    let scoreObtained = 0;
    let correctCount = 0;
    let wrongCount = 0;
    let skippedCount = 0;

    questions.forEach(q => {
      const selectedOptionId = answers[q.id];
      if (!selectedOptionId) {
        skippedCount++;
      } else {
        const selectedOption = q.options.find(o => o.id === selectedOptionId);
        if (selectedOption?.isCorrect) {
          correctCount++;
          scoreObtained += 3;
        } else {
          wrongCount++;
          scoreObtained -= 1;
        }
      }
    });

    const timeSpent = durationMinutes * 60 - timeLeft;
    const accuracy = correctCount + wrongCount > 0 
      ? Math.round((correctCount / (correctCount + wrongCount)) * 100) 
      : 0;

    const totalQuestions = questions.length;
    const maxMarks = totalQuestions * 3;
    const passingScorePct = 60;
    const passingMarks = Math.round((passingScorePct / 100) * maxMarks);
    const isPassed = scoreObtained >= passingMarks;

    const resultPayload = {
      paperId,
      paperTitle,
      classId,
      subjectId,
      subjectName,
      chapterId,
      chapterName,
      scoreObtained,
      totalQuestions,
      correctCount,
      wrongCount,
      skippedCount,
      accuracy,
      timeSpentSeconds: timeSpent,
      isPassed,
      attemptedAt: new Date().toISOString(),
      questions: questions.map(q => ({
        id: q.id,
        questionText: q.questionText,
        options: q.options,
        explanation: q.explanation,
        selectedOptionId: answers[q.id] || null,
        correctOptionId: q.options.find(o => o.isCorrect)?.id || ''
      }))
    };

    // Save attempt inside sessionStorage to render results
    sessionStorage.setItem('last_pyq_attempt', JSON.stringify(resultPayload));
    
    // Add toast and redirect
    addToast(auto ? 'Time limit reached! Auto-submitted paper.' : 'CBT Paper submitted successfully!', 'success');
    setCurrentView('pyq-result');
  };

  // Helper formatting for timer
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6 py-4 text-left animate-fade-in">
      {/* Upper info row */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 border border-slate-200/40 dark:border-slate-800/40 rounded-2xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-lg">
        <div>
          <span className="text-[10px] font-black uppercase text-amber-500">Live Simulator</span>
          <h2 className="text-sm sm:text-base font-extrabold text-slate-800 dark:text-white leading-tight">
            {paperTitle}
          </h2>
        </div>

        {/* Live Timer Widget */}
        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-black transition-all ${
          timeLeft < 180 
            ? 'bg-red-500/10 border-red-500/20 text-red-500 animate-pulse' 
            : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-600 dark:text-indigo-400'
        }`}>
          <Clock className="w-4 h-4 shrink-0" />
          <span>TIME LEFT: {formatTime(timeLeft)}</span>
        </div>
      </div>

      {/* Main split dashboard: Q on left, Palette on right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        
        {/* Left pane: Active Question Canvas */}
        <div className="lg:col-span-2 flex flex-col justify-between space-y-4">
          <Card className="border-slate-200/40 dark:border-slate-800/40 bg-white/70 dark:bg-slate-900/60 backdrop-blur-lg flex-1 flex flex-col justify-between min-h-[350px]">
            <CardContent className="p-6 space-y-6 flex-1 flex flex-col justify-between">
              {/* Question details header */}
              <div className="space-y-4 flex-1">
                <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800/50">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                    Question {currentIdx + 1} of {questions.length}
                  </span>
                  <Badge variant="info" className="bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 font-black uppercase text-[8px]">
                    Marks: +3 / -1
                  </Badge>
                </div>

                <p className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-relaxed">
                  {currentQuestion?.questionText}
                </p>

                {/* Options List */}
                <div className="grid grid-cols-1 gap-3 pt-2">
                  {currentOptions.map((opt, idx) => {
                    const isSelected = answers[currentQuestion.id] === opt.id;
                    const letter = ['A', 'B', 'C', 'D'][idx];
                    return (
                      <button
                        key={opt.id}
                        onClick={() => handleSelectOption(opt.id)}
                        className={`w-full p-4 rounded-xl border text-xs sm:text-sm font-semibold text-left transition-all flex items-center gap-3 cursor-pointer ${
                          isSelected
                            ? 'bg-blue-600 border-blue-600 text-white shadow-md'
                            : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900'
                        }`}
                      >
                        <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-extrabold text-[11px] shrink-0 border ${
                          isSelected 
                            ? 'bg-white/20 border-white/20 text-white' 
                            : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-500'
                        }`}>
                          {letter}
                        </span>
                        <span>{opt.text}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Action row bottom */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-slate-800/50 mt-4">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleMarkForReview}
                    className="text-xs font-bold border-amber-500/40 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10"
                  >
                    Mark for Review
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearResponse}
                    className="text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900"
                  >
                    Clear Response
                  </Button>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSaveAndNext}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                  className="text-xs font-black uppercase bg-blue-600 hover:bg-blue-700"
                >
                  Save & Next
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Navigation buttons lower row */}
          <div className="flex justify-between items-center">
            <Button
              variant="secondary"
              size="sm"
              onClick={handlePrev}
              disabled={currentIdx === 0}
              leftIcon={<ArrowLeft className="w-4 h-4" />}
              className="text-xs font-bold"
            >
              Previous
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleNext}
              disabled={currentIdx === questions.length - 1}
              rightIcon={<ArrowRight className="w-4 h-4" />}
              className="text-xs font-bold"
            >
              Next
            </Button>
          </div>
        </div>

        {/* Right pane: Status Palette & Submission Summary */}
        <div className="space-y-4 flex flex-col justify-between">
          <Card className="border-slate-200/40 dark:border-slate-800/40 bg-white/70 dark:bg-slate-900/60 backdrop-blur-lg flex-1 p-5 flex flex-col justify-between">
            <div className="space-y-6">
              <h3 className="text-xs font-black uppercase text-slate-400 pb-3 border-b border-slate-100 dark:border-slate-800/50">
                Question Palette
              </h3>

              {/* Grid bubble counts */}
              <div className="grid grid-cols-5 gap-2.5">
                {questions.map((q, idx) => {
                  const isCurrent = idx === currentIdx;
                  const isSaved = saved.has(q.id);
                  const isMarked = markedForReview.has(q.id);
                  const isVisited = visited.has(q.id);

                  let colorClass = 'bg-slate-100 dark:bg-slate-950 text-slate-500 border-slate-200 dark:border-slate-800';
                  if (isSaved) {
                    colorClass = 'bg-emerald-600 border-emerald-600 text-white shadow-sm';
                  } else if (isMarked) {
                    colorClass = 'bg-amber-500 border-amber-500 text-white shadow-sm';
                  } else if (isVisited) {
                    colorClass = 'bg-red-500/10 border-red-500/20 text-red-500';
                  }

                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentIdx(idx)}
                      className={`h-9 w-9 rounded-lg border text-xs font-black flex items-center justify-center transition-all cursor-pointer ${colorClass} ${
                        isCurrent ? 'ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-slate-900 scale-105' : ''
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              {/* Status Labels */}
              <div className="grid grid-cols-2 gap-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 pt-4 border-t border-slate-100 dark:border-slate-800/50">
                <div className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded bg-emerald-600 inline-block" />
                  <span>Answered ({saved.size})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded bg-amber-500 inline-block" />
                  <span>Marked for Review ({markedForReview.size})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded bg-red-500/10 border border-red-500/20 inline-block" />
                  <span>Not Answered ({visited.size - saved.size - markedForReview.size})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded bg-slate-100 dark:bg-slate-950 inline-block" />
                  <span>Not Visited ({questions.length - visited.size})</span>
                </div>
              </div>
            </div>

            {/* Submit Paper Button */}
            <div className="pt-6 border-t border-slate-100 dark:border-slate-800/50 mt-6">
              <Button
                variant="primary"
                onClick={() => handleSubmitCbt(false)}
                leftIcon={<CheckCircle className="w-4 h-4 fill-current" />}
                className="w-full h-11 text-xs font-black uppercase bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-500/20"
              >
                Submit Exam Paper
              </Button>
            </div>
          </Card>
        </div>

      </div>
    </div>
  );
}
