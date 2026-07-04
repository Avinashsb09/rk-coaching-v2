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
  Flame, Star, Award, BookOpen, Clock, Calendar, CheckCircle, 
  ChevronRight, PlayCircle, FileText, Compass, Sparkles, 
  GraduationCap, Lock, HelpCircle, Eye, ShieldAlert, X 
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
  ],
  'pharmaceutics': [
    'Ch 1: Introduction to Dosage Forms',
    'Ch 2: Metrology and Calculations',
    'Ch 3: Liquid Dosage Forms'
  ],
  'pharmaceuticalchemistry': [
    'Ch 1: Inorganic Pharmaceuticals',
    'Ch 2: Acid-Base Titrations',
    'Ch 3: Impurities in Pharmaceuticals'
  ],
  'pharmacognosy': [
    'Ch 1: Scope of Pharmacognosy',
    'Ch 2: Classification of Crude Drugs',
    'Ch 3: Adulteration and Evaluation'
  ],
  'anatomyphysiology': [
    'Ch 1: Introduction to Human Body',
    'Ch 2: Skeletal and Muscular Systems',
    'Ch 3: Cardiovascular System'
  ],
  'nursingfoundations': [
    'Ch 1: History of Nursing and Ethics',
    'Ch 2: Nursing Process and Care Plans',
    'Ch 3: Vital Signs Assessment'
  ],
  'microbiology': [
    'Ch 1: Introduction to Microorganisms',
    'Ch 2: Bacteria Morphology and Staining',
    'Ch 3: Sterilization and Disinfection'
  ]
};

export default function StudentDashboard() {
  const { 
    user, 
    classes,
    subjects,
    courses, 
    chapters,
    lessons,
    notes,
    setCurrentView, 
    setSelectedCourseId, 
    setSelectedLessonId,
    setSelectedSubjectId,
    addToast, 
    quizAttempts,
    hasSubjectNotesAccess,
    unlockSubjectNotes
  } = useApp();

  // Find registered class standard
  const userClassId = user?.classId;
  const activeClass = classes.find(c => c.id === userClassId || c.slug === userClassId) 
    || classes.find(c => c.id === 'c10') 
    || classes[0];

  // Filter elements for personalized curriculum
  const studentSubjects = subjects.filter(s => s.classId === activeClass?.id);
  const studentCourses = courses.filter(c => c.classId === activeClass?.id);
  const studentCourseIds = studentCourses.map(c => c.id);
  const studentLessons = lessons.filter(l => studentCourseIds.includes(l.courseId));
  const studentNotes = notes.filter(n => n.classId === activeClass?.id);

  // Selector state variables for Sprints 7 & 8 inline selectors
  const [activeSubjectId, setActiveSubjectId] = useState<string>('');
  const [activeChapterId, setActiveChapterId] = useState<string>('');

  useEffect(() => {
    setActiveSubjectId('');
    setActiveChapterId('');
  }, [userClassId]);

  // Payment confirmation popup states
  const [confirmSubjectUnlockId, setConfirmSubjectUnlockId] = useState<string | null>(null);
  const [isProcessingCheckout, setIsProcessingCheckout] = useState(false);

  // Resume learning logic
  const lastCourseId = localStorage.getItem('rk_last_course_id');
  const lastLessonId = localStorage.getItem('rk_last_lesson_id');
  
  let resumeLesson = lessons.find(l => l.id === lastLessonId);
  let resumeCourse = courses.find(c => c.id === lastCourseId || c.id === resumeLesson?.courseId);

  if (!resumeLesson && studentLessons.length > 0) {
    resumeLesson = studentLessons[0];
    resumeCourse = studentCourses.find(c => c.id === resumeLesson?.courseId) || studentCourses[0];
  }

  const handleResumeClick = () => {
    if (resumeLesson && resumeCourse) {
      setSelectedCourseId(resumeCourse.id);
      setSelectedLessonId(resumeLesson.id);
      setCurrentView('lesson-view');
      addToast(`Resuming Lesson: ${resumeLesson.title}`, 'success');
    } else {
      setCurrentView('catalog');
    }
  };

  const handleSubjectToggle = (subId: string) => {
    if (activeSubjectId === subId) {
      setActiveSubjectId('');
      setActiveChapterId('');
    } else {
      setActiveSubjectId(subId);
      setActiveChapterId('');
    }
  };

  const handleChapterToggle = (chapId: string) => {
    if (activeChapterId === chapId) {
      setActiveChapterId('');
    } else {
      setActiveChapterId(chapId);
    }
  };

  const getChaptersForActiveSubject = () => {
    if (!activeSubjectId) return [];
    const dbChaps = chapters.filter(c => c.subjectId === activeSubjectId);
    if (dbChaps.length > 0) return dbChaps;

    const subName = subjects.find(s => s.id === activeSubjectId)?.name || '';
    const subjectKey = subName.toLowerCase().replace(/[^a-z0-9]/g, '');
    const list = ncertChapters[subjectKey] || [
      'Ch 1: General Concepts in ' + subName,
      'Ch 2: Critical Concepts & Solutions',
      'Ch 3: Board Solved Mock Tests'
    ];
    return list.map((name, idx) => ({
      id: `temp_chap_${activeClass.id}_${subjectKey}_${idx + 1}`,
      name,
      orderIndex: idx + 1
    }));
  };

  const activeChaptersList = getChaptersForActiveSubject();

  // Premium lock checkers
  const getPremiumNotesLockState = (subId: string) => {
    return !hasSubjectNotesAccess(subId);
  };

  const triggerPremiumUnlockCheckout = async () => {
    if (!confirmSubjectUnlockId) return;
    setIsProcessingCheckout(true);
    try {
      await unlockSubjectNotes(confirmSubjectUnlockId);
      setConfirmSubjectUnlockId(null);
    } catch (err: any) {
      addToast(err.message || 'Checkout failed.', 'error');
    } finally {
      setIsProcessingCheckout(false);
    }
  };

  const handleLaunchQuiz = (chapId: string) => {
    sessionStorage.setItem('active_quiz_id', `temp_quiz_${chapId}`);
    setCurrentView('quiz-play');
    addToast('Initializing CBT Practice Engine...', 'success');
  };

  const handleLaunchPyq = (chapId: string) => {
    sessionStorage.setItem('active_pyq_id', `pyq_${activeClass.id}_${activeSubjectId}_${chapId}_2024`);
    sessionStorage.setItem('active_pyq_title', `${activeClass.name} PYQ Exam Simulator`);
    sessionStorage.setItem('active_pyq_class_id', activeClass.id);
    sessionStorage.setItem('active_pyq_subject_id', activeSubjectId);
    sessionStorage.setItem('active_pyq_chapter_id', chapId);
    sessionStorage.setItem('active_pyq_duration', '45');
    setCurrentView('pyq-play');
    addToast('Initializing Solved Board Paper CBT...', 'success');
  };

  return (
    <div className="space-y-8 py-4 text-left animate-fade-in max-w-4xl mx-auto">
      
      {/* 1. Welcome Banner Card */}
      <section className="bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/40 rounded-3xl p-6 sm:p-8 text-slate-900 dark:text-white relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-3xl" />
        
        <div className="relative space-y-4">
          <Badge variant="info" className="bg-blue-55 text-blue-600 border border-blue-100 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900/30 font-black">
            STUDENT DASHBOARD
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome Back, {user?.fullName || 'Scholar'}!
          </h1>
          <p className="text-xs sm:text-sm text-slate-505 dark:text-slate-400 max-w-xl leading-relaxed">
            Your daily study goal is active. Continue where you left off or attempt a mock paper to earn extra XP points today!
          </p>
          
          {/* Registered standard auto detection badge */}
          <div className="pt-2 flex items-center gap-3">
            <span className="text-xs font-black uppercase text-slate-400 tracking-wider">Your Academic Standard:</span>
            <Badge variant="success" className="font-extrabold text-[10px] tracking-wide px-3 py-1 bg-emerald-500 text-white rounded-lg">
              {activeClass?.name || 'Class Standard'}
            </Badge>
          </div>
        </div>
      </section>

      {/* 3. Continue Learning and Arena Split Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Continue Learning card */}
        <Card glassmorphism className="border-slate-200/40 dark:border-slate-800/40 lg:col-span-2 p-5 flex flex-col justify-between h-full min-h-[180px]">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
              <Clock className="w-5 h-5" />
              <h3 className="text-xs font-black uppercase tracking-wider">Continue Learning</h3>
            </div>
            {resumeLesson && resumeCourse ? (
              <div className="space-y-1">
                <h4 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                  {resumeLesson.title}
                </h4>
                <p className="text-[11px] sm:text-xs text-slate-450 dark:text-slate-400">
                  {resumeCourse.title}
                </p>
              </div>
            ) : (
              <p className="text-xs text-slate-400">No recent activity. Tap below to select standard topics.</p>
            )}
          </div>
          <div className="pt-4 border-t border-slate-101 dark:border-slate-800/40 mt-4 flex justify-between items-center">
            <span className="text-[10px] text-slate-400 font-bold uppercase">Alignment: CBSE/NEET 2026</span>
            <Button 
              variant="primary" 
              size="sm" 
              onClick={handleResumeClick}
              rightIcon={<ChevronRight className="w-4 h-4" />}
              className="text-xs font-bold"
            >
              Resume Learning
            </Button>
          </div>
        </Card>

        {/* Live Quiz & PYQ Arenas */}
        <div className="space-y-4">
          <Card 
            hoverEffect 
            glassmorphism 
            className="border-indigo-500/25 p-4 bg-slate-900/60 dark:bg-slate-950/40 backdrop-blur-lg flex items-center justify-between cursor-pointer hover:border-indigo-500/50"
            onClick={() => setCurrentView('quiz-dashboard')}
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
                <Sparkles className="w-5.5 h-5.5" />
              </div>
              <div className="text-left">
                <h4 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                  Live Quiz Arena
                  <Badge variant="warning" className="text-[7px] py-0 px-1 font-black">CBT</Badge>
                </h4>
                <p className="text-[10px] text-slate-400 mt-0.5">Test core concepts & derivations.</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-indigo-400" />
          </Card>

          <Card 
            hoverEffect 
            glassmorphism 
            className="border-amber-500/25 p-4 bg-slate-900/60 dark:bg-slate-950/40 backdrop-blur-lg flex items-center justify-between cursor-pointer hover:border-amber-500/50"
            onClick={() => setCurrentView('pyq-dashboard')}
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                <GraduationCap className="w-5.5 h-5.5" />
              </div>
              <div className="text-left">
                <h4 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                  PYQ CBT Papers
                  <Badge variant="info" className="text-[7px] py-0 px-1 font-black bg-blue-600 text-white">BOARD</Badge>
                </h4>
                <p className="text-[10px] text-amber-400/80 mt-0.5">Practice past year solved papers.</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-amber-400" />
          </Card>
        </div>
      </section>

      {/* 4. Sprint 7 Personalized Curriculum Flow */}
      <section className="space-y-6">
        <div className="border-b border-slate-200/50 dark:border-slate-800/40 pb-3 text-left">
          <span className="text-[10px] font-black uppercase text-blue-600 dark:text-blue-400 tracking-wider">
            YOUR ACADEMIC STANDARD ({activeClass?.name})
          </span>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
            What do you want to study?
          </h2>
        </div>

        {/* Subjects list grid selection */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
          {studentSubjects.map(sub => {
            const isSelected = activeSubjectId === sub.id;
            return (
              <button
                key={sub.id}
                type="button"
                onClick={() => handleSubjectToggle(sub.id)}
                className={`p-4 rounded-2xl border text-xs font-bold text-center transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-650 border-indigo-600 text-white shadow-xl shadow-indigo-500/15 scale-[1.02]'
                    : 'bg-white/60 dark:bg-slate-900/60 border-slate-205 dark:border-slate-800/80 text-slate-700 dark:text-slate-300 hover:border-indigo-500/30'
                }`}
              >
                {sub.name}
              </button>
            );
          })}
        </div>

        {/* Chapters list under selected subject */}
        {activeSubjectId && (
          <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800/60 animate-fade-in text-left">
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">
              NCERT Chapters list
            </h3>
            
            {activeChaptersList.length === 0 ? (
              <p className="text-xs text-slate-450 italic">No chapters populated.</p>
            ) : (
              <div className="space-y-3">
                {activeChaptersList.map(chap => {
                  const isChapExpanded = activeChapterId === chap.id;
                  
                  return (
                    <Card key={chap.id} className="border-slate-200/50 dark:border-slate-850 overflow-hidden bg-slate-900/10">
                      <button
                        type="button"
                        onClick={() => handleChapterToggle(chap.id)}
                        className="w-full p-4 text-xs font-bold flex items-center justify-between text-slate-800 dark:text-slate-200 hover:bg-slate-950/10 transition-all text-left"
                      >
                        <span>{chap.name}</span>
                        <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${isChapExpanded ? 'rotate-90 text-indigo-400' : 'text-slate-400'}`} />
                      </button>

                      {/* CHAPTER CONTENTS (Sprint 7: Notes, video lectures, premium locks, quizzes, PYQs) */}
                      {isChapExpanded && (
                        <div className="p-4 border-t border-slate-200/40 dark:border-slate-850 bg-white/40 dark:bg-slate-950/20 space-y-4 text-xs animate-fade-in">
                          
                          {/* Study Notes segment */}
                          <div className="space-y-2">
                            <h4 className="text-[10px] font-black uppercase text-indigo-400 tracking-wide">Worksheets & Notes Binders</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {/* Free Handwritten notes card */}
                              <div className="p-3 border border-slate-200/60 dark:border-slate-850 rounded-xl bg-slate-900/5 dark:bg-slate-950/40 flex items-center justify-between">
                                <div className="space-y-0.5">
                                  <p className="font-bold text-slate-800 dark:text-slate-100">Free Handwritten Notes</p>
                                  <p className="text-[9px] text-emerald-500 font-semibold uppercase">Fully unlocked PDF</p>
                                </div>
                                <a href="https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" target="_blank" rel="noreferrer">
                                  <Button variant="secondary" size="sm" className="text-[10px] font-bold px-3 h-7">
                                    <Eye className="w-3.5 h-3.5 mr-1" /> View PDF
                                  </Button>
                                </a>
                              </div>

                              {/* Premium Notes (Locked/Unlocked check) */}
                              <div className="p-3 border border-slate-200/60 dark:border-slate-850 rounded-xl bg-slate-900/5 dark:bg-slate-950/40 flex items-center justify-between">
                                <div className="space-y-0.5">
                                  <p className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                                    Premium Notes Key
                                    {getPremiumNotesLockState(activeSubjectId) && <Lock className="w-3 h-3 text-amber-500 shrink-0" />}
                                  </p>
                                  <p className={`text-[9px] font-black uppercase ${getPremiumNotesLockState(activeSubjectId) ? 'text-amber-500' : 'text-emerald-500'}`}>
                                    {getPremiumNotesLockState(activeSubjectId) ? 'Price: ₹30' : 'unlocked'}
                                  </p>
                                </div>
                                
                                {getPremiumNotesLockState(activeSubjectId) ? (
                                  <Button 
                                    variant="warning" 
                                    size="sm" 
                                    onClick={() => setConfirmSubjectUnlockId(activeSubjectId)}
                                    className="text-[10px] font-black px-3.5 h-7 text-amber-500 border border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10"
                                  >
                                    Unlock Notes
                                  </Button>
                                ) : (
                                  <a href="https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" target="_blank" rel="noreferrer">
                                    <Button variant="secondary" size="sm" className="text-[10px] font-bold px-3 h-7">
                                      <Eye className="w-3.5 h-3.5 mr-1" /> View PDF
                                    </Button>
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Video lectures segment */}
                          <div className="space-y-2">
                            <h4 className="text-[10px] font-black uppercase text-indigo-400 tracking-wide">Video Lectures</h4>
                            <div className="p-3 border border-slate-200/60 dark:border-slate-850 rounded-xl bg-slate-900/5 dark:bg-slate-950/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                              <div className="space-y-0.5">
                                <p className="font-bold text-slate-850 dark:text-slate-100">Chapter core video tutorial</p>
                                <p className="text-[9px] text-slate-500">Includes conceptual visualization and solved formulas sheet revision.</p>
                              </div>
                              <Button
                                onClick={() => {
                                  // Find a mock video or just open a default lesson
                                  const matchingLesson = studentLessons.find(l => l.chapterId === chap.id) || studentLessons[0];
                                  if (matchingLesson) {
                                    setSelectedCourseId(studentCourses[0]?.id || 'course');
                                    setSelectedLessonId(matchingLesson.id);
                                    setCurrentView('lesson-view');
                                  } else {
                                    addToast('Video player initializing...', 'info');
                                  }
                                }}
                                variant="primary"
                                size="sm"
                                className="text-[10px] font-bold h-7 shrink-0"
                                leftIcon={<PlayCircle className="w-4 h-4" />}
                              >
                                Play Lecture
                              </Button>
                            </div>
                          </div>

                          {/* Assessment (Live Quiz & PYQs direct launch) */}
                          <div className="space-y-2">
                            <h4 className="text-[10px] font-black uppercase text-indigo-400 tracking-wide">Practice & Assessment</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              
                              {/* Quiz Arena Button */}
                              <div className="p-3 border border-slate-200/60 dark:border-slate-850 rounded-xl bg-slate-900/5 dark:bg-slate-950/40 flex items-center justify-between">
                                <div className="space-y-0.5">
                                  <p className="font-bold text-slate-800 dark:text-slate-100">Conceptual Practice Test</p>
                                  <p className="text-[9px] text-slate-550 dark:text-slate-400">Timer: 15 Mins | 5 MCQs</p>
                                </div>
                                <Button 
                                  variant="primary" 
                                  size="sm" 
                                  onClick={() => handleLaunchQuiz(chap.id)}
                                  className="text-[10px] font-bold h-7 bg-indigo-600 hover:bg-indigo-700"
                                >
                                  Start Quiz
                                </Button>
                              </div>

                              {/* PYQ Solved papers Arena Button */}
                              <div className="p-3 border border-slate-200/60 dark:border-slate-850 rounded-xl bg-slate-900/5 dark:bg-slate-950/40 flex items-center justify-between">
                                <div className="space-y-0.5">
                                  <p className="font-bold text-slate-800 dark:text-slate-100">Solved Board PYQ paper</p>
                                  <p className="text-[9px] text-slate-550 dark:text-slate-400">Exam Mode: 45 Mins | Solved CBT</p>
                                </div>
                                <Button 
                                  variant="secondary" 
                                  size="sm" 
                                  onClick={() => handleLaunchPyq(chap.id)}
                                  className="text-[10px] font-bold h-7 text-slate-900 dark:text-white border-slate-200 dark:border-slate-800"
                                >
                                  Launch PYQ
                                </Button>
                              </div>

                            </div>
                          </div>

                        </div>
                      )}

                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </section>

      {/* 5. Attempted Quiz History Section */}
      <section className="space-y-4">
        <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
          Attempted Quiz History
        </h2>
        
        {quizAttempts.filter(a => a.userId === (user?.id || 'usr_student')).length === 0 ? (
          <Card className="p-6 text-center border-dashed border-2 border-slate-200/50 dark:border-slate-800/50 bg-slate-50/20 dark:bg-slate-900/10 rounded-2xl">
            <p className="text-slate-500 text-sm font-semibold">You haven't attempted any quizzes yet. Head over to the Quiz Arena to test your concepts!</p>
          </Card>
        ) : (
          <Card className="overflow-x-auto border-slate-200/50 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/50 backdrop-blur-lg rounded-2xl shadow-md">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-100/55 dark:bg-slate-900/60 text-slate-450 font-bold uppercase tracking-wider text-[9px] border-b border-slate-200 dark:border-slate-800">
                  <th className="px-5 py-3">Quiz Name</th>
                  <th className="px-5 py-3 text-center">Attempt Date</th>
                  <th className="px-5 py-3 text-center">Score</th>
                  <th className="px-5 py-3 text-center">Correct / Wrong</th>
                  <th className="px-5 py-3 text-center">Accuracy</th>
                  <th className="px-5 py-3 text-center">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {quizAttempts.filter(a => a.userId === (user?.id || 'usr_student')).map((attempt) => (
                  <tr key={attempt.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/25 transition-all">
                    <td className="px-5 py-4 font-bold text-slate-800 dark:text-slate-200">{attempt.quizTitle || 'Practice Quiz'}</td>
                    <td className="px-5 py-4 text-center font-semibold text-slate-500">
                      {new Date(attempt.attemptedAt).toLocaleDateString('en-IN')}
                    </td>
                    <td className="px-5 py-4 text-center font-extrabold text-blue-600 dark:text-blue-400">
                      {attempt.scoreObtained} / {attempt.totalQuestions * 3}
                    </td>
                    <td className="px-5 py-4 text-center font-semibold text-slate-600 dark:text-slate-400">
                      <span className="text-emerald-500">{attempt.correctCount || 0} Right</span>
                      <span className="mx-1">/</span>
                      <span className="text-red-500">{attempt.wrongCount || 0} Wrong</span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <Badge variant={attempt.accuracy >= 60 ? 'success' : 'secondary'} className="font-bold">
                        {attempt.accuracy}%
                      </Badge>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <Badge variant={attempt.isPassed ? 'success' : 'danger'} className="font-bold uppercase text-[8px]">
                        {attempt.isPassed ? 'Passed' : 'Failed'}
                      </Badge>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Button
                        onClick={() => {
                          sessionStorage.setItem('last_quiz_attempt', JSON.stringify(attempt));
                          sessionStorage.setItem('active_quiz_id', attempt.quizId);
                          setCurrentView('quiz-result');
                        }}
                        variant="ghost"
                        size="sm"
                        className="text-xs font-black text-indigo-600 dark:text-indigo-400"
                      >
                        View Result
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}
      </section>

      {/* 6. Checkout Non-Refundable Disclaimer Warning Modal Dialog */}
      {confirmSubjectUnlockId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md">
          <Card className="w-full max-w-md border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-6 relative overflow-hidden animate-scale-up text-left">
            <button 
              onClick={() => setConfirmSubjectUnlockId(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-4">
              <div className="flex items-center gap-3 text-amber-500">
                <ShieldAlert className="w-8 h-8 shrink-0" />
                <h3 className="text-base font-black uppercase tracking-wider text-slate-900 dark:text-white">
                  Payment Warning Details
                </h3>
              </div>

              <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 text-xs text-amber-600 leading-relaxed font-semibold">
                ⚠️ **Important Payment Advisory**:
                <br />
                Payments for unlocking premium handouts are **strictly non-refundable**. Please make sure you are purchasing notes for the correct subject standard.
              </div>

              <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                <p className="text-slate-500 font-bold">Unlocking notes binder for:</p>
                <p className="font-extrabold text-slate-900 dark:text-white">
                  {subjects.find(s => s.id === confirmSubjectUnlockId)?.name || 'Premium Handouts'}
                </p>
                <p className="text-slate-500 font-bold pt-1.5">Unlocks premium worksheets permanently.</p>
                <p className="text-base font-extrabold text-indigo-500 pt-2">Unlock Price: ₹30</p>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <Button 
                  variant="secondary" 
                  onClick={() => setConfirmSubjectUnlockId(null)}
                  className="text-xs font-bold"
                  disabled={isProcessingCheckout}
                >
                  Cancel
                </Button>
                <Button 
                  variant="primary" 
                  onClick={triggerPremiumUnlockCheckout}
                  isLoading={isProcessingCheckout}
                  className="text-xs font-bold bg-indigo-600 hover:bg-indigo-700"
                >
                  Proceed with Razorpay
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

    </div>
  );
}
