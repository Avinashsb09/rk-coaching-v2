/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { 
  FileText, 
  ArrowLeft, 
  Download, 
  Sparkles, 
  AlertTriangle 
} from 'lucide-react';

export default function PremiumNoteView() {
  const {
    notes,
    subjects,
    chapters,
    lessons,
    setCurrentView,
    setBreadcrumbs,
    selectedPremiumContentId,
    selectedPremiumSubjectId
  } = useApp();

  // Find note by selectedPremiumContentId (Notes context)
  const noteObj = useMemo(() => {
    if (!selectedPremiumContentId) return null;
    return notes.find(n => n.id === selectedPremiumContentId);
  }, [notes, selectedPremiumContentId]);

  // Resolve chapter and subject relations
  const { chapterObj, subjectObj } = useMemo(() => {
    if (!noteObj) return { chapterObj: null, subjectObj: null };
    
    // Resolve via lesson relation first
    let chap = null;
    let sub = null;

    if (noteObj.lessonId) {
      const lesson = lessons.find(l => l.id === noteObj.lessonId);
      if (lesson) {
        chap = chapters.find(c => c.id === lesson.chapterId) || null;
      }
    }

    // Fallback direct ids
    if (!chap && noteObj.chapterId) {
      chap = chapters.find(c => c.id === noteObj.chapterId) || null;
    }

    if (chap) {
      sub = subjects.find(s => s.id === chap.subjectId) || null;
    } else if (noteObj.subjectId) {
      sub = subjects.find(s => s.id === noteObj.subjectId) || null;
    }

    return { chapterObj: chap, subjectObj: sub };
  }, [noteObj, chapters, subjects, lessons]);

  // Sync breadcrumbs dynamically
  useEffect(() => {
    if (noteObj && subjectObj && chapterObj) {
      setBreadcrumbs([
        { label: 'My Premium Materials', view: 'premium-materials' },
        { label: 'Notes' },
        { label: subjectObj.name, view: 'premium-content-list' },
        { label: chapterObj.name },
        { label: noteObj.title }
      ]);
    }
  }, [noteObj, subjectObj, chapterObj, setBreadcrumbs]);

  const handleBackToList = () => {
    setCurrentView('premium-content-list');
  };

  const handleBackToLibrary = () => {
    setCurrentView('premium-materials');
  };

  // 1. Recovery state if missing note, subject, or chapter relationship
  if (!noteObj || !subjectObj || !chapterObj) {
    return (
      <div className="py-12 text-center max-w-md mx-auto px-4">
        <Card className="p-8 border-slate-205 dark:border-slate-800 shadow-xl bg-slate-900/10 dark:bg-slate-950/20">
          <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4 animate-bounce" />
          <h3 className="text-base font-extrabold text-slate-950 dark:text-white">Premium material unavailable</h3>
          <p className="text-xs text-slate-500 mt-2 mb-6">
            This material could not be found in your purchased library.
          </p>
          <Button variant="primary" className="w-full h-[44px]" onClick={handleBackToLibrary}>
            Back to My Premium Materials
          </Button>
        </Card>
      </div>
    );
  }

  // Validate PDF URL
  const isValidPdf = noteObj.pdfUrl && noteObj.pdfUrl !== '#' && noteObj.pdfUrl !== '';

  return (
    <div className="space-y-5 py-4 text-left animate-fade-in px-4">
      
      {/* Dynamic Back and Title Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={handleBackToList}
            className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200/50 text-slate-500 hover:text-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800 dark:border-slate-800 cursor-pointer transition-colors"
            title={`Back to ${subjectObj.name} Notes`}
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-black uppercase text-blue-600 dark:text-blue-400">
                {subjectObj.name}
              </span>
              <span className="text-slate-300 dark:text-slate-700 text-xs">•</span>
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                {chapterObj.name}
              </span>
            </div>
            <h1 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-tight mt-0.5">
              {noteObj.title}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 self-start md:self-center">
          <Badge className="text-[9px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-500 border border-amber-500/20 py-1 px-2.5">
            <Sparkles className="w-3 h-3 mr-1 inline fill-current" /> Premium Notes
          </Badge>
          {isValidPdf && (
            <a 
              href={noteObj.pdfUrl}
              download
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center px-4 py-2 text-xs font-black text-white bg-blue-600 hover:bg-blue-755 rounded-lg transition-all h-[44px]"
            >
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </a>
          )}
        </div>
      </div>

      {/* PDF Document deck layout */}
      <Card className="border-slate-100 dark:border-slate-800 flex flex-col overflow-hidden shadow-md bg-slate-900/5 dark:bg-slate-950/20 h-[68vh] min-h-[450px]">
        {isValidPdf ? (
          <iframe 
            src={`${noteObj.pdfUrl}#toolbar=1`} 
            title={noteObj.title}
            className="w-full h-full flex-1 border-0"
          />
        ) : (
          <div className="m-auto p-6 text-center space-y-4 max-w-sm">
            <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center mx-auto text-slate-400 dark:text-slate-500">
              <FileText className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">Notes preview unavailable</h4>
            <p className="text-xs text-slate-500">
              The document preview will appear here when a valid PDF is added.
            </p>
          </div>
        )}
      </Card>
      
    </div>
  );
}
