/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  children: ReactNode;
  className?: string;
  disabled?: boolean;
  onClick?: (e: any) => void;
  type?: 'button' | 'submit' | 'reset';
  title?: string;
}

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  children,
  className = '',
  disabled = false,
  onClick,
  type = 'button',
  title,
  ...props
}: ButtonProps) {
  const baseStyle = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none rounded-xl cursor-pointer';

  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 focus:ring-blue-500',
    secondary: 'bg-slate-200 hover:bg-slate-300 text-slate-800 focus:ring-slate-500 dark:bg-slate-800 dark:hover:bg-slate-750 dark:text-slate-200 dark:focus:ring-slate-700',
    success: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/20 focus:ring-emerald-500',
    danger: 'bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-500/20 focus:ring-red-500',
    warning: 'bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-500/20 focus:ring-amber-500',
    outline: 'border border-slate-300 hover:bg-slate-50 text-slate-700 dark:border-slate-700 dark:hover:bg-slate-800 dark:text-slate-300 focus:ring-slate-500',
    ghost: 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-450 focus:ring-slate-550'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs h-8',
    md: 'px-4 py-2.5 text-sm h-10',
    lg: 'px-6 py-3.5 text-base h-12'
  };

  return (
    <button
      type={type}
      onClick={onClick}
      title={title}
      disabled={disabled || isLoading}
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
      {!isLoading && leftIcon && <span className="mr-2 inline-flex">{leftIcon}</span>}
      <span>{children}</span>
      {!isLoading && rightIcon && <span className="ml-2 inline-flex">{rightIcon}</span>}
    </button>
  );
}
