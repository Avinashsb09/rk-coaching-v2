-- Database Schema for RK Coaching India's LMS Engine
-- Target Database: Supabase PostgreSQL (Production Ready)

-- Enable uuid-ossp extension if available
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 1. CLASSES TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS public.classes (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    priority INTEGER DEFAULT 0,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- 2. SUBJECTS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS public.subjects (
    id TEXT PRIMARY KEY,
    "classId" TEXT REFERENCES public.classes(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    icon TEXT,
    description TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- 3. PROFILES TABLE (Syncs with auth.users)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    "fullName" TEXT,
    role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('visitor', 'student', 'teacher', 'admin')),
    "avatarUrl" TEXT,
    phone TEXT,
    "classId" TEXT REFERENCES public.classes(id) ON DELETE SET NULL,
    "dailyStreak" INTEGER DEFAULT 1,
    "totalXp" INTEGER DEFAULT 0,
    "lastLogin" TIMESTAMP WITH TIME ZONE,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- 4. TEACHER PROFILES TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS public.teacher_profiles (
    id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    qualification TEXT,
    specialization TEXT,
    "isVerified" BOOLEAN DEFAULT false,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- 5. CHAPTERS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS public.chapters (
    id TEXT PRIMARY KEY,
    "subjectId" TEXT REFERENCES public.subjects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    "orderIndex" INTEGER DEFAULT 0,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- 6. COURSES TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS public.courses (
    id TEXT PRIMARY KEY,
    "classId" TEXT REFERENCES public.classes(id) ON DELETE CASCADE,
    "subjectId" TEXT REFERENCES public.subjects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    subtitle TEXT,
    description TEXT,
    "thumbnailUrl" TEXT,
    "isPremium" BOOLEAN DEFAULT false,
    price NUMERIC DEFAULT 0,
    "discountPrice" NUMERIC DEFAULT 0,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- 7. LESSONS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS public.lessons (
    id TEXT PRIMARY KEY,
    "chapterId" TEXT REFERENCES public.chapters(id) ON DELETE CASCADE,
    "courseId" TEXT REFERENCES public.courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    "orderIndex" INTEGER DEFAULT 0,
    "isPremium" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- 8. NOTES (PDF) TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS public.notes (
    id TEXT PRIMARY KEY,
    "lessonId" TEXT REFERENCES public.lessons(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    "pdfUrl" TEXT NOT NULL,
    "sizeBytes" INTEGER DEFAULT 0,
    "isPremium" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- 9. VIDEOS (LECTURES) TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS public.videos (
    id TEXT PRIMARY KEY,
    "lessonId" TEXT REFERENCES public.lessons(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    provider TEXT NOT NULL DEFAULT 'youtube' CHECK (provider IN ('youtube', 'gdrive', 'vimeo', 'supabase', 'r2')),
    "videoIdOrUrl" TEXT NOT NULL,
    "durationSeconds" INTEGER DEFAULT 0,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- 10. ENROLLMENTS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS public.enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    "courseId" TEXT REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_user_course UNIQUE ("userId", "courseId")
);

-- ==========================================
-- 11. QUIZZES TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS public.quizzes (
    id TEXT PRIMARY KEY,
    "lessonId" TEXT REFERENCES public.lessons(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    "passingScorePct" INTEGER DEFAULT 50,
    "timerSeconds" INTEGER DEFAULT 0,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- 12. QUIZ QUESTIONS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS public.quiz_questions (
    id TEXT PRIMARY KEY,
    "quizId" TEXT REFERENCES public.quizzes(id) ON DELETE CASCADE,
    "questionText" TEXT NOT NULL,
    "orderIndex" INTEGER DEFAULT 0,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- 13. QUIZ OPTIONS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS public.quiz_options (
    id TEXT PRIMARY KEY,
    "questionId" TEXT REFERENCES public.quiz_questions(id) ON DELETE CASCADE,
    "optionText" TEXT NOT NULL,
    "isCorrect" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- 14. QUIZ ATTEMPTS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    "quizId" TEXT REFERENCES public.quizzes(id) ON DELETE CASCADE NOT NULL,
    "scoreObtained" INTEGER DEFAULT 0,
    "totalQuestions" INTEGER DEFAULT 0,
    "isPassed" BOOLEAN DEFAULT false,
    "attemptedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- 15. LEADERBOARD TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS public.leaderboard (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
    "pointsXp" INTEGER DEFAULT 0,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- 16. ANNOUNCEMENTS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS public.announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    "targetRoles" TEXT[] DEFAULT '{}',
    "isPinned" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- 17. NOTIFICATIONS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    "isRead" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- 18. ORDERS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY, -- Razorpay Order ID or UUID
    "userId" UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    "courseId" TEXT REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
    amount NUMERIC NOT NULL,
    currency TEXT DEFAULT 'INR',
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- 19. PAYMENTS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS public.payments (
    id TEXT PRIMARY KEY, -- Razorpay Payment ID
    "orderId" TEXT REFERENCES public.orders(id) ON DELETE CASCADE,
    "userId" UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    amount NUMERIC NOT NULL,
    method TEXT,
    status TEXT NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- 20. ADMIN SETTINGS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS public.admin_settings (
    id TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- 21. FAQ TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS public.faq (
    id TEXT PRIMARY KEY,
    category TEXT NOT NULL,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    "orderIndex" INTEGER DEFAULT 0,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- 22. BANNERS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS public.banners (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    subtitle TEXT,
    "imageUrl" TEXT,
    "actionUrl" TEXT,
    "isActive" BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- 23. CONTACT MESSAGES TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS public.contact_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'replied')),
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);


-- ==========================================
-- INDEXES FOR FASTER PERFORMANCE
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_subjects_class ON public.subjects("classId");
CREATE INDEX IF NOT EXISTS idx_chapters_subject ON public.chapters("subjectId");
CREATE INDEX IF NOT EXISTS idx_courses_class ON public.courses("classId");
CREATE INDEX IF NOT EXISTS idx_lessons_course ON public.lessons("courseId");
CREATE INDEX IF NOT EXISTS idx_notes_lesson ON public.notes("lessonId");
CREATE INDEX IF NOT EXISTS idx_videos_lesson ON public.videos("lessonId");
CREATE INDEX IF NOT EXISTS idx_enrollments_user ON public.enrollments("userId");
CREATE INDEX IF NOT EXISTS idx_quizzes_lesson ON public.quizzes("lessonId");
CREATE INDEX IF NOT EXISTS idx_quiz_questions_quiz ON public.quiz_questions("quizId");
CREATE INDEX IF NOT EXISTS idx_quiz_options_question ON public.quiz_options("questionId");
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user ON public.quiz_attempts("userId");
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications("userId");
CREATE INDEX IF NOT EXISTS idx_orders_user ON public.orders("userId");


-- ==========================================
-- ROW LEVEL SECURITY (RLS) & POLICIES
-- ==========================================

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faq ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- 1. Profiles Policies
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can update their own profiles" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- 2. Read-only Static Content Policies (Public access, Admin edit)
CREATE POLICY "Classes are viewable by everyone" ON public.classes FOR SELECT USING (true);
CREATE POLICY "Classes editable by admins" ON public.classes FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

CREATE POLICY "Subjects are viewable by everyone" ON public.subjects FOR SELECT USING (true);
CREATE POLICY "Subjects editable by admins" ON public.subjects FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

CREATE POLICY "Chapters are viewable by everyone" ON public.chapters FOR SELECT USING (true);
CREATE POLICY "Chapters editable by teachers or admins" ON public.chapters FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('teacher', 'admin'))
);

CREATE POLICY "Courses are viewable by everyone" ON public.courses FOR SELECT USING (true);
CREATE POLICY "Courses editable by teachers or admins" ON public.courses FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('teacher', 'admin'))
);

CREATE POLICY "Lessons are viewable by everyone" ON public.lessons FOR SELECT USING (true);
CREATE POLICY "Lessons editable by teachers or admins" ON public.lessons FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('teacher', 'admin'))
);

CREATE POLICY "Notes are viewable by everyone" ON public.notes FOR SELECT USING (true);
CREATE POLICY "Notes editable by teachers or admins" ON public.notes FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('teacher', 'admin'))
);

CREATE POLICY "Videos are viewable by everyone" ON public.videos FOR SELECT USING (true);
CREATE POLICY "Videos editable by teachers or admins" ON public.videos FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('teacher', 'admin'))
);

-- 3. Enrollment Policies (User's own data, Teachers/Admins read all)
CREATE POLICY "Users can view their own enrollments" ON public.enrollments
    FOR SELECT USING (
        auth.uid() = "userId" OR 
        EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('teacher', 'admin'))
    );

CREATE POLICY "Users can enroll themselves" ON public.enrollments
    FOR INSERT WITH CHECK (auth.uid() = "userId");

-- 4. Quizzes & Attempts Policies
CREATE POLICY "Quizzes are viewable by everyone" ON public.quizzes FOR SELECT USING (true);
CREATE POLICY "Quiz questions are viewable by everyone" ON public.quiz_questions FOR SELECT USING (true);
CREATE POLICY "Quiz options are viewable by everyone" ON public.quiz_options FOR SELECT USING (true);

CREATE POLICY "Users can view their own quiz attempts" ON public.quiz_attempts
    FOR SELECT USING (
        auth.uid() = "userId" OR
        EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('teacher', 'admin'))
    );

CREATE POLICY "Users can record their own quiz attempts" ON public.quiz_attempts
    FOR INSERT WITH CHECK (auth.uid() = "userId");

-- 5. Leaderboard Policies
CREATE POLICY "Leaderboard viewable by authenticated users" ON public.leaderboard
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "System/Users can sync leaderboard score" ON public.leaderboard
    FOR ALL USING (auth.uid() = "userId" OR EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

-- 6. Announcements Policies
CREATE POLICY "Announcements viewable by everyone" ON public.announcements FOR SELECT USING (true);
CREATE POLICY "Announcements editable by admins" ON public.announcements FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- 7. Notifications Policies (Owner access only)
CREATE POLICY "Users can view their own notifications" ON public.notifications
    FOR SELECT USING (auth.uid() = "userId");

CREATE POLICY "Users can update their own notification read status" ON public.notifications
    FOR UPDATE USING (auth.uid() = "userId");

-- 8. Razorpay Orders & Payments Policies
CREATE POLICY "Users can view their own orders" ON public.orders
    FOR SELECT USING (
        auth.uid() = "userId" OR
        EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
    );

CREATE POLICY "Users can insert their own orders" ON public.orders
    FOR INSERT WITH CHECK (auth.uid() = "userId");

CREATE POLICY "Users can view their own payments" ON public.payments
    FOR SELECT USING (
        auth.uid() = "userId" OR
        EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
    );

-- 9. Contact Messages (Public insert, admin read/update)
CREATE POLICY "Anyone can submit contact tickets" ON public.contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Only admins can view/update contact tickets" ON public.contact_messages FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- 10. FAQ & Banners
CREATE POLICY "FAQ viewable by everyone" ON public.faq FOR SELECT USING (true);
CREATE POLICY "Banners viewable by everyone" ON public.banners FOR SELECT USING (true);


-- ==========================================
-- 24. AUTHENTICATED PROFILE SYNCHRONIZATION TRIGGER
-- ==========================================
-- This automated trigger synchronizes Supabase Authentication registration
-- directly into public.profiles to establish instant role mapping.

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
    -- 1. Cleansing orphaned profile rows with the same email address but different auth IDs.
    -- Since auth.users enforces absolute email uniqueness, any profile that has the same email
    -- but a different user ID is an orphaned/stale record. Removing it prevents unique key violations.
    IF EXISTS (SELECT 1 FROM public.profiles WHERE email = new.email AND id <> new.id) THEN
        DELETE FROM public.profiles WHERE email = new.email AND id <> new.id;
    END IF;

    -- 2. Extract metadata with safety defaults
    v_full_name := COALESCE(new.raw_user_meta_data->>'fullName', new.raw_user_meta_data->>'name', 'Scholar');
    
    v_role := COALESCE(new.raw_user_meta_data->>'role', 'student');
    -- Verify role conforms to constraints
    IF v_role NOT IN ('visitor', 'student', 'teacher', 'admin') THEN
        v_role := 'student';
    END IF;

    v_avatar_url := COALESCE(new.raw_user_meta_data->>'avatarUrl', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80');
    
    -- Extract classId and verify it exists in classes table to avoid foreign key violations
    v_class_id := new.raw_user_meta_data->>'classId';
    IF v_class_id IS NOT NULL THEN
        IF NOT EXISTS (SELECT 1 FROM public.classes WHERE id = v_class_id) THEN
            v_class_id := NULL;
        END IF;
    END IF;

    -- 3. Perform idempotent Insert/Update with Exception handling to guarantee zero failures
    BEGIN
        INSERT INTO public.profiles (id, email, "fullName", role, "avatarUrl", "classId", "dailyStreak", "totalXp")
        VALUES (
            new.id,
            new.email,
            v_full_name,
            v_role,
            v_avatar_url,
            v_class_id,
            1,
            0
        )
        ON CONFLICT (id) DO UPDATE SET
            email = EXCLUDED.email,
            "fullName" = COALESCE(EXCLUDED."fullName", public.profiles."fullName"),
            role = COALESCE(EXCLUDED.role, public.profiles.role),
            "avatarUrl" = COALESCE(EXCLUDED."avatarUrl", public.profiles."avatarUrl"),
            "classId" = COALESCE(EXCLUDED."classId", public.profiles."classId");
    EXCEPTION
        WHEN unique_violation THEN
            -- In the highly unlikely event of a concurrent race condition violating profiles_email_key:
            -- Force-delete the conflicting email record and insert the correct profile.
            DELETE FROM public.profiles WHERE email = new.email AND id <> new.id;
            
            INSERT INTO public.profiles (id, email, "fullName", role, "avatarUrl", "classId", "dailyStreak", "totalXp")
            VALUES (
                new.id,
                new.email,
                v_full_name,
                v_role,
                v_avatar_url,
                v_class_id,
                1,
                0
            )
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

-- Ensure trigger is dropped before creating to avoid redundancy
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Trigger creation
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
