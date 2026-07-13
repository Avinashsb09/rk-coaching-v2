/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { BrainCircuit, ChevronRight, AlertTriangle, PlayCircle, RotateCcw, BookOpen } from 'lucide-react';
import { getSupabase, isSupabaseConfigured } from '../../lib/supabase';

/** Quiz question availability states */
type QuizCheckState = 'idle' | 'checking' | 'ready' | 'empty' | 'error';

export default function QuizDashboard() {
  const { 
    classes, 
    subjects, 
    chapters,
    lessons,
    quizzes,
    quizQuestions,
    setCurrentView,
    addToast,
    user
  } = useApp();

  // Selection states
  const [classId, setClassId] = useState<string>('');
  const [subjectId, setSubjectId] = useState<string>('');
  const [chapterId, setChapterId] = useState<string>('');

  // Quiz availability check state
  const [quizCheckState, setQuizCheckState] = useState<QuizCheckState>('idle');
  const [questionCount, setQuestionCount] = useState<number>(0);
  const [activeQuizId, setActiveQuizId] = useState<string | null>(null);
  const checkRequestVersionRef = useRef<number>(0);

  const allowedClassIds = ['c6', 'c7', 'c8', 'c9', 'c10', 'c11s', 'c12s', 'neet', 'bpharma', 'nursing'];
  const filteredClasses = classes.filter(c => allowedClassIds.includes(c.id));

  // Auto-detect registered standard on mount/load
  useEffect(() => {
    if (user?.classId) {
      const matched = classes.find(c => c.id === user.classId || c.slug === user.classId);
      if (matched && allowedClassIds.includes(matched.id)) {
        setClassId(matched.id);
      }
    }
  }, [user, classes]);

  // Reset selections when parent fields change
  const handleClassChange = (val: string) => {
    checkRequestVersionRef.current++;
    setClassId(val);
    setSubjectId('');
    setChapterId('');
    setQuizCheckState('idle');
    setActiveQuizId(null);
  };

  const handleSubjectChange = (val: string) => {
    checkRequestVersionRef.current++;
    setSubjectId(val);
    setChapterId('');
    setQuizCheckState('idle');
    setActiveQuizId(null);
  };

  const handleChapterChange = (val: string) => {
    checkRequestVersionRef.current++;
    setChapterId(val);
    setQuizCheckState('idle');
    setActiveQuizId(null);
    setQuestionCount(0);
  };

  // Filter subjects based on selected classId
  const activeSubjects = classId ? subjects.filter(s => s.classId === classId) : [];

  // Filter chapters list based on selected subjectId
  const activeChapters = subjectId ? chapters.filter(c => c.subjectId === subjectId) : [];

  /**
   * Check question availability for selected chapter.
   * Strategy:
   *  1. Find lessons for the selected chapter.
   *  2. Find quizzes linked to those lessons.
   *  3. Count quiz_questions for those quizzes.
   * Falls back to context data when Supabase not configured.
   */
  const checkQuizAvailability = useCallback(async () => {
    if (!chapterId) return;

    const currentVersion = ++checkRequestVersionRef.current;

    setQuizCheckState('checking');
    setQuestionCount(0);
    setActiveQuizId(null);

    try {
      // --- Get lessons for selected chapter ---
      const chapterLessons = lessons.filter(l => l.chapterId === chapterId);
      const lessonIds = chapterLessons.map(l => l.id);

      if (lessonIds.length === 0) {
        if (currentVersion !== checkRequestVersionRef.current) return;
        console.log('[QuizDashboard] QUIZ_AVAILABILITY_EMPTY: No lessons found for chapter', chapterId);
        setQuizCheckState('empty');
        return;
      }

      // --- Find quizzes for those lessons (from context first) ---
      const contextQuizzes = quizzes.filter(q => lessonIds.includes(q.lessonId));

      if (isSupabaseConfigured()) {
        const supabase = getSupabase();
        if (!supabase) throw new Error('Supabase not available');

        // Query quiz_questions via supabase for these quizzes
        if (contextQuizzes.length > 0) {
          const quizIds = contextQuizzes.map(q => q.id);
          const { data, error } = await supabase
            .from('quiz_questions')
            .select('id, quizId', { count: 'exact' })
            .in('quizId', quizIds);

          if (error) throw error;

          if (currentVersion !== checkRequestVersionRef.current) return;

          const count = data?.length ?? 0;
          setQuestionCount(count);

          if (count > 0) {
            // Pick first quiz that has questions
            const firstQuizWithQs = contextQuizzes.find(q =>
              data?.some((row: any) => row.quizId === q.id)
            );
            setActiveQuizId(firstQuizWithQs?.id ?? contextQuizzes[0].id);
            setQuizCheckState('ready');
          } else {
            console.log('[QuizDashboard] QUIZ_AVAILABILITY_EMPTY: Quiz exists but has zero questions', { quizIds });
            setQuizCheckState('empty');
          }
        } else {
          // No quizzes in context — query supabase directly via lesson ids
          const { data: quizData, error: quizErr } = await supabase
            .from('quizzes')
            .select('id')
            .in('lessonId', lessonIds);

          if (quizErr) throw quizErr;

          if (currentVersion !== checkRequestVersionRef.current) return;

          if (!quizData || quizData.length === 0) {
            console.log('[QuizDashboard] QUIZ_AVAILABILITY_EMPTY: No quizzes found for lessons', { lessonIds });
            setQuizCheckState('empty');
            return;
          }

          const dbQuizIds = quizData.map((q: any) => q.id);
          const { data: qData, error: qErr } = await supabase
            .from('quiz_questions')
            .select('id, quizId', { count: 'exact' })
            .in('quizId', dbQuizIds);

          if (qErr) throw qErr;

          if (currentVersion !== checkRequestVersionRef.current) return;

          const count = qData?.length ?? 0;
          setQuestionCount(count);

          if (count > 0) {
            const firstQuizWithQs = dbQuizIds.find((id: string) =>
              qData?.some((row: any) => row.quizId === id)
            );
            setActiveQuizId(firstQuizWithQs ?? dbQuizIds[0]);
            setQuizCheckState('ready');
          } else {
            console.log('[QuizDashboard] QUIZ_AVAILABILITY_EMPTY: Quizzes found but have zero questions', { dbQuizIds });
            setQuizCheckState('empty');
          }
        }
      } else {
        if (currentVersion !== checkRequestVersionRef.current) return;

        // Supabase not configured — use context data
        const contextQIds = contextQuizzes.map(q => q.id);
        const contextQCount = quizQuestions.filter(qq => contextQIds.includes(qq.quizId)).length;

        setQuestionCount(contextQCount);

        if (contextQCount > 0 && contextQuizzes.length > 0) {
          const firstQuiz = contextQuizzes.find(q =>
            quizQuestions.some(qq => qq.quizId === q.id)
          );
          setActiveQuizId(firstQuiz?.id ?? contextQuizzes[0].id);
          setQuizCheckState('ready');
        } else {
          console.log('[QuizDashboard] QUIZ_AVAILABILITY_EMPTY (mock data): Zero questions');
          setQuizCheckState('empty');
        }
      }
    } catch (err: any) {
      if (currentVersion !== checkRequestVersionRef.current) return;
      console.error('[QuizDashboard] QUIZ_AVAILABILITY_ERROR:', {
        table: 'quiz_questions',
        classId,
        subjectId,
        chapterId,
        code: err?.code,
        message: err?.message,
        details: err?.details
      });
      setQuizCheckState('error');
      addToast('Unable to check question availability. Please try again.', 'error');
    }
  }, [chapterId, lessons, quizzes, quizQuestions, addToast]);

  /** Launch the CBT quiz session */
  const handleStartQuiz = () => {
    if (!activeQuizId) {
      addToast('No quiz found for the selected chapter.', 'error');
      return;
    }
    sessionStorage.setItem('active_quiz_id', activeQuizId);
    setCurrentView('quiz-play');
  };

  // Loading state check
  if (classes.length === 0 || subjects.length === 0 || chapters.length === 0) {
    return (
      <div className="space-y-8 py-4 max-w-4xl mx-auto text-left">
        <Card glassmorphism className="p-8 border-slate-200/40 dark:border-slate-800/40">
          <div className="flex flex-col items-center justify-center space-y-4 py-8">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500" />
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Loading curriculum data from database...</p>
          </div>
        </Card>
      </div>
    );
  }

  const selectedChapterName = activeChapters.find(c => c.id === chapterId)?.name;
  const selectedSubjectName = subjects.find(s => s.id === subjectId)?.name;
  const selectedClassName = filteredClasses.find(c => c.id === classId)?.name;

  return (
    <div className="space-y-8 py-4 text-left animate-fade-in max-w-4xl mx-auto">
      
      {/* 1. Header Banner */}
      <section className="bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/40 rounded-3xl p-6 sm:p-8 text-slate-900 dark:text-white relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center border border-indigo-500/20 shadow-inner shrink-0">
              <BrainCircuit className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                Live Quiz Arena
                <Badge variant="info" className="text-[8px] tracking-wider uppercase font-black px-1.5 py-0.5 rounded-lg">LMS WORKFLOW</Badge>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md leading-relaxed font-semibold">
                Select your parameters sequentially, then start the Computer Based Test (CBT).
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Step Selector Panel Card */}
      <Card glassmorphism className="border-slate-200/40 dark:border-slate-800/40 p-6 space-y-6">
        
        {!user?.classId && (
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-xs text-amber-500 font-bold text-center leading-relaxed">
            ⚠️ Profile standard is missing. Please select your Academic Standard in your profile to access tests.
          </div>
        )}

        {/* STEP 1: Academic Standard */}
        <div className="space-y-2">
          <label className="block text-slate-455 dark:text-slate-400 font-black text-xs uppercase tracking-wider">
            STEP 1: Select Your Academic Standard
          </label>
          <div className="relative">
            <select 
              value={classId} 
              onChange={e => handleClassChange(e.target.value)}
              disabled={!user?.classId}
              className={`w-full p-4 pr-10 rounded-2xl border border-slate-200 dark:border-slate-850 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl text-slate-800 dark:text-white outline-none text-xs font-bold shadow-lg focus:border-indigo-500 transition-all appearance-none ${!user?.classId ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
            >
              <option value="">-- Choose Standard --</option>
              {filteredClasses.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400">
              <ChevronRight className="w-4 h-4 rotate-90" />
            </div>
          </div>
        </div>

        {/* STEP 2: Choose Subject */}
        <div className="space-y-2">
          <label className="block text-slate-450 dark:text-slate-400 font-black text-xs uppercase tracking-wider">
            STEP 2: Choose Subject
          </label>
          {classId ? (
            activeSubjects.length > 0 ? (
              <div className="relative">
                <select 
                  value={subjectId} 
                  onChange={e => handleSubjectChange(e.target.value)}
                  className="w-full p-4 pr-10 rounded-2xl border border-slate-200 dark:border-slate-850 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl text-slate-800 dark:text-white outline-none text-xs font-bold shadow-lg focus:border-indigo-500 transition-all appearance-none cursor-pointer"
                >
                  <option value="">-- Choose Subject --</option>
                  {activeSubjects.map(sub => (
                    <option key={sub.id} value={sub.id}>{sub.name}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400">
                  <ChevronRight className="w-4 h-4 rotate-90" />
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl border border-dashed border-red-500/25 bg-red-500/5 text-red-500 text-xs font-semibold text-center">
                No subjects found for the selected academic standard in the database.
              </div>
            )
          ) : (
            <div className="p-4 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 text-slate-400 text-xs text-center select-none cursor-not-allowed opacity-60">
              Please select an Academic Standard first to load subjects.
            </div>
          )}
        </div>

        {/* STEP 3: Choose Chapter */}
        <div className="space-y-2">
          <label className="block text-slate-450 dark:text-slate-400 font-black text-xs uppercase tracking-wider">
            STEP 3: Choose Chapter
          </label>
          {subjectId ? (
            activeChapters.length > 0 ? (
              <div className="relative">
                <select 
                  value={chapterId} 
                  onChange={e => handleChapterChange(e.target.value)}
                  className="w-full p-4 pr-10 rounded-2xl border border-slate-200 dark:border-slate-850 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl text-slate-800 dark:text-white outline-none text-xs font-bold shadow-lg focus:border-indigo-500 transition-all appearance-none cursor-pointer"
                >
                  <option value="">-- Choose Chapter --</option>
                  {activeChapters.map(chap => (
                    <option key={chap.id} value={chap.id}>{chap.name}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400">
                  <ChevronRight className="w-4 h-4 rotate-90" />
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl border border-dashed border-red-500/25 bg-red-500/5 text-red-500 text-xs font-semibold text-center">
                No chapters found for the selected subject in the database.
              </div>
            )
          ) : (
            <div className="p-4 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 text-slate-400 text-xs text-center select-none cursor-not-allowed opacity-60">
              Please choose a Subject first to load chapters.
            </div>
          )}
        </div>

        {/* ── START QUIZ CTA ── */}
        {chapterId && (
          <div className="pt-2 space-y-4 animate-fade-in">
            {/* Selection breadcrumb */}
            <div className="p-3.5 rounded-2xl bg-indigo-500/8 border border-indigo-500/15 text-xs text-slate-600 dark:text-slate-400 font-semibold">
              <span className="text-indigo-500 font-black">
                {selectedClassName}
              </span>
              {' › '}
              <span>{selectedSubjectName}</span>
              {' › '}
              <span className="font-bold text-slate-800 dark:text-slate-200">{selectedChapterName}</span>
            </div>

            {/* Check availability button (shown when idle) */}
            {quizCheckState === 'idle' && (
              <Button
                variant="primary"
                className="w-full py-4 text-sm font-black rounded-2xl flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/20"
                onClick={checkQuizAvailability}
              >
                <PlayCircle className="w-5 h-5" />
                CHECK & START QUIZ
              </Button>
            )}

            {/* Checking spinner */}
            {quizCheckState === 'checking' && (
              <div className="flex items-center justify-center gap-3 p-4 rounded-2xl bg-indigo-500/8 border border-indigo-500/15">
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-indigo-500" />
                <span className="text-xs font-bold text-indigo-500">Checking question availability...</span>
              </div>
            )}

            {/* READY — questions available */}
            {quizCheckState === 'ready' && (
              <div className="space-y-3 animate-fade-in">
                <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center gap-3">
                  <div className="h-8 w-8 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center shrink-0">
                    <BrainCircuit className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                      {questionCount} question{questionCount !== 1 ? 's' : ''} available
                    </p>
                    <p className="text-[10px] text-slate-500 font-semibold mt-0.5">
                      CBT mode will launch automatically
                    </p>
                  </div>
                </div>
                <Button
                  variant="primary"
                  className="w-full py-4 text-sm font-black rounded-2xl flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-500/20"
                  onClick={handleStartQuiz}
                >
                  <PlayCircle className="w-5 h-5" />
                  START QUIZ NOW
                </Button>
              </div>
            )}

            {/* EMPTY — no questions posted */}
            {quizCheckState === 'empty' && (
              <div className="animate-fade-in">
                <div className="flex flex-col items-center justify-center py-10 px-6 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30 text-center space-y-4">
                  <div className="h-14 w-14 rounded-2xl bg-slate-200/60 dark:bg-slate-800/60 flex items-center justify-center">
                    <BookOpen className="w-7 h-7 text-slate-400" />
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-sm font-black text-slate-700 dark:text-slate-300">No questions posted yet</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 max-w-xs leading-relaxed font-medium">
                      Let your teacher post the questions and check again later.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs font-bold rounded-xl flex items-center gap-1.5"
                      onClick={() => { setChapterId(''); setQuizCheckState('idle'); }}
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Change Chapter
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs font-bold rounded-xl flex items-center gap-1.5"
                      onClick={() => { setSubjectId(''); setChapterId(''); setQuizCheckState('idle'); }}
                    >
                      Change Subject
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* ERROR state */}
            {quizCheckState === 'error' && (
              <div className="animate-fade-in space-y-3">
                <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/25 flex items-center gap-3">
                  <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                  <p className="text-xs font-bold text-red-500">Unable to check question availability. Please try again.</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs font-bold rounded-xl flex items-center justify-center gap-1.5"
                  onClick={checkQuizAvailability}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Retry
                </Button>
              </div>
            )}
          </div>
        )}

      </Card>
    </div>
  );
}
