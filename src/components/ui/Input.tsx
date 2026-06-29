/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { InputHTMLAttributes, forwardRef, ReactNode } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, leftIcon, rightIcon, className = '', ...props }, ref) => {
    return (
      <div className="w-full text-left">
        {label && (
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            {label}
          </label>
        )}
        
        <div className="relative rounded-xl shadow-sm">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              {leftIcon}
            </div>
          )}
          
          <input
            ref={ref}
            className={`
              block w-full rounded-xl border transition-all duration-200 text-sm h-11
              bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100
              placeholder-slate-400 dark:placeholder-slate-600
              ${leftIcon ? 'pl-10' : 'pl-4'}
              ${rightIcon ? 'pr-10' : 'pr-4'}
              ${error 
                ? 'border-red-500 focus:ring-red-500 focus:border-red-500 dark:border-red-500' 
                : 'border-slate-300 dark:border-slate-800 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-600'
              }
              focus:outline-none focus:ring-2
              disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200
              dark:disabled:bg-slate-900 dark:disabled:text-slate-600
              ${className}
            `}
            {...props}
          />

          {rightIcon && (
            <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
              {rightIcon}
            </div>
          )}
        </div>

        {error && (
          <p className="mt-1.5 text-xs text-red-600 dark:text-red-400 font-medium">
            {error}
          </p>
        )}

        {!error && helperText && (
          <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
