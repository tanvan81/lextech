import React, { useState } from 'react';
import { BookOpen, PlayCircle, CheckCircle, Clock } from 'lucide-react';
import { UserProfile } from '../../types';
import { dbStore } from '../../services/dbStore';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Progress } from '../ui/Progress';
import { Badge } from '../ui/Badge';

interface MyCoursesPageProps {
  currentUser: UserProfile;
  onNavigate: (route: string) => void;
}

export const MyCoursesPage: React.FC<MyCoursesPageProps> = ({ currentUser, onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'ACTIVE' | 'COMPLETED' | 'PENDING'>('ACTIVE');
  const enrollments = dbStore.getEnrollments(currentUser.id);

  const filteredEnrollments = enrollments.filter((e) => e.status === activeTab);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Khóa Học Của Tôi</h1>
        <p className="text-sm text-slate-500 mt-1">Quản lý và theo dõi tiến độ tất cả các khóa học bạn đã đăng ký.</p>
      </div>

      {/* Tabs Bar */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('ACTIVE')}
          className={`pb-3 px-4 font-semibold text-xs border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'ACTIVE'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Đang học ({enrollments.filter((e) => e.status === 'ACTIVE').length})
        </button>

        <button
          onClick={() => setActiveTab('COMPLETED')}
          className={`pb-3 px-4 font-semibold text-xs border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'COMPLETED'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <CheckCircle className="w-4 h-4" />
          Đã hoàn thành ({enrollments.filter((e) => e.status === 'COMPLETED').length})
        </button>

        <button
          onClick={() => setActiveTab('PENDING')}
          className={`pb-3 px-4 font-semibold text-xs border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'PENDING'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Clock className="w-4 h-4" />
          Chờ duyệt ({enrollments.filter((e) => e.status === 'PENDING').length})
        </button>
      </div>

      {/* Content */}
      {filteredEnrollments.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-xl border border-slate-200 space-y-3">
          <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-semibold text-slate-700">Không có khóa học nào trong mục này</h3>
          <p className="text-xs text-slate-500">Khám phá danh sách khóa học thực hành để đăng ký tham gia ngay.</p>
          <Button variant="primary" size="sm" onClick={() => onNavigate('/courses')}>Khám phá ngay</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEnrollments.map((enr) => (
            <Card key={enr.id} className="overflow-hidden flex flex-col hover:border-indigo-300 transition-all">
              <div className="aspect-video relative overflow-hidden bg-slate-100">
                <img src={enr.course_thumbnail || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80'} alt={enr.course_title} className="w-full h-full object-cover" />
                <div className="absolute top-3 right-3">
                  <Badge variant={enr.status === 'ACTIVE' ? 'primary' : enr.status === 'COMPLETED' ? 'success' : 'warning'}>
                    {enr.status === 'ACTIVE' ? 'Đang học' : enr.status === 'COMPLETED' ? 'Hoàn thành' : 'Chờ duyệt'}
                  </Badge>
                </div>
              </div>

              <CardContent className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-slate-900 line-clamp-1">{enr.course_title}</h3>
                  {enr.status !== 'PENDING' && <Progress value={enr.progress_percent} showLabel />}
                </div>

                {enr.status === 'PENDING' ? (
                  <div className="p-2.5 bg-amber-50 text-amber-800 text-xs rounded-lg text-center font-medium">
                    Yêu cầu tham gia đang chờ Quản trị viên phê duyệt.
                  </div>
                ) : (
                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full text-xs"
                    onClick={() => onNavigate(`/student/courses/${enr.course_id}`)}
                    icon={<PlayCircle className="w-4 h-4" />}
                  >
                    Vào học ngay
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
