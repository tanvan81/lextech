import React from 'react';
import { ArrowLeft, BookOpen, Trash2, CheckCircle2 } from 'lucide-react';
import { dbStore } from '../../services/dbStore';
import { Button } from '../ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Progress } from '../ui/Progress';
import { Badge } from '../ui/Badge';

interface StudentDetailPageProps {
  userId: string;
  onNavigate: (route: string) => void;
}

export const StudentDetailPage: React.FC<StudentDetailPageProps> = ({ userId, onNavigate }) => {
  const profile = dbStore.getProfiles().find((p) => p.id === userId);
  const enrollments = dbStore.getEnrollments(userId);

  if (!profile) {
    return (
      <div className="p-8 text-center space-y-4">
        <h2 className="text-lg font-bold text-slate-800">Không tìm thấy người dùng</h2>
        <Button variant="primary" onClick={() => onNavigate('/admin/students')}>Quay lại</Button>
      </div>
    );
  }

  const handleRemoveEnrollment = (enrId: string) => {
    dbStore.deleteEnrollment(enrId);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => onNavigate('/admin/students')} icon={<ArrowLeft className="w-4 h-4" />}>
          Trở về
        </Button>
        <h1 className="text-xl font-bold text-slate-900">Chi Tiết Học Viên</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Thông tin tài khoản</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <div className="text-slate-400">Họ và tên</div>
            <div className="font-bold text-slate-900 text-sm mt-0.5">{profile.full_name}</div>
          </div>
          <div>
            <div className="text-slate-400">Email</div>
            <div className="font-medium text-slate-800 mt-0.5">{profile.email}</div>
          </div>
          <div>
            <div className="text-slate-400">Vai trò / Trạng thái</div>
            <div className="flex items-center gap-2 mt-0.5">
              <Badge variant="primary">{profile.role}</Badge>
              <Badge variant={profile.is_blocked ? 'danger' : 'success'}>
                {profile.is_blocked ? 'Khóa' : 'Hoạt động'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Các khóa học đã ghi danh ({enrollments.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0 divide-y divide-slate-100">
          {enrollments.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">Học viên chưa tham gia khóa học nào.</div>
          ) : (
            enrollments.map((enr) => (
              <div key={enr.id} className="p-4 flex items-center justify-between text-xs">
                <div className="space-y-1 max-w-md">
                  <div className="font-bold text-slate-900">{enr.course_title}</div>
                  <Progress value={enr.progress_percent} showLabel size="sm" />
                </div>

                <div className="flex items-center gap-3">
                  <Badge variant={enr.status === 'ACTIVE' ? 'primary' : enr.status === 'COMPLETED' ? 'success' : 'warning'}>
                    {enr.status}
                  </Badge>
                  <Button variant="ghost" size="sm" onClick={() => handleRemoveEnrollment(enr.id)} icon={<Trash2 className="w-4 h-4 text-rose-500" />} />
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};
