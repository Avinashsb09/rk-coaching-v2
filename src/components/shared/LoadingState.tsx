/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function LoadingState({ message = 'Loading academic resources...', size = 'md' }: LoadingStateProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-14 h-14'
  };

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center min-h-[300px]">
      <div className="relative flex items-center justify-center">
        <Loader2 className={`animate-spin text-blue-600 dark:text-blue-400 ${sizeClasses[size]}`} />
        <div className="absolute w-3 h-3 bg-blue-500 rounded-full animate-ping opacity-75" />
      </div>
      {message && (
        <p className="mt-4 text-sm font-semibold text-slate-500 dark:text-slate-400 animate-pulse">
          {message}
        </p>
      )}
    </div>
  );
}

export function LoadingSkeletonCard() {
  return (
    <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-5 w-full bg-white dark:bg-slate-900 animate-pulse">
      <div className="bg-slate-200 dark:bg-slate-800 h-40 rounded-xl mb-4" />
      <div className="bg-slate-200 dark:bg-slate-800 h-4 w-1/3 rounded-sm mb-2.5" />
      <div className="bg-slate-200 dark:bg-slate-800 h-6 w-3/4 rounded-sm mb-3.5" />
      <div className="bg-slate-200 dark:bg-slate-800 h-4 w-full rounded-sm mb-2" />
      <div className="bg-slate-200 dark:bg-slate-800 h-4 w-2/3 rounded-sm mb-4" />
      <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-3">
        <div className="bg-slate-200 dark:bg-slate-800 h-5 w-16 rounded-sm" />
        <div className="bg-slate-200 dark:bg-slate-800 h-9 w-24 rounded-lg" />
      </div>
    </div>
  );
}
