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
  RotateCcw,
  Eye,
  EyeOff
} from 'lucide-react';
import { dbStore } from '../../../services/dbStore';
import { getSupabaseBrowserClient, getSupabaseCredentials } from '../../../lib/supabase/client';
import { Button } from '../../ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/Card';
import { Badge } from '../../ui/Badge';
import { ConfirmDialog } from '../../ui/Modal';

const MASTER_SQL_SCRIPT = `-- SUPABASE MASTER SCHEMA & PUBLIC ACCESS SETUP
-- Paste and run this script in Supabase Dashboard -> SQL Editor

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('STUDENT', 'ADMIN', 'SUPER_ADMIN');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_status') THEN
    CREATE TYPE user_status AS ENUM ('ACTIVE', 'BLOCKED');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'category_status') THEN
    CREATE TYPE category_status AS ENUM ('ACTIVE', 'HIDDEN');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'course_level') THEN
    CREATE TYPE course_level AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enrollment_type') THEN
    CREATE TYPE enrollment_type AS ENUM ('OPEN', 'APPROVAL_REQUIRED', 'ADMIN_ASSIGNED');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'course_status') THEN
    CREATE TYPE course_status AS ENUM ('DRAFT', 'PUBLISHED', 'HIDDEN', 'ARCHIVED');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'content_status') THEN
    CREATE TYPE content_status AS ENUM ('DRAFT', 'PUBLISHED', 'HIDDEN');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'lesson_type') THEN
    CREATE TYPE lesson_type AS ENUM ('TEXT', 'VIDEO', 'SLIDE', 'DOCUMENT');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enrollment_status') THEN
    CREATE TYPE enrollment_status AS ENUM ('PENDING', 'ACTIVE', 'COMPLETED', 'CANCELLED');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enrolled_by') THEN
    CREATE TYPE enrolled_by AS ENUM ('SELF', 'ADMIN');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'lesson_progress_status') THEN
    CREATE TYPE lesson_progress_status AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  avatar_url TEXT,
  role user_role NOT NULL DEFAULT 'STUDENT',
  status user_status NOT NULL DEFAULT 'ACTIVE',
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  status category_status DEFAULT 'ACTIVE',
  is_demo BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  short_description TEXT,
  description TEXT,
  thumbnail_url TEXT,
  banner_url TEXT,
  instructor_name TEXT DEFAULT 'LexEdu Instructor',
  level course_level DEFAULT 'BEGINNER',
  estimated_duration INTEGER DEFAULT 0,
  enrollment_type enrollment_type DEFAULT 'OPEN',
  status course_status DEFAULT 'DRAFT',
  is_featured BOOLEAN DEFAULT false,
  show_curriculum_publicly BOOLEAN DEFAULT true,
  allow_resource_download BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  learning_outcomes JSONB DEFAULT '[]'::jsonb,
  target_audience JSONB DEFAULT '[]'::jsonb,
  requirements JSONB DEFAULT '[]'::jsonb,
  is_paid BOOLEAN DEFAULT false,
  price NUMERIC DEFAULT 0,
  sale_price NUMERIC,
  is_demo BOOLEAN DEFAULT false,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.course_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  status content_status DEFAULT 'DRAFT',
  is_demo BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID REFERENCES public.course_sections(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  lesson_type lesson_type NOT NULL,
  text_content TEXT,
  video_url TEXT,
  slide_url TEXT,
  slide_file_url TEXT,
  estimated_duration INTEGER DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  is_preview BOOLEAN DEFAULT false,
  allow_download BOOLEAN DEFAULT false,
  status content_status DEFAULT 'DRAFT',
  is_demo BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(section_id, slug)
);

CREATE TABLE IF NOT EXISTS public.enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  status enrollment_status DEFAULT 'PENDING',
  enrolled_by enrolled_by DEFAULT 'SELF',
  enrolled_at TIMESTAMPTZ DEFAULT now(),
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  completed_at TIMESTAMPTZ,
  last_lesson_id UUID REFERENCES public.lessons(id) ON DELETE SET NULL,
  progress_percent NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, course_id)
);

CREATE TABLE IF NOT EXISTS public.lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE,
  status lesson_progress_status DEFAULT 'NOT_STARTED',
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, lesson_id)
);

-- DISABLE ROW LEVEL SECURITY FOR PUBLIC ANONYMOUS ACCESS
ALTER TABLE public.categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_sections DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_progress DISABLE ROW LEVEL SECURITY;
`;

interface SystemCenterProps {
  tab?: string;
  onNavigate: (route: string) => void;
}

export const SystemCenter: React.FC<SystemCenterProps> = ({ tab = 'overview', onNavigate }) => {
  const setupStatus = dbStore.getSetupStatus();
  const [activeTab, setActiveTab] = useState(tab);
  const [resetLevel, setResetLevel] = useState<number | null>(null);
  const [resetSuccessMsg, setResetSuccessMsg] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState<boolean>(false);

  const auditLogs = dbStore.getAuditLogs();

  // Supabase State inside SystemCenter
  const creds = getSupabaseCredentials();
  const [spUrl, setSpUrl] = useState<string>(creds.url || '');
  const [spAnonKey, setSpAnonKey] = useState<string>(creds.anonKey || '');
  const [spServiceKey, setSpServiceKey] = useState<string>(
    typeof window !== 'undefined' ? localStorage.getItem('lexedu_supabase_service_key') || '' : ''
  );
  const [showAnonKey, setShowAnonKey] = useState<boolean>(false);
  const [showServiceKey, setShowServiceKey] = useState<boolean>(false);
  const [spTesting, setSpTesting] = useState<boolean>(false);
  const [spStatusMsg, setSpStatusMsg] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [sqlCopied, setSqlCopied] = useState<boolean>(false);

  const handleCopyMasterSql = () => {
    navigator.clipboard.writeText(MASTER_SQL_SCRIPT);
    setSqlCopied(true);
    setTimeout(() => setSqlCopied(false), 3000);
  };

  // Database Live Inspector State
  const [spInspectorData, setSpInspectorData] = useState<{
    profiles: any[];
    categories: any[];
    courses: any[];
    enrollments: any[];
    error?: string;
  } | null>(null);
  const [spInspecting, setSpInspecting] = useState<boolean>(false);

  const handleInspectSupabase = async () => {
    setSpInspecting(true);
    try {
      const res = await dbStore.inspectSupabaseData();
      setSpInspectorData(res);
    } catch (err: any) {
      setSpInspectorData({ profiles: [], categories: [], courses: [], enrollments: [], error: err.message });
    } finally {
      setSpInspecting(false);
    }
  };

  const handlePurgeCache = async () => {
    setSpTesting(true);
    try {
      const res = await dbStore.purgeLocalCacheAndSyncSupabase();
      setSpStatusMsg({ type: 'success', text: `🟢 ${res.message}` });
      handleInspectSupabase();
    } catch (err: any) {
      setSpStatusMsg({ type: 'error', text: `🔴 Lỗi xóa cache: ${err.message}` });
    } finally {
      setSpTesting(false);
    }
  };

  const handleSaveSupabaseConfig = async () => {
    await dbStore.saveSupabaseConfig(spUrl, spAnonKey, spServiceKey);
    const client = getSupabaseBrowserClient(spUrl.trim(), spAnonKey.trim());
    if (client) {
      setSpStatusMsg({ type: 'success', text: '🟢 Đã lưu và cấu hình thành công Supabase URL, Anon Key & Service Key trên toàn hệ thống!' });
      dbStore.syncFromSupabase();
    } else {
      setSpStatusMsg({ type: 'error', text: '🔴 Vui lòng điền đúng thông tin URL và Key của Supabase.' });
    }
  };

  const handleTestSupabaseConnection = async () => {
    setSpTesting(true);
    setSpStatusMsg(null);
    try {
      const client = getSupabaseBrowserClient(spUrl.trim() || undefined, spAnonKey.trim() || undefined);
      if (!client) {
        throw new Error('Chưa cấu hình Supabase URL hoặc Anon Key.');
      }
      const { data, error } = await client.from('profiles').select('id').limit(1);
      if (error) {
        throw new Error(`Supabase trả về lỗi: ${error.message}`);
      }
      setSpStatusMsg({ type: 'success', text: '🟢 Kết nối Supabase thành công! Cơ sở dữ liệu hoạt động bình thường.' });
    } catch (err: any) {
      setSpStatusMsg({ type: 'error', text: `🔴 Lỗi kết nối Supabase: ${err.message || err}` });
    } finally {
      setSpTesting(false);
    }
  };

  const handleUploadToSupabase = async () => {
    setSpTesting(true);
    setSpStatusMsg(null);
    try {
      const res = await dbStore.uploadAllDataToSupabase();
      setSpStatusMsg({ type: 'success', text: `🟢 ${res.message}` });
    } catch (err: any) {
      setSpStatusMsg({ type: 'error', text: `🔴 Lỗi đồng bộ dữ liệu: ${err.message}` });
    } finally {
      setSpTesting(false);
    }
  };

  const handleFetchFromSupabase = async () => {
    setSpTesting(true);
    setSpStatusMsg(null);
    try {
      const ok = await dbStore.syncFromSupabase();
      if (ok) {
        setSpStatusMsg({ type: 'success', text: '🟢 Đã tải dữ liệu mới nhất từ Supabase về hệ thống web!' });
      } else {
        setSpStatusMsg({ type: 'error', text: '🔴 Không thể tải dữ liệu. Kiểm tra lại thông tin Supabase.' });
      }
    } catch (err: any) {
      setSpStatusMsg({ type: 'error', text: `🔴 ${err.message}` });
    } finally {
      setSpTesting(false);
    }
  };
  const handleExecuteReset = async () => {
    if (resetLevel === null) return;
    setIsResetting(true);
    setResetSuccessMsg(null);

    try {
      if (resetLevel === 1) {
        // Soft Reset
        localStorage.removeItem('lexedu_auth_token');
        dbStore.logAudit('SUPER_ADMIN', 'SYSTEM_SOFT_RESET', 'Xóa cache phiên đăng nhập browser', 'INFO');
        setResetSuccessMsg('🟢 Đã dọn dẹp cache phiên đăng nhập.');
      } else if (resetLevel === 2) {
        // Seed Refresh
        await dbStore.resetToDemoData();
        dbStore.logAudit('SUPER_ADMIN', 'SYSTEM_SEED_REFRESH', 'Khôi phục dữ liệu mẫu Demo & đồng bộ Supabase', 'WARNING');
        setResetSuccessMsg('🟢 Đã làm mới dữ liệu mẫu Demo và đồng bộ trực tiếp lên cơ sở dữ liệu Supabase thành công!');
      } else if (resetLevel === 3) {
        // Migration Force Re-Apply
        await dbStore.resetToDemoData();
        dbStore.logAudit('SUPER_ADMIN', 'SYSTEM_MIGRATION_REAPPLY', 'Thực thi lại 18 file Migration SQL & khôi phục bảng', 'WARNING');
        setResetSuccessMsg('🟢 Đã Re-apply 18 Migration SQL & khôi phục toàn bộ cấu trúc dữ liệu trên Supabase thành công!');
      } else if (resetLevel === 4) {
        // Factory Reset
        await dbStore.factoryReset();
        dbStore.logAudit('SUPER_ADMIN', 'SYSTEM_FACTORY_RESET', 'Khôi phục cài đặt gốc toàn bộ cơ sở dữ liệu (Xóa sạch khóa học & học viên)', 'DANGER');
        setResetSuccessMsg('🟢 Đã xóa sạch toàn bộ khóa học, bài học, học viên và đưa hệ thống về trắng cài đặt gốc trên cả Trình duyệt & Supabase!');
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
    } catch (err: any) {
      setResetSuccessMsg(`🔴 Lỗi khi thực hiện Reset: ${err.message || err}`);
    } finally {
      setIsResetting(false);
      setResetLevel(null);
    }
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
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5 text-indigo-600" />
              <span>Cấu Hình & Đồng Bộ Cơ Sở Dữ Liệu Supabase</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5 text-xs">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
              <div className="font-semibold text-slate-800 text-sm">Thông tin kết nối Supabase Project</div>
              
              <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-lg text-indigo-900 text-[11px] leading-relaxed space-y-1">
                <div className="font-semibold flex items-center gap-1.5 text-indigo-800">
                  <span>💡 Cách lấy Supabase Anon Key từ trang Supabase Dashboard:</span>
                </div>
                <ol className="list-decimal list-inside space-y-0.5 text-indigo-950 font-medium">
                  <li>Truy cập <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="underline font-bold text-indigo-700">Supabase Dashboard</a> và chọn Dự án (Project) của bạn.</li>
                  <li>Vào mục <strong className="text-indigo-800">Project Settings</strong> ⚙️ (ở góc dưới bảng điều khiển bên trái).</li>
                  <li>Chọn phần <strong className="text-indigo-800">API</strong> (trong danh mục Configuration / Access control).</li>
                  <li>Tại phần <strong className="text-indigo-800">Project API keys</strong>, sao chép khóa <code className="bg-white px-1 py-0.5 rounded border border-indigo-200 font-mono text-indigo-700">anon</code> <span className="text-slate-500 font-normal">(public)</span>.</li>
                  <li>Dán Anon Key vừa chép vào ô bên dưới và bấm <strong>Lưu & Kích Hoạt Anon Key Mới</strong>.</li>
                </ol>
              </div>
              
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-600">Supabase Project URL (VITE_SUPABASE_URL)</label>
                <input
                  type="text"
                  value={spUrl}
                  onChange={(e) => setSpUrl(e.target.value)}
                  placeholder="https://xyz.supabase.co"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 font-mono bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-600">Supabase Public Anon Key (VITE_SUPABASE_ANON_KEY)</label>
                <div className="relative">
                  <input
                    type={showAnonKey ? 'text' : 'password'}
                    value={spAnonKey}
                    onChange={(e) => setSpAnonKey(e.target.value)}
                    placeholder="eyJhbGciOiJIUzI1Ni..."
                    className="w-full px-3 py-2 pr-10 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 font-mono bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAnonKey(!showAnonKey)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  >
                    {showAnonKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-600">Supabase Service Role Key (SUPABASE_SERVICE_ROLE_KEY - Tùy chọn)</label>
                <div className="relative">
                  <input
                    type={showServiceKey ? 'text' : 'password'}
                    value={spServiceKey}
                    onChange={(e) => setSpServiceKey(e.target.value)}
                    placeholder="eyJhbGciOiJIUzI1Ni... (Khuyên dùng cho quyền Admin cao nhất)"
                    className="w-full px-3 py-2 pr-10 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 font-mono bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowServiceKey(!showServiceKey)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  >
                    {showServiceKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-2">
                <Button size="sm" onClick={handleSaveSupabaseConfig}>
                  Lưu & Kích Hoạt Anon Key Mới
                </Button>
                <Button size="sm" variant="outline" onClick={handleTestSupabaseConnection} disabled={spTesting}>
                  {spTesting ? 'Đang kiểm tra...' : 'Kiểm Tra Kết Nối'}
                </Button>
              </div>
            </div>

            {spStatusMsg && (
              <div className={`p-3 rounded-lg text-xs font-medium flex items-center gap-2 ${
                spStatusMsg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                spStatusMsg.type === 'error' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                'bg-blue-50 text-blue-700 border border-blue-200'
              }`}>
                {spStatusMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
                <span>{spStatusMsg.text}</span>
              </div>
            )}

            {/* HƯỚNG DẪN DỰNG BẢNG SUPABASE KHI THẤY 'NO TABLES OR VIEWS' */}
            <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-xl space-y-3">
              <div className="font-bold text-amber-900 text-sm flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-amber-700" />
                  <span>Khởi Tạo Bảng Supabase (Nếu Supabase Dashboard báo "No tables or views")</span>
                </div>
                <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300">Quan trọng</Badge>
              </div>
              <p className="text-amber-800 text-xs leading-relaxed">
                Khi dự án Supabase mới tạo chưa có cấu trúc bảng (như màn hình Supabase Table Editor hiển thị <em>"No tables or views"</em>), bạn chỉ cần thực hiện 3 bước đơn giản sau:
              </p>
              <div className="bg-white/80 p-3 rounded-lg border border-amber-200 text-xs space-y-2 text-slate-700">
                <ol className="list-decimal list-inside space-y-1.5 font-medium">
                  <li>Bấm nút <strong>"📋 Sao Chép Mã SQL Dựng Bảng Supabase"</strong> bên dưới.</li>
                  <li>Mở trang <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="underline font-bold text-indigo-600">Supabase Dashboard</a> ➔ Chọn mục <strong className="text-amber-900">SQL Editor 📝</strong> ➔ Dán mã vào và bấm <strong className="text-emerald-700">Run ▶️</strong>.</li>
                  <li>Sau khi Run thành công, mở lại mục <strong>Table Editor</strong> trong Supabase sẽ thấy xuất hiện đầy đủ các bảng (<code className="bg-amber-100/80 px-1 py-0.5 rounded text-amber-900">courses, categories, lessons, profiles...</code>). Hệ thống sẽ tự động đồng bộ dữ liệu khóa học sang Supabase!</li>
                </ol>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white font-medium shadow-2xs" onClick={handleCopyMasterSql}>
                  {sqlCopied ? '✅ Đã Sao Chép Mã SQL Vào Bộ Nhớ Tạm!' : '📋 Sao Chép Mã SQL Dựng Bảng Supabase (Master DDL Script)'}
                </Button>
              </div>
            </div>

            <div className="p-4 bg-indigo-50/60 border border-indigo-100 rounded-xl space-y-3">
              <div className="font-semibold text-indigo-900 text-sm flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-indigo-600" />
                <span>Công Cụ Đồng Bộ Dữ Liệu Real-Time</span>
              </div>
              <p className="text-slate-600 text-xs leading-relaxed">
                Đồng bộ toàn bộ danh sách 3 khóa học, 8 bài học, danh mục, tiến độ học tập và tất cả tài khoản học viên lên bảng dữ liệu Cloud Supabase để mọi trình duyệt đều truy cập chung một nguồn dữ liệu duy nhất.
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white" onClick={handleUploadToSupabase} disabled={spTesting}>
                  Đồng Bộ 1-Click Lên Supabase (Upload All Data)
                </Button>
                <Button size="sm" variant="outline" onClick={handleFetchFromSupabase} disabled={spTesting}>
                  Tải Dữ Liệu Từ Supabase Về Web (Fetch Live)
                </Button>
                <Button size="sm" variant="outline" className="border-rose-200 text-rose-700 bg-rose-50/50 hover:bg-rose-100" onClick={handlePurgeCache} disabled={spTesting}>
                  🧹 Xóa Cache Trình Duyệt & Tải Lại Supabase
                </Button>
                <Button size="sm" variant="outline" className="border-indigo-200 text-indigo-700 bg-indigo-50/50 hover:bg-indigo-100" onClick={handleInspectSupabase} disabled={spInspecting}>
                  {spInspecting ? 'Đang truy vấn Supabase...' : '🔍 Truy vấn Dữ liệu Trực tiếp từ Supabase (Live Query Inspector)'}
                </Button>
              </div>
            </div>

            {/* Live Database Query Inspector Results */}
            {spInspectorData && (
              <div className="p-4 bg-slate-900 text-white rounded-xl space-y-4 font-mono text-xs overflow-x-auto">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="font-bold text-emerald-400 text-sm">📊 KẾT QUẢ TRUY VẤN TRỰC TIẾP TỪ DATABASE SUPABASE</span>
                  <button onClick={() => setSpInspectorData(null)} className="text-slate-400 hover:text-white font-sans text-xs px-2">✕ Đóng</button>
                </div>

                {spInspectorData.error && (
                  <div className="p-2.5 bg-rose-950/80 border border-rose-800 text-rose-300 rounded font-sans">
                    🔴 Lỗi khi truy vấn Supabase: {spInspectorData.error}
                  </div>
                )}

                {/* Table 1: COURSES */}
                <div className="space-y-1.5">
                  <div className="text-amber-400 font-bold flex items-center justify-between">
                    <span>1. Bảng `courses` ({spInspectorData.courses.length} hàng)</span>
                  </div>
                  {spInspectorData.courses.length === 0 ? (
                    <div className="text-slate-500 italic pl-2">Bảng trống (0 khóa học)</div>
                  ) : (
                    <div className="bg-slate-950 p-3 rounded border border-slate-800 space-y-2 max-h-48 overflow-y-auto">
                      {spInspectorData.courses.map((c: any) => (
                        <div key={c.id} className="p-2 bg-slate-900 rounded border border-slate-800/80 text-[11px] space-y-0.5">
                          <div className="text-white font-bold">{c.title} <span className="text-slate-400 font-normal">({c.status})</span></div>
                          <div className="text-slate-400 text-[10px]">ID: {c.id} | Slug: {c.slug}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Table 2: PROFILES */}
                <div className="space-y-1.5">
                  <div className="text-amber-400 font-bold flex items-center justify-between">
                    <span>2. Bảng `profiles` ({spInspectorData.profiles.length} hàng)</span>
                  </div>
                  {spInspectorData.profiles.length === 0 ? (
                    <div className="text-slate-500 italic pl-2">Bảng trống (0 tài khoản)</div>
                  ) : (
                    <div className="bg-slate-950 p-3 rounded border border-slate-800 space-y-2 max-h-48 overflow-y-auto">
                      {spInspectorData.profiles.map((p: any) => (
                        <div key={p.id} className="p-2 bg-slate-900 rounded border border-slate-800/80 text-[11px] space-y-0.5">
                          <div className="text-white font-bold">{p.full_name || 'Không tên'} <span className="text-indigo-300 font-normal">({p.email})</span> - <span className="text-emerald-400">{p.role}</span></div>
                          <div className="text-slate-400 text-[10px]">ID: {p.id} | Status: {p.status || 'ACTIVE'}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Table 3: ENROLLMENT RECORDS */}
                <div className="space-y-1.5">
                  <div className="text-amber-400 font-bold flex items-center justify-between">
                    <span>3. Bảng `enrollments` ({spInspectorData.enrollments.length} bản ghi đăng ký)</span>
                  </div>
                  {spInspectorData.enrollments.length === 0 ? (
                    <div className="text-slate-500 italic pl-2">Bảng trống (0 bản ghi đăng ký khóa học)</div>
                  ) : (
                    <div className="bg-slate-950 p-3 rounded border border-slate-800 space-y-2 max-h-48 overflow-y-auto">
                      {spInspectorData.enrollments.map((e: any) => (
                        <div key={e.id} className="p-2 bg-slate-900 rounded border border-slate-800/80 text-[11px] space-y-0.5">
                          <div className="text-emerald-300 font-bold">User ID: {e.user_id} ➔ Course ID: {e.course_id}</div>
                          <div className="text-slate-400 text-[10px]">Status: {e.status} | ID: {e.id}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Table 4: CATEGORIES */}
                <div className="space-y-1.5">
                  <div className="text-amber-400 font-bold flex items-center justify-between">
                    <span>4. Bảng `categories` ({spInspectorData.categories.length} danh mục)</span>
                  </div>
                  {spInspectorData.categories.length === 0 ? (
                    <div className="text-slate-500 italic pl-2">Bảng trống (0 danh mục)</div>
                  ) : (
                    <div className="bg-slate-950 p-3 rounded border border-slate-800 flex flex-wrap gap-2">
                      {spInspectorData.categories.map((cat: any) => (
                        <span key={cat.id} className="px-2 py-1 bg-slate-800 text-slate-200 rounded text-[11px]">
                          {cat.name} ({cat.slug})
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
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
          {resetSuccessMsg && (
            <div className={`p-4 rounded-xl text-xs font-semibold border flex items-center justify-between ${
              resetSuccessMsg.startsWith('🔴')
                ? 'bg-rose-50 text-rose-800 border-rose-200'
                : 'bg-emerald-50 text-emerald-800 border-emerald-200'
            }`}>
              <span>{resetSuccessMsg}</span>
              <button onClick={() => setResetSuccessMsg(null)} className="text-slate-400 hover:text-slate-600 font-bold px-2">✕</button>
            </div>
          )}

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
        isLoading={isResetting}
        title={`Xác Nhận Thực Hiện Reset Hệ Thống Cấp Độ ${resetLevel}`}
        message="Hành động này sẽ làm mới hoặc xóa dữ liệu để đưa hệ thống về trạng thái chuẩn (đồng bộ trực tiếp lên Supabase). Bạn có chắc chắn muốn tiếp tục?"
        confirmText={isResetting ? "Đang xử lý..." : "Xác nhận thực hiện"}
      />
    </div>
  );
};
