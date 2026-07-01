import { Flame, Star, Award, BookOpen, Clock, Calendar, CheckCircle, ChevronRight, PlayCircle, FileText, Compass, Sparkles, GraduationCap } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';

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
    quizAttempts 
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
  
  // High-yield notes
  const studentNotes = notes.filter(n => n.classId === activeClass?.id);

  // Resume learning logic
  const lastCourseId = localStorage.getItem('rk_last_course_id');
  const lastLessonId = localStorage.getItem('rk_last_lesson_id');
  
  let resumeLesson = lessons.find(l => l.id === lastLessonId);
  let resumeCourse = courses.find(c => c.id === lastCourseId || c.id === resumeLesson?.courseId);

  // Fallback if no last activity exists: use first available lesson of their standard
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

  const handleSubjectClick = (subId: string) => {
    setSelectedSubjectId(subId);
    setCurrentView('subject-view');
  };

  return (
    <div className="space-y-8 py-4 text-left animate-fade-in">
      {/* 1. Welcome Banner Card */}
      <section className="bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/40 rounded-3xl p-6 sm:p-8 text-slate-900 dark:text-white relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-2xl" />
        
        <div className="relative space-y-4">
          <Badge variant="info" className="bg-blue-50 text-blue-600 border border-blue-100 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900/30 font-black">
            STUDENT DASHBOARD
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome Back, {user?.fullName || 'Scholar'}!
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xl leading-relaxed">
            Your daily study goal is active. Continue where you left off or attempt a mock paper to earn extra XP points today!
          </p>
          <div className="pt-2 flex flex-wrap gap-3">
            <Button
              variant="primary"
              size="sm"
              onClick={() => setCurrentView('catalog')}
              rightIcon={<Compass className="w-4 h-4" />}
              className="text-xs font-bold"
            >
              Browse Syllabus Catalog
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentView('leaderboard')}
              className="text-xs font-bold"
            >
              See Leaderboard Rank
            </Button>
          </div>
        </div>
      </section>

      {/* 2. Overview Stats Analytics Widget Row */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card hoverEffect glassmorphism className="border-slate-200/40 dark:border-slate-800/40">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-orange-100 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0">
              <Flame className="w-5.5 h-5.5" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase">Streak</p>
              <p className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">{user?.dailyStreak || 1} Days 🔥</p>
            </div>
          </CardContent>
        </Card>

        <Card hoverEffect glassmorphism className="border-slate-200/40 dark:border-slate-800/40">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Star className="w-5.5 h-5.5" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase">Total XP</p>
              <p className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">{user?.totalXp || 0} XP ⚡</p>
            </div>
          </CardContent>
        </Card>

        <Card hoverEffect glassmorphism className="border-slate-200/40 dark:border-slate-800/40">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-purple-100 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
              <Award className="w-5.5 h-5.5" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase">Badges</p>
              <p className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">{user?.badges.length || 1} Earned</p>
            </div>
          </CardContent>
        </Card>

        <Card hoverEffect glassmorphism className="border-slate-200/40 dark:border-slate-800/40">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle className="w-5.5 h-5.5" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase">Completed</p>
              <p className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">12 Lessons ✅</p>
            </div>
          </CardContent>
        </Card>
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
                <p className="text-[11px] sm:text-xs text-slate-400">
                  {resumeCourse.title}
                </p>
              </div>
            ) : (
              <p className="text-xs text-slate-400">No recent activity. Tap below to select standard topics.</p>
            )}
          </div>
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800/40 mt-4 flex justify-between items-center">
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
          {/* Live Quiz Arena Card */}
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

          {/* PYQ Arena Card */}
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

      {/* 4. Personalized standard section */}
      <section className="space-y-6">
        <div className="flex justify-between items-end border-b border-slate-200/50 dark:border-slate-800/40 pb-3">
          <div>
            <span className="text-[10px] font-black uppercase text-blue-600 dark:text-blue-400 tracking-wider">Registered standard</span>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
              Syllabus Structure: {activeClass?.name}
            </h2>
          </div>
          <Badge variant="secondary" className="text-[9px] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded-md">
            LMS Verified
          </Badge>
        </div>

        {/* Subjects list */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {studentSubjects.map(sub => (
            <Card 
              key={sub.id} 
              hoverEffect 
              glassmorphism
              className="p-5 border-slate-200/40 dark:border-slate-800/40 flex flex-col justify-between text-left h-full min-h-[140px]"
            >
              <div className="space-y-2">
                <span className="text-[9px] uppercase font-black tracking-wider text-emerald-500">Course Subject</span>
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white leading-tight">
                  {sub.name}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed font-normal">
                  {sub.description}
                </p>
              </div>
              <div className="pt-3 flex justify-end">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleSubjectClick(sub.id)}
                  rightIcon={<ChevronRight className="w-4 h-4" />}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/20"
                >
                  Explore Subject Lectures
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* 5. Free notes and download lists */}
      {studentNotes.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
            Revision Study Sheets & Handouts
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {studentNotes.slice(0, 4).map(note => (
              <Card key={note.id} className="p-4 border-slate-200/40 dark:border-slate-800/40 bg-white/50 dark:bg-slate-900/40 backdrop-blur-lg flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 truncate max-w-[150px] sm:max-w-xs">{note.title}</h4>
                    <p className="text-[10px] text-slate-400 font-semibold flex items-center gap-1.5 mt-0.5">
                      <span>Size: {Math.round(note.sizeBytes / 1024)} KB</span>
                      {note.isPremium ? (
                        <Badge variant="warning" className="text-[7px] py-0 px-1 font-black">PREMIUM</Badge>
                      ) : (
                        <Badge variant="success" className="text-[7px] py-0 px-1 font-black bg-emerald-500 text-white">FREE</Badge>
                      )}
                    </p>
                  </div>
                </div>
                <a href={note.pdfUrl} target="_blank" rel="noreferrer" className="no-underline">
                  <Button variant="secondary" size="sm" className="text-xs font-bold">
                    View PDF
                  </Button>
                </a>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* 6. Attempted Quiz History Section */}
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
                <tr className="bg-slate-100/55 dark:bg-slate-900/60 text-slate-400 font-bold uppercase tracking-wider text-[9px] border-b border-slate-200 dark:border-slate-800">
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
    </div>
  );
}
