/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { Footer } from './components/layout/Footer';
import { Breadcrumbs } from './components/layout/Breadcrumbs';
import { ToastContainer } from './components/shared/ToastContainer';
import { ErrorState } from './components/shared/ErrorState';
import { RefreshCw } from 'lucide-react';

// Secondary views imported dynamically or direct for compiling speed
import LandingPage from './views/home/LandingPage';
import StudentDashboard from './views/student/Dashboard';
import TeacherDashboard from './views/teacher/Dashboard';
import AdminDashboard from './views/admin/Dashboard';
import FAQPage from './views/home/FAQPage';
import ContactPage from './views/home/ContactPage';
import AuthPage from './views/home/AuthPage';

// Complete Student Learning Experience Views
import ClassView from './views/lms/ClassView';
import SubjectView from './views/lms/SubjectView';
import CourseView from './views/lms/CourseView';
import LessonView from './views/lms/LessonView';
import PurchasesInvoices from './views/student/PurchasesInvoices';
import PyqView from './views/lms/PyqView';
import QuizDashboard from './views/student/QuizDashboard';
import QuizPlay from './views/student/QuizPlay';
import QuizResult from './views/student/QuizResult';
import PyqDashboard from './views/student/PyqDashboard';
import PyqPlay from './views/student/PyqPlay';
import PyqResult from './views/student/PyqResult';
import UpdateProfile from './views/student/UpdateProfile';

function MainAppShell() {
  const { role, currentView, setCurrentView, breadcrumbs, setBreadcrumbs, addToast, initializing } = useApp();
  
  // Dashboard drawer states
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  // Mobile header menu — lifted here so it can be coordinated with sidebar
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Mutual exclusion: only one panel may be open at a time
  const openSidebar = () => {
    setMobileMenuOpen(false);
    setSidebarOpen(true);
  };
  const closeSidebar = () => setSidebarOpen(false);
  const openMobileMenu = () => {
    setSidebarOpen(false);
    setMobileMenuOpen(true);
  };
  const closeMobileMenu = () => setMobileMenuOpen(false);

  const anyPanelOpen = sidebarOpen || mobileMenuOpen;

  // Lock body scroll while any panel is open
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.body.style.overflow = anyPanelOpen ? 'hidden' : '';
    }
    return () => {
      if (typeof document !== 'undefined') document.body.style.overflow = '';
    };
  }, [anyPanelOpen]);

  // Handle email verification redirect
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('verified') === 'true') {
        addToast('Email verified successfully! You can now log in.', 'success');
        setCurrentView('auth');
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, [addToast, setCurrentView]);

  // Scroll to top on view changes (restoration/navigation)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0);
    }
  }, [currentView]);

  // Sync breadcrumbs automatically depending on view transitions
  useEffect(() => {
    switch (currentView) {
      case 'home':
        setBreadcrumbs([]);
        break;
      case 'catalog':
        setBreadcrumbs([{ label: 'Syllabus Catalog', view: 'catalog' }]);
        break;
      case 'student-dashboard':
        setBreadcrumbs([
          { label: 'Student Suite', view: 'student-dashboard' },
          { label: 'My Learning Board' }
        ]);
        break;
      case 'teacher-dashboard':
        setBreadcrumbs([
          { label: 'Instructor Workspace', view: 'teacher-dashboard' },
          { label: 'Performance Analytics' }
        ]);
        break;
      case 'teacher-content':
        setBreadcrumbs([
          { label: 'Instructor Workspace', view: 'teacher-dashboard' },
          { label: 'Publish Lecture Materials' }
        ]);
        break;
      case 'admin-dashboard':
        setBreadcrumbs([
          { label: 'Admin Enterprise Control', view: 'admin-dashboard' },
          { label: 'Overview Metrics' }
        ]);
        break;
      case 'admin-controls':
        setBreadcrumbs([
          { label: 'Admin Enterprise Control', view: 'admin-dashboard' },
          { label: 'CMS Announcements & Payments' }
        ]);
        break;
      case 'faq':
        setBreadcrumbs([{ label: 'Helpdesk FAQs', view: 'faq' }]);
        break;
      case 'contact':
        setBreadcrumbs([{ label: 'Support Contact Ticket', view: 'contact' }]);
        break;
      case 'auth':
      case 'auth-signup':
        setBreadcrumbs([{ label: 'Authentication Suite', view: 'auth' }]);
        break;
      case 'quiz-dashboard':
        setBreadcrumbs([
          { label: 'Gamified Center', view: 'student-dashboard' },
          { label: 'Quiz Arena' }
        ]);
        break;
      case 'quiz-play':
        setBreadcrumbs([
          { label: 'Quiz Arena', view: 'quiz-dashboard' },
          { label: 'CBT Live Test' }
        ]);
        break;
      case 'quiz-result':
        setBreadcrumbs([
          { label: 'Quiz Arena', view: 'quiz-dashboard' },
          { label: 'Quiz Result Scorecard' }
        ]);
        break;
      case 'purchases-invoices':
        setBreadcrumbs([
          { label: 'Student Suite', view: 'student-dashboard' },
          { label: 'Purchases & Invoices' }
        ]);
        break;
      case 'update-profile':
        setBreadcrumbs([
          { label: 'Student Dashboard', view: 'student-dashboard' },
          { label: 'Update Profile' }
        ]);
        break;
      default:
        setBreadcrumbs([{ label: 'Home', view: 'home' }]);
    }
  }, [currentView, setBreadcrumbs]);

  // Handle mobile drawer close on navigation change
  useEffect(() => {
    setSidebarOpen(false);
  }, [currentView]);

  // Client-Side Simulated View Router + Protection Guards
  const renderActiveView = () => {
    switch (currentView) {
      case 'home':
        return <LandingPage showCatalog={false} />;
      
      case 'catalog':
        return <LandingPage showCatalog={true} />;
      
      case 'student-dashboard':
        if (role !== 'student' && role !== 'admin') {
          return (
            <ErrorState
              title="Access Refused - Student Restricted"
              description="This student console segments course histories and reward badges. Please switch your active role to STUDENT via the top-right simulation toolbar to test."
              code="AUTH_403_STUDENT"
            />
          );
        }
        return <StudentDashboard />;
      
      case 'update-profile':
        if (role !== 'student' && role !== 'admin') {
          return (
            <ErrorState
              title="Access Refused - Student Restricted"
              description="This student console segments course histories and reward badges. Please switch your active role to STUDENT via the top-right simulation toolbar to test."
              code="AUTH_403_STUDENT"
            />
          );
        }
        return <UpdateProfile />;
      
      case 'teacher-dashboard':
      case 'teacher-content':
        if (role !== 'teacher' && role !== 'admin') {
          return (
            <ErrorState
              title="Access Refused - Teacher restricted"
              description="This teacher segment publishes handwritten lecture revisions and schedules interactive exams. Please switch your active role to TEACHER via the top-right simulation toolbar to test."
              code="AUTH_403_TEACHER"
            />
          );
        }
        return <TeacherDashboard />;
      
      case 'admin-dashboard':
      case 'admin-controls':
        if (role !== 'admin') {
          return (
            <ErrorState
              title="Access Refused - Admin restricted"
              description="This administrator section is restricted to site owners to configure sliders, approve orders, and schedule notifications. Please switch your active role to ADMIN via the top-right simulation toolbar to test."
              code="AUTH_403_ADMIN"
            />
          );
        }
        return <AdminDashboard />;
      
      case 'faq':
        return <FAQPage />;
      
      case 'contact':
        return <ContactPage />;

      case 'auth':
      case 'auth-signup':
        return <AuthPage />;
      
      case 'class-view':
        return <ClassView />;
      
      case 'subject-view':
        return <SubjectView />;
      
      case 'pyq-view':
        return <PyqView />;

      case 'pyq-dashboard':
        return <PyqDashboard />;
      
      case 'pyq-play':
        return <PyqPlay />;
      
      case 'pyq-result':
        return <PyqResult />;
      
      case 'quiz-dashboard':
        return <QuizDashboard />;
      
      case 'quiz-play':
        return <QuizPlay />;
      
      case 'quiz-result':
        return <QuizResult />;
      
      case 'course-view':
        return <CourseView />;
      
      case 'lesson-view':
        return <LessonView />;
      
      case 'purchases-invoices':
        return <PurchasesInvoices />;
      
      default:
        return (
          <ErrorState
            title="Syllabus Directory Not Found"
            description="The URL path or client-side layout screen you are searching for does not exist."
            code="CLIENT_404"
          />
        );
    }
  };

  const isSidebarVisible = role !== 'visitor';

  if (initializing) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="relative p-8 rounded-3xl border border-slate-800 bg-slate-950/40 backdrop-blur-xl flex flex-col items-center gap-4 text-center max-w-sm shadow-2xl">
          <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20 shadow-inner">
            <RefreshCw className="w-6 h-6 animate-spin" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-200">RK Coaching LMS</h3>
            <p className="text-[10px] text-slate-500 font-semibold">Synchronizing secure student session...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 flex flex-col transition-colors duration-200">
      {/* Toast notifications portal */}
      <ToastContainer />

      {/* Primary header navbar */}
      <Header
        onToggleSidebar={() => sidebarOpen ? closeSidebar() : openSidebar()}
        mobileMenuOpen={mobileMenuOpen}
        onOpenMobileMenu={openMobileMenu}
        onCloseMobileMenu={closeMobileMenu}
      />

      {/* Shared backdrop overlay — closes whichever panel is open */}
      {anyPanelOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={() => { closeSidebar(); closeMobileMenu(); }}
          aria-hidden="true"
        />
      )}

      {/* Main core layout containing sidebar & main panels */}
      <div className="flex-1 flex flex-col lg:flex-row max-w-7xl w-full mx-auto relative">
        {/* Sidebar Navigation Panel */}
        {isSidebarVisible && (
          <Sidebar
            isOpen={sidebarOpen}
            isCollapsed={sidebarCollapsed}
            onClose={closeSidebar}
            onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          />
        )}

        {/* Center Main Stage panels */}
        <main className="flex-1 flex flex-col min-w-0 min-h-[calc(100vh-4rem)]">
          {/* Breadcrumbs pathway indicators */}
          <Breadcrumbs />

          {/* Core viewport stage */}
          <div className="flex-1 p-4 sm:p-6 lg:p-8">
            <div className="mx-auto max-w-5xl">
              {renderActiveView()}
            </div>
          </div>

          {/* Global Sticky Footer inside viewport */}
          <Footer />
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainAppShell />
    </AppProvider>
  );
}
