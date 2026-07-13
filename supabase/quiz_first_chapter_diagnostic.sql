-- ============================================================================
-- QUIZ AVAILABILITY FIRST CHAPTER DIAGNOSTIC SCRIPT
-- Purpose: Read-only diagnostics for chapters, lessons, quizzes, and questions
-- ============================================================================

-- 1. Inspect the three failing first chapters across subjects (Biology, Chemistry, Physics)
SELECT id, "subjectId", name, slug, "isActive"
FROM public.chapters
WHERE name IN ('The Living World', 'Solutions', 'Electric Charges and Fields')
   OR id IN ('neet-bio-ch1', 'neet-chem-ch1', 'neet-phy-ch1');

-- 2. Inspect lessons connected to those chapters
SELECT id, "chapterId", title, "orderIndex", "isPremium"
FROM public.lessons
WHERE "chapterId" IN (
    SELECT id FROM public.chapters 
    WHERE name IN ('The Living World', 'Solutions', 'Electric Charges and Fields')
       OR id IN ('neet-bio-ch1', 'neet-chem-ch1', 'neet-phy-ch1')
);

-- 3. Check whether lesson IDs are valid (non-null, non-blank, non-malformed)
SELECT id, "chapterId", title
FROM public.lessons
WHERE id IS NULL OR TRIM(id) = '' OR "chapterId" IS NULL OR TRIM("chapterId") = '';

-- 4. Check whether quizzes exist for those lessons
SELECT id, "lessonId", title
FROM public.quizzes
WHERE "lessonId" IN (
    SELECT id FROM public.lessons
    WHERE "chapterId" IN (
        SELECT id FROM public.chapters 
        WHERE name IN ('The Living World', 'Solutions', 'Electric Charges and Fields')
    )
);

-- 5. Check whether duplicate chapter names exist in the same subject
SELECT "subjectId", name, COUNT(*)
FROM public.chapters
GROUP BY "subjectId", name
HAVING COUNT(*) > 1;

-- 6. Check whether duplicate lesson IDs exist (PK constraint prevents this, but let's check count per ID)
SELECT id, COUNT(*)
FROM public.lessons
GROUP BY id
HAVING COUNT(*) > 1;

-- 7. Check whether orphan lessons exist (lessons with chapterId pointing to non-existent chapters)
SELECT l.id, l."chapterId", l.title
FROM public.lessons l
LEFT JOIN public.chapters c ON l."chapterId" = c.id
WHERE c.id IS NULL;

-- 8. Check total quizzes and quiz questions in the database
SELECT COUNT(*) AS total_quizzes FROM public.quizzes;
SELECT COUNT(*) AS total_quiz_questions FROM public.quiz_questions;
