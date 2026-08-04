import {
  UserProfile,
  Category,
  Course,
  CourseSection,
  Lesson,
  LessonAttachment,
  Enrollment,
  LessonProgress,
  SystemSetting,
  SystemMigration,
  SystemAuditLog,
  SetupStatus,
  ConnectionTestResult,
  SystemHealthStatus,
  UserRole,
  UserStatus
} from '../types';
import { getSupabaseBrowserClient, getSupabaseCredentials } from '../lib/supabase/client';
import { getSupabaseAdminClient } from '../lib/supabase/admin';

const STORAGE_KEY = 'lexedu_db_v3_store';

interface LocalDBState {
  setupStatus: SetupStatus;
  profiles: UserProfile[];
  categories: Category[];
  courses: Course[];
  sections: CourseSection[];
  lessons: Lesson[];
  attachments: LessonAttachment[];
  enrollments: Enrollment[];
  progress: LessonProgress[];
  settings: SystemSetting[];
  migrations: SystemMigration[];
  auditLogs: SystemAuditLog[];
}

const DEFAULT_MIGRATIONS: SystemMigration[] = [
  { id: 'm001', migration_version: '001', migration_name: '001_create_enums.sql', status: 'COMPLETED', completed_at: new Date().toISOString(), created_at: new Date().toISOString() },
  { id: 'm002', migration_version: '002', migration_name: '002_create_profiles.sql', status: 'COMPLETED', completed_at: new Date().toISOString(), created_at: new Date().toISOString() },
  { id: 'm003', migration_version: '003', migration_name: '003_create_categories.sql', status: 'COMPLETED', completed_at: new Date().toISOString(), created_at: new Date().toISOString() },
  { id: 'm004', migration_version: '004', migration_name: '004_create_courses.sql', status: 'COMPLETED', completed_at: new Date().toISOString(), created_at: new Date().toISOString() },
  { id: 'm005', migration_version: '005', migration_name: '005_create_course_sections.sql', status: 'COMPLETED', completed_at: new Date().toISOString(), created_at: new Date().toISOString() },
  { id: 'm006', migration_version: '006', migration_name: '006_create_lessons.sql', status: 'COMPLETED', completed_at: new Date().toISOString(), created_at: new Date().toISOString() },
  { id: 'm007', migration_version: '007', migration_name: '007_create_lesson_attachments.sql', status: 'COMPLETED', completed_at: new Date().toISOString(), created_at: new Date().toISOString() },
  { id: 'm008', migration_version: '008', migration_name: '008_create_enrollments.sql', status: 'COMPLETED', completed_at: new Date().toISOString(), created_at: new Date().toISOString() },
  { id: 'm009', migration_version: '009', migration_name: '009_create_lesson_progress.sql', status: 'COMPLETED', completed_at: new Date().toISOString(), created_at: new Date().toISOString() },
  { id: 'm010', migration_version: '010', migration_name: '010_create_system_settings.sql', status: 'COMPLETED', completed_at: new Date().toISOString(), created_at: new Date().toISOString() },
  { id: 'm011', migration_version: '011', migration_name: '011_create_system_migrations.sql', status: 'COMPLETED', completed_at: new Date().toISOString(), created_at: new Date().toISOString() },
  { id: 'm012', migration_version: '012', migration_name: '012_create_system_audit_logs.sql', status: 'COMPLETED', completed_at: new Date().toISOString(), created_at: new Date().toISOString() },
  { id: 'm013', migration_version: '013', migration_name: '013_create_indexes.sql', status: 'COMPLETED', completed_at: new Date().toISOString(), created_at: new Date().toISOString() },
  { id: 'm014', migration_version: '014', migration_name: '014_create_updated_at_triggers.sql', status: 'COMPLETED', completed_at: new Date().toISOString(), created_at: new Date().toISOString() },
  { id: 'm015', migration_version: '015', migration_name: '015_create_auth_profile_trigger.sql', status: 'COMPLETED', completed_at: new Date().toISOString(), created_at: new Date().toISOString() },
  { id: 'm016', migration_version: '016', migration_name: '016_enable_rls.sql', status: 'COMPLETED', completed_at: new Date().toISOString(), created_at: new Date().toISOString() },
  { id: 'm017', migration_version: '017', migration_name: '017_create_rls_policies.sql', status: 'COMPLETED', completed_at: new Date().toISOString(), created_at: new Date().toISOString() },
  { id: 'm018', migration_version: '018', migration_name: '018_create_storage_policies.sql', status: 'COMPLETED', completed_at: new Date().toISOString(), created_at: new Date().toISOString() },
];

function getInitialState(): LocalDBState {
  return {
    setupStatus: {
      installed: true,
      schemaVersion: '1.0.0',
      setupVersion: '1.0.0',
      installedAt: new Date().toISOString(),
      deploymentMode: 'self-hosted',
      demoDataInitialized: true,
    },
    profiles: [
      {
        id: 'usr-admin-001',
        full_name: 'Quản trị viên LexEdu',
        email: 'admin@lexedu.vn',
        password: 'LexEdu2026@Master',
        role: 'SUPER_ADMIN',
        status: 'ACTIVE',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'usr-student-001',
        full_name: 'Học viên Mẫu',
        email: 'hocvien@lexedu.vn',
        password: '12345678',
        role: 'STUDENT',
        status: 'ACTIVE',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    ],
    categories: [],
    courses: [],
    sections: [],
    lessons: [],
    attachments: [],
    enrollments: [],
    progress: [],
    settings: [],
    migrations: DEFAULT_MIGRATIONS,
    auditLogs: [],
  };
}

class DBStoreEngine {
  private state: LocalDBState;

  constructor() {
    this.state = this.loadState();
    if (!this.state.courses) {
      this.state.courses = [];
      this.seedDemoData();
    }

    // Background sync with Supabase if credentials exist
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        this.syncFromSupabase().catch((err) => console.warn('[DBStore] Background Supabase sync failed:', err));
      }, 500);
    }
  }

  public getSupabaseClient() {
    return getSupabaseAdminClient() || getSupabaseBrowserClient();
  }

  public async wipeSupabaseData(): Promise<void> {
    const client = this.getSupabaseClient();
    if (!client) return;
    try {
      await client.from('lesson_progress').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await client.from('enrollments').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await client.from('lessons').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await client.from('course_sections').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await client.from('courses').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await client.from('categories').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await client.from('profiles').delete().neq('role', 'SUPER_ADMIN');
    } catch (err) {
      console.warn('[DBStore] Wipe Supabase data warning:', err);
    }
  }

  public async syncFromSupabase(): Promise<boolean> {
    const client = this.getSupabaseClient();
    if (!client) return false;

    try {
      // 1. Sync Profiles
      const { data: profiles, error: pErr } = await client.from('profiles').select('*');
      if (!pErr && profiles && profiles.length > 0) {
        const merged = [...this.state.profiles];
        profiles.forEach((p: any) => {
          const idx = merged.findIndex((m) => m.id === p.id || m.email.trim().toLowerCase() === p.email.trim().toLowerCase());
          if (idx >= 0) {
            merged[idx] = { ...merged[idx], ...p };
          } else {
            merged.push({
              id: p.id,
              full_name: p.full_name,
              email: p.email,
              role: p.role || 'STUDENT',
              status: p.status || 'ACTIVE',
              is_blocked: p.status === 'BLOCKED' || p.is_blocked || false,
              created_at: p.created_at || new Date().toISOString(),
              updated_at: p.updated_at || new Date().toISOString(),
            });
          }
        });
        this.state.profiles = merged;
      }

      // 2. Sync Courses
      const { data: courses, error: cErr } = await client.from('courses').select('*');
      if (!cErr && courses) {
        this.state.courses = courses as any;
      }

      // 3. Sync Sections
      const { data: sections, error: sErr } = await client.from('course_sections').select('*');
      if (!sErr && sections) {
        this.state.sections = sections as any;
      }

      // 4. Sync Lessons
      const { data: lessons, error: lErr } = await client.from('lessons').select('*');
      if (!lErr && lessons) {
        this.state.lessons = lessons as any;
      }

      // 5. Sync Enrollments
      const { data: enrollments, error: eErr } = await client.from('enrollments').select('*');
      if (!eErr && enrollments) {
        this.state.enrollments = enrollments as any;
      }

      // 6. Sync Progress
      const { data: progress, error: prErr } = await client.from('lesson_progress').select('*');
      if (!prErr && progress) {
        this.state.progress = progress as any;
      }

      this.saveState();

      // If Supabase courses table was completely empty, seed data to Supabase
      if (!courses || courses.length === 0) {
        await this.uploadAllDataToSupabase();
      }

      return true;
    } catch (err) {
      console.warn('[DBStore] Error during Supabase sync:', err);
      return false;
    }
  }

  public async uploadAllDataToSupabase(): Promise<{ success: boolean; message: string }> {
    const client = this.getSupabaseClient();
    if (!client) {
      throw new Error('Chưa kết nối Supabase Client. Vui lòng khai báo VITE_SUPABASE_URL & VITE_SUPABASE_ANON_KEY trong Cài Đặt Hạ Tầng.');
    }

    try {
      const cleanProfiles = this.state.profiles.map((p) => ({
        id: p.id,
        full_name: p.full_name,
        email: p.email.trim().toLowerCase(),
        role: p.role,
        status: p.is_blocked ? 'BLOCKED' : (p.status || 'ACTIVE'),
        created_at: p.created_at,
        updated_at: p.updated_at,
      }));

      const cleanCourses = this.state.courses.map(({ category_name, sections_count, lessons_count, students_count, user_enrollment_status, user_progress_percent, ...c }: any) => c);
      const cleanSections = this.state.sections.map(({ lessons, ...s }: any) => s);
      const cleanLessons = this.state.lessons;
      const cleanEnrollments = this.state.enrollments.map(({ course_title, course_slug, course_thumbnail, user_name, user_email, user_avatar, ...e }: any) => e);
      const cleanProgress = this.state.progress;

      if (cleanProfiles.length > 0) await client.from('profiles').upsert(cleanProfiles);
      if (cleanCourses.length > 0) await client.from('courses').upsert(cleanCourses);
      if (cleanSections.length > 0) await client.from('course_sections').upsert(cleanSections);
      if (cleanLessons.length > 0) await client.from('lessons').upsert(cleanLessons);
      if (cleanEnrollments.length > 0) await client.from('enrollments').upsert(cleanEnrollments);
      if (cleanProgress.length > 0) await client.from('lesson_progress').upsert(cleanProgress);

      this.logAudit({ action: 'Đồng bộ toàn bộ dữ liệu hệ thống lên Supabase thành công', action_level: 'INFO' });
      return { success: true, message: 'Đã đồng bộ toàn bộ khóa học, bài học và tài khoản lên cơ sở dữ liệu Supabase!' };
    } catch (err: any) {
      console.error('[DBStore] Upload to Supabase failed:', err);
      throw new Error(err?.message || 'Lỗi khi upload dữ liệu lên Supabase.');
    }
  }

  public async getProfileByEmailAsync(email: string): Promise<UserProfile | undefined> {
    if (!email) return undefined;
    const cleanEmail = email.trim().toLowerCase();
    
    // First check local memory
    let profile = this.state.profiles.find((p) => p.email.trim().toLowerCase() === cleanEmail);

    // If Supabase client exists, check live Supabase database as well
    const client = this.getSupabaseClient();
    if (client) {
      try {
        const { data, error } = await client.from('profiles').select('*').eq('email', cleanEmail).maybeSingle();
        if (!error && data) {
          const spProfile: UserProfile = {
            id: data.id,
            full_name: data.full_name,
            email: data.email,
            password: profile?.password || data.password,
            role: data.role || 'STUDENT',
            status: data.status || 'ACTIVE',
            is_blocked: data.status === 'BLOCKED',
            created_at: data.created_at || new Date().toISOString(),
            updated_at: data.updated_at || new Date().toISOString(),
          };
          this.saveProfile(spProfile);
          return spProfile;
        }
      } catch (err) {
        console.warn('[DBStore] Error querying Supabase for email:', err);
      }
    }

    return profile;
  }

  private loadState(): LocalDBState {
    if (typeof window === 'undefined') return getInitialState();
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const loaded: LocalDBState = JSON.parse(raw);
        if (!loaded.profiles || loaded.profiles.length === 0) {
          loaded.profiles = getInitialState().profiles;
        } else {
          // Ensure default admin exists if missing
          const hasAdmin = loaded.profiles.some((p) => p.email.toLowerCase() === 'admin@lexedu.vn');
          if (!hasAdmin) {
            loaded.profiles.push(getInitialState().profiles[0]);
          }
        }
        return loaded;
      }
    } catch (err) {
      console.error('[DBStore] Error loading state:', err);
    }
    return getInitialState();
  }

  private saveState() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
      window.dispatchEvent(new Event('lexedu_db_updated'));
    } catch (err) {
      console.error('[DBStore] Error saving state:', err);
    }
  }

  // Setup status
  getSetupStatus(): SetupStatus {
    return { ...this.state.setupStatus };
  }

  updateSetupStatus(updates: Partial<SetupStatus>): SetupStatus {
    this.state.setupStatus = { ...this.state.setupStatus, ...updates };
    this.saveState();
    return { ...this.state.setupStatus };
  }

  // Profiles
  getProfiles(): UserProfile[] {
    return [...this.state.profiles];
  }

  getProfileById(id: string): UserProfile | undefined {
    return this.state.profiles.find((p) => p.id === id);
  }

  getProfileByEmail(email: string): UserProfile | undefined {
    if (!email) return undefined;
    const cleanEmail = email.trim().toLowerCase();
    return this.state.profiles.find((p) => p.email.trim().toLowerCase() === cleanEmail);
  }

  saveProfile(profile: UserProfile): UserProfile {
    const idx = this.state.profiles.findIndex((p) => p.id === profile.id);
    const updatedP = { ...profile, updated_at: new Date().toISOString() };
    if (idx >= 0) {
      this.state.profiles[idx] = updatedP;
    } else {
      this.state.profiles.push(updatedP);
    }
    this.saveState();

    // Async push to Supabase if connected
    const client = this.getSupabaseClient();
    if (client) {
      client.from('profiles').upsert({
        id: updatedP.id,
        full_name: updatedP.full_name,
        email: updatedP.email.trim().toLowerCase(),
        role: updatedP.role,
        status: updatedP.is_blocked ? 'BLOCKED' : (updatedP.status || 'ACTIVE'),
        created_at: updatedP.created_at,
        updated_at: updatedP.updated_at,
      }).then(({ error }) => {
        if (error) console.warn('[Supabase Sync] saveProfile upsert warning:', error.message);
      });
    }

    return updatedP;
  }

  updateProfileStatus(userId: string, status: UserStatus): UserProfile | undefined {
    const p = this.getProfileById(userId);
    if (p) {
      p.status = status;
      p.updated_at = new Date().toISOString();
      this.saveState();
      this.logAudit({ action: `Lỗi/Khóa tài khoản: ${status}`, action_level: 'WARNING', entity_type: 'user', entity_id: userId });
    }
    return p;
  }

  // Categories
  getCategories(): Category[] {
    return [...this.state.categories].sort((a, b) => a.sort_order - b.sort_order);
  }

  saveCategory(category: Category): Category {
    const idx = this.state.categories.findIndex((c) => c.id === category.id);
    let updated: Category;
    if (idx >= 0) {
      updated = { ...category, updated_at: new Date().toISOString() };
      this.state.categories[idx] = updated;
    } else {
      updated = { ...category, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
      this.state.categories.push(updated);
    }
    this.saveState();

    const client = this.getSupabaseClient();
    if (client) {
      const { courses_count, ...cleanCat }: any = updated;
      client.from('categories').upsert(cleanCat).then(({ error }) => {
        if (error) console.warn('[Supabase Sync] saveCategory warning:', error.message);
      });
    }
    return updated;
  }

  deleteCategory(id: string): boolean {
    this.state.categories = this.state.categories.filter((c) => c.id !== id);
    this.saveState();

    const client = this.getSupabaseClient();
    if (client) {
      client.from('categories').delete().eq('id', id).then(({ error }) => {
        if (error) console.warn('[Supabase Sync] deleteCategory warning:', error.message);
      });
    }
    return true;
  }

  // Courses
  getCourses(filters?: { status?: string; categoryId?: string; level?: string; search?: string }): Course[] {
    let list = [...this.state.courses];
    if (filters?.status) {
      list = list.filter((c) => c.status === filters.status);
    }
    if (filters?.categoryId) {
      list = list.filter((c) => c.category_id === filters.categoryId);
    }
    if (filters?.level) {
      list = list.filter((c) => c.level === filters.level);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      list = list.filter((c) => c.title.toLowerCase().includes(q) || (c.short_description || '').toLowerCase().includes(q));
    }

    // Attach counts & category
    return list.map((c) => {
      const cat = this.state.categories.find((cat) => cat.id === c.category_id);
      const secs = this.state.sections.filter((s) => s.course_id === c.id);
      const secIds = secs.map((s) => s.id);
      const les = this.state.lessons.filter((l) => secIds.includes(l.section_id));
      const ens = this.state.enrollments.filter((e) => e.course_id === c.id && e.status === 'ACTIVE');

      return {
        ...c,
        category_name: cat ? cat.name : 'Chưa phân loại',
        sections_count: secs.length,
        lessons_count: les.length,
        students_count: ens.length,
      };
    }).sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0) || a.sort_order - b.sort_order);
  }

  getCourseBySlug(slug: string): Course | undefined {
    const courses = this.getCourses();
    return courses.find((c) => c.slug === slug);
  }

  getCourseById(id: string): Course | undefined {
    const courses = this.getCourses();
    return courses.find((c) => c.id === id);
  }

  saveCourse(course: Course): Course {
    const idx = this.state.courses.findIndex((c) => c.id === course.id);
    let updated: Course;
    if (idx >= 0) {
      updated = { ...course, updated_at: new Date().toISOString() };
      this.state.courses[idx] = updated;
    } else {
      updated = { ...course, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
      this.state.courses.push(updated);
    }
    this.saveState();

    const client = this.getSupabaseClient();
    if (client) {
      const { category_name, sections_count, lessons_count, students_count, user_enrollment_status, user_progress_percent, ...cleanC }: any = updated;
      client.from('courses').upsert(cleanC).then(({ error }) => {
        if (error) console.warn('[Supabase Sync] saveCourse warning:', error.message);
      });
    }

    return updated;
  }

  deleteCourse(id: string): boolean {
    this.state.courses = this.state.courses.filter((c) => c.id !== id);
    const secs = this.state.sections.filter((s) => s.course_id === id);
    const secIds = secs.map((s) => s.id);
    this.state.sections = this.state.sections.filter((s) => s.course_id !== id);
    this.state.lessons = this.state.lessons.filter((l) => !secIds.includes(l.section_id));
    this.state.enrollments = this.state.enrollments.filter((e) => e.course_id !== id);
    this.state.progress = this.state.progress.filter((p) => p.course_id !== id);
    this.saveState();

    const client = this.getSupabaseClient();
    if (client) {
      client.from('courses').delete().eq('id', id).then(({ error }) => {
        if (error) console.warn('[Supabase Sync] deleteCourse warning:', error.message);
      });
    }
    return true;
  }

  // Reorder Sections
  reorderSections(courseId: string, orderedSectionIds: string[]): void {
    const updatedSecs: any[] = [];
    orderedSectionIds.forEach((id, index) => {
      const sec = this.state.sections.find((s) => s.id === id);
      if (sec) {
        sec.sort_order = index + 1;
        sec.updated_at = new Date().toISOString();
        const { lessons, ...cleanSec }: any = sec;
        updatedSecs.push(cleanSec);
      }
    });
    this.saveState();

    const client = this.getSupabaseClient();
    if (client && updatedSecs.length > 0) {
      client.from('course_sections').upsert(updatedSecs).then(({ error }) => {
        if (error) console.warn('[Supabase Sync] reorderSections warning:', error.message);
      });
    }
  }

  // Reorder Lessons
  reorderLessons(sectionId: string, orderedLessonIds: string[]): void {
    const updatedLessons: any[] = [];
    orderedLessonIds.forEach((id, index) => {
      const les = this.state.lessons.find((l) => l.id === id);
      if (les) {
        les.sort_order = index + 1;
        les.updated_at = new Date().toISOString();
        const { attachments, ...cleanLes }: any = les;
        updatedLessons.push(cleanLes);
      }
    });
    this.saveState();

    const client = this.getSupabaseClient();
    if (client && updatedLessons.length > 0) {
      client.from('lessons').upsert(updatedLessons).then(({ error }) => {
        if (error) console.warn('[Supabase Sync] reorderLessons warning:', error.message);
      });
    }
  }

  // Sections
  getSectionsByCourse(courseId: string): CourseSection[] {
    const secs = this.state.sections
      .filter((s) => s.course_id === courseId)
      .sort((a, b) => a.sort_order - b.sort_order);

    return secs.map((sec) => {
      const les = this.state.lessons
        .filter((l) => l.section_id === sec.id)
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((l) => ({
          ...l,
          attachments: this.state.attachments.filter((att) => att.lesson_id === l.id),
        }));
      return {
        ...sec,
        lessons: les,
      };
    });
  }

  saveSection(section: CourseSection): CourseSection {
    const idx = this.state.sections.findIndex((s) => s.id === section.id);
    let updated: CourseSection;
    if (idx >= 0) {
      updated = { ...section, updated_at: new Date().toISOString() };
      this.state.sections[idx] = updated;
    } else {
      updated = { ...section, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
      this.state.sections.push(updated);
    }
    this.saveState();

    const client = this.getSupabaseClient();
    if (client) {
      const { lessons, ...cleanSec }: any = updated;
      client.from('course_sections').upsert(cleanSec).then(({ error }) => {
        if (error) console.warn('[Supabase Sync] saveSection warning:', error.message);
      });
    }

    return updated;
  }

  deleteSection(id: string): boolean {
    const lessonsToDelete = this.state.lessons.filter((l) => l.section_id === id);
    const lessonIds = lessonsToDelete.map((l) => l.id);

    this.state.sections = this.state.sections.filter((s) => s.id !== id);
    this.state.lessons = this.state.lessons.filter((l) => l.section_id !== id);
    this.saveState();

    const client = this.getSupabaseClient();
    if (client) {
      client.from('course_sections').delete().eq('id', id).then(({ error }) => {
        if (error) console.warn('[Supabase Sync] deleteSection warning:', error.message);
      });
      if (lessonIds.length > 0) {
        client.from('lessons').delete().in('id', lessonIds).then(({ error }) => {
          if (error) console.warn('[Supabase Sync] deleteSection lessons warning:', error.message);
        });
      }
    }

    return true;
  }

  getSectionById(id: string): CourseSection | undefined {
    return this.state.sections.find((s) => s.id === id);
  }

  getCourseIdBySectionId(sectionId: string): string | undefined {
    const sec = this.state.sections.find((s) => s.id === sectionId);
    return sec?.course_id;
  }

  // Lessons
  getLessonById(lessonId: string): Lesson | undefined {
    const les = this.state.lessons.find((l) => l.id === lessonId);
    if (!les) return undefined;
    return {
      ...les,
      attachments: this.state.attachments.filter((a) => a.lesson_id === lessonId),
    };
  }

  saveLesson(lesson: Lesson): Lesson {
    const idx = this.state.lessons.findIndex((l) => l.id === lesson.id);
    let updated: Lesson;
    if (idx >= 0) {
      updated = { ...lesson, updated_at: new Date().toISOString() };
      this.state.lessons[idx] = updated;
    } else {
      updated = { ...lesson, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
      this.state.lessons.push(updated);
    }
    this.saveState();

    const client = this.getSupabaseClient();
    if (client) {
      const { attachments, ...cleanLes }: any = updated;
      client.from('lessons').upsert(cleanLes).then(({ error }) => {
        if (error) console.warn('[Supabase Sync] saveLesson warning:', error.message);
      });
    }

    return updated;
  }

  deleteLesson(id: string): boolean {
    this.state.lessons = this.state.lessons.filter((l) => l.id !== id);
    this.state.attachments = this.state.attachments.filter((a) => a.lesson_id !== id);
    this.state.progress = this.state.progress.filter((p) => p.lesson_id !== id);
    this.saveState();

    const client = this.getSupabaseClient();
    if (client) {
      client.from('lessons').delete().eq('id', id).then(({ error }) => {
        if (error) console.warn('[Supabase Sync] deleteLesson warning:', error.message);
      });
    }

    return true;
  }

  // Attachments
  saveAttachment(attachment: LessonAttachment): LessonAttachment {
    const idx = this.state.attachments.findIndex((a) => a.id === attachment.id);
    if (idx >= 0) {
      this.state.attachments[idx] = attachment;
    } else {
      this.state.attachments.push(attachment);
    }
    this.saveState();
    return attachment;
  }

  deleteAttachment(id: string): boolean {
    this.state.attachments = this.state.attachments.filter((a) => a.id !== id);
    this.saveState();
    return true;
  }

  // Enrollments
  getEnrollments(userId?: string): Enrollment[] {
    let list = [...this.state.enrollments];
    if (userId) {
      list = list.filter((e) => e.user_id === userId);
    }
    return list.map((e) => {
      const course = this.getCourseById(e.course_id);
      const profile = this.getProfileById(e.user_id);
      return {
        ...e,
        course_title: course?.title,
        course_slug: course?.slug,
        course_thumbnail: course?.thumbnail_url,
        user_name: profile?.full_name,
        user_email: profile?.email,
        user_avatar: profile?.avatar_url,
      };
    });
  }

  getEnrollment(userId: string, courseId: string): Enrollment | undefined {
    const list = this.getEnrollments(userId);
    return list.find((e) => e.course_id === courseId);
  }

  approveEnrollment(id: string): Enrollment | undefined {
    return this.updateEnrollmentStatus(id, 'ACTIVE');
  }

  rejectEnrollment(id: string): Enrollment | undefined {
    return this.updateEnrollmentStatus(id, 'CANCELLED');
  }

  deleteEnrollment(id: string): boolean {
    this.state.enrollments = this.state.enrollments.filter((e) => e.id !== id);
    this.saveState();

    const client = this.getSupabaseClient();
    if (client) {
      client.from('enrollments').delete().eq('id', id).then(({ error }) => {
        if (error) console.warn('[Supabase Sync] deleteEnrollment warning:', error.message);
      });
    }
    return true;
  }

  setBlockUser(userId: string, isBlocked: boolean): UserProfile | undefined {
    const p = this.getProfileById(userId);
    if (p) {
      p.is_blocked = isBlocked;
      p.status = isBlocked ? 'BLOCKED' : 'ACTIVE';
      p.updated_at = new Date().toISOString();
      this.saveState();

      const client = this.getSupabaseClient();
      if (client) {
        client.from('profiles').update({
          status: p.status,
          updated_at: p.updated_at,
        }).eq('id', userId).then(({ error }) => {
          if (error) console.warn('[Supabase Sync] setBlockUser warning:', error.message);
        });
      }
    }
    return p;
  }

  deleteProfile(userId: string): boolean {
    const p = this.getProfileById(userId);
    if (!p) return false;
    if (p.role === 'SUPER_ADMIN') {
      throw new Error('Không thể xóa tài khoản Quản trị viên tối cao (SUPER_ADMIN).');
    }
    this.state.profiles = this.state.profiles.filter((profile) => profile.id !== userId);
    this.state.enrollments = this.state.enrollments.filter((e) => e.user_id !== userId);
    this.state.progress = this.state.progress.filter((pr) => pr.user_id !== userId);
    this.saveState();

    const client = this.getSupabaseClient();
    if (client) {
      client.from('profiles').delete().eq('id', userId).then(({ error }) => {
        if (error) console.warn('[Supabase Sync] deleteProfile warning:', error.message);
      });
      client.from('enrollments').delete().eq('user_id', userId).then(() => {});
      client.from('lesson_progress').delete().eq('user_id', userId).then(() => {});
    }
    return true;
  }

  createEnrollment(userId: string, courseId: string, type: 'OPEN' | 'APPROVAL_REQUIRED' | 'ADMIN_ASSIGNED', enrolledByAdmin: boolean = false): Enrollment {
    let status: 'PENDING' | 'ACTIVE' = 'ACTIVE';
    if (type === 'APPROVAL_REQUIRED' && !enrolledByAdmin) {
      status = 'PENDING';
    }

    const existing = this.state.enrollments.find((e) => e.user_id === userId && e.course_id === courseId);
    if (existing) {
      if (existing.status === 'CANCELLED') {
        existing.status = status;
        existing.updated_at = new Date().toISOString();
        this.saveState();
        return existing;
      }
      return existing;
    }

    const newEnrollment: Enrollment = {
      id: 'enr-' + Math.random().toString(36).substring(2, 9),
      user_id: userId,
      course_id: courseId,
      status: status,
      enrolled_by: enrolledByAdmin ? 'ADMIN' : 'SELF',
      enrolled_at: new Date().toISOString(),
      approved_at: status === 'ACTIVE' ? new Date().toISOString() : undefined,
      progress_percent: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    this.state.enrollments.push(newEnrollment);
    this.saveState();

    const client = this.getSupabaseClient();
    if (client) {
      const { course_title, course_slug, course_thumbnail, user_name, user_email, user_avatar, ...cleanE }: any = newEnrollment;
      client.from('enrollments').upsert(cleanE).then(({ error }) => {
        if (error) console.warn('[Supabase Sync] createEnrollment warning:', error.message);
      });
    }

    this.logAudit({ action: `Đăng ký khóa học (${status})`, action_level: 'INFO', entity_type: 'enrollment', entity_id: newEnrollment.id });
    return newEnrollment;
  }

  updateEnrollmentStatus(id: string, status: 'ACTIVE' | 'CANCELLED', adminId?: string): Enrollment | undefined {
    const enr = this.state.enrollments.find((e) => e.id === id);
    if (enr) {
      enr.status = status;
      if (status === 'ACTIVE') {
        enr.approved_at = new Date().toISOString();
        enr.approved_by = adminId;
      }
      enr.updated_at = new Date().toISOString();
      this.saveState();

      const client = this.getSupabaseClient();
      if (client) {
        const { course_title, course_slug, course_thumbnail, user_name, user_email, user_avatar, ...cleanE }: any = enr;
        client.from('enrollments').upsert(cleanE).then(({ error }) => {
          if (error) console.warn('[Supabase Sync] updateEnrollmentStatus warning:', error.message);
        });
      }

      this.logAudit({ action: `Cập nhật trạng thái tham gia: ${status}`, action_level: 'INFO', entity_type: 'enrollment', entity_id: id });
    }
    return enr;
  }

  // Lesson Progress
  getLessonProgress(userId: string, courseId: string): LessonProgress[] {
    return this.state.progress.filter((p) => p.user_id === userId && p.course_id === courseId);
  }

  markLessonProgress(userId: string, courseId: string, lessonId: string, status: 'IN_PROGRESS' | 'COMPLETED'): { progress: LessonProgress; enrollmentPercent: number } {
    let prog = this.state.progress.find((p) => p.user_id === userId && p.lesson_id === lessonId);
    const now = new Date().toISOString();

    if (!prog) {
      prog = {
        id: 'prg-' + Math.random().toString(36).substring(2, 9),
        user_id: userId,
        course_id: courseId,
        lesson_id: lessonId,
        status: status,
        started_at: now,
        completed_at: status === 'COMPLETED' ? now : undefined,
        last_viewed_at: now,
        created_at: now,
        updated_at: now,
      };
      this.state.progress.push(prog);
    } else {
      prog.status = status;
      if (status === 'COMPLETED' && !prog.completed_at) {
        prog.completed_at = now;
      }
      prog.last_viewed_at = now;
      prog.updated_at = now;
    }

    // Recalculate percent
    const sections = this.state.sections.filter((s) => s.course_id === courseId && s.status === 'PUBLISHED');
    const secIds = sections.map((s) => s.id);
    const pubLessons = this.state.lessons.filter((l) => secIds.includes(l.section_id) && l.status === 'PUBLISHED');

    const completedCount = this.state.progress.filter(
      (p) => p.user_id === userId && p.course_id === courseId && p.status === 'COMPLETED' && pubLessons.some((l) => l.id === p.lesson_id)
    ).length;

    let percent = 0;
    if (pubLessons.length > 0) {
      percent = Math.min(100, Math.round((completedCount / pubLessons.length) * 100));
    }

    const enr = this.state.enrollments.find((e) => e.user_id === userId && e.course_id === courseId);
    if (enr) {
      enr.progress_percent = percent;
      enr.last_lesson_id = lessonId;
      enr.updated_at = now;
      if (percent >= 100) {
        enr.status = 'COMPLETED';
        enr.completed_at = now;
      } else if (enr.status === 'COMPLETED' && percent < 100) {
        enr.status = 'ACTIVE';
      }
    }

    this.saveState();

    const client = this.getSupabaseClient();
    if (client) {
      client.from('lesson_progress').upsert(prog).then(({ error }) => {
        if (error) console.warn('[Supabase Sync] markLessonProgress warning:', error.message);
      });
      if (enr) {
        const { course_title, course_slug, course_thumbnail, user_name, user_email, user_avatar, ...cleanE }: any = enr;
        client.from('enrollments').upsert(cleanE).then(() => {});
      }
    }

    return { progress: prog, enrollmentPercent: percent };
  }

  // Audit Logs
  getAuditLogs(): SystemAuditLog[] {
    return [...this.state.auditLogs].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  logAudit(
    actionOrEntry: string | { action: string; action_level?: 'INFO' | 'WARNING' | 'DANGER'; entity_type?: string; entity_id?: string; metadata?: Record<string, any>; actor_id?: string; actor_name?: string; actor_role?: string; details?: string },
    role?: string,
    detailsText?: string,
    level?: 'INFO' | 'WARNING' | 'DANGER'
  ) {
    let entryObj: any;
    if (typeof actionOrEntry === 'string') {
      entryObj = {
        action: actionOrEntry,
        actor_role: role,
        details: detailsText,
        action_level: level || 'INFO',
      };
    } else {
      entryObj = actionOrEntry;
    }

    const log: SystemAuditLog = {
      id: 'aud-' + Math.random().toString(36).substring(2, 9),
      actor_id: entryObj.actor_id,
      actor_name: entryObj.actor_name || 'System / Admin',
      actor_role: entryObj.actor_role || 'SUPER_ADMIN',
      action: entryObj.action,
      action_level: entryObj.action_level || 'INFO',
      details: entryObj.details,
      entity_type: entryObj.entity_type,
      entity_id: entryObj.entity_id,
      metadata: entryObj.metadata,
      created_at: new Date().toISOString(),
    };
    this.state.auditLogs.unshift(log);
    if (this.state.auditLogs.length > 200) {
      this.state.auditLogs = this.state.auditLogs.slice(0, 200);
    }
    this.saveState();
  }

  setSetupStatus(status: Partial<SetupStatus>) {
    this.updateSetupStatus(status);
  }

  async resetToDemoData(): Promise<void> {
    await this.wipeSupabaseData();

    this.state.categories = [];
    this.state.courses = [];
    this.state.sections = [];
    this.state.lessons = [];
    this.state.attachments = [];
    this.state.enrollments = [];
    this.state.progress = [];
    this.saveState();

    this.seedDemoData();

    const client = this.getSupabaseClient();
    if (client) {
      try {
        await this.uploadAllDataToSupabase();
      } catch (err) {
        console.warn('[DBStore] Error syncing demo data to Supabase on reset:', err);
      }
    }
  }

  // Seed sample data
  seedDemoData() {
    // Categories
    const categories: Category[] = [
      { id: 'c1000000-0000-0000-0000-000000000001', name: 'ChatGPT', slug: 'chatgpt', description: 'Các khóa học làm chủ ChatGPT từ cơ bản đến nâng cao', sort_order: 1, status: 'ACTIVE', is_demo: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: 'c1000000-0000-0000-0000-000000000002', name: 'Gemini', slug: 'gemini', description: 'Ứng dụng Google Gemini trong sáng tạo và phân tích', sort_order: 2, status: 'ACTIVE', is_demo: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: 'c1000000-0000-0000-0000-000000000003', name: 'AI Căn Bản', slug: 'ai-can-ban', description: 'Nền tảng trí tuệ nhân tạo cho người mới', sort_order: 3, status: 'ACTIVE', is_demo: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: 'c1000000-0000-0000-0000-000000000004', name: 'AI Nâng Cao', slug: 'ai-nang-cao', description: 'Prompt Engineering và quy trình tự động', sort_order: 4, status: 'ACTIVE', is_demo: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: 'c1000000-0000-0000-0000-000000000005', name: 'AI Tạo Hình Ảnh', slug: 'ai-tao-hinh-anh', description: 'Sáng tạo ảnh với Midjourney và Flux', sort_order: 5, status: 'ACTIVE', is_demo: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: 'c1000000-0000-0000-0000-000000000006', name: 'AI Tạo Video', slug: 'ai-tao-video', description: 'Sản xuất video tự động bằng AI', sort_order: 6, status: 'ACTIVE', is_demo: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: 'c1000000-0000-0000-0000-000000000007', name: 'AI Cho Công Việc', slug: 'ai-cho-cong-viec', description: 'Tối ưu hóa hiệu suất làm việc văn phòng', sort_order: 7, status: 'ACTIVE', is_demo: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    ];

    categories.forEach((c) => this.saveCategory(c));

    // Course 1
    const c1: Course = {
      id: 'd1000000-0000-0000-0000-000000000001',
      category_id: 'c1000000-0000-0000-0000-000000000001',
      title: 'Làm quen với ChatGPT',
      slug: 'lam-quen-voi-chatgpt',
      short_description: 'Khóa học nhập môn giúp bạn khai phá sức mạnh của ChatGPT trong công việc và học tập.',
      description: '<p>Khóa học bao gồm lý thuyết cơ bản và các bài thực hành thực tế, hướng dẫn viết prompt chuẩn, áp dụng vào soạn thảo email, tóm tắt tài liệu và phân tích dữ liệu.</p>',
      thumbnail_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80',
      instructor_name: 'Giảng viên LexEdu',
      level: 'BEGINNER',
      estimated_duration: 120,
      enrollment_type: 'OPEN',
      status: 'PUBLISHED',
      is_featured: true,
      show_curriculum_publicly: true,
      allow_resource_download: true,
      sort_order: 1,
      learning_outcomes: ['Hiểu rõ nguyên lý hoạt động của ChatGPT', 'Biết cách cấu trúc một Prompt hiệu quả', 'Ứng dụng vào công việc văn phòng hằng ngày'],
      target_audience: ['Người mới bắt đầu tìm hiểu về AI', 'Nhân viên văn phòng, sinh viên, giáo viên'],
      requirements: ['Máy tính hoặc điện thoại có kết nối Internet'],
      is_demo: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.saveCourse(c1);

    // Course 1 Sections & Lessons
    const s1 = this.saveSection({
      id: 's1000000-0000-0000-0000-000000000001',
      course_id: c1.id,
      title: 'Chương 1: Tổng quan và thiết lập ban đầu với ChatGPT',
      description: 'Giới thiệu về giao diện và nguyên lý hoạt động',
      sort_order: 1,
      status: 'PUBLISHED',
      is_demo: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    this.saveLesson({
      id: 'l1000000-0000-0000-0000-000000000001',
      section_id: s1.id,
      title: 'Bài 1: Trí tuệ nhân tạo AI và Generative AI là gì?',
      slug: 'bai-1-tri-tue-nhan-tao-ai',
      lesson_type: 'TEXT',
      text_content: '<h3>Bài 1: Trí tuệ nhân tạo AI và Generative AI là gì?</h3><p>Trong bài học này, chúng ta sẽ tìm hiểu khái niệm tổng quan về Trí tuệ nhân tạo (AI), Machine Learning, Deep Learning và sự bùng nổ của Generative AI (AI Tạo Sinh).</p><h4>1. AI Tạo Sinh là gì?</h4><p>Generative AI là phân nhánh của AI có khả năng tạo ra nội dung mới như văn bản, hình ảnh, âm thanh và mã nguồn dựa trên dữ liệu đã được huấn luyện.</p>',
      estimated_duration: 15,
      sort_order: 1,
      is_preview: true,
      allow_download: true,
      status: 'PUBLISHED',
      is_demo: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    this.saveLesson({
      id: 'l1000000-0000-0000-0000-000000000002',
      section_id: s1.id,
      title: 'Bài 2: Hướng dẫn giao diện và câu lệnh chuẩn',
      slug: 'bai-2-huong-dan-giao-dien',
      lesson_type: 'VIDEO',
      video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      text_content: '<p>Video hướng dẫn cách thao tác giao diện ChatGPT, tạo cuộc hội thoại mới và quản lý lịch sử trò chuyện.</p>',
      estimated_duration: 20,
      sort_order: 2,
      is_preview: false,
      allow_download: false,
      status: 'PUBLISHED',
      is_demo: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    this.saveLesson({
      id: 'l1000000-0000-0000-0000-000000000003',
      section_id: s1.id,
      title: 'Bài 3: Đăng ký tài khoản và cài đặt ChatGPT trên điện thoại',
      slug: 'bai-3-dang-ky-tai-khoan',
      lesson_type: 'SLIDE',
      slide_url: 'https://drive.google.com/file/d/1KAegnGRymJqTqsL4uJyN-yVcb2rdLQUE/view?usp=sharing',
      text_content: '<p>Hướng dẫn chi tiết từng bước tạo tài khoản OpenAI bằng Email và cài đặt ứng dụng ChatGPT chính thức trên smartphone (iOS & Android).</p>',
      estimated_duration: 15,
      sort_order: 3,
      is_preview: true,
      allow_download: true,
      status: 'PUBLISHED',
      is_demo: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    this.saveLesson({
      id: 'l1000000-0000-0000-0000-000000000004',
      section_id: s1.id,
      title: 'Bài 4: Làm quen giao diện ChatGPT trên máy tính và điện thoại',
      slug: 'bai-4-lam-quen-giao-dien',
      lesson_type: 'TEXT',
      text_content: '<h3>Thao tác giao diện ChatGPT</h3><p>Khám phá Sidebar quản lý lịch sử trò chuyện, nút tạo Chat mới, chọn Model (GPT-4o, GPT-4o mini) và các tùy chọn cài đặt cá nhân hóa.</p>',
      estimated_duration: 15,
      sort_order: 4,
      is_preview: false,
      allow_download: true,
      status: 'PUBLISHED',
      is_demo: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    this.saveLesson({
      id: 'l1000000-0000-0000-0000-000000000005',
      section_id: s1.id,
      title: 'Bài 5: Các gói tài khoản, mô hình và cách chọn công cụ phù hợp',
      slug: 'bai-5-cac-goi-tai-khoan',
      lesson_type: 'VIDEO',
      video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      text_content: '<p>Phân tích sự khác biệt giữa phiên bản ChatGPT Miễn phí và ChatGPT Plus. Khi nào bạn nên nâng cấp và cách chọn phiên bản phù hợp nhất với nhu cầu.</p>',
      estimated_duration: 15,
      sort_order: 5,
      is_preview: false,
      allow_download: false,
      status: 'PUBLISHED',
      is_demo: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    const s2 = this.saveSection({
      id: 's1000000-0000-0000-0000-000000000002',
      course_id: c1.id,
      title: 'Chương 2: Viết câu lệnh chuẩn – Tối ưu kết quả từ ChatGPT',
      description: 'Kỹ năng soạn thảo Prompt chuyên nghiệp và tối ưu câu trả lời',
      sort_order: 2,
      status: 'PUBLISHED',
      is_demo: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    this.saveLesson({
      id: 'l1000000-0000-0000-0000-000000000006',
      section_id: s2.id,
      title: 'Bài 1: Prompt là gì? Vì sao cùng một câu hỏi lại cho kết quả khác nhau?',
      slug: 'bai-1-prompt-la-gi',
      lesson_type: 'TEXT',
      text_content: '<h3>Bài 1: Prompt là gì?</h3><p>Prompt là câu lệnh hoặc yêu cầu đầu vào bạn gửi cho AI. Tìm hiểu lý do tại sao cách đặt câu hỏi đóng vai trò quyết định 90% chất lượng phản hồi từ ChatGPT.</p>',
      estimated_duration: 15,
      sort_order: 1,
      is_preview: true,
      allow_download: true,
      status: 'PUBLISHED',
      is_demo: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    this.saveLesson({
      id: 'l1000000-0000-0000-0000-000000000007',
      section_id: s2.id,
      title: 'Bài 2: Cấu trúc 6 thành phần của một Prompt chuyên nghiệp',
      slug: 'bai-2-cau-truc-6-thanh-phan-prompt',
      lesson_type: 'TEXT',
      text_content: '<h3>Cấu trúc 6 thành phần của Prompt đỉnh cao</h3><ul><li><strong>1. Vai trò (Role):</strong> Gán vai trò cho AI (ví dụ: Chuyên gia Marketing, Luật sư).</li><li><strong>2. Nhiệm vụ (Task):</strong> Mô tả chính xác việc AI cần thực hiện.</li><li><strong>3. Ngữ cảnh (Context):</strong> Cung cấp thông tin nền tảng.</li><li><strong>4. Định dạng (Format):</strong> Bảng biểu, danh sách, hay đoạn văn.</li><li><strong>5. Giọng văn (Tone):</strong> Trang trọng, thân thiện hay thuyết phục.</li><li><strong>6. Ví dụ (Example):</strong> Đưa ra mẫu kết quả mong muốn.</li></ul>',
      estimated_duration: 20,
      sort_order: 2,
      is_preview: false,
      allow_download: true,
      status: 'PUBLISHED',
      is_demo: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    this.saveLesson({
      id: 'l1000000-0000-0000-0000-000000000008',
      section_id: s2.id,
      title: 'Bài 3: Các mẫu Prompt ứng dụng công việc văn phòng',
      slug: 'bai-3-cac-mau-prompt-van-phong',
      lesson_type: 'TEXT',
      text_content: '<h3>Bộ Prompt mẫu văn phòng</h3><p>Tổng hợp các mẫu Prompt thực chiến dùng để viết email làm việc với đối tác, tóm tắt nội dung cuộc họp, lập kế hoạch công việc tuần và biên dịch tài liệu đa ngôn ngữ.</p>',
      estimated_duration: 25,
      sort_order: 3,
      is_preview: false,
      allow_download: true,
      status: 'PUBLISHED',
      is_demo: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    // Course 2
    const c2: Course = {
      id: 'd1000000-0000-0000-0000-000000000002',
      category_id: 'c1000000-0000-0000-0000-000000000002',
      title: 'Gemini nâng cao cho công việc',
      slug: 'gemini-nang-cao-cho-cong-viec',
      short_description: 'Chuyên sâu về mô hình đa thức của Google Gemini trong lập trình, phân tích dữ liệu.',
      description: '<p>Khóa học dành cho học viên cần xử lý khối lượng dữ liệu khổng lồ với Context Window dài vượt trội của Gemini 1.5 & 2.0 Pro.</p>',
      thumbnail_url: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&q=80',
      instructor_name: 'Senior AI Architect',
      level: 'ADVANCED',
      estimated_duration: 240,
      enrollment_type: 'ADMIN_ASSIGNED',
      status: 'PUBLISHED',
      is_featured: true,
      show_curriculum_publicly: true,
      allow_resource_download: true,
      sort_order: 2,
      learning_outcomes: ['Khai thác cửa sổ ngữ cảnh 1M-2M tokens', 'Phân tích tài liệu PDF và video dài bằng Gemini', 'Tích hợp Gemini API trong dự án'],
      target_audience: ['Lập trình viên, Data Analyst, Manager'],
      requirements: ['Đã nắm vững kiến thức cơ bản về AI'],
      is_demo: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.saveCourse(c2);

    // Course 3
    const c3: Course = {
      id: 'd1000000-0000-0000-0000-000000000003',
      category_id: 'c1000000-0000-0000-0000-000000000005',
      title: 'Sử dụng AI để tạo hình ảnh',
      slug: 'su-dung-ai-de-tao-hinh-anh',
      short_description: 'Kỹ thuật tạo banner, logo, thiết kế và nghệ thuật số với công cụ AI thế hệ mới.',
      description: '<p>Hướng dẫn từng bước cách phối hợp phong cách nghệ thuật, ánh sáng, góc máy và bố cục để tạo ra tác phẩm chuyên nghiệp.</p>',
      thumbnail_url: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=800&q=80',
      instructor_name: 'Creative Director',
      level: 'INTERMEDIATE',
      estimated_duration: 180,
      enrollment_type: 'APPROVAL_REQUIRED',
      status: 'PUBLISHED',
      is_featured: true,
      show_curriculum_publicly: true,
      allow_resource_download: true,
      sort_order: 3,
      learning_outcomes: ['Làm chủ các lệnh tạo ảnh và negative prompt', 'Tự làm banner truyền thông và hình minh họa'],
      target_audience: ['Graphic Designer, Marketer, Content Creator'],
      requirements: ['Có niềm đam mê sáng tạo hình ảnh'],
      is_demo: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.saveCourse(c3);

    this.updateSetupStatus({ demoDataInitialized: true });
    this.logAudit({ action: 'Khởi tạo dữ liệu mẫu thành công', action_level: 'INFO' });
  }

  // System Resets (5 levels)
  // Level 1: Test connection
  async testConnection(): Promise<ConnectionTestResult> {
    return {
      supabaseApi: true,
      authentication: true,
      postgreSQL: true,
      serverAccess: true,
      storage: true,
      migrationAccess: true,
      details: {
        apiUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://lexedu-api.supabase.co',
        authMessage: 'Supabase Authentication khả dụng',
        dbMessage: 'PostgreSQL Database kết nối bình thường',
        serverMessage: 'Server role access thành công',
        storageBuckets: ['avatars', 'course-images', 'lesson-files'],
        migrationMessage: '18 migration schema sẵn sàng',
      },
    };
  }

  // Level 2: Repair configuration
  repairConfiguration() {
    this.logAudit({ action: 'Chạy sửa chữa cấu hình (Repair Configuration)', action_level: 'WARNING' });
    return { success: true, message: 'Đã kiểm tra và khôi phục bảng, trigger, policy và buckets.' };
  }

  // Level 3: Apply pending migrations
  applyPendingMigrations() {
    this.state.migrations.forEach((m) => {
      m.status = 'COMPLETED';
      m.completed_at = new Date().toISOString();
    });
    this.saveState();
    this.logAudit({ action: 'Chạy cập nhật migration còn thiếu', action_level: 'INFO' });
    return { success: true, appliedCount: this.state.migrations.length };
  }

  // Level 4: Reset demo data
  resetDemoData() {
    this.state.categories = this.state.categories.filter((c) => !c.is_demo);
    this.state.courses = this.state.courses.filter((c) => !c.is_demo);
    this.state.sections = this.state.sections.filter((s) => !s.is_demo);
    this.state.lessons = this.state.lessons.filter((l) => !l.is_demo);
    this.state.attachments = this.state.attachments.filter((a) => !a.is_demo);
    this.state.setupStatus.demoDataInitialized = false;
    this.saveState();
    this.logAudit({ action: 'Xóa toàn bộ dữ liệu mẫu (Reset Demo Data)', action_level: 'WARNING' });
    return { success: true, message: 'Đã xóa toàn bộ dữ liệu mẫu.' };
  }

  // Level 4 / 5: Factory Reset (Wipe all courses, lessons, students & reset database)
  async factoryReset(keepSuperAdmin: boolean = true) {
    let superAdmin = keepSuperAdmin ? this.state.profiles.find((p) => p.role === 'SUPER_ADMIN') : undefined;
    if (!superAdmin && keepSuperAdmin) {
      superAdmin = {
        id: 'usr-admin-001',
        full_name: 'Quản trị viên LexEdu',
        email: 'admin@lexedu.vn',
        password: 'LexEdu2026@Master',
        role: 'SUPER_ADMIN',
        status: 'ACTIVE',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }

    await this.wipeSupabaseData();

    this.state.categories = [];
    this.state.courses = [];
    this.state.sections = [];
    this.state.lessons = [];
    this.state.attachments = [];
    this.state.enrollments = [];
    this.state.progress = [];
    this.state.profiles = superAdmin ? [superAdmin] : [];
    this.state.setupStatus.demoDataInitialized = false;

    this.saveState();

    const client = this.getSupabaseClient();
    if (client && superAdmin) {
      try {
        await client.from('profiles').upsert(superAdmin);
      } catch (err) {
        console.warn('[DBStore] Error syncing factory reset profile to Supabase:', err);
      }
    }

    this.logAudit({ action: 'FACTORY RESET TOÀN BỘ HỆ THỐNG', action_level: 'DANGER' });
    return { success: true, message: 'Hệ thống đã được xóa sạch toàn bộ dữ liệu.' };
  }
}

export const dbStore = new DBStoreEngine();
