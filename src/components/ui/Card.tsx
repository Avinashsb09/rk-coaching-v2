/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ReactNode } from 'react';

export interface CardProps {
  children: ReactNode;
  hoverEffect?: boolean;
  glassmorphism?: boolean;
  bordered?: boolean;
  className?: string;
  onClick?: (e: any) => void;
  key?: any;
}

export function Card({
  children,
  hoverEffect = false,
  glassmorphism = false,
  bordered = true,
  className = '',
  onClick
}: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`
        rounded-2xl transition-all duration-300 overflow-hidden
        ${bordered ? 'border border-slate-200 dark:border-slate-800' : ''}
        ${glassmorphism 
          ? 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-md' 
          : 'bg-white dark:bg-slate-900'
        }
        ${hoverEffect 
          ? 'hover:shadow-lg hover:shadow-slate-200/50 hover:-translate-y-1 dark:hover:shadow-none dark:hover:border-blue-500/50' 
          : 'shadow-sm'
        }
        ${className}
      `}
    >
      {children}
    </div>
  );
}

export interface CardHeaderProps {
  children: ReactNode;
  className?: string;
}

export function CardHeader({ children, className = '' }: CardHeaderProps) {
  return (
    <div className={`p-5 border-b border-slate-100 dark:border-slate-800 ${className}`}>
      {children}
    </div>
  );
}

export interface CardContentProps {
  children: ReactNode;
  className?: string;
}

export function CardContent({ children, className = '' }: CardContentProps) {
  return (
    <div className={`p-5 ${className}`}>
      {children}
    </div>
  );
}

export interface CardFooterProps {
  children: ReactNode;
  className?: string;
}

export function CardFooter({ children, className = '' }: CardFooterProps) {
  return (
    <div className={`p-4 bg-slate-50 border-t border-slate-100 dark:bg-slate-900/50 dark:border-slate-800 ${className}`}>
      {children}
    </div>
  );
}
