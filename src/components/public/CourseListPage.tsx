import React, { useState, useMemo } from 'react';
import { Search, Filter, BookOpen } from 'lucide-react';
import { Course, Category, UserProfile } from '../../types';
import { dbStore } from '../../services/dbStore';
import { Card, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Input } from '../ui/Input';

interface CourseListPageProps {
  onNavigate: (route: string) => void;
  currentUser: UserProfile | null;
  initialQuery?: string;
  initialCategory?: string;
}

export const CourseListPage: React.FC<CourseListPageProps> = ({
  onNavigate,
  initialQuery = '',
  initialCategory = '',
}) => {
  const [search, setSearch] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedLevel, setSelectedLevel] = useState<string>('ALL');

  const categories = dbStore.getCategories();
  const allCourses = dbStore.getCourses({ status: 'PUBLISHED' });

  const filteredCourses = useMemo(() => {
    return allCourses.filter((course) => {
      const matchSearch =
        !search ||
        course.title.toLowerCase().includes(search.toLowerCase()) ||
        (course.short_description || '').toLowerCase().includes(search.toLowerCase());
      const matchCategory = !selectedCategory || course.category_id === selectedCategory;
      const matchLevel = selectedLevel === 'ALL' || course.level === selectedLevel;

      return matchSearch && matchCategory && matchLevel;
    });
  }, [allCourses, search, selectedCategory, selectedLevel]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Danh Sách Khóa Học</h1>
        <p className="text-sm text-slate-500 mt-1">Khám phá các khóa học thực hành AI chất lượng cao tại LexEdu.</p>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-4 md:space-y-0 md:flex md:items-center md:justify-between md:gap-4">
        {/* Search Input */}
        <div className="flex-1 max-w-md">
          <Input
            placeholder="Tìm theo tên khóa học, giảng viên..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Tất cả danh mục</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          {/* Level Filter */}
          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ALL">Tất cả trình độ</option>
            <option value="BEGINNER">Cơ bản (Beginner)</option>
            <option value="INTERMEDIATE">Trung cấp (Intermediate)</option>
            <option value="ADVANCED">Nâng cao (Advanced)</option>
          </select>
        </div>
      </div>

      {/* Course Grid */}
      {filteredCourses.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-xl border border-slate-200 space-y-3">
          <BookOpen className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-base font-semibold text-slate-700">Không tìm thấy khóa học nào</h3>
          <p className="text-xs text-slate-500">Thử thay đổi từ khóa tìm kiếm hoặc bỏ lọc danh mục.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <Card
              key={course.id}
              onClick={() => onNavigate(`/courses/${course.slug}`)}
              className="overflow-hidden flex flex-col hover:border-indigo-300 transition-all cursor-pointer"
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
                    {course.enrollment_type === 'OPEN' ? 'Mở tự do' : course.enrollment_type === 'APPROVAL_REQUIRED' ? 'Cần duyệt' : 'Cấp quyền'}
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
                  <span>Trình độ: <strong className="text-slate-700">{course.level}</strong></span>
                  <span>{course.estimated_duration} phút</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
