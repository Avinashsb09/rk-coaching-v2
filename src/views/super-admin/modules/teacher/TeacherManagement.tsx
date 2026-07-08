/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Faculty & Teaching Management Module — Super Admin Console
 * ─────────────────────────────────────────────────────────────────────────────
 * Enables mapping of teachers to classes/subjects/chapters, editing of qualifications,
 * and listing of statistics for notes, videos, quizzes, and papers created.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../../../../context/AppContext';
import { teacherService } from '../../../../services/teacher.service';
import { userService } from '../../../../services/user.service';
import { PermissionGuard } from '../../../../components/shared/PermissionGuard';
import { Modal } from '../../../../components/ui/Modal';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import { Badge } from '../../../../components/ui/Badge';
import type { UserProfile, TeacherAssignment } from '../../../../types';
import {
  GraduationCap, Search, Plus, Trash2, BookOpen, Layers,
  ClipboardList, Users, ShieldAlert, Award, FileText,
  PlayCircle, BrainCircuit, RefreshCw, ChevronRight, X, ArrowLeft, Loader2
} from 'lucide-react';

export default function TeacherManagement() {
  const { classes, subjects, chapters, user: currentUser, addToast } = useApp();

  // Roster Directory states
  const [teachers, setTeachers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Selected teacher detail view states
  const [activeTeacher, setActiveTeacher] = useState<UserProfile | null>(null);
  const [activeAssignments, setActiveAssignments] = useState<TeacherAssignment[]>([]);
  const [stats, setStats] = useState<{
    notesCount: number;
    videosCount: number;
    pyqsCount: number;
    quizzesCount: number;
    assignmentsCount: number;
  } | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  // Assignment Modal states
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [selectedChapterId, setSelectedChapterId] = useState('');
  const [formIsPrimary, setFormIsPrimary] = useState(true);
  const [formStartDate, setFormStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [formEndDate, setFormEndDate] = useState('');
  const [assignLoading, setAssignLoading] = useState(false);

  // Load teachers from profiles list
  const loadTeachers = useCallback(async () => {
    setLoading(true);
    const { data, error } = await userService.listUsers({ role: 'teacher', isActive: true }, search);
    if (error) {
      addToast(error, 'error');
    } else if (data) {
      setTeachers(data.users);
    }
    setLoading(false);
  }, [search, addToast]);

  useEffect(() => {
    loadTeachers();
  }, [loadTeachers]);

  // Load active teacher assignments and content stats
  const loadTeacherDetails = async (teacher: UserProfile) => {
    setActiveTeacher(teacher);
    setStatsLoading(true);
    
    const [assignmentsRes, statsRes] = await Promise.all([
      teacherService.listTeacherAssignments(teacher.id),
      teacherService.getTeacherStats(teacher.id)
    ]);

    if (assignmentsRes.data) {
      setActiveAssignments(assignmentsRes.data);
    }
    if (statsRes.data) {
      setStats(statsRes.data);
    }
    setStatsLoading(false);
  };

  // Add teaching assignment mapping
  const handleAddAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTeacher || !selectedClassId) {
      addToast('Class Standard is required.', 'error');
      return;
    }
    setAssignLoading(true);

    const { data, error } = await teacherService.assignTeacher(
      activeTeacher.id,
      selectedClassId,
      selectedSubjectId || null,
      selectedChapterId || null,
      formIsPrimary,
      formStartDate,
      formEndDate || null,
      currentUser?.id
    );

    if (error) {
      addToast(error, 'error');
    } else if (data) {
      addToast('Academic scope assigned to instructor successfully.', 'success');
      setAssignModalOpen(false);
      
      // Reload stats & assignments
      const assignmentsRes = await teacherService.listTeacherAssignments(activeTeacher.id);
      if (assignmentsRes.data) setActiveAssignments(assignmentsRes.data);
      
      const statsRes = await teacherService.getTeacherStats(activeTeacher.id);
      if (statsRes.data) setStats(statsRes.data);
    }
    setAssignLoading(false);
  };

  // Deactivate teaching assignment (maintains history)
  const handleDeactivateAssignment = async (assignmentId: string) => {
    if (!activeTeacher || !window.confirm('Deactivate this teaching assignment? Historical records will be preserved.')) return;

    const { error } = await teacherService.updateAssignmentStatus(assignmentId, 'inactive', currentUser?.id);
    if (error) {
      addToast(error, 'error');
    } else {
      addToast('Assignment deactivated (historical log preserved).', 'info');
      
      // Reload stats & assignments
      const assignmentsRes = await teacherService.listTeacherAssignments(activeTeacher.id);
      if (assignmentsRes.data) setActiveAssignments(assignmentsRes.data);

      const statsRes = await teacherService.getTeacherStats(activeTeacher.id);
      if (statsRes.data) setStats(statsRes.data);
    }
  };

  // Form helper: filtered lists
  const filteredSubjects = selectedClassId ? subjects.filter(s => s.classId === selectedClassId) : [];
  const filteredChapters = selectedSubjectId ? chapters.filter(c => c.subjectId === selectedSubjectId) : [];

  const getClassName = (id: string) => classes.find(c => c.id === id)?.name ?? id;
  const getSubjectName = (id: string) => subjects.find(s => s.id === id)?.name ?? id;
  const getChapterName = (id: string) => chapters.find(c => c.id === id)?.name ?? id;

  const openAssignModal = () => {
    setSelectedClassId('');
    setSelectedSubjectId('');
    setSelectedChapterId('');
    setAssignModalOpen(true);
  };

  if (activeTeacher) {
    return (
      <div className="space-y-6 animate-fade-in text-left">
        {/* Back Button & Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => { setActiveTeacher(null); setStats(null); }}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-indigo-500" />
              FACULTY PROFILE: {activeTeacher.fullName}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">{activeTeacher.email}</p>
          </div>
        </div>

        {/* Profile Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Column 1: Info Card */}
          <div className="bg-white dark:bg-slate-950/40 p-5 rounded-3xl border border-slate-200/50 dark:border-slate-800/40 space-y-4">
            <div className="flex flex-col items-center justify-center text-center pb-4 border-b border-slate-100 dark:border-slate-800">
              <img
                src={activeTeacher.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(activeTeacher.fullName)}`}
                alt=""
                className="w-20 h-20 rounded-full border border-slate-200 dark:border-slate-800 object-cover shadow-md mb-3"
              />
              <h3 className="text-base font-black text-slate-800 dark:text-slate-100">{activeTeacher.fullName}</h3>
              <p className="text-[10px] text-slate-400 font-mono select-all mt-0.5">{activeTeacher.id}</p>
              <div className="mt-2.5 flex items-center gap-2">
                <Badge variant={activeTeacher.status === 'verified' ? 'success' : 'warning'}>
                  {activeTeacher.status?.toUpperCase() || 'ACTIVE'}
                </Badge>
                {activeTeacher.isPremium && <Badge variant="warning">PREMIUM BIND</Badge>}
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Contact Details</p>
                <p className="font-semibold text-slate-700 dark:text-slate-300">{activeTeacher.email}</p>
                {activeTeacher.phone && <p className="text-slate-500 font-mono mt-0.5">{activeTeacher.phone}</p>}
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Date Registered</p>
                <p className="font-semibold text-slate-700 dark:text-slate-300">
                  {activeTeacher.createdAt ? new Date(activeTeacher.createdAt).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Column 2: Assigned scopes list */}
          <div className="lg:col-span-2 space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white">Teaching Assignments</h3>
                <p className="text-[10px] text-slate-400">Class Standards, subjects, and chapters mapped to this instructor.</p>
              </div>
              <PermissionGuard permission="users:write">
                <Button variant="primary" size="sm" onClick={openAssignModal}>
                  <Plus className="w-3.5 h-3.5 mr-1" />Assign Scope
                </Button>
              </PermissionGuard>
            </div>

            {/* List */}
            {statsLoading ? (
              <div className="py-12 text-center text-slate-400">
                <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mx-auto mb-2" />
                Aggregating academic data metrics...
              </div>
            ) : activeAssignments.length === 0 ? (
              <div className="py-16 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl text-slate-400 bg-slate-50/20 dark:bg-slate-950/20 text-xs">
                No teaching assignment has been created for this faculty member. Click "Assign Scope" to map standard parameters.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {activeAssignments.map(a => (
                  <div key={a.id} className="p-4 bg-white dark:bg-slate-900/40 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-start justify-between gap-3 shadow-xs">
                    <div className="space-y-2 text-left">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <Badge variant="info" size="sm" icon={<Layers className="w-3 h-3" />}>
                          {getClassName(a.classId)}
                        </Badge>
                        {a.subjectId && (
                          <Badge variant="success" size="sm" icon={<BookOpen className="w-3 h-3" />}>
                            {getSubjectName(a.subjectId)}
                          </Badge>
                        )}
                        {a.status === 'inactive' ? (
                          <Badge variant="danger" size="sm">INACTIVE</Badge>
                        ) : (
                          <Badge variant="success" size="sm">ACTIVE</Badge>
                        )}
                        {a.isPrimary ? (
                          <Badge variant="primary" size="sm">PRIMARY</Badge>
                        ) : (
                          <Badge variant="secondary" size="sm">CO-TEACHER</Badge>
                        )}
                      </div>
                      {a.chapterId ? (
                        <p className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                          <ClipboardList className="w-3.5 h-3.5 text-indigo-500" />
                          Chapter: {getChapterName(a.chapterId)}
                        </p>
                      ) : a.subjectId ? (
                        <p className="text-[10px] text-slate-400 font-medium">All Chapters in subject</p>
                      ) : (
                        <p className="text-[10px] text-slate-400 font-medium">All Subjects in standard</p>
                      )}
                      <p className="text-[9px] text-slate-400 font-mono">
                        Period: {a.startDate} to {a.endDate || 'Present'}
                      </p>
                    </div>
                    {a.status !== 'inactive' && (
                      <PermissionGuard permission="users:write">
                        <button
                          onClick={() => handleDeactivateAssignment(a.id)}
                          title="Deactivate Assignment (De-active history)"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all shrink-0"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </PermissionGuard>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Statistics */}
            {stats && !statsLoading && (
              <div className="space-y-3 pt-3">
                <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">Content Creation Stats</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl text-center shadow-xs">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1 flex items-center justify-center gap-1">
                      <FileText className="w-3.5 h-3.5 text-indigo-500" /> Notes
                    </p>
                    <p className="text-lg font-black text-slate-800 dark:text-slate-100">{stats.notesCount} uploads</p>
                  </div>

                  <div className="p-3 bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl text-center shadow-xs">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1 flex items-center justify-center gap-1">
                      <PlayCircle className="w-3.5 h-3.5 text-emerald-500" /> Lectures
                    </p>
                    <p className="text-lg font-black text-slate-800 dark:text-slate-100">{stats.videosCount} videos</p>
                  </div>

                  <div className="p-3 bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl text-center shadow-xs">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1 flex items-center justify-center gap-1">
                      <Award className="w-3.5 h-3.5 text-amber-500" /> PYQs
                    </p>
                    <p className="text-lg font-black text-slate-800 dark:text-slate-100">{stats.pyqsCount} papers</p>
                  </div>

                  <div className="p-3 bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl text-center shadow-xs">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1 flex items-center justify-center gap-1">
                      <BrainCircuit className="w-3.5 h-3.5 text-violet-500" /> Quizzes
                    </p>
                    <p className="text-lg font-black text-slate-800 dark:text-slate-100">{stats.quizzesCount} sets</p>
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>

        {/* ASSIGNMENT CREATOR MODAL */}
        <Modal isOpen={assignModalOpen} onClose={() => setAssignModalOpen(false)} title="Create Teaching Assignment Binds" size="md">
          <form onSubmit={handleAddAssignment} className="space-y-4">
            <div className="bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-[10px] text-slate-400 leading-relaxed">
              Mapped teachers gain dashboard permissions to upload, review, and modify syllabus content matching the designated academic scope parameters.
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Academic Standard *</label>
              <select
                value={selectedClassId}
                onChange={e => { setSelectedClassId(e.target.value); setSelectedSubjectId(''); setSelectedChapterId(''); }}
                className="w-full py-2.5 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none"
                required
              >
                <option value="">Select standard...</option>
                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Subject (Optional)</label>
              <select
                value={selectedSubjectId}
                onChange={e => { setSelectedSubjectId(e.target.value); setSelectedChapterId(''); }}
                className="w-full py-2.5 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none"
                disabled={!selectedClassId}
              >
                <option value="">All Subjects in Class</option>
                {filteredSubjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Chapter (Optional)</label>
              <select
                value={selectedChapterId}
                onChange={e => setSelectedChapterId(e.target.value)}
                className="w-full py-2.5 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none"
                disabled={!selectedSubjectId}
              >
                <option value="">All Chapters in Subject</option>
                {filteredChapters.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Start Date *</label>
                <input
                  type="date"
                  value={formStartDate}
                  onChange={e => setFormStartDate(e.target.value)}
                  className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">End Date (Optional)</label>
                <input
                  type="date"
                  value={formEndDate}
                  onChange={e => setFormEndDate(e.target.value)}
                  className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isPrimaryCheckbox"
                checked={formIsPrimary}
                onChange={e => setFormIsPrimary(e.target.checked)}
                className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
              />
              <label htmlFor="isPrimaryCheckbox" className="text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                Primary Instructor (Secondary/co-teachers uncheck this)
              </label>
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <Button variant="ghost" size="sm" type="button" onClick={() => setAssignModalOpen(false)}>Cancel</Button>
              <Button variant="primary" size="sm" type="submit" isLoading={assignLoading}>Create Assignment Binds</Button>
            </div>
          </form>
        </Modal>

      </div>
    );
  }

  return (
    <div className="space-y-5 animate-fade-in text-left">
      
      {/* Title & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-indigo-500" />
            FACULTY & TEACHING MANAGEMENT
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Browse active teaching staff, view stats, and manage class assignments.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search faculty..."
              className="pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 w-44"
            />
          </div>
          <button onClick={loadTeachers} className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 bg-white dark:bg-slate-900 transition-all">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Directory Grid */}
      {loading ? (
        <div className="py-16 text-center text-slate-400">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mx-auto mb-2" />
          Syncing faculty registry files...
        </div>
      ) : teachers.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl text-slate-400 bg-slate-50/20 dark:bg-slate-950/20 text-xs">
          No faculty member accounts found. Go to "User Management" to register teacher role accounts.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teachers.map(item => (
            <div
              key={item.id}
              onClick={() => loadTeacherDetails(item)}
              className="p-5 bg-white dark:bg-slate-950/30 rounded-3xl border border-slate-200/50 dark:border-slate-800/40 hover:border-indigo-500/50 dark:hover:border-indigo-500/30 cursor-pointer shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between space-y-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={item.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(item.fullName)}`}
                    alt=""
                    className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-800 object-cover shrink-0"
                  />
                  <div>
                    <h3 className="font-bold text-slate-800 dark:text-slate-100 line-clamp-1">{item.fullName}</h3>
                    <p className="text-[10px] text-slate-400 font-medium truncate max-w-[140px]">{item.email}</p>
                  </div>
                </div>
                <Badge variant={item.status === 'verified' ? 'success' : 'warning'} className="scale-90">
                  {item.status || 'Active'}
                </Badge>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                <span>View Faculty binds</span>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-500" />
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
