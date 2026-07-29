import React from 'react';
import {
  LayoutDashboard,
  BookOpen,
  Users,
  Clock,
  FolderTree,
  Server,
  Settings,
  LogOut,
  ChevronRight,
  ShieldAlert,
  ArrowLeft
} from 'lucide-react';
import { UserProfile } from '../../types';
import { authService } from '../../services/authService';

interface AdminSidebarProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  currentUser: UserProfile;
  onLogout?: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ currentRoute, onNavigate, currentUser, onLogout }) => {
  const isSuperAdmin = currentUser.role === 'SUPER_ADMIN';

  const handleLogout = () => {
    authService.logout();
    if (onLogout) {
      onLogout();
    } else {
      onNavigate('/login');
    }
  };

  const navItems = [
    { label: 'Tổng quan', route: '/admin', icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: 'Quản lý khóa học', route: '/admin/courses', icon: <BookOpen className="w-4 h-4" /> },
    { label: 'Quản lý học viên', route: '/admin/students', icon: <Users className="w-4 h-4" /> },
    { label: 'Duyệt yêu cầu', route: '/admin/enrollment-requests', icon: <Clock className="w-4 h-4" /> },
    { label: 'Quản lý danh mục', route: '/admin/categories', icon: <FolderTree className="w-4 h-4" /> },
  ];

  const systemItems = [
    { label: 'Trạng thái hệ thống', route: '/admin/system', icon: <Server className="w-4 h-4" /> },
    { label: 'Cấu hình & Reset', route: '/admin/system/reset', icon: <ShieldAlert className="w-4 h-4" /> },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col shrink-0 min-h-screen">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate('/admin')}>
          <div className="w-8 h-8 rounded-md bg-blue-600 flex items-center justify-center text-white font-bold text-base shadow-sm">
            L
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-white text-base leading-none tracking-tight">LEXEDU ADMIN</span>
            <span className="text-[10px] text-blue-400 font-semibold uppercase tracking-wider mt-0.5">Control Center</span>
          </div>
        </div>
      </div>

      {/* Nav Menu */}
      <div className="flex-1 overflow-y-auto p-3 space-y-6">
        <div className="space-y-1">
          <div className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Quản trị nghiệp vụ</div>
          {navItems.map((item) => {
            const isActive = currentRoute === item.route;
            return (
              <button
                key={item.route}
                onClick={() => onNavigate(item.route)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white font-semibold shadow-xs'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {item.icon}
                  <span>{item.label}</span>
                </div>
                {isActive && <ChevronRight className="w-3.5 h-3.5" />}
              </button>
            );
          })}
        </div>

        {/* Super Admin Section */}
        {isSuperAdmin && (
          <div className="space-y-1 pt-2 border-t border-slate-800">
            <div className="px-3 text-[10px] font-bold text-blue-400 uppercase tracking-wider mb-2">Hạ tầng System Center</div>
            {systemItems.map((item) => {
              const isActive = currentRoute.startsWith(item.route);
              return (
                <button
                  key={item.route}
                  onClick={() => onNavigate(item.route)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-900/60 text-blue-300 border border-blue-700/50 font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {item.icon}
                    <span>{item.label}</span>
                  </div>
                  {isActive && <ChevronRight className="w-3.5 h-3.5" />}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* User Footer */}
      <div className="p-3 border-t border-slate-800 space-y-2">
        <button
          onClick={() => onNavigate('/')}
          className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4 text-slate-500" />
          Xem Website Công Khai
        </button>

        <div className="p-2.5 bg-slate-950 rounded-lg flex items-center justify-between">
          <div className="truncate">
            <div className="text-xs font-bold text-white truncate">{currentUser.full_name}</div>
            <div className="text-[10px] text-slate-500">{currentUser.role}</div>
          </div>
          <button onClick={handleLogout} className="p-1.5 rounded hover:bg-rose-500/20 text-rose-400 transition-colors">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
