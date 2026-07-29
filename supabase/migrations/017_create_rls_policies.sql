-- MIGRATION 017: CREATE RLS POLICIES

-- Helper functions
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('ADMIN', 'SUPER_ADMIN') AND status = 'ACTIVE'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'SUPER_ADMIN' AND status = 'ACTIVE'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles Policies
DROP POLICY IF EXISTS "Public profiles read for active users" ON public.profiles;
CREATE POLICY "Public profiles read for active users" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Categories Policies
DROP POLICY IF EXISTS "Public can view active categories" ON public.categories;
CREATE POLICY "Public can view active categories" ON public.categories FOR SELECT USING (status = 'ACTIVE' OR public.is_admin());

DROP POLICY IF EXISTS "Admins manage categories" ON public.categories;
CREATE POLICY "Admins manage categories" ON public.categories FOR ALL USING (public.is_admin());

-- Courses Policies
DROP POLICY IF EXISTS "Public view published courses" ON public.courses;
CREATE POLICY "Public view published courses" ON public.courses FOR SELECT USING (status = 'PUBLISHED' OR public.is_admin());

DROP POLICY IF EXISTS "Admins manage courses" ON public.courses;
CREATE POLICY "Admins manage courses" ON public.courses FOR ALL USING (public.is_admin());

-- Course Sections & Lessons Policies
DROP POLICY IF EXISTS "Public view published sections" ON public.course_sections;
CREATE POLICY "Public view published sections" ON public.course_sections FOR SELECT USING (status = 'PUBLISHED' OR public.is_admin());

DROP POLICY IF EXISTS "Admins manage sections" ON public.course_sections;
CREATE POLICY "Admins manage sections" ON public.course_sections FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Public view preview or enrolled lessons" ON public.lessons;
CREATE POLICY "Public view preview or enrolled lessons" ON public.lessons FOR SELECT USING (
  status = 'PUBLISHED' AND (
    is_preview = true OR public.is_admin() OR EXISTS (
      SELECT 1 FROM public.course_sections cs
      JOIN public.enrollments e ON e.course_id = cs.course_id
      WHERE cs.id = lessons.section_id AND e.user_id = auth.uid() AND e.status IN ('ACTIVE', 'COMPLETED')
    )
  )
);

DROP POLICY IF EXISTS "Admins manage lessons" ON public.lessons;
CREATE POLICY "Admins manage lessons" ON public.lessons FOR ALL USING (public.is_admin());

-- Enrollments Policies
DROP POLICY IF EXISTS "Users view own enrollments" ON public.enrollments;
CREATE POLICY "Users view own enrollments" ON public.enrollments FOR SELECT USING (user_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "Users create own open/approval enrollments" ON public.enrollments;
CREATE POLICY "Users create own open/approval enrollments" ON public.enrollments FOR INSERT WITH CHECK (user_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "Admins manage enrollments" ON public.enrollments;
CREATE POLICY "Admins manage enrollments" ON public.enrollments FOR ALL USING (public.is_admin());

-- Lesson Progress Policies
DROP POLICY IF EXISTS "Users view and update own progress" ON public.lesson_progress;
CREATE POLICY "Users view and update own progress" ON public.lesson_progress FOR ALL USING (user_id = auth.uid() OR public.is_admin());

-- System Tables
DROP POLICY IF EXISTS "Super admins manage system settings" ON public.system_settings;
CREATE POLICY "Super admins manage system settings" ON public.system_settings FOR ALL USING (public.is_super_admin());

DROP POLICY IF EXISTS "Super admins view system migrations" ON public.system_migrations;
CREATE POLICY "Super admins view system migrations" ON public.system_migrations FOR ALL USING (public.is_super_admin());

DROP POLICY IF EXISTS "Super admins view system audit logs" ON public.system_audit_logs;
CREATE POLICY "Super admins view system audit logs" ON public.system_audit_logs FOR ALL USING (public.is_super_admin());
