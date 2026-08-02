import React, { useState } from 'react';
import { Plus, ArrowLeft, Edit3, Trash2, FileText, PlayCircle, Lock, Eye, ChevronDown, ChevronUp } from 'lucide-react';
import { CourseSection, Lesson, ContentStatus } from '../../types';
import { dbStore } from '../../services/dbStore';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';

interface CurriculumBuilderPageProps {
  courseId: string;
  onNavigate: (route: string) => void;
}

export const CurriculumBuilderPage: React.FC<CurriculumBuilderPageProps> = ({ courseId, onNavigate }) => {
  const [refreshKey, setRefreshKey] = useState(0);
  const course = dbStore.getCourseById(courseId);
  const sections = dbStore.getSectionsByCourse(courseId);

  // Modal states for section
  const [sectionModalOpen, setSectionModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<CourseSection | null>(null);
  const [sectionTitle, setSectionTitle] = useState('');
  const [sectionDesc, setSectionDesc] = useState('');

  // Modal states for lesson
  const [lessonModalOpen, setLessonModalOpen] = useState(false);
  const [selectedSectionId, setSelectedSectionId] = useState<string>('');
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonType, setLessonType] = useState<'TEXT' | 'VIDEO' | 'SLIDE' | 'DOCUMENT'>('TEXT');

  if (!course) {
    return (
      <div className="p-8 text-center space-y-4">
        <h2 className="text-lg font-bold text-slate-800">Khóa học không tồn tại</h2>
        <Button variant="primary" onClick={() => onNavigate('/admin/courses')}>Quay lại</Button>
      </div>
    );
  }

  // Section Handlers
  const handleOpenSectionModal = (sec?: CourseSection) => {
    if (sec) {
      setEditingSection(sec);
      setSectionTitle(sec.title);
      setSectionDesc(sec.description || '');
    } else {
      setEditingSection(null);
      setSectionTitle('');
      setSectionDesc('');
    }
    setSectionModalOpen(true);
  };

  const handleSaveSection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sectionTitle.trim()) return;

    const secData: CourseSection = {
      id: editingSection?.id || 'sec-' + Math.random().toString(36).substring(2, 9),
      course_id: courseId,
      title: sectionTitle.trim(),
      description: sectionDesc.trim(),
      sort_order: editingSection?.sort_order || sections.length + 1,
      status: 'PUBLISHED',
      created_at: editingSection?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    dbStore.saveSection(secData);
    setSectionModalOpen(false);
    setRefreshKey((k) => k + 1);
  };

  const handleDeleteSection = (secId: string) => {
    dbStore.deleteSection(secId);
    setRefreshKey((k) => k + 1);
  };

  const handleMoveSection = (index: number, direction: 'UP' | 'DOWN') => {
    const targetIndex = direction === 'UP' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sections.length) return;

    const newSections = [...sections];
    const temp = newSections[index];
    newSections[index] = newSections[targetIndex];
    newSections[targetIndex] = temp;

    dbStore.reorderSections(courseId, newSections.map((s) => s.id));
    setRefreshKey((k) => k + 1);
  };

  const handleMoveLesson = (section: CourseSection, lessonIndex: number, direction: 'UP' | 'DOWN') => {
    const lessons = section.lessons || [];
    const targetIndex = direction === 'UP' ? lessonIndex - 1 : lessonIndex + 1;
    if (targetIndex < 0 || targetIndex >= lessons.length) return;

    const newLessons = [...lessons];
    const temp = newLessons[lessonIndex];
    newLessons[lessonIndex] = newLessons[targetIndex];
    newLessons[targetIndex] = temp;

    dbStore.reorderLessons(section.id, newLessons.map((l) => l.id));
    setRefreshKey((k) => k + 1);
  };

  // Lesson Handlers
  const handleOpenLessonModal = (secId: string) => {
    setSelectedSectionId(secId);
    setLessonTitle('');
    setLessonType('TEXT');
    setLessonModalOpen(true);
  };

  const handleCreateLesson = (e: React.FormEvent, openEditor: boolean = false) => {
    e.preventDefault();
    if (!lessonTitle.trim() || !selectedSectionId) return;

    const currentSection = sections.find((s) => s.id === selectedSectionId);
    const existingCount = currentSection?.lessons?.length || 0;

    const slug = lessonTitle.toLowerCase().trim().replace(/[^a-z0-9 -]/g, '').replace(/\s+/g, '-');
    const newLesson: Lesson = {
      id: 'les-' + Math.random().toString(36).substring(2, 9),
      section_id: selectedSectionId,
      title: lessonTitle.trim(),
      slug: slug || 'bai-hoc-' + Date.now(),
      lesson_type: lessonType,
      text_content: '<p>Nội dung bài học chưa cập nhật.</p>',
      estimated_duration: 15,
      sort_order: existingCount + 1,
      is_preview: false,
      allow_download: true,
      status: 'PUBLISHED',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    dbStore.saveLesson(newLesson);
    setLessonModalOpen(false);
    setRefreshKey((k) => k + 1);
    if (openEditor) {
      onNavigate(`/admin/lessons/${newLesson.id}/edit`);
    }
  };

  const handleDeleteLesson = (lesId: string) => {
    dbStore.deleteLesson(lesId);
    setRefreshKey((k) => k + 1);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => onNavigate('/admin/courses')} icon={<ArrowLeft className="w-4 h-4" />}>
            Trở về
          </Button>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Xây Dựng Khung Chương Trình Học</h1>
            <p className="text-xs text-slate-500">Khóa học: <strong className="text-slate-800">{course.title}</strong></p>
          </div>
        </div>

        <Button variant="primary" onClick={() => handleOpenSectionModal()} icon={<Plus className="w-4 h-4" />}>
          Thêm Chương Học
        </Button>
      </div>

      {/* Sections List */}
      <div className="space-y-4">
        {sections.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center space-y-3">
              <p className="text-sm text-slate-500">Khóa học chưa có chương học nào.</p>
              <Button variant="primary" size="sm" onClick={() => handleOpenSectionModal()}>Thêm chương học đầu tiên</Button>
            </CardContent>
          </Card>
        ) : (
          sections.map((sec, secIdx) => (
            <Card key={sec.id} className="overflow-hidden border-slate-200">
              <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2 space-y-0.5">
                  <div className="flex flex-col">
                    <button
                      type="button"
                      disabled={secIdx === 0}
                      onClick={() => handleMoveSection(secIdx, 'UP')}
                      className="p-0.5 text-slate-400 hover:text-indigo-600 disabled:opacity-20 transition-colors"
                      title="Chuyển chương lên"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={secIdx === sections.length - 1}
                      onClick={() => handleMoveSection(secIdx, 'DOWN')}
                      className="p-0.5 text-slate-400 hover:text-indigo-600 disabled:opacity-20 transition-colors"
                      title="Chuyển chương xuống"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div>
                    <div className="font-bold text-sm text-slate-900">{sec.title}</div>
                    {sec.description && <p className="text-xs text-slate-500">{sec.description}</p>}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => handleOpenSectionModal(sec)} icon={<Edit3 className="w-4 h-4 text-slate-600" />} />
                  <Button variant="ghost" size="sm" onClick={() => handleDeleteSection(sec.id)} icon={<Trash2 className="w-4 h-4 text-rose-500" />} />
                  <Button variant="outline" size="sm" onClick={() => handleOpenLessonModal(sec.id)} icon={<Plus className="w-3.5 h-3.5" />}>
                    Thêm bài
                  </Button>
                </div>
              </div>

              {/* Lessons Under Section */}
              <div className="divide-y divide-slate-100 p-2">
                {sec.lessons?.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-400">Chưa có bài học trong chương này.</div>
                ) : (
                  sec.lessons?.map((les, lIndex) => (
                    <div key={les.id} className="p-3 flex items-center justify-between hover:bg-slate-50 rounded-lg transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-0.5 border-r border-slate-200 pr-2">
                          <button
                            type="button"
                            disabled={lIndex === 0}
                            onClick={() => handleMoveLesson(sec, lIndex, 'UP')}
                            className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded disabled:opacity-20 disabled:hover:bg-transparent transition-colors"
                            title="Di chuyển bài học lên"
                          >
                            <ChevronUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={lIndex === (sec.lessons?.length || 0) - 1}
                            onClick={() => handleMoveLesson(sec, lIndex, 'DOWN')}
                            className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded disabled:opacity-20 disabled:hover:bg-transparent transition-colors"
                            title="Di chuyển bài học xuống"
                          >
                            <ChevronDown className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {les.lesson_type === 'VIDEO' ? (
                          <PlayCircle className="w-4 h-4 text-indigo-600 shrink-0" />
                        ) : (
                          <FileText className="w-4 h-4 text-slate-500 shrink-0" />
                        )}
                        <div>
                          <div className="text-xs font-semibold text-slate-900">{les.title}</div>
                          <div className="text-[10px] text-slate-400">{les.lesson_type} • {les.estimated_duration} phút</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onNavigate(`/admin/lessons/${les.id}/edit`)}
                          icon={<Edit3 className="w-3.5 h-3.5 text-indigo-600" />}
                        >
                          Sửa nội dung
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteLesson(les.id)}
                          icon={<Trash2 className="w-3.5 h-3.5 text-rose-500" />}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Section Modal */}
      <Modal isOpen={sectionModalOpen} onClose={() => setSectionModalOpen(false)} title={editingSection ? 'Sửa Chương Học' : 'Thêm Chương Học'}>
        <form onSubmit={handleSaveSection} className="space-y-4">
          <Input label="Tên chương học" value={sectionTitle} onChange={(e) => setSectionTitle(e.target.value)} required />
          <Input label="Mô tả ngắn" value={sectionDesc} onChange={(e) => setSectionDesc(e.target.value)} />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setSectionModalOpen(false)}>Hủy</Button>
            <Button variant="primary" size="sm" type="submit">Lưu chương</Button>
          </div>
        </form>
      </Modal>

      {/* Lesson Modal */}
      <Modal isOpen={lessonModalOpen} onClose={() => setLessonModalOpen(false)} title="Thêm Bài Học Mới">
        <form onSubmit={handleCreateLesson} className="space-y-4">
          <Input label="Tiêu đề bài học" value={lessonTitle} onChange={(e) => setLessonTitle(e.target.value)} required />
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Loại bài học</label>
            <select
              value={lessonType}
              onChange={(e) => setLessonType(e.target.value as any)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
            >
              <option value="TEXT">Bài viết Rich Text (TEXT)</option>
              <option value="VIDEO">Video bài giảng (VIDEO)</option>
              <option value="SLIDE">Slide/Trình chiếu (SLIDE)</option>
              <option value="DOCUMENT">Tài liệu đính kèm (DOCUMENT)</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" type="button" onClick={() => setLessonModalOpen(false)}>Hủy</Button>
            <Button variant="outline" size="sm" type="button" onClick={(e) => handleCreateLesson(e, false)}>Lưu bài học</Button>
            <Button variant="primary" size="sm" type="button" onClick={(e) => handleCreateLesson(e, true)}>Lưu & Soạn nội dung</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
