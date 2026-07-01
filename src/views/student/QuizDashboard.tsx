/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { 
  Trophy, BookOpen, Layers, Clock, Play, ChevronRight, Award, 
  HelpCircle, Sparkles, BrainCircuit, CheckCircle 
} from 'lucide-react';

const ncertChapters: Record<string, string[]> = {
  'english': [
    'Ch 1: Who Did Patrick\'s Homework?',
    'Ch 2: How the Dog Found Himself a New Master!',
    'Ch 3: Taro\'s Reward',
    'Ch 4: An Indian-American Woman in Space',
    'Ch 5: A Different Kind of School'
  ],
  'hindi': [
    'Ch 1: वह चिड़िया जो',
    'Ch 2: बचपन',
    'Ch 3: नादान दोस्त',
    'Ch 4: चाँद से थोड़ी-सी गप्पें',
    'Ch 5: अक्षरों का महत्व'
  ],
  'assamese': [
    'Ch 1: আমাৰ জন্মভূমি',
    'Ch 2: বৰগীত',
    'Ch 3: অসমৰ জাতীয় উৎসৱ',
    'Ch 4: দেশৰ বাবে প্ৰাণ আহুতি',
    'Ch 5: সৎ সংগ'
  ],
  'generalscience': [
    'Ch 1: Chemical Reactions and Equations',
    'Ch 2: Acids, Bases and Salts',
    'Ch 3: Metals and Non-metals',
    'Ch 4: Carbon and its Compounds',
    'Ch 5: Life Processes',
    'Ch 6: Control and Coordination',
    'Ch 7: How do Organisms Reproduce?',
    'Ch 8: Heredity and Evolution',
    'Ch 9: Light - Reflection and Refraction',
    'Ch 10: Human Eye and Colorful World',
    'Ch 11: Electricity',
    'Ch 12: Magnetic Effects of Electric Current',
    'Ch 13: Our Environment'
  ],
  'generalmathematics': [
    'Ch 1: Real Numbers',
    'Ch 2: Polynomials',
    'Ch 3: Pair of Linear Equations in Two Variables',
    'Ch 4: Quadratic Equations',
    'Ch 5: Arithmetic Progressions',
    'Ch 6: Triangles',
    'Ch 7: Coordinate Geometry',
    'Ch 8: Introduction to Trigonometry',
    'Ch 9: Some Applications of Trigonometry',
    'Ch 10: Circles',
    'Ch 11: Areas Related to Circles',
    'Ch 12: Surface Areas and Volumes',
    'Ch 13: Statistics',
    'Ch 14: Probability'
  ],
  'socialscience': [
    'Ch 1: Resources and Development',
    'Ch 2: Land, Soil, Water, Natural Vegetation and Wildlife Resources',
    'Ch 3: Mineral and Power Resources',
    'Ch 4: Agriculture',
    'Ch 5: Industries',
    'Ch 6: Human Resources'
  ],
  'physics': [
    'Ch 1: Electric Charges and Fields',
    'Ch 2: Electrostatic Potential and Capacitance',
    'Ch 3: Current Electricity',
    'Ch 4: Moving Charges and Magnetism',
    'Ch 5: Magnetism and Matter',
    'Ch 6: Electromagnetic Induction',
    'Ch 7: Alternating Current',
    'Ch 8: Electromagnetic Waves',
    'Ch 9: Ray Optics and Optical Instruments',
    'Ch 10: Wave Optics',
    'Ch 11: Dual Nature of Radiation and Matter',
    'Ch 12: Atoms',
    'Ch 13: Nuclei',
    'Ch 14: Semiconductor Electronics'
  ],
  'chemistry': [
    'Ch 1: Solutions',
    'Ch 2: Electrochemistry',
    'Ch 3: Chemical Kinetics',
    'Ch 4: The d-and f-Block Elements',
    'Ch 5: Coordination Compounds',
    'Ch 6: Haloalkanes and Haloarenes',
    'Ch 7: Alcohols, Phenols and Ethers',
    'Ch 8: Aldehydes, Ketones and Carboxylic Acids',
    'Ch 9: Amines',
    'Ch 10: Biomolecules'
  ],
  'biology': [
    'Ch 1: The Living World',
    'Ch 2: Biological Classification',
    'Ch 3: Plant Kingdom',
    'Ch 4: Animal Kingdom',
    'Ch 5: Morphology of Flowering Plants',
    'Ch 6: Anatomy of Flowering Plants',
    'Ch 7: Structural Organisation in Animals',
    'Ch 8: Cell: The Unit of Life',
    'Ch 9: Biomolecules',
    'Ch 10: Cell Cycle and Cell Division',
    'Ch 11: Photosynthesis in Higher Plants',
    'Ch 12: Respiration in Plants',
    'Ch 13: Plant Growth and Development',
    'Ch 14: Breathing and Exchange of Gases',
    'Ch 15: Body Fluids and Circulation',
    'Ch 16: Excretory Products and their Elimination',
    'Ch 17: Locomotion and Movement',
    'Ch 18: Neural Control and Coordination',
    'Ch 19: Chemical Coordination and Integration'
  ]
};

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

  // Selection states mapping Sprints 3 dropdown workflows
  const [classId, setClassId] = useState<string>('');
  const [subjectId, setSubjectId] = useState<string>('');
  const [chapterId, setChapterId] = useState<string>('');

  // Auto-detect registered standard on mount/load
  useEffect(() => {
    if (user?.classId) {
      // Find class matching standard ID
      const matched = classes.find(c => c.id === user.classId || c.slug === user.classId);
      if (matched) {
        setClassId(matched.id);
      }
    } else {
      setClassId('c10'); // Default fallback
    }
  }, [user, classes]);

  // Reset selections when parent fields change
  const handleClassChange = (val: string) => {
    setClassId(val);
    setSubjectId('');
    setChapterId('');
  };

  const handleSubjectChange = (val: string) => {
    setSubjectId(val);
    setChapterId('');
  };

  // Helper: Get details for a quiz
  const getQuizMetadata = (quiz: any) => {
    const lesson = lessons?.find(l => l.id === quiz.lessonId);
    const chapter = chapters?.find(c => c.id === lesson?.chapterId);
    const subject = subjects?.find(s => s.id === chapter?.subjectId);
    const cls = classes?.find(c => c.id === subject?.classId);
    const qCount = quizQuestions?.filter(q => q.quizId === quiz.id).length || 5;
    return { lesson, chapter, subject, cls, qCount };
  };

  // Filter subjects based on selected classId
  const getFilteredSubjects = () => {
    if (!classId) return [];
    return subjects.filter(s => s.classId === classId);
  };

  // Filter or generate NCERT chapters list based on selected subjectId
  const getFilteredChapters = () => {
    if (!subjectId) return [];
    const dbChaps = chapters.filter(c => c.subjectId === subjectId);
    if (dbChaps.length > 0) return dbChaps;

    // NCERT chapters sequence fallback
    const selectedSubName = subjects.find(s => s.id === subjectId)?.name || '';
    const subjectKey = selectedSubName.toLowerCase().replace(/[^a-z0-9]/g, '');
    const list = ncertChapters[subjectKey] || [
      'Ch 1: Overview of ' + selectedSubName,
      'Ch 2: Core Theoretical Model Principles',
      'Ch 3: Formula Derivations & Board Solvers'
    ];
    return list.map((name, idx) => ({
      id: `temp_chap_${classId}_${subjectKey}_${idx + 1}`,
      name,
      orderIndex: idx + 1
    }));
  };

  // Get quizzes or generate fallback
  const getFilteredQuizzes = () => {
    if (!chapterId) return [];
    const dbQuizzes = quizzes.filter(q => {
      const metadata = getQuizMetadata(q);
      return metadata.chapter?.id === chapterId;
    });
    if (dbQuizzes.length > 0) return dbQuizzes;

    // Generate mock quiz on the fly for NCERT chapter coverage!
    const selectedChapName = getFilteredChapters().find(c => c.id === chapterId)?.name || 'Concepts';
    return [
      {
        id: `temp_quiz_${chapterId}`,
        title: `${selectedChapName} - Conceptual Revision Test`,
        timerSeconds: 900,
        passingScorePct: 60,
        qCount: 5,
        isTemp: true
      }
    ];
  };

  const handleStartQuiz = (qId: string) => {
    sessionStorage.setItem('active_quiz_id', qId);
    setCurrentView('quiz-play');
    addToast('Initializing CBT Quiz Simulator...', 'success');
  };

  const activeSubjects = getFilteredSubjects();
  const activeChapters = getFilteredChapters();
  const activeQuizzes = getFilteredQuizzes();

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
                <Badge variant="info" className="text-[8px] tracking-wider uppercase font-black px-1.5 py-0.5 rounded-lg">CBT ENGINE</Badge>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md leading-relaxed font-semibold">
                Select your parameters sequentially to launch the Computer Based Test (CBT) engine.
              </p>
            </div>
          </div>
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={() => setCurrentView('leaderboard')}
            leftIcon={<Trophy className="w-4 h-4 text-amber-500" />}
            className="w-full md:w-auto text-xs font-bold border-slate-250 dark:border-slate-800"
          >
            See Leaderboard
          </Button>
        </div>
      </section>

      {/* 2. Step Selector Panel Card */}
      <Card glassmorphism className="border-slate-200/40 dark:border-slate-800/40 p-6 space-y-6">
        
        {/* STEP 1: Academic Standard */}
        <div className="space-y-2">
          <label className="block text-slate-450 dark:text-slate-400 font-black text-xs uppercase tracking-wider">
            STEP 1: Select Your Academic Standard
          </label>
          <select 
            value={classId} 
            onChange={e => handleClassChange(e.target.value)}
            className="w-full p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-350 outline-none text-xs font-bold"
          >
            <option value="">-- Choose Standard --</option>
            {classes.filter(c => c.id !== 'neet').map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* STEP 2: Choose Subject */}
        <div className="space-y-2">
          <label className="block text-slate-450 dark:text-slate-400 font-black text-xs uppercase tracking-wider">
            STEP 2: Choose Subject
          </label>
          {classId ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {activeSubjects.map((sub) => {
                const isSelected = subjectId === sub.id;
                return (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => handleSubjectChange(sub.id)}
                    className={`p-3 rounded-2xl border transition-all text-xs font-bold text-center cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-500/15 scale-[1.02]'
                        : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-indigo-500/30'
                    }`}
                  >
                    {sub.name}
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="text-[11px] text-slate-400 italic">Please complete Step 1 first.</p>
          )}
        </div>

        {/* STEP 3: Choose Chapter */}
        <div className="space-y-2">
          <label className="block text-slate-450 dark:text-slate-400 font-black text-xs uppercase tracking-wider">
            STEP 3: Choose Chapter (NCERT Sequence)
          </label>
          {subjectId ? (
            <div className="max-h-60 overflow-y-auto space-y-2 border border-slate-200/50 dark:border-slate-850 p-3 rounded-2xl bg-white/20 dark:bg-slate-950/20">
              {activeChapters.map((chap) => {
                const isSelected = chapterId === chap.id;
                return (
                  <button
                    key={chap.id}
                    type="button"
                    onClick={() => setChapterId(chap.id)}
                    className={`w-full p-3 rounded-xl border text-xs font-bold text-left transition-all flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-600/10 border-indigo-500 text-indigo-400 font-extrabold'
                        : 'bg-white/40 dark:bg-slate-950/30 border-slate-200/60 dark:border-slate-850 text-slate-700 dark:text-slate-300 hover:border-indigo-500/30'
                    }`}
                  >
                    <span>{chap.name}</span>
                    <ChevronRight className="w-4 h-4 shrink-0 text-slate-400" />
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="text-[11px] text-slate-400 italic">Please complete Step 2 first.</p>
          )}
        </div>

        {/* STEP 4: Start CBT Quiz */}
        <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800/60">
          <label className="block text-slate-450 dark:text-slate-400 font-black text-xs uppercase tracking-wider">
            STEP 4: Available CBT Tests
          </label>
          
          {!chapterId ? (
            <p className="text-[11px] text-slate-400 italic">Please complete Step 3 first to load tests.</p>
          ) : (
            <div className="space-y-3">
              {activeQuizzes.map((q) => {
                const qCount = q.qCount || quizQuestions.filter(item => item.quizId === q.id).length || 5;
                return (
                  <Card key={q.id} className="p-4 border-slate-200/60 dark:border-slate-850 bg-white/50 dark:bg-slate-900/30 backdrop-blur-md">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="space-y-1 text-left">
                        <h4 className="text-sm font-black text-slate-900 dark:text-slate-100">{q.title}</h4>
                        <div className="flex flex-wrap gap-3 text-[10px] font-bold text-slate-500">
                          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {Math.round(q.timerSeconds / 60)} Mins</span>
                          <span className="flex items-center gap-1"><HelpCircle className="w-3.5 h-3.5" /> {qCount} Questions</span>
                          <span className="flex items-center gap-1"><Award className="w-3.5 h-3.5 text-emerald-500" /> Passing: {q.passingScorePct}%</span>
                        </div>
                      </div>
                      <Button
                        onClick={() => handleStartQuiz(q.id)}
                        variant="primary"
                        size="sm"
                        className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-lg shrink-0"
                        leftIcon={<Play className="w-3.5 h-3.5 fill-current" />}
                      >
                        Attempt Quiz
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

      </Card>
    </div>
  );
}
