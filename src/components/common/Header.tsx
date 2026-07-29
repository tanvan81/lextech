import React, { useState, useRef, useEffect } from 'react';
import { BookOpen, User, LogOut, Settings, LayoutDashboard, Menu, X, ChevronDown } from 'lucide-react';
import { UserProfile } from '../../types';
import { authService } from '../../services/authService';

interface HeaderProps {
  currentUser: UserProfile | null;
  onNavigate: (route: string) => void;
  onLogout?: () => void;
  currentRoute?: string;
}

export const Header: React.FC<HeaderProps> = ({ currentUser, onNavigate, onLogout, currentRoute }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    authService.logout();
    setDropdownOpen(false);
    setMobileMenuOpen(false);
    if (onLogout) {
      onLogout();
    } else {
      onNavigate('/login');
    }
  };

  const isActive = (path: string) => currentRoute === path;

  return (
    <header className="sticky top-0 z-40 bg-slate-900 text-white border-b border-slate-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div
            onClick={() => onNavigate('/')}
            className="flex items-center gap-3 cursor-pointer select-none"
          >
            <div className="w-8 h-8 rounded-md bg-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
              L
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-white text-lg tracking-tight leading-none">
                LEX<span className="text-blue-400 font-bold">EDU</span>
              </span>
              <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Enterprise Learning</span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            {!currentUser ? (
              // Guest Links
              <>
                <button
                  onClick={() => onNavigate('/')}
                  className={`transition-colors py-1 ${
                    isActive('/') ? 'text-white font-semibold border-b-2 border-blue-400' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Trang chủ
                </button>
                <button
                  onClick={() => onNavigate('/courses')}
                  className={`transition-colors py-1 ${
                    isActive('/courses') ? 'text-white font-semibold border-b-2 border-blue-400' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Khóa học
                </button>
                <button
                  onClick={() => onNavigate('/about')}
                  className={`transition-colors py-1 ${
                    isActive('/about') ? 'text-white font-semibold border-b-2 border-blue-400' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Giới thiệu
                </button>
              </>
            ) : currentUser.role === 'STUDENT' ? (
              // Student Links
              <>
                <button
                  onClick={() => onNavigate('/courses')}
                  className={`transition-colors py-1 ${
                    isActive('/courses') ? 'text-white font-semibold border-b-2 border-blue-400' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Khám phá khóa học
                </button>
                <button
                  onClick={() => onNavigate('/student/my-courses')}
                  className={`transition-colors py-1 ${
                    isActive('/student/my-courses') ? 'text-white font-semibold border-b-2 border-blue-400' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Khóa học của tôi
                </button>
              </>
            ) : (
              // Admin view on Public Site
              <>
                <button
                  onClick={() => onNavigate('/')}
                  className={`transition-colors py-1 ${
                    isActive('/') ? 'text-white font-semibold border-b-2 border-blue-400' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Trang chủ
                </button>
                <button
                  onClick={() => onNavigate('/courses')}
                  className={`transition-colors py-1 ${
                    isActive('/courses') ? 'text-white font-semibold border-b-2 border-blue-400' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Khóa học
                </button>
                <button
                  onClick={() => onNavigate('/about')}
                  className={`transition-colors py-1 ${
                    isActive('/about') ? 'text-white font-semibold border-b-2 border-blue-400' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Giới thiệu
                </button>
              </>
            )}
          </nav>

          {/* Right Action / User Avatar */}
          <div className="hidden md:flex items-center gap-3">
            {!currentUser ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => onNavigate('/login')}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
                >
                  Đăng nhập
                </button>
                <button
                  onClick={() => onNavigate('/register')}
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-md shadow-sm transition-colors"
                >
                  Đăng ký
                </button>
              </div>
            ) : (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-md bg-slate-800 border border-slate-700 hover:bg-slate-700/80 transition-colors focus:outline-none"
                >
                  <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
                    {currentUser.full_name ? currentUser.full_name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-semibold text-white leading-tight">{currentUser.full_name}</div>
                    <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                      {currentUser.role === 'SUPER_ADMIN' ? 'Super Admin' : currentUser.role === 'ADMIN' ? 'Admin' : 'Học viên'}
                    </div>
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white text-slate-900 rounded-xl shadow-lg border border-slate-200 py-1 z-50 animate-fade-in">
                    <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50">
                      <p className="text-xs font-semibold text-slate-900 truncate">{currentUser.full_name}</p>
                      <p className="text-xs text-slate-500 truncate">{currentUser.email}</p>
                    </div>

                    {currentUser.role === 'STUDENT' ? (
                      <>
                        <button
                          onClick={() => { setDropdownOpen(false); onNavigate('/student'); }}
                          className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                        >
                          <LayoutDashboard className="w-4 h-4 text-slate-400" />
                          Tổng quan
                        </button>
                        <button
                          onClick={() => { setDropdownOpen(false); onNavigate('/student/my-courses'); }}
                          className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                        >
                          <BookOpen className="w-4 h-4 text-slate-400" />
                          Khóa học của tôi
                        </button>
                        <button
                          onClick={() => { setDropdownOpen(false); onNavigate('/student/profile'); }}
                          className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                        >
                          <User className="w-4 h-4 text-slate-400" />
                          Hồ sơ cá nhân
                        </button>
                        <button
                          onClick={() => { setDropdownOpen(false); onNavigate('/student/settings'); }}
                          className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2 border-b border-slate-100"
                        >
                          <Settings className="w-4 h-4 text-slate-400" />
                          Cài đặt
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => { setDropdownOpen(false); onNavigate('/admin'); }}
                          className="w-full text-left px-4 py-2 text-xs font-semibold text-blue-600 hover:bg-blue-50 flex items-center gap-2 border-b border-slate-100"
                        >
                          <LayoutDashboard className="w-4 h-4 text-blue-600" />
                          Trang quản trị
                        </button>
                      </>
                    )}

                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" />
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-900 px-4 pt-2 pb-4 space-y-2 text-slate-200">
          {!currentUser ? (
            <>
              <button
                onClick={() => { setMobileMenuOpen(false); onNavigate('/'); }}
                className="block w-full text-left px-3 py-2 rounded-lg text-sm font-medium hover:bg-slate-800"
              >
                Trang chủ
              </button>
              <button
                onClick={() => { setMobileMenuOpen(false); onNavigate('/courses'); }}
                className="block w-full text-left px-3 py-2 rounded-lg text-sm font-medium hover:bg-slate-800"
              >
                Khóa học
              </button>
              <button
                onClick={() => { setMobileMenuOpen(false); onNavigate('/about'); }}
                className="block w-full text-left px-3 py-2 rounded-lg text-sm font-medium hover:bg-slate-800"
              >
                Giới thiệu
              </button>
              <div className="pt-2 border-t border-slate-800 flex flex-col gap-2">
                <button
                  onClick={() => { setMobileMenuOpen(false); onNavigate('/login'); }}
                  className="w-full py-2 text-center text-sm font-medium text-slate-200 border border-slate-700 rounded-lg"
                >
                  Đăng nhập
                </button>
                <button
                  onClick={() => { setMobileMenuOpen(false); onNavigate('/register'); }}
                  className="w-full py-2 text-center text-sm font-medium text-white bg-blue-600 rounded-lg"
                >
                  Đăng ký
                </button>
              </div>
            </>
          ) : currentUser.role === 'STUDENT' ? (
            <>
              <button
                onClick={() => { setMobileMenuOpen(false); onNavigate('/student'); }}
                className="block w-full text-left px-3 py-2 rounded-lg text-sm font-medium hover:bg-slate-800"
              >
                Tổng quan Dashboard
              </button>
              <button
                onClick={() => { setMobileMenuOpen(false); onNavigate('/courses'); }}
                className="block w-full text-left px-3 py-2 rounded-lg text-sm font-medium hover:bg-slate-800"
              >
                Khám phá khóa học
              </button>
              <button
                onClick={() => { setMobileMenuOpen(false); onNavigate('/student/my-courses'); }}
                className="block w-full text-left px-3 py-2 rounded-lg text-sm font-medium hover:bg-slate-800"
              >
                Khóa học của tôi
              </button>
              <button
                onClick={() => { setMobileMenuOpen(false); onNavigate('/student/profile'); }}
                className="block w-full text-left px-3 py-2 rounded-lg text-sm font-medium hover:bg-slate-800"
              >
                Hồ sơ cá nhân
              </button>
              <button
                onClick={() => { setMobileMenuOpen(false); handleLogout(); }}
                className="block w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-rose-400 hover:bg-slate-800"
              >
                Đăng xuất
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => { setMobileMenuOpen(false); onNavigate('/admin'); }}
                className="block w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-blue-400 bg-slate-800"
              >
                Trang quản trị (Admin)
              </button>
              <button
                onClick={() => { setMobileMenuOpen(false); handleLogout(); }}
                className="block w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-rose-400 hover:bg-slate-800"
              >
                Đăng xuất
              </button>
            </>
          )}
        </div>
      )}
    </header>
  );
};
