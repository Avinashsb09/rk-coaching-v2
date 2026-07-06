-- ==========================================
-- MIGRATION 004: CLEANUP INVALID CLASS IDs
-- ==========================================
-- Root Cause: Prior versions of the LandingPage used slugs (e.g. 'class-6-9',
-- 'class-11-12-science') as the class identifier. These were stored in
-- profiles.classId but were never valid foreign keys — classes.id uses
-- short stable IDs like 'c6', 'c11s', etc.
--
-- Effect: Any profile row carrying one of these old slugs has a dangling FK.
-- PostgreSQL re-validates ALL FK columns on every UPDATE (not just changed ones),
-- so any attempt to update such a row — even to change fullName only — fails with:
--   ERROR 23503: insert or update on table "profiles" violates foreign key
--   constraint "profiles_classId_fkey"
--
-- Fix: NULL out any classId that does not exist in classes.id.
-- This unblocks the row so future UPDATEs can succeed.
-- Students will be prompted in the UI to choose a new Academic Standard on
-- their next profile save.
-- ==========================================

UPDATE public.profiles
SET "classId" = NULL
WHERE "classId" IS NOT NULL
  AND "classId" NOT IN (SELECT id FROM public.classes);
