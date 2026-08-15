-- Repair schema drift for party phone fields used by the mobile relation selects.
-- Migration 0009 introduced these columns, but older or partially migrated Supabase
-- projects can still be missing them and fail with "vendors_1.phone does not exist".
alter table if exists public.vendors add column if not exists phone text;
alter table if exists public.customers add column if not exists phone text;

-- Make the new columns visible to PostgREST without requiring a service restart.
notify pgrst, 'reload schema';
