-- MIGRATION 018: CREATE STORAGE BUCKETS & POLICIES
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('course-images', 'course-images', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('lesson-files', 'lesson-files', false) ON CONFLICT (id) DO NOTHING;

-- Storage policies for avatars
DROP POLICY IF EXISTS "Avatar public read" ON storage.objects;
CREATE POLICY "Avatar public read" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Avatar authenticated upload" ON storage.objects;
CREATE POLICY "Avatar authenticated upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');

-- Storage policies for course-images
DROP POLICY IF EXISTS "Course image public read" ON storage.objects;
CREATE POLICY "Course image public read" ON storage.objects FOR SELECT USING (bucket_id = 'course-images');

DROP POLICY IF EXISTS "Course image admin manage" ON storage.objects;
CREATE POLICY "Course image admin manage" ON storage.objects FOR ALL USING (bucket_id = 'course-images' AND public.is_admin());

-- Storage policies for lesson-files
DROP POLICY IF EXISTS "Lesson files admin manage" ON storage.objects;
CREATE POLICY "Lesson files admin manage" ON storage.objects FOR ALL USING (bucket_id = 'lesson-files' AND public.is_admin());
