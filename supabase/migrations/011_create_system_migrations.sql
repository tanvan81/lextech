-- MIGRATION 011: CREATE SYSTEM MIGRATIONS
CREATE TABLE IF NOT EXISTS public.system_migrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  migration_version TEXT UNIQUE NOT NULL,
  migration_name TEXT NOT NULL,
  checksum TEXT,
  status migration_status NOT NULL,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  error_message TEXT,
  executed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
