-- ============================================================================
-- RK Coaching LMS — Database Migration v6.5
-- Faculty & Teaching Management System (Assignments & Ownership)
-- File: supabase/009_teacher_assignments.sql
-- ============================================================================
-- SAFE TO RUN: All statements use IF NOT EXISTS / IF EXISTS guards.
-- ============================================================================

-- ============================================================================
-- 1. CREATE TEACHER ASSIGNMENTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.teacher_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "teacherId"    UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    "classId"      TEXT REFERENCES public.classes(id) ON DELETE CASCADE NOT NULL,
    "subjectId"    TEXT REFERENCES public.subjects(id) ON DELETE CASCADE, -- NULL = All subjects in class
    "chapterId"    TEXT REFERENCES public.chapters(id) ON DELETE CASCADE, -- NULL = All chapters in subject
    "startDate"    DATE DEFAULT CURRENT_DATE NOT NULL,
    "endDate"      DATE,
    "status"       TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    "isPrimary"    BOOLEAN NOT NULL DEFAULT true,
    "createdAt"    TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_teacher_assignments_teacher ON public.teacher_assignments("teacherId");
CREATE INDEX IF NOT EXISTS idx_teacher_assignments_class ON public.teacher_assignments("classId");
CREATE INDEX IF NOT EXISTS idx_teacher_assignments_subject ON public.teacher_assignments("subjectId");
CREATE INDEX IF NOT EXISTS idx_teacher_assignments_status ON public.teacher_assignments("status");

-- Partial unique index to prevent duplicate ACTIVE assignments
DROP INDEX IF EXISTS idx_teacher_assignments_unique_active;
CREATE UNIQUE INDEX idx_teacher_assignments_unique_active 
  ON public.teacher_assignments("teacherId", "classId", COALESCE("subjectId", '_ALL_'), COALESCE("chapterId", '_ALL_')) 
  WHERE (status = 'active');

-- RLS
ALTER TABLE public.teacher_assignments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Teacher assignments readable by authenticated users" ON public.teacher_assignments;
CREATE POLICY "Teacher assignments readable by authenticated users"
  ON public.teacher_assignments FOR SELECT
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Teacher assignments managed by admin and super_admin" ON public.teacher_assignments;
CREATE POLICY "Teacher assignments managed by admin and super_admin"
  ON public.teacher_assignments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- ============================================================================
-- 2. EXTEND EDUCATIONAL ENTITIES TO TRACK OWNER AND ASSIGNED TEACHER
-- ============================================================================
-- Notes
ALTER TABLE public.notes
  ADD COLUMN IF NOT EXISTS "ownerId" UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS "publishedBy" UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS "reviewedBy" UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS "reviewedAt" TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS "rejectionReason" TEXT,
  ADD COLUMN IF NOT EXISTS "rejectionComment" TEXT,
  ADD COLUMN IF NOT EXISTS "rejectedAt" TIMESTAMP WITH TIME ZONE;

-- Videos
ALTER TABLE public.videos
  ADD COLUMN IF NOT EXISTS "ownerId" UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS "publishedBy" UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS "reviewedBy" UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS "reviewedAt" TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS "rejectionReason" TEXT,
  ADD COLUMN IF NOT EXISTS "rejectionComment" TEXT,
  ADD COLUMN IF NOT EXISTS "rejectedAt" TIMESTAMP WITH TIME ZONE;

-- Quizzes
ALTER TABLE public.quizzes
  ADD COLUMN IF NOT EXISTS "ownerId" UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS "publishedBy" UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS "reviewedBy" UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS "reviewedAt" TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS "rejectionReason" TEXT,
  ADD COLUMN IF NOT EXISTS "rejectionComment" TEXT,
  ADD COLUMN IF NOT EXISTS "rejectedAt" TIMESTAMP WITH TIME ZONE;
