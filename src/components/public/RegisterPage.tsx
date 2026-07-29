import React, { useState } from 'react';
import { UserPlus, AlertCircle } from 'lucide-react';
import { authService } from '../../services/authService';
import { UserProfile } from '../../types';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card, CardContent, CardFooter } from '../ui/Card';

interface RegisterPageProps {
  onNavigate: (route: string) => void;
  onRegisterSuccess: (user: UserProfile) => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onNavigate, onRegisterSuccess }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreed, setAgreed] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim()) {
      setError('Vui lòng nhập họ và tên.');
      return;
    }
    if (!email.includes('@')) {
      setError('Vui lòng nhập địa chỉ email hợp lệ.');
      return;
    }
    if (password.length < 8) {
      setError('Mật khẩu phải có ít nhất 8 ký tự.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Xác nhận mật khẩu không khớp.');
      return;
    }
    if (!agreed) {
      setError('Bạn cần đồng ý với Điều khoản dịch vụ.');
      return;
    }

    setIsLoading(true);
    try {
      const user = await authService.register(fullName, email, password);
      onRegisterSuccess(user);
    } catch (err: any) {
      setError(err.message || 'Đăng ký không thành công.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-slate-50">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-2xl mx-auto shadow-md">
            L
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Đăng Ký Tài Khoản Học Viên</h1>
          <p className="text-xs text-slate-500">Tạo tài khoản để bắt đầu các khóa học đào tạo AI tại LexEdu.</p>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <Card>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4 pt-6">
              <Input
                label="Họ và tên"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nguyễn Văn A"
                required
              />

              <Input
                label="Địa chỉ Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="hocvien@example.com"
                required
              />

              <Input
                label="Mật khẩu (Tối thiểu 8 ký tự)"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />

              <Input
                label="Xác nhận mật khẩu"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
              />

              <label className="flex items-start gap-2 cursor-pointer text-xs text-slate-600">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-0.5 rounded border-slate-300 text-indigo-600"
                />
                <span>Tôi đồng ý với Điều khoản dịch vụ và Chính sách bảo mật của LexEdu Platform.</span>
              </label>

              <Button type="submit" variant="primary" className="w-full" size="lg" isLoading={isLoading} icon={<UserPlus className="w-4 h-4" />}>
                Đăng ký ngay
              </Button>
            </CardContent>
          </form>
          <CardFooter className="text-center justify-center text-xs text-slate-500 border-t border-slate-100">
            <span>Đã có tài khoản? </span>
            <button onClick={() => onNavigate('/login')} className="text-indigo-600 font-semibold hover:underline ml-1">
              Đăng nhập
            </button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};
