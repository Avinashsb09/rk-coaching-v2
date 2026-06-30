/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Users, 
  FileText, 
  Plus, 
  Video, 
  Trash, 
  Check, 
  BarChart2, 
  BookOpen, 
  Layers, 
  Edit, 
  Eye, 
  ArrowUp, 
  ArrowDown, 
  X, 
  DollarSign, 
  Tag, 
  RefreshCw, 
  Play, 
  Lock, 
  Unlock, 
  Settings, 
  HelpCircle,
  FilePlus,
  FolderPlus
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { uploadToStorage, isSupabaseConfigured } from '../../lib/supabase';

export default function TeacherDashboard() {
  const { 
    addToast,
    classes,
    subjects,
    courses,
    setCourses,
    chapters,
    setChapters,
    lessons,
    setLessons,
    videos,
    setVideos,
    notes,
    setNotes
  } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'courses' | 'syllabus'>('overview');
  
  // Selection states for syllabus builder
  const [selectedCourseId, setSelectedCourseId] = useState<string>(courses[0]?.id || '');
  const [selectedChapterId, setSelectedChapterId] = useState<string>('');

  // Course form states
  const [courseFormOpen, setCourseFormOpen] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [courseTitle, setCourseTitle] = useState('');
  const [courseSubtitle, setCourseSubtitle] = useState('');
  const [courseDescription, setCourseDescription] = useState('');
  const [courseClassId, setCourseClassId] = useState(classes[0]?.id || '');
  const [courseSubjectId, setCourseSubjectId] = useState(subjects[0]?.id || '');
  const [courseThumbnail, setCourseThumbnail] = useState('https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&h=400&q=80');
  const [courseIsPremium, setCourseIsPremium] = useState(false);
  const [coursePrice, setCoursePrice] = useState('499');
  const [courseDiscount, setCourseDiscount] = useState('299');

  // Chapter form states
  const [chapterFormOpen, setChapterFormOpen] = useState(false);
  const [chapterName, setChapterName] = useState('');
  const [chapterDesc, setChapterDesc] = useState('');

  // Lesson form states
  const [lessonFormOpen, setLessonFormOpen] = useState(false);
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonDesc, setLessonDesc] = useState('');
  const [lessonIsPremium, setLessonIsPremium] = useState(false);
  
  // Video and Notes states (embedded in Lesson Creator)
  const [lessonVideoProvider, setLessonVideoProvider] = useState<'youtube' | 'gdrive' | 'vimeo' | 'supabase'>('youtube');
  const [lessonVideoUrl, setLessonVideoUrl] = useState('');
  const [lessonPdfUrl, setLessonPdfUrl] = useState('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf');
  const [lessonPdfTitle, setLessonPdfTitle] = useState('');

  // Quick Analytics state
  const [analyticsFilter, setAnalyticsFilter] = useState<'all' | 'premium' | 'free'>('all');

  // ---- HANDLERS FOR COURSES ----
  const handleOpenCourseForm = (courseId: string | null = null) => {
    if (courseId) {
      const c = courses.find(item => item.id === courseId);
      if (c) {
        setEditingCourseId(courseId);
        setCourseTitle(c.title);
        setCourseSubtitle(c.subtitle);
        setCourseDescription(c.description);
        setCourseClassId(c.classId);
        setCourseSubjectId(c.subjectId);
        setCourseThumbnail(c.thumbnailUrl);
        setCourseIsPremium(c.isPremium);
        setCoursePrice(c.price.toString());
        setCourseDiscount(c.discountPrice ? c.discountPrice.toString() : '');
      }
    } else {
      setEditingCourseId(null);
      setCourseTitle('');
      setCourseSubtitle('');
      setCourseDescription('');
      setCourseClassId(classes[0]?.id || '');
      setCourseSubjectId(subjects[0]?.id || '');
      setCourseThumbnail('https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&h=400&q=80');
      setCourseIsPremium(false);
      setCoursePrice('499');
      setCourseDiscount('299');
    }
    setCourseFormOpen(true);
  };

  const handleSaveCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseTitle || !courseSubtitle) {
      addToast('Please input course title and subtitle', 'error');
      return;
    }

    if (editingCourseId) {
      // Update
      setCourses(prev => prev.map(c => c.id === editingCourseId ? {
        ...c,
        classId: courseClassId,
        subjectId: courseSubjectId,
        title: courseTitle,
        subtitle: courseSubtitle,
        description: courseDescription,
        thumbnailUrl: courseThumbnail,
        isPremium: courseIsPremium,
        price: Number(coursePrice) || 0,
        discountPrice: courseDiscount ? Number(courseDiscount) : undefined
      } : c));
      addToast('Course curriculum metrics updated successfully', 'success');
    } else {
      // Create
      const newId = `course_${Date.now()}`;
      setCourses(prev => [
        ...prev,
        {
          id: newId,
          classId: courseClassId,
          subjectId: courseSubjectId,
          title: courseTitle,
          subtitle: courseSubtitle,
          description: courseDescription,
          thumbnailUrl: courseThumbnail,
          isPremium: courseIsPremium,
          price: Number(coursePrice) || 0,
          discountPrice: courseDiscount ? Number(courseDiscount) : undefined
        }
      ]);
      addToast(`Course "${courseTitle}" created successfully!`, 'success');
      if (!selectedCourseId) setSelectedCourseId(newId);
    }
    setCourseFormOpen(false);
  };

  const handleDeleteCourse = (courseId: string) => {
    if (confirm('Are you sure you want to delete this course and its syllabus?')) {
      setCourses(prev => prev.filter(c => c.id !== courseId));
      addToast('Course deleted from catalog', 'warning');
    }
  };

  const togglePublishCourse = (courseId: string, currentStatus: boolean) => {
    addToast(`Course ${currentStatus ? 'unpublished' : 'published to catalog'}!`, 'success');
  };

  // ---- HANDLERS FOR CHAPTERS ----
  const handleCreateChapter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chapterName) return;

    const newId = `chap_${Date.now()}`;
    setChapters(prev => [
      ...prev,
      {
        id: newId,
        subjectId: courses.find(c => c.id === selectedCourseId)?.subjectId || 's_math_c12',
        name: chapterName,
        description: chapterDesc || 'No summary provided',
        orderIndex: prev.length + 1
      }
    ]);
    setSelectedChapterId(newId);
    setChapterName('');
    setChapterDesc('');
    setChapterFormOpen(false);
    addToast('New chapter node added successfully', 'success');
  };

  const handleDeleteChapter = (chapId: string) => {
    if (confirm('Deleting this chapter will disconnect its lessons. Proceed?')) {
      setChapters(prev => prev.filter(c => c.id !== chapId));
      if (selectedChapterId === chapId) setSelectedChapterId('');
      addToast('Chapter removed', 'warning');
    }
  };

  // ---- HANDLERS FOR LESSONS ----
  const handleOpenLessonForm = (lessId: string | null = null) => {
    if (!selectedCourseId) {
      addToast('Please select a course first', 'error');
      return;
    }
    if (!selectedChapterId) {
      addToast('Please select a chapter folder first', 'error');
      return;
    }

    if (lessId) {
      const l = lessons.find(item => item.id === lessId);
      if (l) {
        setEditingLessonId(lessId);
        setLessonTitle(l.title);
        setLessonDesc(l.description);
        setLessonIsPremium(l.isPremium);

        // Fetch corresponding video / notes
        const v = videos.find(item => item.lessonId === lessId);
        const n = notes.find(item => item.lessonId === lessId);

        setLessonVideoProvider(v?.provider || 'youtube');
        setLessonVideoUrl(v?.videoIdOrUrl || '');
        setLessonPdfUrl(n?.pdfUrl || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf');
        setLessonPdfTitle(n?.title || '');
      }
    } else {
      setEditingLessonId(null);
      setLessonTitle('');
      setLessonDesc('');
      setLessonIsPremium(false);
      setLessonVideoProvider('youtube');
      setLessonVideoUrl('');
      setLessonPdfUrl('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf');
      setLessonPdfTitle('');
    }
    setLessonFormOpen(true);
  };

  const handleSaveLesson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lessonTitle) return;

    const targetLessonId = editingLessonId || `less_${Date.now()}`;

    if (editingLessonId) {
      // Edit Lesson
      setLessons(prev => prev.map(l => l.id === editingLessonId ? {
        ...l,
        title: lessonTitle,
        description: lessonDesc,
        isPremium: lessonIsPremium
      } : l));

      // Update Video
      setVideos(prev => {
        const exists = prev.some(v => v.lessonId === targetLessonId);
        if (exists) {
          return prev.map(v => v.lessonId === targetLessonId ? {
            ...v,
            title: `Lecture: ${lessonTitle}`,
            provider: lessonVideoProvider,
            videoIdOrUrl: lessonVideoUrl
          } : v);
        } else if (lessonVideoUrl) {
          return [...prev, {
            id: `vid_${Date.now()}`,
            lessonId: targetLessonId,
            title: `Lecture: ${lessonTitle}`,
            provider: lessonVideoProvider,
            videoIdOrUrl: lessonVideoUrl,
            durationSeconds: 1200
          }];
        }
        return prev;
      });

      // Update Note
      setNotes(prev => {
        const exists = prev.some(n => n.lessonId === targetLessonId);
        if (exists) {
          return prev.map(n => n.lessonId === targetLessonId ? {
            ...n,
            title: lessonPdfTitle || `Notes for ${lessonTitle}.pdf`,
            pdfUrl: lessonPdfUrl,
            isPremium: lessonIsPremium
          } : n);
        } else if (lessonPdfUrl) {
          return [...prev, {
            id: `note_${Date.now()}`,
            lessonId: targetLessonId,
            title: lessonPdfTitle || `Notes for ${lessonTitle}.pdf`,
            pdfUrl: lessonPdfUrl,
            sizeBytes: 250000,
            isPremium: lessonIsPremium
          }];
        }
        return prev;
      });

      addToast('Lesson materials updated successfully', 'success');
    } else {
      // Create Lesson
      setLessons(prev => [
        ...prev,
        {
          id: targetLessonId,
          chapterId: selectedChapterId,
          courseId: selectedCourseId,
          title: lessonTitle,
          description: lessonDesc,
          orderIndex: prev.length + 1,
          isPremium: lessonIsPremium
        }
      ]);

      // Create Video
      if (lessonVideoUrl) {
        setVideos(prev => [
          ...prev,
          {
            id: `vid_${Date.now()}`,
            lessonId: targetLessonId,
            title: `Lecture: ${lessonTitle}`,
            provider: lessonVideoProvider,
            videoIdOrUrl: lessonVideoUrl,
            durationSeconds: 1500
          }
        ]);
      }

      // Create Note
      if (lessonPdfUrl) {
        setNotes(prev => [
          ...prev,
          {
            id: `note_${Date.now()}`,
            lessonId: targetLessonId,
            title: lessonPdfTitle || `Handwritten Notes: ${lessonTitle}.pdf`,
            pdfUrl: lessonPdfUrl,
            sizeBytes: 310000,
            isPremium: lessonIsPremium
          }
        ]);
      }

      addToast(`Lesson "${lessonTitle}" created with attachments!`, 'success');
    }
    setLessonFormOpen(false);
  };

  const handleDeleteLesson = (lessId: string) => {
    if (confirm('Delete this lesson and all attachments?')) {
      setLessons(prev => prev.filter(l => l.id !== lessId));
      setVideos(prev => prev.filter(v => v.lessonId !== lessId));
      setNotes(prev => prev.filter(n => n.lessonId !== lessId));
      addToast('Lesson materials deleted', 'warning');
    }
  };

  const reorderLesson = (lessId: string, direction: 'up' | 'down') => {
    const courseLessons = lessons.filter(l => l.chapterId === selectedChapterId);
    const index = courseLessons.findIndex(l => l.id === lessId);
    if (index === -1) return;

    if (direction === 'up' && index > 0) {
      const prevLesson = courseLessons[index - 1];
      setLessons(prev => prev.map(l => {
        if (l.id === lessId) return { ...l, orderIndex: prevLesson.orderIndex };
        if (l.id === prevLesson.id) return { ...l, orderIndex: l.orderIndex + 1 };
        return l;
      }));
      addToast('Moved up successfully', 'success');
    } else if (direction === 'down' && index < courseLessons.length - 1) {
      const nextLesson = courseLessons[index + 1];
      setLessons(prev => prev.map(l => {
        if (l.id === lessId) return { ...l, orderIndex: nextLesson.orderIndex };
        if (l.id === nextLesson.id) return { ...l, orderIndex: l.orderIndex - 1 };
        return l;
      }));
      addToast('Moved down successfully', 'success');
    }
  };

  // Helper selectors
  const courseChapters = chapters.filter(chap => {
    const matchingCourse = courses.find(c => c.id === selectedCourseId);
    return matchingCourse ? chap.subjectId === matchingCourse.subjectId : false;
  });

  const activeCourseObj = courses.find(c => c.id === selectedCourseId);

  return (
    <div className="space-y-8 py-4 text-left">
      {/* 1. Header segment */}
      <section className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Settings className="w-6 h-6 text-indigo-500 animate-spin-slow" />
            Teacher Portal & CMS Control
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Build multi-chapter courses, schedule unlisted lectures, publish revision PDFs and audit stats.
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Badge variant="success" className="h-8">Role Claim: Teacher Verified</Badge>
        </div>
      </section>

      {/* 2. TABS NAV */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-1 overflow-x-auto pb-px">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2.5 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'overview'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-950 dark:hover:text-slate-100'
          }`}
        >
          <BarChart2 className="w-4 h-4" />
          Overview Console
        </button>
        <button
          onClick={() => setActiveTab('courses')}
          className={`px-4 py-2.5 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'courses'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-950 dark:hover:text-slate-100'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Course Catalog ({courses.length})
        </button>
        <button
          onClick={() => setActiveTab('syllabus')}
          className={`px-4 py-2.5 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'syllabus'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-950 dark:hover:text-slate-100'
          }`}
        >
          <Layers className="w-4 h-4" />
          Syllabus & Lesson Builder
        </button>
      </div>

      {/* 3. TABS CONTENT */}
      {activeTab === 'overview' && (
        <div className="space-y-8 animate-fade-in">
          {/* STAT CARDS */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card hoverEffect>
              <CardContent className="p-5 flex items-center gap-4">
                <div className="h-11 w-11 rounded-2xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center">
                  <BookOpen className="w-5.5 h-5.5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Courses</p>
                  <p className="text-xl font-black text-slate-900 dark:text-white">{courses.length} Active</p>
                </div>
              </CardContent>
            </Card>

            <Card hoverEffect>
              <CardContent className="p-5 flex items-center gap-4">
                <div className="h-11 w-11 rounded-2xl bg-blue-100 dark:bg-blue-950 text-blue-600 flex items-center justify-center">
                  <Users className="w-5.5 h-5.5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Students</p>
                  <p className="text-xl font-black text-slate-900 dark:text-white">1,248 Scholars</p>
                </div>
              </CardContent>
            </Card>

            <Card hoverEffect>
              <CardContent className="p-5 flex items-center gap-4">
                <div className="h-11 w-11 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
                  <DollarSign className="w-5.5 h-5.5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Est. My Revenue</p>
                  <p className="text-xl font-black text-slate-900 dark:text-white">₹82,450</p>
                </div>
              </CardContent>
            </Card>

            <Card hoverEffect>
              <CardContent className="p-5 flex items-center gap-4">
                <div className="h-11 w-11 rounded-2xl bg-amber-100 dark:bg-amber-950 text-amber-600 flex items-center justify-center">
                  <FileText className="w-5.5 h-5.5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Handwritten Guides</p>
                  <p className="text-xl font-black text-slate-900 dark:text-white">{notes.length} PDF Binders</p>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* DUAL COLS: Analytics Chart & Activity */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="p-6 lg:col-span-2 space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Student Course Analytics</h3>
                  <p className="text-xs text-slate-500">Weekly student watch duration and chapter enrollment counts.</p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setAnalyticsFilter('all')}
                    className={`px-2 py-1 text-[10px] font-extrabold rounded-md ${analyticsFilter === 'all' ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-900 text-slate-500'}`}
                  >
                    All
                  </button>
                  <button 
                    onClick={() => setAnalyticsFilter('premium')}
                    className={`px-2 py-1 text-[10px] font-extrabold rounded-md ${analyticsFilter === 'premium' ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-900 text-slate-500'}`}
                  >
                    Premium
                  </button>
                </div>
              </div>

              {/* Course analytics bar metrics representation */}
              <div className="space-y-4 pt-2">
                {courses.filter(c => analyticsFilter === 'all' ? true : (analyticsFilter === 'premium' ? c.isPremium : !c.isPremium)).map((c, i) => {
                  const studentCount = i === 0 ? 412 : (i === 1 ? 230 : (i === 2 ? 180 : 92));
                  const progressPct = Math.min(100, Math.floor((studentCount / 500) * 100));
                  return (
                    <div key={c.id} className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="font-bold text-slate-800 dark:text-slate-200">{c.title}</span>
                        <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{studentCount} enrolled</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-900 h-2.5 rounded-full overflow-hidden flex">
                        <div 
                          style={{ width: `${progressPct}%` }}
                          className={`h-full rounded-full ${i % 2 === 0 ? 'bg-indigo-600' : 'bg-blue-500'}`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            <Card className="p-5 space-y-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Recent Activity Stream</h3>
                <p className="text-xs text-slate-500">Real-time alerts of syllabus updates and mock submissions.</p>
              </div>

              <div className="space-y-3.5">
                {[
                  { text: 'Aditya Sen completed "Intro to Coulomb\'s Law" video lecture', time: '10 mins ago', type: 'video' },
                  { text: 'Ananya Sen downloaded "Gauss Law CBSE Questions Pack.pdf"', time: '2 hours ago', type: 'note' },
                  { text: 'Prof. Rajesh Khanna created NEET (Biology & Chemistry) Mock Chapter 2', time: '5 hours ago', type: 'system' },
                  { text: 'Student Aarav Sharma unlocked CBSE 12 Premium level', time: '1 day ago', type: 'premium' }
                ].map((act, i) => (
                  <div key={i} className="flex gap-3 items-start text-xs border-b border-slate-50 dark:border-slate-900/40 pb-3 last:border-0 last:pb-0">
                    <div className="h-2 w-2 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                    <div className="space-y-0.5">
                      <p className="text-slate-800 dark:text-slate-200 font-medium leading-relaxed">{act.text}</p>
                      <p className="text-[10px] text-slate-400 font-semibold">{act.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </section>
        </div>
      )}

      {activeTab === 'courses' && (
        <div className="space-y-6 animate-fade-in">
          {/* Action Header */}
          <div className="flex justify-between items-center gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Active Courses Catalog</h3>
              <p className="text-xs text-slate-500">Edit course cards, toggle premium models, and publish instantly.</p>
            </div>
            <Button variant="primary" size="sm" onClick={() => handleOpenCourseForm()} className="flex items-center gap-1">
              <Plus className="w-4 h-4" />
              Create Course
            </Button>
          </div>

          {/* COURSE FORM MODAL / COLLAPSIBLE */}
          {courseFormOpen && (
            <Card className="p-6 border-2 border-indigo-500 bg-slate-50/50 dark:bg-slate-900/20">
              <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3 mb-5">
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  {editingCourseId ? '🖊️ Modify Existing Course Card' : '🚀 Build New Course Directory'}
                </h4>
                <button onClick={() => setCourseFormOpen(false)} className="text-slate-400 hover:text-slate-900 dark:hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveCourse} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Course Title"
                    value={courseTitle}
                    onChange={e => setCourseTitle(e.target.value)}
                    placeholder="e.g. Class 12 Electrostatics Deep Revision"
                    required
                  />
                  <Input
                    label="Sub-title Summary"
                    value={courseSubtitle}
                    onChange={e => setCourseSubtitle(e.target.value)}
                    placeholder="e.g. Master Coulomb's Law, Field lines, and Flux proofs"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Course Detailed Description
                  </label>
                  <textarea
                    value={courseDescription}
                    onChange={e => setCourseDescription(e.target.value)}
                    placeholder="Write details about the syllabus structure, mock tests, and coordinator teachers..."
                    className="block w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm p-3 h-24 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      Assign Target Standard
                    </label>
                    <select
                      value={courseClassId}
                      onChange={e => setCourseClassId(e.target.value)}
                      className="block w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm px-3 py-2.5 focus:ring-2 focus:ring-blue-500"
                    >
                      {classes.map(cl => (
                        <option key={cl.id} value={cl.id}>{cl.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      Assign Subject Stream
                    </label>
                    <select
                      value={courseSubjectId}
                      onChange={e => setCourseSubjectId(e.target.value)}
                      className="block w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm px-3 py-2.5 focus:ring-2 focus:ring-blue-500"
                    >
                      {subjects.map(s => (
                        <option key={s.id} value={s.id}>{s.name} ({classes.find(cl=>cl.id===s.classId)?.name || 'Syllabus'})</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Input
                      label="Thumbnail Image URL / Storage Path"
                      value={courseThumbnail}
                      onChange={e => setCourseThumbnail(e.target.value)}
                      placeholder="Provide image web reference or upload below"
                    />
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Or Upload Thumbnail directly to Supabase Storage
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            try {
                              addToast('Uploading thumbnail directly to Supabase Storage...', 'info');
                              const storagePath = `thumbnails/${Date.now()}_${file.name}`;
                              const url = await uploadToStorage('assets', storagePath, file);
                              setCourseThumbnail(url);
                              addToast('Thumbnail uploaded successfully and linked!', 'success');
                            } catch (err: any) {
                              addToast(`Thumbnail upload failed: ${err.message}`, 'error');
                            }
                          }
                        }}
                        className="block w-full text-xs text-slate-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer border border-slate-200 dark:border-slate-800 rounded-xl p-1"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      Unlock Pricing Plan
                    </label>
                    <div className="flex gap-4 pt-2">
                      <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                        <input
                          type="radio"
                          checked={!courseIsPremium}
                          onChange={() => setCourseIsPremium(false)}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300"
                        />
                        Free Now
                      </label>
                      <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                        <input
                          type="radio"
                          checked={courseIsPremium}
                          onChange={() => setCourseIsPremium(true)}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300"
                        />
                        Premium Lock
                      </label>
                    </div>
                  </div>
                </div>

                {courseIsPremium && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-100 dark:bg-slate-900 rounded-2xl animate-fade-in">
                    <Input
                      label="Original Cost Price (INR)"
                      type="number"
                      value={coursePrice}
                      onChange={e => setCoursePrice(e.target.value)}
                      placeholder="e.g. 499"
                    />
                    <Input
                      label="Discounted Promotional Price (INR)"
                      type="number"
                      value={courseDiscount}
                      onChange={e => setCourseDiscount(e.target.value)}
                      placeholder="e.g. 299"
                    />
                  </div>
                )}

                <div className="flex gap-2 justify-end pt-3">
                  <Button variant="secondary" size="sm" type="button" onClick={() => setCourseFormOpen(false)}>
                    Discard
                  </Button>
                  <Button variant="primary" size="sm" type="submit">
                    {editingCourseId ? 'Save Changes' : 'Publish Course'}
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {/* CATALOG GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map(course => {
              const targetClass = classes.find(c => c.id === course.classId);
              const targetSubject = subjects.find(s => s.id === course.subjectId);
              return (
                <Card key={course.id} className="overflow-hidden flex flex-col justify-between">
                  <div>
                    <div className="h-40 w-full overflow-hidden bg-slate-150 relative">
                      <img 
                        src={course.thumbnailUrl} 
                        alt={course.title}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-2 left-2 flex gap-1.5">
                        <Badge variant="info" size="sm">{targetClass?.name}</Badge>
                        <Badge variant="secondary" size="sm">{targetSubject?.name}</Badge>
                      </div>
                      <div className="absolute top-2 right-2">
                        {course.isPremium ? (
                          <Badge variant="danger" size="sm" className="flex items-center gap-1">
                            <Lock className="w-3 h-3" /> Premium
                          </Badge>
                        ) : (
                          <Badge variant="success" size="sm" className="flex items-center gap-1">
                            <Unlock className="w-3 h-3" /> Free
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="p-4 space-y-2">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">{course.title}</h4>
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{course.subtitle}</p>

                      <div className="flex items-center justify-between text-xs font-semibold pt-1">
                        <span className="text-slate-400">Unlock Pricing</span>
                        {course.isPremium ? (
                          <div className="flex items-center gap-1.5">
                            <span className="text-slate-400 line-through">₹{course.price}</span>
                            <span className="text-slate-900 dark:text-white font-black text-sm">₹{course.discountPrice || course.price}</span>
                          </div>
                        ) : (
                          <span className="text-emerald-600 dark:text-emerald-400 font-extrabold text-sm">FREE</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 dark:bg-slate-900/40 border-t border-slate-100 dark:border-slate-800/60 flex justify-between gap-2">
                    <div className="flex gap-1.5">
                      <Button variant="secondary" size="sm" onClick={() => handleOpenCourseForm(course.id)} className="px-2">
                        <Edit className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="danger" size="sm" onClick={() => handleDeleteCourse(course.id)} className="px-2">
                        <Trash className="w-3.5 h-3.5" />
                      </Button>
                    </div>

                    <div className="flex gap-1">
                      <Button 
                        variant="secondary" 
                        size="sm" 
                        onClick={() => {
                          setSelectedCourseId(course.id);
                          setActiveTab('syllabus');
                        }}
                      >
                        Syllabus Builder
                      </Button>
                      <Button 
                        variant="primary" 
                        size="sm" 
                        onClick={() => togglePublishCourse(course.id, true)}
                      >
                        Live Status
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'syllabus' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
          {/* LEFT COLUMN: COURSE SELECTION AND CHAPTER LIST */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="p-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Select Target Course Catalog
                </label>
                <select
                  value={selectedCourseId}
                  onChange={e => {
                    setSelectedCourseId(e.target.value);
                    setSelectedChapterId('');
                  }}
                  className="block w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm p-2.5 font-bold focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Choose Course --</option>
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </div>

              {activeCourseObj && (
                <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/20 rounded-2xl space-y-2">
                  <div className="flex justify-between items-start">
                    <p className="text-xs font-bold text-indigo-700 dark:text-indigo-400">Active Course Metadata</p>
                    {activeCourseObj.isPremium ? <Badge variant="danger" size="sm">Premium</Badge> : <Badge variant="success" size="sm">Free</Badge>}
                  </div>
                  <p className="text-[11px] font-black text-slate-800 dark:text-slate-200 line-clamp-1">{activeCourseObj.title}</p>
                  <p className="text-[10px] text-slate-500 line-clamp-2">{activeCourseObj.subtitle}</p>
                </div>
              )}
            </Card>

            <Card className="p-4 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Chapters List ({courseChapters.length})</span>
                <Button variant="secondary" size="sm" onClick={() => setChapterFormOpen(true)} className="flex items-center gap-0.5">
                  <FolderPlus className="w-3 h-3" /> Add Chap
                </Button>
              </div>

              {chapterFormOpen && (
                <form onSubmit={handleCreateChapter} className="p-3 border border-indigo-200 dark:border-indigo-800 rounded-2xl bg-slate-50 dark:bg-slate-950 space-y-3">
                  <Input
                    label="Chapter Name"
                    value={chapterName}
                    onChange={e => setChapterName(e.target.value)}
                    placeholder="e.g., Chapter 3: Capacitors & Dielectrics"
                    required
                  />
                  <Input
                    label="Brief Description"
                    value={chapterDesc}
                    onChange={e => setChapterDesc(e.target.value)}
                    placeholder="e.g., Series and parallel groupings"
                  />
                  <div className="flex gap-2 justify-end">
                    <Button variant="secondary" size="sm" type="button" onClick={() => setChapterFormOpen(false)}>
                      Cancel
                    </Button>
                    <Button variant="primary" size="sm" type="submit">
                      Save Chapter
                    </Button>
                  </div>
                </form>
              )}

              {courseChapters.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">No chapters assigned. Create your first chapter.</p>
              ) : (
                <div className="space-y-1.5">
                  {courseChapters.map(chap => {
                    const isActive = selectedChapterId === chap.id;
                    return (
                      <div 
                        key={chap.id}
                        onClick={() => setSelectedChapterId(chap.id)}
                        className={`p-2.5 rounded-xl cursor-pointer text-xs flex justify-between items-center border transition-all ${
                          isActive 
                            ? 'bg-indigo-600 border-indigo-600 text-white font-bold' 
                            : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900'
                        }`}
                      >
                        <div className="space-y-0.5">
                          <p className="font-extrabold">{chap.name}</p>
                          <p className={`text-[10px] ${isActive ? 'text-indigo-200' : 'text-slate-400'}`}>{chap.description}</p>
                        </div>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteChapter(chap.id);
                          }}
                          className={`hover:scale-110 transition-transform ${isActive ? 'text-white' : 'text-red-500'}`}
                        >
                          <Trash className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          </div>

          {/* RIGHT COLUMNS: LESSONS IN ACTIVE CHAPTER */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-5 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-2">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Lessons & Media Attachments
                  </h3>
                  <p className="text-xs text-slate-500">
                    {selectedChapterId 
                      ? `Selected: ${chapters.find(c=>c.id === selectedChapterId)?.name}`
                      : 'Choose a chapter folder from the left side to show lessons.'
                    }
                  </p>
                </div>
                {selectedChapterId && (
                  <Button variant="primary" size="sm" onClick={() => handleOpenLessonForm()} className="flex items-center gap-1">
                    <FilePlus className="w-3.5 h-3.5" /> Add Lesson
                  </Button>
                )}
              </div>

              {/* LESSON FORM COMPONENT */}
              {lessonFormOpen && (
                <form onSubmit={handleSaveLesson} className="p-4 border-2 border-indigo-600 rounded-2xl bg-slate-50 dark:bg-slate-950 space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-2">
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {editingLessonId ? '🖊️ Edit Lesson & Digital Materials' : '🚀 Build New Lesson Node'}
                    </h4>
                    <button type="button" onClick={() => setLessonFormOpen(false)} className="text-slate-400 hover:text-slate-900 dark:hover:text-white">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Lesson Title"
                      value={lessonTitle}
                      onChange={e => setLessonTitle(e.target.value)}
                      placeholder="e.g. Lesson 2.1: Parallel Plate Capacitors"
                      required
                    />
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                        Lesson Lock Tier
                      </label>
                      <div className="flex gap-4 pt-2">
                        <label className="flex items-center gap-1.5 text-xs font-bold cursor-pointer">
                          <input
                            type="radio"
                            checked={!lessonIsPremium}
                            onChange={() => setLessonIsPremium(false)}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                          />
                          Free Preview
                        </label>
                        <label className="flex items-center gap-1.5 text-xs font-bold cursor-pointer">
                          <input
                            type="radio"
                            checked={lessonIsPremium}
                            onChange={() => setLessonIsPremium(true)}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                          />
                          Premium Locked
                        </label>
                      </div>
                    </div>
                  </div>

                  <Input
                    label="Lesson Description"
                    value={lessonDesc}
                    onChange={e => setLessonDesc(e.target.value)}
                    placeholder="Provide short learning focus objectives..."
                  />

                  {/* VIDEO ATTACHMENT SECTION */}
                  <div className="border border-indigo-100 dark:border-indigo-900 rounded-2xl p-4 bg-white dark:bg-slate-900 space-y-3">
                    <h5 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Video className="w-4 h-4 text-indigo-500" />
                      Section 4 - Digital Lecture Video Manager
                    </h5>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Provider</label>
                        <select
                          value={lessonVideoProvider}
                          onChange={e => setLessonVideoProvider(e.target.value as any)}
                          className="block w-full rounded-lg border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs p-2 focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="youtube">YouTube Unlisted ID</option>
                          <option value="vimeo">Vimeo Video ID</option>
                          <option value="gdrive">Google Drive Embed URL</option>
                          <option value="supabase">Supabase Direct MP4 URL</option>
                        </select>
                      </div>
                      <div className="sm:col-span-2">
                        <Input
                          label="Video Identifier / Live URL Link"
                          value={lessonVideoUrl}
                          onChange={e => setLessonVideoUrl(e.target.value)}
                          placeholder="e.g. h7gh96X69Gs or drive/embed link"
                        />
                      </div>
                    </div>
                  </div>

                  {/* NOTES ATTACHMENT SECTION */}
                  <div className="border border-indigo-100 dark:border-indigo-900 rounded-2xl p-4 bg-white dark:bg-slate-900 space-y-3">
                    <h5 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-emerald-500" />
                      Section 5 - Revision Binders PDF Manager
                    </h5>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Input
                        label="Handwritten Notes Title"
                        value={lessonPdfTitle}
                        onChange={e => setLessonPdfTitle(e.target.value)}
                        placeholder="e.g. Formula Binders - Parallel Plate Capacitors.pdf"
                      />
                      <Input
                        label="Notes Document PDF URL / Storage Path"
                        value={lessonPdfUrl}
                        onChange={e => setLessonPdfUrl(e.target.value)}
                        placeholder="Provide dummy URL or upload below"
                      />
                      <div className="space-y-1 sm:col-span-2">
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Or Upload PDF Study Guide directly to Supabase Storage
                        </label>
                        <input
                          type="file"
                          accept="application/pdf"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              try {
                                addToast('Uploading PDF notes securely to Supabase Storage...', 'info');
                                const storagePath = `notes/${Date.now()}_${file.name}`;
                                const url = await uploadToStorage('materials', storagePath, file);
                                setLessonPdfUrl(url);
                                if (!lessonPdfTitle) {
                                  setLessonPdfTitle(file.name);
                                }
                                addToast('Notes PDF uploaded and linked!', 'success');
                              } catch (err: any) {
                                addToast(`Notes PDF upload failed: ${err.message}`, 'error');
                              }
                            }
                          }}
                          className="block w-full text-xs text-slate-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer border border-slate-200 dark:border-slate-800 rounded-xl p-1"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end">
                    <Button variant="secondary" size="sm" type="button" onClick={() => setLessonFormOpen(false)}>
                      Discard
                    </Button>
                    <Button variant="primary" size="sm" type="submit">
                      Save Lesson Details
                    </Button>
                  </div>
                </form>
              )}

              {/* LESSONS LIST */}
              {!selectedChapterId ? (
                <div className="text-center py-12 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                  <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-500">Curriculum folder is empty</p>
                  <p className="text-[10px] text-slate-400 mt-1">Choose a specific chapter folder on the left side to see lesson plans.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {lessons.filter(l => l.chapterId === selectedChapterId).length === 0 ? (
                    <p className="text-xs text-slate-400 py-8 text-center">No lessons added inside this chapter folder. Click Add Lesson to start.</p>
                  ) : (
                    lessons.filter(l => l.chapterId === selectedChapterId).sort((a,b)=>a.orderIndex - b.orderIndex).map((less, idx, arr) => {
                      const associatedVideo = videos.find(v => v.lessonId === less.id);
                      const associatedNote = notes.find(n => n.lessonId === less.id);

                      return (
                        <div 
                          key={less.id} 
                          className="p-4 border border-slate-200 dark:border-slate-800/80 rounded-2xl flex flex-col space-y-3 bg-white dark:bg-slate-950 hover:shadow-sm transition-all"
                        >
                          <div className="flex justify-between items-start gap-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-mono text-indigo-500 font-extrabold bg-indigo-50 dark:bg-indigo-950/40 px-1.5 py-0.5 rounded-md">
                                  INDEX #{less.orderIndex}
                                </span>
                                <h4 className="text-xs font-bold text-slate-900 dark:text-white">{less.title}</h4>
                                {less.isPremium ? (
                                  <Badge variant="danger" size="sm">Locked Premium</Badge>
                                ) : (
                                  <Badge variant="success" size="sm">Free Preview</Badge>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-500 leading-relaxed">{less.description || 'No descriptive objectives provided.'}</p>
                            </div>

                            <div className="flex gap-1 shrink-0">
                              <button 
                                disabled={idx === 0}
                                onClick={() => reorderLesson(less.id, 'up')}
                                className="p-1 text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-30"
                              >
                                <ArrowUp className="w-4 h-4" />
                              </button>
                              <button 
                                disabled={idx === arr.length - 1}
                                onClick={() => reorderLesson(less.id, 'down')}
                                className="p-1 text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-30"
                              >
                                <ArrowDown className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleOpenLessonForm(less.id)}
                                className="p-1 text-blue-500 hover:scale-110 transition-transform"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleDeleteLesson(less.id)}
                                className="p-1 text-red-500 hover:scale-110 transition-transform"
                              >
                                <Trash className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {/* Media Links Details */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-50 dark:border-slate-900/40">
                            {/* Video detail card */}
                            <div className="p-2 bg-slate-50 dark:bg-slate-900 rounded-xl flex items-center justify-between">
                              <div className="flex items-center gap-2 overflow-hidden">
                                <Video className="w-4 h-4 text-indigo-500 shrink-0" />
                                <div className="text-[10px] overflow-hidden">
                                  <p className="font-extrabold text-slate-700 dark:text-slate-300 truncate">
                                    {associatedVideo ? associatedVideo.title : 'No Video Lecture attached'}
                                  </p>
                                  <p className="text-slate-400 font-mono truncate">
                                    {associatedVideo ? `${associatedVideo.provider.toUpperCase()}: ${associatedVideo.videoIdOrUrl}` : 'Syllabus missing video link'}
                                  </p>
                                </div>
                              </div>
                              {associatedVideo && (
                                <Badge variant="secondary" size="sm">Active</Badge>
                              )}
                            </div>

                            {/* PDF detail card */}
                            <div className="p-2 bg-slate-50 dark:bg-slate-900 rounded-xl flex items-center justify-between">
                              <div className="flex items-center gap-2 overflow-hidden">
                                <FileText className="w-4 h-4 text-emerald-500 shrink-0" />
                                <div className="text-[10px] overflow-hidden">
                                  <p className="font-extrabold text-slate-700 dark:text-slate-300 truncate">
                                    {associatedNote ? associatedNote.title : 'No study PDF attached'}
                                  </p>
                                  <p className="text-slate-400 truncate">
                                    {associatedNote ? 'Handwritten PDF Linked' : 'Notes missing PDF URL'}
                                  </p>
                                </div>
                              </div>
                              {associatedNote && (
                                <Badge variant="success" size="sm">Linked</Badge>
                              )}
                            </div>
                          </div>

                          {/* Interactive preview pane for added content */}
                          {(associatedVideo || associatedNote) && (
                            <div className="p-2 border border-dashed border-slate-150 dark:border-slate-800 rounded-xl flex justify-between items-center bg-indigo-50/10 dark:bg-indigo-950/5">
                              <span className="text-[10px] font-bold text-slate-400">Attached Media Verification Panel</span>
                              <div className="flex gap-2">
                                {associatedVideo && (
                                  <button 
                                    onClick={() => {
                                      addToast(`Simulating video preview in unlisted viewer... (${associatedVideo.provider})`, 'success');
                                    }}
                                    className="px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400 text-[9px] font-extrabold flex items-center gap-1 hover:opacity-80 transition-opacity"
                                  >
                                    <Play className="w-2.5 h-2.5" /> Preview Video
                                  </button>
                                )}
                                {associatedNote && (
                                  <button 
                                    onClick={() => {
                                      window.open(associatedNote.pdfUrl, '_blank');
                                      addToast('Document opened in secure preview browser frame.', 'success');
                                    }}
                                    className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 text-[9px] font-extrabold flex items-center gap-1 hover:opacity-80 transition-opacity"
                                  >
                                    <Eye className="w-2.5 h-2.5" /> View Notes PDF
                                  </button>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
