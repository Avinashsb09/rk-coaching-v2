-- ============================================================================
-- RK Coaching LMS — Database Migration v2
-- Super Admin Foundation & Enterprise Architecture
-- File: supabase/005_super_admin_foundation.sql
-- ============================================================================
-- SAFE TO RUN: All statements use IF NOT EXISTS / IF EXISTS guards.
-- Run this AFTER the existing schema.sql has been applied.
-- DO NOT modify schema.sql — append only via migrations.
-- ============================================================================

-- ============================================================================
-- 1. EXTEND PROFILES ROLE ENUM TO INCLUDE super_admin
-- ============================================================================
-- The existing CHECK constraint must be dropped and re-created.
-- Supabase/PostgreSQL requires this pattern for inline CHECK updates.

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('visitor', 'student', 'teacher', 'admin', 'super_admin'));

-- ============================================================================
-- 2. SUBJECT NOTES PURCHASES TABLE
-- Already used in CourseContext.tsx but missing from schema.sql
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.subject_notes_purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId"     UUID  REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    "subjectId"  TEXT  REFERENCES public.subjects(id) ON DELETE CASCADE NOT NULL,
    "rzpPaymentId" TEXT,
    "rzpOrderId"   TEXT,
    "purchasedAt"  TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_user_subject_notes UNIQUE ("userId", "subjectId")
);

CREATE INDEX IF NOT EXISTS idx_subject_notes_purchases_user
    ON public.subject_notes_purchases("userId");

-- RLS
ALTER TABLE public.subject_notes_purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notes purchases"
    ON public.subject_notes_purchases FOR SELECT
    USING (
        auth.uid() = "userId" OR
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('admin', 'super_admin')
        )
    );

CREATE POLICY "Users can insert their own notes purchases"
    ON public.subject_notes_purchases FOR INSERT
    WITH CHECK (auth.uid() = "userId");

-- ============================================================================
-- 3. PREMIUM PACKAGES TABLE
-- Super Admin configures purchasable packages here
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.premium_packages (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC NOT NULL DEFAULT 0,
    "discountPrice" NUMERIC,
    "durationDays" INTEGER, -- NULL = lifetime
    features TEXT[] DEFAULT '{}',
    "isActive" BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.premium_packages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Premium packages viewable by everyone"
    ON public.premium_packages FOR SELECT USING (true);

CREATE POLICY "Premium packages managed by admin/super_admin"
    ON public.premium_packages FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('admin', 'super_admin')
        )
    );

-- ============================================================================
-- 4. ACTIVITY LOGS TABLE
-- Audit trail for all admin/teacher operations
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId"     UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    "userRole"   TEXT NOT NULL,
    action       TEXT NOT NULL,  -- e.g. 'CREATE', 'UPDATE', 'DELETE', 'PUBLISH'
    resource     TEXT NOT NULL,  -- e.g. 'note', 'chapter', 'user'
    "resourceId" TEXT,           -- ID of the affected resource
    metadata     JSONB,          -- Additional context (old/new values etc.)
    "createdAt"  TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_activity_logs_user
    ON public.activity_logs("userId");
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at
    ON public.activity_logs("createdAt" DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_resource
    ON public.activity_logs(resource, "resourceId");

ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Activity logs viewable by admin and super_admin"
    ON public.activity_logs FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('admin', 'super_admin')
        )
    );

CREATE POLICY "System can insert activity logs"
    ON public.activity_logs FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('teacher', 'admin', 'super_admin')
        )
    );

-- ============================================================================
-- 5. UPDATE EXISTING RLS POLICIES TO INCLUDE super_admin
-- ============================================================================

-- Classes — editable by admins + super_admin
DROP POLICY IF EXISTS "Classes editable by admins" ON public.classes;
CREATE POLICY "Classes editable by admins"
    ON public.classes FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('admin', 'super_admin')
        )
    );

-- Subjects
DROP POLICY IF EXISTS "Subjects editable by admins" ON public.subjects;
CREATE POLICY "Subjects editable by admins"
    ON public.subjects FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('admin', 'super_admin')
        )
    );

-- Chapters
DROP POLICY IF EXISTS "Chapters editable by teachers or admins" ON public.chapters;
CREATE POLICY "Chapters editable by teachers or admins"
    ON public.chapters FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('teacher', 'admin', 'super_admin')
        )
    );

-- Courses
DROP POLICY IF EXISTS "Courses editable by teachers or admins" ON public.courses;
CREATE POLICY "Courses editable by teachers or admins"
    ON public.courses FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('teacher', 'admin', 'super_admin')
        )
    );

-- Lessons
DROP POLICY IF EXISTS "Lessons editable by teachers or admins" ON public.lessons;
CREATE POLICY "Lessons editable by teachers or admins"
    ON public.lessons FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('teacher', 'admin', 'super_admin')
        )
    );

-- Notes
DROP POLICY IF EXISTS "Notes editable by teachers or admins" ON public.notes;
CREATE POLICY "Notes editable by teachers or admins"
    ON public.notes FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('teacher', 'admin', 'super_admin')
        )
    );

-- Videos
DROP POLICY IF EXISTS "Videos editable by teachers or admins" ON public.videos;
CREATE POLICY "Videos editable by teachers or admins"
    ON public.videos FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('teacher', 'admin', 'super_admin')
        )
    );

-- Announcements
DROP POLICY IF EXISTS "Announcements editable by admins" ON public.announcements;
CREATE POLICY "Announcements editable by admins"
    ON public.announcements FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('admin', 'super_admin')
        )
    );

-- Orders — admin/super_admin read all
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
CREATE POLICY "Users can view their own orders"
    ON public.orders FOR SELECT USING (
        auth.uid() = "userId" OR
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('admin', 'super_admin')
        )
    );

-- Payments — admin/super_admin read all
DROP POLICY IF EXISTS "Users can view their own payments" ON public.payments;
CREATE POLICY "Users can view their own payments"
    ON public.payments FOR SELECT USING (
        auth.uid() = "userId" OR
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('admin', 'super_admin')
        )
    );

-- Contact messages
DROP POLICY IF EXISTS "Only admins can view/update contact tickets" ON public.contact_messages;
CREATE POLICY "Only admins can view/update contact tickets"
    ON public.contact_messages FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('admin', 'super_admin')
        )
    );

-- Admin settings — extend to super_admin
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin settings managed by admins" ON public.admin_settings;
CREATE POLICY "Admin settings managed by admins"
    ON public.admin_settings FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('admin', 'super_admin')
        )
    );

-- ============================================================================
-- 6. HANDLE_NEW_USER TRIGGER — extend role validation for super_admin
-- ============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_full_name TEXT;
    v_role TEXT;
    v_avatar_url TEXT;
    v_class_id TEXT;
BEGIN
    -- Cleanse orphaned profiles
    IF EXISTS (SELECT 1 FROM public.profiles WHERE email = new.email AND id <> new.id) THEN
        DELETE FROM public.profiles WHERE email = new.email AND id <> new.id;
    END IF;

    v_full_name := COALESCE(new.raw_user_meta_data->>'fullName', new.raw_user_meta_data->>'name', 'Scholar');

    v_role := COALESCE(new.raw_user_meta_data->>'role', 'student');
    IF v_role NOT IN ('visitor', 'student', 'teacher', 'admin', 'super_admin') THEN
        v_role := 'student';
    END IF;

    v_avatar_url := COALESCE(new.raw_user_meta_data->>'avatarUrl', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80');

    v_class_id := new.raw_user_meta_data->>'classId';
    IF v_class_id IS NOT NULL THEN
        IF NOT EXISTS (SELECT 1 FROM public.classes WHERE id = v_class_id) THEN
            v_class_id := NULL;
        END IF;
    END IF;

    BEGIN
        INSERT INTO public.profiles (id, email, "fullName", role, "avatarUrl", "classId", "dailyStreak", "totalXp")
        VALUES (new.id, new.email, v_full_name, v_role, v_avatar_url, v_class_id, 1, 0)
        ON CONFLICT (id) DO UPDATE SET
            email = EXCLUDED.email,
            "fullName" = COALESCE(EXCLUDED."fullName", public.profiles."fullName"),
            role = COALESCE(EXCLUDED.role, public.profiles.role),
            "avatarUrl" = COALESCE(EXCLUDED."avatarUrl", public.profiles."avatarUrl"),
            "classId" = COALESCE(EXCLUDED."classId", public.profiles."classId");
    EXCEPTION
        WHEN unique_violation THEN
            DELETE FROM public.profiles WHERE email = new.email AND id <> new.id;
            INSERT INTO public.profiles (id, email, "fullName", role, "avatarUrl", "classId", "dailyStreak", "totalXp")
            VALUES (new.id, new.email, v_full_name, v_role, v_avatar_url, v_class_id, 1, 0)
            ON CONFLICT (id) DO UPDATE SET
                email = EXCLUDED.email,
                "fullName" = COALESCE(EXCLUDED."fullName", public.profiles."fullName"),
                role = COALESCE(EXCLUDED.role, public.profiles.role),
                "avatarUrl" = COALESCE(EXCLUDED."avatarUrl", public.profiles."avatarUrl"),
                "classId" = COALESCE(EXCLUDED."classId", public.profiles."classId");
    END;

    RETURN new;
END;
$$;
