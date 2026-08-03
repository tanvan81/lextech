// LEXEDU E-LEARNING PLATFORM - GLOBAL TYPES & ENUMS

export type UserRole = 'STUDENT' | 'ADMIN' | 'SUPER_ADMIN';
export type UserStatus = 'ACTIVE' | 'BLOCKED';
export type CategoryStatus = 'ACTIVE' | 'HIDDEN';
export type CourseLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
export type EnrollmentType = 'OPEN' | 'APPROVAL_REQUIRED' | 'ADMIN_ASSIGNED';
export type CourseStatus = 'DRAFT' | 'PUBLISHED' | 'HIDDEN' | 'ARCHIVED';
export type ContentStatus = 'DRAFT' | 'PUBLISHED' | 'HIDDEN';
export type LessonType = 'TEXT' | 'VIDEO' | 'SLIDE' | 'DOCUMENT';
export type EnrollmentStatus = 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
export type EnrolledBy = 'SELF' | 'ADMIN';
export type LessonProgressStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
export type MigrationStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
export type AuditActionLevel = 'INFO' | 'WARNING' | 'DANGER';

export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  password?: string;
  avatar_url?: string;
  role: UserRole;
  status: UserStatus;
  is_blocked?: boolean;
  last_login_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  sort_order: number;
  status: CategoryStatus;
  is_demo?: boolean;
  created_at: string;
  updated_at: string;
}

export interface Course {
  id: string;
  category_id: string;
  title: string;
  slug: string;
  short_description?: string;
  description?: string;
  thumbnail_url?: string;
  banner_url?: string;
  instructor_name: string;
  level: CourseLevel;
  estimated_duration: number; // in minutes
  enrollment_type: EnrollmentType;
  status: CourseStatus;
  is_featured: boolean;
  show_curriculum_publicly: boolean;
  allow_resource_download: boolean;
  sort_order: number;
  learning_outcomes: string[];
  target_audience: string[];
  requirements: string[];
  is_demo?: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;

  // Joined relations
  category_name?: string;
  sections_count?: number;
  lessons_count?: number;
  students_count?: number;
  user_enrollment_status?: EnrollmentStatus;
  user_progress_percent?: number;
}

export interface CourseSection {
  id: string;
  course_id: string;
  title: string;
  description?: string;
  sort_order: number;
  status: ContentStatus;
  is_demo?: boolean;
  created_at: string;
  updated_at: string;

  // Joined
  lessons?: Lesson[];
}

export interface Lesson {
  id: string;
  section_id: string;
  title: string;
  slug: string;
  lesson_type: LessonType;
  text_content?: string;
  video_url?: string;
  slide_url?: string;
  slide_file_url?: string;
  estimated_duration: number; // in minutes
  sort_order: number;
  is_preview: boolean;
  allow_download: boolean;
  status: ContentStatus;
  is_demo?: boolean;
  created_at: string;
  updated_at: string;

  // Joined
  attachments?: LessonAttachment[];
  user_progress_status?: LessonProgressStatus;
}

export interface LessonAttachment {
  id: string;
  lesson_id: string;
  file_name: string;
  file_url?: string;
  storage_path: string;
  file_type?: string;
  mime_type?: string;
  file_size?: number;
  is_demo?: boolean;
  created_at: string;
}

export interface Enrollment {
  id: string;
  user_id: string;
  course_id: string;
  status: EnrollmentStatus;
  enrolled_by: EnrolledBy;
  enrolled_at: string;
  approved_at?: string;
  approved_by?: string;
  completed_at?: string;
  last_lesson_id?: string;
  progress_percent: number;
  created_at: string;
  updated_at: string;

  // Joined fields
  course_title?: string;
  course_slug?: string;
  course_thumbnail?: string;
  user_name?: string;
  user_email?: string;
  user_avatar?: string;
}

export interface LessonProgress {
  id: string;
  user_id: string;
  course_id: string;
  lesson_id: string;
  status: LessonProgressStatus;
  started_at?: string;
  completed_at?: string;
  last_viewed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface SystemSetting {
  id: string;
  setting_key: string;
  setting_value: Record<string, any>;
  is_public: boolean;
  updated_by?: string;
  created_at: string;
  updated_at: string;
}

export interface SystemMigration {
  id: string;
  migration_version: string;
  migration_name: string;
  checksum?: string;
  status: MigrationStatus;
  started_at?: string;
  completed_at?: string;
  error_message?: string;
  executed_by?: string;
  created_at: string;
}

export interface SystemAuditLog {
  id: string;
  actor_id?: string;
  actor_name?: string;
  actor_email?: string;
  actor_role?: string;
  action: string;
  action_level: AuditActionLevel;
  details?: string;
  entity_type?: string;
  entity_id?: string;
  metadata?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export interface SetupStatus {
  installed: boolean;
  schemaVersion: string;
  setupVersion: string;
  installedAt?: string | null;
  deploymentMode: 'self-hosted' | 'vercel';
  demoDataInitialized: boolean;
}

export interface SetupConfigRequest {
  supabaseUrl: string;
  supabaseAnonKey: string;
  supabaseServiceKey?: string;
  databaseUrl?: string;
  appUrl: string;
  deploymentMode: 'self-hosted' | 'vercel';
  installationToken?: string;
}

export interface ConnectionTestResult {
  supabaseApi: boolean;
  authentication: boolean;
  postgreSQL: boolean;
  serverAccess: boolean;
  storage: boolean;
  migrationAccess: boolean;
  details: {
    apiUrl?: string;
    authMessage?: string;
    dbMessage?: string;
    serverMessage?: string;
    storageBuckets?: string[];
    migrationMessage?: string;
  };
  errors?: string[];
}

export interface SystemHealthStatus {
  status: 'ok' | 'degraded' | 'error';
  appVersion: string;
  schemaVersion: string;
  setupCompleted: boolean;
  databaseConnected: boolean;
  authAvailable: boolean;
  storageAvailable: boolean;
  deploymentMode: string;
  maintenanceMode: boolean;
  lastMigration?: string;
  lastHealthCheck: string;
}
