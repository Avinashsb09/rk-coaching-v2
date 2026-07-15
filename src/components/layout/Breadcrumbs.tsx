/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ChevronRight, Home } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export function Breadcrumbs() {
  const { breadcrumbs, setCurrentView, role } = useApp();

  const handleCrumbsClick = (view?: string, index?: number) => {
    if (view === 'home' || !view) {
      if (role === 'student') {
        setCurrentView('student-dashboard');
      } else if (role === 'teacher') {
        setCurrentView('teacher-dashboard');
      } else if (role === 'admin') {
        setCurrentView('admin-dashboard');
      } else if (role === 'super_admin') {
        setCurrentView('super-admin-dashboard');
      } else {
        setCurrentView('home');
      }
    } else {
      setCurrentView(view);
    }
  };

  return (
    <nav className="flex px-4 py-3 bg-slate-50 border-b border-slate-200 text-slate-500 dark:bg-slate-950 dark:border-slate-800" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-3 text-xs font-semibold select-none">
        <li className="inline-flex items-center">
          <button
            onClick={() => handleCrumbsClick('home')}
            className="inline-flex items-center text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 cursor-pointer"
          >
            <Home className="w-3.5 h-3.5 mr-1.5" />
            Home
          </button>
        </li>
        {breadcrumbs.map((crumb, idx) => (
          <li key={idx}>
            <div className="flex items-center">
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 mx-1 shrink-0" />
              {crumb.view ? (
                <button
                  onClick={() => handleCrumbsClick(crumb.view, idx)}
                  className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 cursor-pointer capitalize"
                >
                  {crumb.label}
                </button>
              ) : (
                <span 
                  className="text-slate-400 dark:text-slate-600 capitalize cursor-default"
                  aria-current="page"
                >
                  {crumb.label}
                </span>
              )}
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
}
