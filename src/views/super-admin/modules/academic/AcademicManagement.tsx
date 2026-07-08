/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Academic Management — Super Admin Module
 * Sprint 2: Full CRUD for Academic Standards, Subjects, Chapters
 * ─────────────────────────────────────────────────────────────────
 * Supabase-first with localStorage fallback.
 * All mutations go through academicService and immediately sync
 * to AppContext (setClasses/setSubjects/setChapters) so the
 * Student Portal reflects changes without a page reload.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../../../../context/AppContext';
import { academicService, generateSlug } from '../../../../services/academic.service';
import { PermissionGuard } from '../../../../components/shared/PermissionGuard';
import { Modal } from '../../../../components/ui/Modal';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import { Badge } from '../../../../components/ui/Badge';
import type { AcademicClass, AcademicSubject, AcademicChapter } from '../../../../types';
import {
  Plus, Pencil, Trash2, ToggleLeft, ToggleRight,
  Layers, BookOpen, ClipboardList, Search,
  ChevronDown, ChevronUp, AlertTriangle, RefreshCw,
  GripVertical, Check, X,
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
//  Shared: Confirm Delete Dialog
// ─────────────────────────────────────────────────────────────────────────────

function ConfirmDialog({
  isOpen, onClose, onConfirm, title, message, loading,
}: {
  isOpen: boolean; onClose: () => void; onConfirm: () => void;
  title: string; message: string; loading?: boolean;
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="space-y-5">
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40">
          <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <p className="text-sm text-red-700 dark:text-red-300 leading-relaxed">{message}</p>
        </div>
        <div className="flex gap-3 justify-end">
          <Button variant="ghost" size="sm" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button variant="danger" size="sm" onClick={onConfirm} isLoading={loading}>
            Delete Permanently
          </Button>
        </div>
      </div>
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  Shared: Status Badge
// ─────────────────────────────────────────────────────────────────────────────

function StatusBadge({ isActive }: { isActive?: boolean }) {
  return (
    <Badge variant={isActive !== false ? 'success' : 'secondary'} size="sm">
      {isActive !== false ? 'Active' : 'Inactive'}
    </Badge>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  Shared: Empty Table State
// ─────────────────────────────────────────────────────────────────────────────

function EmptyTable({ label, onAdd }: { label: string; onAdd: () => void }) {
  return (
    <div className="py-16 text-center space-y-4">
      <div className="h-12 w-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto">
        <Layers className="w-6 h-6 text-slate-400" />
      </div>
      <div>
        <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No {label} Yet</p>
        <p className="text-xs text-slate-400 mt-1">Create your first {label.toLowerCase()} to get started.</p>
      </div>
      <PermissionGuard permission="academic:write">
        <Button variant="primary" size="sm" onClick={onAdd}>
          <Plus className="w-3.5 h-3.5 mr-1.5" />Add {label}
        </Button>
      </PermissionGuard>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  TAB 1 — Academic Standards (Classes)
// ─────────────────────────────────────────────────────────────────────────────

function StandardsPanel() {
  const { classes, setClasses, user, addToast } = useApp();
  const [items, setItems] = useState<AcademicClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<AcademicClass | null>(null);
  const [deleteItem, setDeleteItem] = useState<AcademicClass | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [sortField, setSortField] = useState<'name' | 'priority'>('priority');
  const [sortAsc, setSortAsc] = useState(true);

  // Form state
  const [formName, setFormName] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formPriority, setFormPriority] = useState('0');
  const [formActive, setFormActive] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await academicService.classes.list();
    if (error) { addToast(error, 'error'); }
    else { setItems(data ?? []); }
    setLoading(false);
  }, [addToast]);

  useEffect(() => { load(); }, [load]);

  const filtered = items
    .filter(i => i.name.toLowerCase().includes(search.toLowerCase()) || i.slug.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      const va = sortField === 'name' ? a.name : a.priority;
      const vb = sortField === 'name' ? b.name : b.priority;
      return sortAsc ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1);
    });

  const openCreate = () => {
    setEditItem(null);
    setFormName(''); setFormSlug(''); setFormPriority('0'); setFormActive(true); setFormError('');
    setModalOpen(true);
  };

  const openEdit = (item: AcademicClass) => {
    setEditItem(item);
    setFormName(item.name); setFormSlug(item.slug);
    setFormPriority(String(item.priority)); setFormActive(item.isActive !== false); setFormError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) { setFormError('Name is required.'); return; }
    const slug = formSlug.trim() || generateSlug(formName);
    setFormLoading(true); setFormError('');

    if (editItem) {
      const { error } = await academicService.classes.update(editItem.id, {
        name: formName.trim(), slug, priority: Number(formPriority), isActive: formActive,
      });
      if (error) { setFormError(error); setFormLoading(false); return; }
      addToast(`"${formName}" updated successfully.`, 'success');
    } else {
      const { data, error } = await academicService.classes.create({
        name: formName.trim(), slug, priority: Number(formPriority), isActive: formActive,
      });
      if (error) { setFormError(error); setFormLoading(false); return; }
      if (data) setClasses([...classes, data]);
    }

    await load();
    // Sync updated list to AppContext
    const { data: fresh } = await academicService.classes.list();
    if (fresh) setClasses(fresh);

    setFormLoading(false);
    setModalOpen(false);
    if (!editItem) addToast(`"${formName}" created successfully.`, 'success');
  };

  const handleDelete = async () => {
    if (!deleteItem) return;
    setDeleteLoading(true);
    const { error } = await academicService.classes.delete(deleteItem.id);
    if (error) { addToast(error, 'error'); }
    else {
      addToast(`"${deleteItem.name}" deleted.`, 'success');
      const updated = items.filter(i => i.id !== deleteItem.id);
      setItems(updated);
      setClasses(updated);
    }
    setDeleteLoading(false);
    setDeleteItem(null);
  };

  const handleToggle = async (item: AcademicClass) => {
    const next = item.isActive === false ? true : false;
    const { error } = await academicService.classes.toggleActive(item.id, next);
    if (error) { addToast(error, 'error'); return; }
    const updated = items.map(i => i.id === item.id ? { ...i, isActive: next } : i);
    setItems(updated);
    setClasses(updated);
    addToast(`"${item.name}" ${next ? 'activated' : 'deactivated'}.`, 'info');
  };

  const sortIcon = (field: 'name' | 'priority') =>
    sortField === field ? (sortAsc ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />) : null;

  const toggleSort = (field: 'name' | 'priority') => {
    if (sortField === field) setSortAsc(!sortAsc);
    else { setSortField(field); setSortAsc(true); }
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-black text-slate-900 dark:text-white">Academic Standards</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {filtered.length} standard{filtered.length !== 1 ? 's' : ''} — e.g. Class 6, Class 10, NEET, B.Pharm
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search standards..."
              className="pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 w-44"
            />
          </div>
          <PermissionGuard permission="academic:write">
            <Button variant="primary" size="sm" onClick={openCreate} id="create-standard-btn">
              <Plus className="w-3.5 h-3.5 mr-1.5" />Add Standard
            </Button>
          </PermissionGuard>
          <button onClick={load} className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-slate-200/60 dark:border-slate-800/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-slate-50/80 dark:bg-slate-900/80">
              <tr>
                <th className="text-left px-4 py-3 font-black text-slate-500 uppercase tracking-wider w-6"><GripVertical className="w-3.5 h-3.5" /></th>
                <button onClick={() => toggleSort('name')} className="flex items-center gap-1">
                  <th className="text-left px-4 py-3 font-black text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-700 dark:hover:text-slate-300 flex items-center gap-1">
                    Name {sortIcon('name')}
                  </th>
                </button>
                <th className="text-left px-4 py-3 font-black text-slate-500 uppercase tracking-wider">Slug / ID</th>
                <th className="text-left px-4 py-3 font-black text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-700 dark:hover:text-slate-300" onClick={() => toggleSort('priority')}>
                  <span className="flex items-center gap-1">Priority {sortIcon('priority')}</span>
                </th>
                <th className="text-left px-4 py-3 font-black text-slate-500 uppercase tracking-wider">Status</th>
                <th className="text-right px-4 py-3 font-black text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-slate-400 text-xs">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6}><EmptyTable label="Standard" onAdd={openCreate} /></td></tr>
              ) : filtered.map(item => (
                <tr key={item.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-4 py-3 text-slate-300 dark:text-slate-700"><GripVertical className="w-3.5 h-3.5" /></td>
                  <td className="px-4 py-3 font-bold text-slate-800 dark:text-slate-200">{item.name}</td>
                  <td className="px-4 py-3 font-mono text-slate-500 text-[10px]">{item.slug}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{item.priority}</td>
                  <td className="px-4 py-3"><StatusBadge isActive={item.isActive} /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      <PermissionGuard permission="academic:write">
                        <button
                          onClick={() => handleToggle(item)}
                          title={item.isActive !== false ? 'Deactivate' : 'Activate'}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-all"
                        >
                          {item.isActive !== false
                            ? <ToggleRight className="w-4 h-4 text-emerald-500" />
                            : <ToggleLeft className="w-4 h-4" />
                          }
                        </button>
                        <button
                          onClick={() => openEdit(item)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-all"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                      </PermissionGuard>
                      <PermissionGuard permission="academic:delete">
                        <button
                          onClick={() => setDeleteItem(item)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all"
                        >
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

      {/* Create / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editItem ? 'Edit Academic Standard' : 'Create Academic Standard'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Standard Name *"
            value={formName}
            onChange={e => {
              setFormName(e.target.value);
              if (!editItem) setFormSlug(generateSlug(e.target.value));
            }}
            placeholder="e.g. Class 10, NEET, B.Pharm"
            required
          />
          <Input
            label="Slug / ID"
            value={formSlug}
            onChange={e => setFormSlug(e.target.value)}
            placeholder="e.g. class-10, neet"
            helperText="Used as unique identifier. Auto-generated from name."
          />
          <Input
            label="Priority (display order)"
            type="number"
            value={formPriority}
            onChange={e => setFormPriority(e.target.value)}
            min="0"
            helperText="Lower number = shown first."
          />
          <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-700">
            <div>
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Active</p>
              <p className="text-[10px] text-slate-400">Inactive standards are hidden from students.</p>
            </div>
            <button
              type="button"
              onClick={() => setFormActive(!formActive)}
              className="transition-all"
            >
              {formActive
                ? <ToggleRight className="w-6 h-6 text-emerald-500" />
                : <ToggleLeft className="w-6 h-6 text-slate-400" />
              }
            </button>
          </div>
          {formError && (
            <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1.5">
              <X className="w-3.5 h-3.5" />{formError}
            </p>
          )}
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="ghost" size="sm" type="button" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button variant="primary" size="sm" type="submit" isLoading={formLoading}>
              {editItem ? 'Save Changes' : 'Create Standard'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={!!deleteItem}
        onClose={() => setDeleteItem(null)}
        onConfirm={handleDelete}
        loading={deleteLoading}
        title="Delete Academic Standard"
        message={`Are you sure you want to permanently delete "${deleteItem?.name}"? This will also delete all associated Subjects and Chapters. This action cannot be undone.`}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  TAB 2 — Subjects
// ─────────────────────────────────────────────────────────────────────────────

const SUBJECT_ICONS = ['📚', '🔬', '🧮', '🌍', '⚗️', '🧬', '📐', '📖', '🎨', '🏛️', '💊', '🩺', '🧠', '⚙️', '💻'];

function SubjectsPanel() {
  const { classes, subjects, setSubjects, user, addToast } = useApp();
  const [items, setItems] = useState<AcademicSubject[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterClassId, setFilterClassId] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<AcademicSubject | null>(null);
  const [deleteItem, setDeleteItem] = useState<AcademicSubject | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [formClassId, setFormClassId] = useState('');
  const [formName, setFormName] = useState('');
  const [formIcon, setFormIcon] = useState('📚');
  const [formDesc, setFormDesc] = useState('');
  const [formOrder, setFormOrder] = useState('0');
  const [formActive, setFormActive] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await academicService.subjects.list();
    if (error) addToast(error, 'error');
    else setItems(data ?? []);
    setLoading(false);
  }, [addToast]);

  useEffect(() => { load(); }, [load]);

  const filtered = items.filter(i => {
    const matchSearch = i.name.toLowerCase().includes(search.toLowerCase());
    const matchClass = !filterClassId || i.classId === filterClassId;
    return matchSearch && matchClass;
  });

  const openCreate = () => {
    setEditItem(null);
    setFormClassId(classes[0]?.id ?? '');
    setFormName(''); setFormIcon('📚'); setFormDesc('');
    setFormOrder('0'); setFormActive(true); setFormError('');
    setModalOpen(true);
  };

  const openEdit = (item: AcademicSubject) => {
    setEditItem(item);
    setFormClassId(item.classId); setFormName(item.name);
    setFormIcon(item.icon || '📚'); setFormDesc(item.description);
    setFormOrder(String(item.displayOrder ?? 0)); setFormActive(item.isActive !== false); setFormError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) { setFormError('Name is required.'); return; }
    if (!formClassId) { setFormError('Please select an Academic Standard.'); return; }
    setFormLoading(true); setFormError('');

    if (editItem) {
      const { error } = await academicService.subjects.update(editItem.id, {
        classId: formClassId, name: formName.trim(), icon: formIcon,
        description: formDesc.trim(), displayOrder: Number(formOrder), isActive: formActive,
      }, user?.id);
      if (error) { setFormError(error); setFormLoading(false); return; }
      addToast(`"${formName}" updated.`, 'success');
    } else {
      const { error } = await academicService.subjects.create({
        classId: formClassId, name: formName.trim(), icon: formIcon,
        description: formDesc.trim(), displayOrder: Number(formOrder), isActive: formActive,
      }, user?.id);
      if (error) { setFormError(error); setFormLoading(false); return; }
      addToast(`"${formName}" created.`, 'success');
    }

    await load();
    const { data: fresh } = await academicService.subjects.list();
    if (fresh) setSubjects(fresh);
    setFormLoading(false);
    setModalOpen(false);
  };

  const handleDelete = async () => {
    if (!deleteItem) return;
    setDeleteLoading(true);
    const { error } = await academicService.subjects.delete(deleteItem.id);
    if (error) { addToast(error, 'error'); }
    else {
      addToast(`"${deleteItem.name}" deleted.`, 'success');
      const updated = items.filter(i => i.id !== deleteItem.id);
      setItems(updated);
      setSubjects(updated);
    }
    setDeleteLoading(false);
    setDeleteItem(null);
  };

  const handleToggle = async (item: AcademicSubject) => {
    const next = item.isActive === false;
    const { error } = await academicService.subjects.toggleActive(item.id, next, user?.id);
    if (error) { addToast(error, 'error'); return; }
    const updated = items.map(i => i.id === item.id ? { ...i, isActive: next } : i);
    setItems(updated); setSubjects(updated);
    addToast(`"${item.name}" ${next ? 'activated' : 'deactivated'}.`, 'info');
  };

  const getClassName = (classId: string) => classes.find(c => c.id === classId)?.name ?? classId;

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-black text-slate-900 dark:text-white">Subjects</h3>
          <p className="text-xs text-slate-400 mt-0.5">{filtered.length} subject{filtered.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search subjects..."
              className="pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 w-40" />
          </div>
          <select value={filterClassId} onChange={e => setFilterClassId(e.target.value)}
            className="py-2 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/40">
            <option value="">All Standards</option>
            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <PermissionGuard permission="academic:write">
            <Button variant="primary" size="sm" onClick={openCreate} id="create-subject-btn">
              <Plus className="w-3.5 h-3.5 mr-1.5" />Add Subject
            </Button>
          </PermissionGuard>
          <button onClick={load} className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200/60 dark:border-slate-800/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-slate-50/80 dark:bg-slate-900/80">
              <tr>
                <th className="text-left px-4 py-3 font-black text-slate-500 uppercase tracking-wider">Icon</th>
                <th className="text-left px-4 py-3 font-black text-slate-500 uppercase tracking-wider">Subject</th>
                <th className="text-left px-4 py-3 font-black text-slate-500 uppercase tracking-wider">Standard</th>
                <th className="text-left px-4 py-3 font-black text-slate-500 uppercase tracking-wider">Description</th>
                <th className="text-left px-4 py-3 font-black text-slate-500 uppercase tracking-wider">Order</th>
                <th className="text-left px-4 py-3 font-black text-slate-500 uppercase tracking-wider">Status</th>
                <th className="text-right px-4 py-3 font-black text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {loading ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-slate-400">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7}><EmptyTable label="Subject" onAdd={openCreate} /></td></tr>
              ) : filtered.map(item => (
                <tr key={item.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-4 py-3 text-xl">{item.icon}</td>
                  <td className="px-4 py-3 font-bold text-slate-800 dark:text-slate-200">{item.name}</td>
                  <td className="px-4 py-3">
                    <Badge variant="info" size="sm">{getClassName(item.classId)}</Badge>
                  </td>
                  <td className="px-4 py-3 text-slate-500 max-w-xs truncate">{item.description}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{item.displayOrder ?? 0}</td>
                  <td className="px-4 py-3"><StatusBadge isActive={item.isActive} /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      <PermissionGuard permission="academic:write">
                        <button onClick={() => handleToggle(item)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-all">
                          {item.isActive !== false ? <ToggleRight className="w-4 h-4 text-emerald-500" /> : <ToggleLeft className="w-4 h-4" />}
                        </button>
                        <button onClick={() => openEdit(item)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-all">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                      </PermissionGuard>
                      <PermissionGuard permission="academic:delete">
                        <button onClick={() => setDeleteItem(item)}
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

      {/* Create / Edit Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}
        title={editItem ? 'Edit Subject' : 'Create Subject'} size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Academic Standard *</label>
            <select value={formClassId} onChange={e => setFormClassId(e.target.value)}
              className="w-full py-2.5 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/40">
              <option value="">Select a standard...</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <Input label="Subject Name *" value={formName} onChange={e => setFormName(e.target.value)} placeholder="e.g. Physics, Mathematics, Biology" required />
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Icon</label>
            <div className="flex flex-wrap gap-2">
              {SUBJECT_ICONS.map(ic => (
                <button key={ic} type="button" onClick={() => setFormIcon(ic)}
                  className={`text-xl p-1.5 rounded-xl transition-all ${formIcon === ic ? 'bg-indigo-100 dark:bg-indigo-950/40 ring-2 ring-indigo-500' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
                  {ic}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Description</label>
            <textarea value={formDesc} onChange={e => setFormDesc(e.target.value)} rows={2}
              placeholder="Brief subject description..."
              className="w-full py-2.5 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 resize-none" />
          </div>
          <Input label="Display Order" type="number" value={formOrder} onChange={e => setFormOrder(e.target.value)} min="0" helperText="Lower = shown first within standard." />
          <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-700">
            <div>
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Active</p>
              <p className="text-[10px] text-slate-400">Inactive subjects are hidden from students.</p>
            </div>
            <button type="button" onClick={() => setFormActive(!formActive)}>
              {formActive ? <ToggleRight className="w-6 h-6 text-emerald-500" /> : <ToggleLeft className="w-6 h-6 text-slate-400" />}
            </button>
          </div>
          {formError && <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1.5"><X className="w-3.5 h-3.5" />{formError}</p>}
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="ghost" size="sm" type="button" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button variant="primary" size="sm" type="submit" isLoading={formLoading}>
              {editItem ? 'Save Changes' : 'Create Subject'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={!!deleteItem} onClose={() => setDeleteItem(null)} onConfirm={handleDelete}
        loading={deleteLoading} title="Delete Subject"
        message={`Delete "${deleteItem?.name}"? All associated Chapters will also be deleted. This cannot be undone.`} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  TAB 3 — Chapters
// ─────────────────────────────────────────────────────────────────────────────

function ChaptersPanel() {
  const { classes, subjects, chapters: ctxChapters, setChapters, user, addToast } = useApp();
  const [items, setItems] = useState<AcademicChapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterSubjectId, setFilterSubjectId] = useState('');
  const [filterClassId, setFilterClassId] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<AcademicChapter | null>(null);
  const [deleteItem, setDeleteItem] = useState<AcademicChapter | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [formSubjectId, setFormSubjectId] = useState('');
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formOrder, setFormOrder] = useState('0');
  const [formActive, setFormActive] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await academicService.chapters.list();
    if (error) addToast(error, 'error');
    else setItems(data ?? []);
    setLoading(false);
  }, [addToast]);

  useEffect(() => { load(); }, [load]);

  const filteredSubjects = filterClassId ? subjects.filter(s => s.classId === filterClassId) : subjects;

  const filtered = items.filter(i => {
    const matchSearch = i.name.toLowerCase().includes(search.toLowerCase());
    const matchSubject = !filterSubjectId || i.subjectId === filterSubjectId;
    const matchClass = !filterClassId || subjects.find(s => s.id === i.subjectId)?.classId === filterClassId;
    return matchSearch && matchSubject && matchClass;
  });

  const openCreate = () => {
    setEditItem(null);
    setFormSubjectId(subjects[0]?.id ?? '');
    setFormName(''); setFormDesc(''); setFormOrder('0'); setFormActive(true); setFormError('');
    setModalOpen(true);
  };

  const openEdit = (item: AcademicChapter) => {
    setEditItem(item);
    setFormSubjectId(item.subjectId); setFormName(item.name);
    setFormDesc(item.description); setFormOrder(String(item.orderIndex));
    setFormActive(item.isActive !== false); setFormError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) { setFormError('Name is required.'); return; }
    if (!formSubjectId) { setFormError('Please select a subject.'); return; }
    setFormLoading(true); setFormError('');

    if (editItem) {
      const { error } = await academicService.chapters.update(editItem.id, {
        subjectId: formSubjectId, name: formName.trim(), description: formDesc.trim(),
        orderIndex: Number(formOrder), isActive: formActive,
      }, user?.id);
      if (error) { setFormError(error); setFormLoading(false); return; }
      addToast(`"${formName}" updated.`, 'success');
    } else {
      const { error } = await academicService.chapters.create({
        subjectId: formSubjectId, name: formName.trim(), description: formDesc.trim(),
        orderIndex: Number(formOrder), isActive: formActive,
      }, user?.id);
      if (error) { setFormError(error); setFormLoading(false); return; }
      addToast(`"${formName}" created.`, 'success');
    }

    await load();
    const { data: fresh } = await academicService.chapters.list();
    if (fresh) setChapters(fresh);
    setFormLoading(false);
    setModalOpen(false);
  };

  const handleDelete = async () => {
    if (!deleteItem) return;
    setDeleteLoading(true);
    const { error } = await academicService.chapters.delete(deleteItem.id);
    if (error) { addToast(error, 'error'); }
    else {
      addToast(`"${deleteItem.name}" deleted.`, 'success');
      const updated = items.filter(i => i.id !== deleteItem.id);
      setItems(updated); setChapters(updated);
    }
    setDeleteLoading(false);
    setDeleteItem(null);
  };

  const handleToggle = async (item: AcademicChapter) => {
    const next = item.isActive === false;
    const { error } = await academicService.chapters.toggleActive(item.id, next, user?.id);
    if (error) { addToast(error, 'error'); return; }
    const updated = items.map(i => i.id === item.id ? { ...i, isActive: next } : i);
    setItems(updated); setChapters(updated);
    addToast(`"${item.name}" ${next ? 'activated' : 'deactivated'}.`, 'info');
  };

  const getSubjectName = (id: string) => subjects.find(s => s.id === id)?.name ?? id;

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-black text-slate-900 dark:text-white">Chapters</h3>
          <p className="text-xs text-slate-400 mt-0.5">{filtered.length} chapter{filtered.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search chapters..."
              className="pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 w-36" />
          </div>
          <select value={filterClassId} onChange={e => { setFilterClassId(e.target.value); setFilterSubjectId(''); }}
            className="py-2 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/40">
            <option value="">All Standards</option>
            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select value={filterSubjectId} onChange={e => setFilterSubjectId(e.target.value)}
            className="py-2 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/40">
            <option value="">All Subjects</option>
            {filteredSubjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <PermissionGuard permission="academic:write">
            <Button variant="primary" size="sm" onClick={openCreate} id="create-chapter-btn">
              <Plus className="w-3.5 h-3.5 mr-1.5" />Add Chapter
            </Button>
          </PermissionGuard>
          <button onClick={load} className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200/60 dark:border-slate-800/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-slate-50/80 dark:bg-slate-900/80">
              <tr>
                <th className="text-left px-4 py-3 font-black text-slate-500 uppercase tracking-wider">Chapter</th>
                <th className="text-left px-4 py-3 font-black text-slate-500 uppercase tracking-wider">Subject</th>
                <th className="text-left px-4 py-3 font-black text-slate-500 uppercase tracking-wider">Description</th>
                <th className="text-left px-4 py-3 font-black text-slate-500 uppercase tracking-wider">Order</th>
                <th className="text-left px-4 py-3 font-black text-slate-500 uppercase tracking-wider">Status</th>
                <th className="text-right px-4 py-3 font-black text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-slate-400">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6}><EmptyTable label="Chapter" onAdd={openCreate} /></td></tr>
              ) : filtered.map(item => (
                <tr key={item.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-4 py-3 font-bold text-slate-800 dark:text-slate-200">{item.name}</td>
                  <td className="px-4 py-3"><Badge variant="info" size="sm">{getSubjectName(item.subjectId)}</Badge></td>
                  <td className="px-4 py-3 text-slate-500 max-w-xs truncate">{item.description}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{item.orderIndex}</td>
                  <td className="px-4 py-3"><StatusBadge isActive={item.isActive} /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      <PermissionGuard permission="academic:write">
                        <button onClick={() => handleToggle(item)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-all">
                          {item.isActive !== false ? <ToggleRight className="w-4 h-4 text-emerald-500" /> : <ToggleLeft className="w-4 h-4" />}
                        </button>
                        <button onClick={() => openEdit(item)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-all">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                      </PermissionGuard>
                      <PermissionGuard permission="academic:delete">
                        <button onClick={() => setDeleteItem(item)}
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

      {/* Create / Edit Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}
        title={editItem ? 'Edit Chapter' : 'Create Chapter'} size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Subject *</label>
            <select value={formSubjectId} onChange={e => setFormSubjectId(e.target.value)}
              className="w-full py-2.5 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/40">
              <option value="">Select a subject...</option>
              {subjects.map(s => <option key={s.id} value={s.id}>{s.name} ({classes.find(c => c.id === s.classId)?.name ?? ''})</option>)}
            </select>
          </div>
          <Input label="Chapter Name *" value={formName} onChange={e => setFormName(e.target.value)} placeholder="e.g. Chapter 1: Motion, Organic Chemistry..." required />
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Description</label>
            <textarea value={formDesc} onChange={e => setFormDesc(e.target.value)} rows={2}
              placeholder="Brief chapter overview..."
              className="w-full py-2.5 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 resize-none" />
          </div>
          <Input label="Chapter Order (within subject)" type="number" value={formOrder} onChange={e => setFormOrder(e.target.value)} min="0" helperText="Lower = shown first in subject." />
          <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-700">
            <div>
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Active</p>
              <p className="text-[10px] text-slate-400">Inactive chapters are hidden from students.</p>
            </div>
            <button type="button" onClick={() => setFormActive(!formActive)}>
              {formActive ? <ToggleRight className="w-6 h-6 text-emerald-500" /> : <ToggleLeft className="w-6 h-6 text-slate-400" />}
            </button>
          </div>
          {formError && <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1.5"><X className="w-3.5 h-3.5" />{formError}</p>}
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="ghost" size="sm" type="button" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button variant="primary" size="sm" type="submit" isLoading={formLoading}>
              {editItem ? 'Save Changes' : 'Create Chapter'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={!!deleteItem} onClose={() => setDeleteItem(null)} onConfirm={handleDelete}
        loading={deleteLoading} title="Delete Chapter"
        message={`Delete "${deleteItem?.name}"? This cannot be undone.`} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  Main: AcademicManagement (Tab Container)
// ─────────────────────────────────────────────────────────────────────────────

type AcademicTab = 'standards' | 'subjects' | 'chapters';

export default function AcademicManagement({ initialTab }: { initialTab?: AcademicTab }) {
  const [activeTab, setActiveTab] = useState<AcademicTab>(initialTab ?? 'standards');

  const tabs: { id: AcademicTab; label: string; icon: React.ReactNode }[] = [
    { id: 'standards', label: 'Academic Standards', icon: <Layers className="w-3.5 h-3.5" /> },
    { id: 'subjects',  label: 'Subjects',           icon: <BookOpen className="w-3.5 h-3.5" /> },
    { id: 'chapters',  label: 'Chapters',            icon: <ClipboardList className="w-3.5 h-3.5" /> },
  ];

  return (
    <PermissionGuard permission="academic:read" fullPage>
      <div className="space-y-6 animate-fade-in">

        {/* Header */}
        <div>
          <h2 className="text-base font-black text-slate-900 dark:text-white">Academic Management</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage academic standards, subjects, and chapters. Changes sync automatically to the Student Portal.
          </p>
        </div>

        {/* Tab bar */}
        <div className="flex items-center gap-1 p-1 rounded-2xl bg-slate-100/80 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/50 w-fit">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              id={`academic-tab-${tab.id}`}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
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

        {/* Panel */}
        {activeTab === 'standards' && <StandardsPanel />}
        {activeTab === 'subjects' && <SubjectsPanel />}
        {activeTab === 'chapters' && <ChaptersPanel />}
      </div>
    </PermissionGuard>
  );
}
