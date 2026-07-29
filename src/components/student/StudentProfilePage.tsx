import React, { useState } from 'react';
import { User, Save, CheckCircle } from 'lucide-react';
import { UserProfile } from '../../types';
import { dbStore } from '../../services/dbStore';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';

export const StudentProfilePage: React.FC<{ currentUser: UserProfile; onUpdateProfile: (u: UserProfile) => void }> = ({
  currentUser,
  onUpdateProfile,
}) => {
  const [fullName, setFullName] = useState(currentUser.full_name);
  const [avatarUrl, setAvatarUrl] = useState(currentUser.avatar_url || '');
  const [isSaved, setIsSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = {
      ...currentUser,
      full_name: fullName,
      avatar_url: avatarUrl || undefined,
    };
    dbStore.saveProfile(updated);
    onUpdateProfile(updated);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Hồ Sơ Cá Nhân</h1>

      {isSaved && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>Cập nhật thông tin hồ sơ thành công!</span>
        </div>
      )}

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Thông tin người dùng</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input label="Họ và tên" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
            <Input label="Địa chỉ Email (Read-only)" value={currentUser.email} disabled />
            <Input label="URL Ảnh đại diện Avatar" value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} placeholder="https://..." />
            <Button type="submit" variant="primary" icon={<Save className="w-4 h-4" />}>
              Lưu thay đổi
            </Button>
          </CardContent>
        </form>
      </Card>
    </div>
  );
};
