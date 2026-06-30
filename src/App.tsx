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

// Secondary views imported dynamically or direct for compiling speed
import LandingPage from './views/home/LandingPage';
import StudentDashboard from './views/student/Dashboard';
import TeacherDashboard from './views/teacher/Dashboard';
import AdminDashboard from './views/admin/Dashboard';
import FAQPage from './views/home/FAQPage';
import ContactPage from './views/home/ContactPage';
import Leaderboard from './views/student/Leaderboard';
import AuthPage from './views/home/AuthPage';

// Complete Student Learning Experience Views
import ClassView from './views/lms/ClassView';
import SubjectView from './views/lms/SubjectView';
import CourseView from './views/lms/CourseView';
import LessonView from './views/lms/LessonView';
import AdvancedSearch from './views/lms/AdvancedSearch';
import PurchasesInvoices from './views/student/PurchasesInvoices';

function MainAppShell() {
  const { role, currentView, setCurrentView, breadcrumbs, setBreadcrumbs, addToast } = useApp();
  
  // Dashboard drawer states
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

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
        setBreadcrumbs([{ label: 'Syllabus Catalog', view: 'home' }]);
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
      case 'leaderboard':
        setBreadcrumbs([
          { label: 'Gamified Center', view: 'student-dashboard' },
          { label: 'Leaderboard Rankings' }
        ]);
        break;
      case 'advanced-search':
        setBreadcrumbs([
          { label: 'Syllabus Catalog', view: 'home' },
          { label: 'Advanced Search' }
        ]);
        break;
      case 'purchases-invoices':
        setBreadcrumbs([
          { label: 'Student Suite', view: 'student-dashboard' },
          { label: 'Purchases & Invoices' }
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
        return <LandingPage />;
      
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
      
      case 'course-view':
        return <CourseView />;
      
      case 'lesson-view':
        return <LessonView />;
      
      case 'advanced-search':
        return <AdvancedSearch />;
      
      case 'purchases-invoices':
        return <PurchasesInvoices />;
      
      case 'leaderboard':
        if (role === 'visitor') {
          return (
            <ErrorState
              title="Registered Users Only"
              description="Leaderboards list relative ranking positions and learning scores. Please log in or switch your demo view to STUDENT to participate."
              code="AUTH_401"
            />
          );
        }
        return <Leaderboard />;
      
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

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 flex flex-col transition-colors duration-200">
      {/* Toast notifications portal */}
      <ToastContainer />

      {/* Primary header navbar */}
      <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      {/* Main core layout containing sidebar & main panels */}
      <div className="flex-1 flex flex-col lg:flex-row max-w-7xl w-full mx-auto relative">
        {/* Sidebar Navigation Panel */}
        {isSidebarVisible && (
          <Sidebar
            isOpen={sidebarOpen}
            isCollapsed={sidebarCollapsed}
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
