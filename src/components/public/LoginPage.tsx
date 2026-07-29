import React, { useState } from 'react';
import { LogIn, AlertCircle } from 'lucide-react';
import { authService } from '../../services/authService';
import { UserProfile } from '../../types';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../ui/Card';

interface LoginPageProps {
  onNavigate: (route: string) => void;
  onLoginSuccess: (user: UserProfile) => void;
  returnUrl?: string;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate, onLoginSuccess, returnUrl }) => {
  const [email, setEmail] = useState('admin@lexedu.vn');
  const [password, setPassword] = useState('LexEdu2026@Master');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const user = await authService.login(email, password);
      onLoginSuccess(user);
    } catch (err: any) {
      setError(err.message || 'Đăng nhập không thành công.');
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
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Đăng Nhập Hộp Thư LexEdu</h1>
          <p className="text-xs text-slate-500">Nhập email và mật khẩu tài khoản của bạn để truy cập hệ thống.</p>
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
                label="Địa chỉ Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                required
              />

              <Input
                label="Mật khẩu"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />

              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 cursor-pointer text-slate-600">
                  <input type="checkbox" defaultChecked className="rounded border-slate-300 text-indigo-600" />
                  <span>Ghi nhớ đăng nhập</span>
                </label>
                <button
                  type="button"
                  onClick={() => onNavigate('/forgot-password')}
                  className="text-indigo-600 hover:underline font-medium"
                >
                  Quên mật khẩu?
                </button>
              </div>

              <Button type="submit" variant="primary" className="w-full" size="lg" isLoading={isLoading} icon={<LogIn className="w-4 h-4" />}>
                Đăng nhập
              </Button>
            </CardContent>
          </form>
          <CardFooter className="text-center justify-center text-xs text-slate-500 border-t border-slate-100">
            <span>Chưa có tài khoản? </span>
            <button onClick={() => onNavigate('/register')} className="text-indigo-600 font-semibold hover:underline ml-1">
              Đăng ký ngay
            </button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};
