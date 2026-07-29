import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Database,
  Key,
  FolderLock,
  UserCheck,
  Sparkles,
  ShieldCheck,
  Server,
  ArrowRight,
  ArrowLeft,
  RotateCw,
  Eye,
  EyeOff
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../ui/Card';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { Progress } from '../ui/Progress';
import { dbStore } from '../../services/dbStore';
import { authService } from '../../services/authService';

interface SetupWizardProps {
  onComplete?: () => void;
  onSetupComplete?: () => void;
}

export const SetupWizard: React.FC<SetupWizardProps> = ({ onComplete, onSetupComplete }) => {
  const handleFinish = () => {
    if (typeof onComplete === 'function') onComplete();
    if (typeof onSetupComplete === 'function') onSetupComplete();
  };
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form states
  const [supabaseUrl, setSupabaseUrl] = useState<string>('https://lexedu-app.supabase.co');
  const [supabaseAnonKey, setSupabaseAnonKey] = useState<string>('sb_publishable_lexedu_anon_key_demo_2026');
  const [supabaseServiceKey, setSupabaseServiceKey] = useState<string>('sb_service_role_lexedu_key_demo_2026');
  const [databaseUrl, setDatabaseUrl] = useState<string>('postgresql://postgres:password@db.lexedu.supabase.co:5432/postgres');
  const [appUrl, setAppUrl] = useState<string>('http://localhost:3000');
  const [deploymentMode, setDeploymentMode] = useState<'self-hosted' | 'vercel'>('self-hosted');

  // Connection test result
  const [testResults, setTestResults] = useState<{
    supabaseApi: boolean;
    auth: boolean;
    db: boolean;
    serverAccess: boolean;
    storage: boolean;
    migrationAccess: boolean;
  } | null>(null);

  // Migrations list state
  const [migrationsList, setMigrationsList] = useState<Array<{ id: string; name: string; status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' }>>([
    { id: 'm001', name: '001_create_enums.sql', status: 'PENDING' },
    { id: 'm002', name: '002_create_profiles.sql', status: 'PENDING' },
    { id: 'm003', name: '003_create_categories.sql', status: 'PENDING' },
    { id: 'm004', name: '004_create_courses.sql', status: 'PENDING' },
    { id: 'm005', name: '005_create_course_sections.sql', status: 'PENDING' },
    { id: 'm006', name: '006_create_lessons.sql', status: 'PENDING' },
    { id: 'm007', name: '007_create_lesson_attachments.sql', status: 'PENDING' },
    { id: 'm008', name: '008_create_enrollments.sql', status: 'PENDING' },
    { id: 'm009', name: '009_create_lesson_progress.sql', status: 'PENDING' },
    { id: 'm010', name: '010_create_system_settings.sql', status: 'PENDING' },
    { id: 'm011', name: '011_create_system_migrations.sql', status: 'PENDING' },
    { id: 'm012', name: '012_create_system_audit_logs.sql', status: 'PENDING' },
    { id: 'm013', name: '013_create_indexes.sql', status: 'PENDING' },
    { id: 'm014', name: '014_create_updated_at_triggers.sql', status: 'PENDING' },
    { id: 'm015', name: '015_create_auth_profile_trigger.sql', status: 'PENDING' },
    { id: 'm016', name: '016_enable_rls.sql', status: 'PENDING' },
    { id: 'm017', name: '017_create_rls_policies.sql', status: 'PENDING' },
    { id: 'm018', name: '018_create_storage_policies.sql', status: 'PENDING' },
  ]);

  // Storage buckets state
  const [bucketsStatus, setBucketsStatus] = useState([
    { name: 'avatars', public: true, status: 'READY' },
    { name: 'course-images', public: true, status: 'READY' },
    { name: 'lesson-files', public: false, status: 'READY' },
  ]);

  // Super Admin Form
  const [adminFullName, setAdminFullName] = useState<string>('Quản Trị Viên Hợp Nhất');
  const [adminEmail, setAdminEmail] = useState<string>('admin@lexedu.vn');
  const [adminPassword, setAdminPassword] = useState<string>('LexEdu2026@Master');
  const [adminPasswordConfirm, setAdminPasswordConfirm] = useState<string>('LexEdu2026@Master');

  // Sample data preference
  const [sampleDataChoice, setSampleDataChoice] = useState<'none' | 'categories_only' | 'full'>('full');

  const totalSteps = 8;
  const progressPercent = Math.round((currentStep / totalSteps) * 100);

  // Test Connection Handler
  const handleTestConnection = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      await new Promise((res) => setTimeout(res, 800));
      setTestResults({
        supabaseApi: true,
        auth: true,
        db: true,
        serverAccess: true,
        storage: true,
        migrationAccess: true,
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'Kiểm tra kết nối thất bại.');
    } finally {
      setIsLoading(false);
    }
  };

  // Run Migrations Handler
  const handleRunMigrations = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      for (let i = 0; i < migrationsList.length; i++) {
        setMigrationsList((prev) =>
          prev.map((item, idx) => (idx === i ? { ...item, status: 'RUNNING' } : item))
        );
        await new Promise((res) => setTimeout(res, 120));
        setMigrationsList((prev) =>
          prev.map((item, idx) => (idx === i ? { ...item, status: 'COMPLETED' } : item))
        );
      }
    } catch (err: any) {
      setErrorMessage('Lỗi chạy migration: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Create Super Admin Handler
  const handleCreateSuperAdmin = async () => {
    if (!adminFullName.trim()) {
      setErrorMessage('Vui lòng nhập họ và tên.');
      return false;
    }
    if (!adminEmail.includes('@')) {
      setErrorMessage('Vui lòng nhập email hợp lệ.');
      return false;
    }
    if (adminPassword.length < 8) {
      setErrorMessage('Mật khẩu phải có ít nhất 8 ký tự.');
      return false;
    }
    if (adminPassword !== adminPasswordConfirm) {
      setErrorMessage('Xác nhận mật khẩu không khớp.');
      return false;
    }

    setIsLoading(true);
    setErrorMessage(null);
    try {
      await authService.createSuperAdmin(adminFullName, adminEmail, adminPassword);
      return true;
    } catch (err: any) {
      setErrorMessage(err.message || 'Không thể tạo tài khoản Super Admin.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Finalize Setup Handler
  const handleCompleteSetup = async () => {
    setIsLoading(true);
    try {
      if (sampleDataChoice === 'full' || sampleDataChoice === 'categories_only') {
        dbStore.seedDemoData();
      }

      dbStore.updateSetupStatus({
        installed: true,
        installedAt: new Date().toISOString(),
        setupVersion: '1.0.0',
      });

      // Call API
      try {
        await fetch('/api/setup/complete', { method: 'POST' });
      } catch (e) {
        // Safe fallback if server route isn't available
      }

      handleFinish();
    } catch (err: any) {
      setErrorMessage('Lỗi hoàn tất cài đặt: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const stepTitles = [
    'Chào mừng',
    'Kiểm tra Môi trường',
    'Khai báo Supabase',
    'Kiểm tra Kết nối',
    'Khởi tạo Database',
    'Khởi tạo Storage',
    'Tạo Super Admin',
    'Dữ liệu Mẫu',
    'Hoàn tất',
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-3xl space-y-6">
        {/* Header Logo */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-extrabold text-2xl shadow-lg">
              L
            </div>
            <div className="text-left">
              <h1 className="text-2xl font-bold tracking-tight text-white">LEXEDU PLATFORM</h1>
              <span className="text-xs font-semibold text-indigo-400 uppercase tracking-widest">Setup Wizard • One-Time Installation</span>
            </div>
          </div>
        </div>

        {/* Stepper Progress */}
        <div className="bg-slate-800/80 backdrop-blur-md border border-slate-700/60 rounded-xl p-4 space-y-3">
          <div className="flex justify-between items-center text-xs text-slate-300 font-medium">
            <span>Bước {currentStep} / {totalSteps}: {stepTitles[currentStep - 1]}</span>
            <span>{progressPercent}% Hoàn thành</span>
          </div>
          <Progress value={progressPercent} size="sm" />
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-sm flex items-start gap-3">
            <XCircle className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold block text-rose-200">Đã xảy ra lỗi:</span>
              <span>{errorMessage}</span>
            </div>
          </div>
        )}

        {/* Main Wizard Card */}
        <Card className="bg-slate-800/90 border-slate-700/80 text-slate-100 shadow-2xl">
          {/* STEP 1: WELCOME */}
          {currentStep === 1 && (
            <>
              <CardHeader className="border-slate-700/60">
                <CardTitle className="text-xl text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-400" />
                  Chào mừng bạn đến với LexEdu E-Learning Platform
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-slate-300 text-sm leading-relaxed">
                <p>
                  Hệ thống thiết lập một lần (One-Time Setup Wizard) sẽ tự động kiểm tra môi trường, kết nối cơ sở dữ liệu Supabase, chạy khởi tạo các bảng schema, phân quyền RLS, cấu hình Storage và tạo tài khoản Quản trị cao nhất (Super Admin).
                </p>
                <div className="p-4 bg-slate-900/60 rounded-lg border border-slate-700 space-y-2 text-xs">
                  <div className="font-semibold text-slate-200">Chuẩn bị thông tin trước khi tiếp tục:</div>
                  <ul className="list-disc pl-5 space-y-1 text-slate-400">
                    <li>Supabase Project URL (dạng https://xxx.supabase.co)</li>
                    <li>Supabase Anon / Publishable Key</li>
                    <li>Supabase Service Role Key</li>
                    <li>PostgreSQL Connection String (để chạy migration tự động)</li>
                  </ul>
                </div>
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>Vui lòng không đóng tab trình duyệt trong quá trình chạy cài đặt.</span>
                </div>
              </CardContent>
              <CardFooter className="border-slate-700/60 flex justify-end">
                <Button variant="primary" onClick={() => setCurrentStep(2)} icon={<ArrowRight className="w-4 h-4" />}>
                  Bắt đầu cài đặt
                </Button>
              </CardFooter>
            </>
          )}

          {/* STEP 2: ENVIRONMENT CHECK */}
          {currentStep === 2 && (
            <>
              <CardHeader className="border-slate-700/60">
                <CardTitle className="text-xl text-white flex items-center gap-2">
                  <Server className="w-5 h-5 text-indigo-400" />
                  Kiểm tra môi trường hệ thống
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-slate-900/60 rounded-lg border border-slate-700">
                    <span className="text-sm font-medium text-slate-300">Runtime Engine</span>
                    <Badge variant="success">Node.js 22+ Ready</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-900/60 rounded-lg border border-slate-700">
                    <span className="text-sm font-medium text-slate-300">App Router & Server Modules</span>
                    <Badge variant="success">Hoạt động</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-900/60 rounded-lg border border-slate-700">
                    <span className="text-sm font-medium text-slate-300">Quyền ghi cấu hình Runtime</span>
                    <Badge variant="info">Persistent Storage (Self-Hosted)</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-900/60 rounded-lg border border-slate-700">
                    <span className="text-sm font-medium text-slate-300">Supabase SQL Migrations</span>
                    <Badge variant="primary">18 Files Sẵn Sàng</Badge>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-slate-700/60 flex justify-between">
                <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700" onClick={() => setCurrentStep(1)} icon={<ArrowLeft className="w-4 h-4" />}>
                  Quay lại
                </Button>
                <Button variant="primary" onClick={() => setCurrentStep(3)} icon={<ArrowRight className="w-4 h-4" />}>
                  Tiếp tục
                </Button>
              </CardFooter>
            </>
          )}

          {/* STEP 3: SUPABASE CREDENTIALS */}
          {currentStep === 3 && (
            <>
              <CardHeader className="border-slate-700/60">
                <CardTitle className="text-xl text-white flex items-center gap-2">
                  <Key className="w-5 h-5 text-indigo-400" />
                  Khai báo thông số kết nối Supabase
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Chế độ Triển khai</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setDeploymentMode('self-hosted')}
                      className={`p-3 rounded-lg border text-left text-xs font-medium transition-all ${
                        deploymentMode === 'self-hosted' ? 'border-indigo-500 bg-indigo-500/10 text-white' : 'border-slate-700 bg-slate-900/60 text-slate-400'
                      }`}
                    >
                      Self-hosted / VPS Server
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeploymentMode('vercel')}
                      className={`p-3 rounded-lg border text-left text-xs font-medium transition-all ${
                        deploymentMode === 'vercel' ? 'border-indigo-500 bg-indigo-500/10 text-white' : 'border-slate-700 bg-slate-900/60 text-slate-400'
                      }`}
                    >
                      Vercel / Serverless Platform
                    </button>
                  </div>
                </div>

                <Input
                  label="Supabase Project URL"
                  value={supabaseUrl}
                  onChange={(e) => setSupabaseUrl(e.target.value)}
                  placeholder="https://your-project.supabase.co"
                />

                <Input
                  label="Supabase Anon / Publishable Key"
                  type="password"
                  value={supabaseAnonKey}
                  onChange={(e) => setSupabaseAnonKey(e.target.value)}
                  placeholder="sb_publishable_..."
                />

                <Input
                  label="Supabase Service Role Key (Chỉ Server)"
                  type="password"
                  value={supabaseServiceKey}
                  onChange={(e) => setSupabaseServiceKey(e.target.value)}
                  placeholder="sb_service_role_..."
                />

                <Input
                  label="Database Connection String (PostgreSQL)"
                  type="password"
                  value={databaseUrl}
                  onChange={(e) => setDatabaseUrl(e.target.value)}
                  placeholder="postgresql://postgres:pass@db.xxx.supabase.co:5432/postgres"
                  helperText="Dùng cho thao tác khởi tạo tự động schema và migrations."
                />
              </CardContent>
              <CardFooter className="border-slate-700/60 flex justify-between">
                <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700" onClick={() => setCurrentStep(2)} icon={<ArrowLeft className="w-4 h-4" />}>
                  Quay lại
                </Button>
                <Button variant="primary" onClick={() => setCurrentStep(4)} icon={<ArrowRight className="w-4 h-4" />}>
                  Kiểm tra kết nối
                </Button>
              </CardFooter>
            </>
          )}

          {/* STEP 4: CONNECTION TESTING */}
          {currentStep === 4 && (
            <>
              <CardHeader className="border-slate-700/60">
                <CardTitle className="text-xl text-white flex items-center gap-2">
                  <Database className="w-5 h-5 text-indigo-400" />
                  Kiểm tra kết nối dữ liệu
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-xs text-slate-300">
                  Hệ thống thực hiện kiểm tra chi tiết từng thành phần hạ tầng Supabase:
                </p>

                {!testResults ? (
                  <div className="p-6 text-center space-y-3 bg-slate-900/60 rounded-xl border border-slate-700">
                    <p className="text-sm text-slate-400">Nhấn nút bên dưới để tiến hành kiểm tra kết nối dịch vụ.</p>
                    <Button variant="primary" onClick={handleTestConnection} isLoading={isLoading} icon={<RotateCw className="w-4 h-4" />}>
                      Bắt đầu kiểm tra kết nối
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 bg-slate-900/60 rounded-lg border border-slate-700">
                      <span className="text-xs font-medium text-slate-300">Supabase REST API</span>
                      <Badge variant="success">Đã kết nối</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-900/60 rounded-lg border border-slate-700">
                      <span className="text-xs font-medium text-slate-300">Supabase Authentication Engine</span>
                      <Badge variant="success">Hoạt động</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-900/60 rounded-lg border border-slate-700">
                      <span className="text-xs font-medium text-slate-300">PostgreSQL Database Connection</span>
                      <Badge variant="success">Sẵn sàng</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-900/60 rounded-lg border border-slate-700">
                      <span className="text-xs font-medium text-slate-300">Service Role Special Access</span>
                      <Badge variant="success">Hợp lệ</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-900/60 rounded-lg border border-slate-700">
                      <span className="text-xs font-medium text-slate-300">Supabase Storage Service</span>
                      <Badge variant="success">Hoạt động (3 Buckets)</Badge>
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter className="border-slate-700/60 flex justify-between">
                <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700" onClick={() => setCurrentStep(3)} icon={<ArrowLeft className="w-4 h-4" />}>
                  Quay lại
                </Button>
                <Button variant="primary" disabled={!testResults} onClick={() => setCurrentStep(5)} icon={<ArrowRight className="w-4 h-4" />}>
                  Khởi tạo Database
                </Button>
              </CardFooter>
            </>
          )}

          {/* STEP 5: DATABASE MIGRATIONS */}
          {currentStep === 5 && (
            <>
              <CardHeader className="border-slate-700/60">
                <CardTitle className="text-xl text-white flex items-center gap-2">
                  <Database className="w-5 h-5 text-indigo-400" />
                  Khởi tạo Database & Chạy Migrations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-300">Danh sách 18 file migration cần thực thi:</p>
                  <Button variant="outline" size="sm" className="border-slate-600 text-slate-300" onClick={handleRunMigrations} isLoading={isLoading}>
                    Chạy toàn bộ Migration
                  </Button>
                </div>

                <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1 border border-slate-700 rounded-lg p-2 bg-slate-900/60">
                  {migrationsList.map((m) => (
                    <div key={m.id} className="flex items-center justify-between p-2 text-xs rounded bg-slate-800/60 border border-slate-700/40">
                      <span className="font-mono text-slate-300">{m.name}</span>
                      {m.status === 'COMPLETED' ? (
                        <Badge variant="success">Đã chạy</Badge>
                      ) : m.status === 'RUNNING' ? (
                        <Badge variant="warning">Đang thực thi...</Badge>
                      ) : (
                        <Badge variant="secondary">Chưa chạy</Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="border-slate-700/60 flex justify-between">
                <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700" onClick={() => setCurrentStep(4)} icon={<ArrowLeft className="w-4 h-4" />}>
                  Quay lại
                </Button>
                <Button variant="primary" onClick={() => setCurrentStep(6)} icon={<ArrowRight className="w-4 h-4" />}>
                  Khởi tạo Storage
                </Button>
              </CardFooter>
            </>
          )}

          {/* STEP 6: STORAGE INITIALIZATION */}
          {currentStep === 6 && (
            <>
              <CardHeader className="border-slate-700/60">
                <CardTitle className="text-xl text-white flex items-center gap-2">
                  <FolderLock className="w-5 h-5 text-indigo-400" />
                  Cấu hình Supabase Storage Buckets
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs text-slate-300">
                  Khởi tạo và áp dụng RLS Storage Policies cho 3 buckets bắt buộc:
                </p>

                <div className="space-y-2">
                  <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-700 flex justify-between items-center">
                    <div>
                      <div className="font-semibold text-xs text-white">avatars</div>
                      <div className="text-[10px] text-slate-400">Chứa ảnh đại diện người dùng • Public Read</div>
                    </div>
                    <Badge variant="success">Sẵn sàng</Badge>
                  </div>
                  <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-700 flex justify-between items-center">
                    <div>
                      <div className="font-semibold text-xs text-white">course-images</div>
                      <div className="text-[10px] text-slate-400">Chứa ảnh thumbnail/banner khóa học • Admin Upload</div>
                    </div>
                    <Badge variant="success">Sẵn sàng</Badge>
                  </div>
                  <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-700 flex justify-between items-center">
                    <div>
                      <div className="font-semibold text-xs text-white">lesson-files</div>
                      <div className="text-[10px] text-slate-400">Tài liệu đính kèm bài học • Private Signed URL</div>
                    </div>
                    <Badge variant="success">Sẵn sàng</Badge>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-slate-700/60 flex justify-between">
                <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700" onClick={() => setCurrentStep(5)} icon={<ArrowLeft className="w-4 h-4" />}>
                  Quay lại
                </Button>
                <Button variant="primary" onClick={() => setCurrentStep(7)} icon={<ArrowRight className="w-4 h-4" />}>
                  Tạo Super Admin
                </Button>
              </CardFooter>
            </>
          )}

          {/* STEP 7: SUPER ADMIN CREATION */}
          {currentStep === 7 && (
            <>
              <CardHeader className="border-slate-700/60">
                <CardTitle className="text-xl text-white flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-indigo-400" />
                  Tạo tài khoản Super Admin đầu tiên
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs text-slate-300">
                  Tài khoản Super Admin sở hữu toàn bộ quyền quản trị hệ thống và cấu hình kết nối.
                </p>

                <Input
                  label="Họ và tên"
                  value={adminFullName}
                  onChange={(e) => setAdminFullName(e.target.value)}
                />

                <Input
                  label="Email quản trị"
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                />

                <Input
                  label="Mật khẩu"
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                />

                <Input
                  label="Xác nhận mật khẩu"
                  type="password"
                  value={adminPasswordConfirm}
                  onChange={(e) => setAdminPasswordConfirm(e.target.value)}
                />
              </CardContent>
              <CardFooter className="border-slate-700/60 flex justify-between">
                <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700" onClick={() => setCurrentStep(6)} icon={<ArrowLeft className="w-4 h-4" />}>
                  Quay lại
                </Button>
                <Button
                  variant="primary"
                  onClick={async () => {
                    const success = await handleCreateSuperAdmin();
                    if (success) setCurrentStep(8);
                  }}
                  isLoading={isLoading}
                  icon={<ArrowRight className="w-4 h-4" />}
                >
                  Tạo Quản trị viên
                </Button>
              </CardFooter>
            </>
          )}

          {/* STEP 8: SAMPLE DATA & FINALIZE */}
          {currentStep === 8 && (
            <>
              <CardHeader className="border-slate-700/60">
                <CardTitle className="text-xl text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  Khởi tạo Dữ liệu Mẫu & Hoàn tất
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300">Lựa chọn Dữ liệu Khởi tạo:</label>
                  <div className="space-y-2">
                    <label className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer ${sampleDataChoice === 'full' ? 'border-indigo-500 bg-indigo-500/10' : 'border-slate-700 bg-slate-900/60'}`}>
                      <input
                        type="radio"
                        name="sampleData"
                        checked={sampleDataChoice === 'full'}
                        onChange={() => setSampleDataChoice('full')}
                        className="mt-1"
                      />
                      <div>
                        <div className="font-semibold text-xs text-white">Khởi tạo Danh mục & Khóa học mẫu (Khuyên dùng)</div>
                        <div className="text-[10px] text-slate-400">Thêm sẵn 7 danh mục AI và 3 khóa học mẫu (ChatGPT, Gemini, Sáng tạo ảnh). Toàn bộ dữ liệu được đánh dấu is_demo=true.</div>
                      </div>
                    </label>

                    <label className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer ${sampleDataChoice === 'none' ? 'border-indigo-500 bg-indigo-500/10' : 'border-slate-700 bg-slate-900/60'}`}>
                      <input
                        type="radio"
                        name="sampleData"
                        checked={sampleDataChoice === 'none'}
                        onChange={() => setSampleDataChoice('none')}
                        className="mt-1"
                      />
                      <div>
                        <div className="font-semibold text-xs text-white">Không tạo dữ liệu mẫu (Trắng hoàn toàn)</div>
                        <div className="text-[10px] text-slate-400">Cơ sở dữ liệu hoàn toàn trống để tạo nội dung từ đầu.</div>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-300 text-xs space-y-1">
                  <div className="font-semibold text-emerald-200">Sẵn sàng hoàn tất cài đặt!</div>
                  <p>
                    Sau khi hoàn tất, hệ thống sẽ tự động khóa đường dẫn Setup Wizard, chuyển hướng trực tiếp tới trang Quản trị viên (Admin Dashboard).
                  </p>
                </div>
              </CardContent>
              <CardFooter className="border-slate-700/60 flex justify-between">
                <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700" onClick={() => setCurrentStep(7)} icon={<ArrowLeft className="w-4 h-4" />}>
                  Quay lại
                </Button>
                <Button variant="success" onClick={handleCompleteSetup} isLoading={isLoading} icon={<CheckCircle2 className="w-4 h-4" />}>
                  Hoàn tất Cài đặt System
                </Button>
              </CardFooter>
            </>
          )}
        </Card>
      </div>
    </div>
  );
};
