import React from 'react';
import { BookOpen, CheckCircle, Clock, PlayCircle, ArrowRight, Award, Zap } from 'lucide-react';
import { UserProfile } from '../../types';
import { dbStore } from '../../services/dbStore';
import { Button } from '../ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Progress } from '../ui/Progress';
import { Badge } from '../ui/Badge';

interface StudentDashboardProps {
  currentUser: UserProfile;
  onNavigate: (route: string) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ currentUser, onNavigate }) => {
  const enrollments = dbStore.getEnrollments(currentUser.id);
  const activeEnrollments = enrollments.filter((e) => e.status === 'ACTIVE');
  const completedEnrollments = enrollments.filter((e) => e.status === 'COMPLETED');
  const pendingEnrollments = enrollments.filter((e) => e.status === 'PENDING');

  // Find last active enrollment for Quick Continue
  const lastActive = activeEnrollments[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Hero Banner */}
      <div className="p-6 sm:p-8 bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-2xl text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <Badge variant="primary" className="bg-indigo-500/20 text-indigo-200 border-indigo-400/30">
            Học viên LexEdu
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Xin chào, {currentUser.full_name}!
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            Chào mừng bạn quay trở lại. Hãy tiếp tục học tập để làm chủ các công cụ Trí tuệ Nhân tạo đỉnh cao.
          </p>
        </div>

        {lastActive && (
          <div className="p-4 bg-white/10 backdrop-blur-md rounded-xl border border-white/10 space-y-3 shrink-0 md:max-w-xs">
            <div className="text-[11px] font-semibold uppercase text-indigo-300 tracking-wider">Khóa học gần nhất</div>
            <div className="font-bold text-sm text-white truncate">{lastActive.course_title}</div>
            <Progress value={lastActive.progress_percent} size="sm" />
            <Button
              variant="success"
              size="sm"
              className="w-full text-xs"
              onClick={() => onNavigate(`/student/courses/${lastActive.course_id}`)}
              icon={<PlayCircle className="w-4 h-4" />}
            >
              Tiếp tục bài học
            </Button>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 bg-white rounded-xl border border-slate-200 space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Đang học</span>
            <BookOpen className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{activeEnrollments.length}</div>
          <div className="text-[11px] text-slate-400">Khóa học active</div>
        </div>

        <div className="p-5 bg-white rounded-xl border border-slate-200 space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Hoàn thành</span>
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{completedEnrollments.length}</div>
          <div className="text-[11px] text-slate-400">Khóa học đã đạt 100%</div>
        </div>

        <div className="p-5 bg-white rounded-xl border border-slate-200 space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Chờ duyệt</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{pendingEnrollments.length}</div>
          <div className="text-[11px] text-slate-400">Yêu cầu tham gia</div>
        </div>

        <div className="p-5 bg-white rounded-xl border border-slate-200 space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Tổng tham gia</span>
            <Award className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{enrollments.length}</div>
          <div className="text-[11px] text-slate-400">Khóa đã đăng ký</div>
        </div>
      </div>

      {/* Active Courses Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Khóa Học Đang Học</h2>
          <button onClick={() => onNavigate('/student/my-courses')} className="text-xs font-semibold text-indigo-600 hover:underline flex items-center gap-1">
            Xem tất cả khóa học <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {activeEnrollments.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center space-y-3">
              <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
              <div className="text-sm font-semibold text-slate-700">Bạn chưa đăng ký khóa học nào</div>
              <p className="text-xs text-slate-500">Khám phá danh sách khóa học thực hành AI tại LexEdu để tham gia ngay.</p>
              <Button variant="primary" size="sm" onClick={() => onNavigate('/courses')}>Khám phá khóa học ngay</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeEnrollments.map((enr) => (
              <Card key={enr.id} className="overflow-hidden flex flex-col hover:border-indigo-300 transition-all">
                <div className="aspect-video relative overflow-hidden bg-slate-100">
                  <img src={enr.course_thumbnail || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80'} alt={enr.course_title} className="w-full h-full object-cover" />
                </div>
                <CardContent className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-sm font-bold text-slate-900 line-clamp-1">{enr.course_title}</h3>
                    <Progress value={enr.progress_percent} showLabel />
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full text-xs"
                    onClick={() => onNavigate(`/student/courses/${enr.course_id}`)}
                    icon={<PlayCircle className="w-4 h-4" />}
                  >
                    Vào học bài giảng
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
