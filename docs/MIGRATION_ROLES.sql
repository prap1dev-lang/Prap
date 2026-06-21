-- =====================================================================
--  MIGRATION: consolidate sign-up into a single role dropdown.
--  Adds the new profile roles and a company column.
--
--  IMPORTANT: `ALTER TYPE ... ADD VALUE` cannot run inside a transaction
--  block. Run each ADD VALUE statement on its own (Supabase SQL editor runs
--  them individually). `IF NOT EXISTS` makes re-runs safe.
--
--  Role mapping:
--    UI "Individual"  -> stored as 'individual'
--    UI "Creator"     -> stored as 'creator'
--    UI "Builder"     -> stored as 'builder'
--    UI "Broker"      -> stored as 'broker'    (unchanged)
--    UI "Corporate"   -> stored as 'corporate' (unchanged)
--  The legacy 'referrer' value is kept for back-compat with existing rows.
-- =====================================================================

alter type user_role add value if not exists 'creator';
alter type user_role add value if not exists 'builder';
alter type user_role add value if not exists 'individual';

-- Company / organisation name (builders & corporates).
alter table users add column if not exists company text;
