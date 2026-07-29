-- MIGRATION 006: CREATE LESSONS
CREATE TABLE IF NOT EXISTS public.lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID REFERENCES public.course_sections(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  lesson_type lesson_type NOT NULL,
  text_content TEXT,
  video_url TEXT,
  slide_url TEXT,
  slide_file_url TEXT,
  estimated_duration INTEGER DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  is_preview BOOLEAN DEFAULT false,
  allow_download BOOLEAN DEFAULT false,
  status content_status DEFAULT 'DRAFT',
  is_demo BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(section_id, slug)
);
