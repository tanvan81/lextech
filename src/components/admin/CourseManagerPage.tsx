import React, { useState } from 'react';
import { Plus, Search, Edit3, BookOpen, Trash2, Eye, Copy, MoreHorizontal } from 'lucide-react';
import { Course } from '../../types';
import { dbStore } from '../../services/dbStore';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { ConfirmDialog } from '../ui/Modal';

interface CourseManagerPageProps {
  onNavigate: (route: string) => void;
}

export const CourseManagerPage: React.FC<CourseManagerPageProps> = ({ onNavigate }) => {
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [deleteCourseId, setDeleteCourseId] = useState<string | null>(null);

  const courses = dbStore.getCourses();

  const filteredCourses = courses.filter((c) => {
    const matchSearch =
      !search ||
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.instructor_name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = selectedStatus === 'ALL' || c.status === selectedStatus;
    return matchSearch && matchStatus;
  });

  const handleDeleteCourse = () => {
    if (deleteCourseId) {
      dbStore.deleteCourse(deleteCourseId);
      setDeleteCourseId(null);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Quản Lý Khóa Học</h1>
          <p className="text-xs text-slate-500 mt-1">Tạo mới, chỉnh sửa chương trình giảng dạy và xuất bản khóa học.</p>
        </div>
        <Button variant="primary" onClick={() => onNavigate('/admin/courses/create')} icon={<Plus className="w-4 h-4" />}>
          Tạo khóa học mới
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div className="w-full sm:max-w-xs">
          <Input placeholder="Tìm khóa học..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="ALL">Tất cả trạng thái</option>
          <option value="PUBLISHED">Đã xuất bản (PUBLISHED)</option>
          <option value="DRAFT">Bản nháp (DRAFT)</option>
          <option value="HIDDEN">Ẩn (HIDDEN)</option>
          <option value="ARCHIVED">Lưu trữ (ARCHIVED)</option>
        </select>
      </div>

      {/* Course Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-700 uppercase tracking-wider">
              <tr>
                <th className="p-4">Khóa học</th>
                <th className="p-4">Danh mục</th>
                <th className="p-4">Chương / Bài</th>
                <th className="p-4">Hình thức</th>
                <th className="p-4">Trạng thái</th>
                <th className="p-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCourses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    Không tìm thấy khóa học phù hợp.
                  </td>
                </tr>
              ) : (
                filteredCourses.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 font-medium text-slate-900 max-w-xs">
                      <div className="flex items-center gap-3">
                        <img src={c.thumbnail_url} alt="" className="w-12 h-8 rounded object-cover shrink-0 bg-slate-100" />
                        <div className="truncate">
                          <div className="font-bold text-slate-900 truncate">{c.title}</div>
                          <div className="text-[10px] text-slate-400">{c.instructor_name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">{c.category_name}</td>
                    <td className="p-4 font-semibold text-slate-700">
                      {c.sections_count} chương • {c.lessons_count} bài
                    </td>
                    <td className="p-4">
                      <Badge variant={c.enrollment_type === 'OPEN' ? 'success' : c.enrollment_type === 'APPROVAL_REQUIRED' ? 'warning' : 'info'}>
                        {c.enrollment_type}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <Badge variant={c.status === 'PUBLISHED' ? 'primary' : c.status === 'DRAFT' ? 'secondary' : 'danger'}>
                        {c.status}
                      </Badge>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onNavigate(`/admin/courses/${c.id}/curriculum`)}
                          title="Chương trình học"
                          icon={<BookOpen className="w-4 h-4 text-indigo-600" />}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onNavigate(`/admin/courses/${c.id}/edit`)}
                          title="Chỉnh sửa"
                          icon={<Edit3 className="w-4 h-4 text-slate-600" />}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteCourseId(c.id)}
                          title="Xóa khóa học"
                          icon={<Trash2 className="w-4 h-4 text-rose-500" />}
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={!!deleteCourseId}
        onClose={() => setDeleteCourseId(null)}
        onConfirm={handleDeleteCourse}
        title="Xác nhận Xóa Khóa Học"
        message="Thao tác này sẽ xóa toàn bộ chương, bài học và lượt đăng ký liên quan của khóa học này. Bạn có chắc chắn muốn xóa?"
        confirmText="Xóa vĩnh viễn"
      />
    </div>
  );
};
