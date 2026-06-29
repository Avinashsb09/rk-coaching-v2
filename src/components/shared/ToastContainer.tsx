/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, CheckCircle2, Info, X, AlertTriangle } from 'lucide-react';
import { useApp, ToastMessage } from '../../context/AppContext';

export function ToastContainer() {
  const { toasts, dismissToast } = useApp();

  const icons: Record<ToastMessage['type'], React.ReactNode> = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
    error: <AlertCircle className="w-5 h-5 text-red-500" />,
    info: <Info className="w-5 h-5 text-blue-500" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-500" />
  };

  const bgBorderColors: Record<ToastMessage['type'], string> = {
    success: 'bg-white dark:bg-slate-900 border-emerald-100 dark:border-emerald-900/30 shadow-emerald-500/5',
    error: 'bg-white dark:bg-slate-900 border-red-100 dark:border-red-900/30 shadow-red-500/5',
    info: 'bg-white dark:bg-slate-900 border-blue-100 dark:border-blue-900/30 shadow-blue-500/5',
    warning: 'bg-white dark:bg-slate-900 border-amber-100 dark:border-amber-900/30 shadow-amber-500/5'
  };

  return (
    <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 25, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className={`
              pointer-events-auto flex items-start gap-3.5 p-4 rounded-2xl border shadow-xl
              ${bgBorderColors[toast.type]}
            `}
          >
            <div className="shrink-0 mt-0.5">{icons[toast.type]}</div>
            
            <div className="flex-1 text-sm font-medium text-slate-700 dark:text-slate-200 text-left">
              {toast.message}
            </div>

            <button
              onClick={() => dismissToast(toast.id)}
              className="shrink-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer p-0.5"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
