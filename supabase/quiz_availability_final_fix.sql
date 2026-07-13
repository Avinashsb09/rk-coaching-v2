-- 1. Verify Chemistry subject
SELECT id, name, "classId" FROM public.subjects WHERE name ILIKE '%Chemistry%';

-- 2. Verify Ch 1: Solutions chapter
SELECT id, name, "subjectId" FROM public.chapters WHERE name ILIKE '%Solutions%';

-- 3. Verify chapter belongs to Chemistry
SELECT c.id AS chapter_id, c.name AS chapter_name, s.id AS subject_id, s.name AS subject_name
FROM public.chapters c
JOIN public.subjects s ON c."subjectId" = s.id
WHERE c.name ILIKE '%Solutions%' AND s.name ILIKE '%Chemistry%';

-- 4. Total questions for that chapter
SELECT COUNT(q.id) AS total_questions
FROM public.quiz_questions q
JOIN public.quizzes z ON q."quizId" = z.id
WHERE z."chapterId" = (SELECT id FROM public.chapters WHERE name ILIKE '%Solutions%' LIMIT 1);

-- 5. Published questions for that chapter
SELECT COUNT(q.id) AS published_questions
FROM public.quiz_questions q
JOIN public.quizzes z ON q."quizId" = z.id
WHERE z."chapterId" = (SELECT id FROM public.chapters WHERE name ILIKE '%Solutions%' LIMIT 1)
AND z.status = 'published';

-- 6. Active questions (status is not archived)
SELECT COUNT(q.id) AS active_questions
FROM public.quiz_questions q
JOIN public.quizzes z ON q."quizId" = z.id
WHERE z."chapterId" = (SELECT id FROM public.chapters WHERE name ILIKE '%Solutions%' LIMIT 1)
AND z.status IN ('published', 'review');

-- 7. Verify RLS policies for student SELECT access
DROP POLICY IF EXISTS "Quizzes are viewable by everyone" ON public.quizzes;
CREATE POLICY "Quizzes are viewable by everyone" ON public.quizzes
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Quiz questions are viewable by everyone" ON public.quiz_questions;
CREATE POLICY "Quiz questions are viewable by everyone" ON public.quiz_questions
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Quiz options are viewable by everyone" ON public.quiz_options;
CREATE POLICY "Quiz options are viewable by everyone" ON public.quiz_options
    FOR SELECT USING (true);

-- 8. Teacher/admin INSERT and UPDATE access
DROP POLICY IF EXISTS "Quizzes are editable by teachers or admins" ON public.quizzes;
CREATE POLICY "Quizzes are editable by teachers or admins" ON public.quizzes
    FOR ALL
    TO authenticated
    USING (
        (auth.jwt() ->> 'role') IN ('teacher', 'admin', 'super_admin')
    )
    WITH CHECK (
        (auth.jwt() ->> 'role') IN ('teacher', 'admin', 'super_admin')
    );

DROP POLICY IF EXISTS "Quiz questions are editable by teachers or admins" ON public.quiz_questions;
CREATE POLICY "Quiz questions are editable by teachers or admins" ON public.quiz_questions
    FOR ALL
    TO authenticated
    USING (
        (auth.jwt() ->> 'role') IN ('teacher', 'admin', 'super_admin')
    )
    WITH CHECK (
        (auth.jwt() ->> 'role') IN ('teacher', 'admin', 'super_admin')
    );

DROP POLICY IF EXISTS "Quiz options are editable by teachers or admins" ON public.quiz_options;
CREATE POLICY "Quiz options are editable by teachers or admins" ON public.quiz_options
    FOR ALL
    TO authenticated
    USING (
        (auth.jwt() ->> 'role') IN ('teacher', 'admin', 'super_admin')
    )
    WITH CHECK (
        (auth.jwt() ->> 'role') IN ('teacher', 'admin', 'super_admin')
    );
