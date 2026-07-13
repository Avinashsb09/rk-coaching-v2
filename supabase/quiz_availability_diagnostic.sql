-- A. Find all possible quiz/question tables
SELECT
    table_schema,
    table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND (
    table_name ILIKE '%quiz%'
    OR table_name ILIKE '%question%'
)
ORDER BY table_name;

-- B. Inspect columns of all possible quiz/question tables
SELECT
    table_name,
    ordinal_position,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND (
    table_name ILIKE '%quiz%'
    OR table_name ILIKE '%question%'
)
ORDER BY table_name, ordinal_position;

-- C. Inspect foreign keys related to quiz/question tables
SELECT
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS referenced_table,
    ccu.column_name AS referenced_column
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_schema = 'public'
AND (
    tc.table_name ILIKE '%quiz%'
    OR tc.table_name ILIKE '%question%'
)
ORDER BY tc.table_name, kcu.column_name;

-- D. Check RLS status
SELECT
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND (
    tablename ILIKE '%quiz%'
    OR tablename ILIKE '%question%'
)
ORDER BY tablename;

-- E. Inspect existing RLS policies
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public'
AND (
    tablename ILIKE '%quiz%'
    OR tablename ILIKE '%question%'
)
ORDER BY tablename, policyname;

-- F. Inspect academic hierarchy IDs
SELECT *
FROM public.subjects
WHERE name ILIKE '%Chemistry%';

SELECT *
FROM public.chapters
WHERE title ILIKE '%Solutions%'
OR name ILIKE '%Solutions%';
