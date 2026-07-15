/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, lazy, Suspense } from 'react';
import { UserRole } from './types';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { Footer } from './components/layout/Footer';
import { Breadcrumbs } from './components/layout/Breadcrumbs';
import { ToastContainer } from './components/shared/ToastContainer';
import { ErrorState } from './components/shared/ErrorState';
import { RefreshCw } from 'lucide-react';

// Secondary views loaded dynamically via React.lazy
const LandingPage = lazy(() => import('./views/home/LandingPage'));
const StudentDashboard = lazy(() => import('./views/student/Dashboard'));
const TeacherDashboard = lazy(() => import('./views/teacher/Dashboard'));
const AdminDashboard = lazy(() => import('./views/admin/Dashboard'));
const FAQPage = lazy(() => import('./views/home/FAQPage'));
const ContactPage = lazy(() => import('./views/home/ContactPage'));
const AuthPage = lazy(() => import('./views/home/AuthPage'));

// Complete Student Learning Experience Views
const ClassView = lazy(() => import('./views/lms/ClassView'));
const SubjectView = lazy(() => import('./views/lms/SubjectView'));
const CourseView = lazy(() => import('./views/lms/CourseView'));
const LessonView = lazy(() => import('./views/lms/LessonView'));
const PurchasesInvoices = lazy(() => import('./views/student/PurchasesInvoices'));
const PyqView = lazy(() => import('./views/lms/PyqView'));
const QuizDashboard = lazy(() => import('./views/student/QuizDashboard'));
const QuizPlay = lazy(() => import('./views/student/QuizPlay'));
const QuizResult = lazy(() => import('./views/student/QuizResult'));
const PyqDashboard = lazy(() => import('./views/student/PyqDashboard'));
const PyqPlay = lazy(() => import('./views/student/PyqPlay'));
const PyqResult = lazy(() => import('./views/student/PyqResult'));
const UpdateProfile = lazy(() => import('./views/student/UpdateProfile'));
const SuperAdminDashboard = lazy(() => import('./views/super-admin/SuperAdminDashboard'));
const PremiumMaterials = lazy(() => import('./views/student/PremiumMaterials'));

const STUDENT_STATIC_BREADCRUMBS: Record<string, { label: string; view?: string }[]> = {
  'student-dashboard': [{ label: 'Dashboard' }],
  'premium-materials': [{ label: 'My Premium Materials' }],
  'update-profile': [{ label: 'Update Profile' }],
  'quiz-dashboard': [
    { label: 'Gamified Center', view: 'student-dashboard' },
    { label: 'Quiz Arena' }
  ],
  'pyq-dashboard': [
    { label: 'Gamified Center', view: 'student-dashboard' },
    { label: 'PYQ Arena' }
  ],
  'catalog': [{ label: 'All Courses' }],
  'purchases-invoices': [{ label: 'My Invoices' }],
  'faq': [{ label: 'Syllabus Help' }]
};

function MainAppShell() {
  const { role, currentView, setCurrentView, breadcrumbs, setBreadcrumbs, addToast, initializing, profileSyncing } = useApp();
  
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
    if (role === 'student' && STUDENT_STATIC_BREADCRUMBS[currentView]) {
      setBreadcrumbs(STUDENT_STATIC_BREADCRUMBS[currentView]);
      return;
    }

    switch (currentView) {
      case 'home':
        setBreadcrumbs([]);
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
      case 'super-admin-dashboard':
        setBreadcrumbs([
          { label: 'Super Admin', view: 'super-admin-dashboard' },
          { label: 'Master Control Center' }
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
      case 'pyq-play':
        setBreadcrumbs([
          { label: 'PYQ Arena', view: 'pyq-dashboard' },
          { label: 'Board Test Live' }
        ]);
        break;
      case 'pyq-result':
        setBreadcrumbs([
          { label: 'PYQ Arena', view: 'pyq-dashboard' },
          { label: 'PYQ Result' }
        ]);
        break;
      default:
        // Skip updating breadcrumbs for catalog dynamic views that handle their own breadcrumbs
        const dynamicViews = ['class-view', 'subject-view', 'course-view', 'lesson-view', 'pyq-view'];
        if (!dynamicViews.includes(currentView)) {
          setBreadcrumbs([{ label: 'Home', view: 'home' }]);
        }
    }
  }, [currentView, role, setBreadcrumbs]);

  // Handle mobile drawer close on navigation change
  useEffect(() => {
    setSidebarOpen(false);
  }, [currentView]);
  // Client-Side Simulated View Router + Protection Guards
  const renderActiveView = () => {
    // 1. Role-based view protection mapping
    const VIEW_ROLES: Record<string, UserRole[]> = {
      'student-dashboard': ['student', 'admin'],
      'premium-materials': ['student', 'admin'],
      'teacher-dashboard': ['teacher', 'admin'],
      'teacher-content': ['teacher', 'admin'],
      'admin-dashboard': ['admin', 'super_admin'],
      'admin-controls': ['admin', 'super_admin'],
      'super-admin-dashboard': ['super_admin'],
      'quiz-dashboard': ['student', 'admin'],
      'quiz-play': ['student', 'admin'],
      'quiz-result': ['student', 'admin'],
      'pyq-dashboard': ['student', 'admin'],
      'pyq-play': ['student', 'admin'],
      'pyq-result': ['student', 'admin'],
      'purchases-invoices': ['student', 'admin'],
      'update-profile': ['student', 'admin'],
      'class-view': ['student', 'admin'],
      'subject-view': ['student', 'admin'],
      'course-view': ['student', 'admin'],
      'lesson-view': ['student', 'admin'],
    };

    const allowedRoles = VIEW_ROLES[currentView];
    if (allowedRoles) {
      // If we are in the middle of a background profile sync, do not render protected dashboards
      // or print RBAC failures, because the user's active role is a temporary default.
      if (profileSyncing) {
        return null;
      }

      // If the current role doesn't have access, short-circuit immediately.
      // If we are transitioning or initializing, return null to avoid flashing 403.
      if (!allowedRoles.includes(role)) {
        console.error(`[DEBUG] RBAC FAILED - User role '${role}' attempted to access ${currentView}`);
        
        // Return appropriate ErrorState
        let title = "Access Refused";
        let description = "You do not have permission to access this page.";
        let code = "AUTH_403";
        
        if (currentView === 'student-dashboard' || currentView === 'update-profile') {
          title = "Access Refused - Student Restricted";
          description = "This student console segments course histories and reward badges. Please switch your active role to STUDENT via the top-right simulation toolbar to test.";
          code = "AUTH_403_STUDENT";
        } else if (currentView === 'teacher-dashboard' || currentView === 'teacher-content') {
          title = "Access Refused - Teacher restricted";
          description = "This teacher segment publishes handwritten lecture revisions and schedules interactive exams. Please switch your active role to TEACHER via the top-right simulation toolbar to test.";
          code = "AUTH_403_TEACHER";
        } else if (currentView === 'admin-dashboard' || currentView === 'admin-controls') {
          title = "Access Refused - Admin restricted";
          description = "This administrator section is restricted to site owners to configure sliders, approve orders, and schedule notifications. Please switch your active role to ADMIN via the top-right simulation toolbar to test.";
          code = "AUTH_403_ADMIN";
        } else if (currentView === 'super-admin-dashboard') {
          title = "Access Refused - Super Admin Restricted";
          description = "This section is restricted to Super Admins only.";
          code = "AUTH_403_SUPER_ADMIN";
        }
        
        return (
          <ErrorState
            title={title}
            description={description}
            code={code}
          />
        );
      }
    }

    switch (currentView) {
      case 'home':
        return <LandingPage showCatalog={false} />;
      
      case 'catalog':
        return <LandingPage showCatalog={true} />;
      
      case 'student-dashboard':
        console.log('[DEBUG] RBAC PASSED - Accessing Student Dashboard');
        return <StudentDashboard />;
      
      case 'update-profile':
        return <UpdateProfile />;
      
      case 'teacher-dashboard':
      case 'teacher-content':
        console.log('[DEBUG] RBAC PASSED - Accessing Teacher Dashboard');
        return <TeacherDashboard />;
      
      case 'admin-dashboard':
      case 'admin-controls':
        console.log('[DEBUG] RBAC PASSED - Accessing Admin Dashboard');
        return <AdminDashboard />;
 
      case 'super-admin-dashboard':
        console.log('[DEBUG] RBAC PASSED - Accessing Super Admin Dashboard');
        return <SuperAdminDashboard />;
      
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
      
      case 'premium-materials':
        return <PremiumMaterials />;
      
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

  const isSidebarVisible = role !== 'visitor' && role !== 'super_admin';

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
              <Suspense fallback={
                <div className="flex flex-col items-center justify-center space-y-4 py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500" />
                  <p className="text-xs text-slate-500 font-semibold">Loading viewport...</p>
                </div>
              }>
                {renderActiveView()}
              </Suspense>
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
  useEffect(() => {
    console.log(`[${new Date().toISOString()}] APP START`);
  }, []);

  return (
    <AppProvider>
      <MainAppShell />
    </AppProvider>
  );
}
