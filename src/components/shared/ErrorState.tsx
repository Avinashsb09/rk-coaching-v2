/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ShieldAlert, RotateCcw } from 'lucide-react';
import { Button } from '../ui/Button';
import { useApp } from '../../context/AppContext';

interface ErrorStateProps {
  title?: string;
  description?: string;
  code?: string;
}

export function ErrorState({
  title = 'Access Restrained',
  description = 'You are trying to load a premium course directory or dashboard segment without sufficient role claims or active purchase orders.',
  code = 'AUTH_403'
}: ErrorStateProps) {
  const { setCurrentView } = useApp();

  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center min-h-[50vh]">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 dark:bg-red-950/30 text-red-500 mb-6 border border-red-100 dark:border-red-900/30">
        <ShieldAlert className="w-8 h-8 animate-pulse" />
      </div>
      <span className="text-[10px] font-extrabold tracking-wider text-red-600 dark:text-red-400 bg-red-100/60 dark:bg-red-950/50 px-2.5 py-1 rounded-full uppercase mb-3">
        System code: {code}
      </span>
      <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-50 mb-3">
        {title}
      </h2>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed mb-8">
        {description}
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          variant="primary"
          onClick={() => {
            setCurrentView('auth');
          }}
        >
          Sign In / Register
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            setCurrentView('home');
          }}
          leftIcon={<RotateCcw className="w-4 h-4" />}
        >
          Return to Home
        </Button>
      </div>
    </div>
  );
}
