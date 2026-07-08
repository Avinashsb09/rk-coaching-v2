/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Content Management System (CMS) — Super Admin Module
 * Sprint 3: Full CMS CRUD for Notes, Videos, PYQs, and Quizzes withSoft Delete/Soft Order
 * ─────────────────────────────────────────────────────────────────────────────
 * Dual-persistence with Supabase and localStorage fallback.
 * Integrates PermissionGuard for RBAC.
 * Supports HTML5 Drag-and-Drop ordering when filtered by parent containers.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../../../../context/AppContext';
import { contentService, orderingService } from '../../../../services/content.service';
import { PermissionGuard } from '../../../../components/shared/PermissionGuard';
import { UploadEngine } from '../../../../components/shared/UploadEngine';
import { Modal } from '../../../../components/ui/Modal';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import { Badge } from '../../../../components/ui/Badge';
import type { Note, Video, Quiz, QuizQuestion, QuizOption } from '../../../../types';
import {
  Plus, Pencil, Trash2, ToggleLeft, ToggleRight,
  FileText, PlayCircle, Award, HelpCircle, Search,
  RefreshCw, GripVertical, AlertTriangle, X, Check,
  ChevronDown, ArrowUp, ArrowDown, Eye, PlusCircle, CheckCircle2,
  XCircle
} from 'lucide-react';
import { teacherService } from '../../../../services/teacher.service';

type CMSTab = 'notes' | 'videos' | 'pyq' | 'quiz';
type ContentStatus = 'draft' | 'review' | 'published' | 'archived';

// ─────────────────────────────────────────────────────────────────────────────
//  Shared: Status Badge Helper
// ─────────────────────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status?: ContentStatus }) {
  const styles = {
    draft: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
    review: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/40',
    published: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/45 dark:text-emerald-400 dark:border-emerald-900/40',
    archived: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/45 dark:text-red-400 dark:border-red-900/40',
  };
  return (
    <Badge variant={status === 'published' ? 'success' : status === 'review' ? 'warning' : status === 'archived' ? 'danger' : 'secondary'} size="sm">
      {status ? status.toUpperCase() : 'DRAFT'}
    </Badge>
  );
}

interface RejectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reason: string, comment: string) => void;
  loading?: boolean;
}

function RejectionModal({ isOpen, onClose, onSubmit, loading }: RejectionModalProps) {
  const [reason, setReason] = useState('Incorrect Answers');
  const [comment, setComment] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(reason, comment);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Reject & Return for Correction" size="md">
      <form onSubmit={handleSubmit} className="space-y-4 text-left">
        <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 rounded-xl text-xs leading-relaxed">
          <strong>Content Rejection:</strong> Returning this item will mark it as "Draft" and send the feedback comments back to the teacher's workspace dashboard.
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Rejection Reason *</label>
          <select
            value={reason}
            onChange={e => setReason(e.target.value)}
            className="w-full py-2.5 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none"
            required
          >
            <option value="Incorrect Answers">Incorrect Answers / Solved Keys</option>
            <option value="Poor Audio Quality">Poor Audio / Video Quality</option>
            <option value="Incomplete Syllabus">Incomplete Syllabus coverage</option>
            <option value="Typographical Errors">Typographical / Formatting Errors</option>
            <option value="Incorrect Categorization">Incorrect Standard/Subject/Chapter Bind</option>
            <option value="Other">Other (Specify in comments)</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Detailed Comment / Corrective Feedback *</label>
          <textarea
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder="Please detail what corrections are required so the instructor can adjust the materials..."
            className="w-full min-h-[100px] py-2.5 px-3.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
            required
          />
        </div>
        <div className="flex gap-3 justify-end pt-2">
          <Button variant="ghost" size="sm" type="button" onClick={onClose}>Cancel</Button>
          <Button variant="danger" size="sm" type="submit" isLoading={loading}>Reject & Return</Button>
        </div>
      </form>
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  TAB 1 — Notes & DPPs Panel
// ─────────────────────────────────────────────────────────────────────────────
function NotesPanel() {
  const { classes, subjects, chapters, notes, setNotes, user, addToast } = useApp();
  const [items, setItems] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterClassId, setFilterClassId] = useState('');
  const [filterSubjectId, setFilterSubjectId] = useState('');
  const [filterChapterId, setFilterChapterId] = useState('');

  // Drag and Drop states
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Note | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  // Form states
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formPdfUrl, setFormPdfUrl] = useState('');
  const [formSizeBytes, setFormSizeBytes] = useState('150000');
  const [formClassId, setFormClassId] = useState('');
  const [formSubjectId, setFormSubjectId] = useState('');
  const [formChapterId, setFormChapterId] = useState('');
  const [formIsPremium, setFormIsPremium] = useState(false);
  const [formPrice, setFormPrice] = useState('0');
  const [formType, setFormType] = useState<'notes' | 'practiceset'>('notes');
  const [formStatus, setFormStatus] = useState<ContentStatus>('draft');

  // Archive state
  const [archiveItem, setArchiveItem] = useState<Note | null>(null);

  // Rejection states
  const [rejectTargetId, setRejectTargetId] = useState<string | null>(null);
  const [rejectionLoading, setRejectionLoading] = useState(false);

  const handleApprove = async (itemId: string) => {
    const { error } = await teacherService.approveContent('notes', itemId, user?.id || '');
    if (error) {
      addToast(error, 'error');
    } else {
      addToast('Study Note approved & published successfully!', 'success');
      load();
    }
  };

  const handleRejectSubmit = async (reason: string, comment: string) => {
    if (!rejectTargetId) return;
    setRejectionLoading(true);
    const { error } = await teacherService.rejectContent('notes', rejectTargetId, reason, comment, user?.id || '');
    setRejectionLoading(false);
    if (error) {
      addToast(error, 'error');
    } else {
      addToast('Study Note rejected and returned to draft.', 'success');
      setRejectTargetId(null);
      load();
    }
  };

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await contentService.notes.list();
    if (error) addToast(error, 'error');
    else setItems((data ?? []).filter(n => n.type !== 'pyq'));
    setLoading(false);
  }, [addToast]);

  useEffect(() => { load(); }, [load]);

  const activeSubjects = formClassId ? subjects.filter(s => s.classId === formClassId) : [];
  const activeChapters = formSubjectId ? chapters.filter(c => c.subjectId === formSubjectId) : [];

  const filterSubjectsList = filterClassId ? subjects.filter(s => s.classId === filterClassId) : subjects;
  const filterChaptersList = filterSubjectId ? chapters.filter(c => c.subjectId === filterSubjectId) : chapters;

  const filtered = items.filter(n => {
    const matchSearch = n.title.toLowerCase().includes(search.toLowerCase());
    const matchClass = !filterClassId || n.classId === filterClassId;
    const matchSubject = !filterSubjectId || n.subjectId === filterSubjectId;
    const matchChapter = !filterChapterId || n.chapterId === filterChapterId;
    return matchSearch && matchClass && matchSubject && matchChapter;
  });

  const openCreate = () => {
    setEditItem(null);
    setFormTitle(''); setFormDesc(''); setFormPdfUrl(''); setFormSizeBytes('150000');
    setFormClassId(classes[0]?.id || ''); setFormSubjectId(''); setFormChapterId('');
    setFormIsPremium(false); setFormPrice('0'); setFormType('notes'); setFormStatus('draft');
    setFormError('');
    setModalOpen(true);
  };

  const openEdit = (item: Note) => {
    setEditItem(item);
    setFormTitle(item.title);
    setFormPdfUrl(item.pdfUrl);
    setFormSizeBytes(String(item.sizeBytes));
    setFormClassId(item.classId || '');
    setFormSubjectId(item.subjectId || '');
    setFormChapterId(item.chapterId || '');
    setFormIsPremium(item.isPremium);
    setFormPrice(String(item.price || 0));
    setFormType(item.type === 'practiceset' ? 'practiceset' : 'notes');
    setFormStatus(item.status || 'draft');
    setFormError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) { setFormError('Title is required.'); return; }
    if (!formPdfUrl.trim()) { setFormError('PDF URL is required.'); return; }
    setFormLoading(true); setFormError('');

    const payload: Partial<Note> = {
      title: formTitle.trim(),
      pdfUrl: formPdfUrl.trim(),
      sizeBytes: Number(formSizeBytes),
      classId: formClassId || null,
      subjectId: formSubjectId || null,
      chapterId: formChapterId || null,
      isPremium: formIsPremium,
      price: Number(formPrice),
      type: formType,
      status: formStatus,
    };

    if (editItem) {
      const { error } = await contentService.notes.update(editItem.id, payload, user?.id);
      if (error) { setFormError(error); setFormLoading(false); return; }
      addToast(`"${formTitle}" updated.`, 'success');
    } else {
      const { error } = await contentService.notes.create(payload, user?.id);
      if (error) { setFormError(error); setFormLoading(false); return; }
      addToast(`"${formTitle}" created.`, 'success');
    }

    await load();
    const { data: fresh } = await contentService.notes.list();
    if (fresh) setNotes(fresh);
    setFormLoading(false);
    setModalOpen(false);
  };

  const handleArchive = async () => {
    if (!archiveItem) return;
    const { error } = await contentService.notes.delete(archiveItem.id);
    if (error) {
      addToast(error, 'error');
    } else {
      addToast(`"${archiveItem.title}" soft-deleted and archived.`, 'success');
      const updated = items.filter(n => n.id !== archiveItem.id);
      setItems(updated);
      const { data: fresh } = await contentService.notes.list();
      if (fresh) setNotes(fresh);
    }
    setArchiveItem(null);
  };

  // Drag and drop sorting handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIdx(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, targetIdx: number) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === targetIdx) return;

    const updated = [...filtered];
    const [draggedItem] = updated.splice(draggedIdx, 1);
    updated.splice(targetIdx, 0, draggedItem);

    const orders = updated.map((item, idx) => ({
      id: item.id,
      displayOrder: idx + 1
    }));

    // Update state immediately
    const stateMap = new Map(orders.map(o => [o.id, o.displayOrder]));
    setItems(prev => prev.map(n => stateMap.has(n.id) ? { ...n, displayOrder: stateMap.get(n.id)! } : n).sort((a,b) => (a.displayOrder || 0) - (b.displayOrder || 0)));
    setDraggedIdx(null);

    // Save ordering
    const { error } = await orderingService.updateOrder('notes', orders);
    if (error) addToast(error, 'error');
    else addToast('Display sequence reordered.', 'success');

    // Sync context
    const { data: fresh } = await contentService.notes.list();
    if (fresh) setNotes(fresh);
  };

  const isDndEnabled = !!filterChapterId;

  return (
    <div className="space-y-5 animate-fade-in text-slate-800 dark:text-slate-200">
      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <select value={filterClassId} onChange={e => { setFilterClassId(e.target.value); setFilterSubjectId(''); setFilterChapterId(''); }}
            className="py-2 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/40">
            <option value="">All Standards</option>
            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select value={filterSubjectId} onChange={e => { setFilterSubjectId(e.target.value); setFilterChapterId(''); }}
            className="py-2 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/40">
            <option value="">All Subjects</option>
            {filterSubjectsList.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <select value={filterChapterId} onChange={e => setFilterChapterId(e.target.value)}
            className="py-2 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/40">
            <option value="">All Chapters</option>
            {filterChaptersList.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          {isDndEnabled && (
            <span className="text-[10px] text-indigo-500 dark:text-indigo-400 font-bold bg-indigo-500/10 px-2.5 py-1 rounded-full">
              ⚡ Drag handle active
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search notes..."
              className="pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 w-40" />
          </div>
          <PermissionGuard permission="content:write">
            <Button variant="primary" size="sm" onClick={openCreate}>
              <Plus className="w-3.5 h-3.5 mr-1.5" />Add Notes
            </Button>
          </PermissionGuard>
          <button onClick={load} className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-slate-200/60 dark:border-slate-800/60 overflow-hidden bg-white/50 dark:bg-slate-950/20">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-slate-50/80 dark:bg-slate-900/80">
              <tr>
                {isDndEnabled && <th className="px-4 py-3 w-6" />}
                <th className="px-4 py-3 font-bold uppercase tracking-wider text-slate-500">Order</th>
                <th className="px-4 py-3 font-bold uppercase tracking-wider text-slate-500">Note Title</th>
                <th className="px-4 py-3 font-bold uppercase tracking-wider text-slate-500">Standard / Subject</th>
                <th className="px-4 py-3 font-bold uppercase tracking-wider text-slate-500">Type</th>
                <th className="px-4 py-3 font-bold uppercase tracking-wider text-slate-500">Tier</th>
                <th className="px-4 py-3 font-bold uppercase tracking-wider text-slate-500">Status</th>
                <th className="px-4 py-3 font-bold uppercase tracking-wider text-slate-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {loading ? (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-slate-400">Loading notes data...</td></tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-16 text-center text-slate-400 space-y-3">
                    <FileText className="w-8 h-8 mx-auto opacity-30 text-slate-400" />
                    <p className="font-semibold">No Notes Found</p>
                  </td>
                </tr>
              ) : filtered.map((item, idx) => (
                <tr 
                  key={item.id}
                  draggable={isDndEnabled}
                  onDragStart={e => handleDragStart(e, idx)}
                  onDragOver={e => handleDragOver(e, idx)}
                  onDrop={e => handleDrop(e, idx)}
                  className={`hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors ${
                    draggedIdx === idx ? 'opacity-40 bg-slate-100 dark:bg-slate-800' : ''
                  }`}
                >
                  {isDndEnabled && (
                    <td className="px-4 py-3 text-slate-300 dark:text-slate-700 cursor-grab active:cursor-grabbing">
                      <GripVertical className="w-3.5 h-3.5" />
                    </td>
                  )}
                  <td className="px-4 py-3 font-mono text-[10px] text-slate-450">{item.displayOrder || 0}</td>
                  <td className="px-4 py-3">
                    <div className="font-bold text-slate-800 dark:text-slate-100">{item.title}</div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5 truncate max-w-xs">{item.pdfUrl}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-slate-700 dark:text-slate-300">
                      {classes.find(c => c.id === item.classId)?.name || item.classId}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      {subjects.find(s => s.id === item.subjectId)?.name || item.subjectId}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="info" size="sm">{item.type === 'practiceset' ? 'Worksheet' : 'Lecture Note'}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    {item.isPremium ? (
                      <Badge variant="warning" size="sm">Premium (₹{item.price})</Badge>
                    ) : (
                      <Badge variant="primary" size="sm">Free</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={item.status as ContentStatus} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      {item.status === 'review' && (
                        <div className="flex items-center gap-1.5 border-r border-slate-150 dark:border-slate-800 pr-2 mr-0.5">
                          <button
                            onClick={() => handleApprove(item.id)}
                            title="Approve & Publish"
                            className="p-1 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/35 transition-all"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setRejectTargetId(item.id)}
                            title="Reject & Request Correction"
                            className="p-1 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/35 transition-all"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                      <PermissionGuard permission="content:write">
                        <button onClick={() => openEdit(item)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-all">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                      </PermissionGuard>
                      <PermissionGuard permission="content:delete">
                        <button onClick={() => setArchiveItem(item)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </PermissionGuard>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Editor Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Edit Study Note' : 'Add Study Note'} size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Note Title *" value={formTitle} onChange={e => setFormTitle(e.target.value)} placeholder="e.g. Chapter 1 Class Handouts" required />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Academic Standard *</label>
              <select value={formClassId} onChange={e => { setFormClassId(e.target.value); setFormSubjectId(''); setFormChapterId(''); }}
                className="w-full py-2.5 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/40">
                <option value="">Select Class...</option>
                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Subject *</label>
              <select value={formSubjectId} onChange={e => { setFormSubjectId(e.target.value); setFormChapterId(''); }}
                className="w-full py-2.5 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/40">
                <option value="">Select Subject...</option>
                {activeSubjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Chapter</label>
            <select value={formChapterId} onChange={e => setFormChapterId(e.target.value)}
              className="w-full py-2.5 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/40">
              <option value="">None (Link to Subject direct)</option>
              {activeChapters.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <UploadEngine
            bucket="notes"
            folderPath="pdfs"
            accept="application/pdf"
            initialUrl={formPdfUrl}
            label="Upload Note PDF *"
            helperText="PDF format only (Max 20MB)"
            maxSizeMB={20}
            onUploadSuccess={(url, path, sizeBytes) => {
              setFormPdfUrl(url);
              if (sizeBytes > 0) setFormSizeBytes(String(sizeBytes));
            }}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Manual URL Override" value={formPdfUrl} onChange={e => setFormPdfUrl(e.target.value)} placeholder="https://example.com/notes.pdf" />
            <Input label="File Size (Bytes)" type="number" value={formSizeBytes} onChange={e => setFormSizeBytes(e.target.value)} />
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Resource Category</label>
              <select value={formType} onChange={e => setFormType(e.target.value as any)}
                className="w-full py-2.5 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/40">
                <option value="notes">Handwritten / Revision Note</option>
                <option value="practiceset">Assignment / Worksheet</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Premium Tier</p>
                <p className="text-[10px] text-slate-400">Locked for unpaid accounts.</p>
              </div>
              <button type="button" onClick={() => setFormIsPremium(!formIsPremium)}>
                {formIsPremium ? <ToggleRight className="w-6 h-6 text-emerald-500" /> : <ToggleLeft className="w-6 h-6 text-slate-400" />}
              </button>
            </div>
            {formIsPremium && (
              <Input label="Unlock Price (INR)" type="number" value={formPrice} onChange={e => setFormPrice(e.target.value)} min="0" />
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Workflow Status</label>
            <select value={formStatus} onChange={e => setFormStatus(e.target.value as ContentStatus)}
              className="w-full py-2.5 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/40">
              <option value="draft">Draft (Hidden from students)</option>
              <option value="review">Under Review (Hidden from students)</option>
              <option value="published">Published (Visible on Portal)</option>
            </select>
          </div>

          {formError && <p className="text-xs text-red-500 flex items-center gap-1"><X className="w-3.5 h-3.5" />{formError}</p>}
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" size="sm" type="button" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button variant="primary" size="sm" type="submit" isLoading={formLoading}>
              {editItem ? 'Save Note' : 'Add Note'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Soft Delete Dialog */}
      <Modal isOpen={!!archiveItem} onClose={() => setArchiveItem(null)} title="Delete Study Note" size="sm">
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <p className="text-xs text-red-750 dark:text-red-300 leading-relaxed">
              Are you sure you want to delete <strong>{archiveItem?.title}</strong>? In compliance with safety policies, this note will be moved to the archives and hidden from all students.
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setArchiveItem(null)}>Cancel</Button>
            <Button variant="danger" size="sm" onClick={handleArchive}>Archive & Hide</Button>
          </div>
        </div>
      </Modal>

      <RejectionModal
        isOpen={!!rejectTargetId}
        onClose={() => setRejectTargetId(null)}
        onSubmit={handleRejectSubmit}
        loading={rejectionLoading}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  TAB 2 — Video Lectures Panel
// ─────────────────────────────────────────────────────────────────────────────
function VideosPanel() {
  const { classes, subjects, chapters, videos, setVideos, user, addToast } = useApp();
  const [items, setItems] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterClassId, setFilterClassId] = useState('');
  const [filterSubjectId, setFilterSubjectId] = useState('');
  const [filterChapterId, setFilterChapterId] = useState('');

  // Drag and Drop states
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Video | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  // Form states
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formVideoId, setFormVideoId] = useState('');
  const [formDuration, setFormDuration] = useState('600');
  const [formClassId, setFormClassId] = useState('');
  const [formSubjectId, setFormSubjectId] = useState('');
  const [formChapterId, setFormChapterId] = useState('');
  const [formProvider, setFormProvider] = useState<'youtube' | 'gdrive' | 'vimeo'>('youtube');
  const [formStatus, setFormStatus] = useState<ContentStatus>('draft');

  // Archive state
  const [archiveItem, setArchiveItem] = useState<Video | null>(null);

  // Rejection states
  const [rejectTargetId, setRejectTargetId] = useState<string | null>(null);
  const [rejectionLoading, setRejectionLoading] = useState(false);

  const handleApprove = async (itemId: string) => {
    const { error } = await teacherService.approveContent('videos', itemId, user?.id || '');
    if (error) {
      addToast(error, 'error');
    } else {
      addToast('Video lecture approved & published successfully!', 'success');
      load();
    }
  };

  const handleRejectSubmit = async (reason: string, comment: string) => {
    if (!rejectTargetId) return;
    setRejectionLoading(true);
    const { error } = await teacherService.rejectContent('videos', rejectTargetId, reason, comment, user?.id || '');
    setRejectionLoading(false);
    if (error) {
      addToast(error, 'error');
    } else {
      addToast('Video lecture rejected and returned to draft.', 'success');
      setRejectTargetId(null);
      load();
    }
  };

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await contentService.videos.list();
    if (error) addToast(error, 'error');
    else setItems(data ?? []);
    setLoading(false);
  }, [addToast]);

  useEffect(() => { load(); }, [load]);

  const activeSubjects = formClassId ? subjects.filter(s => s.classId === formClassId) : [];
  const activeChapters = formSubjectId ? chapters.filter(c => c.subjectId === formSubjectId) : [];

  const filterSubjectsList = filterClassId ? subjects.filter(s => s.classId === filterClassId) : subjects;
  const filterChaptersList = filterSubjectId ? chapters.filter(c => c.subjectId === filterSubjectId) : chapters;

  const filtered = items.filter(v => {
    const matchSearch = v.title.toLowerCase().includes(search.toLowerCase());
    const matchClass = !filterClassId || v.classId === filterClassId;
    const matchSubject = !filterSubjectId || v.subjectId === filterSubjectId;
    const matchChapter = !filterChapterId || v.chapterId === filterChapterId;
    return matchSearch && matchClass && matchSubject && matchChapter;
  });

  const openCreate = () => {
    setEditItem(null);
    setFormTitle(''); setFormDesc(''); setFormVideoId(''); setFormDuration('600');
    setFormClassId(classes[0]?.id || ''); setFormSubjectId(''); setFormChapterId('');
    setFormProvider('youtube'); setFormStatus('draft'); setFormError('');
    setModalOpen(true);
  };

  const openEdit = (item: Video) => {
    setEditItem(item);
    setFormTitle(item.title);
    setFormDesc(item.description || '');
    setFormVideoId(item.videoIdOrUrl);
    setFormDuration(String(item.durationSeconds || 600));
    setFormClassId(item.classId || '');
    setFormSubjectId(item.subjectId || '');
    setFormChapterId(item.chapterId || '');
    setFormProvider(item.provider === 'youtube' || item.provider === 'vimeo' || item.provider === 'gdrive' ? item.provider : 'youtube');
    setFormStatus(item.status || 'draft');
    setFormError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) { setFormError('Title is required.'); return; }
    if (!formVideoId.trim()) { setFormError('Video URL or unlisted ID is required.'); return; }
    setFormLoading(true); setFormError('');

    const payload: Partial<Video> = {
      title: formTitle.trim(),
      description: formDesc.trim(),
      videoIdOrUrl: formVideoId.trim(),
      durationSeconds: Number(formDuration),
      classId: formClassId || null,
      subjectId: formSubjectId || null,
      chapterId: formChapterId || null,
      provider: formProvider,
      status: formStatus,
    };

    if (editItem) {
      const { error } = await contentService.videos.update(editItem.id, payload, user?.id);
      if (error) { setFormError(error); setFormLoading(false); return; }
      addToast(`"${formTitle}" updated.`, 'success');
    } else {
      const { error } = await contentService.videos.create(payload, user?.id);
      if (error) { setFormError(error); setFormLoading(false); return; }
      addToast(`"${formTitle}" created.`, 'success');
    }

    await load();
    const { data: fresh } = await contentService.videos.list();
    if (fresh) setVideos(fresh);
    setFormLoading(false);
    setModalOpen(false);
  };

  const handleArchive = async () => {
    if (!archiveItem) return;
    const { error } = await contentService.videos.delete(archiveItem.id);
    if (error) {
      addToast(error, 'error');
    } else {
      addToast(`"${archiveItem.title}" soft-deleted and archived.`, 'success');
      const updated = items.filter(v => v.id !== archiveItem.id);
      setItems(updated);
      const { data: fresh } = await contentService.videos.list();
      if (fresh) setVideos(fresh);
    }
    setArchiveItem(null);
  };

  // Drag and drop sorting handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIdx(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, targetIdx: number) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === targetIdx) return;

    const updated = [...filtered];
    const [draggedItem] = updated.splice(draggedIdx, 1);
    updated.splice(targetIdx, 0, draggedItem);

    const orders = updated.map((item, idx) => ({
      id: item.id,
      displayOrder: idx + 1
    }));

    const stateMap = new Map(orders.map(o => [o.id, o.displayOrder]));
    setItems(prev => prev.map(v => stateMap.has(v.id) ? { ...v, displayOrder: stateMap.get(v.id)! } : v).sort((a,b) => (a.displayOrder || 0) - (b.displayOrder || 0)));
    setDraggedIdx(null);

    const { error } = await orderingService.updateOrder('videos', orders);
    if (error) addToast(error, 'error');
    else addToast('Video display sequence reordered.', 'success');

    const { data: fresh } = await contentService.videos.list();
    if (fresh) setVideos(fresh);
  };

  const isDndEnabled = !!filterChapterId;

  return (
    <div className="space-y-5 animate-fade-in text-slate-800 dark:text-slate-200">
      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <select value={filterClassId} onChange={e => { setFilterClassId(e.target.value); setFilterSubjectId(''); setFilterChapterId(''); }}
            className="py-2 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/40">
            <option value="">All Standards</option>
            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select value={filterSubjectId} onChange={e => { setFilterSubjectId(e.target.value); setFilterChapterId(''); }}
            className="py-2 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/40">
            <option value="">All Subjects</option>
            {filterSubjectsList.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <select value={filterChapterId} onChange={e => setFilterChapterId(e.target.value)}
            className="py-2 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/40">
            <option value="">All Chapters</option>
            {filterChaptersList.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          {isDndEnabled && (
            <span className="text-[10px] text-indigo-500 dark:text-indigo-400 font-bold bg-indigo-500/10 px-2.5 py-1 rounded-full">
              ⚡ Drag handle active
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search lectures..."
              className="pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 w-40" />
          </div>
          <PermissionGuard permission="content:write">
            <Button variant="primary" size="sm" onClick={openCreate}>
              <Plus className="w-3.5 h-3.5 mr-1.5" />Add Video
            </Button>
          </PermissionGuard>
          <button onClick={load} className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-slate-200/60 dark:border-slate-800/60 overflow-hidden bg-white/50 dark:bg-slate-950/20">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-slate-50/80 dark:bg-slate-900/80">
              <tr>
                {isDndEnabled && <th className="px-4 py-3 w-6" />}
                <th className="px-4 py-3 font-bold uppercase tracking-wider text-slate-500">Order</th>
                <th className="px-4 py-3 font-bold uppercase tracking-wider text-slate-500">Video Title</th>
                <th className="px-4 py-3 font-bold uppercase tracking-wider text-slate-500">Standard / Subject</th>
                <th className="px-4 py-3 font-bold uppercase tracking-wider text-slate-500">Duration</th>
                <th className="px-4 py-3 font-bold uppercase tracking-wider text-slate-500">Unlisted Key</th>
                <th className="px-4 py-3 font-bold uppercase tracking-wider text-slate-500">Status</th>
                <th className="px-4 py-3 font-bold uppercase tracking-wider text-slate-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {loading ? (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-slate-400">Loading video records...</td></tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-16 text-center text-slate-400 space-y-3">
                    <PlayCircle className="w-8 h-8 mx-auto opacity-30 text-slate-400" />
                    <p className="font-semibold">No Videos Logged</p>
                  </td>
                </tr>
              ) : filtered.map((item, idx) => (
                <tr 
                  key={item.id}
                  draggable={isDndEnabled}
                  onDragStart={e => handleDragStart(e, idx)}
                  onDragOver={e => handleDragOver(e, idx)}
                  onDrop={e => handleDrop(e, idx)}
                  className={`hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors ${
                    draggedIdx === idx ? 'opacity-40 bg-slate-100 dark:bg-slate-800' : ''
                  }`}
                >
                  {isDndEnabled && (
                    <td className="px-4 py-3 text-slate-300 dark:text-slate-700 cursor-grab active:cursor-grabbing">
                      <GripVertical className="w-3.5 h-3.5" />
                    </td>
                  )}
                  <td className="px-4 py-3 font-mono text-[10px] text-slate-450">{item.displayOrder || 0}</td>
                  <td className="px-4 py-3">
                    <div className="font-bold text-slate-800 dark:text-slate-100">{item.title}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5 truncate max-w-xs">{item.description}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-slate-700 dark:text-slate-300">
                      {classes.find(c => c.id === item.classId)?.name || item.classId}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      {subjects.find(s => s.id === item.subjectId)?.name || item.subjectId}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-650 dark:text-slate-400 font-mono">
                    {Math.floor((item.durationSeconds || 0) / 60)} mins
                  </td>
                  <td className="px-4 py-3 text-slate-500 font-mono">
                    {item.videoIdOrUrl}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={item.status as ContentStatus} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      {item.status === 'review' && (
                        <div className="flex items-center gap-1.5 border-r border-slate-150 dark:border-slate-800 pr-2 mr-0.5">
                          <button
                            onClick={() => handleApprove(item.id)}
                            title="Approve & Publish"
                            className="p-1 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/35 transition-all"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setRejectTargetId(item.id)}
                            title="Reject & Request Correction"
                            className="p-1 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/35 transition-all"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                      <PermissionGuard permission="content:write">
                        <button onClick={() => openEdit(item)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-all">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                      </PermissionGuard>
                      <PermissionGuard permission="content:delete">
                        <button onClick={() => setArchiveItem(item)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </PermissionGuard>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Editor Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Edit Video Lecture' : 'Add Video Lecture'} size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Video Title *" value={formTitle} onChange={e => setFormTitle(e.target.value)} placeholder="e.g. NCERT Mechanics Intro" required />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Academic Standard *</label>
              <select value={formClassId} onChange={e => { setFormClassId(e.target.value); setFormSubjectId(''); setFormChapterId(''); }}
                className="w-full py-2.5 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/40">
                <option value="">Select Class...</option>
                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Subject *</label>
              <select value={formSubjectId} onChange={e => { setFormSubjectId(e.target.value); setFormChapterId(''); }}
                className="w-full py-2.5 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/40">
                <option value="">Select Subject...</option>
                {activeSubjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Chapter</label>
            <select value={formChapterId} onChange={e => setFormChapterId(e.target.value)}
              className="w-full py-2.5 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/40">
              <option value="">None (Link to Subject directly)</option>
              {activeChapters.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-1">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Provider</label>
              <select value={formProvider} onChange={e => setFormProvider(e.target.value as any)}
                className="w-full py-2.5 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/40">
                <option value="youtube">YouTube</option>
                <option value="gdrive">Google Drive</option>
                <option value="vimeo">Vimeo</option>
              </select>
            </div>
            <div className="col-span-2">
              <Input label="YouTube ID / unlisted URL *" value={formVideoId} onChange={e => setFormVideoId(e.target.value)} placeholder="e.g. h7gh96X69Gs" required />
            </div>
          </div>
          <Input label="Duration (Seconds)" type="number" value={formDuration} onChange={e => setFormDuration(e.target.value)} />
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Video Overview</label>
            <textarea value={formDesc} onChange={e => setFormDesc(e.target.value)} rows={3} placeholder="Provide lecture concepts..."
              className="w-full py-2.5 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 resize-none" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Workflow Status</label>
            <select value={formStatus} onChange={e => setFormStatus(e.target.value as ContentStatus)}
              className="w-full py-2.5 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/40">
              <option value="draft">Draft (Hidden from students)</option>
              <option value="review">Under Review (Hidden from students)</option>
              <option value="published">Published (Visible on Portal)</option>
            </select>
          </div>

          {formError && <p className="text-xs text-red-500 flex items-center gap-1"><X className="w-3.5 h-3.5" />{formError}</p>}
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" size="sm" type="button" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button variant="primary" size="sm" type="submit" isLoading={formLoading}>
              {editItem ? 'Save Video' : 'Add Video'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Soft Delete Dialog */}
      <Modal isOpen={!!archiveItem} onClose={() => setArchiveItem(null)} title="Delete Video Lecture" size="sm">
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <p className="text-xs text-red-750 dark:text-red-300 leading-relaxed">
              Are you sure you want to delete <strong>{archiveItem?.title}</strong>? This lecture will be soft-deleted and moved to archives.
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setArchiveItem(null)}>Cancel</Button>
            <Button variant="danger" size="sm" onClick={handleArchive}>Archive & Hide</Button>
          </div>
        </div>
      </Modal>

      <RejectionModal
        isOpen={!!rejectTargetId}
        onClose={() => setRejectTargetId(null)}
        onSubmit={handleRejectSubmit}
        loading={rejectionLoading}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  TAB 3 — PYQ Management Panel
// ─────────────────────────────────────────────────────────────────────────────
function PYQPanel() {
  const { classes, subjects, chapters, notes, setNotes, user, addToast } = useApp();
  const [items, setItems] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterClassId, setFilterClassId] = useState('');
  const [filterSubjectId, setFilterSubjectId] = useState('');
  const [filterChapterId, setFilterChapterId] = useState('');

  // Drag & drop sorting
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Note | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  // Form states
  const [formTitle, setFormTitle] = useState('');
  const [formExamName, setFormExamName] = useState('');
  const [formYear, setFormYear] = useState('2024');
  const [formPdfUrl, setFormPdfUrl] = useState('');
  const [formClassId, setFormClassId] = useState('');
  const [formSubjectId, setFormSubjectId] = useState('');
  const [formChapterId, setFormChapterId] = useState('');
  const [formSolvedStatus, setFormSolvedStatus] = useState<'solved' | 'unsolved'>('solved');
  const [formIsPremium, setFormIsPremium] = useState(false);
  const [formPrice, setFormPrice] = useState('0');
  const [formStatus, setFormStatus] = useState<ContentStatus>('draft');

  // Archive state
  const [archiveItem, setArchiveItem] = useState<Note | null>(null);

  // Rejection states
  const [rejectTargetId, setRejectTargetId] = useState<string | null>(null);
  const [rejectionLoading, setRejectionLoading] = useState(false);

  const handleApprove = async (itemId: string) => {
    const { error } = await teacherService.approveContent('notes', itemId, user?.id || '');
    if (error) {
      addToast(error, 'error');
    } else {
      addToast('PYQ board paper approved & published successfully!', 'success');
      load();
    }
  };

  const handleRejectSubmit = async (reason: string, comment: string) => {
    if (!rejectTargetId) return;
    setRejectionLoading(true);
    const { error } = await teacherService.rejectContent('notes', rejectTargetId, reason, comment, user?.id || '');
    setRejectionLoading(false);
    if (error) {
      addToast(error, 'error');
    } else {
      addToast('PYQ board paper rejected and returned to draft.', 'success');
      setRejectTargetId(null);
      load();
    }
  };

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await contentService.notes.list();
    if (error) addToast(error, 'error');
    else setItems((data ?? []).filter(n => n.type === 'pyq'));
    setLoading(false);
  }, [addToast]);

  useEffect(() => { load(); }, [load]);

  const activeSubjects = formClassId ? subjects.filter(s => s.classId === formClassId) : [];
  const activeChapters = formSubjectId ? chapters.filter(c => c.subjectId === formSubjectId) : [];

  const filterSubjectsList = filterClassId ? subjects.filter(s => s.classId === filterClassId) : subjects;
  const filterChaptersList = filterSubjectId ? chapters.filter(c => c.subjectId === filterSubjectId) : chapters;

  const filtered = items.filter(n => {
    const matchSearch = n.title.toLowerCase().includes(search.toLowerCase());
    const matchClass = !filterClassId || n.classId === filterClassId;
    const matchSubject = !filterSubjectId || n.subjectId === filterSubjectId;
    const matchChapter = !filterChapterId || n.chapterId === filterChapterId;
    return matchSearch && matchClass && matchSubject && matchChapter;
  });

  const openCreate = () => {
    setEditItem(null);
    setFormTitle(''); setFormExamName(''); setFormYear('2024'); setFormPdfUrl('');
    setFormClassId(classes[0]?.id || ''); setFormSubjectId(''); setFormChapterId('');
    setFormSolvedStatus('solved'); setFormIsPremium(false); setFormPrice('0'); setFormStatus('draft');
    setFormError('');
    setModalOpen(true);
  };

  const openEdit = (item: Note) => {
    setEditItem(item);
    setFormTitle(item.title);
    setFormExamName(item.examName || '');
    setFormYear(String(item.year || 2024));
    setFormPdfUrl(item.pdfUrl);
    setFormClassId(item.classId || '');
    setFormSubjectId(item.subjectId || '');
    setFormChapterId(item.chapterId || '');
    setFormSolvedStatus(item.solvedStatus || 'solved');
    setFormIsPremium(item.isPremium);
    setFormPrice(String(item.price || 0));
    setFormStatus(item.status || 'draft');
    setFormError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) { setFormError('Title is required.'); return; }
    if (!formPdfUrl.trim()) { setFormError('PDF URL is required.'); return; }
    setFormLoading(true); setFormError('');

    const payload: Partial<Note> = {
      title: formTitle.trim(),
      examName: formExamName.trim(),
      year: Number(formYear),
      pdfUrl: formPdfUrl.trim(),
      classId: formClassId || null,
      subjectId: formSubjectId || null,
      chapterId: formChapterId || null,
      solvedStatus: formSolvedStatus,
      isPremium: formIsPremium,
      price: Number(formPrice),
      type: 'pyq',
      status: formStatus,
    };

    if (editItem) {
      const { error } = await contentService.notes.update(editItem.id, payload, user?.id);
      if (error) { setFormError(error); setFormLoading(false); return; }
      addToast(`"${formTitle}" updated.`, 'success');
    } else {
      const { error } = await contentService.notes.create(payload, user?.id);
      if (error) { setFormError(error); setFormLoading(false); return; }
      addToast(`"${formTitle}" created.`, 'success');
    }

    await load();
    const { data: fresh } = await contentService.notes.list();
    if (fresh) setNotes(fresh);
    setFormLoading(false);
    setModalOpen(false);
  };

  const handleArchive = async () => {
    if (!archiveItem) return;
    const { error } = await contentService.notes.delete(archiveItem.id);
    if (error) {
      addToast(error, 'error');
    } else {
      addToast(`"${archiveItem.title}" soft-deleted and archived.`, 'success');
      const updated = items.filter(n => n.id !== archiveItem.id);
      setItems(updated);
      const { data: fresh } = await contentService.notes.list();
      if (fresh) setNotes(fresh);
    }
    setArchiveItem(null);
  };

  // Drag and drop sorting handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIdx(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, targetIdx: number) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === targetIdx) return;

    const updated = [...filtered];
    const [draggedItem] = updated.splice(draggedIdx, 1);
    updated.splice(targetIdx, 0, draggedItem);

    const orders = updated.map((item, idx) => ({
      id: item.id,
      displayOrder: idx + 1
    }));

    const stateMap = new Map(orders.map(o => [o.id, o.displayOrder]));
    setItems(prev => prev.map(n => stateMap.has(n.id) ? { ...n, displayOrder: stateMap.get(n.id)! } : n).sort((a,b) => (a.displayOrder || 0) - (b.displayOrder || 0)));
    setDraggedIdx(null);

    const { error } = await orderingService.updateOrder('pyqs', orders);
    if (error) addToast(error, 'error');
    else addToast('PYQ order updated.', 'success');

    const { data: fresh } = await contentService.notes.list();
    if (fresh) setNotes(fresh);
  };

  const isDndEnabled = !!filterChapterId;

  return (
    <div className="space-y-5 animate-fade-in text-slate-800 dark:text-slate-200">
      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <select value={filterClassId} onChange={e => { setFilterClassId(e.target.value); setFilterSubjectId(''); setFilterChapterId(''); }}
            className="py-2 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/40">
            <option value="">All Standards</option>
            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select value={filterSubjectId} onChange={e => { setFilterSubjectId(e.target.value); setFilterChapterId(''); }}
            className="py-2 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/40">
            <option value="">All Subjects</option>
            {filterSubjectsList.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <select value={filterChapterId} onChange={e => setFilterChapterId(e.target.value)}
            className="py-2 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/40">
            <option value="">All Chapters</option>
            {filterChaptersList.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          {isDndEnabled && (
            <span className="text-[10px] text-indigo-500 dark:text-indigo-400 font-bold bg-indigo-500/10 px-2.5 py-1 rounded-full">
              ⚡ Drag handle active
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search PYQs..."
              className="pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 w-40" />
          </div>
          <PermissionGuard permission="content:write">
            <Button variant="primary" size="sm" onClick={openCreate}>
              <Plus className="w-3.5 h-3.5 mr-1.5" />Add PYQ Paper
            </Button>
          </PermissionGuard>
          <button onClick={load} className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-slate-200/60 dark:border-slate-800/60 overflow-hidden bg-white/50 dark:bg-slate-950/20">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-slate-50/80 dark:bg-slate-900/80">
              <tr>
                {isDndEnabled && <th className="px-4 py-3 w-6" />}
                <th className="px-4 py-3 font-bold uppercase tracking-wider text-slate-500">Order</th>
                <th className="px-4 py-3 font-bold uppercase tracking-wider text-slate-500">PYQ Title</th>
                <th className="px-4 py-3 font-bold uppercase tracking-wider text-slate-500">Exam / Year</th>
                <th className="px-4 py-3 font-bold uppercase tracking-wider text-slate-500">Solved Status</th>
                <th className="px-4 py-3 font-bold uppercase tracking-wider text-slate-500">Tier</th>
                <th className="px-4 py-3 font-bold uppercase tracking-wider text-slate-500">Status</th>
                <th className="px-4 py-3 font-bold uppercase tracking-wider text-slate-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {loading ? (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-slate-400">Loading PYQ papers...</td></tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-16 text-center text-slate-400 space-y-3">
                    <Award className="w-8 h-8 mx-auto opacity-30 text-slate-400" />
                    <p className="font-semibold">No Previous Year Solved Papers</p>
                  </td>
                </tr>
              ) : filtered.map((item, idx) => (
                <tr 
                  key={item.id}
                  draggable={isDndEnabled}
                  onDragStart={e => handleDragStart(e, idx)}
                  onDragOver={e => handleDragOver(e, idx)}
                  onDrop={e => handleDrop(e, idx)}
                  className={`hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors ${
                    draggedIdx === idx ? 'opacity-40 bg-slate-100 dark:bg-slate-800' : ''
                  }`}
                >
                  {isDndEnabled && (
                    <td className="px-4 py-3 text-slate-300 dark:text-slate-700 cursor-grab active:cursor-grabbing">
                      <GripVertical className="w-3.5 h-3.5" />
                    </td>
                  )}
                  <td className="px-4 py-3 font-mono text-[10px] text-slate-450">{item.displayOrder || 0}</td>
                  <td className="px-4 py-3">
                    <div className="font-bold text-slate-800 dark:text-slate-100">{item.title}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5 truncate max-w-xs">{item.pdfUrl}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-slate-700 dark:text-slate-300">{item.examName || 'Board'}</div>
                    <div className="text-[10px] text-slate-450 mt-0.5 font-mono">{item.year}</div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={item.solvedStatus === 'solved' ? 'success' : 'secondary'} size="sm">
                      {item.solvedStatus === 'solved' ? 'Solved Key' : 'Question Only'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    {item.isPremium ? (
                      <Badge variant="warning" size="sm">Premium (₹{item.price})</Badge>
                    ) : (
                      <Badge variant="primary" size="sm">Free</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={item.status as ContentStatus} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      {item.status === 'review' && (
                        <div className="flex items-center gap-1.5 border-r border-slate-150 dark:border-slate-800 pr-2 mr-0.5">
                          <button
                            onClick={() => handleApprove(item.id)}
                            title="Approve & Publish"
                            className="p-1 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/35 transition-all"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setRejectTargetId(item.id)}
                            title="Reject & Request Correction"
                            className="p-1 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/35 transition-all"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                      <PermissionGuard permission="content:write">
                        <button onClick={() => openEdit(item)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-all">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                      </PermissionGuard>
                      <PermissionGuard permission="content:delete">
                        <button onClick={() => setArchiveItem(item)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </PermissionGuard>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Editor Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Edit PYQ Paper' : 'Add PYQ Paper'} size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Paper Title *" value={formTitle} onChange={e => setFormTitle(e.target.value)} placeholder="e.g. CBSE 2023 Physics Solved Paper" required />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Exam Name (e.g. CBSE, NEET)" value={formExamName} onChange={e => setFormExamName(e.target.value)} placeholder="e.g. SEBA, CBSE" required />
            <Input label="Exam Year" type="number" value={formYear} onChange={e => setFormYear(e.target.value)} min="1990" max="2030" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Academic Standard *</label>
              <select value={formClassId} onChange={e => { setFormClassId(e.target.value); setFormSubjectId(''); setFormChapterId(''); }}
                className="w-full py-2.5 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/40">
                <option value="">Select Class...</option>
                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Subject *</label>
              <select value={formSubjectId} onChange={e => { setFormSubjectId(e.target.value); setFormChapterId(''); }}
                className="w-full py-2.5 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/40">
                <option value="">Select Subject...</option>
                {activeSubjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Chapter</label>
            <select value={formChapterId} onChange={e => setFormChapterId(e.target.value)}
              className="w-full py-2.5 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/40">
              <option value="">None (Whole Subject PYQ)</option>
              {activeChapters.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <UploadEngine
            bucket="pyqs"
            folderPath="pdfs"
            accept="application/pdf"
            initialUrl={formPdfUrl}
            label="Upload PYQ PDF *"
            helperText="PDF format only (Max 20MB)"
            maxSizeMB={20}
            onUploadSuccess={(url, path, sizeBytes) => {
              setFormPdfUrl(url);
            }}
          />
          <Input label="Manual URL Override" value={formPdfUrl} onChange={e => setFormPdfUrl(e.target.value)} placeholder="https://example.com/solved_pyq.pdf" />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Solved Status</label>
              <select value={formSolvedStatus} onChange={e => setFormSolvedStatus(e.target.value as any)}
                className="w-full py-2.5 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/40">
                <option value="solved">Solved Answer Sheet Included</option>
                <option value="unsolved">Question Paper Only</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Workflow Status</label>
              <select value={formStatus} onChange={e => setFormStatus(e.target.value as ContentStatus)}
                className="w-full py-2.5 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/40">
                <option value="draft">Draft (Hidden from students)</option>
                <option value="review">Under Review (Hidden from students)</option>
                <option value="published">Published (Visible on Portal)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Premium Tier</p>
                <p className="text-[10px] text-slate-400">Locked for unpaid accounts.</p>
              </div>
              <button type="button" onClick={() => setFormIsPremium(!formIsPremium)}>
                {formIsPremium ? <ToggleRight className="w-6 h-6 text-emerald-500" /> : <ToggleLeft className="w-6 h-6 text-slate-400" />}
              </button>
            </div>
            {formIsPremium && (
              <Input label="Unlock Price (INR)" type="number" value={formPrice} onChange={e => setFormPrice(e.target.value)} min="0" />
            )}
          </div>

          {formError && <p className="text-xs text-red-500 flex items-center gap-1"><X className="w-3.5 h-3.5" />{formError}</p>}
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" size="sm" type="button" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button variant="primary" size="sm" type="submit" isLoading={formLoading}>
              {editItem ? 'Save PYQ' : 'Add PYQ'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Soft Delete Dialog */}
      <Modal isOpen={!!archiveItem} onClose={() => setArchiveItem(null)} title="Delete PYQ Paper" size="sm">
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <p className="text-xs text-red-750 dark:text-red-300 leading-relaxed">
              Are you sure you want to delete <strong>{archiveItem?.title}</strong>? It will be soft-deleted.
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setArchiveItem(null)}>Cancel</Button>
            <Button variant="danger" size="sm" onClick={handleArchive}>Archive & Hide</Button>
          </div>
        </div>
      </Modal>

      <RejectionModal
        isOpen={!!rejectTargetId}
        onClose={() => setRejectTargetId(null)}
        onSubmit={handleRejectSubmit}
        loading={rejectionLoading}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  TAB 4 — Live Quiz Management Panel
// ─────────────────────────────────────────────────────────────────────────────
function QuizPanel() {
  const { classes, subjects, chapters, quizzes, setQuizzes, user, addToast } = useApp();
  const [items, setItems] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterClassId, setFilterClassId] = useState('');
  const [filterSubjectId, setFilterSubjectId] = useState('');
  const [filterChapterId, setFilterChapterId] = useState('');

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Quiz | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  // Form states
  const [formTitle, setFormTitle] = useState('');
  const [formPassingScore, setFormPassingScore] = useState('50');
  const [formTimer, setFormTimer] = useState('600');
  const [formClassId, setFormClassId] = useState('');
  const [formSubjectId, setFormSubjectId] = useState('');
  const [formChapterId, setFormChapterId] = useState('');
  const [formDifficulty, setFormDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [formStatus, setFormStatus] = useState<ContentStatus>('draft');

  // Question bank editor states
  const [qBankOpen, setQBankOpen] = useState(false);
  const [qBankQuiz, setQBankQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [optionsMap, setOptionsMap] = useState<Record<string, QuizOption[]>>({});
  const [questionsLoading, setQuestionsLoading] = useState(false);

  // Question editing form states
  const [qFormOpen, setQFormOpen] = useState(false);
  const [editQuestion, setEditQuestion] = useState<QuizQuestion | null>(null);
  const [qFormText, setQFormText] = useState('');
  const [qFormOptions, setQFormOptions] = useState<{ text: string; isCorrect: boolean }[]>([
    { text: '', isCorrect: true },
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
  ]);

  // Archive state
  const [archiveItem, setArchiveItem] = useState<Quiz | null>(null);

  // Rejection states
  const [rejectTargetId, setRejectTargetId] = useState<string | null>(null);
  const [rejectionLoading, setRejectionLoading] = useState(false);

  const handleApprove = async (itemId: string) => {
    const { error } = await teacherService.approveContent('quizzes', itemId, user?.id || '');
    if (error) {
      addToast(error, 'error');
    } else {
      addToast('Quiz approved & published successfully!', 'success');
      load();
    }
  };

  const handleRejectSubmit = async (reason: string, comment: string) => {
    if (!rejectTargetId) return;
    setRejectionLoading(true);
    const { error } = await teacherService.rejectContent('quizzes', rejectTargetId, reason, comment, user?.id || '');
    setRejectionLoading(false);
    if (error) {
      addToast(error, 'error');
    } else {
      addToast('Quiz rejected and returned to draft.', 'success');
      setRejectTargetId(null);
      load();
    }
  };

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await contentService.quizzes.list();
    if (error) addToast(error, 'error');
    else setItems(data ?? []);
    setLoading(false);
  }, [addToast]);

  useEffect(() => { load(); }, [load]);

  const activeSubjects = formClassId ? subjects.filter(s => s.classId === formClassId) : [];
  const activeChapters = formSubjectId ? chapters.filter(c => c.subjectId === formSubjectId) : [];

  const filterSubjectsList = filterClassId ? subjects.filter(s => s.classId === filterClassId) : subjects;
  const filterChaptersList = filterSubjectId ? chapters.filter(c => c.subjectId === filterSubjectId) : chapters;

  const filtered = items.filter(q => {
    const matchSearch = q.title.toLowerCase().includes(search.toLowerCase());
    const matchClass = !filterClassId || q.classId === filterClassId;
    const matchSubject = !filterSubjectId || q.subjectId === filterSubjectId;
    const matchChapter = !filterChapterId || q.chapterId === filterChapterId;
    return matchSearch && matchClass && matchSubject && matchChapter;
  });

  const openCreate = () => {
    setEditItem(null);
    setFormTitle(''); setFormPassingScore('50'); setFormTimer('600');
    setFormClassId(classes[0]?.id || ''); setFormSubjectId(''); setFormChapterId('');
    setFormDifficulty('medium'); setFormStatus('draft'); setFormError('');
    setModalOpen(true);
  };

  const openEdit = (item: Quiz) => {
    setEditItem(item);
    setFormTitle(item.title);
    setFormPassingScore(String(item.passingScorePct || 50));
    setFormTimer(String(item.timerSeconds || 600));
    setFormClassId(item.classId || '');
    setFormSubjectId(item.subjectId || '');
    setFormChapterId(item.chapterId || '');
    setFormDifficulty(item.difficulty || 'medium');
    setFormStatus(item.status || 'draft');
    setFormError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) { setFormError('Title is required.'); return; }
    setFormLoading(true); setFormError('');

    const payload: Partial<Quiz> = {
      title: formTitle.trim(),
      passingScorePct: Number(formPassingScore),
      timerSeconds: Number(formTimer),
      classId: formClassId || null,
      subjectId: formSubjectId || null,
      chapterId: formChapterId || null,
      difficulty: formDifficulty,
      status: formStatus,
    };

    if (editItem) {
      const { error } = await contentService.quizzes.update(editItem.id, payload, user?.id);
      if (error) { setFormError(error); setFormLoading(false); return; }
      addToast(`"${formTitle}" updated.`, 'success');
    } else {
      const { error } = await contentService.quizzes.create(payload, user?.id);
      if (error) { setFormError(error); setFormLoading(false); return; }
      addToast(`"${formTitle}" created.`, 'success');
    }

    await load();
    const { data: fresh } = await contentService.quizzes.list();
    if (fresh) setQuizzes(fresh);
    setFormLoading(false);
    setModalOpen(false);
  };

  const handleArchive = async () => {
    if (!archiveItem) return;
    const { error } = await contentService.quizzes.delete(archiveItem.id);
    if (error) {
      addToast(error, 'error');
    } else {
      addToast(`"${archiveItem.title}" archived.`, 'success');
      const updated = items.filter(q => q.id !== archiveItem.id);
      setItems(updated);
      const { data: fresh } = await contentService.quizzes.list();
      if (fresh) setQuizzes(fresh);
    }
    setArchiveItem(null);
  };

  // ── Question Bank operations ──
  const openQBank = async (quiz: Quiz) => {
    setQBankQuiz(quiz);
    setQBankOpen(true);
    setQuestionsLoading(true);
    const { data: qData } = await contentService.quizzes.getQuestions(quiz.id);
    const list = qData || [];
    setQuestions(list);

    // Load options for all questions
    const optMap: Record<string, QuizOption[]> = {};
    for (const q of list) {
      const { data: oData } = await contentService.quizzes.getOptions(q.id);
      optMap[q.id] = oData || [];
    }
    setOptionsMap(optMap);
    setQuestionsLoading(false);
  };

  const openQCreate = () => {
    setEditQuestion(null);
    setQFormText('');
    setQFormOptions([
      { text: '', isCorrect: true },
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
    ]);
    setQFormOpen(true);
  };

  const openQEdit = (q: QuizQuestion) => {
    setEditQuestion(q);
    setQFormText(q.questionText);
    const opts = optionsMap[q.id] || [];
    const formatted = opts.map(o => ({ text: o.optionText, isCorrect: o.isCorrect }));
    while (formatted.length < 4) {
      formatted.push({ text: '', isCorrect: false });
    }
    setQFormOptions(formatted);
    setQFormOpen(true);
  };

  const handleQSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qBankQuiz) return;
    if (!qFormText.trim()) return;
    if (qFormOptions.some(o => !o.text.trim())) {
      addToast('Please fill out all options.', 'warning');
      return;
    }
    if (!qFormOptions.some(o => o.isCorrect)) {
      addToast('Please select one correct option.', 'warning');
      return;
    }

    const { error } = await contentService.quizzes.saveQuestion(
      qBankQuiz.id,
      qFormText.trim(),
      qFormOptions,
      editQuestion?.id
    );

    if (error) {
      addToast(error, 'error');
    } else {
      addToast(editQuestion ? 'Question updated.' : 'Question added to bank.', 'success');
      setQFormOpen(false);
      openQBank(qBankQuiz);
    }
  };

  const handleQDelete = async (questionId: string) => {
    if (!qBankQuiz) return;
    const { error } = await contentService.quizzes.deleteQuestion(questionId);
    if (error) {
      addToast(error, 'error');
    } else {
      addToast('Question deleted.', 'success');
      openQBank(qBankQuiz);
    }
  };

  const getClassName = (id?: string | null) => classes.find(c => c.id === id)?.name || id || 'None';
  const getSubjectName = (id?: string | null) => subjects.find(s => s.id === id)?.name || id || 'None';

  return (
    <div className="space-y-5 animate-fade-in text-slate-800 dark:text-slate-200">
      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <select value={filterClassId} onChange={e => { setFilterClassId(e.target.value); setFilterSubjectId(''); setFilterChapterId(''); }}
            className="py-2 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/40">
            <option value="">All Standards</option>
            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select value={filterSubjectId} onChange={e => { setFilterSubjectId(e.target.value); setFilterChapterId(''); }}
            className="py-2 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/40">
            <option value="">All Subjects</option>
            {filterSubjectsList.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <select value={filterChapterId} onChange={e => setFilterChapterId(e.target.value)}
            className="py-2 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/40">
            <option value="">All Chapters</option>
            {filterChaptersList.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search quizzes..."
              className="pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 w-40" />
          </div>
          <PermissionGuard permission="content:write">
            <Button variant="primary" size="sm" onClick={openCreate}>
              <Plus className="w-3.5 h-3.5 mr-1.5" />Add Live Quiz
            </Button>
          </PermissionGuard>
          <button onClick={load} className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-slate-200/60 dark:border-slate-800/60 overflow-hidden bg-white/50 dark:bg-slate-950/20">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-slate-50/80 dark:bg-slate-900/80">
              <tr>
                <th className="px-4 py-3 font-bold uppercase tracking-wider text-slate-500">Quiz Title</th>
                <th className="px-4 py-3 font-bold uppercase tracking-wider text-slate-500">Standard / Subject</th>
                <th className="px-4 py-3 font-bold uppercase tracking-wider text-slate-500">Timer Limit</th>
                <th className="px-4 py-3 font-bold uppercase tracking-wider text-slate-500">Difficulty</th>
                <th className="px-4 py-3 font-bold uppercase tracking-wider text-slate-500">Questions</th>
                <th className="px-4 py-3 font-bold uppercase tracking-wider text-slate-500">Status</th>
                <th className="px-4 py-3 font-bold uppercase tracking-wider text-slate-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {loading ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-slate-400">Loading quizzes...</td></tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center text-slate-400 space-y-3">
                    <HelpCircle className="w-8 h-8 mx-auto opacity-30 text-slate-400" />
                    <p className="font-semibold">No Quizzes Configured</p>
                  </td>
                </tr>
              ) : filtered.map(item => (
                <tr key={item.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-bold text-slate-800 dark:text-slate-100">{item.title}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Min Score: {item.passingScorePct}%</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-slate-700 dark:text-slate-300">{getClassName(item.classId)}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{getSubjectName(item.subjectId)}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-650 dark:text-slate-400 font-mono">
                    {Math.floor((item.timerSeconds || 0) / 60)} mins
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={item.difficulty === 'easy' ? 'success' : item.difficulty === 'hard' ? 'danger' : 'warning'} size="sm">
                      {item.difficulty?.toUpperCase()}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => openQBank(item)}
                      className="px-2.5 py-1 text-[10px] rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-500 font-black uppercase flex items-center gap-1 cursor-pointer">
                      <PlusCircle className="w-3 h-3" /> Manage Bank
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={item.status as ContentStatus} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      {item.status === 'review' && (
                        <div className="flex items-center gap-1.5 border-r border-slate-150 dark:border-slate-800 pr-2 mr-0.5">
                          <button
                            onClick={() => handleApprove(item.id)}
                            title="Approve & Publish"
                            className="p-1 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/35 transition-all"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setRejectTargetId(item.id)}
                            title="Reject & Request Correction"
                            className="p-1 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/35 transition-all"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                      <PermissionGuard permission="content:write">
                        <button onClick={() => openEdit(item)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-all">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                      </PermissionGuard>
                      <PermissionGuard permission="content:delete">
                        <button onClick={() => setArchiveItem(item)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </PermissionGuard>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Editor Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Edit Live Quiz' : 'Add Live Quiz'} size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Quiz Title *" value={formTitle} onChange={e => setFormTitle(e.target.value)} placeholder="e.g. Chapter 1 Chapter Mock Test" required />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Academic Standard *</label>
              <select value={formClassId} onChange={e => { setFormClassId(e.target.value); setFormSubjectId(''); setFormChapterId(''); }}
                className="w-full py-2.5 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/40">
                <option value="">Select Class...</option>
                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Subject *</label>
              <select value={formSubjectId} onChange={e => { setFormSubjectId(e.target.value); setFormChapterId(''); }}
                className="w-full py-2.5 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/40">
                <option value="">Select Subject...</option>
                {activeSubjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Chapter *</label>
            <select value={formChapterId} onChange={e => setFormChapterId(e.target.value)} required
              className="w-full py-2.5 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/40">
              <option value="">Select Chapter...</option>
              {activeChapters.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Passing Score %" type="number" value={formPassingScore} onChange={e => setFormPassingScore(e.target.value)} min="10" max="100" />
            <Input label="Timer Limit (Seconds)" type="number" value={formTimer} onChange={e => setFormTimer(e.target.value)} min="0" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Difficulty Level</label>
              <select value={formDifficulty} onChange={e => setFormDifficulty(e.target.value as any)}
                className="w-full py-2.5 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/40">
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Workflow Status</label>
              <select value={formStatus} onChange={e => setFormStatus(e.target.value as ContentStatus)}
                className="w-full py-2.5 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/40">
                <option value="draft">Draft (Hidden from students)</option>
                <option value="review">Under Review (Hidden from students)</option>
                <option value="published">Published (Visible on Portal)</option>
              </select>
            </div>
          </div>

          {formError && <p className="text-xs text-red-500 flex items-center gap-1"><X className="w-3.5 h-3.5" />{formError}</p>}
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" size="sm" type="button" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button variant="primary" size="sm" type="submit" isLoading={formLoading}>
              {editItem ? 'Save Quiz' : 'Add Quiz'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Soft Delete Dialog */}
      <Modal isOpen={!!archiveItem} onClose={() => setArchiveItem(null)} title="Delete Live Quiz" size="sm">
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <p className="text-xs text-red-750 dark:text-red-300 leading-relaxed">
              Are you sure you want to delete <strong>{archiveItem?.title}</strong>? It will be archived.
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setArchiveItem(null)}>Cancel</Button>
            <Button variant="danger" size="sm" onClick={handleArchive}>Archive & Hide</Button>
          </div>
        </div>
      </Modal>

      {/* Question Bank Modal */}
      <Modal isOpen={qBankOpen} onClose={() => setQBankOpen(false)} title={`Question Bank: ${qBankQuiz?.title || 'Quiz'}`} size="lg">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <p className="text-xs text-slate-400">Total {questions.length} questions registered in CBT bank.</p>
            <Button variant="outline" size="sm" onClick={openQCreate}>
              <Plus className="w-3 h-3 mr-1" /> Add Question
            </Button>
          </div>

          <div className="max-h-96 overflow-y-auto space-y-4 divide-y divide-slate-100 dark:divide-slate-800">
            {questionsLoading ? (
              <p className="text-center text-slate-400 py-6 text-xs">Loading questions...</p>
            ) : questions.length === 0 ? (
              <p className="text-center text-slate-400 py-12 text-xs">No questions in bank. Tap "Add Question" to begin.</p>
            ) : questions.map((q, idx) => (
              <div key={q.id} className="pt-4 first:pt-0 space-y-2">
                <div className="flex justify-between items-start gap-3">
                  <div className="font-bold text-xs">Q{idx+1}. {q.questionText}</div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => openQEdit(q)} className="p-1 rounded text-slate-450 hover:text-indigo-500 hover:bg-slate-100 dark:hover:bg-slate-800">
                      <Pencil className="w-3 h-3" />
                    </button>
                    <button onClick={() => handleQDelete(q.id)} className="p-1 rounded text-slate-450 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[10px] pl-4">
                  {(optionsMap[q.id] || []).map((o, oIdx) => (
                    <div key={o.id} className={`p-2 rounded-xl border flex items-center gap-2 ${
                      o.isCorrect ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-600 dark:text-emerald-400 font-bold' : 'border-slate-100 bg-slate-50/50 dark:bg-slate-900/50 dark:border-slate-800'
                    }`}>
                      <span>{['A', 'B', 'C', 'D'][oIdx]}.</span>
                      <span className="truncate">{o.optionText}</span>
                      {o.isCorrect && <Check className="w-3 h-3 shrink-0 ml-auto" />}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Modal>

      {/* Question Editor Nested Modal */}
      <Modal isOpen={qFormOpen} onClose={() => setQFormOpen(false)} title={editQuestion ? 'Edit Question' : 'Add Question'} size="md">
        <form onSubmit={handleQSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Question Description *</label>
            <textarea value={qFormText} onChange={e => setQFormText(e.target.value)} rows={3} placeholder="Type the question content..." required
              className="w-full py-2.5 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 resize-none" />
          </div>

          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Answer Options (Mark Correct Option)</label>
            {qFormOptions.map((opt, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setQFormOptions(prev => prev.map((o, oIdx) => ({ ...o, isCorrect: oIdx === idx })))}
                  className={`p-1.5 rounded-lg shrink-0 transition-all ${
                    opt.isCorrect ? 'bg-emerald-500 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-400 dark:bg-slate-800 dark:hover:bg-slate-700'
                  }`}
                >
                  {opt.isCorrect ? <CheckCircle2 className="w-4 h-4" /> : <div className="w-4 h-4 border-2 border-slate-300 dark:border-slate-600 rounded-full" />}
                </button>
                <div className="flex-1">
                  <Input value={opt.text} onChange={e => setQFormOptions(prev => prev.map((o, oIdx) => oIdx === idx ? { ...o, text: e.target.value } : o))}
                    placeholder={`Option ${['A', 'B', 'C', 'D'][idx]} text...`} required />
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" size="sm" type="button" onClick={() => setQFormOpen(false)}>Cancel</Button>
            <Button variant="primary" size="sm" type="submit">
              {editQuestion ? 'Save Question' : 'Add Question'}
            </Button>
          </div>
        </form>
      </Modal>

      <RejectionModal
        isOpen={!!rejectTargetId}
        onClose={() => setRejectTargetId(null)}
        onSubmit={handleRejectSubmit}
        loading={rejectionLoading}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  Main Tab Container
// ─────────────────────────────────────────────────────────────────────────────
export default function ContentManagement({ initialTab }: { initialTab?: CMSTab }) {
  const [activeTab, setActiveTab] = useState<CMSTab>(initialTab ?? 'notes');

  const tabs: { id: CMSTab; label: string; icon: React.ReactNode }[] = [
    { id: 'notes',  label: 'Notes & DPPs',       icon: <FileText className="w-3.5 h-3.5" /> },
    { id: 'videos', label: 'Video Lectures',    icon: <PlayCircle className="w-3.5 h-3.5" /> },
    { id: 'pyq',    label: 'Previous Year (PYQ)', icon: <Award className="w-3.5 h-3.5" /> },
    { id: 'quiz',   label: 'Live Quiz Bank',    icon: <HelpCircle className="w-3.5 h-3.5" /> },
  ];

  return (
    <PermissionGuard permission="content:read" fullPage>
      <div className="space-y-6 animate-fade-in text-left">
        <div>
          <h2 className="text-base font-black text-slate-900 dark:text-white">Content Management System</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure lecture materials, video syllabi, boards PYQs, and interactive CBT quizzes.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1 p-1 rounded-2xl bg-slate-100/80 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/50 w-fit">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Dynamic Panels */}
        {activeTab === 'notes' && <NotesPanel />}
        {activeTab === 'videos' && <VideosPanel />}
        {activeTab === 'pyq' && <PYQPanel />}
        {activeTab === 'quiz' && <QuizPanel />}
      </div>
    </PermissionGuard>
  );
}
