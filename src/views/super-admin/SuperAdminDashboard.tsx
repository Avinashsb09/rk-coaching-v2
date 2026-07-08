/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import {
  LayoutDashboard,
  GraduationCap,
  FileText,
  Users,
  UserCheck,
  CreditCard,
  Settings,
  ShieldCheck,
  Menu,
  X,
  LogOut,
  Bell,
  Activity,
  Layers,
  RefreshCw,
  Clock
} from 'lucide-react';
import AcademicManagement from './modules/academic/AcademicManagement';
import ContentManagement from './modules/content/ContentManagement';
import UserManagement from './modules/user/UserManagement';
import TeacherManagement from './modules/teacher/TeacherManagement';

// ─────────────────────────────────────────────────────────────────────────────
//  Navigation Config
// ─────────────────────────────────────────────────────────────────────────────

type SAView =
  | 'sa-dashboard'
  | 'sa-academic'
  | 'sa-users'
  | 'sa-teachers'
  | 'sa-content'
  | 'sa-payments'
  | 'sa-settings';

interface NavItem {
  id: SAView;
  label: string;
  icon: React.ReactNode;
}

const FLAT_NAV: NavItem[] = [
  { id: 'sa-dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
  { id: 'sa-academic', label: 'Academic', icon: <GraduationCap className="w-4 h-4" /> },
  { id: 'sa-users', label: 'Users', icon: <Users className="w-4 h-4" /> },
  { id: 'sa-teachers', label: 'Teachers', icon: <UserCheck className="w-4 h-4" /> },
  { id: 'sa-content', label: 'Content', icon: <FileText className="w-4 h-4" /> },
  { id: 'sa-payments', label: 'Payments', icon: <CreditCard className="w-4 h-4" /> },
  { id: 'sa-settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
];

// ─────────────────────────────────────────────────────────────────────────────
//  Module placeholder
// ─────────────────────────────────────────────────────────────────────────────

function ModulePlaceholder({ id, label }: { id: SAView; label: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center space-y-5 animate-fade-in">
      <div className="h-16 w-16 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
        <Settings className="w-8 h-8 text-indigo-400" />
      </div>
      <div className="space-y-2">
        <p className="text-lg font-black text-slate-800 dark:text-white">{label} Module</p>
        <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
          This unified module is scheduled for an upcoming sprint. Navigation and routing are ready.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  Main Component
// ─────────────────────────────────────────────────────────────────────────────

export default function SuperAdminDashboard() {
  const { user, logout, notes, videos, quizzes } = useApp();
  const [activeView, setActiveView] = useState<SAView>('sa-dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const activeLabel = FLAT_NAV.find(i => i.id === activeView)?.label ?? 'Dashboard';

  // Metrics for Action Dashboard
  const pendingReviewsCount = 
    notes.filter(n => n.status === 'review').length + 
    videos.filter(v => v.status === 'review').length + 
    quizzes.filter(q => q.status === 'review').length;
  
  const pendingAssignmentsCount = 0; // Derived logically based on teacher logic later

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
      <div className="flex-1 overflow-y-auto p-3 space-y-1.5 scrollbar-thin mt-2">
        {FLAT_NAV.map(item => (
          <button
            key={item.id}
            onClick={() => { setActiveView(item.id); setSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
              activeView === item.id
                ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/25'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            {item.icon}
            {item.label}
          </button>
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
                    Action Dashboard
                  </h1>
                  <p className="text-sm text-slate-400 max-w-lg leading-relaxed">
                    Prioritize your pending operational tasks and monitor immediate action queues.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Action Queues */}
          <section>
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-4">Immediate Action Queues</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="p-5 border-amber-500/20 bg-amber-500/5 flex flex-col gap-2">
                <div className="flex justify-between items-start">
                  <div className="p-2 bg-amber-500/10 text-amber-500 rounded-lg"><RefreshCw className="w-5 h-5" /></div>
                  <span className="text-2xl font-black text-amber-500">{pendingReviewsCount}</span>
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white">Content Reviews</h3>
                  <p className="text-[10px] text-slate-500">Awaiting your approval</p>
                </div>
                <button onClick={() => setActiveView('sa-content')} className="mt-2 text-[10px] font-bold text-amber-600 bg-amber-500/10 py-1.5 rounded-lg hover:bg-amber-500/20 transition-colors">
                  Review Now
                </button>
              </Card>

              <Card className="p-5 border-blue-500/20 bg-blue-500/5 flex flex-col gap-2">
                <div className="flex justify-between items-start">
                  <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg"><UserCheck className="w-5 h-5" /></div>
                  <span className="text-2xl font-black text-blue-500">0</span>
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white">Teacher Assignments</h3>
                  <p className="text-[10px] text-slate-500">Requires mapping</p>
                </div>
                <button onClick={() => setActiveView('sa-teachers')} className="mt-2 text-[10px] font-bold text-blue-600 bg-blue-500/10 py-1.5 rounded-lg hover:bg-blue-500/20 transition-colors">
                  Assign Teachers
                </button>
              </Card>

              <Card className="p-5 border-emerald-500/20 bg-emerald-500/5 flex flex-col gap-2">
                <div className="flex justify-between items-start">
                  <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg"><Users className="w-5 h-5" /></div>
                  <span className="text-2xl font-black text-emerald-500">0</span>
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white">User Approvals</h3>
                  <p className="text-[10px] text-slate-500">Pending KYC</p>
                </div>
                <button onClick={() => setActiveView('sa-users')} className="mt-2 text-[10px] font-bold text-emerald-600 bg-emerald-500/10 py-1.5 rounded-lg hover:bg-emerald-500/20 transition-colors">
                  Manage Users
                </button>
              </Card>

              <Card className="p-5 border-indigo-500/20 bg-indigo-500/5 flex flex-col gap-2">
                <div className="flex justify-between items-start">
                  <div className="p-2 bg-indigo-500/10 text-indigo-500 rounded-lg"><CreditCard className="w-5 h-5" /></div>
                  <span className="text-2xl font-black text-indigo-500">0</span>
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white">Payment Verification</h3>
                  <p className="text-[10px] text-slate-500">Offline receipts</p>
                </div>
                <button onClick={() => setActiveView('sa-payments')} className="mt-2 text-[10px] font-bold text-indigo-600 bg-indigo-500/10 py-1.5 rounded-lg hover:bg-indigo-500/20 transition-colors">
                  Verify Payments
                </button>
              </Card>
            </div>
          </section>

          {/* Recent Activity */}
          <section>
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-4">Recent System Activity</h2>
            <Card className="p-5 space-y-4">
              <div className="space-y-3">
                {[
                  { text: 'System Backup Completed successfully.', time: 'Just now', icon: <Activity className="w-3.5 h-3.5 text-emerald-500" /> },
                  { text: 'Teacher requested content review (Physics Ch 2).', time: '2 hours ago', icon: <Clock className="w-3.5 h-3.5 text-amber-500" /> },
                  { text: 'Super Admin logged in from new IP.', time: '1 day ago', icon: <ShieldCheck className="w-3.5 h-3.5 text-blue-500" /> }
                ].map((act, i) => (
                  <div key={i} className="flex gap-3 items-start text-[11px] border-b border-slate-100 dark:border-slate-800 pb-3 last:border-0 last:pb-0">
                    <div className="mt-0.5">{act.icon}</div>
                    <div>
                      <p className="text-slate-700 dark:text-slate-300 font-semibold">{act.text}</p>
                      <p className="text-[9px] text-slate-400 font-mono mt-0.5">{act.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </section>
        </div>
      );
    }
    
    if (activeView === 'sa-academic') {
      return <AcademicManagement initialTab="standards" />;
    }
    if (activeView === 'sa-users') {
      return <UserManagement initialRoleFilter="student" />;
    }
    if (activeView === 'sa-teachers') {
      return <TeacherManagement />;
    }
    if (activeView === 'sa-content') {
      return <ContentManagement initialTab="notes" />;
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
