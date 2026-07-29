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

  // Check if route is in Admin section
  const isAdminRoute = currentRoute.startsWith('/admin');

  // Check if route is Lesson Player (Standalone Fullscreen Layout)
  const isLessonPlayerRoute = currentRoute.startsWith('/student/learn/');

  if (isLessonPlayerRoute && currentUser) {
    // Extract courseId and lessonId
    const parts = currentRoute.replace('/student/learn/', '').split('/');
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
        <AdminSidebar currentRoute={currentRoute} onNavigate={navigate} currentUser={currentUser} onLogout={handleLogout} />
        <main className="flex-1 overflow-y-auto">
          {currentRoute === '/admin' && <AdminDashboard onNavigate={navigate} currentUser={currentUser} />}
          {currentRoute === '/admin/courses' && <CourseManagerPage onNavigate={navigate} />}
          {currentRoute === '/admin/courses/create' && <CourseFormPage onNavigate={navigate} />}
          {currentRoute.match(/^\/admin\/courses\/([^/]+)\/edit$/) && (
            <CourseFormPage courseId={currentRoute.split('/')[3]} onNavigate={navigate} />
          )}
          {currentRoute.match(/^\/admin\/courses\/([^/]+)\/curriculum$/) && (
            <CurriculumBuilderPage courseId={currentRoute.split('/')[3]} onNavigate={navigate} />
          )}
          {currentRoute.match(/^\/admin\/lessons\/([^/]+)\/edit$/) && (
            <LessonEditorPage lessonId={currentRoute.split('/')[3]} onNavigate={navigate} />
          )}
          {currentRoute === '/admin/students' && <StudentManagerPage onNavigate={navigate} currentUser={currentUser} />}
          {currentRoute.match(/^\/admin\/students\/([^/]+)$/) && (
            <StudentDetailPage userId={currentRoute.split('/')[3]} onNavigate={navigate} />
          )}
          {currentRoute === '/admin/enrollment-requests' && <EnrollmentRequestsPage />}
          {currentRoute === '/admin/categories' && <CategoryManagerPage />}
          {currentRoute.startsWith('/admin/system') && (
            <SystemCenter tab={currentRoute.replace('/admin/system/', '') || 'overview'} onNavigate={navigate} />
          )}
        </main>
      </div>
    );
  }

  // Render Standard Public & Student Layout
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans antialiased text-slate-900 selection:bg-indigo-500 selection:text-white">
      <Header currentUser={currentUser} onNavigate={navigate} onLogout={handleLogout} />

      <main className="flex-1">
        {currentRoute === '/' && <HomePage onNavigate={navigate} currentUser={currentUser} />}
        {currentRoute.startsWith('/courses') && currentRoute === '/courses' && (
          <CourseListPage onNavigate={navigate} currentUser={currentUser} />
        )}
        {currentRoute.startsWith('/courses/') && currentRoute !== '/courses' && (
          <CourseDetailPage slug={currentRoute.replace('/courses/', '')} onNavigate={navigate} currentUser={currentUser} />
        )}
        {currentRoute === '/login' && <LoginPage onNavigate={navigate} onLoginSuccess={handleLoginSuccess} />}
        {currentRoute === '/register' && <RegisterPage onNavigate={navigate} onRegisterSuccess={handleLoginSuccess} />}

        {/* Student Protected Routes */}
        {currentRoute === '/student' && currentUser && <StudentDashboard currentUser={currentUser} onNavigate={navigate} />}
        {currentRoute === '/student/my-courses' && currentUser && <MyCoursesPage currentUser={currentUser} onNavigate={navigate} />}
        {currentRoute === '/student/profile' && currentUser && (
          <StudentProfilePage currentUser={currentUser} onUpdateProfile={(u) => setCurrentUser(u)} />
        )}
        {currentRoute === '/student/settings' && currentUser && <StudentSettingsPage currentUser={currentUser} />}
      </main>

      <Footer onNavigate={navigate} />
    </div>
  );
}

export default App;
