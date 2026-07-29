import React, { useState } from 'react';
import { Search, UserCheck, UserX, Eye, BookPlus, Shield } from 'lucide-react';
import { UserProfile, UserRole } from '../../types';
import { dbStore } from '../../services/dbStore';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { Modal } from '../ui/Modal';

interface StudentManagerPageProps {
  onNavigate: (route: string) => void;
  currentUser: UserProfile;
}

export const StudentManagerPage: React.FC<StudentManagerPageProps> = ({ onNavigate, currentUser }) => {
  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('ALL');
  const [assignModalUser, setAssignModalUser] = useState<UserProfile | null>(null);
  const [assignCourseId, setAssignCourseId] = useState<string>('');

  const profiles = dbStore.getProfiles();
  const courses = dbStore.getCourses({ status: 'PUBLISHED' });

  const filteredProfiles = profiles.filter((p) => {
    const matchSearch =
      !search || p.full_name.toLowerCase().includes(search.toLowerCase()) || p.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = selectedRole === 'ALL' || p.role === selectedRole;
    return matchSearch && matchRole;
  });

  const handleToggleBlock = (profile: UserProfile) => {
    const isBlocked = profile.is_blocked || false;
    dbStore.setBlockUser(profile.id, !isBlocked);
  };

  const handleAssignCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignModalUser || !assignCourseId) return;

    dbStore.createEnrollment(assignModalUser.id, assignCourseId, 'ADMIN_ASSIGNED');
    setAssignModalUser(null);
    setAssignCourseId('');
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Quản Lý Học Viên & Tài Khoản</h1>
          <p className="text-xs text-slate-500 mt-1">Danh sách học viên, phân quyền và gán trực tiếp khóa học.</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div className="w-full sm:max-w-xs">
          <Input placeholder="Tìm theo tên hoặc email..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          className="px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="ALL">Tất cả vai trò</option>
          <option value="STUDENT">Học viên (STUDENT)</option>
          <option value="INSTRUCTOR">Giảng viên (INSTRUCTOR)</option>
          <option value="ADMIN">Quản trị viên (ADMIN)</option>
          <option value="SUPER_ADMIN">Super Admin</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-700 uppercase tracking-wider">
              <tr>
                <th className="p-4">Họ và tên</th>
                <th className="p-4">Email</th>
                <th className="p-4">Vai trò</th>
                <th className="p-4">Trạng thái</th>
                <th className="p-4">Ngày tham gia</th>
                <th className="p-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProfiles.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 font-bold text-slate-900">{p.full_name}</td>
                  <td className="p-4">{p.email}</td>
                  <td className="p-4">
                    <Badge variant={p.role === 'SUPER_ADMIN' ? 'danger' : p.role === 'ADMIN' ? 'primary' : 'secondary'}>
                      {p.role}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <Badge variant={p.is_blocked ? 'danger' : 'success'}>
                      {p.is_blocked ? 'Đã bị khóa' : 'Hoạt động'}
                    </Badge>
                  </td>
                  <td className="p-4 text-slate-400">{new Date(p.created_at).toLocaleDateString('vi-VN')}</td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setAssignModalUser(p);
                          setAssignCourseId(courses[0]?.id || '');
                        }}
                        title="Gán khóa học"
                        icon={<BookPlus className="w-4 h-4 text-indigo-600" />}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onNavigate(`/admin/students/${p.id}`)}
                        title="Chi tiết"
                        icon={<Eye className="w-4 h-4 text-slate-600" />}
                      />
                      {currentUser.role === 'SUPER_ADMIN' && p.id !== currentUser.id && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleBlock(p)}
                          title={p.is_blocked ? 'Mở khóa' : 'Khóa tài khoản'}
                          icon={p.is_blocked ? <UserCheck className="w-4 h-4 text-emerald-600" /> : <UserX className="w-4 h-4 text-rose-500" />}
                        />
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assign Course Modal */}
      <Modal isOpen={!!assignModalUser} onClose={() => setAssignModalUser(null)} title={`Gán Trực Tiếp Khóa Học cho ${assignModalUser?.full_name}`}>
        <form onSubmit={handleAssignCourse} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Chọn Khóa học</label>
            <select
              value={assignCourseId}
              onChange={(e) => setAssignCourseId(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
            >
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title} ({c.enrollment_type})
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setAssignModalUser(null)}>Hủy</Button>
            <Button variant="primary" size="sm" type="submit">Xác nhận gán</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
