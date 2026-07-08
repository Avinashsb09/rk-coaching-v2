-- ============================================================================
-- RK Coaching LMS — Database Migration v5
-- Identity & User Management System
-- File: supabase/008_user_management_v5.sql
-- ============================================================================
-- SAFE TO RUN: All statements use IF NOT EXISTS / IF EXISTS guards.
-- Run this AFTER the existing 007_cms_v2_migration.sql has been applied.
-- ============================================================================

-- ============================================================================
-- 1. ADD WORKFLOW STATUS AND BACKWARD-COMPATIBLE BOOLEAN FLAGS TO PROFILES
-- ============================================================================
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('pending', 'active', 'inactive', 'verified', 'suspended', 'archived')),
  ADD COLUMN IF NOT EXISTS "isVerified" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "isSuspended" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "isPremium" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS "archivedAt" TIMESTAMP WITH TIME ZONE;

-- ============================================================================
-- 2. CREATE PERFORMANCE INDEXES FOR SEARCH AND FILTERS
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON public.profiles(status);
CREATE INDEX IF NOT EXISTS idx_profiles_class ON public.profiles("classId");
CREATE INDEX IF NOT EXISTS idx_profiles_premium ON public.profiles("isPremium");
CREATE INDEX IF NOT EXISTS idx_profiles_active ON public.profiles("isActive");

-- ============================================================================
-- 3. REGISTER CERTIFICATES BUCKET IN STORAGE
-- ============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('certificates', 'certificates', true)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 4. UPDATE ROW LEVEL SECURITY (RLS) POLICIES FOR USER MANAGEMENT
-- ============================================================================
-- Create a policy allowing admins and super_admins to manage all profiles.
DROP POLICY IF EXISTS "Admins and Super Admins can manage all profiles" ON public.profiles;

CREATE POLICY "Admins and Super Admins can manage all profiles"
ON public.profiles FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'super_admin')
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'super_admin')
    )
);
