import React from 'react';

export const Footer: React.FC<{ onNavigate: (route: string) => void }> = ({ onNavigate }) => {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-md bg-blue-600 flex items-center justify-center text-white font-bold text-base shadow-sm">
                L
              </div>
              <span className="font-bold text-white text-lg tracking-tight">
                LEX<span className="text-blue-400">EDU</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Nền tảng đào tạo kỹ năng AI thực tế hàng đầu. Khai phá tiềm năng của ChatGPT, Gemini và hệ sinh thái Trí tuệ nhân tạo.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase mb-3">Khóa học</h4>
            <ul className="space-y-2 text-xs">
              <li><button onClick={() => onNavigate('/courses')} className="hover:text-white transition-colors">ChatGPT Cho Công Việc</button></li>
              <li><button onClick={() => onNavigate('/courses')} className="hover:text-white transition-colors">Gemini Nâng Cao</button></li>
              <li><button onClick={() => onNavigate('/courses')} className="hover:text-white transition-colors">Sáng Tạo Ảnh AI</button></li>
              <li><button onClick={() => onNavigate('/courses')} className="hover:text-white transition-colors">Tự Động Hóa AI</button></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase mb-3">Nền tảng</h4>
            <ul className="space-y-2 text-xs">
              <li><button onClick={() => onNavigate('/about')} className="hover:text-white transition-colors">Giới thiệu LexEdu</button></li>
              <li><button onClick={() => onNavigate('/login')} className="hover:text-white transition-colors">Đăng nhập Học viên</button></li>
              <li><button onClick={() => onNavigate('/register')} className="hover:text-white transition-colors">Đăng ký tài khoản</button></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase mb-3">Liên hệ</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Hệ thống đào tạo trực tuyến LexEdu Platform.<br />
              Email: support@lexedu.vn<br />
              Phiên bản: 1.0.0 Stable MVP
            </p>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500">
          <p>© 2026 LexEdu Platform. Bảo lưu mọi quyền.</p>
          <div className="flex gap-4 mt-2 sm:mt-0">
            <span>Chính sách bảo mật</span>
            <span>Điều khoản sử dụng</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
