import React, { useState } from 'react';
import { BookOpen, CheckCircle, Clock, GraduationCap, Lock, PlayCircle, FileText, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import { Course, CourseSection, UserProfile } from '../../types';
import { dbStore } from '../../services/dbStore';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Card, CardContent } from '../ui/Card';

interface CourseDetailPageProps {
  slug: string;
  onNavigate: (route: string) => void;
  currentUser: UserProfile | null;
}

export const CourseDetailPage: React.FC<CourseDetailPageProps> = ({ slug, onNavigate, currentUser }) => {
  const course = dbStore.getCourseBySlug(slug);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [enrollMessage, setEnrollMessage] = useState<string | null>(null);

  if (!course) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-2xl font-bold text-slate-900">Khóa học không tồn tại</h2>
        <p className="text-sm text-slate-500">Khóa học này đã bị ẩn hoặc gỡ bỏ khỏi hệ thống.</p>
        <Button variant="primary" onClick={() => onNavigate('/courses')}>Quay lại danh sách khóa học</Button>
      </div>
    );
  }

  const sections = dbStore.getSectionsByCourse(course.id);
  const enrollment = currentUser ? dbStore.getEnrollment(currentUser.id, course.id) : undefined;

  const toggleSection = (id: string) => {
    setOpenSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleEnrollAction = async () => {
    if (!currentUser) {
      onNavigate(`/login?returnUrl=/courses/${course.slug}`);
      return;
    }

    setIsSubmitting(true);
    setEnrollMessage(null);
    try {
      if (course.enrollment_type === 'ADMIN_ASSIGNED') {
        setEnrollMessage('Khóa học này cần được Quản trị viên trực tiếp phân công.');
        return;
      }

      const enr = dbStore.createEnrollment(currentUser.id, course.id, course.enrollment_type);
      if (enr.status === 'ACTIVE') {
        onNavigate(`/student/courses/${course.id}`);
      } else {
        setEnrollMessage('Yêu cầu tham gia đã được gửi tới Quản trị viên. Trạng thái hiện tại: Đang chờ duyệt.');
      }
    } catch (err: any) {
      setEnrollMessage(err.message || 'Lỗi gửi yêu cầu tham gia.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-12 pb-16">
      {/* Header Banner */}
      <section className="bg-slate-900 text-white py-12 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2 space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="primary">{course.category_name}</Badge>
                <Badge variant="secondary">{course.level}</Badge>
                <Badge variant={course.enrollment_type === 'OPEN' ? 'success' : 'warning'}>
                  {course.enrollment_type === 'OPEN' ? 'Mở đăng ký tự do' : course.enrollment_type === 'APPROVAL_REQUIRED' ? 'Yêu cầu duyệt' : 'Cấp quyền bởi Admin'}
                </Badge>
              </div>

              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">{course.title}</h1>
              <p className="text-base text-slate-300 leading-relaxed">{course.short_description}</p>

              <div className="flex flex-wrap items-center gap-6 text-xs text-slate-400 pt-2 border-t border-slate-800">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-indigo-400" />
                  <span>Giảng viên: <strong className="text-white">{course.instructor_name}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-indigo-400" />
                  <span>Thời lượng: <strong className="text-white">{course.estimated_duration} phút</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-indigo-400" />
                  <span>{sections.length} chương học</span>
                </div>
              </div>
            </div>

            {/* Sidebar Action Card */}
            <div className="lg:col-span-1">
              <Card className="bg-white text-slate-900 shadow-xl border-slate-200 overflow-hidden">
                <div className="aspect-video relative overflow-hidden bg-slate-100">
                  <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover" />
                </div>
                <CardContent className="p-6 space-y-4">
                  {enrollMessage && (
                    <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-lg text-xs text-indigo-800 leading-relaxed">
                      {enrollMessage}
                    </div>
                  )}

                  {!currentUser ? (
                    <Button variant="primary" size="lg" className="w-full" onClick={handleEnrollAction}>
                      Đăng nhập để tham gia khóa học
                    </Button>
                  ) : enrollment?.status === 'ACTIVE' ? (
                    <Button variant="success" size="lg" className="w-full" onClick={() => onNavigate(`/student/courses/${course.id}`)}>
                      Tiếp tục học ngay
                    </Button>
                  ) : enrollment?.status === 'COMPLETED' ? (
                    <Button variant="outline" size="lg" className="w-full" onClick={() => onNavigate(`/student/courses/${course.id}`)}>
                      Xem lại khóa học
                    </Button>
                  ) : enrollment?.status === 'PENDING' ? (
                    <Button variant="secondary" size="lg" className="w-full cursor-not-allowed" disabled>
                      Yêu cầu đang chờ duyệt...
                    </Button>
                  ) : course.enrollment_type === 'ADMIN_ASSIGNED' ? (
                    <div className="p-3 bg-slate-100 text-xs text-slate-600 rounded-lg text-center font-medium">
                      Khóa học này cần được Quản trị viên cấp quyền.
                    </div>
                  ) : (
                    <Button
                      variant={course.enrollment_type === 'OPEN' ? 'primary' : 'warning'}
                      size="lg"
                      className="w-full"
                      onClick={handleEnrollAction}
                      isLoading={isSubmitting}
                    >
                      {course.enrollment_type === 'OPEN' ? 'Tham gia khóa học' : 'Gửi yêu cầu tham gia'}
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Outcomes */}
            {course.learning_outcomes && course.learning_outcomes.length > 0 && (
              <div className="p-6 bg-indigo-50/50 border border-indigo-100 rounded-2xl space-y-4">
                <h3 className="text-lg font-bold text-slate-900">Kết quả đạt được sau khóa học</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700">
                  {course.learning_outcomes.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2.5">
                      <CheckCircle className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            <div className="space-y-3">
              <h3 className="text-xl font-bold text-slate-900">Mô tả chi tiết</h3>
              <div className="prose prose-slate text-sm text-slate-600 leading-relaxed" dangerouslySetInnerHTML={{ __html: course.description || course.short_description || '' }} />
            </div>

            {/* Curriculum */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-slate-900">Nội dung khóa học</h3>
              <div className="space-y-3">
                {sections.map((section) => {
                  const isOpen = openSections[section.id] !== false; // default open
                  return (
                    <div key={section.id} className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                      <button
                        onClick={() => toggleSection(section.id)}
                        className="w-full p-4 bg-slate-50 flex items-center justify-between text-left hover:bg-slate-100 transition-colors"
                      >
                        <span className="font-semibold text-sm text-slate-900">{section.title}</span>
                        {isOpen ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                      </button>

                      {isOpen && (
                        <div className="divide-y divide-slate-100 px-4 py-2">
                          {section.lessons?.map((lesson) => (
                            <div key={lesson.id} className="py-2.5 flex items-center justify-between text-xs text-slate-700">
                              <div className="flex items-center gap-2.5">
                                {lesson.lesson_type === 'VIDEO' ? (
                                  <PlayCircle className="w-4 h-4 text-indigo-600 shrink-0" />
                                ) : (
                                  <FileText className="w-4 h-4 text-slate-500 shrink-0" />
                                )}
                                <span className="font-medium">{lesson.title}</span>
                              </div>
                              <div className="flex items-center gap-3 text-slate-400">
                                <span>{lesson.estimated_duration} phút</span>
                                {lesson.is_preview ? (
                                  <Badge variant="success" size="sm">Xem trước</Badge>
                                ) : (
                                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
