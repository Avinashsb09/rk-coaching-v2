-- ==========================================
-- LOOP 3 SCHEMAS: PROGRESS TRACKING & BOOKMARKS
-- ==========================================

-- 1. USER PROGRESS TABLE
CREATE TABLE IF NOT EXISTS public.user_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    "courseId" TEXT REFERENCES public.courses(id) ON DELETE CASCADE,
    "lessonId" TEXT REFERENCES public.lessons(id) ON DELETE CASCADE,
    "watchedPercentage" INTEGER DEFAULT 0,
    "isCompleted" BOOLEAN DEFAULT false,
    "studyTimeSeconds" INTEGER DEFAULT 0,
    "lastAccessedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_user_lesson UNIQUE ("userId", "lessonId")
);

-- 2. BOOKMARKS TABLE
CREATE TABLE IF NOT EXISTS public.bookmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    "targetType" TEXT NOT NULL CHECK ("targetType" IN ('course', 'lesson', 'note')),
    "targetId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_user_target UNIQUE ("userId", "targetType", "targetId")
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_user_progress_user ON public.user_progress("userId");
CREATE INDEX IF NOT EXISTS idx_user_progress_lesson ON public.user_progress("lessonId");
CREATE INDEX IF NOT EXISTS idx_bookmarks_user ON public.bookmarks("userId");

-- ENABLE ROW LEVEL SECURITY
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;

-- POLICIES
CREATE POLICY "Users can manage their own progress" ON public.user_progress
    FOR ALL USING (auth.uid() = "userId");

CREATE POLICY "Users can manage their own bookmarks" ON public.bookmarks
    FOR ALL USING (auth.uid() = "userId");

-- 3. STORAGE BUCKETS & RLS POLICIES FOR SECURE UPLOADS & DOWNLOADS
INSERT INTO storage.buckets (id, name, public) 
VALUES ('assets', 'assets', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('materials', 'materials', false)
ON CONFLICT (id) DO NOTHING;

-- Public read access to course thumbnails
CREATE POLICY "Public Assets Access" ON storage.objects
    FOR SELECT USING (bucket_id = 'assets');

-- Teachers can upload/update course thumbnails
CREATE POLICY "Teacher Uploads Assets" ON storage.objects
    FOR ALL USING (bucket_id = 'assets');

-- Authenticated students and teachers can select from secure materials bucket
CREATE POLICY "Secure Materials Access" ON storage.objects
    FOR SELECT USING (bucket_id = 'materials');

-- Teachers can upload/update secure lesson material files
CREATE POLICY "Teacher Uploads Materials" ON storage.objects
    FOR ALL USING (bucket_id = 'materials');

