import React, { useState, useEffect } from 'react';
import { Save, ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { Course, CourseLevel, EnrollmentType, CourseStatus } from '../../types';
import { dbStore } from '../../services/dbStore';
import { Button } from '../ui/Button';
import { Input, Textarea } from '../ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';

interface CourseFormPageProps {
  courseId?: string;
  onNavigate: (route: string) => void;
}

export const CourseFormPage: React.FC<CourseFormPageProps> = ({ courseId, onNavigate }) => {
  const existingCourse = courseId ? dbStore.getCourseById(courseId) : undefined;

  const [title, setTitle] = useState(existingCourse?.title || '');
  const [slug, setSlug] = useState(existingCourse?.slug || '');
  const [categoryId, setCategoryId] = useState(existingCourse?.category_id || '');
  const [instructorName, setInstructorName] = useState(existingCourse?.instructor_name || 'Giảng viên LexEdu');
  const [shortDescription, setShortDescription] = useState(existingCourse?.short_description || '');
  const [description, setDescription] = useState(existingCourse?.description || '');
  const [thumbnailUrl, setThumbnailUrl] = useState(existingCourse?.thumbnail_url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80');
  const [level, setLevel] = useState<CourseLevel>(existingCourse?.level || 'BEGINNER');
  const [estimatedDuration, setEstimatedDuration] = useState(existingCourse?.estimated_duration || 120);
  const [enrollmentType, setEnrollmentType] = useState<EnrollmentType>(existingCourse?.enrollment_type || 'OPEN');
  const [status, setStatus] = useState<CourseStatus>(existingCourse?.status || 'DRAFT');
  const [isFeatured, setIsFeatured] = useState(existingCourse?.is_featured || false);
  const [outcomes, setOutcomes] = useState<string[]>(existingCourse?.learning_outcomes || ['']);

  const categories = dbStore.getCategories();

  // Auto generate slug from Vietnamese title
  const generateSlug = (val: string) => {
    let str = val.toLowerCase().trim();
    str = str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    str = str.replace(/đ/g, 'd').replace(/Đ/g, 'd');
    str = str.replace(/[^a-z0-9 -]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');
    return str;
  };

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!courseId) {
      setSlug(generateSlug(val));
    }
  };

  const handleAddOutcome = () => setOutcomes([...outcomes, '']);
  const handleRemoveOutcome = (idx: number) => setOutcomes(outcomes.filter((_, i) => i !== idx));
  const handleOutcomeChange = (idx: number, val: string) => {
    const list = [...outcomes];
    list[idx] = val;
    setOutcomes(list);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !slug.trim()) return;

    const courseData: Course = {
      id: existingCourse?.id || 'crs-' + Math.random().toString(36).substring(2, 10),
      category_id: categoryId || (categories[0]?.id || ''),
      title: title.trim(),
      slug: slug.trim(),
      short_description: shortDescription.trim(),
      description: description.trim(),
      thumbnail_url: thumbnailUrl.trim(),
      instructor_name: instructorName.trim(),
      level: level,
      estimated_duration: Number(estimatedDuration),
      enrollment_type: enrollmentType,
      status: status,
      is_featured: isFeatured,
      show_curriculum_publicly: true,
      allow_resource_download: true,
      sort_order: existingCourse?.sort_order || 0,
      learning_outcomes: outcomes.filter((o) => o.trim().length > 0),
      target_audience: ['Học viên AI'],
      requirements: ['Máy tính có kết nối Internet'],
      created_at: existingCourse?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    dbStore.saveCourse(courseData);
    onNavigate('/admin/courses');
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => onNavigate('/admin/courses')} icon={<ArrowLeft className="w-4 h-4" />}>
            Trở về
          </Button>
          <h1 className="text-2xl font-bold text-slate-900">{courseId ? 'Chỉnh Sửa Khóa Học' : 'Tạo Khóa Học Mới'}</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Thông tin cơ bản</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input label="Tên khóa học" value={title} onChange={(e) => handleTitleChange(e.target.value)} required />
            <Input label="Đường dẫn Slug" value={slug} onChange={(e) => setSlug(e.target.value)} required />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Danh mục</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <Input label="Tên giảng viên" value={instructorName} onChange={(e) => setInstructorName(e.target.value)} />
            </div>

            <Textarea label="Mô tả ngắn" value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} />
            <Textarea label="Mô tả chi tiết (HTML support)" value={description} onChange={(e) => setDescription(e.target.value)} rows={6} />
            <Input label="URL Thumbnail Khóa học" value={thumbnailUrl} onChange={(e) => setThumbnailUrl(e.target.value)} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cấu hình hình thức & trạng thái</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Trình độ</label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value as CourseLevel)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
              >
                <option value="BEGINNER">Cơ bản (BEGINNER)</option>
                <option value="INTERMEDIATE">Trung cấp (INTERMEDIATE)</option>
                <option value="ADVANCED">Nâng cao (ADVANCED)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Hình thức Tham gia</label>
              <select
                value={enrollmentType}
                onChange={(e) => setEnrollmentType(e.target.value as EnrollmentType)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
              >
                <option value="OPEN">Mở tự do (OPEN)</option>
                <option value="APPROVAL_REQUIRED">Cần duyệt (APPROVAL_REQUIRED)</option>
                <option value="ADMIN_ASSIGNED">Gán bởi Admin (ADMIN_ASSIGNED)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Trạng thái Khóa học</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as CourseStatus)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
              >
                <option value="DRAFT">Nháp (DRAFT)</option>
                <option value="PUBLISHED">Xuất bản (PUBLISHED)</option>
                <option value="HIDDEN">Ẩn (HIDDEN)</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Learning Outcomes Builder */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Kết quả học tập đạt được</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={handleAddOutcome} icon={<Plus className="w-4 h-4" />}>
              Thêm dòng
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {outcomes.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <Input
                  value={item}
                  onChange={(e) => handleOutcomeChange(idx, e.target.value)}
                  placeholder={`Mục tiêu ${idx + 1}...`}
                />
                <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveOutcome(idx)} icon={<Trash2 className="w-4 h-4 text-rose-500" />} />
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => onNavigate('/admin/courses')}>
            Hủy
          </Button>
          <Button type="submit" variant="primary" icon={<Save className="w-4 h-4" />}>
            Lưu khóa học
          </Button>
        </div>
      </form>
    </div>
  );
};
