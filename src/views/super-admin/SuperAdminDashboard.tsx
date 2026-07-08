/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Super Admin Dashboard — Sprint 1 Foundation
 * ─────────────────────────────────────────────────────────────────────────────
 * This is the master control center of the RK Coaching LMS.
 * Sprint 1 establishes the full navigation skeleton, layout system,
 * and stat card placeholders. Individual modules will be built in
 * Sprints 2–8 and plugged into the corresponding navigation slots.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import {
  LayoutDashboard,
  GraduationCap,
  BookOpen,
  FileText,
  Video,
  ClipboardList,
  BrainCircuit,
  Users,
  UserCheck,
  UserCog,
  ShieldCheck,
  CreditCard,
  Receipt,
  Package,
  Megaphone,
  BarChart3,
  Settings,
  Flag,
  KeyRound,
  SlidersHorizontal,
  Activity,
  ChevronRight,
  ChevronDown,
  Menu,
  X,
  Layers,
  Crown,
  TrendingUp,
  BookMarked,
  LogOut,
  Bell,
} from 'lucide-react';
import AcademicManagement from './modules/academic/AcademicManagement';
import ContentManagement from './modules/content/ContentManagement';

// ─────────────────────────────────────────────────────────────────────────────
//  Navigation Config
// ─────────────────────────────────────────────────────────────────────────────

type SAView =
  | 'sa-dashboard'
  | 'sa-academic-standards'
  | 'sa-subjects'
  | 'sa-chapters'
  | 'sa-notes'
  | 'sa-videos'
  | 'sa-pyq'
  | 'sa-quiz'
  | 'sa-students'
  | 'sa-premium-students'
  | 'sa-teachers'
  | 'sa-admins'
  | 'sa-payment-methods'
  | 'sa-transactions'
  | 'sa-premium-packages'
  | 'sa-announcements'
  | 'sa-analytics'
  | 'sa-feature-flags'
  | 'sa-roles'
  | 'sa-settings'
  | 'sa-activity-logs';

interface NavItem {
  id: SAView;
  label: string;
  icon: React.ReactNode;
  badge?: string;
  comingSoon?: boolean;
}

interface NavGroup {
  label: string;
  icon: React.ReactNode;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Academic Management',
    icon: <GraduationCap className="w-4 h-4" />,
    items: [
      { id: 'sa-academic-standards', label: 'Academic Standards', icon: <Layers className="w-3.5 h-3.5" /> },
      { id: 'sa-subjects', label: 'Subjects', icon: <BookOpen className="w-3.5 h-3.5" /> },
      { id: 'sa-chapters', label: 'Chapters', icon: <ClipboardList className="w-3.5 h-3.5" /> },
    ],
  },
  {
    label: 'Content Management',
    icon: <FileText className="w-4 h-4" />,
    items: [
      { id: 'sa-notes', label: 'Notes & PDFs', icon: <FileText className="w-3.5 h-3.5" /> },
      { id: 'sa-videos', label: 'Video Lectures', icon: <Video className="w-3.5 h-3.5" /> },
      { id: 'sa-pyq', label: 'Previous Year Papers', icon: <BookMarked className="w-3.5 h-3.5" /> },
      { id: 'sa-quiz', label: 'Live Quiz Bank', icon: <BrainCircuit className="w-3.5 h-3.5" /> },
    ],
  },
  {
    label: 'User Management',
    icon: <Users className="w-4 h-4" />,
    items: [
      { id: 'sa-students', label: 'All Students', icon: <Users className="w-3.5 h-3.5" /> },
      { id: 'sa-premium-students', label: 'Premium Students', icon: <Crown className="w-3.5 h-3.5" />, badge: 'Premium' },
      { id: 'sa-teachers', label: 'Teachers', icon: <UserCheck className="w-3.5 h-3.5" /> },
      { id: 'sa-admins', label: 'Admins', icon: <UserCog className="w-3.5 h-3.5" /> },
    ],
  },
  {
    label: 'Payment Management',
    icon: <CreditCard className="w-4 h-4" />,
    items: [
      { id: 'sa-payment-methods', label: 'Payment Methods', icon: <CreditCard className="w-3.5 h-3.5" /> },
      { id: 'sa-transactions', label: 'Transactions', icon: <Receipt className="w-3.5 h-3.5" /> },
      { id: 'sa-premium-packages', label: 'Premium Packages', icon: <Package className="w-3.5 h-3.5" /> },
    ],
  },
  {
    label: 'System Settings',
    icon: <Settings className="w-4 h-4" />,
    items: [
      { id: 'sa-feature-flags', label: 'Feature Flags', icon: <Flag className="w-3.5 h-3.5" /> },
      { id: 'sa-roles', label: 'Roles & Permissions', icon: <KeyRound className="w-3.5 h-3.5" /> },
      { id: 'sa-settings', label: 'General Settings', icon: <SlidersHorizontal className="w-3.5 h-3.5" /> },
    ],
  },
];

const NAV_SINGLES: NavItem[] = [
  { id: 'sa-announcements', label: 'Announcements', icon: <Megaphone className="w-4 h-4" /> },
  { id: 'sa-analytics', label: 'Reports & Analytics', icon: <BarChart3 className="w-4 h-4" /> },
  { id: 'sa-activity-logs', label: 'Activity Logs', icon: <Activity className="w-4 h-4" /> },
];

// ─────────────────────────────────────────────────────────────────────────────
//  Dashboard stat cards data
// ─────────────────────────────────────────────────────────────────────────────

const STAT_CARDS = [
  {
    label: 'Total Students',
    value: '—',
    icon: <Users className="w-5 h-5" />,
    color: 'from-blue-500/20 to-indigo-500/10',
    border: 'border-blue-500/20',
    iconBg: 'bg-blue-500/15 text-blue-500',
    trend: 'Live from DB',
  },
  {
    label: 'Premium Students',
    value: '—',
    icon: <Crown className="w-5 h-5" />,
    color: 'from-amber-500/20 to-orange-500/10',
    border: 'border-amber-500/20',
    iconBg: 'bg-amber-500/15 text-amber-500',
    trend: 'Live from DB',
  },
  {
    label: 'Total Revenue',
    value: '—',
    icon: <TrendingUp className="w-5 h-5" />,
    color: 'from-emerald-500/20 to-green-500/10',
    border: 'border-emerald-500/20',
    iconBg: 'bg-emerald-500/15 text-emerald-500',
    trend: 'Sprint 6',
  },
  {
    label: 'Active Teachers',
    value: '—',
    icon: <UserCheck className="w-5 h-5" />,
    color: 'from-violet-500/20 to-purple-500/10',
    border: 'border-violet-500/20',
    iconBg: 'bg-violet-500/15 text-violet-500',
    trend: 'Live from DB',
  },
  {
    label: 'Academic Standards',
    value: '—',
    icon: <GraduationCap className="w-5 h-5" />,
    color: 'from-cyan-500/20 to-sky-500/10',
    border: 'border-cyan-500/20',
    iconBg: 'bg-cyan-500/15 text-cyan-500',
    trend: 'Sprint 2',
  },
  {
    label: 'Published Notes',
    value: '—',
    icon: <FileText className="w-5 h-5" />,
    color: 'from-rose-500/20 to-pink-500/10',
    border: 'border-rose-500/20',
    iconBg: 'bg-rose-500/15 text-rose-500',
    trend: 'Sprint 3',
  },
  {
    label: 'Video Lectures',
    value: '—',
    icon: <Video className="w-5 h-5" />,
    color: 'from-orange-500/20 to-amber-500/10',
    border: 'border-orange-500/20',
    iconBg: 'bg-orange-500/15 text-orange-500',
    trend: 'Sprint 3',
  },
  {
    label: 'Quiz Attempts',
    value: '—',
    icon: <BrainCircuit className="w-5 h-5" />,
    color: 'from-indigo-500/20 to-blue-500/10',
    border: 'border-indigo-500/20',
    iconBg: 'bg-indigo-500/15 text-indigo-500',
    trend: 'Sprint 7',
  },
];

const SPRINT_ROADMAP = [
  { sprint: 1, label: 'Super Admin Dashboard Skeleton', status: 'complete' },
  { sprint: 2, label: 'Academic Management (Standards, Subjects, Chapters)', status: 'next' },
  { sprint: 3, label: 'Content Management (Notes, Videos, PYQ, Quiz)', status: 'pending' },
  { sprint: 4, label: 'Teacher Management', status: 'pending' },
  { sprint: 5, label: 'Student Management', status: 'pending' },
  { sprint: 6, label: 'Payment Management', status: 'pending' },
  { sprint: 7, label: 'Reports & Analytics', status: 'pending' },
  { sprint: 8, label: 'System Settings (Feature Flags, Roles)', status: 'pending' },
];

// ─────────────────────────────────────────────────────────────────────────────
//  Module placeholder
// ─────────────────────────────────────────────────────────────────────────────

function ModulePlaceholder({ id, label }: { id: SAView; label: string }) {
  const sprintMap: Partial<Record<SAView, number>> = {
    'sa-academic-standards': 2, 'sa-subjects': 2, 'sa-chapters': 2,
    'sa-notes': 3, 'sa-videos': 3, 'sa-pyq': 3, 'sa-quiz': 3,
    'sa-teachers': 4,
    'sa-students': 5, 'sa-premium-students': 5, 'sa-admins': 5,
    'sa-payment-methods': 6, 'sa-transactions': 6, 'sa-premium-packages': 6,
    'sa-analytics': 7,
    'sa-feature-flags': 8, 'sa-roles': 8, 'sa-settings': 8,
    'sa-announcements': 2, 'sa-activity-logs': 8,
  };
  const sprint = sprintMap[id] ?? 2;

  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center space-y-5 animate-fade-in">
      <div className="h-16 w-16 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
        <Layers className="w-8 h-8 text-indigo-400" />
      </div>
      <div className="space-y-2">
        <p className="text-lg font-black text-slate-800 dark:text-white">{label}</p>
        <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
          This module is scheduled for <span className="font-black text-indigo-500">Sprint {sprint}</span>. The navigation and routing are ready — full CRUD implementation follows in the next sprint.
        </p>
      </div>
      <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20">
        <div className="h-2 w-2 rounded-full bg-indigo-400 animate-pulse" />
        <span className="text-[10px] font-black uppercase tracking-wider text-indigo-400">
          Sprint {sprint} — Planned
        </span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  Main Component
// ─────────────────────────────────────────────────────────────────────────────

export default function SuperAdminDashboard() {
  const { user, logout, addToast, classes, subjects, chapters, users } = useApp();
  const [activeView, setActiveView] = useState<SAView>('sa-dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<string[]>([
    'Academic Management', 'Content Management',
  ]);

  const toggleGroup = (label: string) => {
    setExpandedGroups(prev =>
      prev.includes(label) ? prev.filter(g => g !== label) : [...prev, label]
    );
  };

  const activeLabel =
    [...NAV_SINGLES, ...NAV_GROUPS.flatMap(g => g.items)].find(i => i.id === activeView)?.label
    ?? 'Dashboard';

  // ── Sidebar ─────────────────────────────────────────────────────────────────
  const SidebarContent = () => (
    <nav className="flex flex-col h-full">
      {/* Brand */}
      <div className="p-5 border-b border-slate-800/60">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-xs font-black text-white uppercase tracking-wider">Super Admin</p>
            <p className="text-[9px] text-slate-500 font-semibold">RK Coaching LMS</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1 scrollbar-thin">

        {/* Dashboard */}
        <button
          onClick={() => { setActiveView('sa-dashboard'); setSidebarOpen(false); }}
          className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeView === 'sa-dashboard'
              ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/25'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <LayoutDashboard className="w-4 h-4 shrink-0" />
          Dashboard
        </button>

        {/* Single items */}
        {NAV_SINGLES.map(item => (
          <button
            key={item.id}
            onClick={() => { setActiveView(item.id); setSidebarOpen(false); }}
            className={`w-full flex items-center justify-between gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeView === item.id
                ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/25'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <span className="flex items-center gap-2.5">
              {item.icon}
              {item.label}
            </span>
          </button>
        ))}

        {/* Divider */}
        <div className="h-px bg-slate-800/60 my-2" />

        {/* Groups */}
        {NAV_GROUPS.map(group => (
          <div key={group.label} className="space-y-0.5">
            <button
              onClick={() => toggleGroup(group.label)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider text-slate-500 hover:text-slate-300 hover:bg-slate-800/40 transition-all"
            >
              <span className="flex items-center gap-2">
                {group.icon}
                {group.label}
              </span>
              {expandedGroups.includes(group.label)
                ? <ChevronDown className="w-3 h-3" />
                : <ChevronRight className="w-3 h-3" />
              }
            </button>

            {expandedGroups.includes(group.label) && (
              <div className="ml-3 pl-3 border-l border-slate-800/60 space-y-0.5">
                {group.items.map(item => (
                  <button
                    key={item.id}
                    onClick={() => { setActiveView(item.id); setSidebarOpen(false); }}
                    className={`w-full flex items-center justify-between gap-2 px-2.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                      activeView === item.id
                        ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/25'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      {item.icon}
                      {item.label}
                    </span>
                    {item.badge && (
                      <span className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/25">
                        {item.badge}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* User footer */}
      <div className="p-3 border-t border-slate-800/60">
        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-7 w-7 rounded-lg bg-violet-600/30 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-3.5 h-3.5 text-violet-400" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-200 truncate">{user?.fullName ?? 'Super Admin'}</p>
              <p className="text-[9px] text-slate-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={() => logout()}
            className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
            title="Logout"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </nav>
  );

  // ── Main Content ─────────────────────────────────────────────────────────────
  const renderContent = () => {
    if (activeView === 'sa-dashboard') {
      return (
        <div className="space-y-8 animate-fade-in">

          {/* Welcome */}
          <section className="relative rounded-3xl p-6 sm:p-8 overflow-hidden border border-violet-500/15 bg-gradient-to-br from-slate-900 via-indigo-950/50 to-slate-900">
            <div className="absolute top-0 right-0 w-80 h-80 bg-violet-500/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-60 h-60 bg-indigo-500/5 rounded-full blur-3xl" />
            <div className="relative">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="primary" className="text-[9px] font-black uppercase tracking-widest bg-violet-600/20 text-violet-300 border-violet-500/30">
                      Super Admin Control Center
                    </Badge>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black text-white">
                    Welcome, {user?.fullName?.split(' ')[0] ?? 'Admin'} 👑
                  </h1>
                  <p className="text-sm text-slate-400 max-w-lg leading-relaxed">
                    You have full control over the RK Coaching LMS platform. Manage academic content, users, payments, and system settings from this central command panel.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-12 w-12 rounded-2xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center">
                    <ShieldCheck className="w-6 h-6 text-violet-400" />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Stat cards */}
          <section>
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-4">Platform Overview</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {STAT_CARDS.map((card, i) => (
                <Card
                  key={i}
                  className={`p-4 border bg-gradient-to-br ${card.color} ${card.border} space-y-3`}
                >
                  <div className={`h-9 w-9 rounded-xl flex items-center justify-center ${card.iconBg}`}>
                    {card.icon}
                  </div>
                  <div>
                    <p className="text-xl font-black text-slate-900 dark:text-white">{card.value}</p>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">{card.label}</p>
                    <p className="text-[9px] text-slate-400 mt-0.5">{card.trend}</p>
                  </div>
                </Card>
              ))}
            </div>
          </section>

          {/* Sprint Roadmap */}
          <section>
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-4">Development Roadmap</h2>
            <Card className="p-5 border-slate-200/40 dark:border-slate-800/40 divide-y divide-slate-100 dark:divide-slate-800/60">
              {SPRINT_ROADMAP.map(item => (
                <div key={item.sprint} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <div className={`h-7 w-7 rounded-lg flex items-center justify-center text-[10px] font-black ${
                      item.status === 'complete'
                        ? 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/20'
                        : item.status === 'next'
                          ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/20'
                          : 'bg-slate-200/50 dark:bg-slate-800/50 text-slate-400'
                    }`}>
                      {item.sprint}
                    </div>
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">{item.label}</p>
                  </div>
                  <Badge
                    variant={item.status === 'complete' ? 'success' : item.status === 'next' ? 'primary' : 'secondary'}
                    className="text-[8px] font-black uppercase"
                  >
                    {item.status === 'complete' ? 'Done' : item.status === 'next' ? 'Next' : 'Planned'}
                  </Badge>
                </div>
              ))}
            </Card>
          </section>

          {/* Quick navigation cards */}
          <section>
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-4">Quick Navigation</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {[...NAV_GROUPS.flatMap(g => g.items), ...NAV_SINGLES].map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id)}
                  className="flex flex-col items-start gap-2 p-4 rounded-2xl border border-slate-200/50 dark:border-slate-800/40 bg-white/70 dark:bg-slate-900/50 hover:border-indigo-500/30 hover:bg-indigo-500/5 transition-all text-left group"
                >
                  <div className="h-8 w-8 rounded-xl bg-slate-100 dark:bg-slate-800 group-hover:bg-indigo-500/15 flex items-center justify-center text-slate-500 dark:text-slate-400 group-hover:text-indigo-500 transition-all">
                    {item.icon}
                  </div>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300 leading-tight">
                    {item.label}
                  </p>
                </button>
              ))}
            </div>
          </section>
        </div>
      );
    }
    
    if (activeView === 'sa-academic-standards') {
      return <AcademicManagement initialTab="standards" />;
    }
    if (activeView === 'sa-subjects') {
      return <AcademicManagement initialTab="subjects" />;
    }
    if (activeView === 'sa-chapters') {
      return <AcademicManagement initialTab="chapters" />;
    }
    if (activeView === 'sa-notes') {
      return <ContentManagement initialTab="notes" />;
    }
    if (activeView === 'sa-videos') {
      return <ContentManagement initialTab="videos" />;
    }
    if (activeView === 'sa-pyq') {
      return <ContentManagement initialTab="pyq" />;
    }
    if (activeView === 'sa-quiz') {
      return <ContentManagement initialTab="quiz" />;
    }

    return <ModulePlaceholder id={activeView} label={activeLabel} />;
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] -mx-4 sm:-mx-6 lg:-mx-8 overflow-hidden rounded-2xl border border-slate-200/40 dark:border-slate-800/40 shadow-2xl">

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:w-60 xl:w-64 shrink-0 bg-slate-950 dark:bg-slate-950 border-r border-slate-800/60 overflow-y-auto">
        <div className="w-full">
          <SidebarContent />
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 z-50 w-72 bg-slate-950 shadow-2xl lg:hidden overflow-y-auto">
            <div className="absolute top-3 right-3">
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 rounded-xl text-slate-500 hover:text-slate-200 hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <SidebarContent />
          </aside>
        </>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-50 dark:bg-slate-950 overflow-y-auto">

        {/* Top bar */}
        <div className="sticky top-0 z-20 flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-slate-200/40 dark:border-slate-800/60 bg-white/80 dark:bg-slate-950/90 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Menu className="w-4.5 h-4.5" />
            </button>
            <div>
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Super Admin</p>
              <h2 className="text-sm font-black text-slate-900 dark:text-white">{activeLabel}</h2>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="primary" className="text-[8px] font-black uppercase tracking-widest hidden sm:flex bg-violet-600/20 text-violet-400 border-violet-500/25">
              Master Control
            </Badge>
            <button className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
              <Bell className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Page content */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
