/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { teacherService } from '../../services/teacher.service';
import { contentService } from '../../services/content.service';
import type { TeacherAssignment, Note, Video, Quiz } from '../../types';
type ContentStatus = 'draft' | 'review' | 'published' | 'archived';
import { 
  FileText, Video as VideoIcon, BrainCircuit, BookMarked,
  Layers, Check, AlertTriangle, RefreshCw, X, Play, Eye, Settings, HelpCircle,
  FilePlus, Edit
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { uploadToStorage } from '../../lib/supabase';

function StatusBadge({ status }: { status?: ContentStatus }) {
  const styles = {
    draft: 'bg-slate-100 text-slate-700',
    review: 'bg-amber-50 text-amber-700',
    published: 'bg-emerald-50 text-emerald-700',
    archived: 'bg-red-50 text-red-700',
  };
  return (
    <Badge variant={status === 'published' ? 'success' : status === 'review' ? 'warning' : status === 'archived' ? 'danger' : 'secondary'} size="sm">
      {status ? status.toUpperCase() : 'DRAFT'}
    </Badge>
  );
}

export default function TeacherDashboard() {
  const { 
    addToast,
    classes,
    subjects,
    chapters,
    videos,
    setVideos,
    notes,
    setNotes,
    quizzes,
    setQuizzes,
    user
  } = useApp();

  const [assignments, setAssignments] = useState<TeacherAssignment[]>([]);
  const [teacherStats, setTeacherStats] = useState<{
    notesCount: number;
    videosCount: number;
    pyqsCount: number;
    quizzesCount: number;
    assignmentsCount: number;
    draftsCount: number;
    reviewCount: number;
    publishedCount: number;
    rejectedCount: number;
  } | null>(null);

  const [activeFilter, setActiveFilter] = useState<'assignments' | 'draft' | 'review' | 'published' | 'rejected'>('assignments');
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadType, setUploadType] = useState<'notes' | 'videos' | 'quizzes' | 'pyq'>('notes');

  // Form State
  const [formClassId, setFormClassId] = useState('');
  const [formSubjectId, setFormSubjectId] = useState('');
  const [formChapterId, setFormChapterId] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formMediaUrl, setFormMediaUrl] = useState('');
  const [formVideoProvider, setFormVideoProvider] = useState<'youtube' | 'gdrive' | 'vimeo' | 'supabase'>('youtube');
  const [formQuizScore, setFormQuizScore] = useState('40');
  const [formQuizTimer, setFormQuizTimer] = useState('1800');
  const [formIsPremium, setFormIsPremium] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadTeacherData = async () => {
    if (user?.id) {
      const [assignmentsRes, statsRes] = await Promise.all([
        teacherService.listTeacherAssignments(user.id, true),
        teacherService.getTeacherStats(user.id)
      ]);
      if (assignmentsRes.data) setAssignments(assignmentsRes.data);
      if (statsRes.data) setTeacherStats(statsRes.data);
    }
  };

  useEffect(() => {
    loadTeacherData();
  }, [user]);

  const openUploadModal = (type: 'notes' | 'videos' | 'quizzes' | 'pyq') => {
    setUploadType(type);
    setFormTitle(''); setFormDesc(''); setFormMediaUrl('');
    setFormIsPremium(false);
    setFormClassId(assignments[0]?.classId || '');
    setFormSubjectId(assignments[0]?.subjectId || '');
    setFormChapterId('');
    setUploadModalOpen(true);
  };

  const handleUploadSubmit = async (e: React.FormEvent, submitForReview: boolean) => {
    e.preventDefault();
    setIsSubmitting(true);
    const newId = `item_${Date.now()}`;
    const status: ContentStatus = submitForReview ? 'review' : 'draft';
    const baseRecord = {
      id: newId,
      title: formTitle,
      description: formDesc,
      classId: formClassId,
      subjectId: formSubjectId,
      chapterId: formChapterId,
      status,
      ownerId: user?.id,
      createdBy: user?.id,
    };

    try {
      if (uploadType === 'notes' || uploadType === 'pyq') {
        const noteData: Note = {
          ...baseRecord,
          type: uploadType,
          pdfUrl: formMediaUrl,
          sizeBytes: 150000,
          isPremium: formIsPremium,
        };
        const { error } = await contentService.notes.create(noteData);
        if (error) throw new Error(error);
        setNotes(prev => [...prev, noteData]);
      } 
      else if (uploadType === 'videos') {
        const videoData: Video = {
          ...baseRecord,
          lessonId: newId,
          provider: formVideoProvider,
          videoIdOrUrl: formMediaUrl,
          durationSeconds: 3600,
          isPremium: formIsPremium,
        };
        const { error } = await contentService.videos.create(videoData);
        if (error) throw new Error(error);
        setVideos(prev => [...prev, videoData]);
      }
      else if (uploadType === 'quizzes') {
        const quizData: Quiz = {
          ...baseRecord,
          lessonId: newId,
          passingScorePct: parseInt(formQuizScore),
          timerSeconds: parseInt(formQuizTimer),
        };
        const { error } = await contentService.quizzes.create(quizData);
        if (error) throw new Error(error);
        setQuizzes(prev => [...prev, quizData]);
      }

      addToast(`${uploadType.toUpperCase()} saved as ${status}!`, 'success');
      setUploadModalOpen(false);
      loadTeacherData();
    } catch (err: any) {
      addToast(err.message, 'error');
    }
    setIsSubmitting(false);
  };

  const handleQuickSubmitReview = async (id: string, type: string) => {
    try {
      let t: 'notes' | 'videos' | 'quizzes' = 'notes';
      if (type === 'videos') t = 'videos';
      if (type === 'quizzes') t = 'quizzes';
      if (type === 'pyq') t = 'notes';

      const { error } = await teacherService.submitForReview(t, id, user?.id || '');
      if (error) throw new Error(error);
      addToast('Content submitted for Super Admin review!', 'success');
      
      // Update local state to reflect UI change instantly
      if (t === 'notes') setNotes(prev => prev.map(n => n.id === id ? { ...n, status: 'review' } : n));
      if (t === 'videos') setVideos(prev => prev.map(v => v.id === id ? { ...v, status: 'review' } : v));
      if (t === 'quizzes') setQuizzes(prev => prev.map(q => q.id === id ? { ...q, status: 'review' } : q));
      
      loadTeacherData();
    } catch (err: any) {
      addToast(err.message, 'error');
    }
  };

  const activeSubjects = formClassId ? subjects.filter(s => s.classId === formClassId) : [];
  const activeChapters = formSubjectId ? chapters.filter(c => c.subjectId === formSubjectId) : [];

  // Flattened content array
  const allContent = useMemo(() => {
    if (!user) return [];
    const n = notes.filter(x => x.ownerId === user.id).map(x => ({ ...x, _contentType: x.type === 'pyq' ? 'pyq' : 'notes' }));
    const v = videos.filter(x => x.ownerId === user.id).map(x => ({ ...x, _contentType: 'videos' }));
    const q = quizzes.filter(x => x.ownerId === user.id).map(x => ({ ...x, _contentType: 'quizzes' }));
    return [...n, ...v, ...q].sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
  }, [notes, videos, quizzes, user]);

  const filteredContent = allContent.filter(c => {
    if (activeFilter === 'assignments') return false;
    if (activeFilter === 'rejected') return !!(c as any).rejectionReason;
    return c.status === activeFilter;
  });

  return (
    <div className="space-y-8 py-4 text-left">
      {/* HEADER */}
      <section className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Settings className="w-6 h-6 text-indigo-500 animate-spin-slow" />
            Teacher Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Action-based workflow: Check assignments, upload materials, and manage content statuses.
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Badge variant="success" className="h-8">Role Claim: Teacher Verified</Badge>
        </div>
      </section>

      {/* PRIMARY ACTIONS */}
      <section>
        <h2 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-4">Primary Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <button onClick={() => setActiveFilter('assignments')} className={`p-4 rounded-2xl border flex flex-col items-start gap-2 transition-all ${activeFilter === 'assignments' ? 'bg-indigo-600/10 border-indigo-500 shadow-sm' : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:border-indigo-400'}`}>
            <Layers className={`w-6 h-6 ${activeFilter === 'assignments' ? 'text-indigo-600' : 'text-slate-400'}`} />
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">My Assignments</p>
          </button>
          <button onClick={() => openUploadModal('notes')} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 hover:border-blue-400 flex flex-col items-start gap-2 transition-all">
            <FileText className="w-6 h-6 text-blue-500" />
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Upload Notes</p>
          </button>
          <button onClick={() => openUploadModal('videos')} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 hover:border-red-400 flex flex-col items-start gap-2 transition-all">
            <VideoIcon className="w-6 h-6 text-red-500" />
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Upload Videos</p>
          </button>
          <button onClick={() => openUploadModal('quizzes')} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 hover:border-emerald-400 flex flex-col items-start gap-2 transition-all">
            <BrainCircuit className="w-6 h-6 text-emerald-500" />
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Upload Quizzes</p>
          </button>
          <button onClick={() => openUploadModal('pyq')} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 hover:border-amber-400 flex flex-col items-start gap-2 transition-all">
            <BookMarked className="w-6 h-6 text-amber-500" />
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Upload PYQs</p>
          </button>
        </div>
      </section>

      {/* CONTENT WORKFLOW STATUS */}
      <section>
        <h2 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-4">Content Workflow</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card 
            hoverEffect 
            className={`cursor-pointer ${activeFilter === 'draft' ? 'ring-2 ring-slate-400' : ''}`}
            onClick={() => setActiveFilter('draft')}
          >
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 flex items-center justify-center shrink-0">
                <FilePlus className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Draft</p>
                <p className="text-base font-black text-slate-900 dark:text-white">{teacherStats?.draftsCount ?? 0} Items</p>
              </div>
            </CardContent>
          </Card>
          <Card 
            hoverEffect 
            className={`cursor-pointer ${activeFilter === 'review' ? 'ring-2 ring-amber-400' : ''}`}
            onClick={() => setActiveFilter('review')}
          >
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 flex items-center justify-center shrink-0">
                <RefreshCw className="w-5 h-5 animate-spin-slow" />
              </div>
              <div>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Under Review</p>
                <p className="text-base font-black text-slate-900 dark:text-white">{teacherStats?.reviewCount ?? 0} Reviewing</p>
              </div>
            </CardContent>
          </Card>
          <Card 
            hoverEffect 
            className={`cursor-pointer ${activeFilter === 'published' ? 'ring-2 ring-emerald-400' : ''}`}
            onClick={() => setActiveFilter('published')}
          >
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center shrink-0">
                <Check className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Published</p>
                <p className="text-base font-black text-slate-900 dark:text-white">{teacherStats?.publishedCount ?? 0} Live</p>
              </div>
            </CardContent>
          </Card>
          <Card 
            hoverEffect 
            className={`cursor-pointer ${activeFilter === 'rejected' ? 'ring-2 ring-red-400' : ''}`}
            onClick={() => setActiveFilter('rejected')}
          >
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-red-100 dark:bg-red-950 text-red-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Rejected</p>
                <p className="text-base font-black text-slate-900 dark:text-white">{teacherStats?.rejectedCount ?? 0} Action Req</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* DYNAMIC VIEW AREA */}
      <div className="animate-fade-in pt-4">
        {activeFilter === 'assignments' ? (
          <Card className="p-5 space-y-4">
            <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Layers className="w-4 h-4 text-indigo-500" />
              MY ACADEMIC ASSIGNMENTS SCOPE
            </h3>
            {assignments.length === 0 ? (
              <div className="py-10 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400 text-xs">
                No academic assignment binds found. Contact Super Admin to map assignments.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {assignments.map(a => (
                  <div key={a.id} className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200/50 dark:border-slate-800/40 flex flex-col gap-3">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Badge variant="info" size="sm">{classes.find(c => c.id === a.classId)?.name || a.classId}</Badge>
                      {a.subjectId && <Badge variant="success" size="sm">{subjects.find(s => s.id === a.subjectId)?.name || a.subjectId}</Badge>}
                      {a.isPrimary ? <Badge variant="primary" size="sm">PRIMARY</Badge> : <Badge variant="secondary" size="sm">CO-TEACHER</Badge>}
                    </div>
                    <div className="text-xs text-slate-500 space-y-1">
                      {a.chapterId && <p><strong className="text-slate-700 dark:text-slate-300">Chapter:</strong> {chapters.find(c => c.id === a.chapterId)?.name || a.chapterId}</p>}
                      <p><strong className="text-slate-700 dark:text-slate-300">Period:</strong> {a.startDate} to {a.endDate || 'Ongoing'}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        ) : (
          <Card className="p-5 space-y-4">
            <h3 className="text-sm font-black text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
              <span className="uppercase tracking-wider">Filtered Items: {activeFilter}</span>
              <Badge variant="secondary" size="sm">{filteredContent.length} Results</Badge>
            </h3>
            {filteredContent.length === 0 ? (
              <div className="py-10 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400 text-xs">
                No items found in {activeFilter} status.
              </div>
            ) : (
              <div className="space-y-3">
                {filteredContent.map((item: any) => (
                  <div key={item.id} className="p-4 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-950">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        {item._contentType === 'notes' && <FileText className="w-4 h-4 text-blue-500" />}
                        {item._contentType === 'videos' && <VideoIcon className="w-4 h-4 text-red-500" />}
                        {item._contentType === 'quizzes' && <BrainCircuit className="w-4 h-4 text-emerald-500" />}
                        {item._contentType === 'pyq' && <BookMarked className="w-4 h-4 text-amber-500" />}
                        <span className="text-xs font-black uppercase text-slate-400 tracking-wider">
                          {item._contentType}
                        </span>
                        <StatusBadge status={item.status} />
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">{item.title}</h4>
                      <div className="flex flex-wrap gap-1">
                        <Badge variant="info" size="sm" className="text-[9px]">{classes.find(c => c.id === item.classId)?.name}</Badge>
                        {item.subjectId && <Badge variant="success" size="sm" className="text-[9px]">{subjects.find(s => s.id === item.subjectId)?.name}</Badge>}
                      </div>
                      {item.rejectionReason && (
                        <div className="mt-2 p-2 bg-red-500/10 border border-red-500/20 text-red-600 rounded text-[10px]">
                          <strong>Correction Required:</strong> {item.rejectionComment || item.rejectionReason}
                        </div>
                      )}
                    </div>
                    <div className="shrink-0 flex gap-2">
                      <Button variant="secondary" size="sm" className="text-xs" disabled={item.status === 'review' || item.status === 'published'}>
                        <Edit className="w-3.5 h-3.5 mr-1" /> Edit
                      </Button>
                      {(item.status === 'draft' || !!item.rejectionReason) && (
                        <Button 
                          variant="primary" 
                          size="sm" 
                          className="text-xs"
                          onClick={() => handleQuickSubmitReview(item.id, item._contentType)}
                        >
                          Submit For Review
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}
      </div>

      {/* UNIFIED UPLOAD MODAL */}
      <Modal isOpen={uploadModalOpen} onClose={() => setUploadModalOpen(false)} title={`Upload ${uploadType.toUpperCase()}`} size="lg">
        <form onSubmit={(e) => handleUploadSubmit(e, false)} className="space-y-4 text-left">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Assignment Standard *</label>
              <select value={formClassId} onChange={e => {setFormClassId(e.target.value); setFormSubjectId(''); setFormChapterId('');}} className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm focus:ring-2 focus:ring-indigo-500" required>
                <option value="">-- Select --</option>
                {classes.filter(c => assignments.some(a => a.classId === c.id)).map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Subject *</label>
              <select value={formSubjectId} onChange={e => {setFormSubjectId(e.target.value); setFormChapterId('');}} className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm focus:ring-2 focus:ring-indigo-500" required>
                <option value="">-- Select --</option>
                {activeSubjects.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Chapter (Optional)</label>
              <select value={formChapterId} onChange={e => setFormChapterId(e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm focus:ring-2 focus:ring-indigo-500">
                <option value="">-- Optional --</option>
                {activeChapters.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="md:col-span-3">
              <Input label={`${uploadType.toUpperCase()} Title *`} value={formTitle} onChange={e => setFormTitle(e.target.value)} placeholder={`e.g. Important concepts for ${uploadType}...`} required />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Access Tier *</label>
              <select value={formIsPremium ? 'premium' : 'free'} onChange={e => setFormIsPremium(e.target.value === 'premium')} className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm focus:ring-2 focus:ring-indigo-500 font-bold" required>
                <option value="free">Free Access</option>
                <option value="premium">Premium Access</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Description (Optional)</label>
            <textarea value={formDesc} onChange={e => setFormDesc(e.target.value)} className="w-full p-2.5 h-20 rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm focus:ring-2 focus:ring-indigo-500" placeholder="Provide details about the learning objectives..." />
          </div>

          {(uploadType === 'notes' || uploadType === 'pyq') && (
            <div className="space-y-2 p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Upload Document PDF</label>
              <input type="file" accept="application/pdf" className="block w-full text-xs file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" onChange={async (e) => {
                const file = e.target.files?.[0];
                if(file) {
                  addToast('Uploading PDF...', 'info');
                  const url = await uploadToStorage('materials', `${Date.now()}_${file.name}`, file);
                  setFormMediaUrl(url);
                  addToast('Upload successful!', 'success');
                }
              }} />
              <Input label="Or URL Link" value={formMediaUrl} onChange={e => setFormMediaUrl(e.target.value)} placeholder="https://..." />
            </div>
          )}

          {uploadType === 'videos' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Provider</label>
                <select value={formVideoProvider} onChange={e => setFormVideoProvider(e.target.value as any)} className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm focus:ring-2 focus:ring-indigo-500">
                  <option value="youtube">YouTube Unlisted</option>
                  <option value="gdrive">Google Drive</option>
                  <option value="vimeo">Vimeo</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <Input label="Video ID or Link *" value={formMediaUrl} onChange={e => setFormMediaUrl(e.target.value)} placeholder="e.g. dQw4w9WgXcQ" required />
              </div>
            </div>
          )}

          {uploadType === 'quizzes' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              <Input type="number" label="Passing Score (%) *" value={formQuizScore} onChange={e => setFormQuizScore(e.target.value)} required />
              <Input type="number" label="Timer Duration (Seconds) *" value={formQuizTimer} onChange={e => setFormQuizTimer(e.target.value)} required />
            </div>
          )}

          <div className="flex gap-2 justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button variant="secondary" onClick={() => setUploadModalOpen(false)}>Cancel</Button>
            <Button variant="secondary" type="submit" isLoading={isSubmitting} onClick={(e) => handleUploadSubmit(e, false)}>Save as Draft</Button>
            <Button variant="primary" type="button" isLoading={isSubmitting} onClick={(e) => handleUploadSubmit(e, true)}>Submit for Review</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
