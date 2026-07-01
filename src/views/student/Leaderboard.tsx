import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Trophy, Star, Medal, Zap, Flame, Award, ShieldCheck, PlayCircle, Clock } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';

export default function Leaderboard() {
  const { users, quizAttempts, classes } = useApp();

  // Tab State: standard classId (default 'neet')
  const [selectedClassId, setSelectedClassId] = useState('neet');

  // Helper: Aggregate quiz metrics and calculate rankings
  const getLeaderboardForClass = (classId: string) => {
    // 1. Get all students in this class standard
    const classStudents = users.filter(u => u.role === 'student' && u.classId === classId);
    
    // 2. Map and aggregate attempts
    const board = classStudents.map(student => {
      const studentAttempts = quizAttempts.filter(a => a.userId === student.id);
      
      const totalScore = studentAttempts.reduce((sum, a) => sum + (a.scoreObtained || 0), 0);
      const totalCorrect = studentAttempts.reduce((sum, a) => sum + (a.correctCount || 0), 0);
      const totalWrong = studentAttempts.reduce((sum, a) => sum + (a.wrongCount || 0), 0);
      const totalSkipped = studentAttempts.reduce((sum, a) => sum + (a.skippedCount || 0), 0);
      const totalTime = studentAttempts.reduce((sum, a) => sum + (a.timeTakenSeconds || 0), 0);
      
      const accuracy = (totalCorrect + totalWrong) > 0
        ? Math.round((totalCorrect / (totalCorrect + totalWrong)) * 100)
        : 0;
        
      return {
        ...student,
        quizScore: totalScore,
        correctAnswers: totalCorrect,
        wrongAnswers: totalWrong,
        skippedAnswers: totalSkipped,
        accuracy,
        timeTaken: totalTime
      };
    });

    // 3. Sort according to ranking logic:
    //    1. Highest Quiz Score
    //    2. Highest Accuracy
    //    3. Least Time Taken
    //    4. Highest XP
    board.sort((a, b) => {
      if (b.quizScore !== a.quizScore) return b.quizScore - a.quizScore;
      if (b.accuracy !== a.accuracy) return b.accuracy - a.accuracy;
      if (a.timeTaken !== b.timeTaken) return a.timeTaken - b.timeTaken;
      return b.totalXp - a.totalXp;
    });

    // 4. Assign rank index
    return board.map((item, idx) => ({ ...item, rank: idx + 1 }));
  };

  const currentBoard = getLeaderboardForClass(selectedClassId);

  // Top 3 Podium Ranks
  const topRankers = currentBoard.slice(0, 3);
  const remainingRankers = currentBoard.slice(3);

  const activeClassName = classes.find(c => c.id === selectedClassId)?.name || 'NEET Standard';

  return (
    <div className="max-w-5xl mx-auto py-4 space-y-8 text-left animate-fade-in">
      {/* Leaderboard Header */}
      <section className="bg-gradient-to-br from-indigo-900 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl" />
        <div className="relative flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div className="space-y-3">
            <Badge variant="warning" className="bg-amber-500/15 text-amber-400 border border-amber-500/20 uppercase font-black tracking-wider text-[9px]">
              Gamified Rankings
            </Badge>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {activeClassName} Leaderboard
            </h1>
            <p className="text-sm text-slate-300 max-w-md leading-relaxed">
              Standings are re-ranked reactively by: Highest Quiz Score (+3 / -1), then Highest Accuracy %, and lastly Least Time Taken.
            </p>
          </div>
          <div className="h-24 w-24 bg-indigo-950/60 rounded-2xl border border-indigo-700/30 flex flex-col items-center justify-center shrink-0">
            <Trophy className="w-10 h-10 text-amber-500" />
            <span className="text-[10px] font-extrabold uppercase mt-1 tracking-wide text-amber-400">Season 1</span>
          </div>
        </div>
      </section>

      {/* Class picker Selector Tabs */}
      <div className="flex flex-wrap gap-2 pb-2 border-b border-slate-100 dark:border-slate-800/80">
        {classes.map((cls) => {
          const isActive = selectedClassId === cls.id;
          return (
            <button
              key={cls.id}
              onClick={() => setSelectedClassId(cls.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {cls.name}
            </button>
          );
        })}
      </div>

      {currentBoard.length === 0 ? (
        <Card className="p-8 text-center border-dashed border-2 bg-slate-50/20 dark:bg-slate-900/10">
          <Award className="w-10 h-10 text-slate-400 mx-auto mb-3 opacity-60" />
          <p className="text-sm text-slate-500 font-bold">No active student records found for {activeClassName} yet.</p>
        </Card>
      ) : (
        <>
          {/* Top 3 Podium Visually */}
          {topRankers.length > 0 && (
            <section className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center items-end pt-4">
              {/* Podium Rank 2 */}
              {topRankers[1] && (
                <Card glassmorphism hoverEffect className="order-2 md:order-1 p-5 border-slate-200/50 flex flex-col items-center bg-slate-50/40 dark:bg-slate-950/20">
                  <Medal className="w-8 h-8 text-slate-400 mb-2" />
                  <img src={topRankers[1].avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&h=100&q=80'} alt="" className="w-16 h-16 rounded-full border-2 border-slate-300 shadow-md" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-3">{topRankers[1].fullName}</h3>
                  <Badge variant="secondary" size="sm" className="mt-2">2nd Rank</Badge>
                  <div className="mt-3 text-xs space-y-1 font-semibold text-slate-500">
                    <p className="text-blue-600 dark:text-blue-400 font-extrabold">{topRankers[1].totalXp} XP</p>
                    <p>Quiz Score: {topRankers[1].quizScore}</p>
                    <p>Accuracy: {topRankers[1].accuracy}%</p>
                  </div>
                </Card>
              )}

              {/* Podium Rank 1 */}
              {topRankers[0] && (
                <Card glassmorphism hoverEffect className="order-1 md:order-2 p-6 border-amber-200/50 flex flex-col items-center scale-105 shadow-xl bg-gradient-to-b from-amber-500/5 to-transparent dark:from-amber-950/10">
                  <Trophy className="w-10 h-10 text-amber-500 mb-2" />
                  <img src={topRankers[0].avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&h=100&q=80'} alt="" className="w-20 h-20 rounded-full border-4 border-amber-400 shadow-lg" />
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white mt-3">{topRankers[0].fullName}</h3>
                  <Badge variant="warning" size="sm" className="mt-2">1st Rank</Badge>
                  <div className="mt-3 text-xs space-y-1 font-semibold text-slate-500">
                    <p className="text-amber-600 dark:text-amber-400 font-black">{topRankers[0].totalXp} XP</p>
                    <p className="font-extrabold">Quiz Score: {topRankers[0].quizScore}</p>
                    <p>Accuracy: {topRankers[0].accuracy}%</p>
                  </div>
                </Card>
              )}

              {/* Podium Rank 3 */}
              {topRankers[2] && (
                <Card glassmorphism hoverEffect className="order-3 p-5 border-slate-200/50 flex flex-col items-center bg-slate-50/40 dark:bg-slate-950/20">
                  <Medal className="w-8 h-8 text-amber-700 mb-2" />
                  <img src={topRankers[2].avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&h=100&q=80'} alt="" className="w-16 h-16 rounded-full border-2 border-amber-600/30 shadow-md" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-3">{topRankers[2].fullName}</h3>
                  <Badge variant="primary" size="sm" className="mt-2">3rd Rank</Badge>
                  <div className="mt-3 text-xs space-y-1 font-semibold text-slate-500">
                    <p className="text-blue-600 dark:text-blue-400 font-extrabold">{topRankers[2].totalXp} XP</p>
                    <p>Quiz Score: {topRankers[2].quizScore}</p>
                    <p>Accuracy: {topRankers[2].accuracy}%</p>
                  </div>
                </Card>
              )}
            </section>
          )}

          {/* Table: Full board standings */}
          <section className="space-y-4">
            <h2 className="text-sm font-black uppercase text-slate-400 tracking-wider">
              Full Standings List
            </h2>

            <Card className="overflow-x-auto border-slate-200/50 dark:border-slate-800/80 bg-white/55 dark:bg-slate-900/40 backdrop-blur-lg">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-slate-100/55 dark:bg-slate-900/60 text-slate-400 font-bold uppercase tracking-wider text-[9px] border-b border-slate-200 dark:border-slate-800">
                    <th className="px-5 py-3">Rank</th>
                    <th className="px-5 py-3">Student Name</th>
                    <th className="px-5 py-3 text-center">XP</th>
                    <th className="px-5 py-3 text-center">Quiz Score</th>
                    <th className="px-5 py-3 text-center">Correct</th>
                    <th className="px-5 py-3 text-center">Wrong</th>
                    <th className="px-5 py-3 text-center">Accuracy</th>
                    <th className="px-5 py-3 text-center">Time Spent</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {currentBoard.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/25 transition-all">
                      <td className="px-5 py-4 font-black text-slate-500">{item.rank}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <img src={item.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&h=80&q=80'} alt="" className="w-7 h-7 rounded-full border border-slate-200 dark:border-slate-800" />
                          <span className="font-bold text-slate-800 dark:text-slate-200">{item.fullName}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-center font-extrabold text-blue-600 dark:text-blue-400">{item.totalXp} XP</td>
                      <td className="px-5 py-4 text-center font-bold text-slate-900 dark:text-slate-100">{item.quizScore}</td>
                      <td className="px-5 py-4 text-center font-semibold text-emerald-500">{item.correctAnswers}</td>
                      <td className="px-5 py-4 text-center font-semibold text-red-500">{item.wrongAnswers}</td>
                      <td className="px-5 py-4 text-center">
                        <Badge variant={item.accuracy >= 60 ? 'success' : 'secondary'} className="font-bold">
                          {item.accuracy}%
                        </Badge>
                      </td>
                      <td className="px-5 py-4 text-center font-semibold text-slate-500">
                        {Math.floor(item.timeTaken / 60)}m {item.timeTaken % 60}s
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </section>
        </>
      )}
    </div>
  );
}
