/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * PremiumComingSoonModal
 * ─────────────────────────────────────────────────────────────────────────────
 * Shown whenever a student interacts with any premium-gated feature while
 * PREMIUM_SYSTEM_ENABLED is false in systemConfig.ts.
 *
 * This component is self-contained and has zero dependencies on payment
 * context — it is purely informational.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React, { useEffect } from 'react';
import { X, Lock, Sparkles, Star } from 'lucide-react';
import { PremiumConfig } from '../../lib/systemConfig';

interface PremiumComingSoonModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PremiumComingSoonModal({ isOpen, onClose }: PremiumComingSoonModalProps) {
  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  // Lock body scroll while open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="premium-modal-title"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
      >
        <div
          className="pointer-events-auto relative w-full max-w-md rounded-3xl border border-amber-500/20 bg-white/90 dark:bg-slate-950/95 backdrop-blur-2xl shadow-2xl shadow-amber-500/10 overflow-hidden animate-fade-in"
          onClick={e => e.stopPropagation()}
        >
          {/* Decorative glow */}
          <div className="absolute -top-16 -right-16 w-56 h-56 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Close button */}
          <button
            id="premium-modal-close"
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100/70 dark:hover:bg-slate-800/70 transition-all cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4.5 h-4.5" />
          </button>

          {/* Content */}
          <div className="relative p-8 flex flex-col items-center text-center gap-6">

            {/* Icon cluster */}
            <div className="relative">
              <div className="h-20 w-20 rounded-3xl bg-gradient-to-br from-amber-400/20 to-amber-600/10 border border-amber-400/30 flex items-center justify-center shadow-inner">
                <Lock className="w-9 h-9 text-amber-500" />
              </div>
              {/* Sparkle decorations */}
              <Sparkles className="absolute -top-2 -right-2 w-5 h-5 text-amber-400 animate-pulse" />
              <Star className="absolute -bottom-1 -left-2 w-4 h-4 text-amber-300 fill-current opacity-60" />
            </div>

            {/* Title */}
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-[10px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400">
                <Sparkles className="w-3 h-3" />
                Coming Soon
              </div>
              <h2
                id="premium-modal-title"
                className="text-xl font-black text-slate-900 dark:text-white leading-tight"
              >
                {PremiumConfig.comingSoon.title}
              </h2>
            </div>

            {/* Message */}
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm">
              {PremiumConfig.comingSoon.message}
            </p>

            {/* Premium features preview list */}
            <div className="w-full rounded-2xl bg-amber-500/6 border border-amber-500/15 p-4 space-y-2.5">
              <p className="text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 text-left mb-3">
                What's included in Premium
              </p>
              {PremiumConfig.comingSoon.features.map((feature, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  <div className="h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>

            {/* CTA — close */}
            <button
              id="premium-modal-ok"
              onClick={onClose}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-sm font-black shadow-lg shadow-amber-500/20 transition-all cursor-pointer active:scale-95"
            >
              Got It — I'll Check Back Soon
            </button>

            <p className="text-[10px] text-slate-400 dark:text-slate-600 font-medium">
              Free content is fully available. Only premium features are pending.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
