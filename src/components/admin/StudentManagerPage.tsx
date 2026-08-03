import React, { useState } from 'react';
import { Search, UserCheck, UserX, Eye, BookPlus, Trash2, AlertTriangle, Lock } from 'lucide-react';
import { UserProfile } from '../../types';
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

  // Confirmation modal states
  const [blockTargetUser, setBlockTargetUser] = useState<UserProfile | null>(null);
  const [deleteTargetUser, setDeleteTargetUser] = useState<UserProfile | null>(null);
  const [activeUserWarningModalUser, setActiveUserWarningModalUser] = useState<UserProfile | null>(null);

  const profiles = dbStore.getProfiles();
  const courses = dbStore.getCourses({ status: 'PUBLISHED' });

  const filteredProfiles = profiles.filter((p) => {
    const matchSearch =
      !search || p.full_name.toLowerCase().includes(search.toLowerCase()) || p.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = selectedRole === 'ALL' || p.role === selectedRole;
    return matchSearch && matchRole;
  });

  const handleConfirmToggleBlock = () => {
    if (!blockTargetUser) return;
    const nextState = !blockTargetUser.is_blocked;
    dbStore.setBlockUser(blockTargetUser.id, nextState);
    setBlockTargetUser(null);
  };

  const handleConfirmDelete = () => {
    if (!deleteTargetUser) return;
    try {
      dbStore.deleteProfile(deleteTargetUser.id);
    } catch (err: any) {
      alert(err?.message || 'Không thể xóa tài khoản');
    }
    setDeleteTargetUser(null);
  };

  const handleLockThenDelete = () => {
    if (!activeUserWarningModalUser) return;
    const target = activeUserWarningModalUser;
    dbStore.setBlockUser(target.id, true);
    setActiveUserWarningModalUser(null);
    // After locking, open delete confirmation
    setDeleteTargetUser({ ...target, is_blocked: true, status: 'BLOCKED' });
  };

  const handleAssignCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignModalUser || !assignCourseId) return;

    dbStore.createEnrollment(assignModalUser.id, assignCourseId, 'ADMIN_ASSIGNED');
    setAssignModalUser(null);
    setAssignCourseId('');
  };

  const canManageProfile = (p: UserProfile) => {
    // Cannot block or delete self or SUPER_ADMIN (unless currentUser is SUPER_ADMIN managing other non-super-admins)
    if (p.id === currentUser.id) return false;
    if (p.role === 'SUPER_ADMIN') return false;
    return currentUser.role === 'ADMIN' || currentUser.role === 'SUPER_ADMIN';
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Quản Lý Học Viên & Tài Khoản</h1>
          <p className="text-xs text-slate-500 mt-1">Danh sách học viên, phân quyền, khóa/mở khóa và xóa tài khoản.</p>
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
              {filteredProfiles.map((p) => {
                const isManageable = canManageProfile(p);
                return (
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

                        {/* Lock / Unlock button with confirmation */}
                        {isManageable && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setBlockTargetUser(p)}
                            title={p.is_blocked ? 'Mở khóa tài khoản' : 'Khóa tài khoản'}
                            icon={
                              p.is_blocked ? (
                                <UserCheck className="w-4 h-4 text-emerald-600" />
                              ) : (
                                <UserX className="w-4 h-4 text-amber-600" />
                              )
                            }
                          />
                        )}

                        {/* Delete account button (requires locking first) */}
                        {isManageable && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (!p.is_blocked) {
                                setActiveUserWarningModalUser(p);
                              } else {
                                setDeleteTargetUser(p);
                              }
                            }}
                            title={p.is_blocked ? 'Xóa tài khoản' : 'Khóa trước khi xóa'}
                            icon={<Trash2 className="w-4 h-4 text-rose-500" />}
                          />
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
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

      {/* Lock / Unlock Confirmation Modal */}
      <Modal
        isOpen={!!blockTargetUser}
        onClose={() => setBlockTargetUser(null)}
        title={blockTargetUser?.is_blocked ? 'Xác nhận MỞ KHÓA tài khoản' : 'Xác nhận KHÓA tài khoản'}
      >
        <div className="space-y-4 text-xs">
          <div className="flex items-start gap-3 bg-amber-50 p-3 rounded-xl border border-amber-200 text-amber-800">
            <Lock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-900">
                {blockTargetUser?.full_name} ({blockTargetUser?.email})
              </p>
              <p className="mt-1">
                {blockTargetUser?.is_blocked
                  ? 'Bạn có chắc chắn muốn MỞ KHÓA tài khoản này? Người dùng sẽ có thể đăng nhập và tiếp tục học tập bình thường.'
                  : 'Bạn có chắc chắn muốn KHÓA tài khoản này? Người dùng sẽ bị chấm dứt quyền đăng nhập vào hệ thống ngay lập tức.'}
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setBlockTargetUser(null)}>
              Hủy bỏ
            </Button>
            <Button
              variant={blockTargetUser?.is_blocked ? 'primary' : 'danger'}
              size="sm"
              onClick={handleConfirmToggleBlock}
            >
              {blockTargetUser?.is_blocked ? 'Xác nhận Mở khóa' : 'Xác nhận Khóa tài khoản'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Active User Delete Warning Modal */}
      <Modal
        isOpen={!!activeUserWarningModalUser}
        onClose={() => setActiveUserWarningModalUser(null)}
        title="Cần KHÓA tài khoản trước khi XÓA"
      >
        <div className="space-y-4 text-xs">
          <div className="flex items-start gap-3 bg-rose-50 p-3 rounded-xl border border-rose-200 text-rose-800">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-900">
                Tài khoản {activeUserWarningModalUser?.full_name} ({activeUserWarningModalUser?.email}) đang Hoạt Động.
              </p>
              <p className="mt-1 text-slate-600">
                Để đảm bảo an toàn dữ liệu, hệ thống yêu cầu bạn phải <strong>KHÓA tài khoản</strong> trước khi thực hiện xóa vĩnh viễn.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setActiveUserWarningModalUser(null)}>
              Hủy
            </Button>
            <Button variant="danger" size="sm" onClick={handleLockThenDelete}>
              Khóa ngay & Tiến hành xóa
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteTargetUser}
        onClose={() => setDeleteTargetUser(null)}
        title="Xác nhận XÓA VĨNH VIỄN tài khoản"
      >
        <div className="space-y-4 text-xs">
          <div className="flex items-start gap-3 bg-rose-50 p-3 rounded-xl border border-rose-200 text-rose-800">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-900">
                Học viên: {deleteTargetUser?.full_name} ({deleteTargetUser?.email})
              </p>
              <p className="mt-1 text-rose-700 font-semibold">
                CẢNH BÁO: Hành động này không thể hoàn tác!
              </p>
              <p className="mt-1 text-slate-600">
                Tất cả dữ liệu cá nhân, tiến trình học tập và thông tin ghi danh khóa học của tài khoản này sẽ bị xóa hoàn toàn khỏi cơ sở dữ liệu.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setDeleteTargetUser(null)}>
              Hủy bỏ
            </Button>
            <Button variant="danger" size="sm" onClick={handleConfirmDelete}>
              Xác nhận XÓA vĩnh viễn
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

