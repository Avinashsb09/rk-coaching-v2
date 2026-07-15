/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ChevronRight, Home, ArrowLeft } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export function Breadcrumbs() {
  const { 
    breadcrumbs, 
    setCurrentView, 
    role, 
    currentView 
  } = useApp();

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

  // Determine if this is a premium view for mobile compact rendering
  const isPremiumList = currentView === 'premium-content-list';
  const isPremiumDetail = currentView === 'premium-note-view' || currentView === 'premium-video-view';
  const isPremiumFlow = isPremiumList || isPremiumDetail;

  // Resolve back target and labels for mobile compact rendering
  let mobileBackView = 'premium-materials';
  let mobileBackLabel = 'My Premium Materials';
  let mobileTitle = 'Premium Materials';

  if (isPremiumList && breadcrumbs.length >= 3) {
    mobileBackView = breadcrumbs[0]?.view || 'premium-materials';
    mobileBackLabel = breadcrumbs[0]?.label || 'My Premium Materials';
    mobileTitle = `${breadcrumbs[2]?.label || ''} Premium ${breadcrumbs[1]?.label || ''}`;
  } else if (isPremiumDetail && breadcrumbs.length >= 5) {
    mobileBackView = breadcrumbs[2]?.view || 'premium-content-list';
    mobileBackLabel = `${breadcrumbs[2]?.label || ''} ${breadcrumbs[1]?.label || ''}`;
    mobileTitle = breadcrumbs[4]?.label || '';
  }

  return (
    <nav aria-label="Breadcrumb" className="w-full">
      {/* 1. Desktop Breadcrumbs View (hidden on mobile, flex on desktop) */}
      <div className="hidden md:flex px-4 py-3 bg-slate-50 border-b border-slate-200 text-slate-500 dark:bg-slate-950 dark:border-slate-800">
        <ol className="inline-flex items-center space-x-1 md:space-x-3 text-xs font-semibold select-none">
          <li className="inline-flex items-center">
            <button
              onClick={() => handleCrumbsClick('home')}
              className="inline-flex items-center text-slate-500 hover:text-slate-855 dark:text-slate-400 dark:hover:text-slate-200 cursor-pointer"
            >
              <Home className="w-3.5 h-3.5 mr-1.5" />
              Home
            </button>
          </li>
          {breadcrumbs.map((crumb, idx) => (
            <li key={idx}>
              <div className="flex items-center">
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 mx-1 shrink-0" />
                {crumb.view && idx < breadcrumbs.length - 1 ? (
                  <button
                    onClick={() => handleCrumbsClick(crumb.view, idx)}
                    className="text-slate-500 hover:text-slate-855 dark:text-slate-400 dark:hover:text-slate-200 cursor-pointer capitalize"
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
      </div>

      {/* 2. Mobile Compact Breadcrumbs View (flex on mobile, hidden on desktop) */}
      {isPremiumFlow ? (
        <div className="flex md:hidden flex-col px-4 py-3 bg-slate-50 border-b border-slate-200 dark:bg-slate-950 dark:border-slate-800 text-left">
          <button
            onClick={() => handleCrumbsClick(mobileBackView)}
            className="inline-flex items-center gap-1 text-[11px] font-black text-blue-600 dark:text-blue-400 cursor-pointer uppercase tracking-wider h-[44px]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{mobileBackLabel}</span>
          </button>
          <div className="text-sm font-black text-slate-900 dark:text-white mt-0.5 truncate">
            {mobileTitle}
          </div>
        </div>
      ) : (
        /* Fallback mobile breadcrumbs (shows Home/Dashboard link or current simple location) */
        <div className="flex md:hidden px-4 py-3 bg-slate-50 border-b border-slate-200 dark:bg-slate-950 dark:border-slate-800 text-left items-center">
          <button
            onClick={() => handleCrumbsClick('home')}
            className="inline-flex items-center gap-1.5 text-xs font-black text-slate-500 hover:text-slate-855 dark:text-slate-400 cursor-pointer h-[44px]"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Home</span>
          </button>
          {breadcrumbs.length > 0 && (
            <>
              <ChevronRight className="w-3 h-3 text-slate-400 mx-1 shrink-0" />
              <span className="text-xs font-black text-slate-900 dark:text-white truncate">
                {breadcrumbs[breadcrumbs.length - 1]?.label}
              </span>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
