-- ============================================================================
-- RK Coaching LMS — Migration 007
-- Content Management System (CMS) — Future-Proof Columns
-- File: supabase/007_cms_v2_migration.sql
-- ============================================================================
-- Adds support for display order, PYQ fields, and metadata for content.
-- All statements are safe to run repeatedly (idempotent).
-- ============================================================================

-- ============================================================================
-- 1. ADD COLUMNS TO public.notes
-- ============================================================================
ALTER TABLE public.notes
  ADD COLUMN IF NOT EXISTS "displayOrder" INTEGER NOT NULL DEFAULT 0;

ALTER TABLE public.notes
  ADD COLUMN IF NOT EXISTS "chapterId" TEXT REFERENCES public.chapters(id) ON DELETE SET NULL;

-- PYQ specific columns
ALTER TABLE public.notes
  ADD COLUMN IF NOT EXISTS "examName" TEXT;

ALTER TABLE public.notes
  ADD COLUMN IF NOT EXISTS "year" INTEGER;

ALTER TABLE public.notes
  ADD COLUMN IF NOT EXISTS "solvedStatus" TEXT DEFAULT 'unsolved'
    CHECK ("solvedStatus" IN ('solved', 'unsolved'));

-- ============================================================================
-- 2. ADD COLUMNS TO public.videos
-- ============================================================================
ALTER TABLE public.videos
  ADD COLUMN IF NOT EXISTS "displayOrder" INTEGER NOT NULL DEFAULT 0;

ALTER TABLE public.videos
  ADD COLUMN IF NOT EXISTS "classId" TEXT REFERENCES public.classes(id) ON DELETE SET NULL;

ALTER TABLE public.videos
  ADD COLUMN IF NOT EXISTS "subjectId" TEXT REFERENCES public.subjects(id) ON DELETE SET NULL;

ALTER TABLE public.videos
  ADD COLUMN IF NOT EXISTS "chapterId" TEXT REFERENCES public.chapters(id) ON DELETE SET NULL;

-- ============================================================================
-- 3. ADD COLUMNS TO public.quizzes
-- ============================================================================
ALTER TABLE public.quizzes
  ADD COLUMN IF NOT EXISTS "classId" TEXT REFERENCES public.classes(id) ON DELETE SET NULL;

ALTER TABLE public.quizzes
  ADD COLUMN IF NOT EXISTS "subjectId" TEXT REFERENCES public.subjects(id) ON DELETE SET NULL;

ALTER TABLE public.quizzes
  ADD COLUMN IF NOT EXISTS "chapterId" TEXT REFERENCES public.chapters(id) ON DELETE SET NULL;

ALTER TABLE public.quizzes
  ADD COLUMN IF NOT EXISTS "difficulty" TEXT DEFAULT 'medium'
    CHECK ("difficulty" IN ('easy', 'medium', 'hard'));

ALTER TABLE public.quizzes
  ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'published'
    CHECK ("status" IN ('draft', 'review', 'published', 'archived'));

ALTER TABLE public.quizzes
  ADD COLUMN IF NOT EXISTS "createdBy" UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

ALTER TABLE public.quizzes
  ADD COLUMN IF NOT EXISTS "updatedBy" UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

ALTER TABLE public.quizzes
  ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

-- ============================================================================
-- 4. INDEXES FOR HIGH-SPEED FILTERING
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_notes_display_order ON public.notes("displayOrder");
CREATE INDEX IF NOT EXISTS idx_notes_type_status ON public.notes(type, status);
CREATE INDEX IF NOT EXISTS idx_notes_chapter ON public.notes("chapterId");

CREATE INDEX IF NOT EXISTS idx_videos_display_order ON public.videos("displayOrder");
CREATE INDEX IF NOT EXISTS idx_videos_chapter ON public.videos("chapterId");

CREATE INDEX IF NOT EXISTS idx_quizzes_status ON public.quizzes(status);
CREATE INDEX IF NOT EXISTS idx_quizzes_chapter ON public.quizzes("chapterId");
