import React, { useState, useEffect } from 'react';
import { dbStore } from './services/dbStore';
import { authService } from './services/authService';
import { UserProfile } from './types';

// Common Layout
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';

// Setup
import { SetupWizard } from './components/setup/SetupWizard';

// Public Pages
import { HomePage } from './components/public/HomePage';
import { CourseListPage } from './components/public/CourseListPage';
import { CourseDetailPage } from './components/public/CourseDetailPage';
import { LoginPage } from './components/public/LoginPage';
import { RegisterPage } from './components/public/RegisterPage';

// Student Pages
import { StudentDashboard } from './components/student/StudentDashboard';
import { MyCoursesPage } from './components/student/MyCoursesPage';
import { LessonPlayerPage } from './components/student/LessonPlayerPage';
import { StudentProfilePage } from './components/student/StudentProfilePage';
import { StudentSettingsPage } from './components/student/StudentSettingsPage';

// Admin Pages
import { AdminSidebar } from './components/admin/AdminSidebar';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { CourseManagerPage } from './components/admin/CourseManagerPage';
import { CourseFormPage } from './components/admin/CourseFormPage';
import { CurriculumBuilderPage } from './components/admin/CurriculumBuilderPage';
import { LessonEditorPage } from './components/admin/LessonEditorPage';
import { StudentManagerPage } from './components/admin/StudentManagerPage';
import { StudentDetailPage } from './components/admin/StudentDetailPage';
import { EnrollmentRequestsPage } from './components/admin/EnrollmentRequestsPage';
import { CategoryManagerPage } from './components/admin/CategoryManagerPage';
import { SystemCenter } from './components/admin/system/SystemCenter';

export function App() {
  const [currentRoute, setCurrentRoute] = useState<string>(window.location.pathname || '/');
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(authService.getCurrentUser());
  const [setupStatus, setSetupStatus] = useState(dbStore.getSetupStatus());

  // Handle URL navigation
  useEffect(() => {
    const handlePopState = () => {
      setCurrentRoute(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (route: string) => {
    window.history.pushState({}, '', route);
    setCurrentRoute(route);
    window.scrollTo(0, 0);
  };

  const handleLoginSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
      navigate('/admin');
    } else {
      navigate('/student');
    }
  };

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
    navigate('/');
  };

  // Check if system is NOT installed
  if (!setupStatus.installed || currentRoute === '/setup') {
    return (
      <SetupWizard
        onSetupComplete={() => {
          setSetupStatus(dbStore.getSetupStatus());
          setCurrentUser(authService.getCurrentUser());
          navigate('/');
        }}
      />
    );
  }

  // Normalize route path (strip query params and trailing slash)
  const cleanRoute = currentRoute.split('?')[0].replace(/\/$/, '') || '/';

  // Check if route is in Admin section
  const isAdminRoute = cleanRoute.startsWith('/admin');

  // Check if route is Lesson Player (Standalone Fullscreen Layout)
  const isLessonPlayerRoute =
    cleanRoute.startsWith('/student/learn/') || cleanRoute.startsWith('/student/courses/');

  if (isLessonPlayerRoute) {
    if (!currentUser) {
      return (
        <div className="min-h-screen flex flex-col bg-slate-50 font-sans antialiased text-slate-900">
          <Header currentUser={currentUser} onNavigate={navigate} onLogout={handleLogout} />
          <main className="flex-1 flex items-center justify-center p-4">
            <LoginPage onNavigate={navigate} onLoginSuccess={handleLoginSuccess} />
          </main>
          <Footer onNavigate={navigate} />
        </div>
      );
    }

    // Extract courseId and lessonId
    const cleanPath = cleanRoute
      .replace('/student/learn/', '')
      .replace('/student/courses/', '');
    const parts = cleanPath.split('/');
    const courseId = parts[0];
    const lessonId = parts[1];

    return (
      <LessonPlayerPage
        courseId={courseId}
        lessonId={lessonId}
        currentUser={currentUser}
        onNavigate={navigate}
      />
    );
  }

  // Render Admin Layout
  if (isAdminRoute && currentUser && (currentUser.role === 'ADMIN' || currentUser.role === 'SUPER_ADMIN')) {
    return (
      <div className="flex min-h-screen bg-slate-100 font-sans antialiased text-slate-900">
        <AdminSidebar currentRoute={cleanRoute} onNavigate={navigate} currentUser={currentUser} onLogout={handleLogout} />
        <main className="flex-1 overflow-y-auto">
          {cleanRoute === '/admin' && <AdminDashboard onNavigate={navigate} currentUser={currentUser} />}
          {cleanRoute === '/admin/courses' && <CourseManagerPage onNavigate={navigate} />}
          {cleanRoute === '/admin/courses/create' && <CourseFormPage onNavigate={navigate} />}
          {cleanRoute.match(/^\/admin\/courses\/([^/]+)\/edit$/) && (
            <CourseFormPage courseId={cleanRoute.split('/')[3]} onNavigate={navigate} />
          )}
          {cleanRoute.match(/^\/admin\/courses\/([^/]+)\/curriculum$/) && (
            <CurriculumBuilderPage courseId={cleanRoute.split('/')[3]} onNavigate={navigate} />
          )}
          {cleanRoute.match(/^\/admin\/lessons\/([^/]+)\/edit$/) && (
            <LessonEditorPage lessonId={cleanRoute.split('/')[3]} onNavigate={navigate} />
          )}
          {cleanRoute === '/admin/students' && <StudentManagerPage onNavigate={navigate} currentUser={currentUser} />}
          {cleanRoute.match(/^\/admin\/students\/([^/]+)$/) && (
            <StudentDetailPage userId={cleanRoute.split('/')[3]} onNavigate={navigate} />
          )}
          {cleanRoute === '/admin/enrollment-requests' && <EnrollmentRequestsPage />}
          {cleanRoute === '/admin/categories' && <CategoryManagerPage />}
          {cleanRoute.startsWith('/admin/system') && (
            <SystemCenter tab={cleanRoute.replace('/admin/system/', '') || 'overview'} onNavigate={navigate} />
          )}
        </main>
      </div>
    );
  }

  // Render Main Content Helper
  const renderMainContent = () => {
    if (cleanRoute === '/') {
      return <HomePage onNavigate={navigate} currentUser={currentUser} />;
    }
    if (cleanRoute === '/courses') {
      return <CourseListPage onNavigate={navigate} currentUser={currentUser} />;
    }
    if (cleanRoute.startsWith('/courses/')) {
      const slug = cleanRoute.replace('/courses/', '');
      if (slug) {
        return <CourseDetailPage slug={slug} onNavigate={navigate} currentUser={currentUser} />;
      }
      return <CourseListPage onNavigate={navigate} currentUser={currentUser} />;
    }
    if (cleanRoute === '/login') {
      return <LoginPage onNavigate={navigate} onLoginSuccess={handleLoginSuccess} />;
    }
    if (cleanRoute === '/register') {
      return <RegisterPage onNavigate={navigate} onRegisterSuccess={handleLoginSuccess} />;
    }

    // Student Protected Routes
    if (cleanRoute.startsWith('/student')) {
      if (!currentUser) {
        return <LoginPage onNavigate={navigate} onLoginSuccess={handleLoginSuccess} />;
      }
      if (cleanRoute === '/student' || cleanRoute === '/student/dashboard') {
        return <StudentDashboard currentUser={currentUser} onNavigate={navigate} />;
      }
      if (cleanRoute === '/student/my-courses') {
        return <MyCoursesPage currentUser={currentUser} onNavigate={navigate} />;
      }
      if (cleanRoute === '/student/profile') {
        return (
          <StudentProfilePage currentUser={currentUser} onUpdateProfile={(u) => setCurrentUser(u)} />
        );
      }
      if (cleanRoute === '/student/settings') {
        return <StudentSettingsPage currentUser={currentUser} />;
      }
    }

    // Fallback if route not matched
    return <CourseListPage onNavigate={navigate} currentUser={currentUser} />;
  };

  // Render Standard Public & Student Layout
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans antialiased text-slate-900 selection:bg-indigo-500 selection:text-white">
      <Header currentUser={currentUser} onNavigate={navigate} onLogout={handleLogout} />
      <main className="flex-1">{renderMainContent()}</main>
      <Footer onNavigate={navigate} />
    </div>
  );
}

export default App;
