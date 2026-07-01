-- Migration: Support Class Free Notes, Subject Premium Notes, and Notes Purchase tracking

-- 1. Update public.notes table
ALTER TABLE public.notes ADD COLUMN IF NOT EXISTS "classId" TEXT REFERENCES public.classes(id) ON DELETE CASCADE;
ALTER TABLE public.notes ADD COLUMN IF NOT EXISTS "subjectId" TEXT REFERENCES public.subjects(id) ON DELETE CASCADE;
ALTER TABLE public.notes ADD COLUMN IF NOT EXISTS "type" TEXT DEFAULT 'notes' CHECK (type IN ('notes', 'pyq', 'practiceset'));

-- 2. Create subject_notes_purchases table
CREATE TABLE IF NOT EXISTS public.subject_notes_purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    "subjectId" TEXT REFERENCES public.subjects(id) ON DELETE CASCADE NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_user_subject_notes UNIQUE ("userId", "subjectId")
);

-- 3. Enable RLS
ALTER TABLE public.subject_notes_purchases ENABLE ROW LEVEL SECURITY;

-- 4. Set policies for subject_notes_purchases
CREATE POLICY "Users can view their own subject notes purchases" 
    ON public.subject_notes_purchases 
    FOR SELECT 
    USING (auth.uid() = "userId");

CREATE POLICY "Users can insert their own subject notes purchases" 
    ON public.subject_notes_purchases 
    FOR INSERT 
    WITH CHECK (auth.uid() = "userId");

CREATE POLICY "Admins can manage all subject notes purchases" 
    ON public.subject_notes_purchases 
    FOR ALL 
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );
