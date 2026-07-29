import React, { useState } from 'react';
import { Save, ArrowLeft, Plus, Trash2, Upload, FileText } from 'lucide-react';
import { Lesson, LessonType, LessonAttachment } from '../../types';
import { dbStore } from '../../services/dbStore';
import { Button } from '../ui/Button';
import { Input, Textarea } from '../ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';

interface LessonEditorPageProps {
  lessonId: string;
  onNavigate: (route: string) => void;
}

export const LessonEditorPage: React.FC<LessonEditorPageProps> = ({ lessonId, onNavigate }) => {
  const lesson = dbStore.getLessonById(lessonId);

  const [title, setTitle] = useState(lesson?.title || '');
  const [lessonType, setLessonType] = useState<LessonType>(lesson?.lesson_type || 'TEXT');
  const [textContent, setTextContent] = useState(lesson?.text_content || '');
  const [videoUrl, setVideoUrl] = useState(lesson?.video_url || '');
  const [slideUrl, setSlideUrl] = useState(lesson?.slide_url || '');
  const [duration, setDuration] = useState(lesson?.estimated_duration || 15);
  const [isPreview, setIsPreview] = useState(lesson?.is_preview || false);
  const [allowDownload, setAllowDownload] = useState(lesson?.allow_download || true);
  const [attachments, setAttachments] = useState<LessonAttachment[]>(lesson?.attachments || []);

  const [newFileName, setNewFileName] = useState('');
  const [newFileUrl, setNewFileUrl] = useState('');

  if (!lesson) {
    return (
      <div className="p-8 text-center space-y-4">
        <h2 className="text-lg font-bold text-slate-800">Bài học không tồn tại</h2>
        <Button variant="primary" onClick={() => onNavigate('/admin/courses')}>Quay lại</Button>
      </div>
    );
  }

  const handleAddAttachment = () => {
    if (!newFileName.trim()) return;
    const att: LessonAttachment = {
      id: 'att-' + Math.random().toString(36).substring(2, 9),
      lesson_id: lessonId,
      file_name: newFileName.trim(),
      file_url: newFileUrl.trim() || 'https://example.com/file.pdf',
      storage_path: 'lesson-files/' + newFileName.trim(),
      file_size: 1024 * 500,
      created_at: new Date().toISOString(),
    };

    dbStore.saveAttachment(att);
    setAttachments([...attachments, att]);
    setNewFileName('');
    setNewFileUrl('');
  };

  const handleRemoveAttachment = (attId: string) => {
    dbStore.deleteAttachment(attId);
    setAttachments(attachments.filter((a) => a.id !== attId));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedLesson: Lesson = {
      ...lesson,
      title: title.trim(),
      lesson_type: lessonType,
      text_content: textContent,
      video_url: videoUrl,
      slide_url: slideUrl,
      estimated_duration: Number(duration),
      is_preview: isPreview,
      allow_download: allowDownload,
      updated_at: new Date().toISOString(),
    };

    dbStore.saveLesson(updatedLesson);
    // Find section to get course id
    const sections = dbStore.getSectionsByCourse(lesson.section_id);
    onNavigate('/admin/courses');
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => onNavigate('/admin/courses')} icon={<ArrowLeft className="w-4 h-4" />}>
            Trở về
          </Button>
          <h1 className="text-2xl font-bold text-slate-900">Soạn Thảo Nội Dung Bài Học</h1>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Cấu hình bài học</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input label="Tiêu đề bài học" value={title} onChange={(e) => setTitle(e.target.value)} required />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Loại bài học</label>
                <select
                  value={lessonType}
                  onChange={(e) => setLessonType(e.target.value as LessonType)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                >
                  <option value="TEXT">Văn bản Rich Text</option>
                  <option value="VIDEO">Video Embed</option>
                  <option value="SLIDE">Slide/PDF Viewer</option>
                  <option value="DOCUMENT">Tài liệu đính kèm</option>
                </select>
              </div>

              <Input label="Thời lượng dự kiến (phút)" type="number" value={duration} onChange={(e) => setDuration(Number(e.target.value))} />

              <div className="flex flex-col justify-end gap-2 pb-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
                  <input type="checkbox" checked={isPreview} onChange={(e) => setIsPreview(e.target.checked)} className="rounded text-indigo-600" />
                  <span>Cho phép xem trước (Preview)</span>
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dynamic Content Editor by Lesson Type */}
        {lessonType === 'TEXT' && (
          <Card>
            <CardHeader>
              <CardTitle>Nội dung bài viết (HTML / Rich Text)</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                rows={12}
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                placeholder="Nhập nội dung HTML/văn bản bài học..."
              />
            </CardContent>
          </Card>
        )}

        {lessonType === 'VIDEO' && (
          <Card>
            <CardHeader>
              <CardTitle>Cấu hình Video Bài Giảng</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Đường dẫn Video (YouTube, Vimeo, MP4 Direct)"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
              />
              <Textarea label="Nội dung/Tóm tắt kèm theo" rows={4} value={textContent} onChange={(e) => setTextContent(e.target.value)} />
            </CardContent>
          </Card>
        )}

        {lessonType === 'SLIDE' && (
          <Card>
            <CardHeader>
              <CardTitle>Cấu hình Slide Trình Chiếu</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input label="Đường dẫn Google Slides / Canva / Embed PDF" value={slideUrl} onChange={(e) => setSlideUrl(e.target.value)} />
            </CardContent>
          </Card>
        )}

        {/* Attachments Section */}
        <Card>
          <CardHeader>
            <CardTitle>Tài liệu đính kèm (Attachments)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <Input placeholder="Tên file đính kèm..." value={newFileName} onChange={(e) => setNewFileName(e.target.value)} />
              <Input placeholder="URL tải xuống..." value={newFileUrl} onChange={(e) => setNewFileUrl(e.target.value)} />
              <Button type="button" variant="outline" onClick={handleAddAttachment} icon={<Plus className="w-4 h-4" />}>
                Thêm file
              </Button>
            </div>

            <div className="space-y-2 pt-2">
              {attachments.map((att) => (
                <div key={att.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 truncate">
                    <FileText className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span className="font-semibold text-slate-800 truncate">{att.file_name}</span>
                  </div>
                  <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveAttachment(att.id)} icon={<Trash2 className="w-4 h-4 text-rose-500" />} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => onNavigate('/admin/courses')}>Hủy</Button>
          <Button type="submit" variant="primary" icon={<Save className="w-4 h-4" />}>Lưu bài học</Button>
        </div>
      </form>
    </div>
  );
};
