-- MIGRATION 013: CREATE INDEXES
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON public.profiles(status);

CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_status ON public.categories(status);

CREATE INDEX IF NOT EXISTS idx_courses_slug ON public.courses(slug);
CREATE INDEX IF NOT EXISTS idx_courses_status ON public.courses(status);
CREATE INDEX IF NOT EXISTS idx_courses_category_id ON public.courses(category_id);
CREATE INDEX IF NOT EXISTS idx_courses_enrollment_type ON public.courses(enrollment_type);
CREATE INDEX IF NOT EXISTS idx_courses_is_featured ON public.courses(is_featured);
CREATE INDEX IF NOT EXISTS idx_courses_created_at ON public.courses(created_at);

CREATE INDEX IF NOT EXISTS idx_sections_course_id ON public.course_sections(course_id);
CREATE INDEX IF NOT EXISTS idx_sections_status ON public.course_sections(status);
CREATE INDEX IF NOT EXISTS idx_sections_sort_order ON public.course_sections(sort_order);

CREATE INDEX IF NOT EXISTS idx_lessons_section_id ON public.lessons(section_id);
CREATE INDEX IF NOT EXISTS idx_lessons_status ON public.lessons(status);
CREATE INDEX IF NOT EXISTS idx_lessons_type ON public.lessons(lesson_type);
CREATE INDEX IF NOT EXISTS idx_lessons_sort_order ON public.lessons(sort_order);

CREATE INDEX IF NOT EXISTS idx_enrollments_user_id ON public.enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course_id ON public.enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_status ON public.enrollments(status);
CREATE INDEX IF NOT EXISTS idx_enrollments_created_at ON public.enrollments(created_at);

CREATE INDEX IF NOT EXISTS idx_progress_user_id ON public.lesson_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_course_id ON public.lesson_progress(course_id);
CREATE INDEX IF NOT EXISTS idx_progress_lesson_id ON public.lesson_progress(lesson_id);
CREATE INDEX IF NOT EXISTS idx_progress_status ON public.lesson_progress(status);

CREATE INDEX IF NOT EXISTS idx_settings_key ON public.system_settings(setting_key);
CREATE INDEX IF NOT EXISTS idx_migrations_version ON public.system_migrations(migration_version);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON public.system_audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.system_audit_logs(created_at);
