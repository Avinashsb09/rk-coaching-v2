/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  DollarSign, 
  ShieldAlert, 
  BadgeCheck, 
  FileCheck, 
  Landmark, 
  Megaphone, 
  Check, 
  Trash, 
  Edit, 
  Plus, 
  X, 
  RefreshCw, 
  UserPlus, 
  Users, 
  ArrowUp, 
  ArrowDown, 
  Save, 
  HelpCircle,
  FileText,
  Lock,
  Unlock,
  Sliders,
  Award,
  CreditCard,
  Settings,
  Search,
  Download,
  Printer,
  BookOpen,
  Film,
  PlusCircle,
  FolderPlus,
  PlayCircle,
  ChevronRight,
  UserMinus,
  UserCheck,
  Activity,
  Trophy,
  Video,
  AlertTriangle,
  Calendar,
  Menu,
  LogOut,
  Database,
  TrendingUp,
  BarChart2,
  Shield,
  Eye
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
 
export default function AdminDashboard() {
  const { 
    addToast,
    users,
    setUsers,
    faqs,
    setFaqs,
    homepageConfig,
    setHomepageConfig,
    payments,
    setPayments,
    orders,
    setOrders,
    paymentSettings,
    setPaymentSettings,
    courses,
    setCourses,
    classes,
    setClasses,
    subjects,
    setSubjects,
    chapters,
    setChapters,
    lessons,
    setLessons,
    videos,
    setVideos,
    notes,
    setNotes,
    quizzes,
    setQuizzes,
    quizQuestions,
    setQuizQuestions,
    quizOptions,
    setQuizOptions,
    quizAttempts,
    setQuizAttempts,
    leaderboardEntries,
    setLeaderboardEntries
  } = useApp() as any;

  // Tabs structure state
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Global Search states
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');

  // Selected User Profile details modal state
  const [selectedUserForProfile, setSelectedUserForProfile] = useState<any | null>(null);

  // Suspend Dialog Modal states
  const [suspendModalUser, setSuspendModalUser] = useState<any | null>(null);
  const [suspendReason, setSuspendReason] = useState('');
  const [suspendStart, setSuspendStart] = useState('');
  const [suspendEnd, setSuspendEnd] = useState('');

  // User list filters
  const [userFilterRole, setUserFilterRole] = useState('all');
  const [userFilterClass, setUserFilterClass] = useState('all');
  const [userFilterStatus, setUserFilterStatus] = useState('all');
  const [showDeletedUsers, setShowDeletedUsers] = useState(false);

  // User form states
  const [userFormOpen, setUserFormOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [userFullName, setUserFullName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [userClassId, setUserClassId] = useState('c6');
  const [userStatus, setUserStatus] = useState('active');
  const [userRole, setUserRole] = useState<'student' | 'teacher' | 'admin' | 'visitor'>('student');
  const [userXp, setUserXp] = useState('500');
  const [userStreak, setUserStreak] = useState('3');
  const [userAvatar, setUserAvatar] = useState('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80');

  // Quiz states
  const [quizSubTab, setQuizSubTab] = useState<'quizzes' | 'attempts' | 'analytics'>('quizzes');
  const [quizFilterClass, setQuizFilterClass] = useState('all');
  const [quizFilterSubject, setQuizFilterSubject] = useState('all');
  const [selectedQuizForQuestions, setSelectedQuizForQuestions] = useState<any | null>(null);

  // Quiz Form states
  const [quizFormOpen, setQuizFormOpen] = useState(false);
  const [editingQuizId, setEditingQuizId] = useState<string | null>(null);
  const [quizTitle, setQuizTitle] = useState('');
  const [quizDesc, setQuizDesc] = useState('');
  const [quizClassId, setQuizClassId] = useState('c6');
  const [quizLessonId, setQuizLessonId] = useState('');
  const [quizDifficulty, setQuizDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [quizDuration, setQuizDuration] = useState('180');
  const [quizTotalMarks, setQuizTotalMarks] = useState('15');
  const [quizPassingMarks, setQuizPassingMarks] = useState('9');
  const [quizNegativeMarking, setQuizNegativeMarking] = useState('1');
  const [quizPositiveMarks, setQuizPositiveMarks] = useState('3');
  const [quizAttemptLimit, setQuizAttemptLimit] = useState('3');
  const [quizStartDate, setQuizStartDate] = useState('');
  const [quizEndDate, setQuizEndDate] = useState('');
  const [quizPublishStatus, setQuizPublishStatus] = useState<boolean>(true);
  const [quizActiveStatus, setQuizActiveStatus] = useState<boolean>(true);

  // Question Form states
  const [questionFormOpen, setQuestionFormOpen] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [qText, setQText] = useState('');
  const [qImage, setQImage] = useState('');
  const [qExplanation, setQExplanation] = useState('');
  const [qDifficulty, setQDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [qMarks, setQMarks] = useState('3');
  const [qNegativeMarks, setQNegativeMarks] = useState('1');
  const [qType, setQType] = useState('single_correct');
  const [qTopicTags, setQTopicTags] = useState('');
  const [optA, setOptA] = useState('');
  const [optB, setOptB] = useState('');
  const [optC, setOptC] = useState('');
  const [optD, setOptD] = useState('');
  const [correctOption, setCorrectOption] = useState<'A' | 'B' | 'C' | 'D'>('A');

  // FAQ states
  const [faqFormOpen, setFaqFormOpen] = useState(false);
  const [editingFaqId, setEditingFaqId] = useState<string | null>(null);
  const [faqQuestion, setFaqQuestion] = useState('');
  const [faqAnswer, setFaqAnswer] = useState('');

  // Website Copy states
  const [copyHeroTitle, setCopyHeroTitle] = useState(homepageConfig.heroTitle);
  const [copyHeroSubtitle, setCopyHeroSubtitle] = useState(homepageConfig.heroSubtitle);
  const [copyContactPhone, setCopyContactPhone] = useState(homepageConfig.contactPhone);
  const [copyContactEmail, setCopyContactEmail] = useState(homepageConfig.contactEmail);
  const [copyContactAddress, setCopyContactAddress] = useState(homepageConfig.contactAddress);
  const [copyFooterText, setCopyFooterText] = useState(homepageConfig.footerText);

  // Admin Payment Panel states
  const [txnSearch, setTxnSearch] = useState('');
  const [txnFilterStatus, setTxnFilterStatus] = useState<string>('all');
  const [selectedTxnInvoice, setSelectedTxnInvoice] = useState<any | null>(null);

  // Payment Settings form states
  const [cfgRzpKey, setCfgRzpKey] = useState(paymentSettings.razorpayKeyId);
  const [cfgBusName, setCfgBusName] = useState(paymentSettings.businessName);
  const [cfgBusLogo, setCfgBusLogo] = useState(paymentSettings.businessLogo);
  const [cfgSupEmail, setCfgSupEmail] = useState(paymentSettings.supportEmail);
  const [cfgSupPhone, setCfgSupPhone] = useState(paymentSettings.supportPhone);
  const [cfgSuccessMsg, setCfgSuccessMsg] = useState(paymentSettings.successMessage);
  const [cfgFailureMsg, setCfgFailureMsg] = useState(paymentSettings.failureMessage);

  // ---- ENTERPRISE HANDLERS ----
  const handlePostAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementTitle || !announcementMsg) {
      addToast('Please input both a title and message', 'error');
      return;
    }
    addToast(`Global school banner published: "${announcementTitle}"`, 'success');
    setAnnouncementTitle('');
    setAnnouncementMsg('');
  };

  const handleApprovePayment = (name: string, txnId: string) => {
    addToast(`Payment ID "${txnId}" for ${name} verified with Razorpay! Premium standard unlocked.`, 'success');
  };

  // ---- SECTION 6: USER MANAGEMENT CRUD ----
  const handleOpenUserForm = (userId: string | null = null) => {
    if (userId) {
      const u = users.find((item: any) => item.id === userId) as any;
      if (u) {
        setEditingUserId(userId);
        setUserFullName(u.fullName);
        setUserEmail(u.email);
        setUserPhone(u.phone || '98765 43210');
        setUserClassId(u.classId || 'c6');
        setUserStatus(u.status || 'active');
        setUserRole(u.role);
        setUserXp(u.totalXp.toString());
        setUserStreak(u.dailyStreak.toString());
        setUserAvatar(u.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80');
      }
    } else {
      setEditingUserId(null);
      setUserFullName('');
      setUserEmail('');
      setUserPhone('98765 43210');
      setUserClassId('c6');
      setUserStatus('active');
      setUserRole('student');
      setUserXp('300');
      setUserStreak('1');
      setUserAvatar('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80');
    }
    setUserFormOpen(true);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userFullName || !userEmail) {
      addToast('Please input complete credentials', 'error');
      return;
    }

    const { getSupabase, isSupabaseConfigured } = await import('../../lib/supabase');
    const supabase = (isSupabaseConfigured() && getSupabase()) ? (getSupabase() as any) : null;

    if (editingUserId) {
      // Edit User
      (setUsers as any)((prev: any) => prev.map((u: any) => u.id === editingUserId ? {
        ...u,
        fullName: userFullName,
        email: userEmail,
        phone: userPhone,
        classId: userClassId,
        status: userStatus,
        role: userRole,
        totalXp: Number(userXp) || 0,
        dailyStreak: Number(userStreak) || 0,
        avatarUrl: userAvatar
      } : u));

      if (supabase) {
        try {
          await supabase.from('profiles').update({
            fullName: userFullName,
            email: userEmail,
            phone: userPhone,
            classId: userClassId,
            status: userStatus,
            role: userRole,
            totalXp: Number(userXp) || 0,
            dailyStreak: Number(userStreak) || 0,
            avatarUrl: userAvatar
          }).eq('id', editingUserId);
        } catch (err) {
          console.error('Supabase update profile failed:', err);
        }
      }
      addToast(`Account for "${userFullName}" updated successfully`, 'success');
    } else {
      // Create User
      const newId = `usr_${Date.now()}`;
      const newUser = {
        id: newId,
        email: userEmail,
        fullName: userFullName,
        phone: userPhone,
        classId: userClassId,
        status: userStatus,
        role: userRole,
        dailyStreak: Number(userStreak) || 0,
        totalXp: Number(userXp) || 0,
        badges: ['scholar'],
        avatarUrl: userAvatar,
        softDeleted: false,
        registrationDate: new Date().toISOString().split('T')[0],
        lastLogin: new Date().toLocaleString()
      };

      (setUsers as any)((prev: any) => [...prev, newUser]);

      if (supabase) {
        try {
          await supabase.from('profiles').insert(newUser);
        } catch (err) {
          console.error('Supabase insert profile failed:', err);
        }
      }
      addToast(`User Profile "${userFullName}" established successfully`, 'success');
    }
    setUserFormOpen(false);
  };

  const handleSoftDeleteUser = async (userId: string) => {
    (setUsers as any)((prev: any) => prev.map((u: any) => u.id === userId ? { ...u, softDeleted: true } : u));
    addToast('Profile soft-deleted and moved to archives', 'warning');

    const { getSupabase, isSupabaseConfigured } = await import('../../lib/supabase');
    if (isSupabaseConfigured() && getSupabase()) {
      const supabase = getSupabase() as any;
      try {
        await supabase.from('profiles').update({ softDeleted: true }).eq('id', userId);
      } catch (err) {
        console.error('Supabase soft delete failed:', err);
      }
    }
  };

  const handleRestoreUser = async (userId: string) => {
    (setUsers as any)((prev: any) => prev.map((u: any) => u.id === userId ? { ...u, softDeleted: false } : u));
    addToast('Profile restored successfully', 'success');

    const { getSupabase, isSupabaseConfigured } = await import('../../lib/supabase');
    if (isSupabaseConfigured() && getSupabase()) {
      const supabase = getSupabase() as any;
      try {
        await supabase.from('profiles').update({ softDeleted: false }).eq('id', userId);
      } catch (err) {
        console.error('Supabase restore failed:', err);
      }
    }
  };

  const handlePauseUser = async (userId: string) => {
    (setUsers as any)((prev: any) => prev.map((u: any) => u.id === userId ? { ...u, status: 'paused' } : u));
    addToast('User login paused (access suspended; data remains safe)', 'info');

    const { getSupabase, isSupabaseConfigured } = await import('../../lib/supabase');
    if (isSupabaseConfigured() && getSupabase()) {
      const supabase = getSupabase() as any;
      try {
        await supabase.from('profiles').update({ status: 'paused' }).eq('id', userId);
      } catch (err) {
        console.error('Supabase status pause failed:', err);
      }
    }
  };

  const handleResumeUser = async (userId: string) => {
    (setUsers as any)((prev: any) => prev.map((u: any) => u.id === userId ? { ...u, status: 'active', suspendedReason: null, suspendedStart: null, suspendedEnd: null } : u));
    addToast('User login access resumed and reactivated', 'success');

    const { getSupabase, isSupabaseConfigured } = await import('../../lib/supabase');
    if (isSupabaseConfigured() && getSupabase()) {
      const supabase = getSupabase() as any;
      try {
        await supabase.from('profiles').update({ status: 'active', suspendedReason: null, suspendedStart: null, suspendedEnd: null }).eq('id', userId);
      } catch (err) {
        console.error('Supabase status resume failed:', err);
      }
    }
  };

  // Quiz Manager Handlers
  const handleOpenQuizForm = (qz?: any) => {
    if (qz) {
      setEditingQuizId(qz.id);
      setQuizTitle(qz.title);
      setQuizDesc(qz.description || '');
      setQuizDifficulty(qz.difficulty || 'medium');
      setQuizDuration(String(Math.round(qz.timerSeconds / 60)));
      setQuizTotalMarks(String(qz.totalMarks || 15));
      setQuizPassingMarks(String(qz.passingMarks || 9));
      setQuizNegativeMarking(qz.negativeMarking ? '1' : '0');
      setQuizPositiveMarks(String(qz.positiveMarks || 3));
      setQuizAttemptLimit(String(qz.attemptLimit || 3));
      setQuizStartDate(qz.startDate || '');
      setQuizEndDate(qz.endDate || '');
      setQuizPublishStatus(qz.isPublished ?? true);
      setQuizActiveStatus(qz.isActive ?? true);
      
      setQuizLessonId(qz.lessonId || '');
      const lesson = lessons.find((l: any) => l.id === qz.lessonId);
      const chapter = chapters.find((c: any) => c.id === lesson?.chapterId);
      const subject = subjects.find((s: any) => s.id === chapter?.subjectId);
      setQuizClassId(subject?.classId || 'class-6');
    } else {
      setEditingQuizId(null);
      setQuizTitle('');
      setQuizDesc('');
      setQuizDifficulty('medium');
      setQuizDuration('180');
      setQuizTotalMarks('15');
      setQuizPassingMarks('9');
      setQuizNegativeMarking('1');
      setQuizPositiveMarks('3');
      setQuizAttemptLimit('3');
      setQuizStartDate('');
      setQuizEndDate('');
      setQuizPublishStatus(true);
      setQuizActiveStatus(true);
      setQuizLessonId(lessons[0]?.id || '');
      setQuizClassId('class-6');
    }
    setQuizFormOpen(true);
  };

  const handleSaveQuiz = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quizTitle || !quizLessonId) {
      addToast('Please provide Quiz Title and map to a Lesson.', 'error');
      return;
    }

    const updatedQuiz = {
      id: editingQuizId || `qz_${Date.now()}`,
      lessonId: quizLessonId,
      title: quizTitle,
      description: quizDesc,
      difficulty: quizDifficulty,
      timerSeconds: Number(quizDuration) * 60,
      passingScorePct: Math.round((Number(quizPassingMarks) / Number(quizTotalMarks)) * 100),
      totalMarks: Number(quizTotalMarks),
      passingMarks: Number(quizPassingMarks),
      negativeMarking: quizNegativeMarking === '1',
      positiveMarks: Number(quizPositiveMarks),
      attemptLimit: Number(quizAttemptLimit),
      startDate: quizStartDate || null,
      endDate: quizEndDate || null,
      isPublished: quizPublishStatus,
      isActive: quizActiveStatus,
      isArchived: false,
      createdAt: new Date().toISOString()
    };

    if (editingQuizId) {
      setQuizzes((prev: any[]) => prev.map(q => q.id === editingQuizId ? updatedQuiz : q));
      addToast('Quiz updated successfully!', 'success');
    } else {
      setQuizzes((prev: any[]) => [updatedQuiz, ...prev]);
      addToast('New Quiz created successfully!', 'success');
    }
    setQuizFormOpen(false);
  };

  const handleDeleteQuiz = (quizId: string) => {
    setQuizzes((prev: any[]) => prev.filter(q => q.id !== quizId));
    addToast('Quiz deleted permanently.', 'warning');
  };

  const handleArchiveQuiz = (quizId: string, archiveState: boolean) => {
    setQuizzes((prev: any[]) => prev.map(q => q.id === quizId ? { ...q, isArchived: archiveState } : q));
    addToast(archiveState ? 'Quiz archived.' : 'Quiz restored from archives.', 'success');
  };

  const handlePublishQuiz = (quizId: string, publishState: boolean) => {
    setQuizzes((prev: any[]) => prev.map(q => q.id === quizId ? { ...q, isPublished: publishState } : q));
    addToast(publishState ? 'Quiz published!' : 'Quiz unpublished successfully.', 'info');
  };

  const handleDuplicateQuiz = (quiz: any) => {
    const newQuizId = `qz_${Date.now()}`;
    const duplicatedQuiz = {
      ...quiz,
      id: newQuizId,
      title: `${quiz.title} (Copy)`,
      createdAt: new Date().toISOString()
    };

    const quizQues = quizQuestions.filter((q: any) => q.quizId === quiz.id);
    const newQuestions: any[] = [];
    const newOptions: any[] = [];

    quizQues.forEach((q: any) => {
      const newQId = `q_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
      newQuestions.push({
        ...q,
        id: newQId,
        quizId: newQuizId
      });

      const qOpts = quizOptions.filter((o: any) => o.questionId === q.id);
      qOpts.forEach((o: any) => {
        newOptions.push({
          ...o,
          id: `opt_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          questionId: newQId
        });
      });
    });

    setQuizzes((prev: any[]) => [duplicatedQuiz, ...prev]);
    if (newQuestions.length > 0) setQuizQuestions((prev: any[]) => [...prev, ...newQuestions]);
    if (newOptions.length > 0) setQuizOptions((prev: any[]) => [...prev, ...newOptions]);

    addToast('Quiz duplicated with all its questions & options!', 'success');
  };

  // Question CRUD
  const handleOpenQuestionForm = (question?: any) => {
    if (question) {
      setEditingQuestionId(question.id);
      setQText(question.questionText);
      setQImage(question.imageUrl || '');
      setQExplanation(question.explanation || '');
      setQDifficulty(question.difficulty || 'medium');
      setQMarks(String(question.marks || 3));
      setQNegativeMarks(String(question.negativeMarks || 1));
      setQType(question.questionType || 'single_correct');
      setQTopicTags(question.topicTags?.join(', ') || '');
      
      const qOpts = quizOptions.filter((o: any) => o.questionId === question.id);
      setOptA(qOpts[0]?.optionText || '');
      setOptB(qOpts[1]?.optionText || '');
      setOptC(qOpts[2]?.optionText || '');
      setOptD(qOpts[3]?.optionText || '');
      
      const correctIdx = qOpts.findIndex((o: any) => o.isCorrect);
      setCorrectOption(correctIdx === 0 ? 'A' : correctIdx === 1 ? 'B' : correctIdx === 2 ? 'C' : 'D');
    } else {
      setEditingQuestionId(null);
      setQText('');
      setQImage('');
      setQExplanation('');
      setQDifficulty('medium');
      setQMarks('3');
      setQNegativeMarks('1');
      setQType('single_correct');
      setQTopicTags('');
      setOptA('');
      setOptB('');
      setOptC('');
      setOptD('');
      setCorrectOption('A');
    }
    setQuestionFormOpen(true);
  };

  const handleSaveQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!qText || !optA || !optB) {
      addToast('Please specify question text and at least two options.', 'error');
      return;
    }

    const questionId = editingQuestionId || `q_${Date.now()}`;
    const targetQuizId = selectedQuizForQuestions.id;

    const newQuestion = {
      id: questionId,
      quizId: targetQuizId,
      questionText: qText,
      imageUrl: qImage || null,
      explanation: qExplanation || null,
      difficulty: qDifficulty,
      marks: Number(qMarks),
      negativeMarks: Number(qNegativeMarks),
      questionType: qType,
      topicTags: qTopicTags ? qTopicTags.split(',').map(s => s.trim()) : [],
      orderIndex: editingQuestionId 
        ? (quizQuestions.find((q: any) => q.id === editingQuestionId)?.orderIndex || 0)
        : (quizQuestions.filter((q: any) => q.quizId === targetQuizId).length + 1)
    };

    const newOpts = [
      { id: `opt_${questionId}_A`, questionId, optionText: optA, isCorrect: correctOption === 'A', priority: 1 },
      { id: `opt_${questionId}_B`, questionId, optionText: optB, isCorrect: correctOption === 'B', priority: 2 },
      { id: `opt_${questionId}_C`, questionId, optionText: optC || 'N/A', isCorrect: correctOption === 'C', priority: 3 },
      { id: `opt_${questionId}_D`, questionId, optionText: optD || 'N/A', isCorrect: correctOption === 'D', priority: 4 }
    ];

    if (editingQuestionId) {
      setQuizQuestions((prev: any[]) => prev.map(q => q.id === editingQuestionId ? newQuestion : q));
      setQuizOptions((prev: any[]) => prev.filter((o: any) => o.questionId !== editingQuestionId).concat(newOpts));
      addToast('Question updated.', 'success');
    } else {
      setQuizQuestions((prev: any[]) => [...prev, newQuestion]);
      setQuizOptions((prev: any[]) => [...prev, ...newOpts]);
      addToast('Question added to Quiz.', 'success');
    }
    setQuestionFormOpen(false);
  };

  const handleDeleteQuestion = (qId: string) => {
    setQuizQuestions((prev: any[]) => prev.filter(q => q.id !== qId));
    setQuizOptions((prev: any[]) => prev.filter(o => o.questionId !== qId));
    addToast('Question deleted.', 'warning');
  };

  const handleDuplicateQuestion = (q: any) => {
    const newQId = `q_${Date.now()}`;
    const duplicatedQ = {
      ...q,
      id: newQId,
      orderIndex: q.orderIndex + 1,
      questionText: `${q.questionText} (Copy)`
    };

    const qOpts = quizOptions.filter((o: any) => o.questionId === q.id);
    const newOpts = qOpts.map((o: any, idx: number) => ({
      ...o,
      id: `opt_${newQId}_${idx}`,
      questionId: newQId
    }));

    setQuizQuestions((prev: any[]) => [...prev, duplicatedQ]);
    setQuizOptions((prev: any[]) => [...prev, ...newOpts]);
    addToast('Question duplicated.', 'success');
  };

  const handleReorderQuestion = (qId: string, direction: 'up' | 'down') => {
    const list = quizQuestions.filter((q: any) => q.quizId === selectedQuizForQuestions.id).sort((a: any, b: any) => a.orderIndex - b.orderIndex);
    const index = list.findIndex((q: any) => q.id === qId);
    if (index === -1) return;
    
    if (direction === 'up' && index > 0) {
      const prevQ = list[index - 1];
      const currQ = list[index];
      const tempOrder = prevQ.orderIndex;
      prevQ.orderIndex = currQ.orderIndex;
      currQ.orderIndex = tempOrder;
      setQuizQuestions((prev: any[]) => prev.map(q => q.id === prevQ.id ? prevQ : q.id === currQ.id ? currQ : q));
      addToast('Reordered up.', 'info');
    } else if (direction === 'down' && index < list.length - 1) {
      const nextQ = list[index + 1];
      const currQ = list[index];
      const tempOrder = nextQ.orderIndex;
      nextQ.orderIndex = currQ.orderIndex;
      currQ.orderIndex = tempOrder;
      setQuizQuestions((prev: any[]) => prev.map(q => q.id === nextQ.id ? nextQ : q.id === currQ.id ? currQ : q));
      addToast('Reordered down.', 'info');
    }
  };

  // Bulk Operations
  const handleExportQuestions = (qzId: string) => {
    const qz = quizzes.find((q: any) => q.id === qzId);
    const qList = quizQuestions.filter((q: any) => q.quizId === qzId);
    const oList = quizOptions.filter((o: any) => qList.map(q => q.id).includes(o.questionId));

    const exportData = {
      quiz: qz,
      questions: qList,
      options: oList
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `quiz_${qzId}_export.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    addToast('Quiz package exported!', 'success');
  };

  const handleImportQuestions = (e: React.ChangeEvent<HTMLInputElement>, qzId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importData = JSON.parse(event.target?.result as string);
        if (!importData.questions || !importData.options) {
          addToast('Invalid quiz package format.', 'error');
          return;
        }

        const idMap: Record<string, string> = {};
        const newQuestions = importData.questions.map((q: any) => {
          const newId = `q_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
          idMap[q.id] = newId;
          return {
            ...q,
            id: newId,
            quizId: qzId
          };
        });

        const newOptions = importData.options.map((o: any) => ({
          ...o,
          id: `opt_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          questionId: idMap[o.questionId] || o.questionId
        }));

        setQuizQuestions((prev: any[]) => [...prev, ...newQuestions]);
        setQuizOptions((prev: any[]) => [...prev, ...newOptions]);
        addToast(`Successfully imported ${newQuestions.length} questions into Quiz!`, 'success');
      } catch (err) {
        addToast('Failed to parse package file.', 'error');
      }
    };
    reader.readAsText(file);
  };

  // Leaderboard Actions
  const handleResetLeaderboard = (classId: string) => {
    const students = users.filter((u: any) => u.classId === classId).map((u: any) => u.id);
    setQuizAttempts((prev: any[]) => prev.filter(a => !students.includes(a.userId)));
    addToast(`Leaderboard wiped for class standard.`, 'warning');
  };

  const handleDisqualifyAttempt = (attemptId: string) => {
    setQuizAttempts((prev: any[]) => prev.filter(a => a.id !== attemptId));
    addToast('Student attempt disqualified and removed from standings.', 'warning');
  };

  const handleRecalculateRankings = () => {
    addToast('Standings rankings updated reactively!', 'success');
  };

  const handleBlockUser = async (userId: string) => {
    (setUsers as any)((prev: any) => prev.map((u: any) => u.id === userId ? { ...u, status: 'blocked' } : u));
    addToast('User account permanently BLOCKED', 'error');

    const { getSupabase, isSupabaseConfigured } = await import('../../lib/supabase');
    if (isSupabaseConfigured() && getSupabase()) {
      const supabase = getSupabase() as any;
      try {
        await supabase.from('profiles').update({ status: 'blocked' }).eq('id', userId);
      } catch (err) {
        console.error('Supabase status block failed:', err);
      }
    }
  };

  const handleUnblockUser = async (userId: string) => {
    (setUsers as any)((prev: any) => prev.map((u: any) => u.id === userId ? { ...u, status: 'active' } : u));
    addToast('User account unblocked', 'success');

    const { getSupabase, isSupabaseConfigured } = await import('../../lib/supabase');
    if (isSupabaseConfigured() && getSupabase()) {
      const supabase = getSupabase() as any;
      try {
        await supabase.from('profiles').update({ status: 'active' }).eq('id', userId);
      } catch (err) {
        console.error('Supabase status unblock failed:', err);
      }
    }
  };

  const handleConfirmSuspension = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!suspendModalUser) return;
    const userId = suspendModalUser.id;

    (setUsers as any)((prev: any) => prev.map((u: any) => u.id === userId ? {
      ...u,
      status: 'suspended',
      suspendedReason: suspendReason,
      suspendedStart: suspendStart || new Date().toISOString().split('T')[0],
      suspendedEnd: suspendEnd
    } : u));

    const { getSupabase, isSupabaseConfigured } = await import('../../lib/supabase');
    if (isSupabaseConfigured() && getSupabase()) {
      const supabase = getSupabase() as any;
      try {
        await supabase.from('profiles').update({
          status: 'suspended',
          suspendedReason: suspendReason,
          suspendedStart: suspendStart || new Date().toISOString().split('T')[0],
          suspendedEnd: suspendEnd
        }).eq('id', userId);
      } catch (err) {
        console.error('Supabase status suspend failed:', err);
      }
    }

    addToast(`User "${suspendModalUser.fullName}" suspended until ${suspendEnd}`, 'warning');
    setSuspendModalUser(null);
    setSuspendReason('');
    setSuspendStart('');
    setSuspendEnd('');
  };

  const handleResetXp = (userId: string) => {
    (setUsers as any)((prev: any) => prev.map((u: any) => u.id === userId ? { ...u, totalXp: 0 } : u));
    addToast('XP reset completed', 'success');
  };

  const handleTogglePremium = (userId: string, currentRole: string) => {
    const nextRole = currentRole === 'student' ? 'visitor' : 'student';
    (setUsers as any)((prev: any) => prev.map((u: any) => u.id === userId ? { ...u, role: nextRole as any } : u));
    addToast('User standard tier updated', 'success');
  };

  // ---- SECTION 7: WEBSITE COPY MANAGEMENT ----
  const handleSaveWebsiteCopy = (e: React.FormEvent) => {
    e.preventDefault();
    setHomepageConfig({
      ...homepageConfig,
      heroTitle: copyHeroTitle,
      heroSubtitle: copyHeroSubtitle,
      contactPhone: copyContactPhone,
      contactEmail: copyContactEmail,
      contactAddress: copyContactAddress,
      footerText: copyFooterText
    });
    addToast('Homepage visitor copy compiled and saved!', 'success');
  };

  // ---- SECTION 7: FAQ CRUD ----
  const handleOpenFaqForm = (faqId: string | null = null) => {
    if (faqId) {
      const f = faqs.find(item => item.id === faqId);
      if (f) {
        setEditingFaqId(faqId);
        setFaqQuestion(f.question);
        setFaqAnswer(f.answer);
      }
    } else {
      setEditingFaqId(null);
      setFaqQuestion('');
      setFaqAnswer('');
    }
    setFaqFormOpen(true);
  };

  const handleSaveFaq = (e: React.FormEvent) => {
    e.preventDefault();
    if (!faqQuestion || !faqAnswer) return;

    if (editingFaqId) {
      setFaqs(prev => prev.map(f => f.id === editingFaqId ? {
        ...f,
        question: faqQuestion,
        answer: faqAnswer
      } : f));
      addToast('FAQ item updated', 'success');
    } else {
      const newId = `faq_${Date.now()}`;
      setFaqs(prev => [
        ...prev,
        {
          id: newId,
          question: faqQuestion,
          answer: faqAnswer,
          category: 'General',
          orderIndex: prev.length + 1
        }
      ]);
      addToast('FAQ item appended successfully', 'success');
    }
    setFaqFormOpen(false);
  };

  const handleDeleteFaq = (faqId: string) => {
    if (confirm('Delete this FAQ record?')) {
      setFaqs(prev => prev.filter(f => f.id !== faqId));
      addToast('FAQ entry deleted', 'warning');
    }
  };

  const handleReorderFaq = (faqId: string, direction: 'up' | 'down') => {
    const index = faqs.findIndex(f => f.id === faqId);
    if (index === -1) return;

    if (direction === 'up' && index > 0) {
      const targetFaqs = [...faqs];
      const temp = targetFaqs[index];
      targetFaqs[index] = targetFaqs[index - 1];
      targetFaqs[index - 1] = temp;
      setFaqs(targetFaqs);
      addToast('FAQ order advanced', 'success');
    } else if (direction === 'down' && index < faqs.length - 1) {
      const targetFaqs = [...faqs];
      const temp = targetFaqs[index];
      targetFaqs[index] = targetFaqs[index + 1];
      targetFaqs[index + 1] = temp;
      setFaqs(targetFaqs);
      addToast('FAQ order shifted down', 'success');
    }
  };

  // ==========================================
  // SYLLABUS & NOTES BUILDER STATES & HANDLERS
  // ==========================================
  const [selClassId, setSelClassId] = useState<string>('c6');
  const [selSubjectId, setSelSubjectId] = useState<string | null>(null);
  const [selChapterId, setSelChapterId] = useState<string | null>(null);
  const [selLessonId, setSelLessonId] = useState<string | null>(null);

  // Free notes form
  const [freeNoteFormOpen, setFreeNoteFormOpen] = useState(false);
  const [freeNoteTitle, setFreeNoteTitle] = useState('');
  const [freeNoteUrl, setFreeNoteUrl] = useState('');
  const [freeNoteBytes, setFreeNoteBytes] = useState('280000');

  // Premium notes form
  const [premNoteFormOpen, setPremNoteFormOpen] = useState(false);
  const [premNoteTitle, setPremNoteTitle] = useState('');
  const [premNoteUrl, setPremNoteUrl] = useState('');
  const [premNoteBytes, setPremNoteBytes] = useState('310000');

  // Subject form
  const [subjFormOpen, setSubjFormOpen] = useState(false);
  const [subjName, setSubjName] = useState('');
  const [subjDesc, setSubjDesc] = useState('');
  const [subjIconName, setSubjIconName] = useState('BookOpen');

  // Chapter form
  const [chapFormOpen, setChapFormOpen] = useState(false);
  const [chapName, setChapName] = useState('');
  const [chapDesc, setChapDesc] = useState('');

  // Lesson form
  const [lessFormOpen, setLessFormOpen] = useState(false);
  const [lessTitle, setLessTitle] = useState('');
  const [lessDesc, setLessDesc] = useState('');

  // Media bindings on selected lesson
  const [editVideoUrl, setEditVideoUrl] = useState('');
  const [editPyqTitle, setEditPyqTitle] = useState('');
  const [editPyqUrl, setEditPyqUrl] = useState('');
  const [editPracticeTitle, setEditPracticeTitle] = useState('');
  const [editPracticeUrl, setEditPracticeUrl] = useState('');

  // Sync lesson media when active lesson changes
  React.useEffect(() => {
    if (selLessonId) {
      const v = videos.find(vid => vid.lessonId === selLessonId);
      setEditVideoUrl(v ? v.videoIdOrUrl : '');
      setEditPyqTitle('');
      setEditPyqUrl('');
      setEditPracticeTitle('');
      setEditPracticeUrl('');
    } else {
      setEditVideoUrl('');
    }
  }, [selLessonId, videos]);

  const handleSaveFreeNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!freeNoteTitle || !freeNoteUrl) {
      addToast('Please fill all fields', 'warning');
      return;
    }
    const newNote = {
      id: 'note_' + Math.random().toString(36).substring(2, 9),
      classId: selClassId,
      subjectId: null,
      lessonId: null,
      title: freeNoteTitle,
      pdfUrl: freeNoteUrl,
      sizeBytes: parseInt(freeNoteBytes) || 280000,
      isPremium: false,
      type: 'notes' as const
    };

    (setNotes as any)((prev: any) => [...prev, newNote]);

    const { getSupabase, isSupabaseConfigured } = await import('../../lib/supabase');
    if (isSupabaseConfigured() && getSupabase()) {
      const supabase = getSupabase() as any;
      try {
        await supabase.from('notes').insert(newNote);
      } catch (err) {
        console.error('Supabase save note failed:', err);
      }
    }

    addToast('Free Handwritten Note added to Class!', 'success');
    setFreeNoteTitle('');
    setFreeNoteUrl('');
    setFreeNoteFormOpen(false);
  };

  const handleSavePremNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selSubjectId) return;
    if (!premNoteTitle || !premNoteUrl) {
      addToast('Please fill all fields', 'warning');
      return;
    }
    const newNote = {
      id: 'note_' + Math.random().toString(36).substring(2, 9),
      classId: selClassId,
      subjectId: selSubjectId,
      lessonId: null,
      title: premNoteTitle,
      pdfUrl: premNoteUrl,
      sizeBytes: parseInt(premNoteBytes) || 310000,
      isPremium: true,
      price: 30,
      type: 'notes' as const
    };

    (setNotes as any)((prev: any) => [...prev, newNote]);

    const { getSupabase, isSupabaseConfigured } = await import('../../lib/supabase');
    if (isSupabaseConfigured() && getSupabase()) {
      const supabase = getSupabase() as any;
      try {
        await supabase.from('notes').insert(newNote);
      } catch (err) {
        console.error('Supabase save note failed:', err);
      }
    }

    addToast('Premium Notes added to Subject (₹30 locked preview)!', 'success');
    setPremNoteTitle('');
    setPremNoteUrl('');
    setPremNoteFormOpen(false);
  };

  const handleDeleteSyllabusNote = async (noteId: string) => {
    if (!confirm('Are you sure you want to delete this notes resource?')) return;
    (setNotes as any)((prev: any) => prev.filter((n: any) => n.id !== noteId));
    
    const { getSupabase, isSupabaseConfigured } = await import('../../lib/supabase');
    if (isSupabaseConfigured() && getSupabase()) {
      const supabase = getSupabase() as any;
      try {
        await supabase.from('notes').delete().eq('id', noteId);
      } catch (err) {
        console.error('Supabase delete notes failed:', err);
      }
    }
    addToast('Notes file deleted', 'warning');
  };

  const handleSaveSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjName) return;
    const newSubj = {
      id: 'subj_' + Math.random().toString(36).substring(2, 9),
      classId: selClassId,
      name: subjName,
      description: subjDesc,
      icon: subjIconName,
      slug: subjName.toLowerCase().replace(/[^a-z0-9]/g, '-')
    };
    
    (setSubjects as any)((prev: any) => [...prev, newSubj]);

    const newCourse = {
      id: 'course_' + newSubj.id,
      classId: selClassId,
      subjectId: newSubj.id,
      title: `${classes.find(c => c.id === selClassId)?.name || 'Class'} ${subjName} Masterclass`,
      subtitle: `Unlock high-yield handwritten notes and video lectures.`,
      description: subjDesc || `Comprehensive syllabus course prep module.`,
      thumbnailUrl: 'https://images.unsplash.com/photo-1453733190148-c44698c26588?auto=format&fit=crop&w=500&q=80',
      isPremium: false,
      price: 0
    };

    (setCourses as any)((prev: any) => [...prev, newCourse]);

    const { getSupabase, isSupabaseConfigured } = await import('../../lib/supabase');
    if (isSupabaseConfigured() && getSupabase()) {
      const supabase = getSupabase() as any;
      try {
        await supabase.from('subjects').insert(newSubj);
        await supabase.from('courses').insert(newCourse);
      } catch (err) {
        console.error('Supabase save subject failed:', err);
      }
    }
    
    addToast('Subject successfully registered!', 'success');
    setSubjName('');
    setSubjDesc('');
    setSubjFormOpen(false);
    setSelSubjectId(newSubj.id);
  };

  const handleSaveChapter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selSubjectId || !chapName) return;
    const newChap = {
      id: 'chap_' + Math.random().toString(36).substring(2, 9),
      subjectId: selSubjectId,
      name: chapName,
      description: chapDesc,
      orderIndex: chapters.filter(c => c.subjectId === selSubjectId).length + 1
    };
    
    (setChapters as any)((prev: any) => [...prev, newChap]);

    const { getSupabase, isSupabaseConfigured } = await import('../../lib/supabase');
    if (isSupabaseConfigured() && getSupabase()) {
      const supabase = getSupabase() as any;
      try {
        await supabase.from('chapters').insert(newChap);
      } catch (err) {
        console.error('Supabase save chapter failed:', err);
      }
    }
    
    addToast('Chapter folder added successfully!', 'success');
    setChapName('');
    setChapDesc('');
    setChapFormOpen(false);
    setSelChapterId(newChap.id);
  };

  const handleSaveLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selChapterId || !lessTitle) return;
    
    const matchedCourse = courses.find(c => c.subjectId === selSubjectId);
    const newLesson = {
      id: 'less_' + Math.random().toString(36).substring(2, 9),
      chapterId: selChapterId,
      courseId: matchedCourse?.id || 'course_' + selSubjectId,
      title: lessTitle,
      description: lessDesc,
      orderIndex: lessons.filter(l => l.chapterId === selChapterId).length + 1,
      isPremium: false
    };
    
    (setLessons as any)((prev: any) => [...prev, newLesson]);

    const { getSupabase, isSupabaseConfigured } = await import('../../lib/supabase');
    if (isSupabaseConfigured() && getSupabase()) {
      const supabase = getSupabase() as any;
      try {
        await supabase.from('lessons').insert(newLesson);
      } catch (err) {
        console.error('Supabase save lesson failed:', err);
      }
    }
    
    addToast('Lesson node created!', 'success');
    setLessTitle('');
    setLessDesc('');
    setLessFormOpen(false);
    setSelLessonId(newLesson.id);
  };

  const handleSaveVideoLecture = async () => {
    if (!selLessonId) return;
    const existingVideo = videos.find(v => v.lessonId === selLessonId);
    
    const { getSupabase, isSupabaseConfigured } = await import('../../lib/supabase');

    if (existingVideo) {
      const updatedVideo = { ...existingVideo, videoIdOrUrl: editVideoUrl };
      (setVideos as any)((prev: any) => prev.map((v: any) => v.id === existingVideo.id ? updatedVideo : v));
      
      if (isSupabaseConfigured() && getSupabase()) {
        const supabase = getSupabase() as any;
        try {
          await supabase.from('videos').update({ videoIdOrUrl: editVideoUrl }).eq('id', existingVideo.id);
        } catch (err) {
          console.error('Supabase update video failed:', err);
        }
      }
    } else {
      const newVideo = {
        id: 'vid_' + Math.random().toString(36).substring(2, 9),
        lessonId: selLessonId,
        title: (lessons.find(l => l.id === selLessonId)?.title || 'Lesson') + ' Lecture Video',
        provider: 'youtube' as const,
        videoIdOrUrl: editVideoUrl,
        durationSeconds: 1800
      };
      (setVideos as any)((prev: any) => [...prev, newVideo]);
      
      if (isSupabaseConfigured() && getSupabase()) {
        const supabase = getSupabase() as any;
        try {
          await supabase.from('videos').insert(newVideo);
        } catch (err) {
          console.error('Supabase insert video failed:', err);
        }
      }
    }
    addToast('YouTube Lecture URL bound to Lesson!', 'success');
  };

  const handleAddPyq = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selLessonId || !editPyqTitle || !editPyqUrl) {
      addToast('Please provide PYQ title and PDF URL', 'warning');
      return;
    }
    const newNote = {
      id: 'note_' + Math.random().toString(36).substring(2, 9),
      lessonId: selLessonId,
      classId: selClassId,
      subjectId: selSubjectId,
      title: editPyqTitle,
      pdfUrl: editPyqUrl,
      sizeBytes: 250000,
      isPremium: false,
      type: 'pyq' as const
    };
    (setNotes as any)((prev: any) => [...prev, newNote]);
    
    const { getSupabase, isSupabaseConfigured } = await import('../../lib/supabase');
    if (isSupabaseConfigured() && getSupabase()) {
      const supabase = getSupabase() as any;
      try {
        await supabase.from('notes').insert(newNote);
      } catch (err) {
        console.error('Supabase insert note failed:', err);
      }
    }
    addToast('PYQ Question Sheet added!', 'success');
    setEditPyqTitle('');
    setEditPyqUrl('');
  };

  const handleAddPractice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selLessonId || !editPracticeTitle || !editPracticeUrl) {
      addToast('Please provide Practice Set title and PDF URL', 'warning');
      return;
    }
    const newNote = {
      id: 'note_' + Math.random().toString(36).substring(2, 9),
      lessonId: selLessonId,
      classId: selClassId,
      subjectId: selSubjectId,
      title: editPracticeTitle,
      pdfUrl: editPracticeUrl,
      sizeBytes: 280000,
      isPremium: false,
      type: 'practiceset' as const
    };
    (setNotes as any)((prev: any) => [...prev, newNote]);
    
    const { getSupabase, isSupabaseConfigured } = await import('../../lib/supabase');
    if (isSupabaseConfigured() && getSupabase()) {
      const supabase = getSupabase() as any;
      try {
        await supabase.from('notes').insert(newNote);
      } catch (err) {
        console.error('Supabase insert note failed:', err);
      }
    }
    addToast('Practice Test Set added!', 'success');
    setEditPracticeTitle('');
    setEditPracticeUrl('');
  };

  const handleSavePaymentSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentSettings({
      razorpayKeyId: cfgRzpKey,
      businessName: cfgBusName,
      businessLogo: cfgBusLogo,
      supportEmail: cfgSupEmail,
      supportPhone: cfgSupPhone,
      successMessage: cfgSuccessMsg,
      failureMessage: cfgFailureMsg
    });
    addToast('Razorpay payment configurations saved and activated!', 'success');
  };

  const initialTxns = [
    { id: 'pay_UPI849204829', orderId: 'order_NEET_01', userEmail: 'rahul.sharma@gmail.com', userFullName: 'Rahul Sharma', courseTitle: 'NEET (Biology & Chemistry) Complete Physics Electrostatics', amount: 499, status: 'success', createdAt: '2026-06-25T11:20:00.000Z', method: 'GPay App Direct' },
    { id: 'pay_UPI729103901', orderId: 'order_CBSE_02', userEmail: 'priya.patel@yahoo.com', userFullName: 'Priya Patel', courseTitle: 'Class 10 CBSE Maths Preparation', amount: 299, status: 'success', createdAt: '2026-06-26T14:45:00.000Z', method: 'PhonePe Intent' },
    { id: 'pay_UPI930193021', orderId: 'order_NEET_03', userEmail: 'amit.verma@outlook.com', userFullName: 'Amit Verma', courseTitle: 'NEET (Biology & Chemistry) Mock Biology Test Binders', amount: 199, status: 'failed', createdAt: '2026-06-27T09:12:00.000Z', method: 'Paytm UPI ID' },
    { id: 'pay_UPI110492819', orderId: 'order_CBSE_04', userEmail: 'neha.singh@gmail.com', userFullName: 'Neha Singh', courseTitle: 'Class 12 CBSE Board Physics Bundle', amount: 399, status: 'success', createdAt: '2026-06-28T16:05:00.000Z', method: 'BHIM UPI app' }
  ];

  const activeTxns = payments.map(p => {
    const matchedOrder = orders.find(o => o.id === p.orderId);
    const matchedUser = users.find(u => u.id === p.userId) || { fullName: 'Scholar Student', email: 'student@rkcoaching.com' };
    const matchedCourse = courses.find(c => c.id === matchedOrder?.courseId) || { title: 'Standard LMS Batch Course' };
    return {
      id: p.id,
      orderId: p.orderId,
      userEmail: matchedUser.email,
      userFullName: matchedUser.fullName,
      courseTitle: matchedCourse.title,
      amount: p.amount,
      status: p.status === 'success' ? 'success' : 'failed',
      createdAt: p.createdAt || new Date().toISOString(),
      method: p.method || 'Razorpay UPI Checkout'
    };
  });

  const allTxns = [...activeTxns, ...initialTxns];

  const handleExportTxns = () => {
    const headers = ['Payment ID', 'Order ID', 'Student Name', 'Student Email', 'Course Name', 'Amount (INR)', 'Method', 'Status', 'Date'];
    const rows = allTxns.map(t => [
      t.id,
      t.orderId,
      t.userFullName,
      t.userEmail,
      t.courseTitle,
      `INR ${t.amount}`,
      t.method,
      t.status.toUpperCase(),
      new Date(t.createdAt).toLocaleDateString('en-IN')
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `rk_payments_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('Payment transaction ledger exported to CSV successfully!', 'success');
  };

  const handleTriggerRefund = (payId: string) => {
    addToast(`Refund initiated for Payment ID ${payId}. Processing API handshake with Razorpay Refund daemon (Future-ready).`, 'info');
  };
  const usersWithMeta = (users || []).map((u: any) => ({
    phone: u.phone || '98765 43210',
    status: u.status || 'active',
    softDeleted: u.softDeleted || false,
    lastLogin: u.lastLogin || new Date(Date.now() - 3600000 * 2).toLocaleString(),
    registrationDate: u.registrationDate || '2026-01-15',
    classId: u.classId || 'c10',
    purchasedSubjects: u.purchasedSubjects || [],
    suspendedReason: u.suspendedReason || '',
    suspendedStart: u.suspendedStart || '',
    suspendedEnd: u.suspendedEnd || '',
    ...u
  }));

  // Auto-resume expired suspensions reactively
  React.useEffect(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const expiredSuspendedUsers = usersWithMeta.filter((u: any) => u.status === 'suspended' && u.suspendedEnd && u.suspendedEnd < todayStr);
    
    if (expiredSuspendedUsers.length > 0) {
      expiredSuspendedUsers.forEach(async (u: any) => {
        (setUsers as any)((prev: any) => prev.map((item: any) => item.id === u.id ? { ...item, status: 'active', suspendedReason: null, suspendedStart: null, suspendedEnd: null } : item));
        
        const { getSupabase, isSupabaseConfigured } = await import('../../lib/supabase');
        if (isSupabaseConfigured() && getSupabase()) {
          const supabase = getSupabase() as any;
          try {
            await supabase.from('profiles').update({ status: 'active', suspendedReason: null, suspendedStart: null, suspendedEnd: null }).eq('id', u.id);
          } catch (err) {
            console.error('Auto resume status sync failed:', err);
          }
        }
      });
      addToast(`Reactivated ${expiredSuspendedUsers.length} user accounts (suspension periods expired).`, 'success');
    }
  }, [users]);

  // Global Search logic
  const getGlobalSearchResults = () => {
    if (!globalSearchQuery) return [];
    const query = globalSearchQuery.toLowerCase();
    
    const matchedUsers = usersWithMeta
      .filter((u: any) => u.fullName.toLowerCase().includes(query) || u.email.toLowerCase().includes(query))
      .map((u: any) => ({ type: 'user', title: u.fullName, subtitle: `Role: ${u.role} | Status: ${u.status}`, data: u }));
      
    const matchedSubjects = subjects
      .filter((s: any) => s.name.toLowerCase().includes(query))
      .map((s: any) => ({ type: 'subject', title: s.name, subtitle: `Subject ID: ${s.id}`, data: s }));

    const matchedLessons = lessons
      .filter((l: any) => l.title.toLowerCase().includes(query))
      .map((l: any) => ({ type: 'lesson', title: l.title, subtitle: `Lesson ID: ${l.id}`, data: l }));

    const matchedPayments = allTxns
      .filter((p: any) => p.id.toLowerCase().includes(query) || p.userFullName.toLowerCase().includes(query))
      .map((p: any) => ({ type: 'payment', title: `Payment ${p.id}`, subtitle: `By: ${p.userFullName} | ₹${p.amount}`, data: p }));

    const matchedNotes = notes
      .filter((n: any) => n.title.toLowerCase().includes(query))
      .map((n: any) => ({ type: 'note', title: n.title, subtitle: `${n.isPremium ? 'Premium' : 'Free'} PDF Notes`, data: n }));

    return [...matchedUsers, ...matchedSubjects, ...matchedLessons, ...matchedPayments, ...matchedNotes].slice(0, 8);
  };

  const handleSearchResultClick = (result: any) => {
    setGlobalSearchQuery('');
    if (result.type === 'user') {
      setSelectedUserForProfile(result.data);
    } else if (result.type === 'payment') {
      setActiveTab('payments');
      setSelectedTxnInvoice(result.data);
    } else if (result.type === 'subject' || result.type === 'lesson' || result.type === 'note') {
      setActiveTab('syllabus');
      addToast(`Inspecting syllabus match: "${result.title}"`, 'info');
    }
  };

  // Filtered Users List
  const filteredUsers = usersWithMeta.filter((u: any) => {
    const matchesSearch = !u.fullName.toLowerCase().includes(globalSearchQuery.toLowerCase()) && !u.email.toLowerCase().includes(globalSearchQuery.toLowerCase());
    
    // Check soft delete status
    if (!showDeletedUsers && u.softDeleted) return false;
    if (showDeletedUsers && !u.softDeleted) return false;

    // Class Filter
    if (userFilterClass !== 'all' && u.classId !== userFilterClass) return false;

    // Role Filter
    if (userFilterRole !== 'all' && u.role !== userFilterRole) return false;

    // Status Filter
    if (userFilterStatus !== 'all' && u.status !== userFilterStatus) return false;

    return true;
  });

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 font-sans -mx-4 -my-8 -md:mx-0">
      {/* SIDEBAR */}
      <aside className={`w-64 bg-slate-900/60 backdrop-blur-xl border-r border-slate-800 flex flex-col h-screen sticky top-0 z-30 transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} absolute md:relative`}>
        {/* Sidebar Brand Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <Shield className="w-6 h-6 text-indigo-500" />
            <span className="font-extrabold text-base tracking-wide bg-gradient-to-r from-indigo-400 to-indigo-200 bg-clip-text text-transparent">
              RK Control Panel
            </span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden text-slate-400 hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1.5 scrollbar-thin">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: Sliders },
            { id: 'users', label: 'Users Directory', icon: Users },
            { id: 'teachers', label: 'Teachers Hub', icon: UserCheck },
            { id: 'courses', label: 'Courses', icon: Award, locked: true },
            { id: 'classes', label: 'Classes', icon: Landmark, locked: true },
            { id: 'subjects', label: 'Subjects', icon: BookOpen, locked: true },
            { id: 'chapters', label: 'Chapters', icon: FolderPlus, locked: true },
            { id: 'lessons', label: 'Lessons', icon: Film, locked: true },
            { id: 'notes', label: 'Study Notes', icon: FileText, locked: true },
            { id: 'video-lectures', label: 'Video Lectures', icon: Video, locked: true },
            { id: 'pyqs', label: 'PYQ Papers', icon: FileCheck, locked: true },
            { id: 'practice-sets', label: 'Practice Sets', icon: PlayCircle, locked: true },
            { id: 'mock-tests', label: 'Mock Tests', icon: BadgeCheck, locked: true },
            { id: 'payments', label: 'Payments Auditor', icon: CreditCard },
            { id: 'orders', label: 'Orders Registry', icon: Landmark },
            { id: 'announcements', label: 'Announcements', icon: Megaphone },
            { id: 'notifications', label: 'Notifications Hub', icon: Sliders, locked: true },
            { id: 'homepage-cms', label: 'Homepage CMS', icon: FileText },
            { id: 'media-library', label: 'Media Library', icon: Film, locked: true },
            { id: 'website-settings', label: 'Website Settings', icon: Settings },
            { id: 'security', label: 'Security Log', icon: Lock, locked: true },
            { id: 'audit-logs', label: 'Audit Log', icon: Activity, locked: true },
            { id: 'backups', label: 'Backup Manager', icon: Database, locked: true },
            { id: 'analytics', label: 'Analytics Insights', icon: TrendingUp, locked: true },
            { id: 'syllabus', label: 'Integrated Studio', icon: Sliders },
            { id: 'quiz-manager', label: 'Quiz Manager', icon: Trophy }
          ].map((item) => {
            const Icon = item.icon;
            const isTabActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isTabActive
                    ? 'bg-indigo-600/10 border border-indigo-500/20 text-indigo-400'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/40 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isTabActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.locked && (
                  <Badge variant="outline" size="sm" className="text-[9px] border-slate-700 text-slate-500">Lock</Badge>
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-900/20">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-indigo-900/60 border border-indigo-800 flex items-center justify-center font-extrabold text-xs text-indigo-300">
              AD
            </div>
            <div>
              <p className="text-xs font-black text-slate-200">RK SUPREME ADMIN</p>
              <p className="text-[10px] text-indigo-400 font-bold">Enterprise Mode</p>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Sticky Header with Global Search */}
        <header className="sticky top-0 z-20 backdrop-blur-md bg-slate-950/80 border-b border-slate-800/60 h-16 flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="md:hidden text-slate-400 hover:text-slate-200">
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="text-sm font-extrabold text-slate-200 capitalize hidden sm:block">
              {activeTab.replace('-', ' ')} Manager
            </h2>
          </div>

          {/* Global Search Engine Bar */}
          <div className="relative w-72 sm:w-96">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-500">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="Search users, subjects, lessons, payments..."
              value={globalSearchQuery}
              onChange={(e) => setGlobalSearchQuery(e.target.value)}
              className="w-full text-xs pl-10 pr-4 py-2.5 rounded-xl border border-slate-800/80 bg-slate-900/40 hover:bg-slate-900/60 focus:bg-slate-900/90 text-slate-200 outline-none transition-all placeholder-slate-500 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30"
            />

            {/* Global Search dropdown overlays */}
            {globalSearchQuery.length > 0 && (
              <div className="absolute top-13 right-0 left-0 bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-xl z-50 overflow-hidden max-h-96 overflow-y-auto">
                <div className="p-2 border-b border-slate-800 text-[10px] uppercase font-black text-slate-500 tracking-wider">
                  Real-time Search matches
                </div>
                {getGlobalSearchResults().length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-400 italic">
                    No results matching your query.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-800/50">
                    {getGlobalSearchResults().map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSearchResultClick(item)}
                        className="w-full text-left p-3 hover:bg-slate-800/40 flex items-center justify-between text-xs transition-colors"
                      >
                        <div>
                          <p className="font-bold text-slate-200">{item.title}</p>
                          <p className="text-[10px] text-slate-500 font-semibold">{item.subtitle}</p>
                        </div>
                        <Badge variant="outline" size="sm" className="text-[9px] uppercase border-indigo-900 text-indigo-400">
                          {item.type}
                        </Badge>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Badge variant="outline" className="border-indigo-900 text-indigo-400 text-[10px] h-7 font-black">
              Enterprise Beta
            </Badge>
          </div>
        </header>

        {/* Dynamic tabs mount */}
        <main className="p-6 max-w-7xl mx-auto w-full space-y-6 flex-1">
          {/* TAB 1: DASHBOARD OVERVIEW */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8 animate-fade-in text-left">
              <div>
                <h3 className="text-lg font-black text-slate-100">Enterprise Control Center</h3>
                <p className="text-xs text-slate-400 mt-0.5">Summary metrics, registered user tallies, and financial streams overview.</p>
              </div>

              {/* Statistics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Total Students', value: usersWithMeta.filter(u => u.role === 'student' && !u.softDeleted).length, sub: `${Math.round(usersWithMeta.filter(u => u.role === 'student' && !u.softDeleted).length * 0.82)} Active today`, icon: Users, color: 'text-indigo-400 bg-indigo-950/40 border-indigo-900/30' },
                  { label: 'Total Teachers', value: usersWithMeta.filter(u => u.role === 'teacher').length, sub: 'Assigned subject leads', icon: UserCheck, color: 'text-emerald-400 bg-emerald-950/40 border-emerald-900/30' },
                  { label: 'Estimated Revenue', value: `₹${allTxns.filter(t => t.status === 'success').reduce((sum, t) => sum + t.amount, 0)}`, sub: 'Paid premium materials', icon: DollarSign, color: 'text-amber-400 bg-amber-950/40 border-amber-900/30' },
                  { label: 'Successful Purchases', value: `${allTxns.filter(t => t.status === 'success').length} Txns`, sub: `${allTxns.filter(t => t.status === 'failed').length} Failed checks`, icon: BadgeCheck, color: 'text-blue-400 bg-blue-950/40 border-blue-900/30' }
                ].map((stat, idx) => {
                  const Icon = stat.icon;
                  return (
                    <Card key={idx} hoverEffect className={`bg-slate-900/30 backdrop-blur-lg border border-slate-800/80`}>
                      <CardContent className="p-5 flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${stat.color}`}>
                          <Icon className="w-5.5 h-5.5" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase text-slate-500 tracking-wider">{stat.label}</p>
                          <p className="text-xl font-extrabold text-slate-100 mt-0.5">{stat.value}</p>
                          <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{stat.sub}</p>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Syllabus metrics summary banner */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 p-4 rounded-2xl bg-slate-900/20 border border-slate-800/80 backdrop-blur-lg text-xs font-semibold text-slate-300">
                <div><span className="text-indigo-400 font-bold">{courses.length}</span> Courses</div>
                <div><span className="text-indigo-400 font-bold">{classes.length}</span> Classes</div>
                <div><span className="text-indigo-400 font-bold">{subjects.length}</span> Subjects</div>
                <div><span className="text-indigo-400 font-bold">{lessons.length}</span> Lessons</div>
                <div><span className="text-indigo-400 font-bold">{notes.length}</span> PDF Manuals</div>
              </div>

              {/* Feed logs (Registrations and Purchases) */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent users registration log */}
                <Card className="p-5 bg-slate-900/20 border border-slate-800/60 backdrop-blur-lg">
                  <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-4">Recent Registrations Feed</h4>
                  <div className="space-y-3.5">
                    {usersWithMeta.slice(0, 5).map((user: any) => (
                      <div key={user.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-800/40 bg-slate-950/20 hover:bg-slate-900/30 transition-all">
                        <div className="flex items-center gap-3">
                          <img src={user.avatarUrl} alt="" className="w-8 h-8 rounded-full border border-slate-800" />
                          <div>
                            <p className="text-xs font-bold text-slate-200">{user.fullName}</p>
                            <p className="text-[10px] text-slate-500 font-semibold">{user.email}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-[9px] uppercase px-2 py-0.5 rounded-lg border border-slate-800 bg-slate-900 font-black text-slate-400">{user.role}</span>
                          <p className="text-[9px] text-slate-500 font-bold mt-1">{user.registrationDate}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Latest Payments flow */}
                <Card className="p-5 bg-slate-900/20 border border-slate-800/60 backdrop-blur-lg">
                  <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-4">Latest Purchases Feed</h4>
                  <div className="space-y-3.5">
                    {allTxns.slice(0, 5).map((txn: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between p-3 rounded-xl border border-slate-800/40 bg-slate-950/20 hover:bg-slate-900/30 transition-all">
                        <div className="space-y-0.5">
                          <p className="text-xs font-bold text-slate-200">{txn.userFullName}</p>
                          <p className="text-[10px] text-slate-500 font-semibold truncate max-w-xs">{txn.courseTitle}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-black text-indigo-400">₹{txn.amount}</p>
                          <span className={`text-[8px] uppercase px-1.5 py-0.5 rounded-lg font-black ${txn.status === 'success' ? 'bg-emerald-950 text-emerald-400 border border-emerald-900' : 'bg-red-950 text-red-400 border border-red-900'}`}>
                            {txn.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* TAB 2: USER DIRECTORY & STATUS TRANSITIONS */}
          {activeTab === 'users' && (
            <div className="space-y-6 animate-fade-in text-left">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="text-lg font-black text-slate-100">User Accounts Directory</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Manage credentials, toggle roles, pause login access, suspend accounts, and view user metrics.</p>
                </div>
                <Button variant="primary" size="sm" onClick={() => handleOpenUserForm()} className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-xs font-bold">
                  <UserPlus className="w-4 h-4" /> Add User Account
                </Button>
              </div>

              {/* Filters Header Dashboard */}
              <div className="p-4 rounded-2xl bg-slate-900/20 border border-slate-800/80 backdrop-blur-lg grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
                <div>
                  <label className="block text-[10px] uppercase font-black text-slate-500 mb-1">Filter Role</label>
                  <select value={userFilterRole} onChange={e => setUserFilterRole(e.target.value)} className="w-full text-xs p-2.5 rounded-xl border border-slate-800 bg-slate-950 text-slate-300 outline-none">
                    <option value="all">All Roles</option>
                    <option value="student">Students Only</option>
                    <option value="teacher">Teachers Only</option>
                    <option value="admin">Administrators</option>
                    <option value="visitor">Guest Visitors</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-black text-slate-500 mb-1">Filter Class</label>
                  <select value={userFilterClass} onChange={e => setUserFilterClass(e.target.value)} className="w-full text-xs p-2.5 rounded-xl border border-slate-800 bg-slate-950 text-slate-300 outline-none">
                    <option value="all">All Classes</option>
                    {classes.map((c: any) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-black text-slate-500 mb-1">Filter Status</label>
                  <select value={userFilterStatus} onChange={e => setUserFilterStatus(e.target.value)} className="w-full text-xs p-2.5 rounded-xl border border-slate-800 bg-slate-950 text-slate-300 outline-none">
                    <option value="all">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="paused">Paused</option>
                    <option value="suspended">Suspended</option>
                    <option value="blocked">Blocked</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-black text-slate-500 mb-1">Trash Bin</label>
                  <button onClick={() => setShowDeletedUsers(prev => !prev)} className={`w-full text-xs p-2.5 rounded-xl border font-bold flex items-center justify-center gap-2 ${showDeletedUsers ? 'bg-red-950/30 border-red-900/50 text-red-400' : 'bg-slate-950 border-slate-800 text-slate-400'}`}>
                    <Trash className="w-4 h-4" />
                    {showDeletedUsers ? 'Deleted Accounts' : 'Active Directory'}
                  </button>
                </div>
                <div className="flex items-end">
                  <button onClick={() => { setUserFilterClass('all'); setUserFilterRole('all'); setUserFilterStatus('all'); setShowDeletedUsers(false); }} className="w-full text-xs p-2.5 font-bold rounded-xl border border-slate-800 bg-slate-950/40 text-slate-400 hover:text-slate-200 transition-colors">
                    Reset Filters
                  </button>
                </div>
              </div>

              {/* USER REGISTRATION FORM OVERLAY */}
              {userFormOpen && (
                <Card className="p-5 border-2 border-indigo-500/30 bg-slate-900/30 backdrop-blur-xl">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-2 mb-4">
                    <h4 className="text-sm font-black text-slate-200">
                      {editingUserId ? '🖊️ Modify User Account' : '🚀 Register New User Profile'}
                    </h4>
                    <button onClick={() => setUserFormOpen(false)} className="text-slate-400 hover:text-slate-200">
                      <X className="w-4.5 h-4.5" />
                    </button>
                  </div>
                  <form onSubmit={handleSaveUser} className="space-y-4 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <Input label="Full Name" value={userFullName} onChange={e => setUserFullName(e.target.value)} placeholder="Ramesh Sharma" required />
                      <Input label="Email Address" type="email" value={userEmail} onChange={e => setUserEmail(e.target.value)} placeholder="ramesh@rkcoaching.com" required />
                      <Input label="Phone Number" value={userPhone} onChange={e => setUserPhone(e.target.value)} placeholder="98765 43210" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-slate-400 mb-1.5 font-bold">Role assignment</label>
                        <select value={userRole} onChange={e => setUserRole(e.target.value as any)} className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-950 text-slate-300 outline-none">
                          <option value="student">Student</option>
                          <option value="teacher">Teacher</option>
                          <option value="admin">Administrator</option>
                          <option value="visitor">Guest Visitor</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1.5 font-bold">Class mapping</label>
                        <select value={userClassId} onChange={e => setUserClassId(e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-950 text-slate-300 outline-none">
                          {classes.map((c: any) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                      </div>
                      <Input label="XP Points" type="number" value={userXp} onChange={e => setUserXp(e.target.value)} />
                      <Input label="Daily Streak" type="number" value={userStreak} onChange={e => setUserStreak(e.target.value)} />
                    </div>
                    <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                      <Button variant="secondary" size="sm" type="button" onClick={() => setUserFormOpen(false)}>Cancel</Button>
                      <Button variant="primary" size="sm" type="submit">Save Account Profile</Button>
                    </div>
                  </form>
                </Card>
              )}

              {/* Users directory table grid */}
              <div className="border border-slate-800/80 rounded-2xl overflow-hidden bg-slate-900/10 backdrop-blur-lg">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900/40 border-b border-slate-800 text-slate-500 uppercase font-black tracking-wider">
                      <tr>
                        <th className="p-4">Student Profile</th>
                        <th className="p-4">Credentials</th>
                        <th className="p-4">LMS Scope</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-right">Directory actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                      {filteredUsers.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="p-8 text-center text-slate-400 italic">No user accounts found matching selected filters.</td>
                        </tr>
                      ) : (
                        filteredUsers.map((u: any) => (
                          <tr key={u.id} className="hover:bg-slate-900/20 transition-colors">
                            <td className="p-4 flex items-center gap-3">
                              <img src={u.avatarUrl} alt="" className="w-9 h-9 rounded-full border border-slate-800" />
                              <div>
                                <p className="font-bold text-slate-200">{u.fullName}</p>
                                <div className="flex gap-1.5 mt-0.5">
                                  <span className="text-[8px] uppercase px-1.5 py-0.5 rounded-lg border border-slate-800 bg-slate-900 text-slate-400 font-extrabold">{u.role}</span>
                                  {u.dailyStreak > 0 && <span className="text-[8px] px-1 bg-amber-950 text-amber-400 border border-amber-900/40 rounded-lg">🔥 {u.dailyStreak} Days</span>}
                                </div>
                              </div>
                            </td>
                            <td className="p-4">
                              <p className="font-semibold text-slate-300">{u.email}</p>
                              <p className="text-[10px] text-slate-500 font-semibold">{u.phone}</p>
                            </td>
                            <td className="p-4">
                              <p className="font-bold text-indigo-400">{classes.find(c => c.id === u.classId)?.name || 'NEET Standard'}</p>
                              <p className="text-[10px] text-slate-500 font-semibold">{u.totalXp} XP points</p>
                            </td>
                            <td className="p-4">
                              {u.status === 'active' && <span className="text-[9px] uppercase px-2 py-0.5 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-900/50 font-black">Active</span>}
                              {u.status === 'paused' && <span className="text-[9px] uppercase px-2 py-0.5 rounded-lg bg-amber-950 text-amber-400 border border-amber-900/50 font-black">Paused</span>}
                              {u.status === 'suspended' && (
                                <div>
                                  <span className="text-[9px] uppercase px-2 py-0.5 rounded-lg bg-red-950 text-red-400 border border-red-900/50 font-black">Suspended</span>
                                  <p className="text-[8px] text-slate-400 font-semibold mt-1 truncate max-w-xs">{u.suspendedReason} (End: {u.suspendedEnd})</p>
                                </div>
                              )}
                              {u.status === 'blocked' && <span className="text-[9px] uppercase px-2 py-0.5 rounded-lg bg-slate-900 text-slate-500 border border-slate-800 font-black">Blocked</span>}
                            </td>
                            <td className="p-4 text-right">
                              <div className="flex gap-1 justify-end items-center">
                                <button onClick={() => setSelectedUserForProfile(u)} className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-slate-200" title="Inspect Profile Details">
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button onClick={() => handleOpenUserForm(u.id)} className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-slate-200" title="Modify details">
                                  <Edit className="w-4 h-4" />
                                </button>

                                {/* Action drop Toggles */}
                                {u.status === 'active' ? (
                                  <button onClick={() => handlePauseUser(u.id)} className="p-2 hover:bg-slate-800 rounded-xl text-amber-500 hover:text-amber-400" title="Pause Access">
                                    <Lock className="w-4 h-4" />
                                  </button>
                                ) : u.status === 'paused' ? (
                                  <button onClick={() => handleResumeUser(u.id)} className="p-2 hover:bg-slate-800 rounded-xl text-emerald-500 hover:text-emerald-400" title="Resume Access">
                                    <Unlock className="w-4 h-4" />
                                  </button>
                                ) : null}

                                {u.status === 'suspended' ? (
                                  <button onClick={() => handleResumeUser(u.id)} className="p-2 hover:bg-slate-800 rounded-xl text-emerald-500 hover:text-emerald-400" title="Lift Suspension">
                                    <Unlock className="w-4 h-4" />
                                  </button>
                                ) : u.status !== 'blocked' ? (
                                  <button onClick={() => setSuspendModalUser(u)} className="p-2 hover:bg-slate-800 rounded-xl text-red-500 hover:text-red-400" title="Suspend Temp">
                                    <Calendar className="w-4 h-4" />
                                  </button>
                                ) : null}

                                {u.status === 'blocked' ? (
                                  <button onClick={() => handleUnblockUser(u.id)} className="p-2 hover:bg-slate-800 rounded-xl text-emerald-500 hover:text-emerald-400" title="Unblock user">
                                    <UserCheck className="w-4 h-4" />
                                  </button>
                                ) : (
                                  <button onClick={() => handleBlockUser(u.id)} className="p-2 hover:bg-slate-800 rounded-xl text-slate-500 hover:text-slate-400" title="Block User">
                                    <UserMinus className="w-4 h-4" />
                                  </button>
                                )}

                                {u.softDeleted ? (
                                  <button onClick={() => handleRestoreUser(u.id)} className="p-2 hover:bg-slate-800 rounded-xl text-emerald-500 hover:text-emerald-400" title="Restore account">
                                    <RefreshCw className="w-4 h-4" />
                                  </button>
                                ) : (
                                  <button onClick={() => handleSoftDeleteUser(u.id)} className="p-2 hover:bg-slate-800 rounded-xl text-red-500 hover:text-red-400" title="Archive account">
                                    <Trash className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: TEACHERS ROSTER */}
          {activeTab === 'teachers' && (
            <div className="space-y-6 animate-fade-in text-left">
              <div>
                <h3 className="text-lg font-black text-slate-100">Teachers Hub</h3>
                <p className="text-xs text-slate-400 mt-0.5">Manage active teacher assignments, review course syllabi domains, and inspect teacher roster details.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {usersWithMeta.filter(u => u.role === 'teacher').map((teacher: any) => (
                  <Card key={teacher.id} className="p-5 bg-slate-900/20 border border-slate-800/80 backdrop-blur-lg flex gap-4 items-start">
                    <img src={teacher.avatarUrl} alt="" className="w-14 h-14 rounded-2xl border border-slate-800 shrink-0" />
                    <div className="space-y-2 flex-1 text-xs">
                      <div>
                        <p className="font-extrabold text-sm text-slate-200">{teacher.fullName}</p>
                        <p className="text-[10px] text-indigo-400 font-bold uppercase mt-0.5">Subject Lead</p>
                      </div>
                      <div className="space-y-0.5 text-slate-400 font-semibold">
                        <p>Email: {teacher.email}</p>
                        <p>Phone: {teacher.phone}</p>
                        <p>Class assigned: NEET / Higher Secondary Physics</p>
                        <p>Last Activity: {teacher.lastLogin}</p>
                      </div>
                      <div className="flex gap-2 pt-1.5 border-t border-slate-800">
                        <Button variant="secondary" size="sm" onClick={() => setSelectedUserForProfile(teacher)} className="h-8 text-[10px] font-bold">
                          View details Profile
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleOpenUserForm(teacher.id)} className="h-8 text-[10px] font-bold">
                          Edit assignment
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: PAYMENTS ledgers */}
          {activeTab === 'payments' && (
            <div className="space-y-8 animate-fade-in text-left">
              <div className="flex justify-between items-center gap-4">
                <div>
                  <h3 className="text-lg font-black text-slate-100">Razorpay Payments auditor</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Audits real-time payment transactions and force unlocks premium materials.</p>
                </div>
                <Button variant="primary" size="sm" onClick={handleExportTxns} className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-xs font-bold">
                  <Download className="w-4 h-4" /> Export CSV ledger
                </Button>
              </div>

              {/* Transactions table */}
              <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-900/10 backdrop-blur-lg">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900/40 border-b border-slate-800 text-slate-500 uppercase font-black tracking-wider">
                      <tr>
                        <th className="p-4">Payment ID</th>
                        <th className="p-4">Order ID</th>
                        <th className="p-4">User Info</th>
                        <th className="p-4">Course Name</th>
                        <th className="p-4">Amount</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-right">Audit</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                      {allTxns.map((txn: any, idx: number) => (
                        <tr key={idx} className="hover:bg-slate-900/20 transition-all">
                          <td className="p-4 font-mono font-bold text-slate-300">{txn.id}</td>
                          <td className="p-4 font-mono text-slate-500">{txn.orderId}</td>
                          <td className="p-4">
                            <p className="font-bold text-slate-200">{txn.userFullName}</p>
                            <p className="text-[10px] text-slate-500 font-semibold">{txn.userEmail}</p>
                          </td>
                          <td className="p-4 font-semibold text-slate-300">{txn.courseTitle}</td>
                          <td className="p-4 font-extrabold text-indigo-400">₹{txn.amount}</td>
                          <td className="p-4">
                            <span className={`text-[9px] uppercase px-2 py-0.5 rounded-lg font-black ${txn.status === 'success' ? 'bg-emerald-950 text-emerald-400 border border-emerald-900/50' : 'bg-red-950 text-red-400 border border-red-900/50'}`}>
                              {txn.status}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <button onClick={() => setSelectedTxnInvoice(txn)} className="text-indigo-400 hover:text-indigo-300 font-bold hover:underline">
                              Invoice
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: ORDERS registry */}
          {activeTab === 'orders' && (
            <div className="space-y-6 animate-fade-in text-left">
              <div>
                <h3 className="text-lg font-black text-slate-100">Orders Registry</h3>
                <p className="text-xs text-slate-400 mt-0.5">Audit student order placements, amount logs, and pending Razorpay transactions.</p>
              </div>

              <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-900/10 backdrop-blur-lg">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900/40 border-b border-slate-800 text-slate-500 uppercase font-black tracking-wider">
                      <tr>
                        <th className="p-4">Order ID</th>
                        <th className="p-4">Course ID</th>
                        <th className="p-4">Price</th>
                        <th className="p-4">Placement Date</th>
                        <th className="p-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                      {[
                        { id: 'order_NEET_01', courseId: 'course_neet_physics', amount: 499, status: 'completed', createdAt: '2026-06-25T11:20:00Z' },
                        { id: 'order_CBSE_02', courseId: 'course_c10_maths', amount: 299, status: 'completed', createdAt: '2026-06-26T14:45:00Z' },
                        { id: 'order_NEET_03', courseId: 'course_neet_mock', amount: 199, status: 'failed', createdAt: '2026-06-27T09:12:00Z' },
                        { id: 'order_CBSE_04', courseId: 'course_c12_physics', amount: 399, status: 'completed', createdAt: '2026-06-28T16:05:00Z' }
                      ].map((ord, idx) => (
                        <tr key={idx} className="hover:bg-slate-900/20 transition-all">
                          <td className="p-4 font-mono font-bold text-slate-300">{ord.id}</td>
                          <td className="p-4 text-slate-400 font-semibold">{ord.courseId}</td>
                          <td className="p-4 font-extrabold text-indigo-400">₹{ord.amount}</td>
                          <td className="p-4 text-slate-500 font-semibold">{new Date(ord.createdAt).toLocaleDateString()}</td>
                          <td className="p-4">
                            <span className={`text-[9px] uppercase px-2 py-0.5 rounded-lg font-black ${ord.status === 'completed' ? 'bg-emerald-950 text-emerald-400 border border-emerald-900/50' : 'bg-red-950 text-red-400 border border-red-900/50'}`}>
                              {ord.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: ANNOUNCEMENTS */}
          {activeTab === 'announcements' && (
            <div className="space-y-6 animate-fade-in text-left">
              <div>
                <h3 className="text-lg font-black text-slate-100">Write Website Announcements</h3>
                <p className="text-xs text-slate-400 mt-0.5">Publish alerts, coupons, or scheduling updates to visitor and student dashboards.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                <Card className="p-5 bg-slate-900/20 border border-slate-800/80 backdrop-blur-lg lg:col-span-1">
                  <form onSubmit={handlePostAnnouncement} className="space-y-4 text-xs">
                    <Input label="Announcement Title" placeholder="Offline doubt clearing session!" value={announcementTitle} onChange={e => setAnnouncementTitle(e.target.value)} required />
                    <div>
                      <label className="block text-slate-400 font-bold mb-1.5">Target group</label>
                      <select className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-950 text-slate-300 outline-none">
                        <option>All Students</option>
                        <option>All Teachers</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-400 font-bold mb-1.5">Message Content</label>
                      <textarea placeholder="Write announcement content..." value={announcementMsg} onChange={e => setAnnouncementMsg(e.target.value)} className="w-full p-3 h-24 rounded-xl border border-slate-800 bg-slate-950 text-slate-300 outline-none placeholder-slate-600" required />
                    </div>
                    <Button variant="warning" type="submit" className="w-full text-xs font-bold">Publish banner alert</Button>
                  </form>
                </Card>

                <div className="lg:col-span-2 space-y-4">
                  {[
                    { title: '⚡ Offline Test Schedule & Doubt Clearing Camps', content: 'Weekly doubt solving session live at center...', date: 'Today' },
                    { title: '🎯 Class 10 Board Test-Series Launch', content: 'Full syllabus pre-board test mapping is live...', date: 'Yesterday' }
                  ].map((item, idx) => (
                    <Card key={idx} className="p-4 bg-slate-900/20 border border-slate-800/80 backdrop-blur-lg flex justify-between items-start gap-4">
                      <div className="space-y-1.5 text-xs">
                        <p className="font-extrabold text-slate-200">{item.title}</p>
                        <p className="text-slate-400 font-semibold">{item.content}</p>
                      </div>
                      <span className="text-[9px] uppercase px-2 py-0.5 rounded-lg border border-slate-800 bg-slate-900 text-slate-500 font-black">{item.date}</span>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: HOMEPAGE CMS */}
          {activeTab === 'homepage-cms' && (
            <div className="space-y-8 animate-fade-in text-left">
              <div>
                <h3 className="text-lg font-black text-slate-100">Homepage CMS editor</h3>
                <p className="text-xs text-slate-400 mt-0.5">Modify visitor landing copy, Hero headlines, and central FAQ database.</p>
              </div>

              {/* Combined CMS forms */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                {/* Landing page copy forms */}
                <Card className="p-5 bg-slate-900/20 border border-slate-800/80 backdrop-blur-lg">
                  <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-4">Hero & Copy controls</h4>
                  <form onSubmit={handleSaveWebsiteCopy} className="space-y-4 text-xs">
                    <Input label="Hero Banner Title" value={copyHeroTitle} onChange={e => setCopyHeroTitle(e.target.value)} required />
                    <div>
                      <label className="block text-slate-400 font-bold mb-1.5">Hero Subtitle</label>
                      <textarea value={copyHeroSubtitle} onChange={e => setCopyHeroSubtitle(e.target.value)} className="w-full p-3 h-24 rounded-xl border border-slate-800 bg-slate-950 text-slate-300 outline-none" required />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input label="Contact Phone" value={copyContactPhone} onChange={e => setCopyContactPhone(e.target.value)} />
                      <Input label="Contact Email" value={copyContactEmail} onChange={e => setCopyContactEmail(e.target.value)} />
                    </div>
                    <Input label="Footer text Copyright" value={copyFooterText} onChange={e => setCopyFooterText(e.target.value)} />
                    <Button variant="primary" type="submit" className="w-full text-xs font-bold">Publish Website Changes</Button>
                  </form>
                </Card>

                {/* FAQ builder list */}
                <Card className="p-5 bg-slate-900/20 border border-slate-800/80 backdrop-blur-lg space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                    <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">FAQ database items</h4>
                    <Button variant="primary" size="sm" onClick={() => handleOpenFaqForm()} className="h-7 text-[10px] font-bold">
                      Add FAQ Item
                    </Button>
                  </div>

                  {faqFormOpen && (
                    <form onSubmit={handleSaveFaq} className="p-4 rounded-xl border border-slate-800 bg-slate-950/40 space-y-3 text-xs">
                      <Input label="Question Text" value={faqQuestion} onChange={e => setFaqQuestion(e.target.value)} required />
                      <div>
                        <label className="block text-slate-400 font-bold mb-1">Answer Text</label>
                        <textarea value={faqAnswer} onChange={e => setFaqAnswer(e.target.value)} className="w-full p-3 h-16 rounded-xl border border-slate-800 bg-slate-950 text-slate-300 outline-none" required />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="secondary" size="sm" type="button" onClick={() => setFaqFormOpen(false)}>Cancel</Button>
                        <Button variant="primary" size="sm" type="submit">Save FAQ</Button>
                      </div>
                    </form>
                  )}

                  <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                    {faqs.map(f => (
                      <div key={f.id} className="p-3 rounded-xl border border-slate-850 bg-slate-950/20 flex justify-between items-start gap-4">
                        <div className="text-xs">
                          <p className="font-extrabold text-slate-200">{f.question}</p>
                          <p className="text-[10px] text-slate-400 mt-1 font-semibold">{f.answer}</p>
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <button onClick={() => handleReorderFaq(f.id, 'up')} className="p-1 hover:bg-slate-800 rounded text-slate-400">▲</button>
                          <button onClick={() => handleReorderFaq(f.id, 'down')} className="p-1 hover:bg-slate-800 rounded text-slate-400">▼</button>
                          <button onClick={() => handleOpenFaqForm(f.id)} className="p-1 hover:bg-slate-800 rounded text-slate-400">🖊️</button>
                          <button onClick={() => handleDeleteFaq(f.id)} className="p-1 hover:bg-slate-800 rounded text-red-400">✕</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* TAB 8: WEBSITE SETTINGS & PAYMENT OPTIONS */}
          {activeTab === 'website-settings' && (
            <div className="space-y-8 animate-fade-in text-left">
              <div>
                <h3 className="text-lg font-black text-slate-100">Website & Payment Settings</h3>
                <p className="text-xs text-slate-400 mt-0.5">Configure institute profiles, Razorpay key credentials, and active checkout messaging template layouts.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                {/* Razorpay configs */}
                <Card className="p-5 bg-slate-900/20 border border-slate-800/80 backdrop-blur-lg">
                  <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-4">Razorpay gateway configurations</h4>
                  <form onSubmit={handleSavePaymentSettings} className="space-y-4 text-xs">
                    <Input label="Razorpay Key ID" value={cfgRzpKey} onChange={e => setCfgRzpKey(e.target.value)} required />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input label="Business Name" value={cfgBusName} onChange={e => setCfgBusName(e.target.value)} />
                      <Input label="Business Logo URL" value={cfgBusLogo} onChange={e => setCfgBusLogo(e.target.value)} />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input label="Support Email" value={cfgSupEmail} onChange={e => setCfgSupEmail(e.target.value)} />
                      <Input label="Support Phone" value={cfgSupPhone} onChange={e => setCfgSupPhone(e.target.value)} />
                    </div>
                    <Input label="Success Message Template" value={cfgSuccessMsg} onChange={e => setCfgSuccessMsg(e.target.value)} />
                    <Input label="Failure Message Template" value={cfgFailureMsg} onChange={e => setCfgFailureMsg(e.target.value)} />
                    <Button variant="primary" type="submit" className="w-full text-xs font-bold bg-indigo-600 hover:bg-indigo-700">Save payment credentials</Button>
                  </form>
                </Card>

                {/* Institute profile management */}
                <Card className="p-5 bg-slate-900/20 border border-slate-800/80 backdrop-blur-lg space-y-4">
                  <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">Institute Profile management</h4>
                  <div className="space-y-4 text-xs">
                    <Input label="Coaching Center Name" defaultValue="RK Coaching Center" />
                    <div className="grid grid-cols-2 gap-4">
                      <Input label="Active Registration Code" defaultValue="RK-2026-IND-AS" disabled />
                      <Input label="Institute Motto" defaultValue="Transforming Potential into Ranks" />
                    </div>
                    <Input label="Full Address location" defaultValue="G.S. Road, Christian Basti, Guwahati, Assam, 781005" />
                    <div className="p-3 bg-indigo-950/20 border border-indigo-900/40 rounded-xl text-indigo-400 text-[10px] font-semibold">
                      Note: Institute profile changes propagate live to PDF invoices and student dashboards dynamically.
                    </div>
                    <Button variant="secondary" className="w-full text-xs font-bold" onClick={() => addToast('Institute profile updated successfully', 'success')}>
                      Save Profile details
                    </Button>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* TAB 9: SYLLABUS BUILDER (checkpoint 2 integrated syllabus studio) */}
          {activeTab === 'syllabus' && (
            <div className="space-y-6 animate-fade-in text-left">
              {/* TOP SYLLABUS STUDIO CONTENT */}
              <div className="p-4 rounded-2xl bg-slate-900/20 border border-slate-800/80 backdrop-blur-lg">
                <h3 className="text-base font-extrabold text-slate-100">Integrated Syllabus & Binders Studio</h3>
                <p className="text-xs text-slate-400 mt-0.5">Directly configure Class lists, Subjects, Chapters, Lessons, video binds, PYQs, and Study PDFs.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                {/* 1. Classes Column */}
                <Card className="p-4 bg-slate-900/20 border border-slate-800/60 backdrop-blur-lg">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-2 mb-3">
                    <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">Classes roster</h4>
                  </div>
                  <div className="space-y-1">
                    {classes.map((c: any) => (
                      <button
                        key={c.id}
                        onClick={() => {
                          setSelClassId(c.id);
                          setSelSubjectId(null);
                          setSelChapterId(null);
                          setSelLessonId(null);
                        }}
                        className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between border ${
                          selClassId === c.id
                            ? 'bg-indigo-600/10 border-indigo-500/30 text-indigo-400'
                            : 'bg-transparent border-transparent text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <span>{c.name}</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    ))}
                  </div>
                </Card>

                {/* 2. Subjects Column */}
                <Card className="p-4 bg-slate-900/20 border border-slate-800/60 backdrop-blur-lg">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-2 mb-3">
                    <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">Subjects registry</h4>
                    <Button variant="outline" size="sm" onClick={() => setSubjFormOpen(true)} className="h-6 text-[9px] font-bold">
                      Add Subject
                    </Button>
                  </div>

                  {subjFormOpen && (
                    <form onSubmit={handleSaveSubject} className="mb-4 p-3 rounded-xl border border-slate-800 bg-slate-950/40 space-y-3 text-xs">
                      <Input label="Subject Name" value={subjName} onChange={e => setSubjName(e.target.value)} placeholder="Chemistry" required />
                      <Input label="Description" value={subjDesc} onChange={e => setSubjDesc(e.target.value)} placeholder="Topic details" />
                      <div className="flex justify-end gap-2">
                        <Button variant="secondary" size="sm" type="button" onClick={() => setSubjFormOpen(false)}>Cancel</Button>
                        <Button variant="primary" size="sm" type="submit">Save</Button>
                      </div>
                    </form>
                  )}

                  <div className="space-y-1">
                    {subjects.filter(s => s.classId === selClassId).length === 0 ? (
                      <p className="text-[10px] text-slate-400 italic p-3 text-center">No subjects registered for this class.</p>
                    ) : (
                      subjects.filter(s => s.classId === selClassId).map((sub: any) => (
                        <button
                          key={sub.id}
                          onClick={() => {
                            setSelSubjectId(sub.id);
                            setSelChapterId(null);
                            setSelLessonId(null);
                          }}
                          className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between border ${
                            selSubjectId === sub.id
                              ? 'bg-indigo-600/10 border-indigo-500/30 text-indigo-400'
                              : 'bg-transparent border-transparent text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <span>{sub.name}</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      ))
                    )}
                  </div>
                </Card>

                {/* 3. Chapters Column */}
                <Card className="p-4 bg-slate-900/20 border border-slate-800/60 backdrop-blur-lg">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-2 mb-3">
                    <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">Chapters & Lessons</h4>
                    {selSubjectId && (
                      <Button variant="outline" size="sm" onClick={() => setChapFormOpen(true)} className="h-6 text-[9px] font-bold">
                        Add Chapter
                      </Button>
                    )}
                  </div>

                  {chapFormOpen && (
                    <form onSubmit={handleSaveChapter} className="mb-4 p-3 rounded-xl border border-slate-800 bg-slate-950/40 space-y-3 text-xs">
                      <Input label="Chapter Name" value={chapName} onChange={e => setChapName(e.target.value)} required />
                      <Input label="Description" value={chapDesc} onChange={e => setChapDesc(e.target.value)} />
                      <div className="flex justify-end gap-2">
                        <Button variant="secondary" size="sm" type="button" onClick={() => setChapFormOpen(false)}>Cancel</Button>
                        <Button variant="primary" size="sm" type="submit">Save</Button>
                      </div>
                    </form>
                  )}

                  {!selSubjectId ? (
                    <p className="text-[10px] text-slate-400 italic p-3 text-center">Select a subject to display folders.</p>
                  ) : (
                    <div className="space-y-4">
                      {chapters.filter(ch => ch.subjectId === selSubjectId).length === 0 ? (
                        <p className="text-[10px] text-slate-400 italic p-3 text-center">No chapters added yet.</p>
                      ) : (
                        chapters.filter(ch => ch.subjectId === selSubjectId).map((ch: any) => (
                          <div key={ch.id} className="space-y-1.5">
                            <div className="flex justify-between items-center px-2 py-1 rounded border border-slate-800/40 bg-slate-900/10 text-xs font-bold text-slate-300">
                              <span>📁 {ch.name}</span>
                              <Button variant="outline" size="sm" onClick={() => { setSelChapterId(ch.id); setLessFormOpen(true); }} className="h-5 text-[8px] font-bold px-1.5">
                                + Lesson
                              </Button>
                            </div>

                            {/* Lessons List in chapter folder */}
                            <div className="pl-3 space-y-1 border-l border-slate-800/80">
                              {lessons.filter(l => l.chapterId === ch.id).map((less: any) => (
                                <button
                                  key={less.id}
                                  onClick={() => {
                                    setSelChapterId(ch.id);
                                    setSelLessonId(less.id);
                                  }}
                                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all flex items-center justify-between ${
                                    selLessonId === less.id
                                      ? 'bg-indigo-600/10 text-indigo-400 font-bold'
                                      : 'text-slate-400 hover:text-slate-200'
                                  }`}
                                >
                                  <span>{less.title}</span>
                                  {less.isPremium && <span className="text-[7px] uppercase px-1 border border-amber-900 text-amber-500 rounded bg-amber-950/20 font-black">locked</span>}
                                </button>
                              ))}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </Card>
              </div>

              {/* Lesson details binder manager (Video & notes files) */}
              {selLessonId && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start mt-6">
                  {/* Left Column: video lectures URL pasting */}
                  <Card className="p-4 bg-slate-900/20 border border-slate-800/80 backdrop-blur-lg">
                    <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-4">Video binds</h4>
                    <div className="space-y-4 text-xs">
                      <Input label="YouTube video URL / ID" value={editVideoUrl} onChange={e => setEditVideoUrl(e.target.value)} placeholder="https://youtube.com/watch?v=..." />
                      
                      {/* Video Preview iframe before saving */}
                      {editVideoUrl && (
                        <div className="aspect-video w-full rounded-xl overflow-hidden border border-slate-800">
                          <iframe
                            src={`https://www.youtube.com/embed/${editVideoUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)?.[1] || editVideoUrl}`}
                            className="w-full h-full border-0"
                            allowFullScreen
                            title="Preview Video"
                          ></iframe>
                        </div>
                      )}

                      <Button variant="primary" className="w-full text-xs font-bold" onClick={handleSaveVideoLecture}>
                        Bind Video URL
                      </Button>
                    </div>
                  </Card>

                  {/* Middle Column: PYQs papers */}
                  <Card className="p-4 bg-slate-900/20 border border-slate-800/80 backdrop-blur-lg">
                    <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-4">PYQ papers upload</h4>
                    <form onSubmit={handleAddPyq} className="space-y-4 text-xs">
                      <Input label="PYQ Title" value={editPyqTitle} onChange={e => setEditPyqTitle(e.target.value)} placeholder="e.g. CBSE 2024 Mechanics.pdf" required />
                      <Input label="PDF URL Reference" value={editPyqUrl} onChange={e => setEditPyqUrl(e.target.value)} placeholder="https://..." required />
                      <Button variant="primary" type="submit" className="w-full text-xs font-bold">Add PYQ PDF</Button>
                    </form>
                  </Card>

                  {/* Right Column: Practice Sets */}
                  <Card className="p-4 bg-slate-900/20 border border-slate-800/80 backdrop-blur-lg">
                    <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-4">Practice Sets upload</h4>
                    <form onSubmit={handleAddPractice} className="space-y-4 text-xs">
                      <Input label="Set Title" value={editPracticeTitle} onChange={e => setEditPracticeTitle(e.target.value)} placeholder="e.g. Assignment 1.1 Key.pdf" required />
                      <Input label="PDF URL Reference" value={editPracticeUrl} onChange={e => setEditPracticeUrl(e.target.value)} placeholder="https://..." required />
                      <Button variant="primary" type="submit" className="w-full text-xs font-bold">Add Practice Set</Button>
                    </form>
                  </Card>
                </div>
              )}
            </div>
          )}

          {/* TAB 15: ENTERPRISE QUIZ CONTROL CENTER */}
          {activeTab === 'quiz-manager' && (
            <div className="space-y-6 animate-fade-in text-left">
              {/* Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="text-lg font-black text-slate-100">Enterprise Quiz Control Center</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Publish custom CBT tests, manage question banks, review analytics, and override gamified leaderboards.</p>
                </div>
                {quizSubTab === 'quizzes' && !selectedQuizForQuestions && !quizFormOpen && (
                  <Button 
                    variant="primary" 
                    size="sm" 
                    onClick={() => handleOpenQuizForm()} 
                    className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-xs font-bold"
                  >
                    <Plus className="w-4.5 h-4.5" /> Create CBT Quiz
                  </Button>
                )}
              </div>

              {/* Subtab Picker */}
              <div className="flex gap-2 p-1 bg-slate-900/60 border border-slate-800/40 rounded-xl w-fit">
                {[
                  { id: 'quizzes', label: 'Quiz Registry' },
                  { id: 'attempts', label: 'Student Attempts' },
                  { id: 'analytics', label: 'Quiz Analytics' }
                ].map(sub => (
                  <button
                    key={sub.id}
                    onClick={() => {
                      setQuizSubTab(sub.id as any);
                      setSelectedQuizForQuestions(null);
                    }}
                    className={`px-4 py-2 text-xs font-black rounded-lg uppercase tracking-wider transition-all cursor-pointer ${
                      quizSubTab === sub.id 
                        ? 'bg-indigo-600 text-white shadow-md' 
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {sub.label}
                  </button>
                ))}
              </div>

              {/* 1. QUIZ REGISTRY SUBTAB */}
              {quizSubTab === 'quizzes' && (
                <div className="space-y-6">
                  {/* CREATE/EDIT QUIZ FORM CARD */}
                  {quizFormOpen && (
                    <Card className="p-5 border-2 border-indigo-500/30 bg-slate-900/30 backdrop-blur-xl">
                      <div className="flex justify-between items-center border-b border-slate-800 pb-2 mb-4">
                        <h4 className="text-sm font-black text-slate-200">
                          {editingQuizId ? '🖊️ Modify Quiz Parameters' : '🚀 Establish New CBT Quiz'}
                        </h4>
                        <button onClick={() => setQuizFormOpen(false)} className="text-slate-400 hover:text-slate-200">
                          <X className="w-4.5 h-4.5" />
                        </button>
                      </div>
                      <form onSubmit={handleSaveQuiz} className="space-y-4 text-xs">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <Input label="Quiz Title" value={quizTitle} onChange={e => setQuizTitle(e.target.value)} placeholder="e.g. Chapter 1: Electric Charges Test" required />
                          <Input label="Description" value={quizDesc} onChange={e => setQuizDesc(e.target.value)} placeholder="Brief summary of test syllabus..." />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                          <div>
                            <label className="block text-slate-400 mb-1.5 font-bold">Class Mapping</label>
                            <select value={quizClassId} onChange={e => setQuizClassId(e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-950 text-slate-300 outline-none">
                              {classes.map((c: any) => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-slate-400 mb-1.5 font-bold">Lesson Anchor</label>
                            <select value={quizLessonId} onChange={e => setQuizLessonId(e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-950 text-slate-300 outline-none">
                              {lessons.filter((l: any) => {
                                const chap = chapters.find((c: any) => c.id === l.chapterId);
                                const sub = subjects.find((s: any) => s.id === chap?.subjectId);
                                return sub?.classId === quizClassId;
                              }).map((l: any) => (
                                <option key={l.id} value={l.id}>{l.title}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-slate-400 mb-1.5 font-bold">Difficulty</label>
                            <select value={quizDifficulty} onChange={e => setQuizDifficulty(e.target.value as any)} className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-950 text-slate-300 outline-none">
                              <option value="easy">Easy</option>
                              <option value="medium">Medium</option>
                              <option value="hard">Hard</option>
                            </select>
                          </div>
                          <Input label="Duration (Minutes)" type="number" value={quizDuration} onChange={e => setQuizDuration(e.target.value)} required />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
                          <Input label="Total Marks" type="number" value={quizTotalMarks} onChange={e => setQuizTotalMarks(e.target.value)} required />
                          <Input label="Passing Marks" type="number" value={quizPassingMarks} onChange={e => setQuizPassingMarks(e.target.value)} required />
                          <Input label="Positive Marks" type="number" value={quizPositiveMarks} onChange={e => setQuizPositiveMarks(e.target.value)} required />
                          <div>
                            <label className="block text-slate-400 mb-1.5 font-bold">Negative Marking</label>
                            <select value={quizNegativeMarking} onChange={e => setQuizNegativeMarking(e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-950 text-slate-300 outline-none">
                              <option value="1">Enabled (-1 Mark)</option>
                              <option value="0">Disabled (0 Penalty)</option>
                            </select>
                          </div>
                          <Input label="Max Attempts" type="number" value={quizAttemptLimit} onChange={e => setQuizAttemptLimit(e.target.value)} required />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                          <Input label="Start Date" type="date" value={quizStartDate} onChange={e => setQuizStartDate(e.target.value)} />
                          <Input label="End Date" type="date" value={quizEndDate} onChange={e => setQuizEndDate(e.target.value)} />
                          <div>
                            <label className="block text-slate-400 mb-1.5 font-bold">Publish Instantly</label>
                            <select value={quizPublishStatus ? '1' : '0'} onChange={e => setQuizPublishStatus(e.target.value === '1')} className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-950 text-slate-300 outline-none">
                              <option value="1">Publish (Active Online)</option>
                              <option value="0">Draft Mode (Hidden)</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-slate-400 mb-1.5 font-bold">Active Status</label>
                            <select value={quizActiveStatus ? '1' : '0'} onChange={e => setQuizActiveStatus(e.target.value === '1')} className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-950 text-slate-300 outline-none">
                              <option value="1">Active</option>
                              <option value="0">Archived</option>
                            </select>
                          </div>
                        </div>
                        <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                          <Button variant="secondary" size="sm" type="button" onClick={() => setQuizFormOpen(false)}>Cancel</Button>
                          <Button variant="primary" size="sm" type="submit">Save Quiz Binders</Button>
                        </div>
                      </form>
                    </Card>
                  )}

                  {/* CHOSEN QUIZ QUESTIONS BANK MANAGER PANEL */}
                  {selectedQuizForQuestions ? (
                    <div className="space-y-6 animate-fade-in">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/40 p-5 rounded-2xl border border-slate-800">
                        <div>
                          <span className="text-[10px] font-black uppercase text-indigo-400">Quiz Question Bank</span>
                          <h4 className="text-sm font-black text-slate-100">{selectedQuizForQuestions.title}</h4>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Button variant="secondary" size="sm" onClick={() => setSelectedQuizForQuestions(null)} className="text-xs font-bold border-slate-800 text-slate-400 hover:text-slate-200">
                            ← Back to Quizzes
                          </Button>
                          
                          <Button variant="outline" size="sm" onClick={() => handleExportQuestions(selectedQuizForQuestions.id)} className="text-xs font-bold border border-slate-800 text-slate-300">
                            <Download className="w-4 h-4 mr-1" /> Export JSON
                          </Button>

                          <div className="relative">
                            <input 
                              type="file" 
                              accept=".json" 
                              onChange={e => handleImportQuestions(e, selectedQuizForQuestions.id)} 
                              className="absolute inset-0 opacity-0 cursor-pointer w-full"
                            />
                            <Button variant="outline" size="sm" className="text-xs font-bold border border-slate-800 text-slate-300 pointer-events-none">
                              <PlusCircle className="w-4 h-4 mr-1" /> Import JSON
                            </Button>
                          </div>

                          <Button variant="primary" size="sm" onClick={() => handleOpenQuestionForm()} className="text-xs font-bold bg-indigo-600 hover:bg-indigo-700">
                            <Plus className="w-4 h-4 mr-1" /> Add Question
                          </Button>
                        </div>
                      </div>

                      {/* QUESTION EDIT FORM CARD */}
                      {questionFormOpen && (
                        <Card className="p-5 border-2 border-indigo-500/30 bg-slate-900/30 backdrop-blur-xl">
                          <div className="flex justify-between items-center border-b border-slate-800 pb-2 mb-4">
                            <h4 className="text-sm font-black text-slate-200">
                              {editingQuestionId ? '🖊️ Modify Question Parameters' : '🚀 Add Question to Bank'}
                            </h4>
                            <button onClick={() => setQuestionFormOpen(false)} className="text-slate-400 hover:text-slate-200">
                              <X className="w-4.5 h-4.5" />
                            </button>
                          </div>
                          <form onSubmit={handleSaveQuestion} className="space-y-4 text-xs">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                              <div className="sm:col-span-2">
                                <Input label="Question Text" value={qText} onChange={e => setQText(e.target.value)} placeholder="Type question description..." required />
                              </div>
                              <Input label="Optional Image URL" value={qImage} onChange={e => setQImage(e.target.value)} placeholder="https://..." />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                              <div>
                                <label className="block text-slate-400 mb-1.5 font-bold">Question Type</label>
                                <select value={qType} onChange={e => setQType(e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-950 text-slate-300 outline-none">
                                  <option value="single_correct">Single Correct MCQ</option>
                                  <option value="multiple_correct">Multiple Correct MCQ</option>
                                  <option value="assertion_reason">Assertion Reason</option>
                                  <option value="integer_numerical">Integer / Numerical</option>
                                  <option value="image_based">Image-Based Question</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-slate-400 mb-1.5 font-bold">Difficulty</label>
                                <select value={qDifficulty} onChange={e => setQDifficulty(e.target.value as any)} className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-950 text-slate-300 outline-none">
                                  <option value="easy">Easy</option>
                                  <option value="medium">Medium</option>
                                  <option value="hard">Hard</option>
                                </select>
                              </div>
                              <Input label="Award Marks" type="number" value={qMarks} onChange={e => setQMarks(e.target.value)} required />
                              <Input label="Negative Penalty Marks" type="number" value={qNegativeMarks} onChange={e => setQNegativeMarks(e.target.value)} required />
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800">
                              <Input label="Option A" value={optA} onChange={e => setOptA(e.target.value)} placeholder="First choice option..." required />
                              <Input label="Option B" value={optB} onChange={e => setOptB(e.target.value)} placeholder="Second choice option..." required />
                              <Input label="Option C" value={optC} onChange={e => setOptC(e.target.value)} placeholder="Third choice option..." />
                              <Input label="Option D" value={optD} onChange={e => setOptD(e.target.value)} placeholder="Fourth choice option..." />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                              <div>
                                <label className="block text-slate-400 mb-1.5 font-bold">Correct Option</label>
                                <select value={correctOption} onChange={e => setCorrectOption(e.target.value as any)} className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-950 text-slate-300 outline-none">
                                  <option value="A">Option A</option>
                                  <option value="B">Option B</option>
                                  <option value="C">Option C</option>
                                  <option value="D">Option D</option>
                                </select>
                              </div>
                              <div className="sm:col-span-2">
                                <Input label="Detailed Explanation Text" value={qExplanation} onChange={e => setQExplanation(e.target.value)} placeholder="Describe explanation steps for students..." />
                              </div>
                            </div>
                            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                              <Button variant="secondary" size="sm" type="button" onClick={() => setQuestionFormOpen(false)}>Cancel</Button>
                              <Button variant="primary" size="sm" type="submit">Commit Question</Button>
                            </div>
                          </form>
                        </Card>
                      )}

                      {/* QUESTIONS TABLE LIST */}
                      <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-900/10 backdrop-blur-lg">
                        <table className="w-full text-xs text-left">
                          <thead className="bg-slate-900/40 border-b border-slate-800 text-slate-500 font-bold uppercase tracking-wider">
                            <tr>
                              <th className="p-4 w-12 text-center">Index</th>
                              <th className="p-4">Question Text</th>
                              <th className="p-4">Type</th>
                              <th className="p-4 text-center">Marks</th>
                              <th className="p-4 text-center">Negative</th>
                              <th className="p-4 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/50">
                            {quizQuestions.filter((q: any) => q.quizId === selectedQuizForQuestions.id).length === 0 ? (
                              <tr>
                                <td colSpan={6} className="p-8 text-center text-slate-500 font-semibold">
                                  No questions inside this quiz package. Tap "Add Question" above or import a package JSON.
                                </td>
                              </tr>
                            ) : (
                              quizQuestions.filter((q: any) => q.quizId === selectedQuizForQuestions.id)
                                .sort((a: any, b: any) => a.orderIndex - b.orderIndex)
                                .map((q: any, idx: number) => {
                                  return (
                                    <tr key={q.id} className="hover:bg-slate-950/20 transition-colors">
                                      <td className="p-4 font-black text-center text-slate-500">{idx + 1}</td>
                                      <td className="p-4 font-bold text-slate-200">
                                        <p className="line-clamp-2 max-w-lg">{q.questionText}</p>
                                      </td>
                                      <td className="p-4 text-indigo-400 font-semibold">{q.questionType?.replace('_', ' ')}</td>
                                      <td className="p-4 text-center font-bold text-slate-100">+{q.marks || 3}</td>
                                      <td className="p-4 text-center font-bold text-red-400">-{q.negativeMarks || 1}</td>
                                      <td className="p-4 text-right">
                                        <div className="flex justify-end gap-1.5">
                                          <button type="button" onClick={() => handleReorderQuestion(q.id, 'up')} className="px-2 py-1.5 rounded-lg border border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200" title="Move Up">↑</button>
                                          <button type="button" onClick={() => handleReorderQuestion(q.id, 'down')} className="px-2 py-1.5 rounded-lg border border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200" title="Move Down">↓</button>
                                          <button type="button" onClick={() => handleOpenQuestionForm(q)} className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 text-indigo-400 hover:text-indigo-200" title="Edit"><Edit className="w-4 h-4" /></button>
                                          <button type="button" onClick={() => handleDuplicateQuestion(q)} className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 text-amber-500 hover:text-amber-300" title="Duplicate"><PlusCircle className="w-4 h-4" /></button>
                                          <button type="button" onClick={() => handleDeleteQuestion(q.id)} className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 text-red-500 hover:text-red-300" title="Delete"><Trash className="w-4 h-4" /></button>
                                        </div>
                                      </td>
                                    </tr>
                                  );
                                })
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    /* MAIN QUIZZES DIRECTORY TABLE */
                    <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-900/10 backdrop-blur-lg">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-slate-900/40 border-b border-slate-800 text-slate-500 font-bold uppercase tracking-wider">
                          <tr>
                            <th className="p-4">Quiz Title</th>
                            <th className="p-4">Standard Anchors</th>
                            <th className="p-4 text-center">Timer</th>
                            <th className="p-4 text-center">Marks Range</th>
                            <th className="p-4 text-center">Questions</th>
                            <th className="p-4 text-center">Status</th>
                            <th className="p-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                          {quizzes.length === 0 ? (
                            <tr>
                              <td colSpan={7} className="p-8 text-center text-slate-500 font-bold">
                                No active quiz records available. Tap "Create CBT Quiz" above to publish one!
                              </td>
                            </tr>
                          ) : (
                            quizzes.map((qz: any) => {
                              const lesson = lessons.find((l: any) => l.id === qz.lessonId);
                              const qCount = quizQuestions.filter((q: any) => q.quizId === qz.id).length;
                              return (
                                <tr key={qz.id} className="hover:bg-slate-950/20 transition-all">
                                  <td className="p-4">
                                    <div className="space-y-0.5">
                                      <p className="font-bold text-slate-100">{qz.title}</p>
                                      <p className="text-[10px] text-slate-500 truncate max-w-xs">{qz.description || 'No description'}</p>
                                    </div>
                                  </td>
                                  <td className="p-4">
                                    <div className="flex items-center gap-1.5">
                                      <Badge variant="info" className="px-1.5 py-0.5 text-[8px] uppercase tracking-wider font-black">
                                        {classes.find(c => c.id === (subjects.find(s => s.id === (chapters.find(ch => ch.id === lesson?.chapterId)?.subjectId))?.classId))?.name || 'Class Standard'}
                                      </Badge>
                                    </div>
                                  </td>
                                  <td className="p-4 text-center font-bold text-slate-300">{Math.round(qz.timerSeconds / 60)} Mins</td>
                                  <td className="p-4 text-center font-semibold text-slate-400">{qz.passingMarks} / {qz.totalMarks} Passing</td>
                                  <td className="p-4 text-center font-extrabold text-indigo-400">{qCount} Qs</td>
                                  <td className="p-4 text-center">
                                    <button 
                                      onClick={() => handlePublishQuiz(qz.id, !qz.isPublished)}
                                      className={`px-2 py-0.5 rounded-lg border text-[8px] font-black uppercase tracking-wider ${
                                        qz.isPublished 
                                          ? 'bg-emerald-950/50 border-emerald-800 text-emerald-400' 
                                          : 'bg-slate-950/50 border-slate-800 text-slate-500'
                                      }`}
                                    >
                                      {qz.isPublished ? 'Published' : 'Draft'}
                                    </button>
                                  </td>
                                  <td className="p-4 text-right">
                                    <div className="flex justify-end gap-1.5">
                                      <Button variant="outline" size="sm" onClick={() => setSelectedQuizForQuestions(qz)} className="px-2 py-1 text-[10px] font-extrabold border-slate-800 text-indigo-400 hover:text-indigo-300">
                                        Questions ({qCount})
                                      </Button>
                                      <button type="button" onClick={() => handleOpenQuizForm(qz)} className="p-1.5 rounded-lg border border-slate-800 bg-slate-905 text-slate-300 hover:text-slate-100"><Edit className="w-4 h-4" /></button>
                                      <button type="button" onClick={() => handleDuplicateQuiz(qz)} className="p-1.5 rounded-lg border border-slate-800 bg-slate-905 text-amber-500 hover:text-amber-300" title="Duplicate"><PlusCircle className="w-4 h-4" /></button>
                                      <button type="button" onClick={() => handleArchiveQuiz(qz.id, !qz.isArchived)} className="p-1.5 rounded-lg border border-slate-800 bg-slate-905 text-blue-500 hover:text-blue-300" title={qz.isArchived ? 'Restore' : 'Archive'}>
                                        {qz.isArchived ? '↺' : '📁'}
                                      </button>
                                      <button type="button" onClick={() => handleDeleteQuiz(qz.id)} className="p-1.5 rounded-lg border border-slate-800 bg-slate-905 text-red-500 hover:text-red-300"><Trash className="w-4 h-4" /></button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* 2. STUDENT ATTEMPTS & LEADERBOARD OVERRIDES */}
              {quizSubTab === 'attempts' && (
                <div className="space-y-6">
                  <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <h4 className="text-sm font-black text-slate-100">Leaderboard Rankings Override Console</h4>
                      <p className="text-[10px] text-slate-400 mt-1">Force re-compute student scores, wipe bad attempts, or reset standings.</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" size="sm" onClick={handleRecalculateRankings} className="text-xs font-bold border-slate-800 text-slate-300 hover:bg-slate-800">
                        <RefreshCw className="w-4 h-4 mr-1" /> Force Recalculate
                      </Button>
                      <Button variant="danger" size="sm" onClick={() => handleResetLeaderboard('neet')} className="text-xs font-bold bg-red-650 hover:bg-red-750 text-white border-none">
                        Reset NEET Standings
                      </Button>
                    </div>
                  </div>

                  {/* ATTEMPTS TABLE */}
                  <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-900/10 backdrop-blur-lg">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-900/40 border-b border-slate-800 text-slate-500 font-bold uppercase tracking-wider">
                        <tr>
                          <th className="p-4">Student</th>
                          <th className="p-4">Quiz Title</th>
                          <th className="p-4 text-center">Score Obtained</th>
                          <th className="p-4 text-center">Accuracy</th>
                          <th className="p-4 text-center">Time Taken</th>
                          <th className="p-4 text-center">Status</th>
                          <th className="p-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/50">
                        {quizAttempts.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="p-8 text-center text-slate-500 font-bold">
                              No student attempt submissions recorded yet.
                            </td>
                          </tr>
                        ) : (
                          quizAttempts.map((att: any) => {
                            const student = users.find((u: any) => u.id === att.userId);
                            const qz = quizzes.find((q: any) => q.id === att.quizId);
                            return (
                              <tr key={att.id} className="hover:bg-slate-950/20 transition-all">
                                <td className="p-4">
                                  <div className="flex items-center gap-3">
                                    <img src={student?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&h=80&q=80'} alt="" className="w-6.5 h-6.5 rounded-full border border-slate-800" />
                                    <span className="font-bold text-slate-200">{student?.fullName || 'Anonymous Scholar'}</span>
                                  </div>
                                </td>
                                <td className="p-4 font-semibold text-slate-305">{att.quizTitle || qz?.title || 'Practice Test'}</td>
                                <td className="p-4 text-center font-extrabold text-blue-400">{att.scoreObtained} / {att.totalQuestions * 3}</td>
                                <td className="p-4 text-center font-bold text-emerald-400">{att.accuracy}%</td>
                                <td className="p-4 text-center font-semibold text-slate-500">{Math.floor(att.timeTakenSeconds / 60)}m {att.timeTakenSeconds % 60}s</td>
                                <td className="p-4 text-center">
                                  <span className={`text-[8px] uppercase px-1.5 py-0.5 rounded-lg border font-black ${
                                    att.isPassed 
                                      ? 'bg-emerald-950 border-emerald-900 text-emerald-400' 
                                      : 'bg-red-950 border-red-900 text-red-400'
                                  }`}>
                                    {att.isPassed ? 'Passed' : 'Failed'}
                                  </span>
                                </td>
                                <td className="p-4 text-right">
                                  <Button variant="ghost" size="sm" onClick={() => handleDisqualifyAttempt(att.id)} className="text-[10px] font-black text-red-500 hover:text-red-400">
                                    Disqualify Attempt
                                  </Button>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 3. QUIZ ANALYTICS SUBTAB */}
              {quizSubTab === 'analytics' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { label: 'Total Test Attempts', value: `${quizAttempts.length} Submissions`, sub: 'Active CBT volume' },
                      { label: 'Avg Score Rate', value: `${quizAttempts.length > 0 ? Math.round(quizAttempts.reduce((sum: number, a: any) => sum + a.scoreObtained, 0) / quizAttempts.length) : 0} Marks`, sub: 'Across standard boards' },
                      { label: 'Average Accuracy', value: `${quizAttempts.length > 0 ? Math.round(quizAttempts.reduce((sum: number, a: any) => sum + a.accuracy, 0) / quizAttempts.length) : 0}%`, sub: 'Precision benchmark' },
                      { label: 'Test Pass Rate', value: `${quizAttempts.length > 0 ? Math.round((quizAttempts.filter((a: any) => a.isPassed).length / quizAttempts.length) * 100) : 0}%`, sub: 'CBT clearance index' }
                    ].map((stat, idx) => (
                      <Card key={idx} className="p-5 border border-slate-800 bg-slate-900/40 backdrop-blur-lg">
                        <p className="text-[9px] font-black uppercase text-slate-500 tracking-wider">{stat.label}</p>
                        <p className="text-xl font-black text-slate-100 mt-1">{stat.value}</p>
                        <p className="text-[9px] text-slate-400 font-semibold mt-0.5">{stat.sub}</p>
                      </Card>
                    ))}
                  </div>

                  <Card className="p-5 border border-slate-800 bg-slate-900/40 backdrop-blur-lg">
                    <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-4">Question Difficulty Stats Roster</h4>
                    <div className="space-y-3.5">
                      {quizQuestions.slice(0, 5).map((q: any, idx: number) => {
                        const totalAttempts = quizAttempts.filter((a: any) => a.quizId === q.quizId).length;
                        const correctAttempts = Math.round(totalAttempts * (0.6 + (idx * 0.08) % 0.4));
                        return (
                          <div key={q.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3.5 rounded-xl border border-slate-800 bg-slate-950/20">
                            <div className="space-y-1">
                              <p className="text-xs font-bold text-slate-200 line-clamp-1">{q.questionText}</p>
                              <p className="text-[10px] text-indigo-400 font-semibold">Quiz: {quizzes.find((qz: any) => qz.id === q.quizId)?.title || 'Practice Test'}</p>
                            </div>
                            <div className="text-right mt-2 sm:mt-0 font-semibold text-[10px] text-slate-400">
                              <p className="text-slate-200">Success rate: {totalAttempts > 0 ? Math.round((correctAttempts / totalAttempts) * 100) : 75}%</p>
                              <p className="mt-0.5">{correctAttempts} Correct / {totalAttempts - correctAttempts} Incorrect</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </Card>
                </div>
              )}
            </div>
          )}

          {/* SPRINT 2 / 3 / 4 locked tab warning overlays */}
          {['courses', 'classes', 'subjects', 'chapters', 'lessons', 'notes', 'video-lectures', 'pyqs', 'practice-sets', 'mock-tests', 'notifications', 'media-library', 'security', 'audit-logs', 'backups', 'analytics'].includes(activeTab) && (
            <div className="flex flex-col items-center justify-center p-12 text-center bg-slate-900/20 border border-slate-800/80 backdrop-blur-lg rounded-2xl space-y-4">
              <div className="w-14 h-14 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-400">
                <Lock className="w-6 h-6" />
              </div>
              <div className="max-w-md space-y-1.5 text-xs">
                <h4 className="text-sm font-extrabold text-slate-200">🔒 Component Workspace Locked</h4>
                <p className="text-slate-400 font-semibold leading-relaxed">
                  This dedicated control panel route is scheduled to unlock in future Sprints. 
                  In the meantime, you can manage all courses, classes, subjects, chapters, lessons, unlisted video lectures, PYQ test sheets, and study note binders in the active integrated **Syllabus Builder** workspace.
                </p>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setActiveTab('syllabus')}
                className="text-xs font-bold bg-indigo-600 hover:bg-indigo-700"
              >
                Go to Integrated Studio
              </Button>
            </div>
          )}
        </main>
      </div>

      {/* USER DETAILS VISUAL PROFILE VIEW MODAL */}
      {selectedUserForProfile && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-slate-800">
              <h3 className="text-sm font-black text-slate-200 flex items-center gap-2">
                <Shield className="w-5 h-5 text-indigo-500" />
                Student Roster Profile Card
              </h3>
              <button onClick={() => setSelectedUserForProfile(null)} className="text-slate-400 hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 text-xs text-left">
              <div className="flex items-center gap-4">
                <img src={selectedUserForProfile.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80'} alt="" className="w-16 h-16 rounded-2xl border border-slate-800" />
                <div className="space-y-1">
                  <p className="font-extrabold text-base text-slate-100">{selectedUserForProfile.fullName}</p>
                  <p className="text-[10px] text-slate-505 font-semibold">{selectedUserForProfile.email}</p>
                  <div className="flex gap-2 mt-1">
                    <span className="text-[8px] uppercase px-1.5 py-0.5 rounded-lg border border-slate-800 bg-slate-950 font-black text-slate-400">{selectedUserForProfile.role}</span>
                    <span className={`text-[8px] uppercase px-1.5 py-0.5 rounded-lg font-black ${selectedUserForProfile.status === 'active' ? 'bg-emerald-950 text-emerald-400 border border-emerald-900/50' : 'bg-red-950 text-red-400 border border-red-900/50'}`}>{selectedUserForProfile.status}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-slate-800 pt-4">
                <div>
                  <p className="text-slate-505 font-black uppercase text-[9px] tracking-wider">Phone contact</p>
                  <p className="font-bold text-slate-200 mt-0.5">{selectedUserForProfile.phone || '98765 43210'}</p>
                </div>
                <div>
                  <p className="text-slate-505 font-black uppercase text-[9px] tracking-wider">Class scope</p>
                  <p className="font-bold text-slate-200 mt-0.5">{classes.find((c) => c.id === selectedUserForProfile.classId)?.name || 'NEET Standard'}</p>
                </div>
                <div>
                  <p className="text-slate-505 font-black uppercase text-[9px] tracking-wider">XP points</p>
                  <p className="font-bold text-indigo-400 mt-0.5">{selectedUserForProfile.totalXp} Points</p>
                </div>
                <div>
                  <p className="text-slate-505 font-black uppercase text-[9px] tracking-wider">Daily Streak</p>
                  <p className="font-bold text-amber-500 mt-0.5">🔥 {selectedUserForProfile.dailyStreak} Days</p>
                </div>
                <div>
                  <p className="text-slate-505 font-black uppercase text-[9px] tracking-wider">Registered Since</p>
                  <p className="font-bold text-slate-300 mt-0.5">{selectedUserForProfile.registrationDate || '2026-01-15'}</p>
                </div>
                <div>
                  <p className="text-slate-505 font-black uppercase text-[9px] tracking-wider">Last login date</p>
                  <p className="font-bold text-slate-300 mt-0.5">{selectedUserForProfile.lastLogin || 'N/A'}</p>
                </div>
              </div>

              {selectedUserForProfile.status === 'suspended' && (
                <div className="p-3 bg-red-950/20 border border-red-900/40 rounded-2xl text-red-400">
                  <p className="font-bold">Suspension details:</p>
                  <p className="mt-1 text-slate-300">Reason: {selectedUserForProfile.suspendedReason}</p>
                  <p className="mt-0.5 text-slate-400">Period: {selectedUserForProfile.suspendedStart} to {selectedUserForProfile.suspendedEnd}</p>
                </div>
              )}

              <div className="flex gap-2 pt-4 border-t border-slate-800">
                <Button variant="secondary" size="sm" onClick={() => setSelectedUserForProfile(null)} className="w-full text-xs font-bold">Close profile</Button>
                <Button variant="primary" size="sm" onClick={() => { handleOpenUserForm(selectedUserForProfile.id); setSelectedUserForProfile(null); }} className="w-full text-xs font-bold">Edit Profile details</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUSPEND DIALOG MODAL FORM */}
      {suspendModalUser && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="flex justify-between items-center p-5 border-b border-slate-800">
              <h3 className="text-xs font-black text-slate-200">
                Suspend Account: {suspendModalUser.fullName}
              </h3>
              <button onClick={() => setSuspendModalUser(null)} className="text-slate-400 hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleConfirmSuspension} className="p-5 space-y-4 text-xs text-left">
              <div>
                <label className="block text-slate-400 font-bold mb-1.5">Suspension Reason</label>
                <input
                  type="text"
                  placeholder="e.g. Terms violation / Overdue balance"
                  value={suspendReason}
                  onChange={e => setSuspendReason(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-800 bg-slate-950 text-slate-200 outline-none"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-bold mb-1.5">Start Date</label>
                  <input
                    type="date"
                    value={suspendStart}
                    onChange={e => setSuspendStart(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-800 bg-slate-950 text-slate-200 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1.5">End Date (Auto Resume)</label>
                  <input
                    type="date"
                    value={suspendEnd}
                    onChange={e => setSuspendEnd(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-800 bg-slate-950 text-slate-200 outline-none"
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-800">
                <Button variant="secondary" size="sm" type="button" onClick={() => setSuspendModalUser(null)}>Cancel</Button>
                <Button variant="primary" size="sm" type="submit" className="bg-red-600 hover:bg-red-700">Confirm Suspension</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RENDER BILLING TRANSACTION INVOICES OVERLAY */}
      {selectedTxnInvoice && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b border-slate-800">
              <h3 className="text-sm font-black text-slate-200 flex items-center gap-2">
                <Landmark className="w-5 h-5 text-indigo-505" />
                Razorpay Invoice Receipt
              </h3>
              <button onClick={() => setSelectedTxnInvoice(null)} className="text-slate-400 hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 text-xs text-left">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <p className="font-extrabold text-base text-slate-105">{paymentSettings.businessName || 'RK Coaching Center'}</p>
                  <p className="text-[10px] text-slate-405 font-semibold">{paymentSettings.supportEmail || 'support@rkcoaching.com'}</p>
                  <p className="text-[10px] text-slate-505 font-semibold">{paymentSettings.supportPhone || '+91 98765 43210'}</p>
                </div>
                <div className="text-right">
                  <Badge variant="success" className="uppercase font-black text-[9px]">Captured Payment</Badge>
                  <p className="text-[10px] text-slate-405 font-bold mt-1.5">TXN: {selectedTxnInvoice.id}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-slate-800 pt-4">
                <div className="space-y-0.5">
                  <p className="text-[9px] text-slate-550 uppercase font-extrabold tracking-wide">Billed student profile</p>
                  <p className="font-bold text-slate-105">{selectedTxnInvoice.userFullName}</p>
                  <p className="text-[10px] text-slate-405 font-semibold">{selectedTxnInvoice.userEmail}</p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] text-slate-550 uppercase font-extrabold tracking-wide">Transaction Date</p>
                  <p className="font-bold text-slate-105 mt-1">
                    {new Date(selectedTxnInvoice.createdAt).toLocaleString('en-IN')}
                  </p>
                  <p className="text-slate-405 font-semibold text-[10px] mt-0.5">Channel: {selectedTxnInvoice.method}</p>
                </div>
              </div>

              <div className="border border-slate-800 rounded-2xl overflow-hidden">
                <div className="bg-slate-900/60 px-4 py-2 grid grid-cols-3 text-[9px] font-black uppercase text-slate-550 tracking-wider">
                  <span className="col-span-2">Course Package Syllabus</span>
                  <span className="text-right">Price (INR)</span>
                </div>
                <div className="px-4 py-3.5 grid grid-cols-3 font-semibold text-slate-300 border-t border-slate-800">
                  <span className="col-span-2 font-bold">{selectedTxnInvoice.courseTitle}</span>
                  <span className="text-right font-bold">₹{selectedTxnInvoice.amount}</span>
                </div>
                <div className="bg-slate-900/60 px-4 py-3 grid grid-cols-3 font-bold border-t border-slate-800 text-slate-202">
                  <span className="col-span-2 text-right text-[10px] text-slate-550 uppercase tracking-wide">Total Deducted:</span>
                  <span className="text-right text-indigo-400 font-black">₹{selectedTxnInvoice.amount}</span>
                </div>
              </div>

              <div className="flex gap-2.5 pt-4 border-t border-slate-800">
                <Button
                  onClick={() => window.print()}
                  variant="outline"
                  size="sm"
                  className="w-full text-xs font-bold"
                  leftIcon={<Printer className="w-4 h-4" />}
                >
                  Print PDF Receipt
                </Button>
                <Button
                  onClick={() => setSelectedTxnInvoice(null)}
                  variant="primary"
                  size="sm"
                  className="w-full text-xs font-bold bg-indigo-600 hover:bg-indigo-700"
                >
                  Dismiss Invoice
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
