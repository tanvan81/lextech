-- MIGRATION 007: CREATE LESSON ATTACHMENTS
CREATE TABLE IF NOT EXISTS public.lesson_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT,
  storage_path TEXT NOT NULL,
  file_type TEXT,
  mime_type TEXT,
  file_size BIGINT,
  is_demo BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);
