import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  CheckCircle,
  PlayCircle,
  FileText,
  Download,
  ArrowLeft,
  ArrowRight,
  Menu,
  X,
  ChevronDown,
  ChevronUp,
  Award,
  ExternalLink
} from 'lucide-react';
import { Course, CourseSection, Lesson, UserProfile } from '../../types';
import { dbStore } from '../../services/dbStore';
import { Button } from '../ui/Button';
import { Progress } from '../ui/Progress';
import { Badge } from '../ui/Badge';
import { formatEmbedUrl, getExternalViewUrl } from '../../utils/urlHelper';

interface LessonPlayerPageProps {
  courseId: string;
  lessonId?: string;
  currentUser: UserProfile;
  onNavigate: (route: string) => void;
}

export const LessonPlayerPage: React.FC<LessonPlayerPageProps> = ({
  courseId,
  lessonId,
  currentUser,
  onNavigate,
}) => {
  const course = dbStore.getCourseById(courseId);
  const sections = dbStore.getSectionsByCourse(courseId);

  // Flatten lessons
  const allLessons: Lesson[] = [];
  sections.forEach((sec) => {
    if (sec.lessons) allLessons.push(...sec.lessons);
  });

  // Current lesson
  const activeLessonId = lessonId || (allLessons[0]?.id || '');
  const currentLesson = dbStore.getLessonById(activeLessonId) || allLessons[0];

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  // Progress state
  const enrollment = dbStore.getEnrollment(currentUser.id, courseId);
  const userProgressList = dbStore.getLessonProgress(currentUser.id, courseId);

  useEffect(() => {
    if (currentLesson) {
      dbStore.markLessonProgress(currentUser.id, courseId, currentLesson.id, 'IN_PROGRESS');
    }
  }, [currentLesson?.id, courseId, currentUser.id]);

  if (!course || !currentLesson) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Bài học không tồn tại</h2>
        <Button variant="primary" onClick={() => onNavigate('/student/my-courses')}>Quay lại Khóa học của tôi</Button>
      </div>
    );
  }

  const currentLessonIndex = allLessons.findIndex((l) => l.id === currentLesson.id);
  const prevLesson = currentLessonIndex > 0 ? allLessons[currentLessonIndex - 1] : null;
  const nextLesson = currentLessonIndex < allLessons.length - 1 ? allLessons[currentLessonIndex + 1] : null;

  const isCompleted = userProgressList.some((p) => p.lesson_id === currentLesson.id && p.status === 'COMPLETED');

  const handleToggleComplete = () => {
    const nextStatus = isCompleted ? 'IN_PROGRESS' : 'COMPLETED';
    dbStore.markLessonProgress(currentUser.id, courseId, currentLesson.id, nextStatus);
  };

  const toggleSection = (id: string) => {
    setOpenSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      {/* Top Header */}
      <header className="h-14 bg-slate-950 border-b border-slate-800 px-4 flex items-center justify-between z-30">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate(`/student/my-courses`)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="text-sm font-bold text-white truncate max-w-xs sm:max-w-md">
            {course.title}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:block w-36">
            <Progress value={enrollment?.progress_percent || 0} size="sm" />
          </div>
          <span className="text-xs text-indigo-400 font-semibold">{enrollment?.progress_percent || 0}%</span>

          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-1.5 rounded-lg text-slate-300 hover:bg-slate-800"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Sidebar Curriculum */}
        <aside
          className={`fixed lg:relative inset-y-0 left-0 w-80 bg-slate-950 border-r border-slate-800 flex flex-col transition-transform duration-300 z-20 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
        >
          <div className="p-4 border-b border-slate-800 space-y-2">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Nội dung bài học</div>
            <Progress value={enrollment?.progress_percent || 0} showLabel />
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-800/80">
            {sections.map((sec) => {
              const isOpen = openSections[sec.id] !== false;
              return (
                <div key={sec.id}>
                  <button
                    onClick={() => toggleSection(sec.id)}
                    className="w-full p-3.5 bg-slate-900/60 flex items-center justify-between text-left hover:bg-slate-800/80 transition-colors"
                  >
                    <span className="font-bold text-xs text-slate-200">{sec.title}</span>
                    {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </button>

                  {isOpen && (
                    <div className="divide-y divide-slate-900">
                      {sec.lessons?.map((les) => {
                        const lesCompleted = userProgressList.some((p) => p.lesson_id === les.id && p.status === 'COMPLETED');
                        const isCurrent = les.id === currentLesson.id;

                        return (
                          <div
                            key={les.id}
                            onClick={() => {
                              setSidebarOpen(false);
                              onNavigate(`/student/learn/${courseId}/${les.id}`);
                            }}
                            className={`p-3 pl-5 flex items-center justify-between text-xs cursor-pointer transition-colors ${
                              isCurrent ? 'bg-indigo-600/20 text-indigo-300 border-l-2 border-indigo-500 font-semibold' : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                            }`}
                          >
                            <div className="flex items-center gap-2 truncate pr-2">
                              {les.lesson_type === 'VIDEO' ? (
                                <PlayCircle className="w-4 h-4 shrink-0 text-indigo-400" />
                              ) : (
                                <FileText className="w-4 h-4 shrink-0 text-slate-400" />
                              )}
                              <span className="truncate">{les.title}</span>
                            </div>
                            {lesCompleted ? (
                              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                            ) : (
                              <span className="text-[10px] text-slate-500">{les.estimated_duration}m</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </aside>

        {/* Right Main Player Area */}
        <main className="flex-1 overflow-y-auto bg-slate-900 p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Header Info */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <div className="text-xs text-indigo-400 font-semibold uppercase tracking-wider mb-1">
                Bài {currentLessonIndex + 1} / {allLessons.length}
              </div>
              <h1 className="text-2xl font-bold text-white">{currentLesson.title}</h1>
            </div>

            <Button
              variant={isCompleted ? 'success' : 'primary'}
              onClick={handleToggleComplete}
              icon={<CheckCircle className="w-4 h-4" />}
            >
              {isCompleted ? 'Đã hoàn thành' : 'Đánh dấu hoàn thành'}
            </Button>
          </div>

          {/* Lesson Content Area */}
          <div className="bg-slate-950 rounded-2xl border border-slate-800 p-6 space-y-6 shadow-xl">
            {/* EMBED MEDIA (VIDEO / SLIDE / PDF / GOOGLE DRIVE DOCUMENT) */}
            {(currentLesson.video_url || currentLesson.slide_url) && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-300 bg-slate-900 p-3 rounded-xl border border-slate-800 flex-wrap gap-2">
                  <span className="font-semibold text-slate-200 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-indigo-400" />
                    Nội dung bài học / Tài liệu đính kèm
                  </span>
                  <a
                    href={getExternalViewUrl(currentLesson.video_url || currentLesson.slide_url || '')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold text-xs transition-colors shadow-2xs"
                  >
                    <span>Mở trực tiếp tài liệu</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                <div className="aspect-video w-full rounded-xl overflow-hidden bg-black border border-slate-800 relative">
                  <iframe
                    src={formatEmbedUrl(currentLesson.video_url || currentLesson.slide_url || '')}
                    title={currentLesson.title}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            )}

            {/* TEXT CONTENT */}
            {currentLesson.text_content && (
              <div
                className="prose prose-invert prose-indigo max-w-none text-slate-300 text-sm leading-relaxed"
                dangerouslySetInnerHTML={{ __html: currentLesson.text_content }}
              />
            )}

            {/* ATTACHMENTS */}
            {currentLesson.attachments && currentLesson.attachments.length > 0 && (
              <div className="pt-4 border-t border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Tài liệu đính kèm</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {currentLesson.attachments.map((att) => (
                    <div key={att.id} className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-2.5 truncate">
                        <FileText className="w-4 h-4 text-indigo-400 shrink-0" />
                        <span className="text-xs font-medium text-slate-200 truncate">{att.file_name}</span>
                      </div>
                      <Button variant="ghost" size="sm" icon={<Download className="w-4 h-4" />}>
                        Tải
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Navigation Prev / Next Buttons */}
          <div className="flex items-center justify-between pt-4">
            <Button
              variant="outline"
              className="border-slate-700 text-slate-300 hover:bg-slate-800"
              disabled={!prevLesson}
              onClick={() => prevLesson && onNavigate(`/student/learn/${courseId}/${prevLesson.id}`)}
              icon={<ArrowLeft className="w-4 h-4" />}
            >
              Bài trước
            </Button>

            <Button
              variant="primary"
              disabled={!nextLesson}
              onClick={() => nextLesson && onNavigate(`/student/learn/${courseId}/${nextLesson.id}`)}
              icon={<ArrowRight className="w-4 h-4" />}
            >
              Bài tiếp theo
            </Button>
          </div>
        </main>
      </div>
    </div>
  );
};
