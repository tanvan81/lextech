-- MIGRATION 001: CREATE ENUMS
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('STUDENT', 'ADMIN', 'SUPER_ADMIN');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_status') THEN
    CREATE TYPE user_status AS ENUM ('ACTIVE', 'BLOCKED');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'category_status') THEN
    CREATE TYPE category_status AS ENUM ('ACTIVE', 'HIDDEN');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'course_level') THEN
    CREATE TYPE course_level AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enrollment_type') THEN
    CREATE TYPE enrollment_type AS ENUM ('OPEN', 'APPROVAL_REQUIRED', 'ADMIN_ASSIGNED');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'course_status') THEN
    CREATE TYPE course_status AS ENUM ('DRAFT', 'PUBLISHED', 'HIDDEN', 'ARCHIVED');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'content_status') THEN
    CREATE TYPE content_status AS ENUM ('DRAFT', 'PUBLISHED', 'HIDDEN');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'lesson_type') THEN
    CREATE TYPE lesson_type AS ENUM ('TEXT', 'VIDEO', 'SLIDE', 'DOCUMENT');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enrollment_status') THEN
    CREATE TYPE enrollment_status AS ENUM ('PENDING', 'ACTIVE', 'COMPLETED', 'CANCELLED');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enrolled_by') THEN
    CREATE TYPE enrolled_by AS ENUM ('SELF', 'ADMIN');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'lesson_progress_status') THEN
    CREATE TYPE lesson_progress_status AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'migration_status') THEN
    CREATE TYPE migration_status AS ENUM ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'audit_action_level') THEN
    CREATE TYPE audit_action_level AS ENUM ('INFO', 'WARNING', 'DANGER');
  END IF;
END $$;
