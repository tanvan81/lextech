import React, { useState } from 'react';
import { Search, Sparkles, BookOpen, GraduationCap, Zap, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Course, Category, UserProfile } from '../../types';
import { dbStore } from '../../services/dbStore';
import { Button } from '../ui/Button';
import { Card, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';

interface HomePageProps {
  onNavigate: (route: string) => void;
  currentUser: UserProfile | null;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate, currentUser }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const courses = dbStore.getCourses({ status: 'PUBLISHED' }).slice(0, 6);
  const categories = dbStore.getCategories().slice(0, 8);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNavigate(`/courses?q=${encodeURIComponent(searchQuery)}`);
  };

  return (
    <div className="space-y-16 pb-16">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-slate-900 text-white pt-16 pb-24 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              Nền Tảng Đào Tạo AI Thực Chiến
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
              Học và Làm Chủ <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-sky-300">Công Cụ AI</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 font-normal leading-relaxed">
              Các khóa học thực tế giúp bạn sử dụng ChatGPT, Gemini và AI hiệu quả hơn trong công việc, sáng tạo và tự động hóa quy trình.
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearchSubmit} className="max-w-xl mx-auto flex items-center bg-white rounded-xl shadow-md p-1.5 border border-slate-200">
              <div className="pl-3 text-slate-400">
                <Search className="w-5 h-5" />
              </div>
              <input
                type="text"
                placeholder="Tìm khóa học ChatGPT, Gemini, Sáng tạo ảnh..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
              />
              <Button type="submit" variant="primary" size="md">
                Tìm kiếm
              </Button>
            </form>

            {/* Quick CTA */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <Button variant="primary" size="lg" onClick={() => onNavigate('/courses')} icon={<BookOpen className="w-5 h-5" />}>
                Khám phá khóa học
              </Button>
              {!currentUser && (
                <Button variant="outline" size="lg" className="border-slate-700 text-slate-200 hover:bg-slate-800" onClick={() => onNavigate('/register')}>
                  Đăng ký miễn phí
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED COURSES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Khóa Học Nổi Bật</h2>
            <p className="text-sm text-slate-500 mt-1">Nâng cao hiệu suất công việc ngay hôm nay với bài giảng thực hành.</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => onNavigate('/courses')} icon={<ArrowRight className="w-4 h-4" />}>
            Xem tất cả khóa học
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <Card
              key={course.id}
              onClick={() => onNavigate(`/courses/${course.slug}`)}
              className="overflow-hidden flex flex-col hover:border-blue-400 hover:shadow-md transition-all duration-200"
            >
              <div className="aspect-video relative overflow-hidden bg-slate-100">
                <img
                  src={course.thumbnail_url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80'}
                  alt={course.title}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                />
                <div className="absolute top-3 left-3">
                  <Badge variant="primary">{course.category_name}</Badge>
                </div>
                <div className="absolute top-3 right-3">
                  <Badge variant={course.enrollment_type === 'OPEN' ? 'success' : course.enrollment_type === 'APPROVAL_REQUIRED' ? 'warning' : 'info'}>
                    {course.enrollment_type === 'OPEN' ? 'Mở đăng ký' : course.enrollment_type === 'APPROVAL_REQUIRED' ? 'Cần duyệt' : 'Cấp quyền'}
                  </Badge>
                </div>
              </div>

              <CardContent className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <h3 className="text-base font-bold text-slate-900 line-clamp-2 hover:text-indigo-600 transition-colors">
                    {course.title}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {course.short_description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>Giảng viên: <strong className="text-slate-700">{course.instructor_name}</strong></span>
                  <span>{course.estimated_duration} phút</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CATEGORIES SECTION */}
      <section className="bg-slate-50 py-16 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center max-w-xl mx-auto">
            <h2 className="text-2xl font-bold text-slate-900">Chủ Đề Đào Tạo</h2>
            <p className="text-sm text-slate-500 mt-1">Lựa chọn chuyên ngành phù hợp với định hướng nghề nghiệp của bạn.</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {categories.map((cat) => (
              <div
                key={cat.id}
                onClick={() => onNavigate(`/courses?category=${cat.id}`)}
                className="p-4 bg-white rounded-xl border border-slate-200 hover:border-blue-500 hover:shadow-md transition-all cursor-pointer flex flex-col items-center text-center space-y-2"
              >
                <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  {cat.name.charAt(0)}
                </div>
                <h4 className="text-sm font-semibold text-slate-900">{cat.name}</h4>
                <p className="text-[11px] text-slate-500 line-clamp-1">{cat.description || 'Chủ đề hấp dẫn'}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BENEFITS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 bg-white rounded-xl border border-slate-200 space-y-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Thực Hành Nhanh Chóng</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Bài giảng tập trung vào áp dụng công việc thực tế, không lý thuyết suông.
            </p>
          </div>

          <div className="p-6 bg-white rounded-xl border border-slate-200 space-y-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Lộ Trình Từng Bước</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Từ người mới bắt đầu đến chuyên gia Prompt Engineering nâng cao.
            </p>
          </div>

          <div className="p-6 bg-white rounded-xl border border-slate-200 space-y-3">
            <div className="w-10 h-10 rounded-lg bg-sky-100 text-sky-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Nội Dung Cập Nhật</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Khóa học luôn được cập nhật theo các phiên bản AI mới nhất.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
