/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Flame, Star, Award, BookOpen, Clock, Calendar, CheckCircle, ChevronRight, PlayCircle, FileText, Compass } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';

export default function StudentDashboard() {
  const { user, courses, setCurrentView, setSelectedCourseId, addToast } = useApp();

  const handleResumeCourse = (courseId: string, title: string) => {
    setSelectedCourseId(courseId);
    setCurrentView('course-view');
    addToast(`Resuming: ${title}`, 'success');
  };

  return (
    <div className="space-y-8 py-4 text-left">
      {/* Welcome Board */}
      <section className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-lg border border-slate-200/50 dark:border-slate-800/50 rounded-3xl p-6 sm:p-8 text-slate-900 dark:text-white relative overflow-hidden shadow-sm">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-2xl" />
        
        <div className="relative space-y-4">
          <Badge variant="info" className="bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900/30">
            Student Academic Suite
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome Back, {user?.fullName || 'Scholar'}!
          </h1>
          <p className="text-sm text-blue-100 max-w-xl leading-relaxed">
            You are currently on a <span className="font-bold text-orange-400">5-day learning streak</span>. Finish your Physics electrostatics mock quiz today to maintain your streak!
          </p>
          <div className="pt-2 flex flex-wrap gap-3">
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setCurrentView('catalog');
              }}
              rightIcon={<Compass className="w-4 h-4" />}
            >
              Explore Subject syllabus
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentView('leaderboard')}
            >
              See Leaderboard Rank
            </Button>
          </div>
        </div>
      </section>

      {/* Overview Analytics Widgets */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card hoverEffect glassmorphism>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-orange-100 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 flex items-center justify-center">
              <Flame className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase">Daily Streak</p>
              <p className="text-xl font-extrabold text-slate-900 dark:text-white">{user?.dailyStreak} Days 🔥</p>
            </div>
          </CardContent>
        </Card>

        <Card hoverEffect glassmorphism>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Star className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase">Total XP Points</p>
              <p className="text-xl font-extrabold text-slate-900 dark:text-white">{user?.totalXp} XP ⚡</p>
            </div>
          </CardContent>
        </Card>

        <Card hoverEffect glassmorphism>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-purple-100 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase">Badges Secured</p>
              <p className="text-xl font-extrabold text-slate-900 dark:text-white">{user?.badges.length || 0} Badges 🏅</p>
            </div>
          </CardContent>
        </Card>

        <Card hoverEffect glassmorphism>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase">Lessons Finished</p>
              <p className="text-xl font-extrabold text-slate-900 dark:text-white">12 Lessons ✅</p>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Continue Learning Course Cards */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left pane - Recent enrollments */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
              Recently Viewed & Active Courses
            </h2>
            <span className="text-xs font-semibold text-slate-500 cursor-pointer hover:underline" onClick={() => setCurrentView('catalog')}>
              View all
            </span>
          </div>

          <div className="space-y-4">
            {courses.slice(0, 2).map((course) => (
              <Card key={course.id} className="p-4 flex flex-col sm:flex-row gap-4 hover:border-blue-500/50 transition-all">
                <div className="h-24 w-full sm:w-36 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                  <img src={course.thumbnailUrl} alt={course.title} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase tracking-wide text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2.5 py-0.5 rounded-md">
                      Class Standard Course
                    </span>
                    <span className="text-xs text-slate-400">Last accessed: 2h ago</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                    {course.title}
                  </h3>
                  <div className="flex items-center gap-4 pt-1.5">
                    <div className="flex-1 bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div className="bg-blue-600 h-full rounded-full" style={{ width: '65%' }} />
                    </div>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      65% Completed
                    </span>
                  </div>
                  <div className="flex justify-end pt-1">
                    <Button variant="ghost" size="sm" className="h-8 text-xs font-bold text-blue-600" onClick={() => handleResumeCourse(course.id, course.title)} rightIcon={<ChevronRight className="w-4 h-4" />}>
                      Resume lesson video
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Right pane - Badges & Achievements directory */}
        <div className="space-y-4">
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
            Unlocked Achievements
          </h2>
          <Card>
            <CardContent className="p-5 space-y-4">
              <div className="flex items-start gap-3.5 pb-3.5 border-b border-slate-100 dark:border-slate-800/80">
                <div className="h-10 w-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                  <Flame className="w-5.5 h-5.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">5-Day Study Master</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">Studied consistently for 5 days without interruption.</p>
                </div>
              </div>
              <div className="flex items-start gap-3.5 pb-3.5 border-b border-slate-100 dark:border-slate-800/80">
                <div className="h-10 w-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                  <Award className="w-5.5 h-5.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Quiz Champion</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">Scored 100% on three chapter-end assessments.</p>
                </div>
              </div>
              <div className="flex items-start gap-3.5">
                <div className="h-10 w-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                  <Star className="w-5.5 h-5.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Speed Reader Badge</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">Downloaded over 5 high-yield revision PDF guides.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

      </section>
    </div>
  );
}
