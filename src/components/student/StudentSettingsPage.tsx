import React, { useState } from 'react';
import { Key, Lock, CheckCircle } from 'lucide-react';
import { UserProfile } from '../../types';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';

export const StudentSettingsPage: React.FC<{ currentUser: UserProfile }> = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [successMsg, setSuccessMsg] = useState(false);

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) return;
    if (newPassword !== confirmPassword) return;

    setSuccessMsg(true);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setSuccessMsg(false), 3000);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Cài Đặt Tài Khoản</h1>

      {successMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>Đổi mật khẩu thành công!</span>
        </div>
      )}

      <Card>
        <form onSubmit={handlePasswordChange}>
          <CardHeader>
            <CardTitle>Đổi Mật Khẩu</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Mật khẩu hiện tại"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
            <Input
              label="Mật khẩu mới (Tối thiểu 8 ký tự)"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <Input
              label="Xác nhận mật khẩu mới"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <Button type="submit" variant="primary" icon={<Key className="w-4 h-4" />}>
              Cập nhật mật khẩu
            </Button>
          </CardContent>
        </form>
      </Card>
    </div>
  );
};
