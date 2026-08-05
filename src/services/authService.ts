import { UserProfile, UserRole } from '../types';
import { dbStore } from './dbStore';

const SESSION_KEY = 'lexedu_auth_session';

export interface AuthSession {
  user: UserProfile;
  token: string;
  expiresAt: string;
}

export class AuthService {
  private currentSession: AuthSession | null = null;

  constructor() {
    this.loadSession();
  }

  private loadSession() {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (raw) {
        const parsed: AuthSession = JSON.parse(raw);
        // Verify user still exists in dbStore
        const latestProfile = dbStore.getProfileById(parsed.user.id);
        if (latestProfile && latestProfile.status === 'ACTIVE') {
          this.currentSession = { ...parsed, user: latestProfile };
        } else {
          this.logout();
        }
      }
    } catch {
      this.currentSession = null;
    }
  }

  private saveSession(session: AuthSession | null) {
    this.currentSession = session;
    if (typeof window === 'undefined') return;
    if (session) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } else {
      localStorage.removeItem(SESSION_KEY);
    }
  }

  getCurrentUser(): UserProfile | null {
    if (!this.currentSession) this.loadSession();
    return this.currentSession?.user || null;
  }

  getCurrentProfile(): UserProfile | null {
    return this.getCurrentUser();
  }

  requireUser(): UserProfile {
    const user = this.getCurrentUser();
    if (!user) {
      throw new Error('Bạn chưa đăng nhập.');
    }
    if (user.status === 'BLOCKED') {
      throw new Error('Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.');
    }
    return user;
  }

  requireStudent(): UserProfile {
    const user = this.requireUser();
    return user;
  }

  requireAdmin(): UserProfile {
    const user = this.requireUser();
    if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      throw new Error('Bạn không có quyền quản trị.');
    }
    return user;
  }

  requireSuperAdmin(): UserProfile {
    const user = this.requireUser();
    if (user.role !== 'SUPER_ADMIN') {
      throw new Error('Chỉ Super Admin mới có quyền thực hiện thao tác này.');
    }
    return user;
  }

  async login(email: string, pass: string): Promise<UserProfile> {
    const cleanEmail = (email || '').trim().toLowerCase();
    const profile = await dbStore.getProfileByEmailAsync(cleanEmail);
    if (!profile) {
      throw new Error('Email hoặc mật khẩu không chính xác.');
    }
    if (profile.password && profile.password !== pass.trim()) {
      throw new Error('Email hoặc mật khẩu không chính xác.');
    }
    if (profile.status === 'BLOCKED' || profile.is_blocked) {
      throw new Error('Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.');
    }

    profile.last_login_at = new Date().toISOString();
    dbStore.saveProfile(profile);

    const session: AuthSession = {
      user: profile,
      token: 'tok_' + Math.random().toString(36).substring(2, 12),
      expiresAt: new Date(Date.now() + 86400000 * 7).toISOString(),
    };

    this.saveSession(session);
    dbStore.logAudit({ action: 'Đăng nhập hệ thống', action_level: 'INFO', actor_id: profile.id, actor_name: profile.full_name });

    return profile;
  }

  async register(fullName: string, email: string, pass: string): Promise<UserProfile> {
    const cleanEmail = (email || '').trim().toLowerCase();
    
    // Check if email exists in active local state
    const localExisting = dbStore.getProfileByEmail(cleanEmail);
    if (localExisting && (localExisting.status as any) !== 'DELETED') {
      throw new Error('Email này đã được đăng ký trên hệ thống. Vui lòng dùng email khác hoặc đăng nhập.');
    }

    const existingAsync = await dbStore.getProfileByEmailAsync(cleanEmail);
    if (existingAsync && (existingAsync.status as any) !== 'DELETED') {
      throw new Error('Email này đã được đăng ký trên hệ thống. Vui lòng dùng email khác hoặc đăng nhập.');
    }

    const newProfile: UserProfile = {
      id: 'usr-' + Math.random().toString(36).substring(2, 10),
      full_name: fullName.trim(),
      email: cleanEmail,
      password: pass.trim(),
      role: 'STUDENT',
      status: 'ACTIVE',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    dbStore.saveProfile(newProfile);

    // Auto login
    await this.login(newProfile.email, pass);
    dbStore.logAudit({ action: 'Đăng ký tài khoản mới', action_level: 'INFO', actor_id: newProfile.id, actor_name: newProfile.full_name });

    return newProfile;
  }

  async createSuperAdmin(fullName: string, email: string, pass: string): Promise<UserProfile> {
    const existing = dbStore.getProfileByEmail(email);
    if (existing) {
      existing.role = 'SUPER_ADMIN';
      existing.full_name = fullName;
      dbStore.saveProfile(existing);
      return existing;
    }

    const adminProfile: UserProfile = {
      id: 'sa-' + Math.random().toString(36).substring(2, 10),
      full_name: fullName.trim(),
      email: email.trim().toLowerCase(),
      role: 'SUPER_ADMIN',
      status: 'ACTIVE',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    dbStore.saveProfile(adminProfile);
    this.saveSession({
      user: adminProfile,
      token: 'sa_tok_' + Math.random().toString(36).substring(2, 12),
      expiresAt: new Date(Date.now() + 86400000 * 30).toISOString(),
    });

    dbStore.logAudit({ action: 'Tạo tài khoản Super Admin cài đặt ban đầu', action_level: 'INFO', actor_id: adminProfile.id, actor_name: adminProfile.full_name });
    return adminProfile;
  }

  logout() {
    this.saveSession(null);
  }
}

export const authService = new AuthService();
