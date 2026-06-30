/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { BookOpen, Moon, Sun, Menu, X, ChevronDown, User, LogOut, Search, Flame, ShieldAlert, Bell, Check, Trash2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Button } from '../ui/Button';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';

interface HeaderProps {
  onToggleSidebar?: () => void;
}

export function Header({ onToggleSidebar }: HeaderProps) {
  const {
    role,
    user,
    loginAs,
    logout,
    darkMode,
    setDarkMode,
    currentView,
    setCurrentView,
    classes,
    globalSearch,
    setGlobalSearch,
    addToast,
    notifications,
    unreadNotificationsCount,
    markNotificationRead,
    markAllNotificationsRead,
    deleteNotification
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [classDropdownOpen, setClassDropdownOpen] = useState(false);
  const [notificationsDropdownOpen, setNotificationsDropdownOpen] = useState(false);

  const handleClassSelect = (slug: string, className: string) => {
    addToast(`Filtering catalog by ${className}`, 'info');
    setCurrentView('home');
    setGlobalSearch(slug);
    setClassDropdownOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 dark:border-slate-800 dark:bg-slate-900/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Left segment - Logo */}
        <div className="flex items-center gap-4">
          {role !== 'visitor' && onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="p-1.5 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden cursor-pointer"
            >
              <Menu className="w-5.5 h-5.5" />
            </button>
          )}

          <div
            onClick={() => {
              setCurrentView('home');
              setGlobalSearch('');
            }}
            className="flex items-center gap-2.5 cursor-pointer select-none group"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/25 group-hover:scale-105 transition-all">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
                RK <span className="text-blue-600 dark:text-blue-450">Coaching</span>
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] px-1.5 py-0.5 rounded-md font-bold bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                LMS
              </span>
            </div>
          </div>
        </div>

        {/* Center Section - Class Selection Dropdown & Quick links */}
        <nav className="hidden md:flex items-center gap-6">
          <div className="relative">
            <button
              onClick={() => setClassDropdownOpen(!classDropdownOpen)}
              onBlur={() => setTimeout(() => setClassDropdownOpen(false), 200)}
              className="flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-350 dark:hover:text-slate-100 cursor-pointer"
            >
              <span>Explore Classes</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${classDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {classDropdownOpen && (
              <div className="absolute top-8 left-0 z-50 w-56 rounded-2xl border border-slate-100 bg-white p-2.5 shadow-xl dark:border-slate-800 dark:bg-slate-950">
                <div className="max-h-64 overflow-y-auto space-y-1 pr-1">
                  {classes.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => handleClassSelect(c.slug, c.name)}
                      className="w-full text-left px-3 py-2 text-xs font-medium rounded-xl text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-900 transition-all cursor-pointer"
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => setCurrentView('faq')}
            className={`text-sm font-semibold transition-colors cursor-pointer ${
              currentView === 'faq'
                ? 'text-blue-600 dark:text-blue-400 font-bold border-b-2 border-blue-600 dark:border-blue-400 pb-0.5'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-350 dark:hover:text-slate-100'
            }`}
          >
            FAQs
          </button>

          <button
            onClick={() => setCurrentView('advanced-search')}
            className={`text-sm font-semibold transition-colors cursor-pointer flex items-center gap-1 ${
              currentView === 'advanced-search'
                ? 'text-blue-600 dark:text-blue-400 font-bold border-b-2 border-blue-600 dark:border-blue-400 pb-0.5'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-350 dark:hover:text-slate-100'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>Advanced Search</span>
          </button>
          
          <button
            onClick={() => setCurrentView('contact')}
            className={`text-sm font-semibold transition-colors cursor-pointer ${
              currentView === 'contact'
                ? 'text-blue-600 dark:text-blue-400 font-bold border-b-2 border-blue-600 dark:border-blue-400 pb-0.5'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-350 dark:hover:text-slate-100'
            }`}
          >
            Contact Support
          </button>
        </nav>

        {/* Right segment - Theme toggle, Profile */}
        <div className="flex items-center gap-3">

          {/* Notifications Popover */}
          {user && (
            <div className="relative">
              <button
                onClick={() => setNotificationsDropdownOpen(!notificationsDropdownOpen)}
                className="relative p-2 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
                aria-label="Toggle notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 h-4 w-4 rounded-full bg-red-500 text-[9px] font-black text-white flex items-center justify-center animate-pulse">
                    {unreadNotificationsCount}
                  </span>
                )}
              </button>

              {notificationsDropdownOpen && (
                <div 
                  className="absolute right-0 mt-2 z-50 w-80 rounded-2xl border border-slate-150 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-950 text-left overflow-hidden"
                  onMouseLeave={() => setNotificationsDropdownOpen(false)}
                >
                  <div className="bg-slate-50 dark:bg-slate-900 p-4 border-b border-slate-150 dark:border-slate-800 flex items-center justify-between">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                      <Bell className="w-3.5 h-3.5 text-blue-600" />
                      Notifications ({notifications.length})
                    </h3>
                    {unreadNotificationsCount > 0 && (
                      <button
                        onClick={() => {
                          markAllNotificationsRead();
                        }}
                        className="text-[10px] font-bold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Check className="w-3 h-3" /> Mark all read
                      </button>
                    )}
                  </div>

                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                    {notifications.length === 0 ? (
                      <div className="py-8 text-center text-slate-400 space-y-2">
                        <span className="text-lg">🎒</span>
                        <p className="text-xs font-semibold">You're all caught up!</p>
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div 
                          key={n.id} 
                          className={`p-3.5 space-y-1 hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-all relative ${
                            !n.isRead ? 'bg-blue-50/20 dark:bg-blue-950/10' : ''
                          }`}
                        >
                          <div className="flex justify-between items-start gap-3">
                            <h4 className={`text-xs text-slate-900 dark:text-white leading-snug ${!n.isRead ? 'font-extrabold' : 'font-semibold'}`}>
                              {n.title}
                            </h4>
                            <div className="flex items-center gap-1">
                              {!n.isRead && (
                                <button
                                  onClick={() => markNotificationRead(n.id)}
                                  className="p-1 text-slate-400 hover:text-blue-600 rounded-md hover:bg-blue-50 cursor-pointer"
                                  title="Mark as read"
                                >
                                  <Check className="w-3 h-3" />
                                </button>
                              )}
                              <button
                                onClick={() => deleteNotification(n.id)}
                                className="p-1 text-slate-400 hover:text-red-500 rounded-md hover:bg-red-50 cursor-pointer"
                                title="Dismiss notification"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                          <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                            {n.message}
                          </p>
                          <span className="text-[9px] text-slate-400 font-mono inline-block pt-0.5">
                            {new Date(n.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Dark Mode Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
            title="Toggle Theme"
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* User Section */}
          {user ? (
            <div className="hidden lg:flex items-center gap-3 pl-2.5 border-l border-slate-200 dark:border-slate-800">
              <div className="text-right">
                <p className="text-xs font-bold text-slate-900 dark:text-slate-50">
                  {user.fullName}
                </p>
                {role === 'student' && (
                  <div className="flex items-center justify-end gap-1 mt-0.5">
                    <Flame className="w-3.5 h-3.5 text-orange-500 animate-pulse" />
                    <span className="text-[10px] font-extrabold text-orange-600 dark:text-orange-400">
                      {user.dailyStreak} Days
                    </span>
                  </div>
                )}
                {role !== 'student' && (
                  <span className="text-[10px] font-bold text-slate-400 uppercase">
                    {role}
                  </span>
                )}
              </div>
              <Avatar src={user.avatarUrl} name={user.fullName} size="sm" />
              <button
                onClick={logout}
                className="p-1.5 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all cursor-pointer"
                title="Logout"
              >
                <LogOut className="w-4.5 h-4.5" />
              </button>
            </div>
          ) : (
            <div className="hidden sm:flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setCurrentView('auth')}>
                Login
              </Button>
              <Button variant="primary" size="sm" onClick={() => setCurrentView('auth')}>
                Register
              </Button>
            </div>
          )}

          {/* Mobile Menu Toggler */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 md:hidden cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

        </div>
      </div>

      {/* Mobile Drawer Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-4 space-y-3.5">
          <div className="space-y-1">
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2 px-1">
              Main Menu
            </p>
            <button
              onClick={() => {
                setCurrentView('home');
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3 py-2 text-sm font-semibold rounded-xl transition-all ${
                currentView === 'home'
                  ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 font-bold'
                  : 'text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'
              }`}
            >
              Course Directory
            </button>
            <button
              onClick={() => {
                setCurrentView('faq');
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3 py-2 text-sm font-semibold rounded-xl transition-all ${
                currentView === 'faq'
                  ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 font-bold'
                  : 'text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'
              }`}
            >
              FAQs
            </button>
            <button
              onClick={() => {
                setCurrentView('advanced-search');
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3 py-2 text-sm font-semibold rounded-xl transition-all ${
                currentView === 'advanced-search'
                  ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 font-bold'
                  : 'text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'
              }`}
            >
              Advanced Search
            </button>
            <button
              onClick={() => {
                setCurrentView('contact');
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3 py-2 text-sm font-semibold rounded-xl transition-all ${
                currentView === 'contact'
                  ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 font-bold'
                  : 'text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'
              }`}
            >
              Contact Support
            </button>
          </div>

          {user ? (
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar src={user.avatarUrl} name={user.fullName} size="sm" />
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-slate-50">{user.fullName}</p>
                  <p className="text-xs text-slate-400">{user.email}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/25 rounded-xl transition-all"
              >
                <LogOut className="w-4.5 h-4.5" />
              </button>
            </div>
          ) : (
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2">
              <Button variant="outline" onClick={() => { setCurrentView('auth'); setMobileMenuOpen(false); }}>
                Login
              </Button>
              <Button variant="primary" onClick={() => { setCurrentView('auth'); setMobileMenuOpen(false); }}>
                Register
              </Button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
