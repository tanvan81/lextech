import React, { useState } from 'react';
import { Plus, Edit3, Trash2, FolderTree } from 'lucide-react';
import { Category } from '../../types';
import { dbStore } from '../../services/dbStore';
import { Button } from '../ui/Button';
import { Input, Textarea } from '../ui/Input';
import { Modal } from '../ui/Modal';

export const CategoryManagerPage: React.FC = () => {
  const [categories, setCategories] = useState(dbStore.getCategories());
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<Category | null>(null);

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');

  const handleOpenModal = (cat?: Category) => {
    if (cat) {
      setEditingCat(cat);
      setName(cat.name);
      setSlug(cat.slug);
      setDescription(cat.description || '');
    } else {
      setEditingCat(null);
      setName('');
      setSlug('');
      setDescription('');
    }
    setModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const catData: Category = {
      id: editingCat?.id || 'cat-' + Math.random().toString(36).substring(2, 9),
      name: name.trim(),
      slug: slug.trim() || name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      description: description.trim(),
      sort_order: editingCat?.sort_order || categories.length + 1,
      status: 'ACTIVE',
      created_at: editingCat?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    dbStore.saveCategory(catData);
    setCategories(dbStore.getCategories());
    setModalOpen(false);
  };

  const handleDelete = (id: string) => {
    dbStore.deleteCategory(id);
    setCategories(dbStore.getCategories());
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Quản Lý Danh Mục Khóa Học</h1>
          <p className="text-xs text-slate-500 mt-1">Phân loại lĩnh vực đào tạo AI trên hệ thống.</p>
        </div>
        <Button variant="primary" onClick={() => handleOpenModal()} icon={<Plus className="w-4 h-4" />}>
          Thêm danh mục
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
        <table className="w-full text-left text-xs text-slate-600">
          <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-700 uppercase tracking-wider">
            <tr>
              <th className="p-4">Tên danh mục</th>
              <th className="p-4">Slug</th>
              <th className="p-4">Mô tả</th>
              <th className="p-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {categories.map((cat) => (
              <tr key={cat.id} className="hover:bg-slate-50/50">
                <td className="p-4 font-bold text-slate-900">{cat.name}</td>
                <td className="p-4 text-slate-400 font-mono text-[11px]">{cat.slug}</td>
                <td className="p-4 text-slate-500 max-w-xs truncate">{cat.description}</td>
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="sm" onClick={() => handleOpenModal(cat)} icon={<Edit3 className="w-4 h-4 text-slate-600" />} />
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(cat.id)} icon={<Trash2 className="w-4 h-4 text-rose-500" />} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingCat ? 'Sửa Danh Mục' : 'Thêm Danh Mục'}>
        <form onSubmit={handleSave} className="space-y-4">
          <Input label="Tên danh mục" value={name} onChange={(e) => setName(e.target.value)} required />
          <Input label="Slug (URL)" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="tu-dong-hoa-ai" />
          <Textarea label="Mô tả danh mục" value={description} onChange={(e) => setDescription(e.target.value)} />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setModalOpen(false)}>Hủy</Button>
            <Button variant="primary" size="sm" type="submit">Lưu danh mục</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
