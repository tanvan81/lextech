import React, { useState } from 'react';
import { CheckCircle2, XCircle, Clock, Search } from 'lucide-react';
import { dbStore } from '../../services/dbStore';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';

export const EnrollmentRequestsPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const enrollments = dbStore.getEnrollments();
  const pendingList = enrollments.filter((e) => e.status === 'PENDING');

  const filtered = pendingList.filter((e) => {
    return (
      !search ||
      (e.user_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (e.course_title || '').toLowerCase().includes(search.toLowerCase())
    );
  });

  const handleApprove = (enrId: string) => {
    dbStore.approveEnrollment(enrId);
  };

  const handleReject = (enrId: string) => {
    dbStore.rejectEnrollment(enrId);
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Phe Duyệt Yêu Cầu Đăng Ký</h1>
        <p className="text-xs text-slate-500 mt-1">Duyệt các yêu cầu ghi danh đối với khóa học áp dụng hình thức "Cần duyệt".</p>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div className="max-w-xs">
          <Input placeholder="Tìm theo tên học viên hoặc khóa học..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-700 uppercase tracking-wider">
              <tr>
                <th className="p-4">Học viên</th>
                <th className="p-4">Khóa học đăng ký</th>
                <th className="p-4">Thời gian gửi</th>
                <th className="p-4 text-right">Phê duyệt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-400">
                    Không có yêu cầu chờ duyệt nào.
                  </td>
                </tr>
              ) : (
                filtered.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 font-bold text-slate-900">{req.user_name}</td>
                    <td className="p-4 font-medium text-slate-800">{req.course_title}</td>
                    <td className="p-4 text-slate-400">{new Date(req.enrolled_at).toLocaleString('vi-VN')}</td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="success"
                          size="sm"
                          onClick={() => handleApprove(req.id)}
                          icon={<CheckCircle2 className="w-4 h-4" />}
                        >
                          Chấp nhận
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleReject(req.id)}
                          icon={<XCircle className="w-4 h-4" />}
                        >
                          Từ chối
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
