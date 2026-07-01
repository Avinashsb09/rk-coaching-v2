-- ==========================================
-- MIGRATION 002: RELATIONSHIPS & CONSTRAINTS
-- ==========================================

-- 1. notes.classId -> classes.id
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_notes_class'
    ) THEN
        ALTER TABLE public.notes 
        ADD CONSTRAINT fk_notes_class 
        FOREIGN KEY ("classId") 
        REFERENCES public.classes(id) 
        ON UPDATE CASCADE 
        ON DELETE SET NULL;
    END IF;
END $$;

-- 2. notes.subjectId -> subjects.id
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_notes_subject'
    ) THEN
        ALTER TABLE public.notes 
        ADD CONSTRAINT fk_notes_subject 
        FOREIGN KEY ("subjectId") 
        REFERENCES public.subjects(id) 
        ON UPDATE CASCADE 
        ON DELETE SET NULL;
    END IF;
END $$;

-- 3. subjects.classId -> classes.id
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_subjects_class' OR conname = 'subjects_classId_fkey'
    ) THEN
        ALTER TABLE public.subjects 
        ADD CONSTRAINT fk_subjects_class 
        FOREIGN KEY ("classId") 
        REFERENCES public.classes(id) 
        ON UPDATE CASCADE 
        ON DELETE CASCADE;
    END IF;
END $$;

-- 4. chapters.subjectId -> subjects.id
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_chapters_subject' OR conname = 'chapters_subjectId_fkey'
    ) THEN
        ALTER TABLE public.chapters 
        ADD CONSTRAINT fk_chapters_subject 
        FOREIGN KEY ("subjectId") 
        REFERENCES public.subjects(id) 
        ON UPDATE CASCADE 
        ON DELETE CASCADE;
    END IF;
END $$;

-- 5. lessons.chapterId -> chapters.id
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_lessons_chapter' OR conname = 'lessons_chapterId_fkey'
    ) THEN
        ALTER TABLE public.lessons 
        ADD CONSTRAINT fk_lessons_chapter 
        FOREIGN KEY ("chapterId") 
        REFERENCES public.chapters(id) 
        ON UPDATE CASCADE 
        ON DELETE CASCADE;
    END IF;
END $$;
