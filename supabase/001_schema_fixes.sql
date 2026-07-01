-- ==========================================
-- MIGRATION 001: SCHEMA FIXES
-- ==========================================

-- NOTE: The "updatedAt" columns added in this migration have a dependency on the 
-- automatic update triggers defined in "007_triggers.sql".

-- 1. Profiles Table Corrections
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS "schoolName" TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS badges TEXT[] DEFAULT '{}';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN DEFAULT true NOT NULL;

-- 2. Notes Table Corrections
ALTER TABLE public.notes ADD COLUMN IF NOT EXISTS "classId" TEXT;
ALTER TABLE public.notes ADD COLUMN IF NOT EXISTS "subjectId" TEXT;
ALTER TABLE public.notes ADD COLUMN IF NOT EXISTS type TEXT CHECK (type IN ('notes', 'pyq', 'practiceset')) DEFAULT 'notes' NOT NULL;
ALTER TABLE public.notes ADD COLUMN IF NOT EXISTS price NUMERIC(10,2) DEFAULT 0.00 NOT NULL;
ALTER TABLE public.notes ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL;
