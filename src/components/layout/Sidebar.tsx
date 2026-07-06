/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  LayoutDashboard,
  BookOpen,
  Trophy,
  HelpCircle,
  PlusSquare,
  User,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Settings
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface SidebarProps {
  isOpen: boolean;
  onToggleCollapse: () => void;
  isCollapsed: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen, onToggleCollapse, isCollapsed, onClose }: SidebarProps) {
  const { role, currentView, setCurrentView, user, addToast } = useApp();

  // Navigation Links based on active user role
  const getNavLinks = () => {
    switch (role) {
      case 'student':
        return [
          {
            id: 'student-dashboard',
            label: 'Dashboard',
            icon: <LayoutDashboard className="w-5 h-5" />
          },
          {
            id: 'update-profile',
            label: 'Update Profile',
            icon: <User className="w-5 h-5 text-emerald-500" />
          },
          {
            id: 'quiz-dashboard',
            label: 'Quiz Arena',
            icon: <Sparkles className="w-5 h-5 text-indigo-500" />
          },
          {
            id: 'pyq-dashboard',
            label: 'PYQ Arena',
            icon: <Trophy className="w-5 h-5 text-amber-500" />
          },
          {
            id: 'catalog',
            label: 'All Courses',
            icon: <BookOpen className="w-5 h-5" />
          },
          {
            id: 'purchases-invoices',
            label: 'My Invoices',
            icon: <CreditCard className="w-5 h-5" />
          },
          {
            id: 'faq',
            label: 'Syllabus Help',
            icon: <HelpCircle className="w-5 h-5" />
          }
        ];
      case 'teacher':
        return [
          {
            id: 'teacher-dashboard',
            label: 'Teacher Console',
            icon: <LayoutDashboard className="w-5 h-5" />
          },
          {
            id: 'teacher-content',
            label: 'Publish Content',
            icon: <PlusSquare className="w-5 h-5" />
          },
          {
            id: 'catalog',
            label: 'Browse Library',
            icon: <BookOpen className="w-5 h-5" />
          },
          {
            id: 'faq',
            label: 'Syllabus Guides',
            icon: <HelpCircle className="w-5 h-5" />
          }
        ];
      case 'admin':
        return [
          {
            id: 'admin-dashboard',
            label: 'Admin Overview',
            icon: <LayoutDashboard className="w-5 h-5" />
          },
          {
            id: 'admin-controls',
            label: 'Control CMS / DB',
            icon: <Settings className="w-5 h-5" />
          },
          {
            id: 'home',
            label: 'View Website',
            icon: <BookOpen className="w-5 h-5" />
          }
        ];
      default:
        return [];
    }
  };

  const navLinks = getNavLinks();

  if (role === 'visitor') return null;

  return (
    <aside
      className={`
        fixed inset-y-16 left-0 z-35 flex flex-col border-r border-slate-200/40 bg-white/70 dark:border-slate-800/40 dark:bg-slate-950/70 backdrop-blur-lg
        transition-all duration-300 lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)]
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        ${isCollapsed ? 'w-20' : 'w-64'}
      `}
    >
      {/* Sidebar Header Collapse Control Toggle for Desktop */}
      <div className="hidden lg:flex items-center justify-end p-3.5 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={onToggleCollapse}
          className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 text-slate-500 cursor-pointer"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation List items */}
      <nav className="flex-1 space-y-1.5 p-4 overflow-y-auto">
        {navLinks.map((link) => {
          const isActive = currentView === link.id;
          return (
            <button
              key={link.id}
              onClick={() => {
                setCurrentView(link.id);
                // On mobile, close the sidebar after navigation
                if (window.innerWidth < 1024) onClose?.();
              }}
              className={`
                w-full flex items-center gap-3.5 px-4 py-3 text-sm font-semibold rounded-2xl transition-all duration-200 cursor-pointer
                ${isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/55 dark:hover:bg-slate-800/40 hover:text-slate-900 dark:hover:text-slate-100'
                }
                ${isCollapsed ? 'justify-center px-2' : ''}
              `}
              title={isCollapsed ? link.label : undefined}
            >
              <span className="shrink-0">{link.icon}</span>
              {!isCollapsed && <span className="truncate">{link.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Sidebar Footer details (Streak / Streak details) */}
    </aside>
  );
}
