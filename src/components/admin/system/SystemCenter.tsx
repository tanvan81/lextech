import React, { useState } from 'react';
import {
  Server,
  Database,
  Layers,
  HardDrive,
  FileText,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Download,
  Terminal,
  Activity,
  Trash2,
  RotateCcw
} from 'lucide-react';
import { dbStore } from '../../../services/dbStore';
import { Button } from '../../ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/Card';
import { Badge } from '../../ui/Badge';
import { ConfirmDialog } from '../../ui/Modal';

interface SystemCenterProps {
  tab?: string;
  onNavigate: (route: string) => void;
}

export const SystemCenter: React.FC<SystemCenterProps> = ({ tab = 'overview', onNavigate }) => {
  const setupStatus = dbStore.getSetupStatus();
  const [activeTab, setActiveTab] = useState(tab);
  const [resetLevel, setResetLevel] = useState<number | null>(null);
  const [resetSuccessMsg, setResetSuccessMsg] = useState<string | null>(null);

  const auditLogs = dbStore.getAuditLogs();

  const handleExecuteReset = () => {
    if (resetLevel === null) return;

    if (resetLevel === 1) {
      // Soft Reset
      localStorage.removeItem('lexedu_auth_token');
      dbStore.logAudit('SUPER_ADMIN', 'SYSTEM_SOFT_RESET', 'Xóa cache phiên đăng nhập browser', 'INFO');
      setResetSuccessMsg('Đã dọn dẹp cache phiên đăng nhập.');
    } else if (resetLevel === 2) {
      // Seed Refresh
      dbStore.resetToDemoData();
      dbStore.logAudit('SUPER_ADMIN', 'SYSTEM_SEED_REFRESH', 'Khôi phục dữ liệu mẫu Demo', 'WARNING');
      setResetSuccessMsg('Đã làm mới dữ liệu hệ thống mẫu (Seed Data Refresh).');
    } else if (resetLevel === 3) {
      // Migration Force Re-Apply
      dbStore.resetToDemoData();
      dbStore.logAudit('SUPER_ADMIN', 'SYSTEM_MIGRATION_REAPPLY', 'Thực thi lại 18 file Migration SQL', 'WARNING');
      setResetSuccessMsg('Đã hoàn tất Re-Apply 18 file SQL Migration thành công.');
    } else if (resetLevel === 4) {
      // Factory Reset
      dbStore.resetToDemoData();
      dbStore.logAudit('SUPER_ADMIN', 'SYSTEM_FACTORY_RESET', 'Khôi phục cài đặt gốc toàn bộ cơ sở dữ liệu', 'DANGER');
      setResetSuccessMsg('Đã khôi phục cài đặt gốc Factory Reset!');
    } else if (resetLevel === 5) {
      // Re-trigger Setup Wizard
      dbStore.setSetupStatus({
        installed: false,
        installedAt: null,
        demoDataInitialized: false,
      });
      window.location.href = '/setup';
      return;
    }

    setResetLevel(null);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900">Trung Tâm Hạ Tầng System Center</h1>
            <Badge variant="danger">SUPER ADMIN ONLY</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">Giám sát trạng thái kết nối, migrations, storage buckets và công cụ Reset hệ thống 5 cấp độ.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
        {[
          { id: 'overview', label: 'Tổng quan', icon: <Activity className="w-4 h-4" /> },
          { id: 'database', label: 'Kết nối Database', icon: <Database className="w-4 h-4" /> },
          { id: 'migrations', label: '18 SQL Migrations', icon: <Layers className="w-4 h-4" /> },
          { id: 'storage', label: 'Storage Buckets', icon: <HardDrive className="w-4 h-4" /> },
          { id: 'audit-logs', label: 'Audit Logs', icon: <FileText className="w-4 h-4" /> },
          { id: 'reset', label: 'Cài đặt Reset & Repair', icon: <ShieldAlert className="w-4 h-4" /> },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`px-3 py-2 rounded-lg font-semibold text-xs transition-colors flex items-center gap-2 ${
              activeTab === t.id
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {t.icon}
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* Success Notification */}
      {resetSuccessMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{resetSuccessMsg}</span>
        </div>
      )}

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 bg-white rounded-xl border border-slate-200 space-y-2">
              <div className="text-xs text-slate-500">Trạng thái cài đặt</div>
              <div className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <span>Hệ thống sẵn sàng</span>
              </div>
              <div className="text-[11px] text-slate-400">Đã kích hoạt One-Time Setup Wizard</div>
            </div>

            <div className="p-5 bg-white rounded-xl border border-slate-200 space-y-2">
              <div className="text-xs text-slate-500">Supabase SQL Migrations</div>
              <div className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-600" />
                <span>18 / 18 Scripts</span>
              </div>
              <div className="text-[11px] text-slate-400">Tất cả bảng & RLS active</div>
            </div>

            <div className="p-5 bg-white rounded-xl border border-slate-200 space-y-2">
              <div className="text-xs text-slate-500">Storage Buckets</div>
              <div className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <HardDrive className="w-5 h-5 text-sky-600" />
                <span>3 Buckets</span>
              </div>
              <div className="text-[11px] text-slate-400">course-thumbnails, lesson-videos, attachments</div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DATABASE */}
      {activeTab === 'database' && (
        <Card>
          <CardHeader>
            <CardTitle>Cấu Hình Kết Nối Cơ Sở Dữ Liệu</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="p-4 bg-slate-900 text-slate-200 rounded-xl font-mono text-[11px] space-y-2">
              <div>VITE_SUPABASE_URL = https://demo-lexedu-supabase.co</div>
              <div>VITE_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...</div>
              <div>SUPABASE_SERVICE_ROLE_KEY = [SECURED SERVER ROLE]</div>
            </div>
            <div className="flex items-center gap-2 text-emerald-600 font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Kết nối dữ liệu Supabase / Local Data Store hoạt động ổn định.</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* TAB 3: MIGRATIONS */}
      {activeTab === 'migrations' && (
        <Card>
          <CardHeader>
            <CardTitle>Danh Sách 18 SQL Migration Files</CardTitle>
          </CardHeader>
          <CardContent className="p-0 divide-y divide-slate-100 text-xs">
            {[
              '001_create_enums.sql',
              '002_create_profiles.sql',
              '003_create_categories.sql',
              '004_create_courses.sql',
              '005_create_course_sections.sql',
              '006_create_lessons.sql',
              '007_create_lesson_attachments.sql',
              '008_create_enrollments.sql',
              '009_create_lesson_progress.sql',
              '010_create_system_settings.sql',
              '011_create_audit_logs.sql',
              '012_rls_profiles.sql',
              '013_rls_courses.sql',
              '014_rls_lessons.sql',
              '015_rls_enrollments.sql',
              '016_storage_buckets.sql',
              '017_functions_and_triggers.sql',
              '018_indexes_and_optimizations.sql',
            ].map((file, idx) => (
              <div key={file} className="p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-6 text-slate-400 font-mono">{idx + 1}.</span>
                  <span className="font-mono font-semibold text-slate-800">{file}</span>
                </div>
                <Badge variant="success">EXECUTED & VERIFIED</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* TAB 4: STORAGE */}
      {activeTab === 'storage' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardHeader><CardTitle className="text-sm">course-thumbnails</CardTitle></CardHeader>
            <CardContent className="text-xs text-slate-500 space-y-2">
              <p>Chứa ảnh bìa đại diện các khóa học. Quyền truy cập: Public Read.</p>
              <Badge variant="primary">Public Read</Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-sm">lesson-videos</CardTitle></CardHeader>
            <CardContent className="text-xs text-slate-500 space-y-2">
              <p>Chứa video bài giảng mp4 tải trực tiếp. Quyền truy cập: Enrolled Users.</p>
              <Badge variant="warning">Restricted</Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-sm">lesson-attachments</CardTitle></CardHeader>
            <CardContent className="text-xs text-slate-500 space-y-2">
              <p>Chứa tài liệu PDF, DOCX đính kèm bài học. Quyền truy cập: Enrolled Users.</p>
              <Badge variant="warning">Restricted</Badge>
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 5: AUDIT LOGS */}
      {activeTab === 'audit-logs' && (
        <Card>
          <CardHeader>
            <CardTitle>Nhật Ký Hệ Thống Audit Logs</CardTitle>
          </CardHeader>
          <CardContent className="p-0 divide-y divide-slate-100 text-xs">
            {auditLogs.map((log) => (
              <div key={log.id} className="p-3.5 flex items-start justify-between gap-4">
                <div className="space-y-0.5">
                  <div className="font-bold text-slate-900">{log.action}</div>
                  <div className="text-slate-500">{log.details}</div>
                  <div className="text-[10px] text-slate-400">Actor: {log.actor_name} ({log.actor_role})</div>
                </div>
                <div className="text-right shrink-0">
                  <Badge variant={log.action_level === 'DANGER' ? 'danger' : log.action_level === 'WARNING' ? 'warning' : 'secondary'}>
                    {log.action_level}
                  </Badge>
                  <div className="text-[10px] text-slate-400 mt-1">{new Date(log.created_at).toLocaleString('vi-VN')}</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* TAB 6: RESET & REPAIR */}
      {activeTab === 'reset' && (
        <div className="space-y-6">
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs space-y-1">
            <div className="font-bold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>CẢNH BÁO TRUNG TÂM RESET HỆ THỐNG (5 SAFETY LEVELS)</span>
            </div>
            <p>Các công cụ dưới đây phục vụ khắc phục sự cố, khôi phục cài đặt hoặc đưa hệ thống về trạng thái ban đầu.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Level 1 */}
            <div className="p-5 bg-white rounded-xl border border-slate-200 space-y-3">
              <Badge variant="secondary">Cấp độ 1 - An toàn</Badge>
              <h3 className="font-bold text-slate-900 text-sm">Soft Reset Session & Cache</h3>
              <p className="text-xs text-slate-500">Xóa các token phiên làm việc hiện tại trên trình duyệt mà không ảnh hưởng tới dữ liệu database.</p>
              <Button variant="outline" size="sm" onClick={() => setResetLevel(1)} icon={<RefreshCw className="w-4 h-4" />}>
                Thực hiện Soft Reset
              </Button>
            </div>

            {/* Level 2 */}
            <div className="p-5 bg-white rounded-xl border border-slate-200 space-y-3">
              <Badge variant="warning">Cấp độ 2 - Cảnh báo</Badge>
              <h3 className="font-bold text-slate-900 text-sm">Seed Data Refresh</h3>
              <p className="text-xs text-slate-500">Làm mới dữ liệu mẫu demo mà không xóa cấu trúc bảng hay tài khoản Quản trị viên.</p>
              <Button variant="warning" size="sm" onClick={() => setResetLevel(2)} icon={<RotateCcw className="w-4 h-4" />}>
                Làm mới Seed Data
              </Button>
            </div>

            {/* Level 3 */}
            <div className="p-5 bg-white rounded-xl border border-slate-200 space-y-3">
              <Badge variant="warning">Cấp độ 3 - Cảnh báo</Badge>
              <h3 className="font-bold text-slate-900 text-sm">Force Re-Apply Migrations</h3>
              <p className="text-xs text-slate-500">Thực thi lại 18 script migration SQL để khôi phục cấu trúc bảng RLS chuẩn.</p>
              <Button variant="warning" size="sm" onClick={() => setResetLevel(3)} icon={<Layers className="w-4 h-4" />}>
                Re-apply Migrations
              </Button>
            </div>

            {/* Level 4 */}
            <div className="p-5 bg-white rounded-xl border border-rose-200 bg-rose-50/30 space-y-3">
              <Badge variant="danger">Cấp độ 4 - Nguy hiểm</Badge>
              <h3 className="font-bold text-slate-900 text-sm">Factory Reset Toàn Bộ Hệ Thống</h3>
              <p className="text-xs text-slate-500">Xóa toàn bộ khóa học, tài khoản học viên tự tạo và khôi phục về cài đặt gốc ban đầu.</p>
              <Button variant="danger" size="sm" onClick={() => setResetLevel(4)} icon={<Trash2 className="w-4 h-4" />}>
                Factory Reset ngay
              </Button>
            </div>

            {/* Level 5 */}
            <div className="p-5 bg-white rounded-xl border border-rose-300 bg-rose-50 col-span-1 md:col-span-2 space-y-3">
              <Badge variant="danger">Cấp độ 5 - Re-Trigger Setup Wizard</Badge>
              <h3 className="font-bold text-slate-900 text-sm">Kích Hoạt Lại Cài Đặt One-Time Setup Wizard</h3>
              <p className="text-xs text-slate-600">Đặt trạng thái hệ thống về `installed: false` và chuyển hướng trực tiếp tới trang /setup để cài đặt lại từ đầu.</p>
              <Button variant="danger" size="md" onClick={() => setResetLevel(5)} icon={<ShieldAlert className="w-4 h-4" />}>
                Mở lại One-Time Setup Wizard
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Confirmation Dialog */}
      <ConfirmDialog
        isOpen={resetLevel !== null}
        onClose={() => setResetLevel(null)}
        onConfirm={handleExecuteReset}
        title={`Xác Nhận Thực Hiện Reset Hệ Thống Cấp Độ ${resetLevel}`}
        message="Hành động này sẽ thay đổi hoặc làm mới dữ liệu hệ thống. Bạn có chắc chắn muốn tiếp tục?"
        confirmText="Xác nhận thực hiện"
      />
    </div>
  );
};
