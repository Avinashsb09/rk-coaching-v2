/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Trophy, Star, Medal, ArrowUp, Zap, Flame, Award } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Avatar } from '../../components/ui/Avatar';
import { Card, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';

export default function Leaderboard() {
  const { user } = useApp();

  const mockLeaderboard = [
    { rank: 1, name: 'Siddharth Roy', xp: 5800, badge: 'Grand Master 👑', streak: 42, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&h=100&q=80' },
    { rank: 2, name: 'Nisha Aggarwal', xp: 5120, badge: 'Elite Scholar 🌟', streak: 28, avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&h=100&q=80' },
    { rank: 3, name: 'Aarav Sharma', xp: 4400, badge: 'Quiz Master ⚡', streak: 12, avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&h=100&q=80' },
    { rank: 4, name: 'Ananya Deshmukh', xp: 3900, badge: 'Pioneer 🏅', streak: 19, avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=100&h=100&q=80' },
    { rank: 5, name: 'Rohan Joshi', xp: 3250, badge: 'Speed Learner', streak: 9, avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=100&h=100&q=80' }
  ];

  return (
    <div className="max-w-4xl mx-auto py-4 space-y-8 text-left">
      {/* Leaderboard Title header */}
      <section className="bg-gradient-to-br from-indigo-900 to-slate-900 border border-indigo-800 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl" />
        <div className="relative flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div className="space-y-3">
            <Badge variant="warning" className="bg-amber-500/15 text-amber-400 border-amber-500/20">
              Global Ranks
            </Badge>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              NEET & Boards Leaderboard
            </h1>
            <p className="text-sm text-slate-300 max-w-md leading-relaxed">
              Earn XP points by attending lecture modules, passing relational quizzes, and retaining daily study streaks!
            </p>
          </div>
          <div className="h-24 w-24 bg-indigo-950 rounded-2xl border border-indigo-700/50 flex flex-col items-center justify-center shrink-0">
            <Trophy className="w-10 h-10 text-amber-500 animate-bounce" />
            <span className="text-[10px] font-extrabold uppercase mt-1 tracking-wide text-amber-400">XP Season 1</span>
          </div>
        </div>
      </section>

      {/* Top 3 podium visually */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center items-end">
        {/* Rank 2 */}
        <Card className="order-2 md:order-1 p-5 border-slate-150 flex flex-col items-center bg-slate-50/40 dark:bg-slate-950/20">
          <Medal className="w-8 h-8 text-slate-400 mb-2" />
          <Avatar src={mockLeaderboard[1].avatar} name={mockLeaderboard[1].name} size="lg" className="border-2 border-slate-300 shadow-md" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-3">{mockLeaderboard[1].name}</h3>
          <p className="text-[10px] text-slate-400 font-semibold">{mockLeaderboard[1].badge}</p>
          <Badge variant="secondary" size="sm" className="mt-2.5">2nd Rank</Badge>
          <p className="text-xs font-extrabold text-blue-600 dark:text-blue-400 mt-2">{mockLeaderboard[1].xp} XP</p>
        </Card>

        {/* Rank 1 */}
        <Card className="order-1 md:order-2 p-6 border-amber-200/50 flex flex-col items-center scale-105 shadow-xl bg-gradient-to-b from-amber-500/5 to-transparent dark:from-amber-950/10">
          <Trophy className="w-10 h-10 text-amber-500 mb-2" />
          <Avatar src={mockLeaderboard[0].avatar} name={mockLeaderboard[0].name} size="xl" className="border-4 border-amber-400 shadow-lg" />
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white mt-3">{mockLeaderboard[0].name}</h3>
          <p className="text-[10px] text-amber-600 dark:text-amber-400 font-extrabold">{mockLeaderboard[0].badge}</p>
          <Badge variant="warning" size="sm" className="mt-2.5">1st Rank</Badge>
          <p className="text-sm font-extrabold text-amber-600 dark:text-amber-400 mt-2">{mockLeaderboard[0].xp} XP</p>
        </Card>

        {/* Rank 3 */}
        <Card className="order-3 p-5 border-slate-150 flex flex-col items-center bg-slate-50/40 dark:bg-slate-950/20">
          <Medal className="w-8 h-8 text-amber-700 mb-2" />
          <Avatar src={mockLeaderboard[2].avatar} name={mockLeaderboard[2].name} size="lg" className="border-2 border-amber-600/30 shadow-md" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-3">{mockLeaderboard[2].name}</h3>
          <p className="text-[10px] text-slate-400 font-semibold">{mockLeaderboard[2].badge}</p>
          <Badge variant="primary" size="sm" className="mt-2.5">3rd Rank</Badge>
          <p className="text-xs font-extrabold text-blue-600 dark:text-blue-400 mt-2">{mockLeaderboard[2].xp} XP</p>
        </Card>
      </section>

      {/* Grid: Full board review */}
      <section className="space-y-4">
        <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
          Full Scholar Standings
        </h2>

        <Card>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {mockLeaderboard.map((item) => (
              <div key={item.rank} className="p-4 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-slate-950/25 transition-all">
                <div className="flex items-center gap-4">
                  <span className="w-5 text-center font-extrabold text-slate-500 text-xs">{item.rank}</span>
                  <Avatar src={item.avatar} name={item.name} size="sm" />
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{item.name}</p>
                    <p className="text-[10px] text-slate-400 font-semibold">{item.badge}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-6 text-right">
                  <div className="hidden sm:block">
                    <p className="text-[10px] font-bold text-slate-450 uppercase">Study Streak</p>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-end gap-1">
                      <Flame className="w-3.5 h-3.5 text-orange-500" />
                      {item.streak} Days
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-450 uppercase">Score</p>
                    <p className="text-xs font-extrabold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      {item.xp} XP
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </div>
  );
}
