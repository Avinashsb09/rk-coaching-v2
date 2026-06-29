/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, HelpCircle, GraduationCap, ShieldCheck, Mail } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Badge } from '../../components/ui/Badge';
import { Card, CardContent } from '../../components/ui/Card';

export default function FAQPage() {
  const { faqs } = useApp();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="max-w-3xl mx-auto py-8 space-y-8 text-left">
      {/* Intro Header */}
      <section className="text-center space-y-3">
        <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600">
          <HelpCircle className="w-5.5 h-5.5" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          Frequently Answered Questions
        </h1>
        <p className="text-sm text-slate-500 max-w-lg mx-auto leading-relaxed">
          Need clarification regarding enrollment fees, syllabus access, offline downloads, or Razorpay orders? Look below.
        </p>
      </section>

      {/* Accordion List */}
      <section className="space-y-3.5">
        {faqs.map((faq) => {
          const isExpanded = expandedId === faq.id;
          return (
            <Card key={faq.id} className="overflow-hidden">
              <button
                onClick={() => toggleExpand(faq.id)}
                className="w-full flex items-center justify-between p-5 text-left font-semibold text-sm text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-950/40 transition-all cursor-pointer"
              >
                <span className="pr-4">{faq.question}</span>
                <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-250 ${isExpanded ? 'rotate-180' : ''}`} />
              </button>
              
              <AnimatePresence initial={false}>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: 'easeInOut' }}
                  >
                    <div className="px-5 pb-5 pt-1 text-xs text-slate-500 dark:text-slate-450 leading-relaxed border-t border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-950/20">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          );
        })}
      </section>

      {/* Support details */}
      <section className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-950/40 dark:to-slate-900/40 border border-blue-100/50 dark:border-slate-800/80 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">Still have queries or payment doubts?</h4>
          <p className="text-xs text-slate-500 mt-1">Our support monitors are active 24/7 to solve student inquiries.</p>
        </div>
        <div className="flex items-center gap-2">
          <Mail className="w-4 h-4 text-blue-500" />
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">support@rkcoaching.com</span>
        </div>
      </section>
    </div>
  );
}
