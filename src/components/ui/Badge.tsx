/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ReactNode } from 'react';

export interface BadgeProps {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info';
  size?: 'sm' | 'md';
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export function Badge({
  variant = 'primary',
  size = 'md',
  icon,
  children,
  className = '',
  onClick
}: BadgeProps) {
  const baseStyle = 'inline-flex items-center font-semibold rounded-full tracking-wide';

  const variants = {
    primary: 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/45 dark:text-blue-400 dark:border-blue-900/40',
    secondary: 'bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
    success: 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/45 dark:text-emerald-400 dark:border-emerald-900/40',
    danger: 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/45 dark:text-red-400 dark:border-red-900/40',
    warning: 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/45 dark:text-amber-400 dark:border-amber-900/40',
    info: 'bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-950/45 dark:text-indigo-400 dark:border-indigo-900/40'
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-[10px] gap-1',
    md: 'px-2.5 py-1 text-xs gap-1.5'
  };

  return (
    <span onClick={onClick} className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`}>
      {icon && <span className="inline-flex shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
}
