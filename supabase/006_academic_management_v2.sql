-- ============================================================================
-- RK Coaching LMS — Migration 006
-- Academic Management v2 — Future-Proof Entity Design
-- File: supabase/006_academic_management_v2.sql
-- ============================================================================
-- Adds is_active, created_by, updated_by, updatedAt to academic tables.
-- All statements are idempotent (safe to re-run).
-- Run AFTER 005_super_admin_foundation.sql
-- ============================================================================

-- ============================================================================
-- 1. CLASSES TABLE — add is_active, updatedAt
-- ============================================================================
ALTER TABLE public.classes
  ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE public.classes
  ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

-- ============================================================================
-- 2. SUBJECTS TABLE — add is_active, display_order, created_by, updated_by, updatedAt
-- ============================================================================
ALTER TABLE public.subjects
  ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE public.subjects
  ADD COLUMN IF NOT EXISTS "displayOrder" INTEGER NOT NULL DEFAULT 0;

ALTER TABLE public.subjects
  ADD COLUMN IF NOT EXISTS "createdBy" UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

ALTER TABLE public.subjects
  ADD COLUMN IF NOT EXISTS "updatedBy" UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

ALTER TABLE public.subjects
  ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

-- ============================================================================
-- 3. CHAPTERS TABLE — add is_active, created_by, updated_by, updatedAt
-- ============================================================================
ALTER TABLE public.chapters
  ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE public.chapters
  ADD COLUMN IF NOT EXISTS "createdBy" UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

ALTER TABLE public.chapters
  ADD COLUMN IF NOT EXISTS "updatedBy" UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

ALTER TABLE public.chapters
  ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

-- ============================================================================
-- 4. COURSES TABLE — add is_active, status (content lifecycle), created_by, updated_by
-- ============================================================================
ALTER TABLE public.courses
  ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE public.courses
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'published'
    CHECK (status IN ('draft', 'review', 'published', 'archived'));

ALTER TABLE public.courses
  ADD COLUMN IF NOT EXISTS "createdBy" UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

ALTER TABLE public.courses
  ADD COLUMN IF NOT EXISTS "updatedBy" UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

ALTER TABLE public.courses
  ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

-- ============================================================================
-- 5. NOTES TABLE — add status (content lifecycle), classId/subjectId (for direct linking),
--    type column (already in frontend types, add to DB)
-- ============================================================================
ALTER TABLE public.notes
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'published'
    CHECK (status IN ('draft', 'review', 'published', 'archived'));

ALTER TABLE public.notes
  ADD COLUMN IF NOT EXISTS "classId" TEXT REFERENCES public.classes(id) ON DELETE SET NULL;

ALTER TABLE public.notes
  ADD COLUMN IF NOT EXISTS "subjectId" TEXT REFERENCES public.subjects(id) ON DELETE SET NULL;

ALTER TABLE public.notes
  ADD COLUMN IF NOT EXISTS type TEXT NOT NULL DEFAULT 'notes'
    CHECK (type IN ('notes', 'pyq', 'practiceset'));

ALTER TABLE public.notes
  ADD COLUMN IF NOT EXISTS price NUMERIC DEFAULT 0;

ALTER TABLE public.notes
  ADD COLUMN IF NOT EXISTS "createdBy" UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

ALTER TABLE public.notes
  ADD COLUMN IF NOT EXISTS "updatedBy" UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

ALTER TABLE public.notes
  ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

-- ============================================================================
-- 6. VIDEOS TABLE — add status (content lifecycle), created_by, updated_by
-- ============================================================================
ALTER TABLE public.videos
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'published'
    CHECK (status IN ('draft', 'review', 'published', 'archived'));

ALTER TABLE public.videos
  ADD COLUMN IF NOT EXISTS "createdBy" UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

ALTER TABLE public.videos
  ADD COLUMN IF NOT EXISTS "updatedBy" UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

ALTER TABLE public.videos
  ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

-- ============================================================================
-- 7. LESSONS TABLE — add status, created_by, updated_by
-- ============================================================================
ALTER TABLE public.lessons
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'published'
    CHECK (status IN ('draft', 'review', 'published', 'archived'));

ALTER TABLE public.lessons
  ADD COLUMN IF NOT EXISTS "createdBy" UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

ALTER TABLE public.lessons
  ADD COLUMN IF NOT EXISTS "updatedBy" UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

ALTER TABLE public.lessons
  ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

-- ============================================================================
-- 8. INDEXES for new audit columns
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_subjects_active ON public.subjects("isActive");
CREATE INDEX IF NOT EXISTS idx_chapters_active ON public.chapters("isActive");
CREATE INDEX IF NOT EXISTS idx_courses_status ON public.courses(status);
CREATE INDEX IF NOT EXISTS idx_notes_status ON public.notes(status);
CREATE INDEX IF NOT EXISTS idx_notes_type ON public.notes(type);
CREATE INDEX IF NOT EXISTS idx_lessons_status ON public.lessons(status);
