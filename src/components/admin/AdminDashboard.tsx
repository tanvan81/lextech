import React from 'react';
import { BookOpen, Users, Clock, CheckCircle2, ShieldAlert, ArrowRight, FileText } from 'lucide-react';
import { UserProfile } from '../../types';
import { dbStore } from '../../services/dbStore';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

export const AdminDashboard: React.FC<{ onNavigate: (route: string) => void; currentUser: UserProfile }> = ({
  onNavigate,
  currentUser,
}) => {
  const allCourses = dbStore.getCourses();
  const publishedCourses = allCourses.filter((c) => c.status === 'PUBLISHED');
  const draftCourses = allCourses.filter((c) => c.status === 'DRAFT');

  const allProfiles = dbStore.getProfiles();
  const students = allProfiles.filter((p) => p.role === 'STUDENT');

  const allEnrollments = dbStore.getEnrollments();
  const pendingRequests = allEnrollments.filter((e) => e.status === 'PENDING');

  const auditLogs = dbStore.getAuditLogs().slice(0, 5);

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Tổng Quan Quản Trị Admin</h1>
        <p className="text-xs text-slate-500 mt-1">Theo dõi số liệu thực tế toàn bộ hệ thống LexEdu Platform.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Tổng số Khóa học</span>
            <BookOpen className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{allCourses.length}</div>
          <div className="text-[11px] text-slate-400">
            {publishedCourses.length} xuất bản • {draftCourses.length} nháp
          </div>
        </div>

        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Tổng Học viên</span>
            <Users className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{students.length}</div>
          <div className="text-[11px] text-slate-400">Tài khoản học viên active</div>
        </div>

        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Yêu cầu Chờ duyệt</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{pendingRequests.length}</div>
          <div className="text-[11px] text-slate-400">Đang đợi Admin phê duyệt</div>
        </div>

        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Tổng Đăng ký học</span>
            <CheckCircle2 className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{allEnrollments.length}</div>
          <div className="text-[11px] text-slate-400">Lượt ghi danh khóa học</div>
        </div>
      </div>

      {/* Main Grid Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Requests Table Preview */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base font-bold text-slate-900">Yêu Cầu Đăng Ký Chờ Duyệt</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => onNavigate('/admin/enrollment-requests')} icon={<ArrowRight className="w-4 h-4" />}>
              Xem tất cả
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {pendingRequests.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">Không có yêu cầu chờ duyệt nào.</div>
            ) : (
              <div className="divide-y divide-slate-100">
                {pendingRequests.slice(0, 4).map((req) => (
                  <div key={req.id} className="p-4 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-slate-900">{req.user_name}</div>
                      <div className="text-slate-500 truncate max-w-xs">{req.course_title}</div>
                    </div>
                    <Badge variant="warning">Chờ duyệt</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Audit Log Preview */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base font-bold text-slate-900">Hoạt Động Gần Đây</CardTitle>
            {currentUser.role === 'SUPER_ADMIN' && (
              <Button variant="ghost" size="sm" onClick={() => onNavigate('/admin/system/audit-logs')} icon={<ArrowRight className="w-4 h-4" />}>
                Xem Audit Log
              </Button>
            )}
          </CardHeader>
          <CardContent className="p-0 divide-y divide-slate-100">
            {auditLogs.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">Chưa có nhật ký ghi nhận.</div>
            ) : (
              auditLogs.map((log) => (
                <div key={log.id} className="p-3.5 flex items-start gap-3 text-xs">
                  <div className="p-1.5 rounded bg-slate-100 text-slate-600 mt-0.5">
                    <FileText className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-slate-900">{log.action}</div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                      <span>{log.actor_name}</span>
                      <span>•</span>
                      <span>{new Date(log.created_at).toLocaleTimeString('vi-VN')}</span>
                    </div>
                  </div>
                  <Badge variant={log.action_level === 'DANGER' ? 'danger' : log.action_level === 'WARNING' ? 'warning' : 'secondary'}>
                    {log.action_level}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
