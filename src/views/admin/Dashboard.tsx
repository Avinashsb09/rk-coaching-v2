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
  Printer
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
    courses
  } = useApp();

  const [activeTab, setActiveTab] = useState<'console' | 'users' | 'copy' | 'faqs' | 'payments' | 'payment-settings'>('console');

  // Announcement states
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementMsg, setAnnouncementMsg] = useState('');

  // User form states
  const [userFormOpen, setUserFormOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [userFullName, setUserFullName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userRole, setUserRole] = useState<'student' | 'teacher' | 'admin' | 'visitor'>('student');
  const [userXp, setUserXp] = useState('500');
  const [userStreak, setUserStreak] = useState('3');
  const [userAvatar, setUserAvatar] = useState('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80');

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
      const u = users.find(item => item.id === userId);
      if (u) {
        setEditingUserId(userId);
        setUserFullName(u.fullName);
        setUserEmail(u.email);
        setUserRole(u.role);
        setUserXp(u.totalXp.toString());
        setUserStreak(u.dailyStreak.toString());
        setUserAvatar(u.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80');
      }
    } else {
      setEditingUserId(null);
      setUserFullName('');
      setUserEmail('');
      setUserRole('student');
      setUserXp('300');
      setUserStreak('1');
      setUserAvatar('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80');
    }
    setUserFormOpen(true);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userFullName || !userEmail) {
      addToast('Please input complete credentials', 'error');
      return;
    }

    if (editingUserId) {
      // Edit User
      setUsers(prev => prev.map(u => u.id === editingUserId ? {
        ...u,
        fullName: userFullName,
        email: userEmail,
        role: userRole,
        totalXp: Number(userXp) || 0,
        dailyStreak: Number(userStreak) || 0,
        avatarUrl: userAvatar
      } : u));
      addToast(`Account for "${userFullName}" updated successfully`, 'success');
    } else {
      // Create User
      const newId = `usr_${Date.now()}`;
      setUsers(prev => [
        ...prev,
        {
          id: newId,
          email: userEmail,
          fullName: userFullName,
          role: userRole,
          dailyStreak: Number(userStreak) || 0,
          totalXp: Number(userXp) || 0,
          badges: ['scholar'],
          avatarUrl: userAvatar
        }
      ]);
      addToast(`User Profile "${userFullName}" established successfully`, 'success');
    }
    setUserFormOpen(false);
  };

  const handleDeleteUser = (userId: string) => {
    if (confirm('Are you absolutely sure you want to delete this user profile?')) {
      setUsers(prev => prev.filter(u => u.id !== userId));
      addToast('Profile deleted from database ledger', 'warning');
    }
  };

  const handleResetXp = (userId: string) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, totalXp: 0 } : u));
    addToast('XP reset completed', 'success');
  };

  const handleTogglePremium = (userId: string, currentRole: string) => {
    const nextRole = currentRole === 'student' ? 'visitor' : 'student';
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: nextRole as any } : u));
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

  return (
    <div className="space-y-8 py-4 text-left">
      {/* 1. Header Segment */}
      <section className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-indigo-600" />
            Administrator Control Center
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Publish global announcement banners, supervise student rosters, elevate teacher ranks, and update landing copy.
          </p>
        </div>
        <div>
          <Badge variant="danger" className="h-8">Role Claim: Administrator Supreme</Badge>
        </div>
      </section>

      {/* TABS NAV */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-1 overflow-x-auto pb-px">
        <button
          onClick={() => setActiveTab('console')}
          className={`px-4 py-2.5 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'console'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-950 dark:hover:text-slate-100'
          }`}
        >
          <Sliders className="w-4 h-4" />
          Command Overview
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2.5 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'users'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-950 dark:hover:text-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          User Accounts Ledger ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('copy')}
          className={`px-4 py-2.5 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'copy'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-950 dark:hover:text-slate-100'
          }`}
        >
          <FileText className="w-4 h-4" />
          Website Copy CMS
        </button>
        <button
          onClick={() => setActiveTab('faqs')}
          className={`px-4 py-2.5 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'faqs'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-950 dark:hover:text-slate-100'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          Central FAQ Builder ({faqs.length})
        </button>
        <button
          onClick={() => setActiveTab('payments')}
          className={`px-4 py-2.5 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'payments'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-950 dark:hover:text-slate-100'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          Razorpay Payments ({allTxns.length})
        </button>
        <button
          onClick={() => setActiveTab('payment-settings')}
          className={`px-4 py-2.5 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'payment-settings'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-950 dark:hover:text-slate-100'
          }`}
        >
          <Settings className="w-4 h-4" />
          Payment Settings
        </button>
      </div>

      {/* TAB CONTENT: Command Overview (Existing metrics + forms) */}
      {activeTab === 'console' && (
        <div className="space-y-8 animate-fade-in">
          {/* STATS */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card hoverEffect>
              <CardContent className="p-5 flex items-center gap-4">
                <div className="h-11 w-11 rounded-2xl bg-amber-100 dark:bg-amber-950 text-amber-600 flex items-center justify-center">
                  <DollarSign className="w-5.5 h-5.5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase">Est. Revenue</p>
                  <p className="text-xl font-extrabold text-slate-900 dark:text-white">₹2,45,600</p>
                </div>
              </CardContent>
            </Card>

            <Card hoverEffect>
              <CardContent className="p-5 flex items-center gap-4">
                <div className="h-11 w-11 rounded-2xl bg-blue-100 dark:bg-blue-950 text-blue-600 flex items-center justify-center">
                  <Landmark className="w-5.5 h-5.5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase">Completed Orders</p>
                  <p className="text-xl font-extrabold text-slate-900 dark:text-white">492 Txns</p>
                </div>
              </CardContent>
            </Card>

            <Card hoverEffect>
              <CardContent className="p-5 flex items-center gap-4">
                <div className="h-11 w-11 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
                  <BadgeCheck className="w-5.5 h-5.5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase">Active Campaigns</p>
                  <p className="text-xl font-extrabold text-slate-900 dark:text-white">4 Live Ads</p>
                </div>
              </CardContent>
            </Card>

            <Card hoverEffect>
              <CardContent className="p-5 flex items-center gap-4">
                <div className="h-11 w-11 rounded-2xl bg-purple-100 dark:bg-purple-950 text-purple-600 flex items-center justify-center">
                  <ShieldAlert className="w-5.5 h-5.5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase">Platform Integrity</p>
                  <p className="text-xl font-extrabold text-slate-900 dark:text-white">SECURE</p>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* DUAL COLS */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left side: Publish Announcement */}
            <Card className="p-5 flex flex-col space-y-5">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Megaphone className="w-5 h-5 text-amber-500" />
                  Write Global Website Announcements
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Publish critical notification banners appearing on visitor landing and student dashboards instantly.
                </p>
              </div>

              <form onSubmit={handlePostAnnouncement} className="space-y-4">
                <Input
                  label="Announcement Title"
                  placeholder="e.g., Extended NEET (Biology & Chemistry) Practice Mock Quiz Session live on Sunday!"
                  value={announcementTitle}
                  onChange={(e) => setAnnouncementTitle(e.target.value)}
                  required
                />

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Target Role Group
                  </label>
                  <select className="block w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm px-3 py-2.5 focus:ring-2 focus:ring-blue-500">
                    <option>All Students</option>
                    <option>All Teachers</option>
                    <option>All Guest Visitors</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Message Content
                  </label>
                  <textarea
                    placeholder="Write announcements, rules, coupons, or scheduling updates clearly..."
                    value={announcementMsg}
                    onChange={(e) => setAnnouncementMsg(e.target.value)}
                    className="block w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm p-3 h-24 focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>

                <Button variant="warning" type="submit" className="w-full">
                  Publish Alert Banner
                </Button>
              </form>
            </Card>

            {/* Right side: payment approval ledger */}
            <Card className="p-5 space-y-5">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FileCheck className="w-5 h-5 text-blue-500" />
                  Razorpay Transaction Auditor
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Verify recent order IDs and force unlock premium levels for manual payment requests.
                </p>
              </div>

              <div className="space-y-3">
                {[
                  { name: 'Kunal Verma', course: 'NEET (Biology & Chemistry) Complete Physics Electrostatics', amount: '₹499', rzpId: 'pay_RZP983271892', status: 'Pending Manual Review' },
                  { name: 'Divya Shah', course: 'Class 10 CBSE Maths Preparation', amount: '₹299', rzpId: 'pay_RZP748231908', status: 'Pending Manual Review' }
                ].map((order, idx) => (
                  <div key={idx} className="p-4 border border-slate-150 dark:border-slate-800/80 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/50 dark:bg-slate-900/20">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{order.name}</p>
                        <Badge variant="warning" size="sm" className="text-[9px]">Manual Check</Badge>
                      </div>
                      <p className="text-[10px] text-slate-500 font-semibold">{order.course} · {order.amount}</p>
                      <p className="text-[10px] font-mono text-slate-400">{order.rzpId}</p>
                    </div>
                    <Button variant="success" size="sm" className="h-8 text-xs shrink-0 cursor-pointer" onClick={() => handleApprovePayment(order.name, order.rzpId)}>
                      Verify & Unlock
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          </section>
        </div>
      )}

      {/* TAB CONTENT: SECTION 6 - USER CRUD */}
      {activeTab === 'users' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex justify-between items-center gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Administrative User Directory</h3>
              <p className="text-xs text-slate-500">Edit profiles, grant premium roles, award/reset stats ledger.</p>
            </div>
            <Button variant="primary" size="sm" onClick={() => handleOpenUserForm()} className="flex items-center gap-1">
              <UserPlus className="w-4 h-4" /> Add User Account
            </Button>
          </div>

          {/* USER FORM */}
          {userFormOpen && (
            <Card className="p-5 border-2 border-indigo-500 bg-slate-50/50 dark:bg-slate-900/20">
              <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-2 mb-4">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  {editingUserId ? '🖊️ Modify User Roster Record' : '🚀 Register New User Profile'}
                </h4>
                <button onClick={() => setUserFormOpen(false)} className="text-slate-400 hover:text-slate-900 dark:hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveUser} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Full Name"
                    value={userFullName}
                    onChange={e => setUserFullName(e.target.value)}
                    placeholder="e.g. Ramesh Kumar"
                    required
                  />
                  <Input
                    label="Email Address"
                    type="email"
                    value={userEmail}
                    onChange={e => setUserEmail(e.target.value)}
                    placeholder="e.g. ramesh@gmail.com"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      Security Role
                    </label>
                    <select
                      value={userRole}
                      onChange={e => setUserRole(e.target.value as any)}
                      className="block w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm px-3 py-2.5 focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="student">Student</option>
                      <option value="teacher">Teacher</option>
                      <option value="admin">Administrator</option>
                      <option value="visitor">Guest Visitor</option>
                    </select>
                  </div>

                  <Input
                    label="Total Points (XP)"
                    type="number"
                    value={userXp}
                    onChange={e => setUserXp(e.target.value)}
                  />

                  <Input
                    label="Daily Streak Count"
                    type="number"
                    value={userStreak}
                    onChange={e => setUserStreak(e.target.value)}
                  />

                  <Input
                    label="Avatar Photo URL"
                    value={userAvatar}
                    onChange={e => setUserAvatar(e.target.value)}
                  />
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  <Button variant="secondary" size="sm" type="button" onClick={() => setUserFormOpen(false)}>
                    Cancel
                  </Button>
                  <Button variant="primary" size="sm" type="submit">
                    Save Account
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {/* USERS TABLE GRID */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-950">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase font-black tracking-wider">
                  <tr>
                    <th className="p-4">Profile & Identity</th>
                    <th className="p-4">Assigned Role</th>
                    <th className="p-4">Streak Status</th>
                    <th className="p-4">Total XP points</th>
                    <th className="p-4 text-right">Actions Panel</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {users.map(u => (
                    <tr key={u.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-900/25">
                      <td className="p-4 flex items-center gap-3">
                        <img 
                          src={u.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80'}
                          alt={u.fullName}
                          className="h-9 w-9 rounded-full object-cover border border-slate-200"
                        />
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">{u.fullName}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{u.email}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge 
                          variant={u.role === 'admin' ? 'danger' : (u.role === 'teacher' ? 'info' : 'success')}
                          size="sm"
                        >
                          {u.role.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="p-4 font-bold font-mono text-slate-700 dark:text-slate-300">
                        🔥 {u.dailyStreak} days
                      </td>
                      <td className="p-4 font-black text-indigo-600 dark:text-indigo-400">
                        💎 {u.totalXp} XP
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-1">
                          <Button 
                            variant="secondary" 
                            size="sm" 
                            onClick={() => handleTogglePremium(u.id, u.role)}
                            className="px-2"
                            title="Toggle Premium Role Lock"
                          >
                            <Award className="w-3.5 h-3.5" />
                          </Button>
                          <Button 
                            variant="secondary" 
                            size="sm" 
                            onClick={() => handleOpenUserForm(u.id)}
                            className="px-2"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Button>
                          <Button 
                            variant="secondary" 
                            size="sm" 
                            onClick={() => handleResetXp(u.id)}
                            className="px-2 text-yellow-600"
                            title="Reset XP"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                          </Button>
                          <Button 
                            variant="danger" 
                            size="sm" 
                            onClick={() => handleDeleteUser(u.id)}
                            className="px-2"
                          >
                            <Trash className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: SECTION 7 - WEBSITE COPY CMS */}
      {activeTab === 'copy' && (
        <Card className="p-6 space-y-6 animate-fade-in">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Website Visitor Copy Management</h3>
            <p className="text-xs text-slate-500">Live modify central marketing copy, SEO headings, and institutional contact details.</p>
          </div>

          <form onSubmit={handleSaveWebsiteCopy} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Primary Landing Hero Title"
                value={copyHeroTitle}
                onChange={e => setCopyHeroTitle(e.target.value)}
                placeholder="e.g. RK Coaching Institute"
                required
              />
              <Input
                label="Admissions Support Contact Hotline"
                value={copyContactPhone}
                onChange={e => setCopyContactPhone(e.target.value)}
                placeholder="e.g. +91 98765 43210"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Primary Landing Subtitle Descriptor
              </label>
              <textarea
                value={copyHeroSubtitle}
                onChange={e => setCopyHeroSubtitle(e.target.value)}
                className="block w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm p-3 h-20 focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Admissions Email Channel"
                type="email"
                value={copyContactEmail}
                onChange={e => setCopyContactEmail(e.target.value)}
                placeholder="e.g. admissions@rkcoaching.com"
                required
              />
              <Input
                label="Physical Complex Address"
                value={copyContactAddress}
                onChange={e => setCopyContactAddress(e.target.value)}
                placeholder="e.g. Sector 4, New Delhi"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Platform Footer Copy / Copyright Declarations
              </label>
              <textarea
                value={copyFooterText}
                onChange={e => setCopyFooterText(e.target.value)}
                className="block w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm p-3 h-20 focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="primary" size="sm" type="submit" className="flex items-center gap-1.5">
                <Save className="w-4 h-4" /> Save Homepage Copy
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* TAB CONTENT: SECTION 7 - FAQ CRUD */}
      {activeTab === 'faqs' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex justify-between items-center gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Institutional FAQs Manager</h3>
              <p className="text-xs text-slate-500">Edit, reorder, append, or delete visitor-facing help questions.</p>
            </div>
            <Button variant="primary" size="sm" onClick={() => handleOpenFaqForm()} className="flex items-center gap-1">
              <Plus className="w-4 h-4" /> Add FAQ Item
            </Button>
          </div>

          {/* FAQ FORM */}
          {faqFormOpen && (
            <Card className="p-5 border-2 border-indigo-500 bg-slate-50/50 dark:bg-slate-900/20">
              <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-2 mb-4">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  {editingFaqId ? '🖊️ Modify FAQ Node' : '🚀 Build FAQ Entry'}
                </h4>
                <button onClick={() => setFaqFormOpen(false)} className="text-slate-400 hover:text-slate-900 dark:hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveFaq} className="space-y-4">
                <Input
                  label="Question Prompt"
                  value={faqQuestion}
                  onChange={e => setFaqQuestion(e.target.value)}
                  placeholder="e.g. How do I unlock CBSE 12 Premium packages?"
                  required
                />

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Detailed Answer Markdown
                  </label>
                  <textarea
                    value={faqAnswer}
                    onChange={e => setFaqAnswer(e.target.value)}
                    placeholder="Provide clear diagnostic help text..."
                    className="block w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm p-3 h-24 focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  <Button variant="secondary" size="sm" type="button" onClick={() => setFaqFormOpen(false)}>
                    Cancel
                  </Button>
                  <Button variant="primary" size="sm" type="submit">
                    Save FAQ Item
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {/* FAQs LIST */}
          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <Card key={faq.id} className="p-4 flex flex-col sm:flex-row justify-between items-start gap-4 hover:shadow-sm transition-shadow">
                <div className="space-y-1 text-left">
                  <span className="text-[10px] font-mono font-extrabold text-indigo-500 uppercase bg-indigo-50 dark:bg-indigo-950/40 px-1.5 py-0.5 rounded-md">
                    INDEX #{idx + 1}
                  </span>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white mt-1">Q: {faq.question}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">A: {faq.answer}</p>
                </div>

                <div className="flex gap-1 shrink-0">
                  <button 
                    disabled={idx === 0}
                    onClick={() => handleReorderFaq(faq.id, 'up')}
                    className="p-1 text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-30"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button 
                    disabled={idx === faqs.length - 1}
                    onClick={() => handleReorderFaq(faq.id, 'down')}
                    className="p-1 text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-30"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleOpenFaqForm(faq.id)}
                    className="p-1 text-blue-500 hover:scale-110 transition-transform"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDeleteFaq(faq.id)}
                    className="p-1 text-red-500 hover:scale-110 transition-transform"
                  >
                    <Trash className="w-4 h-4" />
                  </button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: Razorpay Payments Management */}
      {activeTab === 'payments' && (
        <div className="space-y-6 animate-fade-in">
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card hoverEffect className="bg-gradient-to-br from-indigo-50 to-indigo-100/40 dark:from-indigo-950/20 dark:to-indigo-950/10">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-500">Gross Course Receipts</p>
                  <p className="text-2xl font-black text-indigo-950 dark:text-indigo-200 mt-1">
                    ₹{allTxns.filter(t => t.status === 'success').reduce((sum, t) => sum + t.amount, 0)}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Simulated + live transaction totals</p>
                </div>
                <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
                  <DollarSign className="w-6 h-6" />
                </div>
              </CardContent>
            </Card>

            <Card hoverEffect className="bg-gradient-to-br from-emerald-50 to-emerald-100/40 dark:from-emerald-950/20 dark:to-emerald-950/10">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-500">Authorized Payments</p>
                  <p className="text-2xl font-black text-emerald-950 dark:text-emerald-200 mt-1">
                    {allTxns.filter(t => t.status === 'success').length}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Successful premium enrollment unlocks</p>
                </div>
                <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                  <BadgeCheck className="w-6 h-6" />
                </div>
              </CardContent>
            </Card>

            <Card hoverEffect className="bg-gradient-to-br from-slate-50 to-slate-100/40 dark:from-slate-950/20 dark:to-slate-950/10">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">Authorized Channels</p>
                  <p className="text-lg font-black text-slate-950 dark:text-slate-200 mt-1">UPI Core Gateway Only</p>
                  <p className="text-[10px] text-emerald-600 font-bold mt-0.5">Razorpay strict UPI filter active</p>
                </div>
                <div className="h-12 w-12 rounded-2xl bg-slate-500/10 text-slate-600 flex items-center justify-center">
                  <CreditCard className="w-6 h-6" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search, Filter & Export Strip */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800">
            <div className="flex flex-1 flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search Payment ID, student email, name, course..."
                  value={txnSearch}
                  onChange={(e) => setTxnSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 dark:bg-slate-900 focus:border-indigo-500 outline-none"
                />
              </div>
              <select
                value={txnFilterStatus}
                onChange={(e) => setTxnFilterStatus(e.target.value)}
                className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 dark:bg-slate-900 text-slate-700 dark:text-slate-300 outline-none font-bold"
              >
                <option value="all">All Statuses</option>
                <option value="success">Authorized (Success)</option>
                <option value="failed">Failed / Cancelled</option>
              </select>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportTxns}
              leftIcon={<Download className="w-4 h-4" />}
              className="text-xs font-bold"
            >
              Export Ledger (CSV)
            </Button>
          </div>

          {/* Table Ledger list */}
          <Card className="overflow-hidden border border-slate-100 dark:border-slate-800">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] border-collapse text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-950 text-slate-400 uppercase tracking-wider text-[10px] font-black border-b border-slate-100 dark:border-slate-800">
                    <th className="p-4">Payment ID / Order</th>
                    <th className="p-4">Student</th>
                    <th className="p-4">Course Package</th>
                    <th className="p-4">Amount</th>
                    <th className="p-4">Channel</th>
                    <th className="p-4 text-center">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                  {allTxns
                    .filter(txn => {
                      const matchesSearch = 
                        txn.id.toLowerCase().includes(txnSearch.toLowerCase()) ||
                        txn.orderId.toLowerCase().includes(txnSearch.toLowerCase()) ||
                        txn.userFullName.toLowerCase().includes(txnSearch.toLowerCase()) ||
                        txn.userEmail.toLowerCase().includes(txnSearch.toLowerCase()) ||
                        txn.courseTitle.toLowerCase().includes(txnSearch.toLowerCase());
                      const matchesStatus = 
                        txnFilterStatus === 'all' || txn.status === txnFilterStatus;
                      return matchesSearch && matchesStatus;
                    })
                    .map((txn) => (
                      <tr key={txn.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20 transition-colors">
                        <td className="p-4 space-y-0.5">
                          <p className="font-mono text-indigo-600 dark:text-indigo-400 font-extrabold">{txn.id}</p>
                          <p className="text-[10px] text-slate-400 font-medium">Order: {txn.orderId}</p>
                        </td>
                        <td className="p-4 space-y-0.5">
                          <p className="font-bold text-slate-900 dark:text-white">{txn.userFullName}</p>
                          <p className="text-[10px] text-slate-400 font-medium">{txn.userEmail}</p>
                        </td>
                        <td className="p-4 max-w-[180px] truncate">
                          <p className="font-bold text-slate-800 dark:text-slate-200 truncate">{txn.courseTitle}</p>
                          <p className="text-[9px] text-slate-400 font-semibold uppercase">{new Date(txn.createdAt).toLocaleDateString('en-IN')}</p>
                        </td>
                        <td className="p-4 font-extrabold text-slate-950 dark:text-white">
                          ₹{txn.amount}
                        </td>
                        <td className="p-4 font-semibold text-slate-500 text-[11px]">
                          {txn.method}
                        </td>
                        <td className="p-4 text-center">
                          <Badge variant={txn.status === 'success' ? 'success' : 'danger'}>
                            {txn.status === 'success' ? 'success' : 'failed'}
                          </Badge>
                        </td>
                        <td className="p-4 text-right shrink-0">
                          <div className="flex gap-2 justify-end">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedTxnInvoice(txn)}
                              className="text-indigo-600 dark:text-indigo-400 text-[10px] font-bold py-1 px-2 h-7"
                            >
                              Invoice
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={txn.status !== 'success'}
                              onClick={() => handleTriggerRefund(txn.id)}
                              className="text-red-500 hover:text-red-600 disabled:opacity-30 text-[10px] font-bold py-1 px-2 h-7"
                            >
                              Refund
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* TAB CONTENT: Razorpay Global Payment Configuration Settings */}
      {activeTab === 'payment-settings' && (
        <Card className="max-w-2xl border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden animate-fade-in text-left">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
            <h3 className="text-base font-black flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Razorpay API Merchant Configuration
            </h3>
            <p className="text-xs text-blue-100 mt-1 leading-normal">
              Administer credentials, business checkout identity and custom client responses. Changes apply instantly without redeploying code.
            </p>
          </div>

          <CardContent className="p-6">
            <form onSubmit={handleSavePaymentSettings} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label htmlFor="rzp-key-input" className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Razorpay Key ID</label>
                  <Input
                    id="rzp-key-input"
                    type="text"
                    required
                    value={cfgRzpKey}
                    onChange={(e) => setCfgRzpKey(e.target.value)}
                    placeholder="rzp_live_xxxxxxxxxxxxxx"
                    className="text-xs font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="bus-name-input" className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Business Public Name</label>
                  <Input
                    id="bus-name-input"
                    type="text"
                    required
                    value={cfgBusName}
                    onChange={(e) => setCfgBusName(e.target.value)}
                    placeholder="RK Coaching Institute"
                    className="text-xs font-bold"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label htmlFor="bus-logo-input" className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Merchant Logo URL (Square Image)</label>
                <Input
                  id="bus-logo-input"
                  type="url"
                  required
                  value={cfgBusLogo}
                  onChange={(e) => setCfgBusLogo(e.target.value)}
                  placeholder="https://example.com/logo.png"
                  className="text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label htmlFor="support-email-input" className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Support Helpline Email</label>
                  <Input
                    id="support-email-input"
                    type="email"
                    required
                    value={cfgSupEmail}
                    onChange={(e) => setCfgSupEmail(e.target.value)}
                    placeholder="support@rkcoaching.com"
                    className="text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="support-phone-input" className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Support Contact Phone</label>
                  <Input
                    id="support-phone-input"
                    type="text"
                    required
                    value={cfgSupPhone}
                    onChange={(e) => setCfgSupPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label htmlFor="success-msg-input" className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Success Alert Message</label>
                <textarea
                  id="success-msg-input"
                  required
                  rows={2}
                  value={cfgSuccessMsg}
                  onChange={(e) => setCfgSuccessMsg(e.target.value)}
                  placeholder="Payment completed successfully!"
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-800 dark:bg-slate-900 outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="failure-msg-input" className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Failure Alert Message</label>
                <textarea
                  id="failure-msg-input"
                  required
                  rows={2}
                  value={cfgFailureMsg}
                  onChange={(e) => setCfgFailureMsg(e.target.value)}
                  placeholder="Your payment failed. Please try again."
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-800 dark:bg-slate-900 outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-xs font-black py-3 rounded-xl"
                >
                  Save & Publish Merchant Configurations
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Invoice Detailed Overlay Modal */}
      {selectedTxnInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-950 shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col my-8">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Official Razorpay Invoice</p>
                <h3 className="text-sm font-bold text-white mt-0.5">Payment Reference</h3>
              </div>
              <button
                onClick={() => setSelectedTxnInvoice(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                &times;
              </button>
            </div>

            <div className="p-6 space-y-5 text-left text-xs">
              <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <h4 className="text-base font-black text-slate-950 dark:text-white">{paymentSettings.businessName}</h4>
                  <p className="text-slate-500 text-[10px] mt-0.5">Helpline: {paymentSettings.supportPhone}</p>
                  <p className="text-slate-500 text-[10px]">{paymentSettings.supportEmail}</p>
                </div>
                <div className="text-right">
                  <Badge variant={selectedTxnInvoice.status === 'success' ? 'success' : 'danger'}>
                    {selectedTxnInvoice.status === 'success' ? 'Paid / Authorized' : 'Failed / Decline'}
                  </Badge>
                  <p className="text-[10px] font-mono text-slate-400 mt-1">{selectedTxnInvoice.id}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[9px] text-slate-400 uppercase font-extrabold tracking-wide">Billed To</p>
                  <p className="font-extrabold text-slate-950 dark:text-white mt-1">{selectedTxnInvoice.userFullName}</p>
                  <p className="text-slate-500 font-semibold text-[10px] mt-0.5">{selectedTxnInvoice.userEmail}</p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] text-slate-400 uppercase font-extrabold tracking-wide">Transaction Date</p>
                  <p className="font-bold text-slate-950 dark:text-white mt-1">
                    {new Date(selectedTxnInvoice.createdAt).toLocaleString('en-IN')}
                  </p>
                  <p className="text-slate-500 font-semibold text-[10px] mt-0.5">Channel: {selectedTxnInvoice.method}</p>
                </div>
              </div>

              <div className="border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden">
                <div className="bg-slate-50 dark:bg-slate-900 px-4 py-2 grid grid-cols-3 text-[9px] font-black uppercase text-slate-400 tracking-wider">
                  <span className="col-span-2">Course Package Syllabus</span>
                  <span className="text-right">Price (INR)</span>
                </div>
                <div className="px-4 py-3.5 grid grid-cols-3 font-semibold text-slate-800 dark:text-slate-200 border-t border-slate-100 dark:border-slate-800">
                  <span className="col-span-2 font-bold">{selectedTxnInvoice.courseTitle}</span>
                  <span className="text-right font-bold">₹{selectedTxnInvoice.amount}</span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900 px-4 py-3 grid grid-cols-3 font-bold border-t border-slate-100 dark:border-slate-800 text-slate-950 dark:text-white">
                  <span className="col-span-2 text-right text-[10px] text-slate-400 uppercase tracking-wide">Total Deducted:</span>
                  <span className="text-right text-indigo-600 dark:text-indigo-400 font-black">₹{selectedTxnInvoice.amount}</span>
                </div>
              </div>

              <div className="flex gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
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
